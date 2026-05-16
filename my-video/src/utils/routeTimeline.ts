import { WAYPOINTS, TOTAL_PATH_LENGTH } from '../data/route';

// ─── Timing constants ─────────────────────────────────────────────────────────
export const TRAVEL_FRAMES  = 210; // 7s to travel each segment
export const PAUSE_NORMAL   = 60;  // 2s at normal waypoints
export const PAUSE_SPECIAL  = 120; // 4s at summits / legendary
export const INITIAL_PAUSE  = 30;  // 1s dwell at WP0 before moving
export const INTRO_DURATION = 150; // 5s
export const OUTRO_DURATION = 180; // 6s

// Waypoints that get a longer pause (summits + legendary)
const SPECIAL_WPS = new Set([3, 4, 6, 7]);

// ─── Segment timing entry ────────────────────────────────────────────────────
export interface SegmentTiming {
  segIndex: number;
  fromWP: number;
  toWP: number;
  travelStart: number;
  travelEnd: number;
  pauseEnd: number;
  isSpecialDest: boolean;
}

// ─── Build the timeline ───────────────────────────────────────────────────────
function buildTimeline(): { timings: SegmentTiming[]; flybyDuration: number } {
  const timings: SegmentTiming[] = [];
  let frame = INITIAL_PAUSE;

  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const travelStart  = frame;
    const travelEnd    = frame + TRAVEL_FRAMES;
    const isSpecial    = SPECIAL_WPS.has(i + 1);
    const pause        = isSpecial ? PAUSE_SPECIAL : PAUSE_NORMAL;
    const pauseEnd     = travelEnd + pause;

    timings.push({ segIndex: i, fromWP: i, toWP: i + 1, travelStart, travelEnd, pauseEnd, isSpecialDest: isSpecial });
    frame = pauseEnd;
  }

  return { timings, flybyDuration: frame };
}

export const { timings: SEGMENT_TIMINGS, flybyDuration: FLYBY_DURATION } = buildTimeline();

// Verify total: INTRO + FLYBY + OUTRO should be ~3600
// INTRO=150, FLYBY=3240, OUTRO=180 → 3570 (close, pad outro)
export const TOTAL_FRAMES = INTRO_DURATION + FLYBY_DURATION + OUTRO_DURATION;

// ─── Route state at a given flyby-local frame ─────────────────────────────────
export interface RouteState {
  phase: 'initial_pause' | 'traveling' | 'pausing';
  activeWP: number;      // index of the waypoint the marker is at (or heading to)
  nextWP: number;        // during travel, the destination WP
  segProgress: number;   // 0–1 progress within current segment travel
  pauseProgress: number; // 0–1 progress within current pause (0 if traveling)
  km: number;
  alt: number;
  dPlus: number;
  mapX: number;
  mapY: number;
  profileX: number;
  profileY: number;
  pathProgress: number;        // 0–1, how much of the route has been drawn
  strokeDashoffset: number;    // pixel offset for SVG animation
  showCardForWP: number;       // -1 = no card, ≥0 = waypoint index to show
  cardRevealProgress: number;  // 0–1, how "open" the card is (for spring timing)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function getRouteState(frame: number): RouteState {
  const wps = WAYPOINTS;

  // Initial pause at WP0
  if (frame < INITIAL_PAUSE) {
    const wp = wps[0];
    return {
      phase: 'initial_pause',
      activeWP: 0, nextWP: 0,
      segProgress: 0, pauseProgress: frame / INITIAL_PAUSE,
      km: wp.km, alt: wp.alt, dPlus: 0,
      mapX: wp.mapX, mapY: wp.mapY,
      profileX: wp.profileX, profileY: wp.profileY,
      pathProgress: 0, strokeDashoffset: TOTAL_PATH_LENGTH,
      showCardForWP: 0, cardRevealProgress: frame / INITIAL_PAUSE,
    };
  }

  for (const t of SEGMENT_TIMINGS) {
    if (frame >= t.travelStart && frame < t.travelEnd) {
      // Traveling segment
      const from = wps[t.fromWP];
      const to   = wps[t.toWP];
      const seg  = (frame - t.travelStart) / TRAVEL_FRAMES;

      const km      = lerp(from.km, to.km, seg);
      const alt     = lerp(from.alt, to.alt, seg);
      const dPlus   = lerp(from.cumDPlus, to.cumDPlus, seg);
      const mapX    = lerp(from.mapX, to.mapX, seg);
      const mapY    = lerp(from.mapY, to.mapY, seg);
      const profX   = lerp(from.profileX, to.profileX, seg);
      const profY   = lerp(from.profileY, to.profileY, seg);

      // Path length progress
      const pathLen = from.cumPathLength + seg * from.segmentPathLength;
      const pathProgress = pathLen / TOTAL_PATH_LENGTH;

      return {
        phase: 'traveling',
        activeWP: t.fromWP, nextWP: t.toWP,
        segProgress: seg, pauseProgress: 0,
        km, alt, dPlus,
        mapX, mapY, profileX: profX, profileY: profY,
        pathProgress,
        strokeDashoffset: TOTAL_PATH_LENGTH * (1 - pathProgress),
        showCardForWP: -1,
        cardRevealProgress: 0,
      };
    }

    if (frame >= t.travelEnd && frame < t.pauseEnd) {
      // Pausing at destination WP
      const wp = wps[t.toWP];
      const pauseProg = (frame - t.travelEnd) / (t.pauseEnd - t.travelEnd);
      const pathProgress = wp.cumPathLength / TOTAL_PATH_LENGTH;

      // Card reveals over first 20 frames of pause, fades out over last 20
      const pauseFrames = t.pauseEnd - t.travelEnd;
      const rawReveal = (frame - t.travelEnd) / Math.min(20, pauseFrames * 0.3);
      const rawFade   = (t.pauseEnd - frame) / Math.min(20, pauseFrames * 0.2);
      const cardReveal = Math.min(1, Math.min(rawReveal, rawFade));

      return {
        phase: 'pausing',
        activeWP: t.toWP, nextWP: t.toWP,
        segProgress: 1, pauseProgress: pauseProg,
        km: wp.km, alt: wp.alt, dPlus: wp.cumDPlus,
        mapX: wp.mapX, mapY: wp.mapY,
        profileX: wp.profileX, profileY: wp.profileY,
        pathProgress,
        strokeDashoffset: TOTAL_PATH_LENGTH * (1 - pathProgress),
        showCardForWP: t.toWP,
        cardRevealProgress: Math.max(0, cardReveal),
      };
    }
  }

  // After all segments — at the finish
  const wp = wps[wps.length - 1];
  return {
    phase: 'pausing',
    activeWP: wp.id, nextWP: wp.id,
    segProgress: 1, pauseProgress: 1,
    km: wp.km, alt: wp.alt, dPlus: wp.cumDPlus,
    mapX: wp.mapX, mapY: wp.mapY,
    profileX: wp.profileX, profileY: wp.profileY,
    pathProgress: 1, strokeDashoffset: 0,
    showCardForWP: wp.id,
    cardRevealProgress: 1,
  };
}
