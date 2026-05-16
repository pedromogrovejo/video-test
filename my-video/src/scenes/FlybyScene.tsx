import React from 'react';
import { useCurrentFrame } from 'remotion';
import { getRouteState } from '../utils/routeTimeline';
import { RouteMap } from '../components/RouteMap';
import { ElevationProfile } from '../components/ElevationProfile';
import { WaypointCard } from '../components/WaypointCard';
import { DataOverlay } from '../components/DataOverlay';
import { WAYPOINTS } from '../data/route';

// Heights for the split-screen layout
const MAP_HEIGHT     = 648; // 60% of 1080
const PROFILE_HEIGHT = 432; // 40% of 1080

export const FlybyScene: React.FC = () => {
  const frame      = useCurrentFrame();
  const routeState = getRouteState(frame);

  const { showCardForWP, cardRevealProgress } = routeState;

  // Active waypoint color for the divider glow
  const activeColor = showCardForWP >= 0 ? WAYPOINTS[showCardForWP]?.color ?? '#00D4FF' : '#00D4FF';

  // Fade in at start
  const fadeIn = Math.min(1, frame / 15);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: '#0A0A0F',
        overflow: 'hidden',
        position: 'relative',
        opacity: fadeIn,
      }}
    >
      {/* ── Top 60%: Route Map ──────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: MAP_HEIGHT }}>
        <RouteMap state={routeState} />
      </div>

      {/* ── Divider bar ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: MAP_HEIGHT,
        left: 0,
        width: '100%',
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${activeColor} 50%, transparent 100%)`,
        boxShadow: `0 0 12px ${activeColor}88`,
        transition: 'box-shadow 0.3s',
        zIndex: 20,
      }} />

      {/* ── Bottom 40%: Elevation Profile ───────────────────────────────── */}
      <div style={{ position: 'absolute', top: MAP_HEIGHT + 2, left: 0, width: 1920, height: PROFILE_HEIGHT }}>
        <ElevationProfile state={routeState} />
      </div>

      {/* ── Data HUD (top-left, over map) ─────────────────────────────── */}
      <DataOverlay state={routeState} flybyFrame={frame} />

      {/* ── Waypoint card (right, spans both panels) ───────────────────── */}
      {showCardForWP >= 0 && (
        <WaypointCard
          waypointIndex={showCardForWP}
          revealProgress={cardRevealProgress}
        />
      )}

      {/* ── Segment label (top-right corner of map) ─────────────────────── */}
      <SegmentBadge routeState={routeState} />

      {/* ── Race branding watermark ──────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: MAP_HEIGHT - 40,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 11,
        color: '#333355',
        letterSpacing: '0.15em',
        fontFamily: "'JetBrains Mono', monospace",
        zIndex: 10,
      }}>
        ZEGAMA-AIZKORRI · 25ª EDICIÓN · GOLDEN TRAIL WORLD SERIES
      </div>
    </div>
  );
};

// ─── Segment badge in top-right of map ───────────────────────────────────────
const SegmentBadge: React.FC<{ routeState: ReturnType<typeof getRouteState> }> = ({ routeState }) => {
  const { activeWP, pathProgress } = routeState;
  if (activeWP < 0 || activeWP >= WAYPOINTS.length) return null;
  const wp = WAYPOINTS[activeWP];

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      background: 'rgba(10,10,15,0.85)',
      border: `1px solid ${wp.color}33`,
      borderRadius: 10,
      padding: '10px 18px',
      backdropFilter: 'blur(12px)',
      textAlign: 'right',
      zIndex: 50,
    }}>
      <div style={{
        fontSize: 11, color: wp.color, letterSpacing: '0.14em',
        fontFamily: "'JetBrains Mono', monospace", marginBottom: 2,
      }}>
        {wp.segment}
      </div>
      <div style={{
        fontSize: 14, color: 'rgba(255,255,255,0.7)',
        fontFamily: "'Inter', sans-serif",
      }}>
        {wp.segmentKm}
      </div>
      <div style={{
        fontSize: 10, color: '#555577', marginTop: 4,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {(pathProgress * 100).toFixed(0)}% completado
      </div>
    </div>
  );
};
