import React, { useMemo, useState } from 'react';
import {
  Ticket,
  Film,
  Gamepad2,
  Palmtree,
  Sparkles,
  Gem,
  Compass,
  Waves,
  MapPin,
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import type { LanguageCode } from '../data/phase1Data';
import {
  BASET_ENTERTAINMENT_HERO_ASSET,
  BASET_FAMILY_CARD_ASSET,
  FAMILY_ENTERTAINMENT_CATEGORIES,
  type EntertainmentIconKind,
  type FamilyEntertainmentCategoryItem,
} from '../data/basetBenefitsData';
import {
  redeemBasetOffer,
  type BasetCardRecord,
} from '../services/basetBenefitsService';
import {
  BasetBenefitsHeaderNav,
  type BasetProgramTab,
} from './BasetBenefitsHeaderNav';

interface BasetFamilyEntertainmentViewProps {
  lang: LanguageCode;
  cardActivated: boolean;
  cardLoading: boolean;
  card: BasetCardRecord | null;
  onNavigateTab: (tab: BasetProgramTab) => void;
  onBackHome: () => void;
  onOpenLegacyEntertainmentPortal: () => void;
  onRefreshCardStatus: () => Promise<void>;
  onToast: (msg: string) => void;
}

function render3DCategoryIcon(kind: EntertainmentIconKind) {
  switch (kind) {
    case 'circus':
      return <Ticket className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
    case 'cinema':
      return <Film className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
    case 'screens':
      return <Gamepad2 className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
    case 'resort':
      return <Palmtree className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
    case 'spa':
      return <Sparkles className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
    case 'salt':
      return <Gem className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
    case 'trips':
      return <Compass className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
    case 'chalets':
      return <Waves className="w-5 h-5 text-[#2A1459]" strokeWidth={2.2} />;
  }
}

export const BasetFamilyEntertainmentView: React.FC<BasetFamilyEntertainmentViewProps> = ({
  lang,
  cardActivated,
  cardLoading,
  card,
  onNavigateTab,
  onBackHome,
  onOpenLegacyEntertainmentPortal,
  onRefreshCardStatus,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [filterMode, setFilterMode] = useState<'all' | 'approved_partner' | 'contract_tier'>('all');
  const [selectedCategory, setSelectedCategory] = useState<FamilyEntertainmentCategoryItem | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const visibleCategories = useMemo(() => {
    if (filterMode === 'all') return FAMILY_ENTERTAINMENT_CATEGORIES;
    return FAMILY_ENTERTAINMENT_CATEGORIES.filter((c) => c.agreementStatus === filterMode);
  }, [filterMode]);

  const handleReserveCategory = async (cat: FamilyEntertainmentCategoryItem) => {
    if (!cardActivated) {
      onToast(
        isRtl
          ? 'يلزم تفعيل كارت باسط العائلي أولاً للاستفادة من خصم 10% العائلي.'
          : 'Activate your BASET Family Card first to claim this 10% leisure perk.'
      );
      setSelectedCategory(null);
      onNavigateTab('baset_card');
      return;
    }

    setSubmitting(true);
    try {
      const resp = await redeemBasetOffer({
        destination: 'family_entertainment',
        offerId: cat.id,
        offerTitle: isRtl ? cat.titleAr : cat.titleEn,
        partnerName: isRtl ? cat.partnerAr : cat.partnerEn,
        notes: bookingNotes.trim(),
      });
      if (!resp.ok) {
        if (resp.requiresActivation) onNavigateTab('baset_card');
        onToast(resp.messageAr || (isRtl ? 'تعذر إرسال طلب الحجز.' : 'Booking request failed.'));
        return;
      }
      await onRefreshCardStatus();
      setBookingNotes('');
      setSelectedCategory(null);
      onToast(
        resp.messageAr ||
          (isRtl
            ? `تم تسجيل طلب الاستفادة لوجهة "${cat.titleAr}" بخصم 10% بنجاح.`
            : `Leisure benefit request submitted for ${cat.titleEn}.`)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <BasetBenefitsHeaderNav
        lang={lang}
        activeTab="baset_family_entertainment"
        cardActivated={cardActivated}
        cardLoading={cardLoading}
        card={card}
        onNavigateTab={onNavigateTab}
        onBackHome={onBackHome}
      />

      {/* Destination 2 Hero Banner */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] text-white shadow-md">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#2A1459]">
          <img
            src={BASET_ENTERTAINMENT_HERO_ASSET}
            alt={isRtl ? 'باسط بسطناها على عيلتك' : 'BASET Family Entertainment Benefits'}
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A1459]/75 via-transparent to-transparent" />
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5C451] text-[#2A0E4D] text-[10px] font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'الترفيه والحياة العائلية' : 'Family Lifestyle & Leisure'}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {isRtl ? 'باسط بسطناها على عيلتك' : 'BASET Made It Joyful for Your Family'}
            </h1>
            <p className="text-xs font-medium text-[#EDE9FE] leading-relaxed">
              {isRtl
                ? 'فعّل كارت باسط واستمتع بمزايا وخصومات عائلية عبر 8 وجهات ترفيهية وسياحية مستقلة.'
                : 'Activate your BASET Card and unlock verified family discounts across 8 dedicated leisure & resort categories.'}
            </p>
          </div>

          <div className="hidden xs:block sm:block w-24 sm:w-28 shrink-0 rounded-xl overflow-hidden border border-[#F5C451]/60 bg-[#16082E] shadow-lg">
            <img
              src={BASET_FAMILY_CARD_ASSET}
              alt="بطاقة باسط الرسمية المعتمدة"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Agreement Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {[
          { id: 'all' as const, ar: 'كل الوجهات (8)', en: 'All 8 Categories' },
          { id: 'approved_partner' as const, ar: 'شركاء خصم فوري', en: 'Instant 10% Partners' },
          { id: 'contract_tier' as const, ar: 'حجوزات تعاقدية', en: 'Contract Reservations' },
        ].map((pill) => {
          const active = filterMode === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilterMode(pill.id)}
              className={`min-h-[40px] shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-black cursor-pointer transition-all ${
                active
                  ? 'bg-[#4C1D95] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1B132B] text-[#4C1D95] dark:text-[#EDE9FE] border border-[#4C1D95]/15 dark:border-[#C084FC]/20 hover:border-[#4C1D95]'
              }`}
            >
              {isRtl ? pill.ar : pill.en}
            </button>
          );
        })}
      </div>

      {/* All 8 Separate Leisure Categories Grid on Calm Ivory White */}
      <div className="grid grid-cols-2 gap-3">
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className="group text-start rounded-[20px] overflow-hidden bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 hover:border-[#4C1D95] shadow-xs flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98]"
          >
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F3FF] dark:bg-[#241B38]">
                <img
                  src={cat.imageUrl}
                  alt={isRtl ? cat.titleAr : cat.titleEn}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E1633]/55 via-transparent to-transparent" />
                <div className="absolute bottom-2 start-2 w-8 h-8 rounded-xl bg-white/95 shadow-sm flex items-center justify-center">
                  {render3DCategoryIcon(cat.iconKind)}
                </div>
                <span className="absolute top-2 end-2 px-2 py-0.5 rounded-full bg-[#3B0764]/90 text-[#F5C451] text-[9px] font-black">
                  {cardActivated
                    ? isRtl ? 'خصم 10%' : '10% ON'
                    : isRtl ? 'ميزة عائلية' : 'Family Perk'}
                </span>
              </div>

              <div className="p-2.5 space-y-0.5">
                <h2 className="text-xs font-black text-[#1E1633] dark:text-white leading-snug line-clamp-1">
                  {isRtl ? cat.titleAr : cat.titleEn}
                </h2>
                <p className="text-[10px] font-bold text-[#5E5570] dark:text-[#C4B5FD] line-clamp-1">
                  {isRtl ? cat.partnerAr : cat.partnerEn}
                </p>
              </div>
            </div>

            <div className="px-2.5 pb-2.5 pt-1">
              <div className="w-full py-1.5 px-2 rounded-xl bg-[#F5F3FF] dark:bg-[#241B38] text-[10px] font-black text-[#4C1D95] dark:text-[#F5C451] text-center truncate">
                {isRtl ? cat.discountBadgeAr : cat.discountBadgeEn}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bridge to Full Contracted Partners */}
      <div className="rounded-[22px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-[#C084FC]/20 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="text-xs font-black text-[#4C1D95] dark:text-[#F5C451]">
            {isRtl ? 'بوابة الحجوزات التعاقدية وسجل الطلبات' : 'Contracted Partner Bookings & History'}
          </div>
          <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] leading-snug">
            {isRtl
              ? 'استعرض اتفاقيات الشركاء المنشورة لحظياً وقدّم طلبات حجز المجموعات والجهات.'
              : 'Browse live approved partner agreements & manage group bookings.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLegacyEntertainmentPortal}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
        >
          <span>{isRtl ? 'سجل الشركاء والحجوزات' : 'Partners Portal'}</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#F5C451]" />
        </button>
      </div>

      {/* Category Agreement & Booking Modal on Ivory White */}
      {selectedCategory && (
        <div
          className="fixed inset-0 z-50 max-w-[430px] mx-auto bg-[#1D0B3B]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[88dvh] overflow-y-auto rounded-[28px] bg-[#FAF8F5] dark:bg-[#1B132B] text-[#1E1633] dark:text-white border border-[#4C1D95]/20 shadow-2xl p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] dark:bg-[#241B38] border border-[#4C1D95]/15 flex items-center justify-center shrink-0">
                  {render3DCategoryIcon(selectedCategory.iconKind)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-[#1E1633] dark:text-white truncate">
                    {isRtl ? selectedCategory.titleAr : selectedCategory.titleEn}
                  </h3>
                  <p className="text-[11px] font-bold text-[#4C1D95] dark:text-[#F5C451] truncate">
                    {isRtl ? selectedCategory.partnerAr : selectedCategory.partnerEn}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                aria-label={isRtl ? 'إغلاق' : 'Close'}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-white dark:bg-[#241B38] border border-[#4C1D95]/15 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-[#1E1633] dark:text-white" />
              </button>
            </div>

            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#4C1D95]/12 bg-[#F5F3FF]">
              <img
                src={selectedCategory.imageUrl}
                alt={isRtl ? selectedCategory.titleAr : selectedCategory.titleEn}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4C1D95] dark:text-[#F5C451]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{isRtl ? selectedCategory.locationAr : selectedCategory.locationEn}</span>
            </div>

            <p className="text-xs text-[#5E5570] dark:text-[#EDE9FE] leading-relaxed">
              {isRtl ? selectedCategory.summaryAr : selectedCategory.summaryEn}
            </p>

            <div className="rounded-2xl bg-white dark:bg-[#241B38] border border-[#4C1D95]/12 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#4C1D95] dark:text-[#F5C451]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isRtl ? 'شروط الاستفادة المعتمدة:' : 'Verified Partner Terms:'}</span>
              </div>
              <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                {isRtl ? selectedCategory.termsAr : selectedCategory.termsEn}
              </p>
            </div>

            {cardActivated && (
              <div>
                <label className="block text-[11px] font-bold text-[#1E1633] dark:text-[#EDE9FE] mb-1">
                  {isRtl ? 'عدد الأفراد / التاريخ المقترح (اختياري)' : 'Guests & Preferred Date (Optional)'}
                </label>
                <input
                  type="text"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder={isRtl ? 'مثال: 4 أفراد — الجمعة القادمة' : 'e.g. 4 family members — Next Friday'}
                  className="min-h-[42px] w-full px-3 rounded-xl bg-white dark:bg-[#120D1D] border border-[#4C1D95]/20 text-xs text-[#1E1633] dark:text-white focus:outline-none"
                />
              </div>
            )}

            {cardActivated ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleReserveCategory(selectedCategory)}
                className="min-h-[46px] w-full rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {submitting
                    ? isRtl ? 'جاري التسجيل...' : 'Submitting...'
                    : isRtl ? 'تأكيد الاستفادة بخصم 10% بالكارت' : 'Claim 10% Family Benefit'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  onNavigateTab('baset_card');
                }}
                className="min-h-[46px] w-full rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isRtl ? 'فعّل كارت باسط أولاً لفتح الخصم' : 'Activate BASET Card First'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
