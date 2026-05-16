import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Activity } from '../data/itinerary';

interface ActivityCardProps {
  activities: Activity[];
  startFrame?: number;
  stagger?: number;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activities,
  startFrame = 20,
  stagger = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.13)',
        borderRadius: 20,
        padding: '24px 28px',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {activities.map((activity, i) => {
        const delay = startFrame + i * stagger;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 15, stiffness: 120, mass: 0.7 },
        });
        const opacity = Math.min(1, Math.max(0, s));
        const tx = interpolate(s, [0, 1], [-40, 0], { extrapolateRight: 'clamp' });

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity,
              transform: `translateX(${tx}px)`,
            }}
          >
            {/* Icon bubble */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
                transform: `scale(${interpolate(s, [0, 1], [0.5, 1], { extrapolateRight: 'clamp' })})`,
              }}
            >
              {activity.icon}
            </div>
            <span
              style={{
                fontSize: 22,
                color: 'white',
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontWeight: 400,
                lineHeight: 1.3,
                textShadow: '0 1px 8px rgba(0,0,0,0.2)',
              }}
            >
              {activity.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
