import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TukTukSVG } from '../components/TukTukSVG';
import { SriLankaMap } from '../components/SriLankaMap';

interface TukTukTransitionProps {
  nextCityName: string;
  nextCityEmoji: string;
  visitedCount: number;
  fromColor: string;
  toColor: string;
}

const DURATION = 90; // 3 seconds at 30fps

export const TukTukTransition: React.FC<TukTukTransitionProps> = ({
  nextCityName,
  nextCityEmoji,
  visitedCount,
  fromColor,
  toColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Tuk-tuk travels left to right across the full canvas
  const tukTukX = interpolate(frame, [0, DURATION], [-220, width + 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Gentle vertical bounce (sinusoidal)
  const tukTukY = Math.sin(frame * 0.55) * 6;

  // Route line dash animation
  const dashOffset = -frame * 4;

  // "Next city" label appears towards end
  const labelSpring = spring({
    frame: frame - 58,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const labelOpacity = Math.min(1, Math.max(0, labelSpring));
  const labelY = interpolate(labelSpring, [0, 1], [30, 0], { extrapolateRight: 'clamp' });

  // Dust cloud behind the tuk-tuk
  const dustOpacity = interpolate(frame, [0, 20, DURATION - 10, DURATION], [0, 0.6, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(140deg, ${fromColor} 0%, ${toColor} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Faint background map */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      >
        <SriLankaMap visitedCities={visitedCount} showRoute width={500} height={875} />
      </div>

      {/* Horizon line */}
      <div
        style={{
          position: 'absolute',
          bottom: '36%',
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(255,255,255,0.2)',
        }}
      />

      {/* Animated dashed road line */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 1920 1080"
      >
        <line
          x1="0"
          y1="659"
          x2="1920"
          y2="659"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="5"
          strokeDasharray="30 20"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
        {/* Second road line */}
        <line
          x1="0"
          y1="672"
          x2="1920"
          y2="672"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="3"
          strokeDasharray="20 30"
          strokeDashoffset={dashOffset * 0.7}
          strokeLinecap="round"
        />
      </svg>

      {/* Dust cloud (ellipses behind the tuk-tuk) */}
      <div
        style={{
          position: 'absolute',
          bottom: '34.5%',
          left: 0,
          transform: `translateX(${tukTukX - 60}px)`,
          opacity: dustOpacity,
          display: 'flex',
          gap: 6,
          pointerEvents: 'none',
        }}
      >
        {[28, 20, 14].map((size, i) => (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              marginTop: i * 4,
            }}
          />
        ))}
      </div>

      {/* Tuk-tuk */}
      <div
        style={{
          position: 'absolute',
          bottom: '34%',
          left: 0,
          transform: `translateX(${tukTukX}px) translateY(${tukTukY}px)`,
          filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.3))',
          pointerEvents: 'none',
        }}
      >
        <TukTukSVG width={220} height={148} />
      </div>

      {/* Dotted route trace on the horizon */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 1920 1080"
      >
        <line
          x1="0"
          y1="648"
          x2={Math.min(1920, tukTukX + 110)}
          y2="648"
          stroke="rgba(255,220,80,0.7)"
          strokeWidth="3"
          strokeDasharray="10 8"
          strokeLinecap="round"
        />
      </svg>

      {/* "Next city" reveal label */}
      <div
        style={{
          position: 'absolute',
          bottom: '14%',
          left: '50%',
          transform: `translateX(-50%) translateY(${labelY}px)`,
          textAlign: 'center',
          opacity: labelOpacity,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 10 }}>{nextCityEmoji}</div>
        <div
          style={{
            fontSize: 56,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            color: 'white',
            textShadow: '0 3px 20px rgba(0,0,0,0.4)',
            letterSpacing: '0.06em',
          }}
        >
          {nextCityName}
        </div>
        <div
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.15em',
            marginTop: 8,
            fontWeight: 300,
          }}
        >
          PRÓXIMA PARADA
        </div>
      </div>
    </div>
  );
};
