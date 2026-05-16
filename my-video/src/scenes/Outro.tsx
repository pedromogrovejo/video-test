import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SriLankaMap } from '../components/SriLankaMap';

const STATS = [
  { value: '13', label: 'días' },
  { value: '7', label: 'ciudades' },
  { value: '1', label: 'isla increíble' },
];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const flagSpring = spring({ frame, fps, config: { damping: 8, stiffness: 55, mass: 1.2 } });
  const statsSpring = spring({ frame: frame - 18, fps, config: { damping: 12, stiffness: 70, mass: 1 } });
  const mapSpring = spring({ frame: frame - 30, fps, config: { damping: 13, stiffness: 65, mass: 1.1 } });
  const flightSpring = spring({ frame: frame - 70, fps, config: { damping: 14, stiffness: 90, mass: 0.8 } });
  const ctaSpring = spring({ frame: frame - 100, fps, config: { damping: 14, stiffness: 100, mass: 0.8 } });

  // Fade out at the end
  const fadeOut = interpolate(frame, [155, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const statsY = interpolate(statsSpring, [0, 1], [50, 0], { extrapolateRight: 'clamp' });
  const mapScale = interpolate(mapSpring, [0, 1], [0.7, 1], { extrapolateRight: 'clamp' });
  const ctaY = interpolate(ctaSpring, [0, 1], [30, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #BF4E00 0%, #E85D04 45%, #FB8500 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 80,
        opacity: fadeIn * fadeOut,
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,210,100,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Left: stats + CTA ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* Flag */}
        <div
          style={{
            fontSize: 80,
            transform: `scale(${interpolate(flagSpring, [0, 1], [0.2, 1], { extrapolateRight: 'clamp' })})`,
            filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.25))',
          }}
        >
          🇱🇰
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            alignItems: 'center',
            opacity: Math.min(1, Math.max(0, statsSpring)),
            transform: `translateY(${statsY}px)`,
          }}
        >
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 88,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1,
                    textShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    color: 'rgba(255,255,255,0.8)',
                    marginTop: 8,
                    letterSpacing: '0.04em',
                    fontWeight: 300,
                  }}
                >
                  {stat.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div style={{ fontSize: 56, color: 'rgba(255,255,255,0.35)', fontWeight: 200 }}>
                  ·
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Flight info */}
        <div
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.05em',
            opacity: Math.min(1, Math.max(0, flightSpring)),
            transform: `translateY(${interpolate(flightSpring, [0, 1], [15, 0], { extrapolateRight: 'clamp' })}px)`,
          }}
        >
          ✈️ Colombo → Nueva Delhi · 1 de abril
        </div>

        {/* CTA */}
        <div
          style={{
            textAlign: 'center',
            opacity: Math.min(1, Math.max(0, ctaSpring)),
            transform: `translateY(${ctaY}px)`,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '2px solid rgba(255,255,255,0.45)',
              borderRadius: 50,
              padding: '16px 36px',
              fontSize: 30,
              color: 'white',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            ¿Te ha gustado? Dale like y suscríbete 🔔
          </div>
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.55)',
              marginTop: 14,
              letterSpacing: '0.04em',
            }}
          >
            Pedro & Karyna · Sri Lanka 2024
          </div>
        </div>
      </div>

      {/* ── Right: full route map ── */}
      <div
        style={{
          opacity: Math.min(1, Math.max(0, mapSpring)),
          transform: `scale(${mapScale})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.14)',
            borderRadius: 28,
            padding: '20px 18px',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 10px 50px rgba(0,0,0,0.25)',
          }}
        >
          <SriLankaMap
            visitedCities={7}
            showRoute
            animateRoute
            animateDuration={80}
            width={240}
            height={385}
            showLabels
          />
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.06em',
          }}
        >
          7 ciudades · ruta completa
        </div>
      </div>
    </div>
  );
};
