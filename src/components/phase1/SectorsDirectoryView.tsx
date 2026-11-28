import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  PHASE1_SECTORS,
  type AppRoute,
  type SectorCategoryGroup,
} from '../../data/phase1Sectors';
import { SectorIcon } from './SectorIcon';
import { SectorMediaImage } from './SectorMediaImage';

interface SectorsDirectoryViewProps {
  onNavigate: (route: AppRoute) => void;
}

type FilterOption = 'all' | SectorCategoryGroup;

export const SectorsDirectoryView: React.FC<SectorsDirectoryViewProps> = ({
  onNavigate,
}) => {
  const [filter, setFilter] = useState<FilterOption>('all');

  const visibleSectors =
    filter === 'all'
      ? PHASE1_SECTORS
      : PHASE1_SECTORS.filter((sector) => sector.categoryGroup === filter);

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1633] dark:text-white">
            جميع قطاعات باسط
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#5B5270] dark:text-slate-300">
            ستة قطاعات مستقلة تغطي التجارة، الأعمال، البطاقة، الغذاء الصحي، والمصانع.
          </p>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div
          role="group"
          aria-label="تصفية القطاعات"
          className="inline-flex w-full sm:w-auto items-center gap-1 p-1 rounded-xl bg-[#EDE9FE]/70 dark:bg-[#1B132B] border border-[#4C1D95]/10 dark:border-white/10"
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial min-h-[44px] px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-[#3B0764] text-white shadow-xs dark:bg-[#F5C451] dark:text-[#2A0548]'
                : 'text-[#5B5270] dark:text-slate-300 hover:text-[#3B0764] dark:hover:text-white'
            }`}
          >
            الكل (<span className="tabular-nums">6</span>)
          </button>
          <button
            type="button"
            onClick={() => setFilter('consumer')}
            className={`flex-1 sm:flex-initial min-h-[44px] px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'consumer'
                ? 'bg-[#3B0764] text-white shadow-xs dark:bg-[#F5C451] dark:text-[#2A0548]'
                : 'text-[#5B5270] dark:text-slate-300 hover:text-[#3B0764] dark:hover:text-white'
            }`}
          >
            الخدمات اليومية
          </button>
          <button
            type="button"
            onClick={() => setFilter('operations')}
            className={`flex-1 sm:flex-initial min-h-[44px] px-2.5 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'operations'
                ? 'bg-[#3B0764] text-white shadow-xs dark:bg-[#F5C451] dark:text-[#2A0548]'
                : 'text-[#5B5270] dark:text-slate-300 hover:text-[#3B0764] dark:hover:text-white'
            }`}
          >
            الأعمال والتشغيل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleSectors.map((sector) => (
          <button
            key={sector.id}
            type="button"
            onClick={() => onNavigate(sector.id)}
            className="group text-start rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 shadow-xs hover:shadow-md overflow-hidden flex flex-col transition-all duration-200 cursor-pointer active:scale-[0.99]"
          >
            <SectorMediaImage
              src={sector.imageUrl}
              alt={sector.imageAltAr}
              fallbackTitle={sector.titleAr}
              iconName={sector.iconName}
              aspectClass="aspect-[4/3]"
            />

            <div className="p-4 flex-1 flex flex-col justify-between gap-3 w-full">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-latin text-[11px] font-extrabold tracking-wide text-[#4C1D95] dark:text-[#F5C451]">
                    {sector.codeEn}
                  </span>
                  <SectorIcon
                    name={sector.iconName}
                    className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0"
                  />
                </div>
                <h3 className="text-base font-extrabold text-[#1E1633] dark:text-white">
                  {sector.titleAr}
                </h3>
                <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed">
                  {sector.summaryAr}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#4C1D95]/8 dark:border-white/8 flex items-center justify-between text-xs font-bold text-[#3B0764] dark:text-[#F5C451]">
                <span>{sector.categoryLabelAr}</span>
                <span className="inline-flex items-center gap-1">
                  <span>دخول</span>
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
