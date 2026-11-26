import React from 'react';

interface MobileCoverWavesProps {
  className?: string;
}

/**
 * Layered Organic Waves matching the royal purple + light purple + luminous gold wave silhouette.
 */
export const MobileCoverWaves: React.FC<MobileCoverWavesProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 430 44"
    preserveAspectRatio="none"
    aria-hidden="true"
    className={`pointer-events-none block w-full h-9 ${className}`}
  >
    <path
      d="M0,18 C95,42 185,2 290,22 C355,34 398,22 430,12 L430,44 L0,44 Z"
      fill="#C084FC"
      fillOpacity="0.28"
    />
    <path
      d="M0,26 C115,6 220,40 340,16 C380,8 410,16 430,24 L430,44 L0,44 Z"
      fill="#FFD54F"
      fillOpacity="0.22"
    />
    <path
      d="M0,32 C110,44 240,14 360,30 C392,34 414,32 430,28 L430,44 L0,44 Z"
      fill="#FEF9C3"
      fillOpacity="0.96"
    />
  </svg>
);

interface MobileGeometricNotchBarProps {
  statusText?: string;
}

/**
 * Architectural Geometric Mobile Notch / Dynamic Island integrated into the Top Cover.
 */
export const MobileGeometricNotchBar: React.FC<MobileGeometricNotchBarProps> = ({
  statusText = 'BASIT',
}) => (
  <div
    dir="ltr"
    className="relative z-20 flex items-center justify-between px-4 pt-1.5 pb-1 select-none"
  >
    <span className="text-[10px] font-black tracking-wider text-[#FFD54F]/95 w-14 text-start tabular-nums">
      {statusText}
    </span>

    {/* Sculpted Geometric Notch / Dynamic Island */}
    <div
      aria-hidden="true"
      className="relative flex items-center justify-center gap-2 px-5 py-1.5 rounded-full bg-[#3B0764] border border-[#C084FC]/45 shadow-[inset_0_1px_2px_rgba(255,213,79,0.38),0_4px_12px_rgba(59,7,100,0.45)]"
    >
      <span className="w-8 h-1 rounded-full bg-[#D8B4FE]/55" />
      <span className="w-2 h-2 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#EAB308] shadow-[0_0_6px_rgba(255,213,79,0.85)]" />
    </div>

    <div className="flex items-center justify-end gap-1 w-14" aria-hidden="true">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD54F]" />
      <span className="w-3.5 h-1.5 rounded-full bg-[#EDE9FE]/85" />
    </div>
  </div>
);

interface BottomRoyalWaveFooterProps {
  children?: React.ReactNode;
}

/**
 * Rising Royal Purple + Light Purple + Gold Bottom Wave Cover (used in Splash & Onboarding Auth Gate).
 */
export const BottomRoyalWaveFooter: React.FC<BottomRoyalWaveFooterProps> = ({ children }) => (
  <div className="relative w-full mt-auto shrink-0">
    <svg
      viewBox="0 0 430 56"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none block w-full h-12 -mb-1"
    >
      <path
        d="M0,26 C100,2 220,48 335,18 C378,6 408,14 430,22 L430,56 L0,56 Z"
        fill="#C084FC"
        fillOpacity="0.45"
      />
      <path
        d="M0,34 C120,52 245,8 365,30 C396,36 416,32 430,26 L430,56 L0,56 Z"
        fill="#FFD54F"
        fillOpacity="0.55"
      />
      <path
        d="M0,36 C130,14 250,48 370,26 C398,20 418,24 430,30 L430,56 L0,56 Z"
        fill="url(#basitBottomCoverGrad)"
      />
      <defs>
        <linearGradient id="basitBottomCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#581C87" />
          <stop offset="55%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>
      </defs>
    </svg>
    <div className="bg-gradient-to-b from-[#4C1D95] to-[#3B0764] text-white px-5 pb-6 pb-safe pt-2">
      {children}
    </div>
  </div>
);
