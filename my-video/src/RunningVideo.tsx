import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";

// ── Timing (frames at 30fps) — adjust to match your source footage ──────────
const HOOK_END = 75;              // 0–2.5s  : hook screen
const MOVILIDAD_START = 75;       // 2.5s
const MOVILIDAD_END = 255;        // 8.5s
const CALENTAMIENTO_START = 255;  // 8.5s
const CALENTAMIENTO_END = 435;    // 14.5s
const ENTRENAMIENTO_START = 435;  // 14.5s
const ENTRENAMIENTO_END = 675;    // 22.5s
const ENFRIAMIENTO_START = 675;   // 22.5s
const ENFRIAMIENTO_END = 840;     // 28s
const CTA_START = 840;            // 28s
const TOTAL = 900;                // 30s

// ── Palette ────────────────────────────────────────────────────────────────
const LIME = "#C8F135";
const RED = "#FF3D00";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// ── Fonts ──────────────────────────────────────────────────────────────────
const FONT_DISPLAY = "'Arial Black', Impact, 'Helvetica Neue', sans-serif";
const FONT_BODY = "Arial, 'Helvetica Neue', sans-serif";

// ── Phase definitions ──────────────────────────────────────────────────────
type Phase = {
  id: string;
  number: string;
  label: string;
  sub: string;
  start: number;
  end: number;
  accent: string;
  videoStart: number; // seconds into source video
  filter: string;
};

const PHASES: Phase[] = [
  {
    id: "movilidad",
    number: "01",
    label: "MOVILIDAD",
    sub: "Prepara las articulaciones",
    start: MOVILIDAD_START,
    end: MOVILIDAD_END,
    accent: LIME,
    videoStart: 0,
    filter: "contrast(1.1) saturate(0.85) brightness(0.88)",
  },
  {
    id: "calentamiento",
    number: "02",
    label: "CALENTAMIENTO",
    sub: "Activa el sistema cardiovascular",
    start: CALENTAMIENTO_START,
    end: CALENTAMIENTO_END,
    accent: LIME,
    videoStart: 30,
    filter: "contrast(1.15) saturate(0.9) brightness(0.85)",
  },
  {
    id: "entrenamiento",
    number: "03",
    label: "ENTRENAMIENTO",
    sub: "5 × 1000m · Zona 4–5",
    start: ENTRENAMIENTO_START,
    end: ENTRENAMIENTO_END,
    accent: RED,
    videoStart: 60,
    filter: "contrast(1.35) saturate(1.15) brightness(0.82)",
  },
  {
    id: "enfriamiento",
    number: "04",
    label: "ENFRIAMIENTO",
    sub: "Recuperación activa",
    start: ENFRIAMIENTO_START,
    end: ENFRIAMIENTO_END,
    accent: LIME,
    videoStart: 120,
    filter: "contrast(1.05) saturate(0.75) brightness(0.9)",
  },
];

// ── Vignette ───────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.8) 100%)",
      pointerEvents: "none",
    }}
  />
);

// ── Color grade tint ───────────────────────────────────────────────────────
const ColorGrade: React.FC<{ phase: Phase }> = ({ phase }) => (
  <AbsoluteFill
    style={{
      background:
        phase.accent === RED
          ? "rgba(60, 0, 0, 0.18)"
          : "rgba(0, 15, 50, 0.15)",
      mixBlendMode: "multiply",
      pointerEvents: "none",
    }}
  />
);

// ── Film grain (animated SVG noise) ────────────────────────────────────────
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (frame % 60) + 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.07 }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

// ── Speed lines (training phase) ───────────────────────────────────────────
const SpeedLines: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = (frame % 18) / 18;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const y = 150 + i * 200;
        const lineW = interpolate(progress, [0, 1], [0, 900]);
        const op = interpolate(
          progress,
          [0, 0.25, 0.75, 1],
          [0, 0.45, 0.3, 0]
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -50,
              top: y,
              width: lineW,
              height: i % 3 === 0 ? 3 : 1.5,
              background: `linear-gradient(to right, transparent, ${RED})`,
              opacity: op,
              transform: `rotate(${i % 2 === 0 ? 1.5 : -1.5}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── Phase banner (slides in/out) ────────────────────────────────────────────
const BANNER_DURATION = 48; // 1.6s

const PhaseBanner: React.FC<{ phase: Phase }> = ({ phase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = interpolate(frame, [0, 22], [-1200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const slideOut = interpolate(
    frame,
    [BANNER_DURATION - 18, BANNER_DURATION],
    [0, -1200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );

  const x = frame < BANNER_DURATION - 18 ? slideIn : slideOut;

  const numScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180 },
    from: 0,
    to: 1,
  });

  const subOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 260,
        left: 0,
        right: 0,
        transform: `translateX(${x}px)`,
      }}
    >
      {/* accent bar */}
      <div
        style={{
          width: 72,
          height: 4,
          background: phase.accent,
          marginLeft: 60,
          marginBottom: 14,
        }}
      />

      {/* ghost number */}
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 180,
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: `2px ${phase.accent}`,
          lineHeight: 1,
          marginLeft: 44,
          transform: `scale(${numScale})`,
          transformOrigin: "left center",
          opacity: 0.3,
          letterSpacing: -4,
        }}
      >
        {phase.number}
      </div>

      {/* phase name */}
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 88,
          fontWeight: 900,
          color: WHITE,
          lineHeight: 1,
          marginLeft: 60,
          letterSpacing: 6,
        }}
      >
        {phase.label}
      </div>

      {/* sub text */}
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 32,
          color: phase.accent,
          marginLeft: 64,
          marginTop: 14,
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: subOpacity,
        }}
      >
        {phase.sub}
      </div>
    </div>
  );
};

// ── Stats bar (bottom) ──────────────────────────────────────────────────────
const STATS: Record<string, { pace: string; hr: string; zone: string }> = {
  movilidad:     { pace: "–", hr: "–", zone: "ZONA 1" },
  calentamiento: { pace: "5'20\"", hr: "135bpm", zone: "ZONA 2" },
  entrenamiento: { pace: "3'08\"", hr: "178bpm", zone: "ZONA 4–5" },
  enfriamiento:  { pace: "6'10\"", hr: "120bpm", zone: "ZONA 1–2" },
};

const StatsBar: React.FC<{ phase: Phase }> = ({ phase }) => {
  const frame = useCurrentFrame();
  const stats = STATS[phase.id];

  const slideUp = interpolate(frame, [0, 22], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 0,
        right: 0,
        padding: "0 60px",
        transform: `translateY(${slideUp}px)`,
      }}
    >
      {/* top rule */}
      <div
        style={{
          height: 2,
          background: phase.accent,
          marginBottom: 20,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {/* Pace */}
        <div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 22,
              color: phase.accent,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            RITMO
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 68,
              fontWeight: 900,
              color: WHITE,
              lineHeight: 1,
            }}
          >
            {stats.pace}
            <span
              style={{
                fontSize: 26,
                fontWeight: 400,
                color: "rgba(255,255,255,0.55)",
                marginLeft: 6,
              }}
            >
              /km
            </span>
          </div>
        </div>

        {/* HR */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 22,
              color: phase.accent,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            FC
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 52,
              fontWeight: 900,
              color: WHITE,
              lineHeight: 1,
            }}
          >
            {stats.hr}
          </div>
        </div>

        {/* Zone */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: 4,
              marginBottom: 4,
            }}
          >
            FASE {phase.number}/04
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 40,
              fontWeight: 900,
              color: phase.accent,
              lineHeight: 1,
              letterSpacing: 2,
            }}
          >
            {stats.zone}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Progress bar (top) ──────────────────────────────────────────────────────
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const phaseFrames = TOTAL - HOOK_END;
  const progressFrame = Math.max(0, frame - HOOK_END);
  const progress = progressFrame / phaseFrames;

  const currentPhase = PHASES.find((p) => frame >= p.start && frame < p.end);
  const accent = currentPhase?.accent ?? LIME;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        background: "rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: accent,
          transition: "background 0.3s",
        }}
      />
    </div>
  );
};

// ── Brand watermark ─────────────────────────────────────────────────────────
const BrandMark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [HOOK_END, HOOK_END + 20], [0, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        right: 60,
        fontFamily: FONT_DISPLAY,
        fontSize: 26,
        fontWeight: 900,
        color: WHITE,
        letterSpacing: 6,
        textTransform: "uppercase",
        opacity,
      }}
    >
      @ATHLETE
    </div>
  );
};

// ── Hook screen ─────────────────────────────────────────────────────────────
const HookScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1 = spring({ frame, fps, config: { damping: 14, stiffness: 200 }, from: 80, to: 0 });
  const line2 = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 200 }, from: 80, to: 0 });
  const line3 = spring({ frame: Math.max(0, frame - 24), fps, config: { damping: 14, stiffness: 200 }, from: 80, to: 0 });
  const barW = spring({ frame: Math.max(0, frame - 36), fps, config: { damping: 12, stiffness: 260 }, from: 0, to: 420 });

  const fadeOut = interpolate(frame, [58, HOOK_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: BLACK,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 60,
        opacity: fadeOut,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 28,
            color: LIME,
            letterSpacing: 7,
            textTransform: "uppercase",
            marginBottom: 20,
            transform: `translateX(${line1}px)`,
          }}
        >
          ASÍ ENTRENO YO
        </div>

        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 112,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 0.95,
            transform: `translateX(${line2}px)`,
          }}
        >
          PARA
          <br />
          BAJAR DE
        </div>

        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 136,
            fontWeight: 900,
            color: LIME,
            lineHeight: 1,
            marginTop: 8,
            transform: `translateX(${line3}px)`,
          }}
        >
          15'52"
        </div>

        <div
          style={{
            width: barW,
            height: 5,
            background: LIME,
            marginTop: 28,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── CTA screen ──────────────────────────────────────────────────────────────
const CTAScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = spring({ frame, fps, config: { damping: 13, stiffness: 160 }, from: 90, to: 0 });

  return (
    <AbsoluteFill
      style={{
        background: "rgba(0,0,0,0.94)",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      <div style={{ textAlign: "center", padding: "0 60px" }}>
        <div
          style={{
            width: 72,
            height: 4,
            background: LIME,
            margin: "0 auto 36px",
          }}
        />

        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 80,
            fontWeight: 900,
            color: WHITE,
            letterSpacing: 4,
            lineHeight: 1.05,
            transform: `translateY(${textY}px)`,
          }}
        >
          GUARDA
          <br />
          ESTE ENTRENO
        </div>

        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 30,
            color: LIME,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 28,
            transform: `translateY(${textY}px)`,
          }}
        >
          Y PRUÉBALO EN TU PRÓXIMA SESIÓN
        </div>

        <div
          style={{
            width: 72,
            height: 4,
            background: LIME,
            margin: "36px auto 0",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ─────────────────────────────────────────────────────────
export const RunningVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentPhase = PHASES.find((p) => frame >= p.start && frame < p.end);

  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {/* ── Video segments, one per phase ── */}
      {PHASES.map((phase) => (
        <Sequence
          key={phase.id}
          from={phase.start}
          durationInFrames={phase.end - phase.start}
        >
          <AbsoluteFill>
            <Video
              src={staticFile("shutt_export.mov")}
              startFrom={phase.videoStart * fps}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: phase.filter,
              }}
              volume={0}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* ── Color grade tint ── */}
      {currentPhase && <ColorGrade phase={currentPhase} />}

      {/* ── Vignette ── */}
      <Vignette />

      {/* ── Film grain ── */}
      <FilmGrain />

      {/* ── Speed lines (training only) ── */}
      <Sequence from={ENTRENAMIENTO_START} durationInFrames={ENTRENAMIENTO_END - ENTRENAMIENTO_START}>
        <SpeedLines />
      </Sequence>

      {/* ── Progress bar ── */}
      {frame >= HOOK_END && <ProgressBar />}

      {/* ── Brand ── */}
      <BrandMark />

      {/* ── Phase banners ── */}
      {PHASES.map((phase) => (
        <Sequence
          key={`banner-${phase.id}`}
          from={phase.start}
          durationInFrames={BANNER_DURATION}
        >
          <PhaseBanner phase={phase} />
        </Sequence>
      ))}

      {/* ── Stats bars ── */}
      {PHASES.map((phase) => (
        <Sequence
          key={`stats-${phase.id}`}
          from={phase.start + BANNER_DURATION}
          durationInFrames={phase.end - phase.start - BANNER_DURATION}
        >
          <StatsBar phase={phase} />
        </Sequence>
      ))}

      {/* ── Hook ── */}
      <Sequence from={0} durationInFrames={HOOK_END}>
        <HookScreen />
      </Sequence>

      {/* ── CTA ── */}
      <Sequence from={CTA_START} durationInFrames={TOTAL - CTA_START}>
        <CTAScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
