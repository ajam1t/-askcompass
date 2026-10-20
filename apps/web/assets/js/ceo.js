/* Leadership sign-in (ceo.askcompass.in). Sign-in is not live yet, so nothing
   here is sent or stored: choosing a profile personalises the page, and the
   sign-in buttons explain what is coming. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ───────── India Standard Time clock ───────── */
  var clock = $('#cxClock'), date = $('#cxDate');
  if (clock) {
    var tf = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    var df = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' });
    var tick = function () { var now = new Date(); clock.textContent = tf.format(now); date.textContent = df.format(now) + ' · IST'; };
    tick(); setInterval(tick, 1000);
  }

  /* ───────── The 3D star drifts round, as on the homepage ───────── */
  var stage = $('#compassStage');
  if (stage && !reduceMotion.matches) {
    var heading = 0;
    setInterval(function () { heading += 45; stage.dispatchEvent(new CustomEvent('compass:target', { detail: { bearing: heading } })); }, 4200);
  }

  var card = $('#cxCard'), pick = $('#cxPick'), note = $('#cxNote');
  if (!card) return;
  var hello = $('#cxHello'), pass = $('#cxPass'), passT = $('#cxPassT'), code = $('#cxCode');
  var noteT = $('#cxNoteT'), noteP = $('#cxNoteP'), back = $('#cxBack');
  var radios = $$('input[name="who"]', card), first = '', busy = false;

  function greet(text, nameHtml) {
    hello.classList.remove('is-new'); void hello.offsetWidth;
    hello.innerHTML = nameHtml ? text + ', <span class="cx-hl">' + nameHtml + '</span>.' : text;
    if (!reduceMotion.matches) hello.classList.add('is-new');
  }

  /* ───────── Choosing a profile ───────── */
  radios.forEach(function (r) {
    r.addEventListener('change', function () {
      first = r.getAttribute('data-first');
      greet('Welcome back', first);
      pass.disabled = false; code.disabled = false;
      passT.textContent = 'Continue as ' + first + ' with a passkey';
    });
  });

  /* ───────── Sign-in: explain honestly instead of pretending ───────── */
  function explain(method) {
    if (busy || !first) return;
    busy = true;
    card.classList.add('is-scan');
    passT.textContent = 'Opening secure sign-in…';
    setTimeout(function () {
      busy = false;
      card.classList.remove('is-scan');
      noteP.textContent = method === 'code'
        ? 'When it launches, ' + first + ' will be able to get a one-time code by email as a backup to a passkey, and every request will be checked on the server.'
        : 'When it launches, ' + first + ' will sign in here with a passkey, and every request will be checked on the server.';
      pick.hidden = true; note.hidden = false;
      noteT.focus();
    }, reduceMotion.matches ? 0 : 1300);
  }
  pass.addEventListener('click', function () { explain('passkey'); });
  code.addEventListener('click', function () { explain('code'); });
  function goBack() {
    note.hidden = true; pick.hidden = false;
    passT.textContent = 'Continue as ' + first + ' with a passkey';
    var on = radios.filter(function (r) { return r.checked; })[0];
    (on || radios[0]).focus();
  }
  back.addEventListener('click', goBack);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !note.hidden) goBack(); });

  /* ───────── Profile cards tilt towards the pointer ───────── */
  if (!reduceMotion.matches && window.matchMedia('(hover: hover)').matches) {
    $$('.cx-p', card).forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        var b = p.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        p.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
        p.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
      });
      p.addEventListener('pointerleave', function () { p.style.removeProperty('--rx'); p.style.removeProperty('--ry'); });
    });
  }
})();
