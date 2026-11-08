/* The DigiKhelo catalogue. Every game listed here is an original game with a
   playable module in /digikhelo/games/<id>.js and artwork in /digikhelo/covers/<id>.svg.
   Fields:
   - aspect: logical canvas size the game draws at ([w, h]); the player scales it to fit.
   - touch: on-screen controls the player adds on touch screens:
       'lr' (left, right), 'dpad' (four arrows), 'lr-fire' (left, right, fire), 'jump' (one big button), 'none'.
   - score: how results read. lower: true when a smaller number is better (moves, seconds).
   - challenge: daily challenge targets [easy, normal, hard] in the score's unit, or null. */

export const WORLDS = [
  { id: 'action', name: 'Action Arena', short: 'Action', tone: '#E0663B', line: 'Fast reflexes, big moments.', blurb: 'Defend orbital stations, clear asteroid fields and break crystal walls.' },
  { id: 'racing', name: 'Racing District', short: 'Racing', tone: '#F6C96B', line: 'Speed through sky lanes.', blurb: 'Weave through sky traffic, dash across rooftops and glide through canyons.' },
  { id: 'sports', name: 'Sports Zone', short: 'Sports', tone: '#5FB37C', line: 'Time it. Aim it. Score.', blurb: 'Take the penalty, time the cover drive and sink the buzzer-beater.' },
  { id: 'puzzle', name: 'Puzzle Temple', short: 'Puzzle', tone: '#8C7CF0', line: 'Quiet rooms, clever minds.', blurb: 'Merge, match, slide and switch your way through logic chambers.' },
  { id: 'adventure', name: 'Adventure Realms', short: 'Adventure', tone: '#4FA3D9', line: 'Climb higher. Go further.', blurb: 'Hop sky islands, guide the serpent and explore generated worlds.' },
  { id: 'strategy', name: 'Strategy Frontier', short: 'Strategy', tone: '#C9A15A', line: 'Think three moves ahead.', blurb: 'Classic duels of position and planning against a thinking opponent.' },
  { id: 'simulation', name: 'Simulation City', short: 'Simulation', tone: '#6FC1B5', line: 'Build it, balance it.', blurb: 'Stack a skyline, power the grid and keep the city in balance.' },
  { id: 'multiplayer', name: 'Multiplayer Nexus', short: 'Multiplayer', tone: '#E58FB0', line: 'Two players, one screen.', blurb: 'Challenge a friend on the same device. Online play is not available yet.' },
  { id: 'ai', name: 'AI Worlds', short: 'AI Worlds', tone: '#7FD3F0', line: 'Your settings. A new world.', blurb: 'Pick a biome, difficulty and goal, and a playable world is generated from a seed.' }
];

export const GAMES = [
  { id: 'sky-drift', name: 'Sky Drift', worlds: ['racing'], aspect: [480, 800], touch: 'lr',
    blurb: 'Weave a hover car through sky traffic as the lanes speed up.', controls: 'Left and right arrows or A and D. On touch, tap the left or right side.',
    score: { label: 'Distance', unit: 'm' }, challenge: [400, 900, 1600] },
  { id: 'hover-dash', name: 'Hover Dash', worlds: ['racing', 'adventure'], aspect: [800, 450], touch: 'jump',
    blurb: 'Sprint across rooftops and jump the gaps between towers.', controls: 'Space, Up or W to jump; hold for a higher jump. On touch, press Jump.',
    score: { label: 'Distance', unit: 'm' }, challenge: [300, 700, 1300] },
  { id: 'canyon-glide', name: 'Canyon Glide', worlds: ['racing'], aspect: [480, 800], touch: 'jump',
    blurb: 'Keep a glider aloft through narrow canyon gates.', controls: 'Space, Up or a tap to lift the glider.',
    score: { label: 'Gates' }, challenge: [5, 15, 30] },
  { id: 'asteroid-sentinel', name: 'Asteroid Sentinel', worlds: ['action'], aspect: [800, 600], touch: 'dpad-fire',
    blurb: 'Pilot a sentinel ship and clear waves of drifting asteroids.', controls: 'Left and right to turn, Up to thrust, Space to fire.',
    score: { label: 'Score' }, challenge: [1000, 3000, 6000] },
  { id: 'star-defender', name: 'Star Defender', worlds: ['action'], aspect: [480, 800], touch: 'lr',
    blurb: 'Hold the orbital line against incoming drone formations.', controls: 'Left and right arrows or drag to move. Your cannon fires on its own.',
    score: { label: 'Score' }, challenge: [800, 2500, 5000] },
  { id: 'crystal-breaker', name: 'Crystal Breaker', worlds: ['action', 'puzzle'], aspect: [480, 720], touch: 'lr',
    blurb: 'Bounce an energy orb to shatter every crystal in the wall.', controls: 'Move the paddle with the arrows, the mouse or your finger. Space launches the orb.',
    score: { label: 'Score' }, challenge: [500, 1500, 3000] },
  { id: 'penalty-strike', name: 'Penalty Strike', worlds: ['sports'], aspect: [480, 720], touch: 'none',
    blurb: 'Five penalties against a keeper who reads your run-up.', controls: 'Tap or click to set the aim, then again to set the power.',
    score: { label: 'Goals' }, challenge: [2, 3, 5] },
  { id: 'cricket-strike', name: 'Cricket Strike', worlds: ['sports'], aspect: [480, 720], touch: 'none',
    blurb: 'Time your shot to every delivery across a two-over chase.', controls: 'Tap, click or press Space as the ball reaches the bat.',
    score: { label: 'Runs' }, challenge: [12, 24, 36] },
  { id: 'hoop-shot', name: 'Hoop Shot', worlds: ['sports'], aspect: [480, 720], touch: 'none',
    blurb: 'Flick the ball through the hoop as many times as you can in 45 seconds.', controls: 'Drag upwards from the ball and release to shoot.',
    score: { label: 'Baskets' }, challenge: [6, 12, 20] },
  { id: 'merge-tiles', name: 'Merge Tiles', worlds: ['puzzle'], aspect: [480, 640], touch: 'none',
    blurb: 'Slide numbered tiles together and build the highest tile you can.', controls: 'Arrow keys or swipe in any direction.',
    score: { label: 'Score' }, challenge: [2000, 6000, 12000] },
  { id: 'memory-match', name: 'Memory Match', worlds: ['puzzle'], aspect: [480, 640], touch: 'none',
    blurb: 'Turn over the glyph cards and find every pair in as few moves as possible.', controls: 'Tap or click a card to turn it.',
    score: { label: 'Moves', lower: true }, challenge: [30, 24, 18] },
  { id: 'mine-field', name: 'Mine Field', worlds: ['puzzle'], aspect: [480, 640], touch: 'none',
    blurb: 'Clear the field without setting off a single charge.', controls: 'Tap or click to reveal. Long-press or right-click to flag.',
    score: { label: 'Time', unit: 's', lower: true }, challenge: [240, 150, 90] },
  { id: 'slide-puzzle', name: 'Slide Puzzle', worlds: ['puzzle'], aspect: [480, 640], touch: 'none',
    blurb: 'Slide the tiles back into order with as few moves as you can.', controls: 'Tap a tile next to the gap, or use the arrow keys.',
    score: { label: 'Moves', lower: true }, challenge: [200, 120, 80] },
  { id: 'lumen-grid', name: 'Lumen Grid', worlds: ['puzzle', 'simulation'], aspect: [480, 640], touch: 'none',
    blurb: 'Switch a light and its neighbours flip. Turn the whole grid dark.', controls: 'Tap or click a light.',
    score: { label: 'Moves', lower: true }, challenge: [30, 20, 14] },
  { id: 'connect-four', name: 'Connect Four', worlds: ['strategy', 'multiplayer'], aspect: [560, 560], touch: 'none', versus: true,
    blurb: 'Drop discs to line up four, against the computer or a friend.', controls: 'Tap or click a column, or use the arrows and Enter.',
    score: { label: 'Wins' }, challenge: null },
  { id: 'triad', name: 'Triad', worlds: ['strategy', 'multiplayer'], aspect: [480, 560], touch: 'none', versus: true,
    blurb: 'Noughts and crosses with a thinking opponent, or a friend.', controls: 'Tap or click a square, or use the arrows and Enter.',
    score: { label: 'Wins' }, challenge: null },
  { id: 'orbit-reversi', name: 'Orbit Reversi', worlds: ['strategy', 'multiplayer'], aspect: [560, 620], touch: 'none', versus: true,
    blurb: 'Outflank your opponent to turn their pieces into yours.', controls: 'Tap or click a highlighted square.',
    score: { label: 'Pieces' }, challenge: null },
  { id: 'serpent-trail', name: 'Serpent Trail', worlds: ['adventure'], aspect: [480, 560], touch: 'dpad',
    blurb: 'Guide the serpent to the energy orbs without crossing your own trail.', controls: 'Arrow keys, WASD or swipe.',
    score: { label: 'Orbs' }, challenge: [8, 18, 30] },
  { id: 'island-hopper', name: 'Island Hopper', worlds: ['adventure'], aspect: [480, 800], touch: 'lr',
    blurb: 'Bounce from island to island and climb as high as the sky allows.', controls: 'Left and right arrows, or tilt your taps to each side.',
    score: { label: 'Height', unit: 'm' }, challenge: [150, 400, 800] },
  { id: 'court-duel', name: 'Court Duel', worlds: ['sports', 'multiplayer'], aspect: [800, 480], touch: 'none', versus: true,
    blurb: 'Paddle duel first to seven, against the computer or a friend on the same screen.', controls: 'Player 1: W and S or drag on the left. Player 2: Up and Down or drag on the right.',
    score: { label: 'Points' }, challenge: null },
  { id: 'skyline-stack', name: 'Skyline Stack', worlds: ['simulation'], aspect: [480, 800], touch: 'jump',
    blurb: 'Drop each floor onto the last and build the tallest tower in the city.', controls: 'Space, a click or a tap drops the moving floor.',
    score: { label: 'Floors' }, challenge: [10, 20, 32] },
  { id: 'ai-world', name: 'Generated World', worlds: ['ai', 'adventure'], aspect: [640, 640], touch: 'dpad', generated: true,
    blurb: 'A top-down world built from your settings: collect crystals, outrun the clock or survive the drones.', controls: 'Arrow keys, WASD or the on-screen pad.',
    score: { label: 'Score' }, challenge: null }
];

export const gameById = Object.fromEntries(GAMES.map((g) => [g.id, g]));
export const worldById = Object.fromEntries(WORLDS.map((w) => [w.id, w]));
export const gamesIn = (worldId) => GAMES.filter((g) => g.worlds.includes(worldId));
export const formatScore = (g, n) => (n === undefined || n === null ? '–' : `${Math.round(n).toLocaleString('en-IN')}${g.score.unit ? ' ' + g.score.unit : ''}`);
