/* Asteroid Sentinel: turn, thrust and fire to clear waves of drifting rocks.
   Big rocks split into medium, medium into small. Everything wraps around the
   screen edges. Three ships, with a short shield after each respawn. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx, toLocal } = api.canvas();
  const rand = api.rng();
  const D = {
    easy: { speed: .75, extra: 0, cap: 9 },
    normal: { speed: 1, extra: 1, cap: 11 },
    hard: { speed: 1.3, extra: 2, cap: 13 }
  }[api.options.difficulty] || { speed: 1, extra: 1, cap: 11 };
  const RADIUS = [0, 15, 27, 46], POINTS = [0, 100, 50, 20];
  const MAX_BULLETS = 9, MAX_PARTS = 140, SHIP_R = 12;
  const FONT = '600 18px Outfit, system-ui, sans-serif';

  let state = 'ready', ship, rocks, bullets, parts, lives, score, wave, waveT, bannerT, respawnT, fireCd, time = 0;
  let destroyed = false;
  const timers = [];
  const keys = { left: false, right: false, up: false, fire: false };
  const stars = Array.from({ length: 120 }, () => ({ x: rand() * W, y: rand() * H, s: rand() * 1.5 + .3, a: rand() * .55 + .15, p: rand() * 6 }));

  // Cached gradients (drawn in local, scaled coordinates).
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#05090F'); bg.addColorStop(1, '#0A1E31');
  const neb = ctx.createRadialGradient(W * .72, H * .3, 10, W * .72, H * .3, W * .55);
  neb.addColorStop(0, 'rgba(246,201,107,.09)'); neb.addColorStop(.5, 'rgba(120,150,190,.05)'); neb.addColorStop(1, 'rgba(5,9,15,0)');
  const rockG = ctx.createRadialGradient(-.35, -.4, .05, 0, 0, 1.15);
  rockG.addColorStop(0, '#8C8378'); rockG.addColorStop(.55, '#4E4A47'); rockG.addColorStop(1, '#22252B');
  const shipG = ctx.createLinearGradient(-12, 0, 18, 0); shipG.addColorStop(0, '#B98A2E'); shipG.addColorStop(1, '#F6E2A8');

  function later(fn, ms) { const id = setTimeout(() => { if (!destroyed) fn(); }, ms); timers.push(id); }

  function newShip() { return { x: W / 2, y: H / 2, vx: 0, vy: 0, a: -Math.PI / 2, inv: 2.5, alive: true, thrust: false }; }

  function makeRock(x, y, size, ang, spd) {
    const n = 11, shape = new Array(n);
    for (let i = 0; i < n; i++) shape[i] = .78 + rand() * .3;
    return { x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, size, r: RADIUS[size], rot: rand() * 7, spin: (rand() - .5) * 1.4, shape };
  }

  function spawnWave() {
    const count = Math.min(D.cap, 2 + wave + D.extra);
    for (let i = 0; i < count; i++) {
      let x, y, tries = 0;
      do { x = rand() * W; y = rand() * H; tries++; } while (Math.hypot(x - ship.x, y - ship.y) < 220 && tries < 40);
      const spd = (34 + rand() * 42 + wave * 6) * D.speed;
      rocks.push(makeRock(x, y, 3, rand() * Math.PI * 2, spd));
    }
    bannerT = 1.8;
  }

  function reset() {
    ship = newShip(); rocks = []; bullets = []; parts = [];
    lives = 3; score = 0; wave = 1; waveT = 0; bannerT = 0; respawnT = 0; fireCd = 0;
    spawnWave(); bannerT = 0;
    status();
  }
  const status = () => api.setStatus(`Lives ${Math.max(0, lives)} · Wave ${wave}`);

  function burst(x, y, n, color, spd) {
    for (let i = 0; i < n && parts.length < MAX_PARTS; i++) {
      const a = rand() * Math.PI * 2, v = spd * (.3 + rand() * .7);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .5 + rand() * .6, max: 1.1, c: color });
    }
  }

  function breakRock(i) {
    const r = rocks[i];
    rocks.splice(i, 1);
    score += POINTS[r.size]; api.setScore(score);
    burst(r.x, r.y, 6 + r.size * 4, '#C9B79C', 70 + r.size * 25);
    if (r.size > 1) {
      const base = Math.atan2(r.vy, r.vx), spd = Math.hypot(r.vx, r.vy) * 1.25 + 14 * D.speed;
      for (const s of [-1, 1]) rocks.push(makeRock(r.x, r.y, r.size - 1, base + s * (.4 + rand() * .6), spd));
    }
    api.sfx('tap');
  }

  function wrap(o, m) {
    if (o.x < -m) o.x += W + m * 2; else if (o.x > W + m) o.x -= W + m * 2;
    if (o.y < -m) o.y += H + m * 2; else if (o.y > H + m) o.y -= H + m * 2;
  }

  function fire() {
    if (!ship.alive || bullets.length >= MAX_BULLETS) return;
    const c = Math.cos(ship.a), s = Math.sin(ship.a);
    bullets.push({ x: ship.x + c * 16, y: ship.y + s * 16, vx: ship.vx + c * 560, vy: ship.vy + s * 560, life: .9 });
    fireCd = .2;
  }

  function loseShip() {
    ship.alive = false; lives--; status();
    burst(ship.x, ship.y, 36, '#F6C96B', 200);
    api.sfx('hit');
    if (lives <= 0) {
      state = 'over';
      later(() => api.end({ score, won: false, summary: `Out of ships on wave ${wave}` }), 1300);
    } else respawnT = 1.4;
  }

  function update(dt) {
    time += dt;
    for (const r of rocks) { r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.spin * dt; wrap(r, r.r); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 1.5; p.vy *= 1 - dt * 1.5; p.life -= dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    if (state === 'ready') return;
    if (bannerT > 0) bannerT -= dt;

    if (ship.alive) {
      if (keys.left) ship.a -= 4.2 * dt;
      if (keys.right) ship.a += 4.2 * dt;
      ship.thrust = keys.up;
      if (keys.up) { ship.vx += Math.cos(ship.a) * 300 * dt; ship.vy += Math.sin(ship.a) * 300 * dt; }
      ship.vx -= ship.vx * .55 * dt; ship.vy -= ship.vy * .55 * dt;
      const sp = Math.hypot(ship.vx, ship.vy);
      if (sp > 380) { ship.vx *= 380 / sp; ship.vy *= 380 / sp; }
      ship.x += ship.vx * dt; ship.y += ship.vy * dt; wrap(ship, SHIP_R);
      ship.inv -= dt;
      fireCd -= dt;
      if (keys.fire && fireCd <= 0) fire();
      if (ship.thrust && parts.length < MAX_PARTS && rand() < .6) {
        const c = Math.cos(ship.a + Math.PI + (rand() - .5) * .5), s = Math.sin(ship.a + Math.PI + (rand() - .5) * .5);
        parts.push({ x: ship.x - Math.cos(ship.a) * 12, y: ship.y - Math.sin(ship.a) * 12, vx: ship.vx + c * 140, vy: ship.vy + s * 140, life: .25, max: .3, c: '#F6C96B' });
      }
    } else if (state === 'play') {
      respawnT -= dt;
      if (respawnT <= 0) { ship = newShip(); ship.inv = 2.5; }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; wrap(b, 2);
      let hit = false;
      for (let j = rocks.length - 1; j >= 0; j--) {
        const r = rocks[j], dx = r.x - b.x, dy = r.y - b.y;
        if (dx * dx + dy * dy < r.r * r.r * .9) { breakRock(j); hit = true; break; }
      }
      if (hit || b.life <= 0) bullets.splice(i, 1);
    }

    if (ship.alive && ship.inv <= 0 && state === 'play') {
      for (const r of rocks) {
        const dx = r.x - ship.x, dy = r.y - ship.y, rr = r.r * .85 + SHIP_R * .8;
        if (dx * dx + dy * dy < rr * rr) { loseShip(); break; }
      }
    }

    if (state === 'play' && rocks.length === 0) {
      if (waveT <= 0) { waveT = 1.6; score += 100 * wave; api.setScore(score); api.sfx('point'); }
      waveT -= dt;
      if (waveT <= 0) { wave++; status(); spawnWave(); if (ship.alive) ship.inv = Math.max(ship.inv, 1.5); }
    }
  }

  function drawShip(x, y, a, alpha, flame, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
    if (flame) {
      const f = 14 + Math.sin(time * 40) * 4;
      ctx.fillStyle = 'rgba(246,201,107,.75)';
      ctx.beginPath(); ctx.moveTo(-10, -5); ctx.quadraticCurveTo(-10 - f, 0, -10, 5); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.moveTo(20, 3); ctx.lineTo(-11, 15); ctx.lineTo(-6, 3); ctx.lineTo(-11, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shipG;
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.quadraticCurveTo(2, -6, -12, -12); ctx.lineTo(-7, 0); ctx.lineTo(-12, 12); ctx.quadraticCurveTo(2, 6, 18, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#071827'; ctx.beginPath(); ctx.ellipse(3, 0, 5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function text(str, x, y, size, color, align = 'center') {
    ctx.font = FONT.replace('18px', size + 'px'); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }

  function draw() {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#EAF1F8';
    for (const s of stars) { ctx.globalAlpha = api.reducedMotion ? s.a : s.a * (.75 + .25 * Math.sin(time * 1.3 + s.p)); ctx.fillRect(s.x, s.y, s.s, s.s); }
    ctx.globalAlpha = 1;

    for (const r of rocks) {
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot); ctx.scale(r.r, r.r);
      ctx.beginPath();
      const n = r.shape.length;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = r.shape[i]; i ? ctx.lineTo(Math.cos(a) * k, Math.sin(a) * k) : ctx.moveTo(Math.cos(a) * k, Math.sin(a) * k); }
      ctx.closePath(); ctx.fillStyle = rockG; ctx.fill();
      ctx.lineWidth = 1.4 / r.r; ctx.strokeStyle = 'rgba(234,241,248,.22)'; ctx.stroke();
      ctx.fillStyle = 'rgba(5,9,15,.28)';
      ctx.beginPath(); ctx.arc(.25, .2, .17, 0, Math.PI * 2); ctx.arc(-.3, .35, .1, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    for (const b of bullets) {
      ctx.fillStyle = 'rgba(246,201,107,.25)'; ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFF1CC'; ctx.beginPath(); ctx.arc(b.x, b.y, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    for (const p of parts) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.c; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
    ctx.globalAlpha = 1;

    if (ship.alive) {
      let alpha = 1;
      if (ship.inv > 0 && state === 'play') alpha = api.reducedMotion ? .55 : (Math.floor(time * 8) % 2 ? .35 : .9);
      if (ship.inv > 0 && state === 'play') {
        ctx.strokeStyle = 'rgba(246,201,107,.28)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(ship.x, ship.y, 24, 0, Math.PI * 2); ctx.stroke();
      }
      drawShip(ship.x, ship.y, ship.a, alpha, ship.thrust && state === 'play');
    }

    // Spare ships, top left.
    for (let i = 0; i < Math.max(0, lives); i++) drawShip(26 + i * 26, 26, -Math.PI / 2, .9, false, .7);

    if (state === 'play' && bannerT > 0) {
      ctx.globalAlpha = Math.min(1, bannerT * 1.5);
      text(`Wave ${wave}`, W / 2, H * .28, 30, '#F6C96B');
      ctx.globalAlpha = 1;
    }
    if (state === 'play' && rocks.length === 0 && waveT > 0) text('Wave clear', W / 2, H * .28, 28, '#EAF1F8');

    if (state === 'ready') {
      ctx.fillStyle = 'rgba(5,9,15,.55)'; ctx.beginPath(); ctx.roundRect(W / 2 - 220, H / 2 + 40, 440, 120, 22); ctx.fill();
      ctx.strokeStyle = 'rgba(246,201,107,.3)'; ctx.lineWidth = 1; ctx.stroke();
      text('Tap or press Space to start', W / 2, H / 2 + 80, 24, '#F6C96B');
      text('Left / Right turn · Up thrust · Space fire', W / 2, H / 2 + 118, 17, '#8EA3B8');
    }
  }

  function begin() { if (state !== 'ready') return; state = 'play'; ship.inv = 2; bannerT = 1.8; api.sfx('tap'); }

  const map = (k) => (k === 'ArrowLeft' || k === 'a' || k === 'A') ? 'left' : (k === 'ArrowRight' || k === 'd' || k === 'D') ? 'right'
    : (k === 'ArrowUp' || k === 'w' || k === 'W') ? 'up' : (k === ' ' || k === 'Spacebar') ? 'fire' : null;
  const onDown = (e) => {
    const k = map(e.key);
    if (state === 'ready' && (k === 'fire' || k === 'up' || e.key === 'Enter')) { begin(); return; }
    if (!k) return;
    if (k === 'fire' && !keys.fire && state === 'play' && fireCd <= 0) fire();
    keys[k] = true;
  };
  const onUp = (e) => { const k = map(e.key); if (k) keys[k] = false; };
  const onPointer = (e) => { toLocal(e); if (state === 'ready') begin(); else if (state === 'play' && fireCd <= 0) fire(); };
  const onBlur = () => { keys.left = keys.right = keys.up = keys.fire = false; };

  const loop = api.loop((dt) => { update(dt); draw(); });
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPointer);
  reset();

  return {
    start() { draw(); loop.start(); },
    pause() { loop.stop(); onBlur(); },
    resume() { loop.start(); },
    destroy() {
      destroyed = true; loop.stop(); timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onPointer);
    }
  };
}
