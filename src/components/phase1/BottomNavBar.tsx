import React from 'react';
import {
  Home,
  ShoppingBag,
  Briefcase,
  CreditCard,
  LayoutGrid,
} from 'lucide-react';
import type { ExtendedAppRoute } from './MobileHeader';
import type { LanguageCode } from '../../data/phase1Data';

interface BottomNavBarProps {
  activeRoute: ExtendedAppRoute;
  lang: LanguageCode;
  onNavigate: (route: ExtendedAppRoute) => void;
}

interface NavTabItem {
  id: ExtendedAppRoute;
  labelAr: string;
  labelEn: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  matchRoutes: ExtendedAppRoute[];
}

const NAV_TABS: NavTabItem[] = [
  {
    id: 'home',
    labelAr: 'الرئيسية',
    labelEn: 'Home',
    icon: Home,
    matchRoutes: ['home'],
  },
  {
    id: 'marketplace',
    labelAr: 'السوق',
    labelEn: 'Market',
    icon: ShoppingBag,
    matchRoutes: ['marketplace'],
  },
  {
    id: 'business',
    labelAr: 'الأعمال',
    labelEn: 'Business',
    icon: Briefcase,
    matchRoutes: ['business'],
  },
  {
    id: 'card',
    labelAr: 'البطاقة',
    labelEn: 'Card',
    icon: CreditCard,
    matchRoutes: ['card'],
  },
  {
    id: 'sectors',
    labelAr: 'القطاعات',
    labelEn: 'Sectors',
    icon: LayoutGrid,
    matchRoutes: [
      'sectors',
      'healthy',
      'factory',
      'owner_finance',
      'al_ain',
      'auth_gate',
      'owner_dashboard',
    ],
  },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeRoute,
  lang,
  onNavigate,
}) => {
  const isRtl = lang === 'ar';

  return (
    <nav
      aria-label={isRtl ? 'شريط التنقل السفلي' : 'Bottom Tab Bar'}
      className="fixed bottom-0 inset-x-0 mx-auto max-w-[430px] z-40 bg-[rgba(255,255,255,0.96)] dark:bg-[rgba(26,5,46,0.96)] backdrop-blur-md border-t border-[rgba(212,175,55,0.45)] pb-safe shadow-[0_-8px_24px_-8px_rgba(36,0,70,0.16)]"
    >
      <div className="grid grid-cols-5 h-16 w-full">
        {NAV_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = tab.matchRoutes.includes(activeRoute);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 px-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-[#5A189A] dark:text-[#FFE875]'
                  : 'text-[#3B123F] dark:text-[#FFFDF7]/75 hover:text-[#5A189A] dark:hover:text-[#FFE875]'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 inset-x-3 h-[3px] rounded-b-full bg-[linear-gradient(90deg,#A855F7,#D4AF37,#FFE875)] shadow-[0_2px_10px_rgba(168,85,247,0.65)]"
                />
              )}
              <span
                className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] shadow-[0_4px_12px_-3px_rgba(168,85,247,0.55)] border border-[rgba(212,175,55,0.45)]'
                    : ''
                }`}
              >
                <IconComponent
                  className={`w-[19px] h-[19px] shrink-0 ${
                    isActive
                      ? 'text-[#FFE875]'
                      : 'text-[#5A189A] dark:text-[#D4AF37]'
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.9}
                />
              </span>
              <span
                className={`text-[10.5px] leading-none ${
                  isActive ? 'font-black' : 'font-bold'
                }`}
              >
                {isRtl ? tab.labelAr : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
