import React from 'react';
import {
  Home,
  ShoppingBag,
  Briefcase,
  CreditCard,
  LayoutGrid,
} from 'lucide-react';
import type { ExtendedAppRoute } from './MobileHeader';

interface BottomNavBarProps {
  activeRoute: ExtendedAppRoute;
  onNavigate: (route: ExtendedAppRoute) => void;
}

interface NavTabItem {
  id: ExtendedAppRoute;
  labelAr: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  matchRoutes: ExtendedAppRoute[];
}

const NAV_TABS: NavTabItem[] = [
  {
    id: 'home',
    labelAr: 'الرئيسية',
    icon: Home,
    matchRoutes: ['home'],
  },
  {
    id: 'marketplace',
    labelAr: 'السوق',
    icon: ShoppingBag,
    matchRoutes: ['marketplace'],
  },
  {
    id: 'business',
    labelAr: 'الأعمال',
    icon: Briefcase,
    matchRoutes: ['business'],
  },
  {
    id: 'card',
    labelAr: 'البطاقة',
    icon: CreditCard,
    matchRoutes: ['card'],
  },
  {
    id: 'sectors',
    labelAr: 'القطاعات',
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
  onNavigate,
}) => {
  return (
    <nav
      aria-label="شريط التنقل السفلي"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-[#1B132B]/95 backdrop-blur-md border-t border-[#4C1D95]/12 dark:border-white/10 pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {NAV_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = tab.matchRoutes.includes(activeRoute);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative min-h-[44px] flex flex-col items-center justify-center gap-1 px-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#3B0764] dark:text-[#F5C451]'
                  : 'text-[#5B5270] dark:text-slate-400 hover:text-[#3B0764] dark:hover:text-white'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 inset-x-4 h-0.5 rounded-b-full bg-[#3B0764] dark:bg-[#F5C451]"
                />
              )}
              <IconComponent
                className="w-[21px] h-[21px] shrink-0"
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="text-[11px] font-bold leading-none whitespace-nowrap">
                {tab.labelAr}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
