/* The game player. Loads a game module, gives it a stage and a small API, and
   owns everything around the game: loading, errors, pause, results, best
   scores, on-screen touch controls and pausing when the tab is hidden.

   Game modules (games/<id>.js) export:
     create(stage, api) -> { start(), pause(), resume(), destroy() }
   and call api.end({ score, won, summary }) once when a round finishes.
   "Play again" destroys the instance and creates a fresh one. */
import { gameById, formatScore } from './catalogue.js';
import { store, reducedMotion } from './store.js';

export const COLORS = { navy: '#071827', obsidian: '#05090F', gold: '#F6C96B', ivory: '#EAF1F8', slate: '#8EA3B8', forest: '#102820', danger: '#E0663B', good: '#5FB37C' };

// Seeded random numbers (mulberry32), so a seed always builds the same level.
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

let audio = null;
function sfx(name) {
  if (!store.setting('sound')) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const tones = { tap: [520, .05, 'triangle'], point: [740, .09, 'sine'], hit: [160, .14, 'square'], jump: [420, .08, 'sine'], win: [880, .25, 'triangle'], lose: [120, .3, 'sawtooth'] };
    const [f, d, type] = tones[name] || tones.tap;
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = f; g.gain.value = .06;
    g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + d);
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + d);
  } catch (e) { /* audio unavailable */ }
}

const TOUCH = {
  lr: [['ArrowLeft', '◀', 'Left'], ['ArrowRight', '▶', 'Right']],
  dpad: [['ArrowUp', '▲', 'Up'], ['ArrowLeft', '◀', 'Left'], ['ArrowDown', '▼', 'Down'], ['ArrowRight', '▶', 'Right']],
  'dpad-fire': [['ArrowLeft', '◀', 'Turn left'], ['ArrowUp', '▲', 'Thrust'], ['ArrowRight', '▶', 'Turn right'], [' ', '●', 'Fire']],
  jump: [[' ', 'Jump', 'Jump']]
};

/* Mounts the player into `root` and runs game `id`.
   opts: { options: {...}, onExit(), onResult(result) } */
export function mountPlayer(root, id, opts = {}) {
  const g = gameById[id];
  const [W, H] = g.aspect;
  root.innerHTML = `
    <div class="pl" data-game="${g.id}">
      <header class="pl-bar">
        <button class="pl-btn" data-act="exit" aria-label="Exit game">←</button>
        <div class="pl-title"><b>${g.name}</b><span class="pl-status" aria-live="polite"></span></div>
        <div class="pl-score" aria-live="polite"><span>${g.score.label}</span><b class="pl-score-v">0</b></div>
        <button class="pl-btn" data-act="pause" aria-label="Pause">❚❚</button>
      </header>
      <div class="pl-area"><div class="pl-stage" style="aspect-ratio:${W}/${H}"></div>
        <div class="pl-overlay" hidden></div>
      </div>
      <div class="pl-touch" data-kind="${g.touch}"></div>
    </div>`;
  const $ = (s) => root.querySelector(s);
  const stage = $('.pl-stage'), overlay = $('.pl-overlay'), scoreEl = $('.pl-score-v'), statusEl = $('.pl-status');
  let inst = null, state = 'loading', lastScore = 0, mod = null, seed = (opts.options && opts.options.seed) || (Date.now() % 1e9);

  // Fit the stage inside the available area at the game's aspect ratio.
  const area = $('.pl-area');
  const fit = () => {
    const r = area.getBoundingClientRect(), k = Math.min((r.width - 24) / W, (r.height - 24) / H);
    stage.style.width = Math.floor(W * k) + 'px'; stage.style.height = Math.floor(H * k) + 'px';
  };
  const ro = new ResizeObserver(fit); ro.observe(area);

  function show(html) { overlay.innerHTML = html; overlay.hidden = false; const f = overlay.querySelector('button, a'); if (f) f.focus(); }
  function hide() { overlay.hidden = true; overlay.innerHTML = ''; }

  const api = {
    width: W, height: H, colors: COLORS, sfx, get reducedMotion() { return reducedMotion(); },
    seed, rng: () => rng(seed), options: { difficulty: 'normal', mode: 'solo', ...(opts.options || {}) },
    setScore(n) { lastScore = n; scoreEl.textContent = formatScore(g, n).replace(/ .*/, ''); },
    setStatus(t) { statusEl.textContent = t || ''; },
    // A crisp canvas at the game's logical size, scaled for the screen's pixel density.
    canvas(w = W, h = H) {
      const c = document.createElement('canvas'), dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = w * dpr; c.height = h * dpr; c.className = 'pl-canvas';
      const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
      stage.appendChild(c);
      const toLocal = (e) => { const b = c.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; return { x: (p.clientX - b.left) * w / b.width, y: (p.clientY - b.top) * h / b.height }; };
      return { canvas: c, ctx, toLocal };
    },
    // A frame loop that the player can pause; step receives seconds since the last frame.
    loop(step) {
      let raf = 0, last = 0;
      const tick = (t) => { const dt = Math.min(.05, last ? (t - last) / 1000 : 0); last = t; step(dt); raf = requestAnimationFrame(tick); };
      return { start() { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }, stop() { cancelAnimationFrame(raf); raf = 0; } };
    },
    end(result) {
      if (state !== 'playing') return;
      state = 'over';
      const r = { score: lastScore, won: false, ...result };
      api.setScore(r.score);
      // Two players on one device is a friendly match, not a personal best.
      const best = api.options.mode === 'local2p' ? false : store.record(g.id, r.score, g.score.lower);
      sfx(r.won || best ? 'win' : 'lose');
      const res = opts.onResult ? opts.onResult(r) : null;
      show(`<div class="pl-card" role="dialog" aria-labelledby="plResT">
        <p class="pl-kicker">${res && res.kicker ? res.kicker : (best ? 'New personal best' : 'Round over')}</p>
        <h2 id="plResT">${res && res.title ? res.title : (r.summary || (r.won ? 'You won!' : 'Nice run.'))}</h2>
        <p class="pl-big">${formatScore(g, r.score)} <small>${g.score.label}</small></p>
        ${res && res.note ? `<p class="pl-note">${res.note}</p>` : `<p class="pl-note">Personal best: ${formatScore(g, (store.best(g.id) || {}).score)}</p>`}
        <div class="pl-acts"><button class="dk-btn dk-gold" data-act="again">Play again</button><button class="dk-btn dk-ghost" data-act="exit">Exit</button></div>
      </div>`);
    }
  };

  async function boot() {
    state = 'loading';
    show(`<div class="pl-card pl-loading"><span class="pl-spin" aria-hidden="true"></span><p>Loading ${g.name}…</p></div>`);
    try {
      mod = mod || await import(`../games/${g.id}.js`);
      stage.innerHTML = '';
      inst = mod.create(stage, api);
      store.played(g.id);
      hide(); state = 'playing'; api.setScore(0); api.setStatus('');
      inst.start();
      stage.focus({ preventScroll: true });
    } catch (err) {
      console.warn('DigiKhelo: game failed to load', g.id, err);
      state = 'error';
      show(`<div class="pl-card"><p class="pl-kicker">Something went wrong</p><h2>${g.name} could not start.</h2>
        <p class="pl-note">Check your connection and try again. Your saved progress is safe.</p>
        <div class="pl-acts"><button class="dk-btn dk-gold" data-act="retry">Try again</button><button class="dk-btn dk-ghost" data-act="exit">Exit</button></div></div>`);
    }
  }
  function destroyInst() { try { inst && inst.destroy(); } catch (e) { /* ignore */ } inst = null; }
  function pause() {
    if (state !== 'playing') return;
    state = 'paused'; inst.pause();
    show(`<div class="pl-card" role="dialog" aria-labelledby="plPauseT"><p class="pl-kicker">Paused</p><h2 id="plPauseT">${g.name}</h2>
      <p class="pl-note">${g.controls}</p>
      <div class="pl-acts"><button class="dk-btn dk-gold" data-act="resume">Resume</button><button class="dk-btn dk-ghost" data-act="again">Restart</button><button class="dk-btn dk-ghost" data-act="exit">Exit</button></div></div>`);
  }
  function resume() { if (state !== 'paused') return; hide(); state = 'playing'; inst.resume(); }
  function exit() { cleanup(); opts.onExit && opts.onExit(); }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'exit') exit();
    else if (act === 'pause') state === 'paused' ? resume() : pause();
    else if (act === 'resume') resume();
    else if (act === 'again' || act === 'retry') { destroyInst(); boot(); }
  });
  const onKey = (e) => {
    if (e.key === 'Escape' || (e.key === 'p' && state === 'playing')) { e.preventDefault(); state === 'paused' ? resume() : pause(); }
    // Keep arrow keys and Space for the game, not page scrolling.
    if (state === 'playing' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  };
  const onVis = () => { if (document.hidden) pause(); };
  window.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVis);

  // On-screen controls send the same key events the games already listen for.
  const pad = $('.pl-touch'), keys = TOUCH[g.touch === 'lr-fire' ? 'dpad-fire' : g.touch];
  if (keys) {
    pad.innerHTML = keys.map(([k, sym, label]) => `<button type="button" class="pl-key" data-key="${k}" aria-label="${label}">${sym}</button>`).join('');
    const send = (type, key) => window.dispatchEvent(new KeyboardEvent(type, { key, code: key === ' ' ? 'Space' : key, bubbles: true }));
    pad.querySelectorAll('.pl-key').forEach((btn) => {
      const k = btn.dataset.key;
      const down = (e) => { e.preventDefault(); btn.classList.add('on'); send('keydown', k); };
      const up = (e) => { e.preventDefault(); if (btn.classList.contains('on')) { btn.classList.remove('on'); send('keyup', k); } };
      btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up);
      btn.addEventListener('pointerleave', up); btn.addEventListener('pointercancel', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  function cleanup() { destroyInst(); ro.disconnect(); window.removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onVis); root.innerHTML = ''; }
  boot();
  return { destroy: cleanup, pause, resume };
}
