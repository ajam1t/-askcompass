/* Ask Compass homepage behaviour: navigation, compass bearings, the
   interactive procedure demo, use-case examples and scroll reveals.
   Copy for the demo and the examples lives in the data objects below. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ───────── Header ───────── */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var menuBtn = $('#menuBtn'), nav = $('#mainNav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); closeDrop(); }); });

  var drop = $('.nav-drop'), dropBtn = $('.nav-drop-btn');
  function closeDrop() { drop.classList.remove('is-open'); dropBtn.setAttribute('aria-expanded', 'false'); }
  dropBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = !drop.classList.contains('is-open');
    drop.classList.toggle('is-open', open);
    dropBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) { if (!drop.contains(e.target)) closeDrop(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drop.classList.contains('is-open')) { closeDrop(); dropBtn.focus(); }
    if (nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ───────── Compass bearings ─────────
     The labels sit around the compass at real bearings. The needle visits
     them in turn; compass.js listens for "compass:target" and turns the 3D
     needle. Without WebGL the labels still work over the static compass. */
  var stage = $('#compassStage');
  var labels = $$('#bearings li');
  var lines = $('.stage-lines');

  // Shared framing so the 3D camera and the labels agree on where the ring is.
  window.acCompassFrame = function (w, h) {
    var rx = Math.min(w, h * 1.08) * (w < 560 ? 0.27 : 0.29);
    var tanHalf = Math.tan(14 * Math.PI / 180);
    var pxPerUnit = rx / 1.25;
    return { cx: w / 2, cy: h / 2, rx: rx, ry: rx * 0.9, dist: (h / 2) / pxPerUnit / tanHalf };
  };

  // What the glass panel says when the needle points at each label.
  var CONTEXT = [
    { label: 'Procedure', title: 'Request new equipment', meta: '6 steps · v3.2 · Owner: IT Operations' },
    { label: 'Decision', title: 'Is manager approval required?', meta: 'Two paths, based on cost and catalog' },
    { label: 'Process map', title: 'Start → Eligibility → Approval → Submit', meta: 'One branch, one exception' },
    { label: 'Policy', title: '§2.1 Approval thresholds', meta: 'Approved source · linked to the decision' },
    { label: 'Guided action', title: 'Next: get manager approval', meta: 'Checklist: approval received' }
  ];
  var NORTH = { label: 'Heading', title: 'North · ready for a question', meta: 'Ask about a task to set a direction' };
  function showContext(i) {
    var c = i < 0 ? NORTH : CONTEXT[i];
    $('#ctxLabel').textContent = c.label; $('#ctxTitle').textContent = c.title; $('#ctxMeta').textContent = c.meta;
  }

  // Each label is joined to the compass rim by a curved route with a waypoint,
  // so the active bearing reads as a path rather than a pointer.
  function placeBearings() {
    var r = stage.getBoundingClientRect();
    if (!r.width) return;
    var f = window.acCompassFrame(r.width, r.height), paths = '', dots = '';
    labels.forEach(function (li, i) {
      var b = (+li.dataset.bearing) * Math.PI / 180;
      var k = r.width < 560 ? 1.62 : 1.5;
      var x = f.cx + Math.sin(b) * f.rx * k, y = f.cy - Math.cos(b) * f.ry * k;
      var hw = li.offsetWidth / 2 + 4, hh = li.offsetHeight / 2 + 4;
      x = Math.min(Math.max(x, hw), r.width - hw);
      y = Math.min(Math.max(y, hh), r.height - hh);
      li.style.left = x.toFixed(1) + 'px'; li.style.top = y.toFixed(1) + 'px';
      var ex = f.cx + Math.sin(b) * f.rx * 1.06, ey = f.cy - Math.cos(b) * f.ry * 1.06;
      var b2 = b + (i % 2 ? .16 : -.16), mx = f.cx + Math.sin(b2) * f.rx * 1.27, my = f.cy - Math.cos(b2) * f.ry * 1.27;
      paths += '<path data-i="' + i + '" d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + '"/>';
      var wx = .25 * x + .5 * mx + .25 * ex, wy = .25 * y + .5 * my + .25 * ey;
      dots += '<circle class="waypoint" data-i="' + i + '" cx="' + wx.toFixed(1) + '" cy="' + wy.toFixed(1) + '" r="3.2"/>';
    });
    lines.setAttribute('viewBox', '0 0 ' + Math.round(r.width) + ' ' + Math.round(r.height));
    lines.innerHTML = paths + dots;
    stage.classList.add('has-bearings');
    markActive(activeIndex);
  }

  var activeIndex = -1, cycleTimer = 0, cycleStep = 0, holdUntil = 0, auto = true;
  function markActive(i) {
    activeIndex = i;
    labels.forEach(function (li, j) { li.classList.toggle('is-active', j === i); });
    $$('[data-i]', lines).forEach(function (p) { p.classList.toggle('is-active', +p.dataset.i === i); });
  }
  function aim(i) {
    var changed = i !== activeIndex;
    markActive(i);
    if (changed) showContext(i);
    var bearing = i < 0 ? 0 : +labels[i].dataset.bearing;
    stage.dispatchEvent(new CustomEvent('compass:target', { detail: { bearing: bearing } }));
  }
  function cycle() {
    clearTimeout(cycleTimer);
    if (reduceMotion.matches || !auto) return;
    if (Date.now() < holdUntil) { cycleTimer = setTimeout(cycle, holdUntil - Date.now()); return; }
    // Alternate: point at a label, then settle back to north.
    var atLabel = cycleStep % 2 === 0;
    aim(atLabel ? (cycleStep / 2) % labels.length : -1);
    cycleStep++;
    cycleTimer = setTimeout(cycle, atLabel ? 3800 : 2200);
  }
  function pickLabel(i) { holdUntil = Date.now() + 6000; aim(i); cycleStep = i * 2 + 1; cycle(); }
  labels.forEach(function (li, i) {
    var btn = $('button', li);
    btn.addEventListener('click', function () { pickLabel(i); });
    btn.addEventListener('mouseenter', function () { pickLabel(i); });
    btn.addEventListener('focus', function () { pickLabel(i); });
  });

  // Tactile controls: step the needle between labels, or pause the tour.
  var playBtn = $('#ccPlay');
  function setAuto(on) {
    auto = on;
    playBtn.setAttribute('aria-pressed', String(on));
    $('#ccPlayText').textContent = on ? 'Auto' : 'Paused';
    playBtn.setAttribute('aria-label', on ? 'Pause the automatic tour' : 'Resume the automatic tour');
    if (on) { holdUntil = 0; cycle(); } else clearTimeout(cycleTimer);
  }
  function stepLabel(d) {
    var n = activeIndex < 0 ? (d > 0 ? 0 : labels.length - 1) : (activeIndex + d + labels.length) % labels.length;
    if (auto) setAuto(false);
    aim(n);
  }
  $('#ccPrev').addEventListener('click', function () { stepLabel(-1); });
  $('#ccNext').addEventListener('click', function () { stepLabel(1); });
  playBtn.addEventListener('click', function () { setAuto(!auto); });
  function syncMotionPref() { if (reduceMotion.matches) { setAuto(false); aim(-1); } }
  reduceMotion.addEventListener('change', syncMotionPref);

  // Spatial depth: panels drift with the pointer at different depths (mouse only).
  var heroEl = $('.hero');
  heroEl.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
    var r = stage.getBoundingClientRect();
    stage.style.setProperty('--px', Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width / 2))).toFixed(3));
    stage.style.setProperty('--py', Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / (r.height / 2))).toFixed(3));
  }, { passive: true });
  heroEl.addEventListener('pointerleave', function () { stage.style.setProperty('--px', 0); stage.style.setProperty('--py', 0); });

  if ('ResizeObserver' in window) new ResizeObserver(function () { requestAnimationFrame(placeBearings); }).observe(stage);
  else window.addEventListener('resize', placeBearings);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeBearings);
  placeBearings();
  if (reduceMotion.matches) setAuto(false); else setTimeout(cycle, 1400);

  /* ───────── Interactive procedure demo ───────── */
  var SOURCES = {
    overview: { doc: 'Equipment Request Procedure', sec: 'Overview', quote: 'Use this procedure to request hardware, peripherals or software licences for work use.' },
    s11: { doc: 'Equipment Request Procedure', sec: '§1.1 Starting a request', quote: 'Requests are raised in the service portal under Equipment. Include the item and the business reason.' },
    s12: { doc: 'Equipment Request Procedure', sec: '§1.2 Eligibility', quote: 'Employees are eligible after their first 30 days. Replacement of the same item is allowed once every 24 months unless it is faulty.' },
    s21: { doc: 'Equipment Request Procedure', sec: '§2.1 Approval thresholds', quote: 'Items over $1,000, or items outside the standard catalog, need line-manager approval before submission.' },
    s31: { doc: 'Equipment Request Procedure', sec: '§3.1 Manager approval', quote: 'Send the request to your manager. If they are away for more than two business days, route it to their delegate.' },
    s41: { doc: 'Equipment Request Procedure', sec: '§4.1 Submission and delivery', quote: 'Submitted requests are fulfilled by IT Operations. Confirm receipt within five days of delivery.' }
  };
  var META = { version: 'v3.2 · Approved', owner: 'IT Operations', updated: 'Sample document' };

  var STEPS = {
    start: { title: 'Start a request', kind: 'Action', detail: 'Open a new equipment request in the service portal and choose the item category.', inputs: ['The item you need', 'Your business reason'], source: 's11', next: 'eligibility', nextText: 'Open the service portal and start an equipment request.' },
    eligibility: { title: 'Check eligibility', kind: 'Action', detail: 'Confirm you have passed your first 30 days, and that you have not received the same item in the last 24 months.', inputs: ['Start date checked', 'No same item in 24 months'], source: 's12', next: 'decision', nextText: 'Confirm you meet the two eligibility rules.' },
    decision: { title: 'Is manager approval required?', kind: 'Decision', detail: 'Approval is required when the item costs more than $1,000 or is not in the standard catalog.', source: 's21', options: [{ label: 'Yes', sub: 'Over $1,000 or not in the catalog', next: 'approval' }, { label: 'No', sub: 'Standard catalog item under $1,000', next: 'submit' }], nextText: 'Answer the approval question to see your path.' },
    approval: { title: 'Get manager approval', kind: 'Action', detail: 'Send the request to your manager for approval before you submit it.', exception: 'If your manager is away for more than two business days, route the approval to their delegate.', inputs: ['Approval received'], source: 's31', next: 'submit', nextText: 'Send the request to your manager for approval.' },
    submit: { title: 'Submit the request', kind: 'Action', detail: 'Submit the request in the portal. IT Operations will confirm the order and the delivery date.', inputs: ['Request submitted'], source: 's41', next: 'confirm', nextText: 'Submit the request in the service portal.' },
    confirm: { title: 'Confirm delivery', kind: 'End', detail: 'When the item arrives, confirm receipt in the portal within five days.', inputs: ['Item received'], source: 's41', next: null, nextText: 'Confirm receipt when the item arrives.' }
  };

  var state;
  function resetState() { state = { choice: null, done: {}, current: 'start', open: 'start', source: null, checks: {} }; }
  resetState();

  function pathIds() {
    var ids = ['start', 'eligibility', 'decision'];
    if (state.choice === 'approval') ids.push('approval', 'submit', 'confirm');
    else if (state.choice === 'submit') ids.push('submit', 'confirm');
    return ids;
  }
  function totalSteps() { return state.choice === 'approval' ? 6 : 5; }
  function doneCount() { return pathIds().filter(function (id) { return state.done[id]; }).length; }

  var route = $('#route');
  var shownSteps = {};
  function renderRoute() {
    var ids = pathIds(), html = '';
    ids.forEach(function (id) {
      // Steps revealed by a decision arrive from depth, so the new branch is easy to follow.
      var isNew = !shownSteps[id] && Object.keys(shownSteps).length > 0; shownSteps[id] = true;
      var s = STEPS[id], isDone = !!state.done[id], isCur = state.current === id, isOpen = state.open === id;
      var cls = ['r-step', isDone ? 'is-done' : isCur ? 'is-current' : 'is-upcoming'];
      if (s.kind === 'Decision') cls.push('is-decision');
      if (isOpen) cls.push('is-open');
      if (isNew) cls.push('is-new');
      var choiceTag = id === 'decision' && state.choice ? '<span class="r-choice">' + (state.choice === 'approval' ? 'Yes' : 'No') + '</span>' : '';
      html += '<li class="' + cls.join(' ') + '" data-id="' + id + '">' +
        '<span class="r-marker" aria-hidden="true"></span>' +
        '<div class="r-card"><button class="r-head" type="button" aria-expanded="' + isOpen + '" data-toggle="' + id + '">' +
        '<span class="r-title">' + esc(s.title) + '</span>' + choiceTag +
        '<span class="r-kind">' + (isDone ? 'Done' : isCur ? 'Now' : s.kind) + '</span></button>' +
        (isOpen ? renderBody(id) : '') + '</div></li>';
    });
    if (!state.choice) {
      html += '<li class="r-step is-pending"><span class="r-marker" aria-hidden="true"></span><div class="r-card"><div class="r-head"><span class="r-title">Your next steps depend on the answer above</span></div></div></li>';
    }
    route.innerHTML = html;
  }
  function renderBody(id) {
    var s = STEPS[id], isDone = !!state.done[id], isCur = state.current === id, h = '<div class="r-body">';
    h += '<p class="r-detail">' + esc(s.detail) + '</p>';
    if (s.exception) {
      h += '<div class="r-exception"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 18 17H2z"/><path d="M10 8v4M10 14.5v.5"/></svg><p><strong>Exception:</strong> ' + esc(s.exception) + '</p></div>';
    }
    if (s.options) {
      if (!state.choice && isCur) {
        h += '<div class="r-options">' + s.options.map(function (o) {
          return '<button class="opt" type="button" data-choose="' + o.next + '">' + esc(o.label) + '<small>' + esc(o.sub) + '</small></button>';
        }).join('') + '</div>';
      } else if (state.choice) {
        h += '<div class="r-actions"><button class="link-btn" type="button" data-change>Change answer</button></div>';
      }
    } else if (s.inputs) {
      h += '<div class="r-inputs"><p>Before you continue</p>' + s.inputs.map(function (inp, i) {
        var key = id + i, checked = state.checks[key] || isDone;
        return '<label><input type="checkbox" data-check="' + key + '"' + (checked ? ' checked' : '') + (isDone ? ' disabled' : '') + '> ' + esc(inp) + '</label>';
      }).join('') + '</div>';
    }
    h += '<div class="r-actions">';
    if (!s.options && isCur && !isDone) {
      var ready = s.inputs.every(function (_, i) { return state.checks[id + i]; });
      h += '<button class="mini-btn" type="button" data-complete="' + id + '"' + (ready ? '' : ' disabled') + '>' + (s.next ? 'Mark complete' : 'Finish') + '</button>';
    }
    h += '<button class="link-btn" type="button" data-source="' + s.source + '">View source ' + esc(SOURCES[s.source].sec.split(' ')[0]) + '</button></div>';
    return h + '</div>';
  }

  function renderProgress() {
    var d = doneCount(), t = totalSteps();
    $('#progressLabel').textContent = d + ' of ' + t + ' steps complete';
    $('#progressFill').style.width = (d / t * 100) + '%';
  }
  function renderNext() {
    var cur = state.current ? STEPS[state.current] : null;
    if (!cur) {
      $('#nextTitle').textContent = 'Request complete';
      $('#nextText').textContent = 'Every step on your path is done. The record shows the path you took and the sources behind it.';
    } else {
      $('#nextTitle').textContent = cur.title;
      $('#nextText').textContent = cur.nextText;
    }
  }
  function renderSource() {
    var body = $('#sourceBody'), src = state.source && SOURCES[state.source];
    $$('.src-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(state.source === 'overview')); });
    if (!src) { body.innerHTML = '<p class="s-empty">Select <b>View source</b> on any step to see the approved text it comes from.</p>'; return; }
    body.innerHTML = '<p class="s-doc">' + esc(src.doc) + '</p><p class="s-sec">' + esc(src.sec) + '</p>' +
      '<blockquote class="s-quote">' + esc(src.quote) + '</blockquote>' +
      '<dl class="s-meta"><dt>Version</dt><dd>' + META.version + '</dd><dt>Owner</dt><dd>' + META.owner + '</dd><dt>Status</dt><dd>' + META.updated + '</dd></dl>';
  }

  /* map: fixed layout of the sample procedure */
  var MAP_NODES = {
    start: { x: 280, y: 36, label: 'Start a request' },
    eligibility: { x: 280, y: 112, label: 'Check eligibility' },
    decision: { x: 280, y: 196, label: 'Approval needed?', diamond: true },
    approval: { x: 140, y: 290, label: 'Manager approval' },
    submit: { x: 280, y: 360, label: 'Submit the request' },
    confirm: { x: 280, y: 432, label: 'Confirm delivery' }
  };
  var MAP_EDGES = [
    ['start', 'eligibility'], ['eligibility', 'decision'],
    ['decision', 'approval', 'Yes'], ['decision', 'submit', 'No'],
    ['approval', 'submit'], ['submit', 'confirm']
  ];
  function edgePath(a, b) {
    var A = MAP_NODES[a], B = MAP_NODES[b];
    if (a === 'decision' && b === 'approval') return 'M' + (A.x - 58) + ' ' + A.y + ' H' + B.x + ' V' + (B.y - 18);
    if (a === 'decision' && b === 'submit') return 'M' + A.x + ' ' + (A.y + 34) + ' V' + (B.y - 18);
    if (a === 'approval') return 'M' + A.x + ' ' + (A.y + 18) + ' V' + (B.y) + ' H' + (B.x - 80);
    return 'M' + A.x + ' ' + (A.y + 18) + ' V' + (B.y - (MAP_NODES[b].diamond ? 34 : 18));
  }
  function renderMap() {
    var onPath = pathIds(), svg = '';
    MAP_EDGES.forEach(function (e) {
      var off = state.choice && (onPath.indexOf(e[0]) < 0 || onPath.indexOf(e[1]) < 0);
      var done = state.done[e[0]] && onPath.indexOf(e[1]) >= 0;
      svg += '<path class="m-edge' + (off ? ' is-off' : '') + (done ? ' is-done' : '') + '" d="' + edgePath(e[0], e[1]) + '"/>';
      if (e[2]) {
        var lx = e[2] === 'Yes' ? 180 : 290, ly = e[2] === 'Yes' ? 188 : 262;
        svg += '<text class="m-label" x="' + lx + '" y="' + ly + '">' + e[2] + '</text>';
      }
    });
    Object.keys(MAP_NODES).forEach(function (id) {
      var n = MAP_NODES[id], off = state.choice && onPath.indexOf(id) < 0;
      var cls = 'm-node' + (state.done[id] ? ' is-done' : state.current === id ? ' is-current' : '') + (off ? ' is-off' : '');
      var shape = n.diamond
        ? '<path d="M' + n.x + ' ' + (n.y - 34) + ' L' + (n.x + 58) + ' ' + n.y + ' L' + n.x + ' ' + (n.y + 34) + ' L' + (n.x - 58) + ' ' + n.y + 'Z"/>'
        : '<rect x="' + (n.x - 80) + '" y="' + (n.y - 18) + '" width="160" height="36" rx="8"/>';
      svg += '<g class="' + cls + '" data-node="' + id + '" tabindex="0" role="button" aria-label="' + esc(STEPS[id].title) + '">' + shape +
        '<text x="' + n.x + '" y="' + (n.y + 4.5) + '" text-anchor="middle">' + esc(n.label) + '</text></g>';
    });
    $('#map').innerHTML = svg;
  }
  function renderAll() { renderRoute(); renderProgress(); renderNext(); renderSource(); renderMap(); }

  function complete(id) {
    state.done[id] = true;
    state.current = STEPS[id].next;
    state.open = state.current;
    renderAll();
  }
  function choose(next) {
    state.choice = next;
    state.done.decision = true;
    state.current = next;
    state.open = next;
    renderAll();
  }
  function changeAnswer() {
    ['decision', 'approval', 'submit', 'confirm'].forEach(function (k) { delete state.done[k]; delete shownSteps[k]; });
    shownSteps.decision = true;
    state.choice = null; state.current = 'decision'; state.open = 'decision';
    renderAll();
  }
  function showSource(key) {
    state.source = key; renderSource();
    var panel = $('#sourcePanel');
    panel.classList.remove('flash'); void panel.offsetWidth; panel.classList.add('flash');
    if (window.matchMedia('(max-width: 1080px)').matches) panel.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  var demo = $('#demo');
  demo.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-node]');
    if (!t) return;
    if (t.dataset.toggle) { state.open = state.open === t.dataset.toggle ? null : t.dataset.toggle; renderRoute(); }
    else if (t.dataset.choose) choose(t.dataset.choose);
    else if (t.dataset.complete) complete(t.dataset.complete);
    else if (t.hasAttribute('data-change')) changeAnswer();
    else if (t.dataset.source) showSource(t.dataset.source);
    else if (t.dataset.node) openFromMap(t.dataset.node);
  });
  demo.addEventListener('change', function (e) {
    var key = e.target.dataset && e.target.dataset.check;
    if (!key) return;
    state.checks[key] = e.target.checked;
    var id = key.replace(/\d+$/, ''), btn = $('[data-complete="' + id + '"]', demo);
    if (btn) btn.disabled = !STEPS[id].inputs.every(function (_, i) { return state.checks[id + i]; });
  });
  $('#map').addEventListener('keydown', function (e) {
    var g = e.target.closest('[data-node]');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openFromMap(g.dataset.node); }
  });
  function openFromMap(id) {
    if (pathIds().indexOf(id) < 0) return;
    state.open = id; setTab('steps'); renderRoute();
    var row = $('[data-toggle="' + id + '"]', route); if (row) row.focus();
  }

  var tabSteps = $('#tabSteps'), tabMap = $('#tabMap');
  function setTab(which) {
    var map = which === 'map';
    tabSteps.setAttribute('aria-selected', String(!map)); tabMap.setAttribute('aria-selected', String(map));
    tabSteps.tabIndex = map ? -1 : 0; tabMap.tabIndex = map ? 0 : -1;
    $('#viewSteps').hidden = map; $('#viewMap').hidden = !map;
  }
  tabSteps.addEventListener('click', function () { setTab('steps'); });
  tabMap.addEventListener('click', function () { setTab('map'); });
  [tabSteps, tabMap].forEach(function (t) {
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var other = t === tabSteps ? tabMap : tabSteps; other.click(); other.focus();
    });
  });
  $('#demoReset').addEventListener('click', function () { resetState(); shownSteps = {}; setTab('steps'); renderAll(); });
  setTab('steps');
  renderAll();

  /* ───────── Use cases ───────── */
  var USES = [
    { name: 'Employee onboarding', q: 'What does a new starter need in week one?', who: 'For hiring managers and HR', route: [['Confirm start date and role'], ['Remote or on site?', 'dec'], ['Ship equipment or reserve a desk'], ['Missing contract? Pause and contact HR', 'exc'], ['Book the first-week checklist']] },
    { name: 'IT and access requests', q: 'How do I get access to the finance system?', who: 'For any employee', route: [['Pick the system and access level'], ['Sensitive data?', 'dec'], ['Data owner approval'], ['Access granted and logged']] },
    { name: 'Procurement and approvals', q: 'Can I buy this software subscription?', who: 'For budget holders', route: [['Check the approved vendor list'], ['Vendor approved?', 'dec'], ['New vendor? Start a security review', 'exc'], ['Raise the purchase order']] },
    { name: 'Incident response', q: 'A customer-facing service is down. What first?', who: 'For on-call teams', route: [['Assess impact and severity'], ['Severity 1?', 'dec'], ['Open the incident channel and page the lead'], ['Post the first status update']] },
    { name: 'Customer support', q: 'A customer wants a refund after 45 days.', who: 'For support agents', route: [['Check the order and refund window'], ['Within policy?', 'dec'], ['Outside the window? Escalate to a team lead', 'exc'], ['Issue the refund and note the case']] },
    { name: 'Policies and compliance', q: 'Can I share this report with a partner?', who: 'For anyone handling data', route: [['Check the data classification'], ['Contains personal data?', 'dec'], ['Confirm a data sharing agreement'], ['Share through an approved channel']] },
    { name: 'Project procedures', q: 'How do we close out a project?', who: 'For project leads', route: [['Confirm deliverables are accepted'], ['Open risks or actions?', 'dec'], ['Hand over open items to an owner'], ['Archive documents and record lessons']] },
    { name: 'Operational handoffs', q: 'What do I hand over at the end of a shift?', who: 'For shift-based teams', route: [['Review open items'], ['Anything critical in progress?', 'dec'], ['Brief the next owner directly'], ['Log the handoff']] }
  ];
  var tabs = $('#usesTabs'), panel = $('#usesPanel');
  USES.forEach(function (u, i) {
    var b = el('button', { type: 'button', role: 'tab', id: 'use-tab-' + i, 'aria-selected': i === 0 ? 'true' : 'false', 'aria-controls': 'usesPanel', tabindex: i === 0 ? '0' : '-1' }, esc(u.name));
    b.addEventListener('click', function () { showUse(i, true); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return; e.preventDefault();
      var n = (i + d + USES.length) % USES.length; showUse(n, true); tabs.children[n].focus();
    });
    tabs.appendChild(b);
  });
  function showUse(i, animate) {
    var u = USES[i];
    $$('button', tabs).forEach(function (b, j) { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'use-tab-' + i);
    panel.innerHTML = '<p class="mini-label">Example path</p><p class="u-q">“' + esc(u.q) + '”</p><p class="u-who">' + esc(u.who) + '</p>' +
      '<ol class="u-route">' + u.route.map(function (r) {
        var label = r[1] === 'dec' ? 'Decision' : r[1] === 'exc' ? 'Exception' : '';
        return '<li class="' + (r[1] || '') + '"><b>' + esc(r[0]) + '</b>' + (label ? '<small>' + label + '</small>' : '') + '</li>';
      }).join('') + '</ol>';
    if (animate && !reduceMotion.matches) { panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); }
  }
  showUse(0, false);

  /* ───────── Why Ask Compass: generated comparison ─────────
     "Stored documents" draws a seeded scatter of files with crossing links,
     loops and dead ends. "Navigated work" draws one route with a decision,
     an alternative branch and a live path to the goal. */
  var whySvg = $('#whySvg');
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function drawWhy(mode) {
    var svg = '', W = 520, H = 340;
    if (mode === 'docs') {
      var rand = rng(7), pts = [];
      // Jittered 4×4 grid: scattered, but spread across the whole frame.
      for (var i = 0; i < 16; i++) pts.push({ x: 70 + (i % 4) * 125 + (rand() - .5) * 90, y: 50 + Math.floor(i / 4) * 80 + (rand() - .5) * 50 });
      pts[0] = { x: 44, y: 170 }; pts[15] = { x: 476, y: 170 };
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
          if (d < 150 && rand() > .35) svg += '<path class="w-edge' + (rand() > .55 ? ' dead' : '') + '" d="M' + pts[a].x.toFixed(0) + ' ' + pts[a].y.toFixed(0) + ' L' + pts[b].x.toFixed(0) + ' ' + pts[b].y.toFixed(0) + '"/>';
        }
      }
      pts.forEach(function (p, i) {
        var cls = i === 0 ? 'w-node step' : i === 15 ? 'w-node goal' : (i % 5 === 3 ? 'w-node x' : 'w-node doc');
        svg += i === 0 || i === 15 ? '<circle class="' + cls + '" cx="' + p.x + '" cy="' + p.y + '" r="9"/>' : '<rect class="' + cls + '" x="' + (p.x - 9).toFixed(0) + '" y="' + (p.y - 11).toFixed(0) + '" width="18" height="22" rx="3"/>';
      });
      svg += '<text class="strong" x="30" y="200">Question</text><text class="strong" x="452" y="200">Action</text>';
    } else {
      var N = { q: [44, 170], s1: [140, 170], s2: [236, 170], dec: [322, 170], y: [404, 96], n: [404, 244], goal: [476, 170] };
      var seg = function (a, b, cls) { var A = N[a], B = N[b]; return '<path class="w-edge ' + cls + '" d="M' + A[0] + ' ' + A[1] + ' C' + (A[0] + 40) + ' ' + A[1] + ' ' + (B[0] - 40) + ' ' + B[1] + ' ' + B[0] + ' ' + B[1] + '"/>'; };
      svg += seg('q', 's1', 'route') + seg('s1', 's2', 'route') + seg('s2', 'dec', 'route') + seg('dec', 'y', 'live') + seg('y', 'goal', 'live') + seg('dec', 'n', 'alt') + seg('n', 'goal', 'alt');
      svg += '<g class="enter"><circle class="w-node step" cx="44" cy="170" r="9"/><circle class="w-node step" cx="140" cy="170" r="8"/><circle class="w-node step" cx="236" cy="170" r="8"/>' +
        '<rect class="w-node dec" x="311" y="159" width="22" height="22" rx="3" transform="rotate(45 322 170)"/><circle class="w-node step" cx="404" cy="96" r="8"/><circle class="w-node" cx="404" cy="244" r="8"/><circle class="w-node goal" cx="476" cy="170" r="10"/></g>' +
        '<text class="strong" x="30" y="200">Question</text><text x="116" y="200">Eligibility</text><text x="212" y="200">Details</text><text class="strong" x="296" y="214">Approval?</text>' +
        '<text x="372" y="78">Yes · approval</text><text x="372" y="272">No · submit</text><text class="strong" x="452" y="200">Action</text>';
    }
    whySvg.innerHTML = svg;
    $('#whyCaption').textContent = mode === 'docs'
      ? 'Stored documents: the same answer is spread across many files, with dead ends and loops before you reach an action.'
      : 'Navigated work: one route from question to action. The decision shows both branches, and the path you are on stays lit.';
  }
  $$('.why-toggle button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.why-toggle button').forEach(function (b) { b.setAttribute('aria-checked', String(b === btn)); });
      drawWhy(btn.dataset.mode);
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var other = $$('.why-toggle button').filter(function (b) { return b !== btn; })[0]; other.click(); other.focus();
    });
  });
  drawWhy('docs');

  /* Final compass tilts gently toward the pointer. */
  var dial = $('#dial3d'), finalSec = $('.final');
  finalSec.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
    var r = finalSec.getBoundingClientRect();
    dial.style.setProperty('--tx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
    dial.style.setProperty('--ty', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
  }, { passive: true });
  finalSec.addEventListener('pointerleave', function () { dial.style.setProperty('--tx', 0); dial.style.setProperty('--ty', 0); });

  /* ───────── Gentle reveal for section content ───────── */
  var revealTargets = $$('.section-head, .why-head, .why-viz, .cap-list li, .diff-row, .j-step, .flowline li, .side, .anatomy, .founder-copy, .final-copy');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function (t) {
      // Anything already on screen stays visible; only content below the fold animates in.
      if (t.getBoundingClientRect().top < window.innerHeight) return;
      t.classList.add('reveal'); io.observe(t);
    });
  }
})();
