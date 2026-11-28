import React from 'react';

interface MobileCoverWavesProps {
  className?: string;
}

export const MobileCoverWaves: React.FC<MobileCoverWavesProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 430 32"
    preserveAspectRatio="none"
    aria-hidden="true"
    className={`pointer-events-none block w-full h-5 ${className}`}
  >
    <path
      d="M0,14 C105,30 220,2 340,18 C385,24 412,18 430,12 L430,32 L0,32 Z"
      fill="#A855F7"
      fillOpacity="0.22"
    />
    <path
      d="M0,22 C125,32 250,10 375,24 C400,27 416,25 430,22 L430,32 L0,32 Z"
      className="fill-[#FFFDF7] dark:fill-[#1A052E]"
    />
  </svg>
);

interface MobileGeometricNotchBarProps {
  statusText?: string;
}

export const MobileGeometricNotchBar: React.FC<MobileGeometricNotchBarProps> = ({
  statusText = 'BASIT',
}) => (
  <div
    dir="ltr"
    className="relative z-20 flex items-center justify-between px-4 pt-1.5 pb-1 select-none"
  >
    <span className="text-[10px] font-black tracking-wider text-[#FFE875] w-14 text-start tabular-nums">
      {statusText}
    </span>

    <div
      aria-hidden="true"
      className="relative flex items-center justify-center gap-2 px-5 py-1.5 rounded-full bg-[#240046] border border-[rgba(212,175,55,0.45)] shadow-[inset_0_1px_2px_rgba(255,232,117,0.38),0_4px_12px_rgba(26,5,46,0.5)]"
    >
      <span className="w-8 h-1 rounded-full bg-[#A855F7]/55" />
      <span className="w-2 h-2 rounded-full bg-[linear-gradient(135deg,#FFE875,#D4AF37)] shadow-[0_0_6px_rgba(255,232,117,0.85)]" />
    </div>

    <div className="flex items-center justify-end gap-1 w-14" aria-hidden="true">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FFE875]" />
      <span className="w-3.5 h-1.5 rounded-full bg-[#FFFDF7]/85" />
    </div>
  </div>
);

interface BottomRoyalWaveFooterProps {
  children?: React.ReactNode;
}

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
        fill="#A855F7"
        fillOpacity="0.4"
      />
      <path
        d="M0,34 C120,52 245,8 365,30 C396,36 416,32 430,26 L430,56 L0,56 Z"
        fill="#D4AF37"
        fillOpacity="0.5"
      />
      <path
        d="M0,36 C130,14 250,48 370,26 C398,20 418,24 430,30 L430,56 L0,56 Z"
        fill="url(#basitBottomCoverGrad)"
      />
      <defs>
        <linearGradient id="basitBottomCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5A189A" />
          <stop offset="55%" stopColor="#4B148C" />
          <stop offset="100%" stopColor="#240046" />
        </linearGradient>
      </defs>
    </svg>
    <div className="bg-[linear-gradient(180deg,#4B148C,#240046,#1A052E)] text-white px-5 pb-6 pb-safe pt-2">
      {children}
    </div>
  </div>
);
