/* Ask Compass behaviour shared by every page: header and menus, generated
   diagrams, the closing compass tilt and gentle scroll reveals. */
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


  /* ───────── Header and menus ───────── */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  var menuBtn = $('#menuBtn'), nav = $('#mainNav');
  var drops = $$('.nav-drop');
  function closeDrops(except) {
    drops.forEach(function (d) {
      if (d === except) return;
      d.classList.remove('is-open');
      var b = $('.nav-drop-btn', d); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  drops.forEach(function (d) {
    var b = $('.nav-drop-btn', d);
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !d.classList.contains('is-open');
      closeDrops(d);
      d.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });
  if (nav) $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); closeDrops(); }); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.nav-drop')) closeDrops(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = drops.filter(function (d) { return d.classList.contains('is-open'); })[0];
    if (open) { closeDrops(); $('.nav-drop-btn', open).focus(); }
    else if (nav && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  if (document.getElementById('whySvg')) (function () {
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

  })();

  if (document.getElementById('dial3d')) (function () {
    /* Final compass tilts gently toward the pointer. */
    var dial = $('#dial3d'), finalSec = $('.final');
    finalSec.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      var r = finalSec.getBoundingClientRect();
      dial.style.setProperty('--tx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      dial.style.setProperty('--ty', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
    }, { passive: true });
    finalSec.addEventListener('pointerleave', function () { dial.style.setProperty('--tx', 0); dial.style.setProperty('--ty', 0); });

  })();

  /* ───────── Guide filter on the resources page ───────── */
  var filterBtns = $$('[data-filter]'), cards = $$('#guideCards li');
  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      filterBtns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      cards.forEach(function (c) { c.hidden = b.dataset.filter !== 'all' && c.dataset.cat !== b.dataset.filter; });
    });
  });

  /* ───────── Gentle reveal for section content ───────── */
  var revealTargets = $$('.section-head, .why-head, .why-viz, .cap-list li, .diff-row, .j-step, .flowline li, .side, .anatomy, .final-copy, .feat-group, .use-cards li, .fl');
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
