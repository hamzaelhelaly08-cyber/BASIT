import React, { useEffect, useState } from 'react';
import {
  Copy,
  Check,
  QrCode,
  Edit3,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  Lock,
  ScanLine,
} from 'lucide-react';
import { CouponTemplate, EXPERIMENTAL_TAG_AR, EXPERIMENTAL_TAG_EN } from '../data/visitorWorldData';
import { LanguageCode } from '../data/phase1Data';
import { Service3DIcon } from './Service3DIcon';
import { BasitBrandMark } from './BasitBrandMark';
import { RealQrCode } from './RealQrCode';

export type CouponLifecycleStatus = 'available' | 'used' | 'expired' | 'cancelled';

export interface CouponAuditEntry {
  id: string;
  actionAr: string;
  actionEn: string;
  timestamp: string;
}

interface PersistedCouponState {
  status: CouponLifecycleStatus;
  redeemedAt?: string;
  redeemedBy?: string;
  auditTrail: CouponAuditEntry[];
}

interface VoucherCouponCardProps {
  coupon: CouponTemplate;
  lang: LanguageCode;
  customLogoDataUrl?: string | null;
}

export const VoucherCouponCard: React.FC<VoucherCouponCardProps> = ({
  coupon,
  lang,
  customLogoDataUrl,
}) => {
  const isRtl = lang === 'ar';
  const storageKey = `ce_coupon_state_${coupon.code}`;

  const [copied, setCopied] = useState(false);
  const [showQrVerifier, setShowQrVerifier] = useState(false);
  const [cashierStepArmed, setCashierStepArmed] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [customDiscountInput, setCustomDiscountInput] = useState('');
  const [isEditingSlot, setIsEditingSlot] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const [couponState, setCouponState] = useState<PersistedCouponState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedCouponState;
        if (parsed && parsed.status && Array.isArray(parsed.auditTrail)) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return {
      status: 'available',
      auditTrail: [
        {
          id: 'init',
          actionAr: 'إصدار القسيمة بحالة: متاح للاستخدام',
          actionEn: 'Voucher issued with status: Available',
          timestamp: new Date().toLocaleString('en-GB', { hour12: false }),
        },
      ],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(couponState));
    } catch {
      // ignore storage quota
    }
  }, [couponState, storageKey]);

  const appendAudit = (
    nextStatus: CouponLifecycleStatus,
    actionAr: string,
    actionEn: string,
    extra?: Partial<PersistedCouponState>
  ) => {
    const nowStr = new Date().toLocaleString('en-GB', { hour12: false });
    setCouponState((prev) => ({
      ...prev,
      ...extra,
      status: nextStatus,
      auditTrail: [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          actionAr,
          actionEn,
          timestamp: nowStr,
        },
        ...prev.auditTrail,
      ].slice(0, 12),
    }));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
    } catch {
      // clipboard fallback
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleToggleQr = () => {
    // CRITICAL SECURITY RULE: Opening or viewing QR NEVER deducts balance or marks coupon as used.
    const nextOpen = !showQrVerifier;
    setShowQrVerifier(nextOpen);
    setCashierStepArmed(false);
    if (nextOpen) {
      appendAudit(
        couponState.status,
        'عرض رمز QR للتحقق البصري فقط (بدون خصم)',
        'QR verification opened (view-only, no deduction)'
      );
    }
  };

  const handleConfirmSingleRedemption = () => {
    if (couponState.status === 'used') {
      setFeedbackNotice(
        isRtl
          ? 'تم صرف هذا الكوبون مسبقاً — يُحظر تكرار الخصم.'
          : 'Voucher already redeemed — duplicate redemption blocked.'
      );
      return;
    }
    if (couponState.status === 'expired' || couponState.status === 'cancelled') {
      setFeedbackNotice(
        isRtl
          ? 'لا يمكن صرف كوبون منتهي أو ملغي.'
          : 'Cannot redeem an expired or cancelled voucher.'
      );
      return;
    }

    const nowStr = new Date().toLocaleString('en-GB', { hour12: false });
    appendAudit(
      'used',
      'تأكيد صرف الكاشير لمرة واحدة (خصم نهائي)',
      'Idempotent 2-step cashier redemption confirmed',
      {
        redeemedAt: nowStr,
        redeemedBy: 'POS Cashier Terminal',
      }
    );
    setCashierStepArmed(false);
    setFeedbackNotice(
      isRtl
        ? 'تم تأكيد الصرف بنجاح وتسجيل المعاملة في سجل التدقيق.'
        : 'Redemption confirmed once and logged to audit trail.'
    );
  };

  const handleCancelVoucher = () => {
    if (couponState.status === 'used') return;
    appendAudit('cancelled', 'إلغاء القسيمة من صاحب الطلب / الإدارة', 'Voucher cancelled');
    setCashierStepArmed(false);
    setFeedbackNotice(isRtl ? 'تم إلغاء القسيمة.' : 'Voucher marked cancelled.');
  };

  const handleResetDemo = () => {
    appendAudit('available', 'إعادة ضبط القسيمة إلى متاح (معاينة)', 'Reset voucher to available');
    setCashierStepArmed(false);
    setFeedbackNotice(null);
  };

  const statusMeta: Record<
    CouponLifecycleStatus,
    { labelAr: string; labelEn: string; cls: string; icon: React.ReactNode }
  > = {
    available: {
      labelAr: 'متاح للاستخدام',
      labelEn: 'Available',
      cls: 'bg-[#F7F5FA] text-[#4A2378]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    used: {
      labelAr: 'مستخدم — تم الصرف',
      labelEn: 'Used / Redeemed',
      cls: 'bg-emerald-500 text-white',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
    expired: {
      labelAr: 'منتهي الصلاحية',
      labelEn: 'Expired',
      cls: 'bg-amber-500 text-white',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    cancelled: {
      labelAr: 'ملغي',
      labelEn: 'Cancelled',
      cls: 'bg-rose-600 text-white',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const activeMeta = statusMeta[couponState.status];
  const qrPayload = `BASIT-VOUCHER|CODE=${coupon.code}|CAT=${coupon.id}|STATUS=${couponState.status.toUpperCase()}`;

  return (
    <div className="ce-coupon-notch basit-liquid-glass rounded-3xl overflow-hidden flex flex-col">
      {/* Top BASIT | باسط Indigo Voucher Stub */}
      <div className="bg-gradient-to-br from-[#62339A] to-[#4A2378] p-3.5 sm:p-4 text-white relative">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Service3DIcon iconKey={coupon.iconKey} size="sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#BAE6FD]">
                  {isRtl ? 'BASIT | باسط · قسائم العروض' : 'BASIT | باسط · Vouchers'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${activeMeta.cls}`}
                >
                  {activeMeta.icon}
                  <span>{isRtl ? activeMeta.labelAr : activeMeta.labelEn}</span>
                </span>
              </div>
              <h4 className="text-sm font-black text-white leading-snug">
                {isRtl ? coupon.categoryAr : coupon.categoryEn}
              </h4>
            </div>
          </div>

          <BasitBrandMark customLogoDataUrl={customLogoDataUrl} size="xs" isRtl={isRtl} />
        </div>

        {/* Pre-Expiry Warning Strip */}
        {couponState.status === 'available' && (
          <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-white/12 border border-white/20 flex items-center gap-1.5 text-[10px] font-bold text-[#F7F5FA]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
            <span>
              {isRtl
                ? 'تحقق من تاريخ الصلاحية قبل التقديم للكاشير'
                : 'Verify validity window prior to cashier scan'}
            </span>
          </div>
        )}

        {/* Editable / Placeholder Discount Display */}
        <div className="mt-2.5 pt-2.5 border-t border-dashed border-white/30 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-white/80 block">
              {isRtl ? 'قيمة / نسبة العرض:' : 'Offer Value:'}
            </span>
            {isEditingSlot ? (
              <input
                type="text"
                value={customDiscountInput}
                onChange={(e) => setCustomDiscountInput(e.target.value)}
                placeholder={isRtl ? 'مثال: عرض تجريبي' : 'e.g. Demo Offer'}
                className="mt-1 px-3 py-2 min-h-[44px] rounded-xl bg-white text-[#292333] text-xs font-black w-48 focus:outline-none"
              />
            ) : (
              <div className="inline-block mt-1 px-3 py-1 rounded-xl bg-white text-[#4A2378] text-xs sm:text-sm font-black shadow-xs">
                {customDiscountInput.trim() ||
                  (isRtl
                    ? coupon.defaultDiscountLabelAr
                    : coupon.defaultDiscountLabelEn)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsEditingSlot((p) => !p)}
            className="min-h-[44px] px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span>
              {isEditingSlot
                ? isRtl
                  ? 'حفظ الخانة'
                  : 'Done'
                : isRtl
                  ? 'تعديل تجريبي'
                  : 'Edit Slot'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Voucher Perforated Body */}
      <div className="p-3.5 sm:p-4 bg-white dark:bg-[#292333] flex-1 flex flex-col justify-between gap-3 border-t-2 border-dashed border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
              {isRtl ? 'كود القسيمة:' : 'Coupon Code:'}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <code
                dir="ltr"
                className="px-3 py-2 rounded-xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-mono font-black text-[#62339A] dark:text-[#A34FE8] tabular-nums"
              >
                {coupon.code}
              </code>
              <button
                type="button"
                onClick={handleCopyCode}
                className="min-h-[44px] px-3.5 py-2 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                )}
                <span>
                  {copied
                    ? isRtl
                      ? 'تم النسخ'
                      : 'Copied'
                    : isRtl
                      ? 'نسخ'
                      : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleQr}
            title={isRtl ? 'عرض / إخفاء رمز التحقق QR' : 'Toggle QR Verification'}
            className={`min-w-[52px] min-h-[52px] rounded-2xl border flex flex-col items-center justify-center p-2 shrink-0 cursor-pointer transition-all ${
              showQrVerifier
                ? 'bg-[#62339A] text-white border-[#62339A]'
                : 'bg-[#F7F5FA] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#62339A] dark:text-[#A34FE8]'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[10px] font-black mt-0.5">QR</span>
          </button>
        </div>

        {/* Live View-Only QR & Idempotent 2-Step Cashier Redemption */}
        {showQrVerifier && (
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <RealQrCode
                value={qrPayload}
                size={128}
                darkColor="#4A2378"
                alt={`Coupon QR ${coupon.code}`}
              />
              <div className="flex-1 space-y-1.5 text-center sm:text-start">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {isRtl
                      ? 'عرض الرمز لا يخصم أي رصيد تلقائياً'
                      : 'Viewing QR never deducts balance'}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  {isRtl
                    ? 'يتم التحقق عبر مسح الكاشير بخطوتين لمنع التكرار وتأكيد الصرف لمرة واحدة فقط.'
                    : 'Two-step cashier verification guarantees idempotent single-use redemption.'}
                </p>
                {couponState.redeemedAt && (
                  <div
                    dir="ltr"
                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums"
                  >
                    Redeemed: {couponState.redeemedAt}
                  </div>
                )}
              </div>
            </div>

            {feedbackNotice && (
              <div className="px-3 py-2 rounded-xl bg-[#F7F5FA] dark:bg-[#111827] text-[11px] font-bold text-[#62339A] dark:text-[#A34FE8]">
                {feedbackNotice}
              </div>
            )}

            {/* Idempotent 2-Step Cashier Verification Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E2E8F0] dark:border-[#62339A]/25">
              {couponState.status === 'available' ? (
                !cashierStepArmed ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCashierStepArmed(true);
                        appendAudit(
                          'available',
                          'بدء خطوة ١: جاهز لمسح وتأكيد الكاشير',
                          'Step 1 started: armed for cashier confirmation'
                        );
                      }}
                      className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ScanLine className="w-4 h-4 text-[#A34FE8]" />
                      <span>{isRtl ? 'تحقق الكاشير (خطوة ١)' : 'Cashier Verify (Step 1)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelVoucher}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#62339A]/30 text-rose-600 text-xs font-bold cursor-pointer"
                    >
                      {isRtl ? 'إلغاء' : 'Cancel'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleConfirmSingleRedemption}
                      className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isRtl ? 'تأكيد الصرف لمرة واحدة (خطوة ٢)' : 'Confirm Redeem Once (Step 2)'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashierStepArmed(false)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] text-xs font-bold text-[#292333] dark:text-white cursor-pointer"
                    >
                      {isRtl ? 'تراجع' : 'Back'}
                    </button>
                  </>
                )
              ) : (
                <div className="w-full flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                    {couponState.status === 'used'
                      ? isRtl
                        ? 'مستخدم بالفعل — محمي ضد التكرار'
                        : 'Already redeemed — duplicate blocked'
                      : isRtl
                        ? 'القسيمة غير نشطة حالياً'
                        : 'Voucher currently inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[11px] font-bold text-[#62339A] dark:text-[#A34FE8] cursor-pointer"
                  >
                    {isRtl ? 'إعادة ضبط المعاينة' : 'Reset Preview'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          <div>
            <strong className="text-[#292333] dark:text-white">
              {isRtl ? 'الصلاحية: ' : 'Validity: '}
            </strong>
            <span>{isRtl ? coupon.validityAr : coupon.validityEn}</span>
          </div>
          <p className="leading-relaxed">
            <strong className="text-[#292333] dark:text-white">
              {isRtl ? 'الشروط: ' : 'Terms: '}
            </strong>
            <span>{isRtl ? coupon.termsAr : coupon.termsEn}</span>
          </p>
        </div>

        {/* Audit Trail Toggle */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#62339A]/25 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold text-[#62339A] dark:text-[#A34FE8]">
              {isRtl ? EXPERIMENTAL_TAG_AR : EXPERIMENTAL_TAG_EN}
            </span>
            <button
              type="button"
              onClick={() => setShowAuditLog((p) => !p)}
              className="min-h-[44px] px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#62339A] dark:text-[#A34FE8] hover:bg-[#F7F5FA] dark:hover:bg-[#1E293B] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <History className="w-3.5 h-3.5" />
              <span>
                {isRtl ? `سجل التدقيق (${couponState.auditTrail.length})` : `Audit (${couponState.auditTrail.length})`}
              </span>
            </button>
          </div>

          {showAuditLog && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30">
              {couponState.auditTrail.map((log) => (
                <div
                  key={log.id}
                  className="text-[10px] flex flex-wrap items-center justify-between gap-1 pb-1 border-b last:border-b-0 border-[#E2E8F0] dark:border-[#62339A]/20"
                >
                  <span className="font-bold text-[#292333] dark:text-white">
                    {isRtl ? log.actionAr : log.actionEn}
                  </span>
                  <span dir="ltr" className="text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
