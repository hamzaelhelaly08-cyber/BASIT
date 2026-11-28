import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import {
  PHASE1_SECTORS,
  getSectorById,
  type AppRoute,
  type SectorId,
} from '../../data/phase1Sectors';
import { SectorIcon } from './SectorIcon';
import { SectorMediaImage } from './SectorMediaImage';

interface SectorDetailViewProps {
  sectorId: SectorId;
  onNavigate: (route: AppRoute) => void;
}

type SectorTab = 'overview' | 'scope' | 'roadmap';

export const SectorDetailView: React.FC<SectorDetailViewProps> = ({
  sectorId,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<SectorTab>('overview');
  const sector = getSectorById(sectorId);

  const currentIndex = PHASE1_SECTORS.findIndex((s) => s.id === sectorId);
  const prevSector =
    PHASE1_SECTORS[
      (currentIndex - 1 + PHASE1_SECTORS.length) % PHASE1_SECTORS.length
    ];
  const nextSector =
    PHASE1_SECTORS[(currentIndex + 1) % PHASE1_SECTORS.length];

  return (
    <div className="space-y-6 pb-8">
      {/* Standalone Sector Hero Banner */}
      <section aria-label={sector.titleAr}>
        <div className="relative rounded-3xl overflow-hidden bg-[#3B0764] shadow-md min-h-[228px] sm:min-h-[280px] flex flex-col justify-end">
          <div className="absolute inset-0">
            <SectorMediaImage
              src={sector.imageUrl}
              alt={sector.imageAltAr}
              fallbackTitle={sector.titleAr}
              iconName={sector.iconName}
              aspectClass="h-full w-full"
              eager
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#1A0430]/95 via-[#3B0764]/65 to-[#3B0764]/20"
          />
          <div className="relative z-10 p-5 sm:p-7 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#F5C451]">
              <SectorIcon name={sector.iconName} className="w-4 h-4 shrink-0" />
              <span className="font-latin tracking-wide">{sector.codeEn}</span>
              <span aria-hidden="true">·</span>
              <span>{sector.categoryLabelAr}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              {sector.titleAr}
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE9FE]/90 max-w-2xl leading-relaxed">
              {sector.summaryAr}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Segmented Tabs */}
      <div
        role="tablist"
        aria-label="أقسام صفحة القطاع"
        className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#EDE9FE]/75 dark:bg-[#1B132B] border border-[#4C1D95]/10 dark:border-white/10"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#3B0764] text-white shadow-xs dark:bg-[#F5C451] dark:text-[#2A0548]'
              : 'text-[#5B5270] dark:text-slate-300 hover:text-[#3B0764] dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5 shrink-0" strokeWidth={1.85} />
          <span>نظرة عامة</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'scope'}
          onClick={() => setActiveTab('scope')}
          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'scope'
              ? 'bg-[#3B0764] text-white shadow-xs dark:bg-[#F5C451] dark:text-[#2A0548]'
              : 'text-[#5B5270] dark:text-slate-300 hover:text-[#3B0764] dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" strokeWidth={1.85} />
          <span>نطاق الخدمة</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'roadmap'}
          onClick={() => setActiveTab('roadmap')}
          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'bg-[#3B0764] text-white shadow-xs dark:bg-[#F5C451] dark:text-[#2A0548]'
              : 'text-[#5B5270] dark:text-slate-300 hover:text-[#3B0764] dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.85} />
          <span>القادم</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <section className="rounded-3xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 p-5 sm:p-6 shadow-xs">
        {activeTab === 'overview' && (
          <div className="divide-y divide-[#4C1D95]/10 dark:divide-white/10">
            {sector.overviewPoints.map((point, idx) => (
              <div
                key={point.titleAr}
                className={`${idx === 0 ? 'pb-4' : idx === sector.overviewPoints.length - 1 ? 'pt-4' : 'py-4'} space-y-1.5`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#4C1D95] dark:text-[#F5C451]">
                  <span className="tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{sector.subtitleAr}</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1E1633] dark:text-white">
                  {point.titleAr}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B5270] dark:text-slate-300 leading-relaxed">
                  {point.descAr}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'scope' && (
          <div className="divide-y divide-[#4C1D95]/10 dark:divide-white/10">
            {sector.operationalScope.map((item, idx) => (
              <div
                key={item.titleAr}
                className={`${idx === 0 ? 'pb-4' : 'pt-4'} space-y-1.5`}
              >
                <h3 className="text-sm sm:text-base font-extrabold text-[#1E1633] dark:text-white">
                  {item.titleAr}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B5270] dark:text-slate-300 leading-relaxed">
                  {item.descAr}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1E1633] dark:text-white">
                تجهيز المراحل التالية لهذا القطاع
              </h3>
              <p className="text-xs text-[#5B5270] dark:text-slate-300">
                هذه الصفحة هي التأسيس الهيكلي للمرحلة الأولى دون ربط قواعد بيانات أو عمليات مالية حاليًا.
              </p>
            </div>
            <ul className="space-y-3 pt-2 border-t border-[#4C1D95]/10 dark:border-white/10">
              {sector.nextPhaseNotes.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1E1633] dark:text-slate-200 leading-relaxed"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0 mt-0.5"
                    strokeWidth={1.85}
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Seamless Sector-to-Sector Navigation */}
      <nav
        aria-label="التنقل بين القطاعات"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            onNavigate(prevSector.id);
          }}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-white/10 text-start flex items-center justify-between gap-2 hover:border-[#4C1D95]/35 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ArrowRight
              className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0"
              strokeWidth={2}
            />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-[#5B5270] dark:text-slate-400">
                القطاع السابق
              </span>
              <span className="block text-xs font-extrabold text-[#1E1633] dark:text-white truncate">
                {prevSector.titleAr}
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('sectors')}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#EDE9FE]/70 dark:bg-[#231938] text-[#3B0764] dark:text-[#F5C451] text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-[#EDE9FE] dark:hover:bg-[#2C2046] transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4 shrink-0" strokeWidth={1.85} />
          <span>جميع القطاعات</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            onNavigate(nextSector.id);
          }}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#3B0764] hover:bg-[#4C1D95] text-white text-start flex items-center justify-between gap-2 transition-colors cursor-pointer"
        >
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-[#F5C451]">
              القطاع التالي
            </span>
            <span className="block text-xs font-extrabold text-white truncate">
              {nextSector.titleAr}
            </span>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#F5C451] shrink-0" strokeWidth={2} />
        </button>
      </nav>
    </div>
  );
};
