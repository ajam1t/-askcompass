/* Crystal Breaker: bounce an energy orb off your paddle to shatter a wall of
   crystals. Ice crystals break in one hit, amethyst in two, rose in three.
   Each cleared wall builds a new, tougher one from the seeded generator. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx, toLocal } = api.canvas();
  const rand = api.rng();
  const D = {
    easy: { pw: 104, speed: 320, tough: .7 },
    normal: { pw: 86, speed: 370, tough: 1 },
    hard: { pw: 72, speed: 430, tough: 1.35 }
  }[api.options.difficulty] || { pw: 86, speed: 370, tough: 1 };
  const COLS = 8, MARGIN = 20, GAP = 6, BH = 22, TOP = 96;
  const BW = (W - MARGIN * 2 - GAP * (COLS - 1)) / COLS;
  const PADY = H - 58, PADH = 14, BR = 8, MAX_PARTS = 130;
  const FONT = '600 18px Outfit, system-ui, sans-serif';
  // Crystal colours by hits left: 1 ice, 2 amethyst, 3 rose.
  const GEM = [null, ['#E4F6FA', '#8CCFE0', '#3F8CA6'], ['#E6DAFA', '#A890DD', '#5A4497'], ['#FBDDE4', '#E08AA0', '#93405A']];

  let state, px, targetX, ball, bricks, parts, lives, score, level, bannerT, time = 0, destroyed = false;
  const timers = [], keys = { left: false, right: false };

  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#05090F'); bg.addColorStop(.6, '#081A2B'); bg.addColorStop(1, '#0C2238');
  const halo = ctx.createRadialGradient(W / 2, 40, 10, W / 2, 40, 420);
  halo.addColorStop(0, 'rgba(160,190,230,.10)'); halo.addColorStop(1, 'rgba(160,190,230,0)');
  const gemG = GEM.map((c) => {
    if (!c) return null;
    const g = ctx.createLinearGradient(0, 0, BW * .4, BH); g.addColorStop(0, c[0]); g.addColorStop(.45, c[1]); g.addColorStop(1, c[2]); return g;
  });
  const padG = ctx.createLinearGradient(0, -PADH / 2, 0, PADH / 2); padG.addColorStop(0, '#FBE7B5'); padG.addColorStop(1, '#B98A2E');

  function later(fn, ms) { const id = setTimeout(() => { if (!destroyed) fn(); }, ms); timers.push(id); }
  const status = () => api.setStatus(`Lives ${Math.max(0, lives)} · Level ${level}`);
  const pw = () => D.pw;
  const ballSpeed = () => Math.min(D.speed + 200, D.speed + (level - 1) * 24);

  // Procedural wall: a random symmetric mask over one of several shapes.
  function buildLevel() {
    bricks = [];
    const rows = Math.min(10, 4 + level);
    const shape = Math.floor(rand() * 4);
    const p3 = Math.min(.4, .04 * level * D.tough), p2 = Math.min(.5, (.14 + .06 * level) * D.tough);
    for (let tries = 0; tries < 8 && bricks.length < 14; tries++) {
      bricks = [];
      const density = .62 + rand() * .3;
      for (let r = 0; r < rows; r++) for (let c = 0; c < COLS / 2; c++) {
        let keep = rand() < density;
        if (shape === 1) keep = keep || r % 2 === 0;                                  // banded
        if (shape === 2) keep = Math.abs(c - 3.5) + Math.abs(r - rows / 2) * .9 >= rows / 2 - 1; // hollow diamond
        if (shape === 3) keep = keep && (c + r) % 3 !== 0;                             // lattice
        if (!keep) continue;
        const roll = rand(), hits = roll < p3 ? 3 : roll < p3 + p2 ? 2 : 1;
        for (const cc of [c, COLS - 1 - c]) {
          bricks.push({ x: MARGIN + cc * (BW + GAP), y: TOP + r * (BH + GAP), hits, max: hits, glint: rand() * 6 });
        }
      }
    }
    bannerT = 1.6;
  }

  function stickBall() { ball = { x: px, y: PADY - PADH / 2 - BR - 1, vx: 0, vy: 0, stuck: true }; }

  function reset() {
    px = W / 2; targetX = null; lives = 3; score = 0; level = 1; parts = [];
    state = 'ready'; buildLevel(); bannerT = 0; stickBall(); status();
  }

  function launch() {
    if (!ball.stuck || state === 'over') return;
    const a = (rand() - .5) * .7, s = ballSpeed();
    ball.vx = Math.sin(a) * s; ball.vy = -Math.cos(a) * s; ball.stuck = false;
    state = 'play'; api.sfx('tap');
  }

  function shards(x, y, color, n) {
    for (let i = 0; i < n && parts.length < MAX_PARTS; i++) {
      const a = rand() * Math.PI * 2, v = 60 + rand() * 160;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: .5 + rand() * .5, c: color, r: rand() * 6 });
    }
  }

  function hitBrick(b) {
    b.hits--;
    score += 10;
    if (b.hits <= 0) { score += 20 * b.max; shards(b.x + BW / 2, b.y + BH / 2, GEM[b.max][1], 10); api.sfx('point'); }
    else { shards(b.x + BW / 2, b.y + BH / 2, GEM[b.hits + 1][0], 3); api.sfx('tap'); }
    api.setScore(score);
  }

  function step(dt) {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < BR) { ball.x = BR; ball.vx = Math.abs(ball.vx); }
    if (ball.x > W - BR) { ball.x = W - BR; ball.vx = -Math.abs(ball.vx); }
    if (ball.y < BR) { ball.y = BR; ball.vy = Math.abs(ball.vy); }

    // Paddle: angle depends on where the orb lands.
    const half = pw() / 2;
    if (ball.vy > 0 && ball.y + BR >= PADY - PADH / 2 && ball.y - BR <= PADY + PADH / 2 && Math.abs(ball.x - px) <= half + BR) {
      const off = Math.max(-1, Math.min(1, (ball.x - px) / (half + BR * .5)));
      const s = Math.min(ballSpeed() + 60, Math.hypot(ball.vx, ball.vy) + 3), a = off * 1.05;
      ball.vx = Math.sin(a) * s; ball.vy = -Math.cos(a) * s; ball.y = PADY - PADH / 2 - BR;
      api.sfx('jump');
    }

    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      const nx = Math.max(b.x, Math.min(ball.x, b.x + BW)), ny = Math.max(b.y, Math.min(ball.y, b.y + BH));
      const dx = ball.x - nx, dy = ball.y - ny;
      if (dx * dx + dy * dy > BR * BR) continue;
      // Reflect on the axis of least penetration.
      const ox = Math.min(ball.x + BR - b.x, b.x + BW - (ball.x - BR));
      const oy = Math.min(ball.y + BR - b.y, b.y + BH - (ball.y - BR));
      if (ox < oy) { ball.vx = ball.x < b.x + BW / 2 ? -Math.abs(ball.vx) : Math.abs(ball.vx); ball.x += ball.vx > 0 ? ox : -ox; }
      else { ball.vy = ball.y < b.y + BH / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy); ball.y += ball.vy > 0 ? oy : -oy; }
      hitBrick(b);
      if (b.hits <= 0) bricks.splice(i, 1);
      break;
    }
    // Keep the orb from settling into a near-horizontal path.
    const s = Math.hypot(ball.vx, ball.vy);
    if (Math.abs(ball.vy) < s * .28) { ball.vy = Math.sign(ball.vy || -1) * s * .28; ball.vx = Math.sign(ball.vx) * Math.sqrt(s * s - ball.vy * ball.vy); }
  }

  function update(dt) {
    time += dt;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; p.life -= dt; p.r += dt * 6;
      if (p.life <= 0) parts.splice(i, 1);
    }
    if (bannerT > 0) bannerT -= dt;
    if (state === 'over') return;

    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) { px += dir * 560 * dt; targetX = null; }
    else if (targetX !== null) { const d = targetX - px, m = 1600 * dt; px += Math.abs(d) < m ? d : Math.sign(d) * m; }
    px = Math.max(pw() / 2 + 4, Math.min(W - pw() / 2 - 4, px));

    if (ball.stuck) { ball.x = px; return; }
    const dist = Math.hypot(ball.vx, ball.vy) * dt, n = Math.max(1, Math.ceil(dist / 5));
    for (let i = 0; i < n && !ball.stuck; i++) step(dt / n);

    if (ball.y > H + BR * 2) {
      lives--; status(); api.sfx('hit');
      if (lives <= 0) { state = 'over'; later(() => api.end({ score, won: false, summary: `Out of orbs on level ${level}` }), 900); }
      else stickBall();
    }
    if (bricks.length === 0) {
      score += 100 * level; api.setScore(score);
      level++; status(); buildLevel(); stickBall(); api.sfx('win');
    }
  }

  function text(str, x, y, size, color) {
    ctx.font = FONT.replace('18px', size + 'px'); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }

  function draw() {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H * .7);
    // Faint cavern frame.
    ctx.strokeStyle = 'rgba(142,163,184,.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(6, 6, W - 12, H + 40, 18); ctx.stroke();

    for (const b of bricks) {
      ctx.save(); ctx.translate(b.x, b.y);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.roundRect(1, 4, BW, BH, 6); ctx.fill();
      ctx.fillStyle = gemG[b.hits]; ctx.beginPath(); ctx.roundRect(0, 0, BW, BH, 6); ctx.fill();
      // Facets.
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.beginPath(); ctx.moveTo(4, 3); ctx.lineTo(BW * .55, 3); ctx.lineTo(BW * .35, BH * .55); ctx.lineTo(4, BH * .55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(5,9,15,.18)';
      ctx.beginPath(); ctx.moveTo(BW * .6, BH - 3); ctx.lineTo(BW - 4, BH - 3); ctx.lineTo(BW - 4, BH * .35); ctx.closePath(); ctx.fill();
      if (b.max > 1 && b.hits < b.max) {
        ctx.strokeStyle = 'rgba(5,9,15,.55)'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(BW * .3, 0); ctx.lineTo(BW * .45, BH * .5); ctx.lineTo(BW * .38, BH);
        if (b.max - b.hits > 1) { ctx.moveTo(BW * .45, BH * .5); ctx.lineTo(BW * .75, BH * .3); }
        ctx.stroke();
      }
      if (!api.reducedMotion) {
        const g = (Math.sin(time * 1.6 + b.glint) + 1) / 2;
        if (g > .92) { ctx.fillStyle = `rgba(255,255,255,${(g - .92) * 6})`; ctx.beginPath(); ctx.arc(BW * .2, BH * .3, 2.2, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
    }

    for (const p of parts) {
      ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(3, 0); ctx.lineTo(0, 4); ctx.lineTo(-3, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;

    // Paddle.
    ctx.save(); ctx.translate(px, PADY);
    ctx.fillStyle = 'rgba(246,201,107,.12)'; ctx.beginPath(); ctx.ellipse(0, 10, pw() * .62, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = padG; ctx.beginPath(); ctx.roundRect(-pw() / 2, -PADH / 2, pw(), PADH, PADH / 2); ctx.fill();
    ctx.fillStyle = 'rgba(7,24,39,.55)'; ctx.fillRect(-pw() / 2 + 14, -1, pw() - 28, 2);
    ctx.restore();

    // Orb.
    if (state !== 'over' || ball.y < H) {
      ctx.fillStyle = 'rgba(246,201,107,.22)'; ctx.beginPath(); ctx.arc(ball.x, ball.y, BR * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(ball.x, ball.y, BR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F6C96B'; ctx.beginPath(); ctx.arc(ball.x + 1.5, ball.y + 1.5, BR * .55, 0, Math.PI * 2); ctx.fill();
    }

    for (let i = 0; i < Math.max(0, lives); i++) {
      ctx.fillStyle = 'rgba(246,201,107,.85)'; ctx.beginPath(); ctx.arc(24 + i * 18, 40, 5, 0, Math.PI * 2); ctx.fill();
    }
    text(`Level ${level}`, W - 52, 40, 16, '#8EA3B8');

    if (bannerT > 0 && level > 1) { ctx.globalAlpha = Math.min(1, bannerT * 1.5); text(`Level ${level}`, W / 2, H * .62, 30, '#F6C96B'); ctx.globalAlpha = 1; }
    if (ball.stuck && state !== 'over') {
      if (state === 'ready') {
        ctx.fillStyle = 'rgba(5,9,15,.6)'; ctx.beginPath(); ctx.roundRect(40, H * .58, W - 80, 104, 20); ctx.fill();
        ctx.strokeStyle = 'rgba(246,201,107,.3)'; ctx.lineWidth = 1; ctx.stroke();
        text('Tap or press Space to launch', W / 2, H * .58 + 36, 21, '#F6C96B');
        text('Arrows, mouse or drag to move', W / 2, H * .58 + 70, 16, '#8EA3B8');
      } else text('Tap or press Space to launch', W / 2, H * .72, 18, '#EAF1F8');
    }
  }

  const onDown = (e) => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = true;
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = true;
    else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'Enter') launch();
  };
  const onUp = (e) => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.left = false;
    if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.right = false;
  };
  // Pointer: move follows the pointer (mouse or finger drag); a quick tap launches.
  let down = null;
  const onPDown = (e) => { const p = toLocal(e); down = { x: p.x, y: p.y, t: performance.now(), moved: 0 }; targetX = p.x; try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } };
  const onPMove = (e) => { const p = toLocal(e); if (down) down.moved = Math.max(down.moved, Math.abs(p.x - down.x)); if (down || e.pointerType === 'mouse') targetX = p.x; };
  const onPUp = () => { if (down && (down.moved < 14 || performance.now() - down.t < 220)) launch(); down = null; };
  const onPCancel = () => { down = null; };
  const onBlur = () => { keys.left = keys.right = false; down = null; };

  const loop = api.loop((dt) => { update(dt); draw(); });
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPDown);
  canvas.addEventListener('pointermove', onPMove);
  canvas.addEventListener('pointerup', onPUp);
  canvas.addEventListener('pointercancel', onPCancel);
  reset();

  return {
    start() { draw(); loop.start(); },
    pause() { loop.stop(); onBlur(); },
    resume() { loop.start(); },
    destroy() {
      destroyed = true; loop.stop(); timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onPDown); canvas.removeEventListener('pointermove', onPMove);
      canvas.removeEventListener('pointerup', onPUp); canvas.removeEventListener('pointercancel', onPCancel);
    }
  };
}
