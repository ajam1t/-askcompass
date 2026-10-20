/* Ask Compass Solutions overview (/solutions): compass dial, mending breaks,
   scenario tabs and the one-question starting-point picker. Each block is
   optional. Nothing moves on its own when the visitor asks for reduced motion,
   and the dial stops cycling once someone points at or focuses a solution. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function watch(node, fn, threshold) {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    new IntersectionObserver(function (en) { fn(en[0].isIntersecting); }, { threshold: threshold || 0.3 }).observe(node);
  }

  /* ───────── Dial: the needle turns to one solution at a time ───────── */
  (function () {
    var dial = $('#sxDial');
    if (!dial) return;
    var nodes = $$('.sxd-n', dial), caps = $$('#sxCap span'), needle = $('.sxd-needle', dial);
    var cur = 0, turned = 0, timer = null, held = false;
    function point(i) {
      // Turn the shortest way round so the needle never spins backwards a full lap.
      var target = parseFloat(nodes[i].style.getPropertyValue('--deg'));
      var delta = ((target - turned) % 360 + 540) % 360 - 180;
      turned += delta;
      needle.style.setProperty('--deg', turned + 'deg');
      cur = i;
      nodes.forEach(function (n, k) { n.classList.toggle('is-on', k === i); });
      caps.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
    }
    function start() { if (!timer && !held && !reduceMotion.matches) timer = setInterval(function () { point((cur + 1) % nodes.length); }, 2600); }
    function stop() { clearInterval(timer); timer = null; }
    nodes.forEach(function (n, i) {
      var a = $('a', n);
      a.addEventListener('pointerenter', function () { held = true; stop(); point(i); });
      a.addEventListener('focus', function () { held = true; stop(); point(i); });
    });
    point(0);
    watch(dial, function (on) { on ? start() : stop(); });
  })();

  /* ───────── Breaks: mend the gaps once the cards are in view ───────── */
  (function () {
    var list = $('#sxBreaks');
    if (!list) return;
    if (reduceMotion.matches) { list.classList.add('is-in'); return; }
    watch(list, function (on) { if (on) list.classList.add('is-in'); }, 0.4);
  })();

  /* ───────── Scenario explorer: accessible tabs ───────── */
  (function () {
    var root = $('#sxExplorer');
    if (!root) return;
    var tabs = $$('[role="tab"]', root), panels = $$('[role="tabpanel"]', root);
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on) panels[k].removeAttribute('data-off'); else panels[k].setAttribute('data-off', '');
      });
      if (focus) tabs[i].focus();
      // Keep the chosen tab visible when the tab row scrolls sideways on small screens.
      if (tabs[i].scrollIntoView && root.offsetWidth < 980) tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault();
        select((n + tabs.length) % tabs.length, true);
      });
    });
  })();

  /* ───────── Starting point: one question, then a direction ───────── */
  (function () {
    var card = $('#sxQuiz');
    if (!card) return;
    var q = $('#sxQ', card), results = $$('.sxq-r', card), step = $('.sxq-step b', card), last = null;
    $$('.sxq-opt', card).forEach(function (o) {
      o.addEventListener('click', function (e) {
        // Without this script the option is a plain link to the solution page.
        e.preventDefault();
        last = o;
        var s = o.getAttribute('data-s');
        q.hidden = true;
        results.forEach(function (r) { r.hidden = r.getAttribute('data-s') !== s; });
        card.classList.add('is-done'); step.textContent = '2';
        var shown = results.filter(function (r) { return !r.hidden; })[0];
        $('.sxq-title', shown).focus();
      });
    });
    results.forEach(function (r) {
      $('.sxq-back', r).addEventListener('click', function () {
        results.forEach(function (x) { x.hidden = true; });
        q.hidden = false;
        card.classList.remove('is-done'); step.textContent = '1';
        if (last) last.focus();
      });
    });
  })();
})();
