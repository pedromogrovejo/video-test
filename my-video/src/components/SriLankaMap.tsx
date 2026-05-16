import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

// City map positions within the 200×350 SVG viewbox
// Calculated from: x=(lon-79.7)/2.3*200, y=(9.8-lat)/3.9*350
export const CITY_MAP_POSITIONS = [
  { x: 17, y: 260, name: 'Colombo',  color: '#E85D04' },
  { x: 92, y: 165, name: 'Sigiriya', color: '#2D6A4F' },
  { x: 81, y: 225, name: 'Kandy',    color: '#D4A017' },
  { x: 117, y: 263, name: 'Ella',    color: '#40916C' },
  { x: 158, y: 307, name: 'Yala',    color: '#C68B2A' },
  { x: 66, y: 346, name: 'Mirissa',  color: '#0077B6' },
  { x: 45, y: 338, name: 'Galle',    color: '#8B7355' },
];

// Route path connecting all cities
const buildRoutePath = (count: number): string => {
  const pts = CITY_MAP_POSITIONS.slice(0, count);
  if (pts.length < 2) return '';
  return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
};

interface SriLankaMapProps {
  visitedCities?: number;
  showRoute?: boolean;
  width?: number;
  height?: number;
  animateRoute?: boolean;
  animateDuration?: number;
  showLabels?: boolean;
}

export const SriLankaMap: React.FC<SriLankaMapProps> = ({
  visitedCities = 0,
  showRoute = true,
  width = 200,
  height = 350,
  animateRoute = false,
  animateDuration = 60,
  showLabels = false,
}) => {
  const frame = useCurrentFrame();

  const routePath = buildRoutePath(visitedCities);

  // Animate strokeDashoffset to "draw" the route
  const totalLen = 900;
  const dashOffset = animateRoute
    ? interpolate(frame, [0, animateDuration], [totalLen, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sri Lanka island outline (simplified but recognizable) */}
      <path
        d="M 45,2 L 80,10 L 115,45 L 130,95 L 172,185 L 186,265 L 180,315 L 150,340 L 110,348 L 75,348 L 45,337 L 22,305 L 12,265 L 10,220 L 12,160 L 14,115 L 20,70 L 35,30 Z"
        fill="#B7E4C7"
        stroke="#52B788"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Internal geography hint (central highlands) */}
      <ellipse cx="90" cy="210" rx="30" ry="50" fill="#74C69D" opacity="0.4" />

      {/* Route line */}
      {showRoute && routePath && (
        <path
          d={routePath}
          stroke="#FF6B35"
          strokeWidth="3"
          strokeDasharray={animateRoute ? `${totalLen}` : '7 5'}
          strokeDashoffset={dashOffset}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      )}

      {/* City markers */}
      {CITY_MAP_POSITIONS.map((city, i) => {
        const isVisited = i < visitedCities;
        return (
          <g key={city.name}>
            {isVisited ? (
              <>
                {/* Glow ring */}
                <circle cx={city.x} cy={city.y} r="11" fill={city.color} opacity="0.25" />
                {/* Main dot */}
                <circle cx={city.x} cy={city.y} r="7" fill={city.color} stroke="white" strokeWidth="2" />
                {/* Center dot */}
                <circle cx={city.x} cy={city.y} r="2.5" fill="white" />
                {/* Label */}
                {showLabels && (
                  <text
                    x={city.x + 10}
                    y={city.y + 4}
                    fontSize="9"
                    fill="#333"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                  >
                    {city.name}
                  </text>
                )}
              </>
            ) : (
              <circle cx={city.x} cy={city.y} r="4" fill="white" stroke="#AECFBF" strokeWidth="1.5" opacity="0.6" />
            )}
          </g>
        );
      })}
    </svg>
  );
};
