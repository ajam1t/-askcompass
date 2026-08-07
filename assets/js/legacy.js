
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const views=$$('.view');const navLinks=$$('.nav-link');const mobile=$('#mobileMenu');
function showView(name, authMode){
  views.forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
  navLinks.forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  if(mobile) mobile.style.display='none';
  history.replaceState(null,'','#'+name);
  window.scrollTo({top:0,behavior:'smooth'});
  revealVisible();
}
$$('[data-view]').forEach(el=>el.addEventListener('click',()=>showView(el.dataset.view,el.dataset.auth)));
$('#menuBtn').addEventListener('click',()=>mobile.style.display=mobile.style.display==='block'?'none':'block');
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});$$('.reveal').forEach(el=>io.observe(el));
function revealVisible(){setTimeout(()=>$$('.view.active .reveal').forEach(el=>el.classList.add('visible')),80)}


function industryChange(t,d){document.getElementById('industryOutput').innerHTML='<b>'+t+'</b><p>'+d+'</p>'; }
$$('.uc-tab').forEach(tab=>tab.addEventListener('click',()=>{
  const key=tab.dataset.uc;
  $$('.uc-tab').forEach(b=>b.classList.remove('active'));
  tab.classList.add('active');
  $$('.uc-line').forEach(l=>l.classList.toggle('active',l.dataset.uc===key));
}));
$$('.hood-tab').forEach(tab=>tab.addEventListener('click',()=>{
  const key=tab.dataset.hood;
  $$('.hood-tab').forEach(b=>b.classList.remove('active'));
  tab.classList.add('active');
  $$('.hood-panel').forEach(p=>p.classList.toggle('active',p.dataset.hood===key));
}));
const contactCases={
  demo:['Product Demo','Let\'s walk through ASK COMPASS using a real process scenario and show how users get guided next steps.'],
  pricing:['Pricing Discussion','We can discuss Starter, Professional or Enterprise pricing based on your team size and usage plan.'],
  quality:['Quality Operations','We can explore audit trails, checklists, error prevention, review flows and guided quality actions.'],
  sop:['SOP Navigation','We can look at how static SOPs can become step by step guided workflows for employees.'],
  ai:['AI Search','We can discuss how users can ask process questions and get clear, actionable answers.'],
  workflow:['Workflow Builder','We can show how admins build and edit guided steps, like the Open Current Account flow, with no code.'],
  audit:['Audit & Compliance','We can walk through audit trails, mandatory checks and how every decision stays traceable.'],
  onboarding:['Team Onboarding','We can show how new hires ramp up faster by following guided flows instead of long SOPs.'],
  enterprise:['Enterprise Solution','We can discuss security, SSO, integrations, governance and rollout across teams.']
};
$$('.usecase-btn').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.usecase-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const data=contactCases[btn.dataset.case]||contactCases.demo;
  const box=$('#contactCaseResponse');
  if(box) box.innerHTML=`<span class="pulse"></span><div><b>${data[0]}</b><span>${data[1]}</span></div>`;
}));

const compassStage=$('#compassStage');const compass3d=$('#compass3d');
if(compassStage&&compass3d){
  compassStage.addEventListener('mousemove',e=>{
    const r=compassStage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    compass3d.style.transform=`rotateX(${(-y*10).toFixed(2)}deg) rotateY(${(x*12).toFixed(2)}deg) translateY(-8px)`;
  },{passive:true});
  compassStage.addEventListener('mouseleave',()=>{compass3d.style.transform='';});
}


const founderVisual=$('#founderVisual');const founderPhoto=$('#founderPhoto');
if(founderVisual&&founderPhoto){
  founderVisual.addEventListener('mousemove',e=>{
    const r=founderVisual.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    founderPhoto.style.transform=`rotateX(${(-y*11).toFixed(2)}deg) rotateY(${(x*13).toFixed(2)}deg) translateZ(18px) scale(1.015)`;
  },{passive:true});
  founderVisual.addEventListener('mouseleave',()=>{founderPhoto.style.transform='';});
}






/* ================= Try Compass 3D Flash Card Engine ================= */
(function(){
  var deck=document.getElementById('try3Deck');
  var stage=document.getElementById('try3Stage');
  var prev=document.getElementById('try3Prev');
  var next=document.getElementById('try3Next');
  var workspace=document.getElementById('try3Workspace');
  if(!deck||!stage||!workspace) return;
  var industries=[
    {id:'banking',icon:'🏦',name:'Banking',desc:'18 live workflows ready',status:'ready',c1:'#2563EB',c2:'#7C3AED'},
    {id:'insurance',icon:'🛡️',name:'Insurance',desc:'Policy and claims workflows',status:'soon',c1:'#7C3AED',c2:'#EC4899'},
    {id:'healthcare',icon:'🏥',name:'Healthcare',desc:'Claims and quality guidance',status:'beta',c1:'#06B6D4',c2:'#2563EB'},
    {id:'retail',icon:'🛍️',name:'Retail',desc:'Store ops and escalation paths',status:'soon',c1:'#0EA5E9',c2:'#14B8A6'},
    {id:'manufacturing',icon:'🏭',name:'Manufacturing',desc:'Work instructions and safety',status:'soon',c1:'#2563EB',c2:'#06B6D4'},
    {id:'bpo',icon:'🎧',name:'BPO & Operations',desc:'QA, training and process support',status:'soon',c1:'#9333EA',c2:'#2563EB'}
  ];
  var flows=[
    {icon:'💳',title:'Open Savings Account',sub:'Customer onboarding',steps:['Customer request received','Verify Aadhaar','PAN available?','Capture KYC documents','Run AML check','Risk score review','Approve account','Generate account number','Send welcome SMS']},
    {icon:'🏦',title:'Open Current Account',sub:'Business account setup',steps:['Business request received','Validate registration','Verify PAN and GST','Capture KYC documents','Opening deposit check','Manager approval','Create account','Send confirmation']},
    {icon:'💰',title:'Personal Loan',sub:'Credit decision flow',steps:['Loan request received','Check CIBIL score','Verify income proof','Calculate eligibility','Decision required','Route approval','Generate offer']},
    {icon:'🏠',title:'Home Loan',sub:'Property loan flow',steps:['Capture property details','Run CIBIL check','Collect income proof','Property valuation','Legal review','Approval decision','Issue sanction letter']},
    {icon:'🪪',title:'KYC Update',sub:'Customer profile update',steps:['Locate customer record','Collect updated KYC','Verify identity','Update profile','Save audit trail']},
    {icon:'📈',title:'Fixed Deposit',sub:'Deposit setup',steps:['Capture amount and tenure','Show interest rate','Add nominee','Confirm funding source','Create FD receipt']},
    {icon:'🧾',title:'Cheque Book Request',sub:'Service request',steps:['Verify account status','Select number of leaves','Confirm address','Submit request','Notify customer']},
    {icon:'🔁',title:'Fund Transfer Setup',sub:'Beneficiary activation',steps:['Add beneficiary','Verify IFSC','Validate name match','Set transfer limit','Activate beneficiary']},
    {icon:'🪪',title:'KYC / Account Opening',sub:'New customer onboarding',steps:['Greet customer & identify need','Collect KYC documents','Verify ORIGINAL documents in person','Enter customer details into CBS','Are all documents complete and valid?','Open account in CBS & assign number','Issue welcome kit to customer','Log in account opening register','Account opened successfully']},
    {icon:'💰',title:'Loan Processing',sub:'End-to-end loan procedure',steps:['Review current loan rate card','Identify loan type and requirement','Collect application form and documents','Run CIBIL / credit score check','Is the credit score acceptable?','Record application in LMS','Send file to credit appraisal team','Has the loan been sanctioned?','Issue sanction letter & sign agreement','Disburse the loan amount','Loan disbursed']},
    {icon:'📣',title:'Customer Grievance Handling',sub:'Complaint & escalation',steps:['Customer raises a complaint','Listen first — always','Log in the Grievance Register','Can you resolve it at branch level?','Resolve at branch level','Confirm resolution with customer','Update register — mark resolved','Grievance closed']},
    {icon:'💵',title:'Cash Handling',sub:'Teller counter procedure',steps:['Identify the transaction','Verify customer identity','Check all cash for counterfeit notes','Was any counterfeit note detected?','Count cash aloud with the customer','Process transaction in CBS','Issue stamped & signed receipt','Balance drawer at end of day','Report any cash discrepancy','Cash operations complete']},
    {icon:'⚠️',title:'Fraud Detection & Escalation',sub:'Immediate response flow',steps:['Suspicious activity detected — STOP','Quietly alert the Branch Manager','Document all details immediately','What type of fraud is this?','Put the transaction on hold','Call the Fraud Control Unit','File a complete incident report','Fraud escalation complete']},
    {icon:'📋',title:'Branch Audit Checklist',sub:'Audit to report submission',steps:['Auditor presents credentials','Confirm the audit scope','Verify cash balance','Is cash balanced?','Review KYC files — sample 10%','Review loan files','Check all mandatory registers','Inspect IT systems','Compile audit findings report','Present findings & get signature','Audit report submitted']},
    {icon:'🧾',title:'Cheque Processing',sub:'Inward clearing procedure',steps:['Customer submits cheque','Verify all cheque details','Are cheque details correct?','Same bank or other bank?','Process in-house clearing','Issue acknowledgement receipt','Send for MICR clearing','Did the cheque clear?','Cheque bounced — take action','Cheque processing complete']},
    {icon:'📈',title:'Fixed Deposit Opening',sub:'New FD & renewal',steps:['Identify customer FD request','Check current FD rate card','Explain FD rates and tenure','Fill FD application form','PAN mandatory for cash ≥ ₹50,000','Debit account or accept cash','Issue FD receipt (FDR)','Fixed deposit created']},
    {icon:'📱',title:'Digital Banking Support',sub:'Net banking, UPI & cards',steps:['Customer reports a digital issue','Verify customer identity first','What is the primary issue?','Reset internet banking credentials','Get failed transaction details','Check CBS and UPI switch logs','Raise reversal within 24 hours','Block card & initiate replacement','Digital issue resolved']},
    {icon:'🔒',title:'Account Closure',sub:'Request to CBS closure',steps:['Customer requests account closure','Check for linked products','Are there active linked products?','Collect debit card & unused cheques','Calculate final balance with interest','Is the account less than 1 year old?','Deduct closure charges if applicable','Credit final balance to customer','Close account in CBS','Account closed successfully']}
  ];
  var active=0, currentFlow=0, timer=null, N=industries.length;
  industries.forEach(function(ind,i){
    var card=document.createElement('button');
    card.type='button'; card.className='try3-card'; card.dataset.i=i; card.style.setProperty('--c1',ind.c1); card.style.setProperty('--c2',ind.c2);
    var statusText=ind.status==='ready'?'Ready':(ind.status==='beta'?'Beta':'Coming soon');
    card.innerHTML='<div class="try3-card-inner"><div class="try3-icon">'+ind.icon+'</div><h4>'+ind.name+'</h4><p>'+ind.desc+'</p><span class="try3-status '+ind.status+'">'+statusText+'</span></div>';
    card.addEventListener('click',function(){ if(active===i){ updateWorkspace(); } else { active=i; layout(); updateWorkspace(); restart(); } });
    deck.appendChild(card);
  });
  var cards=[].slice.call(deck.children);
  function layout(){
    cards.forEach(function(c,i){
      var off=i-active; if(off<-N/2) off+=N; if(off>N/2) off-=N;
      var abs=Math.abs(off), x=off*230, z=-abs*180, ry=-off*24, sc=off===0?1.08:1-abs*.08, op=abs>2?0:(off===0?1:.78-abs*.08);
      c.style.transform='translate3d('+x+'px,0,'+z+'px) rotateY('+ry+'deg) scale('+sc+')';
      c.style.opacity=op; c.style.zIndex=String(10-abs); c.classList.toggle('active',off===0); c.classList.toggle('dim',off!==0); c.style.pointerEvents=abs>2?'none':'auto';
    });
  }
  function go(dir){ active=(active+dir+N)%N; layout(); updateWorkspace(); restart(); }
  if(prev) prev.addEventListener('click',function(){go(-1)}); if(next) next.addEventListener('click',function(){go(1)});
  stage.addEventListener('wheel',function(e){ e.preventDefault(); go(e.deltaY>0?1:-1); },{passive:false});
  var down=false,startX=0;
  stage.addEventListener('pointerdown',function(e){down=true;startX=e.clientX;stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointerup',function(e){ if(!down)return; down=false; var dx=e.clientX-startX; if(Math.abs(dx)>38) go(dx<0?1:-1); });
  stage.addEventListener('pointermove',function(e){
    var r=stage.getBoundingClientRect(), mx=(e.clientX-r.left)/r.width-.5, my=(e.clientY-r.top)/r.height-.5;
    deck.style.transform='rotateX('+(-my*4).toFixed(2)+'deg) rotateY('+(mx*7).toFixed(2)+'deg)';
  });
  stage.addEventListener('mouseleave',function(){deck.style.transform=''});
  function restart(){ clearInterval(timer); timer=setInterval(function(){go(1)},4300); }
  function updateWorkspace(){
    var ind=industries[active], ready=ind.id==='banking'||ind.id==='healthcare'||ind.id==='insurance'; currentFlow=0;
    document.getElementById('try3IndustryLabel').textContent=ind.name;
    document.getElementById('try3WorkspaceTitle').textContent=ready?(ind.name+' workflows'):ind.name+' workflows';
    var pill=document.getElementById('try3StatusPill'); pill.textContent=ready?'Ready':(ind.status==='beta'?'Beta':'Coming soon'); pill.className='try3-pill '+(ready?'':'coming');
    renderProcesses(ready);
    renderFlow(ready?currentFlow:-1);
  }
  // Healthcare flows
  var healthFlows=[
    {icon:'🏥',title:'Patient Admission',sub:'Inpatient registration',steps:['Verify patient identity','Check insurance eligibility','Collect medical history','Assign bed & ward','Notify treating doctor','Generate admission note']},
    {icon:'📋',title:'Claims Processing',sub:'Insurance claim workflow',steps:['Receive claim form','Verify policy number','Check treatment codes','Calculate eligible amount','Approval decision','Release payment','Send EOB to patient']},
    {icon:'💊',title:'Medication Dispensing',sub:'Pharmacy workflow',steps:['Receive prescription','Check drug interactions','Verify patient allergies','Prepare medication','Pharmacist sign-off','Dispense to patient']},
    {icon:'🔬',title:'Lab Test Request',sub:'Diagnostic workflow',steps:['Doctor raises test request','Collect patient sample','Route to correct lab','Run test & QA','Generate report','Notify doctor','File in patient record']},
  ];
  // Insurance flows
  var insureFlows=[
    {icon:'🛡️',title:'Policy Issuance',sub:'New policy workflow',steps:['Capture customer details','Select policy type','Run underwriting check','Calculate premium','Generate policy document','Collect payment','Issue policy number']},
    {icon:'📝',title:'Claim Settlement',sub:'Claim processing',steps:['Register claim','Assign adjuster','Field inspection','Assess damage','Approval decision','Calculate payout','Release payment']},
    {icon:'🔄',title:'Policy Renewal',sub:'Renewal workflow',steps:['Identify policies due','Send renewal notice','Update customer details','Re-underwriting check','Generate new quote','Customer acceptance','Issue renewed policy']},
    {icon:'⚠️',title:'Fraud Detection',sub:'Alert review process',steps:['System flags anomaly','Assign investigator','Gather evidence','Assess fraud risk','Escalate or clear','Record outcome','Update blacklist if needed']},
  ];
  function renderProcesses(ready){
    var box=document.getElementById('try3Processes'); if(!box)return; box.innerHTML='';
    if(!ready){
      box.innerHTML='<div class="try3-flow-card active"><div class="fi">'+industries[active].icon+'</div><b>Coming soon</b><span>This industry can use the same guided workflow engine.</span></div>';
      return;
    }
    var flowList = industries[active].id==='healthcare' ? healthFlows : industries[active].id==='insurance' ? insureFlows : flows;
    flowList.forEach(function(f,i){
      var el=document.createElement('button'); el.type='button'; el.className='try3-flow-card '+(i===currentFlow?'active':'');
      el.innerHTML='<div class="fi">'+f.icon+'</div><b>'+f.title+'</b><span>'+f.sub+'</span>';
      el.addEventListener('click',function(){ currentFlow=i; renderProcesses(true); renderFlow(i); });
      box.appendChild(el);
    });
  }
  function renderFlow(index){
    var flowIcon=document.getElementById('try3FlowIcon'), flowTitle=document.getElementById('try3FlowTitle'), flowSub=document.getElementById('try3FlowSub'), ai=document.getElementById('try3AiNote'), flowBox=document.getElementById('try3Flow');
    flowBox.innerHTML='';
    if(index<0){
      var ind=industries[active]; flowIcon.textContent=ind.icon; flowTitle.textContent=ind.name+' preview'; flowSub.textContent='Workflow library coming soon'; ai.textContent='This industry will use the same guided decision-path layout.';
      ['Industry template selected','Workflow library preparation','Guided SOP engine ready'].forEach(function(s,i){addStep(s,i)}); animateSteps(); return;
    }
    var activeFlowList = industries[active].id==='healthcare' ? healthFlows : industries[active].id==='insurance' ? insureFlows : flows; var f=activeFlowList[index]; flowIcon.textContent=f.icon; flowTitle.textContent=f.title; flowSub.textContent=f.sub; ai.textContent='Compass highlights the current action, confirms completion, and keeps the path audit-ready.';
    f.steps.forEach(addStep); animateSteps();
    function addStep(s,i){var row=document.createElement('div'); row.className='try3-step'; row.innerHTML='<span class="dot">'+(i+1)+'</span><span class="body">'+s+'</span>'; flowBox.appendChild(row);}
  }
  function animateSteps(){
    var rows=[].slice.call(document.querySelectorAll('#try3Flow .try3-step'));
    rows.forEach(function(row){row.classList.remove('in','current','done')});
    rows.forEach(function(row,i){setTimeout(function(){rows.forEach(function(r){r.classList.remove('current')}); row.classList.add('in','current'); if(i>0) rows[i-1].classList.add('done'); if(i===rows.length-1)setTimeout(function(){row.classList.remove('current'); row.classList.add('done')},420);},i*260+120)});
  }
  layout(); updateWorkspace(); restart();
})();




/* ASK COMPASS immersive intro v2 controller */
(function(){
  var intro  = document.getElementById('acIntro');
  var skip   = document.getElementById('acSkip');
  var fill   = document.getElementById('acProgressFill');
  if(!intro) return;

  /* ── If already seen this session, skip instantly ── */
  try{
    if(sessionStorage.getItem('acSeen')==='1'){
      intro.remove();
      document.body.classList.remove('intro-running');
      document.body.classList.add('intro-ready');
      return;
    }
  }catch(e){}

  /* ── Show skip button after 1s ── */
  setTimeout(function(){ if(skip) skip.classList.add('show'); }, 1000);

  /* ── Mouse parallax on compass ── */
  var compass = document.getElementById('acCompass');
  var raf = null;
  intro.addEventListener('mousemove', function(e){
    if(raf) return;
    raf = requestAnimationFrame(function(){
      raf = null;
      var r = intro.getBoundingClientRect();
      var mx = (e.clientX - r.left) / r.width  - .5;
      var my = (e.clientY - r.top)  / r.height - .5;
      if(compass) compass.style.transform =
        'perspective(900px) rotateX('+(my*-10).toFixed(1)+'deg) rotateY('+(mx*10).toFixed(1)+'deg)';
    });
  },{passive:true});
  intro.addEventListener('mouseleave', function(){
    if(compass) compass.style.transform = '';
  });

  /* ── Progress bar ── */
  var DURATION = 5800; /* ms */
  var start = Date.now();
  var progTimer = setInterval(function(){
    var pct = Math.min(100, ((Date.now() - start) / DURATION) * 100);
    if(fill) fill.style.width = pct + '%';
    if(pct >= 100) clearInterval(progTimer);
  }, 40);

  /* ── Finish ── */
  function finish(){
    clearInterval(progTimer);
    if(fill) fill.style.width = '100%';
    try{ sessionStorage.setItem('acSeen','1'); }catch(e){}
    document.body.classList.add('intro-ready');
    intro.classList.add('ac-exit');
    setTimeout(function(){
      document.body.classList.remove('intro-running');
      if(intro && intro.parentNode) intro.remove();
    }, 860);
  }

  if(skip) skip.addEventListener('click', finish);
  setTimeout(finish, DURATION);
})();



/* Premium FAQ Accordion */
(function(){
  const list=document.getElementById('faqList');
  if(!list) return;
  const items=[...list.querySelectorAll('.faq-item')];
  function setHeights(){
    items.forEach(item=>{
      const ans=item.querySelector('.faq-answer');
      if(!ans) return;
      ans.style.maxHeight=item.classList.contains('open') ? ans.scrollHeight+'px' : '0px';
    });
  }
  items.forEach(item=>{
    const btn=item.querySelector('.faq-question');
    if(!btn) return;
    btn.addEventListener('click',()=>{
      const isOpen=item.classList.contains('open');
      items.forEach(x=>x.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
      setHeights();
    });
  });
  window.addEventListener('resize',setHeights,{passive:true});
  setHeights();
})();

// Mobile menu: close on outside click
document.addEventListener('click', function(e) {
  var menu = document.getElementById('mobileMenu');
  var btn = document.getElementById('menuBtn');
  if (menu && menu.style.display !== 'none' && !menu.contains(e.target) && e.target !== btn) {
    menu.style.display = 'none';
  }
});


// Contact form handler
(function() {
  var formBtn = document.querySelector('#view-contact .form button.primary');
  if (formBtn) {
    formBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var form = formBtn.closest('.form');
      var inputs = form ? form.querySelectorAll('input, textarea, select') : [];
      var valid = true;
      inputs.forEach(function(inp) { if (inp.required && !inp.value.trim()) valid = false; });
      if (!valid) { alert('Please fill in all required fields.'); return; }
      formBtn.textContent = '✓ Message Sent!';
      formBtn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      formBtn.disabled = true;
      setTimeout(function() {
        formBtn.textContent = 'Send Message';
        formBtn.style.background = '';
        formBtn.disabled = false;
        if (form) form.reset();
      }, 3000);
    });
  }
})();

(function initFromHash(){const hash=location.hash.replace('#','');if(['try','features','industries','pricing','faq','founder','contact'].includes(hash))showView(hash);else revealVisible();})();

// Back button / popstate fix
window.addEventListener('popstate', function() {
  var hash = location.hash.replace('#','');
  if(['home','try','features','industries','pricing','faq','founder','contact'].includes(hash)) {
    showView(hash);
  } else {
    showView('home');
  }
});




/* ===== Try Compass — Banking flows runner (ported from AnswerFlow) ===== */
const TC_FLOWS=[
  {id:'kyc',title:'KYC / Account Opening',tag:'ops',tagLabel:'Operations',desc:'New customer account opening with KYC verification',roles:['officer','manager','teller','rm','intern'],steps:[
    {type:'action',title:'Greet the customer & identify need',desc:'Welcome the customer warmly. Ask which type of account they wish to open.',hint:'Savings, Current, Joint, NRI, or Minor account — confirm before proceeding.'},
    {type:'action',title:'Collect KYC documents',desc:'Request original documents: PAN Card, Aadhaar Card, 2 passport photos, Address proof.',input:[{l:'Account Type',t:'select',opts:['Savings Account','Current Account','Joint Account','NRI Account','Minor Account']}]},
    {type:'critical',title:'Verify ORIGINAL documents in person',warn:'Never accept photocopies alone. Physically examine originals. If documents appear tampered or suspicious, escalate to Branch Manager immediately — do not open the account.',check:'I have physically verified all original documents'},
    {type:'data',title:'Enter customer details into CBS',desc:'Record all customer information in the Core Banking System.',input:[{l:'Full Name',t:'text'},{l:'PAN Number',t:'text'},{l:'Aadhaar Number',t:'text'},{l:'Mobile (Registered)',t:'text'}]},
    {type:'decision',title:'Are all documents complete and valid?',desc:'Confirm all required documents are present, legible, and within validity period.',choices:['Yes — all documents complete','No — documents missing or invalid']},
    {type:'action',title:'Open account in CBS & assign number',desc:'Create the account in CBS. Print the acknowledgement slip with the new account number.'},
    {type:'action',title:'Issue welcome kit to customer',desc:'Hand over: passbook, debit card application form, internet banking enrollment form, cheque book request.'},
    {type:'data',title:'Log in the account opening register',desc:'Record this account opening in the branch register.',input:[{l:'New Account Number',t:'text'},{l:'Date',t:'text'},{l:'Staff ID',t:'text'}]},
    {type:'endpoint',title:'Account Opened Successfully ✓',desc:'The account is now active. Remind the customer to activate their debit card at the ATM and register for net banking.'}
  ]},
  {id:'loan',title:'Loan Processing',tag:'ops',tagLabel:'Operations',desc:'Personal, home, or vehicle loan — end-to-end procedure',roles:['officer','manager','rm','credit','intern'],steps:[
    {type:'backstory',title:'Loan products overview',desc:'Ensure you have the current rate card before speaking to the customer. Never quote rates from memory.',hint:'Rate card is on the CBS dashboard. Refresh it every Monday.'},
    {type:'action',title:'Identify loan type and requirement',desc:'Listen to the customer and confirm the loan type and approximate amount needed.',input:[{l:'Loan Type',t:'select',opts:['Personal Loan','Home Loan','Vehicle Loan','Education Loan','Business Loan']},{l:'Amount Required (₹)',t:'text'}]},
    {type:'action',title:'Collect application form and documents',desc:'Provide the loan application form. Collect: income proof (3 months), bank statements (6 months), ID, address proof.'},
    {type:'critical',title:'Run CIBIL / Credit score check — mandatory',warn:'Every loan application MUST have a CIBIL check before proceeding. Score below 650 requires written Branch Manager approval. This cannot be skipped under any circumstances.',check:'CIBIL check completed — score recorded'},
    {type:'decision',title:'Is the credit score acceptable?',desc:'Standard eligibility threshold is 650+. Check for active defaults.',choices:['Yes — score is 650 or above','No — score is below 650']},
    {type:'data',title:'Record application in the Loan Management System',desc:'Enter all details in LMS.',input:[{l:'Application ID',t:'text'},{l:'CIBIL Score',t:'text'},{l:'Loan Amount (₹)',t:'text'}]},
    {type:'action',title:'Send file to credit appraisal team',desc:'Forward the complete file to the credit officer with all documents attached and indexed.'},
    {type:'decision',title:'Has the loan been sanctioned?',desc:'Await credit team decision.',choices:['Yes — sanctioned','No — rejected']},
    {type:'action',title:'Issue sanction letter & get agreement signed',desc:'Print sanction letter. Explain EMI, processing fee, and terms. Collect signed loan agreement.'},
    {type:'action',title:'Disburse the loan amount',desc:'Credit the sanctioned amount to the customer\'s account via NEFT or direct CBS credit.',hint:'Verify all pre-disbursement conditions are cleared before triggering the transfer.'},
    {type:'endpoint',title:'Loan Disbursed ✓',desc:'Loan is active. Provide the EMI repayment schedule and auto-debit NACH mandate form to the customer.'}
  ]},
  {id:'grievance',title:'Customer Grievance Handling',tag:'cs',tagLabel:'Customer Service',desc:'Complaint receipt, resolution, and escalation procedure',roles:['officer','manager','rm','teller','intern'],steps:[
    {type:'action',title:'Customer raises a complaint',desc:'Receive the complaint — in person, by phone, or in writing.',input:[{l:'Complaint Type',t:'select',opts:['Transaction Dispute','Service Issue','Staff Behaviour','Fee Dispute','ATM/Digital Issue','Product Issue','Other']}]},
    {type:'backstory',title:'Listen first — always',desc:'Listen completely before responding. Do not interrupt, argue, or become defensive. Acknowledge the frustration.',hint:'"I understand how frustrating this must be. Let me look into this right now."'},
    {type:'data',title:'Log in the Grievance Register — mandatory',desc:'Every complaint must be logged immediately, even if resolved on the spot.',input:[{l:'Account Number',t:'text'},{l:'Date & Time',t:'text'},{l:'Issue Description',t:'text'},{l:'Customer Phone',t:'text'}]},
    {type:'decision',title:'Can you resolve this immediately at branch level?',desc:'Assess if the issue is within your authority — waiver, reversal, correction, or explanation.',choices:['Yes — I can resolve it now','No — needs escalation']},
    {type:'action',title:'Resolve at branch level',desc:'Take the required action: reverse a charge, correct an entry, explain a policy, or initiate a service request.'},
    {type:'action',title:'Confirm resolution with the customer',desc:'Explain what was done. Ask if they are satisfied. Get their signature or verbal confirmation of closure.'},
    {type:'data',title:'Update register — mark resolved',desc:'Record the resolution steps and close the complaint in the register.',input:[{l:'Resolution Description',t:'text'},{l:'Confirmation Method',t:'select',opts:['Written signature','Verbal — recorded','Email confirmation']}]},
    {type:'endpoint',title:'Grievance Closed ✓',desc:'Complaint resolved and logged. Closure SMS will be sent automatically to the customer.'}
  ]},
  {id:'cash',title:'Cash Handling',tag:'ops',tagLabel:'Operations',desc:'Teller counter procedure for deposits, withdrawals, and EOD',roles:['teller','manager','back'],steps:[
    {type:'action',title:'Customer approaches — identify transaction',desc:'Greet and ask for account number and transaction type.',input:[{l:'Transaction Type',t:'select',opts:['Cash Deposit','Cash Withdrawal','Currency Exchange','Demand Draft']}]},
    {type:'action',title:'Verify customer identity',desc:'Check a valid photo ID against the account record in CBS.'},
    {type:'critical',title:'Check ALL cash for counterfeit notes',warn:'Every cash transaction requires UV light and counting machine verification. Even a single suspected note must be flagged. This is non-negotiable at all times.',check:'All notes verified using UV light and counting machine'},
    {type:'decision',title:'Was any counterfeit note detected?',desc:'If any note fails UV or machine check, treat it as suspect.',choices:['No — all notes genuine','Yes — suspect counterfeit found']},
    {type:'action',title:'Count cash aloud in front of the customer',desc:'Count the cash clearly in full view of the customer. Both must agree on the amount before proceeding.'},
    {type:'action',title:'Process transaction in CBS',desc:'Enter transaction details, update account balance, print receipt or update passbook.'},
    {type:'data',title:'Issue stamped and signed receipt',desc:'Hand the customer their copy of the deposit slip or withdrawal receipt.',input:[{l:'Transaction Amount (₹)',t:'text'},{l:'Receipt Number',t:'text'}]},
    {type:'action',title:'Balance drawer at End of Day',desc:'Count physical cash and reconcile against CBS transaction total.'},
    {type:'critical',title:'Report any cash discrepancy immediately',warn:'Any discrepancy of ₹100 or more MUST be reported to the Branch Manager before leaving the branch. Never carry a discrepancy forward to the next day.',check:'Drawer balanced OR discrepancy reported to BM'},
    {type:'endpoint',title:'Cash Operations Complete ✓',desc:'All cash transactions completed and drawer balanced for the day.'}
  ]},
  {id:'fraud',title:'Fraud Detection & Escalation',tag:'risk',tagLabel:'Risk',desc:'Immediate response procedure when fraud is suspected',roles:['teller','officer','manager','compliance','guard'],steps:[
    {type:'critical',title:'Suspicious activity detected — STOP',warn:'Do NOT proceed with the transaction. Do NOT alert the customer yet. Alerting a fraudster may allow them to flee or destroy evidence. Stay calm.',check:'Understood — I will not alert the customer yet'},
    {type:'action',title:'Quietly alert the Branch Manager',desc:'Use the internal phone or walk calmly to the Branch Manager. No public announcement. Stay professional.',hint:'Use your branch\'s code phrase if one exists.'},
    {type:'data',title:'Document all details immediately',desc:'While keeping the customer engaged, note everything observed.',input:[{l:'Time of Incident',t:'text'},{l:'Account Number',t:'text'},{l:'Amount / Transaction',t:'text'},{l:'Description of Suspect',t:'text'}]},
    {type:'decision',title:'What type of fraud is this?',desc:'Identify the primary nature of the suspicious activity.',choices:['Transaction fraud — unusual transfer/withdrawal','Identity or impersonation fraud','Document forgery suspected']},
    {type:'action',title:'Put the transaction on hold',desc:'Do not approve or process the transaction. Politely inform the customer that the system requires additional verification.'},
    {type:'critical',title:'Call the Fraud Control Unit immediately',warn:'Call the FCU helpline NOW. Every minute matters. The FCU is available 24/7 and will guide all next steps. Do not take further action without their instruction.',check:'FCU helpline has been called — reference number noted'},
    {type:'data',title:'File a complete incident report',desc:'Complete the Suspicious Transaction Report (STR).',input:[{l:'STR Reference Number',t:'text'},{l:'FCU Officer Name',t:'text'},{l:'Action Instructed by FCU',t:'text'}]},
    {type:'endpoint',title:'Fraud Escalation Complete ✓',desc:'Incident escalated to the Fraud Control Unit. Continue following their instructions. Full report must reach Compliance within 24 hours.'}
  ]},
  {id:'audit',title:'Branch Audit Checklist',tag:'audit',tagLabel:'Audit',desc:'Full branch audit from auditor arrival to report submission',roles:['compliance','manager'],steps:[
    {type:'action',title:'Auditor arrives — present credentials',desc:'Show the official audit authorization letter to the Branch Manager.',input:[{l:'Audit Reference No.',t:'text'},{l:'Audit Type',t:'select',opts:['Routine Annual Audit','Surprise Audit','Special Purpose Audit','Concurrent Audit']}]},
    {type:'backstory',title:'Audit scope',desc:'Today\'s audit covers: Cash & Vault, KYC files, Loan files, Mandatory registers, IT systems & access logs, Compliance notices, Staff attendance.',hint:'Focus on high-risk areas first. Note every finding — no matter how minor.'},
    {type:'action',title:'Verify cash balance',desc:'Physical count of teller drawers and vault, compared against CBS balance.'},
    {type:'decision',title:'Is cash balanced?',desc:'Physical cash must match CBS exactly.',choices:['Yes — cash is balanced','No — discrepancy found']},
    {type:'action',title:'Review KYC files — sample 10%',desc:'Random sample of active accounts. Check: PAN, Aadhaar, photo, address proof, periodic updation.'},
    {type:'action',title:'Review loan files',desc:'Verify all active loans have: sanction notes, appraisal reports, signed agreements, disbursement records.'},
    {type:'action',title:'Check all mandatory registers',desc:'Grievance Register, Cash Register, Suspicious Transaction Register, Visitor Register, Strong Room Register — all must be updated.',input:[{l:'Register Status',t:'select',opts:['All registers updated','Some entries missing','Register missing entirely']}]},
    {type:'action',title:'Inspect IT systems',desc:'Check: antivirus updated, CBS access logs, guest access revoked, password policy compliance.'},
    {type:'data',title:'Compile audit findings report',desc:'Document all findings with evidence.',input:[{l:'Overall Branch Rating',t:'select',opts:['Satisfactory','Needs Improvement','Unsatisfactory']},{l:'Major Findings Count',t:'text'},{l:'Minor Findings Count',t:'text'}]},
    {type:'action',title:'Present findings to Branch Manager & get signature',desc:'Discuss all findings clearly. Obtain signature on the preliminary audit report.'},
    {type:'endpoint',title:'Audit Report Submitted ✓',desc:'Report submitted to Regional Office. Branch has 15 days to respond to major findings.'}
  ]},
  {id:'cheque',title:'Cheque Processing',tag:'ops',tagLabel:'Operations',desc:'Inward cheque clearing, same-bank and MICR procedure',roles:['teller','officer','back'],steps:[
    {type:'action',title:'Customer submits cheque for deposit',desc:'Accept the cheque and deposit slip.',input:[{l:'Drawee Bank',t:'text'},{l:'Cheque Amount (₹)',t:'text'}]},
    {type:'action',title:'Verify all cheque details',desc:'Check: date (not stale or post-dated), payee name matches account, amount in words equals figures, no overwriting without counter-sign.'},
    {type:'decision',title:'Are cheque details correct?',desc:'All fields must be correctly filled.',choices:['Yes — all details correct','No — error or discrepancy found']},
    {type:'decision',title:'Same bank or other bank?',desc:'Check the bank name and MICR code.',choices:['Same bank — in-house clearing','Other bank — MICR clearing']},
    {type:'action',title:'Process in-house clearing (T+0)',desc:'Credit amount to the customer\'s account the same day.'},
    {type:'data',title:'Issue acknowledgement receipt',desc:'Stamp and sign the deposit slip.',input:[{l:'Deposit Slip Reference',t:'text'},{l:'Amount Credited (₹)',t:'text'}]},
    {type:'action',title:'Send for MICR clearing (T+1 / T+2)',desc:'Forward to clearing house. Credit will appear within T+1 or T+2 working days.'},
    {type:'decision',title:'Did the cheque clear?',desc:'After clearing period, check for honour or return.',choices:['Yes — cheque cleared','No — cheque bounced / returned']},
    {type:'critical',title:'Cheque bounced — take immediate action',warn:'Debit the amount from the account immediately. Charge the bounce fee per schedule of charges. Issue a Cheque Return Memo. Notify both the depositor and the drawer without delay.',check:'Account debited, bounce fee charged, return memo issued'},
    {type:'endpoint',title:'Cheque Processing Complete ✓',desc:'Transaction finalised. Customer notified of the outcome.'}
  ]},
  {id:'fd',title:'Fixed Deposit Opening',tag:'ops',tagLabel:'Operations',desc:'New FD, premature closure, and renewal procedures',roles:['officer','teller','rm','intern'],steps:[
    {type:'action',title:'Identify customer FD request',desc:'Ask what type of FD service they need.',input:[{l:'Request Type',t:'select',opts:['New Fixed Deposit','FD Renewal','Premature Closure','Interest Certificate']}]},
    {type:'backstory',title:'Always check the current FD rate card',desc:'FD rates change regularly. Never quote from memory. The rate card is on the CBS dashboard.',hint:'Refresh the rate card every Monday morning.'},
    {type:'action',title:'Explain FD rates and tenure options',desc:'Show the customer the current rate card. Explain interest payout options, auto-renewal, and TDS implications.'},
    {type:'action',title:'Fill FD application form',desc:'Complete: deposit amount, tenure, nominee details, interest payout preference, auto-renewal instruction.',input:[{l:'Deposit Amount (₹)',t:'text'},{l:'Tenure',t:'select',opts:['7-45 days','46-180 days','181 days-1 year','1-2 years','2-5 years','5-10 years']},{l:'Nominee Name',t:'text'}]},
    {type:'critical',title:'PAN mandatory for cash deposits ≥ ₹50,000',warn:'If customer is paying in cash and the amount is ₹50,000 or more, PAN is MANDATORY by law (Income Tax Act). Do not proceed without it. No exceptions.',check:'PAN collected OR amount is below ₹50,000'},
    {type:'action',title:'Debit from savings account or accept cash',desc:'Process the debit or accept cash. Verify and confirm the amount.'},
    {type:'data',title:'Issue FD Receipt (FDR)',desc:'Print FDR with unique number, amount, rate, tenure, and maturity date.',input:[{l:'FDR Number',t:'text'},{l:'Maturity Date',t:'text'},{l:'Maturity Amount (₹)',t:'text'}]},
    {type:'endpoint',title:'Fixed Deposit Created ✓',desc:'FD is active. Hand the original FDR to the customer and explain the maturity process and premature closure penalties.'}
  ]},
  {id:'digital',title:'Digital Banking Support',tag:'cs',tagLabel:'Customer Service',desc:'Resolving internet banking, UPI, and debit card issues',roles:['officer','it','teller','intern'],steps:[
    {type:'action',title:'Customer reports a digital banking issue',desc:'Understand the problem before taking any action.',input:[{l:'Issue Type',t:'select',opts:['Internet Banking Blocked','Mobile App Issue','UPI Transaction Failed','Debit Card Blocked','Card Lost / Stolen','OTP Not Received','Password Forgotten']}]},
    {type:'critical',title:'Verify customer identity FIRST — no exceptions',warn:'Before taking ANY action on a digital banking issue, you MUST fully verify the customer\'s identity using account number and registered mobile OTP. Resetting credentials or blocking/unblocking cards without verification is a serious security breach.',check:'Customer identity verified via OTP + account details'},
    {type:'decision',title:'What is the primary issue?',desc:'Route to the correct resolution path.',choices:['Login blocked or password issue','Transaction failed — money possibly deducted','Card blocked or lost / stolen']},
    {type:'action',title:'Reset internet banking credentials in CBS',desc:'Generate a temporary password and send it to the registered mobile number.',hint:'Instruct the customer to change the password immediately on first login.'},
    {type:'data',title:'Get failed transaction details from customer',desc:'Collect the reference information needed to investigate.',input:[{l:'UTR / Reference Number',t:'text'},{l:'Transaction Date',t:'text'},{l:'Amount (₹)',t:'text'},{l:'Beneficiary Name / UPI ID',t:'text'}]},
    {type:'action',title:'Check CBS and UPI switch logs',desc:'Verify if the debit occurred and if a corresponding credit was sent to the beneficiary.'},
    {type:'critical',title:'Raise reversal within 24 hours if debit without credit',warn:'RBI mandates failed transaction reversals within T+5 business days. The reversal request must be raised within 24 hours of the customer reporting it. Log the complaint reference.',check:'Reversal request raised — complaint reference number noted'},
    {type:'action',title:'Block the card and initiate replacement',desc:'Block the card in CBS immediately. Raise a replacement card request. Delivery in 7-10 working days.'},
    {type:'endpoint',title:'Digital Issue Resolved ✓',desc:'Issue addressed. Provide the customer with a service request reference number for follow-up tracking.'}
  ]},
  {id:'closure',title:'Account Closure',tag:'ops',tagLabel:'Operations',desc:'Full account closure procedure from request to CBS entry',roles:['officer','manager','teller'],steps:[
    {type:'action',title:'Customer requests account closure',desc:'Acknowledge the request. Verify identity with original photo ID.',hint:'Do not pressure the customer to stay. Simply note the reason internally for analytics.'},
    {type:'action',title:'Check for linked products and pending items',desc:'Run a full CBS check for: standing instructions, linked loans, pending inward cheques, linked FDs, auto-debit mandates.',input:[{l:'Standing Instructions',t:'select',opts:['None active','Active — cancel first']},{l:'Linked Loans',t:'select',opts:['No linked loans','Active loan — must be cleared']}]},
    {type:'decision',title:'Are there active linked products?',desc:'If any loan or FD is linked, closure cannot proceed until resolved.',choices:['No — account is clear','Yes — linked products need resolution']},
    {type:'critical',title:'Collect debit card and unused cheque leaves',warn:'Ask the customer to physically hand over the debit card. Cut it in front of them. Collect all unused cheque leaves. Do NOT close the account without collecting these items.',check:'Debit card collected and destroyed, unused cheques collected'},
    {type:'action',title:'Calculate final balance including accrued interest',desc:'Compute the closing balance with interest to date of closure.',input:[{l:'Closing Balance (₹)',t:'text'},{l:'Accrued Interest (₹)',t:'text'}]},
    {type:'decision',title:'Is the account less than 1 year old?',desc:'Premature closure charges apply to accounts closed within 12 months.',choices:['No — 1 year or older','Yes — less than 1 year old']},
    {type:'action',title:'Deduct premature closure charges if applicable',desc:'Apply charges as per schedule. Explain the deduction clearly.',hint:'Show the customer the printed schedule of charges if they question it.'},
    {type:'action',title:'Credit final balance to customer',desc:'Pay by cash, account transfer, or Demand Draft as preferred.',input:[{l:'Payout Mode',t:'select',opts:['Cash','Account Transfer','Demand Draft']},{l:'Amount Paid (₹)',t:'text'}]},
    {type:'data',title:'Close account in CBS — print closure receipt',desc:'Mark the account as closed. Print and hand the closure certificate.',input:[{l:'Closure Reference No.',t:'text'},{l:'Date of Closure',t:'text'}]},
    {type:'endpoint',title:'Account Closed Successfully ✓',desc:'Account closed. Closure confirmation SMS will be sent to the customer. Retain all documentation for 8 years per RBI archival policy.'}
  ]}
];

const TC_SHAPE={
  action:{label:'Action',cls:'sp-action',icon:'◉'},
  decision:{label:'Decision',cls:'sp-decision',icon:'◇'},
  data:{label:'Record',cls:'sp-data',icon:'▤'},
  backstory:{label:'Context',cls:'sp-backstory',icon:'💡'},
  critical:{label:'⚠ Critical',cls:'sp-critical',icon:'⚠'},
  endpoint:{label:'Complete',cls:'sp-endpoint',icon:'✓'}
};
let TC_ST={idx:0,done:new Set(),choices:{},inputs:{},checks:{},flow:null};

function tcShowScreen(name){
  ['ind','flows','run'].forEach(n=>{
    var el=document.getElementById('tc-screen-'+n);
    if(el) el.classList.toggle('active',n===name);
  });
  var top=document.getElementById('view-try');
  if(top) top.scrollIntoView({behavior:'smooth',block:'start'});
}
function tcOpenBank(){ tcRenderFlows(); tcShowScreen('flows'); }

function tcRenderFlows(){
  var list=document.getElementById('tc-scen-list'); if(!list) return;
  list.innerHTML=TC_FLOWS.map(function(f,i){
    return '<div class="scen-card" onclick="tcStartFlow('+i+')">'
      +'<div class="scen-num">'+String(i+1).padStart(2,'0')+'</div>'
      +'<div class="scen-info"><span class="scen-tag st-'+f.tag+'">'+f.tagLabel+'</span>'
      +'<h4>'+f.title+'</h4><p>'+f.desc+'</p></div>'
      +'<div class="scen-arrow">→</div></div>';
  }).join('');
}

function tcStartFlow(idx){
  TC_ST={idx:0,done:new Set(),choices:{},inputs:{},checks:{},flow:TC_FLOWS[idx]};
  document.getElementById('tc-run-crumb').innerHTML='🏦 Banking &amp; Finance › '+TC_ST.flow.title;
  tcShowScreen('run');
  tcRenderStep();
}

function tcCanGo(s,idx){
  if(s.type==='critical') return !!TC_ST.checks[idx];
  if(s.type==='decision') return TC_ST.choices[idx]!==undefined;
  return true;
}
function tcCheck(){ TC_ST.checks[TC_ST.idx]=document.getElementById('tc-critchk').checked; var b=document.getElementById('tc-btn-nxt'); if(b) b.disabled=!TC_ST.checks[TC_ST.idx]; }
function tcPick(idx,ci){ TC_ST.choices[idx]=ci; tcRenderStep(); }
function tcSaveInp(idx,fi,v){ if(!TC_ST.inputs[idx]) TC_ST.inputs[idx]={}; TC_ST.inputs[idx][fi]=v; }
function tcNext(){ var s=TC_ST.flow.steps[TC_ST.idx]; if(!tcCanGo(s,TC_ST.idx)) return; TC_ST.done.add(TC_ST.idx); if(TC_ST.idx<TC_ST.flow.steps.length-1){TC_ST.idx++;tcRenderStep();} }
function tcPrev(){ if(TC_ST.idx>0){TC_ST.idx--;tcRenderStep();} }
function tcRestart(){ TC_ST.idx=0;TC_ST.done=new Set();TC_ST.choices={};TC_ST.inputs={};TC_ST.checks={};tcRenderStep(); }

function tcRenderStep(){
  var steps=TC_ST.flow.steps, s=steps[TC_ST.idx], idx=TC_ST.idx;
  document.getElementById('tc-trail').innerHTML=steps.map(function(_,i){return '<div class="trail-dot '+(TC_ST.done.has(i)?'done':i===idx?'current':'future')+'"></div>';}).join('');
  document.getElementById('tc-counter').textContent='Step '+(idx+1)+' of '+steps.length;
  var wrap=document.getElementById('tc-step-wrap');

  if(s.type==='endpoint'){
    TC_ST.done.add(idx);
    wrap.innerHTML='<div class="step-card type-endpoint"><div class="shape-pill sp-endpoint">✓ Complete</div>'
      +'<div class="endpoint-body"><div class="ep-icon">✓</div><div class="ep-title">'+s.title+'</div>'
      +'<div class="ep-desc">'+s.desc+'</div><div class="ep-btns">'
      +'<button class="ep-btn-sec" onclick="tcRestart()">↺ Start over</button>'
      +'<button class="ep-btn-pri" onclick="tcShowScreen(\'flows\')">← All flows</button></div></div></div>';
    return;
  }

  var cfg=TC_SHAPE[s.type]||TC_SHAPE.action;
  var hint=s.hint?'<div class="step-hint"><strong>💡 Tip:</strong> '+s.hint+'</div>':'';
  var desc=s.desc?'<div class="step-desc">'+s.desc+'</div>':'';
  var critHTML='';
  if(s.type==='critical'){
    critHTML='<div class="crit-banner"><div class="crit-banner-top"><div class="crit-icon">⚠️</div>'
      +'<div><div class="crit-title">Critical — Must not be missed</div><div class="crit-text">'+s.warn+'</div></div></div>'
      +'<div class="crit-check-row"><input type="checkbox" id="tc-critchk" onchange="tcCheck()" '+(TC_ST.checks[idx]?'checked':'')+'>'
      +'<label for="tc-critchk">'+s.check+'</label></div></div>';
  }
  var inputHTML='';
  if(s.input){
    inputHTML='<div class="data-fields">'+s.input.map(function(f,fi){
      var v=(TC_ST.inputs[idx]||{})[fi]||'';
      var field=f.t==='select'
        ? '<select onchange="tcSaveInp('+idx+','+fi+',this.value)"><option>Select...</option>'+(f.opts||[]).map(function(o){return '<option '+(v===o?'selected':'')+'>'+o+'</option>';}).join('')+'</select>'
        : '<input type="text" placeholder="Enter '+f.l.toLowerCase()+'" value="'+v+'" oninput="tcSaveInp('+idx+','+fi+',this.value)">';
      return '<div class="data-field"><label>'+f.l+'</label>'+field+'</div>';
    }).join('')+'</div>';
  }
  var decHTML='';
  if(s.type==='decision'){
    var ch=TC_ST.choices[idx];
    decHTML='<div class="decision-choices">'+s.choices.map(function(c,ci){
      return '<button class="choice-btn '+(ch===ci?'selected':'')+'" onclick="tcPick('+idx+','+ci+')"><span>'+c+'</span><span class="choice-arr">→</span></button>';
    }).join('')+'</div>';
  }
  var ok=tcCanGo(s,idx), isLast=idx===steps.length-1;
  wrap.innerHTML='<div class="step-card type-'+s.type+'"><div class="shape-pill '+cfg.cls+'">'+cfg.icon+' '+cfg.label+'</div>'
    +'<h2 class="step-title">'+s.title+'</h2>'+desc+hint+critHTML+inputHTML+decHTML
    +'<div class="step-actions"><button class="btn-back2" onclick="tcPrev()" '+(idx===0?'disabled':'')+'>← Back</button>'
    +'<button class="btn-next '+(isLast?'btn-complete':'')+'" id="tc-btn-nxt" onclick="tcNext()" '+(ok?'':'disabled')+'>'
    +(isLast?'Complete ✓':'Continue →')+'</button></div></div>';
}
