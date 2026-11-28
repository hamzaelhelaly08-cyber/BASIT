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
      <div className="rounded-2xl bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] border border-[rgba(212,175,55,0.4)] p-2.5 shadow-md flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-[44px] px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/15 text-[#FFFFFF] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <BackIcon className="w-4 h-4 text-[#FFE875]" />
          <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('baset_card')}
          className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all max-w-full ${
            cardLoading
              ? 'bg-white/15 text-[#FFFDF7]'
              : cardActivated
                ? 'bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] text-[#240046] shadow-xs'
                : 'bg-[#1A052E] text-[#FFE875] border border-[rgba(212,175,55,0.55)] hover:bg-[#3B123F]'
          }`}
        >
          {cardActivated ? (
            <ShieldCheck className="w-4 h-4 text-[#240046] shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-[#FFE875] shrink-0" />
          )}
          <span className="leading-tight text-start">
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

      {/* 3-Destination Switcher Tabs on Crisp Milky Cream Surface */}
      <div
        role="tablist"
        aria-label={isRtl ? 'وجهات برنامج مزايا كارت باسط العائلي' : 'BASET Family Benefits Destinations'}
        className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] shadow-xs"
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
              className={`min-h-[48px] px-1.5 py-2 rounded-xl text-[11px] font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all min-w-0 leading-tight text-center ${
                active
                  ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] shadow-sm border border-[rgba(212,175,55,0.45)]'
                  : 'text-[#3B123F] dark:text-[#FFFDF7] hover:bg-[#FFFDF7] dark:hover:bg-[#1A052E]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#FFE875]' : 'text-[#5A189A] dark:text-[#FFE875]'}`} />
              <span className="leading-tight break-words">{isRtl ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
