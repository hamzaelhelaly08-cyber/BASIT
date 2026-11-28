import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowRight,
  ArrowLeft,
  UtensilsCrossed,
  Crown,
  Ticket,
  Gift,
  FileText,
  Music,
  CheckCircle2,
  MapPin,
  Flame,
  ShieldCheck,
  Loader2,
  Star,
  Clock,
  Heart,
  ShoppingCart,
  Pizza,
  ChefHat,
  Sparkles,
  Droplets,
  Scissors,
  Sprout,
  ShoppingBag,
} from 'lucide-react';
import { LanguageCode, PHASE1_I18N } from '../data/phase1Data';
import type { FavoriteEntry } from './FavoritesDrawer';
import type { Phase1CartItem } from './Phase1CartDrawer';
import {
  AL_AIN_RESTAURANTS,
  AlAinRestaurantItem,
  EMPLOYEE_10_PCT_DISCLOSURE_AR,
  EMPLOYEE_10_PCT_DISCLOSURE_EN,
  EXPERIMENTAL_TAG_AR,
  EXPERIMENTAL_TAG_EN,
  MAJLIS_EXPERIENCES,
  OCCASIONS_CAMPAIGNS,
  PARTNER_ENTERTAINMENT_VENUES,
  WATANIYA_COUPONS,
  WELLNESS_SERVICES,
  CORPORATE_CHRISTMAS_XD_IMG,
  LUXURY_OPEN_BUFFET_IMG,
  SEASONAL_FACTORY_KAHK_IMG,
  DATES_PRODUCTION_PACKAGING_IMG,
  COFFEE_NUTS_ROASTERY_IMG,
  FINEST_DATES_VARIETIES,
  DATES_VALUE_CHAIN_STAGES,
  kidsPlayZoneImg,
  AL_AIN_WORLD_13_ACTIVITIES,
  AL_AIN_WORLD_ACTIVITIES_COVER,
} from '../data/visitorWorldData';
import { Service3DIcon } from './Service3DIcon';
import { VoucherCouponCard } from './VoucherCouponCard';
import { BasitBrandMark } from './BasitBrandMark';
import { HabeGermanMarketPortal } from './HabeGermanMarketPortal';
import { submitEmployeeCouponRequest } from '../services/faydFirestoreService';
import kidsCircusImg from '../assets/images/al_ain_kids_circus_fun_1794529872787.jpg';
import oudNightImg from '../assets/images/al_ain_oud_oriental_night_1794529872267.jpg';
import { SeasonalCharityGoodsSection } from './SeasonalCharityGoodsSection';

interface AlAinVisitorWorldViewProps {
  lang: LanguageCode;
  activeSection: string;
  customLogoDataUrl: string | null;
  onUploadLogo: (dataUrl: string) => void;
  onNavigateSection: (section: string) => void;
  firebaseUser?: User | null;
  onRequireSignIn?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenCamelLiverModal?: () => void;
  onAddAuditLog?: (actionAr: string, actionEn: string, details: string) => void;
  onOpenWideMenuPdf?: () => void;
  canApproveHabePurchases?: boolean;
  isOwnerAdmin?: boolean;
  isAuthVerified?: boolean;
  isGuestMode?: boolean;
  currentAuthUserEmail?: string;
  currentUsername?: string;
  currentEmployeeCode?: string;
  onSignOut?: () => void;
  favoriteIds?: string[];
  onToggleFavorite?: (entry: FavoriteEntry) => void;
  onAddToCart?: (item: Omit<Phase1CartItem, 'quantity'>) => void;
}

export const AlAinVisitorWorldView: React.FC<AlAinVisitorWorldViewProps> = ({
  lang,
  activeSection,
  onNavigateSection,
  firebaseUser,
  onRequireSignIn,
  onShowToast,
  onOpenCamelLiverModal,
  onAddAuditLog,
  onOpenWideMenuPdf,
  canApproveHabePurchases = false,
  isOwnerAdmin = false,
  isAuthVerified,
  isGuestMode = false,
  currentAuthUserEmail,
  currentUsername,
  currentEmployeeCode,
  onSignOut,
  favoriteIds = [],
  onToggleFavorite,
  onAddToCart,
}) => {
  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [detailTab, setDetailTab] = useState<'menu' | 'reviews' | 'info'>('menu');
  const [restaurantFilter, setRestaurantFilter] = useState<'all' | 'arabic' | 'global'>('all');

  const [empEmployer, setEmpEmployer] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState(firebaseUser?.displayName || '');
  const [empPhone, setEmpPhone] = useState('');
  const [empDate, setEmpDate] = useState(new Date().toISOString().slice(0, 10));
  const [empPeople, setEmpPeople] = useState(2);
  const [empOfferTitle, setEmpOfferTitle] = useState('مطاعم وترفيه قطاع مول العين');
  const [empSubmitting, setEmpSubmitting] = useState(false);
  const [empBookingId, setEmpBookingId] = useState<string | null>(null);

  const handleEmployee10Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empEmployer.trim() || !empCode.trim() || empPhone.trim().length < 6) {
      onShowToast?.(
        isRtl
          ? 'يرجى إدخال جهة العمل وكود الموظف ورقم الهاتف (6 أرقام على الأقل).'
          : 'Please enter employer name, employee code, and valid phone.'
      );
      return;
    }
    if (!firebaseUser || !firebaseUser.emailVerified) {
      onShowToast?.(
        isRtl
          ? 'سجّل الدخول بجوجل أولاً لإرسال طلب خصم 10% لصندوق اعتماد المالك.'
          : 'Please sign in with Google first to submit the 10% discount request.'
      );
      onRequireSignIn?.();
      return;
    }
    setEmpSubmitting(true);
    try {
      const id = await submitEmployeeCouponRequest(firebaseUser, {
        employerName: empEmployer.trim(),
        employeeCode: empCode.trim(),
        employeeName: empName.trim() || firebaseUser.displayName || 'موظف متعاقد',
        phone: empPhone.trim(),
        peopleCount: empPeople,
        requestedDate: empDate,
        offerTitle: empOfferTitle,
      });
      setEmpBookingId(id);
      onShowToast?.(
        isRtl
          ? `تم إرسال طلب كوبون خصم 10% [${id}] للمالك لاعتماده.`
          : `Employee 10% coupon request [${id}] sent to Owner.`
      );
    } catch (err) {
      onShowToast?.(err instanceof Error ? err.message : 'تعذر إرسال الطلب.');
    } finally {
      setEmpSubmitting(false);
    }
  };

  const renderEmployee10Card = () => (
    <div className="rounded-[24px] bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] text-white p-4 sm:p-5 border border-[rgba(212,175,55,0.45)] shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl basit-glass-btn-yellow flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black text-[#FFC928] block">
              {isRtl ? EMPLOYEE_10_PCT_DISCLOSURE_AR : EMPLOYEE_10_PCT_DISCLOSURE_EN}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              {isRtl
                ? 'طلب كوبون خصم 10% للعاملين بالقطاعات المتعاقدة'
                : 'Request Contracted Employee 10% Coupon'}
            </h3>
          </div>
        </div>
      </div>

      {empBookingId ? (
        <div className="p-4 rounded-2xl bg-white text-[#292333] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs font-black">
              تم تسجيل طلب خصم 10% برقم <span className="font-mono text-[#62339A]">{empBookingId}</span> وإشعار المالك!
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEmpBookingId(null)}
            className="px-3 py-1.5 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
          >
            طلب جديد
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmployee10Submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <input
            type="text"
            required
            value={empEmployer}
            onChange={(e) => setEmpEmployer(e.target.value)}
            placeholder={isRtl ? 'جهة العمل / المصنع المتعاقد *' : 'Employer / Factory *'}
            className="px-3.5 py-2.5 rounded-xl bg-white text-[#292333] placeholder-slate-400 font-bold focus:outline-none"
          />
          <input
            type="text"
            required
            value={empCode}
            onChange={(e) => setEmpCode(e.target.value)}
            placeholder={isRtl ? 'كود الموظف / الرقم الوظيفي *' : 'Employee Code *'}
            className="px-3.5 py-2.5 rounded-xl bg-white text-[#292333] placeholder-slate-400 font-bold focus:outline-none"
          />
          <input
            type="text"
            required
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            placeholder={isRtl ? 'اسم الموظف *' : 'Employee Name *'}
            className="px-3.5 py-2.5 rounded-xl bg-white text-[#292333] placeholder-slate-400 font-bold focus:outline-none"
          />
          <input
            type="tel"
            required
            dir="ltr"
            value={empPhone}
            onChange={(e) => setEmpPhone(e.target.value)}
            placeholder="010XXXXXXXX *"
            className="px-3.5 py-2.5 rounded-xl bg-white text-[#292333] placeholder-slate-400 font-bold focus:outline-none"
          />
          <select
            value={empOfferTitle}
            onChange={(e) => setEmpOfferTitle(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white text-[#292333] font-bold focus:outline-none"
          >
            <option value="مطاعم وترفيه قطاع مول العين">مطاعم وترفيه قطاع مول العين</option>
            <option value="غزال سبا وشيل أوت مساج">عناية وسبا: غزال سبا وشيل أوت</option>
            <option value="بيت الملح والصالون الرجالي">بيت الملح والصالون الرجالي</option>
            <option value="سينما دايموند ومدينتي">سينما دايموند ومدينتي</option>
            <option value="أكوا بارك ورالي العبور وسيرك العين">أكوا بارك / الرالي / السيرك</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={empDate}
              onChange={(e) => setEmpDate(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white text-[#292333] font-bold focus:outline-none"
            />
            <input
              type="number"
              min="1"
              max="20"
              value={empPeople}
              onChange={(e) => setEmpPeople(Number(e.target.value))}
              className="w-16 px-2.5 py-2.5 rounded-xl bg-white text-[#292333] font-bold text-center focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-[#F8FAFC]/90 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFC928]" />
              <span>يُطبق الخصم بعد مطابقة الكود مع القطاعات المتعاقدة بقطاع مول العين فقط.</span>
            </span>
            <button
              type="submit"
              disabled={empSubmitting}
              className="px-6 py-3 rounded-full basit-glass-btn-yellow text-xs font-black flex items-center gap-2 cursor-pointer"
            >
              {empSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
              <span>{isRtl ? 'إرسال طلب خصم 10% للمالك' : 'Submit 10% Request'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const isSingleRestaurant = activeSection.startsWith('al_ain_restaurant:');
  const activeRestaurantId = isSingleRestaurant
    ? activeSection.replace('al_ain_restaurant:', '')
    : null;
  const activeRestaurant: AlAinRestaurantItem | undefined = activeRestaurantId
    ? AL_AIN_RESTAURANTS.find((r) => r.id === activeRestaurantId)
    : undefined;

  const subTabs = [
    {
      id: 'al_ain_restaurants',
      ar: `مطاعم العين (${AL_AIN_RESTAURANTS.length})`,
      en: `Al Ain Restaurants (${AL_AIN_RESTAURANTS.length})`,
    },
    {
      id: 'seasonal_provisions',
      ar: 'إمدادات الخير والكراتين الموسمية 🎀',
      en: 'Seasonal Provisions & Charity 🎀',
    },
    { id: 'al_ain_entertainment_venues', ar: 'الترفيه والملاهي والسينمات', en: 'Parks & Cinemas' },
    { id: 'al_ain_majlis', ar: 'مجلس ضيافة العين', en: 'Hospitality Majlis' },
    { id: 'al_ain_wellness', ar: 'العناية وبيت الملح', en: 'Spa & Salt House' },
    { id: 'al_ain_kids', ar: 'Kids Area الأطفال', en: 'Kids Area' },
    { id: 'al_ain_circus', ar: 'سيرك العين أمام مول العين', en: 'Al Ain Circus' },
    { id: 'al_ain_oriental_nights', ar: 'ليالي الطرب الشرقي', en: 'Oriental Nights' },
    { id: 'al_ain_coupons', ar: 'قسائم الخصومات (9)', en: 'Coupons (9)' },
    { id: 'al_ain_occasions', ar: 'المناسبات والاحتفالات', en: 'Occasions' },
    { id: 'al_ain_habe', ar: 'منصة Ha-Be المباشرة', en: 'Ha-Be Point' },
  ].filter((tab) =>
    isGuestMode
      ? tab.id === 'al_ain_restaurants' || tab.id === 'seasonal_provisions' || tab.id === 'al_ain_coupons'
      : true
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back & Section Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            activeRestaurant
              ? onNavigateSection('al_ain_restaurants')
              : onNavigateSection('home')
          }
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.45)] hover:border-[#D4AF37] text-xs font-extrabold text-[#240046] dark:text-[#FFFDF7] cursor-pointer whitespace-nowrap"
        >
          <BackIcon className="w-4 h-4 text-[#5A189A] dark:text-[#FFE875]" />
          <span>
            {activeRestaurant
              ? isRtl
                ? 'العودة إلى مطاعم العين'
                : 'Back to Al Ain Restaurants'
              : t.nav.home}
          </span>
        </button>

        <div className="min-h-[44px] inline-flex items-center text-xs font-bold text-[#240046] dark:text-[#FFE875] bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] border border-[rgba(212,175,55,0.4)] px-3.5 py-2 rounded-full">
          {isRtl ? EXPERIMENTAL_TAG_AR : EXPERIMENTAL_TAG_EN}
        </div>
      </div>

      {/* Wrapped Sub-Navigation (Zero Off-Screen Clipping inside 430px Shell) */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {subTabs.map((tab) => {
          const selected =
            activeSection === tab.id ||
            (isSingleRestaurant && tab.id === 'al_ain_restaurants');
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigateSection(tab.id)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] font-black leading-tight text-center transition-all cursor-pointer flex items-center justify-center ${
                selected
                  ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-white border border-[rgba(212,175,55,0.45)] shadow-xs'
                  : 'bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] text-[#240046] dark:text-[#FFFDF7] border border-[rgba(212,175,55,0.4)] hover:border-[#D4AF37]'
              }`}
            >
              {isRtl ? tab.ar : tab.en}
            </button>
          );
        })}
      </div>

      {/* 0) STANDALONE HA-BE (BA_HE) DIRECT EMPLOYEE PLATFORM */}
      {activeSection === 'al_ain_habe' && (
        <HabeGermanMarketPortal
          isRtl={isRtl}
          onClose={() => onNavigateSection('al_ain_restaurants')}
          onAddAuditLog={onAddAuditLog || (() => {})}
          onShowToast={onShowToast || (() => {})}
          onOpenWideMenuPdf={onOpenWideMenuPdf}
          canApproveHabePurchases={canApproveHabePurchases}
          isOwnerAdmin={isOwnerAdmin}
          currentAuthUserEmail={currentAuthUserEmail || firebaseUser?.email || ''}
          currentUsername={currentUsername}
          currentEmployeeCode={currentEmployeeCode}
          isAuthVerified={typeof isAuthVerified === 'boolean' ? isAuthVerified : Boolean(firebaseUser?.emailVerified)}
          onGoogleSignIn={onRequireSignIn}
          onSignOut={onSignOut}
        />
      )}

      {/* 1) SINGLE RESTAURANT DETAIL PAGE (Poster 1 Phone #4: Stars, Time, Order Now, Tabs, Add to Cart) */}
      {activeRestaurant && (() => {
        const restFavId = `rest_${activeRestaurant.id}`;
        const isRestFav = favoriteIds.includes(restFavId);
        const defaultDishPrice = activeRestaurant.id === 'pizza_al_ain' ? 89 : 95;
        return (
          <div className="space-y-6">
            <div className="rounded-[28px] overflow-hidden basit-liquid-glass border border-[#62339A]/15">
              <div className="relative h-60 sm:h-80 overflow-hidden bg-[#F7F5FA] dark:bg-[#1F172F]">
                <img
                  src={activeRestaurant.imageUrl}
                  alt={isRtl ? activeRestaurant.nameAr : activeRestaurant.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() =>
                      onToggleFavorite({
                        id: restFavId,
                        titleAr: activeRestaurant.nameAr,
                        titleEn: activeRestaurant.nameEn,
                        subtitleAr: activeRestaurant.taglineAr,
                        subtitleEn: activeRestaurant.taglineEn,
                        imageUrl: activeRestaurant.imageUrl,
                        targetSection: `al_ain_restaurant:${activeRestaurant.id}`,
                      })
                    }
                    className="absolute top-4 end-4 min-w-[44px] min-h-[44px] rounded-full bg-white/95 dark:bg-[#1F172F]/95 text-[#62339A] dark:text-[#FFC928] shadow-lg flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    aria-label={isRtl ? 'حفظ في المفضلة' : 'Toggle favorite'}
                  >
                    <Heart className={`w-5 h-5 ${isRestFav ? 'fill-[#62339A] dark:fill-[#FFC928]' : ''}`} />
                  </button>
                )}

                <span className="absolute bottom-3.5 start-3.5 px-3 py-1 rounded-full bg-white/95 dark:bg-[#1F172F]/95 text-[#292333] dark:text-white text-[11px] font-black shadow-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#62339A] dark:text-[#FFC928]" />
                  <span>{isRtl ? 'مول العين — عالم من المذاقات' : 'Al Ain Mall — World of Flavors'}</span>
                </span>
              </div>

              <div className="p-5 sm:p-8 space-y-5 bg-white dark:bg-[#1F172F]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Service3DIcon iconKey={activeRestaurant.iconKey} size="lg" />
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-[#292333] dark:text-white">
                        {isRtl ? activeRestaurant.nameAr : activeRestaurant.nameEn}
                      </h2>

                      {/* Poster 1 Phone #4 Rating Stars + Delivery Time */}
                      <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold">
                        <div className="inline-flex items-center gap-1" dir="ltr">
                          <span className="font-black text-[#292333] dark:text-white tabular-nums">4.8</span>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 text-[#FFC928] fill-[#FFC928]" />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F7F5FA] dark:bg-[#271E3B] text-[#4A2378] dark:text-[#FFC928] tabular-nums">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isRtl ? '25 - 35 دقيقة' : '25 - 35 min'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Poster 1 Purple "اطلب الآن" / Visitor Quote CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isGuestMode) {
                        onShowToast?.(
                          isRtl
                            ? 'الأسعار مخفية للزوار — سجّل الدخول أو اطلب عرض سعر للتفاصيل.'
                            : 'Prices hidden for visitors — Sign in or request a quote.'
                        );
                        onNavigateSection('visitor_contact');
                        return;
                      }
                      const firstDish = isRtl
                        ? activeRestaurant.sampleHighlightsAr[0]
                        : activeRestaurant.sampleHighlightsEn[0];
                      if (onAddToCart && firstDish) {
                        onAddToCart({
                          id: `${activeRestaurant.id}_sig`,
                          nameAr: `${activeRestaurant.nameAr} — ${activeRestaurant.sampleHighlightsAr[0]}`,
                          nameEn: `${activeRestaurant.nameEn} — ${activeRestaurant.sampleHighlightsEn[0]}`,
                          kitchenNameAr: activeRestaurant.nameAr,
                          kitchenNameEn: activeRestaurant.nameEn,
                          approvedPrice: defaultDishPrice,
                          imageUrl: activeRestaurant.imageUrl,
                        });
                      } else {
                        setDetailTab('menu');
                      }
                    }}
                    className="min-h-[48px] px-7 py-2.5 rounded-full basit-glass-btn-primary text-sm font-black flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#FFC928]" />
                    <span>
                      {isGuestMode
                        ? isRtl
                          ? 'طلب عرض سعر'
                          : 'Request Quote'
                        : isRtl
                          ? 'اطلب الآن'
                          : 'Order Now'}
                    </span>
                  </button>
                </div>

                {/* Poster 1 Segmented Tabs: القائمة | التقييمات | المعلومات */}
                <div className="flex items-center gap-2 border-b border-[#E6E0F5] dark:border-[#62339A]/25 pb-2">
                  {(
                    [
                      ['menu', isRtl ? 'القائمة' : 'Menu'],
                      ['reviews', isRtl ? 'التقييمات' : 'Reviews'],
                      ['info', isRtl ? 'المعلومات' : 'Info'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDetailTab(key)}
                      className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                        detailTab === key
                          ? 'bg-[#62339A] text-white shadow-xs'
                          : 'bg-[#F7F5FA] dark:bg-[#271E3B] text-[#5E5570] dark:text-[#C4B5FD] hover:text-[#62339A]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {detailTab === 'menu' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isGuestMode
                        ? isRtl
                          ? 'أصناف القائمة (الأسعار تظهر بعد تسجيل الحساب):'
                          : 'Menu Highlights (Register to unlock pricing):'
                        : isRtl
                          ? 'أطباق القائمة المختارة (إضافة فورية للسلة):'
                          : 'Selected Menu Items (1-Tap Add to Cart):'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {(isRtl
                        ? activeRestaurant.sampleHighlightsAr
                        : activeRestaurant.sampleHighlightsEn
                      ).map((hl, i) => {
                        const dishPrice = defaultDishPrice + i * 15;
                        return (
                          <div
                            key={i}
                            className="p-4 rounded-2xl basit-glass-tile flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-black text-[#292333] dark:text-white">
                                  {hl}
                                </div>
                                <div className="text-[11px] font-bold text-[#62339A] dark:text-[#FFC928] mt-1 tabular-nums" dir={isGuestMode ? (isRtl ? 'rtl' : 'ltr') : 'ltr'}>
                                  {isGuestMode
                                    ? isRtl
                                      ? 'الأسعار بعد التسجيل — اطلب عرض سعر'
                                      : 'Register to unlock price'
                                    : `${dishPrice} ${isRtl ? 'ج.م' : 'EGP'}`}
                                </div>
                              </div>
                            </div>
                            {!isGuestMode && onAddToCart && (
                              <button
                                type="button"
                                onClick={() =>
                                  onAddToCart({
                                    id: `${activeRestaurant.id}_item_${i}`,
                                    nameAr: activeRestaurant.sampleHighlightsAr[i] || hl,
                                    nameEn: activeRestaurant.sampleHighlightsEn[i] || hl,
                                    kitchenNameAr: activeRestaurant.nameAr,
                                    kitchenNameEn: activeRestaurant.nameEn,
                                    approvedPrice: dishPrice,
                                    imageUrl: activeRestaurant.imageUrl,
                                  })
                                }
                                className="min-h-[40px] w-full rounded-full basit-glass-btn-yellow text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'إضافة للسلة' : 'Add to Cart'}</span>
                              </button>
                            )}
                            {isGuestMode && (
                              <button
                                type="button"
                                onClick={() => onNavigateSection('visitor_contact')}
                                className="min-h-[40px] w-full rounded-full basit-glass-btn-yellow text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'طلب عرض سعر' : 'Request Quote'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {detailTab === 'reviews' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { nameAr: 'أحمد حسن', commentAr: 'خدمة ممتازة وجودة تغليف رائعة وتوصيل سريع في موعده.', stars: 5 },
                      { nameAr: 'سارة محمود', commentAr: 'الأكل طازج وساخن والخصم التعاقدي سهل الاستخدام جداً.', stars: 5 },
                      { nameAr: 'محمد علي', commentAr: 'تجربة مميزة لرواد مول العين وللعائلات.', stars: 4 },
                    ].map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-2xl basit-glass-tile space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-[#292333] dark:text-white">{rev.nameAr}</span>
                          <div className="flex items-center gap-0.5" dir="ltr">
                            {Array.from({ length: rev.stars }).map((_, sIdx) => (
                              <Star key={sIdx} className="w-3.5 h-3.5 text-[#FFC928] fill-[#FFC928]" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                          {rev.commentAr}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === 'info' && (
                  <div className="space-y-2 p-4 rounded-2xl basit-glass-tile">
                    <div className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                      {isRtl ? activeRestaurant.taglineAr : activeRestaurant.taglineEn}
                    </div>
                    <p className="text-xs sm:text-sm text-[#292333] dark:text-[#E2E8F0] leading-relaxed">
                      {isRtl ? activeRestaurant.descriptionAr : activeRestaurant.descriptionEn}
                    </p>
                  </div>
                )}

                {activeRestaurant.id === 'dates_world_al_ain' && (
                  <div className="space-y-4 pt-2 border-t border-[#E6E0F5] dark:border-[#62339A]/25">
                    <div className="space-y-1">
                      <div className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                        {isRtl
                          ? 'أفضل جودة في مصر — منتجين منذ الإنتاجية وحتى التعبئة والتغليف'
                          : 'Egypt’s Finest Quality — Farm Production through Packaging & Wrapping'}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#292333] dark:text-white">
                        {isRtl
                          ? 'مراحل الإنتاج والتعبئة والتغليف + الأصناف الأربعة الرئيسية'
                          : 'Farm-to-Packaging Value Chain & Flagship Varieties'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {DATES_VALUE_CHAIN_STAGES.map((st) => (
                        <div key={st.step} className="p-4 rounded-2xl basit-glass-tile space-y-1">
                          <div className="text-xs font-black text-[#62339A] dark:text-[#FFC928] tabular-nums">
                            {st.step}. {isRtl ? st.titleAr : st.titleEn}
                          </div>
                          <p className="text-xs text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                            {isRtl ? st.descAr : st.descEn}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {FINEST_DATES_VARIETIES.map((v) => (
                        <div key={v.id} className="p-4 rounded-2xl basit-glass-tile space-y-1.5">
                          <h4 className="text-sm font-black text-[#292333] dark:text-white">
                            {isRtl ? v.nameAr : v.nameEn}
                          </h4>
                          <div className="text-[11px] font-bold text-[#62339A] dark:text-[#FFC928]">
                            {isRtl ? v.originAr : v.originEn}
                          </div>
                          <p className="text-xs text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                            {isRtl ? v.specAr : v.specEn}
                          </p>
                          <div className="pt-1.5 border-t border-[#E6E0F5] dark:border-[#62339A]/25 text-[11px] font-extrabold text-[#292333] dark:text-[#E2E8F0]">
                            {isRtl ? v.packagingAr : v.packagingEn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigateSection('al_ain_coupons')}
                    className="min-h-[44px] px-6 py-2.5 rounded-full basit-glass-btn-primary text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Ticket className="w-4 h-4 text-[#FFC928]" />
                    <span>{isRtl ? 'استعراض كوبون الخصم التجريبي' : 'View Demo Discount Coupon'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('quotation')}
                    className="min-h-[44px] px-6 py-2.5 rounded-full basit-glass-btn-yellow text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isRtl ? 'طلب حجز / عرض مجموعات' : 'Group Booking Inquiry'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2) ALL 12 AL AIN RESTAURANTS HUB + DEDICATED 13 ACTIVITIES IN AL AIN WORLD */}
      {activeSection === 'al_ain_restaurants' && (
        <div className="space-y-6">
          {/* Dedicated Al Ain World (13 Activities) Gateway Showcase */}
          <div className="rounded-[28px] overflow-hidden basit-liquid-glass border border-[#62339A]/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-5 relative min-h-[210px] bg-[#292333] overflow-hidden">
                <img
                  src={AL_AIN_WORLD_ACTIVITIES_COVER}
                  alt={isRtl ? 'مجلس وأنشطة عالم العين الـ 13' : 'Al Ain World 13 Activities Showcase'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F172F]/90 via-black/30 to-transparent" />
                <div className="absolute bottom-4 inset-x-4 text-white space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                    AL AIN WORLD · 13 {isRtl ? 'نشاطاً متكاملاً' : 'Activities'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {isRtl ? 'عالم العين | القطاع السياحي والخدمي والتجاري' : 'Al Ain World | Dining, Wellness & Retail'}
                  </h2>
                </div>
              </div>

              <div className="lg:col-span-7 p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#292333] dark:text-white">
                      {isRtl ? 'دليل الأنشطة الـ 13 المعتمدة داخل عالم العين' : 'The 13 Approved Activities inside Al Ain World'}
                    </h3>
                    <p className="text-xs font-medium text-[#5E5570] dark:text-[#C4B5FD]">
                      {isRtl
                        ? 'فصل كامل عن نشاط الإعاشة المؤسسية BASIT — اضغط على أي نشاط للانتقال المباشر.'
                        : 'Separated from BASIT B2B Catering — tap any activity to explore.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {AL_AIN_WORLD_13_ACTIVITIES.map((act) => {
                    const ActIcon =
                      act.iconKey === 'pizza'
                        ? Pizza
                        : act.iconKey === 'chef'
                          ? ChefHat
                          : act.iconKey === 'flame' || act.iconKey === 'grills'
                            ? Flame
                            : act.iconKey === 'crown'
                              ? Crown
                              : act.iconKey === 'spa'
                                ? Sparkles
                                : act.iconKey === 'salt'
                                  ? Droplets
                                  : act.iconKey === 'barber'
                                    ? Scissors
                                    : act.iconKey === 'sprout'
                                      ? Sprout
                                      : act.iconKey === 'shield'
                                        ? ShieldCheck
                                        : act.iconKey === 'market'
                                          ? ShoppingBag
                                          : UtensilsCrossed;

                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => onNavigateSection(act.targetSection)}
                        className="group text-start rounded-2xl overflow-hidden bg-white dark:bg-[#1F172F] border border-[#62339A]/15 hover:border-[#62339A] transition-all cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#292333]">
                          <img
                            src={act.imageUrl}
                            alt={isRtl ? act.nameAr : act.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute top-2 start-2 w-6 h-6 rounded-lg bg-[#FFC928] text-[#292333] text-[10px] font-black flex items-center justify-center tabular-nums shadow-xs">
                            {String(act.orderNumber).padStart(2, '0')}
                          </span>
                          <span className="absolute bottom-2 end-2 w-7 h-7 rounded-lg bg-white/95 text-[#62339A] flex items-center justify-center shadow-xs">
                            <ActIcon className="w-4 h-4" strokeWidth={1.85} />
                          </span>
                        </div>
                        <div className="p-2.5 space-y-0.5 flex-1">
                          <div className="text-[11px] font-black text-[#292333] dark:text-white leading-snug line-clamp-1 group-hover:text-[#62339A] dark:group-hover:text-[#FFC928]">
                            {isRtl ? act.nameAr : act.nameEn}
                          </div>
                          <p className="text-[10px] font-medium text-[#5E5570] dark:text-[#C4B5FD] line-clamp-1">
                            {isRtl ? act.descAr : act.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-[28px] basit-liquid-glass space-y-2">
            <div className="flex items-center gap-4">
              <Service3DIcon iconKey="utensils" size="md" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#292333] dark:text-white">
                  {isRtl
                    ? 'مطاعم العين | عالم من المذاقات'
                    : 'Al Ain Restaurants | World of Flavors'}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#5E5570] dark:text-[#C4B5FD] mt-1">
                  {isRtl
                    ? `${AL_AIN_RESTAURANTS.length} منفذاً وجناحاً لرواد مول العين — أقسام متنوعة ومميزة تشمل التمور ومحمصة البن.`
                    : `${AL_AIN_RESTAURANTS.length} dedicated dining & specialty outlets in Al Ain Mall.`}
                </p>
              </div>
            </div>
          </div>

          {/* Highlighted Specialty Wings: Dates & Coffee & Nuts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <button
              type="button"
              onClick={() => onNavigateSection('al_ain_restaurant:dates_world_al_ain')}
              className="group text-start rounded-[28px] overflow-hidden basit-liquid-glass hover:border-[#62339A] transition-all cursor-pointer flex flex-col sm:flex-row"
            >
              <div className="sm:w-52 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#292333]">
                <img
                  src={DATES_PRODUCTION_PACKAGING_IMG}
                  alt={isRtl ? 'تمور المجدول والبرحي والوادي والفرافرة' : 'Medjool, Barhi, Wadi & Farafra Dates'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Service3DIcon iconKey="dates_harvest" size="md" />
                    <span className="text-[11px] font-black text-[#62339A] dark:text-[#FFC928]">
                      {isRtl ? 'عالم من المذاقات · أفضل جودة في مصر' : 'World of Flavors · Finest Quality'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#292333] dark:text-white group-hover:text-[#62339A] dark:group-hover:text-[#FFC928]">
                    {isRtl ? 'تمور المجدول والبرحي والوادي والفرافرة' : 'Medjool, Barhi, Wadi & Farafra Dates'}
                  </h3>
                  <p className="text-xs text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                    {isRtl
                      ? 'منتجين منذ الإنتاجية بالمزارع وحتى الفرز والتعبئة والتغليف الفاخر والتصدير الدولي.'
                      : 'Farm production through grading, luxury packaging and export.'}
                  </p>
                </div>
                <div className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                  {isRtl ? 'عرض مراحل الإنتاج والأصناف ←' : 'Explore Production & Varieties →'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection('al_ain_restaurant:coffee_nuts')}
              className="group text-start rounded-[28px] overflow-hidden basit-liquid-glass hover:border-[#62339A] transition-all cursor-pointer flex flex-col sm:flex-row"
            >
              <div className="sm:w-52 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#292333]">
                <img
                  src={COFFEE_NUTS_ROASTERY_IMG}
                  alt={isRtl ? 'البن والمكسرات' : 'Coffee & Luxury Nuts'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Service3DIcon iconKey="coffee" size="md" />
                    <span className="text-[11px] font-black text-[#62339A] dark:text-[#FFC928]">
                      {isRtl ? 'عالم من المذاقات · محمصة طازجة' : 'World of Flavors · Fresh Roastery'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#292333] dark:text-white group-hover:text-[#62339A] dark:group-hover:text-[#FFC928]">
                    {isRtl ? 'البن والمكسرات' : 'Coffee & Luxury Nuts'}
                  </h3>
                  <p className="text-xs text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                    {isRtl
                      ? 'توليفات البن التركي والعربي المحوج بالهيل، الفستق، الكاجو، اللوز، والبندق المحمص يومياً.'
                      : 'Freshly roasted Turkish & Arabic coffee blends with premium roasted nuts.'}
                  </p>
                </div>
                <div className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                  {isRtl ? 'استعراض أصناف المحمصة ←' : 'Explore Coffee & Nuts →'}
                </div>
              </div>
            </button>
          </div>

          {/* Restaurant Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {(
              [
                ['all', isRtl ? `كل المطاعم (${AL_AIN_RESTAURANTS.length})` : `All Dining (${AL_AIN_RESTAURANTS.length})`],
                ['arabic', isRtl ? 'مطاعم عربية وشرقية' : 'Arabic & Oriental'],
                ['global', isRtl ? 'عالمية، تمور وقهوة' : 'Global, Dates & Market'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRestaurantFilter(key)}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] font-black cursor-pointer transition-all flex items-center justify-center ${
                  restaurantFilter === key
                    ? 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-white border border-[rgba(212,175,55,0.45)] shadow-xs'
                    : 'bg-[rgba(255,255,255,0.95)] dark:bg-[#240046] text-[#240046] dark:text-[#FFFDF7] border border-[rgba(212,175,55,0.4)] hover:border-[#D4AF37]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AL_AIN_RESTAURANTS.filter((r) => {
              if (restaurantFilter === 'all') return true;
              const isArabic = [
                'koshary_al_ain',
                'foul_taameya',
                'grills_al_ain',
                'pizza_al_ain',
              ].includes(r.id);
              return restaurantFilter === 'arabic' ? isArabic : !isArabic;
            }).map((r) => {
              const favId = `rest_${r.id}`;
              const isFav = favoriteIds.includes(favId);
              return (
                <div
                  key={r.id}
                  className="group relative rounded-[28px] overflow-hidden basit-glass-tile flex flex-col"
                >
                  {/* 3D Festive Ribbon for Coming Soon Outlets */}
                  {r.ribbonText && (
                    <div className="absolute top-3 start-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#851C2C] to-[#B91C1C] text-white font-black text-[11px] shadow-lg border border-[#FFC928]/60">
                      <span>{r.ribbonText}</span>
                    </div>
                  )}

                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite({
                          id: favId,
                          titleAr: r.nameAr,
                          titleEn: r.nameEn,
                          subtitleAr: r.taglineAr,
                          subtitleEn: r.taglineEn,
                          imageUrl: r.imageUrl,
                          targetSection: `al_ain_restaurant:${r.id}`,
                        });
                      }}
                      className="absolute top-3 end-3 z-10 min-w-[44px] min-h-[44px] rounded-full bg-white/95 dark:bg-[#1A052E]/95 text-[#5A189A] dark:text-[#FFE875] border border-[rgba(212,175,55,0.45)] shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                      aria-label={isRtl ? 'حفظ في المفضلة' : 'Toggle Favorite'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#5A189A] dark:fill-[#FFE875]' : ''}`} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigateSection(`al_ain_restaurant:${r.id}`)}
                    className="text-start flex-1 flex flex-col cursor-pointer"
                  >
                    <div className="h-44 w-full overflow-hidden bg-[#F7F5FA] dark:bg-[#1F172F]">
                      <img
                        src={r.imageUrl}
                        alt={isRtl ? r.nameAr : r.nameEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 w-full">
                      <div className="flex items-start gap-3.5">
                        <Service3DIcon iconKey={r.iconKey} size="md" />
                        <div>
                          <h3 className="text-base font-black text-[#292333] dark:text-white group-hover:text-[#62339A] dark:group-hover:text-[#FFC928] transition-colors">
                            {isRtl ? r.nameAr : r.nameEn}
                          </h3>
                          <p className="text-xs font-medium text-[#5E5570] dark:text-[#C4B5FD] mt-0.5 line-clamp-2">
                            {isRtl ? r.taglineAr : r.taglineEn}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#E6E0F5] dark:border-[#62339A]/25 flex items-center justify-between text-[11px] font-extrabold text-[#62339A] dark:text-[#FFC928]">
                        <span>
                          {r.isComingSoon
                            ? isRtl
                              ? 'قريباً في مول العين / العثيم 🎀'
                              : 'Coming Soon 🎀'
                            : isRtl
                            ? 'اطلب الآن · عرض القائمة ←'
                            : 'Order Now · Menu →'}
                        </span>
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Poster 2 "مستقبل قريباً*" Section + "المزيد من المطاعم" Purple CTA */}
          <div className="p-5 rounded-[28px] basit-liquid-glass space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#4A2378] dark:text-[#FFC928]">
                {isRtl ? 'مستقبل قريباً*' : 'Launching Soon Expansion*'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                {isRtl ? 'توسعات عالم من المذاقات' : 'Specialty Expansions'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  target: 'al_ain_restaurant:indian_kitchen',
                  titleAr: 'المطاعم الهندية قريباً',
                  titleEn: 'Indian Cuisine Wing',
                  iconKey: 'utensils',
                },
                {
                  target: 'al_ain_restaurant:turkish_grill',
                  titleAr: 'المطاعم التركية قريباً',
                  titleEn: 'Turkish Culinary Wing',
                  iconKey: 'grill',
                },
              ].map((soon) => (
                <button
                  key={soon.target}
                  type="button"
                  onClick={() => onNavigateSection(soon.target)}
                  className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/15 flex items-center justify-between gap-3 cursor-pointer hover:border-[#62339A] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Service3DIcon iconKey={soon.iconKey} size="sm" />
                    <span className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? soon.titleAr : soon.titleEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-[#62339A] dark:text-[#FFC928]">
                    {isRtl ? 'معاينة ←' : 'Preview →'}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateSection('kitchens')}
              className="w-full min-h-[48px] rounded-full basit-glass-btn-primary text-sm font-black cursor-pointer"
            >
              {isRtl ? 'المزيد من المطاعم والمطابخ المركزية' : 'More Restaurants & Central Kitchens'}
            </button>
          </div>
        </div>
      )}

      {/* 2B) SEPARATED ENTERTAINMENT VENUES DIRECTORY */}
      {activeSection === 'al_ain_entertainment_venues' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-[28px] basit-liquid-glass">
            <div className="flex items-center gap-4">
              <Service3DIcon iconKey="aqua_park" size="md" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#292333] dark:text-white">
                  {isRtl
                    ? 'دليل الترفيه والملاهي والسينمات والسبا — BASIT | باسط'
                    : 'Entertainment, Aqua Park, Rally & Cinemas Directory'}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#5E5570] dark:text-[#94A3B8] mt-1">
                  {isRtl
                    ? 'فصل كامل بين كل وجهة ترفيهية بهويتها وصورتها الحقيقية: أكوا بارك للأطفال، سباق الرالي في العبور، سيرك العين أمام مول العين، سينما دايموند العاشر من رمضان، وسينما في مدينتي.'
                    : 'Clear separation between Aqua Park, Obour Rally, Al Ain Circus, Cinemas, Kids Area, and Salt House Spa.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PARTNER_ENTERTAINMENT_VENUES.map((venue) => (
              <div
                key={venue.id}
                className="rounded-[28px] overflow-hidden basit-glass-tile flex flex-col"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#1F172F]">
                  <img
                    src={venue.imageUrl}
                    alt={isRtl ? venue.nameAr : venue.nameEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3.5">
                      <Service3DIcon iconKey={venue.iconKey} size="md" />
                      <div>
                        <div className="text-[11px] font-black text-[#62339A] dark:text-[#FFC928]">
                          {isRtl ? venue.categoryAr : venue.categoryEn}
                        </div>
                        <h3 className="text-base font-black text-[#292333] dark:text-white mt-0.5">
                          {isRtl ? venue.nameAr : venue.nameEn}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-[#5E5570] dark:text-[#94A3B8] leading-relaxed">
                      {isRtl ? venue.descAr : venue.descEn}
                    </p>
                    <div className="text-[11px] font-bold text-[#292333] dark:text-[#E2E8F0] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] shrink-0" />
                      <span>{isRtl ? venue.locationAr : venue.locationEn}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/40 dark:border-[#62339A]/25">
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateSection(
                          venue.targetSection === 'al_ain_entertainment_venues'
                            ? 'quotation'
                            : venue.targetSection
                        )
                      }
                      className="flex-1 py-2.5 px-4 rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer whitespace-nowrap"
                    >
                      {venue.targetSection === 'al_ain_entertainment_venues'
                        ? isRtl
                          ? 'طلب حجز للمجموعة'
                          : 'Request Group Booking'
                        : isRtl
                          ? 'فتح صفحة الوجهة'
                          : 'Open Venue Page'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateSection('al_ain_coupons')}
                      className="py-2.5 px-4 rounded-full basit-glass-pill hover:border-[#62339A] text-[#292333] dark:text-white text-xs font-extrabold cursor-pointer whitespace-nowrap"
                    >
                      {isRtl ? 'القسائم' : 'Vouchers'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3) MAJLIS HOSPITALITY AL AIN */}
      {activeSection === 'al_ain_majlis' && (
        <div className="space-y-6">
          <div className="rounded-[28px] overflow-hidden basit-liquid-glass">
            <div className="relative h-64 sm:h-80 overflow-hidden bg-[#1F172F]">
              <img
                src={AL_AIN_WORLD_ACTIVITIES_COVER}
                alt="مجلس ضيافة العين"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <Service3DIcon iconKey="sparkles" size="md" />
                    <div>
                      <span className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                        {isRtl
                          ? 'تجربة ضيافة مستقلة بطابع عربي فخم'
                          : 'Independent Luxury Arabian Hospitality'}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#292333] dark:text-white">
                        {isRtl ? 'مجلس ضيافة العين' : 'Al Ain Hospitality Majlis'}
                      </h2>
                    </div>
                  </div>
                  {onOpenCamelLiverModal && (
                    <button
                      type="button"
                      onClick={onOpenCamelLiverModal}
                      className="px-5 py-3 rounded-full basit-glass-btn-primary text-xs font-black flex items-center gap-2 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-[#FFC928]" />
                      <span>طلب صينية كبدة جملي VIP مباشرة</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#5E5570] dark:text-[#CBD5E1] leading-relaxed max-w-3xl">
                  {isRtl
                    ? 'قسم مستقل للتجمعات وضيافة كبار الزوار والعائلات — يضم تجربة الكبدة الجمالي، ولائم المندي، وجلسات الضيافة الراقية.'
                    : 'An upscale independent destination for VIP gatherings, Camel Liver culinary tasting, saffron Mandi feasts, and curated lounge hospitality.'}
                </p>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MAJLIS_EXPERIENCES.map((exp) => {
              const isCamel = exp.id === 'camel_liver_taste' && onOpenCamelLiverModal;
              return (
                <div
                  key={exp.id}
                  className="rounded-[28px] overflow-hidden basit-glass-tile flex flex-col"
                >
                  <div className="h-52 overflow-hidden bg-[#F8FAFC] dark:bg-[#1F172F]">
                    <img
                      src={exp.imageUrl}
                      alt={isRtl ? exp.titleAr : exp.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#292333] dark:text-white">
                        {isRtl ? exp.titleAr : exp.titleEn}
                      </h3>
                      <p className="text-xs text-[#5E5570] dark:text-[#94A3B8] leading-relaxed mt-1">
                        {isRtl ? exp.descAr : exp.descEn}
                      </p>
                    </div>
                    <div className="pt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#62339A] dark:text-[#FFC928]">
                        {isCamel
                          ? isRtl ? 'توريد وضيافة حية + فاتورة PDF' : 'Live Griddle + Invoice PDF'
                          : isRtl ? 'تجريبي — بانتظار اعتماد الأسعار' : 'Demo Pricing'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          isCamel ? onOpenCamelLiverModal() : onNavigateSection('quotation')
                        }
                        className="px-5 py-2.5 rounded-full basit-glass-btn-primary text-xs font-extrabold cursor-pointer whitespace-nowrap"
                      >
                        {isCamel
                          ? isRtl ? 'اطلب كبدة جملي VIP' : 'Order Camel Liver VIP'
                          : isRtl ? 'حجز تجربة المجلس' : 'Reserve Majlis'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4) ENTERTAINMENT & PERSONAL CARE + SALT HOUSE (Single Salt House Card — Zero Duplication) */}
      {activeSection === 'al_ain_wellness' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-[28px] basit-liquid-glass space-y-3">
            <div className="flex items-center gap-4">
              <Service3DIcon iconKey="salt" size="md" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#292333] dark:text-white">
                  {isRtl
                    ? 'بيت الملح والسبا وصالون الحلاقة في مول العين'
                    : 'Salt House, Spa & Luxury Salon at Al Ain Mall'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5E5570] dark:text-[#94A3B8] mt-1">
                  {isRtl
                    ? 'صالون الحلاقة الرجالي · حمام البخار · السبا · الحمام المغربي · بيت الملح'
                    : 'Luxury Men’s Salon · Steam Room · Spa · Moroccan Hammam · Salt House'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WELLNESS_SERVICES.map((svc) => (
              <div
                key={svc.id}
                className={`rounded-[28px] overflow-hidden basit-glass-tile flex flex-col ${
                  svc.isSaltHouse ? 'ring-2 ring-[#62339A]/70 dark:ring-[#FFC928]/60' : ''
                }`}
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#1F172F]">
                  <img
                    src={svc.imageUrl}
                    alt={isRtl ? svc.titleAr : svc.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3.5">
                      <Service3DIcon iconKey={svc.iconKey} size="md" />
                      <h4 className="text-base font-black text-[#292333] dark:text-white">
                        {isRtl ? svc.titleAr : svc.titleEn}
                      </h4>
                    </div>
                    <p className="text-xs text-[#5E5570] dark:text-[#94A3B8] leading-relaxed">
                      {isRtl ? svc.descAr : svc.descEn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('al_ain_coupons')}
                    className="w-full py-2.5 rounded-full basit-glass-pill hover:bg-[#62339A] hover:text-white text-[#62339A] dark:text-[#FFC928] text-xs font-black transition-colors cursor-pointer"
                  >
                    {svc.isSaltHouse
                      ? isRtl ? 'عرض كوبون بيت الملح' : 'Salt House Voucher'
                      : isRtl ? 'حجز أو استعراض الخصم' : 'Book or View Offer'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {renderEmployee10Card()}
        </div>
      )}

      {/* 5) KIDS AREA (Uses dedicated Indoor Kids Soft-Play photo — NOT Circus photo) */}
      {activeSection === 'al_ain_kids' && (
        <div className="rounded-[28px] overflow-hidden basit-liquid-glass">
          <div className="h-64 sm:h-80 overflow-hidden bg-[#F8FAFC]">
            <img
              src={kidsPlayZoneImg}
              alt="Kids Area — منطقة ألعاب الأطفال الداخلية"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-4">
              <Service3DIcon iconKey="kids" size="lg" />
              <div>
                <span className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                  Kids Area · {isRtl ? 'منطقة العائلة المستقلة عن السيرك' : 'Family Soft-Play Zone'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#292333] dark:text-white">
                  {isRtl ? 'استمتع أنت وأولادك في Kids Area' : 'Enjoy Together With Your Kids'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                isRtl ? 'ألعاب الأطفال الحديثة' : 'Interactive Kids Games',
                isRtl ? 'منطقة لعب آمنة ومجهزة' : 'Safe Soft-Play Arena',
                isRtl ? 'الأنشطة والورش العائلية' : 'Family Activities & Workshops',
                isRtl ? 'عروض وكوبونات خاصة للأطفال' : 'Dedicated Kids Passes',
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl basit-glass-tile font-extrabold text-[#292333] dark:text-white flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateSection('al_ain_coupons')}
              className="px-6 py-3 rounded-full basit-glass-btn-primary text-xs sm:text-sm font-black cursor-pointer whitespace-nowrap"
            >
              {isRtl ? 'تصفح قسائم Kids Area التجريبية' : 'Explore Kids Vouchers'}
            </button>
          </div>
        </div>
      )}

      {/* 6) CIRCUS & ENTERTAINMENT (Dedicated exclusively to Al Ain Circus opposite Al Ain Mall) */}
      {activeSection === 'al_ain_circus' && (
        <div className="rounded-[28px] overflow-hidden basit-liquid-glass">
          <div className="h-64 sm:h-80 overflow-hidden">
            <img
              src={kidsCircusImg}
              alt={isRtl ? 'سيرك العين أمام مول العين' : 'Al Ain Circus Opposite Al Ain Mall'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-4">
              <Service3DIcon iconKey="circus" size="lg" />
              <div>
                <span className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                  {isRtl ? 'أمام مول العين مباشرة — عروض حية وأضواء مبهجة' : 'Directly Opposite Al Ain Mall — Live Shows'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#292333] dark:text-white">
                  {isRtl ? 'سيرك العين أمام مول العين' : 'Al Ain Circus — Opposite Al Ain Mall'}
                </h2>
              </div>
            </div>
            <p className="text-sm text-[#5E5570] dark:text-[#CBD5E1] leading-relaxed max-w-3xl">
              {isRtl
                ? 'أجواء خيمة سيرك العين المضيئة أمام مول العين، العروض البهلوانية والاستعراضية، والألعاب الترفيهية للعائلات — مدمجة مع منظومة كوبونات باسط والوطنية اللوجستية.'
                : 'Festive big-top circus marquee directly opposite Al Ain Mall with live acrobatic stage performances — eligible for voucher discounts upon activation.'}
            </p>
            <button
              type="button"
              onClick={() => onNavigateSection('al_ain_coupons')}
              className="px-6 py-3 rounded-full basit-glass-btn-primary text-xs sm:text-sm font-black cursor-pointer whitespace-nowrap"
            >
              {isRtl ? 'عرض قسيمة سيرك العين أمام مول العين' : 'View Circus Discount Coupon'}
            </button>
          </div>
        </div>
      )}

      {/* 7) ORIENTAL TAKHT MUSIC NIGHTS */}
      {activeSection === 'al_ain_oriental_nights' && (
        <div className="rounded-[28px] overflow-hidden bg-[#1F172F]/95 backdrop-blur-xl text-white border border-[#62339A]/45 shadow-2xl">
          <div className="h-64 sm:h-84 overflow-hidden">
            <img
              src={oudNightImg}
              alt="ليالي الطرب الشرقي — التخت الشرقي"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-4">
              <Service3DIcon iconKey="oud" size="lg" />
              <div>
                <span className="text-xs font-black text-[#FFC928] flex items-center gap-1.5">
                  <Music className="w-4 h-4" />
                  <span>{isRtl ? 'كل خميس وجمعة' : 'Every Thursday & Friday'}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {isRtl ? 'ليالي الطرب الشرقي' : 'Oriental Takht Nights'}
                </h2>
              </div>
            </div>
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-3xl">
              {isRtl
                ? 'أمسيات طرب راقية على أنغام العود والتخت الشرقي الأصيل، مع جلسات ضيافة دافئة وعروض خاصة لسهرات الخميس والجمعة.'
                : 'Refined Thursday and Friday evening Oud & classical Oriental lounge experiences paired with signature dining hospitality.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigateSection('al_ain_coupons')}
                className="px-6 py-3 rounded-full basit-glass-btn-yellow text-xs sm:text-sm font-black cursor-pointer whitespace-nowrap"
              >
                {isRtl ? 'عرض كوبون الخميس والجمعة' : 'Thu/Fri Evening Voucher'}
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('quotation')}
                className="px-6 py-3 rounded-full basit-glass-btn-primary text-xs sm:text-sm font-extrabold cursor-pointer whitespace-nowrap"
              >
                {isRtl ? 'حجز طاولة أو مناسبة' : 'Reserve Lounge Table'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8) DISCOUNT VOUCHERS SYSTEM (9 CATEGORIES) */}
      {activeSection === 'al_ain_coupons' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-[24px] bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] text-white border border-[rgba(212,175,55,0.45)] shadow-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <Service3DIcon iconKey="coupon" size="md" />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black">
                    {isRtl
                      ? 'عروض وخصومات BASIT | باسط والوطنية اللوجستية'
                      : 'BASIT | باسط Offers & Vouchers'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#E2E8F0] mt-1">
                    {isRtl
                      ? '9 نماذج كوبونات خصم للعاملين والمتعاقدين — خانات النسب والصلاحية قابلة للتعديل التجريبي لحين اعتماد الإدارة.'
                      : '9 employee & contractor discount voucher templates across all Al Ain facilities (experimental percentages pending official approval).'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WATANIYA_COUPONS.map((cpn) => (
              <VoucherCouponCard
                key={cpn.id}
                coupon={cpn}
                lang={lang}
                customLogoDataUrl={null}
              />
            ))}
          </div>

          {renderEmployee10Card()}
        </div>
      )}

      {/* 8.5) SEASONAL & CHARITY CORPORATE PROVISIONS (CARTONS, CHARITY BAGS, EID MEAT, KAHK, MOWLED, DATES) */}
      {activeSection === 'seasonal_provisions' && (
        <SeasonalCharityGoodsSection
          isRtl={isRtl}
          onAddToCart={onAddToCart}
          onShowToast={onShowToast}
        />
      )}

      {/* 9) OCCASIONS & FESTIVALS CAMPAIGN HUB */}
      {activeSection === 'al_ain_occasions' && (
        <div className="space-y-6">
          <div className="rounded-[28px] overflow-hidden basit-liquid-glass grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 h-60 lg:h-auto overflow-hidden bg-[#F8FAFC]">
              <img
                src={SEASONAL_FACTORY_KAHK_IMG}
                alt={isRtl ? 'موسم الكحك وتوزيعات المصانع والشركات — باسط' : 'Seasonal Factory Distribution & Boxes — BASIT'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-4">
                <Service3DIcon iconKey="party" size="md" />
                <div>
                  <span className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                    {isRtl
                      ? 'حملات المواسم، كحك المصانع، وعبوات الضيافة الفاخرة'
                      : 'Seasonal Campaigns, Factory Packs & Luxury Packaging'}
                  </span>
                  <h2 className="text-2xl font-black text-[#292333] dark:text-white">
                    {isRtl
                      ? 'المناسبات والاحتفالات والمنتجات الموسمية — BASIT'
                      : 'Occasions, Celebrations & Seasonal Packs — BASIT'}
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5E5570] dark:text-[#CBD5E1] leading-relaxed">
                {isRtl
                  ? 'تصميمات وتوزيعات مخصصة لرمضان، عيد الفطر وموسم الكحك للمصانع، عيد الأضحى، أعياد الميلاد والكريسماس للشركات، والأفراح والبوفيهات المفتوحة — مطبوعة بالختم الرسمي المعتمد لشعار BASIT | باسط.'
                  : 'Curated hospitality packaging, factory seasonal gifts & corporate Christmas celebrations sealed with the official BASIT | باسط crest.'}
              </p>

              <div className="inline-flex items-center gap-3 p-3.5 rounded-2xl basit-glass-tile w-fit">
                <BasitBrandMark size="md" isRtl={isRtl} />
                <div className="text-xs font-black text-[#292333] dark:text-white">
                  {isRtl ? 'الختم الرسمي المعتمد على العبوات — BASIT | باسط' : 'Official Sealed Packaging Crest — BASIT'}
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Highlight: Corporate & Factory Birthdays & Christmas + Open Buffet Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-[28px] overflow-hidden basit-glass-tile flex flex-col sm:flex-row">
              <div className="sm:w-56 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#1F172F]">
                <img
                  src={CORPORATE_CHRISTMAS_XD_IMG}
                  alt={isRtl ? 'أعياد الميلاد والكريسماس للشركات والمصانع — XD | EGEMAC' : 'Corporate & Factory Birthdays & Christmas — XD EGEMAC'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Service3DIcon iconKey="christmas_corporate" size="md" />
                    <span className="px-3 py-1 rounded-full basit-glass-btn-yellow text-[10px] font-black">
                      {isRtl ? 'شركات ومصانع' : 'Corporate & Factory'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#292333] dark:text-white">
                    {isRtl ? 'أعياد الميلاد والكريسماس للشركات والمصانع' : 'Corporate & Factory Birthdays & Christmas'}
                  </h3>
                  <p className="text-xs text-[#5E5570] dark:text-[#94A3B8] leading-relaxed">
                    {isRtl
                      ? 'تجهيز وإدارة احتفالات رأس السنة وأعياد الميلاد السنوية وتكريم فرق العمل للمصانع والشركات الكبرى (XD | EGEMAC & MAM FOODS).'
                      : 'Complete corporate & factory end-of-year galas, birthdays and Christmas receptions.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateSection('quotation')}
                  className="w-full py-2.5 rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer"
                >
                  {isRtl ? 'احجز تنظيم احتفال شركتك ←' : 'Book Corporate Celebration →'}
                </button>
              </div>
            </div>

            <div className="rounded-[28px] overflow-hidden basit-glass-tile flex flex-col sm:flex-row">
              <div className="sm:w-56 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#1F172F]">
                <img
                  src={LUXURY_OPEN_BUFFET_IMG}
                  alt={isRtl ? 'الضيافات والبوفيه المفتوح الفاخر — باسط' : 'Luxury Open Buffet & Hospitality'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Service3DIcon iconKey="utensils" size="md" />
                    <span className="px-3 py-1 rounded-full basit-glass-pill text-[#62339A] dark:text-[#FFC928] text-[10px] font-black">
                      {isRtl ? 'ضيافة وبوفيه مفتوح' : 'VIP Open Buffet'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#292333] dark:text-white">
                    {isRtl ? 'الضيافات الراقية والبوفيه المفتوح المتكامل' : 'Luxury Hospitality & Open Buffets'}
                  </h3>
                  <p className="text-xs text-[#5E5570] dark:text-[#94A3B8] leading-relaxed">
                    {isRtl
                      ? 'خطوط بوفيه مفتوح فندقية متكاملة للمؤتمرات والأفراح واستقبال الوفود بأطقم خدمة متخصصة.'
                      : 'Turnkey open buffet chafing lines, carving stations & uniformed hospitality brigade.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateSection('logistics_services')}
                  className="w-full py-2.5 rounded-full basit-glass-btn-yellow text-xs font-black cursor-pointer"
                >
                  {isRtl ? 'اطلب باقة الضيافة والبوفيه ←' : 'Request Buffet Package →'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OCCASIONS_CAMPAIGNS.map((occ) => (
              <div
                key={occ.id}
                className="rounded-[28px] overflow-hidden basit-glass-tile flex flex-col"
              >
                <div className="h-44 overflow-hidden bg-[#F8FAFC] dark:bg-[#1F172F]">
                  <img
                    src={occ.imageUrl}
                    alt={isRtl ? occ.titleAr : occ.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <Service3DIcon iconKey={occ.iconKey} size="md" />
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#292333] dark:text-white">
                        {isRtl ? occ.titleAr : occ.titleEn}
                      </h3>
                      <p className="text-xs text-[#5E5570] dark:text-[#94A3B8] mt-1 leading-relaxed">
                        {isRtl ? occ.subtitleAr : occ.subtitleEn}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateSection('quotation')}
                    className="w-full py-2.5 rounded-full basit-glass-pill hover:bg-[#62339A] hover:text-white text-[#292333] dark:text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>
                      {isRtl
                        ? 'طلب تصميم / عرض باقة (تجريبي)'
                        : 'Request Season Package'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
