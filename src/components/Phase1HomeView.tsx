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
    <div className="space-y-5 pb-2">
      {/* 1. Featured Editorial Showcase (16:9 Photo + sRGB Card & Single Clear CTA) */}
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
        className="rounded-3xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] overflow-hidden shadow-[0_12px_28px_-14px_rgba(36,0,70,0.2)]"
      >
        <div
          className={`relative aspect-[16/9] w-full overflow-hidden ${
            activeSlide.isBasitCardSlide ? 'bg-[#1A052E]' : 'bg-[#FFFDF7]'
          }`}
        >
          <img
            src={activeSlide.imageUrl}
            alt={isRtl ? activeSlide.titleAr : activeSlide.titleEn}
            className={`w-full h-full transition-opacity duration-300 ${
              activeSlide.isBasitCardSlide ? 'object-contain' : 'object-cover'
            }`}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(26,5,46,0.05)_0%,rgba(26,5,46,0.68)_100%)]" />
          <span className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-full bg-[linear-gradient(135deg,#240046,#4B148C)] text-[#FFE875] border border-[rgba(212,175,55,0.45)] text-[10px] font-black shadow-xs">
            {isRtl ? activeSlide.tagAr : activeSlide.tagEn}
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          <div className="space-y-1">
            <h1 className="text-sm sm:text-base font-black text-[#240046] dark:text-[#FFFDF7] leading-snug line-clamp-2">
              {isRtl ? activeSlide.titleAr : activeSlide.titleEn}
            </h1>
            <p className="text-xs font-medium text-[#3B123F] dark:text-[#FFFDF7]/80 line-clamp-2 leading-relaxed">
              {isRtl ? activeSlide.subtitleAr : activeSlide.subtitleEn}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSlideAction(activeSlide)}
              className={`min-h-[44px] px-4 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform ${
                activeSlide.isBasitCardSlide
                  ? 'basit-glass-btn-yellow'
                  : 'basit-glass-btn-primary'
              }`}
            >
              <span>{isRtl ? activeSlide.ctaAr : activeSlide.ctaEn}</span>
              <ForwardArrow className="w-4 h-4 shrink-0" />
            </button>

            <div className="flex items-center gap-1">
              {B2B_HERO_CAROUSEL_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setSlideIdx(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className="min-h-[44px] min-w-[24px] px-1 flex items-center justify-center cursor-pointer"
                >
                  <span
                    className={`h-2 rounded-full transition-all ${
                      idx === slideIdx
                        ? 'w-5 bg-[#5A189A] dark:bg-[#FFE875]'
                        : 'w-2 bg-[#5A189A]/25 dark:bg-white/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Destinations (2x2 Airy Milky Cards with Rich Colored Icons) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#240046] dark:text-[#FFFDF7]">
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
                className="group min-h-[112px] p-3 rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] hover:border-[#D4AF37] text-start flex flex-col justify-between gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    srv.featured
                      ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFE875] border border-[rgba(212,175,55,0.45)]'
                      : 'bg-[#FFFDF7] dark:bg-[#1A052E] text-[#5A189A] dark:text-[#D4AF37] border border-[rgba(212,175,55,0.35)]'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-black text-[#240046] dark:text-[#FFFDF7] leading-snug line-clamp-2">
                    {isRtl ? srv.labelAr : srv.labelEn}
                  </div>
                  <div className="text-[10.5px] font-medium text-[#3B123F] dark:text-[#FFFDF7]/75 leading-snug line-clamp-2">
                    {isRtl ? srv.subAr : srv.subEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Signature VIP Offer: BASET Family Benefits (Explicit sRGB Purple + Gold Highlight) */}
      <section className="rounded-3xl bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] p-4 text-white border border-[rgba(212,175,55,0.45)] shadow-[0_14px_30px_-12px_rgba(36,0,70,0.5)] space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="inline-flex items-center gap-1 text-[10px] font-black text-[#FFE875]">
              <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRtl ? 'كارت باسط العائلي' : 'BASET Family Card'}</span>
            </div>
            <h2 className="text-sm font-black text-white leading-snug">
              {isRtl ? 'خصم 10% في الطعام والترفيه العائلي' : '10% Off Meals & Family Leisure'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('baset_card')}
            className="min-h-[44px] px-3.5 rounded-xl basit-glass-btn-yellow text-xs font-black shrink-0 cursor-pointer"
          >
            {isRtl ? 'تفعيل الكارت' : 'Activate'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateSection('baset_food_benefits')}
            className="min-h-[54px] p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-[rgba(212,175,55,0.35)] text-start flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#FFE875] shrink-0" strokeWidth={2} />
            <span className="text-xs font-bold text-white leading-tight line-clamp-2">
              {isRtl ? 'وجبات باسط' : 'Food Offers'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('baset_family_entertainment')}
            className="min-h-[54px] p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-[rgba(212,175,55,0.35)] text-start flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#FFE875] shrink-0" strokeWidth={2} />
            <span className="text-xs font-bold text-white leading-tight line-clamp-2">
              {isRtl ? 'بسطناها على عيلتك' : 'Family Fun'}
            </span>
          </button>
        </div>
      </section>

      {/* 4. Catering Menus Grid (Crisp 4:3 Meal Photography Cards) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#240046] dark:text-[#FFFDF7]">
            {isRtl ? 'قوائم المنيوهات المعتمدة' : 'Catering Menus'}
          </h2>
          <button
            type="button"
            onClick={() => setShowAllMenus((p) => !p)}
            className="min-h-[44px] px-2.5 text-xs font-black text-[#5A189A] dark:text-[#FFE875] cursor-pointer hover:underline flex items-center"
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
              className="group rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] overflow-hidden text-start shadow-xs hover:border-[#D4AF37] transition-all active:scale-[0.98] cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFFDF7]">
                <img
                  src={menu.imageUrl}
                  alt={isRtl ? menu.titleAr : menu.titleEn}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                <div className="text-xs font-black text-[#240046] dark:text-[#FFFDF7] leading-snug line-clamp-2">
                  {isRtl ? menu.titleAr : menu.titleEn}
                </div>
                <div className="text-[10px] font-medium text-[#3B123F] dark:text-[#FFFDF7]/75 line-clamp-1">
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
