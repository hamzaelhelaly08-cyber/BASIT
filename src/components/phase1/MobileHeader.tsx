import React from 'react';
import { ArrowLeft, ArrowRight, Globe, Info, Moon, ShoppingCart, Sun } from 'lucide-react';
import type { AppRoute } from '../../data/phase1Sectors';
import type { LanguageCode } from '../../data/phase1Data';
import { BASIT_OFFICIAL_LOGO_PNG } from '../BasitBrandMark';

export type ExtendedAppRoute =
  | AppRoute
  | 'al_ain'
  | 'auth_gate'
  | 'owner_dashboard';

interface MobileHeaderProps {
  activeRoute: ExtendedAppRoute;
  titleAr: string;
  titleEn?: string;
  lang: LanguageCode;
  cartCount: number;
  darkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onOpenCart: () => void;
  onOpenAbout: () => void;
  onBack?: () => void;
  onNavigate: (route: ExtendedAppRoute) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeRoute,
  titleAr,
  titleEn,
  lang,
  cartCount,
  darkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onOpenCart,
  onOpenAbout,
  onBack,
  onNavigate,
}) => {
  const isRoot = activeRoute === 'home';
  const isRtl = lang === 'ar';
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const displayTitle = isRtl ? titleAr : titleEn || titleAr;

  return (
    <header className="sticky top-0 z-30 min-h-[54px] pt-safe bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(26,5,46,0.95)] backdrop-blur-md border-b border-[rgba(212,175,55,0.4)]">
      <div className="w-full h-[54px] px-2 flex items-center justify-between gap-1">
        {/* Zone 1: Back button on sub-screens OR Official BASIT Logo on Home */}
        <div className="flex items-center min-w-[44px] shrink-0">
          {!isRoot && onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={isRtl ? 'العودة' : 'Back'}
              className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#5A189A] dark:text-[#FFE875] hover:bg-[#5A189A]/8 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <BackArrow className="w-5 h-5" strokeWidth={2.2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              aria-label="BASIT | باسط"
              className="min-h-[44px] flex items-center gap-1.5 text-start cursor-pointer shrink-0 px-0.5"
            >
              <span className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 rounded-xl bg-white p-0.5 border border-[rgba(212,175,55,0.45)] shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={BASIT_OFFICIAL_LOGO_PNG}
                  alt="BASIT | باسط — الشعار الرسمي"
                  className="w-full h-full object-contain rounded-lg bg-white"
                />
              </span>
              <span className="text-xs min-[360px]:text-sm font-black text-[#240046] dark:text-[#FFFDF7] tracking-tight leading-none whitespace-nowrap">
                BASIT <span className="hidden min-[370px]:inline"><span className="text-[#D4AF37]">|</span> باسط</span>
              </span>
            </button>
          )}
        </div>

        {/* Zone 2: Concise Screen Title on sub-screens */}
        <div className="min-w-0 flex-1 flex items-center justify-center px-0.5">
          {!isRoot && (
            <h1 className="text-xs min-[360px]:text-[13px] font-black text-[#240046] dark:text-[#FFFDF7] text-center leading-tight line-clamp-1">
              {displayTitle}
            </h1>
          )}
        </div>

        {/* Zone 3: Language Switcher, About, Cart & Theme Toggle (>= 44x44px hitboxes) */}
        <div className="flex items-center justify-end gap-0 shrink-0">
          <button
            type="button"
            id="basit-header-lang-btn"
            onClick={onToggleLanguage}
            aria-label={isRtl ? 'Switch to English' : 'التبديل للعربية'}
            title={isRtl ? 'EN' : 'AR'}
            className="min-h-[44px] min-w-[44px] px-1 rounded-xl flex items-center justify-center gap-0.5 text-[#3B123F] dark:text-[#FFE875] hover:bg-[#5A189A]/8 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#5A189A] dark:text-[#D4AF37] shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-black leading-none">{isRtl ? 'EN' : 'ع'}</span>
          </button>

          <button
            type="button"
            id="basit-header-about-btn"
            onClick={onOpenAbout}
            aria-label={isRtl ? 'عن BASIT' : 'About BASIT'}
            title={isRtl ? 'عن BASIT' : 'About BASIT'}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#5A189A] dark:text-[#FFE875] hover:bg-[#5A189A]/8 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Info className="w-[19px] h-[19px]" strokeWidth={2} />
          </button>

          <button
            type="button"
            id="basit-header-cart-btn"
            onClick={onOpenCart}
            aria-label={isRtl ? 'سلة المعاينة' : 'Preview Cart'}
            className="relative min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#5A189A] dark:text-[#FFE875] hover:bg-[#5A189A]/8 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-[19px] h-[19px]" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[linear-gradient(135deg,#FFE875,#D4AF37)] text-[#240046] text-[10px] font-black flex items-center justify-center tabular-nums shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#3B123F] dark:text-[#FFE875] hover:bg-[#5A189A]/8 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-[19px] h-[19px] text-[#FFE875]" strokeWidth={2} />
            ) : (
              <Moon className="w-[19px] h-[19px] text-[#5A189A]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
