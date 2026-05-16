import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SriLankaMap } from '../components/SriLankaMap';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flagSpring = spring({ frame, fps, config: { damping: 8, stiffness: 50, mass: 1.3 } });
  const titleSpring = spring({ frame: frame - 12, fps, config: { damping: 10, stiffness: 60, mass: 1.2 } });
  const subtitleSpring = spring({ frame: frame - 26, fps, config: { damping: 12, stiffness: 80, mass: 1 } });
  const taglineSpring = spring({ frame: frame - 42, fps, config: { damping: 14, stiffness: 100, mass: 0.8 } });

  const mapScale = interpolate(frame, [0, 150], [2.2, 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const mapOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at the end
  const fadeOut = interpolate(frame, [130, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #BF4E00 0%, #E85D04 45%, #FB8500 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        opacity: fadeOut,
      }}
    >
      {/* Background map zoom-in */}
      <div
        style={{
          position: 'absolute',
          opacity: mapOpacity * 0.12,
          transform: `scale(${mapScale})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
      >
        <SriLankaMap visitedCities={0} showRoute={false} width={600} height={1050} />
      </div>

      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,100,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Flag */}
      <div
        style={{
          fontSize: 100,
          lineHeight: 1,
          marginBottom: 24,
          transform: `scale(${interpolate(flagSpring, [0, 1], [0.2, 1], { extrapolateRight: 'clamp' })})`,
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
        }}
      >
        🇱🇰
      </div>

      {/* Main title */}
      <div
        style={{
          fontSize: 112,
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          color: 'white',
          textShadow: '0 4px 32px rgba(0,0,0,0.35)',
          letterSpacing: '0.03em',
          textAlign: 'center',
          lineHeight: 1.05,
          opacity: Math.min(1, Math.max(0, titleSpring)),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [70, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        Sri Lanka
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 38,
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontWeight: 300,
          color: 'rgba(255,255,255,0.92)',
          textAlign: 'center',
          marginTop: 18,
          letterSpacing: '0.08em',
          opacity: Math.min(1, Math.max(0, subtitleSpring)),
          transform: `translateY(${interpolate(subtitleSpring, [0, 1], [40, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        13 días por la isla maravilla
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.25)',
          fontSize: 26,
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontWeight: 400,
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          letterSpacing: '0.05em',
          opacity: Math.min(1, Math.max(0, taglineSpring)),
          transform: `translateY(${interpolate(taglineSpring, [0, 1], [25, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        Pedro & Karyna · 20 marzo – 1 abril 2024
      </div>

      {/* Bottom dots decoration */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          display: 'flex',
          gap: 12,
          opacity: Math.min(1, Math.max(0, taglineSpring)) * 0.5,
        }}
      >
        {['🏙️', '🪨', '🦷', '🌿', '🦁', '🌊', '🏰'].map((e, i) => (
          <span key={i} style={{ fontSize: 28 }}>
            {e}
          </span>
        ))}
      </div>
    </div>
  );
};
