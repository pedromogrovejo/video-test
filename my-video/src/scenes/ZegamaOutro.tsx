import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ELEVATION_PATH, ELEVATION_LINE, WAYPOINTS, ROUTE_MAP_PATH, RACE_INFO } from '../data/route';

interface CounterProps {
  target: number;
  frame: number;
  duration: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

const Counter: React.FC<CounterProps> = ({ target, frame, duration, decimals = 0, suffix = '', prefix = '' }) => {
  const value = interpolate(frame, [0, duration], [0, target], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return <>{`${prefix}${value.toFixed(decimals)}${suffix}`}</>;
};

export const ZegamaOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn   = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut  = interpolate(frame, [155, 180], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const mapSpring   = spring({ frame: frame - 5,  fps, config: { damping: 14, stiffness: 60, mass: 1.2 } });
  const statsSpring = spring({ frame: frame - 25, fps, config: { damping: 14, stiffness: 70, mass: 1 } });
  const tagSpring   = spring({ frame: frame - 80, fps, config: { damping: 16, stiffness: 90, mass: 0.8 } });
  const ctaSpring   = spring({ frame: frame - 110, fps, config: { damping: 18, stiffness: 100, mass: 0.7 } });

  const clip = (v: number) => Math.min(1, Math.max(0, v));

  const STATS = [
    { label: 'km', value: 42.195, decimals: 1, color: '#00D4FF', suffix: ' km' },
    { label: 'D+',  value: 2750,  decimals: 0, color: '#FF4444', suffix: 'm D+', prefix: '+' },
    { label: 'acum',value: 5472,  decimals: 0, color: '#FFB800', suffix: 'm' },
    { label: 'límite', value: 8,  decimals: 0, color: '#00FF88', suffix: 'h límite' },
    { label: 'runners', value: 585, decimals: 0, color: '#FF6B00', suffix: '' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 80,
      opacity: fadeIn * fadeOut,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* ── Background elevation silhouette ─────────────────────────────── */}
      <svg width={1920} height={432} viewBox="0 0 1920 432"
        style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.08 }}>
        <defs>
          <linearGradient id="outroGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4444" />
            <stop offset="100%" stopColor="#00FF88" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <path d={ELEVATION_PATH} fill="url(#outroGrad)" />
        <path d={ELEVATION_LINE} fill="none" stroke="#00D4FF" strokeWidth={1.5} />
      </svg>

      {/* ── Left: Stats ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 32,
        opacity: clip(statsSpring),
        transform: `translateX(${interpolate(statsSpring, [0, 1], [-60, 0], { extrapolateRight: 'clamp' })}px)`,
      }}>
        {/* Title */}
        <div>
          <div style={{
            fontSize: 72,
            fontFamily: "'Anton', 'Bebas Neue', Impact, sans-serif",
            color: 'white', lineHeight: 0.9, letterSpacing: '0.04em',
          }}>
            ZEGAMA<br /><span style={{ color: '#00D4FF' }}>AIZKORRI</span>
          </div>
          <div style={{ fontSize: 18, color: '#8888AA', letterSpacing: '0.1em', marginTop: 10 }}>
            {RACE_INFO.edition} · {RACE_INFO.date}
          </div>
        </div>

        {/* Counter stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'baseline', gap: 10,
              opacity: clip(spring({ frame: frame - 25 - i * 12, fps, config: { damping: 16, stiffness: 80, mass: 0.9 } })),
            }}>
              <div style={{
                fontSize: 52, fontWeight: 700, color: s.color,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
                textShadow: `0 0 20px ${s.color}44`,
              }}>
                <Counter target={s.value} frame={frame} duration={120}
                  decimals={s.decimals} suffix={s.suffix} prefix={s.prefix ?? ''} />
              </div>
              <div style={{ fontSize: 16, color: '#555577', letterSpacing: '0.06em' }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 28, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)',
          borderLeft: '3px solid #00D4FF', paddingLeft: 16, lineHeight: 1.4,
          maxWidth: 540,
          opacity: clip(tagSpring),
          transform: `translateY(${interpolate(tagSpring, [0, 1], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          "Zegama es Zegama.<br />No se explica. Se corre."
        </div>

        {/* CTA */}
        <div style={{
          opacity: clip(ctaSpring),
          transform: `translateY(${interpolate(ctaSpring, [0, 1], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          <div style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.35)',
            borderRadius: 50,
            padding: '14px 32px',
            fontSize: 24, color: 'white', fontWeight: 600,
            letterSpacing: '0.02em',
            display: 'inline-block',
          }}>
            ¿Te ha gustado? Like y suscríbete 🔔
          </div>
          <div style={{ fontSize: 16, color: '#555577', marginTop: 10, letterSpacing: '0.04em' }}>
            Golden Trail World Series · Zegama 2026
          </div>
        </div>
      </div>

      {/* ── Right: Full route map ─────────────────────────────────────────── */}
      <div style={{
        opacity: clip(mapSpring),
        transform: `scale(${interpolate(mapSpring, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' })}) translateX(${interpolate(mapSpring, [0,1],[40,0],{extrapolateRight:'clamp'})}px)`,
      }}>
        <div style={{
          background: 'rgba(18,18,26,0.9)',
          border: '1px solid #00D4FF22',
          borderRadius: 20,
          padding: 16,
          boxShadow: '0 0 60px rgba(0,212,255,0.08)',
        }}>
          <svg width={500} height={390} viewBox="0 0 1920 648" style={{ display: 'block', borderRadius: 10 }}>
            <rect width={1920} height={648} fill="#0A0A0F" />
            {/* Full route */}
            <path d={ROUTE_MAP_PATH} stroke="#00D4FF" strokeWidth={6}
              fill="none" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 8px #00D4FF66)' }}
            />
            {/* All waypoint markers */}
            {WAYPOINTS.map(wp => (
              <g key={wp.id}>
                <circle cx={wp.mapX} cy={wp.mapY} r={10} fill={wp.color} stroke="#0A0A0F" strokeWidth={2} />
                <circle cx={wp.mapX} cy={wp.mapY} r={4} fill="white" />
              </g>
            ))}
          </svg>
        </div>
        <div style={{
          textAlign: 'center', marginTop: 10,
          fontSize: 13, color: '#555577', letterSpacing: '0.08em',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          GIPUZKOA · MACIZO DEL AIZKORRI
        </div>
      </div>
    </div>
  );
};
