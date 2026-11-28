import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Copy,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  AlertCircle,
  HelpCircle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import {
  InstaPayLogo,
  VodafoneCashLogo,
  FawryLogo,
  VisaLogo,
  MastercardLogo,
  MeezaLogo,
  MadaLogo,
  NbeBankLogo,
  BanqueMisrLogo,
  CibBankLogo,
  NbkBankLogo,
  ApplePayLogo,
} from './BankAndPaymentLogos';

export type PaymentCategory = 'retail' | 'corporate';

export type PaymentGatewayKey =
  | 'instapay'
  | 'vodafone_cash'
  | 'fawry'
  | 'cards'
  | 'cash_on_delivery'
  | 'bank_wire'
  | 'corporate_ledger'
  | 'payroll_deduction';

interface PaymentMethodsHubViewProps {
  isRtl?: boolean;
  totalAmount?: number;
  currencyLabel?: string;
  orderReference?: string;
  appliedCoupon?: string | null;
  initialMethod?: PaymentGatewayKey;
  onPaymentSuccess?: (method: string, refId: string) => void;
  onBack?: () => void;
  isStandalonePage?: boolean;
}

export const PaymentMethodsHubView: React.FC<PaymentMethodsHubViewProps> = ({
  isRtl = true,
  totalAmount = 0,
  currencyLabel = 'ج.م',
  orderReference,
  appliedCoupon = null,
  initialMethod = 'instapay',
  onPaymentSuccess,
  onBack,
  isStandalonePage = false,
}) => {
  const [category, setCategory] = useState<PaymentCategory>('retail');
  const [selectedMethod, setSelectedMethod] = useState<PaymentGatewayKey>(initialMethod);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Selected Bank for Wire Transfer
  const [selectedBankKey, setSelectedBankKey] = useState<'nbe' | 'misr' | 'cib' | 'nbk'>('nbe');

  // Input states
  const [transferRef, setTransferRef] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState('');

  const activeOrderRef = orderReference || `BST-${Date.now().toString().slice(-6)}`;
  const discountAmount = appliedCoupon && totalAmount > 0 ? Math.round(totalAmount * 0.1) : 0;
  const payableAmount = Math.max(0, totalAmount - discountAmount);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const generatedRef = transferRef.trim() || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedRef(generatedRef);
      setPaymentDone(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(selectedMethod, generatedRef);
      }
    }, 1200);
  };

  const bankAccounts = {
    nbe: {
      nameAr: 'البنك الأهلي المصري (NBE)',
      nameEn: 'National Bank of Egypt',
      beneficiary: 'الشركة الوطنية للخدمات اللوجستية والتغذية',
      accNo: '1090382049182301',
      iban: 'EG3800020001090382049182301',
      swift: 'NBEGEGCX',
      branch: 'فرع مدينة بدر / العبور',
      Logo: NbeBankLogo,
    },
    misr: {
      nameAr: 'بنك مصر (Banque Misr)',
      nameEn: 'Banque Misr',
      beneficiary: 'الشركة الوطنية اللوجستية والتوريدات الغذائية',
      accNo: '2400199038471205',
      iban: 'EG1200030002400199038471205',
      swift: 'BMISEGCA',
      branch: 'فرع العاشر من رمضان',
      Logo: BanqueMisrLogo,
    },
    cib: {
      nameAr: 'البنك التجاري الدولي (CIB)',
      nameEn: 'Commercial International Bank',
      beneficiary: 'National Logistics & Food Services S.A.E',
      accNo: '100049281729',
      iban: 'EG950010000010004928172900',
      swift: 'CIBEEGCX',
      branch: 'فرع القاهرة الجديدة / التجمع',
      Logo: CibBankLogo,
    },
    nbk: {
      nameAr: 'بنك الكويت الوطني (NBK Egypt)',
      nameEn: 'National Bank of Kuwait Egypt',
      beneficiary: 'National Logistics Company',
      accNo: '584019283741',
      iban: 'EG440049000058401928374100',
      swift: 'NBKEEGCX',
      branch: 'فرع النزهة الجديدة',
      Logo: NbkBankLogo,
    },
  };

  const activeBank = bankAccounts[selectedBankKey];

  return (
    <div
      className={`w-full max-w-4xl mx-auto space-y-5 pb-12 transition-all ${
        isStandalonePage ? 'pt-2' : ''
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. Mobile-First Luxury Header */}
      <div className="p-4 sm:p-6 rounded-[28px] bg-gradient-to-r from-[#62339A] via-[#4A2378] to-[#292333] text-white shadow-[0_16px_36px_-12px_rgba(98,51,154,0.45)] relative overflow-hidden">
        <div className="pointer-events-none absolute -bottom-12 -start-10 w-48 h-48 rounded-full bg-[#FFC928] opacity-20 blur-2xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                aria-label={isRtl ? 'رجوع' : 'Back'}
              >
                {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
            )}
            <div className="w-11 h-11 rounded-2xl bg-[#FFC928] text-[#292333] flex items-center justify-center font-black shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-white">
                  {isRtl ? 'بوابة وسائل الدفع والتسويات المعتمدة' : 'Official Payment & Settlement Gateway'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black">
                  {isRtl ? 'مؤمن 100%' : '100% Secure'}
                </span>
              </div>
              <p className="text-xs text-[#FFC928] font-bold mt-0.5">
                {isRtl
                  ? `منظومة باسط والوطنية اللوجستية · رقم الإشارة: ${activeOrderRef}`
                  : `BASIT & Elwataniya Logistics · Ref: ${activeOrderRef}`}
              </p>
            </div>
          </div>

          {payableAmount > 0 && (
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-end">
              <span className="text-[10px] text-white/80 block font-bold">
                {isRtl ? 'المبلغ المطلوب سداده:' : 'Payable Amount:'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-[#FFC928] tabular-nums">
                  {payableAmount.toLocaleString()}
                </span>
                <span className="text-xs font-black text-white">{currencyLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Success Receipt View */}
      {paymentDone ? (
        <div className="p-6 sm:p-10 rounded-[32px] basit-liquid-glass text-center space-y-5 shadow-2xl border-2 border-emerald-500/40 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce">
            <Check className="w-10 h-10" strokeWidth={3} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#292333] dark:text-white">
              {isRtl ? 'تم تأكيد عملية الدفع وتسجيل الطلب بنجاح!' : 'Payment Confirmed Successfully!'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5E5570] dark:text-[#C4B5FD] max-w-md mx-auto leading-relaxed">
              {isRtl
                ? `تم قيد العملية بنجاح برقم إشعار (${confirmedRef})، وسيتم مراجعة الدفعة وإصدار الفاتورة الضريبية وتجهيز طلبك على الفور.`
                : `Your transaction has been recorded under reference (${confirmedRef}). Your tax invoice and order dispatch are underway.`}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E162F] border border-[#62339A]/20 max-w-md mx-auto space-y-2.5 text-xs text-start">
            <div className="flex items-center justify-between pb-2 border-b border-[#62339A]/15">
              <span className="text-slate-500">{isRtl ? 'رقم الطلب:' : 'Order ID:'}</span>
              <span className="font-mono font-black text-[#292333] dark:text-white">{activeOrderRef}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#62339A]/15">
              <span className="text-slate-500">{isRtl ? 'كود التحقق المرجعي:' : 'Reference Code:'}</span>
              <span className="font-mono font-black text-[#62339A] dark:text-[#FFC928]">{confirmedRef}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#62339A]/15">
              <span className="text-slate-500">{isRtl ? 'طريقة السداد:' : 'Payment Method:'}</span>
              <span className="font-black text-[#292333] dark:text-white uppercase">{selectedMethod}</span>
            </div>
            {payableAmount > 0 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-bold">{isRtl ? 'المبلغ المسدد:' : 'Amount Paid:'}</span>
                <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {payableAmount.toLocaleString()} {currencyLabel}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setPaymentDone(false);
                if (onBack) onBack();
              }}
              className="min-h-[44px] px-8 py-2.5 rounded-full basit-glass-btn-primary font-black text-xs cursor-pointer shadow-md"
            >
              {isRtl ? 'العودة ومتابعة حالة الطلب' : 'Return & Track Order'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Mandatory Clean Separation: Retail vs Corporate */}
          <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-[#1E162F] border border-slate-200 dark:border-[#62339A]/30 grid grid-cols-2 gap-2 text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setCategory('retail');
                setSelectedMethod('instapay');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                category === 'retail'
                  ? 'bg-white dark:bg-[#2F2148] text-[#62339A] dark:text-[#FFC928] shadow-sm border border-[#62339A]/30'
                  : 'text-[#5E5570] dark:text-[#C4B5FD] hover:text-[#292333]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isRtl ? 'وسائل الدفع الفوري للأفراد' : 'Retail & Instant Gateways'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategory('corporate');
                setSelectedMethod('bank_wire');
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                category === 'corporate'
                  ? 'bg-white dark:bg-[#2F2148] text-[#62339A] dark:text-[#FFC928] shadow-sm border border-[#62339A]/30'
                  : 'text-[#5E5570] dark:text-[#C4B5FD] hover:text-[#292333]'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>{isRtl ? 'التحويلات البنكية والتسويات المؤسسية' : 'Corporate Wire & Settlements'}</span>
            </button>
          </div>

          {/* 4. Payment Methods Grid: Independent, Symmetrical, Authentic Cards */}
          {category === 'retail' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Method A: InstaPay */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('instapay')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'instapay'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-16 h-10">
                      <InstaPayLogo />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                        {isRtl ? 'مفعّل ولحظي' : 'Live & Instant'}
                      </span>
                      {selectedMethod === 'instapay' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'شبكة إنستاباي اللحظية (IPA)' : 'InstaPay Instant Network'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'تحويل لحظي مباشر بدون أي رسوم إضافية' : 'Zero-fee instant transfer 24/7'}
                    </p>
                  </div>
                </button>

                {/* Method B: Vodafone Cash */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('vodafone_cash')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'vodafone_cash'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-16 h-10">
                      <VodafoneCashLogo />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                        {isRtl ? 'مفعّل 24/7' : 'Live & Active'}
                      </span>
                      {selectedMethod === 'vodafone_cash' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'محفظة فودافون كاش الرسمية' : 'Official Vodafone Cash Wallet'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'إيداع وتحويل فوري لمحفظة المنظومة' : 'Instant mobile wallet transfer'}
                    </p>
                  </div>
                </button>

                {/* Method C: Fawry */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('fawry')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'fawry'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-16 h-10">
                      <FawryLogo />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                        {isRtl ? 'كود 72 ساعة' : '72h Code'}
                      </span>
                      {selectedMethod === 'fawry' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'منافذ فوري باي (Fawry Pay)' : 'Fawry Pay Outlets'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'السداد النقدي في أي منفذ فوري بكود الطلب' : 'Pay in cash across any Fawry kiosk'}
                    </p>
                  </div>
                </button>

                {/* Method D: Bank Cards (Visa, Mastercard, Meeza) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('cards')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'cards'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 h-10">
                      <div className="w-10 h-7"><VisaLogo /></div>
                      <div className="w-10 h-7"><MastercardLogo /></div>
                      <div className="w-10 h-7"><MeezaLogo /></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-black">
                        3D Secure
                      </span>
                      {selectedMethod === 'cards' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'البطاقات البنكية (فيزا / ماستركارد / ميزة)' : 'Bank Cards (Visa/Mastercard/Meeza)'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'دفع إلكتروني فوري ومؤمن بالتشفير البنكي' : 'Encrypted instant card checkout'}
                    </p>
                  </div>
                </button>

                {/* Method E: Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('cash_on_delivery')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'cash_on_delivery'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black">
                        {isRtl ? 'عند الاستلام' : 'On Delivery'}
                      </span>
                      {selectedMethod === 'cash_on_delivery' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'سداد القيمة نقداً لمندوب التوصيل المعتمد' : 'Pay upon receiving your order'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Active Retail Gateway Operational Panel */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E162F] border-2 border-[#62339A]/20 space-y-4 shadow-sm">
                {selectedMethod === 'instapay' && (
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-[#292333] dark:text-white">
                          {isRtl ? 'بيانات التحويل عبر إنستاباي الرسمي:' : 'Official InstaPay Transfer Details:'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isRtl ? 'افتح تطبيق إنستاباي وقم بالتحويل على العنوان أدناه:' : 'Transfer directly to this IPA address:'}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {isRtl ? 'رسوم العملية: 0.00 ج.م' : 'Fees: 0.00 EGP'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#140E20] border border-[#62339A]/25 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {isRtl ? 'عنوان الدفع اللحظي (IPA):' : 'Instant Payment Address (IPA):'}
                        </span>
                        <span className="font-mono font-black text-sm text-[#62339A] dark:text-[#FFC928]" dir="ltr">
                          wataniya.logistics@instapay
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('wataniya.logistics@instapay', 'instapay_ipa')}
                        className="px-3.5 py-2 rounded-xl bg-[#62339A] text-white hover:bg-[#7E3FD6] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        {copiedKey === 'instapay_ipa' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'instapay_ipa' ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ العنوان' : 'Copy')}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#292333] dark:text-white block">
                        {isRtl ? 'رقم العملية / كود التحويل المرجعي (Reference Code):' : 'Transaction Reference Code:'}
                      </label>
                      <input
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder={isRtl ? 'مثال: 984021948 أو الصق نص رسالة البنك' : 'e.g. 984021948'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'vodafone_cash' && (
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-[#292333] dark:text-white">
                          {isRtl ? 'التحويل لمحفظة فودافون كاش المعتمدة:' : 'Vodafone Cash Wallet Transfer:'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isRtl ? 'اطلب *9*7*الرقم*المبلغ# أو حوّل عبر تطبيق أنا فودافون' : 'Dial *9*7*Number*Amount# or use Ana Vodafone'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FFF5F5] dark:bg-[#200D12] border border-red-500/30 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {isRtl ? 'رقم المحفظة المعتمد:' : 'Official Wallet Number:'}
                        </span>
                        <span className="font-mono font-black text-base text-red-600 dark:text-red-400" dir="ltr">
                          01274799290
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('01274799290', 'vfcash_no')}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        {copiedKey === 'vfcash_no' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'vfcash_no' ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ الرقم' : 'Copy Number')}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#292333] dark:text-white block">
                          {isRtl ? 'رقم هاتفك المحول منه:' : 'Your Sender Phone Number:'}
                        </label>
                        <input
                          type="tel"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          dir="ltr"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#292333] dark:text-white block">
                          {isRtl ? 'رقم العملية (Reference ID):' : 'Transaction Reference:'}
                        </label>
                        <input
                          type="text"
                          value={transferRef}
                          onChange={(e) => setTransferRef(e.target.value)}
                          placeholder={isRtl ? 'كود رسالة فودافون' : 'SMS Reference'}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'fawry' && (
                  <div className="space-y-3.5">
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1B132B] border border-[#E6E0F5] dark:border-[#3B0764]/50 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {isRtl ? 'كود السداد بمنافذ فوري باي (صالح 72 ساعة):' : 'Fawry Payment Code (Valid 72h):'}
                        </span>
                        <span className="font-mono font-black text-xl text-[#005596] dark:text-[#FFC928]" dir="ltr">
                          982{activeOrderRef.replace(/\D/g, '').padEnd(6, '7')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `982${activeOrderRef.replace(/\D/g, '').padEnd(6, '7')}`,
                            'fawry_code'
                          )
                        }
                        className="px-3.5 py-2 rounded-xl bg-[#005596] text-white hover:bg-[#004070] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        {copiedKey === 'fawry_code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'fawry_code' ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ الكود' : 'Copy Code')}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {isRtl
                        ? 'توجه إلى أقرب منفذ فوري، واطلب "خدمة فوري باي"، وأعطِ التاجر كود السداد أعلاه، وسيتم تأكيد حجزك وإرسال الإشعار تلقائياً.'
                        : 'Visit any Fawry outlet, request "Fawry Pay", and present this reference code for instant fulfillment.'}
                    </p>
                  </div>
                )}

                {selectedMethod === 'cards' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-[#292333] dark:text-white block">
                        {isRtl ? 'الاسم المدون على البطاقة:' : 'Cardholder Name:'}
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="e.g. AHMED MOHAMED"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-[#292333] dark:text-white block">
                        {isRtl ? 'رقم البطاقة (16 رقماً):' : 'Card Number:'}
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        placeholder="xxxx xxxx xxxx xxxx"
                        dir="ltr"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-[#292333] dark:text-white block">
                          {isRtl ? 'تاريخ الانتهاء:' : 'Expiry Date:'}
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                          placeholder="MM/YY"
                          dir="ltr"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-[#292333] dark:text-white block">
                          {isRtl ? 'رمز الأمان (CVV):' : 'Security Code (CVV):'}
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          placeholder="***"
                          dir="ltr"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'cash_on_delivery' && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 space-y-1 text-xs">
                    <div className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>{isRtl ? 'تأكيد السداد عند استلام الوجبات' : 'Cash Payment on Delivery'}</span>
                    </div>
                    <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                      {isRtl
                        ? 'يرجى تحضير المبلغ المحدد بدقة لمندوب التوصيل عند الاستلام. سيتم إرسال إشعار بوصول المندوب مع الفاتورة الضريبية المطبوعة.'
                        : 'Please prepare the exact cash amount for our logistics courier upon delivery.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 5. Corporate & B2B Settlements Section */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Method F: Direct Bank Wire (IBAN) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bank_wire')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'bank_wire'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#62339A] dark:text-[#FFC928] flex items-center justify-center font-black">
                      <Building className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                        {isRtl ? 'حسابات رسمية' : 'Verified Accounts'}
                      </span>
                      {selectedMethod === 'bank_wire' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'التحويل البنكي المباشر (IBAN / Swift)' : 'Direct Bank Wire (IBAN)'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'الأهلي، بنك مصر، CIB، وبنك الكويت الوطني' : '4 Major partner banks'}
                    </p>
                  </div>
                </button>

                {/* Method G: Corporate Contract Ledger */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('corporate_ledger')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'corporate_ledger'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-black">
                        {isRtl ? 'عقد الشركات' : 'B2B Contract'}
                      </span>
                      {selectedMethod === 'corporate_ledger' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'التسوية عبر حساب العقد المؤسسي' : 'Corporate Credit Ledger'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'فاتورة ضريبية مجمعة نهاية الشهر التعاقدي' : 'Monthly consolidated tax invoice'}
                    </p>
                  </div>
                </button>

                {/* Method H: Payroll Deduction (H-A-B-E) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('payroll_deduction')}
                  className={`p-4 rounded-2xl border-2 text-start flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    selectedMethod === 'payroll_deduction'
                      ? 'border-[#FFC928] bg-[#FAF7FD] dark:bg-[#261B3B] shadow-[0_8px_24px_-8px_rgba(255,201,40,0.4)]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A1326] hover:border-[#62339A]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 flex items-center justify-center font-black">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[10px] font-black">
                        H-A-B-E
                      </span>
                      {selectedMethod === 'payroll_deduction' && (
                        <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#292333] dark:text-white">
                      {isRtl ? 'الخصم المباشر من الراتب (H-A-B-E)' : 'Payroll Deduction (H-A-B-E)'}
                    </h3>
                    <p className="text-[11px] text-[#5E5570] dark:text-[#C4B5FD] mt-0.5">
                      {isRtl ? 'معتمد عبر إدارة HR ومسؤولي الرواتب' : 'Requires designated HR approval'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Corporate Operational Sub-Panel */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E162F] border-2 border-[#62339A]/20 space-y-4 shadow-sm">
                {selectedMethod === 'bank_wire' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-[#292333] dark:text-white">
                        {isRtl ? 'اختر البنك للتحويل لحساب الشركة الوطنية الرسمي:' : 'Select Destination Bank:'}
                      </h4>
                    </div>

                    {/* Bank Selector Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'nbe' as const, name: 'الأهلي المصري', Logo: NbeBankLogo },
                        { key: 'misr' as const, name: 'بنك مصر', Logo: BanqueMisrLogo },
                        { key: 'cib' as const, name: 'CIB', Logo: CibBankLogo },
                        { key: 'nbk' as const, name: 'NBK مصر', Logo: NbkBankLogo },
                      ].map((b) => (
                        <button
                          key={b.key}
                          type="button"
                          onClick={() => setSelectedBankKey(b.key)}
                          className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            selectedBankKey === b.key
                              ? 'border-[#62339A] bg-[#62339A]/10 text-[#62339A] dark:text-[#FFC928] font-black'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#140E20] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="w-8 h-5 shrink-0">
                            <b.Logo />
                          </div>
                          <span className="text-xs truncate">{b.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Bank Details Card with Instant Copy Buttons */}
                    <div className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#140E20] border border-[#62339A]/25 space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#62339A]/15">
                        <span className="font-bold text-slate-500">{isRtl ? 'اسم المستفيد:' : 'Beneficiary:'}</span>
                        <span className="font-black text-[#292333] dark:text-white">{activeBank.beneficiary}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#62339A]/15">
                        <span className="font-bold text-slate-500">{isRtl ? 'رقم الحساب:' : 'Account No:'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#62339A] dark:text-[#FFC928]" dir="ltr">
                            {activeBank.accNo}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(activeBank.accNo, 'acc_no')}
                            className="p-1 text-slate-500 hover:text-[#62339A] cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedKey === 'acc_no' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#62339A]/15">
                        <span className="font-bold text-slate-500">{isRtl ? 'رقم الآيبان (IBAN):' : 'IBAN:'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-[#62339A] dark:text-[#FFC928]" dir="ltr">
                            {activeBank.iban}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(activeBank.iban, 'iban_no')}
                            className="p-1 text-slate-500 hover:text-[#62339A] cursor-pointer"
                            title="Copy IBAN"
                          >
                            {copiedKey === 'iban_no' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500">SWIFT Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black" dir="ltr">{activeBank.swift}</span>
                          <span className="text-slate-400">· {activeBank.branch}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#292333] dark:text-white block">
                        {isRtl ? 'رقم إشعار التحويل البنكي أو رقم الشيك:' : 'Bank Transfer Slip / Cheque Ref:'}
                      </label>
                      <input
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder={isRtl ? 'أدخل رقم العملية البنكية' : 'Wire Reference ID'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#140E20] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'corporate_ledger' && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                    <div className="font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isRtl ? 'نظام المحاسبة والتسوية الآجلة للشركات' : 'Corporate Contract Billing'}</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                      {isRtl
                        ? 'يتم قيد المشتريات والطلبات تلقائياً على حساب الكيان التجاري المعتمد لدى الشركة الوطنية، وتصدر فاتورة ضريبية رسمية موحدة نهاية الشهر المحاسبي وفق شروط التعاقد.'
                        : 'Orders are debited to your contracted corporate account. A unified monthly tax invoice will be issued.'}
                    </p>
                  </div>
                )}

                {selectedMethod === 'payroll_deduction' && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 space-y-3 text-xs">
                    <div className="font-black text-red-900 dark:text-red-200 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4" />
                      <span>{isRtl ? 'اعتماد الخصم من الراتب لموظفي H-A-B-E' : 'H-A-B-E Payroll Deduction Approval'}</span>
                    </div>
                    <p className="text-red-800 dark:text-red-300 font-medium leading-relaxed">
                      {isRtl
                        ? 'يتم تحويل الطلب تلقائياً لملف الاعتماد الإداري المشترك، حيث يتم تأكيده حصرياً من قِبل معتمدي الرواتب (@ahmed.adly أو @ahmed.wahid) قبل ترحيله لكشف الرواتب.'
                        : 'Requests are submitted to the consolidated approval queue, where only authorized HR approvers can confirm.'}
                    </p>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                        {isRtl ? 'كود الموظف التعريفي (Employee Code):' : 'Employee ID Code:'}
                      </label>
                      <input
                        type="text"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        placeholder="HB-xxx"
                        dir="ltr"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#140E20] border border-red-300 dark:border-red-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Mobile Fixed-Comfort Sticky Action Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#1E162F] border-2 border-[#62339A]/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs font-bold text-[#5E5570] dark:text-[#C4B5FD]">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {isRtl
                  ? 'العملية مشفرة ببروتوكول SSL 256-bit وشهادة الأمان المعتمدة.'
                  : 'Encrypted via 256-bit SSL certified security.'}
              </span>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPayment}
              className={`w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-full text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                isProcessing
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'basit-glass-btn-yellow'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  <span>{isRtl ? 'جاري التحقق وقيد العملية...' : 'Processing Transaction...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {payableAmount > 0
                      ? isRtl
                        ? `تأكيد وسداد (${payableAmount.toLocaleString()} ${currencyLabel})`
                        : `Confirm & Pay (${payableAmount.toLocaleString()} ${currencyLabel})`
                      : isRtl
                        ? 'تأكيد اعتماد وسيلة الدفع'
                        : 'Confirm Payment Gateway'}
                  </span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
