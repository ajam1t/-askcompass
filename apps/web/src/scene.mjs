/* Hero landscape for the homepage, generated at build time so it ships as a
   small inline SVG: night sky, stars, a warm horizon glow, layered ridgelines
   with rim light, and drifting mist. Deterministic (seeded) so builds match. */
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

function ridge(rand, { base, amp, rough, w, h, step = 16 }) {
  const ph = [rand() * 6, rand() * 6, rand() * 6, rand() * 6];
  const y = (x) => base
    - amp * (0.55 * Math.sin(x / (w * 0.21) + ph[0]) + 0.3 * Math.sin(x / (w * 0.09) + ph[1]) + 0.15 * Math.sin(x / (w * 0.035) + ph[2]))
    - rough * Math.abs(Math.sin(x / 23 + ph[3]) * Math.sin(x / 61 + ph[0]));
  let d = `M0 ${h} L0 ${y(0).toFixed(1)}`;
  for (let x = step; x <= w; x += step) d += ` L${x} ${y(x).toFixed(1)}`;
  const top = d.replace(`M0 ${h} L`, 'M');
  return { area: `${d} L${w} ${h} Z`, top };
}

export function heroScene() {
  const W = 1600, H = 900, rand = rng(11);
  let stars = '';
  for (let i = 0; i < 90; i++) {
    const x = rand() * W, y = rand() * H * 0.45, r = rand() * 1.1 + 0.3;
    stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(2)}" opacity="${(0.25 + rand() * 0.6).toFixed(2)}"/>`;
  }
  const layers = [
    { base: 560, amp: 70, rough: 18, fill: '#25335f', rim: 0.55, op: 0.85 },
    { base: 640, amp: 95, rough: 26, fill: '#18244a', rim: 0.4, op: 1 },
    { base: 735, amp: 85, rough: 30, fill: '#0f1934', rim: 0.28, op: 1 },
    { base: 840, amp: 70, rough: 34, fill: '#08101f', rim: 0.18, op: 1 }
  ].map((l) => ({ ...l, ...ridge(rand, { ...l, w: W, h: H }) }));
  const mist = (y, o) => `<ellipse cx="${W / 2}" cy="${y}" rx="${W * 0.7}" ry="38" fill="#cfd9f2" opacity="${o}" filter="url(#hxBlur)"/>`;
  return `<svg class="hx-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="hxSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#040a18"/><stop offset=".42" stop-color="#0b1838"/><stop offset=".62" stop-color="#2a2d5c"/><stop offset=".74" stop-color="#6b4a6a"/><stop offset=".84" stop-color="#b9786a"/><stop offset="1" stop-color="#1a1f3a"/>
    </linearGradient>
    <radialGradient id="hxSun" cx=".68" cy=".66" r=".42"><stop offset="0" stop-color="#ffb47a" stop-opacity=".55"/><stop offset=".4" stop-color="#d77a7a" stop-opacity=".22"/><stop offset="1" stop-color="#d77a7a" stop-opacity="0"/></radialGradient>
    <radialGradient id="hxGlow" cx=".72" cy=".42" r=".35"><stop offset="0" stop-color="#4c9aff" stop-opacity=".35"/><stop offset="1" stop-color="#4c9aff" stop-opacity="0"/></radialGradient>
    <linearGradient id="hxRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc59a" stop-opacity=".2"/><stop offset=".65" stop-color="#ffd2a8"/><stop offset="1" stop-color="#ffc59a" stop-opacity=".3"/></linearGradient>
    <filter id="hxBlur" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hxSky)"/>
  <rect width="${W}" height="${H}" fill="url(#hxSun)"/>
  <g fill="#e8eeff">${stars}</g>
  <rect width="${W}" height="${H}" fill="url(#hxGlow)"/>
  ${layers.map((l, i) => `<path class="hx-layer hx-layer-${i}" d="${l.area}" fill="${l.fill}" opacity="${l.op}"/><path d="${l.top}" fill="none" stroke="url(#hxRim)" stroke-width="1.2" opacity="${l.rim}"/>${i < 3 ? mist(l.base + 10, 0.08 + i * 0.03) : ''}`).join('\n  ')}
</svg>`;
}
