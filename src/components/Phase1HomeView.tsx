import React, { useState, useEffect, useRef } from 'react';
import {
  Factory,
  ChefHat,
  Truck,
  UtensilsCrossed,
  Sparkles,
  Leaf,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  CountryCode,
  LanguageCode,
  EIGHT_CATERING_MENUS,
  CentralKitchenId,
  OrganizedCateringMenu,
} from '../data/phase1Data';
import { B2B_HERO_CAROUSEL_SLIDES, B2BHeroSlide } from '../data/freshWorldData';
import type { OfferAdDoc, TenantWorkspaceDoc } from '../types/faydEcosystem';
import type { FavoriteEntry } from './FavoritesDrawer';
import type { AndroidModalType } from './AndroidCateringModals';

interface Phase1HomeViewProps {
  lang: LanguageCode;
  country: CountryCode;
  customLogoDataUrl: string | null;
  onUploadLogo: (dataUrl: string) => void;
  approvedOffersAds?: OfferAdDoc[];
  myTenant?: TenantWorkspaceDoc | null;
  isOwnerAdmin?: boolean;
  isStrictAppOwner?: boolean;
  isGuestMode?: boolean;
  favoriteIds?: string[];
  onToggleFavorite?: (entry: FavoriteEntry) => void;
  onOpenIconsGuide?: () => void;
  onOpenOwnerStudio?: () => void;
  onOpenOwnerExecutiveFinance?: () => void;
  onOpenCamelLiverModal?: () => void;
  onNavigateSection: (section: string, kitchenId?: CentralKitchenId) => void;
  onOpenReportPdf?: () => void;
  onOpenQuotePdf?: () => void;
  onOpenCateringModal?: (modal: AndroidModalType, preselectedKitchenName?: string) => void;
  onSelectMenu?: (menu: OrganizedCateringMenu) => void;
  onOpenControlDashboard?: () => void;
}

export const Phase1HomeView: React.FC<Phase1HomeViewProps> = ({
  lang,
  isGuestMode = false,
  onNavigateSection,
  onOpenCateringModal,
  onSelectMenu,
}) => {
  const isRtl = lang === 'ar';
  const [showAllMenus, setShowAllMenus] = useState(false);

  // Featured Carousel
  const [slideIdx, setSlideIdx] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (carouselPaused) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % B2B_HERO_CAROUSEL_SLIDES.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [carouselPaused]);

  const handleCarouselPrev = () => {
    setSlideIdx(
      (prev) => (prev - 1 + B2B_HERO_CAROUSEL_SLIDES.length) % B2B_HERO_CAROUSEL_SLIDES.length
    );
  };

  const handleCarouselNext = () => {
    setSlideIdx((prev) => (prev + 1) % B2B_HERO_CAROUSEL_SLIDES.length);
  };

  const handleSlideAction = (slide: B2BHeroSlide) => {
    if (slide.actionType === 'fresh_world') {
      onNavigateSection('fresh_world');
    } else if (slide.actionType === 'factory_quote') {
      onOpenCateringModal?.('quote_tasting');
    } else if (slide.actionType === 'events_quote') {
      onOpenCateringModal?.('events_conference_quote');
    } else if (slide.actionType === 'basit_card') {
      onNavigateSection('baset_card');
    }
  };

  const activeSlide = B2B_HERO_CAROUSEL_SLIDES[slideIdx] || B2B_HERO_CAROUSEL_SLIDES[0];
  const ForwardArrow = isRtl ? ChevronLeft : ChevronRight;

  // 4 Primary Destinations (Zero Clutter, Generous Touch Targets)
  const quickServices = [
    {
      id: 'srv_fresh_world',
      labelAr: 'حصاد النيل الأخضر',
      labelEn: 'Green Nile Market',
      subAr: 'خضروات وفواكه ووجبات',
      subEn: 'Fresh produce & meals',
      icon: Leaf,
      featured: true,
      action: () => onNavigateSection('fresh_world'),
    },
    {
      id: 'srv_factories',
      labelAr: 'تغذية المصانع والشركات',
      labelEn: 'Corporate Catering',
      subAr: 'طلب عرض سعر فوري',
      subEn: 'Request B2B quote',
      icon: Factory,
      action: () => onOpenCateringModal?.('quote_tasting'),
    },
    {
      id: 'srv_al_ain',
      labelAr: 'عالم العين والمطاعم',
      labelEn: 'Al Ain Dining Hub',
      subAr: 'المطاعم والترفيه',
      subEn: 'Dining & lifestyle',
      icon: UtensilsCrossed,
      action: () => onNavigateSection('al_ain_restaurants'),
    },
    {
      id: 'srv_kitchens',
      labelAr: 'المطابخ المركزية',
      labelEn: 'Central Kitchens',
      subAr: isGuestMode ? 'تتبع التوريد والوجبات' : 'بدر · مدينة نصر · بيت العيلة',
      subEn: isGuestMode ? 'Meal supply tracking' : '3 certified kitchens',
      icon: isGuestMode ? Truck : ChefHat,
      action: () => onNavigateSection(isGuestMode ? 'b2b_tracking' : 'kitchens'),
    },
  ];

  const visibleMenus = showAllMenus ? EIGHT_CATERING_MENUS : EIGHT_CATERING_MENUS.slice(0, 4);

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Featured Editorial Showcase (Clean 16:9 Photo + Single Clear CTA) */}
      <section
        aria-label={isRtl ? 'العروض المميزة' : 'Featured Showcase'}
        onMouseEnter={() => setCarouselPaused(true)}
        onMouseLeave={() => setCarouselPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
          setCarouselPaused(true);
        }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0]?.clientX ?? null;
          if (touchStartX.current !== null && endX !== null) {
            const diff = touchStartX.current - endX;
            if (Math.abs(diff) > 40) {
              if (diff > 0) handleCarouselNext();
              else handleCarouselPrev();
            }
          }
          touchStartX.current = null;
          setCarouselPaused(false);
        }}
        className="rounded-3xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C4B5FD]/15 overflow-hidden shadow-[0_10px_28px_-14px_rgba(30,22,51,0.16)]"
      >
        <div
          className={`relative aspect-[16/9] w-full overflow-hidden ${
            activeSlide.isBasitCardSlide ? 'bg-[#16082E]' : 'bg-[#EDE9FE]'
          }`}
        >
          <img
            src={activeSlide.imageUrl}
            alt={isRtl ? activeSlide.titleAr : activeSlide.titleEn}
            className={`w-full h-full transition-opacity duration-300 ${
              activeSlide.isBasitCardSlide ? 'object-contain' : 'object-cover'
            }`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E1633]/75 via-[#1E1633]/15 to-transparent" />
          <span className="absolute top-3 start-3 px-2.5 py-1 rounded-full bg-[#3B0764]/90 text-[#F5C451] text-[10px] font-black backdrop-blur-xs">
            {isRtl ? activeSlide.tagAr : activeSlide.tagEn}
          </span>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h1 className="text-base font-black text-[#1E1633] dark:text-white leading-snug line-clamp-1">
              {isRtl ? activeSlide.titleAr : activeSlide.titleEn}
            </h1>
            <p className="text-xs font-medium text-[#5B5270] dark:text-[#C4B5FD] line-clamp-1">
              {isRtl ? activeSlide.subtitleAr : activeSlide.subtitleEn}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleSlideAction(activeSlide)}
              className={`min-h-[42px] px-4 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform ${
                activeSlide.isBasitCardSlide
                  ? 'basit-glass-btn-yellow'
                  : 'basit-glass-btn-primary'
              }`}
            >
              <span>{isRtl ? activeSlide.ctaAr : activeSlide.ctaEn}</span>
              <ForwardArrow className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {B2B_HERO_CAROUSEL_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setSlideIdx(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === slideIdx
                      ? 'w-5 bg-[#4C1D95] dark:bg-[#F5C451]'
                      : 'w-2 bg-[#4C1D95]/20 dark:bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Destinations (2x2 Airy Ivory Cards with Uniform Outline Icons) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#1E1633] dark:text-white">
            {isRtl ? 'استكشف خدمات باسط' : 'Explore BASIT'}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={srv.action}
                className="group min-h-[104px] p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/10 dark:border-[#C4B5FD]/15 hover:border-[#4C1D95]/30 text-start flex flex-col justify-between gap-2.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    srv.featured
                      ? 'bg-[#4C1D95] text-[#F5C451]'
                      : 'bg-[#F5F3FF] dark:bg-[#231938] text-[#4C1D95] dark:text-[#F5C451]'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.9} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-black text-[#1E1633] dark:text-white leading-snug truncate">
                    {isRtl ? srv.labelAr : srv.labelEn}
                  </div>
                  <div className="text-[11px] font-medium text-[#5B5270] dark:text-[#C4B5FD] truncate">
                    {isRtl ? srv.subAr : srv.subEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Signature VIP Offer: BASET Family Benefits (Royal Purple + Luminous Gold Highlight) */}
      <section className="rounded-3xl bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] p-4 text-white shadow-[0_14px_30px_-12px_rgba(59,7,100,0.45)] space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="inline-flex items-center gap-1 text-[10px] font-black text-[#F5C451]">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isRtl ? 'كارت باسط العائلي' : 'BASET Family Card'}</span>
            </div>
            <h2 className="text-sm font-black text-white leading-snug">
              {isRtl ? 'خصم 10% في الطعام والترفيه العائلي' : '10% Off Meals & Family Leisure'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('baset_card')}
            className="min-h-[40px] px-3.5 rounded-xl basit-glass-btn-yellow text-xs font-black shrink-0 cursor-pointer"
          >
            {isRtl ? 'تفعيل الكارت' : 'Activate'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateSection('baset_food_benefits')}
            className="min-h-[54px] p-3 rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 text-start flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#F5C451] shrink-0" strokeWidth={1.9} />
            <span className="text-xs font-bold text-white leading-tight line-clamp-2">
              {isRtl ? 'وجبات باسط' : 'Food Offers'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('baset_family_entertainment')}
            className="min-h-[54px] p-3 rounded-2xl bg-white/10 hover:bg-white/16 border border-white/15 text-start flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#F5C451] shrink-0" strokeWidth={1.9} />
            <span className="text-xs font-bold text-white leading-tight line-clamp-2">
              {isRtl ? 'بسطناها على عيلتك' : 'Family Fun'}
            </span>
          </button>
        </div>
      </section>

      {/* 4. Catering Menus Grid (Crisp 4:3 Meal Photography Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#1E1633] dark:text-white">
            {isRtl ? 'قوائم المنيوهات المعتمدة' : 'Catering Menus'}
          </h2>
          <button
            type="button"
            onClick={() => setShowAllMenus((p) => !p)}
            className="min-h-[36px] px-2.5 text-xs font-bold text-[#4C1D95] dark:text-[#F5C451] cursor-pointer hover:underline"
          >
            {showAllMenus
              ? isRtl ? 'عرض أقل' : 'Show Less'
              : isRtl ? 'عرض كل الـ 8' : 'See All 8'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {visibleMenus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              onClick={() => onSelectMenu?.(menu)}
              className="group rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/10 dark:border-[#C4B5FD]/15 overflow-hidden text-start shadow-2xs hover:border-[#4C1D95]/30 transition-all active:scale-[0.98] cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE9FE]">
                <img
                  src={menu.imageUrl}
                  alt={isRtl ? menu.titleAr : menu.titleEn}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                <div className="text-xs font-black text-[#1E1633] dark:text-white leading-snug line-clamp-2">
                  {isRtl ? menu.titleAr : menu.titleEn}
                </div>
                <div className="text-[10px] font-medium text-[#5B5270] dark:text-[#C4B5FD] truncate">
                  {isRtl ? menu.clientTierNoteAr : menu.clientTierNoteEn}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
