import React, { useState, useEffect, useRef } from 'react';
import {
  Factory,
  ChefHat,
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  UtensilsCrossed,
  Smartphone,
  Sparkles,
  Leaf,
  CreditCard,
  LayoutGrid,
} from 'lucide-react';
import {
  CountryCode,
  LanguageCode,
  THREE_CENTRAL_KITCHENS,
  EIGHT_CATERING_MENUS,
  CentralKitchenId,
  OrganizedCateringMenu,
} from '../data/phase1Data';
import { B2B_HERO_CAROUSEL_SLIDES, B2BHeroSlide } from '../data/freshWorldData';
import type { OfferAdDoc, TenantWorkspaceDoc } from '../types/faydEcosystem';
import { HabeDirectInstallModal } from './HabeDirectInstallModal';
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
  onOpenControlDashboard,
}) => {
  const isRtl = lang === 'ar';
  const [expandedKitchenIds, setExpandedKitchenIds] = useState<Record<string, boolean>>({});
  const [showAllMenus, setShowAllMenus] = useState(false);
  const [isHabeInstallModalOpen, setIsHabeInstallModalOpen] = useState(false);

  // Compact Horizontal Showcase Carousel
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

  const toggleKitchenArrow = (id: string) => {
    setExpandedKitchenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCarouselPrev = () => {
    setSlideIdx((prev) =>
      (prev - 1 + B2B_HERO_CAROUSEL_SLIDES.length) % B2B_HERO_CAROUSEL_SLIDES.length
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

  // Consolidated Core Hub (Reduced cleanly to 6 non-crowded destinations)
  const coreHubTiles = [
    {
      id: 'tile_fresh_world',
      labelAr: 'حصاد النيل',
      labelEn: 'Fresh 3D',
      subAr: 'متجر مباشر',
      subEn: '3D Store',
      icon: Leaf,
      gradient: 'from-[#4C1D95] to-[#3B0764]',
      highlight: true,
      action: () => onNavigateSection('fresh_world'),
    },
    {
      id: 'tile_factories',
      labelAr: 'تعاقد المصانع',
      labelEn: 'Factories',
      subAr: 'عروض الأسعار',
      subEn: 'B2B Quotes',
      icon: Factory,
      gradient: 'from-[#581C87] to-[#4C1D95]',
      action: () => onOpenCateringModal?.('quote_tasting'),
    },
    {
      id: 'tile_tracking',
      labelAr: 'تتبع التوريد',
      labelEn: 'Tracking',
      subAr: 'الشحنات',
      subEn: 'Live Fleet',
      icon: Truck,
      gradient: 'from-[#4C1D95] to-[#3B0764]',
      action: () => onNavigateSection('b2b_tracking'),
    },
    {
      id: 'tile_basit_card',
      labelAr: 'كارت باسط',
      labelEn: 'BASET Card',
      subAr: 'خصم 10%',
      subEn: '10% Off',
      icon: CreditCard,
      gradient: 'from-[#EAB308] to-[#FACC15]',
      iconDark: true,
      action: () => onNavigateSection('baset_card'),
    },
    {
      id: 'tile_al_ain',
      labelAr: 'عالم العين',
      labelEn: 'Al Ain',
      subAr: '13 وجهة',
      subEn: '13 Places',
      icon: UtensilsCrossed,
      gradient: 'from-[#581C87] to-[#3B0764]',
      action: () => onNavigateSection('al_ain_restaurants'),
    },
    {
      id: 'tile_all_hub',
      labelAr: 'كل الخدمات',
      labelEn: 'All Services',
      subAr: 'لوحة التحكم',
      subEn: 'Full Hub',
      icon: LayoutGrid,
      gradient: 'from-[#EAB308] to-[#FFD54F]',
      iconDark: true,
      action: () =>
        onOpenControlDashboard
          ? onOpenControlDashboard()
          : window.dispatchEvent(new CustomEvent('basit:open-menu-drawer')),
    },
  ];

  const visibleMenus = showAllMenus ? EIGHT_CATERING_MENUS : EIGHT_CATERING_MENUS.slice(0, 4);

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Clean Royal Purple Summary Card (Uncrowded KPI Overview) */}
      <section className="rounded-[24px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#581C87] text-white p-4 border border-[#FFD54F]/55 shadow-[0_14px_32px_-12px_rgba(59,7,100,0.45)] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold text-[#D8B4FE]">
              {isRtl ? 'بوابة باسط للإعاشة والتوريد' : 'BASIT Catering & Supply'}
            </p>
            <div className="text-lg font-black text-[#FFD54F]">
              {isRtl ? '3 مطابخ مركزية · 8 منيوهات' : '3 Kitchens · 8 Menus'}
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FFD54F] text-[#3B0764] text-[10px] font-black shrink-0">
            B2B · VIP
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-2xl bg-[#3B0764]/65 border border-[#C084FC]/30 text-center">
            <div className="text-[10px] font-bold text-[#EDE9FE]">
              {isRtl ? 'بطاقة باسط' : 'Basit Card'}
            </div>
            <div className="text-xs font-black text-[#FFD54F]">10% OFF</div>
          </div>
          <div className="p-2 rounded-2xl bg-[#3B0764]/65 border border-[#C084FC]/30 text-center">
            <div className="text-[10px] font-bold text-[#EDE9FE]">
              {isRtl ? 'الكاش باك' : 'Cashback'}
            </div>
            <div className="text-xs font-black text-[#FFD54F]">7% MAX</div>
          </div>
          <div className="p-2 rounded-2xl bg-[#3B0764]/65 border border-[#C084FC]/30 text-center">
            <div className="text-[10px] font-bold text-[#EDE9FE]">
              {isRtl ? 'عالم العين' : 'Al Ain'}
            </div>
            <div className="text-xs font-black text-[#FFD54F]">13+ HUB</div>
          </div>
        </div>
      </section>

      {/* 2. Compact Small-Image Showcase Carousel (Zero Overlapping Buttons on Image) */}
      <section
        aria-label={isRtl ? 'معرض باسط للأعمال' : 'BASIT B2B Showcase Carousel'}
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
        className="rounded-[24px] bg-gradient-to-br from-[#FFFBEB] via-[#FEF9C3] to-[#EDE9FE] border border-[#FFD54F] p-3.5 shadow-[0_12px_28px_-14px_rgba(76,29,149,0.3)] space-y-3"
      >
        <div className="flex items-center gap-3">
          {/* Small Crisp Thumbnail (84x84) — No Overlaid Text/Buttons */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#FFD54F] shadow-sm shrink-0 bg-[#4C1D95]">
            <img
              src={activeSlide.imageUrl}
              alt={isRtl ? activeSlide.titleAr : activeSlide.titleEn}
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#4C1D95] text-[#FFD54F] text-[9px] font-black">
              {isRtl ? activeSlide.tagAr : activeSlide.tagEn}
            </span>
            <h1 className="text-xs font-black leading-snug text-[#3B0764] line-clamp-2">
              {isRtl ? activeSlide.titleAr : activeSlide.titleEn}
            </h1>
            <p className="text-[10px] font-bold text-[#581C87] line-clamp-1">
              {isRtl ? activeSlide.subtitleAr : activeSlide.subtitleEn}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#4C1D95]/15">
          <button
            type="button"
            onClick={() => handleSlideAction(activeSlide)}
            className="min-h-[36px] px-4 py-1.5 rounded-full bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] font-black text-[11px] shadow-xs cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
          >
            {isRtl ? activeSlide.ctaAr : activeSlide.ctaEn}
          </button>

          <div className="flex items-center gap-1.5">
            {B2B_HERO_CAROUSEL_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setSlideIdx(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === slideIdx ? 'w-5 bg-[#4C1D95]' : 'w-2 bg-[#C084FC]/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Consolidated Core Destinations Hub (6 Uncrowded Tiles) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-[#3B0764]">
            {isRtl ? 'الأقسام الرئيسية' : 'Core Hub'}
          </h2>
          <button
            type="button"
            onClick={() => onNavigateSection('fresh_world')}
            className="text-[11px] font-black text-[#4C1D95] cursor-pointer hover:underline"
          >
            {isRtl ? 'حصاد النيل ←' : 'Fresh World →'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {coreHubTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={tile.action}
                className={`group min-h-[96px] p-2.5 rounded-[20px] text-center flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  tile.highlight
                    ? 'bg-gradient-to-br from-[#FFD54F]/75 via-[#FEF9C3] to-[#EDE9FE] border-2 border-[#4C1D95]/40 shadow-sm'
                    : 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF9C3]/85 to-[#EDE9FE] border border-[#4C1D95]/20 hover:border-[#EAB308] shadow-xs'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tile.gradient} ${
                    tile.iconDark ? 'text-[#3B0764]' : 'text-[#FFD54F]'
                  } flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.9} />
                </div>
                <div className="space-y-0.5 min-w-0 w-full">
                  <div className="text-[11px] font-black text-[#3B0764] leading-tight truncate">
                    {isRtl ? tile.labelAr : tile.labelEn}
                  </div>
                  <div className="text-[9px] font-bold text-[#581C87] leading-tight truncate">
                    {isRtl ? tile.subAr : tile.subEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3B. BASET Family Benefits Program — Two Independent Destinations */}
      <section className="rounded-[24px] bg-gradient-to-br from-[#2A1459] via-[#4C1D95] to-[#5B18B0] border border-[#FFD54F]/60 p-4 text-white shadow-[0_14px_32px_-12px_rgba(42,20,89,0.5)] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-black text-[#FFD54F]">
              {isRtl ? 'برنامج مزايا كارت باسط العائلي' : 'BASET Family Benefits Program'}
            </div>
            <h2 className="text-sm font-black text-white truncate">
              {isRtl ? 'خصم 10% في وجهتين مستقلتين' : '10% Off Across Two Dedicated Destinations'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('baset_card')}
            className="min-h-[34px] px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD54F] to-[#FACC15] text-[#2A1459] text-[10px] font-black shrink-0 cursor-pointer"
          >
            {isRtl ? 'عرض الكارت' : 'BASET Card'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateSection('baset_food_benefits')}
            className="min-h-[64px] p-3 rounded-2xl bg-white/12 hover:bg-white/18 border border-[#FFD54F]/45 text-start flex flex-col justify-between gap-1 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between gap-1">
              <UtensilsCrossed className="w-4 h-4 text-[#FFD54F] shrink-0" />
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FFD54F] text-[#2A1459]">
                4
              </span>
            </div>
            <div className="text-[11px] font-black text-white leading-snug">
              {isRtl ? 'وجباتك واحتياجاتك أحلى مع باسط' : 'Food & Meal Benefits'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('baset_family_entertainment')}
            className="min-h-[64px] p-3 rounded-2xl bg-white/12 hover:bg-white/18 border border-[#C084FC]/45 text-start flex flex-col justify-between gap-1 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between gap-1">
              <Sparkles className="w-4 h-4 text-[#FFD54F] shrink-0" />
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#2A1459]">
                8
              </span>
            </div>
            <div className="text-[11px] font-black text-white leading-snug">
              {isRtl ? 'باسط بسطناها على عيلتك' : 'Family Entertainment'}
            </div>
          </button>
        </div>
      </section>

      {/* 4. Central Kitchens (Compact Rows with Small 44px Logos) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-[#3B0764]">
            {isRtl ? 'المطابخ المركزية' : 'Central Kitchens'}
          </h2>
          {!isGuestMode && (
            <button
              type="button"
              onClick={() => onNavigateSection('kitchens')}
              className="text-[11px] font-black text-[#4C1D95] cursor-pointer"
            >
              {isRtl ? 'الكل ←' : 'All →'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {THREE_CENTRAL_KITCHENS.map((k) => {
            const isExpanded = Boolean(expandedKitchenIds[k.id]);
            const areas = isRtl ? k.coverageAreasAr : k.coverageAreasEn;
            return (
              <div
                key={k.id}
                className="rounded-[20px] bg-gradient-to-r from-[#FFFBEB] via-[#FEF9C3]/85 to-[#EDE9FE] border border-[#4C1D95]/20 p-3 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      isGuestMode
                        ? toggleKitchenArrow(k.id)
                        : onNavigateSection('kitchen_detail', k.id)
                    }
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-start cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FEF9C3] to-[#FFD54F]/55 border border-[#EAB308]/60 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      <img
                        src={k.officialLogoUrl || k.imageUrl}
                        alt={isRtl ? k.nameAr : k.nameEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#3B0764] truncate">
                        {isRtl ? k.nameAr : k.nameEn}
                      </div>
                      <div className="text-[10px] font-bold text-[#581C87] truncate">
                        {isRtl ? k.locationAr : k.locationEn}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleKitchenArrow(k.id)}
                    aria-expanded={isExpanded}
                    aria-label={isRtl ? `نطاق تغطية ${k.nameAr}` : `Toggle coverage for ${k.nameEn}`}
                    className="min-h-[38px] min-w-[38px] rounded-xl bg-[#4C1D95] text-[#FFD54F] flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="pt-2 border-t border-[#4C1D95]/15 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {areas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FEF9C3] border border-[#EAB308]/50 text-[10px] font-black text-[#3B0764]"
                        >
                          <MapPin className="w-3 h-3 text-[#4C1D95]" />
                          <span>{area}</span>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenCateringModal?.('quote_tasting', isRtl ? k.nameAr : k.nameEn)
                      }
                      className="min-h-[36px] w-full rounded-xl bg-gradient-to-r from-[#4C1D95] to-[#3B0764] text-[#FFD54F] text-[11px] font-black cursor-pointer"
                    >
                      {isRtl ? 'طلب عرض سعر من المطبخ' : 'Request Kitchen Quote'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Organized Catering Menus (Compact Cards with Small 44px Crisp Unique Thumbnails) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-[#3B0764]">
            {isRtl ? 'قوائم المنيوهات المعتمدة (8)' : 'Catering Menus (8)'}
          </h2>
          <button
            type="button"
            onClick={() => setShowAllMenus((p) => !p)}
            className="text-[11px] font-black text-[#4C1D95] cursor-pointer hover:underline"
          >
            {showAllMenus
              ? isRtl ? 'عرض أقل' : 'Show Less'
              : isRtl ? 'عرض كل الـ 8' : 'Show All 8'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {visibleMenus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              onClick={() => onSelectMenu?.(menu)}
              className="group p-2.5 rounded-[18px] bg-gradient-to-br from-[#FFFBEB] via-[#FEF9C3]/85 to-[#EDE9FE] border border-[#4C1D95]/20 hover:border-[#EAB308] text-start shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 min-w-0"
            >
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#FFD54F] shrink-0 bg-[#4C1D95]">
                <img
                  src={menu.imageUrl}
                  alt={isRtl ? menu.titleAr : menu.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-0 end-0 px-1 rounded-tl-md bg-[#3B0764]/90 text-[#FFD54F] text-[9px] font-black tabular-nums">
                  {menu.order}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-[#3B0764] leading-snug line-clamp-2">
                  {isRtl ? menu.titleAr : menu.titleEn}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Compact Ha-Be Portal Shortcut */}
      <button
        type="button"
        onClick={() => setIsHabeInstallModalOpen(true)}
        className="w-full min-h-[50px] p-3 rounded-2xl bg-gradient-to-r from-[#FEF9C3] via-[#FDE68A]/75 to-[#EDE9FE] border border-[#4C1D95]/25 text-[#3B0764] flex items-center justify-between gap-3 cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#4C1D95] text-[#FFD54F] flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="text-start min-w-0">
            <div className="text-xs font-black truncate">{isRtl ? 'بوابة Ha-Be الألمانية' : 'Ha-Be Portal'}</div>
            <div className="text-[10px] font-bold text-[#581C87] truncate flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#EAB308]" />
              <span>{isRtl ? 'تثبيت QR السريع للشركة' : 'Quick QR App'}</span>
            </div>
          </div>
        </div>
        <ChefHat className="w-4 h-4 text-[#4C1D95] shrink-0" />
      </button>

      <HabeDirectInstallModal
        isOpen={isHabeInstallModalOpen}
        onClose={() => setIsHabeInstallModalOpen(false)}
        onOpenHabePortal={() => onNavigateSection('al_ain_habe')}
      />
    </div>
  );
};
