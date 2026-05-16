import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CityData } from '../data/itinerary';
import { ActivityCard } from '../components/ActivityCard';
import { CityHeader } from '../components/CityHeader';
import { SriLankaMap } from '../components/SriLankaMap';

interface CitySceneProps {
  city: CityData;
  cityIndex: number;
}

export const CityScene: React.FC<CitySceneProps> = ({ city, cityIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in at start
  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const mapSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 70, mass: 1 },
  });

  const infoSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
  });

  const featuredSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
  });

  const priceLabel =
    city.price === 'cheap' ? 'Económico' : city.price === 'moderate' ? 'Moderado' : 'Caro';

  const mapX = interpolate(mapSpring, [0, 1], [60, 0], { extrapolateRight: 'clamp' });
  const mapOpacity = Math.min(1, Math.max(0, mapSpring));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(140deg, ${city.bgGradient[0]} 0%, ${city.bgGradient[1]} 60%, ${city.themeColor}CC 100%)`,
        display: 'flex',
        opacity: fadeIn,
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -100,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${city.themeColor}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Left content panel ── */}
      <div
        style={{
          flex: '0 0 68%',
          padding: '64px 52px 64px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {/* City header (emoji + name + dates) */}
        <CityHeader
          emoji={city.emoji}
          name={city.name}
          dates={city.dates}
          nights={city.nights}
        />

        {/* Activities */}
        <ActivityCard activities={city.activities} startFrame={28} stagger={9} />

        {/* Featured banner (Ella train) */}
        {city.featured && (
          <div
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '2px solid rgba(255,255,255,0.55)',
              borderRadius: 14,
              padding: '16px 24px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
              letterSpacing: '0.02em',
              opacity: Math.min(1, Math.max(0, featuredSpring)),
              transform: `translateY(${interpolate(featuredSpring, [0, 1], [20, 0], { extrapolateRight: 'clamp' })}px)`,
            }}
          >
            {city.featured}
          </div>
        )}

        {/* Info pills */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            opacity: Math.min(1, Math.max(0, infoSpring)),
            transform: `translateY(${interpolate(infoSpring, [0, 1], [18, 0], { extrapolateRight: 'clamp' })}px)`,
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.22)',
              borderRadius: 40,
              padding: '10px 20px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🚗 {city.transport}
          </div>
          <div
            style={{
              background: 'rgba(0,0,0,0.22)',
              borderRadius: 40,
              padding: '10px 20px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {city.priceEmoji} {priceLabel}
          </div>
        </div>
      </div>

      {/* ── Right map panel ── */}
      <div
        style={{
          flex: '0 0 32%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 40px 40px 0',
          gap: 16,
          opacity: mapOpacity,
          transform: `translateX(${mapX}px)`,
        }}
      >
        {/* Map card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.14)',
            borderRadius: 24,
            padding: '18px 16px',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          }}
        >
          <SriLankaMap
            visitedCities={cityIndex + 1}
            showRoute
            width={220}
            height={352}
            showLabels={false}
          />
        </div>

        {/* Stop counter */}
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 40,
            padding: '8px 18px',
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.04em',
          }}
        >
          Parada {cityIndex + 1} / 7
        </div>
      </div>
    </div>
  );
};
