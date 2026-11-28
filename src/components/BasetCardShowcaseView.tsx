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
      <section className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] text-[#FFFFFF] border border-[rgba(212,175,55,0.5)] shadow-[0_24px_56px_-16px_rgba(36,0,70,0.78)] p-4 space-y-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -end-12 w-48 h-48 rounded-full bg-[#FFE875]/20 blur-3xl"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-[rgba(212,175,55,0.45)] text-[#FFE875] text-[10px] font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE875]" />
            <span>{isRtl ? 'برنامج مزايا كارت باسط العائلي' : 'BASET Family Benefits Program'}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
              cardActivated
                ? 'bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] text-[#240046]'
                : 'bg-[#1A052E] text-[#FFE875] border border-[rgba(212,175,55,0.5)]'
            }`}
          >
            {cardActivated ? <ShieldCheck className="w-3.5 h-3.5 text-[#240046]" /> : <Lock className="w-3.5 h-3.5 text-[#FFE875]" />}
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
          className="relative rounded-3xl bg-[#1A052E] border border-[rgba(212,175,55,0.45)] p-3 flex flex-col items-center justify-center overflow-hidden space-y-3"
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
              className="w-full max-w-[400px] h-auto rounded-2xl object-contain shadow-2xl"
            />
          </div>

          <div className="w-full grid grid-cols-1 gap-2 text-[11px]">
            <div className="rounded-xl bg-white/8 border border-[rgba(212,175,55,0.25)] px-3 py-2">
              <div className="font-black text-[#FFE875]">
                {isRtl ? 'الوجه الأمامي (Front)' : 'Card Front'}
              </div>
              <div className="text-[#FFFDF7]/90">
                {isRtl
                  ? 'الشركة الوطنية اللوجستية | BASIT CARD · الاسم، رقم العضوية، الشركة، وحالة ACTIVE'
                  : 'Al Watania Logistics | BASIT CARD · Member Name, ID, Company & ACTIVE status'}
              </div>
            </div>
            <div className="rounded-xl bg-white/8 border border-[rgba(212,175,55,0.25)] px-3 py-2">
              <div className="font-black text-[#FFE875]">
                {isRtl ? 'الوجه الخلفي (Back)' : 'Card Back'}
              </div>
              <div className="text-[#FFFDF7]/90">
                {isRtl
                  ? 'MORE BENEFITS. MORE SAVINGS · العروض الحصرية والموسمية والكاش باك · BASIT.SA'
                  : 'MORE BENEFITS. MORE SAVINGS · Exclusive, Seasonal & Cashback · BASIT.SA'}
              </div>
            </div>
          </div>

          {/* Linked Live Membership Summary Bar */}
          <div className="w-full rounded-xl bg-white/10 border border-[rgba(212,175,55,0.4)] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-[#FFFDF7]">
                <strong className="text-[#FFE875]">{isRtl ? 'العضو:' : 'Member:'}</strong>{' '}
                {cardActivated && card ? card.holderName : isRtl ? 'غير مرتبط بعد' : 'Not linked yet'}
              </span>
              <span className="text-[#FFFDF7]">
                <strong className="text-[#FFE875]">{isRtl ? 'رقم العضوية:' : 'ID:'}</strong>{' '}
                <span className="font-mono" dir="ltr">
                  {cardActivated && card ? card.cardNumber : '---'}
                </span>
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                cardActivated && card?.status === 'active'
                  ? 'bg-[#FFE875] text-[#240046]'
                  : 'bg-white/15 text-[#FFFFFF]'
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
        <section className="rounded-[24px] bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 text-[#240046] dark:text-[#FFFDF7] border border-[rgba(212,175,55,0.4)] p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] text-[#240046] flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#240046] dark:text-[#FFFDF7]">
                  {isRtl ? 'كارت باسط العائلي مفعّل الآن' : 'BASET Family Card Activated'}
                </h2>
                <p className="text-[11px] font-bold text-[#5A189A] dark:text-[#FFE875]">
                  {isRtl ? 'خصم 10% متاح فوراً على جميع العروض' : '10% instant savings unlocked'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.35)] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#3B123F] dark:text-[#FFE875]">
                {isRtl ? 'رقم الكارت التسلسلي المعتمد' : 'Verified Card Serial'}
              </div>
              <div className="font-mono text-sm font-black text-[#5A189A] dark:text-[#FFE875] tracking-wider" dir="ltr">
                {card.cardNumber}
              </div>
              <div className="text-xs font-extrabold text-[#240046] dark:text-[#FFFFFF] leading-snug">
                {card.holderName}
              </div>
              <div className="text-[11px] font-semibold text-[#3B123F] dark:text-[#FFFDF7]/85 leading-snug">
                {card.entityName}
                {card.employeeCode ? ` · #${card.employeeCode}` : ''}
              </div>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(card.cardNumber);
                  onToast(isRtl ? 'تم نسخ رقم الكارت.' : 'Card serial copied.');
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#240046] hover:bg-[#FFFDF7] border border-[rgba(212,175,55,0.4)] text-[11px] font-black text-[#5A189A] dark:text-[#FFE875] inline-flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <Copy className="w-4 h-4 text-[#D4AF37]" />
                <span>{isRtl ? 'نسخ رقم الكارت' : 'Copy Serial'}</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-1">
              <VerifiedCardQrImg payload={card.qrPayload} />
              <span className="text-[9px] font-black text-[#5A189A] dark:text-[#FFE875] flex items-center gap-1 text-center">
                <QrCode className="w-3 h-3 shrink-0" />
                <span>{isRtl ? 'رمز الجلسة المسجلة' : 'Session Issued QR'}</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-[#3B123F] dark:text-[#FFFDF7]/85 bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.3)] rounded-xl px-3 py-2">
            {isRtl
              ? 'ملاحظة التحقق: رمز QR المعروض مرتبط ببيانات التفعيل المسجلة في هذه الجلسة، ويكتمل التحقق الميداني الفوري لدى الشركاء عند إطلاق المرحلة الثانية.'
              : 'Verification note: QR code reflects current session registration; live partner POS verification completes in Phase 2.'}
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('baset_food_benefits')}
              className="min-h-[48px] px-3 rounded-xl bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] text-[#240046] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#240046] shrink-0" />
              <span>{isRtl ? 'عروض الطعام (4)' : 'Food Offers (4)'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('baset_family_entertainment')}
              className="min-h-[48px] px-3 rounded-xl bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-[rgba(212,175,55,0.4)]"
            >
              <Gift className="w-4 h-4 text-[#FFE875] shrink-0" />
              <span>{isRtl ? 'ترفيه العائلة (8)' : 'Family Fun (8)'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleDeactivate()}
            className="w-full min-h-[44px] rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.35)] hover:bg-rose-50 text-[11px] font-bold text-[#3B123F] dark:text-[#FFFDF7] cursor-pointer"
          >
            {isRtl ? 'إلغاء ربط وتفعيل الكارت على هذا الجهاز' : 'Deactivate Card on This Session'}
          </button>
        </section>
      ) : (
        <section className="rounded-[24px] bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 text-[#240046] dark:text-[#FFFDF7] border border-[rgba(212,175,55,0.4)] p-4 shadow-sm">
          <form onSubmit={handleActivateSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <h2 className="text-base font-black text-[#5A189A] dark:text-[#FFE875]">
                {isRtl ? 'تفعيل كارت باسط العائلي الفعلي' : 'Activate Your BASET Family Card'}
              </h2>
              <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85 leading-relaxed">
                {isRtl
                  ? 'لا يظهر الكارت كمفعّل قبل التحقق وحفظ بيانات التفعيل عبر النظام. أكمل البيانات لإصدار الرقم التسلسلي وكود QR.'
                  : 'Card remains inactive until verified and issued by the server. Complete details below to issue your serial & QR.'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-[#240046] dark:text-[#FFFDF7] mb-1">
                  {isRtl ? 'الاسم الكامل لصاحب الكارت *' : 'Card Holder Full Name *'}
                </label>
                <div className="relative">
                  <UserRound className="w-4 h-4 text-[#5A189A] dark:text-[#FFE875] absolute top-3.5 start-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder={isRtl ? 'الاسم ثلاثي كما بالبطاقة' : 'Full Name'}
                    className="min-h-[44px] w-full ps-9 pe-3 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.45)] text-[#240046] dark:text-[#FFFFFF] focus:outline-none focus:border-[#5A189A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#240046] dark:text-[#FFFDF7] mb-1">
                  {isRtl ? 'رقم الموبايل *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5A189A] dark:text-[#FFE875] absolute top-3.5 start-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    minLength={8}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    dir="ltr"
                    className="min-h-[44px] w-full ps-9 pe-3 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.45)] text-[#240046] dark:text-[#FFFFFF] focus:outline-none focus:border-[#5A189A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#240046] dark:text-[#FFFDF7] mb-1">
                  {isRtl ? 'جهة العمل / الشركة المتعاقدة (أو عضوية عائلية)' : 'Employer / Contracted Entity (or Family)'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#5A189A] dark:text-[#FFE875] absolute top-3.5 start-3 pointer-events-none" />
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder={isRtl ? 'مثال: السويدي إليكتريك / XD EGEMAC / Ha-Be / عائلي' : 'e.g. El Sewedy / Ha-Be / Family Member'}
                    className="min-h-[44px] w-full ps-9 pe-3 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.45)] text-[#240046] dark:text-[#FFFFFF] focus:outline-none focus:border-[#5A189A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#240046] dark:text-[#FFFDF7] mb-1">
                  {isRtl ? 'كود الموظف / كود الدعوة (اختياري)' : 'Employee / Invite Code (Optional)'}
                </label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder={isRtl ? 'مثال: EMP-4021' : 'e.g. EMP-4021'}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.45)] text-[#240046] dark:text-[#FFFFFF] focus:outline-none focus:border-[#5A189A]"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-[#5A189A] w-4 h-4"
                />
                <span className="text-[11px] text-[#3B123F] dark:text-[#FFFDF7]/85 leading-relaxed">
                  {isRtl
                    ? 'أوافق على شروط استخدام برنامج مزايا كارت باسط العائلي والتحقق من الصلاحية لدى الشركاء.'
                    : 'I agree to BASET Family Benefits Program terms and partner QR verification.'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !acceptedTerms}
              className="min-h-[48px] w-full rounded-xl bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] text-[#240046] text-sm font-black shadow-md cursor-pointer disabled:opacity-60 transition-transform active:scale-[0.99]"
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
        <section className="rounded-[24px] bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] p-4 text-[#240046] dark:text-[#FFFDF7] space-y-2.5 shadow-xs">
          <h3 className="text-xs font-black text-[#5A189A] dark:text-[#FFE875]">
            {isRtl ? 'سجل الاستفادة والخصومات المسجلة بالكارت' : 'Verified Card Redemptions'}
          </h3>
          <div className="space-y-2">
            {redemptions.slice(0, 6).map((r) => (
              <div
                key={r.redemptionId}
                className="p-2.5 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.3)] flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="min-w-0">
                  <div className="font-black text-[#240046] dark:text-[#FFFFFF] leading-snug">{r.offerTitle}</div>
                  <div className="text-[10px] text-[#3B123F] dark:text-[#FFFDF7]/80 leading-snug">
                    {r.partnerName} · {r.redemptionId}
                  </div>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-[linear-gradient(135deg,#FFE875,#D4AF37)] text-[#240046] font-black text-[10px]">
                  -{r.discountAppliedPct}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explicit Terms Breakdown per Offer & Destination */}
      <section className="rounded-[24px] bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] p-4 text-[#240046] dark:text-[#FFFDF7] space-y-3 shadow-xs">
        <h3 className="text-sm font-black text-[#5A189A] dark:text-[#FFE875] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          <span>{isRtl ? 'ملخص العروض والشروط المشمولة بالكارت' : 'Eligible Offers & Explicit Terms'}</span>
        </h3>

        <div className="space-y-2">
          {FOOD_BENEFIT_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="p-3 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.3)] space-y-1 text-xs"
            >
              <div className="font-black text-[#240046] dark:text-[#FFFFFF]">
                {isRtl ? offer.titleAr : offer.titleEn}
              </div>
              <div className="text-[11px] text-[#3B123F] dark:text-[#FFFDF7]/85">
                {isRtl ? offer.termsAr[0] : offer.termsEn[0]}
              </div>
            </div>
          ))}
          <div className="p-3 rounded-xl bg-[#FFFDF7] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.3)] space-y-1 text-xs">
            <div className="font-black text-[#240046] dark:text-[#FFFFFF]">
              {isRtl
                ? `وجهات الترفيه العائلي (${FAMILY_ENTERTAINMENT_CATEGORIES.length} وجهات)`
                : `Family Entertainment (${FAMILY_ENTERTAINMENT_CATEGORIES.length} Categories)`}
            </div>
            <div className="text-[11px] text-[#3B123F] dark:text-[#FFFDF7]/85">
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
