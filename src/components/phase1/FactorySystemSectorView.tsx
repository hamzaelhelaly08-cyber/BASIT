import React, { useMemo, useState } from 'react';
import {
  Factory,
  ChefHat,
  Clock,
  ShieldCheck,
  MapPin,
  PackageCheck,
  ArrowLeft,
  CalendarClock,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import {
  EIGHT_CATERING_MENUS,
  THREE_CENTRAL_KITCHENS,
  type CentralKitchenId,
  type LanguageCode,
  type OrganizedCateringMenu,
} from '../../data/phase1Data';
import { FRESH_WORLD_PRODUCTS } from '../../data/freshWorldData';
import factoryHeroImg from '../../assets/images/sector_factory_system_1795835811281.jpg';
import type { Phase1CartItem } from '../Phase1CartDrawer';
import { HabeGermanMarketPortal } from '../HabeGermanMarketPortal';

interface FactorySystemSectorViewProps {
  lang: LanguageCode;
  currencyLabel: string;
  onSelectKitchen: (id: CentralKitchenId) => void;
  onSelectMenu: (menu: OrganizedCateringMenu) => void;
  onRequestFactoryQuote: () => void;
  onAddToCart: (item: Omit<Phase1CartItem, 'quantity'>) => void;
  onShowToast: (msg: string) => void;
}

type FactoryTab = 'lines' | 'kitchens' | 'shifts' | 'habe_portal';

const FACTORY_SHIFT_BLOCKS = [
  {
    id: 'shift_morning',
    nameAr: 'الوردية الصباحية الأولى',
    windowAr: '06:30 ص — 09:00 ص',
    focusAr: 'وجبات إفطار وسندوتشات طازجة + مشروبات ساخنة',
  },
  {
    id: 'shift_midday',
    nameAr: 'وردية الغداء الرئيسية',
    windowAr: '12:30 م — 03:30 م',
    focusAr: 'وجبات مصانع حرارية محكمة الغلق مطابقة لمعايير HACCP',
  },
  {
    id: 'shift_night',
    nameAr: 'الوردية الليلية',
    windowAr: '09:30 م — 12:00 ص',
    focusAr: 'عبوات جاهزة للتسخين الفوري بالميكرويف مع حفظ حراري',
  },
];

export const FactorySystemSectorView: React.FC<FactorySystemSectorViewProps> = ({
  lang,
  currencyLabel,
  onSelectKitchen,
  onSelectMenu,
  onRequestFactoryQuote,
  onAddToCart,
  onShowToast,
}) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<FactoryTab>('lines');

  const workersMenu = useMemo(
    () =>
      EIGHT_CATERING_MENUS.find((m) => m.id === 'menu_workers') ||
      EIGHT_CATERING_MENUS[0],
    []
  );

  const factoryMealPacks = useMemo(
    () =>
      FRESH_WORLD_PRODUCTS.filter(
        (p) =>
          p.id === 'fw_factory_microwavable_box' ||
          p.id === 'fw_microwave_variety_pack'
      ),
    []
  );

  return (
    <div className="space-y-6 pb-8">
      {/* 16:9 Factory Operations Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-[#3B0764] shadow-md min-h-[236px] sm:min-h-[270px] flex flex-col justify-end">
        <img
          src={factoryHeroImg}
          alt={isRtl ? 'نظام المصانع والإعاشة الصناعية' : 'Factory System'}
          loading="eager"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#1A0430]/95 via-[#2E0854]/85 to-[#1A0430]/55"
        />
        <div className="relative z-10 p-5 sm:p-7 text-white space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#F5C451]">
            <Factory className="w-4 h-4 shrink-0" />
            <span className="font-latin tracking-wide">FACTORY SYSTEM</span>
            <span aria-hidden="true">·</span>
            <span>{isRtl ? 'تغذية خطوط الإنتاج' : 'Industrial Catering'}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black leading-tight">
            {isRtl ? 'نظام المصانع والورديات المركزية' : 'Factory Catering & Shifts System'}
          </h2>
          <p className="text-xs sm:text-sm text-[#EDE9FE]/90 max-w-2xl leading-relaxed">
            {isRtl
              ? 'تشغيل خطوط إعاشة المصانع في مدينة بدر والعاصمة الإدارية والشروق عبر 3 مطابخ مركزية معتمدة.'
              : 'End-to-end industrial meal production across Badr City, New Capital, and El Shorouk via 3 certified central kitchens.'}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onRequestFactoryQuote}
              className="min-h-[44px] px-4 py-2 rounded-xl basit-glass-btn-yellow text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isRtl ? 'طلب تعاقد مصنع / شركة' : 'Request Factory Contract'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMenu(workersMenu)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
            >
              <span>{isRtl ? 'استعراض منيو العمالة' : 'View Workforce Menu'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sub-navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 shadow-2xs">
        {(
          [
            { id: 'lines', label: isRtl ? 'الوجبات والخطوط' : 'Meal Packs' },
            { id: 'kitchens', label: isRtl ? 'المطابخ الـ 3' : '3 Kitchens' },
            { id: 'shifts', label: isRtl ? 'جداول الورديات' : 'Shift Grid' },
            { id: 'habe_portal', label: isRtl ? 'بوابة Ha-Be' : 'Ha-Be Portal' },
          ] as { id: FactoryTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
                : 'text-[#5B5270] dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Meal Packs & Workforce Menu */}
      {activeTab === 'lines' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {factoryMealPacks.map((pack) => (
              <div
                key={pack.id}
                className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 overflow-hidden shadow-2xs flex flex-col"
              >
                <div className="aspect-[16/9] bg-[#F5F3FF] overflow-hidden">
                  <img
                    src={pack.imageUrl}
                    alt={isRtl ? pack.nameAr : pack.nameEn}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#4C1D95] dark:text-[#F5C451]">
                      {isRtl ? pack.unitAr : pack.unitEn}
                    </span>
                    <h3 className="text-sm font-black text-[#1E1633] dark:text-white">
                      {isRtl ? pack.nameAr : pack.nameEn}
                    </h3>
                    <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed">
                      {isRtl ? pack.subtitleAr : pack.subtitleEn}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-[#4C1D95]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-sm font-black text-[#3B0764] dark:text-[#F5C451] tabular-nums">
                      {pack.priceEgp} {currencyLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onAddToCart({
                          id: pack.id,
                          nameAr: pack.nameAr,
                          nameEn: pack.nameEn,
                          kitchenNameAr: 'نظام المصانع · باسط',
                          kitchenNameEn: 'BASIT Factory System',
                          approvedPrice: pack.priceEgp,
                          imageUrl: pack.imageUrl,
                        })
                      }
                      className="min-h-[40px] px-3.5 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-[#F5C451]" />
                      <span>{isRtl ? 'إضافة للمعاينة' : 'Add Preview'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#1E1633] dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451]" />
                <span>{workersMenu.titleAr}</span>
              </h3>
              <span className="text-[11px] font-bold text-[#5B5270] dark:text-[#C4B5FD]">
                {workersMenu.clientTierNoteAr}
              </span>
            </div>
            <ul className="divide-y divide-[#4C1D95]/8 dark:divide-white/8 text-xs font-semibold text-[#1E1633] dark:text-slate-200">
              {workersMenu.sampleDishesAr.map((dish) => (
                <li key={dish} className="py-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                  <span>{dish}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: 3 Approved Central Kitchens */}
      {activeTab === 'kitchens' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {THREE_CENTRAL_KITCHENS.map((kitchen) => (
            <button
              key={kitchen.id}
              type="button"
              onClick={() => onSelectKitchen(kitchen.id)}
              className="group text-start rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 overflow-hidden shadow-2xs hover:border-[#4C1D95]/35 flex flex-col cursor-pointer"
            >
              <div className="aspect-[16/9] bg-[#F5F3FF] overflow-hidden">
                <img
                  src={kitchen.imageUrl}
                  alt={isRtl ? kitchen.nameAr : kitchen.nameEn}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-2.5 w-full">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4C1D95] dark:text-[#F5C451]">
                    <ChefHat className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{isRtl ? kitchen.locationAr : kitchen.locationEn}</span>
                  </div>
                  <h3 className="text-sm font-black text-[#1E1633] dark:text-white">
                    {isRtl ? kitchen.nameAr : kitchen.nameEn}
                  </h3>
                  <p className="text-xs text-[#5B5270] dark:text-slate-300 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#4C1D95] dark:text-[#F5C451]" />
                    <span className="line-clamp-2">{isRtl ? kitchen.coverageAr : kitchen.coverageEn}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-[#4C1D95]/8 dark:border-white/8 flex items-center justify-between text-xs font-extrabold text-[#3B0764] dark:text-[#F5C451]">
                  <span>{isRtl ? 'فتح ملف المطبخ' : 'Open Kitchen Profile'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Tab 3: Illustrative Shift Structure */}
      {activeTab === 'shifts' && (
        <div className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-[#1E1633] dark:text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451]" />
                <span>{isRtl ? 'هيكل جدول الورديات (توضيحي للمرحلة الأولى)' : 'Factory Shift Structure (Phase 1)'}</span>
              </h3>
              <p className="text-xs text-[#5B5270] dark:text-slate-300">
                {isRtl
                  ? 'يتم ربط الجدول الفعلي للمصانع والعقود المعتمدة في المرحلة القادمة.'
                  : 'Live contract schedules connect in Phase 2.'}
              </p>
            </div>
          </div>
          <div className="divide-y divide-[#4C1D95]/10 dark:divide-white/10">
            {FACTORY_SHIFT_BLOCKS.map((shift) => (
              <div key={shift.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-black text-[#1E1633] dark:text-white">
                    {shift.nameAr}
                  </h4>
                  <p className="text-xs text-[#5B5270] dark:text-slate-300">{shift.focusAr}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4C1D95] dark:text-[#F5C451] tabular-nums shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{shift.windowAr}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Embedded Ha-Be Factory Catering Portal Preview */}
      {activeTab === 'habe_portal' && (
        <div className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 p-3 sm:p-4 space-y-3">
          <div className="px-1 text-xs font-bold text-[#5B5270] dark:text-slate-300">
            {isRtl
              ? 'معاينة بوابة مصنع Ha-Be Germany المحفوظة بالمشروع (دون تنفيذ معاملات دفع حقيقية في المرحلة الأولى):'
              : 'Preserved Ha-Be Germany factory portal preview (live payment disabled in Phase 1):'}
          </div>
          <HabeGermanMarketPortal
            isRtl={isRtl}
            onAddAuditLog={() => {}}
            isAuthVerified={false}
            isOwnerAdmin={false}
            onShowToast={onShowToast}
          />
        </div>
      )}
    </div>
  );
};
