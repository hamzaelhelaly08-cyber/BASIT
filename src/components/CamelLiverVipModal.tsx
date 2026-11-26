import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import {
  Flame,
  MapPin,
  Phone,
  CheckCircle2,
  X,
  FileText,
  CreditCard,
  Loader2,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { PaymentGatewayId, VODAFONE_CASH_NUMBER } from '../data/phase1Data';
import { submitVipDirectOrder } from '../services/faydFirestoreService';
import { ingestPurchaseToOwnerLedger } from '../services/ownerFinanceService';
import type { DocItem } from './UniversalDocumentBuilderModal';

export interface CamelTrayOption {
  id: '1kg' | '2kg' | 'vip_feast';
  titleAr: string;
  servingsAr: string;
  priceEGP: number;
  badgeAr?: string;
}

const TRAY_OPTIONS: CamelTrayOption[] = [
  {
    id: '1kg',
    titleAr: 'صينية 1 كجم مشكل كبدة جملي وسجق وكفتة',
    servingsAr: 'تكفي 3 — 4 أفراد',
    priceEGP: 680,
  },
  {
    id: '2kg',
    titleAr: 'صينية 2 كجم ملكية (كبدة جملي VIP)',
    servingsAr: 'تكفي 6 — 8 أفراد',
    priceEGP: 1280,
    badgeAr: 'الأكثر طلباً',
  },
  {
    id: 'vip_feast',
    titleAr: 'صينية العزائم والوفود VIP (4 كجم مشكل)',
    servingsAr: 'تكفي 12 — 15 فرداً',
    priceEGP: 2450,
  },
];

const ALLOWED_PAYMENTS: { id: PaymentGatewayId; labelAr: string; hintAr: string }[] = [
  { id: 'vodafone_cash', labelAr: 'فودافون كاش', hintAr: VODAFONE_CASH_NUMBER },
  { id: 'instapay', labelAr: 'إنستاباي InstaPay', hintAr: 'تحويل لحظي مباشر' },
  { id: 'fawry', labelAr: 'فوري Fawry', hintAr: 'كود دفع فوري' },
  { id: 'cash_on_delivery', labelAr: 'الدفع عند الاستلام', hintAr: 'كاش بالمطعم أو عند التسليم' },
];

interface CamelLiverVipModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
  firebaseUser?: User | null;
  onRequireSignIn?: () => void;
  onShowToast: (msg: string) => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
  onOpenInvoicePdf?: (payload: {
    recipientCompany: string;
    contact: string;
    orderRef: string;
    notes: string;
    items: DocItem[];
  }) => void;
}

export const CamelLiverVipModal: React.FC<CamelLiverVipModalProps> = ({
  isOpen,
  onClose,
  firebaseUser,
  onRequireSignIn,
  onShowToast,
  onAddAuditLog,
  onOpenInvoicePdf,
}) => {
  const [traySize, setTraySize] = useState<'1kg' | '2kg' | 'vip_feast'>('2kg');
  const [qty, setQty] = useState(1);
  const [reservationName, setReservationName] = useState(firebaseUser?.displayName || '');
  const [reservationPhone, setReservationPhone] = useState('');
  const [guestCount, setGuestCount] = useState(6);
  const [reservedDate, setReservedDate] = useState(new Date().toISOString().slice(0, 10));
  const [reservationTime, setReservationTime] = useState('07:00 م');
  const [paymentMethod, setPaymentMethod] = useState<PaymentGatewayId>('vodafone_cash');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedTray = TRAY_OPTIONS.find((t) => t.id === traySize) || TRAY_OPTIONS[1];
  const totalEGP = selectedTray.priceEGP * qty;

  const buildCamelInvoicePayload = (orderRefId?: string) => {
    const refId = orderRefId || confirmedOrderId || `CAMEL-VIP-${Date.now().toString().slice(-5)}`;
    const customerLabel = reservationName.trim() || firebaseUser?.displayName || 'عميل ركن الجملي VIP';
    const paymentMeta = ALLOWED_PAYMENTS.find((p) => p.id === paymentMethod);
    return {
      recipientCompany: `${customerLabel} — ركن الجملي VIP (مول العين)`,
      contact: reservationPhone.trim() || firebaseUser?.email || 'طلب فوري من تطبيق باسط',
      orderRef: refId,
      notes: `الموعد: ${reservedDate} ${reservationTime} · الضيوف: ${guestCount} · الدفع: ${paymentMeta?.labelAr || paymentMethod}${paymentMethod === 'vodafone_cash' ? ` (${VODAFONE_CASH_NUMBER})` : ''}${specialRequests ? ` · ملاحظات: ${specialRequests}` : ''}`,
      items: [
        {
          id: `camel-${selectedTray.id}`,
          description: selectedTray.titleAr,
          portionSpec: `${selectedTray.servingsAr} — تشويح سمن بلدي طازج`,
          quantity: qty,
          unitPrice: selectedTray.priceEGP,
        },
      ],
    };
  };

  const handleOpenCamelInvoice = (orderRefId?: string) => {
    if (!onOpenInvoicePdf) return;
    onOpenInvoicePdf(buildCamelInvoicePayload(orderRefId));
  };

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationName.trim() || reservationPhone.trim().length < 6) {
      onShowToast('يرجى كتابة الاسم ورقم الهاتف الصحيح (6 أرقام على الأقل).');
      return;
    }

    if (!firebaseUser || !firebaseUser.emailVerified) {
      onShowToast('يرجى تسجيل الدخول بحساب Google لإرسال الطلب مباشرة لصندوق إشعارات المالك.');
      if (onRequireSignIn) onRequireSignIn();
      return;
    }

    setSubmitting(true);
    try {
      const orderId = await submitVipDirectOrder(firebaseUser, {
        customerName: reservationName.trim(),
        phone: reservationPhone.trim(),
        sourceChannel: 'camel_liver_vip',
        items: [
          {
            title: selectedTray.titleAr,
            qty,
            unitPriceEGP: selectedTray.priceEGP,
            note: `${selectedTray.servingsAr} · ${reservedDate} ${reservationTime}`,
          },
        ],
        totalEGP,
        paymentMethod,
        notes: `عدد الضيوف: ${guestCount} · الموعد: ${reservedDate} ${reservationTime}${specialRequests ? ` · ${specialRequests}` : ''}`,
      });

      setConfirmedOrderId(orderId);
      void ingestPurchaseToOwnerLedger({
        source: 'ركن الجملي VIP — مول العين',
        purpose: `${selectedTray.titleAr} × ${qty}`,
        grossEGP: totalEGP,
        paymentMethod,
        orderRef: `VIP-${orderId}`,
      });
      onAddAuditLog(
        `طلب طاسة كبدة جملي VIP رقم ${orderId}`,
        `Submitted VIP Camel Liver order ${orderId}`,
        `${selectedTray.titleAr} ×${qty} = ${totalEGP} ج.م · الدفع: ${paymentMethod}`
      );
      onShowToast(`تم إرسال طلب الكبدة الجملي [${orderId}] إلى المالك بنجاح!`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل الطلب حالياً.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#62339A] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Hero Image Banner */}
        <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#292333] shrink-0">
          <img
            src="/assets/catering/camel_liver_tray.jpg"
            alt="طاسة الكبدة الجملي والسجق البلدي"
            className="w-full h-full object-cover select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#292333] via-[#292333]/55 to-transparent" />

          <button
            type="button"
            onClick={() => {
              setConfirmedOrderId(null);
              onClose();
            }}
            aria-label="Close"
            className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-[#62339A] hover:bg-[#4A2378] text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 right-4 z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9] text-white text-[11px] font-black shadow-lg mb-1.5">
              <Flame className="w-3.5 h-3.5 text-white fill-current" />
              <span>ركن الجملي VIP — إرسال فوري لصاحب المنصة</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              طاسة الكبدة الجملي والسجق البلدي والكفتة
            </h3>
            <p className="text-xs text-[#A34FE8] font-bold flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>مطبخ مول العين — مدينة بدر (توصيل أو قعدة VIP)</span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-white dark:bg-slate-900">
          {!confirmedOrderId ? (
            <form onSubmit={handleBookTable} className="space-y-4">
              {!firebaseUser?.emailVerified && (
                <div className="p-3 rounded-2xl bg-[#62339A]/10 border border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#292333] dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#62339A]" />
                    سجّل دخولك بجوجل لإرسال طلبك مباشرةً لصندوق إشعارات واعتماد المالك
                  </span>
                  {onRequireSignIn && (
                    <button
                      type="button"
                      onClick={onRequireSignIn}
                      className="px-3 py-1.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer"
                    >
                      تسجيل الدخول
                    </button>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-black text-sm text-[#292333] dark:text-white mb-2.5">
                  1. اختر حجم الصينية والكمية:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TRAY_OPTIONS.map((opt) => {
                    const active = traySize === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTraySize(opt.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center relative ${
                          active
                            ? 'bg-[#62339A] text-white border-[#62339A] shadow-lg shadow-[#62339A]/25'
                            : 'bg-[#F8FAFC] dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-[#62339A]/50'
                        }`}
                      >
                        {opt.badgeAr && (
                          <span className="absolute -top-2.5 right-1/2 translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#0EA5E9] text-white text-[10px] font-black shadow-xs">
                            {opt.badgeAr}
                          </span>
                        )}
                        <span className="font-black text-xs block">{opt.titleAr}</span>
                        <span className={`text-[11px] block mt-0.5 ${active ? 'text-white/85' : 'text-slate-500'}`}>
                          {opt.servingsAr}
                        </span>
                        <span className={`font-black text-sm block mt-2 ${active ? 'text-[#BAE6FD]' : 'text-[#62339A]'}`}>
                          {opt.priceEGP.toLocaleString()} ج.م
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quantity & Subtotal */}
                <div className="mt-3 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#62339A]/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#292333] dark:text-white">عدد الصواني:</span>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 hover:bg-[#62339A] hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-black text-sm tabular-nums">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(20, q + 1))}
                        className="w-7 h-7 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 hover:bg-[#62339A] hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-bold text-slate-500 block">الإجمالي الفوري</span>
                    <span className="text-base font-black text-[#62339A] dark:text-[#A34FE8] tabular-nums">
                      {totalEGP.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Selection */}
              <div>
                <h4 className="font-black text-xs text-[#292333] dark:text-white mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#62339A]" />
                  <span>2. طريقة الدفع المعتمدة:</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALLOWED_PAYMENTS.map((gw) => {
                    const selected = paymentMethod === gw.id;
                    return (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => setPaymentMethod(gw.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#62339A] text-white border-[#62339A] shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white'
                        }`}
                      >
                        <span className="font-black text-[11px] block">{gw.labelAr}</span>
                        <span className={`text-[10px] block mt-0.5 ${selected ? 'text-[#BAE6FD] font-bold' : 'text-slate-500'}`}>
                          {gw.hintAr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم العميل / المسؤول:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: م/ حمزة الهلالي"
                    value={reservationName}
                    onChange={(e) => setReservationName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#62339A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    required
                    placeholder="010xxxxxxxx"
                    value={reservationPhone}
                    onChange={(e) => setReservationPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#62339A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">تاريخ التنفيذ / القعدة:</label>
                  <input
                    type="date"
                    value={reservedDate}
                    onChange={(e) => setReservedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#62339A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الموعد:</label>
                    <input
                      type="text"
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#62339A]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الأفراد:</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#62339A]"
                    />
                  </div>
                </div>
              </div>

              <input
                type="text"
                placeholder="ملاحظات التجهيز أو العنوان (اختياري)..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#62339A]"
              />

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-w-[200px] py-3 px-4 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] disabled:opacity-60 text-white font-black text-xs shadow-lg shadow-[#62339A]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[#BAE6FD]" />}
                  <span>تأكيد الطلب وإشعار المالك ({totalEGP.toLocaleString()} ج.م)</span>
                </button>

                {onOpenInvoicePdf && (
                  <button
                    type="button"
                    onClick={() => handleOpenCamelInvoice()}
                    className="py-3 px-4 rounded-2xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>فاتورة الصنف PDF</span>
                  </button>
                )}

                <a
                  href="tel:01010430347"
                  className="px-3.5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-[#62339A]" />
                  <span>اتصال</span>
                </a>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center space-y-4 bg-[#F8FAFC] dark:bg-slate-800/80 rounded-3xl border-2 border-[#62339A]">
              <div className="w-14 h-14 rounded-full bg-[#62339A] text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#0EA5E9] text-white text-[11px] font-black font-mono mb-2">
                  رقم الطلب: {confirmedOrderId}
                </span>
                <h4 className="font-black text-lg text-[#292333] dark:text-white">
                  تم إرسال طلب الكبدة الجملي VIP بنجاح وسمّع في إشعارات المالك!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                  {selectedTray.titleAr} × {qty} — الإجمالي {totalEGP.toLocaleString()} ج.م · يمكنك الآن إصدار وتنزيل الفاتورة الفعلية للطلب.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {onOpenInvoicePdf && (
                  <button
                    type="button"
                    onClick={() => handleOpenCamelInvoice(confirmedOrderId)}
                    className="px-5 py-3 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#BAE6FD]" />
                    <span>إصدار وتنزيل فاتورة الكبدة الجملي PDF</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrderId(null);
                    onClose();
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
