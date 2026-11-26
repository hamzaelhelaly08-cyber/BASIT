import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Gift,
  Info,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Ticket,
  UtensilsCrossed,
} from 'lucide-react';
import {
  CountryCode,
  FACTORY_CORPORATE_PHOTO_STRIP,
  LanguageCode,
  PHASE1_I18N,
  PLATFORM_FUNCTIONS,
  CentralKitchenId,
} from '../data/phase1Data';
import type { OfferAdDoc, TenantWorkspaceDoc } from '../types/faydEcosystem';
import {
  AL_AIN_WORLD_13_ACTIVITIES,
  AL_AIN_WORLD_ACTIVITIES_COVER,
  CHARITY_CARAVAN_CARTONS_IMG,
  CORPORATE_CHRISTMAS_XD_IMG,
  CORPORATE_PORTFOLIO_SECTORS,
  DATES_PRODUCTION_PACKAGING_IMG,
  EMPLOYEE_10_PCT_DISCLOSURE_AR,
  EMPLOYEE_10_PCT_DISCLOSURE_EN,
  LUXURY_OPEN_BUFFET_IMG,
  PARTNERS_PORTFOLIO_BOARD_IMG,
  SEASONAL_FACTORY_KAHK_IMG,
  canteenHotMealsImg,
  cinemaHallImg,
  madinatyCinemaImg,
  massagePoolImg,
  obourRallyImg,
} from '../data/visitorWorldData';
import { Service3DIcon } from './Service3DIcon';
import { FleetControlIcons } from './FleetControlIcons';
import { useOwnerCms } from '../context/OwnerCmsContext';

export type ShowcaseSubpageKey =
  | 'b2b_services_hub'
  | 'al_ain_hub'
  | 'entertainment_showcase'
  | 'corporate_portfolio'
  | 'auxiliary_portals'
  | 'all_functions_directory';

interface Phase1ShowcaseSubpagesProps {
  section: ShowcaseSubpageKey;
  lang: LanguageCode;
  country: CountryCode;
  approvedOffersAds?: OfferAdDoc[];
  myTenant?: TenantWorkspaceDoc | null;
  onOpenIconsGuide?: () => void;
  onOpenHabeInstallModal?: () => void;
  onNavigateSection: (
    section: string,
    kitchenId?: CentralKitchenId
  ) => void;
}

export const Phase1ShowcaseSubpages: React.FC<Phase1ShowcaseSubpagesProps> = ({
  section,
  lang,
  country,
  approvedOffersAds = [],
  myTenant = null,
  onOpenIconsGuide,
  onOpenHabeInstallModal,
  onNavigateSection,
}) => {
  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];
  const cms = useOwnerCms();

  const [fnFilter, setFnFilter] = useState<'all' | 'workspace' | 'commerce' | 'operations' | 'system'>('all');
  const [hrRating, setHrRating] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('ce_hr_meal_rating') || '0');
      return Number.isFinite(saved) && saved >= 1 && saved <= 5 ? saved : 0;
    } catch {
      return 0;
    }
  });
  const [hrRatedFeedback, setHrRatedFeedback] = useState(false);
  const [emergencyDispatchedAt, setEmergencyDispatchedAt] = useState<string | null>(null);

  const handleSetHrRating = (stars: number) => {
    setHrRating(stars);
    setHrRatedFeedback(true);
    try {
      localStorage.setItem('ce_hr_meal_rating', String(stars));
    } catch {
      // ignore storage failure
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const eligibleOffers = useMemo(() => {
    return approvedOffersAds.filter((off) => {
      if (!off.isApproved || !off.isActive) return false;
      if (off.validFrom && off.validFrom > todayStr) return false;
      if (off.validTo && off.validTo < todayStr) return false;
      if (off.targetScope && off.targetScope !== 'public') {
        const tenantActive =
          myTenant &&
          myTenant.status === 'active' &&
          (!myTenant.contractStatus || myTenant.contractStatus === 'contracted');
        if (!tenantActive) return false;
        const allowedCsv = (off.eligibleTenantIdsCsv || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (allowedCsv.length > 0 && myTenant && !allowedCsv.includes(myTenant.tenantId)) {
          return false;
        }
      }
      return true;
    });
  }, [approvedOffersAds, todayStr, myTenant]);

  const foodAd =
    eligibleOffers.find((o) => o.category === 'food' && (!o.countryCode || o.countryCode === country)) ||
    eligibleOffers.find((o) => o.category === 'food');
  const shoppingAd =
    eligibleOffers.find((o) => o.category === 'shopping' && (!o.countryCode || o.countryCode === country)) ||
    eligibleOffers.find((o) => o.category === 'shopping');
  const factoryAd =
    eligibleOffers.find((o) => o.category === 'factory_merchant' && (!o.countryCode || o.countryCode === country)) ||
    eligibleOffers.find((o) => o.category === 'factory_merchant');

  const filteredFunctions =
    fnFilter === 'all'
      ? PLATFORM_FUNCTIONS
      : PLATFORM_FUNCTIONS.filter((f) => f.group === fnFilter);

  const b2bCoreServiceCards = [
    {
      id: 'srv_factories',
      titleAr: 'إعاشة المصانع والشركات (B2B)',
      titleEn: 'Factory & Corporate Catering',
      descAr: 'عقود تغذية الورديات الصناعية، مساحات معزولة لكل منشأة، وضبط محاسبي لكل وجبة.',
      descEn: 'Isolated industrial shift meal contracts, supply tracking & compliance.',
      badgeAr: 'بوابة المصانع',
      badgeEn: 'B2B Industrial',
      ctaAr: 'فتح بوابة الجهات',
      ctaEn: 'Open B2B Portal',
      imageUrl: FACTORY_CORPORATE_PHOTO_STRIP[0].imageUrl,
      iconKey: 'factory',
      targetSection: 'fayd_merchant_workspace',
    },
    {
      id: 'srv_institutions',
      titleAr: 'الفنادق والمستشفيات والمؤسسات',
      titleEn: 'Hospitals, Hotels & Institutions',
      descAr: 'تغذية طبية ومؤسسية بمعايير HACCP وسلامة الغذاء وتوريد منتظم على مدار الساعة.',
      descEn: 'Medical & institutional meal supply under strict HACCP & food safety.',
      badgeAr: 'توريد مؤسسي',
      badgeEn: 'Institutional',
      ctaAr: 'استعراض خدمات الإعاشة',
      ctaEn: 'Explore Catering',
      imageUrl: canteenHotMealsImg,
      iconKey: 'utensils',
      targetSection: 'service_meals_offer',
    },
    {
      id: 'srv_buffet',
      titleAr: 'البوفيه المفتوح والمؤتمرات والضيافة',
      titleEn: 'Open Buffets, Events & Hospitality',
      descAr: 'تجهيز الأفراح، المؤتمرات التنفيذية، البوفيهات الفاخرة، وخدمات الوطنية اللوجستية.',
      descEn: 'Turnkey weddings, executive conferences, open buffets & hospitality crews.',
      badgeAr: 'الوطنية اللوجستية',
      badgeEn: 'Events & Buffets',
      ctaAr: 'اطلب عرض سعر',
      ctaEn: 'Request Quote',
      imageUrl: LUXURY_OPEN_BUFFET_IMG,
      iconKey: 'banquet',
      targetSection: 'logistics_services',
    },
    {
      id: 'srv_supply',
      titleAr: 'سلاسل الإمداد والتموين والأمن الغذائي',
      titleEn: 'Supply Chain, Dates & Logistics',
      descAr: 'توريدات المواد الغذائية وتعبئة التمور والموسميات والمنتجات الزراعية للمنشآت.',
      descEn: 'Direct corporate food supply, seasonal packs & logistics coordination.',
      badgeAr: 'إمداد وتموين',
      badgeEn: 'Supply Chain',
      ctaAr: 'المزيد من الخدمات',
      ctaEn: 'Explore Services',
      imageUrl: DATES_PRODUCTION_PACKAGING_IMG,
      iconKey: 'truck',
      targetSection: 'logistics_services',
    },
  ];

  const entertainmentShowcaseCards = [
    {
      id: 'ent_rally',
      nameAr: 'سباق الرالي والكارتينج — مدينة العبور',
      nameEn: 'Obour Rally & Karting Circuit',
      categoryAr: 'سباقات ورياضة محركات',
      categoryEn: 'Motorsport & Karting',
      imageUrl: obourRallyImg,
      targetSection: 'al_ain_entertainment_venues',
    },
    {
      id: 'ent_diamond',
      nameAr: 'سينما دايموند — العاشر من رمضان',
      nameEn: 'Diamond Cinema — 10th of Ramadan',
      categoryAr: 'دور العرض السينمائي',
      categoryEn: 'Cinema Experience',
      imageUrl: cinemaHallImg,
      targetSection: 'al_ain_entertainment_venues',
    },
    {
      id: 'ent_madinaty',
      nameAr: 'سينما مدينتي (VIP & IMAX)',
      nameEn: 'Madinaty VIP & IMAX Cinema',
      categoryAr: 'سينما وعروض VIP',
      categoryEn: 'VIP Cinema Lounge',
      imageUrl: madinatyCinemaImg,
      targetSection: 'al_ain_entertainment_venues',
    },
    {
      id: 'ent_spa_salt',
      nameAr: 'جناح السبا والاستجمام وبيت الملح',
      nameEn: 'Luxury Spa & Salt House Lounge',
      categoryAr: 'استجمام وعناية شخصية',
      categoryEn: 'Wellness & Salt Room',
      imageUrl: massagePoolImg,
      targetSection: 'al_ain_wellness',
    },
  ];

  const auxiliaryRows = [
    {
      section: 'entertainment_benefits',
      iconKey: 'cinema',
      titleAr: 'الترفيه والمزايا التعاقدية (أكوا بارك · الرالي · السيرك · السينمات)',
      titleEn: 'Entertainment & Contracted Perks',
      descAr: 'مزايا وخصومات 10% معتمدة للعاملين بالقطاعات المتعاقدة والأفراد.',
      descEn: 'Approved 10% leisure discounts across theme parks, cinemas, and clubs.',
      badgeAr: 'خصم 10% موظفين',
    },
    {
      section: 'al_ain_coupons',
      iconKey: 'coupon',
      titleAr: 'قسائم وعروض التوفير الرقمية (QR Coupons)',
      titleEn: 'Digital Discount Vouchers (QR)',
      descAr: 'كوبونات رقمية معتمدة لمنافذ عالم العين وأماكن الترفيه المحددة.',
      descEn: 'Ready-to-scan QR discount coupons across designated venues.',
      badgeAr: '9 قسائم',
    },
    {
      section: 'charity_good_deeds',
      iconKey: 'charity',
      titleAr: 'اعمل الخير وقوافل الإطعام الموثقة (قسم مستقل)',
      titleEn: 'Do Good — Verified Charity Caravans',
      descAr: 'مبادرات إطعام موثقة ببيان الجهة المنفذة وأرقام التنفيذ المعتمدة.',
      descEn: 'Verified charity feeding campaigns with audited execution counts.',
      badgeAr: 'قسم خيري مستقل',
    },
    {
      section: 'kaffarah_yamin',
      iconKey: 'scale',
      titleAr: 'كفارات اليمين — بالمرجعية الشرعية الرسمية',
      titleEn: 'Kaffarat Al-Yamin — Official Sharia Governed',
      descAr: 'منظومة مستقلة تماماً منضبطة بالمرجعية الشرعية وإثباتات التسليم.',
      descEn: 'Standalone Kaffarah flow governed by official verification.',
      badgeAr: 'توثيق شرعي',
    },
  ];

  if (section === 'b2b_services_hub') {
    return (
      <div className="space-y-5 pb-6">
        <section className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#292333] dark:text-[#F7F5FA]">
                {isRtl ? 'خدمات باسط الأساسية — الإعاشة والتشغيل والتوريد' : 'BASIT Core B2B Catering, Ops & Supply Services'}
              </h1>
              <p className="text-xs font-medium text-[#5E5570] dark:text-[#C8BBE0]">
                {isRtl
                  ? 'منظومة تشغيل مؤسسية للمصانع والشركات والفنادق والمستشفيات وسلاسل الإمداد'
                  : 'Institutional operations for factories, corporations, hospitals, hospitality & supply chains'}
              </p>
            </div>
            {onOpenIconsGuide && (
              <button
                type="button"
                onClick={onOpenIconsGuide}
                className="min-h-[44px] px-4 py-1.5 rounded-full bg-white dark:bg-[#1F172F] border border-[#62339A]/20 text-[#62339A] dark:text-[#FFC928] text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Info className="w-4 h-4" strokeWidth={1.85} />
                <span>{isRtl ? 'دليل الأيقونات' : 'Icons Guide'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {b2bCoreServiceCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigateSection(card.targetSection)}
                className="group text-start rounded-[24px] overflow-hidden bg-white dark:bg-[#1F172F] border border-[#62339A]/15 dark:border-[#A34FE8]/25 shadow-[0_12px_28px_-16px_rgba(98,51,154,0.22)] hover:border-[#62339A]/50 transition-all cursor-pointer flex flex-col sm:flex-row"
              >
                <div className="relative sm:w-48 h-44 sm:h-auto shrink-0 overflow-hidden bg-[#292333]">
                  <img
                    src={card.imageUrl}
                    alt={isRtl ? card.titleAr : card.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black shadow-xs">
                    {isRtl ? card.badgeAr : card.badgeEn}
                  </span>
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Service3DIcon iconKey={card.iconKey} size="md" />
                      <h2 className="text-sm sm:text-base font-black text-[#292333] dark:text-[#F7F5FA] group-hover:text-[#62339A] dark:group-hover:text-[#FFC928] transition-colors leading-snug">
                        {isRtl ? card.titleAr : card.titleEn}
                      </h2>
                    </div>
                    <p className="text-xs font-medium text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed">
                      {isRtl ? card.descAr : card.descEn}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#62339A]/10 dark:border-[#A34FE8]/20 text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                    <span>{isRtl ? card.ctaAr : card.ctaEn}</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" strokeWidth={1.85} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <FleetControlIcons lang={lang} onNavigateSection={onNavigateSection} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="rounded-[24px] basit-liquid-glass p-4 sm:p-5 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <Service3DIcon iconKey="sahar_meals" size="sm" />
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-black text-[#292333] dark:text-[#F7F5FA]">
                  {isRtl ? 'وجبات الطوارئ والورديات السريعة' : 'Emergency & Shift Meals'}
                </h3>
                <p className="text-[11px] text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed">
                  {isRtl
                    ? 'طلب فوري لدعم الورديات الإضافية أو حالات الطوارئ بالمصانع.'
                    : '1-tap request for extra factory shifts & urgent meal dispatches.'}
                </p>
              </div>
            </div>
            {emergencyDispatchedAt && (
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isRtl ? 'تم تسجيل طلب وجبة طوارئ' : 'Urgent request logged'}</span>
                </span>
                <span dir="ltr" className="font-mono text-[10px] tabular-nums">{emergencyDispatchedAt}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setEmergencyDispatchedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                onNavigateSection('quotation');
              }}
              className="min-h-[44px] w-full px-4 py-2.5 rounded-2xl basit-glass-btn-primary text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock3 className="w-4 h-4 text-[#FFC928]" strokeWidth={1.85} />
              <span>{isRtl ? 'طلب وجبة طارئة / استثنائية' : 'Request Emergency Meal'}</span>
            </button>
          </div>

          <div className="rounded-[24px] basit-liquid-glass p-4 sm:p-5 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <Service3DIcon iconKey="chef" size="sm" />
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-black text-[#292333] dark:text-[#F7F5FA]">
                  {isRtl ? 'تقييم جودة الوجبة السريع (HR)' : 'Instant HR Meal Quality Rating'}
                </h3>
                <p className="text-[11px] text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed">
                  {isRtl
                    ? 'قيّم جودة الوجبة اليومية بالنجوم لدعم متابعة الجودة.'
                    : 'Rate today’s meal quality cleanly for HR & kitchen QC.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 bg-[#F7F5FA] dark:bg-[#140F1F] p-2 rounded-2xl border border-[#62339A]/15">
              <div className="flex items-center gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleSetHrRating(star)}
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    aria-label={`${star} stars`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= hrRating
                          ? 'text-[#FFC928] fill-[#FFC928]'
                          : 'text-[#C9C4D6] dark:text-[#4A2378]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-black text-[#62339A] dark:text-[#FFC928] px-2 tabular-nums" dir="ltr">
                {hrRating > 0 ? `${hrRating}/5` : isRtl ? 'اختر' : 'Rate'}
              </span>
            </div>
            {hrRatedFeedback && (
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{isRtl ? 'شكراً لك، تم حفظ تقييم الوجبة بنجاح.' : 'Saved daily meal rating.'}</span>
              </div>
            )}
          </div>

          <div className="rounded-[24px] bg-white dark:bg-[#140F1F] border-2 border-red-600 p-4 sm:p-5 flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/habe-icon-192.png"
                alt="Ha-Be Direct Mobile Icon"
                className="w-12 h-12 rounded-2xl border-2 border-red-600 bg-white shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#292333] dark:text-[#F7F5FA]">
                  {isRtl ? 'تطبيق ومطعم مصنع Ha-Be' : 'Ha-Be Factory Standalone App'}
                </h3>
                <p className="text-[11px] text-[#5E5570] dark:text-[#C8BBE0]">
                  {isRtl ? 'بوابة مستقلة لوجبات وماركت العاملين.' : 'Dedicated staff meals & market portal.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {onOpenHabeInstallModal && (
                <button
                  type="button"
                  onClick={onOpenHabeInstallModal}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" strokeWidth={1.85} />
                  <span>{isRtl ? 'تثبيت + QR' : 'Install + QR'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateSection('al_ain_habe')}
                className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-[#292333] hover:bg-black text-white text-xs font-black cursor-pointer"
              >
                {isRtl ? 'فتح بوابة Ha-Be ←' : 'Open Ha-Be →'}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (section === 'al_ain_hub') {
    return (
      <div className="space-y-5 pb-6">
        <section className="rounded-[28px] basit-liquid-glass overflow-hidden border border-[#62339A]/25">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-5 relative min-h-[220px] bg-[#292333] overflow-hidden">
              <img
                src={AL_AIN_WORLD_ACTIVITIES_COVER}
                alt={isRtl ? 'بوابة عالم العين — 13 نشاطاً' : 'Al Ain World Gateway'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F172F]/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 inset-x-4 text-white space-y-1">
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                  AL AIN WORLD · 13 {isRtl ? 'نشاطاً مستقلاً' : 'Distinct Activities'}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white">
                  {isRtl ? 'عالم العين | القطاع السياحي والخدمي' : 'Al Ain World | Visitor & Leisure Hub'}
                </h1>
              </div>
            </div>

            <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#62339A] dark:text-[#FFC928] text-xs font-black">
                  <Compass className="w-4 h-4" strokeWidth={1.85} />
                  <span>{isRtl ? 'منطقة مستقلة عن الإعاشة المؤسسية BASIT' : 'Dedicated Section Separate from B2B Catering'}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed">
                  {isRtl
                    ? 'يضم عالم العين 13 نشاطاً متكاملاً للزوار والعائلات: الفود كورت، البيتزا، المطاعم الشرقية والغربية، المندي، طواجن الكبدة الجملي، مجالس كبار الزوار، المشاوي، السبا، بيت الملح، حلاق فلافل ستار، العطارة، الصيدلية، والماركت.'
                    : 'Explore 13 activities inside Al Ain World: Food Court, Pizza, Oriental & Western, Mandi, Camel Liver, VIP Majlis, Grills, Spa, Salt House, Falafel Star Salon, Attara, Pharmacy & Grand Market.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {AL_AIN_WORLD_13_ACTIVITIES.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => onNavigateSection(act.targetSection)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/15 hover:border-[#62339A] text-start text-xs font-bold text-[#292333] dark:text-[#F7F5FA] cursor-pointer transition-colors flex items-center justify-between gap-2"
                    >
                      <span>
                        <span className="text-[#62339A] dark:text-[#FFC928] font-black tabular-nums me-1.5">
                          {act.orderNumber}.
                        </span>
                        {isRtl ? act.nameAr : act.nameEn}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#62339A] dark:text-[#FFC928] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#62339A]/10 dark:border-[#A34FE8]/20">
                <button
                  type="button"
                  onClick={() => onNavigateSection('al_ain_restaurants')}
                  className="min-h-[44px] px-6 py-2.5 rounded-full basit-glass-btn-primary text-xs font-black flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FFC928]" strokeWidth={1.85} />
                  <span>{isRtl ? 'دخول عالم العين الكامل (13 نشاطاً)' : 'Enter Full Al Ain World'}</span>
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateSection('al_ain_majlis')}
                  className="min-h-[44px] px-5 py-2.5 rounded-full basit-glass-pill text-xs font-black text-[#62339A] dark:text-[#FFC928] cursor-pointer"
                >
                  {isRtl ? 'مجالس كبار الزوار والكبدة الجملي' : 'VIP Majlis & Camel Liver'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (section === 'entertainment_showcase') {
    return (
      <div className="space-y-5 pb-6">
        <section className="rounded-[24px] basit-liquid-glass p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#292333] dark:text-[#F7F5FA]">
                {isRtl ? 'الترفيه المتعاقد والعروض العائلية والسبا' : 'Contracted Entertainment, Cinemas & Wellness'}
              </h1>
              <p className="text-xs font-medium text-[#5E5570] dark:text-[#C8BBE0]">
                {isRtl
                  ? 'رالي السيارات بالعبور، سينما دايموند العاشر من رمضان، سينما مدينتي، والسبا وبيت الملح.'
                  : 'Obour Rally, Diamond Cinema 10th of Ramadan, Madinaty Cinema & Salt House Spa.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('al_ain_entertainment_venues')}
              className="min-h-[44px] px-4 py-1.5 rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer whitespace-nowrap"
            >
              {isRtl ? 'حجز أماكن الترفيه ←' : 'Book Venues →'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {entertainmentShowcaseCards.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => onNavigateSection(venue.targetSection)}
                className="group text-start rounded-[20px] overflow-hidden basit-glass-tile cursor-pointer flex flex-col"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#292333]">
                  <img
                    src={venue.imageUrl}
                    alt={isRtl ? venue.nameAr : venue.nameEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] font-black text-[#62339A] dark:text-[#FFC928]">
                    {isRtl ? venue.categoryAr : venue.categoryEn}
                  </div>
                  <h2 className="text-xs sm:text-sm font-black text-[#292333] dark:text-[#F7F5FA] leading-snug">
                    {isRtl ? venue.nameAr : venue.nameEn}
                  </h2>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section
          className="rounded-[24px] p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: `linear-gradient(125deg, ${cms.primaryPurple} 0%, #4A2378 100%)`,
          }}
        >
          <div className="flex items-start gap-3.5">
            <div
              className="w-10 h-10 rounded-xl text-[#292333] flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: cms.accentYellow }}
            >
              <BadgePercent className="w-5 h-5" strokeWidth={1.85} />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                {isRtl ? 'مزايا العاملين بالقطاعات المتعاقدة + عروض حتى 10% موسمياً' : 'Contracted Employee 10% Perks'}
              </span>
              <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                {isRtl ? EMPLOYEE_10_PCT_DISCLOSURE_AR : EMPLOYEE_10_PCT_DISCLOSURE_EN}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateSection('al_ain_coupons')}
            className="min-h-[44px] px-5 py-2.5 rounded-full text-[#292333] text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            style={{ backgroundColor: cms.accentYellow }}
          >
            <Ticket className="w-4 h-4" strokeWidth={1.85} />
            <span>{isRtl ? 'طلب كوبون خصم 10% ←' : 'Request 10% Coupon →'}</span>
          </button>
        </section>
      </div>
    );
  }

  if (section === 'corporate_portfolio') {
    return (
      <div className="space-y-5 pb-6">
        <section className="rounded-[24px] basit-liquid-glass overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-l from-[#4A2378] to-[#62339A] text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Service3DIcon iconKey="portfolio" size="md" />
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black mb-1">
                  {isRtl ? 'سابقة أعمال ممتدة على مدار سنوات ومكملين' : 'Multi-Year Continuous Partnerships'}
                </span>
                <h1 className="text-base sm:text-lg font-black text-white">
                  {isRtl ? 'سابقة الأعمال والشراكات المؤسسية والمواسم' : 'Corporate Track Record & Seasonal Campaigns'}
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('al_ain_occasions')}
              className="min-h-[44px] px-4 py-2 rounded-full basit-glass-btn-yellow text-xs font-black cursor-pointer whitespace-nowrap"
            >
              {isRtl ? 'استعرض المواسم والشركات ←' : 'Corporate Seasons →'}
            </button>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#62339A]/20 bg-[#292333] shadow-sm">
              <img
                src={PARTNERS_PORTFOLIO_BOARD_IMG}
                alt={isRtl ? 'شعارات الشركات والمؤسسات الشريكة' : 'Partner Corporate Logos Portfolio'}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  titleAr: 'احتفالات الشركات والمصانع',
                  titleEn: 'Corporate Events',
                  img: CORPORATE_CHRISTMAS_XD_IMG,
                  section: 'al_ain_occasions',
                },
                {
                  titleAr: 'توزيعات الكحك والمواسم',
                  titleEn: 'Seasonal Packs',
                  img: SEASONAL_FACTORY_KAHK_IMG,
                  section: 'al_ain_occasions',
                },
                {
                  titleAr: 'قوافل الإغاثة وأعمال الخير',
                  titleEn: 'Humanitarian Relief',
                  img: CHARITY_CARAVAN_CARTONS_IMG,
                  section: 'charity_good_deeds',
                },
              ].map((item) => (
                <button
                  key={item.titleEn}
                  type="button"
                  onClick={() => onNavigateSection(item.section)}
                  className="group text-start rounded-2xl overflow-hidden bg-white dark:bg-[#1F172F] border border-[#62339A]/15 hover:border-[#62339A]/45 cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#292333]">
                    <img
                      src={item.img}
                      alt={isRtl ? item.titleAr : item.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-2.5 text-xs font-black text-[#292333] dark:text-[#F7F5FA] group-hover:text-[#62339A] dark:group-hover:text-[#FFC928] flex items-center justify-between gap-1">
                    <span className="truncate">{isRtl ? item.titleAr : item.titleEn}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" strokeWidth={1.85} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CORPORATE_PORTFOLIO_SECTORS.map((sec) => (
              <div
                key={sec.id}
                className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#140F1F] border border-[#62339A]/12 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Service3DIcon iconKey={sec.iconKey} size="sm" />
                  <h3 className="text-xs font-black text-[#62339A] dark:text-[#FFC928] leading-snug">
                    {isRtl ? sec.sectorTitleAr : sec.sectorTitleEn}
                  </h3>
                </div>
                <div className="text-[11px] font-bold text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed">
                  {sec.partners.map((p) => (isRtl ? p.nameAr : p.nameEn)).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (section === 'auxiliary_portals') {
    return (
      <div className="space-y-5 pb-6">
        <section className="rounded-[24px] basit-liquid-glass p-4 sm:p-6 space-y-4">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#292333] dark:text-[#F7F5FA]">
              {isRtl ? 'الأقسام المستقلة — المزايا والخير وكفارة اليمين' : 'Auxiliary Services & Standalone Portals'}
            </h1>
            <p className="text-xs text-[#5E5570] dark:text-[#C8BBE0]">
              {isRtl
                ? 'مسارات مستقلة للوصول السريع مع فصل كامل للأقسام الخيرية والشرعية'
                : 'Direct organized rows with strict operational governance'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {auxiliaryRows.map((row) => (
              <button
                key={row.section}
                type="button"
                onClick={() => onNavigateSection(row.section)}
                className="group w-full text-start min-h-[72px] p-4 rounded-2xl bg-white dark:bg-[#1F172F] border border-[#62339A]/15 hover:border-[#62339A]/50 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Service3DIcon iconKey={row.iconKey} size="sm" />
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-[#292333] dark:text-[#F7F5FA] group-hover:text-[#62339A] dark:group-hover:text-[#FFC928]">
                      {isRtl ? row.titleAr : row.titleEn}
                    </div>
                    <div className="text-[11px] font-medium text-[#5E5570] dark:text-[#C8BBE0]">
                      {isRtl ? row.descAr : row.descEn}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#F7F5FA] dark:bg-[#2A2040] text-[#62339A] dark:text-[#FFC928] text-[10px] font-black whitespace-nowrap">
                    {row.badgeAr}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" strokeWidth={1.85} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] basit-liquid-glass p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Service3DIcon iconKey="gift" size="sm" />
            <div>
              <h2 className="text-sm font-black text-[#292333] dark:text-[#F7F5FA]">
                {isRtl ? 'إهداء قسائم رقمية وحجز المناسبات' : 'Digital Gift Cards & Events'}
              </h2>
              <p className="text-[11px] text-[#5E5570] dark:text-[#C8BBE0]">
                {isRtl
                  ? 'أصدر قسائم هدايا QR أو احجز تجهيز مؤتمرات واحتفالات الشركات.'
                  : 'Send QR gift coupons or book corporate celebrations & buffets.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateSection('al_ain_coupons')}
              className="min-h-[44px] px-4 py-2 rounded-2xl basit-glass-btn-yellow text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-4 h-4" strokeWidth={1.85} />
              <span>{isRtl ? 'قسائم الهدايا' : 'Gift QR'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('logistics_services')}
              className="min-h-[44px] px-4 py-2 rounded-2xl basit-glass-pill text-xs font-black text-[#62339A] dark:text-[#FFC928] cursor-pointer"
            >
              {isRtl ? 'حجز فعالية' : 'Book Event'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Default: all_functions_directory
  return (
    <div className="space-y-5 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-[24px] bg-gradient-to-br from-[#62339A] to-[#4A2378] text-white p-5 shadow-md flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                {foodAd ? (isRtl ? foodAd.discountBadgeAr : foodAd.discountBadgeEn) : isRtl ? 'بوابة عالم العين' : 'Al Ain Gateway'}
              </span>
              <h3 className="text-base font-black text-white leading-snug pt-1">
                {foodAd ? (isRtl ? foodAd.titleAr : foodAd.titleEn) : isRtl ? 'الـ 13 نشاطاً ومطاعم عالم العين' : 'Al Ain World 13 Activities & Dining'}
              </h3>
            </div>
            <Service3DIcon iconKey="utensils" size="md" />
          </div>
          <p className="text-xs text-white/90 leading-relaxed">
            {foodAd?.terms
              ? foodAd.terms
              : isRtl
                ? 'الفود كورت، البيتزا، المندي، المشاوي، الكبدة الجملي، المجالس، السبا، والماركت.'
                : 'Food court, pizza, Mandi, grills, camel liver, VIP majlis, spa & grand market.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigateSection('al_ain_restaurants')}
            className="min-h-[44px] px-5 py-2 rounded-full basit-glass-btn-yellow text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" strokeWidth={1.85} />
            <span>{foodAd ? (isRtl ? foodAd.ctaAr : foodAd.ctaEn) : isRtl ? 'استعراض عالم العين' : 'Explore Al Ain World'}</span>
          </button>
        </div>

        <div className="rounded-[24px] basit-liquid-glass text-[#292333] dark:text-[#F7F5FA] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                {shoppingAd ? (isRtl ? shoppingAd.discountBadgeAr : shoppingAd.discountBadgeEn) : isRtl ? 'سوق باسط الموحد' : 'BASIT Marketplace'}
              </span>
              <h3 className="text-base font-black text-[#62339A] dark:text-[#FFC928] leading-snug pt-1">
                {shoppingAd ? (isRtl ? shoppingAd.titleAr : shoppingAd.titleEn) : isRtl ? 'تسوق المنتجات والعروض المعتمدة' : 'Shop Verified Merchant Catalogs'}
              </h3>
            </div>
            <Service3DIcon iconKey="offers" size="md" />
          </div>
          <p className="text-xs text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed">
            {shoppingAd?.terms
              ? shoppingAd.terms
              : isRtl
                ? 'استعراض منتجات التجار وإتمام الدفع عبر فوري وفودافون كاش وإنستا باي.'
                : 'Browse verified merchant SKUs & pay via Fawry, Vodafone Cash, or InstaPay.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigateSection('fayd_marketplace')}
            className="min-h-[44px] px-5 py-2 rounded-full basit-glass-btn-primary text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#FFC928]" strokeWidth={1.85} />
            <span>{shoppingAd ? (isRtl ? shoppingAd.ctaAr : shoppingAd.ctaEn) : isRtl ? 'افتح السوق' : 'Open Market'}</span>
          </button>
        </div>

        <div className="rounded-[24px] bg-gradient-to-br from-[#292333] to-[#4A2378] text-white p-5 shadow-md flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                {factoryAd ? (isRtl ? factoryAd.discountBadgeAr : factoryAd.discountBadgeEn) : isRtl ? 'بوابة المصانع والجهات المتعاقدة' : 'B2B Factory & Entity Portal'}
              </span>
              <h3 className="text-base font-black text-white leading-snug pt-1">
                {factoryAd ? (isRtl ? factoryAd.titleAr : factoryAd.titleEn) : isRtl ? 'مساحة مستقلة للمصانع والشركات' : 'Dedicated Workspace for Contracted Entities'}
              </h3>
            </div>
            <Service3DIcon iconKey="factory" size="md" />
          </div>
          <p className="text-xs text-[#E4DFF0] leading-relaxed">
            {factoryAd?.terms
              ? factoryAd.terms
              : isRtl
                ? 'جداول الإعاشة، المزايا التعاقدية، صلاحيات الفريق، والتسويات المالية بعزل كامل.'
                : 'Catering schedules, staff perks, team permissions & payouts isolated per entity.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigateSection('fayd_onboarding')}
            className="min-h-[44px] px-5 py-2 rounded-full basit-glass-btn-yellow text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Store className="w-4 h-4" strokeWidth={1.85} />
            <span>{factoryAd ? (isRtl ? factoryAd.ctaAr : factoryAd.ctaEn) : isRtl ? 'انضم كجهة أو شريك' : 'Partner Onboarding'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-[24px] basit-liquid-glass p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#292333] dark:text-[#F7F5FA]">
              {t.servicesHeading}
            </h1>
            <p className="text-xs font-medium text-[#5E5570] dark:text-[#C8BBE0] mt-0.5">
              {t.servicesSubheading}
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {(
              [
                ['all', isRtl ? `الكل (${PLATFORM_FUNCTIONS.length})` : `All (${PLATFORM_FUNCTIONS.length})`],
                ['workspace', isRtl ? 'المساحات والأعمال' : 'Workspaces'],
                ['commerce', isRtl ? 'المزايا والتجارة' : 'Benefits & Commerce'],
                ['operations', isRtl ? 'التشغيل واللوجستيات' : 'Ops & Logistics'],
                ['system', isRtl ? 'الحساب والإدارة' : 'System'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFnFilter(key)}
                className={`min-h-[44px] md:min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                  fnFilter === key
                    ? 'basit-glass-btn-primary text-white'
                    : 'basit-glass-pill text-[#292333] dark:text-[#EFE9F9] hover:text-[#62339A]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredFunctions.map((fn) => (
            <button
              key={fn.id}
              type="button"
              onClick={() => onNavigateSection(fn.targetSection)}
              className={`group text-start p-3.5 sm:p-4 rounded-[22px] basit-glass-tile cursor-pointer flex flex-col justify-between gap-3 ${
                fn.highlighted
                  ? 'ring-2 ring-[#62339A]/25 dark:ring-[#FFC928]/40'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <Service3DIcon iconKey={fn.iconKey} size="md" />
                <ArrowUpRight className="w-4 h-4 text-[#5E5570] dark:text-[#C8BBE0] group-hover:text-[#62339A] dark:group-hover:text-[#FFC928] transition-colors shrink-0" strokeWidth={1.85} />
              </div>

              <div className="space-y-1">
                <h2 className="text-xs sm:text-sm font-black text-[#292333] dark:text-[#F7F5FA] leading-snug group-hover:text-[#62339A] dark:group-hover:text-[#FFC928] transition-colors">
                  {isRtl ? fn.titleAr : fn.titleEn}
                </h2>
                <p className="text-[11px] font-medium text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed line-clamp-2">
                  {isRtl ? fn.subtitleAr : fn.subtitleEn}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-[24px] basit-liquid-glass p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-[#62339A] dark:text-[#FFC928]">
          <ShieldCheck className="w-4 h-4" />
          <span>{isRtl ? 'مرتبط بنظام الصلاحيات المعزولة (RBAC)' : 'Protected by Role-Based Access Governance'}</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateSection('home')}
          className="min-h-[44px] px-4 py-2 rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer"
        >
          {isRtl ? 'العودة لمركز التحكم الرئيسي' : 'Back to Launcher Hub'}
        </button>
      </section>
    </div>
  );
};
