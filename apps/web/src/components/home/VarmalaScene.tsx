'use client'

import { motion, useReducedMotion } from 'framer-motion'

/* ── palette constants ── */
const M = '#7A1220'   // maroon
const MD = '#5A0E19'  // maroon deep
const M2 = '#9B2233'  // maroon light
const G  = '#B98A2E'  // gold
const GL = '#E4C572'  // gold light
const T  = '#D4A574'  // skin tone
const TS = '#C48A5A'  // skin shadow
const DB = '#2B1506'  // dark brown / hair
const GR = '#2D5A27'  // green
const DK = '#D4122C'  // red accent / bindi

/* helper: Marigold flower at (cx, cy, r) */
function Marigold({ cx, cy, r = 7, fill = '#E8912A' }: { cx: number; cy: number; r?: number; fill?: string }) {
  return (
    <g>
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <ellipse
            key={i}
            cx={cx + (r - 1) * Math.cos(rad)}
            cy={cy + (r - 1) * Math.sin(rad)}
            rx={r * 0.55}
            ry={r * 0.85}
            fill={fill}
            stroke={MD}
            strokeWidth="0.5"
            transform={`rotate(${a} ${cx + (r - 1) * Math.cos(rad)} ${cy + (r - 1) * Math.sin(rad)})`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r * 0.45} fill={GL} stroke={G} strokeWidth="0.5" />
    </g>
  )
}

/* helper: Lotus flower */
function Lotus({ cx, cy, r = 12, petal = '#FF91A4' }: { cx: number; cy: number; r?: number; petal?: string }) {
  return (
    <g>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <ellipse
            key={i}
            cx={cx + r * 0.7 * Math.cos(rad)}
            cy={cy + r * 0.7 * Math.sin(rad) - 4}
            rx={r * 0.42}
            ry={r * 0.7}
            fill={petal}
            stroke="#D4536A"
            strokeWidth="0.6"
            transform={`rotate(${a} ${cx + r * 0.7 * Math.cos(rad)} ${cy + r * 0.7 * Math.sin(rad) - 4})`}
          />
        )
      })}
      <circle cx={cx} cy={cy - 4} r={r * 0.32} fill="#FFD700" stroke={G} strokeWidth="0.8" />
    </g>
  )
}

/* helper: Peacock */
function Peacock({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  const s = flip ? 'scale(-1,1)' : ''
  return (
    <g transform={`translate(${x},${y})`}>
      <g transform={s} style={{ transformOrigin: '0 0' }}>
        {/* tail feathers */}
        {[-35, -22, -10, 0, 10, 22, 35].map((tx, i) => {
          const ty = -20 - Math.abs(tx) * 0.3
          return (
            <g key={i}>
              <line x1={0} y1={-2} x2={tx} y2={ty - 18} stroke="#1A6B4A" strokeWidth="1.5" />
              <ellipse cx={tx} cy={ty - 18} rx={7} ry={10} fill="#1A6B4A" stroke="#0D4A30" strokeWidth="0.8" />
              <circle cx={tx} cy={ty - 16} r={3.5} fill="#4A90A4" />
              <circle cx={tx} cy={ty - 16} r={1.5} fill={GL} />
            </g>
          )
        })}
        {/* body */}
        <ellipse cx={0} cy={15} rx={20} ry={13} fill="#1A6B4A" stroke="#0D4A30" strokeWidth="1.2" />
        {/* neck */}
        <path d="M -4 4 Q 0 -6 4 -10" fill="none" stroke="#1A6B4A" strokeWidth={10} strokeLinecap="round" />
        {/* head */}
        <circle cx={4} cy={-10} r={9} fill="#1A6B4A" stroke="#0D4A30" strokeWidth="1.2" />
        {/* crown */}
        {[-4, -1, 2, 5, 8].map((ox, i) => (
          <g key={i}>
            <line x1={ox} y1={-19} x2={ox - 1} y2={-27} stroke="#1A6B4A" strokeWidth="1" />
            <circle cx={ox - 1} cy={-28} r={2.2} fill={GL} />
          </g>
        ))}
        {/* eye */}
        <circle cx={9} cy={-12} r={3.5} fill="white" stroke={DB} strokeWidth="0.8" />
        <circle cx={10} cy={-12} r={2} fill={DB} />
        {/* legs */}
        <line x1={-5} y1={28} x2={-5} y2={40} stroke="#8B6914" strokeWidth="2" />
        <line x1={5} y1={28} x2={5} y2={40} stroke="#8B6914" strokeWidth="2" />
        <path d="M -9 40 L -5 40 L -1 40" fill="none" stroke="#8B6914" strokeWidth="1.5" />
        <path d="M 1 40 L 5 40 L 9 40" fill="none" stroke="#8B6914" strokeWidth="1.5" />
      </g>
    </g>
  )
}

/* ── Main component ── */
export function VarmalaScene() {
  const reduce = useReducedMotion()

  const coupleAnim = reduce ? {} : {
    y: [0, -5, 0],
    transition: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' as const },
  }
  const brideAnim = reduce ? {} : {
    y: [0, -5, 0],
    transition: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.6 },
  }
  const garlandAnim = reduce ? {} : {
    rotate: [-2, 2, -2],
    y: [0, 4, 0],
    transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
  }
  const flameAnim = reduce ? {} : {
    scaleY: [1, 1.2, 0.88, 1.05, 1],
    scaleX: [1, 0.9, 1.1, 0.95, 1],
    transition: { duration: 0.65, repeat: Infinity },
  }
  const birdAnim = reduce ? {} : {
    x: [0, 18, 0],
    y: [0, -5, 0],
    transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const },
  }

  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <svg
        viewBox="0 0 900 640"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Traditional Mithila wedding illustration — bride and groom Varmala ceremony"
      >
        <defs>
          <linearGradient id="vSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE8C0" />
            <stop offset="55%" stopColor="#FFCC7A" />
            <stop offset="100%" stopColor="#FF9955" />
          </linearGradient>
          <linearGradient id="vEarth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B6B14" />
            <stop offset="100%" stopColor="#5C3D10" />
          </linearGradient>
          <linearGradient id="vGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={G} />
            <stop offset="50%" stopColor={GL} />
            <stop offset="100%" stopColor={G} />
          </linearGradient>
          <pattern id="pillarPat" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill={M} />
            <circle cx="11" cy="11" r="4" fill="none" stroke={G} strokeWidth="1.2" />
            {[0,90,180,270].map((a, i) => {
              const r = (a * Math.PI) / 180
              return <line key={i} x1={11 + 4 * Math.cos(r)} y1={11 + 4 * Math.sin(r)} x2={11 + 11 * Math.cos(r)} y2={11 + 11 * Math.sin(r)} stroke={G} strokeWidth="0.8" />
            })}
          </pattern>
          <radialGradient id="fireGlow" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="#FF6600" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Sky ── */}
        <rect x="0" y="0" width="900" height="440" fill="url(#vSky)" />

        {/* ── Ground ── */}
        <rect x="0" y="500" width="900" height="140" fill="url(#vEarth)" />
        <rect x="0" y="494" width="900" height="14" fill="#4A7A2E" />

        {/* ── Distant temples ── */}
        {/* Central temple */}
        <g stroke={MD} strokeWidth="1.2" fill={M}>
          <rect x="420" y="210" width="60" height="88" fill={M2} />
          <path d="M 430 298 L 430 268 Q 450 258 470 268 L 470 298 Z" fill={MD} />
          <rect x="428" y="145" width="44" height="68" />
          <rect x="434" y="115" width="32" height="34" fill={M2} />
          <rect x="439" y="96" width="22" height="22" />
          <ellipse cx="450" cy="88" rx="10" ry="7" fill={G} />
          <line x1="450" y1="81" x2="450" y2="73" stroke={G} strokeWidth="2.5" />
          <circle cx="450" cy="72" r="4" fill={GL} />
          <line x1="420" y1="228" x2="480" y2="228" stroke={G} strokeWidth="1.8" />
          <line x1="420" y1="248" x2="480" y2="248" stroke={G} strokeWidth="0.8" />
        </g>

        {/* Left temple */}
        <g fill={M} stroke={MD} strokeWidth="0.8">
          <rect x="88" y="252" width="42" height="72" fill={M2} />
          <path d="M 100 324 L 100 294 Q 109 286 118 294 L 118 324 Z" fill={MD} />
          <rect x="94" y="200" width="30" height="54" />
          <rect x="99" y="176" width="20" height="28" fill={M2} />
          <ellipse cx="109" cy="168" rx="8" ry="6" fill={G} />
          <line x1="109" y1="162" x2="109" y2="156" stroke={G} strokeWidth="2" />
          <circle cx="109" cy="155" r="3" fill={GL} />
          <line x1="88" y1="268" x2="130" y2="268" stroke={G} strokeWidth="1.4" />
        </g>

        {/* Right temple */}
        <g fill={M} stroke={MD} strokeWidth="0.8">
          <rect x="770" y="252" width="42" height="72" fill={M2} />
          <path d="M 782 324 L 782 294 Q 791 286 800 294 L 800 324 Z" fill={MD} />
          <rect x="776" y="200" width="30" height="54" />
          <rect x="781" y="176" width="20" height="28" fill={M2} />
          <ellipse cx="791" cy="168" rx="8" ry="6" fill={G} />
          <line x1="791" y1="162" x2="791" y2="156" stroke={G} strokeWidth="2" />
          <circle cx="791" cy="155" r="3" fill={GL} />
          <line x1="770" y1="268" x2="812" y2="268" stroke={G} strokeWidth="1.4" />
        </g>

        {/* ── Traditional houses ── */}
        <g fill="#C4562F" stroke={MD} strokeWidth="0.9">
          <rect x="40" y="340" width="72" height="58" />
          <polygon points="26,340 126,340 76,295" fill="#9B3520" />
          <rect x="54" y="355" width="13" height="16" fill={MD} />
          <rect x="85" y="355" width="13" height="16" fill={MD} />
          <path d="M 66 398 L 66 372 Q 76 364 86 372 L 86 398 Z" fill={MD} />
          <rect x="148" y="348" width="55" height="50" />
          <polygon points="137,348 214,348 176,314" fill="#9B3520" />
        </g>
        <g fill="#C4562F" stroke={MD} strokeWidth="0.9">
          <rect x="788" y="340" width="72" height="58" />
          <polygon points="774,340 874,340 824,295" fill="#9B3520" />
          <rect x="802" y="355" width="13" height="16" fill={MD} />
          <rect x="833" y="355" width="13" height="16" fill={MD} />
          <path d="M 814 398 L 814 372 Q 824 364 834 372 L 834 398 Z" fill={MD} />
          <rect x="697" y="348" width="55" height="50" />
          <polygon points="686,348 763,348 725,314" fill="#9B3520" />
        </g>

        {/* ── Trees (Madhubani style) ── */}
        {/* Left trees */}
        {[{ x: 206, h: 88, r: 42, c: '#2D5A27' }, { x: 258, h: 68, r: 32, c: '#1F5133' }].map((t, i) => (
          <g key={i}>
            <rect x={t.x - 7} y={t.h > 80 ? 370 : 385} width={14} height={500 - (t.h > 80 ? 370 : 385)} fill="#5D4314" stroke="#3D2A0A" strokeWidth="1" />
            <circle cx={t.x} cy={t.h > 80 ? 328 : 353} r={t.r} fill={t.c} stroke="#1F4020" strokeWidth="1.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, j) => {
              const rad = (a * Math.PI) / 180
              return <circle key={j} cx={t.x + (t.r * 0.65) * Math.cos(rad)} cy={(t.h > 80 ? 328 : 353) + (t.r * 0.65) * Math.sin(rad)} r={4} fill="#E8912A" stroke="#B96A1A" strokeWidth="0.5" />
            })}
          </g>
        ))}
        {/* Right trees */}
        {[{ x: 694, h: 88, r: 42, c: '#2D5A27' }, { x: 642, h: 68, r: 32, c: '#1F5133' }].map((t, i) => (
          <g key={i}>
            <rect x={t.x - 7} y={t.h > 80 ? 370 : 385} width={14} height={500 - (t.h > 80 ? 370 : 385)} fill="#5D4314" stroke="#3D2A0A" strokeWidth="1" />
            <circle cx={t.x} cy={t.h > 80 ? 328 : 353} r={t.r} fill={t.c} stroke="#1F4020" strokeWidth="1.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, j) => {
              const rad = (a * Math.PI) / 180
              return <circle key={j} cx={t.x + (t.r * 0.65) * Math.cos(rad)} cy={(t.h > 80 ? 328 : 353) + (t.r * 0.65) * Math.sin(rad)} r={4} fill="#E8912A" stroke="#B96A1A" strokeWidth="0.5" />
            })}
          </g>
        ))}

        {/* ── Birds in sky ── */}
        <motion.g animate={birdAnim}>
          {[[200,78],[240,62],[278,74],[330,58],[560,65],[605,54],[650,70],[690,60]].map(([bx, by], i) => (
            <path key={i} d={`M ${bx - 8} ${by} Q ${bx} ${by - 7} ${bx + 8} ${by}`} fill="none" stroke="#6A4020" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </motion.g>

        {/* ── Mandap platform ── */}
        <rect x="162" y="490" width="576" height="18" fill={M} stroke={G} strokeWidth="1.5" />
        <rect x="162" y="506" width="576" height="7" fill="url(#vGold)" />

        {/* Pillars */}
        {[{ x: 163, h: 228, cap: 156 }, { x: 258, h: 278, cap: 264 }, { x: 618, h: 278, cap: 264 }, { x: 713, h: 228, cap: 156 }].map((p, i) => (
          <g key={i}>
            <rect x={p.x} y={p.cap} width={34} height={508 - p.cap} fill="url(#pillarPat)" stroke={G} strokeWidth="1.2" />
            <rect x={p.x - 12} y={p.cap - 7} width={58} height={16} fill={G} stroke={M} strokeWidth="0.8" />
            <rect x={p.x - 12} y={490} width={58} height={16} fill={G} stroke={M} strokeWidth="0.8" />
          </g>
        ))}

        {/* Arch over mandap */}
        <path d="M 158 238 Q 450 126 742 238" fill="none" stroke={M} strokeWidth="20" />
        <path d="M 158 238 Q 450 126 742 238" fill="none" stroke={G} strokeWidth="12" />
        <path d="M 158 238 Q 450 126 742 238" fill="none" stroke={GL} strokeWidth="5" strokeDasharray="7,5" />

        {/* Arch medallions */}
        {[[252, 182], [352, 152], [450, 142], [548, 152], [648, 182]].map(([ax, ay], i) => (
          <g key={i}>
            <circle cx={ax} cy={ay} r={16} fill={M} stroke={G} strokeWidth="1.5" />
            <circle cx={ax} cy={ay} r={11} fill={M2} />
            <circle cx={ax} cy={ay} r={7} fill={G} />
            <circle cx={ax} cy={ay} r={3} fill={GL} />
          </g>
        ))}

        {/* ── Garland strings ── */}
        <motion.g className="garland-anim" animate={garlandAnim} style={{ transformOrigin: '450px 240px' }}>
          {/* Main garland string 1 */}
          <path d="M 180 242 Q 450 298 720 242" fill="none" stroke={GR} strokeWidth="2.2" />
          {Array.from({ length: 22 }, (_, i) => {
            const t = i / 21
            const bx = (1 - t) * (1 - t) * 180 + 2 * (1 - t) * t * 450 + t * t * 720
            const by = (1 - t) * (1 - t) * 242 + 2 * (1 - t) * t * 298 + t * t * 242
            return <circle key={i} cx={bx} cy={by} r={i % 3 === 0 ? 7 : 5} fill={i % 2 === 0 ? '#E8912A' : '#FFB347'} stroke="#B96A1A" strokeWidth="0.8" />
          })}

          {/* Inner garland string */}
          <path d="M 272 282 Q 450 324 628 282" fill="none" stroke={GR} strokeWidth="1.8" />
          {Array.from({ length: 16 }, (_, i) => {
            const t = i / 15
            const bx = (1 - t) * (1 - t) * 272 + 2 * (1 - t) * t * 450 + t * t * 628
            const by = (1 - t) * (1 - t) * 282 + 2 * (1 - t) * t * 324 + t * t * 282
            return <circle key={i} cx={bx} cy={by} r={i % 2 === 0 ? 6 : 4} fill={i % 2 === 0 ? '#FFB347' : '#FF8C00'} stroke="#B96A1A" strokeWidth="0.6" />
          })}
        </motion.g>

        {/* ── Sacred fire (havan kund) ── */}
        <g>
          <ellipse cx={450} cy={488} rx={26} ry={9} fill={M} stroke={G} strokeWidth="1.5" />
          <path d="M 424 488 L 430 468 L 470 468 L 476 488 Z" fill="#8B3520" stroke={G} strokeWidth="1.2" />
          <path d="M 430 468 L 434 452 L 466 452 L 470 468 Z" fill={M} stroke={G} strokeWidth="1.2" />
          <ellipse cx={450} cy={452} rx={20} ry={8} fill={MD} stroke={G} strokeWidth="1.2" />
          <ellipse cx={450} cy={460} rx={36} ry={14} fill="url(#fireGlow)" />
          <motion.g animate={flameAnim} style={{ transformOrigin: '450px 452px' }}>
            <path d="M 438 452 Q 440 430 444 416 Q 448 404 450 394 Q 452 404 456 416 Q 460 430 462 452" fill="#FF6B1A" />
            <path d="M 442 452 Q 444 434 447 422 Q 450 412 450 404 Q 450 412 453 422 Q 456 434 458 452" fill="#FFB347" />
            <path d="M 446 452 Q 448 438 450 428 Q 452 438 454 452" fill="#FFFF66" />
          </motion.g>
        </g>

        {/* ── GROOM (left, facing right) ── */}
        <motion.g animate={coupleAnim}>
          {/* Pagdi */}
          <ellipse cx={328} cy={268} rx={30} ry={11} fill={M} stroke={G} strokeWidth="1.5" />
          <rect x={298} y={242} width={60} height={28} fill={M2} stroke={G} strokeWidth="1.2" rx={4} />
          <rect x={298} y={263} width={60} height={6} fill={G} />
          {[305, 315, 325, 335, 345, 353].map((sx, si) => (
            <line key={si} x1={sx} y1={270} x2={sx + (si % 2 === 0 ? -2 : 2)} y2={292} stroke={G} strokeWidth="0.9" opacity="0.85" />
          ))}

          {/* Face */}
          <ellipse cx={328} cy={302} rx={23} ry={26} fill={T} stroke={TS} strokeWidth="1.2" />
          <circle cx={328} cy={283} r={2.8} fill={DK} />
          <ellipse cx={318} cy={298} rx={3.8} ry={4} fill="white" stroke={DB} strokeWidth="0.8" />
          <circle cx={319} cy={298} r={2.3} fill={DB} />
          <ellipse cx={338} cy={298} rx={3.8} ry={4} fill="white" stroke={DB} strokeWidth="0.8" />
          <circle cx={339} cy={298} r={2.3} fill={DB} />
          <ellipse cx={328} cy={308} rx={2.5} ry={2} fill={TS} />
          <path d="M 316 315 Q 328 319 340 315" fill="none" stroke={DB} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 318 319 Q 328 323 338 319" fill="none" stroke={TS} strokeWidth="0.8" />
          <ellipse cx={307} cy={303} rx={4} ry={6} fill="#C4956A" stroke={TS} strokeWidth="0.8" />
          <ellipse cx={349} cy={303} rx={4} ry={6} fill="#C4956A" stroke={TS} strokeWidth="0.8" />
          <circle cx={307} cy={308} r={3} fill={G} />

          {/* Neck */}
          <rect x={321} y={328} width={14} height={17} fill={T} stroke={TS} strokeWidth="0.5" />

          {/* Necklace */}
          <path d="M 306 343 Q 328 352 350 343" fill="none" stroke={G} strokeWidth="2.5" />
          {[311, 320, 328, 336, 345].map((nx, ni) => (
            <circle key={ni} cx={nx} cy={343 + Math.abs(nx - 328) / 8} r={2.8} fill={GL} stroke={G} strokeWidth="0.4" />
          ))}

          {/* Sherwani */}
          <rect x={295} y={345} width={66} height={88} fill="#3A0610" stroke={M} strokeWidth="1.2" rx={4} />
          <path d="M 317 345 L 317 360 L 328 367 L 339 360 L 339 345" fill={MD} stroke={G} strokeWidth="0.8" />
          {[368, 383, 398, 413, 423].map((sy, si) => (
            <circle key={si} cx={328} cy={sy} r={2.2} fill={GL} stroke={G} strokeWidth="0.4" />
          ))}
          <rect x={295} y={425} width={66} height={8} fill={G} />
          <rect x={295} y={425} width={66} height={4} fill={GL} />

          {/* Left arm (down) */}
          <rect x={282} y={345} width={15} height={68} fill="#3A0610" stroke={M} strokeWidth="0.8" rx={4} />
          <ellipse cx={289} cy={420} rx={9} ry={11} fill={T} stroke={TS} strokeWidth="0.8" />

          {/* Right arm (toward bride — key for Varmala) */}
          <path d="M 361 358 Q 405 344 432 350" fill="none" stroke="#3A0610" strokeWidth={14} strokeLinecap="round" />
          <ellipse cx={437} cy={350} rx={10} ry={9} fill={T} stroke={TS} strokeWidth="0.8" />

          {/* Dhoti */}
          <path d="M 297 433 L 305 494 L 338 494 L 338 433 Z" fill="#FFF5E0" stroke="#D4A836" strokeWidth="0.8" />
          <path d="M 338 433 L 338 494 L 356 494 L 360 433 Z" fill="#F0E8D0" stroke="#D4A836" strokeWidth="0.8" />
          <line x1={297} y1={491} x2={360} y2={491} stroke="#D4A836" strokeWidth="2.5" />
          <ellipse cx={321} cy={498} rx={17} ry={5} fill="#8B5E3C" stroke="#5D3A1A" strokeWidth="0.8" />
          <ellipse cx={349} cy={498} rx={15} ry={5} fill="#8B5E3C" stroke="#5D3A1A" strokeWidth="0.8" />
        </motion.g>

        {/* ── BRIDE (right, facing left) ── */}
        <motion.g animate={brideAnim}>
          {/* Hair bun */}
          <ellipse cx={572} cy={265} rx={27} ry={21} fill={DB} stroke="#1A0D02" strokeWidth="1.2" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, ai) => {
            const rad = (a * Math.PI) / 180
            return <circle key={ai} cx={572 + 24 * Math.cos(rad)} cy={265 + 19 * Math.sin(rad)} r={3.5} fill="#FFFFE0" stroke="#DAA520" strokeWidth="0.4" />
          })}

          {/* Maang tikka */}
          <line x1={572} y1={248} x2={572} y2={281} stroke={G} strokeWidth="1.2" />
          <circle cx={572} cy={247} r={5} fill={GL} stroke={G} strokeWidth="0.8" />
          <circle cx={572} cy={247} r={2.2} fill={DK} />

          {/* Face */}
          <ellipse cx={572} cy={302} rx={22} ry={25} fill={T} stroke={TS} strokeWidth="1.2" />
          <circle cx={572} cy={284} r={3.2} fill={DK} stroke="#8B0020" strokeWidth="0.4" />
          <ellipse cx={562} cy={299} rx={3.8} ry={4} fill="white" stroke={DB} strokeWidth="0.8" />
          <circle cx={561} cy={299} r={2.3} fill={DB} />
          <path d="M 556 299 Q 562 302 568 299" fill="none" stroke="#1A0D02" strokeWidth="0.9" />
          <ellipse cx={582} cy={299} rx={3.8} ry={4} fill="white" stroke={DB} strokeWidth="0.8" />
          <circle cx={583} cy={299} r={2.3} fill={DB} />
          <path d="M 576 299 Q 582 302 588 299" fill="none" stroke="#1A0D02" strokeWidth="0.9" />
          <ellipse cx={572} cy={310} rx={2.2} ry={1.8} fill={TS} />
          <circle cx={563} cy={311} r={3.5} fill="none" stroke={G} strokeWidth="1.2" />
          <circle cx={562} cy={313} r={1.4} fill={DK} />
          <path d="M 561 318 Q 572 322 583 318" fill={DK} stroke="#8B0020" strokeWidth="0.4" />
          <ellipse cx={551} cy={305} rx={3.5} ry={5.5} fill="#C4956A" stroke={TS} strokeWidth="0.8" />
          <ellipse cx={593} cy={305} rx={3.5} ry={5.5} fill="#C4956A" stroke={TS} strokeWidth="0.8" />
          <circle cx={551} cy={309} r={4} fill={G} stroke={G} strokeWidth="0.5" />
          <circle cx={593} cy={309} r={4} fill={G} stroke={G} strokeWidth="0.5" />

          {/* Neck + mangalsutra */}
          <rect x={564} y={327} width={16} height={17} fill={T} stroke={TS} strokeWidth="0.4" />
          <path d="M 550 342 Q 572 354 594 342" fill="none" stroke={DB} strokeWidth="2" />
          {[556, 564, 572, 580, 588].map((nx, ni) => (
            <circle key={ni} cx={nx} cy={342 + Math.abs(nx - 572) / 8} r={2.5} fill={GL} stroke={G} strokeWidth="0.4" />
          ))}
          <circle cx={572} cy={357} r={4} fill={DK} stroke="#8B0020" strokeWidth="0.8" />

          {/* Blouse */}
          <rect x={548} y={344} width={48} height={40} fill="#8B0020" stroke="#5A0010" strokeWidth="0.9" rx={3} />
          {[354, 368, 378].map((ly, li) => (
            <line key={li} x1={548} y1={ly} x2={596} y2={ly} stroke={G} strokeWidth="0.9" opacity="0.5" />
          ))}

          {/* Saree body */}
          <path d="M 548 384 L 543 496 L 602 496 L 607 384 Z" fill="#8B0020" stroke="#5A0010" strokeWidth="0.8" />
          {[550, 558, 566, 574, 582, 590].map((px, pi) => (
            <line key={pi} x1={px} y1={384} x2={px - 2} y2={496} stroke="#6B0018" strokeWidth="0.8" opacity="0.6" />
          ))}
          <rect x={543} y={489} width={64} height={7} fill={G} />
          <rect x={543} y={489} width={64} height={3} fill={GL} />

          {/* Saree pallu (over shoulder) */}
          <path d="M 596 344 Q 622 330 626 420 L 606 420 Z" fill="#A00025" stroke="#5A0010" strokeWidth="0.8" />
          <path d="M 601 350 Q 622 336 624 382" fill="none" stroke={G} strokeWidth="1.2" />

          {/* Left arm (toward groom — Varmala) */}
          <path d="M 548 362 Q 510 350 480 355" fill="none" stroke="#8B0020" strokeWidth={13} strokeLinecap="round" />
          <ellipse cx={475} cy={355} rx={10} ry={9} fill={T} stroke={TS} strokeWidth="0.8" />
          {[0, 1, 2, 3].map(bi => (
            <ellipse key={bi} cx={514 - bi * 5} cy={352 + bi} rx={6} ry={4} fill="none" stroke={bi % 2 === 0 ? G : DK} strokeWidth="1.8" />
          ))}

          {/* Right arm (down) */}
          <rect x={596} y={346} width={13} height={66} fill="#8B0020" stroke="#5A0010" strokeWidth="0.8" rx={3} />
          <ellipse cx={602} cy={420} rx={8} ry={10} fill={T} stroke={TS} strokeWidth="0.8" />
          {[0, 1, 2].map(bi => (
            <ellipse key={bi} cx={603} cy={400 - bi * 5} rx={7} ry={4.5} fill="none" stroke={bi % 2 === 0 ? G : '#FF6B1A'} strokeWidth="1.8" />
          ))}

          {/* Feet + anklets */}
          <ellipse cx={560} cy={499} rx={15} ry={5} fill="#8B5E3C" stroke="#5D3A1A" strokeWidth="0.8" />
          <ellipse cx={587} cy={499} rx={14} ry={5} fill="#8B5E3C" stroke="#5D3A1A" strokeWidth="0.8" />
          <ellipse cx={560} cy={495} rx={15} ry={4} fill="none" stroke={G} strokeWidth="1.8" />
          <ellipse cx={587} cy={495} rx={14} ry={4} fill="none" stroke={G} strokeWidth="1.8" />
        </motion.g>

        {/* ── VARMALA GARLANDS (between couple) ── */}
        <motion.g animate={garlandAnim} style={{ transformOrigin: '455px 365px' }}>
          {/* Garland 1 */}
          <path d="M 437 350 Q 456 392 475 368 Q 490 346 506 366 Q 522 386 538 366 Q 550 350 568 355" fill="none" stroke={GR} strokeWidth="3.5" />
          {[[437,350],[445,368],[453,380],[461,372],[470,354],[477,348],[485,360],[494,375],[503,372],[512,358],[521,348],[530,360],[539,370],[547,366],[556,358],[562,354],[568,355]].map(([vx, vy], vi) => (
            <Marigold key={vi} cx={vx} cy={vy} r={vi === 8 ? 11 : 7} fill={vi % 3 === 0 ? '#E8912A' : vi % 3 === 1 ? '#FFD700' : '#FF8C00'} />
          ))}

          {/* Garland 2 (slightly below) */}
          <path d="M 437 360 Q 456 400 475 378 Q 490 356 506 374 Q 522 394 538 374 Q 550 360 568 363" fill="none" stroke="#2D5A1E" strokeWidth="2.5" />
          {Array.from({ length: 14 }, (_, i) => {
            const t = i / 13
            const bx = (1 - t) * (1 - t) * 437 + 2 * (1 - t) * t * 503 + t * t * 568
            const by = (1 - t) * (1 - t) * 360 + 2 * (1 - t) * t * 400 + t * t * 363
            return <circle key={i} cx={bx} cy={by} r={5} fill={i % 2 === 0 ? '#FF8C00' : '#FFD700'} stroke="#B96A1A" strokeWidth="0.5" />
          })}
        </motion.g>

        {/* ── FAMILY MEMBERS ── */}

        {/* Left family — woman 1 */}
        <g>
          <circle cx={186} cy={362} r={21} fill={T} stroke={TS} strokeWidth="1.2" />
          <path d="M 165 362 Q 186 344 207 362" fill={DB} stroke="#1A0D02" strokeWidth="0.8" />
          <circle cx={186} cy={350} r={2.8} fill={DK} />
          {[[176,358],[196,358]].map(([ex,ey],ei) => (
            <g key={ei}><ellipse cx={ex} cy={ey} rx={3.5} ry={3.8} fill="white" stroke={DB} strokeWidth="0.7" /><circle cx={ex} cy={ey} r={2} fill={DB} /></g>
          ))}
          <rect x={165} y={383} width={42} height={88} fill="#1F5133" stroke="#144022" strokeWidth="0.8" />
          <rect x={165} y={383} width={42} height={28} fill="#2D7040" stroke="#144022" strokeWidth="0.5" />
          <rect x={165} y={464} width={42} height={7} fill={G} />
          <rect x={153} y={383} width={14} height={52} fill="#1F5133" strokeWidth="0.5" rx={5} />
          <rect x={207} y={383} width={14} height={52} fill="#1F5133" strokeWidth="0.5" rx={5} />
        </g>

        {/* Left family — woman 2 */}
        <g opacity="0.88">
          <circle cx={122} cy={368} r={17} fill={T} stroke={TS} strokeWidth="1" />
          <path d="M 106 367 Q 122 352 138 367" fill={DB} stroke="#1A0D02" strokeWidth="0.7" />
          <circle cx={122} cy={356} r={2.3} fill={DK} />
          <rect x={106} y={385} width={32} height={84} fill="#2E3A8E" stroke="#1A2A6E" strokeWidth="0.8" />
          <rect x={106} y={385} width={32} height={24} fill="#3A4A9E" stroke="#1A2A6E" strokeWidth="0.5" />
          <rect x={106} y={462} width={32} height={7} fill={G} />
          <rect x={97} y={385} width={11} height={48} fill="#2E3A8E" strokeWidth="0.5" rx={4} />
          <rect x={138} y={385} width={11} height={48} fill="#2E3A8E" strokeWidth="0.5" rx={4} />
        </g>

        {/* Right family — woman 1 */}
        <g>
          <circle cx={714} cy={362} r={21} fill={T} stroke={TS} strokeWidth="1.2" />
          <path d="M 693 362 Q 714 344 735 362" fill={DB} stroke="#1A0D02" strokeWidth="0.8" />
          <circle cx={714} cy={350} r={2.8} fill={DK} />
          {[[704,358],[724,358]].map(([ex,ey],ei) => (
            <g key={ei}><ellipse cx={ex} cy={ey} rx={3.5} ry={3.8} fill="white" stroke={DB} strokeWidth="0.7" /><circle cx={ex} cy={ey} r={2} fill={DB} /></g>
          ))}
          <rect x={693} y={383} width={42} height={88} fill="#C4562F" stroke="#8B3520" strokeWidth="0.8" />
          <rect x={693} y={383} width={42} height={28} fill="#D4664A" stroke="#8B3520" strokeWidth="0.5" />
          <rect x={693} y={464} width={42} height={7} fill={G} />
          <rect x={680} y={383} width={14} height={52} fill="#C4562F" strokeWidth="0.5" rx={5} />
          <rect x={735} y={383} width={14} height={52} fill="#C4562F" strokeWidth="0.5" rx={5} />
        </g>

        {/* Right family — woman 2 */}
        <g opacity="0.88">
          <circle cx={776} cy={368} r={17} fill={T} stroke={TS} strokeWidth="1" />
          <path d="M 760 367 Q 776 352 792 367" fill={DB} stroke="#1A0D02" strokeWidth="0.7" />
          <circle cx={776} cy={356} r={2.3} fill={DK} />
          <rect x={760} y={385} width={32} height={84} fill="#5A2D82" stroke="#3A1A5A" strokeWidth="0.8" />
          <rect x={760} y={385} width={32} height={24} fill="#6B3A90" stroke="#3A1A5A" strokeWidth="0.5" />
          <rect x={760} y={462} width={32} height={7} fill={G} />
          <rect x={750} y={385} width={11} height={48} fill="#5A2D82" strokeWidth="0.5" rx={4} />
          <rect x={792} y={385} width={11} height={48} fill="#5A2D82" strokeWidth="0.5" rx={4} />
        </g>

        {/* ── Peacocks ── */}
        <Peacock x={62} y={465} />
        <Peacock x={838} y={465} flip />

        {/* ── Lotus decorations ── */}
        {[[172, 504], [732, 504], [360, 520], [540, 520], [450, 528]].map(([lx, ly], li) => (
          <Lotus key={li} cx={lx} cy={ly} r={10} petal={li % 2 === 0 ? '#FF91A4' : '#FFB3C1'} />
        ))}

        {/* ── Decorative floating notes ── */}
        <g>
          <rect x={712} y={170} width={118} height={82} fill="rgba(251,241,221,0.92)" stroke={G} strokeWidth="1.5" rx={8} />
          <line x1={712} y1={190} x2={830} y2={190} stroke={G} strokeWidth="0.8" />
          <text x={771} y={185} textAnchor="middle" fontSize="8" fill={M} fontFamily="serif" fontStyle="italic">Two Families</text>
          <text x={771} y={204} textAnchor="middle" fontSize="8" fill="#6A5A4E" fontFamily="serif">Stronger Together</text>
          <text x={771} y={219} textAnchor="middle" fontSize="8" fill="#6A5A4E" fontFamily="serif">Forever United</text>
          <text x={771} y={242} textAnchor="middle" fontSize="14" fill={DK} fontFamily="serif">♥</text>
        </g>

        <g>
          <rect x={712} y={268} width={95} height={108} fill="rgba(251,241,221,0.92)" stroke={G} strokeWidth="1.5" rx={8} />
          <text x={759} y={290} textAnchor="middle" fontSize="8" fill={M} fontFamily="serif">Rooted</text>
          <text x={759} y={306} textAnchor="middle" fontSize="8" fill={M} fontFamily="serif">in Culture</text>
          <text x={759} y={326} textAnchor="middle" fontSize="8" fill={M} fontFamily="serif">United</text>
          <text x={759} y={342} textAnchor="middle" fontSize="8" fill={M} fontFamily="serif">in Love</text>
          <text x={759} y={358} textAnchor="middle" fontSize="8" fill={M} fontFamily="serif">Forever</text>
          <text x={759} y={368} textAnchor="middle" fontSize="12" fill={DK} fontFamily="serif">♥</text>
        </g>

        {/* ── Madhubani frame border ── */}
        {/* Top border */}
        <rect x={0} y={0} width={900} height={22} fill={M} />
        <rect x={0} y={22} width={900} height={5} fill={G} />
        {[55, 175, 295, 415, 450, 485, 605, 725, 845].map((fx, fi) => (
          <g key={fi} transform={`translate(${fx},11)`}>
            <ellipse cx={0} cy={0} rx={13} ry={6} fill={GL} stroke={G} strokeWidth="0.7" />
            <path d="M 13 0 L 20 -5 L 20 5 Z" fill={GL} stroke={G} strokeWidth="0.7" />
            <circle cx={-5} cy={0} r={1.8} fill={M} />
          </g>
        ))}

        {/* Bottom border */}
        <rect x={0} y={613} width={900} height={5} fill={G} />
        <rect x={0} y={618} width={900} height={22} fill={M} />
        {[80, 210, 340, 450, 560, 690, 820].map((lx, li) => (
          <g key={li} transform={`translate(${lx},629)`}>
            {[0, 60, 120, 180, 240, 300].map((a, ai) => {
              const r2 = (a * Math.PI) / 180
              return <ellipse key={ai} cx={8 * Math.cos(r2)} cy={5 * Math.sin(r2)} rx={4} ry={6} fill={GL} stroke={G} strokeWidth="0.4" transform={`rotate(${a} ${8 * Math.cos(r2)} ${5 * Math.sin(r2)})`} />
            })}
            <circle cx={0} cy={0} r={2.5} fill="#FFFF99" />
          </g>
        ))}

        {/* Left border */}
        <rect x={0} y={22} width={22} height={591} fill={M} />
        <rect x={22} y={22} width={5} height={591} fill={G} />
        {[80, 160, 240, 320, 400, 480, 560].map((fy, fi) => (
          <g key={fi} transform={`translate(11,${fy}) rotate(90)`}>
            <ellipse cx={0} cy={0} rx={12} ry={5.5} fill={GL} stroke={G} strokeWidth="0.6" />
            <path d="M 12 0 L 19 -5 L 19 5 Z" fill={GL} stroke={G} strokeWidth="0.6" />
            <circle cx={-5} cy={0} r={1.6} fill={M} />
          </g>
        ))}

        {/* Right border */}
        <rect x={873} y={22} width={27} height={591} fill={M} />
        <rect x={868} y={22} width={5} height={591} fill={G} />
        {[80, 160, 240, 320, 400, 480, 560].map((fy, fi) => (
          <g key={fi} transform={`translate(887,${fy}) rotate(-90)`}>
            <ellipse cx={0} cy={0} rx={12} ry={5.5} fill={GL} stroke={G} strokeWidth="0.6" />
            <path d="M 12 0 L 19 -5 L 19 5 Z" fill={GL} stroke={G} strokeWidth="0.6" />
            <circle cx={-5} cy={0} r={1.6} fill={M} />
          </g>
        ))}

        {/* Corner medallions */}
        {[[22,22],[878,22],[22,618],[878,618]].map(([cx2,cy2],ci) => (
          <g key={ci}>
            <circle cx={cx2} cy={cy2} r={18} fill={G} stroke={M} strokeWidth="1.5" />
            <circle cx={cx2} cy={cy2} r={12} fill={GL} />
            <circle cx={cx2} cy={cy2} r={7} fill={M} />
            <circle cx={cx2} cy={cy2} r={3} fill={GL} />
          </g>
        ))}
      </svg>

      {/* Floating petals overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              left: `${5 + i * 6.5}%`,
              animationDelay: `${i * 0.55}s`,
              animationDuration: `${3.8 + (i % 4) * 0.7}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
