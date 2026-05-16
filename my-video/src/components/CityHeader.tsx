import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CityHeaderProps {
  emoji: string;
  name: string;
  dates: string;
  nights: number;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ emoji, name, dates, nights }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emojiSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 60, mass: 1.2 },
  });

  const titleSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });

  const subSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  const emojiScale = interpolate(emojiSpring, [0, 1], [0.2, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0], { extrapolateRight: 'clamp' });
  const subY = interpolate(subSpring, [0, 1], [30, 0], { extrapolateRight: 'clamp' });

  return (
    <div>
      {/* Emoji */}
      <div
        style={{
          fontSize: 72,
          lineHeight: 1,
          display: 'inline-block',
          transform: `scale(${emojiScale})`,
          marginBottom: 8,
        }}
      >
        {emoji}
      </div>

      {/* City name */}
      <div
        style={{
          fontSize: 80,
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          color: 'white',
          textShadow: '0 3px 24px rgba(0,0,0,0.25)',
          letterSpacing: '0.04em',
          lineHeight: 1,
          opacity: Math.min(1, Math.max(0, titleSpring)),
          transform: `translateY(${titleY}px)`,
        }}
      >
        {name}
      </div>

      {/* Divider line */}
      <div
        style={{
          width: interpolate(titleSpring, [0, 1], [0, 120], { extrapolateRight: 'clamp' }),
          height: 3,
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 2,
          marginTop: 12,
          marginBottom: 10,
        }}
      />

      {/* Dates + nights */}
      <div
        style={{
          fontSize: 26,
          fontFamily: "'Inter', -apple-system, sans-serif",
          color: 'rgba(255,255,255,0.88)',
          fontWeight: 300,
          letterSpacing: '0.06em',
          opacity: Math.min(1, Math.max(0, subSpring)),
          transform: `translateY(${subY}px)`,
        }}
      >
        {dates} · {nights} {nights === 1 ? 'noche' : 'noches'}
      </div>
    </div>
  );
};
