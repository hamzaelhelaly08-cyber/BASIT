import React from 'react';
import { CountryCode } from '../data/phase1Data';

interface OfficialCountryFlagProps {
  country: CountryCode;
  className?: string;
}

/**
 * Renders crisp, authentic rectangular national flags for approved markets ONLY:
 * - EG: Official Egypt flag (Active Primary Operational Hub)
 * - QA: Official Qatar national flag (Awaiting Opening — Doha, QA)
 * - OM: Official Oman national flag (Awaiting Opening — Muscat, OM)
 * - GB: Official United Kingdom Union Jack (Awaiting Opening — London, UK)
 */
export const OfficialCountryFlag: React.FC<OfficialCountryFlagProps> = ({
  country,
  className = 'w-7 h-5',
}) => {
  if (country === 'EG') {
    return (
      <svg
        viewBox="0 0 36 24"
        className={`${className} rounded-[4px] border border-[#ECE7F6] dark:border-white/15 shadow-xs shrink-0`}
        aria-label="Egypt Flag"
      >
        <rect width="36" height="8" y="0" fill="#CE1126" />
        <rect width="36" height="8" y="8" fill="#FFFFFF" />
        <rect width="36" height="8" y="16" fill="#000000" />
        {/* Golden Eagle of Saladin */}
        <g transform="translate(18, 12)">
          <path d="M-3.4,-1.3 L-1.6,-1.6 L-1.4,1.2 L-3.1,0.8 Z" fill="#C09300" />
          <path d="M3.4,-1.3 L1.6,-1.6 L1.4,1.2 L3.1,0.8 Z" fill="#C09300" />
          <path d="M-1.9,-2.2 L1.9,-2.2 L1.5,1.2 L0,2.4 L-1.5,1.2 Z" fill="#D4AF37" stroke="#9A7200" strokeWidth="0.25" />
          <circle cx="0" cy="-2.75" r="0.7" fill="#C09300" />
          <path d="M0.3,-2.95 L1.35,-2.7 L0.45,-2.35 Z" fill="#9A7200" />
          <rect x="-0.85" y="-1.1" width="1.7" height="0.65" fill="#CE1126" />
          <rect x="-0.85" y="-0.45" width="1.7" height="0.65" fill="#FFFFFF" />
          <rect x="-0.85" y="0.2" width="1.7" height="0.65" fill="#000000" />
          <rect x="-2.1" y="2.35" width="4.2" height="0.65" rx="0.25" fill="#C09300" />
        </g>
      </svg>
    );
  }

  if (country === 'QA') {
    return (
      <svg
        viewBox="0 0 36 24"
        className={`${className} rounded-[4px] border border-[#ECE7F6] dark:border-white/15 shadow-xs shrink-0`}
        aria-label="Qatar Flag"
      >
        <rect width="36" height="24" fill="#8D1B3D" />
        <polygon
          fill="#FFFFFF"
          points="0,0 10.5,0 13,1.33 10.5,2.67 13,4 10.5,5.33 13,6.67 10.5,8 13,9.33 10.5,10.67 13,12 10.5,13.33 13,14.67 10.5,16 13,17.33 10.5,18.67 13,20 10.5,21.33 13,22.67 10.5,24 0,24"
        />
      </svg>
    );
  }

  if (country === 'OM') {
    return (
      <svg
        viewBox="0 0 36 24"
        className={`${className} rounded-[4px] border border-[#ECE7F6] dark:border-white/15 shadow-xs shrink-0`}
        aria-label="Oman Flag"
      >
        <rect width="36" height="8" y="0" fill="#FFFFFF" />
        <rect width="36" height="8" y="8" fill="#DB161B" />
        <rect width="36" height="8" y="16" fill="#008000" />
        <rect width="10" height="24" x="0" y="0" fill="#DB161B" />
        {/* Stylized White Khanjar & Crossed Swords */}
        <g transform="translate(5, 5.2)" stroke="#FFFFFF" strokeWidth="0.9" fill="none" strokeLinecap="round">
          <path d="M-2.2,2.2 L2.2,-2.2 M2.2,2.2 L-2.2,-2.2" />
          <path d="M0,-2.4 L0,1.6 Q0.5,2.3 1.4,2.1" strokeWidth="1.1" />
        </g>
      </svg>
    );
  }

  // United Kingdom (GB)
  const clipId = 'gb_clip_official';
  return (
    <svg
      viewBox="0 0 36 24"
      className={`${className} rounded-[4px] border border-[#ECE7F6] dark:border-white/15 shadow-xs shrink-0`}
      aria-label="United Kingdom Union Jack Flag"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="36" height="24" x="0" y="0" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="36" height="24" fill="#012169" />
        <path d="M-3,-2 L39,26 M39,-2 L-3,26" stroke="#FFFFFF" strokeWidth="4.8" />
        <path d="M0,0 L18,12 M36,24 L18,12" stroke="#C8102E" strokeWidth="2.1" transform="translate(0, 0.7)" />
        <path d="M36,0 L18,12 M0,24 L18,12" stroke="#C8102E" strokeWidth="2.1" transform="translate(0, -0.7)" />
        <path d="M18,0 V24 M0,12 H36" stroke="#FFFFFF" strokeWidth="7.8" />
        <path d="M18,0 V24 M0,12 H36" stroke="#C8102E" strokeWidth="4.6" />
      </g>
    </svg>
  );
};
