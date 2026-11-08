/* Generated World: a top-down world built from a seed and the player's settings.
   options: { biome: 'forest'|'desert'|'ice'|'ember'|'space', goal: 'collect'|'race'|'survive', difficulty, seed }
   The map is carved with cellular automata, unreachable pockets are filled in, and
   crystals, drones and the exit portal are placed only on reachable tiles, so every
   generated world can be completed. */
export const BIOMES = {
  forest: { name: 'Verdant Isles', floor: ['#10281F', '#133126'], wall: ['#1E4A33', '#2F6B4A'], accent: '#7BD389', drone: '#E0663B' },
  desert: { name: 'Amber Dunes', floor: ['#2A1E10', '#332513'], wall: ['#7A5527', '#A9773A'], accent: '#F6C96B', drone: '#E0663B' },
  ice: { name: 'Glacier Reach', floor: ['#0E2233', '#12293C'], wall: ['#3C6F93', '#7FB3D6'], accent: '#BFE7FF', drone: '#E0663B' },
  ember: { name: 'Ember Forge', floor: ['#1E0E0C', '#251210'], wall: ['#5A2216', '#8E3A22'], accent: '#FFB37A', drone: '#F6C96B' },
  space: { name: 'Void Station', floor: ['#070B16', '#0B1222'], wall: ['#24345A', '#3D5590'], accent: '#C8B6FF', drone: '#E0663B' }
};
export const GOALS = {
  collect: { name: 'Crystal hunt', line: 'Collect every crystal. Drones cost a life.' },
  race: { name: 'Portal race', line: 'Reach the portal before the clock runs out.' },
  survive: { name: 'Drone storm', line: 'Stay alive until the timer ends. Crystals add points.' }
};

export function create(stage, api) {
  const W = api.width, H = api.height, N = 20, T = W / N;
  const { canvas, ctx } = api.canvas();
  const o = { biome: 'forest', goal: 'collect', ...api.options };
  const B = BIOMES[o.biome] || BIOMES.forest, goal = GOALS[o.goal] ? o.goal : 'collect';
  const D = { easy: { drones: 2, speed: 60, time: 1.4, crystals: 6 }, normal: { drones: 4, speed: 80, time: 1, crystals: 9 }, hard: { drones: 6, speed: 105, time: .78, crystals: 12 } }[o.difficulty] || { drones: 4, speed: 80, time: 1, crystals: 9 };
  const rand = api.rng();
  let grid, player, crystals, drones, portal, lives, collected, timeLeft, elapsed, phase, keys = {}, ended = false, flash = 0, endTimer = 0;

  // ── Generation ──
  function generate() {
    for (let attempt = 0; attempt < 20; attempt++) {
      let g = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => (x === 0 || y === 0 || x === N - 1 || y === N - 1) ? 1 : rand() < .4 ? 1 : 0));
      for (let it = 0; it < 4; it++) {
        g = g.map((row, y) => row.map((v, x) => {
          if (x === 0 || y === 0 || x === N - 1 || y === N - 1) return 1;
          let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && g[y + dy][x + dx]) n++;
          return n >= 5 ? 1 : n <= 2 ? 0 : v;
        }));
      }
      // Keep only the largest open region.
      const seen = Array.from({ length: N }, () => Array(N).fill(-1)); const regions = [];
      for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) if (!g[y][x] && seen[y][x] < 0) {
        const cells = [], q = [[x, y]]; seen[y][x] = regions.length;
        while (q.length) { const [cx, cy] = q.pop(); cells.push([cx, cy]); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = cx + dx, ny = cy + dy; if (!g[ny][nx] && seen[ny][nx] < 0) { seen[ny][nx] = regions.length; q.push([nx, ny]); } }); }
        regions.push(cells);
      }
      regions.sort((a, b) => b.length - a.length);
      if (!regions.length || regions[0].length < N * N * .38) continue;
      const keep = new Set(regions[0].map(([x, y]) => y * N + x));
      g = g.map((row, y) => row.map((v, x) => keep.has(y * N + x) ? 0 : 1));
      return { g, open: regions[0] };
    }
    // Fallback: an open arena with a few pillars.
    const g = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => (x === 0 || y === 0 || x === N - 1 || y === N - 1 || (x % 5 === 0 && y % 5 === 0)) ? 1 : 0));
    const open = []; g.forEach((r, y) => r.forEach((v, x) => { if (!v) open.push([x, y]); }));
    return { g, open };
  }
  // Breadth-first distances from a tile, used to place the portal far away and crystals spread out.
  function distances(sx, sy) {
    const d = Array.from({ length: N }, () => Array(N).fill(Infinity)); d[sy][sx] = 0; const q = [[sx, sy]];
    for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (!grid[ny][nx] && d[ny][nx] === Infinity) { d[ny][nx] = d[y][x] + 1; q.push([nx, ny]); } }); }
    return d;
  }

  function reset() {
    const gen = generate(); grid = gen.g;
    const pick = () => gen.open.splice(Math.floor(rand() * gen.open.length), 1)[0];
    const start = gen.open.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]))[0]; gen.open.shift();
    player = { x: (start[0] + .5) * T, y: (start[1] + .5) * T, r: T * .32, inv: 0 };
    const dist = distances(start[0], start[1]);
    const far = gen.open.slice().sort((a, b) => dist[b[1]][b[0]] - dist[a[1]][a[0]]);
    portal = goal === 'race' ? { x: (far[0][0] + .5) * T, y: (far[0][1] + .5) * T } : null;
    if (portal) gen.open.splice(gen.open.indexOf(far[0]), 1);
    const nc = goal === 'race' ? 5 : D.crystals;
    crystals = [];
    for (let i = 0; i < nc && gen.open.length; i++) { const c = pick(); if (dist[c[1]][c[0]] < 3) { i--; continue; } crystals.push({ x: (c[0] + .5) * T, y: (c[1] + .5) * T, t: rand() * 6 }); }
    drones = [];
    const nd = D.drones + (goal === 'survive' ? 1 : 0);
    for (let i = 0; i < nd && gen.open.length; i++) { const c = pick(); if (dist[c[1]][c[0]] < 6) { i--; if (gen.open.length < 10) break; continue; } const a = rand() * Math.PI * 2; drones.push({ x: (c[0] + .5) * T, y: (c[1] + .5) * T, vx: Math.cos(a), vy: Math.sin(a) }); }
    lives = 3; collected = 0; elapsed = 0; phase = 'ready'; ended = false;
    const baseTime = goal === 'race' ? 10 + dist[far[0][1]][far[0][0]] * .55 : goal === 'survive' ? 60 : 90;
    timeLeft = Math.round(baseTime * (goal === 'survive' ? 1 : D.time));
    status();
  }
  const wall = (px, py) => { const x = Math.floor(px / T), y = Math.floor(py / T); return x < 0 || y < 0 || x >= N || y >= N || grid[y][x] === 1; };
  const blocked = (x, y, r) => wall(x - r, y - r) || wall(x + r, y - r) || wall(x - r, y + r) || wall(x + r, y + r);

  function score() {
    if (goal === 'collect') return collected * 100 + (crystals.length === 0 ? Math.max(0, Math.round(timeLeft)) * 10 : 0);
    if (goal === 'race') return collected * 50 + (phase === 'won' ? Math.round(timeLeft) * 20 + 200 : 0);
    return Math.floor(elapsed) * 10 + collected * 50;
  }
  function status() {
    const t = Math.max(0, Math.ceil(timeLeft));
    api.setStatus(goal === 'collect' ? `Crystals ${collected}/${collected + crystals.length} · Lives ${lives} · ${t}s`
      : goal === 'race' ? `Reach the portal · ${t}s left` : `Survive ${t}s · Lives ${lives}`);
    api.setScore(score());
  }
  function finish(won, summary) {
    if (ended) return; ended = true; phase = won ? 'won' : 'lost'; status();
    api.sfx(won ? 'win' : 'lose');
    endTimer = setTimeout(() => api.end({ score: score(), won, summary }), 500);
  }

  function update(dt) {
    if (phase !== 'play') return;
    elapsed += dt; timeLeft -= dt; flash = Math.max(0, flash - dt);
    const sp = 170, dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0), m = Math.hypot(dx, dy) || 1;
    const nx = player.x + dx / m * sp * dt, ny = player.y + dy / m * sp * dt;
    if (!blocked(nx, player.y, player.r)) player.x = nx;
    if (!blocked(player.x, ny, player.r)) player.y = ny;
    player.inv = Math.max(0, player.inv - dt);
    const dsp = D.speed * (goal === 'survive' ? 1 + elapsed / 60 : 1);
    drones.forEach((d) => {
      let x = d.x + d.vx * dsp * dt, y = d.y + d.vy * dsp * dt;
      if (blocked(x, d.y, T * .3)) { d.vx *= -1; x = d.x; } if (blocked(d.x, y, T * .3)) { d.vy *= -1; y = d.y; }
      d.x = x; d.y = y;
      if (player.inv <= 0 && Math.hypot(d.x - player.x, d.y - player.y) < player.r + T * .3) {
        lives--; player.inv = 1.4; flash = .3; api.sfx('hit');
        if (lives <= 0) finish(false, goal === 'race' ? 'Caught by a drone' : 'Out of lives');
      }
    });
    crystals = crystals.filter((c) => { if (Math.hypot(c.x - player.x, c.y - player.y) < player.r + 10) { collected++; api.sfx('point'); return false; } return true; });
    if (goal === 'collect' && crystals.length === 0) finish(true, 'Every crystal collected!');
    if (goal === 'race' && portal && Math.hypot(portal.x - player.x, portal.y - player.y) < T * .55) finish(true, 'Through the portal!');
    if (timeLeft <= 0) finish(goal === 'survive', goal === 'survive' ? 'You survived the storm!' : 'Out of time');
    status();
  }

  function draw(t) {
    ctx.fillStyle = B.floor[0]; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (grid[y][x]) {
        // Only walls that border open ground are raised; deep rock stays dark so paths read clearly.
        const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => grid[y + dy] && grid[y + dy][x + dx] === 0);
        if (edge) {
          const g = ctx.createLinearGradient(0, y * T, 0, y * T + T); g.addColorStop(0, B.wall[1]); g.addColorStop(1, B.wall[0]);
          ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x * T + 1, y * T + 1, T - 2, T - 2, 7); ctx.fill();
        } else { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x * T, y * T, T, T); }
      } else if ((x + y) % 2) { ctx.fillStyle = B.floor[1]; ctx.fillRect(x * T, y * T, T, T); }
    }
    if (portal) {
      const r = T * .5 + Math.sin(t * 3) * 3;
      const g = ctx.createRadialGradient(portal.x, portal.y, 2, portal.x, portal.y, r * 1.6); g.addColorStop(0, '#FFF6DD'); g.addColorStop(.4, B.accent); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(portal.x, portal.y, r * 1.6, 0, 7); ctx.fill();
      ctx.strokeStyle = '#F6C96B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(portal.x, portal.y, r, 0, 7); ctx.stroke();
    }
    crystals.forEach((c) => {
      const bob = Math.sin(t * 3 + c.t) * 3; ctx.save(); ctx.translate(c.x, c.y + bob);
      ctx.fillStyle = B.accent; ctx.shadowColor = B.accent; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(7, 0); ctx.lineTo(0, 11); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    drones.forEach((d) => {
      ctx.save(); ctx.translate(d.x, d.y);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 12, 11, 4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#1A2A3A'; ctx.beginPath(); ctx.arc(0, 0, T * .3, 0, 7); ctx.fill();
      ctx.fillStyle = B.drone; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
      ctx.strokeStyle = B.drone; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, T * .3 + 3 + Math.sin(t * 8) * 1.5, 0, 7); ctx.stroke(); ctx.restore();
    });
    if (!(player.inv > 0 && Math.floor(t * 12) % 2)) {
      ctx.save(); ctx.translate(player.x, player.y);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, player.r, player.r, 4, 0, 0, 7); ctx.fill();
      const g = ctx.createRadialGradient(-3, -4, 1, 0, 0, player.r); g.addColorStop(0, '#FFF1C7'); g.addColorStop(1, '#D9A846');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, player.r, 0, 7); ctx.fill();
      ctx.fillStyle = '#071827'; ctx.beginPath(); ctx.arc(3, -2, 2.6, 0, 7); ctx.fill(); ctx.restore();
    }
    if (flash > 0 && !api.reducedMotion) { ctx.fillStyle = `rgba(224,102,59,${flash})`; ctx.fillRect(0, 0, W, H); }
    if (phase === 'ready') {
      ctx.fillStyle = 'rgba(5,9,15,.72)'; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'center';
      ctx.fillStyle = '#F6C96B'; ctx.font = '600 14px Outfit, system-ui, sans-serif'; ctx.fillText(`${B.name.toUpperCase()} · SEED ${api.seed}`, W / 2, H / 2 - 46);
      ctx.fillStyle = '#EAF1F8'; ctx.font = '700 30px Outfit, system-ui, sans-serif'; ctx.fillText(GOALS[goal].name, W / 2, H / 2 - 8);
      ctx.fillStyle = '#8EA3B8'; ctx.font = '500 16px Outfit, system-ui, sans-serif'; ctx.fillText(GOALS[goal].line, W / 2, H / 2 + 22);
      ctx.fillStyle = '#EAF1F8'; ctx.font = '600 16px Outfit, system-ui, sans-serif'; ctx.fillText('Press an arrow key or tap to begin', W / 2, H / 2 + 64);
    }
  }

  const loop = api.loop((dt) => { update(dt); draw(performance.now() / 1000); });
  const map = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' };
  const begin = () => { if (phase === 'ready') phase = 'play'; };
  const onDown = (e) => { const k = map[e.key]; if (k) { keys[k] = true; begin(); } };
  const onUp = (e) => { const k = map[e.key]; if (k) keys[k] = false; };
  // Touch: hold anywhere and the explorer walks towards your finger.
  let pid = null;
  const toward = (e) => { const b = canvas.getBoundingClientRect(), x = (e.clientX - b.left) * W / b.width, y = (e.clientY - b.top) * H / b.height, dx = x - player.x, dy = y - player.y;
    keys.l = dx < -8; keys.r = dx > 8; keys.u = dy < -8; keys.d = dy > 8; };
  const onPd = (e) => { begin(); pid = e.pointerId; canvas.setPointerCapture(pid); toward(e); };
  const onPm = (e) => { if (e.pointerId === pid) toward(e); };
  const onPu = (e) => { if (e.pointerId === pid) { pid = null; keys.l = keys.r = keys.u = keys.d = false; } };
  window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp);
  canvas.addEventListener('pointerdown', onPd); canvas.addEventListener('pointermove', onPm); canvas.addEventListener('pointerup', onPu); canvas.addEventListener('pointercancel', onPu);
  reset();

  return {
    start() { loop.start(); }, pause() { loop.stop(); }, resume() { loop.start(); },
    destroy() { loop.stop(); clearTimeout(endTimer); ended = true; window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp);
      canvas.removeEventListener('pointerdown', onPd); canvas.removeEventListener('pointermove', onPm); canvas.removeEventListener('pointerup', onPu); canvas.removeEventListener('pointercancel', onPu); }
  };
}
