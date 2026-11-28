import React from 'react';
import { ArrowRight, Info, Moon, ShoppingCart, Sun } from 'lucide-react';
import type { AppRoute } from '../../data/phase1Sectors';
import { BASIT_OFFICIAL_LOGO_PNG } from '../BasitBrandMark';

export type ExtendedAppRoute =
  | AppRoute
  | 'al_ain'
  | 'auth_gate'
  | 'owner_dashboard';

interface MobileHeaderProps {
  activeRoute: ExtendedAppRoute;
  titleAr: string;
  cartCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCart: () => void;
  onOpenAbout: () => void;
  onBack?: () => void;
  onNavigate: (route: ExtendedAppRoute) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeRoute,
  titleAr,
  cartCount,
  darkMode,
  onToggleDarkMode,
  onOpenCart,
  onOpenAbout,
  onBack,
  onNavigate,
}) => {
  const isRoot = activeRoute === 'home';

  return (
    <header className="sticky top-0 z-30 h-[56px] pt-safe bg-[#FAF8F5]/95 dark:bg-[#120D1D]/95 backdrop-blur-md border-b border-[#4C1D95]/10 dark:border-white/10">
      <div className="max-w-6xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
        {/* Zone 1: Back button on sub-screens OR Official BASIT Logo on Home */}
        <div className="flex items-center min-w-[44px] shrink-0">
          {!isRoot && onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="العودة"
              className="min-h-[44px] min-w-[44px] -ms-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[#3B0764] dark:text-[#F5C451] hover:bg-[#4C1D95]/8 dark:hover:bg-white/8 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-extrabold hidden sm:inline">رجوع</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="min-h-[44px] flex items-center gap-2 text-start cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="w-9 h-9 rounded-xl bg-white p-0.5 border border-[#4C1D95]/15 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={BASIT_OFFICIAL_LOGO_PNG}
                  alt="BASIT | باسط — الشعار الرسمي"
                  className="w-full h-full object-contain rounded-lg bg-white"
                />
              </span>
              <span className="text-base font-black text-[#3B0764] dark:text-white tracking-tight">
                BASIT <span className="text-[#EAB308]">|</span> باسط
              </span>
            </button>
          )}
        </div>

        {/* Zone 2: Mobile centered screen title + Desktop single-line navigation */}
        <div className="min-w-0 flex-1 flex items-center justify-center">
          {!isRoot && (
            <h1 className="md:hidden text-sm font-black text-[#1E1633] dark:text-white truncate">
              {titleAr}
            </h1>
          )}

          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-5 text-xs font-extrabold text-[#5B5270] dark:text-slate-300"
          >
            {(
              [
                { id: 'home', label: 'الرئيسية' },
                { id: 'marketplace', label: 'السوق' },
                { id: 'business', label: 'الأعمال' },
                { id: 'card', label: 'البطاقة' },
                { id: 'healthy', label: 'هيلثي' },
                { id: 'factory', label: 'المصانع' },
                { id: 'owner_finance', label: 'المالك' },
              ] as { id: ExtendedAppRoute; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeRoute === item.id
                    ? 'text-[#3B0764] dark:text-[#F5C451] underline underline-offset-8 decoration-2'
                    : 'hover:text-[#3B0764] dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Zone 3: About BASIT, Cart & Theme actions */}
        <div className="flex items-center justify-end gap-1 shrink-0">
          <button
            type="button"
            id="basit-header-about-btn"
            onClick={onOpenAbout}
            aria-label="عن BASIT"
            title="عن BASIT"
            className="min-h-[44px] min-w-[44px] px-2 rounded-xl flex items-center justify-center gap-1 text-[#3B0764] dark:text-[#F5C451] hover:bg-[#4C1D95]/8 dark:hover:bg-white/8 transition-colors cursor-pointer"
          >
            <Info className="w-5 h-5" strokeWidth={1.85} />
            <span className="hidden lg:inline text-xs font-extrabold">عن باسط</span>
          </button>

          <button
            type="button"
            id="basit-header-cart-btn"
            onClick={onOpenCart}
            aria-label="سلة المعاينة"
            className="relative min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#3B0764] dark:text-[#F5C451] hover:bg-[#4C1D95]/8 dark:hover:bg-white/8 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={1.85} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F5C451] text-[#2A0548] text-[10px] font-black flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            className="min-h-[44px] min-w-[44px] -me-1 rounded-xl flex items-center justify-center text-[#3B0764] dark:text-[#F5C451] hover:bg-[#4C1D95]/8 dark:hover:bg-white/8 transition-colors cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" strokeWidth={1.85} />
            ) : (
              <Moon className="w-5 h-5" strokeWidth={1.85} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
