import React from 'react';
import { WAYPOINTS, ROUTE_MAP_PATH, TOTAL_PATH_LENGTH } from '../data/route';
import { RouteState } from '../utils/routeTimeline';

interface RouteMapProps {
  state: RouteState;
}

// Special waypoint type styles
const TYPE_RADIUS: Record<string, number> = {
  start: 10, finish: 10, summit: 9, legendary: 9, iconic: 7, checkpoint: 7,
};

export const RouteMap: React.FC<RouteMapProps> = ({ state }) => {
  const { strokeDashoffset, mapX, mapY, pathProgress } = state;

  return (
    <svg
      width={1920}
      height={648}
      viewBox="0 0 1920 648"
      style={{ display: 'block', background: '#0A0A0F' }}
    >
      {/* ── Grid lines ──────────────────────────────────────────────────── */}
      {[200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800].map(x => (
        <line key={`gx-${x}`} x1={x} y1={0} x2={x} y2={648} stroke="#1A1A2E" strokeWidth={1} />
      ))}
      {[162, 324, 486].map(y => (
        <line key={`gy-${y}`} x1={0} y1={y} x2={1920} y2={y} stroke="#1A1A2E" strokeWidth={1} />
      ))}

      {/* ── Background trace (full dim route) ───────────────────────────── */}
      <path
        d={ROUTE_MAP_PATH}
        stroke="#1E2A3A"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Animated route drawn so far ─────────────────────────────────── */}
      <path
        d={ROUTE_MAP_PATH}
        stroke="#00D4FF"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={TOTAL_PATH_LENGTH}
        strokeDashoffset={strokeDashoffset}
        style={{ filter: 'drop-shadow(0 0 6px #00D4FF88)' }}
      />

      {/* ── Waypoint markers (only visited) ─────────────────────────────── */}
      {WAYPOINTS.map((wp, i) => {
        const visited = wp.cumPathLength / TOTAL_PATH_LENGTH <= pathProgress + 0.01;
        if (!visited) return null;
        const r = TYPE_RADIUS[wp.type] ?? 7;
        return (
          <g key={wp.id}>
            {/* Glow ring */}
            <circle cx={wp.mapX} cy={wp.mapY} r={r + 6} fill={wp.color} opacity={0.15} />
            {/* Main dot */}
            <circle cx={wp.mapX} cy={wp.mapY} r={r} fill={wp.color} stroke="#0A0A0F" strokeWidth={2} />
            {/* Center */}
            <circle cx={wp.mapX} cy={wp.mapY} r={3} fill="white" />
          </g>
        );
      })}

      {/* ── Moving marker ───────────────────────────────────────────────── */}
      <g>
        {/* Outer pulse ring */}
        <circle cx={mapX} cy={mapY} r={18} fill="none" stroke="#FF4444" strokeWidth={2} opacity={0.4} />
        {/* Inner glow */}
        <circle cx={mapX} cy={mapY} r={11} fill="#FF4444" opacity={0.3} />
        {/* Main marker */}
        <circle cx={mapX} cy={mapY} r={7} fill="#FF4444" stroke="white" strokeWidth={2.5}
          style={{ filter: 'drop-shadow(0 0 8px #FF444488)' }}
        />
      </g>

      {/* ── Compass / scale ────────────────────────────────────────────── */}
      <text x={100} y={620} fill="#333355" fontSize={12} fontFamily="JetBrains Mono, monospace">
        Gipuzkoa · Macizo del Aizkorri · País Vasco
      </text>

      {/* ── "N" north indicator ─────────────────────────────────────────── */}
      <g transform="translate(1840, 80)">
        <circle r={24} fill="#12121A" stroke="#333355" strokeWidth={1} />
        <text x={0} y={5} textAnchor="middle" dominantBaseline="middle"
          fill="#8888AA" fontSize={14} fontFamily="Inter, sans-serif" fontWeight="600">N</text>
        <line x1={0} y1={-18} x2={0} y2={-12} stroke="#00D4FF" strokeWidth={2} />
      </g>
    </svg>
  );
};
