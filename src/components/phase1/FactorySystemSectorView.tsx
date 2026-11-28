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
    <div className="space-y-5 pb-8">
      {/* 16:9 Factory Operations Hero */}
      <section className="relative rounded-[24px] overflow-hidden bg-[#240046] border border-[rgba(212,175,55,0.45)] shadow-md min-h-[236px] flex flex-col justify-end">
        <img
          src={factoryHeroImg}
          alt={isRtl ? 'نظام المصانع والإعاشة الصناعية' : 'Factory System'}
          loading="eager"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,5,46,0.96),rgba(36,0,70,0.82),rgba(26,5,46,0.45))]"
        />
        <div className="relative z-10 p-4 text-[#FFFFFF] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#FFE875]">
            <Factory className="w-4 h-4 text-[#FFE875] shrink-0" />
            <span className="font-latin tracking-wide">FACTORY SYSTEM</span>
            <span aria-hidden="true">·</span>
            <span>{isRtl ? 'تغذية خطوط الإنتاج' : 'Industrial Catering'}</span>
          </div>
          <h2 className="text-xl font-black leading-tight text-[#FFFFFF]">
            {isRtl ? 'نظام المصانع والورديات المركزية' : 'Factory Catering & Shifts System'}
          </h2>
          <p className="text-xs text-[#FFFDF7]/90 leading-relaxed">
            {isRtl
              ? 'تشغيل خطوط إعاشة المصانع في مدينة بدر والعاصمة الإدارية والشروق عبر 3 مطابخ مركزية معتمدة.'
              : 'End-to-end industrial meal production across Badr City, New Capital, and El Shorouk via 3 certified central kitchens.'}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onRequestFactoryQuote}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] text-[#240046] text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4 text-[#240046]" />
              <span>{isRtl ? 'طلب تعاقد مصنع / شركة' : 'Request Factory Contract'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMenu(workersMenu)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-[#FFFFFF] text-xs font-bold inline-flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
            >
              <span>{isRtl ? 'استعراض منيو العمالة' : 'View Workforce Menu'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sub-navigation Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] shadow-2xs">
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
            className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer text-center leading-tight ${
              activeTab === tab.id
                ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] border border-[rgba(212,175,55,0.45)]'
                : 'text-[#3B123F] dark:text-[#FFFDF7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Meal Packs & Workforce Menu */}
      {activeTab === 'lines' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {factoryMealPacks.map((pack) => (
              <div
                key={pack.id}
                className="rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] overflow-hidden shadow-2xs flex flex-col"
              >
                <div className="aspect-[16/9] bg-[#FFFDF7] dark:bg-[#1A052E] overflow-hidden">
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
                    <span className="text-[11px] font-bold text-[#5A189A] dark:text-[#FFE875]">
                      {isRtl ? pack.unitAr : pack.unitEn}
                    </span>
                    <h3 className="text-sm font-black text-[#240046] dark:text-[#FFFFFF]">
                      {isRtl ? pack.nameAr : pack.nameEn}
                    </h3>
                    <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85 leading-relaxed">
                      {isRtl ? pack.subtitleAr : pack.subtitleEn}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-[rgba(212,175,55,0.3)] flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#5A189A] dark:text-[#FFE875] tabular-nums">
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
                      className="min-h-[44px] px-4 rounded-xl bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] border border-[rgba(212,175,55,0.4)] text-[#FFFFFF] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 text-[#FFE875]" />
                      <span>{isRtl ? 'إضافة للمعاينة' : 'Add Preview'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#240046] dark:text-[#FFFFFF] flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{workersMenu.titleAr}</span>
              </h3>
              <span className="text-[11px] font-bold text-[#5A189A] dark:text-[#FFE875]">
                {workersMenu.clientTierNoteAr}
              </span>
            </div>
            <ul className="divide-y divide-[rgba(212,175,55,0.25)] text-xs font-semibold text-[#240046] dark:text-[#FFFDF7]">
              {workersMenu.sampleDishesAr.map((dish) => (
                <li key={dish} className="py-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{dish}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: 3 Approved Central Kitchens */}
      {activeTab === 'kitchens' && (
        <div className="grid grid-cols-1 gap-3">
          {THREE_CENTRAL_KITCHENS.map((kitchen) => (
            <button
              key={kitchen.id}
              type="button"
              onClick={() => onSelectKitchen(kitchen.id)}
              className="group text-start rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] overflow-hidden shadow-2xs hover:border-[#5A189A] flex flex-col cursor-pointer"
            >
              <div className="aspect-[16/9] bg-[#FFFDF7] dark:bg-[#1A052E] overflow-hidden">
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
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5A189A] dark:text-[#FFE875]">
                    <ChefHat className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="leading-snug">{isRtl ? kitchen.locationAr : kitchen.locationEn}</span>
                  </div>
                  <h3 className="text-sm font-black text-[#240046] dark:text-[#FFFFFF]">
                    {isRtl ? kitchen.nameAr : kitchen.nameEn}
                  </h3>
                  <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D4AF37]" />
                    <span className="line-clamp-2">{isRtl ? kitchen.coverageAr : kitchen.coverageEn}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-[rgba(212,175,55,0.3)] flex items-center justify-between text-xs font-extrabold text-[#5A189A] dark:text-[#FFE875]">
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
        <div className="rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-[#240046] dark:text-[#FFFFFF] flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#D4AF37]" />
                <span>{isRtl ? 'هيكل جدول الورديات (توضيحي للمرحلة الأولى)' : 'Factory Shift Structure (Phase 1)'}</span>
              </h3>
              <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/80">
                {isRtl
                  ? 'يتم ربط الجدول الفعلي للمصانع والعقود المعتمدة في المرحلة القادمة.'
                  : 'Live contract schedules connect in Phase 2.'}
              </p>
            </div>
          </div>
          <div className="divide-y divide-[rgba(212,175,55,0.25)]">
            {FACTORY_SHIFT_BLOCKS.map((shift) => (
              <div key={shift.id} className="py-3 flex flex-col justify-between gap-1.5">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-[#240046] dark:text-[#FFFFFF]">
                    {shift.nameAr}
                  </h4>
                  <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85">{shift.focusAr}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A189A] dark:text-[#FFE875] tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{shift.windowAr}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Embedded Ha-Be Factory Catering Portal Preview */}
      {activeTab === 'habe_portal' && (
        <div className="rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] p-3 space-y-3">
          <div className="px-1 text-xs font-bold text-[#3B123F] dark:text-[#FFFDF7]/85">
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
