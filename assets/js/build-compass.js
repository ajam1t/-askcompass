/* Build Compass module. JSON driven workflow engine, role access, admin tools, and reports. */
const state = { data:None, currentUser:None, selectedWorkflow:None, currentStep:None, completed:[], history:[], assets:[], users:[] };
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));

async function loadData(){
  const [workflowResponse, roleResponse, reportResponse] = await Promise.all([
    fetch('data/workflows.json'), fetch('data/roles.json'), fetch('data/reports.json')
  ]);
  state.data = {
    workflows: await workflowResponse.json(),
    roles: await roleResponse.json(),
    reports: await reportResponse.json()
  };
}

function init(){
  if(!$('#view-build')) return;
  loadData().then(() => {
    hydrateLogin();
    renderTree();
    bindEvents();
    renderReports();
    renderAdminSelectors();
  }).catch(error => {
    $('#bcStepQuestion').textContent = 'Build Compass data could not be loaded. Open this project through a local web server so the JSON files can be read.';
    console.error(error);
  });
}

function hydrateLogin(){
  const roleSelect = $('#bcLoginRole');
  roleSelect.innerHTML = state.data.roles.roles.map(role => `<option value="${role.name}">${role.name}</option>`).join('');
}

function bindEvents(){
  $('#bcLoginForm').addEventListener('submit', event => {
    event.preventDefault();
    const roleName = $('#bcLoginRole').value;
    state.currentUser = { name: $('#bcLoginName').value.trim() || 'Build Compass User', role: roleName };
    $('#bcLogin').hidden = true;
    $('#bcWorkspace').hidden = false;
    $('#bcProfileInitial').textContent = state.currentUser.name.slice(0,1).toUpperCase();
    $('#bcProfileRole').textContent = roleName;
    applyPermissions();
  });
  $('#bcThemeToggle').addEventListener('click', () => $('#view-build').classList.toggle('bc-dark'));
  $$('.bc-tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.bcTab)));
  $('#bcGlobalSearch').addEventListener('input', event => renderSearch(event.target.value));
  $('#bcTreeSearch').addEventListener('input', event => renderTree(event.target.value));
  $('#bcBackStep').addEventListener('click', goBack);
  $('#bcRestartWorkflow').addEventListener('click', () => state.selectedWorkflow && startWorkflow(state.selectedWorkflow.id));
  $('#bcWorkflowForm').addEventListener('submit', saveWorkflow);
  $('#bcStepForm').addEventListener('submit', saveStep);
  $('#bcAssetForm').addEventListener('submit', saveAssets);
  $('#bcUserForm').addEventListener('submit', saveUser);
}

function switchTab(name){
  $$('.bc-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.bcTab === name));
  $$('.bc-panel').forEach(panel => panel.classList.remove('active'));
  $(`#bc${capitalize(name)}Panel`).classList.add('active');
}

function renderTree(filter=''){
  const nav = $('#bcNavTree');
  const q = filter.trim().toLowerCase();
  const tree = state.data.workflows.navigation;
  nav.innerHTML = renderTreeNodes(tree, q);
  nav.querySelectorAll('.bc-tree-row').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.closest('.bc-tree-group');
      if(button.dataset.workflow){ startWorkflow(button.dataset.workflow); return; }
      group.classList.toggle('expanded');
    });
  });
}

function renderTreeNodes(nodes, filter, level=0){
  return nodes.map(node => {
    const children = node.children || [];
    const workflow = node.workflowId ? state.data.workflows.workflows.find(item => item.id === node.workflowId) : null;
    const text = `${node.label} ${workflow?.name || ''}`.toLowerCase();
    const childHtml = children.length ? renderTreeNodes(children, filter, level+1) : '';
    const matches = !filter || text.includes(filter) || childHtml.toLowerCase().includes(filter);
    if(!matches) return '';
    const expanded = level < 2 || filter ? 'expanded' : '';
    const active = state.selectedWorkflow?.id === node.workflowId ? 'active' : '';
    const suffix = children.length ? '<span>⌄</span>' : '<span>›</span>';
    return `<div class="bc-tree-group bc-level-${level} ${expanded}"><button class="bc-tree-row ${active}" type="button" ${node.workflowId ? `data-workflow="${node.workflowId}"` : ''}><span class="bc-tree-label">${node.label}</span>${suffix}</button>${children.length ? `<div class="bc-tree-children">${childHtml}</div>` : ''}</div>`;
  }).join('');
}

function startWorkflow(id){
  const workflow = state.data.workflows.workflows.find(item => item.id === id);
  if(!workflow) return;
  state.selectedWorkflow = workflow;
  state.currentStep = workflow.startStep;
  state.completed = [];
  state.history = [];
  renderBreadcrumb(workflow);
  renderTree($('#bcTreeSearch').value);
  renderStep();
  renderAdminSelectors();
}

function renderBreadcrumb(workflow){
  const parts = ['Home', ...workflow.category.split('>'), workflow.name].map(item => item.trim());
  $('#bcBreadcrumb').innerHTML = parts.map(part => `<span>${part}</span>`).join('');
}

function renderStep(){
  const workflow = state.selectedWorkflow;
  const step = workflow.steps.find(item => Number(item.step) === Number(state.currentStep));
  if(!step) return renderEnd();
  $('#bcWorkflowName').textContent = workflow.name;
  $('#bcStepTitle').textContent = `Step ${step.step}`;
  $('#bcStepBadge').textContent = normalizeType(step.type);
  $('#bcStepQuestion').textContent = step.question;
  renderAnswer(step);
  renderFeatures(step);
  renderProgress();
}

function renderAnswer(step){
  const area = $('#bcAnswerArea');
  const options = step.options || [];
  const renderChoices = (choices) => `<div class="bc-choice-grid">${choices.map(choice => `<button class="bc-choice" type="button" data-answer="${choice.value}">${choice.label}</button>`).join('')}</div>`;
  if(step.type === 'yesno') area.innerHTML = renderChoices([{label:'Yes',value:'yes'},{label:'No',value:'no'}]);
  if(step.type === 'dropdown') area.innerHTML = `<select aria-label="${step.question}">${options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}</select><button class="bc-primary" type="button" data-submit-input>Continue</button>`;
  if(step.type === 'radio') area.innerHTML = options.map((o,i)=>`<label class="bc-choice"><input type="radio" name="bcRadio" value="${o.value}" ${i===0?'checked':''}> ${o.label}</label>`).join('') + '<button class="bc-primary" type="button" data-submit-input>Continue</button>';
  if(step.type === 'customList') area.innerHTML = renderChoices(options);
  if(step.type === 'textbox') area.innerHTML = '<textarea rows="4" placeholder="Enter notes"></textarea><button class="bc-primary" type="button" data-submit-input>Continue</button>';
  if(step.type === 'number') area.innerHTML = '<input type="number" placeholder="Enter amount or count"><button class="bc-primary" type="button" data-submit-input>Continue</button>';
  if(step.type === 'date') area.innerHTML = '<input type="date"><button class="bc-primary" type="button" data-submit-input>Continue</button>';
  if(step.type === 'multiselect') area.innerHTML = options.map(o=>`<label class="bc-choice"><input type="checkbox" value="${o.value}"> ${o.label}</label>`).join('') + '<button class="bc-primary" type="button" data-submit-input>Continue</button>';
  area.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => goNext(step, button.dataset.answer)));
  const submit = area.querySelector('[data-submit-input]');
  if(submit) submit.addEventListener('click', () => goNext(step, readInputValue(area, step.type)));
}

function readInputValue(area, type){
  if(type === 'dropdown') return area.querySelector('select').value;
  if(type === 'radio') return area.querySelector('input[type="radio"]:checked')?.value || 'default';
  if(type === 'multiselect') return Array.from(area.querySelectorAll('input:checked')).map(input => input.value).join(',') || 'default';
  return area.querySelector('input,textarea')?.value || 'default';
}

function goNext(step, answer){
  state.history.push(state.currentStep);
  if(!state.completed.includes(step.step)) state.completed.push(step.step);
  const nextMap = step.next || {};
  state.currentStep = nextMap[answer] || nextMap.default || step.defaultNext || null;
  renderStep();
}

function goBack(){
  if(!state.history.length) return;
  state.currentStep = state.history.pop();
  state.completed.pop();
  renderStep();
}

function renderEnd(){
  $('#bcStepTitle').textContent = 'Workflow complete';
  $('#bcStepBadge').textContent = 'Done';
  $('#bcStepQuestion').textContent = 'This path reached its configured endpoint.';
  $('#bcAnswerArea').innerHTML = '<button class="bc-primary" type="button" id="bcEndRestart">Restart workflow</button>';
  $('#bcEndRestart').addEventListener('click', () => startWorkflow(state.selectedWorkflow.id));
  $('#bcFeatureButtons').innerHTML = '';
  $('#bcGuidance').hidden = true;
  renderProgress(true);
}

function renderFeatures(step){
  const container = $('#bcFeatureButtons');
  const features = [];
  if(step.popup) features.push(`<button type="button" data-guidance>Guidance</button>`);
  if(step.sop) features.push(`<a href="${step.sop}" target="_blank" rel="noopener">Open SOP</a>`);
  if(step.pdf) features.push(`<a href="${step.pdf}" target="_blank" rel="noopener">PDF</a>`);
  if(step.word) features.push(`<a href="${step.word}" target="_blank" rel="noopener">Word Document</a>`);
  if(step.image) features.push(`<a href="${step.image}" target="_blank" rel="noopener">Image</a>`);
  if(step.video) features.push(`<a href="${step.video}" target="_blank" rel="noopener">Training Video</a>`);
  if(step.externalLink) features.push(`<a href="${step.externalLink}" target="_blank" rel="noopener">External Link</a>`);
  if(step.internalLink) features.push(`<a href="${step.internalLink}">Internal Link</a>`);
  if(step.download) features.push(`<a href="${step.download}" download>Download</a>`);
  container.innerHTML = features.join('');
  $('#bcGuidance').hidden = true;
  const guidance = container.querySelector('[data-guidance]');
  if(guidance){
    guidance.addEventListener('click', () => {
      $('#bcGuidance').textContent = step.popup;
      $('#bcGuidance').hidden = !$('#bcGuidance').hidden;
    });
  }
}

function renderProgress(forceDone=false){
  const total = state.selectedWorkflow?.steps.length || 0;
  const completed = forceDone ? total : state.completed.length;
  const remaining = Math.max(total - completed, 0);
  const current = state.currentStep || 0;
  const pct = total ? Math.min(100, (completed / total) * 100) : 0;
  $('#bcProgressPercent').textContent = `${pct.toFixed(1)}%`;
  $('#bcProgressCount').textContent = `${completed} / ${total}`;
  $('#bcProgressText').textContent = `${pct.toFixed(1)}% Complete`;
  $('#bcProgressBar').style.width = `${pct}%`;
  $('.bc-progress-ring').style.setProperty('--bc-progress', `${pct}%`);
  $('#bcCompletedSteps').textContent = completed;
  $('#bcRemainingSteps').textContent = remaining;
  $('#bcCurrentStep').textContent = current;
}

function renderSearch(query){
  const box = $('#bcSearchResults');
  const q = query.trim().toLowerCase();
  if(!q){ box.innerHTML = ''; return; }
  const results = [];
  state.data.workflows.workflows.forEach(w => {
    if(w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q)) results.push({w, label:w.name, detail:w.category, step:w.startStep});
    w.steps.forEach(s => {
      const haystack = `${s.step} ${s.question} ${s.sop || ''} ${w.name}`.toLowerCase();
      if(haystack.includes(q)) results.push({w, label:`Step ${s.step}`, detail:s.question, step:s.step});
    });
  });
  box.innerHTML = results.slice(0,8).map((r,i)=>`<div class="bc-result" data-result-index="${i}"><b>${r.label}</b><span>${r.w.name} · ${r.detail}</span></div>`).join('') || '<div class="bc-result"><b>No matches</b><span>Try another keyword, SOP name, workflow name, or step number.</span></div>';
  box.querySelectorAll('[data-result-index]').forEach(item => item.addEventListener('click', () => {
    const result = results[Number(item.dataset.resultIndex)];
    state.selectedWorkflow = result.w;
    state.currentStep = result.step;
    state.completed = [];
    state.history = [];
    renderBreadcrumb(result.w);
    renderTree($('#bcTreeSearch').value);
    renderStep();
  }));
}

function applyPermissions(){
  const permissions = getPermissions();
  const adminAllowed = ['createWorkflow','editWorkflow','deleteWorkflow','addStep','uploadAssets','manageUsers'].some(p => permissions[p]);
  $$('.bc-tab[data-bc-tab="admin"]').forEach(tab => tab.classList.toggle('bc-disabled', !adminAllowed));
  $$('[data-permission]').forEach(item => {
    const allowed = permissions[item.dataset.permission];
    item.closest('.bc-card')?.classList.toggle('bc-disabled', !allowed);
  });
}

function getPermissions(){
  const role = state.data.roles.roles.find(item => item.name === state.currentUser?.role);
  return role ? role.permissions : {};
}

function saveWorkflow(event){
  event.preventDefault();
  if(!getPermissions().createWorkflow) return;
  const form = new FormData(event.target);
  const id = form.get('id').trim();
  const existing = state.data.workflows.workflows.find(w => w.id === id);
  const workflow = existing || { id, startStep: 1, steps: [] };
  workflow.name = form.get('name') || id;
  workflow.category = form.get('category') || 'Unassigned';
  workflow.ownerRole = form.get('ownerRole');
  if(!existing) state.data.workflows.workflows.push(workflow);
  renderTree(); renderAdminSelectors(); event.target.reset();
}

function saveStep(event){
  event.preventDefault();
  if(!getPermissions().addStep) return;
  const form = new FormData(event.target);
  const workflow = state.data.workflows.workflows.find(w => w.id === form.get('workflowId'));
  if(!workflow) return;
  let next = {};
  try { next = JSON.parse(form.get('next') || '{}'); } catch { next = { default: null }; }
  const options = (form.get('options') || '').split(',').map(item => item.trim()).filter(Boolean).map(item => ({ label:item, value:item.toLowerCase().replace(/\s+/g,'-') }));
  const step = { step:Number(form.get('step')), question:form.get('question'), type:form.get('type'), options, next, popup:form.get('popup') };
  workflow.steps = workflow.steps.filter(s => Number(s.step) !== Number(step.step)).concat(step).sort((a,b)=>a.step-b.step);
  renderAdminSelectors(); event.target.reset();
}

function saveAssets(event){
  event.preventDefault();
  if(!getPermissions().uploadAssets) return;
  const form = new FormData(event.target);
  const files = Array.from(form.getAll('asset'));
  files.filter(file => file.name).forEach(file => state.assets.push({ name:file.name, type:file.type || 'file', workflow:form.get('assignWorkflow'), role:form.get('assignRole') }));
  renderAssets(); event.target.reset();
}

function saveUser(event){
  event.preventDefault();
  if(!getPermissions().manageUsers) return;
  const form = new FormData(event.target);
  state.users.push({ name: form.get('name') || 'New User', role: form.get('role') });
  renderUsers(); event.target.reset();
}

function renderAssets(){
  $('#bcAssetList').innerHTML = state.assets.map(asset => `<div class="bc-list-item"><span>${asset.name}</span><span>${asset.role}</span></div>`).join('');
}
function renderUsers(){
  $('#bcUserList').innerHTML = state.users.map(user => `<div class="bc-list-item"><span>${user.name}</span><span>${user.role}</span></div>`).join('');
}
function renderAdminSelectors(){
  ['#bcStepWorkflow','#bcAssignWorkflow'].forEach(selector => {
    const el = $(selector); if(!el || !state.data) return;
    el.innerHTML = state.data.workflows.workflows.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
  });
}
function renderReports(){
  const data = state.data.reports;
  $('#bcReportCards').innerHTML = data.cards.map(card => `<article class="bc-report-card"><b>${card.value}</b><span>${card.label}</span></article>`).join('');
  $('#bcPathReport').innerHTML = data.paths.map(path => `<div class="bc-path-row"><span>${path.name}</span><div class="bc-path-bar"><i data-percent="${path.percent}"></i></div><strong>${path.percent}%</strong></div>`).join('');
  $$('#bcPathReport [data-percent]').forEach(bar => { bar.style.width = `${bar.dataset.percent}%`; });
}
function normalizeType(type){ return ({yesno:'Yes / No',customList:'Custom List',textbox:'Text Box',number:'Number',date:'Date',multiselect:'Multi Select'}[type] || capitalize(type)); }
function capitalize(text){ return text ? text.charAt(0).toUpperCase() + text.slice(1) : ''; }

document.addEventListener('DOMContentLoaded', init);
