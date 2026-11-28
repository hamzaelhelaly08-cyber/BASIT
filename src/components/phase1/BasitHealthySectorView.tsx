import React, { useMemo, useState } from 'react';
import {
  HeartPulse,
  Plus,
  Check,
  ShoppingCart,
  Flame,
  Salad,
  Dumbbell,
  CalendarClock,
  ArrowLeft,
} from 'lucide-react';
import {
  EIGHT_CATERING_MENUS,
  type LanguageCode,
  type OrganizedCateringMenu,
} from '../../data/phase1Data';
import { FRESH_WORLD_PRODUCTS } from '../../data/freshWorldData';
import healthyHeroImg from '../../assets/images/sector_basit_healthy_1795835812014.jpg';
import type { Phase1CartItem } from '../Phase1CartDrawer';

interface BasitHealthySectorViewProps {
  lang: LanguageCode;
  currencyLabel: string;
  cartItems: Phase1CartItem[];
  onAddProduct: (item: Omit<Phase1CartItem, 'quantity'>) => void;
  onOpenCart: () => void;
  onSelectMenu: (menu: OrganizedCateringMenu) => void;
  onRequestHealthyQuote: () => void;
}

type HealthyFilter = 'all' | 'produce' | 'plans';

const ILLUSTRATIVE_PLANS = [
  {
    id: 'plan_balance',
    titleAr: 'باقة التوازن اليومي (محتوى توضيحي)',
    titleEn: 'Daily Balance Track (Illustrative)',
    targetAr: 'وجبة غداء متكاملة + سلطة طازجة + ثمرة فاكهة',
    targetEn: 'Balanced main dish + fresh greens + seasonal fruit',
    kcalRange: '1,400 - 1,650 kcal',
    proteinNote: 'غني بالبروتين والألياف',
  },
  {
    id: 'plan_fitness',
    titleAr: 'باقة الرياضيين والجيم (محتوى توضيحي)',
    titleEn: 'Active & Gym Track (Illustrative)',
    targetAr: 'صدور دجاج مشوية بالزعتر أو سلمون مع كينوا وخضار مشوي',
    targetEn: 'Herb chicken or salmon fillet with quinoa & roasted veggies',
    kcalRange: '1,800 - 2,100 kcal',
    proteinNote: 'تركيز عالٍ على البروتين النظيف',
  },
];

export const BasitHealthySectorView: React.FC<BasitHealthySectorViewProps> = ({
  lang,
  currencyLabel,
  cartItems,
  onAddProduct,
  onOpenCart,
  onSelectMenu,
  onRequestHealthyQuote,
}) => {
  const isRtl = lang === 'ar';
  const [filter, setFilter] = useState<HealthyFilter>('all');

  const healthyMenu = useMemo(
    () =>
      EIGHT_CATERING_MENUS.find((m) => m.id === 'menu_healthy_gym') ||
      EIGHT_CATERING_MENUS[0],
    []
  );

  const healthyFreshItems = useMemo(
    () =>
      FRESH_WORLD_PRODUCTS.filter(
        (p) => p.category === 'fruits' || p.category === 'vegetables'
      ).slice(0, 6),
    []
  );

  const getQty = (id: string) =>
    cartItems.find((c) => c.id === id)?.quantity || 0;

  return (
    <div className="space-y-6 pb-8">
      {/* 16:9 Healthy Living Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-[#3B0764] shadow-md min-h-[236px] sm:min-h-[270px] flex flex-col justify-end">
        <img
          src={healthyHeroImg}
          alt={isRtl ? 'باسط هيلثي للوجبات الصحية المتوازنة' : 'BASIT Healthy Bowls'}
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
            <HeartPulse className="w-4 h-4 shrink-0" />
            <span className="font-latin tracking-wide">BASIT HEALTHY</span>
            <span aria-hidden="true">·</span>
            <span>{isRtl ? 'محسوب السعرات والبروتين' : 'Macro & Calorie Tracked'}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black leading-tight">
            {isRtl ? 'باسط هيلثي — التغذية الصحية المتوازنة' : 'BASIT HEALTHY — Balanced Nutrition'}
          </h2>
          <p className="text-xs sm:text-sm text-[#EDE9FE]/90 max-w-2xl leading-relaxed">
            {isRtl
              ? 'وجبات صحية طازجة، فواكه وخضروات منتقاة من حصاد النيل، ومنيو الهيلثي والجيم المعتمد.'
              : 'Fresh wholesome bowls, hand-picked Green Nile produce, and our approved Healthy & Gym menu.'}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onSelectMenu(healthyMenu)}
              className="min-h-[44px] px-4 py-2 rounded-xl basit-glass-btn-yellow text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Dumbbell className="w-4 h-4" />
              <span>{isRtl ? 'عرض منيو الهيلثي والجيم' : 'Open Healthy Menu'}</span>
            </button>
            <button
              type="button"
              onClick={onRequestHealthyQuote}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
            >
              <span>{isRtl ? 'طلب باقة للشركات / الجيم' : 'Request Gym / Corporate Plan'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label={isRtl ? 'أقسام باسط هيلثي' : 'Healthy Sections'}
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
          {isRtl ? 'الكل' : 'All'}
        </button>
        <button
          type="button"
          onClick={() => setFilter('produce')}
          className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
            filter === 'produce'
              ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
              : 'text-[#5B5270] dark:text-slate-300'
          }`}
        >
          {isRtl ? 'طازج ومعتمد' : 'Fresh Produce'}
        </button>
        <button
          type="button"
          onClick={() => setFilter('plans')}
          className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
            filter === 'plans'
              ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
              : 'text-[#5B5270] dark:text-slate-300'
          }`}
        >
          {isRtl ? 'مسارات هيلثي' : 'Meal Plans'}
        </button>
      </div>

      {/* Approved Healthy Menu Highlights */}
      {(filter === 'all' || filter === 'plans') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-black text-[#1E1633] dark:text-white flex items-center gap-2">
              <Salad className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451]" />
              <span>{isRtl ? healthyMenu.titleAr : healthyMenu.titleEn}</span>
            </h3>
            <span className="text-[11px] font-bold text-[#5B5270] dark:text-[#C4B5FD]">
              {isRtl ? 'منيو معتمد' : 'Approved Menu'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ILLUSTRATIVE_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 p-4 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#4C1D95] dark:text-[#F5C451]">
                  <span className="inline-flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{plan.kcalRange}</span>
                  </span>
                  <span>{plan.proteinNote}</span>
                </div>
                <h4 className="text-sm font-black text-[#1E1633] dark:text-white">
                  {isRtl ? plan.titleAr : plan.titleEn}
                </h4>
                <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed">
                  {isRtl ? plan.targetAr : plan.targetEn}
                </p>
                <div className="pt-2 border-t border-[#4C1D95]/10 dark:border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#5B5270] dark:text-slate-400">
                    {isRtl ? 'الأسعار حسب التعاقد' : 'Pricing upon contract'}
                  </span>
                  <button
                    type="button"
                    onClick={onRequestHealthyQuote}
                    className="min-h-[36px] px-3 rounded-xl bg-[#EDE9FE] dark:bg-[#2A1D42] text-[#3B0764] dark:text-[#F5C451] text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'استفسار' : 'Inquire'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Real Approved Fresh Produce from Fresh World */}
      {(filter === 'all' || filter === 'produce') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-[#1E1633] dark:text-white">
                {isRtl ? 'فواكه وخضروات طازجة معتمدة' : 'Approved Fresh Produce'}
              </h3>
              <p className="text-xs font-medium text-[#5B5270] dark:text-slate-300">
                {isRtl
                  ? 'أصناف طازجة بأسعار معتمدة من كتالوج حصاد النيل الأخضر'
                  : 'Real catalog items with approved pricing'}
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onOpenCart}
                className="min-h-[40px] px-3 rounded-xl bg-[#3B0764] text-[#F5C451] text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="tabular-nums">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {healthyFreshItems.map((product) => {
              const qty = getQty(product.id);
              return (
                <div
                  key={product.id}
                  className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/10 dark:border-white/10 overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-[#F5F3FF] dark:bg-[#231938] overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={isRtl ? product.nameAr : product.nameEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-[#1E1633] dark:text-white leading-snug line-clamp-2">
                        {isRtl ? product.nameAr : product.nameEn}
                      </h4>
                      <p className="text-[10px] font-medium text-[#5B5270] dark:text-slate-400 mt-0.5 truncate">
                        {isRtl ? product.unitAr : product.unitEn}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#4C1D95]/8 dark:border-white/8">
                      <span className="text-xs font-black text-[#3B0764] dark:text-[#F5C451] tabular-nums">
                        {product.priceEgp} {currencyLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onAddProduct({
                            id: product.id,
                            nameAr: product.nameAr,
                            nameEn: product.nameEn,
                            kitchenNameAr: 'باسط هيلثي · حصاد النيل',
                            kitchenNameEn: 'BASIT Healthy · Fresh World',
                            approvedPrice: product.priceEgp,
                            imageUrl: product.imageUrl,
                          })
                        }
                        aria-label={isRtl ? `إضافة ${product.nameAr}` : `Add ${product.nameEn}`}
                        className={`min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          qty > 0
                            ? 'bg-[#F5C451] text-[#2A0548] font-black px-2 gap-1 text-[11px]'
                            : 'bg-[#4C1D95] text-white hover:bg-[#3B0764]'
                        }`}
                      >
                        {qty > 0 ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="tabular-nums">{qty}</span>
                          </>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Healthy Menu Dishes List */}
      <section className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[#1E1633] dark:text-white">
            {isRtl ? 'أطباق معتمدة في منيو الهيلثي والجيم' : 'Approved Dishes'}
          </h3>
          <button
            type="button"
            onClick={() => onSelectMenu(healthyMenu)}
            className="text-xs font-bold text-[#4C1D95] dark:text-[#F5C451] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{isRtl ? 'التفاصيل' : 'Details'}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        <ul className="divide-y divide-[#4C1D95]/8 dark:divide-white/8 text-xs font-semibold text-[#1E1633] dark:text-slate-200">
          {(isRtl ? healthyMenu.sampleDishesAr : healthyMenu.sampleDishesEn).map((dish) => (
            <li key={dish} className="py-2.5 flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
              <span>{dish}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
