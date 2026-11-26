import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Service3DIcon } from '../Service3DIcon';
import type { User } from 'firebase/auth';
import type { CountryCode, LanguageCode } from '../../data/phase1Data';
import type {
  AccountRegistrationKind,
  OnboardingApplicationDoc,
  OnboardingEntityType,
  OnboardingTargetRole,
  PlatformSettingsDoc,
  SubscriptionPlanDoc,
  UserProfileDoc,
} from '../../types/faydEcosystem';
import {
  resubmitOnboardingInfo,
  submitOnboardingApplication,
} from '../../services/faydFirestoreService';
import {
  ALLOWED_ENTITY_TYPES_BY_KIND,
  normalizeOnboardingClassification,
  supportsDeliveryOnlyToggle,
} from '../../utils/onboardingClassification';

interface PartnerOnboardingPortalProps {
  lang: LanguageCode;
  countryCode: CountryCode;
  user: User | null;
  userProfile?: UserProfileDoc | null;
  platformSettings?: PlatformSettingsDoc;
  onRequireSignIn: () => void;
  plans: SubscriptionPlanDoc[];
  myApplications: OnboardingApplicationDoc[];
  onToast: (msg: string) => void;
}

export const PartnerOnboardingPortal: React.FC<PartnerOnboardingPortalProps> = ({
  lang,
  countryCode,
  user,
  userProfile,
  platformSettings,
  onRequireSignIn,
  plans,
  myApplications,
  onToast,
}) => {
  const isRtl = lang === 'ar';

  const [accountKind, setAccountKind] = useState<AccountRegistrationKind>('factory_company');
  const [targetRole, setTargetRole] = useState<OnboardingTargetRole>('merchant_owner');
  const [entityType, setEntityType] = useState<OnboardingEntityType>('company_factory');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [commercialRegRef, setCommercialRegRef] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.planId || 'starter');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mandatory Compliance Gates for Factories, Merchants & Central Kitchens
  const [gateHaccp, setGateHaccp] = useState(false);
  const [gateEta, setGateEta] = useState(false);
  const [gateInspection, setGateInspection] = useState(false);

  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [resubmitNote, setResubmitNote] = useState('');

  useEffect(() => {
    if (user?.displayName && !contactName.trim()) {
      setContactName(user.displayName);
    }
  }, [user?.displayName, contactName]);

  useEffect(() => {
    if (plans.length > 0 && !plans.some((p) => p.planId === selectedPlanId)) {
      setSelectedPlanId(plans[0].planId);
    }
  }, [plans, selectedPlanId]);

  const accountSelectorOptions: {
    kind: AccountRegistrationKind;
    role: OnboardingTargetRole | 'customer';
    defaultEntity: OnboardingEntityType;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    badgeAr: string;
    badgeEn: string;
    iconKey: string;
  }[] = [
    {
      kind: 'factory_company',
      role: 'merchant_owner',
      defaultEntity: 'company_factory',
      titleAr: 'مصنع / شركة توريد وإنتاج',
      titleEn: 'Factory / Industrial Company',
      descAr: 'مساحة عمل مستقلة لإدارة الإنتاج والطلبات والمخزون والتوصيل.',
      descEn: 'Isolated workspace for industrial supply, catalogs & contracts.',
      badgeAr: 'يحتاج موافقة الإدارة',
      badgeEn: 'Admin Approval',
      iconKey: 'factory',
    },
    {
      kind: 'merchant_owner',
      role: 'merchant_owner',
      defaultEntity: 'restaurant',
      titleAr: 'تاجر / مطعم / متجر / مطبخ',
      titleEn: 'Merchant / Restaurant / Store',
      descAr: 'فتح متجر أو مطعم معزول مع الكتالوج والفريق وبوابات الدفع.',
      descEn: 'Isolated storefront with SKUs, team members & payment checkout.',
      badgeAr: 'يحتاج موافقة الإدارة',
      badgeEn: 'Admin Approval',
      iconKey: 'store',
    },
    {
      kind: 'customer',
      role: 'customer',
      defaultEntity: 'store',
      titleAr: 'عميل / مشتري أفراد أو أعمال',
      titleEn: 'Customer / Buyer Account',
      descAr: 'الطلب الفوري من المتاجر والمطاعم، تتبع الشحنات، والدفع الإلكتروني.',
      descEn: 'Order from verified storefronts, track deliveries & pay online.',
      badgeAr: platformSettings?.autoActivateCustomers !== false ? 'تفعيل تلقائي متاح' : 'يتطلب موافقة الإدارة',
      badgeEn: platformSettings?.autoActivateCustomers !== false ? 'Auto-Activate On' : 'Admin Review',
      iconKey: 'customer',
    },
    {
      kind: 'courier',
      role: 'courier',
      defaultEntity: 'courier_individual',
      titleAr: 'مندوب توصيل معتمد',
      titleEn: 'Approved Delivery Courier',
      descAr: 'استقبال مهام التوصيل المسندة فقط وإدارة محفظة المستحقات.',
      descEn: 'Receive assigned delivery tasks & manage earnings wallet.',
      badgeAr: 'يحتاج موافقة الإدارة',
      badgeEn: 'Admin Approval',
      iconKey: 'courier',
    },
    {
      kind: 'opportunity_partner',
      role: 'opportunity_partner',
      defaultEntity: 'project_owner',
      titleAr: 'شريك فرص وتشغيل (انتفاع)',
      titleEn: 'Opportunities & Usufruct Partner',
      descAr: 'طرح مشروعات أو مواقع تجارية وإصدار عقود تقنية الانتفاع.',
      descEn: 'Propose commercial sites or operational projects under contracts.',
      badgeAr: 'يحتاج موافقة الإدارة',
      badgeEn: 'Admin Approval',
      iconKey: 'opportunity',
    },
  ];

  const handleSelectKind = (opt: (typeof accountSelectorOptions)[number]) => {
    setAccountKind(opt.kind);
    if (opt.role !== 'customer') {
      setTargetRole(opt.role);
      setEntityType(opt.defaultEntity);
    }
  };

  const requiresComplianceGates =
    accountKind === 'factory_company' || accountKind === 'merchant_owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireSignIn();
      return;
    }
    if (!businessName.trim() || !contactName.trim() || !phone.trim() || !city.trim() || !commercialRegRef.trim()) {
      onToast(isRtl ? 'يرجى استكمال جميع الحقول المطلوبة.' : 'Please complete all required fields.');
      return;
    }
    if (phone.trim().length < 6) {
      onToast(isRtl ? 'رقم الهاتف يجب أن يكون 6 أرقام على الأقل.' : 'Phone number must be at least 6 characters.');
      return;
    }
    if (requiresComplianceGates && (!gateHaccp || !gateEta || !gateInspection)) {
      onToast(
        isRtl
          ? 'يرجى تأكيد استيفاء اشتراطات الهاسب/الجودة، الفاتورة الإلكترونية ETA، والمعاينة الميدانية.'
          : 'Please confirm HACCP, ETA E-Invoice, and Field Inspection compliance gates.'
      );
      return;
    }
    if (accountKind === 'customer') return;
    const normalized = normalizeOnboardingClassification(accountKind, targetRole, entityType);
    const compiledNotes = requiresComplianceGates
      ? `[COMPLIANCE: HACCP+ETA+Inspection OK] ${notes.trim()}`.slice(0, 600)
      : notes.trim().slice(0, 600);

    setSubmitting(true);
    try {
      const appId = await submitOnboardingApplication(user, {
        targetRole: normalized.targetRole,
        entityType: normalized.entityType,
        businessName,
        contactName,
        phone,
        countryCode,
        city,
        commercialRegRef,
        selectedPlanId,
        notes: compiledNotes,
      });
      onToast(
        isRtl
          ? `تم إرسال طلب الانضمام بنجاح برقم ${appId} بحالة "قيد المراجعة" لدى الإدارة المركزية.`
          : `Application ${appId} submitted and queued for Central Admin review.`
      );
      setBusinessName('');
      setPhone('');
      setCity('');
      setCommercialRegRef('');
      setNotes('');
    } catch (err) {
      onToast(err instanceof Error ? err.message : isRtl ? 'تعذر إرسال الطلب.' : 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async (app: OnboardingApplicationDoc) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await resubmitOnboardingInfo(user, app.appId, {
        businessName: app.businessName,
        contactName: app.contactName,
        phone: app.phone,
        city: app.city,
        commercialRegRef: app.commercialRegRef,
        notes: resubmitNote || app.notes || '',
      });
      setEditingAppId(null);
      setResubmitNote('');
      onToast(isRtl ? 'تم إرسال الاستكمال للإدارة بنجاح.' : 'Updated application sent for review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 shadow-xs space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-[#62339A] dark:text-[#A34FE8]">
              {isRtl ? 'اختيار نوع الحساب والتسجيل — BASIT | باسط' : 'BASIT | باسط Account Type & Onboarding'}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#292333] dark:text-white mt-0.5">
              {isRtl
                ? 'حدد نوع حسابك للبدء أو تقديم طلب إنشاء مساحة عمل معزولة'
                : 'Select Your Account Type to Start or Apply for an Isolated Workspace'}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              {isRtl
                ? 'يحصل كل مصنع أو تاجر أو جهة معتمدة على معرّف مستأجر معزول (tenantId) وبيانات محمية بقواعد Firestore.'
                : 'Every approved Factory, Merchant, or Partner receives an isolated tenantId protected by Firestore rules.'}
            </p>
          </div>

          {user && userProfile && (
            <div className="px-3.5 py-2 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/40 text-xs">
              <div className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                {isRtl ? 'حالة حسابك الحالي في المنصة:' : 'Current Account Status:'}
              </div>
              <div className="font-black text-[#62339A] dark:text-[#A34FE8]">
                {userProfile.role} · {userProfile.status}
              </div>
            </div>
          )}
        </div>

        {/* Account Type Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {accountSelectorOptions.map((opt) => {
            const active = accountKind === opt.kind;
            return (
              <button
                key={opt.kind}
                type="button"
                onClick={() => handleSelectKind(opt)}
                className={`min-h-[44px] p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  active
                    ? 'bg-[#62339A] text-white border-[#62339A] shadow-md shadow-[#62339A]/25'
                    : 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white hover:border-[#62339A]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Service3DIcon iconKey={opt.iconKey} size="sm" />
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      active
                        ? 'bg-white/15 text-[#BAE6FD]'
                        : 'bg-white dark:bg-[#292333] text-[#62339A] dark:text-[#A34FE8]'
                    }`}
                  >
                    {isRtl ? opt.badgeAr : opt.badgeEn}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-black leading-snug">
                    {isRtl ? opt.titleAr : opt.titleEn}
                  </div>
                  <p
                    className={`text-[10px] mt-1 leading-relaxed ${
                      active ? 'text-[#F7F5FA]' : 'text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {isRtl ? opt.descAr : opt.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Customer Account Track vs Business/Courier Onboarding Form */}
        {accountKind === 'customer' ? (
          <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#62339A] dark:text-[#A34FE8]" />
                <h3 className="text-sm font-black text-[#292333] dark:text-white">
                  {isRtl ? 'تسجيل وتفعيل حساب العميل / المشتري' : 'Customer Account Registration & Activation'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#0EA5E9]/15 text-[#0369A1] dark:text-[#A34FE8] font-black">
                {platformSettings?.autoActivateCustomers !== false
                  ? isRtl ? 'سياسة المنصة: تفعيل تلقائي للعملاء' : 'Policy: Auto-Activate Customers'
                  : isRtl ? 'سياسة المنصة: يتطلب موافقة الإدارة' : 'Policy: Admin Approval Required'}
              </span>
            </div>

            {!user ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[#64748B] dark:text-[#CBD5E1]">
                  {isRtl
                    ? 'سجّل الدخول بحساب Google لإنشاء سجل العميل في Firestore تلقائياً وفق السياسة المفعّلة من الإدارة المركزية.'
                    : 'Sign in with Google to initialize your verified Firestore customer account under current admin policy.'}
                </p>
                <button
                  type="button"
                  onClick={onRequireSignIn}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer"
                >
                  {isRtl ? 'تسجيل الدخول / إنشاء حساب عميل' : 'Sign In / Register Customer'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-2">
                <div className="font-black text-[#292333] dark:text-white">
                  {user.displayName || user.email} ({user.uid.slice(0, 10)}...)
                </div>
                <div className="text-[#64748B] dark:text-[#94A3B8]">
                  {isRtl
                    ? `حالة الحساب الحالية: ${userProfile?.status || 'active'} — الصلاحية: ${userProfile?.role || 'customer'}`
                    : `Status: ${userProfile?.status || 'active'} — Role: ${userProfile?.role || 'customer'}`}
                </div>
                {userProfile?.status === 'pending' && (
                  <div className="p-2.5 rounded-xl bg-[#0EA5E9]/15 text-[#0369A1] dark:text-[#A34FE8] font-bold">
                    {isRtl
                      ? 'تم تعليق التفعيل التلقائي من الإدارة المركزية؛ حسابك بانتظار المراجعة في قسم إدارة الحسابات.'
                      : 'Auto-activation is disabled by admin; your account is pending admin activation.'}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0] dark:border-[#62339A]/25 text-xs">
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] dark:bg-[#1E293B] px-4 py-2.5 rounded-xl">
              <span className="font-black text-[#62339A] dark:text-[#A34FE8]">
                {accountKind === 'factory_company'
                  ? isRtl ? 'نموذج طلب فتح مساحة عمل مصنع / شركة' : 'Factory / Company Workspace Application'
                  : accountKind === 'merchant_owner'
                    ? isRtl ? 'نموذج طلب فتح مساحة تاجر / مطعم / متجر' : 'Merchant / Storefront Workspace Application'
                    : accountKind === 'courier'
                      ? isRtl ? 'نموذج اعتماد مندوب توصيل جديد' : 'Delivery Courier Application'
                      : isRtl ? 'نموذج اعتماد شريك فرص وانتفاع' : 'Opportunities Partner Application'}
              </span>
              {supportsDeliveryOnlyToggle(accountKind) && (
                <button
                  type="button"
                  onClick={() => {
                    const nextRole: OnboardingTargetRole =
                      targetRole === 'delivery_client' ? 'merchant_owner' : 'delivery_client';
                    const normalized = normalizeOnboardingClassification(accountKind, nextRole, entityType);
                    setTargetRole(normalized.targetRole);
                    setEntityType(normalized.entityType);
                  }}
                  className="min-h-[44px] text-[11px] font-bold text-[#292333] dark:text-[#E2E8F0] underline cursor-pointer"
                >
                  {targetRole === 'delivery_client' ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'مرسل كجهة مستفيدة من التوصيل (BASIT Delivery)' : 'Applying as Delivery Client'}</span>
                    </span>
                  ) : (
                    isRtl ? 'أو اضغط للتقديم كجهة مستفيدة من التوصيل فقط' : 'Or switch to Delivery-Only Partner'
                  )}
                </button>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
                {isRtl ? 'الاسم التجاري / اسم المصنع أو المندوب *' : 'Business / Applicant Name *'}
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={isRtl ? 'مثال: مصنع النيل للأغذية / مطاعم العين' : 'Entity or Courier Name'}
                className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white focus:border-[#62339A] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
                {isRtl ? 'تصنيف النشاط *' : 'Entity Classification *'}
              </label>
              <select
                value={entityType}
                onChange={(e) => {
                  const nextEntity = e.target.value as OnboardingEntityType;
                  const normalized = normalizeOnboardingClassification(accountKind, targetRole, nextEntity);
                  setEntityType(normalized.entityType);
                  setTargetRole(normalized.targetRole);
                }}
                className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white focus:border-[#62339A] outline-none"
              >
                {(
                  [
                    { value: 'company_factory' as const, ar: 'مصنع أو شركة صناعية / تجارية', en: 'Company / Factory' },
                    { value: 'restaurant' as const, ar: 'مطعم / كافيه', en: 'Restaurant / Cafe' },
                    { value: 'store' as const, ar: 'متجر / سوبر ماركت', en: 'Retail Store / Market' },
                    { value: 'central_kitchen' as const, ar: 'مطبخ مركزي', en: 'Central Kitchen' },
                    { value: 'courier_individual' as const, ar: 'مندوب توصيل', en: 'Individual Courier' },
                    { value: 'project_owner' as const, ar: 'صاحب مشروع / خبرة', en: 'Project / Expertise Owner' },
                    { value: 'site_owner' as const, ar: 'صاحب موقع تجاري', en: 'Commercial Site Owner' },
                  ]
                )
                  .filter((opt) => ALLOWED_ENTITY_TYPES_BY_KIND[accountKind].includes(opt.value))
                  .map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.ar : opt.en}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
                {isRtl ? 'اسم الشخص المسؤول *' : 'Contact Person *'}
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white focus:border-[#62339A] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
                {isRtl ? 'رقم الهاتف للتواصل *' : 'Contact Phone *'}
              </label>
              <input
                type="tel"
                required
                minLength={6}
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white focus:border-[#62339A] outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
                {isRtl ? 'المدينة / نطاق التغطية *' : 'City / Zone *'}
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={isRtl ? 'العاشر من رمضان / بدر / القاهرة / الدوحة / مسقط / لندن' : 'Cairo / Doha / Muscat / London'}
                className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white focus:border-[#62339A] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
                {isRtl ? 'رقم السجل التجاري / الضريبي / البطاقة القومية *' : 'Commercial Registry / National ID *'}
              </label>
              <input
                type="text"
                required
                value={commercialRegRef}
                onChange={(e) => setCommercialRegRef(e.target.value)}
                placeholder={isRtl ? 'مثال: CR-19132 أو الرقم القومي للمندوب' : 'Registry or National ID'}
                className="min-h-[44px] w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white focus:border-[#62339A] outline-none tabular-nums"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-2">
                {isRtl ? 'اختر باقة الاشتراك (خاضعة للتحكم المركزي)' : 'Select Subscription Plan'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((p) => {
                  const isSel = selectedPlanId === p.planId;
                  return (
                    <button
                      key={p.planId}
                      type="button"
                      onClick={() => setSelectedPlanId(p.planId)}
                      className={`min-h-[44px] p-3.5 rounded-2xl border text-start transition-all cursor-pointer space-y-1 ${
                        isSel
                          ? 'border-[#62339A] bg-[#F7F5FA] dark:bg-[#1E293B] ring-2 ring-[#62339A]/25'
                          : 'border-[#E2E8F0] dark:border-[#62339A]/30 bg-white dark:bg-[#1E293B]'
                      }`}
                    >
                      <div className="font-black text-[#292333] dark:text-white">
                        {isRtl ? p.nameAr : p.nameEn}
                      </div>
                      <div dir="ltr" className="text-sm font-black text-[#62339A] dark:text-[#A34FE8] tabular-nums">
                        {p.monthlyFeeEGP.toLocaleString()} {isRtl ? 'EGP / شهر' : 'EGP/mo'}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {isRtl
                          ? `عمولة طلبات ${p.orderCommissionPct}% · خصم توصيل ${p.deliveryDiscountPct}%`
                          : `${p.orderCommissionPct}% commission · ${p.deliveryDiscountPct}% delivery discount`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {requiresComplianceGates && (
              <div className="md:col-span-2 p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#62339A]/30 space-y-2">
                <div className="font-black text-[#62339A] dark:text-[#A34FE8] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? 'بوابات الامتثال والتفتيش الإلزامية لاعتماد المصانع والمطابخ:'
                      : 'Mandatory Compliance & Quality Gates:'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    [
                      gateHaccp,
                      setGateHaccp,
                      isRtl ? 'اعتماد سلامة الغذاء HACCP / ISO' : 'HACCP / Hygiene Ready',
                    ],
                    [
                      gateEta,
                      setGateEta,
                      isRtl ? 'التوافق مع الفاتورة الإلكترونية ETA' : 'ETA E-Invoice Ready',
                    ],
                    [
                      gateInspection,
                      setGateInspection,
                      isRtl ? 'الموافقة على التفتيش والمعاينة' : 'Field Inspection Approved',
                    ],
                  ].map(([chk, setter, label], idx) => (
                    <label
                      key={idx}
                      className="min-h-[44px] p-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex items-center gap-2 font-bold text-[#292333] dark:text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={chk as boolean}
                        onChange={(e) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(e.target.checked)}
                        className="w-4 h-4 accent-[#62339A]"
                      />
                      <span>{label as string}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
                {isRtl ? 'ملاحظات إضافية أو وصف الأوراق المتوفرة' : 'Additional Notes'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-white focus:border-[#62339A] outline-none resize-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#62339A] hover:bg-[#4A2378] disabled:opacity-60 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-[#62339A]/25 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#BAE6FD]" />
                <span>
                  {user
                    ? submitting
                      ? isRtl ? 'جاري الإرسال...' : 'Submitting...'
                      : isRtl ? 'إرسال طلب الانضمام للمراجعة المركزية' : 'Submit Application'
                    : isRtl ? 'سجّل الدخول بـ Google لإرسال الطلب' : 'Sign in with Google to Submit'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* My Applications Status Tracker */}
      {user && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 shadow-xs space-y-4">
          <h3 className="text-base font-black text-[#292333] dark:text-white">
            {isRtl ? 'متابعة طلبات انضمامي' : 'My Onboarding Applications'} ({myApplications.length})
          </h3>
          {myApplications.length === 0 ? (
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {isRtl ? 'لم تقم بتقديم أي طلب انضمام بعد.' : 'No onboarding applications submitted yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div
                  key={app.appId}
                  className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span dir="ltr" className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        {app.appId} · {app.entityType} · {app.targetRole}
                      </span>
                      <div className="text-sm font-black text-[#292333] dark:text-white">
                        {app.businessName} ({app.entityType} · {app.targetRole})
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-extrabold text-[11px] flex items-center gap-1 ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : app.status === 'needs_info'
                          ? 'bg-[#0EA5E9]/15 text-[#0369A1] dark:text-[#A34FE8]'
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-[#62339A]/15 text-[#62339A] dark:text-[#A34FE8]'
                      }`}
                    >
                      {app.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {app.status === 'needs_info' && <AlertCircle className="w-3.5 h-3.5" />}
                      {app.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      {app.status === 'pending_review' && <Clock className="w-3.5 h-3.5" />}
                      <span>{app.status}</span>
                    </span>
                  </div>

                  {app.adminComment && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-slate-200">
                      <span className="font-bold text-[#62339A] dark:text-[#A34FE8]">
                        {isRtl ? 'رد الإدارة: ' : 'Admin Note: '}
                      </span>
                      {app.adminComment}
                    </div>
                  )}

                  {app.status === 'needs_info' && (
                    <div className="pt-2 space-y-2">
                      {editingAppId === app.appId ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={resubmitNote}
                            onChange={(e) => setResubmitNote(e.target.value)}
                            placeholder={isRtl ? 'أضف البيانات المستكملة...' : 'Add requested details...'}
                            className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                          />
                          <button
                            type="button"
                            onClick={() => handleResubmit(app)}
                            disabled={submitting}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#62339A] text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'إعادة الإرسال' : 'Resubmit'}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingAppId(app.appId)}
                          className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#0EA5E9] text-white font-black cursor-pointer"
                        >
                          {isRtl ? 'استكمال البيانات المطلوبة' : 'Provide Requested Info'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
