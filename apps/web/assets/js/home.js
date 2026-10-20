/* Ask Compass homepage: emblem labels, particles, use-case and infrastructure tabs, challenge cards, industries, video.
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
  if (document.getElementById('hchGrid')) (function () {
    /* ───────── The challenge: problem ⇄ fix ─────────
       The toggle sets every card; with a mouse, hovering a card previews its fix,
       and focusing a card with the keyboard does the same. */
    var cards = $$('#hchGrid .hch-card'), btns = $$('.hch-toggle button'), knob = $('.hch-knob');
    var view = 'problem';
    function placeKnob() {
      var on = btns.filter(function (b) { return b.dataset.view === view; })[0], g = on.parentElement.getBoundingClientRect(), r = on.getBoundingClientRect();
      knob.style.setProperty('--kl', (r.left - g.left - on.parentElement.clientLeft) + 'px'); knob.style.setProperty('--kw', r.width + 'px');
    }
    function apply() { cards.forEach(function (c) { c.classList.toggle('is-fixed', view === 'fix' || c.dataset.peek === '1'); }); }
    function setView(v) {
      view = v;
      btns.forEach(function (b) { var on = b.dataset.view === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      placeKnob(); apply();
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
    cards.forEach(function (c) {
      c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { c.dataset.peek = '1'; apply(); } });
      c.addEventListener('pointerleave', function () { delete c.dataset.peek; apply(); });
      c.addEventListener('focus', function () { if (c.matches(':focus-visible')) { c.dataset.peek = '1'; apply(); } });
      c.addEventListener('blur', function () { delete c.dataset.peek; apply(); });
      // Tap (touch) flips a single card.
      c.addEventListener('click', function (e) { if (e.pointerType && e.pointerType !== 'mouse' && !e.target.closest('a')) { c.dataset.peek = c.dataset.peek === '1' ? '' : '1'; apply(); } });
    });
    if ('ResizeObserver' in window) new ResizeObserver(placeKnob).observe($('.hch-toggle')); else window.addEventListener('resize', placeKnob);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeKnob);
    setView('problem');
  })();
  if (document.getElementById('hinTabs')) (function () {
    /* ───────── SI knowledge infrastructure tabs ─────────
       Click, tap or arrow keys select a tab. While on screen and before anyone
       interacts, the tabs advance on their own (not with reduced motion). The search
       panel types its query each time it opens. */
    var root = $('#hinTabs'), bar = $('.hin-bar', root), ind = $('.hin-ind', bar);
    var tabs = $$('[role="tab"]', bar), panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var CYCLE = 8000, active = 0, timer = 0, typer = 0, touched = false, inView = false;
    root.style.setProperty('--cycle', CYCLE + 'ms');
    var q = $('#hinQuery'), QUERY = q.textContent;
    function place() {
      var t = tabs[active];
      ind.style.setProperty('--l', t.offsetLeft + 'px'); ind.style.setProperty('--w', t.offsetWidth + 'px');
    }
    function typeQuery() {
      clearInterval(typer);
      if (reduceMotion.matches) { q.textContent = QUERY; return; }
      var n = 0; q.textContent = '';
      typer = setInterval(function () { n++; q.textContent = QUERY.slice(0, n); if (n >= QUERY.length) clearInterval(typer); }, 55);
    }
    function select(i, opts) {
      opts = opts || {};
      active = i;
      tabs.forEach(function (t, j) { var on = j === i; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[j].classList.toggle('is-on', on); });
      var prog = $('.hin-prog', tabs[i]); prog.style.animation = 'none'; void prog.offsetWidth; prog.style.animation = '';
      place();
      var t = tabs[i]; if (t.offsetLeft < bar.scrollLeft || t.offsetLeft + t.offsetWidth > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - 24, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      if (panels[i].querySelector('#hinQuery')) typeQuery();
      if (opts.focus) t.focus();
      schedule();
    }
    function stop() { touched = true; root.classList.remove('is-auto'); clearTimeout(timer); }
    function schedule() {
      clearTimeout(timer);
      var auto = !touched && inView && !reduceMotion.matches && !document.hidden;
      root.classList.toggle('is-auto', auto);
      if (auto) timer = setTimeout(function () { select((active + 1) % tabs.length); }, CYCLE);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stop(); select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = k === 'ArrowRight' ? active + 1 : k === 'ArrowLeft' ? active - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
        if (n === null) return; e.preventDefault(); stop(); select((n + tabs.length) % tabs.length, { focus: true });
      });
    });
    root.addEventListener('focusin', stop);
    $('.hin-stage', root).addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') stop(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(root);
    document.addEventListener('visibilitychange', schedule);
    reduceMotion.addEventListener('change', schedule);
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(bar); else window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    select(0);
  })();
  if (document.getElementById('hindGrid')) (function () {
    /* ───────── Industries ─────────
       Each preview plays once as its card scrolls into view and replays on hover.
       The chips filter the grid, with a view transition where supported. */
    var cards = $$('#hindGrid .icard'), chips = $$('.hind-filter button');
    cards.forEach(function (c, i) { c.style.setProperty('--vt', 'icard-' + i); });
    function play(c) { c.classList.remove('play'); void c.offsetWidth; c.classList.add('play'); }
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { setTimeout(function () { play(e.target); }, (cards.indexOf(e.target) % 4) * 120); io.unobserve(e.target); } }); }, { threshold: 0.4 });
      cards.forEach(function (c) { io.observe(c); });
    } else cards.forEach(function (c) { c.classList.add('play'); });
    cards.forEach(function (c) { c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && !reduceMotion.matches) play(c); }); });
    function filter(f) {
      chips.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
      var apply = function () { cards.forEach(function (c) { c.hidden = f !== 'all' && c.dataset.t.split(' ').indexOf(f) === -1; }); };
      if (document.startViewTransition && !reduceMotion.matches) document.startViewTransition(apply); else apply();
    }
    chips.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });
  })();
  if (document.getElementById('capWheel')) (function () {
    /* ───────── Capability wheel ─────────
       Segments and labels select a capability; arrow keys move around the wheel.
       While on screen and untouched, it advances on its own (not with reduced motion). */
    var root = $('#capWheel'), tabs = $$('.cw-btn', root), segs = $$('.cw-seg', root), beams = $$('.cw-beam', root), needle = $('.cw-needle', root);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var active = 0, timer = 0, touched = false, inView = false, turns = 0, CYCLE = 5200;
    function select(i, focus) {
      // Turn the needle the short way round.
      var prev = active; active = i;
      var d = ((i - prev) % 6 + 6) % 6; if (d > 3) d -= 6; turns += d;
      needle.style.setProperty('--rot', (turns * 60) + 'deg');
      tabs.forEach(function (t, j) { var on = j === i; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[j].classList.toggle('is-on', on); });
      segs.forEach(function (sg, j) { sg.classList.toggle('is-on', j === i); });
      beams.forEach(function (b, j) { b.classList.toggle('is-on', j === i); });
      if (focus) tabs[i].focus();
      schedule();
    }
    function stop() { touched = true; clearTimeout(timer); }
    function schedule() {
      clearTimeout(timer);
      if (!touched && inView && !reduceMotion.matches && !document.hidden) timer = setTimeout(function () { select((active + 1) % 6); }, CYCLE);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stop(); select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = k === 'ArrowRight' || k === 'ArrowDown' ? active + 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? active - 1 : k === 'Home' ? 0 : k === 'End' ? 5 : null;
        if (n === null) return; e.preventDefault(); stop(); select((n + 6) % 6, true);
      });
    });
    segs.forEach(function (sg, i) {
      sg.addEventListener('click', function () { stop(); select(i); });
      sg.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { stop(); if (i !== active) select(i); } });
    });
    tabs.forEach(function (t, i) { t.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { stop(); if (i !== active) select(i); } }); });
    root.addEventListener('focusin', stop);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(root);
    document.addEventListener('visibilitychange', schedule);
    select(0);
  })();
})();
