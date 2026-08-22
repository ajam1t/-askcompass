interface MithilaBorderProps {
  className?: string
  variant?: 'top' | 'bottom' | 'full'
}

export function MithilaBorder({ className = '', variant = 'full' }: MithilaBorderProps) {
  const showTop = variant === 'top' || variant === 'full'
  const showBottom = variant === 'bottom' || variant === 'full'

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {showTop && (
        <svg viewBox="0 0 1200 36" xmlns="http://www.w3.org/2000/svg" className="w-full h-9" preserveAspectRatio="none">
          <rect width="1200" height="36" fill="#7A1220" />
          <rect y="30" width="1200" height="6" fill="#B98A2E" />
          {/* Repeating lotus + fish motif */}
          {Array.from({ length: 20 }, (_, i) => {
            const x = 30 + i * 60
            return (
              <g key={i} transform={`translate(${x},14)`}>
                {/* Lotus petals */}
                {[-12, -6, 0, 6, 12].map((dx, pi) => (
                  <ellipse
                    key={pi}
                    cx={dx}
                    cy={-6}
                    rx={4.5}
                    ry={8}
                    fill="#E4C572"
                    stroke="#B98A2E"
                    strokeWidth="0.6"
                    opacity="0.9"
                  />
                ))}
                <circle cx={0} cy={-4} r={3.5} fill="#B98A2E" />
                <circle cx={0} cy={-4} r={1.5} fill="#E4C572" />
                {/* Small fish between lotuses */}
                <path d={`M ${33} -8 Q ${40} -13 ${47} -8 Q ${40} -3 ${33} -8 Z`} fill="#E4C572" stroke="#B98A2E" strokeWidth="0.7" />
                <circle cx={37} cy={-9} r={1.2} fill="#7A1220" />
              </g>
            )
          })}
          {/* Gold diamond chain */}
          <path
            d="M 0 32 L 20 26 L 40 32 L 60 26 L 80 32 L 100 26 L 120 32 L 140 26 L 160 32 L 180 26 L 200 32 L 220 26 L 240 32 L 260 26 L 280 32 L 300 26 L 320 32 L 340 26 L 360 32 L 380 26 L 400 32 L 420 26 L 440 32 L 460 26 L 480 32 L 500 26 L 520 32 L 540 26 L 560 32 L 580 26 L 600 32 L 620 26 L 640 32 L 660 26 L 680 32 L 700 26 L 720 32 L 740 26 L 760 32 L 780 26 L 800 32 L 820 26 L 840 32 L 860 26 L 880 32 L 900 26 L 920 32 L 940 26 L 960 32 L 980 26 L 1000 32 L 1020 26 L 1040 32 L 1060 26 L 1080 32 L 1100 26 L 1120 32 L 1140 26 L 1160 32 L 1180 26 L 1200 32"
            fill="none"
            stroke="#E4C572"
            strokeWidth="1.2"
            opacity="0.7"
          />
        </svg>
      )}
      {showBottom && (
        <svg viewBox="0 0 1200 36" xmlns="http://www.w3.org/2000/svg" className="w-full h-9" preserveAspectRatio="none">
          <rect width="1200" height="36" fill="#7A1220" />
          <rect width="1200" height="6" fill="#B98A2E" />
          {Array.from({ length: 20 }, (_, i) => {
            const x = 30 + i * 60
            return (
              <g key={i} transform={`translate(${x},22)`}>
                {[-12, -6, 0, 6, 12].map((dx, pi) => (
                  <ellipse
                    key={pi}
                    cx={dx}
                    cy={6}
                    rx={4.5}
                    ry={8}
                    fill="#E4C572"
                    stroke="#B98A2E"
                    strokeWidth="0.6"
                    opacity="0.9"
                  />
                ))}
                <circle cx={0} cy={4} r={3.5} fill="#B98A2E" />
                <circle cx={0} cy={4} r={1.5} fill="#E4C572" />
              </g>
            )
          })}
          <path
            d="M 0 4 L 20 10 L 40 4 L 60 10 L 80 4 L 100 10 L 120 4 L 140 10 L 160 4 L 180 10 L 200 4 L 220 10 L 240 4 L 260 10 L 280 4 L 300 10 L 320 4 L 340 10 L 360 4 L 380 10 L 400 4 L 420 10 L 440 4 L 460 10 L 480 4 L 500 10 L 520 4 L 540 10 L 560 4 L 580 10 L 600 4 L 620 10 L 640 4 L 660 10 L 680 4 L 700 10 L 720 4 L 740 10 L 760 4 L 780 10 L 800 4 L 820 10 L 840 4 L 860 10 L 880 4 L 900 10 L 920 4 L 940 10 L 960 4 L 980 10 L 1000 4 L 1020 10 L 1040 4 L 1060 10 L 1080 4 L 1100 10 L 1120 4 L 1140 10 L 1160 4 L 1180 10 L 1200 4"
            fill="none"
            stroke="#E4C572"
            strokeWidth="1.2"
            opacity="0.7"
          />
        </svg>
      )}
    </div>
  )
}
