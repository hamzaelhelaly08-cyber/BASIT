import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Percent,
  Eye,
  ShieldCheck,
  Lock,
  ShoppingCart,
  CheckCircle2,
  X,
  Sparkles,
  Award,
} from 'lucide-react';
import type { LanguageCode } from '../data/phase1Data';
import {
  FOOD_BENEFIT_OFFERS,
  type BasetFoodOfferItem,
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
import type { Phase1CartItem } from './Phase1CartDrawer';

interface BasetFoodBenefitsViewProps {
  lang: LanguageCode;
  currencyLabel: string;
  cardActivated: boolean;
  cardLoading: boolean;
  card: BasetCardRecord | null;
  onNavigateTab: (tab: BasetProgramTab) => void;
  onBackHome: () => void;
  onRefreshCardStatus: () => Promise<void>;
  onAddToCart?: (item: Omit<Phase1CartItem, 'quantity'>) => void;
  onToast: (msg: string) => void;
}

export const BasetFoodBenefitsView: React.FC<BasetFoodBenefitsViewProps> = ({
  lang,
  currencyLabel,
  cardActivated,
  cardLoading,
  card,
  onNavigateTab,
  onBackHome,
  onRefreshCardStatus,
  onAddToCart,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [selectedOffer, setSelectedOffer] = useState<BasetFoodOfferItem | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [claimNote, setClaimNote] = useState('');

  const handleClaimFoodOffer = async (offer: BasetFoodOfferItem) => {
    if (!cardActivated) {
      onToast(
        isRtl
          ? 'يلزم تفعيل كارت باسط العائلي أولاً لتطبيق خصم 10% المعتمد.'
          : 'Please activate your BASET Family Card first to unlock the 10% discount.'
      );
      setSelectedOffer(null);
      onNavigateTab('baset_card');
      return;
    }

    setSubmittingId(offer.id);
    try {
      const resp = await redeemBasetOffer({
        destination: 'food_meal_benefits',
        offerId: offer.id,
        offerTitle: isRtl ? offer.titleAr : offer.titleEn,
        partnerName: isRtl ? offer.partnerBrandAr : offer.partnerBrandEn,
        notes: claimNote.trim(),
      });

      if (!resp.ok) {
        if (resp.requiresActivation) {
          onNavigateTab('baset_card');
        }
        onToast(resp.messageAr || (isRtl ? 'تعذر تسجيل الطلب.' : 'Could not apply offer.'));
        return;
      }

      if (onAddToCart && offer.basePriceEgp !== null) {
        const finalPrice = Math.round(offer.basePriceEgp * (1 - offer.discountPct / 100));
        onAddToCart({
          id: `baset_food_${offer.id}`,
          kitchenNameAr: offer.partnerBrandAr,
          kitchenNameEn: offer.partnerBrandEn,
          nameAr: `${offer.titleAr} (خصم كارت باسط 10%)`,
          nameEn: `${offer.titleEn} (10% BASET Card)`,
          approvedPrice: finalPrice,
          imageUrl: offer.primaryImage,
        });
      }

      await onRefreshCardStatus();
      setClaimNote('');
      setSelectedOffer(null);
      onToast(
        resp.messageAr ||
          (isRtl
            ? `تم تطبيق خصم 10% وحجز عرض "${offer.titleAr}" بنجاح.`
            : `10% discount applied to "${offer.titleEn}".`)
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <BasetBenefitsHeaderNav
        lang={lang}
        activeTab="baset_food_benefits"
        cardActivated={cardActivated}
        cardLoading={cardLoading}
        card={card}
        onNavigateTab={onNavigateTab}
        onBackHome={onBackHome}
      />

      {/* Luxury 3D Glassmorphism Destination 1 Hero */}
      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#2A1459] via-[#4C1D95] to-[#6D28D9] text-white p-5 border border-[#FFD54F]/60 shadow-[0_20px_48px_-14px_rgba(42,20,89,0.72)] space-y-3.5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -end-10 w-44 h-44 rounded-full bg-[#FFD54F]/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -start-10 w-40 h-40 rounded-full bg-[#C084FC]/25 blur-3xl"
        />

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-[#FFD54F]/60 text-[#FFD54F] text-[10px] font-black">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{isRtl ? 'الوجهة الأولى · عروض الطعام والسلع' : 'Destination 1 · Food & Pantry'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FFD54F] to-[#FACC15] text-[#2A1459] text-[10px] font-black shadow-sm">
            <Percent className="w-3 h-3" />
            <span>10% OFF</span>
          </span>
        </div>

        <div className="relative z-10 space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black leading-tight text-white">
            {isRtl ? 'وجباتك واحتياجاتك أحلى مع باسط' : 'Your Meals & Pantry Are Better with BASET'}
          </h1>
          <p className="text-xs font-bold text-[#EDE9FE] leading-relaxed">
            {isRtl
              ? 'عروض طعام حصرية وخصم 10% عند تفعيل كارت باسط العائلي بالتعاون مع CATERING MISR وعلامة ZADI لتمور الوادي والفرافرة.'
              : 'Exclusive family food packages with verified 10% BASET Family Card discount from CATERING MISR & ZADI oasis dates.'}
          </p>
        </div>

        {/* Live Card Eligibility Strip */}
        <div className="relative z-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {cardActivated ? (
              <ShieldCheck className="w-4 h-4 text-[#FFD54F] shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-[#FFD54F] shrink-0" />
            )}
            <span className="text-[11px] font-extrabold text-white truncate">
              {cardActivated
                ? isRtl
                  ? 'خصم 10% مفعّل الآن على الأسعار بالأسفل'
                  : '10% Discount Active on All 4 Offers Below'
                : isRtl
                  ? 'فعّل كارت باسط لتطبيق خصم 10% على هذه العروض'
                  : 'Activate BASET Card to unlock 10% savings'}
            </span>
          </div>
          {!cardActivated && (
            <button
              type="button"
              onClick={() => onNavigateTab('baset_card')}
              className="min-h-[34px] px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD54F] to-[#FACC15] text-[#2A1459] text-[10px] font-black cursor-pointer shrink-0 shadow-xs"
            >
              {isRtl ? 'تفعيل الكارت' : 'Activate Card'}
            </button>
          )}
        </div>
      </section>

      {/* 4 Dedicated Luxury 3D Glassmorphism Product Cards */}
      <div className="grid grid-cols-1 gap-4">
        {FOOD_BENEFIT_OFFERS.map((offer) => {
          const discountedEgp =
            offer.basePriceEgp !== null
              ? Math.round(offer.basePriceEgp * (1 - offer.discountPct / 100))
              : null;

          return (
            <article
              key={offer.id}
              className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B18B0] border border-[#FFD54F]/55 shadow-[0_18px_40px_-14px_rgba(42,20,89,0.58)] text-white"
            >
              {/* Frosted Glass Highlight Layer */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/12 backdrop-blur-sm border border-white/20 text-[10px] font-black text-[#FFD54F]">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {isRtl ? offer.partnerBrandAr : offer.partnerBrandEn}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${
                      cardActivated
                        ? 'bg-gradient-to-r from-[#FFD54F] to-[#FACC15] text-[#2A1459]'
                        : 'bg-[#2A1459] text-[#FFD54F] border border-[#FFD54F]/55'
                    }`}
                  >
                    {cardActivated
                      ? isRtl
                        ? `خصم ${offer.discountPct}% مفعّل`
                        : `${offer.discountPct}% Active`
                      : isRtl
                        ? `خصم ${offer.discountPct}% بالكارت`
                        : `${offer.discountPct}% with Card`}
                  </span>
                </div>

                {/* 3D Glass Studio Visual Stage */}
                <div className="relative rounded-2xl bg-gradient-to-b from-[#EDE9FE]/18 via-[#6D28D9]/25 to-[#2A1459]/75 border border-[#FFD54F]/35 p-3 flex items-center justify-center overflow-hidden min-h-[210px]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-10 bottom-3 h-10 rounded-full bg-[#FFD54F]/25 blur-2xl"
                  />
                  <BasetCleanImage
                    src={offer.primaryImage}
                    alt={isRtl ? offer.titleAr : offer.titleEn}
                    cleanCheckerboard
                    className="relative z-10 max-h-[215px] w-auto object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]"
                  />
                </div>

                {/* Origin Highlight for ZADI / Wadi & Farafra Dates */}
                {(offer.originTagAr || offer.originTagEn) && (
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD54F]/20 to-[#FACC15]/10 border border-[#FFD54F]/50 flex items-center gap-2 text-[11px] font-black text-[#FFD54F]">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{isRtl ? offer.originTagAr : offer.originTagEn}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-black text-white leading-snug">
                    {isRtl ? offer.titleAr : offer.titleEn}
                  </h2>
                  <p className="text-xs font-semibold text-[#EDE9FE] leading-relaxed">
                    {isRtl ? offer.subtitleAr : offer.subtitleEn}
                  </p>
                </div>

                {/* Pricing & Card Verification Footer */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold text-[#D8B4FE]">
                      {isRtl ? offer.unitLabelAr : offer.unitLabelEn}
                    </div>
                    {offer.basePriceEgp !== null && discountedEgp !== null && (
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="text-base font-black text-[#FFD54F] tabular-nums">
                          {cardActivated ? discountedEgp : offer.basePriceEgp} {currencyLabel}
                        </span>
                        {cardActivated ? (
                          <span className="text-[11px] line-through text-[#D8B4FE]/75 tabular-nums">
                            {offer.basePriceEgp}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#EDE9FE]">
                            ({discountedEgp} {isRtl ? 'بعد التفعيل' : 'after activation'})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOffer(offer)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] text-[#2A1459] text-xs font-black flex items-center gap-1.5 shadow-[0_8px_20px_rgba(250,204,21,0.42)] cursor-pointer active:scale-95 transition-transform"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isRtl ? 'مشاهدة العرض' : 'View Offer'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Offer Detail & Verified Redemption Modal */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 max-w-[430px] mx-auto bg-[#1D0B3B]/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[88dvh] overflow-y-auto rounded-[28px] bg-gradient-to-b from-[#3B0764] via-[#4C1D95] to-[#2A1459] text-white border-2 border-[#FFD54F]/70 shadow-2xl p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black text-[#FFD54F]">
                  {isRtl ? selectedOffer.partnerBrandAr : selectedOffer.partnerBrandEn}
                </div>
                <h3 className="text-lg font-black text-white leading-snug">
                  {isRtl ? selectedOffer.titleAr : selectedOffer.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                aria-label={isRtl ? 'إغلاق تفاصيل العرض' : 'Close offer modal'}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="rounded-2xl bg-white/10 border border-[#FFD54F]/40 p-3 flex items-center justify-center">
              <BasetCleanImage
                src={selectedOffer.primaryImage}
                alt={isRtl ? selectedOffer.titleAr : selectedOffer.titleEn}
                cleanCheckerboard
                className="max-h-[190px] w-auto object-contain"
              />
            </div>

            {selectedOffer.secondaryImage && (
              <div className="rounded-2xl overflow-hidden border border-white/20 h-32">
                <img
                  src={selectedOffer.secondaryImage}
                  alt={isRtl ? 'صورة تفصيلية للمحتويات' : 'Detailed contents photo'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 space-y-2">
              <div className="text-xs font-black text-[#FFD54F]">
                {isRtl ? 'محتويات العرض المعتمدة:' : 'Included Package Details:'}
              </div>
              <ul className="space-y-1.5 text-xs text-[#EDE9FE]">
                {(isRtl ? selectedOffer.contentsAr : selectedOffer.contentsEn).map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFD54F] shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-[#2A1459]/80 border border-[#C084FC]/30 p-3.5 space-y-1.5">
              <div className="text-xs font-black text-[#FFD54F]">
                {isRtl ? 'الشروط والأحكام:' : 'Offer Terms & Conditions:'}
              </div>
              <ul className="space-y-1 text-[11px] text-[#EDE9FE] leading-relaxed">
                {(isRtl ? selectedOffer.termsAr : selectedOffer.termsEn).map((term) => (
                  <li key={term}>• {term}</li>
                ))}
              </ul>
            </div>

            {cardActivated && (
              <div>
                <label className="block text-[11px] font-bold text-[#EDE9FE] mb-1">
                  {isRtl ? 'ملاحظات التوصيل أو الفرع (اختياري)' : 'Delivery / Pickup Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  placeholder={isRtl ? 'مثال: تسليم العاشر من رمضان - الوردية الصباحية' : 'e.g. Badr / 10th of Ramadan morning shift'}
                  className="min-h-[42px] w-full px-3 rounded-xl bg-white/10 border border-[#FFD54F]/40 text-xs text-white placeholder-[#D8B4FE]/70 focus:outline-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              {cardActivated ? (
                <button
                  type="button"
                  disabled={submittingId === selectedOffer.id}
                  onClick={() => void handleClaimFoodOffer(selectedOffer)}
                  className="min-h-[46px] w-full rounded-xl bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] text-[#2A1459] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {submittingId === selectedOffer.id
                      ? isRtl ? 'جاري تسجيل العرض...' : 'Applying Discount...'
                      : isRtl ? 'تأكيد طلب العرض بخصم 10%' : 'Confirm Offer with 10% Off'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOffer(null);
                    onNavigateTab('baset_card');
                  }}
                  className="min-h-[46px] w-full rounded-xl bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] text-[#2A1459] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isRtl ? 'فعّل كارت باسط الآن لفتح خصم 10%' : 'Activate BASET Card for 10% Off'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
