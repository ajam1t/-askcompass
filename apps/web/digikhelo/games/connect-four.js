/* Connect Four: drop discs into a 7x6 frame and line up four in a row.
   Solo: you (gold) against a minimax computer (copper). Local: two players
   alternate on one device. Score in solo is 1 for a win, 0 otherwise. */
export function create(stage, api) {
  const W = api.width, H = api.height;
  const { canvas, ctx, toLocal } = api.canvas();
  const rand = api.rng();
  const COLS = 7, ROWS = 6, CELL = 68, BX = (W - COLS * CELL) / 2, BY = 80, R = 26;
  const solo = api.options.mode !== 'local2p';
  const diff = api.options.difficulty || 'normal';
  const depth = { easy: 2, normal: 4, hard: 6 }[diff] || 4;
  const NAME = solo ? ['', 'You', 'Computer'] : ['', 'Player 1', 'Player 2'];

  // board[c][r], r = 0 is the bottom row. 0 empty, 1 gold, 2 copper.
  const board = Array.from({ length: COLS }, () => new Array(ROWS).fill(0));
  const heights = new Array(COLS).fill(0);
  let turn = 1, cursor = 3, over = false, destroyed = false, paused = false;
  let anim = null, winCells = null, winT = 0, aiTimer = 0, endTimer = 0, aiPending = false, moves = 0, t = 0;

  const isHuman = () => !solo || turn === 1;
  const colX = (c) => BX + c * CELL + CELL / 2;
  const rowY = (r) => BY + (ROWS - 1 - r) * CELL + CELL / 2;

  function status() {
    if (over) return;
    if (solo) api.setStatus(turn === 1 ? 'Your turn' : 'Computer is thinking…');
    else api.setStatus(`${NAME[turn]}'s turn`);
  }

  // ---------- rules ----------
  function findWin(b, p) {
    const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      if (b[c][r] !== p) continue;
      for (const [dc, dr] of dirs) {
        const ec = c + dc * 3, er = r + dr * 3;
        if (ec < 0 || ec >= COLS || er < 0 || er >= ROWS) continue;
        if (b[c + dc][r + dr] === p && b[c + 2 * dc][r + 2 * dr] === p && b[ec][er] === p) return [[c, r], [c + dc, r + dr], [c + 2 * dc, r + 2 * dr], [ec, er]];
      }
    }
    return null;
  }

  // ---------- computer opponent: minimax with alpha-beta ----------
  const ORDER = [3, 2, 4, 1, 5, 0, 6];
  const WINDOWS = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const ec = c + dc * 3, er = r + dr * 3;
    if (ec >= 0 && ec < COLS && er >= 0 && er < ROWS) WINDOWS.push([c, r, dc, dr]);
  }
  function evaluate(b, me) {
    const op = 3 - me; let s = 0;
    for (let r = 0; r < ROWS; r++) { if (b[3][r] === me) s += 3; else if (b[3][r] === op) s -= 3; }
    for (const [c, r, dc, dr] of WINDOWS) {
      let m = 0, o = 0;
      for (let k = 0; k < 4; k++) { const v = b[c + dc * k][r + dr * k]; if (v === me) m++; else if (v === op) o++; }
      if (m && o) continue;
      if (m === 3) s += 5; else if (m === 2) s += 2;
      if (o === 3) s -= 6; else if (o === 2) s -= 2;
    }
    return s;
  }
  // Fast check whether the disc just placed at (c, r) completes four.
  function wins(b, c, r) {
    const p = b[c][r];
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      let n = 1;
      for (let k = 1; k < 4; k++) { const x = c + dc * k, y = r + dr * k; if (x < 0 || x >= COLS || y < 0 || y >= ROWS || b[x][y] !== p) break; n++; }
      for (let k = 1; k < 4; k++) { const x = c - dc * k, y = r - dr * k; if (x < 0 || x >= COLS || y < 0 || y >= ROWS || b[x][y] !== p) break; n++; }
      if (n >= 4) return true;
    }
    return false;
  }
  function search(b, h, d, alpha, beta, player, me, filled) {
    if (filled === COLS * ROWS) return 0;
    if (d === 0) return evaluate(b, me);
    const maxing = player === me;
    let best = maxing ? -Infinity : Infinity;
    for (const c of ORDER) {
      if (h[c] >= ROWS) continue;
      const r = h[c]; b[c][r] = player; h[c]++;
      let v;
      if (wins(b, c, r)) v = (maxing ? 1 : -1) * (100000 + d);
      else v = search(b, h, d - 1, alpha, beta, 3 - player, me, filled + 1);
      h[c]--; b[c][r] = 0;
      if (maxing) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }
  function chooseMove() {
    const legal = ORDER.filter((c) => heights[c] < ROWS);
    if (diff === 'easy' && rand() < .3) return legal[Math.floor(rand() * legal.length)];
    const b = board.map((col) => col.slice()), h = heights.slice();
    let best = -Infinity, picks = [];
    for (const c of legal) {
      const r = h[c]; b[c][r] = 2; h[c]++;
      const v = wins(b, c, r) ? 1000000 : search(b, h, depth - 1, -Infinity, Infinity, 1, 2, moves + 1);
      h[c]--; b[c][r] = 0;
      if (v > best) { best = v; picks = [c]; } else if (v === best) picks.push(c);
    }
    // Ties keep a little variety so games don't repeat move for move.
    return picks[Math.floor(rand() * picks.length)];
  }
  function scheduleAI() {
    if (over || destroyed) return;
    aiPending = true;
    clearTimeout(aiTimer);
    aiTimer = setTimeout(() => {
      aiTimer = 0;
      if (destroyed || over) return;
      if (paused) return; // resume() reschedules
      aiPending = false;
      const c = chooseMove();
      if (c !== undefined) { cursor = c; drop(c); }
    }, 380);
  }

  // ---------- play ----------
  function drop(c) {
    if (over || anim || heights[c] >= ROWS) return false;
    const r = heights[c]; heights[c]++;
    anim = { c, r, p: turn, y: BY - CELL * .6, vy: 0, ty: rowY(r), bounced: false };
    api.sfx('tap');
    loop.start();
    return true;
  }
  function land() {
    const { c, r, p } = anim; anim = null;
    board[c][r] = p; moves++;
    const w = findWin(board, p);
    if (w) {
      over = true; winCells = w; winT = 0;
      const youWin = solo ? p === 1 : true;
      api.sfx(youWin ? 'point' : 'hit');
      if (solo) api.setScore(p === 1 ? 1 : 0); else api.setScore(1);
      api.setStatus(solo ? (p === 1 ? 'Four in a row!' : 'Computer lines up four') : `${NAME[p]} lines up four`);
      finish({ score: solo ? (p === 1 ? 1 : 0) : 1, won: youWin, summary: solo ? (p === 1 ? 'You win!' : 'Computer wins') : `${NAME[p]} wins` }, 1700);
      return;
    }
    if (moves === COLS * ROWS) {
      over = true; api.setStatus('The board is full');
      finish({ score: 0, won: false, summary: 'Draw' }, 1200);
      return;
    }
    turn = 3 - turn; status();
    if (solo && turn === 2) scheduleAI();
  }

  // End after a short beat; if the game is paused then, end on resume instead.
  let pendingEnd = null;
  function finish(result, ms) {
    endTimer = setTimeout(() => {
      endTimer = 0;
      if (destroyed) return;
      if (paused) { pendingEnd = result; return; }
      loop.stop(); api.end(result);
    }, ms);
  }

  function update(dt) {
    t += dt;
    if (anim) {
      anim.vy += 2600 * dt; anim.y += anim.vy * dt;
      if (anim.y >= anim.ty) {
        anim.y = anim.ty;
        if (!anim.bounced && anim.vy > 500 && !api.reducedMotion) { anim.vy = -anim.vy * .22; anim.bounced = true; }
        else land();
      }
    }
    if (winCells) winT += dt;
    draw();
    // Idle: no animation and nothing pulsing, so the loop can rest.
    if (!anim && !winCells) loop.stop();
  }

  // ---------- drawing ----------
  function disc(x, y, p, alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x - R * .35, y - R * .4, R * .1, x, y, R);
    if (p === 1) { g.addColorStop(0, '#FFE8B0'); g.addColorStop(.55, '#F6C96B'); g.addColorStop(1, '#A7782A'); }
    else { g.addColorStop(0, '#F5A585'); g.addColorStop(.55, '#D5603A'); g.addColorStop(1, '#7E2E17'); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
    ctx.strokeStyle = p === 1 ? 'rgba(120,80,20,.55)' : 'rgba(70,20,8,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, R * .66, 0, 7); ctx.stroke();
    ctx.restore();
  }
  function draw() {
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#05090F'); bg.addColorStop(1, '#0A1E30');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 40, 10, W / 2, 40, 320); glow.addColorStop(0, 'rgba(246,201,107,.10)'); glow.addColorStop(1, 'rgba(246,201,107,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // Column cursor and the disc waiting to drop.
    const human = isHuman() && !over;
    if (!over) {
      ctx.fillStyle = 'rgba(246,201,107,.07)';
      ctx.beginPath(); ctx.roundRect(BX + cursor * CELL + 4, BY - 4, CELL - 8, ROWS * CELL + 8, 14); ctx.fill();
      if (!anim) disc(colX(cursor), BY - CELL * .6, turn, human ? 1 : .55);
    }
    // Falling disc sits behind the frame so it looks like it slides inside.
    if (anim) disc(colX(anim.c), anim.y, anim.p);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (board[c][r]) disc(colX(c), rowY(r), board[c][r]);

    // The frame: a navy panel with holes punched through.
    ctx.save();
    ctx.beginPath(); ctx.roundRect(BX - 10, BY - 10, COLS * CELL + 20, ROWS * CELL + 20, 22);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) { const x = colX(c), y = rowY(r); ctx.moveTo(x + R + 2, y); ctx.arc(x, y, R + 2, 0, Math.PI * 2, true); }
    const fg = ctx.createLinearGradient(0, BY, 0, BY + ROWS * CELL); fg.addColorStop(0, '#173A5C'); fg.addColorStop(1, '#0B2338');
    ctx.fillStyle = fg; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; ctx.fill('evenodd');
    ctx.restore();
    ctx.strokeStyle = 'rgba(234,241,248,.12)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(BX - 10, BY - 10, COLS * CELL + 20, ROWS * CELL + 20, 22); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3;
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) { ctx.beginPath(); ctx.arc(colX(c), rowY(r), R + 2, 0, 7); ctx.stroke(); }
    // Stand feet.
    ctx.fillStyle = '#0B2338';
    ctx.beginPath(); ctx.roundRect(BX - 22, BY + ROWS * CELL + 4, 40, 16, 6); ctx.fill();
    ctx.beginPath(); ctx.roundRect(BX + COLS * CELL - 18, BY + ROWS * CELL + 4, 40, 16, 6); ctx.fill();

    if (winCells) {
      const pulse = api.reducedMotion ? 1 : .75 + .25 * Math.sin(winT * 6);
      const a = winCells[0], b = winCells[3], k = Math.min(1, winT * 2.5);
      ctx.strokeStyle = `rgba(234,241,248,${.85 * pulse})`; ctx.lineWidth = 4;
      winCells.forEach(([c, r]) => { ctx.beginPath(); ctx.arc(colX(c), rowY(r), R + 1, 0, 7); ctx.stroke(); });
      ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(234,241,248,.9)';
      ctx.beginPath(); ctx.moveTo(colX(a[0]), rowY(a[1])); ctx.lineTo(colX(a[0]) + (colX(b[0]) - colX(a[0])) * k, rowY(a[1]) + (rowY(b[1]) - rowY(a[1])) * k); ctx.stroke();
      ctx.lineCap = 'butt';
    }

    // Turn plate under the board.
    ctx.font = '600 18px Outfit, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let label;
    if (over) label = winCells ? (solo ? (board[winCells[0][0]][winCells[0][1]] === 1 ? 'You win!' : 'Computer wins') : `${NAME[board[winCells[0][0]][winCells[0][1]]]} wins`) : 'Draw';
    else label = solo ? (turn === 1 ? 'Your turn' : 'Computer is thinking…') : `${NAME[turn]}'s turn`;
    ctx.fillStyle = '#EAF1F8'; ctx.fillText(label, W / 2, H - 22);
    if (!over) { const tw = ctx.measureText(label).width; ctx.fillStyle = turn === 1 ? '#F6C96B' : '#D5603A'; ctx.beginPath(); ctx.arc(W / 2 - tw / 2 - 16, H - 22, 7, 0, 7); ctx.fill(); }
  }

  const loop = api.loop((dt) => update(dt));
  const redraw = () => { if (!anim && !winCells) draw(); };

  // ---------- input ----------
  const onKey = (e) => {
    if (over || paused || !isHuman()) return;
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { cursor = (cursor + COLS - 1) % COLS; redraw(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { cursor = (cursor + 1) % COLS; redraw(); }
    else if (k === 'Enter' || k === ' ' || k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); drop(cursor); }
  };
  const colAt = (e) => { const p = toLocal(e); return Math.max(0, Math.min(COLS - 1, Math.floor((p.x - BX) / CELL))); };
  const onDown = (e) => {
    if (over || paused || !isHuman()) return;
    e.preventDefault();
    cursor = colAt(e);
    if (!drop(cursor)) redraw();
  };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || over || paused || !isHuman() || anim) return;
    const c = colAt(e); if (c !== cursor) { cursor = c; redraw(); }
  };
  window.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);

  return {
    start() { status(); draw(); },
    pause() { paused = true; loop.stop(); },
    resume() {
      paused = false;
      if (pendingEnd) { const r = pendingEnd; pendingEnd = null; api.end(r); return; }
      if (anim || winCells) loop.start(); else draw();
      if (aiPending && !aiTimer) scheduleAI();
    },
    destroy() {
      destroyed = true; loop.stop(); clearTimeout(aiTimer); clearTimeout(endTimer);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
    }
  };
}
