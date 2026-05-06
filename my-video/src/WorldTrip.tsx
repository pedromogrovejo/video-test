import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  geoMercator,
  geoPath,
  geoInterpolate,
  GeoPermissibleObjects,
} from "d3-geo";
import { feature } from "topojson-client";
import { TajMahal3D } from "./TajMahal3D";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const worldData = require("world-atlas/countries-110m.json");

// ── Palette ───────────────────────────────────────────────────────────────────
const OCEAN = "#0A1628";
const LAND = "#1A3020";
const LAND_STROKE = "#2A4830";
const GRATICULE = "rgba(255,255,255,0.05)";
const ROUTE_COLOR = "#FFD700";
const ACCENT = "#FFD700";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// ── Map dimensions (matches composition) ──────────────────────────────────────
const W = 1080;
const H = 1920;

// ── Cities [lng, lat] ─────────────────────────────────────────────────────────
const VALENCIA: [number, number] = [-0.3763, 39.4699];
const COLOMBO: [number, number] = [79.8612, 6.9271];
const NEW_DELHI: [number, number] = [77.209, 28.6139];

// ── Timeline (frames at 30fps) ────────────────────────────────────────────────
const VALENCIA_ZOOM_END = 90;       // 3s  — Valencia close-up
const WORLD_VIEW_END = 210;         // 7s  — zoom out to world
const LEG1_FLIGHT_START = 210;      // 7s
const LEG1_FLIGHT_END = 450;        // 15s — line drawn to Colombo
const COLOMBO_STOP_END = 540;       // 18s — pause at Colombo
const LEG2_FLIGHT_END = 690;        // 23s — line drawn to New Delhi
const TAJ_START = 720;              // 24s — Taj Mahal scene begins
const TOTAL = 990;                  // 33s

// ── Camera keyframe states ────────────────────────────────────────────────────
type CamState = { center: [number, number]; scale: number };

const CAM_VALENCIA_CLOSE: CamState = { center: VALENCIA, scale: 3200 };
const CAM_WORLD: CamState = { center: [35, 22], scale: 165 };
const CAM_MID_LEG1: CamState = { center: [40, 24], scale: 160 };
const CAM_COLOMBO: CamState = { center: COLOMBO, scale: 2400 };
const CAM_MID_LEG2: CamState = { center: [78, 18], scale: 600 };
const CAM_DELHI: CamState = { center: NEW_DELHI, scale: 2400 };

// ── Smooth camera interpolation ───────────────────────────────────────────────
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpCam(a: CamState, b: CamState, t: number): CamState {
  const e = Easing.inOut(Easing.cubic)(t);
  return {
    center: [lerp(a.center[0], b.center[0], e), lerp(a.center[1], b.center[1], e)],
    scale: lerp(a.scale, b.scale, e),
  };
}

function getCameraState(frame: number): CamState {
  if (frame <= VALENCIA_ZOOM_END) {
    return CAM_VALENCIA_CLOSE;
  }
  if (frame <= WORLD_VIEW_END) {
    const t = (frame - VALENCIA_ZOOM_END) / (WORLD_VIEW_END - VALENCIA_ZOOM_END);
    return lerpCam(CAM_VALENCIA_CLOSE, CAM_WORLD, t);
  }
  if (frame <= LEG1_FLIGHT_END) {
    const t = (frame - LEG1_FLIGHT_START) / (LEG1_FLIGHT_END - LEG1_FLIGHT_START);
    // Camera tracks the midpoint of the drawn line
    const routeT = Math.min(t * 1.05, 1);
    const interp = geoInterpolate(VALENCIA, COLOMBO);
    const midPt = interp(routeT * 0.5 + 0.1) as [number, number];
    const midCam: CamState = { center: midPt, scale: lerp(CAM_WORLD.scale, CAM_COLOMBO.scale * 0.5, t) };
    return lerpCam(CAM_MID_LEG1, midCam, t);
  }
  if (frame <= COLOMBO_STOP_END) {
    const t = (frame - LEG1_FLIGHT_END) / (COLOMBO_STOP_END - LEG1_FLIGHT_END);
    return lerpCam({ center: CAM_MID_LEG1.center, scale: 300 }, CAM_COLOMBO, t);
  }
  if (frame <= LEG2_FLIGHT_END) {
    const t = (frame - COLOMBO_STOP_END) / (LEG2_FLIGHT_END - COLOMBO_STOP_END);
    const interp = geoInterpolate(COLOMBO, NEW_DELHI);
    const midPt = interp(Math.min(t * 0.5 + 0.15, 1)) as [number, number];
    const midCam: CamState = { center: midPt, scale: lerp(CAM_COLOMBO.scale, CAM_DELHI.scale * 0.5, t) };
    return lerpCam(CAM_MID_LEG2, midCam, t);
  }
  const t = Math.min((frame - LEG2_FLIGHT_END) / 30, 1);
  return lerpCam({ center: CAM_MID_LEG2.center, scale: 500 }, CAM_DELHI, t);
}

// ── Great-circle intermediate points ─────────────────────────────────────────
function greatCirclePoints(a: [number, number], b: [number, number], n = 64): [number, number][] {
  const interp = geoInterpolate(a, b);
  return Array.from({ length: n }, (_, i) => interp(i / (n - 1)) as [number, number]);
}

// ── World map SVG layer ───────────────────────────────────────────────────────
const WorldMapLayer: React.FC<{ cam: CamState }> = ({ cam }) => {
  const { countries, graticuleLines, path } = useMemo(() => {
    const proj = geoMercator()
      .center(cam.center)
      .scale(cam.scale)
      .translate([W / 2, H / 2]);
    const pathFn = geoPath(proj);
    const countriesGeo = feature(worldData, worldData.objects.countries);
    const graticule = {
      type: "FeatureCollection" as const,
      features: Array.from({ length: 13 }, (_, i) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: Array.from({ length: 36 }, (__, j) => [
            -180 + j * 10,
            -60 + i * 10,
          ]) as [number, number][],
        },
        properties: {},
      })),
    };
    return { countries: countriesGeo, graticuleLines: graticule, path: pathFn };
  }, [cam.center[0], cam.center[1], cam.scale]); // eslint-disable-line react-hooks/exhaustive-deps

  const countryPaths = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (countries as any).features.map((f: GeoPermissibleObjects, i: number) => ({
      d: path(f) ?? "",
      i,
    }));
  }, [countries, path]);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Ocean */}
      <rect width={W} height={H} fill={OCEAN} />

      {/* Graticule */}
      {graticuleLines.features.map((f, i) => (
        <path
          key={`g-${i}`}
          d={path(f as GeoPermissibleObjects) ?? ""}
          stroke={GRATICULE}
          strokeWidth={0.5}
          fill="none"
        />
      ))}

      {/* Countries */}
      {countryPaths.map(({ d, i }: { d: string; i: number }) => (
        <path
          key={i}
          d={d}
          fill={LAND}
          stroke={LAND_STROKE}
          strokeWidth={0.5}
        />
      ))}
    </svg>
  );
};

// ── Project a [lng, lat] point to SVG [x, y] ─────────────────────────────────
function projectPoint(
  cam: CamState,
  point: [number, number]
): [number, number] {
  const proj = geoMercator()
    .center(cam.center)
    .scale(cam.scale)
    .translate([W / 2, H / 2]);
  return proj(point) as [number, number];
}

// ── Animated flight route ─────────────────────────────────────────────────────
const FlightRoute: React.FC<{
  cam: CamState;
  from: [number, number];
  to: [number, number];
  progress: number; // 0–1 drawn fraction
  color?: string;
}> = ({ cam, from, to, progress, color = ROUTE_COLOR }) => {
  const proj = useMemo(
    () =>
      geoMercator()
        .center(cam.center)
        .scale(cam.scale)
        .translate([W / 2, H / 2]),
    [cam.center[0], cam.center[1], cam.scale] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const pts = useMemo(() => greatCirclePoints(from, to, 80), []);
  const visiblePts = pts.slice(0, Math.max(2, Math.floor(pts.length * progress)));
  const projected = visiblePts
    .map((p) => proj(p))
    .filter(Boolean) as [number, number][];

  if (projected.length < 2) return null;

  const d = projected
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");

  const headPt = projected[projected.length - 1];

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* Glow under */}
      <path d={d} stroke={color} strokeWidth={6} fill="none" opacity={0.25} strokeLinecap="round" />
      {/* Main line */}
      <path d={d} stroke={color} strokeWidth={2.5} fill="none" opacity={0.9} strokeLinecap="round" />
      {/* Plane dot head */}
      <circle cx={headPt[0]} cy={headPt[1]} r={6} fill={color} />
      <circle cx={headPt[0]} cy={headPt[1]} r={10} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
    </svg>
  );
};

// ── City marker ────────────────────────────────────────────────────────────────
const CityMarker: React.FC<{
  cam: CamState;
  coords: [number, number];
  name: string;
  subtitle?: string;
  delay?: number;
  align?: "left" | "right";
}> = ({ cam, coords, name, subtitle, delay = 0, align = "right" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - delay);
  const scale = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 200 }, from: 0, to: 1 });
  const [px, py] = projectPoint(cam, coords);

  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        transform: `translate(-50%, -50%) scale(${scale})`,
        pointerEvents: "none",
      }}
    >
      {/* Pulse ring */}
      <div
        style={{
          position: "absolute",
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `2px solid ${ACCENT}`,
          top: -10,
          left: -10,
          opacity: 0.6,
        }}
      />
      {/* Dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: ACCENT,
          position: "absolute",
          top: -5,
          left: -5,
          boxShadow: `0 0 12px ${ACCENT}`,
        }}
      />
      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: -36,
          left: align === "right" ? 14 : undefined,
          right: align === "left" ? 14 : undefined,
          whiteSpace: "nowrap",
          textAlign: align === "right" ? "left" : "right",
        }}
      >
        <div
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontSize: 22,
            fontWeight: 900,
            color: WHITE,
            letterSpacing: 2,
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          {name}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 14,
              color: ACCENT,
              letterSpacing: 3,
              textTransform: "uppercase",
              textShadow: "0 2px 6px rgba(0,0,0,0.8)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Title card overlay ─────────────────────────────────────────────────────────
const TitleCard: React.FC<{ title: string; sub: string; fadeOutFrame: number }> = ({
  title,
  sub,
  fadeOutFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideY = spring({ frame, fps, config: { damping: 13, stiffness: 180 }, from: 60, to: 0 });
  const fadeOut = interpolate(frame, [fadeOutFrame - 20, fadeOutFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: 60,
        right: 60,
        opacity: fadeOut,
        transform: `translateY(${slideY}px)`,
        pointerEvents: "none",
      }}
    >
      <div style={{ width: 60, height: 4, background: ACCENT, marginBottom: 14 }} />
      <div
        style={{
          fontFamily: "'Arial Black', Impact, sans-serif",
          fontSize: 72,
          fontWeight: 900,
          color: WHITE,
          lineHeight: 1,
          letterSpacing: 3,
          textShadow: "0 4px 16px rgba(0,0,0,0.7)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 28,
          color: ACCENT,
          letterSpacing: 5,
          textTransform: "uppercase",
          marginTop: 10,
          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
        }}
      >
        {sub}
      </div>
    </div>
  );
};

// ── Stop arrival overlay ──────────────────────────────────────────────────────
const ArrivalBadge: React.FC<{ city: string; country: string }> = ({ city, country }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 150 }, from: 0, to: 1 });
  const fadeOut = interpolate(frame, [60, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: fadeOut,
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.75)",
          border: `2px solid ${ACCENT}`,
          borderRadius: 4,
          padding: "24px 48px",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 22,
            color: ACCENT,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          LLEGANDO A
        </div>
        <div
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontSize: 64,
            fontWeight: 900,
            color: WHITE,
            letterSpacing: 4,
            lineHeight: 1,
          }}
        >
          {city}
        </div>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 26,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 5,
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          {country}
        </div>
      </div>
    </div>
  );
};

// ── Taj Mahal section overlay ─────────────────────────────────────────────────
const TajSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 12, stiffness: 160 }, from: 80, to: 0 });
  const subtitleY = spring({ frame: Math.max(0, frame - 55), fps, config: { damping: 12, stiffness: 160 }, from: 80, to: 0 });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <TajMahal3D />

      {/* Title overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 60,
          right: 60,
          pointerEvents: "none",
        }}
      >
        <div style={{ width: 60, height: 4, background: ACCENT, marginBottom: 14, transform: `translateY(${titleY}px)` }} />
        <div
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontSize: 88,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1,
            letterSpacing: 2,
            textShadow: "0 4px 24px rgba(0,0,0,0.9)",
            transform: `translateY(${titleY}px)`,
          }}
        >
          TAJ MAHAL
        </div>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 28,
            color: ACCENT,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginTop: 10,
            textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          NEW DELHI · INDIA
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ──────────────────────────────────────────────────────────
export const WorldTrip: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame >= TAJ_START) {
    return (
      <AbsoluteFill style={{ background: BLACK }}>
        <Sequence from={TAJ_START} durationInFrames={TOTAL - TAJ_START}>
          <TajSection />
        </Sequence>
      </AbsoluteFill>
    );
  }

  const cam = getCameraState(frame);

  // Route 1 progress (Valencia → Colombo)
  const leg1Progress = interpolate(
    frame,
    [LEG1_FLIGHT_START, LEG1_FLIGHT_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Route 2 progress (Colombo → New Delhi)
  const leg2Progress = interpolate(
    frame,
    [COLOMBO_STOP_END, LEG2_FLIGHT_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const showValenciaMarker = frame >= VALENCIA_ZOOM_END;
  const showColomboBadge = frame >= LEG1_FLIGHT_END && frame < COLOMBO_STOP_END;
  const showColomboMarker = frame >= LEG1_FLIGHT_END;
  const showDelhiBadge = frame >= LEG2_FLIGHT_END && frame < LEG2_FLIGHT_END + 90;
  const showDelhiMarker = frame >= LEG2_FLIGHT_END;

  return (
    <AbsoluteFill style={{ background: OCEAN }}>
      {/* World map */}
      <WorldMapLayer cam={cam} />

      {/* Flight routes */}
      {leg1Progress > 0 && (
        <FlightRoute cam={cam} from={VALENCIA} to={COLOMBO} progress={leg1Progress} />
      )}
      {leg2Progress > 0 && (
        <FlightRoute cam={cam} from={COLOMBO} to={NEW_DELHI} progress={leg2Progress} />
      )}

      {/* City markers */}
      {showValenciaMarker && (
        <CityMarker cam={cam} coords={VALENCIA} name="VALENCIA" subtitle="ESPAÑA" align="right" />
      )}
      {showColomboMarker && (
        <CityMarker cam={cam} coords={COLOMBO} name="COLOMBO" subtitle="SRI LANKA" align="right" delay={LEG1_FLIGHT_END} />
      )}
      {showDelhiMarker && (
        <CityMarker cam={cam} coords={NEW_DELHI} name="NEW DELHI" subtitle="INDIA" align="left" delay={LEG2_FLIGHT_END} />
      )}

      {/* Valencia title */}
      <Sequence from={60} durationInFrames={WORLD_VIEW_END - 60}>
        <TitleCard title="VALENCIA" sub="España · 39°N" fadeOutFrame={WORLD_VIEW_END - 60} />
      </Sequence>

      {/* Arrival badges */}
      {showColomboBadge && (
        <Sequence from={LEG1_FLIGHT_END} durationInFrames={COLOMBO_STOP_END - LEG1_FLIGHT_END}>
          <ArrivalBadge city="COLOMBO" country="Sri Lanka" />
        </Sequence>
      )}
      {showDelhiBadge && (
        <Sequence from={LEG2_FLIGHT_END} durationInFrames={90}>
          <ArrivalBadge city="NEW DELHI" country="India" />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
