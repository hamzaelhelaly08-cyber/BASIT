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
import { BasetCleanImage } from './BasetCleanImage';
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

      {/* Destination 2 Hero Banner Featuring Attached Family Campaign & Card */}
      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#2A1459] via-[#4C1D95] to-[#6D28D9] text-white border border-[#FFD54F]/65 shadow-[0_22px_50px_-14px_rgba(42,20,89,0.75)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#2A1459]">
          <img
            src={BASET_ENTERTAINMENT_HERO_ASSET}
            alt={isRtl ? 'باسط بسطناها على عيلتك' : 'BASET Family Entertainment Benefits'}
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A1459] via-[#2A1459]/20 to-transparent" />

          {/* Floating Miniature BASET Card Overlay */}
          <div className="absolute bottom-2 end-2.5 w-24 sm:w-28 pointer-events-none">
            <BasetCleanImage
              src={BASET_FAMILY_CARD_ASSET}
              alt="BASET Family Benefits Card"
              cleanCheckerboard
              className="w-full h-auto object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD54F] to-[#FACC15] text-[#2A1459] text-[10px] font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'الوجهة الثانية · الترفيه والحياة العائلية' : 'Destination 2 · Family Lifestyle'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {isRtl ? 'باسط بسطناها على عيلتك' : 'BASET Made It Joyful for Your Family'}
          </h1>
          <p className="text-xs font-bold text-[#EDE9FE] leading-relaxed">
            {isRtl
              ? 'فعّل كارت باسط واستمتع بمزايا وخصومات عائلية عبر 8 وجهات ترفيهية وسياحية مستقلة.'
              : 'Activate your BASET Card and unlock verified family discounts across 8 dedicated leisure & resort categories.'}
          </p>
        </div>
      </section>

      {/* Agreement Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
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
              className={`min-h-[40px] shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-black cursor-pointer transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#FFD54F] to-[#FACC15] text-[#2A1459] shadow-sm'
                  : 'bg-[#3B0764] text-[#EDE9FE] border border-[#C084FC]/35 hover:border-[#FFD54F]'
              }`}
            >
              {isRtl ? pill.ar : pill.en}
            </button>
          );
        })}
      </div>

      {/* All 8 Separate Leisure Categories Grid (Zero Food Clutter) */}
      <div className="grid grid-cols-2 gap-3">
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className="group text-start rounded-[22px] overflow-hidden bg-gradient-to-b from-[#3B0764] via-[#4C1D95] to-[#2A1459] border border-[#FFD54F]/45 hover:border-[#FFD54F] shadow-[0_14px_30px_-12px_rgba(42,20,89,0.55)] flex flex-col justify-between cursor-pointer transition-transform active:scale-[0.98]"
          >
            <div>
              <div className="relative h-28 w-full overflow-hidden bg-[#2A1459]">
                <img
                  src={cat.imageUrl}
                  alt={isRtl ? cat.titleAr : cat.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A1459]/90 via-transparent to-transparent" />
                {/* 3D Gold Icon Medallion */}
                <div className="absolute bottom-2 start-2 w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD54F] via-[#FACC15] to-[#EAB308] border border-white/80 shadow-[0_6px_16px_rgba(250,204,21,0.5)] flex items-center justify-center">
                  {render3DCategoryIcon(cat.iconKind)}
                </div>
                <span className="absolute top-2 end-2 px-2 py-0.5 rounded-full bg-[#2A1459]/85 border border-[#FFD54F]/60 text-[#FFD54F] text-[9px] font-black">
                  {cardActivated
                    ? isRtl ? 'خصم 10%' : '10% ON'
                    : isRtl ? 'ميزة عائلية' : 'Family Perk'}
                </span>
              </div>

              <div className="p-3 space-y-1">
                <h2 className="text-xs sm:text-sm font-black text-white leading-snug line-clamp-1">
                  {isRtl ? cat.titleAr : cat.titleEn}
                </h2>
                <p className="text-[10px] font-bold text-[#D8B4FE] line-clamp-1">
                  {isRtl ? cat.partnerAr : cat.partnerEn}
                </p>
              </div>
            </div>

            <div className="px-3 pb-3 pt-1">
              <div className="w-full py-1.5 px-2.5 rounded-xl bg-white/10 border border-white/15 text-[10px] font-black text-[#FFD54F] text-center truncate">
                {isRtl ? cat.discountBadgeAr : cat.discountBadgeEn}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bridge to Full Contracted Partners & Live Firestore Booking Portal */}
      <div className="rounded-[22px] bg-gradient-to-r from-[#3B0764] to-[#581C87] border border-[#C084FC]/40 p-4 flex flex-wrap items-center justify-between gap-3 text-white shadow-md">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="text-xs font-black text-[#FFD54F]">
            {isRtl ? 'بوابة الحجوزات التعاقدية وسجل الطلبات' : 'Contracted Partner Bookings & History'}
          </div>
          <p className="text-[11px] text-[#EDE9FE] leading-snug">
            {isRtl
              ? 'استعرض اتفاقيات الشركاء المنشورة لحظياً وقدّم طلبات حجز المجموعات والجهات.'
              : 'Browse live approved partner agreements & manage group bookings.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLegacyEntertainmentPortal}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-[#FFD54F]/55 text-[#FFD54F] text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>{isRtl ? 'سجل الشركاء والحجوزات' : 'Partners Portal'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Agreement & Booking Modal */}
      {selectedCategory && (
        <div
          className="fixed inset-0 z-50 max-w-[430px] mx-auto bg-[#1D0B3B]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[88dvh] overflow-y-auto rounded-[28px] bg-gradient-to-b from-[#3B0764] via-[#4C1D95] to-[#2A1459] text-white border-2 border-[#FFD54F]/70 shadow-2xl p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD54F] to-[#EAB308] flex items-center justify-center shrink-0">
                  {render3DCategoryIcon(selectedCategory.iconKind)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white truncate">
                    {isRtl ? selectedCategory.titleAr : selectedCategory.titleEn}
                  </h3>
                  <p className="text-[11px] font-bold text-[#FFD54F] truncate">
                    {isRtl ? selectedCategory.partnerAr : selectedCategory.partnerEn}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                aria-label={isRtl ? 'إغلاق' : 'Close'}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="relative h-44 rounded-2xl overflow-hidden border border-[#FFD54F]/45">
              <img
                src={selectedCategory.imageUrl}
                alt={isRtl ? selectedCategory.titleAr : selectedCategory.titleEn}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#EDE9FE]">
              <MapPin className="w-4 h-4 text-[#FFD54F] shrink-0" />
              <span>{isRtl ? selectedCategory.locationAr : selectedCategory.locationEn}</span>
            </div>

            <p className="text-xs text-[#EDE9FE] leading-relaxed">
              {isRtl ? selectedCategory.summaryAr : selectedCategory.summaryEn}
            </p>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#FFD54F]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isRtl ? 'شروط الاستفادة المعتمدة:' : 'Verified Partner Terms:'}</span>
              </div>
              <p className="text-[11px] text-[#EDE9FE] leading-relaxed">
                {isRtl ? selectedCategory.termsAr : selectedCategory.termsEn}
              </p>
            </div>

            {cardActivated && (
              <div>
                <label className="block text-[11px] font-bold text-[#EDE9FE] mb-1">
                  {isRtl ? 'عدد الأفراد / التاريخ المقترح (اختياري)' : 'Guests & Preferred Date (Optional)'}
                </label>
                <input
                  type="text"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder={isRtl ? 'مثال: 4 أفراد — الجمعة القادمة' : 'e.g. 4 family members — Next Friday'}
                  className="min-h-[42px] w-full px-3 rounded-xl bg-white/10 border border-[#FFD54F]/40 text-xs text-white placeholder-[#D8B4FE]/70 focus:outline-none"
                />
              </div>
            )}

            {cardActivated ? (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleReserveCategory(selectedCategory)}
                className="min-h-[46px] w-full rounded-xl bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] text-[#2A1459] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
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
                className="min-h-[46px] w-full rounded-xl bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] text-[#2A1459] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
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
