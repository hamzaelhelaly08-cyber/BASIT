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

      {/* Destination 1 Royal Purple Hero */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] text-white p-5 shadow-md space-y-3.5">
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#F5C451] text-[10px] font-black">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{isRtl ? 'عروض الطعام والسلع' : 'Food & Pantry Offers'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5C451] text-[#2A0E4D] text-[10px] font-black shadow-xs">
            <Percent className="w-3 h-3" />
            <span>10% OFF</span>
          </span>
        </div>

        <div className="relative z-10 space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black leading-tight text-white">
            {isRtl ? 'وجباتك واحتياجاتك أحلى مع باسط' : 'Your Meals & Pantry Are Better with BASET'}
          </h1>
          <p className="text-xs font-medium text-[#EDE9FE] leading-relaxed">
            {isRtl
              ? 'عروض طعام حصرية وخصم 10% عند تفعيل كارت باسط العائلي بالتعاون مع CATERING MISR وعلامة ZADI لتمور الوادي والفرافرة.'
              : 'Exclusive family food packages with verified 10% BASET Family Card discount from CATERING MISR & ZADI oasis dates.'}
          </p>
        </div>

        {/* Live Card Eligibility Strip */}
        <div className="relative z-10 rounded-2xl bg-white/12 border border-white/15 p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {cardActivated ? (
              <ShieldCheck className="w-4 h-4 text-[#F5C451] shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-[#F5C451] shrink-0" />
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
              className="min-h-[36px] px-3.5 py-1 rounded-xl bg-[#F5C451] text-[#2A0E4D] text-[11px] font-black cursor-pointer shrink-0 shadow-xs"
            >
              {isRtl ? 'تفعيل الكارت' : 'Activate Card'}
            </button>
          )}
        </div>
      </section>

      {/* Calm Ivory White Product Cards */}
      <div className="grid grid-cols-1 gap-4">
        {FOOD_BENEFIT_OFFERS.map((offer) => {
          const discountedEgp =
            offer.basePriceEgp !== null
              ? Math.round(offer.basePriceEgp * (1 - offer.discountPct / 100))
              : null;

          return (
            <article
              key={offer.id}
              className="rounded-[24px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 shadow-xs overflow-hidden text-[#1E1633] dark:text-white"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F3FF] dark:bg-[#241B38] text-[10px] font-black text-[#4C1D95] dark:text-[#F5C451]">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {isRtl ? offer.partnerBrandAr : offer.partnerBrandEn}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black ${
                      cardActivated
                        ? 'bg-[#F5C451] text-[#2A0E4D]'
                        : 'bg-[#FAF8F5] dark:bg-[#241B38] text-[#4C1D95] dark:text-[#F5C451] border border-[#4C1D95]/15'
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

                {/* Clean Editorial Product Photography */}
                <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/10 overflow-hidden">
                  <img
                    src={offer.primaryImage}
                    alt={isRtl ? offer.titleAr : offer.titleEn}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                {(offer.originTagAr || offer.originTagEn) && (
                  <div className="px-3 py-1.5 rounded-xl bg-[#F5F3FF] dark:bg-[#241B38] flex items-center gap-2 text-[11px] font-black text-[#4C1D95] dark:text-[#F5C451]">
                    <Sparkles className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
                    <span>{isRtl ? offer.originTagAr : offer.originTagEn}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <h2 className="text-base font-black text-[#1E1633] dark:text-white leading-snug">
                    {isRtl ? offer.titleAr : offer.titleEn}
                  </h2>
                  <p className="text-xs font-medium text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                    {isRtl ? offer.subtitleAr : offer.subtitleEn}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/10 p-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                      {isRtl ? offer.unitLabelAr : offer.unitLabelEn}
                    </div>
                    {offer.basePriceEgp !== null && discountedEgp !== null && (
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="text-base font-black text-[#4C1D95] dark:text-[#F5C451] tabular-nums">
                          {cardActivated ? discountedEgp : offer.basePriceEgp} {currencyLabel}
                        </span>
                        {cardActivated ? (
                          <span className="text-[11px] line-through text-[#64748B] tabular-nums">
                            {offer.basePriceEgp}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                            ({discountedEgp} {isRtl ? 'بعد التفعيل' : 'after activation'})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOffer(offer)}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Eye className="w-4 h-4 text-[#F5C451]" />
                    <span>{isRtl ? 'مشاهدة العرض' : 'View Offer'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Offer Detail & Verified Redemption Modal on Ivory White */}
      {selectedOffer && (
        <div
          className="fixed inset-0 z-50 max-w-[430px] mx-auto bg-[#1D0B3B]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[88dvh] overflow-y-auto rounded-[28px] bg-[#FAF8F5] dark:bg-[#1B132B] text-[#1E1633] dark:text-white border border-[#4C1D95]/20 shadow-2xl p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black text-[#4C1D95] dark:text-[#F5C451]">
                  {isRtl ? selectedOffer.partnerBrandAr : selectedOffer.partnerBrandEn}
                </div>
                <h3 className="text-lg font-black text-[#1E1633] dark:text-white leading-snug">
                  {isRtl ? selectedOffer.titleAr : selectedOffer.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                aria-label={isRtl ? 'إغلاق تفاصيل العرض' : 'Close offer modal'}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-white dark:bg-[#241B38] border border-[#4C1D95]/15 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 text-[#1E1633] dark:text-white" />
              </button>
            </div>

            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#4C1D95]/10 bg-[#FAF8F5] dark:bg-[#241B38]">
              <img
                src={selectedOffer.primaryImage}
                alt={isRtl ? selectedOffer.titleAr : selectedOffer.titleEn}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedOffer.secondaryImage && (
              <div className="rounded-2xl overflow-hidden border border-[#4C1D95]/12 h-36">
                <img
                  src={selectedOffer.secondaryImage}
                  alt={isRtl ? 'صورة تفصيلية للمحتويات' : 'Detailed contents photo'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="rounded-2xl bg-white dark:bg-[#241B38] border border-[#4C1D95]/12 p-3.5 space-y-2">
              <div className="text-xs font-black text-[#4C1D95] dark:text-[#F5C451]">
                {isRtl ? 'محتويات العرض المعتمدة:' : 'Included Package Details:'}
              </div>
              <ul className="space-y-1.5 text-xs text-[#1E1633] dark:text-[#EDE9FE]">
                {(isRtl ? selectedOffer.contentsAr : selectedOffer.contentsEn).map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#241B38] border border-[#4C1D95]/12 p-3.5 space-y-1.5">
              <div className="text-xs font-black text-[#4C1D95] dark:text-[#F5C451]">
                {isRtl ? 'الشروط والأحكام:' : 'Offer Terms & Conditions:'}
              </div>
              <ul className="space-y-1 text-[11px] text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                {(isRtl ? selectedOffer.termsAr : selectedOffer.termsEn).map((term) => (
                  <li key={term}>• {term}</li>
                ))}
              </ul>
            </div>

            {cardActivated && (
              <div>
                <label className="block text-[11px] font-bold text-[#1E1633] dark:text-[#EDE9FE] mb-1">
                  {isRtl ? 'ملاحظات التوصيل أو الفرع (اختياري)' : 'Delivery / Pickup Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  placeholder={isRtl ? 'مثال: تسليم العاشر من رمضان - الوردية الصباحية' : 'e.g. Badr / 10th of Ramadan morning shift'}
                  className="min-h-[42px] w-full px-3 rounded-xl bg-white dark:bg-[#120D1D] border border-[#4C1D95]/20 text-xs text-[#1E1633] dark:text-white focus:outline-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              {cardActivated ? (
                <button
                  type="button"
                  disabled={submittingId === selectedOffer.id}
                  onClick={() => void handleClaimFoodOffer(selectedOffer)}
                  className="min-h-[46px] w-full rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
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
                  className="min-h-[46px] w-full rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
