/* Penalty Strike: five penalties against a keeper. A gold marker sweeps across
   the goal: the first tap locks the aim, the second locks the power (which sets
   the height; too much sails over the bar). The keeper reads the shot better on
   harder difficulties and learns the side you favour. Score is goals scored. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx, toLocal } = api.canvas();
  const rand = api.rng();
  const FONT = (s, w = 600) => `${w} ${s}px Outfit, system-ui, sans-serif`;
  const D = {
    easy: { read: .28, react: .3, speed: 240, sweep: 1.7, bar: 1.5 },
    normal: { read: .45, react: .22, speed: 290, sweep: 2.2, bar: 1.9 },
    hard: { read: .62, react: .15, speed: 345, sweep: 2.7, bar: 2.35 }
  }[api.options.difficulty] || { read: .45, react: .22, speed: 290, sweep: 2.2, bar: 1.9 };
  const SHOTS = 5;
  const GL = 90, GR = 390, BAR = 190, GROUND = 330, POST = 6;
  const SPOT = { x: 240, y: 612 }, BALL_R = 22;
  const OVER = .8; // power above this flies over the bar
  const KEEP_Y = GROUND - 52; // keeper's centre (chest) height when standing

  let phase = 'ready', clock = 0, phaseT = 0, aimX = 240, power = 0, shotN = 0, goals = 0;
  let results = [], history = [], msg = '', msgCol = '#EAF1F8', over = false, endT = -1;
  let ball, keeper, shot, ripple = 0, rippleX = 240, rippleY = 260;
  const crowd = Array.from({ length: 260 }, () => ({ x: rand() * W, y: 66 + rand() * 100, r: .8 + rand() * 1.4, c: rand() }));

  function newShot() {
    phase = 'aim'; phaseT = 0; power = 0; shot = null; msg = '';
    ball = { x: SPOT.x, y: SPOT.y, s: 1, vx: 0, vy: 0, vs: 0, spin: 0, alpha: 1, free: false };
    keeper = { x: 240, y: KEEP_Y, tx: 240, ty: KEEP_Y, diving: false, delay: 0, lean: 0 };
    api.setStatus(`Shot ${shotN + 1} of ${SHOTS}`);
  }

  // Goal-plane height for a given power (0 = ground shot, OVER = just under the bar).
  const heightFor = (p) => p <= OVER ? (GROUND - 16) - (p / OVER) * (GROUND - 16 - (BAR + 14)) : BAR + 14 - (p - OVER) * 320;

  function side(x) { return x < 200 ? -1 : x > 280 ? 1 : 0; }

  function shoot() {
    const tx = aimX, ty = heightFor(power), T = .95 - .45 * Math.min(1, power);
    let kind = 'goal';
    if (Math.abs(tx - GL) < POST + 4 || Math.abs(tx - GR) < POST + 4) kind = 'post';
    else if (tx < GL || tx > GR) kind = 'wide';
    else if (Math.abs(ty - BAR) < 9) kind = 'bar';
    else if (ty < BAR) kind = 'over';
    shot = { tx, ty, T, t: 0, kind, side: side(tx) };
    // Keeper's read: harder keepers guess right more often, corners are harder to read,
    // and a side you keep choosing becomes predictable.
    const same = history.filter((s) => s === shot.side).length;
    let p = D.read + same * .08 - (Math.abs(tx - 240) > 105 ? .12 : 0);
    let gs = shot.side;
    if (rand() > p) { const others = [-1, 0, 1].filter((s) => s !== shot.side); gs = others[Math.floor(rand() * 2)]; }
    const gx = gs === shot.side ? tx + (rand() - .5) * 40 : 240 + gs * (80 + rand() * 60);
    const gy = gs === shot.side ? ty + (rand() - .5) * 30 : KEEP_Y - rand() * 40;
    keeper.tx = Math.max(GL - 10, Math.min(GR + 10, gx));
    keeper.ty = Math.max(BAR + 44, Math.min(KEEP_Y, gy));
    keeper.delay = D.react; keeper.diving = true;
    history.push(shot.side);
    phase = 'flight'; phaseT = 0; api.sfx('tap');
  }

  function resolve() {
    const { tx, ty } = shot;
    ball.x = tx; ball.y = ty; ball.free = true;
    const dx = (tx - keeper.x) / 52, dy = (ty - keeper.y) / 44;
    const onTarget = shot.kind === 'goal';
    let scored = false;
    if (onTarget && dx * dx + dy * dy < 1) {
      msg = 'Saved!'; msgCol = '#E0663B'; api.sfx('hit');
      const a = Math.atan2(ty - keeper.y, tx - keeper.x);
      ball.vx = Math.cos(a) * 260; ball.vy = Math.sin(a) * 160 + 120; ball.vs = .9;
    } else if (onTarget) {
      scored = true; goals++; api.setScore(goals);
      msg = 'GOAL!'; msgCol = '#F6C96B'; api.sfx('point');
      ripple = 1; rippleX = tx; rippleY = ty;
      ball.vx = (tx - 240) * .25; ball.vy = -40; ball.vs = -.25;
    } else if (shot.kind === 'post' || shot.kind === 'bar') {
      msg = shot.kind === 'post' ? 'Off the post!' : 'Off the bar!'; msgCol = '#E0663B'; api.sfx('hit');
      ball.vx = (240 - tx) * .9; ball.vy = shot.kind === 'bar' ? -60 : 80; ball.vs = 1.1;
    } else {
      msg = shot.kind === 'over' ? 'Over the bar' : 'Wide'; msgCol = '#8EA3B8'; api.sfx('lose');
      ball.vx = (tx - SPOT.x) * 1.1; ball.vy = (ty - SPOT.y) * .6; ball.vs = -.35;
    }
    results.push(scored);
    shotN++;
    phase = 'result'; phaseT = 0;
  }

  function finish() {
    over = true;
    const summary = goals === SHOTS ? 'Perfect! 5 of 5 scored' : `${goals} of ${SHOTS} scored`;
    api.end({ score: goals, won: goals >= 3, summary });
  }

  function tap() {
    if (over) return;
    if (phase === 'ready') { newShot(); api.sfx('tap'); }
    else if (phase === 'aim') { phase = 'power'; phaseT = 0; api.sfx('tap'); }
    else if (phase === 'power') shoot();
  }

  function update(dt) {
    clock += dt; phaseT += dt;
    if (ripple > 0) ripple = Math.max(0, ripple - dt * 1.4);
    const k = 1 + shotN * .07;
    if (phase === 'aim') aimX = 240 + 178 * Math.sin(phaseT * D.sweep * k - Math.PI / 2 + .9);
    if (phase === 'power') power = .5 - .5 * Math.cos(phaseT * D.bar * k * 1.6);
    if (phase === 'aim' || phase === 'power' || phase === 'ready') {
      // A restless keeper shuffles on the line before the kick.
      keeper.x = 240 + Math.sin(clock * 2.3) * 14; keeper.y = KEEP_Y; keeper.lean = Math.sin(clock * 2.3) * .05;
    }
    if (phase === 'flight' || phase === 'result') {
      if (keeper.diving) {
        if (keeper.delay > 0) keeper.delay -= dt;
        else {
          const dx = keeper.tx - keeper.x, dy = keeper.ty - keeper.y, d = Math.hypot(dx, dy), m = D.speed * dt;
          if (d > m) { keeper.x += dx / d * m; keeper.y += dy / d * m; } else { keeper.x = keeper.tx; keeper.y = keeper.ty; keeper.diving = false; }
        }
      }
      keeper.lean = Math.max(-1.25, Math.min(1.25, (keeper.x - 240) / 110));
    }
    if (phase === 'flight') {
      shot.t += dt;
      const e = Math.min(1, shot.t / shot.T), ee = 1 - Math.pow(1 - e, 1.6);
      ball.x = SPOT.x + (shot.tx - SPOT.x) * ee;
      ball.y = SPOT.y + (shot.ty - SPOT.y) * ee - Math.sin(Math.PI * e) * (24 + 50 * power);
      ball.s = 1 - .6 * ee; ball.spin += dt * 14;
      ball.gy = SPOT.y + 16 + (GROUND - 18 - SPOT.y) * ee;
      if (e >= 1) resolve();
    } else if (phase === 'result') {
      if (ball.free) {
        ball.vy += 520 * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        ball.s = Math.max(.22, Math.min(1.1, ball.s + ball.vs * dt)); ball.spin += dt * 6;
        if (results[results.length - 1] && ball.y > GROUND - 8) { ball.y = GROUND - 8; ball.vy *= -.3; ball.vx *= .6; }
        if (phaseT > .9) ball.alpha = Math.max(0, ball.alpha - dt * 2.5);
      }
      if (phaseT > 1.6) {
        if (shotN >= SHOTS) { phase = 'done'; endT = .2; }
        else newShot();
      }
    } else if (phase === 'done' && endT > 0) {
      endT -= dt; if (endT <= 0 && !over) finish();
    }
  }

  // ---------- drawing ----------
  function drawStadium() {
    const sky = ctx.createLinearGradient(0, 0, 0, 180); sky.addColorStop(0, '#05090F'); sky.addColorStop(1, '#0B2236');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 180);
    for (const fx of [40, W - 40]) {
      const g = ctx.createRadialGradient(fx, 24, 2, fx, 24, 150); g.addColorStop(0, 'rgba(246,221,160,.5)'); g.addColorStop(1, 'rgba(246,201,107,0)');
      ctx.fillStyle = g; ctx.fillRect(fx - 150, 0, 300, 180);
      ctx.fillStyle = '#EAF1F8'; ctx.beginPath(); ctx.roundRect(fx - 16, 18, 32, 10, 3); ctx.fill();
    }
    ctx.fillStyle = '#0A1522'; ctx.fillRect(0, 62, W, 110);
    for (const c of crowd) {
      ctx.globalAlpha = .25 + c.c * .35;
      ctx.fillStyle = c.c > .85 ? '#F6C96B' : c.c > .5 ? '#8EA3B8' : '#3B5266';
      ctx.fillRect(c.x, c.y, c.r * 2, c.r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#132A3D'; ctx.fillRect(0, 164, W, 10);
    ctx.fillStyle = 'rgba(246,201,107,.5)'; ctx.fillRect(0, 164, W, 2);
    const pitch = ctx.createLinearGradient(0, 174, 0, H); pitch.addColorStop(0, '#0E241B'); pitch.addColorStop(1, '#1A4532');
    ctx.fillStyle = pitch; ctx.fillRect(0, 174, W, H - 174);
    // Mown stripes, deeper towards the camera.
    let y = 174, h = 14, i = 0;
    while (y < H) { if (i % 2) { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(0, y, W, h); } y += h; h *= 1.22; i++; }
    // Pitch markings.
    ctx.strokeStyle = 'rgba(234,241,248,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, GROUND); ctx.lineTo(18, 384); ctx.lineTo(462, 384); ctx.lineTo(440, GROUND); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-60, 520); ctx.lineTo(540, 520); ctx.stroke();
    ctx.fillStyle = 'rgba(234,241,248,.6)'; ctx.beginPath(); ctx.ellipse(SPOT.x, SPOT.y + 16, 9, 4, 0, 0, 7); ctx.fill();
  }

  function drawGoal() {
    // Net: a back frame set into the distance and a soft mesh.
    const bx0 = GL + 26, bx1 = GR - 26, by0 = BAR - 26, by1 = GROUND - 14;
    ctx.fillStyle = 'rgba(5,9,15,.45)';
    ctx.beginPath(); ctx.moveTo(GL, BAR); ctx.lineTo(bx0, by0); ctx.lineTo(bx1, by0); ctx.lineTo(GR, BAR); ctx.lineTo(GR, GROUND); ctx.lineTo(bx1, by1); ctx.lineTo(bx0, by1); ctx.lineTo(GL, GROUND); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(234,241,248,.16)'; ctx.lineWidth = 1;
    const rip = (x, y) => {
      if (ripple <= 0) return 0;
      const d = Math.hypot(x - rippleX, y - rippleY);
      return d < 90 ? -(1 - d / 90) * 16 * ripple : 0;
    };
    for (let x = bx0; x <= bx1 + .1; x += 14) { ctx.beginPath(); for (let y = by0; y <= by1; y += 8) { const o = rip(x, y); y === by0 ? ctx.moveTo(x, y + o) : ctx.lineTo(x, y + o); } ctx.stroke(); }
    for (let y = by0; y <= by1 + .1; y += 14) { ctx.beginPath(); for (let x = bx0; x <= bx1; x += 8) { const o = rip(x, y); x === bx0 ? ctx.moveTo(x, y + o) : ctx.lineTo(x, y + o); } ctx.stroke(); }
    for (let i = 0; i <= 6; i++) { const f = i / 6; ctx.beginPath(); ctx.moveTo(GL + (bx0 - GL) * f, BAR + (by0 - BAR) * f); ctx.lineTo(GL + (bx0 - GL) * f, GROUND + (by1 - GROUND) * f); ctx.stroke(); ctx.beginPath(); ctx.moveTo(GR + (bx1 - GR) * f, BAR + (by0 - BAR) * f); ctx.lineTo(GR + (bx1 - GR) * f, GROUND + (by1 - GROUND) * f); ctx.stroke(); }
  }

  function drawFrame() {
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(GL - 4, GROUND - 2, GR - GL + 8, 5);
    const post = ctx.createLinearGradient(0, 0, POST, 0); post.addColorStop(0, '#FFFFFF'); post.addColorStop(1, '#B9C6D3');
    ctx.fillStyle = '#EAF1F8';
    ctx.fillRect(GL - POST / 2, BAR - POST / 2, GR - GL + POST, POST);
    ctx.fillRect(GL - POST / 2, BAR - POST / 2, POST, GROUND - BAR + POST / 2);
    ctx.fillRect(GR - POST / 2, BAR - POST / 2, POST, GROUND - BAR + POST / 2);
    ctx.fillStyle = 'rgba(142,163,184,.6)';
    ctx.fillRect(GL - POST / 2, BAR + 1, GR - GL + POST, 2);
  }

  function drawKeeper() {
    const { x, y, lean } = keeper;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, GROUND - 2, 34, 6, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.rotate(lean);
    const reach = Math.min(1, Math.abs(lean) * 1.4 + (phase === 'flight' && !keeper.delay ? .2 : 0));
    // Legs.
    ctx.strokeStyle = '#0E1B29'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, 18); ctx.lineTo(-14, 50); ctx.moveTo(8, 18); ctx.lineTo(14, 50); ctx.stroke();
    // Arms: raised further when diving.
    ctx.strokeStyle = '#B9512C'; ctx.lineWidth = 9;
    const ay = -18 - reach * 26, ax = 28 + reach * 6;
    ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(-ax, ay); ctx.moveTo(14, -12); ctx.lineTo(ax, ay); ctx.stroke();
    ctx.fillStyle = '#EAF1F8';
    ctx.beginPath(); ctx.arc(-ax, ay, 7, 0, 7); ctx.arc(ax, ay, 7, 0, 7); ctx.fill();
    // Torso.
    const kit = ctx.createLinearGradient(0, -24, 0, 22); kit.addColorStop(0, '#E8774B'); kit.addColorStop(1, '#A9472A');
    ctx.fillStyle = kit; ctx.beginPath(); ctx.roundRect(-17, -26, 34, 46, 12); ctx.fill();
    ctx.fillStyle = 'rgba(5,9,15,.25)'; ctx.fillRect(-17, 4, 34, 4);
    ctx.fillStyle = '#C89A7A'; ctx.beginPath(); ctx.arc(0, -36, 10, 0, 7); ctx.fill();
    ctx.fillStyle = '#1B1410'; ctx.beginPath(); ctx.arc(0, -39, 10, Math.PI, 0); ctx.fill();
    ctx.restore();
  }

  function drawBall() {
    if (ball.alpha <= 0) return;
    const r = BALL_R * ball.s;
    ctx.globalAlpha = ball.alpha;
    if (phase !== 'result' || !ball.free) {
      const gy = ball.gy || SPOT.y + 16;
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(ball.x, gy, r * 1.05, r * .32, 0, 0, 7); ctx.fill();
    }
    const g = ctx.createRadialGradient(ball.x - r * .35, ball.y - r * .4, r * .1, ball.x, ball.y, r);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(.7, '#DCE4EC'); g.addColorStop(1, '#8EA3B8');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ball.x, ball.y, r, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(ball.x, ball.y, r, 0, 7); ctx.clip();
    ctx.fillStyle = '#122335';
    for (let i = 0; i < 5; i++) {
      const a = ball.spin + i * 1.2566, px = ball.x + Math.cos(a) * r * .62, py = ball.y + Math.sin(a) * r * .62 * .9;
      ctx.beginPath(); ctx.arc(px, py, r * .22, 0, 7); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(ball.x + Math.cos(ball.spin) * r * .08, ball.y, r * .26, 0, 7); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawAim() {
    if (phase !== 'aim' && phase !== 'power') return;
    const ty = phase === 'power' ? heightFor(power) : (GROUND + BAR) / 2;
    ctx.strokeStyle = 'rgba(246,201,107,.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.moveTo(SPOT.x, SPOT.y - 20); ctx.lineTo(aimX, ty); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(aimX, ty);
    ctx.shadowColor = 'rgba(246,201,107,.7)'; ctx.shadowBlur = 12;
    ctx.strokeStyle = '#F6C96B'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-8, 0); ctx.moveTo(22, 0); ctx.lineTo(8, 0); ctx.moveTo(0, -22); ctx.lineTo(0, -8); ctx.moveTo(0, 22); ctx.lineTo(0, 8); ctx.stroke();
    ctx.restore();
  }

  function drawPowerBar() {
    if (phase !== 'power' && phase !== 'aim') return;
    const x = 430, y0 = 420, h = 200, w = 20;
    ctx.fillStyle = 'rgba(5,9,15,.6)'; ctx.beginPath(); ctx.roundRect(x - 4, y0 - 4, w + 8, h + 8, 12); ctx.fill();
    ctx.fillStyle = 'rgba(224,102,59,.35)'; ctx.beginPath(); ctx.roundRect(x, y0, w, h * (1 - OVER), [8, 8, 0, 0]); ctx.fill();
    ctx.fillStyle = 'rgba(142,163,184,.18)'; ctx.fillRect(x, y0 + h * (1 - OVER), w, h * OVER);
    const p = phase === 'power' ? power : 0;
    const g = ctx.createLinearGradient(0, y0 + h, 0, y0); g.addColorStop(0, '#B98A2E'); g.addColorStop(.75, '#F6C96B'); g.addColorStop(1, '#E0663B');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y0 + h * (1 - p), w, h * p, 6); ctx.fill();
    ctx.fillStyle = '#EAF1F8'; ctx.fillRect(x - 6, y0 + h * (1 - OVER) - 1, w + 12, 2);
    ctx.fillStyle = '#8EA3B8'; ctx.font = FONT(12); ctx.textAlign = 'center'; ctx.fillText('POWER', x + w / 2, y0 + h + 22);
  }

  function drawHud() {
    // Shot dots.
    const cx = W / 2, y = 34;
    ctx.fillStyle = 'rgba(5,9,15,.55)'; ctx.beginPath(); ctx.roundRect(cx - 86, y - 18, 172, 36, 18); ctx.fill();
    for (let i = 0; i < SHOTS; i++) {
      const x = cx - 64 + i * 32;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, 7);
      if (i < results.length) { ctx.fillStyle = results[i] ? '#F6C96B' : '#E0663B'; ctx.fill(); }
      else { ctx.strokeStyle = i === results.length && phase !== 'ready' ? '#EAF1F8' : 'rgba(142,163,184,.6)'; ctx.lineWidth = 2; ctx.stroke(); }
    }
    ctx.textAlign = 'center';
    if (phase === 'aim' || phase === 'power') {
      ctx.fillStyle = 'rgba(234,241,248,.85)'; ctx.font = FONT(18);
      ctx.fillText(phase === 'aim' ? 'Tap to lock your aim' : 'Tap to set the power', W / 2, H - 34);
    }
    if (phase === 'result' && msg) {
      const a = Math.min(1, phaseT * 5);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(5,9,15,.6)'; ctx.beginPath(); ctx.roundRect(W / 2 - 130, 400, 260, 64, 20); ctx.fill();
      ctx.fillStyle = msgCol; ctx.font = FONT(34, 700); ctx.fillText(msg, W / 2, 444);
      ctx.globalAlpha = 1;
    }
    if (phase === 'ready') {
      ctx.fillStyle = 'rgba(5,9,15,.72)'; ctx.beginPath(); ctx.roundRect(50, 390, W - 100, 150, 22); ctx.fill();
      ctx.fillStyle = '#F6C96B'; ctx.font = FONT(30, 700); ctx.fillText('Five penalties', W / 2, 436);
      ctx.fillStyle = '#EAF1F8'; ctx.font = FONT(16); ctx.fillText('Tap once for aim, again for power.', W / 2, 468);
      ctx.fillStyle = '#8EA3B8'; ctx.fillText('Tap or press Space to start', W / 2, 508);
    }
  }

  function draw() {
    drawStadium(); drawGoal();
    const ballBehind = (phase === 'result' && results[results.length - 1]);
    if (ballBehind) drawBall();
    drawKeeper(); drawFrame();
    drawAim();
    if (!ballBehind) drawBall();
    drawPowerBar(); drawHud();
  }

  const loop = api.loop((dt) => { update(dt); draw(); });
  const onKey = (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) tap(); };
  const onPointer = (e) => { e.preventDefault(); toLocal(e); tap(); };
  window.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', onPointer);
  ball = { x: SPOT.x, y: SPOT.y, s: 1, vx: 0, vy: 0, vs: 0, spin: 0, alpha: 1, free: false };
  keeper = { x: 240, y: KEEP_Y, tx: 240, ty: KEEP_Y, diving: false, delay: 0, lean: 0 };

  return {
    start() { api.setStatus(`Shot 1 of ${SHOTS}`); draw(); loop.start(); },
    pause() { loop.stop(); },
    resume() { loop.start(); },
    destroy() { over = true; loop.stop(); window.removeEventListener('keydown', onKey); canvas.removeEventListener('pointerdown', onPointer); }
  };
}
