import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Intro } from '../scenes/Intro';
import { CityScene } from '../scenes/CityScene';
import { TukTukTransition } from '../scenes/TukTukTransition';
import { Outro } from '../scenes/Outro';
import { CITIES } from '../data/itinerary';

// Frame budgets (at 30fps)
const INTRO_DURATION      = 150; // 5s
const CITY_DURATION       = 240; // 8s
const ELLA_DURATION       = 300; // 10s — featured
const TRANSITION_DURATION = 90;  // 3s
const OUTRO_DURATION      = 180; // 6s

type SceneItem =
  | { type: 'intro';      from: number; duration: number }
  | { type: 'city';       from: number; duration: number; cityIndex: number }
  | { type: 'transition'; from: number; duration: number; cityIndex: number }
  | { type: 'outro';      from: number; duration: number };

function buildTimeline(): { items: SceneItem[]; totalDuration: number } {
  const items: SceneItem[] = [];
  let from = 0;

  items.push({ type: 'intro', from, duration: INTRO_DURATION });
  from += INTRO_DURATION;

  for (let i = 0; i < CITIES.length; i++) {
    const dur = CITIES[i].id === 'ella' ? ELLA_DURATION : CITY_DURATION;
    items.push({ type: 'city', from, duration: dur, cityIndex: i });
    from += dur;

    if (i < CITIES.length - 1) {
      items.push({ type: 'transition', from, duration: TRANSITION_DURATION, cityIndex: i });
      from += TRANSITION_DURATION;
    }
  }

  items.push({ type: 'outro', from, duration: OUTRO_DURATION });
  from += OUTRO_DURATION;

  return { items, totalDuration: from };
}

const { items, totalDuration } = buildTimeline();

export { totalDuration };

export const SriLankaVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: '#F5F0E8',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Google Fonts preload */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&display=swap');
      `}</style>

      {items.map((item, idx) => {
        if (item.type === 'intro') {
          return (
            <Sequence key={`intro-${idx}`} from={item.from} durationInFrames={item.duration}>
              <Intro />
            </Sequence>
          );
        }

        if (item.type === 'city') {
          return (
            <Sequence key={`city-${item.cityIndex}`} from={item.from} durationInFrames={item.duration}>
              <CityScene city={CITIES[item.cityIndex]} cityIndex={item.cityIndex} />
            </Sequence>
          );
        }

        if (item.type === 'transition') {
          const from = CITIES[item.cityIndex];
          const to   = CITIES[item.cityIndex + 1];
          return (
            <Sequence key={`tt-${item.cityIndex}`} from={item.from} durationInFrames={item.duration}>
              <TukTukTransition
                nextCityName={to.name}
                nextCityEmoji={to.emoji}
                visitedCount={item.cityIndex + 1}
                fromColor={from.bgGradient[1]}
                toColor={to.bgGradient[0]}
              />
            </Sequence>
          );
        }

        if (item.type === 'outro') {
          return (
            <Sequence key={`outro-${idx}`} from={item.from} durationInFrames={item.duration}>
              <Outro />
            </Sequence>
          );
        }

        return null;
      })}
    </AbsoluteFill>
  );
};
