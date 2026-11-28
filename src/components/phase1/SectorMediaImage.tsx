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
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-[#3B0764] to-[#5B21B6] text-white text-center">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-[#F5C451]">
            <SectorIcon name={iconName} className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-white/90">{fallbackTitle}</span>
        </div>
      )}
    </div>
  );
};
