import React from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import {
  PHASE1_SECTORS,
  type AppRoute,
  type BasitSectorDefinition,
} from '../../data/phase1Sectors';
import { SectorIcon } from './SectorIcon';
import { SectorMediaImage } from './SectorMediaImage';

interface HomeScreenViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  onNavigate,
}) => {
  const heroSector = PHASE1_SECTORS[1]; // BASIT BUSINESS catering showcase
  const cardSector = PHASE1_SECTORS[2]; // BASIT CARD

  return (
    <div className="space-y-8 pb-6">
      {/* 1. Primary Focal Hero Showcase */}
      <section aria-label="الواجهة الرئيسية لمنصة باسط">
        <div className="relative rounded-3xl overflow-hidden bg-[#3B0764] shadow-md min-h-[248px] sm:min-h-[300px] flex flex-col justify-end">
          <img
            src={heroSector.imageUrl}
            alt="خدمات الإعاشة والضيافة من الشركة الوطنية اللوجستية"
            loading="eager"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#1E0538]/95 via-[#3B0764]/68 to-[#3B0764]/25"
          />
          <div className="relative z-10 p-5 sm:p-8 text-white">
            <div className="max-w-xl space-y-2.5">
              <p className="text-xs font-bold text-[#F5C451]">
                الشركة الوطنية اللوجستية · المرحلة الأولى
              </p>
              <h2 className="text-xl sm:text-3xl font-black leading-snug">
                منظومة BASIT | باسط للخدمات المتكاملة
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#EDE9FE]/90 leading-relaxed">
                تجربة تطبيق موبايل مصممة من الصفر لربط التجارة، الأعمال، البطاقة،
                الغذاء الصحي، وأنظمة التشغيل.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('sectors')}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F5C451] hover:bg-[#EAB308] active:scale-[0.98] text-[#2A0548] text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>استعراض القطاعات الستة</span>
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. All 6 Sectors Navigation Grid */}
      <section aria-labelledby="home-sectors-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <h2
              id="home-sectors-heading"
              className="text-lg sm:text-xl font-black text-[#1E1633] dark:text-white"
            >
              قطاعات منصة باسط
            </h2>
            <p className="text-xs font-medium text-[#5B5270] dark:text-slate-300">
              اختر القطاع للدخول إلى صفحته المستقلة
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sectors')}
            className="min-h-[44px] px-3 text-xs font-bold text-[#4C1D95] dark:text-[#F5C451] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PHASE1_SECTORS.map((sector: BasitSectorDefinition, index: number) => (
            <button
              key={sector.id}
              type="button"
              onClick={() => onNavigate(sector.id)}
              className="group text-start rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 shadow-xs hover:shadow-md hover:border-[#4C1D95]/30 dark:hover:border-[#F5C451]/40 overflow-hidden flex flex-col transition-all duration-200 cursor-pointer active:scale-[0.99]"
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
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#5B5270] dark:text-slate-400">
                    <span className="tabular-nums">
                      {String(index + 1).padStart(2, '0')} · {sector.categoryLabelAr}
                    </span>
                    <SectorIcon
                      name={sector.iconName}
                      className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0"
                    />
                  </div>

                  <p className="font-latin text-[11px] font-extrabold tracking-wide text-[#4C1D95] dark:text-[#F5C451]">
                    {sector.codeEn}
                  </p>
                  <h3 className="text-base font-extrabold text-[#1E1633] dark:text-white leading-snug">
                    {sector.titleAr}
                  </h3>
                  <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed line-clamp-2">
                    {sector.subtitleAr}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#4C1D95]/8 dark:border-white/8 flex items-center justify-between text-xs font-bold text-[#3B0764] dark:text-[#F5C451]">
                  <span>فتح صفحة القطاع</span>
                  <ArrowLeft
                    className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                    strokeWidth={2}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured BASIT CARD Spotlight */}
      <section aria-label="بطاقة باسط المميزة">
        <div className="rounded-3xl bg-[#3B0764] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F5C451]/15 border border-[#F5C451]/35 text-[#F5C451] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" strokeWidth={1.85} />
            </div>
            <div className="space-y-1">
              <p className="font-latin text-[11px] font-extrabold tracking-wide text-[#F5C451]">
                {cardSector.codeEn}
              </p>
              <h3 className="text-base font-extrabold text-white">
                {cardSector.titleAr} — مزايا حصرية للأعضاء والعائلات
              </h3>
              <p className="text-xs text-[#EDE9FE]/85 leading-relaxed">
                {cardSector.summaryAr}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('card')}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F5C451] hover:bg-[#EAB308] active:scale-[0.98] text-[#2A0548] text-xs font-extrabold inline-flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>تصفح البطاقة</span>
            <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>
      </section>
    </div>
  );
};
