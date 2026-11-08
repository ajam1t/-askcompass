/* DigiKhelo app: hash router and views. Everything runs in the browser; guest
   data lives in localStorage (see store.js). */
import { GAMES, WORLDS, gameById, worldById, gamesIn, formatScore } from './catalogue.js';
import { store, reducedMotion } from './store.js';
import { mountPlayer } from './player.js';
import { universeSVG, animateScene, worldArt } from './scene.js';
import { BIOMES, GOALS } from '../games/ai-world.js';

const main = document.getElementById('main'), playRoot = document.getElementById('dkPlay'), sheet = document.getElementById('dkSheet');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cover = (g, cls = '') => `<img class="dk-cover ${cls}" src="/digikhelo/covers/${g.id}.svg" alt="" width="400" height="300" loading="lazy" decoding="async" onerror="this.classList.add('is-missing')">`;
const worldNames = (g) => g.worlds.filter((w) => w !== 'multiplayer' || g.worlds.length === 1).map((w) => worldById[w].short).slice(0, 2).join(' · ');
const DIFFS = [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']];
const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  dice: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.4"/><circle cx="15" cy="15" r="1.4"/><circle cx="15" cy="9" r="1.4"/><circle cx="9" cy="15" r="1.4"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};

/* ───────── Daily challenge: chosen from the date, resets at local midnight ───────── */
const CHALLENGE_GAMES = GAMES.filter((g) => g.challenge);
function dayKey(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function daily(d = new Date()) {
  const n = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 864e5);
  const g = CHALLENGE_GAMES[(n * 7 + 3) % CHALLENGE_GAMES.length], level = n % 3;
  return { key: dayKey(d), game: g, difficulty: DIFFS[level][0], target: g.challenge[level], level };
}
const objective = (c) => `${c.game.score.lower ? 'Finish in' : 'Reach'} ${c.game.score.lower ? 'at most ' : ''}${formatScore(c.game, c.target)}${c.game.score.lower ? '' : ' or more'} ${c.game.score.lower ? '' : ''}`.trim() + ` in ${c.game.name} on ${DIFFS[c.level][1]}.`;
const metTarget = (g, score, target) => (g.score.lower ? score <= target : score >= target);
function untilMidnight() { const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); const s = Math.max(0, Math.floor((next - now) / 1000)); return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function streak() { let n = 0; const d = new Date(); for (;;) { const r = store.dailyResult(dayKey(d)); if (r && r.met) { n++; d.setDate(d.getDate() - 1); } else break; } return n; }

/* ───────── Shared pieces ───────── */
function gameCard(g, opts = {}) {
  const best = store.best(g.id);
  return `<li class="gc${opts.wide ? ' gc-wide' : ''}">
    <a class="gc-link" href="#/game/${g.id}" aria-label="${esc(g.name)}: details">${cover(g)}</a>
    <div class="gc-body">
      <p class="gc-tag">${esc(worldNames(g))}${g.versus ? ' · 2 players' : ''}</p>
      <h3 class="gc-name"><a href="#/game/${g.id}">${esc(g.name)}</a></h3>
      ${opts.blurb ? `<p class="gc-blurb">${esc(g.blurb)}</p>` : ''}
      ${best ? `<p class="gc-best">Best ${formatScore(g, best.score)}</p>` : ''}
    </div>
    <a class="gc-play" href="#/play/${g.id}" aria-label="Play ${esc(g.name)}">${ICON.play}</a>
  </li>`;
}
function worldPortal(w) {
  const n = w.id === 'ai' ? 'Generated' : `${gamesIn(w.id).length} games`;
  return `<li class="wp" style="--tone:${w.tone}"><a href="${w.id === 'ai' ? '#/ai' : '#/world/' + w.id}">
    <span class="wp-art">${worldArt(w.id)}</span>
    <span class="wp-body"><b>${esc(w.name)}</b><small>${esc(w.line)}</small><em>${n}</em></span></a></li>`;
}
function rail(id, title, sub, inner, more) {
  return `<section class="dk-sec" aria-labelledby="${id}"><div class="dk-wrap">
    <div class="sec-head"><div><h2 id="${id}">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${more ? `<a class="sec-more" href="${more}">View all ${ICON.arrow}</a>` : ''}</div>
    <div class="rail" data-rail><button class="rail-btn prev" type="button" aria-label="Scroll left">‹</button><ul class="rail-track">${inner}</ul><button class="rail-btn next" type="button" aria-label="Scroll right">›</button></div>
  </div></section>`;
}
function bindRails() {
  main.querySelectorAll('[data-rail]').forEach((r) => {
    const t = r.querySelector('.rail-track');
    const upd = () => { r.classList.toggle('at-start', t.scrollLeft < 8); r.classList.toggle('at-end', t.scrollLeft + t.clientWidth > t.scrollWidth - 8); };
    r.querySelector('.prev').onclick = () => t.scrollBy({ left: -t.clientWidth * .8, behavior: reducedMotion() ? 'auto' : 'smooth' });
    r.querySelector('.next').onclick = () => t.scrollBy({ left: t.clientWidth * .8, behavior: reducedMotion() ? 'auto' : 'smooth' });
    t.addEventListener('scroll', upd, { passive: true }); upd();
  });
}
function footer() {
  return `<footer class="dk-foot"><div class="dk-wrap dk-foot-in">
    <div><a class="dk-logo" href="#/"><img src="/digikhelo/art/icon.svg" width="32" height="32" alt=""><span><b>Digi<i>Khelo</i></b></span></a>
    <p>Every game here is original to DigiKhelo and runs in your browser. No account needed.</p></div>
    <nav aria-label="Footer"><a href="#/games">All games</a><a href="#/worlds">Worlds</a><a href="#/ai">AI Worlds</a><a href="#/daily">Daily challenge</a><a href="#/tournaments">Tournaments</a><a href="#/more">Settings &amp; data</a></nav>
    <p class="dk-foot-note">Your favourites, scores and progress are saved on this device only. Clearing your browser data erases them.</p>
  </div></footer>`;
}

/* ───────── Views ───────── */
let cleanup = [];
const onLeave = (fn) => cleanup.push(fn);

function home() {
  const c = daily(), done = store.dailyResult(c.key), recent = store.get().recent.map((id) => gameById[id]).filter(Boolean);
  const featured = ['sky-drift', 'asteroid-sentinel', 'penalty-strike', 'merge-tiles', 'connect-four', 'island-hopper', 'hoop-shot', 'skyline-stack', 'crystal-breaker', 'serpent-trail'].map((id) => gameById[id]);
  main.innerHTML = `
  <section class="uv" aria-labelledby="uvTitle">
    <div class="uv-scene">${universeSVG()}</div>
    <div class="uv-scrim" aria-hidden="true"></div>
    <div class="dk-wrap uv-in">
      <p class="uv-eyebrow">Your gaming universe</p>
      <h1 id="uvTitle">One World. <span>Infinite Games.</span></h1>
      <p class="uv-lead">Explore extraordinary worlds, discover new games and compete your way. No login. Just play.</p>
      <div class="uv-acts">
        <a class="dk-btn dk-gold uv-start" href="#/play/sky-drift">${ICON.play}Start Playing</a>
        <a class="dk-btn dk-ghost" href="#/games">Browse ${GAMES.length} games</a>
      </div>
      <a class="uv-scroll" href="#worldsTitle"><span aria-hidden="true"></span>Scroll to explore</a>
    </div>
  </section>
  <nav class="quick dk-wrap" aria-label="Worlds">${WORLDS.map((w) => `<a href="${w.id === 'ai' ? '#/ai' : '#/world/' + w.id}" style="--tone:${w.tone}"><span>${worldIcon(w.id)}</span>${esc(w.short)}</a>`).join('')}</nav>
  ${rail('worldsTitle', 'Explore worlds', 'Step through a portal into a different kind of play.', WORLDS.map(worldPortal).join(''), '#/worlds')}
  <section class="dk-sec dk-split" aria-label="Play now"><div class="dk-wrap split-in">
    <div class="split-main">
      <div class="sec-head"><div><h2 id="featTitle">Featured games</h2><p>Hand-picked to start with. Every one opens and plays right here.</p></div><a class="sec-more" href="#/games">All games ${ICON.arrow}</a></div>
      <div class="rail" data-rail><button class="rail-btn prev" type="button" aria-label="Scroll left">‹</button><ul class="rail-track">${featured.map((g) => gameCard(g)).join('')}</ul><button class="rail-btn next" type="button" aria-label="Scroll right">›</button></div>
    </div>
    <aside class="split-side">
      <a class="side-card dc" href="#/daily">
        <span class="side-ic">${ICON.trophy}</span>
        <span class="side-txt"><b>Daily challenge</b><small>${done && done.met ? 'Completed today. New challenge in' : esc(c.game.name) + ' · new challenge in'}</small><em class="dk-count" data-count>${untilMidnight()}</em></span>
        <span class="side-go">${ICON.arrow}</span>
      </a>
      <div class="side-card rg" id="rgCard">
        <span class="side-ic">${ICON.dice}</span>
        <span class="side-txt"><b>Random game</b><small id="rgText">Feeling lucky? Let DigiKhelo pick for you.</small></span>
        <button class="dk-btn dk-ghost rg-roll" type="button" id="rgRoll">Pick</button>
      </div>
      ${recent.length ? `<div class="side-list"><h3>Continue playing</h3><ul>${recent.slice(0, 4).map((g) => `<li><a href="#/play/${g.id}">${cover(g, 'mini')}<span><b>${esc(g.name)}</b><small>${store.best(g.id) ? 'Best ' + formatScore(g, store.best(g.id).score) : 'Pick up again'}</small></span></a></li>`).join('')}</ul></div>` : ''}
    </aside>
  </div></section>
  <section class="dk-sec ai-band" aria-labelledby="aiBand"><div class="dk-wrap ai-band-in">
    <div><p class="uv-eyebrow">AI Worlds</p><h2 id="aiBand">Choose a biome. Set a goal. A new world appears.</h2>
    <p>Pick an environment, difficulty and challenge, and DigiKhelo generates a playable world from a seed. Share the seed and a friend gets the same world.</p></div>
    <div class="ai-picks">${Object.entries(BIOMES).map(([k, b]) => `<a href="#/ai?biome=${k}" style="--a:${b.accent}"><i></i>${esc(b.name)}</a>`).join('')}</div>
  </div></section>
  ${footer()}`;
  bindRails();
  onLeave(animateScene(main.querySelector('.uv')));
  bindRandom();
  tickCountdowns();
}
function worldIcon(id) {
  const p = { action: '<path d="M13 3 6 13h5l-1 8 7-10h-5z"/>', racing: '<path d="M5 15l2-5h10l2 5M5 15h14v3H5zM8 18v1M16 18v1"/>', sports: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>', puzzle: '<path d="M9 4h6v3a2 2 0 1 0 2 2h3v6h-3a2 2 0 1 0-2 2v3H9v-3a2 2 0 1 0-2-2H4V9h3a2 2 0 1 0 2-2z"/>', adventure: '<path d="M3 19 9 7l4 7 2-3 6 8z"/>', strategy: '<path d="M8 20h8M9 17h6l-1-6h2l-1-5h-6L8 11h2z"/>', simulation: '<path d="M4 20V9l5-3v14M9 20V4l6 3v13M15 20v-9l5 2v7"/>', multiplayer: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19a5 5 0 0 1 10 0M11 19a5 5 0 0 1 10 0"/>', ai: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>' }[id];
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}
function bindRandom() {
  const btn = document.getElementById('rgRoll'), txt = document.getElementById('rgText'); if (!btn) return;
  let pick = null;
  btn.addEventListener('click', () => {
    if (pick && btn.dataset.state === 'ready') { location.hash = `#/play/${pick.id}`; return; }
    const pool = GAMES.filter((g) => !pick || g.id !== pick.id); pick = pool[Math.floor(Math.random() * pool.length)];
    txt.innerHTML = `<b class="rg-name">${esc(pick.name)}</b> · ${esc(worldNames(pick))}. <button type="button" class="linkish" id="rgAgain">Pick again</button>`;
    btn.textContent = 'Play now'; btn.dataset.state = 'ready'; btn.classList.replace('dk-ghost', 'dk-gold');
    document.getElementById('rgAgain').onclick = () => { btn.dataset.state = ''; btn.click(); };
  });
}
function tickCountdowns() {
  const id = setInterval(() => main.querySelectorAll('[data-count]').forEach((e) => { e.textContent = untilMidnight(); }), 1000);
  onLeave(() => clearInterval(id));
}

function gamesView(q = '', world = 'all') {
  main.innerHTML = `<section class="dk-page dk-wrap" aria-labelledby="gTitle">
    <header class="pg-head"><p class="uv-eyebrow">Library</p><h1 id="gTitle">All games</h1><p>${GAMES.length} original games. Search, filter by world, and play instantly.</p></header>
    <div class="filters">
      <label class="f-search"><span class="sr-only">Search games</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input id="gq" type="search" placeholder="Search by name, world or type" value="${esc(q)}" autocomplete="off"></label>
      <div class="chips" role="group" aria-label="Filter by world">${[['all', 'All'], ...WORLDS.filter((w) => w.id !== 'ai').map((w) => [w.id, w.short]), ['fav', '♥ Favourites']].map(([k, n]) => `<button type="button" class="chip" data-w="${k}" aria-pressed="${k === world}">${esc(n)}</button>`).join('')}</div>
    </div>
    <p class="g-count" id="gCount" aria-live="polite"></p>
    <ul class="g-grid" id="gGrid"></ul>
  </section>${footer()}`;
  const input = document.getElementById('gq'), grid = document.getElementById('gGrid'), count = document.getElementById('gCount');
  let w = world;
  const render = () => {
    const s = input.value.trim().toLowerCase();
    const list = GAMES.filter((g) => (w === 'all' || (w === 'fav' ? store.isFavourite(g.id) : g.worlds.includes(w))) &&
      (!s || [g.name, g.blurb, ...g.worlds.map((x) => worldById[x].name)].join(' ').toLowerCase().includes(s)));
    grid.innerHTML = list.length ? list.map((g) => gameCard(g, { blurb: true })).join('') : `<li class="empty"><b>No games match${s ? ` “${esc(input.value)}”` : ''}.</b><span>${w === 'fav' ? 'Tap the heart on any game to keep it here.' : 'Try another word or clear the filter.'}</span><button type="button" class="dk-btn dk-ghost" id="gClear">Show all games</button></li>`;
    count.textContent = `${list.length} of ${GAMES.length} games`;
    const clr = document.getElementById('gClear'); if (clr) clr.onclick = () => { input.value = ''; w = 'all'; main.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.w === 'all'))); render(); };
  };
  input.addEventListener('input', render);
  main.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => { w = c.dataset.w; main.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x === c))); render(); }));
  render();
  if (q) input.focus();
}

function gameView(id) {
  const g = gameById[id]; if (!g) return notFound();
  const best = store.best(g.id), plays = store.get().plays[g.id] || 0, fav = store.isFavourite(g.id);
  const related = GAMES.filter((x) => x.id !== g.id && x.worlds.some((w) => g.worlds.includes(w))).slice(0, 6);
  main.innerHTML = `<section class="gd" aria-labelledby="gdTitle"><div class="gd-bg">${cover(g)}</div><div class="dk-wrap gd-in">
    <div class="gd-art">${cover(g)}</div>
    <div class="gd-copy">
      <p class="gd-tags">${g.worlds.map((w) => `<a href="#/world/${w}">${esc(worldById[w].name)}</a>`).join('')}</p>
      <h1 id="gdTitle">${esc(g.name)}</h1>
      <p class="gd-blurb">${esc(g.blurb)}</p>
      <div class="gd-opts">
        ${g.generated ? '' : `<fieldset class="seg"><legend>Difficulty</legend>${DIFFS.map(([k, n]) => `<label><input type="radio" name="gdD" value="${k}"${k === 'normal' ? ' checked' : ''}><span>${n}</span></label>`).join('')}</fieldset>`}
        ${g.versus ? `<fieldset class="seg"><legend>Opponent</legend><label><input type="radio" name="gdM" value="solo" checked><span>Computer</span></label><label><input type="radio" name="gdM" value="local2p"><span>2 players, this device</span></label></fieldset>` : ''}
      </div>
      <div class="gd-acts">
        <a class="dk-btn dk-gold gd-play" id="gdPlay" href="${g.generated ? '#/ai' : '#/play/' + g.id}">${ICON.play}${g.generated ? 'Set up a world' : 'Play now'}</a>
        <button class="dk-btn dk-ghost gd-fav" type="button" aria-pressed="${fav}" id="gdFav">${ICON.heart}<span>${fav ? 'Saved' : 'Favourite'}</span></button>
      </div>
      <dl class="gd-facts">
        <div><dt>Controls</dt><dd>${esc(g.controls)}</dd></div>
        <div><dt>Your best</dt><dd>${best ? formatScore(g, best.score) : 'Not played yet'}</dd></div>
        <div><dt>Played on this device</dt><dd>${plays} ${plays === 1 ? 'time' : 'times'}</dd></div>
      </dl>
    </div></div></section>
    ${related.length ? rail('relTitle', 'More like this', '', related.map((x) => gameCard(x)).join('')) : ''}${footer()}`;
  const play = document.getElementById('gdPlay');
  const upd = () => {
    if (g.generated) return;
    const d = (main.querySelector('input[name=gdD]:checked') || {}).value || 'normal', m = (main.querySelector('input[name=gdM]:checked') || {}).value || 'solo';
    play.href = `#/play/${g.id}?d=${d}${g.versus ? '&m=' + m : ''}`;
  };
  main.querySelectorAll('.gd-opts input').forEach((i) => i.addEventListener('change', upd)); upd();
  document.getElementById('gdFav').addEventListener('click', (e) => { const on = store.toggleFavourite(g.id); e.currentTarget.setAttribute('aria-pressed', String(on)); e.currentTarget.querySelector('span').textContent = on ? 'Saved' : 'Favourite'; });
  bindRails();
}

function worldsView() {
  main.innerHTML = `<section class="dk-page dk-wrap" aria-labelledby="wTitle">
    <header class="pg-head"><p class="uv-eyebrow">Worlds</p><h1 id="wTitle">Choose a world</h1><p>Each world gathers games with its own personality. Step in and play.</p></header>
    <ul class="w-grid">${WORLDS.map((w) => `<li class="wb" style="--tone:${w.tone}"><a href="${w.id === 'ai' ? '#/ai' : '#/world/' + w.id}">
      <span class="wp-art">${worldArt(w.id)}</span><span class="wb-body"><small>${w.id === 'ai' ? 'Generated worlds' : gamesIn(w.id).length + ' games'}</small><b>${esc(w.name)}</b><span>${esc(w.blurb)}</span></span></a></li>`).join('')}</ul>
  </section>${footer()}`;
}

function worldView(id) {
  const w = worldById[id]; if (!w) return notFound(); if (id === 'ai') { location.replace('#/ai'); return; }
  const list = gamesIn(id);
  main.innerHTML = `<section class="wv" style="--tone:${w.tone}" aria-labelledby="wvTitle"><div class="wv-art">${worldArt(id)}</div><div class="wv-scrim"></div>
    <div class="dk-wrap wv-in"><p class="uv-eyebrow"><a href="#/worlds">Worlds</a> · ${esc(w.short)}</p><h1 id="wvTitle">${esc(w.name)}</h1><p class="wv-line">${esc(w.blurb)}</p>
    <div class="uv-acts"><a class="dk-btn dk-gold" href="#/play/${list[0].id}${id === 'multiplayer' ? '?m=local2p' : ''}">${ICON.play}Play ${esc(list[0].name)}</a></div></div></section>
    <section class="dk-sec"><div class="dk-wrap">${id === 'multiplayer' ? '<p class="note">These games are for two players sharing one device. Online multiplayer is not available yet.</p>' : ''}
      <ul class="g-grid">${list.map((g) => gameCard(g, { blurb: true })).join('')}</ul></div></section>${footer()}`;
}

function aiView(params) {
  const sel = { biome: BIOMES[params.biome] ? params.biome : 'forest', goal: GOALS[params.goal] ? params.goal : 'collect', d: ['easy', 'normal', 'hard'].includes(params.d) ? params.d : 'normal', seed: params.seed && /^\d{1,9}$/.test(params.seed) ? params.seed : String(Math.floor(Math.random() * 1e6)) };
  main.innerHTML = `<section class="dk-page dk-wrap ai" aria-labelledby="aiTitle">
    <header class="pg-head"><p class="uv-eyebrow">AI Worlds</p><h1 id="aiTitle">Generate a world</h1><p>Choose an environment, a goal and a difficulty. DigiKhelo carves a new playable world from a seed, places crystals, drones and portals where they can be reached, and drops you in.</p></header>
    <form class="ai-form" id="aiForm">
      <fieldset class="ai-set"><legend>1 · Environment</legend><div class="ai-biomes">${Object.entries(BIOMES).map(([k, b]) => `<label class="ai-biome" style="--a:${b.accent};--w1:${b.wall[1]};--f0:${b.floor[0]}"><input type="radio" name="biome" value="${k}"${k === sel.biome ? ' checked' : ''}><span class="ai-sw"><i></i><i></i><i></i></span><b>${esc(b.name)}</b></label>`).join('')}</div></fieldset>
      <fieldset class="ai-set"><legend>2 · Goal</legend><div class="ai-goals">${Object.entries(GOALS).map(([k, g]) => `<label class="ai-goal"><input type="radio" name="goal" value="${k}"${k === sel.goal ? ' checked' : ''}><b>${esc(g.name)}</b><small>${esc(g.line)}</small></label>`).join('')}</div></fieldset>
      <div class="ai-row">
        <fieldset class="seg"><legend>3 · Difficulty</legend>${DIFFS.map(([k, n]) => `<label><input type="radio" name="d" value="${k}"${k === sel.d ? ' checked' : ''}><span>${n}</span></label>`).join('')}</fieldset>
        <div class="ai-seed"><label for="aiSeed">4 · Seed</label><div><input id="aiSeed" name="seed" inputmode="numeric" pattern="\\d{1,9}" maxlength="9" value="${esc(sel.seed)}"><button type="button" class="dk-btn dk-ghost" id="aiRoll">New seed</button></div></div>
      </div>
      <div class="ai-acts"><button class="dk-btn dk-gold" type="submit">${ICON.play}Generate and play</button><button class="dk-btn dk-ghost" type="button" id="aiShare">Copy world link</button><span class="ai-msg" id="aiMsg" aria-live="polite"></span></div>
      <p class="note">Worlds are built procedurally from your settings and the seed, so the same seed always builds the same world. This is a generator for one game engine, not a fully AI-generated 3D game.</p>
    </form>
  </section>${footer()}`;
  const form = document.getElementById('aiForm');
  const val = () => { const fd = new FormData(form); return { biome: fd.get('biome'), goal: fd.get('goal'), d: fd.get('d'), seed: String(fd.get('seed') || '').replace(/\D/g, '').slice(0, 9) || '1' }; };
  const link = (v) => `#/play/ai-world?biome=${v.biome}&goal=${v.goal}&d=${v.d}&seed=${v.seed}`;
  document.getElementById('aiRoll').onclick = () => { document.getElementById('aiSeed').value = String(Math.floor(Math.random() * 1e6)); };
  form.addEventListener('submit', (e) => { e.preventDefault(); location.hash = link(val()); });
  document.getElementById('aiShare').onclick = async () => {
    const url = location.origin + location.pathname + link(val()), msg = document.getElementById('aiMsg');
    try { await navigator.clipboard.writeText(url); msg.textContent = 'Link copied. Anyone who opens it gets this exact world.'; } catch (e) { msg.textContent = url; }
  };
}

function dailyView() {
  const c = daily(), r = store.dailyResult(c.key);
  const past = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); const x = daily(d), res = store.dailyResult(x.key); return { x, res, label: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) }; });
  main.innerHTML = `<section class="dk-page dk-wrap dl" aria-labelledby="dlTitle">
    <header class="pg-head"><p class="uv-eyebrow">Daily challenge · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 id="dlTitle">Today’s challenge</h1></header>
    <div class="dl-card">
      <div class="dl-art">${cover(c.game)}</div>
      <div class="dl-body">
        <p class="dl-k">${esc(c.game.name)} · ${DIFFS[c.level][1]}</p>
        <h2>${esc(objective(c))}</h2>
        <p class="dl-state">${r ? (r.met ? `Completed with ${formatScore(c.game, r.score)}. Come back tomorrow for a new one.` : `Best attempt today: ${formatScore(c.game, r.score)}. Try again.`) : 'Not attempted yet. You can try as many times as you like.'}</p>
        <div class="uv-acts"><a class="dk-btn dk-gold" href="#/play/${c.game.id}?d=${c.difficulty}&daily=1">${ICON.play}${r ? 'Play again' : 'Start challenge'}</a></div>
        <p class="dl-reset">New challenge in <b class="dk-count" data-count>${untilMidnight()}</b> (midnight, your time) · Streak: <b>${streak()} ${streak() === 1 ? 'day' : 'days'}</b></p>
      </div>
    </div>
    <h2 class="dl-h">This week on this device</h2>
    <ol class="dl-week">${past.map((p) => `<li class="${p.res ? (p.res.met ? 'met' : 'tried') : ''}"><span>${p.label}</span><b>${esc(p.x.game.name)}</b><small>${p.res ? (p.res.met ? 'Completed' : 'Attempted') : '—'}</small></li>`).join('')}</ol>
    <p class="note">Challenges are chosen from the date, so everyone gets the same one each day. Results are saved on this device only; there is no global ranking.</p>
  </section>${footer()}`;
  tickCountdowns();
}

function multiplayerView() {
  const list = GAMES.filter((g) => g.versus);
  main.innerHTML = `<section class="dk-page dk-wrap" aria-labelledby="mpTitle">
    <header class="pg-head"><p class="uv-eyebrow">Multiplayer Nexus</p><h1 id="mpTitle">Play together, on one screen</h1><p>Challenge a friend on the same device, or take on the computer. Online multiplayer is not available yet.</p></header>
    <ul class="mp-list">${list.map((g) => `<li>${cover(g)}<div><h2>${esc(g.name)}</h2><p>${esc(g.blurb)}</p><p class="mp-ctl">${esc(g.controls)}</p>
      <div class="uv-acts"><a class="dk-btn dk-gold" href="#/play/${g.id}?m=local2p">2 players</a><a class="dk-btn dk-ghost" href="#/play/${g.id}?m=solo">vs Computer</a></div></div></li>`).join('')}</ul>
  </section>${footer()}`;
}

function tournamentsView() {
  const rows = GAMES.filter((g) => store.best(g.id)).sort((a, b) => store.best(b.id).at - store.best(a.id).at);
  main.innerHTML = `<section class="dk-page dk-wrap" aria-labelledby="tTitle">
    <header class="pg-head"><p class="uv-eyebrow">Tournaments</p><h1 id="tTitle">Your personal ladder</h1><p>Online tournaments need verified scores and are not live yet. Until then, chase your own records and the daily challenge.</p></header>
    <div class="t-top"><a class="side-card dc" href="#/daily"><span class="side-ic">${ICON.trophy}</span><span class="side-txt"><b>Daily challenge</b><small>Streak ${streak()} · new challenge in</small><em class="dk-count" data-count>${untilMidnight()}</em></span><span class="side-go">${ICON.arrow}</span></a></div>
    ${rows.length ? `<table class="t-table"><caption class="sr-only">Your best results on this device</caption><thead><tr><th scope="col">Game</th><th scope="col">Best</th><th scope="col">Set</th><th scope="col"><span class="sr-only">Play</span></th></tr></thead><tbody>
      ${rows.map((g) => `<tr><th scope="row">${esc(g.name)}</th><td>${formatScore(g, store.best(g.id).score)}</td><td>${new Date(store.best(g.id).at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td><td><a class="dk-btn dk-ghost t-play" href="#/play/${g.id}">Beat it</a></td></tr>`).join('')}</tbody></table>`
      : `<div class="empty"><b>No records yet.</b><span>Play any game and your best result appears here.</span><a class="dk-btn dk-gold" href="#/games">Find a game</a></div>`}
  </section>${footer()}`;
  tickCountdowns();
}

function createView() {
  const list = GAMES.filter((g) => g.challenge);
  main.innerHTML = `<section class="dk-page dk-wrap" aria-labelledby="crTitle">
    <header class="pg-head"><p class="uv-eyebrow">Create</p><h1 id="crTitle">Create a challenge</h1><p>Pick a game, set a target and a difficulty, and share the link. Whoever opens it plays your challenge. Want a whole new world instead? <a href="#/ai">Generate one in AI Worlds</a>.</p></header>
    <form class="cr" id="crForm">
      <label class="cr-f"><span>Game</span><select id="crGame">${list.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></label>
      <label class="cr-f"><span id="crTargetL">Target</span><input id="crTarget" type="number" min="1" step="1" inputmode="numeric"></label>
      <fieldset class="seg"><legend>Difficulty</legend>${DIFFS.map(([k, n]) => `<label><input type="radio" name="crD" value="${k}"${k === 'normal' ? ' checked' : ''}><span>${n}</span></label>`).join('')}</fieldset>
      <p class="cr-preview" id="crPrev"></p>
      <div class="ai-acts"><button class="dk-btn dk-gold" type="submit">${ICON.play}Try it now</button><button class="dk-btn dk-ghost" type="button" id="crCopy">Copy challenge link</button><span class="ai-msg" id="crMsg" aria-live="polite"></span></div>
    </form>
  </section>${footer()}`;
  const game = document.getElementById('crGame'), target = document.getElementById('crTarget'), prev = document.getElementById('crPrev');
  const d = () => main.querySelector('input[name=crD]:checked').value;
  const sync = (reset) => { const g = gameById[game.value]; if (reset) target.value = g.challenge[1]; document.getElementById('crTargetL').textContent = `Target (${g.score.label.toLowerCase()}${g.score.unit ? ', ' + g.score.unit : ''})`;
    prev.textContent = `${g.score.lower ? 'Finish' : 'Reach'} ${g.score.lower ? 'within ' : ''}${formatScore(g, +target.value || 0)} in ${g.name} on ${d()}.`; };
  const link = () => `#/play/${game.value}?d=${d()}&target=${Math.max(1, Math.round(+target.value || 1))}`;
  game.onchange = () => sync(true); target.oninput = () => sync(false); main.querySelectorAll('input[name=crD]').forEach((i) => { i.onchange = () => sync(false); });
  document.getElementById('crForm').onsubmit = (e) => { e.preventDefault(); location.hash = link(); };
  document.getElementById('crCopy').onclick = async () => { const url = location.origin + location.pathname + link(), m = document.getElementById('crMsg'); try { await navigator.clipboard.writeText(url); m.textContent = 'Link copied.'; } catch (e) { m.textContent = url; } };
  sync(true);
}

function moreView() {
  const s = store.get(), favs = s.favourites.map((id) => gameById[id]).filter(Boolean), recent = s.recent.map((id) => gameById[id]).filter(Boolean);
  main.innerHTML = `<section class="dk-page dk-wrap more" aria-labelledby="moTitle">
    <header class="pg-head"><p class="uv-eyebrow">More</p><h1 id="moTitle">Your corner</h1><p>Favourites, history and settings. Everything here is stored on this device as a guest; no account needed.</p></header>
    <nav class="mo-links" aria-label="More pages"><a href="#/daily">${ICON.trophy}Daily challenge</a><a href="#/multiplayer">Multiplayer</a><a href="#/tournaments">Tournaments</a><a href="#/create">Create a challenge</a><a href="#/worlds">All worlds</a></nav>
    <h2 class="mo-h">Favourites</h2>${favs.length ? `<ul class="g-grid g-compact">${favs.map((g) => gameCard(g)).join('')}</ul>` : '<p class="muted">No favourites yet. Tap the heart on a game’s page to save it here.</p>'}
    <h2 class="mo-h">Recently played</h2>${recent.length ? `<ul class="g-grid g-compact">${recent.slice(0, 8).map((g) => gameCard(g)).join('')}</ul>` : '<p class="muted">Games you play will show up here.</p>'}
    <h2 class="mo-h">Settings</h2>${settingsForm()}
  </section>${footer()}`;
  bindSettings(main);
}
function settingsForm() {
  const s = store.get().settings;
  return `<div class="set">
    <label class="set-row"><span><b>Sound effects</b><small>Short tones for hits, points and wins.</small></span><input type="checkbox" class="sw" data-set="sound"${s.sound ? ' checked' : ''}></label>
    <fieldset class="set-row"><legend><b>Motion</b><small>Background animation on the homepage.</small></legend><div class="seg seg-inline">${[['auto', 'Follow device'], ['reduce', 'Reduced'], ['full', 'Full']].map(([k, n]) => `<label><input type="radio" name="motion" value="${k}"${s.motion === k ? ' checked' : ''}><span>${n}</span></label>`).join('')}</div></fieldset>
    <div class="set-row"><span><b>Your data</b><small>Favourites, recent games, best scores and daily results are kept in this browser. Clearing your browser data erases them.</small></span><button type="button" class="dk-btn dk-ghost" data-clear>Clear my data</button></div>
  </div>`;
}
function bindSettings(root) {
  root.querySelectorAll('[data-set]').forEach((i) => i.addEventListener('change', () => store.setting(i.dataset.set, i.checked)));
  root.querySelectorAll('input[name=motion]').forEach((i) => i.addEventListener('change', () => { store.setting('motion', i.value); applyMotion(); }));
  const c = root.querySelector('[data-clear]');
  if (c) c.addEventListener('click', () => { if (confirm('Clear your favourites, history, best scores and daily results on this device?')) { store.clear(); applyMotion(); route(); } });
}
function applyMotion() { document.documentElement.classList.toggle('dk-still', reducedMotion()); }

function notFound() {
  main.innerHTML = `<section class="dk-page dk-wrap"><header class="pg-head"><p class="uv-eyebrow">Lost in space</p><h1>That page drifted away.</h1><p>The link may be old. Head back to the universe or browse the games.</p></header><div class="uv-acts"><a class="dk-btn dk-gold" href="#/">Back home</a><a class="dk-btn dk-ghost" href="#/games">All games</a></div></section>${footer()}`;
}

/* ───────── Settings sheet (header gear) ───────── */
function openSettings() {
  sheet.innerHTML = `<div class="sh-back" data-close></div><div class="sh-card" role="dialog" aria-modal="true" aria-labelledby="shTitle"><div class="sh-head"><h2 id="shTitle">Settings</h2><button type="button" class="pl-btn" data-close aria-label="Close settings">✕</button></div>${settingsForm()}</div>`;
  sheet.hidden = false; bindSettings(sheet);
  const prevFocus = document.activeElement; sheet.querySelector('.sh-card button').focus();
  const close = () => { sheet.hidden = true; sheet.innerHTML = ''; document.removeEventListener('keydown', onKey); prevFocus && prevFocus.focus(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  sheet.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
}

/* ───────── Router ───────── */
let player = null;
function closePlayer() { if (player) { player.destroy(); player = null; } playRoot.hidden = true; document.body.classList.remove('is-playing'); }
function parse() {
  const raw = location.hash.slice(1) || '/', [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), params: Object.fromEntries(new URLSearchParams(qs || '')) };
}
function playRoute(id, p) {
  const g = gameById[id];
  const options = { difficulty: ['easy', 'normal', 'hard'].includes(p.d) ? p.d : 'normal', mode: p.m === 'local2p' ? 'local2p' : 'solo' };
  if (g.generated) Object.assign(options, { biome: p.biome, goal: p.goal, seed: /^\d{1,9}$/.test(p.seed || '') ? +p.seed : Math.floor(Math.random() * 1e6) });
  const c = daily(), isDaily = p.daily === '1' && c.game.id === id;
  const target = isDaily ? c.target : (/^\d{1,7}$/.test(p.target || '') ? +p.target : null);
  if (isDaily) options.difficulty = c.difficulty;
  closePlayer();
  playRoot.hidden = false; document.body.classList.add('is-playing');
  player = mountPlayer(playRoot, id, {
    options,
    onExit: () => { if (history.length > 1 && sessionStorage.getItem('dk.nav')) history.back(); else location.hash = '#/game/' + id; },
    onResult: (r) => {
      if (target === null) return null;
      const met = metTarget(g, r.score, target);
      if (isDaily) { const prev = store.dailyResult(c.key); const better = !prev || (!prev.met && met) || (g.score.lower ? r.score < prev.score : r.score > prev.score); if (better) store.setDaily(c.key, { score: r.score, met: met || (prev && prev.met) }); }
      return { kicker: isDaily ? 'Daily challenge' : 'Your challenge', title: met ? 'Challenge complete!' : 'Not quite this time', note: `Target: ${formatScore(g, target)}. ${met ? (isDaily ? `Streak: ${streak()} ${streak() === 1 ? 'day' : 'days'}.` : 'Nicely done.') : 'Play again to try once more.'}` };
    }
  });
  if (target !== null) setTimeout(() => { const st = playRoot.querySelector('.pl-status'); if (st && !st.textContent) st.textContent = `Target ${formatScore(g, target)}`; }, 50);
}
export function route() {
  cleanup.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } }); cleanup = [];
  const { parts, params } = parse(), [view, arg] = parts;
  if (view === 'play' && gameById[arg]) { playRoute(arg, params); return; }
  closePlayer();
  const tab = { worlds: 'worlds', world: 'worlds', games: 'games', game: 'games', ai: 'ai', more: 'more', daily: 'more', multiplayer: 'more', tournaments: 'more', create: 'more' }[view] || (view ? '' : 'home');
  document.querySelectorAll('[data-tab]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.tab === tab) || (a.dataset.tab === tab && a.setAttribute('aria-current', 'page')));
  document.querySelectorAll('[data-nav]').forEach((a) => { if (a.dataset.nav === view || (view === 'world' && a.dataset.nav === 'worlds') || (view === 'game' && a.dataset.nav === 'games')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.body.dataset.view = view || 'home';
  const titles = { games: 'All games', game: (gameById[arg] || {}).name, worlds: 'Worlds', world: (worldById[arg] || {}).name, ai: 'AI Worlds', daily: 'Daily challenge', multiplayer: 'Multiplayer', tournaments: 'Tournaments', create: 'Create', more: 'More' };
  document.title = view && titles[view] ? `${titles[view]} · DigiKhelo` : 'DigiKhelo · One World. Infinite Games.';
  const views = { games: () => gamesView(params.q || '', params.w || 'all'), game: () => gameView(arg), worlds: worldsView, world: () => worldView(arg), ai: () => aiView(params), daily: dailyView, multiplayer: multiplayerView, tournaments: tournamentsView, create: createView, more: moreView };
  (view ? views[view] || notFound : home)();
  window.scrollTo(0, 0);
  if (view) main.focus({ preventScroll: true });
}

// Header search: type to filter the games library.
const q = document.getElementById('dkQ');
document.getElementById('dkSearch').addEventListener('submit', (e) => { e.preventDefault(); location.hash = `#/games?q=${encodeURIComponent(q.value)}`; });
q.addEventListener('input', () => { const gq = document.getElementById('gq'); if (gq && document.body.dataset.view === 'games') { gq.value = q.value; gq.dispatchEvent(new Event('input')); } });
q.addEventListener('focus', () => { if (document.body.dataset.view !== 'games') location.hash = `#/games?q=${encodeURIComponent(q.value)}`; setTimeout(() => q.focus(), 0); });
document.getElementById('dkSearchBtn').addEventListener('click', () => { location.hash = '#/games?q='; setTimeout(() => { const gq = document.getElementById('gq'); gq && gq.focus(); }, 30); });
document.getElementById('dkSettingsBtn').addEventListener('click', openSettings);
// Remember that the visitor navigated inside the app, so "Exit" can go back.
window.addEventListener('hashchange', () => { sessionStorage.setItem('dk.nav', '1'); route(); });
const head = document.getElementById('dkHead');
window.addEventListener('scroll', () => head.classList.toggle('is-solid', window.scrollY > 40), { passive: true });
applyMotion();
route();
