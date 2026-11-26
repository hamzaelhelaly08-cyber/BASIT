import React from 'react';

export const BASIT_OFFICIAL_LOGO_PNG =
  '/assets/aistudio/Gemini_Generated_Image_4760z64760z64760_08073fb5.jpg';
export const BASIT_IDENTITY_BOARD_IMG = BASIT_OFFICIAL_LOGO_PNG;

interface BasitBrandMarkProps {
  customLogoDataUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'purple' | 'yellow' | 'bilingual_banner';
  showBadgeWordmark?: boolean;
  isRtl?: boolean;
  onUploadLogo?: (dataUrl: string) => void;
  className?: string;
}

/**
 * Official BASIT | باسط Brand Mark component.
 * Renders the approved official BASIT | باسط logo on pure white floor with golden ambient lighting.
 */
export const BasitBrandMark: React.FC<BasitBrandMarkProps> = ({
  customLogoDataUrl,
  size = 'md',
  showBadgeWordmark = false,
  isRtl = true,
  className = '',
}) => {
  const sizeClass =
    size === 'xs'
      ? 'w-8 h-8 sm:w-9 sm:h-9 rounded-[11px] p-0.5'
      : size === 'sm'
        ? 'w-11 h-11 sm:w-12 sm:h-12 rounded-[15px] p-1'
        : size === 'md'
          ? 'w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] p-1'
          : size === 'lg'
            ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] p-1.5'
            : 'w-28 h-28 sm:w-32 sm:h-32 rounded-[26px] p-1.5';

  return (
    <div className="inline-flex items-center gap-3 shrink-0">
      <div
        className={`relative shrink-0 ${sizeClass} bg-white border border-[#FFD54F]/85 shadow-[0_8px_22px_rgba(234,179,8,0.38)] flex items-center justify-center overflow-hidden ${className}`}
      >
        <img
          src={customLogoDataUrl || BASIT_OFFICIAL_LOGO_PNG}
          alt="BASIT | باسط Official Logo"
          referrerPolicy="no-referrer"
          className="relative z-0 w-full h-full object-contain rounded-[inherit] bg-white scale-[1.03]"
        />
      </div>
      {showBadgeWordmark && (
        <div className="min-w-0 text-start">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-tight text-[#292333] dark:text-white">
              BASIT
            </span>
            <span className="text-xs font-extrabold text-[#62339A] dark:text-[#FFC928]">
              | باسط
            </span>
          </div>
          <span className="block text-[10px] font-bold text-[#64748B] dark:text-[#C4B5FD] truncate">
            {isRtl ? 'الهوية الرسمية المعتمدة' : 'Official Brand Identity'}
          </span>
        </div>
      )}
    </div>
  );
};
