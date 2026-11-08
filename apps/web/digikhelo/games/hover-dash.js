/* Hover Dash: an endless rooftop run at dusk. Jump the gaps between towers and
   clear the low barriers on the roofs; hold jump to go higher. The city speeds
   up the further you get. Score is distance in metres. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx } = api.canvas();
  const rand = api.rng();
  const D = {
    easy: { v0: 280, acc: 6, vmax: 560, gap: .85, bar: .4 },
    normal: { v0: 320, acc: 8, vmax: 650, gap: 1, bar: .6 },
    hard: { v0: 360, acc: 10, vmax: 740, gap: 1.12, bar: .8 }
  }[api.options.difficulty] || { v0: 320, acc: 8, vmax: 650, gap: 1, bar: .6 };
  const PX = 170, PW = 30, PH = 40, G = 2300, JV = 760, M = 30; // 30 px per metre
  const FONT = '600 18px Outfit, system-ui, sans-serif';

  let state = 'ready', cam, speed, y, vy, ground, coyote, buffer, holding, holdT, roofs, bars, parts, time = 0, destroyed = false, cause = '';
  const timers = [];
  // Parallax skyline layers (fixed widths, repeat).
  const far = [], mid = [];
  for (let x = 0; x < 1600;) { const w = 40 + rand() * 70; far.push({ x, w, h: 60 + rand() * 120 }); x += w + 4; }
  for (let x = 0; x < 1800;) { const w = 60 + rand() * 90; mid.push({ x, w, h: 90 + rand() * 150, s: rand() * 1e4 }); x += w + 14 + rand() * 30; }

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#05090F'); sky.addColorStop(.55, '#0B2236'); sky.addColorStop(.85, '#3A3340'); sky.addColorStop(1, '#6A4B3A');
  const sun = ctx.createRadialGradient(W * .7, H * .78, 10, W * .7, H * .78, 300);
  sun.addColorStop(0, 'rgba(246,201,107,.45)'); sun.addColorStop(.4, 'rgba(246,201,107,.12)'); sun.addColorStop(1, 'rgba(246,201,107,0)');
  const towerG = ctx.createLinearGradient(0, 0, 0, H); towerG.addColorStop(0, '#16283A'); towerG.addColorStop(1, '#070E17');
  const bodyG = ctx.createLinearGradient(0, -PH, 0, 0); bodyG.addColorStop(0, '#FBE7B5'); bodyG.addColorStop(1, '#B98A2E');

  function later(fn, ms) { const id = setTimeout(() => { if (!destroyed) fn(); }, ms); timers.push(id); }

  function addRoof() {
    const last = roofs[roofs.length - 1];
    const gapMax = (90 + speed * .32) * D.gap;
    const gap = 70 + rand() * (gapMax - 70);
    let ny = last.y + (rand() - .5) * 150;
    if (ny < last.y - 60) ny = last.y - 60;                 // limit how far up the next roof is
    const rise = last.y - ny, g = rise > 20 ? gap * .8 : gap;
    ny = Math.max(250, Math.min(375, ny));
    const w = 240 + rand() * 380 * (D.gap > 1 ? .85 : 1);
    const r = { x: last.x + last.w + g, w, y: ny, seed: Math.floor(rand() * 1e6) };
    roofs.push(r);
    // Low barriers, never right at the landing edge.
    const minIn = Math.max(130, speed * .5);
    if (w > minIn + 110 && rand() < D.bar) {
      let bx = r.x + minIn + rand() * (w - minIn - 90);
      bars.push({ x: bx, w: 22, h: 26 + rand() * 16, y: r.y });
      if (w > minIn + 420 && rand() < D.bar * .6) { bx += 240 + rand() * 60; if (bx < r.x + w - 70) bars.push({ x: bx, w: 22, h: 26 + rand() * 14, y: r.y }); }
    }
  }

  function reset() {
    cam = 0; speed = D.v0; vy = 0; ground = true; coyote = 0; buffer = 0; holding = false; holdT = 0; parts = [];
    roofs = [{ x: -300, w: 1150, y: 330, seed: 7 }]; bars = []; y = 330;
    while (roofs[roofs.length - 1].x < W * 2) addRoof();
    api.setStatus('');
  }

  const metres = () => Math.floor(cam / M);

  function crash(why) {
    if (state !== 'play') return;
    state = 'over'; cause = why; api.sfx('hit');
    for (let i = 0; i < 26; i++) { const a = rand() * Math.PI * 2, v = 80 + rand() * 220; parts.push({ x: PX, y: y - PH / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .8, c: '#F6C96B' }); }
    later(() => api.end({ score: metres(), won: false, summary: why }), 1000);
  }

  function update(dt) {
    time += dt;
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
    if (state !== 'play') { if (state === 'over' && y < H + 100) { vy += G * dt; y += vy * dt; } return; }

    speed = Math.min(D.vmax, speed + D.acc * dt);
    const dx = speed * dt;
    cam += dx;
    api.setScore(metres());

    // Jump with buffer and coyote time; holding cuts gravity on the way up.
    if (buffer > 0) buffer -= dt;
    if (ground) coyote = .09; else coyote -= dt;
    if (buffer > 0 && coyote > 0) { vy = -JV; ground = false; coyote = 0; buffer = 0; holdT = 0; api.sfx('jump'); }
    let g = G;
    if (!ground && vy < 0) { if (holding && holdT < .26) { g = G * .42; holdT += dt; } else if (!holding) g = G * 1.6; }
    const prevY = y;
    vy += g * dt; y += vy * dt;

    // Find the roof under the runner.
    const wx = cam + PX;
    ground = false;
    for (const r of roofs) {
      if (wx + PW / 2 > r.x + 2 && wx - PW / 2 < r.x + r.w - 2) {
        if (vy >= 0 && prevY <= r.y + 2 && y >= r.y) { y = r.y; vy = 0; ground = true; }
        else if (y > r.y + 8 && prevY > r.y + 2 && wx + PW / 2 - dx <= r.x + 4) { crash('Hit the side of a tower'); return; }
      }
    }
    for (const b of bars) {
      if (wx + PW / 2 - 4 > b.x && wx - PW / 2 + 4 < b.x + b.w && y > b.y - b.h + 3) { crash('Clipped a barrier'); return; }
    }
    if (y > H + 40) { crash('Fell between the towers'); return; }

    while (roofs.length && roofs[0].x + roofs[0].w < cam - 100) roofs.shift();
    while (bars.length && bars[0].x + bars[0].w < cam - 100) bars.shift();
    while (roofs[roofs.length - 1].x < cam + W * 2) addRoof();

    if (ground && parts.length < 60 && rand() < .5) parts.push({ x: PX - 12, y: y - 3, vx: -60 - rand() * 60, vy: -rand() * 40, life: .35, c: 'rgba(246,201,107,.7)' });
  }

  function windows(r, sx) {
    // Deterministic lit windows per tower.
    let s = r.seed;
    const cols = Math.floor((r.w - 24) / 26);
    for (let row = 0; row < 7; row++) for (let c = 0; c < cols; c++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const lit = (s >> 8) % 7;
      if (lit > 1) continue;
      ctx.fillStyle = lit ? 'rgba(246,201,107,.35)' : 'rgba(234,241,248,.12)';
      ctx.fillRect(sx + 14 + c * 26, r.y + 26 + row * 30, 12, 14);
    }
  }

  function text(str, x, yy, size, color) {
    ctx.font = FONT.replace('18px', size + 'px'); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, yy);
  }

  function draw() {
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(246,201,107,.5)'; ctx.beginPath(); ctx.arc(W * .7, H * .8, 34, 0, Math.PI * 2); ctx.fill();
    // Far and mid skyline.
    let off = (cam * .12) % 1600;
    ctx.fillStyle = '#1A2636';
    for (const b of far) for (const k of [0, 1600]) { const x = b.x - off + k; if (x > -b.w && x < W) ctx.fillRect(x, H - 110 - b.h, b.w, b.h + 110); }
    off = (cam * .35) % 1800;
    for (const b of mid) for (const k of [0, 1800]) {
      const x = b.x - off + k; if (x < -b.w || x > W) continue;
      ctx.fillStyle = '#111C2A'; ctx.fillRect(x, H - 60 - b.h, b.w, b.h + 60);
      ctx.fillStyle = 'rgba(246,201,107,.18)';
      for (let i = 0; i < 5; i++) { const wy = H - 50 - b.h + 18 + ((b.s >> i) % 9) * 16; if (((b.s >> (i * 2)) & 3) === 0) ctx.fillRect(x + 8 + (i % 3) * 18, wy, 6, 8); }
    }
    // Haze.
    ctx.fillStyle = 'rgba(58,51,64,.25)'; ctx.fillRect(0, H - 120, W, 120);

    // Rooftops.
    for (const r of roofs) {
      const sx = r.x - cam;
      if (sx > W || sx + r.w < 0) continue;
      ctx.fillStyle = towerG; ctx.fillRect(sx, r.y, r.w, H - r.y);
      windows(r, sx);
      ctx.fillStyle = '#2A3A4C'; ctx.beginPath(); ctx.roundRect(sx - 4, r.y - 6, r.w + 8, 10, 3); ctx.fill();
      ctx.fillStyle = 'rgba(246,201,107,.45)'; ctx.fillRect(sx - 4, r.y - 6, r.w + 8, 1.5);
      // A rooftop antenna for flavour.
      if (r.seed % 3 === 0 && r.w > 300) { ctx.fillStyle = '#2A3A4C'; ctx.fillRect(sx + r.w - 60, r.y - 50, 3, 44); ctx.fillStyle = '#E0663B'; ctx.beginPath(); ctx.arc(sx + r.w - 58.5, r.y - 52, 3, 0, Math.PI * 2); ctx.fill(); }
    }
    for (const b of bars) {
      const sx = b.x - cam; if (sx > W || sx + b.w < 0) continue;
      ctx.fillStyle = '#3B2A26'; ctx.beginPath(); ctx.roundRect(sx, b.y - b.h, b.w, b.h, 4); ctx.fill();
      ctx.fillStyle = '#E0663B';
      for (let i = 0; i < b.h - 8; i += 12) ctx.fillRect(sx + 3, b.y - b.h + 4 + i, b.w - 6, 5);
      ctx.fillStyle = 'rgba(224,102,59,.25)'; ctx.beginPath(); ctx.arc(sx + b.w / 2, b.y - b.h, 9, 0, Math.PI * 2); ctx.fill();
    }

    for (const p of parts) { ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2.5)); ctx.fillStyle = p.c; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
    ctx.globalAlpha = 1;

    // Runner: a hover courier with a glowing skid.
    if (state !== 'over' || y < H + 60) {
      ctx.save(); ctx.translate(PX, y);
      const tilt = state === 'play' ? Math.max(-.25, Math.min(.25, vy / 3000)) : 0;
      ctx.rotate(tilt);
      const bob = state === 'ready' && !api.reducedMotion ? Math.sin(time * 4) * 2 : 0;
      ctx.fillStyle = 'rgba(246,201,107,.25)'; ctx.beginPath(); ctx.ellipse(0, -2, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2A3A4C'; ctx.beginPath(); ctx.roundRect(-20, -9 + bob, 40, 6, 3); ctx.fill();
      ctx.fillStyle = bodyG; ctx.beginPath(); ctx.roundRect(-PW / 2 + 2, -PH + bob, PW - 4, PH - 10, 11); ctx.fill();
      ctx.fillStyle = '#071827'; ctx.beginPath(); ctx.roundRect(-2, -PH + 8 + bob, 14, 9, 4); ctx.fill();
      ctx.fillStyle = 'rgba(234,241,248,.8)'; ctx.fillRect(4, -PH + 10 + bob, 6, 2);
      ctx.fillStyle = '#E0663B'; ctx.beginPath(); ctx.moveTo(-PW / 2 + 3, -PH + 14 + bob); ctx.lineTo(-PW / 2 - 12, -PH + 18 + bob + Math.sin(time * 14) * 2); ctx.lineTo(-PW / 2 + 3, -PH + 20 + bob); ctx.fill();
      ctx.restore();
    }

    if (state === 'ready') {
      ctx.fillStyle = 'rgba(5,9,15,.6)'; ctx.beginPath(); ctx.roundRect(W / 2 - 200, 70, 400, 104, 20); ctx.fill();
      ctx.strokeStyle = 'rgba(246,201,107,.3)'; ctx.lineWidth = 1; ctx.stroke();
      text('Tap or press Space to run', W / 2, 106, 24, '#F6C96B');
      text('Jump the gaps and barriers · hold to jump higher', W / 2, 142, 16, '#8EA3B8');
    }
  }

  function press() {
    if (state === 'ready') { state = 'play'; api.sfx('tap'); return; }
    if (state === 'play') { buffer = .12; holding = true; }
  }
  function release() { holding = false; }
  const isJump = (k) => k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'Spacebar';
  const onDown = (e) => { if (isJump(e.key) && !e.repeat) press(); };
  const onUp = (e) => { if (isJump(e.key)) release(); };
  const onPDown = (e) => { try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } press(); };

  const loop = api.loop((dt) => { update(dt); draw(); });
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  window.addEventListener('blur', release);
  canvas.addEventListener('pointerdown', onPDown);
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  reset();

  return {
    start() { draw(); loop.start(); },
    pause() { loop.stop(); release(); },
    resume() { loop.start(); },
    destroy() {
      destroyed = true; loop.stop(); timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', release);
      canvas.removeEventListener('pointerdown', onPDown); canvas.removeEventListener('pointerup', release); canvas.removeEventListener('pointercancel', release);
    }
  };
}
