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
    <div className="space-y-5 pb-8">
      {/* Standalone Sector Hero Banner */}
      <section aria-label={sector.titleAr}>
        <div className="relative rounded-[24px] overflow-hidden bg-[#240046] border border-[rgba(212,175,55,0.45)] shadow-md min-h-[228px] flex flex-col justify-end">
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
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,5,46,0.96),rgba(36,0,70,0.72),rgba(26,5,46,0.25))]"
          />
          <div className="relative z-10 p-4 text-[#FFFFFF] space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#FFE875]">
              <SectorIcon name={sector.iconName} className="w-4 h-4 text-[#FFE875] shrink-0" />
              <span className="font-latin tracking-wide">{sector.codeEn}</span>
              <span aria-hidden="true">·</span>
              <span>{sector.categoryLabelAr}</span>
            </div>
            <h2 className="text-xl font-black leading-tight text-[#FFFFFF]">
              {sector.titleAr}
            </h2>
            <p className="text-xs text-[#FFFDF7]/90 leading-relaxed">
              {sector.summaryAr}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Segmented Tabs */}
      <div
        role="tablist"
        aria-label="أقسام صفحة القطاع"
        className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          className={`min-h-[44px] px-1.5 py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer leading-tight text-center ${
            activeTab === 'overview'
              ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] shadow-xs border border-[rgba(212,175,55,0.45)]'
              : 'text-[#3B123F] dark:text-[#FFFDF7]'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'overview' ? 'text-[#FFE875]' : 'text-[#5A189A] dark:text-[#FFE875]'}`} strokeWidth={1.85} />
          <span>نظرة عامة</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'scope'}
          onClick={() => setActiveTab('scope')}
          className={`min-h-[44px] px-1.5 py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer leading-tight text-center ${
            activeTab === 'scope'
              ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] shadow-xs border border-[rgba(212,175,55,0.45)]'
              : 'text-[#3B123F] dark:text-[#FFFDF7]'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'scope' ? 'text-[#FFE875]' : 'text-[#5A189A] dark:text-[#FFE875]'}`} strokeWidth={1.85} />
          <span>نطاق الخدمة</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'roadmap'}
          onClick={() => setActiveTab('roadmap')}
          className={`min-h-[44px] px-1.5 py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer leading-tight text-center ${
            activeTab === 'roadmap'
              ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] shadow-xs border border-[rgba(212,175,55,0.45)]'
              : 'text-[#3B123F] dark:text-[#FFFDF7]'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'roadmap' ? 'text-[#FFE875]' : 'text-[#5A189A] dark:text-[#FFE875]'}`} strokeWidth={1.85} />
          <span>القادم</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <section className="rounded-3xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] p-4 shadow-xs">
        {activeTab === 'overview' && (
          <div className="divide-y divide-[rgba(212,175,55,0.25)]">
            {sector.overviewPoints.map((point, idx) => (
              <div
                key={point.titleAr}
                className={`${idx === 0 ? 'pb-4' : idx === sector.overviewPoints.length - 1 ? 'pt-4' : 'py-4'} space-y-1.5`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#5A189A] dark:text-[#FFE875]">
                  <span className="tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{sector.subtitleAr}</span>
                </div>
                <h3 className="text-sm font-extrabold text-[#240046] dark:text-[#FFFFFF]">
                  {point.titleAr}
                </h3>
                <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85 leading-relaxed">
                  {point.descAr}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'scope' && (
          <div className="divide-y divide-[rgba(212,175,55,0.25)]">
            {sector.operationalScope.map((item, idx) => (
              <div
                key={item.titleAr}
                className={`${idx === 0 ? 'pb-4' : 'pt-4'} space-y-1.5`}
              >
                <h3 className="text-sm font-extrabold text-[#240046] dark:text-[#FFFFFF]">
                  {item.titleAr}
                </h3>
                <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85 leading-relaxed">
                  {item.descAr}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#240046] dark:text-[#FFFFFF]">
                تجهيز المراحل التالية لهذا القطاع
              </h3>
              <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85">
                هذه الصفحة هي التأسيس الهيكلي للمرحلة الأولى دون ربط قواعد بيانات أو عمليات مالية حاليًا.
              </p>
            </div>
            <ul className="space-y-3 pt-2 border-t border-[rgba(212,175,55,0.3)]">
              {sector.nextPhaseNotes.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2.5 text-xs text-[#240046] dark:text-[#FFFDF7] leading-relaxed"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5"
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
        className="grid grid-cols-1 gap-2.5"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            onNavigate(prevSector.id);
          }}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] text-start flex items-center justify-between gap-2 hover:border-[#5A189A] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ArrowRight
              className="w-4 h-4 text-[#5A189A] dark:text-[#FFE875] shrink-0"
              strokeWidth={2}
            />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-[#3B123F] dark:text-[#FFE875]">
                القطاع السابق
              </span>
              <span className="block text-xs font-extrabold text-[#240046] dark:text-[#FFFFFF] truncate">
                {prevSector.titleAr}
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('sectors')}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.45)] text-[#5A189A] dark:text-[#FFE875] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] border border-[rgba(212,175,55,0.45)] text-[#FFFFFF] text-start flex items-center justify-between gap-2 transition-colors cursor-pointer"
        >
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-[#FFE875]">
              القطاع التالي
            </span>
            <span className="block text-xs font-extrabold text-[#FFFFFF] truncate">
              {nextSector.titleAr}
            </span>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#FFE875] shrink-0" strokeWidth={2} />
        </button>
      </nav>
    </div>
  );
};
