import React, { useEffect, useMemo, useState } from 'react';
import {
  Ticket,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  Building2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Heart,
  Star,
  History,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { CountryCode, LanguageCode } from '../data/phase1Data';
import type {
  BenefitBookingDoc,
  EntertainmentBenefitDoc,
  EntertainmentCategory,
  TenantWorkspaceDoc,
} from '../types/faydEcosystem';

type ScopeFilterValue = 'all' | EntertainmentBenefitDoc['eligibilityScope'];
import { createBenefitBooking } from '../services/faydFirestoreService';
import { PARTNER_ENTERTAINMENT_VENUES } from '../data/visitorWorldData';
import { Service3DIcon } from './Service3DIcon';
import entertainmentClubImg from '../assets/images/basit_entertainment_club_1794650656609.jpg';

interface EntertainmentBenefitsViewProps {
  lang: LanguageCode;
  countryCode: CountryCode;
  user: User | null;
  myTenant: TenantWorkspaceDoc | null;
  benefits: EntertainmentBenefitDoc[];
  myBookings: BenefitBookingDoc[];
  onRequireSignIn: () => void;
  onBackHome: () => void;
  onToast: (msg: string) => void;
}

const CATEGORY_OPTIONS: {
  id: 'all' | EntertainmentCategory;
  ar: string;
  en: string;
}[] = [
  { id: 'all', ar: 'جميع المزايا والوجهات', en: 'All Categories' },
  { id: 'circus', ar: 'السيرك والعروض', en: 'Circus & Shows' },
  { id: 'amusement_park', ar: 'الملاهي والمدن الترفيهية', en: 'Amusement Parks' },
  { id: 'club', ar: 'الأندية الاجتماعية والرياضية', en: 'Clubs' },
  { id: 'hotel_resort', ar: 'الفنادق والمنتجعات', en: 'Hotels & Resorts' },
  { id: 'beach', ar: 'الشواطئ والقرى', en: 'Beaches' },
  { id: 'kids_area', ar: 'مناطق الأطفال Kids Area', en: 'Kids Area' },
  { id: 'trip', ar: 'الرحلات والأنشطة', en: 'Trips' },
  { id: 'seasonal', ar: 'العروض والمزايا الموسمية', en: 'Seasonal' },
];

const CITY_FILTERS = [
  { id: 'all', ar: 'كل المدن والمناطق', en: 'All Locations' },
  { id: 'obour', ar: 'العبور', en: 'Obour City' },
  { id: '10th', ar: 'العاشر من رمضان', en: '10th of Ramadan' },
  { id: 'madinaty', ar: 'مدينتي / القاهرة الجديدة', en: 'Madinaty / New Cairo' },
  { id: 'sokhna', ar: 'العين السخنة', en: 'Ain Sokhna' },
  { id: 'cairo', ar: 'القاهرة والجيزة', en: 'Cairo & Giza' },
];

export const EntertainmentBenefitsView: React.FC<EntertainmentBenefitsViewProps> = ({
  lang,
  countryCode,
  user,
  myTenant,
  benefits,
  myBookings,
  onRequireSignIn,
  onBackHome,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [selectedCategory, setSelectedCategory] = useState<'all' | EntertainmentCategory>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilterValue>('all');
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [bookingTab, setBookingTab] = useState<'active' | 'history'>('active');

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('ce_benefit_wishlist');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [ratingsMap, setRatingsMap] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem('ce_benefit_ratings');
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ce_benefit_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('ce_benefit_ratings', JSON.stringify(ratingsMap));
    } catch {
      // ignore
    }
  }, [ratingsMap]);

  const [bookingTarget, setBookingTarget] = useState<EntertainmentBenefitDoc | null>(null);
  const [requestedDate, setRequestedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [peopleCount, setPeopleCount] = useState('2');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const toggleWishlist = (id: string) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const setVenueRating = (id: string, stars: number) => {
    setRatingsMap((prev) => ({ ...prev, [id]: stars }));
    onToast(
      isRtl ? `تم تسجيل تقييم ${stars}/5 بنجاح.` : `Rating ${stars}/5 saved.`
    );
  };

  const matchesLocation = (haystack: string) => {
    if (selectedLocation === 'all') return true;
    const low = haystack.toLowerCase();
    if (selectedLocation === 'obour') return low.includes('عبور') || low.includes('obour');
    if (selectedLocation === '10th') return low.includes('عاشر') || low.includes('10th');
    if (selectedLocation === 'madinaty') return low.includes('مدينتي') || low.includes('madinaty') || low.includes('تجمع');
    if (selectedLocation === 'sokhna') return low.includes('سخنة') || low.includes('العين') || low.includes('sokhna');
    if (selectedLocation === 'cairo') return low.includes('قاهرة') || low.includes('جيزة') || low.includes('cairo');
    return true;
  };

  const visibleBenefits = useMemo(() => {
    return benefits.filter((b) => {
      if (!b.isApproved || !b.isActive) return false;
      if (b.countryCode && b.countryCode !== countryCode) return false;
      if (b.validTo && b.validTo < todayStr) return false;
      if (b.validFrom && b.validFrom > todayStr) return false;

      if (b.eligibilityScope !== 'public') {
        const csvIds = (b.eligibleTenantIdsCsv || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const tenantActiveContracted =
          myTenant &&
          myTenant.status === 'active' &&
          (!myTenant.contractStatus || myTenant.contractStatus === 'contracted');

        if (!tenantActiveContracted) return false;
        if (csvIds.length > 0 && myTenant && !csvIds.includes(myTenant.tenantId)) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      if (scopeFilter !== 'all' && b.eligibilityScope !== scopeFilter) return false;
      if (wishlistOnly && !wishlistIds.includes(b.benefitId)) return false;
      if (!matchesLocation(`${b.venueName} ${b.description} ${b.terms}`)) return false;
      return true;
    });
  }, [benefits, countryCode, todayStr, myTenant, selectedCategory, scopeFilter, wishlistOnly, wishlistIds, selectedLocation]);

  const filteredPartnerVenues = useMemo(() => {
    return PARTNER_ENTERTAINMENT_VENUES.filter((v) => {
      if (wishlistOnly && !wishlistIds.includes(v.id)) return false;
      return matchesLocation(`${v.nameAr} ${v.nameEn} ${v.locationAr} ${v.locationEn}`);
    });
  }, [selectedLocation, wishlistOnly, wishlistIds]);

  const filteredBookings = useMemo(() => {
    if (bookingTab === 'active') {
      return myBookings.filter((bk) => bk.status === 'pending' || bk.status === 'approved');
    }
    return myBookings;
  }, [myBookings, bookingTab]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTarget) return;
    if (!user) {
      onRequireSignIn();
      return;
    }
    setSubmitting(true);
    try {
      const id = await createBenefitBooking(user, bookingTarget, {
        tenantId: myTenant?.tenantId || '',
        requestedDate,
        peopleCount: Math.max(1, Number(peopleCount) || 1),
        notes,
      });
      setBookingTarget(null);
      setNotes('');
      onToast(
        isRtl
          ? `تم إرسال طلب الاستفادة والحجز رقم ${id} وبانتظار الاعتماد.`
          : `Benefit booking request ${id} submitted.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: EntertainmentCategory) => {
    const found = CATEGORY_OPTIONS.find((c) => c.id === cat);
    return found ? (isRtl ? found.ar : found.en) : cat;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full basit-glass-pill text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
          <span>{isRtl ? 'العودة للرئيسية' : 'Back Home'}</span>
        </button>

        {myTenant ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
            <Building2 className="w-4 h-4" />
            <span>
              {isRtl ? `حساب جهة مرتبط: ${myTenant.name}` : `Entity Linked: ${myTenant.name}`}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full basit-glass-pill text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            <span>
              {isRtl
                ? 'المزايا المخصصة للجهات المتعاقدة تظهر بعد ربط الحساب بالمنشأة'
                : 'Entity-tier perks unlock automatically for contracted organizations'}
            </span>
          </div>
        )}
      </div>

      {/* Hero Header */}
      <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#62339A] via-[#4A2378] to-[#292333] text-white shadow-lg grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#BAE6FD]">
            <Sparkles className="w-4 h-4" />
            <span>
              {isRtl
                ? 'منظومة الترفيه والمزايا التعاقدية — BASIT | باسط'
                : 'Corporate & Employee Entertainment Benefits'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            {isRtl
              ? 'مزايا ترفيهية وسياحية معتمدة للعاملين والأفراد والشركات'
              : 'Verified Leisure, Parks, Clubs & Resorts Benefits'}
          </h1>
          <p className="text-xs sm:text-sm text-[#F7F5FA] leading-relaxed max-w-2xl">
            {isRtl
              ? 'أكوا بارك للأطفال، سباق الرالي بالعبور، سيرك العين أمام مول العين، سينما دايموند العاشر من رمضان، سينما مدينتي، وبيت الملح والسبا — تُفعّل المزايا التعاقدية بشروط وصلاحية واضحة من الإدارة المركزية.'
              : 'Access partner-approved perks across Aqua Park, Obour Rally, Al Ain Circus, Cinemas, Kids Area, Clubs & Salt House Spa with verified validity dates.'}
          </p>
        </div>

        <div className="lg:col-span-5 relative min-h-[210px]">
          <img
            src={entertainmentClubImg}
            alt={isRtl ? 'مزايا الترفيه والنوادي والفنادق عبر باسط' : 'BASIT Entertainment & Resort Benefits'}
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#4A2378]/60 via-transparent to-transparent" />
        </div>
      </section>

      {/* Market Note for inactive countries */}
      {countryCode !== 'EG' && (
        <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#C7D2FE] dark:border-[#334155] text-xs font-black text-[#4A2378] dark:text-[#A34FE8]">
          {isRtl
            ? `السوق المختار (${countryCode}) في انتظار الافتتاح الرسمي؛ التشغيل الفعلي حالياً في مصر (EG) فقط.`
            : `Selected market (${countryCode}) is awaiting official opening; live operations are currently active in Egypt (EG) only.`}
        </div>
      )}

      {/* Mobile-First Category Rail + Location, Scope & Wishlist Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORY_OPTIONS.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] shrink-0 px-4 py-2 rounded-full text-xs font-black transition-colors cursor-pointer ${
                  active
                    ? 'basit-glass-btn-primary text-white'
                    : 'basit-glass-pill text-[#292333] dark:text-white hover:border-[#62339A]'
                }`}
              >
                {isRtl ? cat.ar : cat.en}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            aria-label={isRtl ? 'تصفية حسب المدينة' : 'Filter by location'}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs font-bold text-[#292333] dark:text-white"
          >
            {CITY_FILTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {isRtl ? c.ar : c.en}
              </option>
            ))}
          </select>

          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as ScopeFilterValue)}
            aria-label={isRtl ? 'تصفية حسب الفئة المستفيدة' : 'Filter by tier'}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs font-bold text-[#292333] dark:text-white"
          >
            <option value="all">{isRtl ? 'كل الفئات والنطاقات' : 'All Scopes'}</option>
            <option value="public">{isRtl ? 'متاح للجميع' : 'Public'}</option>
            <option value="employee_tier">{isRtl ? 'ميزة للعاملين' : 'Employee Tier'}</option>
            <option value="contracted_entity">{isRtl ? 'جهات متعاقدة' : 'Contracted Entities'}</option>
          </select>

          <button
            type="button"
            onClick={() => setWishlistOnly((p) => !p)}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer border transition-colors ${
              wishlistOnly
                ? 'bg-[#62339A] text-white border-[#62339A]'
                : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#62339A]/35 text-[#292333] dark:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlistOnly ? 'fill-[#A34FE8] text-[#A34FE8]' : 'text-rose-500'}`} />
            <span>
              {isRtl ? `المفضلة (${wishlistIds.length})` : `Wishlist (${wishlistIds.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Benefits Grid */}
      {visibleBenefits.length === 0 ? (
        <div className="p-8 rounded-3xl basit-liquid-glass text-center space-y-2.5">
          <Ticket className="w-7 h-7 text-[#62339A] dark:text-[#A34FE8] mx-auto" />
          <h3 className="text-base font-black text-[#292333] dark:text-white">
            {isRtl
              ? 'لا توجد مزايا ترفيهية معتمدة تطابق الفلاتر المختارة حالياً'
              : 'No active approved entertainment benefits match your filters'}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-xl mx-auto">
            {isRtl
              ? 'لا تعرض المنصة أي خصومات أو شركاء ترفيه غير معتمدين. فور اعتماد اتفاق الشريك ونشره من الإدارة المركزية سيظهر هنا بصلاحيته وشروطه.'
              : 'Unverified partner discounts are never fabricated. Once Central Admin approves a partner benefit, it appears here automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleBenefits.map((b) => {
            const isFav = wishlistIds.includes(b.benefitId);
            const curRating = ratingsMap[b.benefitId] || 0;
            return (
              <div
                key={b.benefitId}
                className="rounded-3xl basit-glass-tile overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 bg-[#F8FAFC] dark:bg-[#1E293B]">
                    <img
                      src={b.imageUrl || entertainmentClubImg}
                      alt={b.venueName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 start-2.5 px-2.5 py-0.5 rounded-lg bg-[#292333]/90 text-[#A34FE8] text-[10px] font-black">
                      {getCategoryLabel(b.category)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(b.benefitId)}
                      aria-label={isRtl ? 'حفظ في المفضلة' : 'Toggle wishlist'}
                      className="absolute top-2 end-2 w-9 h-9 rounded-full bg-white/90 dark:bg-[#111827]/90 flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'text-[#292333] dark:text-white'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-black text-[#292333] dark:text-white">
                        {b.venueName}
                      </h3>
                      <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[#F7F5FA] dark:bg-[#1E293B] text-[#62339A] dark:text-[#A34FE8] text-[10px] font-black">
                        {b.eligibilityScope === 'public'
                          ? isRtl ? 'عام' : 'Public'
                          : b.eligibilityScope === 'employee_tier'
                            ? isRtl ? 'للعاملين' : 'Employees'
                            : isRtl ? 'جهات' : 'Entities'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/25 text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
                      {b.approvedBenefitText}
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {b.description}
                    </p>
                    {b.terms && (
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        <span className="font-black text-[#292333] dark:text-white">
                          {isRtl ? 'الشروط: ' : 'Terms: '}
                        </span>
                        {b.terms}
                      </p>
                    )}
                    {(b.validFrom || b.validTo) && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#292333] dark:text-white">
                        <Calendar className="w-3.5 h-3.5 text-[#62339A] dark:text-[#A34FE8]" />
                        <span dir="ltr" className="tabular-nums">
                          {b.validFrom || '—'} → {b.validTo || '—'}
                        </span>
                      </div>
                    )}

                    {/* Interactive 1–5 Star Rating */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                        {isRtl ? 'تقييم الزوار:' : 'Your Rating:'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setVenueRating(b.benefitId, star)}
                            aria-label={`${star} stars`}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                curRating >= star
                                  ? 'fill-[#A34FE8] text-[#A34FE8]'
                                  : 'text-[#E2E8F0] dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        onRequireSignIn();
                        return;
                      }
                      setBookingTarget(b);
                    }}
                    className="w-full min-h-[44px] py-2.5 rounded-full basit-glass-btn-primary text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-[#A34FE8]" />
                    <span>{isRtl ? 'تقديم طلب استفادة / حجز' : 'Request Benefit Booking'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Separated Partner Destinations Directory */}
      <section className="p-5 sm:p-6 rounded-3xl basit-liquid-glass space-y-4">
        <div>
          <h3 className="text-base font-black text-[#292333] dark:text-white">
            {isRtl
              ? 'دليل الوجهات الترفيهية والشركاء قيد الربط التعاقدي'
              : 'Separated Partner Leisure Destinations Directory'}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            {isRtl
              ? 'أكوا بارك للأطفال، سباق الرالي بالعبور، سيرك العين أمام مول العين، سينما دايموند العاشر من رمضان، سينما في مدينتي، منطقة الأطفال، وبيت الملح والسبا.'
              : 'Distinct imagery and profiles for each leisure partner without mixing venues.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPartnerVenues.map((venue) => {
            const isFav = wishlistIds.includes(venue.id);
            const curRating = ratingsMap[venue.id] || 0;
            return (
              <div
                key={venue.id}
                className="rounded-2xl overflow-hidden basit-glass-tile flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#292333]">
                    <img
                      src={venue.imageUrl}
                      alt={isRtl ? venue.nameAr : venue.nameEn}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleWishlist(venue.id)}
                      aria-label={isRtl ? 'حفظ الوجهة في المفضلة' : 'Save venue to wishlist'}
                      className="absolute top-2.5 end-2.5 w-10 h-10 rounded-full bg-white/90 dark:bg-[#111827]/90 flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'text-[#292333] dark:text-white'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <Service3DIcon iconKey={venue.iconKey} size="sm" />
                      <div>
                        <div className="text-[10px] font-black text-[#62339A] dark:text-[#A34FE8]">
                          {isRtl ? venue.categoryAr : venue.categoryEn}
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-[#292333] dark:text-white leading-snug">
                          {isRtl ? venue.nameAr : venue.nameEn}
                        </h4>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#62339A] dark:text-[#A34FE8] shrink-0" />
                      <span className="truncate">{isRtl ? venue.locationAr : venue.locationEn}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-[#E2E8F0] dark:border-[#62339A]/20">
                  <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                    {isRtl ? 'تقييم الوجهة' : 'Rate Venue'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setVenueRating(venue.id, star)}
                        aria-label={`${star} stars`}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            curRating >= star
                              ? 'fill-[#A34FE8] text-[#A34FE8]'
                              : 'text-[#E2E8F0] dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* User Bookings & Activity History */}
      <section className="p-5 rounded-3xl basit-liquid-glass space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            <span>{isRtl ? 'طلبات الحجز وسجل النشاط' : 'Bookings & Activity History'}</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBookingTab('active')}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-black cursor-pointer ${
                bookingTab === 'active'
                  ? 'bg-[#62339A] text-white'
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-white'
              }`}
            >
              {isRtl ? 'الطلبات النشطة' : 'Active'}
            </button>
            <button
              type="button"
              onClick={() => setBookingTab('history')}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer ${
                bookingTab === 'history'
                  ? 'bg-[#62339A] text-white'
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{isRtl ? 'السجل الكامل' : 'All History'}</span>
            </button>
          </div>
        </div>

        {!user && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {isRtl ? 'سجّل الدخول لعرض ومتابعة طلباتك الترفيهية.' : 'Sign in to track your benefit requests.'}
            </span>
            <button
              type="button"
              onClick={onRequireSignIn}
              className="min-h-[44px] px-4 py-2 rounded-full basit-glass-btn-primary text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#A34FE8]" />
              <span>{isRtl ? 'دخول لمتابعة حجوزاتك' : 'Sign in to view bookings'}</span>
            </button>
          </div>
        )}

        {user && filteredBookings.length === 0 ? (
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {isRtl ? 'لا توجد طلبات استفادة ترفيهية مسجلة في هذا العرض.' : 'No benefit bookings found.'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredBookings.map((bk) => (
              <div
                key={bk.bookingId}
                className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-black text-[#292333] dark:text-white">{bk.venueName}</div>
                  <div dir="ltr" className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                    {bk.bookingId} · {bk.requestedDate} · {bk.peopleCount}{' '}
                    {isRtl ? 'أفراد' : 'guests'}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-black flex items-center gap-1 ${
                    bk.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : bk.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-[#A34FE8]/25 text-[#292333] dark:text-[#A34FE8]'
                  }`}
                >
                  {bk.status === 'approved' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : bk.status === 'rejected' ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {bk.status === 'approved'
                      ? isRtl ? 'معتمد' : 'Approved'
                      : bk.status === 'rejected'
                        ? isRtl ? 'مرفوض' : 'Rejected'
                        : isRtl ? 'بانتظار الاعتماد' : 'Pending'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {bookingTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#292333]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setBookingTarget(null)}
        >
          <form
            onSubmit={handleBookSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl basit-liquid-glass p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-black text-[#292333] dark:text-white">
              {isRtl ? `حجز ميزة: ${bookingTarget.venueName}` : `Request Benefit: ${bookingTarget.venueName}`}
            </h3>
            <p className="text-[#62339A] dark:text-[#A34FE8] font-bold">
              {bookingTarget.approvedBenefitText}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-1">
                  {isRtl ? 'التاريخ المطلوب *' : 'Requested Date *'}
                </label>
                <input
                  type="date"
                  required
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="min-h-[44px] w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">
                  {isRtl ? 'عدد الأفراد المستفيدين *' : 'Number of Guests *'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="min-h-[44px] w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">
                  {isRtl ? 'ملاحظات أو بيانات التابعين' : 'Notes / Companion Details'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isRtl ? 'اختياري: بيانات التواصل أو متطلبات خاصة' : 'Optional notes...'}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookingTarget(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] font-bold cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? isRtl ? 'جاري الإرسال...' : 'Submitting...'
                  : isRtl ? 'تأكيد وإرسال الطلب' : 'Submit Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
