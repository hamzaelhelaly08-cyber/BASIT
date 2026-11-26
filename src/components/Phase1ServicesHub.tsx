import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Filter,
  ShieldAlert,
  Lock,
  ShoppingCart,
  AlertCircle,
  SlidersHorizontal,
  Edit3,
  FileText,
  Send,
  CalendarClock,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import {
  CountryCode,
  FOOD_CATEGORIES,
  LanguageCode,
  PHASE1_I18N,
  PHASE1_ROLES,
  RoleScope,
  SUPPORTED_COUNTRIES,
  THREE_CENTRAL_KITCHENS,
  TWELVE_SERVICES,
  CentralKitchenId,
} from '../data/phase1Data';
import { Phase1CartItem } from './Phase1CartDrawer';
import { OfficialCountryFlag } from './OfficialCountryFlags';
import { Service3DIcon } from './Service3DIcon';

export interface Phase1RfqSubmission {
  id: string;
  type: 'quotation' | 'join_kitchen';
  organizationOrKitchenName: string;
  contactName: string;
  country: CountryCode;
  dialCode: string;
  phone: string;
  email: string;
  serviceCategory: string;
  targetKitchen: string;
  estimatedMealsPerDay: string;
  notes: string;
  status: 'جديد' | 'قيد المراجعة' | 'تم الاعتماد' | 'بانتظار اعتماد السعر';
  createdAt: string;
  cartSnapshot?: Phase1CartItem[];
}

interface Phase1ServicesHubProps {
  lang: LanguageCode;
  country: CountryCode;
  role: RoleScope;
  activeSection: string;
  preselectedKitchenName?: string;
  cartItems: Phase1CartItem[];
  onNavigateSection: (
    section: string,
    kitchenId?: CentralKitchenId
  ) => void;
  onAddToCart: (item: Omit<Phase1CartItem, 'quantity'>) => void;
  onSubmitRfq: (rfq: Phase1RfqSubmission) => void;
  rfqSubmissions: Phase1RfqSubmission[];
  onOpenHaccpHub?: () => void;
}

export const Phase1ServicesHub: React.FC<Phase1ServicesHubProps> = ({
  lang,
  country,
  role,
  activeSection,
  preselectedKitchenName,
  cartItems,
  onNavigateSection,
  onAddToCart,
  onSubmitRfq,
  rfqSubmissions,
  onOpenHaccpHub,
}) => {
  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const selectedCountryObj =
    SUPPORTED_COUNTRIES.find((c) => c.code === country) || SUPPORTED_COUNTRIES[0];
  const roleConfig =
    PHASE1_ROLES.find((r) => r.id === role) || PHASE1_ROLES[0];

  const [formType, setFormType] = useState<'quotation' | 'join_kitchen'>(
    activeSection === 'join_kitchen' ? 'join_kitchen' : 'quotation'
  );
  const [isTestSampleMode, setIsTestSampleMode] = useState(false);
  const [testDate, setTestDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [testShift, setTestShift] = useState('وردية النهار (12:00 - 15:00)');

  // Supplier / Kitchen Mandatory Compliance Gates
  const [gateHaccp, setGateHaccp] = useState(false);
  const [gateEta, setGateEta] = useState(false);
  const [gateTaxRegistry, setGateTaxRegistry] = useState(false);
  const [gateInspection, setGateInspection] = useState(false);
  const [kitchenMenuOption, setKitchenMenuOption] = useState<'own_menu' | 'worker_catering'>('own_menu');

  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceCat, setServiceCat] = useState('إعاشة شركات ومصانع');
  const [targetKitchen, setTargetKitchen] = useState(
    preselectedKitchenName || ''
  );
  const [mealsPerDay, setMealsPerDay] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isReviewingBeforeSend, setIsReviewingBeforeSend] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<Phase1RfqSubmission | null>(null);

  useEffect(() => {
    if (activeSection === 'join_kitchen') {
      setFormType('join_kitchen');
      setIsTestSampleMode(false);
    } else if (activeSection === 'quotation') {
      setFormType('quotation');
    }
    setIsReviewingBeforeSend(false);
  }, [activeSection]);

  useEffect(() => {
    if (preselectedKitchenName !== undefined) {
      setTargetKitchen(preselectedKitchenName);
    }
  }, [preselectedKitchenName]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'most_ordered' | 'nearest'>('default');
  const [invoiceTab, setInvoiceTab] = useState<'my' | 'due' | 'paid' | 'history'>('my');

  const isFormView =
    activeSection === 'quotation' || activeSection === 'join_kitchen';

  const currentStageIndex = useMemo(() => {
    if (rfqSubmissions.some((r) => r.status === 'تم الاعتماد')) return 3;
    if (rfqSubmissions.some((r) => r.status === 'قيد المراجعة' || r.status === 'بانتظار اعتماد السعر')) return 2;
    if (rfqSubmissions.length > 0 || lastSubmitted) return 1;
    return 0;
  }, [rfqSubmissions, lastSubmitted]);

  const handleValidateAndPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!orgName.trim() || !contactName.trim() || phone.trim().length < 6) {
      setFormError(
        isRtl
          ? 'يرجى إدخال اسم الجهة / المطبخ، واسم المسؤول، ورقم هاتف صحيح قبل المتابعة.'
          : 'Please enter valid organization/kitchen name, contact person, and phone number.'
      );
      return;
    }

    if (
      formType === 'join_kitchen' &&
      (!gateHaccp || !gateEta || !gateTaxRegistry || !gateInspection)
    ) {
      setFormError(
        isRtl
          ? 'يجب استيفاء وتأكيد جميع بوابات الامتثال الإلزامية (HACCP، الفاتورة الإلكترونية ETA، السجل الضريبي، والمعاينة الميدانية) قبل إرسال طلب المطبخ.'
          : 'All mandatory compliance gates (HACCP, ETA E-Invoice, Tax Registry, and Field Inspection) must be confirmed.'
      );
      return;
    }

    setIsReviewingBeforeSend(true);
  };

  const handleConfirmSendRfq = () => {
    const prefix = formType === 'join_kitchen' ? 'KTC' : isTestSampleMode ? 'TST' : 'QT';
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `${prefix}-2026-${uniqueNum}`;

    const compiledNotes =
      formType === 'quotation' && isTestSampleMode
        ? `[TEST SAMPLE REQUEST · Date: ${testDate} · Shift: ${testShift}] ${notes.trim()}`.trim()
        : formType === 'join_kitchen'
          ? `[COMPLIANCE VERIFIED: HACCP + ETA + Tax + Inspection · Menu: ${
              kitchenMenuOption === 'own_menu'
                ? 'قائمة المطبخ الخاصة (مراجعة المالك)'
                : 'منيو إعاشة عاملين مقترح (مراجعة المالك)'
            }] ${notes.trim()}`.trim()
          : notes.trim();

    const submission: Phase1RfqSubmission = {
      id: orderRef,
      type: formType,
      organizationOrKitchenName: orgName.trim(),
      contactName: contactName.trim(),
      country,
      dialCode: selectedCountryObj.dialCode,
      phone: phone.trim(),
      email: email.trim(),
      serviceCategory:
        formType === 'quotation' && isTestSampleMode
          ? isRtl
            ? 'طلب عينة تذوق Test للتعاقد'
            : 'Test Sample Contracting'
          : serviceCat,
      targetKitchen:
        targetKitchen || (isRtl ? 'تحديد تلقائي حسب النطاق' : 'Assigned by region'),
      estimatedMealsPerDay: mealsPerDay.trim(),
      notes: compiledNotes,
      status: 'جديد',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      cartSnapshot: cartItems.length > 0 ? [...cartItems] : undefined,
    };

    onSubmitRfq(submission);
    setLastSubmitted(submission);
    setIsReviewingBeforeSend(false);
    setOrgName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setMealsPerDay('');
    setNotes('');
  };

  const catalogEntries = useMemo(() => {
    const metadataByItemId: Record<
      string,
      {
        supportsDelivery: boolean;
        supportsPickup: boolean;
        popularityRank: number;
        coverageRank: number;
      }
    > = {
      hs_meal_1: { supportsDelivery: true, supportsPickup: true, popularityRank: 2, coverageRank: 2 },
      hs_meal_2: { supportsDelivery: true, supportsPickup: true, popularityRank: 5, coverageRank: 2 },
      ma_meal_1: { supportsDelivery: true, supportsPickup: false, popularityRank: 1, coverageRank: 1 },
      ma_meal_2: { supportsDelivery: true, supportsPickup: true, popularityRank: 3, coverageRank: 1 },
      ah_meal_1: { supportsDelivery: true, supportsPickup: false, popularityRank: 4, coverageRank: 3 },
      ah_meal_2: { supportsDelivery: false, supportsPickup: true, popularityRank: 6, coverageRank: 3 },
    };

    const entries = THREE_CENTRAL_KITCHENS.flatMap((k) =>
      k.sampleMenuItems.map((m, idx) => {
        const meta = metadataByItemId[m.id] || {
          supportsDelivery: true,
          supportsPickup: true,
          popularityRank: 10,
          coverageRank: k.isHeadquarters ? 1 : 2,
        };
        return {
          ...m,
          ...meta,
          kitchenId: k.id,
          kitchenNameAr: k.nameAr,
          kitchenNameEn: k.nameEn,
          locationAr: k.locationAr,
          locationEn: k.locationEn,
          categoryTag: idx === 0 ? 'full_meals' : 'breakfast',
        };
      })
    );

    const filtered = entries.filter((item) => {
      if (selectedLocationFilter !== 'all' && item.kitchenId !== selectedLocationFilter)
        return false;
      if (selectedCategory !== 'all' && item.categoryTag !== selectedCategory)
        return false;
      if (fulfillmentFilter === 'delivery' && !item.supportsDelivery) return false;
      if (fulfillmentFilter === 'pickup' && !item.supportsPickup) return false;
      return true;
    });

    if (sortBy === 'most_ordered') {
      return [...filtered].sort((a, b) => a.popularityRank - b.popularityRank);
    }
    if (sortBy === 'nearest') {
      return [...filtered].sort((a, b) => a.coverageRank - b.coverageRank);
    }
    return filtered;
  }, [selectedCategory, selectedLocationFilter, fulfillmentFilter, sortBy]);

  const currentServiceInfo = TWELVE_SERVICES.find(
    (s) => s.targetSection === activeSection
  );

  // 1) Quotation Request, Test Sample & Join Central Kitchen View
  if (isFormView) {
    const stages = [
      { id: 0, ar: 'زائر المنصة', en: 'Visitor' },
      { id: 1, ar: 'عميل محتمل / Test', en: 'Prospect' },
      { id: 2, ar: 'تعاقد قيد المراجعة', en: 'Pending' },
      { id: 3, ar: 'عميل متعاقد نشط', en: 'Active' },
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-5 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigateSection('home')}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full basit-glass-pill hover:border-[#62339A] text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
          >
            <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            <span>{t.nav.home}</span>
          </button>

          <div className="flex items-center gap-1.5 basit-glass-pill p-1.5 rounded-full">
            <button
              type="button"
              onClick={() => {
                setFormType('quotation');
                setIsReviewingBeforeSend(false);
                setLastSubmitted(null);
              }}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                formType === 'quotation'
                  ? 'basit-glass-btn-primary text-white'
                  : 'text-[#292333] dark:text-slate-300'
              }`}
            >
              {t.quoteModalTitle}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormType('join_kitchen');
                setIsTestSampleMode(false);
                setIsReviewingBeforeSend(false);
                setLastSubmitted(null);
              }}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                formType === 'join_kitchen'
                  ? 'basit-glass-btn-primary text-white'
                  : 'text-[#292333] dark:text-slate-300'
              }`}
            >
              {t.joinKitchenTitle}
            </button>
          </div>
        </div>

        {/* Client Classification Progression Stepper */}
        <div className="p-4 rounded-3xl basit-liquid-glass space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-black text-[#62339A] dark:text-[#A34FE8]">
            <span>
              {isRtl ? 'تصنيف ومسار العميل والتعاقد:' : 'Client Classification Progression:'}
            </span>
            <span>{isRtl ? stages[currentStageIndex].ar : stages[currentStageIndex].en}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {stages.map((st, idx) => {
              const reached = idx <= currentStageIndex;
              return (
                <div
                  key={st.id}
                  className={`p-2 rounded-xl text-center text-[10px] font-black border ${
                    reached
                      ? 'bg-[#62339A] text-white border-[#62339A]'
                      : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#62339A]/25'
                  }`}
                >
                  {idx + 1}. {isRtl ? st.ar : st.en}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirmed Order Receipt */}
        {lastSubmitted && (
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                {isRtl
                  ? 'تم استلام طلبك وحفظه بنجاح!'
                  : 'Your request has been saved and confirmed!'}
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200 leading-relaxed space-y-1">
              <p>
                {isRtl ? 'رقم المتابعة المرجعي: ' : 'Tracking Code: '}
                <span dir="ltr" className="font-mono font-black underline tabular-nums">
                  {lastSubmitted.id}
                </span>
              </p>
              <p>
                {isRtl
                  ? `الجهة: ${lastSubmitted.organizationOrKitchenName} · المسؤول: ${lastSubmitted.contactName} (${lastSubmitted.dialCode} ${lastSubmitted.phone})`
                  : `Entity: ${lastSubmitted.organizationOrKitchenName} · Contact: ${lastSubmitted.contactName}`}
              </p>
            </div>
          </div>
        )}

        {/* Pre-Send Review & Edit Screen */}
        {isReviewingBeforeSend ? (
          <div className="p-6 rounded-3xl basit-liquid-glass space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#62339A]/25 pb-3">
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl
                  ? 'مراجعة وتعديل بيانات الطلب قبل الإرسال النهائي'
                  : 'Review & Edit Request Before Sending'}
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewingBeforeSend(false)}
                className="min-h-[44px] px-4 py-2 rounded-full basit-glass-pill text-xs font-extrabold text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer hover:border-[#62339A]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#62339A] dark:text-[#A34FE8]" />
                <span>{isRtl ? 'تعديل البيانات' : 'Edit Fields'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl basit-glass-tile">
                <div className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                  {isRtl ? 'الجهة / المطبخ' : 'Organization / Kitchen'}
                </div>
                <div className="font-black text-[#292333] dark:text-white mt-0.5">{orgName}</div>
              </div>
              <div className="p-3.5 rounded-2xl basit-glass-tile">
                <div className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                  {isRtl ? 'المسؤول والهاتف' : 'Contact & Phone'}
                </div>
                <div className="font-black text-[#292333] dark:text-white mt-0.5">
                  {contactName} · <span dir="ltr" className="tabular-nums">{selectedCountryObj.dialCode} {phone}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl basit-glass-tile">
                <div className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                  {isRtl ? 'نطاق الخدمة' : 'Service Scope'}
                </div>
                <div className="font-black text-[#292333] dark:text-white mt-0.5">
                  {isTestSampleMode
                    ? isRtl
                      ? `عينة تذوق Test (${testDate} · ${testShift})`
                      : `Test Sample (${testDate})`
                    : serviceCat}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl basit-glass-tile">
                <div className="text-[#64748B] dark:text-[#94A3B8] font-bold">
                  {isRtl ? 'الكمية / المطبخ' : 'Capacity / Kitchen'}
                </div>
                <div className="font-black text-[#292333] dark:text-white mt-0.5">
                  {mealsPerDay || '—'} · {targetKitchen || (isRtl ? 'حسب النطاق' : 'Auto')}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmSendRfq}
                className="min-h-[48px] flex-1 py-3 px-6 rounded-full basit-glass-btn-primary text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isRtl ? 'تأكيد وإرسال الطلب الآن' : 'Confirm & Submit Request'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReviewingBeforeSend(false)}
                className="min-h-[48px] py-3 px-5 rounded-full basit-glass-pill text-[#292333] dark:text-white text-xs font-extrabold cursor-pointer"
              >
                {isRtl ? 'العودة للتعديل' : 'Back to Edit'}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleValidateAndPreview}
            className="p-5 sm:p-7 rounded-3xl basit-liquid-glass space-y-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#62339A]/25 pb-4">
              <div className="flex items-start gap-4">
                <Service3DIcon iconKey={formType === 'join_kitchen' ? 'chef' : 'file'} size="md" />
                <div>
                  <h2 className="text-lg font-black text-[#292333] dark:text-white">
                    {formType === 'join_kitchen' ? t.joinKitchenTitle : t.quoteModalTitle}
                  </h2>
                  <p className="text-xs font-medium text-[#64748B] dark:text-slate-300 mt-0.5">
                    {isRtl
                      ? 'أدخل بياناتك، راجعها أو عدّلها في الخطوة التالية، ثم أرسل واحصل على رقم متابعة فريد.'
                      : 'Fill in your details, review or edit before sending, and receive a unique tracking code.'}
                  </p>
                </div>
              </div>

              {formType === 'quotation' && (
                <button
                  type="button"
                  onClick={() => setIsTestSampleMode((p) => !p)}
                  className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer border transition-colors ${
                    isTestSampleMode
                      ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]'
                      : 'bg-[#F7F5FA] dark:bg-[#1E293B] text-[#62339A] dark:text-[#A34FE8] border-[#E2E8F0] dark:border-[#62339A]/40'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>
                    {isTestSampleMode
                      ? isRtl
                        ? 'وضع عينة Test مفعّل ✓'
                        : 'Test Sample Mode On ✓'
                      : isRtl
                        ? 'تفعيل طلب عينة Test'
                        : 'Request Test Sample'}
                  </span>
                </button>
              )}
            </div>

            {/* Test Sample Scheduling Block */}
            {formType === 'quotation' && isTestSampleMode && (
              <div className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#62339A]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
                  <CalendarClock className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? 'تحديد موعد وتجربة عينة التذوق والاختبار الميداني (Test Sample):'
                      : 'Schedule Test Sample Tasting Date & Shift:'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-[#292333] dark:text-white">
                      {isRtl ? 'التاريخ المفضل للتجربة *' : 'Preferred Tasting Date *'}
                    </label>
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="min-h-[44px] w-full px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 text-[#292333] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[#292333] dark:text-white">
                      {isRtl ? 'الوردية / التوقيت المفضل *' : 'Preferred Shift *'}
                    </label>
                    <select
                      value={testShift}
                      onChange={(e) => setTestShift(e.target.value)}
                      className="min-h-[44px] w-full px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 font-bold text-[#292333] dark:text-white"
                    >
                      <option value="وردية الصباح (08:00 - 11:00)">
                        {isRtl ? 'وردية الصباح (08:00 - 11:00)' : 'Morning Shift (08:00 - 11:00)'}
                      </option>
                      <option value="وردية النهار (12:00 - 15:00)">
                        {isRtl ? 'وردية النهار (12:00 - 15:00)' : 'Day Shift (12:00 - 15:00)'}
                      </option>
                      <option value="الوردية المسائية (18:00 - 21:00)">
                        {isRtl ? 'الوردية المسائية (18:00 - 21:00)' : 'Evening Shift (18:00 - 21:00)'}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {cartItems.length > 0 && formType === 'quotation' && (
              <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs text-[#292333] dark:text-white space-y-1">
                <div className="font-black text-[#62339A] dark:text-[#A34FE8]">
                  {isRtl
                    ? `سيتم إرفاق بنود سلة الطلبات الحالية (${cartItems.length} أصناف):`
                    : `Current Cart Items Included (${cartItems.length} items):`}
                </div>
                <div className="text-[11px] font-bold">
                  {cartItems
                    .map((c) => `${isRtl ? c.nameAr : c.nameEn} (×${c.quantity})`)
                    .join(' · ')}
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {formType === 'join_kitchen'
                    ? isRtl
                      ? 'اسم المطبخ / الشركة *'
                      : 'Kitchen / Company Name *'
                    : isRtl
                      ? 'اسم الشركة / الجهة / العميل *'
                      : 'Organization / Client Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={isRtl ? 'مثال: مصنع النيل الهندسي' : 'e.g. Nile Engineering Co.'}
                  className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus:border-[#62339A] text-xs text-[#292333] dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {isRtl ? 'اسم المسؤول المباشر *' : 'Contact Person *'}
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={isRtl ? 'الاسم الكامل' : 'Full name'}
                  className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus:border-[#62339A] text-xs text-[#292333] dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
                </label>
                <div className="flex items-center rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus-within:border-[#62339A] overflow-hidden">
                  <div className="px-3 py-2.5 bg-[#E2E8F0] dark:bg-[#292333] border-e border-[#E2E8F0] dark:border-[#62339A]/35 flex items-center gap-1.5 shrink-0">
                    <OfficialCountryFlag country={selectedCountryObj.code} className="w-5 h-3.5" />
                    <span className="text-xs font-mono font-bold text-[#292333] dark:text-white tabular-nums" dir="ltr">
                      {selectedCountryObj.dialCode}
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10XXXXXXXX"
                    className="min-h-[44px] flex-1 px-3 py-2.5 text-xs text-[#292333] dark:text-white bg-transparent focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {isRtl ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="procurement@company.com"
                  className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus:border-[#62339A] text-xs text-[#292333] dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {isRtl ? 'نطاق الخدمة المطلوب' : 'Service Type'}
                </label>
                <select
                  value={serviceCat}
                  onChange={(e) => setServiceCat(e.target.value)}
                  className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus:border-[#62339A] text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
                >
                  <option value="إعاشة شركات ومصانع">{isRtl ? 'إعاشة شركات ومصانع' : 'Factory & Corporate Catering'}</option>
                  <option value="وجبات يومية">{isRtl ? 'وجبات يومية' : 'Daily Meals'}</option>
                  <option value="بوفيهات وأفراح ومناسبات">{isRtl ? 'بوفيهات وأفراح ومناسبات' : 'Banquets & Weddings'}</option>
                  <option value="بطاقات هدايا ومجالس">{isRtl ? 'بطاقات هدايا ومجالس' : 'Gift Cards & Majlis'}</option>
                  <option value="تأهيل مطبخ مركزي">{isRtl ? 'تأهيل مطبخ مركزي' : 'Central Kitchen Partnership'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {isRtl ? 'المطبخ المركزي المفضل' : 'Preferred Central Kitchen'}
                </label>
                <select
                  value={targetKitchen}
                  onChange={(e) => setTargetKitchen(e.target.value)}
                  className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus:border-[#62339A] text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
                >
                  <option value="">{isRtl ? 'تحديد تلقائي حسب المنطقة' : 'Auto-assign by coverage'}</option>
                  {THREE_CENTRAL_KITCHENS.map((k) => (
                    <option key={k.id} value={isRtl ? k.nameAr : k.nameEn}>
                      {isRtl ? `${k.nameAr} (${k.locationAr})` : `${k.nameEn} (${k.locationEn})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {formType === 'join_kitchen'
                    ? isRtl
                      ? 'الطاقة الإنتاجية اليومية (وجبة/يوم)'
                      : 'Daily Capacity (meals/day)'
                    : isRtl
                      ? 'عدد الوجبات المتوقع يومياً / للمناسبة'
                      : 'Estimated Daily Meals / Guests'}
                </label>
                <input
                  type="text"
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(e.target.value)}
                  placeholder={isRtl ? 'مثال: 250 وجبة' : 'e.g. 250 meals'}
                  className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus:border-[#62339A] text-xs text-[#292333] dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                  {isRtl ? 'ملاحظات ومواصفات إضافية' : 'Additional Specifications & Notes'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isRtl ? 'الموقع، مواعيد الورديات، متطلبات خاصة' : 'Address, shifts, dietary specs'}
                  className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 focus:border-[#62339A] text-xs text-[#292333] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Mandatory Supplier / Kitchen Compliance Gates */}
            {formType === 'join_kitchen' && (
              <div className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#62339A]/35 space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-black text-[#62339A] dark:text-[#A34FE8]">
                    {isRtl
                      ? 'خيار المنيو والتسعير (بمراجعة مالك المنصة):'
                      : 'Menu Track (Reviewed by Platform Owner):'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setKitchenMenuOption('own_menu')}
                      className={`p-2.5 rounded-xl border text-start font-bold cursor-pointer transition-all ${
                        kitchenMenuOption === 'own_menu'
                          ? 'bg-[#62339A] text-white border-[#62339A]'
                          : 'bg-white dark:bg-[#292333] text-[#292333] dark:text-white border-[#E2E8F0]'
                      }`}
                    >
                      {isRtl
                        ? 'العمل بقائمة المطبخ الخاصة'
                        : "Use Kitchen's Own Menu"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setKitchenMenuOption('worker_catering')}
                      className={`p-2.5 rounded-xl border text-start font-bold cursor-pointer transition-all ${
                        kitchenMenuOption === 'worker_catering'
                          ? 'bg-[#62339A] text-white border-[#62339A]'
                          : 'bg-white dark:bg-[#292333] text-[#292333] dark:text-white border-[#E2E8F0]'
                      }`}
                    >
                      {isRtl
                        ? 'منيو إعاشة عاملين مقترح'
                        : 'Proposed Worker Catering Menu'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-black text-[#62339A] dark:text-[#A34FE8]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? 'الالتزام باشتراطات النظافة وHACCP للشركة الوطنية اللوجستية:'
                      : 'National Logistics Hygiene & HACCP Gates:'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    [
                      gateHaccp,
                      setGateHaccp,
                      isRtl ? 'تطبيق اشتراطات الهاسب وسلامة الغذاء (HACCP)' : 'HACCP & Food Safety Certified',
                    ],
                    [
                      gateEta,
                      setGateEta,
                      isRtl ? 'الربط مع الفاتورة الإلكترونية المصرية (ETA)' : 'ETA E-Invoice Ready',
                    ],
                    [
                      gateTaxRegistry,
                      setGateTaxRegistry,
                      isRtl ? 'سجل تجاري وبطاقة ضريبية سارية' : 'Valid Commercial & Tax Registry',
                    ],
                    [
                      gateInspection,
                      setGateInspection,
                      isRtl ? 'جاهزية المعاينة الميدانية وسحب العينات' : 'Field Inspection & Sampling Ready',
                    ],
                  ].map(([checked, setter, lbl], idx) => (
                    <label
                      key={idx}
                      className="min-h-[44px] p-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex items-center gap-2 font-bold text-[#292333] dark:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked as boolean}
                        onChange={(e) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(e.target.checked)}
                        className="w-4 h-4 accent-[#62339A]"
                      />
                      <span>{lbl as string}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="min-h-[48px] w-full py-3.5 px-6 rounded-full basit-glass-btn-primary text-xs sm:text-sm font-black transition-all cursor-pointer"
            >
              {isRtl ? 'مراجعة الطلب قبل الإرسال ←' : 'Review Before Submitting →'}
            </button>
          </form>
        )}

        {/* Saved Requests History */}
        {rfqSubmissions.length > 0 && (
          <div className="p-5 rounded-3xl basit-liquid-glass space-y-3">
            <h3 className="text-sm font-black text-[#292333] dark:text-white">
              {isRtl ? 'الطلبات المحفوظة' : 'Saved Requests Log'}
            </h3>
            <div className="space-y-2">
              {rfqSubmissions.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl basit-glass-tile flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span dir="ltr" className="font-mono font-black text-[#62339A] dark:text-[#A34FE8] me-2 tabular-nums">
                      {r.id}
                    </span>
                    <span className="font-extrabold text-[#292333] dark:text-white">
                      {r.organizationOrKitchenName}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#0EA5E9]/15 text-[#0369A1] dark:text-[#A34FE8] text-[11px] font-black">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2) Invoices Section (RBAC Guarded & Honest No-Fake-Payment State)
  if (activeSection === 'service_invoices') {
    const invoiceTabs = [
      { id: 'my' as const, ar: 'فواتيري', en: 'My Invoices' },
      { id: 'due' as const, ar: 'المستحقة', en: 'Due' },
      { id: 'paid' as const, ar: 'المدفوعة', en: 'Paid' },
      { id: 'history' as const, ar: 'سجل المدفوعة', en: 'Payment History' },
    ];

    return (
      <div className="space-y-5 pb-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigateSection('home')}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full basit-glass-pill hover:border-[#62339A] text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
          >
            <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            <span>{t.nav.home}</span>
          </button>
        </div>

        <div className="p-6 rounded-3xl basit-liquid-glass space-y-5">
          <div className="flex items-center gap-4">
            <Service3DIcon iconKey="receipt" size="md" />
            <div>
              <h2 className="text-lg font-black text-[#292333] dark:text-white">
                {isRtl ? 'بوابة الفواتير والسداد الإلكتروني' : 'Invoices & Payments Portal'}
              </h2>
              <p className="text-xs font-medium text-[#64748B] dark:text-slate-300">
                {isRtl
                  ? 'معزولة بالكامل وفق صلاحية الحساب الحالي'
                  : 'Strictly scoped to the active account permissions'}
              </p>
            </div>
          </div>

          {!roleConfig.canViewInvoices ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-3">
              <Lock className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="text-sm font-black text-rose-900 dark:text-rose-200">
                {isRtl
                  ? 'يتطلب عرض الفواتير تسجيل الدخول بحساب أفراد أو شركات'
                  : 'Invoices Access Requires Individual or Corporate Login'}
              </h3>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300 max-w-md mx-auto leading-relaxed">
                {isRtl
                  ? 'يمكنك التصفح بحرية كزائر، وعند طلب استعراض الفواتير يرجى الدخول أو اختيار حسابك من تبويب الحساب والصلاحيات.'
                  : 'Browsing as Visitor is open everywhere; sign in via the Account tab to inspect invoices.'}
              </p>
              <button
                type="button"
                onClick={() => onNavigateSection('admin')}
                className="min-h-[44px] px-6 py-2.5 rounded-full basit-glass-btn-primary text-xs font-extrabold cursor-pointer"
              >
                {isRtl ? 'الانتقال لتسجيل الدخول والصلاحيات' : 'Go to Account & Permissions'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] dark:border-[#62339A]/25 pb-3">
                {invoiceTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInvoiceTab(tab.id)}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                      invoiceTab === tab.id
                        ? 'basit-glass-btn-primary text-white'
                        : 'basit-glass-pill text-[#292333] dark:text-slate-200 hover:border-[#62339A]'
                    }`}
                  >
                    {isRtl ? tab.ar : tab.en}
                  </button>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-[#0EA5E9]/10 dark:bg-[#0EA5E9]/15 border border-[#0EA5E9] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <ShieldAlert className="w-8 h-8 text-[#62339A] dark:text-[#A34FE8] shrink-0" />
                <div className="space-y-1">
                  <div className="text-sm font-black text-[#292333] dark:text-white">
                    {isRtl
                      ? 'بانتظار الربط المحاسبي وبوابة الدفع الحقيقية'
                      : 'Awaiting Accounting & Live Payment Gateway Integration'}
                  </div>
                  <p className="text-xs font-medium text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
                    {isRtl
                      ? 'لا يتم عرض فواتير مالية وهمية أو إتمام عمليات دفع صورية. سيظهر هنا رصيد وفواتير منشأتك بمجرد اعتماد الربط البنكي أو استخدام بوابة التجار.'
                      : 'No simulated payments are processed in Phase 1. Real invoices populate once payment gateway integration is activated.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3) All 12 Services & Filtered Meals/Offers/Gift Cards/Hygiene Workspace
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigateSection('home')}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full basit-glass-pill hover:border-[#62339A] text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
          <span>{t.nav.home}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateSection('quotation')}
          className="min-h-[44px] px-5 py-2.5 rounded-full basit-glass-btn-primary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#A34FE8]" />
          <span>{t.heroPrimaryCta}</span>
        </button>
      </div>

      {/* Active Service Banner */}
      <div className="p-5 sm:p-6 rounded-3xl basit-liquid-glass space-y-3">
        <div className="flex items-center gap-4">
          <Service3DIcon iconKey={currentServiceInfo?.iconKey || 'utensils'} size="md" />
          <div>
            <span className="text-[11px] font-extrabold text-[#62339A] dark:text-[#A34FE8]">
              {t.brandName} — {t.servicesHeading}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#292333] dark:text-white">
              {currentServiceInfo
                ? isRtl
                  ? currentServiceInfo.titleAr
                  : currentServiceInfo.titleEn
                : isRtl
                  ? 'كتالوج الوجبات والخدمات الموحد'
                  : 'Unified Meals & Services Catalog'}
            </h2>
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-300 mt-0.5">
              {currentServiceInfo
                ? isRtl
                  ? currentServiceInfo.subtitleAr
                  : currentServiceInfo.subtitleEn
                : isRtl
                  ? 'استعرض الأقسام الغذائية الـ 15 واطلب عرض سعر فوري لأي خدمة'
                  : 'Browse the 15 food categories and request an official quote'}
            </p>
          </div>
        </div>

        {activeSection === 'service_gifts' && (
          <div className="p-3.5 rounded-2xl basit-glass-tile text-xs font-semibold text-[#292333] dark:text-[#E2E8F0] leading-relaxed">
            {isRtl
              ? 'تشمل فئة بطاقات الهدايا: الهدايا المؤسسية، منتجات البن المحمص، العسل الطبيعي، العطارة المختارة، والتمور الفاخرة. الأسعار والتوافر لكل باقة: بانتظار اعتماد البيانات.'
              : 'Gift Cards include corporate gift boxes, coffee, natural honey, spices, and premium dates. Final package pricing: Awaiting Data Approval.'}
          </div>
        )}
        {activeSection === 'service_hygiene' && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed flex flex-wrap items-center justify-between gap-3">
            <span>
              {isRtl
                ? 'يتم تطبيق معايير HACCP وISO 22000 وفحوصات السحب الحراري والعينات داخل المطابخ المركزية الثلاثة بإشراف إدارات الجودة والسلامة الغذائية.'
                : 'HACCP & ISO 22000 hygiene protocols, temperature tracking, and lab sampling are enforced across all 3 Central Kitchens.'}
            </span>
            {onOpenHaccpHub && (
              <button
                type="button"
                onClick={onOpenHaccpHub}
                className="min-h-[44px] px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs shrink-0 cursor-pointer"
              >
                {isRtl ? 'فتح منظومة التفتيش والهاسب HACCP' : 'Open HACCP Inspection Hub'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters & Sorting Bar */}
      <div className="p-4 sm:p-5 rounded-3xl basit-liquid-glass space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-[#292333] dark:text-white">
            <SlidersHorizontal className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            <span>
              {isRtl ? 'الفلاتر والتصنيفات الغذائية (15 تصنيف)' : 'Filters & Food Categories (15)'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLocationFilter}
              onChange={(e) => setSelectedLocationFilter(e.target.value)}
              className="min-h-[44px] px-3.5 py-2 rounded-full basit-glass-pill text-xs font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
            >
              <option value="all">{isRtl ? 'كل المناطق والمطابخ' : 'All Kitchens & Locations'}</option>
              {THREE_CENTRAL_KITCHENS.map((k) => (
                <option key={k.id} value={k.id}>
                  {isRtl ? k.locationAr : k.locationEn}
                </option>
              ))}
            </select>

            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value as 'all' | 'delivery' | 'pickup')}
              className="min-h-[44px] px-3.5 py-2 rounded-full basit-glass-pill text-xs font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
            >
              <option value="all">{isRtl ? 'الكل (توصيل واستلام)' : 'Delivery & Pickup'}</option>
              <option value="delivery">{isRtl ? 'التوصيل للموقع' : 'Site Delivery'}</option>
              <option value="pickup">{isRtl ? 'الاستلام من المطبخ' : 'Kitchen Pickup'}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'most_ordered' | 'nearest')}
              className="min-h-[44px] px-3.5 py-2 rounded-full basit-glass-pill text-xs font-bold text-[#292333] dark:text-white focus:outline-none focus:border-[#62339A]"
            >
              <option value="default">{isRtl ? 'الترتيب الافتراضي' : 'Default Sort'}</option>
              <option value="most_ordered">{isRtl ? 'الأكثر طلباً' : 'Most Ordered'}</option>
              <option value="nearest">{isRtl ? 'الأقرب لنطاق الخدمة' : 'Nearest Coverage'}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[44px] shrink-0 px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'basit-glass-btn-primary text-white'
                : 'basit-glass-pill text-[#292333] dark:text-slate-200 hover:border-[#62339A]'
            }`}
          >
            {isRtl ? 'كل التصنيفات' : 'All Categories'}
          </button>
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[44px] shrink-0 px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'basit-glass-btn-primary text-white'
                  : 'basit-glass-pill text-[#292333] dark:text-slate-200 hover:border-[#62339A]'
              }`}
            >
              {isRtl ? cat.ar : cat.en}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Results Grid */}
      {catalogEntries.length === 0 ? (
        <div className="p-8 rounded-3xl basit-liquid-glass text-center space-y-3">
          <Filter className="w-8 h-8 text-[#62339A] dark:text-[#A34FE8] mx-auto" />
          <p className="text-sm font-black text-[#292333] dark:text-white">
            {isRtl
              ? 'الأصناف التفصيلية لهذا التصنيف بانتظار اعتماد البيانات والأسعار'
              : 'Detailed items for this category are Awaiting Data Approval'}
          </p>
          <p className="text-xs font-medium text-[#64748B] dark:text-slate-300">
            {isRtl
              ? 'يمكنك طلب عرض سعر مخصص لهذا التصنيف مباشرةً وسيتولى فريق التشغيل إعداد القائمة المعتمدة.'
              : 'You can submit an official Quotation Request for this category directly.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigateSection('quotation')}
            className="min-h-[44px] mt-2 px-6 py-3 rounded-full basit-glass-btn-primary text-xs font-extrabold cursor-pointer"
          >
            {t.heroPrimaryCta}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogEntries.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl basit-glass-tile flex flex-col justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-black text-[#292333] dark:text-white">
                    {isRtl ? item.nameAr : item.nameEn}
                  </h4>
                  <span className="text-[10px] font-bold text-[#0369A1] dark:text-[#A34FE8] bg-[#0EA5E9]/15 px-2.5 py-0.5 rounded-full shrink-0">
                    {t.awaitingApproval}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-[#62339A] dark:text-[#A34FE8]">
                  {isRtl ? item.kitchenNameAr : item.kitchenNameEn}
                </p>
                <p className="text-xs font-medium text-[#64748B] dark:text-slate-300 leading-relaxed">
                  {isRtl ? item.descAr : item.descEn}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#62339A]/25 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#62339A] dark:text-[#A34FE8]" />
                  <span>{isRtl ? 'السعر عند الاعتماد' : 'Price on approval'}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onAddToCart({
                      id: item.id,
                      nameAr: item.nameAr,
                      nameEn: item.nameEn,
                      kitchenNameAr: item.kitchenNameAr,
                      kitchenNameEn: item.kitchenNameEn,
                      approvedPrice: item.approvedPrice,
                    })
                  }
                  className="min-h-[44px] px-4 py-2 rounded-full basit-glass-btn-primary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-[#A34FE8]" />
                  <span>{t.addToCartTest}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
