import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WAYPOINTS } from '../data/route';

interface WaypointCardProps {
  waypointIndex: number;
  revealProgress: number; // 0-1
}

export const WaypointCard: React.FC<WaypointCardProps> = ({ waypointIndex, revealProgress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (waypointIndex < 0 || waypointIndex >= WAYPOINTS.length) return null;
  if (revealProgress <= 0) return null;

  const wp = WAYPOINTS[waypointIndex];

  // Spring slide-in from right
  const slideSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 110, mass: 0.9 },
  });

  const tx = interpolate(
    Math.min(slideSpring, revealProgress),
    [0, 1],
    [520, 0],
    { extrapolateRight: 'clamp' }
  );

  const opacity = Math.min(1, revealProgress * 3);

  const isSummit   = ['summit', 'legendary'].includes(wp.type);
  const accentColor = wp.color;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: 0,
        transform: `translateY(-50%) translateX(${tx}px)`,
        opacity,
        width: 480,
        background: 'rgba(10,10,15,0.92)',
        border: `1px solid ${accentColor}44`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '12px 0 0 12px',
        padding: '20px 22px',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 0 40px ${accentColor}22, inset 0 0 30px rgba(0,0,0,0.5)`,
        fontFamily: "'Inter', -apple-system, sans-serif",
        zIndex: 100,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{wp.icon}</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
            {wp.name}
          </div>
          {wp.milestone && (
            <div style={{
              fontSize: 10, fontWeight: 700, color: accentColor,
              letterSpacing: '0.12em', marginTop: 2,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {wp.milestone}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 12,
        borderBottom: `1px solid ${accentColor}22`, paddingBottom: 10,
      }}>
        {[
          { label: 'KM', val: wp.km.toFixed(1) },
          { label: 'ALT', val: `${wp.alt}m` },
          { label: 'D+', val: `${wp.cumDPlus}m` },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 18, fontWeight: 700, color: accentColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#8888AA', letterSpacing: '0.1em' }}>{s.label}</div>
          </div>
        ))}
        {wp.cutoff && (
          <div style={{
            marginLeft: 'auto', background: '#FF444422', border: '1px solid #FF444466',
            borderRadius: 6, padding: '4px 10px', fontSize: 11,
            color: '#FF8888', fontFamily: "'JetBrains Mono', monospace", alignSelf: 'center',
          }}>
            ⏱ CORTE
          </div>
        )}
      </div>

      {/* ── Terrain ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#8888AA', marginBottom: 3, letterSpacing: '0.08em' }}>
          TERRENO · {wp.gradient}
        </div>
        <div style={{ fontSize: 13, color: '#AAAACC' }}>{wp.terrain}</div>
      </div>

      {/* ── Runner tip ─────────────────────────────────────────────────── */}
      {wp.runnerTip && (
        <div style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#00D4FF',
            letterSpacing: '0.1em', marginBottom: 4,
          }}>🏃 PARA CORREDORES</div>
          <div style={{
            fontSize: 13, color: '#CCCCDD', lineHeight: 1.45,
            maxHeight: 72, overflow: 'hidden',
          }}>
            {wp.runnerTip}
          </div>
        </div>
      )}

      {/* ── Spectator tip ──────────────────────────────────────────────── */}
      {wp.spectatorTip && (
        <div style={{
          background: isSummit ? `${accentColor}0F` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${accentColor}22`,
          borderRadius: 8, padding: '8px 12px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#FFB800',
            letterSpacing: '0.1em', marginBottom: 4,
          }}>👁️ PARA ESPECTADORES</div>
          <div style={{
            fontSize: 12, color: '#BBBBCC', lineHeight: 1.4,
            maxHeight: 60, overflow: 'hidden',
          }}>
            {wp.spectatorTip}
          </div>
        </div>
      )}

      {/* ── Cutoff badge ───────────────────────────────────────────────── */}
      {wp.cutoff && (
        <div style={{
          marginTop: 10, padding: '6px 12px',
          background: '#FF444418', border: '1px solid #FF444444',
          borderRadius: 6, fontSize: 12, color: '#FF7777',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          ⏱️ {wp.cutoff}
        </div>
      )}
    </div>
  );
};
