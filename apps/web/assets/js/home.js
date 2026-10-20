/* Ask Compass homepage: compass bearings and the interactive procedure demo.
   Shared header, menus and section behaviour live in site.js. */
(function () {
  'use strict';
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


  if (document.getElementById('compassStage')) (function () {
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
      if (!$('#ctxLabel')) return;
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
        var k = +(stage.dataset.labelK || (r.width < 560 ? 1.62 : 1.5));
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
    var playBtn = $('#ccPlay') || document.createElement('button');
    function setAuto(on) {
      auto = on;
      playBtn.setAttribute('aria-pressed', String(on));
      if ($('#ccPlayText')) $('#ccPlayText').textContent = on ? 'Auto' : 'Paused';
      playBtn.setAttribute('aria-label', on ? 'Pause the automatic tour' : 'Resume the automatic tour');
      if (on) { holdUntil = 0; cycle(); } else clearTimeout(cycleTimer);
    }
    function stepLabel(d) {
      var n = activeIndex < 0 ? (d > 0 ? 0 : labels.length - 1) : (activeIndex + d + labels.length) % labels.length;
      if (auto) setAuto(false);
      aim(n);
    }
    if ($('#ccPrev')) $('#ccPrev').addEventListener('click', function () { stepLabel(-1); });
    if ($('#ccNext')) $('#ccNext').addEventListener('click', function () { stepLabel(1); });
    playBtn.addEventListener('click', function () { setAuto(!auto); });
    function syncMotionPref() { if (reduceMotion.matches) { setAuto(false); aim(-1); } }
    reduceMotion.addEventListener('change', syncMotionPref);

    // Spatial depth: panels drift with the pointer at different depths (mouse only).
    var heroEl = $('.hx') || $('.hero');
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

  })();

  if (document.getElementById('demo')) (function () {
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

  })();

  if (document.getElementById('studioCanvas')) (function () {
    /* ───────── Studio preview canvas ─────────
       Selecting a node shows what happens there; the decision switches the highlighted branch. */
    var canvas = $('#studioCanvas');
    var SAMPLE = '/studio#/p/onboarding-week-one/run';
    var NODES = {
      start: { kind: 'Start', title: 'Start: new employee', text: 'Begins when the People Team confirms a start date and the role.', docs: [['New starter’s first week', SAMPLE]] },
      email: { kind: 'Action', title: 'Send welcome email', text: 'Send the welcome pack with first-day details, the schedule and who to ask for help.', docs: [['Welcome email template', SAMPLE], ['First-day schedule', SAMPLE]] },
      decision: { kind: 'Decision', title: 'Equipment required?', text: 'Check the role profile. Choose an answer to see which path the new employee takes.', choice: true, docs: [['Equipment request procedure', '/studio#/p/equipment-request/run']] },
      yes: { kind: 'Action · Yes path', title: 'Create IT ticket', text: 'Raise an equipment request at least five working days before the start date.', docs: [['Equipment request procedure', '/studio#/p/equipment-request/run']] },
      no: { kind: 'Action · No path', title: 'Provide access', text: 'Grant access to the systems listed for the role, at the lowest level that meets the need.', docs: [['System access procedure', '/studio#/p/system-access/run']] },
      end: { kind: 'End', title: 'End: ready for day one', text: 'Confirm with the manager that everything is in place before the first day.', docs: [['New starter’s first week', SAMPLE]] }
    };
    var nodes = $$('.hn', canvas);
    function setPath(b) {
      canvas.dataset.path = b;
      $$('[data-choose]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.choose === b)); });
    }
    function select(id) {
      var n = NODES[id];
      if (id === 'yes' || id === 'no') setPath(id);
      nodes.forEach(function (b) { var on = b.dataset.node === id; b.classList.toggle('is-sel', on); b.setAttribute('aria-pressed', String(on)); });
      $('#hstKind').textContent = n.kind; $('#hstTitle').textContent = n.title; $('#hstText').textContent = n.text;
      $('#hstChoice').hidden = !n.choice;
      $('#hstDocs').innerHTML = n.docs.map(function (d) { return '<li><a href="' + d[1] + '">' + esc(d[0]) + '</a></li>'; }).join('');
    }
    nodes.forEach(function (b) { b.addEventListener('click', function () { select(b.dataset.node); }); });
    $$('[data-choose]').forEach(function (x) { x.addEventListener('click', function () { setPath(x.dataset.choose); }); });
    setPath(canvas.dataset.path || 'yes');
  })();
  if (document.getElementById('storyVideo')) (function () {
    /* ───────── Story video ─────────
       Plays (muted) while it is on screen and pauses when it leaves. With reduced
       motion it never starts by itself; the controls still work. */
    var v = $('#storyVideo'), userPaused = false;
    v.addEventListener('pause', function () { if (!v.dataset.auto) userPaused = true; delete v.dataset.auto; });
    v.addEventListener('play', function () { userPaused = false; });
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !userPaused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!en.isIntersecting && !v.paused) { v.dataset.auto = '1'; v.pause(); }
      });
    }, { threshold: 0.45 }).observe(v);
  })();
  if (document.getElementById('ucTabs')) (function () {
    /* ───────── Use-case tabs ─────────
       Click, tap or arrow keys select a tab; with a mouse, moving close to a tab
       selects it after a short dwell. While the section is on screen and nobody has
       interacted, the tabs advance on their own (not with reduced motion). */
    var root = $('#ucTabs'), section = root.closest('.huc'), bar = $('.huc-bar', root), zone = $('.huc-zone', root);
    var tabs = $$('[role="tab"]', bar), panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var ind = $('.huc-ind', bar), near = $('.huc-near', bar), stage = $('.huc-stage', root);
    var CYCLE = 7000, active = 0, timer = 0, dwell = 0, touched = false, inView = false, sheen = false;
    root.style.setProperty('--cycle', CYCLE + 'ms');

    // Split each headline into words so they can rise in one after another.
    panels.forEach(function (p) {
      var h = $('.huc-h', p), i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = el('span', { 'class': 'w' }); w.textContent = part; w.style.setProperty('--i', i++); frag.appendChild(w);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) walk(c);
        });
      })(h);
    });

    function placeIndicator() {
      var t = tabs[active], br = bar.getBoundingClientRect(), r = t.getBoundingClientRect();
      var l = r.left - br.left - bar.clientLeft + bar.scrollLeft, w = r.width;
      ind.style.setProperty('--l', l + 'px');
      ind.style.setProperty('--r', (bar.clientWidth - l - w) + 'px');
    }
    function select(i, opts) {
      opts = opts || {};
      if (i === active && !opts.force) return;
      bar.classList.toggle('to-right', i > active); bar.classList.toggle('to-left', i < active);
      active = i;
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        panels[j].classList.toggle('is-on', on);
      });
      // Restart the progress bar and the panel's entrance animations.
      var prog = $('.huc-prog', tabs[i]); prog.style.animation = 'none'; void prog.offsetWidth; prog.style.animation = '';
      section.dataset.tone = i;
      sheen = !sheen; stage.style.setProperty('--sheen', sheen ? '-30%' : '130%');
      placeIndicator();
      // Keep the active tab visible when the bar scrolls (mobile).
      var t = tabs[i], tl = t.offsetLeft, tr = tl + t.offsetWidth;
      if (tl < bar.scrollLeft || tr > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: tl - 24, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      if (opts.focus) tabs[i].focus();
      schedule();
    }
    function stopAuto() { touched = true; root.classList.remove('is-auto'); clearTimeout(timer); }
    function schedule() {
      clearTimeout(timer);
      var auto = !touched && inView && !reduceMotion.matches && !document.hidden;
      root.classList.toggle('is-auto', auto);
      if (auto) timer = setTimeout(function () { select((active + 1) % tabs.length); }, CYCLE);
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stopAuto(); select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = k === 'ArrowRight' ? active + 1 : k === 'ArrowLeft' ? active - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
        if (n === null) return;
        e.preventDefault(); stopAuto(); select((n + tabs.length) % tabs.length, { focus: true });
      });
    });
    root.addEventListener('focusin', stopAuto);

    // Proximity: the closest tab to the pointer lights up, and is selected after a short dwell.
    zone.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var br = bar.getBoundingClientRect();
      near.style.setProperty('--nx', (e.clientX - br.left - bar.clientLeft + bar.scrollLeft) + 'px');
      var best = -1, bestD = Infinity;
      tabs.forEach(function (t, i) {
        var r = t.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2));
        if (d < bestD && d < r.width / 2 + 12) { best = i; bestD = d; }
      });
      clearTimeout(dwell);
      if (best >= 0 && best !== active) dwell = setTimeout(function () { stopAuto(); select(best); }, 160);
    });
    zone.addEventListener('pointerleave', function () { clearTimeout(dwell); });
    stage.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') stopAuto(); });

    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(root);
    document.addEventListener('visibilitychange', schedule);
    reduceMotion.addEventListener('change', schedule);
    if ('ResizeObserver' in window) new ResizeObserver(placeIndicator).observe(bar); else window.addEventListener('resize', placeIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);
    bar.addEventListener('scroll', placeIndicator, { passive: true });
    select(0, { force: true });
  })();
  if (document.querySelector('.hx-mesh')) (function () {
    /* ───────── Particle constellation behind the hero ─────────
       A few dozen points drift slowly and join up when close; near the mouse they
       connect to the pointer. Runs only while the hero is on screen; with reduced
       motion it is drawn once and stays still. */
    var hero = $('.hx');
    var c = el('canvas', { 'class': 'hx-particles', 'aria-hidden': 'true' });
    hero.insertBefore(c, hero.firstChild);
    var g = c.getContext('2d'); if (!g) return;
    var W = 0, H = 0, pts = [], mouse = { x: -1e4, y: -1e4 }, raf = 0, visible = true, LINK = 120;
    function seed() {
      var n = W < 640 ? 26 : W < 1100 ? 44 : 66;
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .1, r: Math.random() * 1.3 + .5 });
    }
    function size() {
      var r = hero.getBoundingClientRect(), dpr = Math.min(1.5, window.devicePixelRatio || 1);
      if (Math.abs(r.width - W) < 2 && Math.abs(r.height - H) < 2) return;
      W = r.width; H = r.height;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(); draw();
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < LINK * LINK) { g.strokeStyle = 'rgba(23,63,115,' + (.13 * (1 - Math.sqrt(d) / LINK)).toFixed(3) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
        var mx = a.x - mouse.x, my = a.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
        if (md < 170) { g.strokeStyle = 'rgba(37,99,235,' + (.32 * (1 - md / 170)).toFixed(3) + ')'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(mouse.x, mouse.y); g.stroke(); }
        g.fillStyle = md < 170 ? 'rgba(37,99,235,.75)' : 'rgba(23,63,115,.32)';
        g.beginPath(); g.arc(a.x, a.y, a.r, 0, Math.PI * 2); g.fill();
      }
    }
    function step() {
      pts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      });
      draw();
      raf = requestAnimationFrame(step);
    }
    function run() {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden && !reduceMotion.matches) raf = requestAnimationFrame(step); else draw();
    }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (reduceMotion.matches) draw();
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -1e4; if (reduceMotion.matches) draw(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; run(); }).observe(hero);
    document.addEventListener('visibilitychange', run);
    reduceMotion.addEventListener('change', run);
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(hero); else window.addEventListener('resize', size);
    size(); run();
  })();

  if (document.querySelector('.hk-card')) (function () {
    /* ───────── Holographic capability cards ─────────
       The light and the iridescent edge follow the mouse, and the card tilts a little. */
    $$('.hk-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        card.style.setProperty('--ang', (Math.atan2(y - .5, x - .5) * 180 / Math.PI + 90).toFixed(0) + 'deg');
        if (reduceMotion.matches) return;
        card.style.setProperty('--tx', ((.5 - y) * 5).toFixed(2) + 'deg');
        card.style.setProperty('--ty', ((x - .5) * 6).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () { card.style.setProperty('--tx', '0deg'); card.style.setProperty('--ty', '0deg'); });
    });
  })();

  if (document.getElementById('flap')) (function () {
    /* ───────── Split-flap board ─────────
       Cycles through who Ask Compass is for while it is on screen. Screen readers get
       the full list once, from the visually hidden sentence next to it. */
    var board = $('#flap'), words = board.dataset.words.split('|'), len = Math.max.apply(null, words.map(function (w) { return w.length; }));
    var idx = 0, timer = 0, inView = false;
    board.textContent = '';
    var tiles = [];
    for (var i = 0; i < len; i++) { var t = el('span', { 'class': 'ft' }); board.appendChild(t); tiles.push(t); }
    function show(word, animate) {
      var padded = word + new Array(len - word.length + 1).join(' ');
      tiles.forEach(function (t, i) {
        var ch = padded[i];
        if (t.textContent === ch && t.dataset.set) return;
        t.dataset.set = '1';
        if (!animate) { t.textContent = ch; t.classList.toggle('is-blank', ch === ' '); return; }
        setTimeout(function () {
          t.classList.remove('flip'); void t.offsetWidth; t.classList.add('flip');
          setTimeout(function () { t.textContent = ch; t.classList.toggle('is-blank', ch === ' '); }, 150);
        }, i * 32);
      });
    }
    function tick() {
      clearTimeout(timer);
      if (!inView || reduceMotion.matches || document.hidden) return;
      timer = setTimeout(function () { idx = (idx + 1) % words.length; show(words[idx], true); tick(); }, 2800);
    }
    show(words[0], false);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; tick(); }).observe(board);
    document.addEventListener('visibilitychange', tick);
  })();
})();
