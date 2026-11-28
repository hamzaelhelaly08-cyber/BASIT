import React, { useState } from 'react';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  FileText,
  AlertCircle,
  Lock,
  Ticket,
  Wallet,
  CheckCircle2,
  UtensilsCrossed,
  CreditCard,
  Building,
} from 'lucide-react';
import { LanguageCode, PHASE1_I18N } from '../data/phase1Data';
import { InteractivePaymentModal, PaymentMethodTab } from './InteractivePaymentModal';

export interface Phase1CartItem {
  id: string;
  nameAr: string;
  nameEn: string;
  kitchenNameAr: string;
  kitchenNameEn: string;
  approvedPrice: number | null;
  quantity: number;
  imageUrl?: string;
}

interface Phase1CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  currencyLabel: string;
  items: Phase1CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onConvertToQuote: () => void;
  onCheckoutAndInvoice?: () => void;
  onProceedToB2BContract?: () => void;
}

export const Phase1CartDrawer: React.FC<Phase1CartDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  currencyLabel,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onConvertToQuote,
  onCheckoutAndInvoice,
  onProceedToB2BContract,
}) => {
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [useWalletCredit, setUseWalletCredit] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodTab>('instapay');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isOpen) return null;

  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];

  const pricedSubtotal = items.reduce((acc, item) => {
    if (typeof item.approvedPrice === 'number') {
      return acc + item.approvedPrice * item.quantity;
    }
    return acc;
  }, 0);

  const hasUnapprovedItems = items.some((i) => i.approvedPrice === null);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B0764]/60 backdrop-blur-xs flex justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-[#FAF8F5] dark:bg-[#120D1D] h-full shadow-2xl border-x border-[#4C1D95]/15 flex flex-col pt-safe overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/15 flex items-center justify-between bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#5B21B6] text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-[#F5C451] text-[#2A0E4D] flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {t.cartTitle}
              </h3>
              <p className="text-xs font-bold text-[#F5C451] tabular-nums" dir="ltr">
                {items.reduce((sum, i) => sum + i.quantity, 0)}{' '}
                {isRtl ? 'عنصر محفوظ' : 'saved items'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-white hover:text-[#F5C451] flex items-center justify-center cursor-pointer"
            aria-label={isRtl ? 'إغلاق السلة' : 'Close Cart'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5] dark:bg-[#120D1D]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-20 h-20 rounded-[22px] bg-[#F5F3FF] dark:bg-[#1B132B] border border-[#4C1D95]/15 text-[#4C1D95] dark:text-[#F5C451] flex items-center justify-center shadow-sm">
                <ShoppingCart className="w-9 h-9" strokeWidth={1.85} />
              </div>
              <p className="text-sm font-black text-[#1E1633] dark:text-white">{t.cartEmpty}</p>
              <p className="text-xs font-medium text-[#5E5570] dark:text-[#C4B5FD] max-w-xs leading-relaxed">
                {isRtl
                  ? 'أضف وجبات من مطاعم العين أو المطابخ المركزية لتعديل الكميات وإتمام الطلب.'
                  : 'Add items from Al Ain Dining or Central Kitchens to adjust quantities and checkout.'}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={isRtl ? item.nameAr : item.nameEn}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#4C1D95]/15 bg-[#F5F3FF]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#F5F3FF] dark:bg-[#241B38] border border-[#4C1D95]/15 text-[#4C1D95] dark:text-[#F5C451] flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-5 h-5" strokeWidth={1.85} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-[#1E1633] dark:text-white leading-snug">
                        {isRtl ? item.nameAr : item.nameEn}
                      </h4>
                      <p className="text-[11px] font-semibold text-[#5E5570] dark:text-[#C4B5FD] mt-0.5 truncate">
                        {isRtl ? item.kitchenNameAr : item.kitchenNameEn}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="min-w-[40px] min-h-[40px] rounded-xl text-[#581C87] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title={t.cartRemove}
                    aria-label={t.cartRemove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#4C1D95]/15">
                  <div>
                    {typeof item.approvedPrice === 'number' ? (
                      <span
                        className="text-xs sm:text-sm font-extrabold text-[#4C1D95] tabular-nums"
                        dir="ltr"
                      >
                        {(item.approvedPrice * item.quantity).toLocaleString()} {currencyLabel}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#3B0764] bg-[#FFD54F]/45 px-2.5 py-1 rounded-full border border-[#EAB308]/60">
                        {t.awaitingApproval}
                      </span>
                    )}
                  </div>

                  {/* Mobile Quantity Steppers ("− 1 +") */}
                  <div className="flex items-center gap-1 bg-[#F5F3FF] dark:bg-[#241B38] border border-[#4C1D95]/15 p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="w-9 h-9 rounded-full bg-white dark:bg-[#1B132B] text-[#3B0764] dark:text-white hover:bg-[#4C1D95] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-black text-[#1E1633] dark:text-white tabular-nums" dir="ltr">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="w-9 h-9 rounded-full bg-white dark:bg-[#1B132B] text-[#3B0764] dark:text-white hover:bg-[#4C1D95] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white dark:bg-[#1B132B] border-t border-[#4C1D95]/12 space-y-3">
            {hasUnapprovedItems && (
              <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/15 flex items-start gap-2 text-[11px] font-bold text-[#3B0764] dark:text-[#EDE9FE]">
                <AlertCircle className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0 mt-0.5" />
                <span>{t.cartUnapprovedNote}</span>
              </div>
            )}

            {/* Total Pill */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#F5F3FF] dark:bg-[#241B38] border border-[#4C1D95]/15 text-xs">
              <span className="font-bold text-[#5E5570] dark:text-[#C4B5FD]">{t.cartSubtotal}</span>
              <span className="text-base font-black text-[#3B0764] dark:text-[#F5C451] tabular-nums" dir="ltr">
                {pricedSubtotal.toLocaleString()} {currencyLabel}
              </span>
            </div>

            {/* Primary Royal Purple Proceed to B2B Contract CTA */}
            <button
              type="button"
              onClick={() => {
                if (onProceedToB2BContract) onProceedToB2BContract();
                else if (onCheckoutAndInvoice) onCheckoutAndInvoice();
              }}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#581C87] hover:brightness-105 text-[#FFD54F] border border-[#FFD54F]/50 font-black text-sm flex items-center justify-center gap-2 shadow-[0_10px_22px_-8px_rgba(59,7,100,0.48)] cursor-pointer transition-transform active:scale-99"
            >
              <Building className="w-4 h-4 text-[#FFD54F]" />
              <span>{isRtl ? 'متابعة للتعاقد' : 'Proceed to Contract'}</span>
            </button>

            {onCheckoutAndInvoice && (
              <button
                type="button"
                onClick={onCheckoutAndInvoice}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl basit-glass-btn-yellow font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#292333]" />
                <span>{isRtl ? 'إتمام الطلب وإصدار فاتورة' : 'Complete Order & Invoice'}</span>
              </button>
            )}

            {/* Coupon & Wallet Credit Action Rows */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCouponOpen((prev) => !prev)}
                className={`min-h-[44px] py-2 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  appliedCoupon
                    ? 'bg-[#62339A] text-white border-[#62339A]'
                    : 'bg-[#F7F5FA] dark:bg-[#271E3B] border-[#62339A]/20 text-[#62339A] dark:text-[#F6D95B]'
                }`}
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span className="truncate">{isRtl ? 'استخدام قسيمة خصم' : 'Use Coupon'}</span>
              </button>

              <button
                type="button"
                onClick={() => setUseWalletCredit((prev) => !prev)}
                className={`min-h-[44px] py-2 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  useWalletCredit
                    ? 'bg-[#62339A] text-white border-[#62339A]'
                    : 'bg-[#F7F5FA] dark:bg-[#271E3B] border-[#62339A]/20 text-[#62339A] dark:text-[#F6D95B]'
                }`}
              >
                <Wallet className="w-4 h-4 shrink-0" />
                <span className="truncate">{isRtl ? 'استخدام رصيد' : 'Use Credit'}</span>
              </button>
            </div>

            {couponOpen && (
              <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/15 flex items-center gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={isRtl ? 'أدخل كود القسيمة (مثل CE-DEMO-DINE)' : 'Enter voucher code'}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#120D1D] border border-[#4C1D95]/20 text-xs font-bold text-[#1E1633] dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (couponCode.trim()) {
                      setAppliedCoupon(couponCode.trim().toUpperCase());
                    }
                  }}
                  className="min-h-[38px] px-3.5 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer shrink-0"
                >
                  {isRtl ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            )}

            {(appliedCoupon || useWalletCredit) && (
              <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {appliedCoupon
                    ? isRtl
                      ? `تم إرفاق القسيمة (${appliedCoupon}) للمراجعة مع الطلب.`
                      : `Coupon (${appliedCoupon}) attached to order review.`
                    : isRtl
                      ? 'تم تفعيل طلب الخصم من رصيد الحساب / التعاقد.'
                      : 'Account/Contract credit request attached.'}
                </span>
              </div>
            )}

            {/* Direct Interactive Payment & Instant Transfer */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('instapay');
                setPaymentModalOpen(true);
              }}
              className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl basit-glass-btn-yellow font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <CreditCard className="w-4 h-4 text-[#292333]" />
              <span>{isRtl ? 'الدفع الإلكتروني الفوري وإتمام الطلب' : 'Instant Online Payment & Checkout'}</span>
            </button>

            {/* Convert to Official RFQ + Clear All with Smart Confirmation */}
            {confirmClearOpen ? (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2.5">
                <p className="text-xs font-black text-rose-900 dark:text-rose-200 text-center">
                  {isRtl ? 'الاحتفاظ بالسلة أم مسحها؟' : 'Keep Cart or Clear all items?'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(false)}
                    className="min-h-[40px] px-3 rounded-xl bg-white border border-[#4C1D95]/25 text-[#3B0764] text-xs font-black cursor-pointer"
                  >
                    {isRtl ? 'الاحتفاظ بالسلة' : 'Keep Cart'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClearOpen(false);
                      onClearCart();
                    }}
                    className="min-h-[40px] px-3 rounded-xl bg-rose-600 text-white text-xs font-black cursor-pointer"
                  >
                    {isRtl ? 'مسح السلة' : 'Clear Cart'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onConvertToQuote}
                  className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl basit-glass-btn-primary font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#FFC928]" />
                  <span>{t.cartConvertQuote}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className="min-h-[44px] px-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title={isRtl ? 'مسح الكل' : 'Clear All'}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isRtl ? 'مسح الكل' : 'Clear All'}</span>
                </button>
              </div>
            )}

            {/* Interactive Payment Gateway Shortcuts */}
            <div className="pt-2 border-t border-[#62339A]/10 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 block">
                {isRtl ? 'اختر وسيلة السداد المفضلة للتحويل الفوري:' : 'Select instant payment method:'}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'instapay' as const, label: 'InstaPay إنستاباي' },
                  { id: 'vodafone_cash' as const, label: 'فودافون كاش' },
                  { id: 'fawry' as const, label: 'فوري باي' },
                  { id: 'bank_transfer' as const, label: 'IBAN البنك' },
                  { id: 'card' as const, label: 'Visa / Meeza' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(m.id);
                      setPaymentModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#EDE9FE] hover:bg-[#4C1D95] hover:text-[#FFD54F] text-[10px] font-black text-[#3B0764] cursor-pointer transition-colors"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <InteractivePaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        isRtl={isRtl}
        totalAmount={pricedSubtotal}
        currencyLabel={currencyLabel}
        appliedCoupon={appliedCoupon}
        initialMethod={selectedMethod}
      />
    </div>
  );
};
