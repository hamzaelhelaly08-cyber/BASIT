import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  Copy,
  QrCode,
  UtensilsCrossed,
  Gift,
  Building2,
  Phone,
  UserRound,
  BadgeCheck,
} from 'lucide-react';
import type { LanguageCode } from '../data/phase1Data';
import {
  BASIT_OFFICIAL_CARD_ASSET,
  FOOD_BENEFIT_OFFERS,
  FAMILY_ENTERTAINMENT_CATEGORIES,
} from '../data/basetBenefitsData';
import {
  activateBasetCard,
  deactivateBasetCard,
  type BasetCardRecord,
  type BasetRedemptionRecord,
} from '../services/basetBenefitsService';
import {
  BasetBenefitsHeaderNav,
  type BasetProgramTab,
} from './BasetBenefitsHeaderNav';

interface BasetCardShowcaseViewProps {
  lang: LanguageCode;
  cardActivated: boolean;
  cardLoading: boolean;
  card: BasetCardRecord | null;
  redemptions: BasetRedemptionRecord[];
  defaultName?: string;
  onNavigateTab: (tab: BasetProgramTab) => void;
  onBackHome: () => void;
  onCardStateUpdated: (next: {
    activated: boolean;
    card: BasetCardRecord | null;
    redemptions: BasetRedemptionRecord[];
  }) => void;
  onToast: (msg: string) => void;
}

/** Real scannable QR image rendered strictly from server-issued qrPayload when activated */
function VerifiedCardQrImg({ payload }: { payload: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    if (!payload) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(payload, {
      width: 192,
      margin: 1,
      color: {
        dark: '#2A0548',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [payload]);

  if (!qrDataUrl) {
    return (
      <div className="w-24 h-24 rounded-xl bg-white p-2 flex items-center justify-center border border-[#4C1D95]/15">
        <QrCode className="w-8 h-8 text-[#4C1D95]" />
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="BASIT Card Activation QR"
      className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-inner shrink-0 object-contain border border-[#4C1D95]/15"
    />
  );
}

export const BasetCardShowcaseView: React.FC<BasetCardShowcaseViewProps> = ({
  lang,
  cardActivated,
  cardLoading,
  card,
  redemptions,
  defaultName = '',
  onNavigateTab,
  onBackHome,
  onCardStateUpdated,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [holderName, setHolderName] = useState(defaultName);
  const [phone, setPhone] = useState('');
  const [entityName, setEntityName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const py = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    setTilt({
      rx: Math.round(-py * 12),
      ry: Math.round(px * 14),
    });
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const resp = await activateBasetCard({
        holderName: holderName.trim(),
        phone: phone.trim(),
        entityName: entityName.trim(),
        employeeCode: employeeCode.trim(),
        acceptedTerms,
      });
      onCardStateUpdated({
        activated: Boolean(resp.activated),
        card: resp.card,
        redemptions: resp.redemptions || [],
      });
      onToast(
        resp.messageAr ||
          (isRtl
            ? 'تم تفعيل كارت باسط العائلي بنجاح — خصم 10% نشط الآن.'
            : 'BASET Family Benefits Card activated — 10% discount unlocked.')
      );
    } catch (err) {
      onToast(
        err instanceof Error
          ? err.message
          : isRtl
            ? 'يرجى التحقق من البيانات المدخلة.'
            : 'Please verify activation details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    setSubmitting(true);
    try {
      await deactivateBasetCard();
      onCardStateUpdated({
        activated: false,
        card: null,
        redemptions,
      });
      onToast(isRtl ? 'تم إيقاف تفعيل الكارت في هذه الجلسة.' : 'Card deactivated for this session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <BasetBenefitsHeaderNav
        lang={lang}
        activeTab="baset_card"
        cardActivated={cardActivated}
        cardLoading={cardLoading}
        card={card}
        onNavigateTab={onNavigateTab}
        onBackHome={onBackHome}
      />

      {/* Interactive 3D BASET Family Benefits Card Stage */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2A1459] via-[#4C1D95] to-[#6D28D9] text-white border border-[#FFD54F]/65 shadow-[0_24px_56px_-16px_rgba(42,20,89,0.78)] p-5 space-y-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -end-12 w-48 h-48 rounded-full bg-[#FFD54F]/25 blur-3xl"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-[#FFD54F]/55 text-[#FFD54F] text-[10px] font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'برنامج مزايا كارت باسط العائلي' : 'BASET Family Benefits Program'}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
              cardActivated
                ? 'bg-gradient-to-r from-[#FFD54F] to-[#FACC15] text-[#2A1459]'
                : 'bg-[#2A1459] text-[#FFD54F] border border-[#FFD54F]/55'
            }`}
          >
            {cardActivated ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>
              {cardActivated
                ? isRtl ? 'حالة الكارت: مفعّل ونشط' : 'Status: Active'
                : isRtl ? 'حالة الكارت: غير مفعّل' : 'Status: Inactive'}
            </span>
          </span>
        </div>

        {/* Official Approved Two-Sided BASIT Card Display (Front & Back) */}
        <div
          onPointerMove={handleCardPointerMove}
          onPointerLeave={() => setTilt({ rx: 0, ry: 0 })}
          className="relative rounded-3xl bg-[#16082E] border border-[#FFD54F]/45 p-3 sm:p-5 flex flex-col items-center justify-center overflow-hidden space-y-3"
          style={{ perspective: '900px' }}
        >
          <div
            className="relative w-full flex justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
          >
            <img
              src={BASIT_OFFICIAL_CARD_ASSET}
              alt="كارت BASIT الرسمي المعتمد — الوجه الأمامي والخلفي"
              className="w-full max-w-[460px] h-auto rounded-2xl object-contain shadow-2xl"
            />
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-xl bg-white/8 border border-white/12 px-3 py-2">
              <div className="font-black text-[#F5C451]">
                {isRtl ? 'الوجه الأمامي (Front)' : 'Card Front'}
              </div>
              <div className="text-[#EDE9FE]/90">
                {isRtl
                  ? 'الشركة الوطنية اللوجستية | BASIT CARD · الاسم، رقم العضوية، الشركة، وحالة ACTIVE'
                  : 'Al Watania Logistics | BASIT CARD · Member Name, ID, Company & ACTIVE status'}
              </div>
            </div>
            <div className="rounded-xl bg-white/8 border border-white/12 px-3 py-2">
              <div className="font-black text-[#F5C451]">
                {isRtl ? 'الوجه الخلفي (Back)' : 'Card Back'}
              </div>
              <div className="text-[#EDE9FE]/90">
                {isRtl
                  ? 'MORE BENEFITS. MORE SAVINGS · العروض الحصرية والموسمية والكاش باك · BASIT.SA'
                  : 'MORE BENEFITS. MORE SAVINGS · Exclusive, Seasonal & Cashback · BASIT.SA'}
              </div>
            </div>
          </div>

          {/* Linked Live Membership Summary Bar */}
          <div className="w-full rounded-xl bg-white/10 border border-[#F5C451]/35 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-[#EDE9FE]">
                <strong className="text-[#F5C451]">{isRtl ? 'العضو:' : 'Member:'}</strong>{' '}
                {cardActivated && card ? card.holderName : isRtl ? 'غير مرتبط بعد' : 'Not linked yet'}
              </span>
              <span className="text-[#EDE9FE]">
                <strong className="text-[#F5C451]">{isRtl ? 'رقم العضوية:' : 'ID:'}</strong>{' '}
                <span className="font-mono" dir="ltr">
                  {cardActivated && card ? card.cardNumber : '---'}
                </span>
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                cardActivated && card?.status === 'active'
                  ? 'bg-[#F5C451] text-[#2A0548]'
                  : 'bg-white/15 text-white'
              }`}
            >
              {cardActivated && card?.status === 'active'
                ? isRtl ? 'مفعّل' : 'Active'
                : isRtl ? 'موقوف / بانتظار التفعيل' : 'Locked / Inactive'}
            </span>
          </div>
        </div>
      </section>

      {/* Real Server-Backed Activation OR Active Credential Panel */}
      {cardActivated && card ? (
        <section className="rounded-[26px] bg-white dark:bg-[#1B132B] text-[#1E1633] dark:text-white border border-[#4C1D95]/15 dark:border-[#C084FC]/20 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5C451] text-[#2A0E4D] flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1E1633] dark:text-white">
                  {isRtl ? 'كارت باسط العائلي مفعّل الآن' : 'BASET Family Card Activated'}
                </h2>
                <p className="text-[11px] font-bold text-[#4C1D95] dark:text-[#F5C451]">
                  {isRtl ? 'خصم 10% متاح فوراً على جميع العروض' : '10% instant savings unlocked'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/12 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                {isRtl ? 'رقم الكارت التسلسلي المعتمد' : 'Verified Card Serial'}
              </div>
              <div className="font-mono text-sm font-black text-[#4C1D95] dark:text-[#F5C451] tracking-wider" dir="ltr">
                {card.cardNumber}
              </div>
              <div className="text-xs font-extrabold text-[#1E1633] dark:text-white truncate">
                {card.holderName}
              </div>
              <div className="text-[11px] font-semibold text-[#5E5570] dark:text-[#C4B5FD] truncate">
                {card.entityName}
                {card.employeeCode ? ` · #${card.employeeCode}` : ''}
              </div>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(card.cardNumber);
                  onToast(isRtl ? 'تم نسخ رقم الكارت.' : 'Card serial copied.');
                }}
                className="min-h-[34px] px-3 py-1 rounded-lg bg-[#F5F3FF] dark:bg-[#241B38] hover:bg-[#EDE9FE] text-[10px] font-black text-[#4C1D95] dark:text-[#F5C451] inline-flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isRtl ? 'نسخ رقم الكارت' : 'Copy Serial'}</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-1">
              <VerifiedCardQrImg payload={card.qrPayload} />
              <span className="text-[9px] font-black text-[#4C1D95] dark:text-[#F5C451] flex items-center gap-1 text-center">
                <QrCode className="w-3 h-3 shrink-0" />
                <span>{isRtl ? 'رمز الجلسة المسجلة' : 'Session Issued QR'}</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-[#5E5570] dark:text-[#C4B5FD] bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/10 rounded-xl px-3 py-2">
            {isRtl
              ? 'ملاحظة التحقق: رمز QR المعروض مرتبط ببيانات التفعيل المسجلة في هذه الجلسة، ويكتمل التحقق الميداني الفوري لدى الشركاء عند إطلاق المرحلة الثانية.'
              : 'Verification note: QR code reflects current session registration; live partner POS verification completes in Phase 2.'}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('baset_food_benefits')}
              className="min-h-[46px] px-3 rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UtensilsCrossed className="w-4 h-4 shrink-0" />
              <span>{isRtl ? 'عروض الطعام (4)' : 'Food Offers (4)'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('baset_family_entertainment')}
              className="min-h-[46px] px-3 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Gift className="w-4 h-4 text-[#F5C451] shrink-0" />
              <span>{isRtl ? 'ترفيه العائلة (8)' : 'Family Fun (8)'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleDeactivate()}
            className="w-full min-h-[38px] rounded-xl bg-[#FAF8F5] dark:bg-[#241B38] hover:bg-rose-50 text-[11px] font-bold text-[#5E5570] dark:text-[#C4B5FD] cursor-pointer"
          >
            {isRtl ? 'إلغاء ربط وتفعيل الكارت على هذا الجهاز' : 'Deactivate Card on This Session'}
          </button>
        </section>
      ) : (
        <section className="rounded-[26px] bg-white dark:bg-[#1B132B] text-[#1E1633] dark:text-white border border-[#4C1D95]/15 dark:border-[#C084FC]/20 p-5 shadow-sm">
          <form onSubmit={handleActivateSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <h2 className="text-base font-black text-[#4C1D95] dark:text-[#F5C451]">
                {isRtl ? 'تفعيل كارت باسط العائلي الفعلي' : 'Activate Your BASET Family Card'}
              </h2>
              <p className="text-xs text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                {isRtl
                  ? 'لا يظهر الكارت كمفعّل قبل التحقق وحفظ بيانات التفعيل عبر النظام. أكمل البيانات لإصدار الرقم التسلسلي وكود QR.'
                  : 'Card remains inactive until verified and issued by the server. Complete details below to issue your serial & QR.'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-[#1E1633] dark:text-[#EDE9FE] mb-1">
                  {isRtl ? 'الاسم الكامل لصاحب الكارت *' : 'Card Holder Full Name *'}
                </label>
                <div className="relative">
                  <UserRound className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] absolute top-3 start-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder={isRtl ? 'الاسم ثلاثي كما بالبطاقة' : 'Full Name'}
                    className="min-h-[44px] w-full ps-9 pe-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 text-[#1E1633] dark:text-white focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1633] dark:text-[#EDE9FE] mb-1">
                  {isRtl ? 'رقم الموبايل *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] absolute top-3 start-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    minLength={8}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    dir="ltr"
                    className="min-h-[44px] w-full ps-9 pe-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 text-[#1E1633] dark:text-white focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1633] dark:text-[#EDE9FE] mb-1">
                  {isRtl ? 'جهة العمل / الشركة المتعاقدة (أو عضوية عائلية)' : 'Employer / Contracted Entity (or Family)'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] absolute top-3 start-3 pointer-events-none" />
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder={isRtl ? 'مثال: السويدي إليكتريك / XD EGEMAC / Ha-Be / عائلي' : 'e.g. El Sewedy / Ha-Be / Family Member'}
                    className="min-h-[44px] w-full ps-9 pe-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 text-[#1E1633] dark:text-white focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E1633] dark:text-[#EDE9FE] mb-1">
                  {isRtl ? 'كود الموظف / كود الدعوة (اختياري)' : 'Employee / Invite Code (Optional)'}
                </label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder={isRtl ? 'مثال: EMP-4021' : 'e.g. EMP-4021'}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 text-[#1E1633] dark:text-white focus:outline-none focus:border-[#4C1D95]"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-[#4C1D95]"
                />
                <span className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                  {isRtl
                    ? 'أوافق على شروط استخدام برنامج مزايا كارت باسط العائلي والتحقق من الصلاحية لدى الشركاء.'
                    : 'I agree to BASET Family Benefits Program terms and partner QR verification.'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !acceptedTerms}
              className="min-h-[48px] w-full rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-sm font-black shadow-sm cursor-pointer disabled:opacity-60 transition-colors"
            >
              {submitting
                ? isRtl ? 'جاري التفعيل والتحقق...' : 'Activating & Verifying...'
                : isRtl ? 'تفعيل كارت باسط الآن' : 'Activate BASET Card Now'}
            </button>
          </form>
        </section>
      )}

      {/* Recorded Redemptions History */}
      {redemptions.length > 0 && (
        <section className="rounded-[24px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-[#C084FC]/20 p-4 text-[#1E1633] dark:text-white space-y-2.5 shadow-xs">
          <h3 className="text-xs font-black text-[#4C1D95] dark:text-[#F5C451]">
            {isRtl ? 'سجل الاستفادة والخصومات المسجلة بالكارت' : 'Verified Card Redemptions'}
          </h3>
          <div className="space-y-2">
            {redemptions.slice(0, 6).map((r) => (
              <div
                key={r.redemptionId}
                className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/10 flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="min-w-0">
                  <div className="font-black text-[#1E1633] dark:text-white truncate">{r.offerTitle}</div>
                  <div className="text-[10px] text-[#5E5570] dark:text-[#C4B5FD] truncate">
                    {r.partnerName} · {r.redemptionId}
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#F5C451] text-[#2A0E4D] font-black text-[10px]">
                  -{r.discountAppliedPct}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explicit Terms Breakdown per Offer & Destination */}
      <section className="rounded-[24px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-[#C084FC]/20 p-4 text-[#1E1633] dark:text-white space-y-3 shadow-xs">
        <h3 className="text-sm font-black text-[#4C1D95] dark:text-[#F5C451] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{isRtl ? 'ملخص العروض والشروط المشمولة بالكارت' : 'Eligible Offers & Explicit Terms'}</span>
        </h3>

        <div className="space-y-2">
          {FOOD_BENEFIT_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/10 space-y-1 text-xs"
            >
              <div className="font-black text-[#1E1633] dark:text-white">
                {isRtl ? offer.titleAr : offer.titleEn}
              </div>
              <div className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD]">
                {isRtl ? offer.termsAr[0] : offer.termsEn[0]}
              </div>
            </div>
          ))}
          <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/10 space-y-1 text-xs">
            <div className="font-black text-[#1E1633] dark:text-white">
              {isRtl
                ? `وجهات الترفيه العائلي (${FAMILY_ENTERTAINMENT_CATEGORIES.length} وجهات)`
                : `Family Entertainment (${FAMILY_ENTERTAINMENT_CATEGORIES.length} Categories)`}
            </div>
            <div className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD]">
              {isRtl
                ? 'السيرك، السينمات وأحدث الأفلام، الشاشات والترفيه، القرى السياحية، السبا، بيت الملح، الرحلات، والشاليهات — تُطبّق المزايا بعد التحقق الفعلي من تفعيل الكارت.'
                : 'Circus, Cinemas, Screens, Tourist Resorts, Spa, Salt House, Trips & Chalets — perks apply after server-verified card activation.'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
