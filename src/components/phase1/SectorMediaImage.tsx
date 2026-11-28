import React, { useState } from 'react';
import type { SectorIconName } from '../../data/phase1Sectors';
import { SectorIcon } from './SectorIcon';

interface SectorMediaImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  iconName: SectorIconName;
  aspectClass?: string;
  eager?: boolean;
  className?: string;
}

export const SectorMediaImage: React.FC<SectorMediaImageProps> = ({
  src,
  alt,
  fallbackTitle,
  iconName,
  aspectClass = 'aspect-[4/3]',
  eager = false,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#EDE9FE] dark:bg-[#221738] ${aspectClass} ${className}`}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 bg-[linear-gradient(135deg,#240046,#4B148C,#5A189A)] text-[#FFFFFF] text-center">
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-[rgba(212,175,55,0.4)] flex items-center justify-center text-[#FFE875]">
            <SectorIcon name={iconName} className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-[#FFFDF7]">{fallbackTitle}</span>
        </div>
      )}
    </div>
  );
};
