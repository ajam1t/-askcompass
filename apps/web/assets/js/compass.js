/* Ask Compass hero compass.
   A real-time Three.js compass built from procedural geometry and canvas
   textures: no model files and no external images. three.js loads lazily
   once the hero is visible; until then (and if WebGL is unavailable) the
   static SVG compass stays in place. The needle follows "compass:target"
   events from home.js, which keeps it in step with the bearing labels.
   window.AskCompass3D.destroy() releases every GPU resource. */
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
const stage = document.getElementById('compassStage');

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
      .then((THREE) => mountCompass(THREE, stage))
      .then((api) => { window.AskCompass3D = api; })
      .catch((err) => console.warn('3D compass unavailable; showing the static compass.', err)), { timeout: 1200 });
  });
  io.observe(stage);
}

async function mountCompass(T, stage) {
  const host = stage.querySelector('.compass-canvas');
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 640px)').matches;
  const seg = small ? 72 : 144;
  const disposables = [];
  const keep = (o) => (disposables.push(o), o);

  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* draw with fallback font */ } }

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(28, 1, 0.1, 80);

  // Studio environment for reflections: warm overhead key, cool blue side.
  const pmrem = new T.PMREMGenerator(renderer);
  const env = buildStudio(T);
  const envRT = pmrem.fromScene(env, 0.035);
  scene.environment = envRT.texture;
  env.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pmrem.dispose();

  const key = new T.DirectionalLight(0xfff1d6, 1.5); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new T.DirectionalLight(0x8fb6ff, 0.8); rim.position.set(4, -2, 3); scene.add(rim);
  scene.add(new T.HemisphereLight(0xffffff, 0xdbe6f6, 0.5));

  const rig = new T.Group(); scene.add(rig);   // pointer tilt
  const body = new T.Group(); rig.add(body);   // the case, with a slight drift
  const BASE_TILT = -0.48; rig.rotation.x = BASE_TILT;

  const metal = keep(new T.MeshPhysicalMaterial({ color: 0xe3e8f0, metalness: 1, roughness: 0.19, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 1.15 }));
  const metalInner = keep(new T.MeshPhysicalMaterial({ color: 0xb9c4d4, metalness: 1, roughness: 0.3, envMapIntensity: 1 }));
  const navyEnamel = keep(new T.MeshPhysicalMaterial({ color: 0x10284c, metalness: 0.2, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 }));

  // Housing: an outer lathe-turned case plus an inner stepped bezel.
  const caseProfile = [[1.02, 0.11], [1.06, 0.18], [1.12, 0.21], [1.19, 0.205], [1.24, 0.16], [1.266, 0.08], [1.27, 0], [1.258, -0.1], [1.215, -0.155], [1.1, -0.175], [0.4, -0.175]];
  const caseGeo = keep(new T.LatheGeometry(caseProfile.map(([r, h]) => new T.Vector2(r, h)), seg)); caseGeo.rotateX(Math.PI / 2);
  body.add(new T.Mesh(caseGeo, metal));
  const bezelProfile = [[0.995, 0.02], [1.0, 0.075], [1.012, 0.09], [1.025, 0.11]];
  const bezelGeo = keep(new T.LatheGeometry(bezelProfile.map(([r, h]) => new T.Vector2(r, h)), seg)); bezelGeo.rotateX(Math.PI / 2);
  body.add(new T.Mesh(bezelGeo, metalInner));
  // Navy enamel ring between bezel and case: the brand colour in the hardware.
  const enamelGeo = keep(new T.RingGeometry(1.025, 1.06, seg));
  const enamel = new T.Mesh(enamelGeo, navyEnamel); enamel.position.z = 0.112; body.add(enamel);

  // Crown at 12 o'clock.
  const knobGeo = keep(new T.CylinderGeometry(0.07, 0.085, 0.15, 32));
  const knob = new T.Mesh(knobGeo, metalInner); knob.position.set(0, 1.33, 0.02); body.add(knob);
  const crownGeo = keep(new T.TorusGeometry(0.115, 0.026, 16, 48));
  const crown = new T.Mesh(crownGeo, metal); crown.position.set(0, 1.49, 0.02); crown.rotation.y = Math.PI / 2; body.add(crown);

  // Dial.
  const dialTex = keep(new T.CanvasTexture(drawDial(small ? 1024 : 2048)));
  dialTex.colorSpace = T.SRGBColorSpace; dialTex.anisotropy = aniso;
  const dialGeo = keep(new T.CircleGeometry(1.0, seg));
  const dial = new T.Mesh(dialGeo, keep(new T.MeshStandardMaterial({ map: dialTex, emissive: 0xffffff, emissiveMap: dialTex, emissiveIntensity: 0.5, roughness: 0.6, metalness: 0 })));
  dial.position.z = 0.02; body.add(dial);

  // Restrained blue edge light on the inner bezel.
  const edgeMat = keep(new T.MeshBasicMaterial({ color: 0x5b97f5, transparent: true, opacity: 0.55, toneMapped: false }));
  const edgeGeo = keep(new T.TorusGeometry(1.0, 0.004, 8, seg));
  const edge = new T.Mesh(edgeGeo, edgeMat); edge.position.z = 0.078; body.add(edge);

  // A soft gold light that travels slowly around the outer ring.
  const glowTex = keep(new T.CanvasTexture(drawGlow()));
  const glowMat = keep(new T.SpriteMaterial({ map: glowTex, color: 0xf4b544, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
  const glow = new T.Sprite(glowMat); glow.scale.set(0.3, 0.3, 1); body.add(glow);
  const trailGeo = keep(new T.TorusGeometry(1.215, 0.006, 8, seg, Math.PI * 0.35));
  const trailMat = keep(new T.MeshBasicMaterial({ color: 0xf4b544, transparent: true, opacity: 0.7, toneMapped: false }));
  const trail = new T.Mesh(trailGeo, trailMat); trail.position.z = 0.205; body.add(trail);

  // Needle: faceted deep-blue north, porcelain south; gold stays on the hub and the travelling light.
  const needle = new T.Group(); needle.position.z = 0.075; body.add(needle);
  const extrude = { depth: 0.016, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.004, bevelSegments: 2, curveSegments: 1 };
  const facet = (pts, color, rough, metalness) => {
    const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => s.lineTo(p[0], p[1])); s.closePath();
    const g = keep(new T.ExtrudeGeometry(s, extrude));
    const m = keep(new T.MeshPhysicalMaterial({ color, metalness, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.1 }));
    needle.add(new T.Mesh(g, m));
  };
  const L = 0.8, W = 0.07;
  facet([[0, L], [-W, 0], [0, 0]], 0x3f80f2, 0.22, 0.55);
  facet([[0, L], [0, 0], [W, 0]], 0x173f73, 0.2, 0.6);
  facet([[0, -L], [0, 0], [-W, 0]], 0xfafbfc, 0.35, 0.1);
  facet([[0, -L], [W, 0], [0, 0]], 0xc7d1de, 0.32, 0.15);

  const shadowTex = keep(new T.CanvasTexture(drawNeedleShadow()));
  const shadowGeo = keep(new T.PlaneGeometry(0.42, 2.0));
  const shadow = new T.Mesh(shadowGeo, keep(new T.MeshBasicMaterial({ map: shadowTex, color: 0x0b1d45, transparent: true, opacity: 0.28, depthWrite: false })));
  const shadowPivot = new T.Group(); shadowPivot.position.set(0.03, -0.04, 0.03); shadowPivot.add(shadow); body.add(shadowPivot);

  // Hub with the Ask Compass mark (fixed to the case so it never distorts).
  const hubGeo = keep(new T.CylinderGeometry(0.15, 0.16, 0.07, seg)); hubGeo.rotateX(Math.PI / 2);
  const hub = new T.Mesh(hubGeo, metal); hub.position.z = 0.12; body.add(hub);
  const markTex = keep(new T.CanvasTexture(drawMark(512))); markTex.colorSpace = T.SRGBColorSpace; markTex.anisotropy = aniso;
  const capGeo = keep(new T.CircleGeometry(0.128, seg));
  const cap = new T.Mesh(capGeo, keep(new T.MeshStandardMaterial({ map: markTex, roughness: 0.3, metalness: 0.1 })));
  cap.position.z = 0.1555; body.add(cap);

  // Glass dome.
  const RS = 3, theta = Math.asin(1.03 / RS);
  const glassGeo = keep(new T.SphereGeometry(RS, seg, 18, 0, Math.PI * 2, 0, theta)); glassGeo.rotateX(Math.PI / 2);
  const glass = new T.Mesh(glassGeo, keep(new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.13, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.8, depthWrite: false })));
  glass.position.z = 0.172 - RS * Math.cos(theta); glass.renderOrder = 10; body.add(glass);

  // Contact shadow.
  const groundTex = keep(new T.CanvasTexture(drawGround()));
  const groundGeo = keep(new T.PlaneGeometry(3.9, 3.9));
  const ground = new T.Mesh(groundGeo, keep(new T.MeshBasicMaterial({ map: groundTex, transparent: true, depthWrite: false })));
  ground.position.set(0.06, -0.1, -0.2); rig.add(ground);

  /* ── sizing ── */
  let W0 = 0, H0 = 0;
  function resize() {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === W0 && h === H0) return; W0 = w; H0 = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.position.set(0, 0, window.acCompassFrame(w, h).dist); camera.updateProjectionMatrix();
    if (!running) render();
  }

  /* ── motion ── */
  const st = { target: 0, ang: 0, vel: 0, tx: 0, ty: 0, px: 0, py: 0, t: 0 };
  let raf = 0, running = false, onScreen = true, last = 0;
  const toNeedle = (bearingDeg) => -bearingDeg * Math.PI / 180;
  function aimAt(bearingDeg) {
    let a = toNeedle(bearingDeg);
    while (a - st.ang > Math.PI) a -= Math.PI * 2;
    while (a - st.ang < -Math.PI) a += Math.PI * 2;
    st.target = a;
    if (reduceMQ.matches) { st.ang = a; st.vel = 0; renderStill(); }
  }
  function step(dt) {
    st.t += dt; const t = st.t;
    body.rotation.z = 0.05 * Math.sin(t * 0.19) + 0.02 * Math.sin(t * 0.47 + 1.3);
    // Damped spring on the needle's heading: it holds its bearing while the case drifts.
    const k = 8, c = 4.6; st.vel += (k * (st.target - st.ang) - c * st.vel) * dt; st.ang += st.vel * dt;
    needle.rotation.z = st.ang + 0.004 * Math.sin(t * 6.3) * Math.sin(t * 1.7) - body.rotation.z;
    shadowPivot.rotation.z = needle.rotation.z;
    const e = Math.min(1, dt * 2.6); st.px += (st.tx - st.px) * e; st.py += (st.ty - st.py) * e;
    rig.rotation.x = BASE_TILT + st.py * 0.12;
    rig.rotation.y = st.px * 0.18;
    rig.position.y = 0.025 * Math.sin(t * 0.6);
    placeLight(t * 0.42);
  }
  function placeLight(a) {
    glow.position.set(Math.sin(a) * 1.215, Math.cos(a) * 1.215, 0.21);
    trail.rotation.z = Math.PI / 2 - a;
  }
  function render() { renderer.render(scene, camera); }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000 || 0, 0.05); last = now;
    step(dt); render();
  }
  function renderStill() {
    body.rotation.z = 0; needle.rotation.z = st.ang; shadowPivot.rotation.z = st.ang;
    rig.rotation.set(BASE_TILT, 0, 0); rig.position.y = 0; placeLight(-0.9);
    render();
  }
  function update() {
    const should = onScreen && !document.hidden && !reduceMQ.matches;
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; cancelAnimationFrame(raf); }
    if (reduceMQ.matches) renderStill();
  }

  /* ── interaction ── */
  const hero = stage.closest('.hero') || stage;
  function onMove(e) {
    if (e.pointerType !== 'mouse' || reduceMQ.matches) return;
    const r = stage.getBoundingClientRect();
    st.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    st.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
  }
  function onLeave() { st.tx = 0; st.ty = 0; }
  // Click or tap the compass face to point the needle there.
  function onTap(e) {
    const r = host.getBoundingClientRect(), f = window.acCompassFrame(r.width, r.height);
    const dx = (e.clientX - r.left - f.cx) / f.rx, dy = (e.clientY - r.top - f.cy) / f.ry;
    if (dx * dx + dy * dy > 1.4) return;
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
  s.add(new T.Mesh(new T.BoxGeometry(12, 8, 12), new T.MeshBasicMaterial({ color: 0x7a879c, side: T.BackSide })));
  const panel = (w, h, x, y, z, ry, rx, color, i) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color }));
    m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
  };
  panel(8, 2.2, 0, 3.9, 0, 0, Math.PI / 2, 0xfff4e0, 4.2);   // warm overhead softbox
  panel(3, 5, -5.9, 0.5, 0, Math.PI / 2, 0, 0xffffff, 2.6);   // left strip
  panel(3, 5, 5.9, 0.5, 1, -Math.PI / 2, 0, 0xcfe0ff, 2.2);   // cool blue right
  panel(6, 2, 0, 1, 5.9, Math.PI, 0, 0xffffff, 1.6);          // front fill
  panel(4, 1, 2, -1.5, -5.9, 0, 0, 0xf4b544, 1.2);            // small gold kicker
  panel(12, 1.6, 0, -3.9, 0, 0, -Math.PI / 2, 0x1b2436, 1);   // dark floor band for contrast
  panel(2, 6, -3, 0, -5.9, 0, 0, 0x222c40, 1);                // dark flag
  return s;
}

function drawDial(S) {
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), k = S / 2; g.translate(k, k);
  const font = (w) => w + ' Geist, Inter, system-ui, -apple-system, Segoe UI, sans-serif';
  const mono = (w) => w + ' "Geist Mono", ui-monospace, Menlo, monospace';
  let gr = g.createRadialGradient(0, -k * 0.15, 0, 0, 0, k);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.72, '#f7f9fc'); gr.addColorStop(0.94, '#e7edf6'); gr.addColorStop(1, '#ccd6e5');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, k, 0, Math.PI * 2); g.fill();
  const ring = (r, w, col) => { g.strokeStyle = col; g.lineWidth = w * k; g.beginPath(); g.arc(0, 0, r * k, 0, Math.PI * 2); g.stroke(); };
  ring(0.955, 0.004, '#b7c4d8'); ring(0.83, 0.003, '#d2dcea'); ring(0.58, 0.0025, '#dfe6f1'); ring(0.3, 0.0025, '#e4eaf3');
  // Faint navigation grid: a dashed route arc through the centre.
  g.save(); g.setLineDash([0.012 * k, 0.018 * k]); g.strokeStyle = '#d5deeb'; g.lineWidth = 0.003 * k;
  g.beginPath(); g.moveTo(-0.58 * k, 0.2 * k); g.quadraticCurveTo(-0.1 * k, -0.45 * k, 0.5 * k, -0.28 * k); g.stroke(); g.restore();
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, len = (i % 2 ? 0.42 : 0.58) * k, w = (i % 2 ? 0.045 : 0.07) * k;
    g.save(); g.rotate(a);
    g.fillStyle = i % 2 ? '#edf1f8' : '#e3eaf5'; g.beginPath(); g.moveTo(0, -len); g.lineTo(-w, 0); g.lineTo(0, 0); g.fill();
    g.fillStyle = i % 2 ? '#e1e8f3' : '#d5dfee'; g.beginPath(); g.moveTo(0, -len); g.lineTo(w, 0); g.lineTo(0, 0); g.fill();
    g.restore();
  }
  for (let d = 0; d < 360; d += 2) {
    const major = d % 10 === 0, card = d % 90 === 0;
    const len = card ? 0.085 : major ? 0.06 : 0.03;
    g.save(); g.rotate(d * Math.PI / 180);
    g.strokeStyle = card ? '#173F73' : major ? '#14243B' : '#8b9ab0';
    g.lineWidth = (card ? 0.008 : major ? 0.0055 : 0.003) * k; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, -0.94 * k); g.lineTo(0, -(0.94 - len) * k); g.stroke();
    g.restore();
  }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let d = 30; d < 360; d += 30) {
    if (d % 90 === 0) continue;
    g.save(); g.rotate(d * Math.PI / 180); g.fillStyle = '#5D6B80'; g.font = mono('500 ' + Math.round(0.046 * k) + 'px');
    g.fillText(String(d).padStart(3, '0'), 0, -0.78 * k); g.restore();
  }
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([t, d]) => {
    g.save(); g.rotate(d * Math.PI / 180);
    g.fillStyle = t === 'N' ? '#173F73' : '#14243B'; g.font = font('600 ' + Math.round((t === 'N' ? 0.13 : 0.105) * k) + 'px');
    g.fillText(t, 0, -0.69 * k); g.restore();
  });
  // Gold north marker above the N.
  g.fillStyle = '#E9A93A'; g.beginPath(); g.moveTo(0, -0.905 * k); g.lineTo(0.03 * k, -0.86 * k); g.lineTo(-0.03 * k, -0.86 * k); g.closePath(); g.fill();
  gr = g.createRadialGradient(0, 0, 0.9 * k, 0, 0, k); gr.addColorStop(0, 'rgba(16,40,76,0)'); gr.addColorStop(1, 'rgba(16,40,76,.22)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, k, 0, Math.PI * 2); g.fill();
  return c;
}

function drawGlow() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}

function drawNeedleShadow() {
  const c = document.createElement('canvas'); c.width = 84; c.height = 400;
  const g = c.getContext('2d'); g.filter = 'blur(7px)'; g.fillStyle = '#000';
  g.beginPath(); g.moveTo(42, 40); g.lineTo(58, 200); g.lineTo(42, 360); g.lineTo(26, 200); g.closePath(); g.fill();
  return c;
}

function drawGround() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 40, 128, 128, 128);
  gr.addColorStop(0, 'rgba(16,40,76,.34)'); gr.addColorStop(0.55, 'rgba(16,40,76,.12)'); gr.addColorStop(1, 'rgba(16,40,76,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return c;
}

/* The Ask Compass mark (same shapes as the header logo) on the hub. */
function drawMark(S) {
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), k = S / 2, u = S / 32;
  g.fillStyle = '#10284C'; g.beginPath(); g.arc(k, k, k, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(243,246,251,.22)'; g.lineWidth = u; g.beginPath(); g.arc(k, k, 11 * u, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#F4B544'; g.beginPath(); g.moveTo(16 * u, 6.5 * u); g.lineTo(19 * u, 16 * u); g.lineTo(13 * u, 16 * u); g.closePath(); g.fill();
  g.fillStyle = '#FCFCFA'; g.beginPath(); g.moveTo(16 * u, 25.5 * u); g.lineTo(13 * u, 16 * u); g.lineTo(19 * u, 16 * u); g.closePath(); g.fill();
  g.fillStyle = '#10284C'; g.beginPath(); g.arc(k, k, 1.6 * u, 0, Math.PI * 2); g.fill();
  return c;
}
