/* Ask Compass Platform overview (/platform): hero layers, operating model,
   capability filter and the illustrative story. Each block is optional and
   does nothing if its markup is missing. Nothing moves on its own when the
   visitor asks for reduced motion, and auto-advance stops at the first
   interaction. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Calls fn(true/false) as the element enters or leaves the viewport.
  function watch(node, fn) {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    new IntersectionObserver(function (en) { fn(en[0].isIntersecting); }, { threshold: 0.3 }).observe(node);
  }

  /* ───────── Hero: light one layer at a time, or the one being pointed at ───────── */
  (function () {
    var root = $('#pxStack');
    if (!root) return;
    var plates = $$('.pxh-plate', root), labels = $$('.pxh-labels li', root);
    var cur = -1, timer = null, held = false;
    function lit(i) {
      cur = i;
      plates.forEach(function (p) { p.classList.toggle('is-lit', +p.getAttribute('data-i') === i); });
      labels.forEach(function (l) { l.classList.toggle('is-lit', +l.getAttribute('data-i') === i); });
    }
    function tick() { if (!held) lit((cur + 1) % plates.length); }
    function start() { if (!timer && !reduceMotion.matches) timer = setInterval(tick, 1800); }
    function stop() { clearInterval(timer); timer = null; }
    labels.forEach(function (l) {
      l.addEventListener('pointerenter', function () { held = true; lit(+l.getAttribute('data-i')); });
      l.addEventListener('pointerleave', function () { held = false; });
    });
    lit(0);
    watch(root, function (on) { on ? start() : stop(); });
  })();

  /* ───────── Operating model: one stage open at a time ───────── */
  (function () {
    var root = $('#pmModel');
    if (!root) return;
    var stages = $$('.pm-stage', root), timer = null, touched = false;
    function open(i) {
      stages.forEach(function (s, k) {
        s.classList.toggle('is-on', k === i);
        $('.pm-btn', s).setAttribute('aria-expanded', String(k === i));
      });
      root.style.setProperty('--p', String(i / (stages.length - 1)));
    }
    function current() { return stages.findIndex(function (s) { return s.classList.contains('is-on'); }); }
    function stopAuto() { touched = true; clearInterval(timer); timer = null; }
    stages.forEach(function (s, i) {
      var btn = $('.pm-btn', s);
      btn.addEventListener('click', function () { stopAuto(); open(i); });
      btn.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === 'Home') d = -i; else if (e.key === 'End') d = stages.length - 1 - i;
        if (d === undefined) return;
        e.preventDefault(); stopAuto();
        var n = (i + d + stages.length) % stages.length;
        open(n); $('.pm-btn', stages[n]).focus();
      });
    });
    root.addEventListener('pointerdown', stopAuto);
    open(0);
    watch(root, function (on) {
      if (on && !touched && !timer && !reduceMotion.matches) timer = setInterval(function () { open((current() + 1) % stages.length); }, 5200);
      if (!on) { clearInterval(timer); timer = null; }
    });
  })();

  /* ───────── Capability explorer: highlight one group ───────── */
  (function () {
    var grid = $('#pxGrid'), line = $('#pxfLine');
    if (!grid) return;
    var btns = $$('.pxf-btn');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.getAttribute('data-g');
        if (b.classList.contains('is-on') && g !== 'all') g = 'all';
        btns.forEach(function (x) {
          var on = x.getAttribute('data-g') === g;
          x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on));
        });
        grid.setAttribute('data-g', g);
        if (line) line.setAttribute('data-g', g);
      });
    });
  })();

  /* ───────── Illustrative story: moments light up capabilities ───────── */
  (function () {
    var root = $('#ptRoot');
    if (!root) return;
    var moments = $$('.pt-m', root), stage = $('.pt-stage', root), play = $('#ptPlay'), coreT = $('#ptCoreT');
    var nodes = $$('.pt-node', root), lines = $$('.pt-lines line', root);
    var DUR = 6000, timer = null, playing = false, autoStarted = false, idx = 0;
    root.style.setProperty('--dur', DUR / 1000 + 's');
    function show(i) {
      idx = i;
      var caps = moments[i].getAttribute('data-caps').split(' ');
      moments.forEach(function (m, k) {
        m.classList.toggle('is-on', k === i);
        $('.pt-btn', m).setAttribute('aria-expanded', String(k === i));
        // Restart the progress bar for the newly opened moment.
        var bar = $('.pt-timer i', m); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      nodes.forEach(function (n) { n.classList.toggle('is-on', caps.indexOf(n.getAttribute('data-s')) !== -1); });
      lines.forEach(function (l) { l.classList.toggle('is-on', caps.indexOf(l.getAttribute('data-s')) !== -1); });
      stage.classList.add('has-on');
      if (coreT) coreT.textContent = 'Step ' + (i + 1) + ' of ' + moments.length;
      if (playing) schedule();
    }
    function schedule() { clearTimeout(timer); timer = setTimeout(function () { show((idx + 1) % moments.length); }, DUR); }
    function setPlaying(on) {
      playing = on && !reduceMotion.matches;
      root.classList.toggle('is-playing', playing);
      play.setAttribute('aria-pressed', String(playing));
      $('.pt-play-t', play).textContent = playing ? 'Pause the story' : 'Play the story';
      clearTimeout(timer);
      if (playing) show(idx);
    }
    moments.forEach(function (m, i) {
      $('.pt-btn', m).addEventListener('click', function () { autoStarted = true; setPlaying(false); show(i); });
    });
    play.addEventListener('click', function () { autoStarted = true; setPlaying(!playing); });
    if (reduceMotion.matches) play.hidden = true;
    show(0);
    // Play once on first view; pause whenever the story scrolls out of sight.
    watch(root, function (on) {
      if (on && !autoStarted && !reduceMotion.matches) { autoStarted = true; setPlaying(true); }
      else if (!on && playing) { clearTimeout(timer); }
      else if (on && playing) schedule();
    });
  })();
})();
