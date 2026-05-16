import React from 'react';
import { RouteState } from '../utils/routeTimeline';

interface DataOverlayProps {
  state: RouteState;
  flybyFrame: number;
}

// Estimated leader time at each km (9:00h start, leaders finish ~12:30–13:00h)
// Simplified linear interpolation: leader pace ~5:20 min/km average over 42.2km
// Actually a rough curve: first half slower (more climb), second half varies
function estimateLeaderTime(km: number): string {
  // From data: leaders finish in ~3h30m = 210 min
  // Very rough: first 22km take ~80min, remaining 20.2km take ~130min
  let totalMin: number;
  if (km <= 22) {
    totalMin = (km / 22) * 80;
  } else {
    totalMin = 80 + ((km - 22) / 20.195) * 130;
  }
  const h = Math.floor(totalMin / 60);
  const m = Math.floor(totalMin % 60);
  const clockH = 9 + h;
  return `${clockH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}h`;
}

interface StatBoxProps {
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color = '#00D4FF', mono = true }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    padding: '8px 16px',
    borderLeft: `3px solid ${color}`,
    marginBottom: 6,
  }}>
    <div style={{
      fontSize: 10, color: '#8888AA', letterSpacing: '0.12em',
      fontFamily: "'Inter', sans-serif", marginBottom: 2,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 26, fontWeight: 700, color,
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
      lineHeight: 1,
    }}>
      {value}
    </div>
  </div>
);

export const DataOverlay: React.FC<DataOverlayProps> = ({ state }) => {
  const { km, alt, dPlus } = state;

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(10,10,15,0.85)',
        border: '1px solid #00D4FF22',
        borderRadius: 12,
        padding: '14px 4px',
        backdropFilter: 'blur(16px)',
        minWidth: 180,
        boxShadow: '0 0 40px rgba(0,212,255,0.05)',
        zIndex: 50,
      }}
    >
      {/* Logo / Race name */}
      <div style={{
        padding: '0 16px 10px',
        borderBottom: '1px solid #ffffff11',
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 800, color: '#00D4FF',
          letterSpacing: '0.06em',
          fontFamily: "'Inter', sans-serif",
        }}>
          ZEGAMA-AIZKORRI
        </div>
        <div style={{ fontSize: 10, color: '#666688', letterSpacing: '0.08em' }}>
          42 km · 2.750m D+
        </div>
      </div>

      <StatBox label="KM"      value={km.toFixed(1)}           color="#00D4FF" />
      <StatBox label="ALTITUD" value={`${Math.round(alt)} m`}  color="#FFB800" />
      <StatBox label="D+ ACUM" value={`+${Math.round(dPlus)} m`} color="#00FF88" />
      <StatBox label="🏃 LÍDER EST." value={estimateLeaderTime(km)} color="#FF6B00" mono />
    </div>
  );
};
