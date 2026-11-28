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
    <div className="space-y-5 pb-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-black text-[#240046] dark:text-[#FFFDF7]">
            قطاعات منصة BASIT | باسط
          </h2>
          <p className="text-xs font-medium text-[#3B123F] dark:text-[#FFFDF7]/80 mt-1">
            اختر القطاع للانتقال إلى تجربته المستقلة الكاملة على الهاتف.
          </p>
        </div>

        <div
          role="group"
          aria-label="تصفية القطاعات"
          className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] shadow-xs"
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`min-h-[44px] px-1.5 py-1.5 rounded-xl text-[11px] leading-tight text-center font-black transition-colors cursor-pointer flex items-center justify-center ${
              filter === 'all'
                ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-white shadow-xs'
                : 'text-[#3B123F] dark:text-[#FFFDF7]/85'
            }`}
          >
            <span>
              الكل (<span className="tabular-nums">6</span>)
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('consumer')}
            className={`min-h-[44px] px-1.5 py-1.5 rounded-xl text-[11px] leading-tight text-center font-black transition-colors cursor-pointer flex items-center justify-center ${
              filter === 'consumer'
                ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-white shadow-xs'
                : 'text-[#3B123F] dark:text-[#FFFDF7]/85'
            }`}
          >
            <span>الأفراد والمزايا</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('operations')}
            className={`min-h-[44px] px-1.5 py-1.5 rounded-xl text-[11px] leading-tight text-center font-black transition-colors cursor-pointer flex items-center justify-center ${
              filter === 'operations'
                ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-white shadow-xs'
                : 'text-[#3B123F] dark:text-[#FFFDF7]/85'
            }`}
          >
            <span>الأعمال والمصانع</span>
          </button>
        </div>
      </div>

      {/* 6 Visual Sector Cards inside 430px Mobile Shell */}
      <div className="grid grid-cols-1 gap-3.5">
        {visibleSectors.map((sector) => (
          <button
            key={sector.id}
            type="button"
            onClick={() => onNavigate(sector.id)}
            className="group text-start rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] shadow-xs hover:shadow-md overflow-hidden flex flex-col transition-all cursor-pointer active:scale-[0.99]"
          >
            <SectorMediaImage
              src={sector.imageUrl}
              alt={sector.imageAltAr}
              fallbackTitle={sector.titleAr}
              iconName={sector.iconName}
              aspectClass="aspect-[16/9]"
            />
            <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5 w-full">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-latin text-[11px] font-black tracking-wide text-[#5A189A] dark:text-[#FFE875]">
                    {sector.codeEn}
                  </span>
                  <SectorIcon
                    name={sector.iconName}
                    className="w-4 h-4 text-[#D4AF37] shrink-0"
                  />
                </div>
                <h3 className="text-sm font-black text-[#240046] dark:text-[#FFFDF7]">
                  {sector.titleAr}
                </h3>
                <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/80 leading-relaxed line-clamp-2">
                  {sector.summaryAr}
                </p>
              </div>
              <div className="pt-2.5 border-t border-[rgba(212,175,55,0.25)] flex items-center justify-between text-xs font-black text-[#5A189A] dark:text-[#FFE875]">
                <span>{sector.categoryLabelAr}</span>
                <span className="inline-flex items-center gap-1">
                  <span>فتح القطاع</span>
                  <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Preserved Ancillary Gateways */}
      <div className="grid grid-cols-1 gap-3 pt-1">
        <button
          type="button"
          onClick={onOpenAlAinWorld}
          className="min-h-[56px] p-3.5 rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] text-start flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.4)] text-[#5A189A] dark:text-[#FFE875] flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-[#240046] dark:text-[#FFFDF7]">
                عالم الزوار ومطاعم العين
              </div>
              <div className="text-[11px] font-medium text-[#3B123F] dark:text-[#FFFDF7]/75">
                دليل المطاعم، الكوبونات، والمجالس الفاخرة
              </div>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#D4AF37] shrink-0" />
        </button>

        <button
          type="button"
          onClick={onOpenAuthGate}
          className="min-h-[56px] p-3.5 rounded-2xl bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] text-white text-start flex items-center justify-between gap-3 border border-[rgba(212,175,55,0.45)] shadow-md cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/12 border border-[rgba(212,175,55,0.4)] text-[#FFE875] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-[#FFE875]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>بوابة الدخول والصلاحيات</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFE875] shrink-0" />
              </div>
              <div className="text-[11px] text-[#FFFDF7]/80">
                حسابات الشركات والمصانع والمالك (محفوظة بالنظام)
              </div>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#FFE875] shrink-0" />
        </button>
      </div>

      {/* About BASIT, Welcome Video Replay & App Installation */}
      <div className="rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] p-4 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white p-1 border border-[rgba(212,175,55,0.4)] shrink-0">
            <img
              src={BASIT_OFFICIAL_LOGO_PNG}
              alt="BASIT | باسط"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-[#240046] dark:text-[#FFFDF7]">
              عن BASIT | باسط والتثبيت على الهاتف
            </div>
            <div className="text-[11px] font-medium text-[#3B123F] dark:text-[#FFFDF7]/75">
              إعادة مشاهدة الفيديو الترحيبي أو تثبيت التطبيق
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAbout}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.45)] text-xs font-black text-[#5A189A] dark:text-[#FFE875] flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>عن BASIT والفيديو</span>
          </button>
          <PWAInstallButton isRtl compact className="min-h-[44px]" />
        </div>
      </div>
    </div>
  );
};
