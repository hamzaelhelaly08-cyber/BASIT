import React from 'react';

interface BaitAlEilaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Official Bait Al-Eila Kitchen Logo Component.
 * Features the signature purple (#62339A) and warm golden yellow (#FBBF24) palette
 * with clean Arabic typography "مطبخ بيت العيلة" and English "BAIT AL-EILA".
 */
export const BaitAlEilaBrandLogo: React.FC<BaitAlEilaLogoProps> = ({
  className = 'w-14 h-14',
  size = 'md',
}) => {
  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-[#62339A] to-[#4A2378] p-1 shadow-md flex items-center justify-center shrink-0 border border-[#FBBF24]/50 ${className}`}
      title="مطبخ بيت العيلة | BAIT AL-EILA"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        role="img"
        aria-label="شعار مطبخ بيت العيلة"
      >
        <circle cx="50" cy="50" r="44" fill="#FBBF24" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#62339A" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Decorative Chef Hat & Hearth Hearth Motif */}
        <path
          d="M38 33c-2-4 0-8 4-8 2 0 4 1 5 3 2-3 6-4 9-2 2-2 6-2 8 1 3 0 5 3 4 6 3 1 4 4 3 7H35c-1-3 0-6 3-7z"
          fill="#62339A"
        />
        <rect x="36" y="34" width="28" height="3" rx="1.5" fill="#62339A" />
        {/* Arabic Typography: بيت العيلة */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fill="#4A2378"
          fontSize="13.5"
          fontWeight="900"
          fontFamily="system-ui, 'Segoe UI', Tahoma, sans-serif"
        >
          بيت العيلة
        </text>
        {/* English subtitle */}
        <text
          x="50"
          y="70"
          textAnchor="middle"
          fill="#292333"
          fontSize="6.8"
          fontWeight="900"
          letterSpacing="0.8"
          fontFamily="system-ui, sans-serif"
        >
          BAIT AL-EILA
        </text>
        {/* Subtitle: مطبخ الطهي البيتي */}
        <text
          x="50"
          y="81"
          textAnchor="middle"
          fill="#62339A"
          fontSize="5.2"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
        >
          مطبخ الطهي البيتي
        </text>
      </svg>
    </div>
  );
};
