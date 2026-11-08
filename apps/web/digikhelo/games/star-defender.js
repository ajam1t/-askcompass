/* Star Defender: hold the orbital line. Your cannon fires on its own; slide left
   and right to aim. Drone formations swoop in, sway, dive at you and (some of
   them) fire back. Each cleared wave brings a bigger, faster formation. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx, toLocal } = api.canvas();
  const rand = api.rng();
  const D = {
    easy: { spd: .8, fire: .55, dive: .7 },
    normal: { spd: 1, fire: 1, dive: 1 },
    hard: { spd: 1.22, fire: 1.45, dive: 1.35 }
  }[api.options.difficulty] || { spd: 1, fire: 1, dive: 1 };
  const PY = H - 86, FONT = '600 18px Outfit, system-ui, sans-serif';
  const TYPES = {
    scout: { hp: 1, pts: 100, body: ['#9FB6C9', '#46607A'], shoots: false, r: 15 },
    gunner: { hp: 2, pts: 150, body: ['#E39A74', '#8A3F25'], shoots: true, r: 16 },
    captain: { hp: 3, pts: 300, body: ['#C7B2E6', '#5B4686'], shoots: true, r: 18 }
  };
  const MAX_PB = 24, MAX_EB = 40, MAX_PARTS = 140;

  let state = 'ready', px, targetX, lives, score, wave, inv, fireT, drones, pBul, eBul, parts, formX, formY, diveT, bannerT, clearT, time = 0;
  let destroyed = false;
  const timers = [], keys = { left: false, right: false };
  const stars = Array.from({ length: 90 }, () => ({ x: rand() * W, y: rand() * H, s: rand() * 1.6 + .3, k: rand() * .7 + .2 }));

  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#05090F'); bg.addColorStop(.7, '#081A2B'); bg.addColorStop(1, '#0D2740');
  const glow = ctx.createRadialGradient(W / 2, H + 120, 20, W / 2, H + 120, 420);
  glow.addColorStop(0, 'rgba(246,201,107,.16)'); glow.addColorStop(1, 'rgba(246,201,107,0)');
  const shipG = ctx.createLinearGradient(0, -24, 0, 22); shipG.addColorStop(0, '#FBE7B5'); shipG.addColorStop(1, '#B98A2E');
  const droneG = {};
  for (const k in TYPES) { const g = ctx.createLinearGradient(0, -16, 0, 16); g.addColorStop(0, TYPES[k].body[0]); g.addColorStop(1, TYPES[k].body[1]); droneG[k] = g; }

  function later(fn, ms) { const id = setTimeout(() => { if (!destroyed) fn(); }, ms); timers.push(id); }
  const status = () => api.setStatus(`Lives ${Math.max(0, lives)} · Wave ${wave}`);

  // Formation slots for a wave. Patterns rotate; size and toughness grow.
  function buildWave() {
    drones = [];
    const pattern = (wave - 1) % 4;
    const rows = Math.min(5, 2 + Math.floor((wave + 1) / 2));
    const cols = 6, sx = 62, sy = 50, x0 = W / 2 - (cols - 1) * sx / 2, y0 = 110;
    const slots = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      let keep = true;
      if (pattern === 1) keep = Math.abs(c - 2.5) >= r * .5 - .25 || r === 0;              // V
      if (pattern === 2) keep = (r + c) % 2 === 0 || r === 0;                              // checker
      if (pattern === 3) keep = Math.abs(c - 2.5) + Math.abs(r - (rows - 1) / 2) <= 3.2;   // diamond
      if (keep) slots.push([x0 + c * sx, y0 + r * sy, r]);
    }
    slots.forEach(([hx, hy, r], i) => {
      let type = 'scout';
      if (r === 0 && wave >= 3) type = 'captain';
      else if (r <= 1 + Math.floor(wave / 4) && (r > 0 || wave < 3) && wave >= 2) type = 'gunner';
      const left = i % 2 === 0;
      drones.push({
        hx, hy, x: left ? -40 : W + 40, y: -40, type, hp: TYPES[type].hp, r: TYPES[type].r,
        st: 'enter', t: -i * .07, sx: left ? -40 : W + 40, sy: -40, cx: left ? W * .85 : W * .15, cy: 360,
        fireT: 1.5 + rand() * 4, flash: 0, vx: 0
      });
    });
    formX = 0; formY = 0; diveT = 2.5 / D.dive; bannerT = 1.8;
  }

  function reset() {
    px = W / 2; targetX = null; lives = 3; score = 0; wave = 1; inv = 0; fireT = .3;
    pBul = []; eBul = []; parts = []; clearT = 0;
    buildWave(); bannerT = 0; status();
  }

  function burst(x, y, n, color, spd) {
    for (let i = 0; i < n && parts.length < MAX_PARTS; i++) {
      const a = rand() * Math.PI * 2, v = spd * (.3 + rand() * .7);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .4 + rand() * .5, c: color });
    }
  }

  function enemyShot(d, aim) {
    if (eBul.length >= MAX_EB) return;
    const vy = (250 + wave * 6) * D.spd;
    const vx = aim ? Math.max(-120, Math.min(120, (px - d.x) * vy / Math.max(120, PY - d.y))) : 0;
    eBul.push({ x: d.x, y: d.y + 14, vx, vy });
  }

  function hitPlayer() {
    lives--; status(); inv = 2.2; api.sfx('hit');
    burst(px, PY, 30, '#F6C96B', 220);
    if (lives <= 0) { state = 'over'; later(() => api.end({ score, won: false, summary: `Line broken on wave ${wave}` }), 1300); }
  }

  const bez = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

  function update(dt) {
    time += dt;
    for (const s of stars) { s.y += (20 + s.k * 70) * dt; if (s.y > H) { s.y = 0; s.x = rand() * W; } }
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
    if (state === 'ready') return;
    if (bannerT > 0) bannerT -= dt;
    const alive = state === 'play';

    // Player movement: keys win over drag.
    if (alive) {
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) { px += dir * 400 * dt; targetX = null; }
      else if (targetX !== null) { const d = targetX - px, m = 900 * dt; px += Math.abs(d) < m ? d : Math.sign(d) * m; }
      px = Math.max(26, Math.min(W - 26, px));
      if (inv > 0) inv -= dt;
      fireT -= dt;
      if (fireT <= 0 && pBul.length < MAX_PB - 1) {
        fireT = .27;
        if (wave >= 4) { pBul.push({ x: px - 11, y: PY - 18 }); pBul.push({ x: px + 11, y: PY - 18 }); }
        else pBul.push({ x: px, y: PY - 24 });
      }
    }
    for (let i = pBul.length - 1; i >= 0; i--) { pBul[i].y -= 720 * dt; if (pBul[i].y < -20) pBul.splice(i, 1); }

    // Formation sway and slow descent.
    formX = Math.sin(time * .7) * 38;
    formY = Math.min(170, formY + 3.5 * D.spd * dt * (1 + wave * .1));
    const homeCount = drones.reduce((n, d) => n + (d.st === 'home' ? 1 : 0), 0);
    diveT -= dt;
    if (alive && diveT <= 0 && homeCount) {
      diveT = Math.max(.9, 3 - wave * .2) / D.dive;
      let pick = Math.floor(rand() * homeCount);
      for (const d of drones) if (d.st === 'home' && pick-- === 0) { d.st = 'dive'; d.t = 0; d.vx = 0; d.shot = false; break; }
    }

    for (const d of drones) {
      if (d.flash > 0) d.flash -= dt;
      const hx = d.hx + formX, hy = d.hy + formY;
      if (d.st === 'enter' || d.st === 'return') {
        d.t += dt / (d.st === 'enter' ? 1.25 : 1.1);
        const t = Math.max(0, Math.min(1, d.t));
        d.x = bez(d.sx, d.cx, hx, t); d.y = bez(d.sy, d.cy, hy, t);
        if (d.t >= 1) d.st = 'home';
      } else if (d.st === 'home') {
        d.x = hx; d.y = hy;
        if (TYPES[d.type].shoots && alive) {
          d.fireT -= dt * D.fire * (1 + wave * .08);
          if (d.fireT <= 0) { d.fireT = 2.6 + rand() * 3.4; enemyShot(d, true); }
        }
      } else if (d.st === 'dive') {
        d.t += dt;
        const vy = (210 + wave * 8) * D.spd;
        d.vx += Math.sign(px - d.x) * 260 * dt; d.vx = Math.max(-170 * D.spd, Math.min(170 * D.spd, d.vx));
        d.x += (d.vx + Math.sin(d.t * 5) * 60) * dt; d.y += vy * dt;
        if (!d.shot && d.y > H * .42 && TYPES[d.type].shoots) { d.shot = true; enemyShot(d, true); }
        if (d.y > H + 40) { d.st = 'return'; d.t = 0; d.sx = d.x; d.sy = -50; d.cx = d.x < W / 2 ? W * .8 : W * .2; d.cy = 160; }
      }
      // Ramming the ship.
      if (alive && inv <= 0 && d.st !== 'enter' && Math.abs(d.x - px) < d.r + 16 && Math.abs(d.y - PY) < d.r + 12) { d.hp = 0; killDrone(d, false); hitPlayer(); }
    }

    // Player shots vs drones.
    for (let i = pBul.length - 1; i >= 0; i--) {
      const b = pBul[i];
      for (const d of drones) {
        if (d.hp > 0 && d.y > -10 && Math.abs(d.x - b.x) < d.r && Math.abs(d.y - b.y) < d.r + 4) {
          d.hp--; d.flash = .08; pBul.splice(i, 1);
          if (d.hp <= 0) killDrone(d, true); else burst(b.x, b.y, 3, '#EAF1F8', 80);
          break;
        }
      }
    }
    if (drones.some((d) => d.hp <= 0)) drones = drones.filter((d) => d.hp > 0);

    for (let i = eBul.length - 1; i >= 0; i--) {
      const b = eBul[i]; b.x += b.vx * dt; b.y += b.vy * dt;
      if (alive && inv <= 0 && Math.abs(b.x - px) < 14 && Math.abs(b.y - PY) < 16) { eBul.splice(i, 1); hitPlayer(); continue; }
      if (b.y > H + 10) eBul.splice(i, 1);
    }

    if (alive && drones.length === 0) {
      if (clearT <= 0) { clearT = 1.8; score += 200 * wave; api.setScore(score); api.sfx('point'); }
      clearT -= dt;
      if (clearT <= 0) { wave++; status(); eBul.length = 0; buildWave(); }
    }
  }

  function killDrone(d, byShot) {
    d.hp = 0;
    if (byShot) { score += TYPES[d.type].pts * (d.st === 'dive' ? 2 : 1); api.setScore(score); api.sfx('tap'); }
    burst(d.x, d.y, 16, TYPES[d.type].body[0], 160);
  }

  function drawDrone(d) {
    ctx.save(); ctx.translate(d.x, d.y);
    if (d.st === 'dive') ctx.rotate(Math.max(-.6, Math.min(.6, -d.vx / 300)));
    const s = d.r / 16;
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 18, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = d.flash > 0 ? '#EAF1F8' : droneG[d.type];
    ctx.beginPath();
    ctx.moveTo(0, 15); ctx.lineTo(-9, 6); ctx.lineTo(-20, 8); ctx.quadraticCurveTo(-16, -6, -8, -10);
    ctx.quadraticCurveTo(0, -16, 8, -10); ctx.quadraticCurveTo(16, -6, 20, 8); ctx.lineTo(9, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#071827'; ctx.beginPath(); ctx.ellipse(0, -2, 6, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = d.type === 'scout' ? '#CFE3F2' : '#FFD7B8'; ctx.beginPath(); ctx.arc(0, -2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawShip(x, y, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = alpha;
    const f = 10 + (api.reducedMotion ? 0 : Math.sin(time * 38) * 3);
    ctx.fillStyle = 'rgba(246,201,107,.55)'; ctx.beginPath(); ctx.moveTo(-6, 18); ctx.quadraticCurveTo(0, 18 + f * 2, 6, 18); ctx.fill();
    ctx.fillStyle = shipG;
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(7, -12, 8, 2); ctx.lineTo(24, 14); ctx.quadraticCurveTo(24, 20, 18, 20);
    ctx.lineTo(-18, 20); ctx.quadraticCurveTo(-24, 20, -24, 14); ctx.lineTo(-8, 2); ctx.quadraticCurveTo(-7, -12, 0, -26); ctx.fill();
    ctx.fillStyle = '#071827'; ctx.beginPath(); ctx.ellipse(0, -6, 3.6, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function text(str, x, y, size, color) {
    ctx.font = FONT.replace('18px', size + 'px'); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }

  function draw() {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = glow; ctx.fillRect(0, H - 320, W, 320);
    ctx.fillStyle = '#EAF1F8';
    for (const s of stars) { ctx.globalAlpha = s.k * .8; ctx.fillRect(s.x, s.y, s.s, s.s * 2); }
    ctx.globalAlpha = 1;
    // The orbital line.
    ctx.strokeStyle = 'rgba(246,201,107,.16)'; ctx.lineWidth = 1; ctx.setLineDash([4, 10]);
    ctx.beginPath(); ctx.moveTo(0, PY + 34); ctx.lineTo(W, PY + 34); ctx.stroke(); ctx.setLineDash([]);

    for (const d of drones) drawDrone(d);
    ctx.fillStyle = '#FFE7B0';
    for (const b of pBul) { ctx.beginPath(); ctx.roundRect(b.x - 2, b.y - 9, 4, 16, 2); ctx.fill(); }
    for (const b of eBul) {
      ctx.fillStyle = 'rgba(224,102,59,.3)'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFB08F'; ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
    ctx.globalAlpha = 1;

    if (state !== 'over') {
      let a = 1;
      if (inv > 0 && state === 'play') a = api.reducedMotion ? .5 : (Math.floor(time * 9) % 2 ? .3 : .9);
      drawShip(px, PY, a);
    }
    for (let i = 0; i < Math.max(0, lives); i++) {
      ctx.save(); ctx.translate(22 + i * 22, 24); ctx.scale(.36, .36); ctx.translate(-22 - i * 22, -24); drawShip(22 + i * 22, 24, .85); ctx.restore();
    }

    if (state === 'play' && bannerT > 0) { ctx.globalAlpha = Math.min(1, bannerT * 1.5); text(`Wave ${wave}`, W / 2, H * .45, 30, '#F6C96B'); ctx.globalAlpha = 1; }
    if (state === 'play' && drones.length === 0 && clearT > 0) text('Wave clear', W / 2, H * .45, 28, '#EAF1F8');

    if (state === 'ready') {
      ctx.fillStyle = 'rgba(5,9,15,.6)'; ctx.beginPath(); ctx.roundRect(40, H * .5 - 60, W - 80, 130, 22); ctx.fill();
      ctx.strokeStyle = 'rgba(246,201,107,.3)'; ctx.lineWidth = 1; ctx.stroke();
      text('Tap or press Space to start', W / 2, H * .5 - 18, 23, '#F6C96B');
      text('Arrows or drag to move', W / 2, H * .5 + 18, 17, '#8EA3B8');
      text('Your cannon fires on its own', W / 2, H * .5 + 42, 17, '#8EA3B8');
    }
  }

  function begin() { if (state !== 'ready') return; state = 'play'; bannerT = 1.8; api.sfx('tap'); }

  const onDown = (e) => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = true;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = true;
    else if (!(k === ' ' || k === 'ArrowUp' || k === 'Enter')) return;
    begin();
  };
  const onUp = (e) => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = false;
    if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = false;
  };
  let dragging = false;
  const onPDown = (e) => { dragging = true; targetX = toLocal(e).x; try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } begin(); };
  const onPMove = (e) => { if (dragging) targetX = toLocal(e).x; };
  const onPUp = () => { dragging = false; };
  const onBlur = () => { keys.left = keys.right = false; dragging = false; };

  const loop = api.loop((dt) => { update(dt); draw(); });
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPDown);
  canvas.addEventListener('pointermove', onPMove);
  canvas.addEventListener('pointerup', onPUp);
  canvas.addEventListener('pointercancel', onPUp);
  reset();

  return {
    start() { draw(); loop.start(); },
    pause() { loop.stop(); onBlur(); },
    resume() { loop.start(); },
    destroy() {
      destroyed = true; loop.stop(); timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onPDown); canvas.removeEventListener('pointermove', onPMove);
      canvas.removeEventListener('pointerup', onPUp); canvas.removeEventListener('pointercancel', onPUp);
    }
  };
}
