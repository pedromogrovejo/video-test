import React from 'react';

interface TukTukSVGProps {
  width?: number;
  height?: number;
}

export const TukTukSVG: React.FC<TukTukSVGProps> = ({ width = 180, height = 120 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <ellipse cx="90" cy="108" rx="70" ry="6" fill="rgba(0,0,0,0.15)" />

      {/* Roof canopy */}
      <path
        d="M 22 28 Q 22 10 40 8 L 140 8 Q 158 8 158 28 Z"
        fill="#FFD60A"
      />
      {/* Roof stripe */}
      <path
        d="M 22 28 Q 22 14 40 12 L 140 12 Q 158 14 158 28 Z"
        fill="#FF6B35"
        opacity="0.7"
      />

      {/* Main cabin body */}
      <path
        d="M 10 28 L 155 28 L 165 70 L 5 70 Z"
        fill="#FFD60A"
      />

      {/* Cabin interior shadow */}
      <path
        d="M 10 28 L 155 28 L 165 70 L 5 70 Z"
        fill="url(#bodyGrad)"
      />
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>

      {/* Windshield / front window */}
      <path
        d="M 118 30 L 152 30 L 161 65 L 125 65 Z"
        fill="#ADE8F4"
        opacity="0.75"
      />
      {/* Windshield frame */}
      <path
        d="M 118 30 L 152 30 L 161 65 L 125 65 Z"
        fill="none"
        stroke="#E6A800"
        strokeWidth="2"
      />

      {/* Side window 1 */}
      <rect x="75" y="32" width="36" height="28" rx="4" fill="#ADE8F4" opacity="0.6" />
      <rect x="75" y="32" width="36" height="28" rx="4" fill="none" stroke="#E6A800" strokeWidth="1.5" />

      {/* Side window 2 (open / curtain) */}
      <rect x="30" y="32" width="36" height="28" rx="4" fill="rgba(255,200,0,0.2)" />
      <rect x="30" y="32" width="36" height="28" rx="4" fill="none" stroke="#E6A800" strokeWidth="1.5" />

      {/* Curtain in open window */}
      <path d="M 30 32 Q 36 46 30 60" stroke="#FF6B35" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Green stripe decoration */}
      <rect x="5" y="54" width="160" height="6" fill="#2D6A4F" opacity="0.5" />

      {/* Engine box (front) */}
      <rect x="155" y="32" width="22" height="32" rx="5" fill="#E6A800" />
      <rect x="155" y="32" width="22" height="14" rx="5" fill="#FFD60A" />

      {/* Headlight */}
      <circle cx="174" cy="44" r="5" fill="#FFF9C4" opacity="0.9" />
      <circle cx="174" cy="44" r="3" fill="white" />

      {/* Exhaust pipe */}
      <rect x="173" y="55" width="6" height="12" rx="3" fill="#AAA" />
      <circle cx="176" cy="65" r="4" fill="#888" />

      {/* Front wheel */}
      <circle cx="155" cy="88" r="18" fill="#222" />
      <circle cx="155" cy="88" r="12" fill="#444" />
      <circle cx="155" cy="88" r="5" fill="#FFD60A" />
      {/* Wheel spokes */}
      <line x1="155" y1="76" x2="155" y2="100" stroke="#666" strokeWidth="1.5" />
      <line x1="143" y1="88" x2="167" y2="88" stroke="#666" strokeWidth="1.5" />

      {/* Rear wheel */}
      <circle cx="35" cy="88" r="18" fill="#222" />
      <circle cx="35" cy="88" r="12" fill="#444" />
      <circle cx="35" cy="88" r="5" fill="#FFD60A" />
      <line x1="35" y1="76" x2="35" y2="100" stroke="#666" strokeWidth="1.5" />
      <line x1="23" y1="88" x2="47" y2="88" stroke="#666" strokeWidth="1.5" />

      {/* Passenger visible inside */}
      <circle cx="52" cy="44" r="8" fill="#FFCA80" />
      <rect x="46" y="52" width="12" height="12" rx="3" fill="#FF6B35" opacity="0.8" />
    </svg>
  );
};
