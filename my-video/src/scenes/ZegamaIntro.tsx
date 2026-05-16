import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ELEVATION_PATH, ELEVATION_LINE } from '../data/route';
import { RACE_INFO } from '../data/route';

export const ZegamaIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fog/blur lifts
  const blur = interpolate(frame, [0, 120], [30, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Elements spring in
  const titleSpring  = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 50, mass: 1.4 } });
  const sub1Spring   = spring({ frame: frame - 30, fps, config: { damping: 16, stiffness: 70, mass: 1.1 } });
  const sub2Spring   = spring({ frame: frame - 55, fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
  const statsSpring  = spring({ frame: frame - 80, fps, config: { damping: 18, stiffness: 100, mass: 0.8 } });

  // Fade out at the end
  const fadeOut = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const clip = (v: number) => Math.min(1, Math.max(0, v));

  return (
    <div
      style={{
        width: '100%', height: '100%',
        background: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        filter: `blur(${blur}px)`,
        opacity: fadeOut,
      }}
    >
      {/* ── Background elevation silhouette ─────────────────────────────── */}
      <svg
        width={1920} height={432}
        viewBox="0 0 1920 432"
        style={{
          position: 'absolute',
          bottom: 0, left: 0,
          opacity: 0.12,
        }}
      >
        <defs>
          <linearGradient id="introElevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FF4444" />
            <stop offset="60%"  stopColor="#FFB800" />
            <stop offset="100%" stopColor="#00FF88" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <path d={ELEVATION_PATH} fill="url(#introElevGrad)" />
        <path d={ELEVATION_LINE} fill="none" stroke="#00D4FF" strokeWidth={2} />
      </svg>

      {/* ── Radial glow ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        width: 800, height: 800,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
      }} />

      {/* ── Title ──────────────────────────────────────────────────────── */}
      <div
        style={{
          fontSize: 120,
          fontFamily: "'Anton', 'Bebas Neue', 'Arial Black', Impact, sans-serif",
          fontWeight: 900,
          color: 'white',
          letterSpacing: '0.04em',
          textAlign: 'center',
          lineHeight: 0.9,
          textShadow: '0 0 60px rgba(0,212,255,0.3), 0 4px 0 rgba(0,0,0,0.6)',
          opacity: clip(titleSpring),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [60, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        ZEGAMA
        <br />
        <span style={{ color: '#00D4FF' }}>AIZKORRI</span>
      </div>

      {/* ── Subtitle 1 ──────────────────────────────────────────────────── */}
      <div
        style={{
          fontSize: 32,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: '0.18em',
          marginTop: 20,
          textAlign: 'center',
          opacity: clip(sub1Spring),
          transform: `translateY(${interpolate(sub1Spring, [0, 1], [30, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        MENDI MARATOIA · 25ª EDICIÓN · 2026
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div style={{
        width: interpolate(sub1Spring, [0, 1], [0, 400], { extrapolateRight: 'clamp' }),
        height: 1,
        background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)',
        margin: '20px 0',
      }} />

      {/* ── Tagline ─────────────────────────────────────────────────────── */}
      <div
        style={{
          fontSize: 24,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          color: '#8888AA',
          letterSpacing: '0.06em',
          textAlign: 'center',
          fontStyle: 'italic',
          opacity: clip(sub2Spring),
          transform: `translateY(${interpolate(sub2Spring, [0, 1], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        "{RACE_INFO.tagline}"
      </div>

      {/* ── Stats pills ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 40,
          opacity: clip(statsSpring),
          transform: `translateY(${interpolate(statsSpring, [0, 1], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        {[
          { label: '42,195 km', icon: '📍' },
          { label: '2.750 m D+', icon: '⛰️' },
          { label: '8h límite', icon: '⏱️' },
          { label: '585 corredores', icon: '🏃' },
          { label: 'Golden Trail WS', icon: '🏆' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 40,
            padding: '10px 18px',
            fontSize: 16,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
