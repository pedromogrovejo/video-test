import React from 'react';
import { WAYPOINTS, ELEVATION_PATH, ELEVATION_LINE, TOTAL_PATH_LENGTH } from '../data/route';
import { RouteState } from '../utils/routeTimeline';

interface ElevationProfileProps {
  state: RouteState;
}

// Altitude grid lines (m) → SVG y: y = 30 + (1620 - alt) / 1420 * 372
function altToY(alt: number) {
  return 30 + (1620 - alt) / 1420 * 372;
}

const ALT_GRID = [400, 600, 800, 1000, 1200, 1400];
const KM_GRID  = [5, 10, 15, 20, 25, 30, 35, 40];
const PLOT_BOTTOM = 402;

export const ElevationProfile: React.FC<ElevationProfileProps> = ({ state }) => {
  const { profileX, profileY, km } = state;

  // Clip width: expand from left proportionally to route progress
  // Map from profile km to SVG x: x = 60 + km/42.195 * 1800
  const clipWidth = 60 + (km / 42.195) * 1800;

  // Color pulse at summits (red/orange flash)
  const isSummit = state.activeWP >= 0 &&
    ['summit', 'legendary'].includes(WAYPOINTS[state.activeWP]?.type ?? '');

  return (
    <svg
      width={1920}
      height={432}
      viewBox="0 0 1920 432"
      style={{ display: 'block', background: '#0D0D14' }}
    >
      <defs>
        {/* Elevation gradient fill */}
        <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FF4444" stopOpacity={0.9} />
          <stop offset="40%"  stopColor="#FFB800" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#00FF88" stopOpacity={0.3} />
        </linearGradient>

        {/* Clip mask expanding left → right */}
        <clipPath id="elevClip">
          <rect x={0} y={0} width={clipWidth} height={432} />
        </clipPath>

        {/* Glow filter for the line */}
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Altitude grid lines ──────────────────────────────────────────── */}
      {ALT_GRID.map(alt => (
        <g key={`alt-${alt}`}>
          <line x1={60} y1={altToY(alt)} x2={1860} y2={altToY(alt)}
            stroke="#1A1A2E" strokeWidth={1} strokeDasharray="4 6" />
          <text x={52} y={altToY(alt) + 4} textAnchor="end"
            fill="#444466" fontSize={11} fontFamily="JetBrains Mono, monospace">
            {alt}m
          </text>
        </g>
      ))}

      {/* ── KM grid lines ─────────────────────────────────────────────────── */}
      {KM_GRID.map(k => {
        const x = 60 + (k / 42.195) * 1800;
        return (
          <g key={`km-${k}`}>
            <line x1={x} y1={30} x2={x} y2={PLOT_BOTTOM} stroke="#1A1A2E" strokeWidth={1} />
            <text x={x} y={420} textAnchor="middle"
              fill="#444466" fontSize={11} fontFamily="JetBrains Mono, monospace">
              {k}km
            </text>
          </g>
        );
      })}

      {/* ── Dim background elevation area (full route ghost) ────────────── */}
      <path d={ELEVATION_PATH} fill="#1E2A3A" opacity={0.4} />
      <path d={ELEVATION_LINE} fill="none" stroke="#222244" strokeWidth={2} />

      {/* ── Animated elevation fill ──────────────────────────────────────── */}
      <g clipPath="url(#elevClip)">
        <path d={ELEVATION_PATH}
          fill={`url(#elevGrad)`}
          opacity={isSummit ? 1 : 0.75}
          style={{ transition: 'opacity 0.3s' }}
        />
        <path d={ELEVATION_LINE}
          fill="none"
          stroke="#00D4FF"
          strokeWidth={2.5}
          filter="url(#lineGlow)"
        />
      </g>

      {/* ── Waypoint tick marks ───────────────────────────────────────────── */}
      {WAYPOINTS.map((wp) => {
        const visited = wp.cumPathLength / TOTAL_PATH_LENGTH <= state.pathProgress + 0.01;
        if (!visited) return null;
        const x = wp.profileX;
        const y = wp.profileY;
        return (
          <g key={wp.id}>
            <line x1={x} y1={y - 8} x2={x} y2={PLOT_BOTTOM}
              stroke={wp.color} strokeWidth={1} opacity={0.3} />
            <circle cx={x} cy={y} r={5} fill={wp.color} stroke="#0D0D14" strokeWidth={1.5} />
          </g>
        );
      })}

      {/* ── Moving marker: vertical cursor line + dot ─────────────────────── */}
      <line
        x1={profileX} y1={30}
        x2={profileX} y2={PLOT_BOTTOM}
        stroke="#FF4444"
        strokeWidth={1.5}
        opacity={0.6}
        strokeDasharray="4 4"
      />
      <circle
        cx={profileX}
        cy={profileY}
        r={7}
        fill="#FF4444"
        stroke="white"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 0 8px #FF444488)' }}
      />

      {/* ── Bottom axis ──────────────────────────────────────────────────── */}
      <line x1={60} y1={PLOT_BOTTOM} x2={1860} y2={PLOT_BOTTOM}
        stroke="#333355" strokeWidth={1} />

      {/* ── Start / Finish labels ─────────────────────────────────────────── */}
      <text x={65} y={PLOT_BOTTOM + 18} fill="#555577" fontSize={10}
        fontFamily="JetBrains Mono, monospace">
        ZEGAMA 296m
      </text>
      <text x={1855} y={PLOT_BOTTOM + 18} textAnchor="end" fill="#555577" fontSize={10}
        fontFamily="JetBrains Mono, monospace">
        META 296m
      </text>

      {/* ── Aitxuri peak label ─────────────────────────────────────────────── */}
      <text x={1212} y={42} textAnchor="middle" fill="#FF4444AA" fontSize={10}
        fontFamily="JetBrains Mono, monospace">
        AITXURI 1.551m
      </text>
    </svg>
  );
};
