import React, { useState } from 'react';
import { ArrowLeft, KeyRound, PlayCircle, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import {
  PHASE1_SECTORS,
  type AppRoute,
  type SectorCategoryGroup,
} from '../../data/phase1Sectors';
import { BASIT_OFFICIAL_LOGO_PNG } from '../BasitBrandMark';
import { PWAInstallButton } from '../PWAInstallButton';
import { SectorIcon } from './SectorIcon';
import { SectorMediaImage } from './SectorMediaImage';

interface SectorsHubViewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenAlAinWorld: () => void;
  onOpenAuthGate: () => void;
  onOpenAbout: () => void;
}

type FilterOption = 'all' | SectorCategoryGroup;

export const SectorsHubView: React.FC<SectorsHubViewProps> = ({
  onNavigate,
  onOpenAlAinWorld,
  onOpenAuthGate,
  onOpenAbout,
}) => {
  const [filter, setFilter] = useState<FilterOption>('all');

  const visibleSectors =
    filter === 'all'
      ? PHASE1_SECTORS
      : PHASE1_SECTORS.filter((s) => s.categoryGroup === filter);

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1633] dark:text-white">
            قطاعات منصة BASIT | باسط
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#5B5270] dark:text-slate-300 mt-1">
            اختر القطاع للانتقال إلى تجربته المستقلة الكاملة على الهاتف.
          </p>
        </div>

        <div
          role="group"
          aria-label="تصفية القطاعات"
          className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 shadow-2xs"
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
                : 'text-[#5B5270] dark:text-slate-300'
            }`}
          >
            الكل (<span className="tabular-nums">6</span>)
          </button>
          <button
            type="button"
            onClick={() => setFilter('consumer')}
            className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'consumer'
                ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
                : 'text-[#5B5270] dark:text-slate-300'
            }`}
          >
            الأفراد والمزايا
          </button>
          <button
            type="button"
            onClick={() => setFilter('operations')}
            className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'operations'
                ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
                : 'text-[#5B5270] dark:text-slate-300'
            }`}
          >
            الأعمال والمصانع
          </button>
        </div>
      </div>

      {/* 6 Visual Sector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleSectors.map((sector) => (
          <button
            key={sector.id}
            type="button"
            onClick={() => onNavigate(sector.id)}
            className="group text-start rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 shadow-2xs hover:shadow-md overflow-hidden flex flex-col transition-all cursor-pointer active:scale-[0.99]"
          >
            <SectorMediaImage
              src={sector.imageUrl}
              alt={sector.imageAltAr}
              fallbackTitle={sector.titleAr}
              iconName={sector.iconName}
              aspectClass="aspect-[4/3]"
            />
            <div className="p-4 flex-1 flex flex-col justify-between gap-3 w-full">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-latin text-[11px] font-extrabold tracking-wide text-[#4C1D95] dark:text-[#F5C451]">
                    {sector.codeEn}
                  </span>
                  <SectorIcon
                    name={sector.iconName}
                    className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0"
                  />
                </div>
                <h3 className="text-base font-black text-[#1E1633] dark:text-white">
                  {sector.titleAr}
                </h3>
                <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed line-clamp-2">
                  {sector.summaryAr}
                </p>
              </div>
              <div className="pt-2.5 border-t border-[#4C1D95]/8 dark:border-white/8 flex items-center justify-between text-xs font-extrabold text-[#3B0764] dark:text-[#F5C451]">
                <span>{sector.categoryLabelAr}</span>
                <span className="inline-flex items-center gap-1">
                  <span>فتح القطاع</span>
                  <ArrowLeft className="w-4 h-4" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Preserved Ancillary Gateways */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenAlAinWorld}
          className="min-h-[56px] p-4 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 text-start flex items-center justify-between gap-3 hover:border-[#4C1D95]/30 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#231938] text-[#4C1D95] dark:text-[#F5C451] flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-[#1E1633] dark:text-white">
                عالم الزوار ومطاعم العين
              </div>
              <div className="text-[11px] font-medium text-[#5B5270] dark:text-slate-300">
                دليل المطاعم، الكوبونات، والمجالس الفاخرة
              </div>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
        </button>

        <button
          type="button"
          onClick={onOpenAuthGate}
          className="min-h-[56px] p-4 rounded-2xl bg-[#3B0764] text-white text-start flex items-center justify-between gap-3 hover:bg-[#4C1D95] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/12 text-[#F5C451] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>بوابة الدخول والصلاحيات</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#F5C451]" />
              </div>
              <div className="text-[11px] text-[#EDE9FE]/80">
                حسابات الشركات والمصانع والمالك (محفوظة بالنظام)
              </div>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#F5C451] shrink-0" />
        </button>
      </div>

      {/* About BASIT, Welcome Video Replay & App Installation */}
      <div className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white p-1 border border-[#4C1D95]/15 shrink-0">
            <img
              src={BASIT_OFFICIAL_LOGO_PNG}
              alt="BASIT | باسط"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-[#1E1633] dark:text-white">
              عن BASIT | باسط والتثبيت على الهاتف
            </div>
            <div className="text-[11px] font-medium text-[#5B5270] dark:text-slate-300">
              إعادة مشاهدة الفيديو الترحيبي أو تثبيت التطبيق
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAbout}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/20 text-xs font-extrabold text-[#3B0764] dark:text-[#F5C451] flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>عن BASIT والفيديو</span>
          </button>
          <PWAInstallButton isRtl compact className="min-h-[40px]" />
        </div>
      </div>
    </div>
  );
};
