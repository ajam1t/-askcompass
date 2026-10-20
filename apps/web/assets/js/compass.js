/* Ask Compass hero emblem.
   A real-time Three.js version of the Ask Compass logo, built from procedural
   geometry and canvas textures:
   - a gold eight-point star;
   - a navy and ivory dial with a gold rim;
   - a glowing blue globe with a gold swirl;
   - two gold orbits with travelling spheres.
   three.js loads lazily once the hero is visible. Until then, and if WebGL is
   unavailable, the flat logo image stays in place. The star turns to face
   each bearing label when home.js sends "compass:target" events.
   window.AskCompass3D.destroy() releases every GPU resource. */
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
const stage = document.getElementById('compassStage');
// How large the dial draws for a given stage size. home.js shares the same
// function for its labels; other pages (the leadership sign-in) use this default.
const dialFrame = (w, h) => (window.acCompassFrame || ((fw, fh) => {
  const rx = Math.min(fw, fh * 1.08) * (fw < 560 ? 0.27 : 0.29);
  return { cx: fw / 2, cy: fh / 2, rx, ry: rx * 0.9, dist: (fh / 2) / (rx / 1.25) / Math.tan(14 * Math.PI / 180) };
}))(w, h);

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

if (stage && webglAvailable()) {
  let started = false;
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 150));
  const io = new IntersectionObserver((entries) => {
    if (started || !entries.some((e) => e.isIntersecting)) return;
    started = true; io.disconnect();
    idle(() => import(THREE_URL)
      .then((THREE) => mountEmblem(THREE, stage))
      .then((api) => { window.AskCompass3D = api; })
      .catch((err) => console.warn('3D emblem unavailable; showing the flat logo.', err)), { timeout: 1200 });
  });
  io.observe(stage);
}

async function mountEmblem(T, stage) {
  const host = stage.querySelector('.compass-canvas');
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 640px)').matches;
  const seg = small ? 96 : 192;
  const disposables = [];
  const keep = (o) => (disposables.push(o), o);

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(28, 1, 0.1, 80);

  // Studio environment for the gold reflections.
  const pmrem = new T.PMREMGenerator(renderer);
  const env = buildStudio(T);
  const envRT = pmrem.fromScene(env, 0.035);
  scene.environment = envRT.texture;
  env.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pmrem.dispose();

  const key = new T.DirectionalLight(0xfff0d0, 1.7); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new T.DirectionalLight(0x8fc4ff, 0.9); rim.position.set(4, -2, 3); scene.add(rim);
  scene.add(new T.HemisphereLight(0xffffff, 0x1a2a50, 0.45));

  const rig = new T.Group(); scene.add(rig);      // pointer tilt and float
  const BASE_TILT = -0.2; rig.rotation.x = BASE_TILT;

  /* ── materials ── */
  const gold = keep(new T.MeshPhysicalMaterial({ color: 0xE6B75E, metalness: 1, roughness: 0.26, clearcoat: 0.5, clearcoatRoughness: 0.15, envMapIntensity: 1.35 }));
  const goldDeep = keep(new T.MeshPhysicalMaterial({ color: 0xA8701F, metalness: 1, roughness: 0.34, envMapIntensity: 1.1 }));
  const goldGlow = keep(new T.MeshStandardMaterial({ color: 0xF6C86A, metalness: 0.6, roughness: 0.3, emissive: 0xE9A93A, emissiveIntensity: 0.9 }));
  const navyFacet = keep(new T.MeshPhysicalMaterial({ color: 0x0E2558, metalness: 0.4, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }));

  /* ── dial: navy and ivory bands with ticks, gold rim ── */
  const dialTex = keep(new T.CanvasTexture(drawDial(small ? 1024 : 2048)));
  dialTex.colorSpace = T.SRGBColorSpace; dialTex.anisotropy = aniso;
  const dial = new T.Mesh(keep(new T.CircleGeometry(1.17, seg)), keep(new T.MeshStandardMaterial({ map: dialTex, emissive: 0xffffff, emissiveMap: dialTex, emissiveIntensity: 0.28, roughness: 0.5, metalness: 0.1 })));
  rig.add(dial);
  const band = (r0, r1, d) => {
    const g = keep(new T.LatheGeometry([new T.Vector2(r0, -d / 2), new T.Vector2(r1, -d / 2), new T.Vector2(r1, d / 2), new T.Vector2(r0, d / 2), new T.Vector2(r0, -d / 2)], seg));
    g.rotateX(Math.PI / 2); return g;
  };
  const rimRing = new T.Mesh(band(1.165, 1.245, 0.12), gold); rig.add(rimRing);
  [[0.995, 0.016], [0.83, 0.011], [0.585, 0.014]].forEach(([r, t]) => {
    const m = new T.Mesh(keep(new T.TorusGeometry(r, t, 10, seg)), gold); m.position.z = 0.012; rig.add(m);
  });

  /* ── eight-point star (turns to the active bearing) ── */
  const star = new T.Group(); star.position.z = 0.05; rig.add(star);
  // Each point is a raised ridge: one face catches the light, the other is in shade.
  function point(angle, len, halfW, height, lightMat, shadeMat, z) {
    const dir = new T.Vector2(Math.sin(angle), Math.cos(angle)), perp = new T.Vector2(dir.y, -dir.x);
    const tip = [dir.x * len, dir.y * len, z], c = [0, 0, z + height];
    const l = [perp.x * halfW, perp.y * halfW, z], r = [-perp.x * halfW, -perp.y * halfW, z];
    const face = (a, b, d, mat) => {
      const g = keep(new T.BufferGeometry());
      g.setAttribute('position', new T.Float32BufferAttribute([...a, ...b, ...d], 3)); g.computeVertexNormals();
      star.add(new T.Mesh(g, mat));
    };
    face(tip, c, l, lightMat); face(tip, r, c, shadeMat);
  }
  for (let i = 0; i < 4; i++) point(i * Math.PI / 2, 1.6, 0.2, 0.17, gold, goldDeep, 0.02);
  for (let i = 0; i < 4; i++) point(Math.PI / 4 + i * Math.PI / 2, 0.98, 0.14, 0.11, gold, navyFacet, 0);
  const ballGeo = keep(new T.SphereGeometry(1, 24, 16));
  const ball = (x, y, z, r, mat = gold) => { const b = new T.Mesh(ballGeo, mat); b.position.set(x, y, z); b.scale.setScalar(r); return b; };
  [[1.6, 0], [0, -1.6], [-1.6, 0]].forEach(([x, y]) => star.add(ball(x, y, 0.03, 0.035)));
  // North sparkle beyond the top point.
  const spark = new T.Group(); spark.position.set(0, 1.78, 0.03); star.add(spark);
  for (let i = 0; i < 4; i++) {
    const g = keep(new T.ConeGeometry(0.035, i % 2 ? 0.16 : 0.3, 4)); g.translate(0, (i % 2 ? 0.08 : 0.15), 0);
    const m = new T.Mesh(g, gold); m.rotation.z = -i * Math.PI / 2; spark.add(m);
  }
  spark.add(ball(0, 0, 0, 0.04));

  /* ── globe with a gold swirl and a bright core ── */
  const center = new T.Group(); center.position.z = 0.24; rig.add(center);
  const collar = new T.Mesh(keep(new T.TorusGeometry(0.395, 0.05, 20, seg)), gold); center.add(collar);
  const galTex = keep(new T.CanvasTexture(drawGalaxy(small ? 512 : 1024))); galTex.colorSpace = T.SRGBColorSpace; galTex.anisotropy = aniso;
  const globe = new T.Mesh(keep(new T.SphereGeometry(0.355, 64, 48)), keep(new T.MeshPhysicalMaterial({ map: galTex, emissive: 0xffffff, emissiveMap: galTex, emissiveIntensity: 0.7, roughness: 0.22, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2 })));
  center.add(globe);
  const swirlCurve = new T.CatmullRomCurve3(Array.from({ length: 48 }, (_, i) => {
    const a = i / 48 * Math.PI * 2, r = 0.29 + 0.05 * Math.sin(a * 2);
    return new T.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.42, Math.sin(a) * 0.025);
  }), true);
  const swirl = new T.Mesh(keep(new T.TubeGeometry(swirlCurve, 160, 0.016, 8, true)), goldGlow);
  swirl.rotation.z = 0.35; swirl.position.z = 0.34; center.add(swirl);
  const swirl2 = new T.Mesh(keep(new T.TorusGeometry(0.13, 0.008, 8, 64)), goldGlow);
  swirl2.scale.set(1, 0.55, 1); swirl2.rotation.z = 0.35; swirl2.position.set(-0.07, -0.09, 0.345); center.add(swirl2);
  const glowTex = keep(new T.CanvasTexture(drawGlow()));
  const core = new T.Sprite(keep(new T.SpriteMaterial({ map: glowTex, color: 0xffd48a, transparent: true, opacity: 0.75, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })));
  core.position.z = 0.42; core.scale.setScalar(0.34); center.add(core);
  const flare = new T.Sprite(keep(new T.SpriteMaterial({ map: glowTex, color: 0x9fd4ff, transparent: true, opacity: 0.4, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })));
  flare.position.z = 0.43; flare.scale.set(1.5, 0.05, 1); center.add(flare);

  /* ── orbits with travelling spheres ── */
  const orbits = [
    { rx: 1.5, ry: 1.18, rot: [0.95, 0.28, 0.4], speed: 0.32, size: 0.075, phase: 0.6 },
    { rx: 1.42, ry: 1.3, rot: [-1.05, -0.42, -0.5], speed: -0.24, size: 0.06, phase: 3.4 }
  ].map((o) => {
    const g = new T.Group(); g.rotation.set(...o.rot); rig.add(g);
    const ringGeo = keep(new T.TorusGeometry(1, 0.0075, 8, seg)); ringGeo.scale(o.rx, o.ry, 1);
    g.add(new T.Mesh(ringGeo, gold));
    const b = ball(0, 0, 0, o.size); g.add(b);
    return { ...o, group: g, ball: b, a: o.phase };
  });
  // Fixed beads on the rim, as in the logo.
  [0.35, 1.9, 3.5, 5.2].forEach((a, i) => rig.add(ball(Math.sin(a) * 1.205, Math.cos(a) * 1.205, 0.07, i % 2 ? 0.04 : 0.055)));

  /* ── sizing ── */
  let W0 = 0, H0 = 0;
  function resize() {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === W0 && h === H0) return; W0 = w; H0 = h;
    renderer.setSize(w, h, false);
    // Frame the emblem slightly larger than the dial so the star tips and orbits fit.
    camera.aspect = w / h; camera.position.set(0, 0, dialFrame(w, h).dist * 1.08); camera.updateProjectionMatrix();
    if (!running) render();
  }

  /* ── motion ── */
  const st = { target: 0, ang: 0, vel: 0, tx: 0, ty: 0, px: 0, py: 0, t: 0 };
  let raf = 0, running = false, onScreen = true, last = 0;
  const toStar = (bearingDeg) => -bearingDeg * Math.PI / 180;
  function aimAt(bearingDeg) {
    let a = toStar(bearingDeg);
    while (a - st.ang > Math.PI) a -= Math.PI * 2;
    while (a - st.ang < -Math.PI) a += Math.PI * 2;
    st.target = a;
    if (reduceMQ.matches) { st.ang = a; st.vel = 0; renderStill(); }
  }
  function placeOrbits(dt) {
    orbits.forEach((o) => { o.a += o.speed * dt; o.ball.position.set(Math.cos(o.a) * o.rx, Math.sin(o.a) * o.ry, 0); });
  }
  function step(dt) {
    st.t += dt; const t = st.t;
    // Damped spring: the star swings to the bearing and settles.
    const k = 7, c = 4.4; st.vel += (k * (st.target - st.ang) - c * st.vel) * dt; st.ang += st.vel * dt;
    star.rotation.z = st.ang;
    placeOrbits(dt);
    orbits[0].group.rotation.z += dt * 0.05; orbits[1].group.rotation.z -= dt * 0.04;
    globe.rotation.y += dt * 0.18;
    swirl.rotation.z = 0.35 + 0.08 * Math.sin(t * 0.7);
    const pulse = 0.34 + 0.05 * Math.sin(t * 1.9) + 0.02 * Math.sin(t * 4.3);
    core.scale.setScalar(pulse); flare.scale.set(1.4 + 0.25 * Math.sin(t * 0.9), 0.05, 1);
    const e = Math.min(1, dt * 2.6); st.px += (st.tx - st.px) * e; st.py += (st.ty - st.py) * e;
    rig.rotation.x = BASE_TILT + st.py * 0.16;
    rig.rotation.y = st.px * 0.24 + 0.05 * Math.sin(t * 0.3);
    rig.position.y = 0.03 * Math.sin(t * 0.6);
  }
  function render() { renderer.render(scene, camera); }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000 || 0, 0.05); last = now;
    step(dt); render();
  }
  function renderStill() {
    star.rotation.z = st.ang; rig.rotation.set(BASE_TILT, 0, 0); rig.position.y = 0;
    placeOrbits(0); core.scale.setScalar(0.34);
    render();
  }
  function update() {
    const should = onScreen && !document.hidden && !reduceMQ.matches;
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; cancelAnimationFrame(raf); }
    if (reduceMQ.matches) renderStill();
  }

  /* ── interaction ── */
  const hero = stage.closest('.hx, .hero') || stage;
  function onMove(e) {
    if (e.pointerType !== 'mouse' || reduceMQ.matches) return;
    const r = stage.getBoundingClientRect();
    st.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    st.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
  }
  function onLeave() { st.tx = 0; st.ty = 0; }
  // Click or tap the emblem to point the star there.
  function onTap(e) {
    const r = host.getBoundingClientRect(), f = dialFrame(r.width, r.height);
    const dx = (e.clientX - r.left - f.cx) / f.rx, dy = (e.clientY - r.top - f.cy) / f.ry;
    if (dx * dx + dy * dy > 1.6) return;
    aimAt(Math.atan2(dx, -dy) * 180 / Math.PI);
  }
  function onTarget(e) { aimAt(e.detail.bearing); }
  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerleave', onLeave);
  host.addEventListener('click', onTap);
  stage.addEventListener('compass:target', onTarget);

  const ro = new ResizeObserver(resize); ro.observe(host);
  const vio = new IntersectionObserver((es) => { onScreen = es[es.length - 1].isIntersecting; update(); }); vio.observe(stage);
  document.addEventListener('visibilitychange', update);
  reduceMQ.addEventListener('change', update);

  const canvas = renderer.domElement;
  function onLost(e) { e.preventDefault(); running = false; cancelAnimationFrame(raf); stage.classList.remove('is-3d'); }
  canvas.addEventListener('webglcontextlost', onLost);

  resize();
  if (reduceMQ.matches) renderStill(); else { step(0); render(); }
  stage.classList.add('is-3d');
  update();

  return {
    destroy() {
      running = false; cancelAnimationFrame(raf);
      ro.disconnect(); vio.disconnect();
      hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('click', onTap); stage.removeEventListener('compass:target', onTarget);
      canvas.removeEventListener('webglcontextlost', onLost);
      document.removeEventListener('visibilitychange', update); reduceMQ.removeEventListener('change', update);
      disposables.forEach((d) => d.dispose()); envRT.dispose(); renderer.dispose();
      canvas.remove(); stage.classList.remove('is-3d');
    }
  };
}

/* ── procedural assets ── */
function buildStudio(T) {
  const s = new T.Scene();
  s.add(new T.Mesh(new T.BoxGeometry(12, 8, 12), new T.MeshBasicMaterial({ color: 0x5a6680, side: T.BackSide })));
  const panel = (w, h, x, y, z, ry, rx, color, i) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color }));
    m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
  };
  panel(8, 2.2, 0, 3.9, 0, 0, Math.PI / 2, 0xfff1d8, 4.4);   // warm overhead softbox
  panel(3, 5, -5.9, 0.5, 0, Math.PI / 2, 0, 0xffffff, 2.6);   // left strip
  panel(3, 5, 5.9, 0.5, 1, -Math.PI / 2, 0, 0xbfd8ff, 2.2);   // cool blue right
  panel(6, 2, 0, 1, 5.9, Math.PI, 0, 0xffffff, 1.7);          // front fill
  panel(4, 1, 2, -1.5, -5.9, 0, 0, 0xf4b544, 1.4);            // gold kicker
  panel(12, 1.6, 0, -3.9, 0, 0, -Math.PI / 2, 0x141c2e, 1);   // dark floor band for contrast
  panel(2, 6, -3, 0, -5.9, 0, 0, 0x1d2638, 1);                // dark flag
  return s;
}

// Dial face: ivory tick band, gold line, navy bands with an ivory stripe, dark centre.
function drawDial(S) {
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), k = S / 2; g.translate(k, k);
  const disc = (r, fill) => { g.fillStyle = fill; g.beginPath(); g.arc(0, 0, r * k, 0, Math.PI * 2); g.fill(); };
  let gr = g.createRadialGradient(0, 0, 0.84 * k, 0, 0, k); gr.addColorStop(0, '#f6f1e6'); gr.addColorStop(1, '#e7dcc6');
  disc(1, gr);
  g.strokeStyle = '#1b2a48'; g.lineCap = 'round';
  for (let d = 0; d < 360; d += 3) {
    const major = d % 30 === 0, len = major ? 0.05 : 0.022;
    g.save(); g.rotate(d * Math.PI / 180); g.lineWidth = (major ? 0.009 : 0.004) * k;
    g.beginPath(); g.moveTo(0, -0.975 * k); g.lineTo(0, -(0.975 - len) * k); g.stroke(); g.restore();
  }
  g.fillStyle = '#7d7462';
  for (let d = 0; d < 360; d += 2) { g.save(); g.rotate(d * Math.PI / 180); g.beginPath(); g.arc(0, -0.895 * k, 0.0035 * k, 0, Math.PI * 2); g.fill(); g.restore(); }
  disc(0.855, '#c9973f');
  gr = g.createRadialGradient(0, 0, 0.5 * k, 0, 0, 0.85 * k); gr.addColorStop(0, '#0a1f4d'); gr.addColorStop(1, '#13306a');
  disc(0.845, gr);
  disc(0.71, '#efe7d6');
  disc(0.68, '#0b1e47');
  disc(0.6, '#c9973f');
  gr = g.createRadialGradient(0, 0, 0, 0, 0, 0.59 * k); gr.addColorStop(0, '#16367a'); gr.addColorStop(1, '#071637');
  disc(0.59, gr);
  return c;
}

// Globe texture: deep blue sphere with nebula light and stars.
function drawGalaxy(S) {
  const c = document.createElement('canvas'); c.width = S; c.height = S / 2;
  const g = c.getContext('2d'), w = S, h = S / 2;
  let gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#061538'); gr.addColorStop(0.5, '#1d5fd6'); gr.addColorStop(1, '#061538');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 14; i++) {
    const x = rnd() * w, y = h * (0.25 + rnd() * 0.5), r = h * (0.12 + rnd() * 0.25);
    gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, i % 3 ? 'rgba(110,190,255,.35)' : 'rgba(255,210,150,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 420; i++) {
    g.fillStyle = `rgba(255,255,255,${(0.3 + rnd() * 0.7).toFixed(2)})`;
    g.beginPath(); g.arc(rnd() * w, rnd() * h, rnd() * 1.4 + 0.3, 0, Math.PI * 2); g.fill();
  }
  return c;
}

function drawGlow() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return c;
}
