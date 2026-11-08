/* Sky Drift: weave a hover car through sky traffic. Three lanes, traffic speeds
   up with distance; one hit ends the run. Score is distance in metres.
   Reference implementation of the DigiKhelo game module contract. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx, toLocal } = api.canvas();
  const rand = api.rng();
  const LANES = 3, laneW = W / LANES, carW = 54, carH = 92;
  const speedK = { easy: .8, normal: 1, hard: 1.25 }[api.options.difficulty] || 1;
  let lane, x, dist, speed, traffic, spawnT, stars, dead, keys = {};

  function reset() {
    lane = 1; x = laneX(1); dist = 0; speed = 320 * speedK; traffic = []; spawnT = .6; dead = false;
    stars = Array.from({ length: 70 }, () => ({ x: rand() * W, y: rand() * H, s: rand() * 1.6 + .4, k: rand() * .6 + .2 }));
  }
  const laneX = (i) => i * laneW + laneW / 2;
  function move(d) { if (dead) return; const n = Math.max(0, Math.min(LANES - 1, lane + d)); if (n !== lane) { lane = n; api.sfx('tap'); } }

  function spawn() {
    // Never block all lanes: leave at least one lane open in every row.
    const open = Math.floor(rand() * LANES);
    const count = rand() < Math.min(.55, .2 + dist / 6000) ? 2 : 1;
    const lanes = [0, 1, 2].filter((l) => l !== open).sort(() => rand() - .5).slice(0, count);
    lanes.forEach((l) => traffic.push({ lane: l, y: -carH, hue: [12, 200, 160, 285][Math.floor(rand() * 4)], v: .55 + rand() * .3 }));
  }

  function update(dt) {
    if (dead) return;
    if (keys.ArrowLeft) { move(-1); keys.ArrowLeft = false; }
    if (keys.ArrowRight) { move(1); keys.ArrowRight = false; }
    x += (laneX(lane) - x) * Math.min(1, dt * 14);
    speed += dt * 9 * speedK;
    dist += speed * dt / 10;
    spawnT -= dt;
    if (spawnT <= 0) { spawn(); spawnT = Math.max(.42, 1.05 - dist / 2600) / speedK; }
    traffic.forEach((t) => { t.y += speed * t.v * dt; });
    traffic = traffic.filter((t) => t.y < H + carH);
    const py = H - 150;
    for (const t of traffic) {
      if (Math.abs(laneX(t.lane) - x) < carW * .8 && Math.abs(t.y - py) < carH * .82) { dead = true; api.sfx('hit'); setTimeout(() => api.end({ score: Math.floor(dist), summary: 'Collision!' }), 450); }
    }
    api.setScore(Math.floor(dist));
    stars.forEach((s) => { s.y += speed * s.k * dt * .25; if (s.y > H) { s.y = 0; s.x = rand() * W; } });
  }

  function car(cx, cy, body, glow) {
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, carH * .52, carW * .55, 10, 0, 0, 7); ctx.fill();
    const g = ctx.createLinearGradient(0, -carH / 2, 0, carH / 2); g.addColorStop(0, body[0]); g.addColorStop(1, body[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 18); ctx.fill();
    ctx.fillStyle = 'rgba(7,24,39,.85)'; ctx.beginPath(); ctx.roundRect(-carW / 2 + 9, -carH / 2 + 16, carW - 18, 26, 9); ctx.fill();
    ctx.fillStyle = glow; ctx.fillRect(-carW / 2 + 6, carH / 2 - 8, 12, 4); ctx.fillRect(carW / 2 - 18, carH / 2 - 8, 12, 4);
    ctx.restore();
  }

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#05090F'); sky.addColorStop(1, '#0B2236');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#EAF1F8'; stars.forEach((s) => { ctx.globalAlpha = s.k; ctx.fillRect(s.x, s.y, s.s, s.s * 3); }); ctx.globalAlpha = 1;
    // Lane markers scroll with distance.
    ctx.strokeStyle = 'rgba(246,201,107,.35)'; ctx.lineWidth = 3; ctx.setLineDash([26, 30]); ctx.lineDashOffset = -(dist * 10) % 56;
    for (let i = 1; i < LANES; i++) { ctx.beginPath(); ctx.moveTo(i * laneW, 0); ctx.lineTo(i * laneW, H); ctx.stroke(); }
    ctx.setLineDash([]);
    traffic.forEach((t) => car(laneX(t.lane), t.y, [`hsl(${t.hue} 55% 58%)`, `hsl(${t.hue} 50% 32%)`], '#ff8a6a'));
    car(x, H - 150, ['#F6C96B', '#B98A2E'], '#EAF1F8');
    if (dead) { ctx.fillStyle = 'rgba(224,102,59,.25)'; ctx.fillRect(0, 0, W, H); }
  }

  const loop = api.loop((dt) => { update(dt); draw(); });
  const onKey = (e) => {
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) keys.ArrowLeft = true;
    if (['ArrowRight', 'd', 'D'].includes(e.key)) keys.ArrowRight = true;
  };
  const onPointer = (e) => { const p = toLocal(e); move(p.x < W / 2 ? -1 : 1); };
  window.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', onPointer);
  reset();

  return {
    start() { draw(); loop.start(); },
    pause() { loop.stop(); },
    resume() { loop.start(); },
    destroy() { loop.stop(); window.removeEventListener('keydown', onKey); canvas.removeEventListener('pointerdown', onPointer); }
  };
}
