import React from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { LanguageCode } from '../data/phase1Data';
import type { BasetCardRecord } from '../services/basetBenefitsService';

export type BasetProgramTab =
  | 'baset_food_benefits'
  | 'baset_family_entertainment'
  | 'baset_card';

interface BasetBenefitsHeaderNavProps {
  lang: LanguageCode;
  activeTab: BasetProgramTab;
  cardActivated: boolean;
  cardLoading?: boolean;
  card?: BasetCardRecord | null;
  onNavigateTab: (tab: BasetProgramTab) => void;
  onBackHome: () => void;
}

export const BasetBenefitsHeaderNav: React.FC<BasetBenefitsHeaderNavProps> = ({
  lang,
  activeTab,
  cardActivated,
  cardLoading = false,
  card,
  onNavigateTab,
  onBackHome,
}) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const tabs: {
    id: BasetProgramTab;
    labelAr: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'baset_food_benefits',
      labelAr: 'وجبات باسط',
      labelEn: 'Food Offers',
      icon: UtensilsCrossed,
    },
    {
      id: 'baset_family_entertainment',
      labelAr: 'ترفيه العائلة',
      labelEn: 'Family Fun',
      icon: Sparkles,
    },
    {
      id: 'baset_card',
      labelAr: 'كارت باسط',
      labelEn: 'BASET Card',
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Top Status + Back Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#5B21B6] p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-[40px] px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <BackIcon className="w-4 h-4 text-[#F5C451]" />
          <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('baset_card')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all ${
            cardLoading
              ? 'bg-white/15 text-[#EDE9FE]'
              : cardActivated
                ? 'bg-[#F5C451] text-[#2A0E4D] shadow-xs'
                : 'bg-[#2A1459] text-[#F5C451] border border-[#F5C451]/50 hover:bg-[#3B0764]'
          }`}
        >
          {cardActivated ? (
            <ShieldCheck className="w-4 h-4 text-[#2A0E4D] shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-[#F5C451] shrink-0" />
          )}
          <span className="truncate">
            {cardLoading
              ? isRtl
                ? 'جاري التحقق من الكارت...'
                : 'Checking Card...'
              : cardActivated
                ? isRtl
                  ? `مفعّل (10%) · ${card?.cardNumber.slice(-4) || 'VIP'}`
                  : `Active (10%) · ${card?.cardNumber.slice(-4) || 'VIP'}`
                : isRtl
                  ? 'غير مفعّل — فعّل خصم 10%'
                  : 'Inactive — Activate 10%'}
          </span>
        </button>
      </div>

      {/* 3-Destination Switcher Tabs on Calm Ivory Surface */}
      <div
        role="tablist"
        aria-label={isRtl ? 'وجهات برنامج مزايا كارت باسط العائلي' : 'BASET Family Benefits Destinations'}
        className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-[#C084FC]/20 shadow-xs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onNavigateTab(tab.id)}
              className={`min-h-[44px] px-2 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all min-w-0 ${
                active
                  ? 'bg-[#4C1D95] text-white shadow-xs'
                  : 'text-[#4C1D95] dark:text-[#EDE9FE] hover:bg-[#F5F3FF] dark:hover:bg-[#241B38]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#F5C451]' : 'text-[#4C1D95] dark:text-[#F5C451]'}`} />
              <span className="truncate">{isRtl ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
