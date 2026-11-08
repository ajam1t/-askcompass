/* Merge Tiles: slide every tile on the board at once; two equal tiles that
   meet merge into one of double the value. Score is the sum of all merges.
   The round ends when no move is left. Reaching 2048 counts as a win, and the
   player may keep going. Easy plays on a roomier 5x5 board; hard spawns more 4s. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx, toLocal } = api.canvas();
  const rand = api.rng();
  const diff = api.options.difficulty;
  const N = diff === 'easy' ? 5 : 4;
  const FOUR = diff === 'hard' ? .25 : .1;
  const BX = 20, BY = 150, BOARD = 440, GAP = N === 5 ? 10 : 12;
  const CELL = (BOARD - GAP * (N + 1)) / N;
  const SLIDE = .11, POP = .15;
  const FONT = (w, s) => `${w} ${s}px Outfit, system-ui, sans-serif`;
  // Brass to champagne gold to ivory as the tiles climb.
  const STYLE = [
    ['#4F4430', '#3A3224', '#EAF1F8'], ['#62502F', '#483A23', '#EAF1F8'], ['#7C5F2C', '#5C4520', '#F8EBD0'],
    ['#97702D', '#73521F', '#FFF4DE'], ['#B3842F', '#8C6322', '#FFF8EA'], ['#CC9838', '#A5772A', '#FFFBF2'],
    ['#E2B04E', '#C08F33', '#071827'], ['#EFC160', '#D2A043', '#071827'], ['#F6CE74', '#E0AE4E', '#071827'],
    ['#F9DE9E', '#EBC271', '#071827'], ['#FCEFCB', '#F2D795', '#071827'], ['#F4F8FC', '#DCE6F0', '#071827']
  ];
  const DIRS = { left: [0, -1], right: [0, 1], up: [-1, 0], down: [1, 0] };
  const KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };

  let grid, tiles, ghosts, score, won, over, anim, toast, nextId, paused = false, destroyed = false, ended = false, swipe = null, endTimer = 0, endLeft = 0, endDue = 0;

  function reset() {
    grid = Array.from({ length: N }, () => Array(N).fill(null));
    tiles = []; ghosts = []; score = 0; won = false; over = false; anim = -1; toast = 0; nextId = 1;
    spawn(); spawn();
    tiles.forEach((t) => { t.kind = null; });
  }

  function spawn() {
    const empty = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) empty.push([r, c]);
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(rand() * empty.length)];
    const t = { id: nextId++, v: rand() < FOUR ? 4 : 2, r, c, fr: r, fc: c, shownV: 0, kind: 'new' };
    t.shownV = t.v; grid[r][c] = t; tiles.push(t);
  }

  const maxTile = () => tiles.reduce((m, t) => Math.max(m, t.v), 0);

  function canMove() {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const t = grid[r][c];
      if (!t) return true;
      if (c + 1 < N && grid[r][c + 1] && grid[r][c + 1].v === t.v) return true;
      if (r + 1 < N && grid[r + 1][c] && grid[r + 1][c].v === t.v) return true;
    }
    return false;
  }

  function move(name) {
    if (over || paused || destroyed) return;
    const [dr, dc] = DIRS[name];
    anim = -1; ghosts = [];
    tiles.forEach((t) => { t.fr = t.r; t.fc = t.c; t.kind = null; t.shownV = t.v; });
    let moved = false, gained = 0;
    for (let line = 0; line < N; line++) {
      // Cells of this row/column, starting from the edge the tiles slide towards.
      const cells = [];
      for (let k = 0; k < N; k++) { const i = dr + dc > 0 ? N - 1 - k : k; cells.push(dr ? [i, line] : [line, i]); }
      let pos = 0, last = null;
      for (const [r, c] of cells) {
        const t = grid[r][c];
        if (!t) continue;
        grid[r][c] = null;
        if (last && last.v === t.v && last.kind !== 'merge') {
          last.v *= 2; last.kind = 'merge'; gained += last.v; moved = true;
          ghosts.push({ v: t.v, fr: t.r, fc: t.c, r: last.r, c: last.c });
          tiles.splice(tiles.indexOf(t), 1);
        } else {
          const [nr, nc] = cells[pos++];
          if (nr !== r || nc !== c) moved = true;
          t.r = nr; t.c = nc; grid[nr][nc] = t; last = t;
        }
      }
    }
    if (!moved) return;
    score += gained;
    api.setScore(score);
    spawn();
    if (gained) api.sfx('tap');
    if (!won && maxTile() >= 2048) { won = true; toast = 2.6; api.sfx('win'); }
    status();
    if (!canMove()) { over = true; scheduleEnd(1100); }
    anim = 0; kick();
  }

  function status() { api.setStatus(`Best tile ${maxTile()}`); }

  function scheduleEnd(ms) {
    endDue = performance.now() + ms;
    endTimer = setTimeout(finish, ms);
  }
  function finish() {
    endTimer = 0;
    if (destroyed || ended) return;
    ended = true;
    const top = maxTile();
    api.end({ score, won, summary: won ? `You made ${top >= 4096 ? top : 2048}! Best tile ${top}` : `No moves left · best tile ${top}` });
  }

  // ---------- drawing ----------
  const cellX = (c) => BX + GAP + c * (CELL + GAP);
  const cellY = (r) => BY + GAP + r * (CELL + GAP);
  const ease = (t) => 1 - (1 - t) * (1 - t);

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

  function drawTile(x, y, v, s) {
    const k = Math.min(STYLE.length, Math.round(Math.log2(v))) - 1;
    const [top, bot, ink] = STYLE[k];
    const size = CELL * s, ox = x + (CELL - size) / 2, oy = y + (CELL - size) / 2, rad = Math.max(6, CELL * .16 * s);
    ctx.save();
    ctx.shadowColor = k >= 6 ? 'rgba(246,201,107,.45)' : 'rgba(0,0,0,.45)';
    ctx.shadowBlur = k >= 6 ? 18 + (k - 6) * 3 : 10; ctx.shadowOffsetY = k >= 6 ? 0 : 4;
    const g = ctx.createLinearGradient(0, oy, 0, oy + size); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; rr(ox, oy, size, size, rad); ctx.fill();
    ctx.restore();
    // Soft top sheen.
    ctx.fillStyle = 'rgba(255,255,255,.10)'; rr(ox + 3, oy + 3, size - 6, size * .42, rad * .8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; rr(ox + .5, oy + .5, size - 1, size - 1, rad); ctx.stroke();
    const d = String(v).length;
    const fs = CELL * s * (d <= 2 ? .44 : d === 3 ? .37 : d === 4 ? .3 : .24);
    ctx.fillStyle = ink; ctx.font = FONT(800, Math.round(fs)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(v), ox + size / 2, oy + size / 2 + fs * .05);
  }

  function chip(x, label, value) {
    const g = ctx.createLinearGradient(0, 66, 0, 130); g.addColorStop(0, 'rgba(234,241,248,.08)'); g.addColorStop(1, 'rgba(234,241,248,.03)');
    ctx.fillStyle = g; rr(x, 66, 212, 64, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(246,201,107,.18)'; ctx.lineWidth = 1; rr(x + .5, 66.5, 211, 63, 16); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#8EA3B8'; ctx.font = FONT(600, 14); ctx.fillText(label, x + 106, 88);
    ctx.fillStyle = '#EAF1F8'; ctx.font = FONT(700, 28); ctx.fillText(value, x + 106, 120);
  }

  function draw() {
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0B2236'); bg.addColorStop(.55, '#071827'); bg.addColorStop(1, '#05090F');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, BY + BOARD / 2, 40, W / 2, BY + BOARD / 2, 360);
    glow.addColorStop(0, 'rgba(246,201,107,.08)'); glow.addColorStop(1, 'rgba(246,201,107,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#F6C96B'; ctx.font = FONT(700, 15); ctx.letterSpacing = '4px';
    ctx.fillText('MERGE TILES', W / 2 + 2, 44); ctx.letterSpacing = '0px';
    chip(BX, 'SCORE', score.toLocaleString('en-IN'));
    chip(BX + 228, 'BEST TILE', String(maxTile()));

    // Board well.
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    const bw = ctx.createLinearGradient(0, BY, 0, BY + BOARD); bw.addColorStop(0, '#10283F'); bw.addColorStop(1, '#0A1B2C');
    ctx.fillStyle = bw; rr(BX, BY, BOARD, BOARD, 24); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(246,201,107,.16)'; ctx.lineWidth = 1.5; rr(BX + .75, BY + .75, BOARD - 1.5, BOARD - 1.5, 24); ctx.stroke();
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      ctx.fillStyle = 'rgba(5,9,15,.45)'; rr(cellX(c), cellY(r), CELL, CELL, CELL * .16); ctx.fill();
      ctx.strokeStyle = 'rgba(234,241,248,.05)'; ctx.lineWidth = 1; rr(cellX(c) + .5, cellY(r) + .5, CELL - 1, CELL - 1, CELL * .16); ctx.stroke();
    }

    const sp = anim < 0 ? 1 : ease(Math.min(1, anim / SLIDE));
    const pp = anim < 0 ? 1 : Math.max(0, Math.min(1, (anim - SLIDE) / POP));
    const at = (o) => [cellX(o.fc) + (cellX(o.c) - cellX(o.fc)) * sp, cellY(o.fr) + (cellY(o.r) - cellY(o.fr)) * sp];
    if (sp < 1) ghosts.forEach((g) => { const [x, y] = at(g); drawTile(x, y, g.v, 1); });
    for (const t of tiles) {
      if (t.kind === 'new') { if (sp < 1) continue; drawTile(cellX(t.c), cellY(t.r), t.v, .3 + .7 * ease(pp)); continue; }
      const [x, y] = at(t);
      if (t.kind === 'merge') drawTile(x, y, sp < 1 ? t.shownV : t.v, sp < 1 ? 1 : 1 + .14 * Math.sin(Math.PI * pp));
      else drawTile(x, y, t.v, 1);
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (toast > 0) {
      const a = Math.min(1, toast / .4, (2.6 - toast) / .25 + .01);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = 'rgba(5,9,15,.82)'; rr(W / 2 - 170, BY + BOARD / 2 - 46, 340, 92, 20); ctx.fill();
      ctx.strokeStyle = 'rgba(246,201,107,.6)'; ctx.lineWidth = 1.5; rr(W / 2 - 169.5, BY + BOARD / 2 - 45.5, 339, 91, 20); ctx.stroke();
      ctx.fillStyle = '#F6C96B'; ctx.font = FONT(800, 30); ctx.fillText('2048!', W / 2, BY + BOARD / 2 - 6);
      ctx.fillStyle = '#EAF1F8'; ctx.font = FONT(600, 17); ctx.fillText('You won. Keep merging.', W / 2, BY + BOARD / 2 + 26);
      ctx.globalAlpha = 1;
    }
    if (over) {
      ctx.fillStyle = 'rgba(5,9,15,.62)'; rr(BX, BY, BOARD, BOARD, 24); ctx.fill();
      ctx.fillStyle = '#EAF1F8'; ctx.font = FONT(700, 30); ctx.fillText('No moves left', W / 2, BY + BOARD / 2);
      ctx.fillStyle = '#8EA3B8'; ctx.font = FONT(600, 17); ctx.fillText(`Best tile ${maxTile()}`, W / 2, BY + BOARD / 2 + 32);
    }
    ctx.fillStyle = '#8EA3B8'; ctx.font = FONT(600, 17);
    ctx.fillText(won ? '2048 made · keep merging for a bigger tile' : 'Swipe or use the arrow keys · reach 2048', W / 2, 622);
  }

  // ---------- loop (animations only) ----------
  const idle = () => anim < 0 && toast <= 0;
  const loop = api.loop((dt) => {
    if (anim >= 0) { anim += dt; if (anim >= SLIDE + POP) anim = -1; }
    if (toast > 0) toast = Math.max(0, toast - dt);
    draw();
    if (idle()) queueMicrotask(() => { if (idle()) loop.stop(); });
  });
  const kick = () => { if (!paused && !destroyed) loop.start(); };

  // ---------- input ----------
  const onKey = (e) => {
    const d = KEYS[e.key];
    if (!d || paused) return;
    e.preventDefault();
    move(d);
  };
  const onDown = (e) => {
    if (paused) return;
    e.preventDefault();
    swipe = { id: e.pointerId, ...toLocal(e) };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
  };
  const onUp = (e) => {
    if (!swipe || swipe.id !== e.pointerId) return;
    const p = toLocal(e), dx = p.x - swipe.x, dy = p.y - swipe.y;
    swipe = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 26) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  };
  const onCancel = () => { swipe = null; };
  window.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);

  reset();

  return {
    start() { status(); api.setScore(0); anim = 0; draw(); kick(); },
    pause() {
      paused = true; loop.stop(); swipe = null;
      if (endTimer) { clearTimeout(endTimer); endTimer = 0; endLeft = Math.max(0, endDue - performance.now()); }
    },
    resume() {
      paused = false; draw(); kick();
      if (over && !ended && !endTimer) scheduleEnd(endLeft || 300);
    },
    destroy() {
      destroyed = true; loop.stop(); clearTimeout(endTimer);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
    }
  };
}
