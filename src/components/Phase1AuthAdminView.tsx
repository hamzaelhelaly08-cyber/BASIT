import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  Eye,
  EyeOff,
  ClipboardCheck,
  Activity,
  Lock,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Globe,
  Languages,
  Info,
  Handshake,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Crown,
  Store,
  Factory,
  ChefHat,
  Truck,
  KeyRound,
} from 'lucide-react';
import { Service3DIcon } from './Service3DIcon';
import { BasitBrandMark } from './BasitBrandMark';
import { OwnerCmsStudioPanel } from './OwnerCmsStudioPanel';
import { FinancialPortalView } from './FinancialPortalView';
import type { OtpCustomerSession } from './Phase1LoginView';
import { TenantManagerWorkspacePanel } from './fayd/RbacControlAndTenantPanel';
import { CANONICAL_ROLE_META } from '../types/rbac';
import {
  CountryCode,
  LanguageCode,
  PHASE1_AUDIT_REPORT,
  PHASE1_I18N,
  PHASE1_ROLES,
  RoleScope,
  SUPPORTED_COUNTRIES,
  VODAFONE_CASH_NUMBER,
} from '../data/phase1Data';
import type {
  BenefitBookingDoc,
  PlatformSettingsDoc,
  VipDirectOrderDoc,
} from '../types/faydEcosystem';
import { OfficialCountryFlag } from './OfficialCountryFlags';
import { Phase1RfqSubmission } from './Phase1ServicesHub';

export interface Phase1ActivityItem {
  id: string;
  actionAr: string;
  actionEn: string;
  actorRole: RoleScope;
  timestamp: string;
}

export type UnifiedSubmoduleKey =
  | 'departments'
  | 'haccp'
  | 'catering_finance'
  | 'financial_cost_control'
  | 'habe_german'
  | 'client_portal'
  | 'legal_paperwork';

interface Phase1AuthAdminViewProps {
  lang: LanguageCode;
  country: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  role: RoleScope;
  onChangeRole: (role: RoleScope) => void;
  rfqSubmissions: Phase1RfqSubmission[];
  onUpdateRfqStatus: (id: string, status: Phase1RfqSubmission['status']) => void;
  activityLog: Phase1ActivityItem[];
  onLogAccountRegistration: (type: 'individual' | 'corporate', label: string) => void;
  onOpenSubmodule: (key: UnifiedSubmoduleKey) => void;
  onOpenFaydEcosystem?: () => void;
  onBackHome: () => void;
  // Extended Account & Owner Live CMS Props
  isAuthenticated?: boolean;
  userDisplayName?: string;
  userEmail?: string;
  isOwnerAdmin?: boolean;
  isStrictAppOwner?: boolean;
  isServerOwner?: boolean;
  isFinanceAdmin?: boolean;
  canManageAdminControls?: boolean;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  onToggleLang?: () => void;
  onOpenPrintReport?: () => void;
  onOpenOwnerExecutiveFinance?: () => void;
  onAddAuditLog?: (actionAr: string, actionEn: string, details: string) => void;
  platformSettings?: PlatformSettingsDoc;
  allVipOrders?: VipDirectOrderDoc[];
  allBenefitBookings?: BenefitBookingDoc[];
  firebaseUser?: User | null;
  otpSession?: OtpCustomerSession | null;
  onShowToast?: (msg: string) => void;
  onNavigateSection?: (sec: string) => void;
}

const DEFAULT_SETTINGS_FALLBACK: PlatformSettingsDoc = {
  settingId: 'global',
  autoActivateCustomers: true,
  requireAdminApprovalForPartners: true,
  defaultLanguage: 'ar',
  defaultCountryCode: 'EG',
  enabledCountriesCsv: 'EG',
  updatedByUid: '',
  updatedAt: undefined,
};

export const Phase1AuthAdminView: React.FC<Phase1AuthAdminViewProps> = ({
  lang,
  country,
  onSelectCountry,
  role,
  onChangeRole,
  rfqSubmissions,
  onUpdateRfqStatus,
  activityLog,
  onLogAccountRegistration,
  onOpenSubmodule,
  onOpenFaydEcosystem,
  onBackHome,
  isAuthenticated = false,
  userDisplayName,
  userEmail,
  isOwnerAdmin = false,
  isStrictAppOwner = false,
  isServerOwner = false,
  isFinanceAdmin = false,
  canManageAdminControls = false,
  onGoogleSignIn,
  onSignOut,
  onToggleLang,
  onOpenPrintReport,
  onOpenOwnerExecutiveFinance,
  onAddAuditLog,
  platformSettings,
  allVipOrders = [],
  allBenefitBookings = [],
  firebaseUser = null,
  otpSession = null,
  onShowToast,
  onNavigateSection,
}) => {
  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const RowArrowIcon = isRtl ? ChevronLeft : ChevronRight;
  const selectedCountryObj =
    SUPPORTED_COUNTRIES.find((c) => c.code === country) || SUPPORTED_COUNTRIES[0];
  const currentRoleObj =
    PHASE1_ROLES.find((r) => r.id === role) || PHASE1_ROLES[0];

  // Interactive tap-row accordions for clean mobile "حسابي" screen
  const [openRow, setOpenRow] = useState<'country' | 'about' | 'join' | null>(null);
  const [showOpsAndRbac, setShowOpsAndRbac] = useState<boolean>(false);

  const [accountTab, setAccountTab] = useState<'individual' | 'corporate'>('individual');
  const [showPass, setShowPass] = useState(false);

  const [indName, setIndName] = useState('');
  const [indPhone, setIndPhone] = useState('');
  const [indPass, setIndPass] = useState('');
  const [indMsg, setIndMsg] = useState<string | null>(null);

  const [corpName, setCorpName] = useState('');
  const [corpContact, setCorpContact] = useState('');
  const [corpTitle, setCorpTitle] = useState('');
  const [corpPhone, setCorpPhone] = useState('');
  const [corpEmail, setCorpEmail] = useState('');
  const [corpSector, setCorpSector] = useState('مصانع وخطوط إنتاج');
  const [corpMsg, setCorpMsg] = useState<string | null>(null);

  const handleIndividualRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indPhone.trim() || !indPass.trim()) return;
    onChangeRole('individual');
    onLogAccountRegistration(
      'individual',
      `${indName || 'مستخدم أفراد'} (${selectedCountryObj.dialCode} ${indPhone})`
    );
    setIndMsg(
      isRtl
        ? 'تم تسجيل جلسة الأفراد. للتفعيل السحابي الكامل وربط Firestore يرجى الدخول بحساب Google من بوابة BASIT | باسط.'
        : 'Individual session recorded. For full Firestore account provisioning, sign in via Google inside the BASIT | باسط Portal.'
    );
  };

  const handleCorporateRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corpName.trim() || !corpContact.trim() || !corpPhone.trim()) return;
    onLogAccountRegistration('corporate', `${corpName} — ${corpContact}`);
    setCorpMsg(
      isRtl
        ? 'تم تسجيل طلب فتح حساب المنشأة بحالة "بانتظار اعتماد الإدارة". لا يتم منح تفعيل تعاقدي تلقائي قبل المراجعة.'
        : 'Corporate account recorded with status "Awaiting Admin Approval".'
    );
    setCorpName('');
    setCorpContact('');
    setCorpTitle('');
    setCorpPhone('');
    setCorpEmail('');
  };

  const handlePartnerQuickOpen = () => {
    if (onNavigateSection) {
      onNavigateSection('fayd_onboarding');
    } else if (onOpenFaydEcosystem) {
      onOpenFaydEcosystem();
    }
  };

  const unifiedSystems: {
    key: UnifiedSubmoduleKey;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    iconKey: string;
  }[] = [
    {
      key: 'catering_finance',
      titleAr: 'النظام المحاسبي وإدارة التوريد والإعاشة (10 مؤشرات)',
      titleEn: 'B2B Catering Financial Accounting (10 Metrics)',
      descAr: 'الوجبات الموردة، الإيرادات الفعلية، المصروفات المسجلة، والذمم بدون أرقام وهمية',
      descEn: 'Live meals supplied, revenues, recorded expenses, receivables & payables',
      iconKey: 'analytics',
    },
    {
      key: 'financial_cost_control',
      titleAr: 'إدارة المالية وكوست كنترول الأغذية (أنت كسبان كام)',
      titleEn: 'Financial Management & Food Cost Control Hub',
      descAr: 'إدخال سريع للعمليات، زر العين للخصوصية، حساب Food Cost للوصفات، ومزامنة الـ Webhook',
      descEn: 'Quick entry, privacy eye toggle, recipe food cost, and store webhook sync',
      iconKey: 'calculator',
    },
    {
      key: 'departments',
      titleAr: 'الإدارات التخصصية الـ 6 للشركة',
      titleEn: '6 Specialized Company Departments',
      descAr: 'التغذية، الجودة، المعامل، الزراعة، التوريد والذكاء التشغيلي',
      descEn: 'Nutrition, Quality, Labs, Agri, Supply & Ops Intelligence',
      iconKey: 'layers',
    },
    {
      key: 'haccp',
      titleAr: 'منظومة الجودة وسلامة الغذاء HACCP',
      titleEn: 'HACCP & Food Safety Hub',
      descAr: 'فحوصات المطابخ ودرجات الحرارة والتتبع الغذائي',
      descEn: 'Kitchen inspections, thermal audits & safety compliance',
      iconKey: 'shield',
    },
    {
      key: 'habe_german',
      titleAr: 'بوابة كافيتريا Ha-Be (الأسمنت الألماني)',
      titleEn: 'Ha-Be Employee Market Portal',
      descAr: 'نظام موظفي المصنع لطلبات الكافيتريا والوجبات اليومية',
      descEn: 'Factory employee F&B ordering market module',
      iconKey: 'business',
    },
    {
      key: 'client_portal',
      titleAr: 'بوابات المنشآت والعملاء المتعاقدين',
      titleEn: 'Contracted Client Portals',
      descAr: 'متابعة التعاقدات القائمة ومؤشرات التزام المواقع',
      descEn: 'Existing corporate sites & service compliance view',
      iconKey: 'file',
    },
    {
      key: 'legal_paperwork',
      titleAr: 'أرشيف الأوراق الرسمية والتعريفية للشركة',
      titleEn: 'Official Company Dossier & Certificates',
      descAr: 'السجل التجاري، البطاقة الضريبية، التصدير وشعار التعبئة',
      descEn: 'Commercial registry, tax card, exporter ID & packaging badge',
      iconKey: 'scale',
    },
  ];

  const partnerCards = [
    {
      id: 'merchant',
      titleAr: 'تاجر ومطعم',
      titleEn: 'Merchant & Restaurant',
      descAr: 'اعرض منتجاتك وقوائم الطعام في سوق باسط',
      icon: Store,
    },
    {
      id: 'factory',
      titleAr: 'مورد / مصنع',
      titleEn: 'Factory / Contracted Entity',
      descAr: 'أدر وجبات الموظفين ومزايا الـ 10% بعزل كامل',
      icon: Factory,
    },
    {
      id: 'kitchen',
      titleAr: 'مطبخ مركزي',
      titleEn: 'Central Kitchen',
      descAr: 'استقبل طلبات التوريد وعروض الأسعار A4',
      icon: ChefHat,
    },
    {
      id: 'courier',
      titleAr: 'مندوب توصيل',
      titleEn: 'Delivery Courier',
      descAr: 'نفّذ رحلات التوصيل وتابع محفظتك المباشرة',
      icon: Truck,
    },
  ];

  const isPlatformAdminUser =
    canManageAdminControls ||
    otpSession?.canonicalRole === 'platform_admin' ||
    otpSession?.canonicalRole === 'super_admin';
  const isStrictFinanceIsolated = isFinanceAdmin && !isOwnerAdmin && !isPlatformAdminUser;

  if (isStrictFinanceIsolated) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="basit-glass-pill inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
          >
            <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            <span>{t.nav.home}</span>
          </button>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="basit-glass-pill px-4 py-2 rounded-full hover:border-rose-500 text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          )}
        </div>

        <FinancialPortalView
          isRtl={isRtl}
          readOnly={false}
          canManageFinance={Boolean(isFinanceAdmin || isOwnerAdmin || isServerOwner || isPlatformAdminUser)}
          onOpenPrintReport={() => onOpenPrintReport?.()}
          onAddAuditLog={(aAr, aEn, det) => onAddAuditLog?.(aAr, aEn, det)}
          onShowToast={(msg) => onShowToast?.(msg)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="basit-glass-pill inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
          <span>{t.nav.home}</span>
        </button>

        {onOpenFaydEcosystem && (
          <button
            type="button"
            onClick={onOpenFaydEcosystem}
            className="basit-glass-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-black cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-[#A34FE8]" />
            <span>
              {isRtl ? 'بوابات المنظومة والأعمال (BASIT)' : 'BASIT Ecosystem Portal'}
            </span>
          </button>
        )}
      </div>

      {/* MOBILE-FIRST LIQUID GLASS "حسابي" ACCOUNT CARD */}
      <section className="rounded-3xl basit-liquid-glass overflow-hidden">
        <div className="p-6 sm:p-8 text-center flex flex-col items-center space-y-4 border-b border-white/30 dark:border-[#62339A]/25">
          <BasitBrandMark size="lg" isRtl={isRtl} />

          <div className="space-y-1.5 max-w-lg">
            <h1 className="text-lg sm:text-xl font-black text-[#292333] dark:text-white leading-snug">
              {isRtl
                ? 'كل اللي تحتاجه في تطبيق واحد من كاترنج مصر والوطنية اللوجستية'
                : 'Everything you need in one app from Catering Egypt & National Logistics'}
            </h1>
            <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
              {isRtl
                ? 'المطاعم، السبا والترفيه، مزايا العاملين، وإدارة التعاقدات والفواتير في حساب واحد.'
                : 'Dining, wellness, employee perks, and enterprise invoicing in one unified account.'}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="w-full max-w-md p-4 rounded-2xl basit-glass-tile flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-black text-[#292333] dark:text-white truncate">
                    {userDisplayName || (isRtl ? 'مستخدم مسجل' : 'Signed In User')}
                  </span>
                  {isOwnerAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black shadow-xs">
                      <Crown className="w-3 h-3 text-[#62339A]" />
                      <span>{isRtl ? 'مدير النظام الأعلى' : 'Super Admin'}</span>
                    </span>
                  )}
                  {!isOwnerAdmin && otpSession?.canonicalRole && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#62339A] text-white text-[10px] font-black shadow-xs">
                      <span>
                        {isRtl
                          ? CANONICAL_ROLE_META[otpSession.canonicalRole]?.labelAr
                          : CANONICAL_ROLE_META[otpSession.canonicalRole]?.labelEn}
                      </span>
                    </span>
                  )}
                </div>
                {userEmail && (
                  <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] truncate" dir="ltr">
                    {userEmail}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {otpSession && onNavigateSection && (
                  <button
                    type="button"
                    onClick={() => onNavigateSection('login')}
                    className="basit-glass-pill min-h-[44px] px-3.5 py-2 rounded-full hover:border-[#62339A] text-xs font-black text-[#62339A] dark:text-[#FFC928] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تغيير كلمة المرور' : 'Change Password'}</span>
                  </button>
                )}
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="basit-glass-pill min-h-[44px] px-4 py-2 rounded-full hover:border-rose-500 text-xs font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onGoogleSignIn?.()}
                className="w-full py-3.5 px-6 rounded-full basit-glass-btn-primary text-white text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#A34FE8]" />
                <span>{isRtl ? 'تسجيل الدخول أو إنشاء حساب عبر Google' : 'Sign In / Create Account with Google'}</span>
              </button>
              {onNavigateSection && (
                <button
                  type="button"
                  onClick={() => onNavigateSection('login')}
                  className="w-full py-2.5 px-5 rounded-full basit-glass-pill text-xs font-black text-[#62339A] dark:text-[#A34FE8] cursor-pointer"
                >
                  {isRtl ? 'أو الدخول عبر البريد الإلكتروني (OTP)' : 'Or Sign In via Email OTP'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Clean Tap Rows: الدولة / اللغة / أعرف أكثر / انضم كـ... */}
        <div className="divide-y divide-white/30 dark:divide-[#62339A]/25">
          {/* Row 1: الدولة */}
          <div>
            <button
              type="button"
              onClick={() => setOpenRow((r) => (r === 'country' ? null : 'country'))}
              className="w-full min-h-[60px] px-5 sm:px-6 flex items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-[#292333]/55 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl basit-glass-icon-halo text-[#62339A] dark:text-[#A34FE8] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-sm font-black text-[#292333] dark:text-white">
                  {isRtl ? 'الدولة' : 'Country'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <OfficialCountryFlag country={selectedCountryObj.code} className="w-5 h-3.5" />
                <span className="text-xs font-extrabold text-[#64748B] dark:text-[#94A3B8]">
                  {isRtl ? selectedCountryObj.nameAr : selectedCountryObj.nameEn}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#62339A] dark:text-[#A34FE8] transition-transform ${
                    openRow === 'country' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {openRow === 'country' && (
              <div className="px-5 pb-4 pt-2 flex flex-wrap gap-2 bg-white/35 dark:bg-[#292333]/45">
                {SUPPORTED_COUNTRIES.map((c) => {
                  const active = c.code === country;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onSelectCountry(c.code);
                        setOpenRow(null);
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                        active
                          ? 'basit-glass-btn-primary text-white'
                          : 'basit-glass-pill text-[#292333] dark:text-white'
                      }`}
                    >
                      <OfficialCountryFlag country={c.code} className="w-5 h-3.5" />
                      <span>{isRtl ? c.nameAr : c.nameEn}</span>
                      <span className="font-mono text-[10px] opacity-80" dir="ltr">
                        {c.currencyEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Row 2: اللغة */}
          <button
            type="button"
            onClick={() => onToggleLang?.()}
            className="w-full min-h-[60px] px-5 sm:px-6 flex items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-[#292333]/55 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl basit-glass-icon-halo text-[#62339A] dark:text-[#A34FE8] flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5" />
              </div>
              <span className="text-sm font-black text-[#292333] dark:text-white">
                {isRtl ? 'اللغة' : 'Language'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full basit-glass-tile text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
                {isRtl ? 'العربية (التبديل إلى EN)' : 'English (Switch to عربي)'}
              </span>
              <RowArrowIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            </div>
          </button>

          {/* Row 3: أعرف أكثر */}
          <div>
            <button
              type="button"
              onClick={() => setOpenRow((r) => (r === 'about' ? null : 'about'))}
              className="w-full min-h-[60px] px-5 sm:px-6 flex items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-[#292333]/55 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl basit-glass-icon-halo text-[#62339A] dark:text-[#A34FE8] flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <span className="text-sm font-black text-[#292333] dark:text-white">
                  {isRtl ? 'أعرف أكثر' : 'Learn More'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#62339A] dark:text-[#A34FE8] transition-transform ${
                  openRow === 'about' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openRow === 'about' && (
              <div className="px-5 pb-5 pt-2 bg-white/35 dark:bg-[#292333]/45 text-xs space-y-2 text-[#292333] dark:text-[#E2E8F0]">
                <p className="font-bold leading-relaxed">
                  {isRtl
                    ? 'منظومة BASIT | باسط هي البوابة الرقمية الموحدة لكاترنج مصر والشركة الوطنية اللوجستية: تشمل المطابخ المركزية، مطاعم ومرافق مول العين، كوبونات الموظفين (10%)، الترفيه والسبا، والخدمات اللوجستية المكملة.'
                    : 'BASIT | باسط is the unified digital ecosystem of Catering Egypt & National Logistics: covering central kitchens, Al Ain dining & leisure, employee perks (10%), and B2B logistics.'}
                </p>
                <div className="flex flex-wrap gap-3 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] pt-1">
                  <span>سجل تجاري: <strong className="font-mono text-[#62339A] dark:text-[#A34FE8]">19132</strong></span>
                  <span>البطاقة الضريبية: <strong className="font-mono text-[#62339A] dark:text-[#A34FE8]">725-995-758</strong></span>
                  <span>فودافون كاش المعتمد: <strong className="font-mono text-[#62339A] dark:text-[#A34FE8]" dir="ltr">{VODAFONE_CASH_NUMBER}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Row 4: انضم كـ... */}
          <div>
            <button
              type="button"
              onClick={() => setOpenRow((r) => (r === 'join' ? null : 'join'))}
              className="w-full min-h-[60px] px-5 sm:px-6 flex items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-[#292333]/55 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl basit-glass-icon-halo text-[#62339A] dark:text-[#A34FE8] flex items-center justify-center shrink-0">
                  <Handshake className="w-5 h-5" />
                </div>
                <span className="text-sm font-black text-[#292333] dark:text-white">
                  {isRtl ? 'انضم كـ...' : 'Join As Partner...'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#62339A] dark:text-[#A34FE8] transition-transform ${
                  openRow === 'join' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openRow === 'join' && (
              <div className="p-4 bg-white/35 dark:bg-[#292333]/45 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {partnerCards.map((pc) => {
                  const Icon = pc.icon;
                  return (
                    <button
                      key={pc.id}
                      type="button"
                      onClick={handlePartnerQuickOpen}
                      className="p-4 rounded-2xl basit-glass-tile hover:border-[#62339A] text-start space-y-2 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl basit-glass-icon-halo bg-[#62339A] text-[#A34FE8] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-black text-[#292333] dark:text-white">
                        {isRtl ? pc.titleAr : pc.titleEn}
                      </div>
                      <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {pc.descAr}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ISOLATED ENTITY / CENTRAL KITCHEN WORKSPACE */}
      {otpSession?.tenantId && (
        <TenantManagerWorkspacePanel
          isRtl={isRtl}
          tenantId={otpSession.tenantId}
          canonicalRole={otpSession.canonicalRole}
          userPermissions={otpSession.permissions}
          onShowToast={onShowToast || (() => {})}
        />
      )}

      {/* EXCLUSIVE APP OWNER EXECUTIVE FINANCIAL PLATFORM */}
      {isStrictAppOwner && onOpenOwnerExecutiveFinance && (
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#111C3A] to-[#161F33] border-2 border-[#D4AF37]/70 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5D061] text-[#0B132B] flex items-center justify-center shrink-0 shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F5D061] text-[10px] font-black">
                <Crown className="w-3 h-3" />
                <span>{isRtl ? 'مقصور على مالك التطبيق فقط' : 'STRICTLY APP OWNER ONLY'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {isRtl ? 'المنصة المالية الخاصة بالمالك — 2FA & AI Investor' : 'Owner Executive Financial Platform — 2FA & AI Investor'}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {isRtl
                  ? 'صافي الأرصدة (بنوك/محافظ/خزينة)، الداخل بخصم العمولات، الخارج، الذمم، تحليل المصروفات، والمستثمر الذكي AI.'
                  : 'Banks, E-Wallets, Treasury, Inflows with separated commissions, Outflows, Receivables/Payables, and AI Investor.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenOwnerExecutiveFinance}
            className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-105 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>{isRtl ? 'دخول المنصة المالية الخاصة بالمالك' : 'Open Owner Finance Dashboard'}</span>
          </button>
        </section>
      )}

      {/* OWNER / PLATFORM ADMIN LIVE CMS & 10-ROLE RBAC GOVERNANCE */}
      {(isOwnerAdmin || isServerOwner || isPlatformAdminUser) && (
        <OwnerCmsStudioPanel
          firebaseUser={firebaseUser}
          platformSettings={platformSettings || DEFAULT_SETTINGS_FALLBACK}
          allVipOrders={allVipOrders}
          allBenefitBookings={allBenefitBookings}
          onShowToast={onShowToast || (() => {})}
          isRtl={isRtl}
          isServerOwner={isServerOwner}
          isPlatformAdmin={isPlatformAdminUser}
        />
      )}

      {/* COLLAPSIBLE ENTERPRISE TOOLS & RBAC DRAWER BAR */}
      <div className="rounded-3xl basit-liquid-glass p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-[#292333] dark:text-white">
            {isRtl ? 'الوحدات التشغيلية المدمجة وسجل الجلسة وصلاحيات الإدارة' : 'Integrated Operational Modules, RBAC & Session Audit'}
          </h2>
          <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            {isRtl
              ? 'النظام المحاسبي المالي للتوريد والإعاشة، معايير HACCP، كافيتريا Ha-Be، عروض الأسعار، وتبديل الأدوار.'
              : 'B2B Catering Financial Accounting, HACCP, Ha-Be market, RFQ review queue, and RBAC.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowOpsAndRbac((p) => !p)}
          className="px-5 py-2.5 rounded-full basit-glass-btn-primary text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
        >
          <span>{showOpsAndRbac ? (isRtl ? 'إخفاء الوحدات المتقدمة' : 'Hide Advanced') : isRtl ? 'فتح الوحدات والصلاحيات' : 'Open Modules & RBAC'}</span>
          <ChevronDown className={`w-4 h-4 text-[#A34FE8] transition-transform ${showOpsAndRbac ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Unified Internal Systems Hub */}
      <section className="p-5 sm:p-6 rounded-3xl basit-liquid-glass space-y-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#62339A] dark:text-[#A34FE8]">
            {isRtl ? 'منظومة BASIT | باسط الموحدة داخل التطبيق' : 'Unified Platform Subsystems'}
          </span>
          <h2 className="text-base sm:text-lg font-black text-[#292333] dark:text-white mt-0.5">
            {isRtl
              ? 'الوحدات التشغيلية والتقارير المدمجة'
              : 'Integrated Operational Systems'}
          </h2>
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            {isRtl
              ? 'جميع الأنظمة تفتح داخل نفس واجهة التطبيق الموحدة مع زر رجوع مباشر.'
              : 'All systems open directly inside the unified app shell with consistent navigation and back controls.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {unifiedSystems
            .filter((sys) => sys.key !== 'financial_cost_control' || isStrictAppOwner)
            .map((sys) => (
            <button
              key={sys.key}
              type="button"
              onClick={() => onOpenSubmodule(sys.key)}
              className="group p-4 rounded-2xl basit-glass-tile hover:border-[#62339A] text-start flex items-start gap-3.5 transition-all cursor-pointer"
            >
              <Service3DIcon iconKey={sys.iconKey} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-black text-[#292333] dark:text-white truncate group-hover:text-[#62339A] dark:group-hover:text-[#A34FE8]">
                    {isRtl ? sys.titleAr : sys.titleEn}
                  </h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#62339A] shrink-0" />
                </div>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  {isRtl ? sys.descAr : sys.descEn}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* RBAC Role Switcher & Enterprise Tracks */}
      {(showOpsAndRbac || rfqSubmissions.length > 0) && (
        <>
          <section className="p-5 sm:p-6 rounded-3xl basit-liquid-glass space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#62339A] dark:text-[#A34FE8]" />
                <h3 className="text-base font-black text-[#292333] dark:text-white">
                  {t.roleSwitcherLabel}
                </h3>
              </div>
              <span className="px-3.5 py-1 rounded-full basit-glass-tile text-xs font-extrabold text-[#62339A] dark:text-[#A34FE8]">
                {isRtl ? currentRoleObj.nameAr : currentRoleObj.nameEn}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {PHASE1_ROLES.map((r) => {
                const active = r.id === role;
                const isRestrictedAdminRole = r.id === 'kitchen_manager' || r.id === 'system_admin';
                const locked = isRestrictedAdminRole && !canManageAdminControls;
                return (
                  <button
                    key={r.id}
                    type="button"
                    aria-disabled={locked}
                    onClick={() => {
                      if (locked) {
                        onShowToast?.(
                          isRtl
                            ? 'دور الإدارة مقصور فقط على المالك أو المديرين المعينين عبر Google.'
                            : 'Admin roles are restricted to Platform Owner or designated admins.'
                        );
                        return;
                      }
                      onChangeRole(r.id);
                    }}
                    className={`p-3.5 rounded-2xl text-start transition-all ${
                      locked
                        ? 'opacity-65 cursor-not-allowed bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/20 text-[#64748B]'
                        : active
                        ? 'basit-glass-btn-primary text-white cursor-pointer'
                        : 'basit-glass-tile text-[#292333] dark:text-white hover:border-[#62339A] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-xs font-black">
                      <span>{isRtl ? r.nameAr : r.nameEn}</span>
                      {locked && <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                    </div>
                    <ul
                      className={`mt-2 space-y-1 text-[10px] font-semibold ${
                        active ? 'text-[#A34FE8]' : 'text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      {(isRtl ? r.permissionsAr : r.permissionsEn).map((p, idx) => (
                        <li key={idx}>• {p}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            {!canManageAdminControls && (
              <div className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-[#292333] dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8] shrink-0" />
                  <span>
                    {isRtl
                      ? 'لا يمكن للزوار أو العملاء التبديل لأدوار الإدارة. يتطلب حساب مالك أو مدير معيّن عبر Google.'
                      : 'Visitors cannot escalate to Admin roles. Verified Owner/Designated Admin Google account required.'}
                  </span>
                </div>
                {!isAuthenticated && onGoogleSignIn && (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="px-3 py-1.5 rounded-full bg-[#62339A] text-white text-[11px] font-black cursor-pointer"
                  >
                    {isRtl ? 'تسجيل دخول Google' : 'Google Sign In'}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Account Registration / Login Tracks */}
          <section className="p-5 sm:p-6 rounded-3xl basit-liquid-glass space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/30 dark:border-[#62339A]/25 pb-3">
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl
                  ? 'مسارات تسجيل ودخول العملاء والشركات والمصانع'
                  : 'Individual & Corporate Account Sign-In / Registration'}
              </h3>

              <div className="flex items-center gap-1.5 basit-glass-pill p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setAccountTab('individual')}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    accountTab === 'individual'
                      ? 'basit-glass-btn-primary text-white'
                      : 'text-[#292333] dark:text-[#94A3B8]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'حساب الأفراد' : 'Individual'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountTab('corporate')}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    accountTab === 'corporate'
                      ? 'basit-glass-btn-primary text-white'
                      : 'text-[#292333] dark:text-[#94A3B8]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'حساب الشركات والمصانع' : 'Corporate'}</span>
                </button>
              </div>
            </div>

            {accountTab === 'individual' ? (
              <form onSubmit={handleIndividualRegister} className="space-y-4">
                {indMsg && (
                  <div className="p-3.5 rounded-2xl bg-[#A34FE8]/20 dark:bg-[#A34FE8]/15 border border-[#A34FE8] text-xs font-bold text-[#292333] dark:text-[#A34FE8]">
                    {indMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                      {isRtl ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={indName}
                      onChange={(e) => setIndName(e.target.value)}
                      placeholder={isRtl ? 'الاسم ثلاثي' : 'Your full name'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                      {isRtl ? 'الدولة ورقم الهاتف *' : 'Country & Mobile *'}
                    </label>
                    <div className="flex items-center rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 focus-within:border-[#62339A] overflow-hidden">
                      <select
                        value={country}
                        onChange={(e) => onSelectCountry(e.target.value as CountryCode)}
                        className="px-2 py-2.5 bg-[#F7F5FA] dark:bg-[#1E293B] border-e border-[#E2E8F0] dark:border-[#62339A]/30 text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
                      >
                        {SUPPORTED_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.dialCode} ({c.code})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={indPhone}
                        onChange={(e) => setIndPhone(e.target.value)}
                        placeholder="10XXXXXXXX"
                        className="flex-1 px-3 py-2.5 text-xs text-[#292333] dark:text-white bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#292333] dark:text-slate-200">
                      {isRtl ? 'كلمة المرور *' : 'Password *'}
                    </label>
                    <div className="flex items-center rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 focus-within:border-[#62339A] px-3">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={indPass}
                        onChange={(e) => setIndPass(e.target.value)}
                        placeholder="••••••••"
                        className="flex-1 py-2.5 text-xs text-[#292333] dark:text-white bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="text-[#64748B] hover:text-[#62339A] cursor-pointer"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    <OfficialCountryFlag country={selectedCountryObj.code} className="w-5 h-3.5" />
                    <span>
                      {isRtl
                        ? 'التوثيق السحابي الفعلي يتم عبر Google/Firebase لضمان حفظ الجلسات والإشعارات.'
                        : 'Verified cloud login uses Google/Firebase for real-time notifications.'}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full basit-glass-btn-primary text-white text-xs font-extrabold cursor-pointer"
                  >
                    {isRtl ? 'تسجيل / دخول كحساب أفراد' : 'Continue as Individual'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCorporateRegister} className="space-y-4">
                {corpMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {corpMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    value={corpName}
                    onChange={(e) => setCorpName(e.target.value)}
                    placeholder={isRtl ? 'اسم الشركة أو المصنع *' : 'Company / Factory Name *'}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={corpContact}
                    onChange={(e) => setCorpContact(e.target.value)}
                    placeholder={isRtl ? 'اسم المسؤول *' : 'Authorized Contact *'}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={corpTitle}
                    onChange={(e) => setCorpTitle(e.target.value)}
                    placeholder={isRtl ? 'المسمى الوظيفي' : 'Job Title'}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  />
                  <div className="flex items-center rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 overflow-hidden">
                    <span
                      className="px-3 py-2.5 bg-[#F7F5FA] dark:bg-[#1E293B] border-e border-[#E2E8F0] dark:border-[#62339A]/30 text-xs font-mono font-bold text-[#292333] dark:text-white"
                      dir="ltr"
                    >
                      {selectedCountryObj.dialCode}
                    </span>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={corpPhone}
                      onChange={(e) => setCorpPhone(e.target.value)}
                      placeholder="Phone *"
                      className="flex-1 px-3 py-2.5 text-xs text-[#292333] dark:text-white bg-transparent focus:outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    dir="ltr"
                    value={corpEmail}
                    onChange={(e) => setCorpEmail(e.target.value)}
                    placeholder="corporate@company.com"
                    className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  />
                  <select
                    value={corpSector}
                    onChange={(e) => setCorpSector(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  >
                    <option value="مصانع وخطوط إنتاج">{isRtl ? 'مصانع وخطوط إنتاج' : 'Factories & Production'}</option>
                    <option value="شركات إدارية وبنوك">{isRtl ? 'شركات إدارية وبنوك' : 'Corporate Offices'}</option>
                    <option value="مستشفيات ومراكز طبية">{isRtl ? 'مستشفيات ومراكز طبية' : 'Hospitals'}</option>
                    <option value="مدارس وجامعات">{isRtl ? 'مدارس وجامعات' : 'Schools & Universities'}</option>
                  </select>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full basit-glass-btn-primary text-white text-xs font-extrabold cursor-pointer"
                  >
                    {isRtl ? 'إرسال طلب فتح حساب شركات (بانتظار الاعتماد)' : 'Submit Corporate Request'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Admin Quotation Requests Review Queue */}
          <section className="p-5 sm:p-6 rounded-3xl basit-liquid-glass space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl
                  ? 'مراجعة طلبات عروض الأسعار وانضمام المطابخ'
                  : 'Quotation & Central Kitchen Applications Queue'}
              </h3>
              <span className="text-xs font-black text-[#62339A] dark:text-[#A34FE8] tabular-nums">
                {rfqSubmissions.length} {isRtl ? 'طلب' : 'requests'}
              </span>
            </div>

            {!canManageAdminControls ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl basit-glass-tile flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[#292333] dark:text-slate-200">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#62339A] dark:text-[#A34FE8] shrink-0" />
                    <span>
                      {isRtl
                        ? 'للقراءة فقط: تعديل حالات الاعتماد وعروض الأسعار مقصور حصرياً على المالك أو المديرين المعينين عبر Google.'
                        : 'Read-only: Modifying approval & RFQ statuses is strictly restricted to Platform Owner or designated Google admins.'}
                    </span>
                  </div>
                  {!isAuthenticated && onGoogleSignIn && (
                    <button
                      type="button"
                      onClick={onGoogleSignIn}
                      className="px-3.5 py-1.5 rounded-full bg-[#62339A] text-white text-[11px] font-black cursor-pointer"
                    >
                      {isRtl ? 'تسجيل الدخول للإدارة' : 'Admin Sign In'}
                    </button>
                  )}
                </div>

                {rfqSubmissions.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] dark:border-[#62339A]/30 text-[#64748B] dark:text-[#94A3B8]">
                          <th className="py-2.5 px-3 text-start">{isRtl ? 'الكود' : 'ID'}</th>
                          <th className="py-2.5 px-3 text-start">{isRtl ? 'الجهة / المطبخ' : 'Entity'}</th>
                          <th className="py-2.5 px-3 text-start">{isRtl ? 'النطاق' : 'Service'}</th>
                          <th className="py-2.5 px-3 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#62339A]/20">
                        {rfqSubmissions.map((rfq) => (
                          <tr key={rfq.id}>
                            <td className="py-2.5 px-3 font-mono font-black text-[#62339A] dark:text-[#A34FE8] whitespace-nowrap">
                              {rfq.id}
                            </td>
                            <td className="py-2.5 px-3 font-extrabold text-[#292333] dark:text-white">
                              {rfq.organizationOrKitchenName}
                            </td>
                            <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8]">
                              {rfq.serviceCategory}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                                <Lock className="w-3 h-3" />
                                <span>{rfq.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : rfqSubmissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                {isRtl
                  ? 'لا توجد طلبات مسجلة حالياً — أرسل طلباً من "طلب عرض سعر" لاختبار المراجعة.'
                  : 'No requests logged yet — submit one from Request Quotation to test.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#62339A]/30 text-[#64748B] dark:text-[#94A3B8]">
                      <th className="py-2.5 px-3 text-start">{isRtl ? 'الكود' : 'ID'}</th>
                      <th className="py-2.5 px-3 text-start">{isRtl ? 'الجهة / المطبخ' : 'Entity'}</th>
                      <th className="py-2.5 px-3 text-start">{isRtl ? 'التواصل' : 'Contact'}</th>
                      <th className="py-2.5 px-3 text-start">{isRtl ? 'النطاق' : 'Service'}</th>
                      <th className="py-2.5 px-3 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#62339A]/20">
                    {rfqSubmissions.map((rfq) => (
                      <tr key={rfq.id}>
                        <td className="py-2.5 px-3 font-mono font-black text-[#62339A] dark:text-[#A34FE8] whitespace-nowrap">
                          {rfq.id}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-[#292333] dark:text-white">
                          {rfq.organizationOrKitchenName}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8]">
                          {rfq.contactName} · <span dir="ltr">{rfq.dialCode} {rfq.phone}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8]">
                          {rfq.serviceCategory}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={rfq.status}
                            onChange={(e) =>
                              onUpdateRfqStatus(
                                rfq.id,
                                e.target.value as Phase1RfqSubmission['status']
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 text-xs font-bold text-[#62339A] dark:text-[#A34FE8] focus:outline-none"
                          >
                            <option value="جديد">جديد</option>
                            <option value="قيد المراجعة">قيد المراجعة</option>
                            <option value="بانتظار اعتماد السعر">بانتظار اعتماد السعر</option>
                            <option value="تم الاعتماد">تم الاعتماد</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Honest 7-Level Audit Report */}
          <section className="p-5 sm:p-6 rounded-3xl basit-liquid-glass space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#62339A] dark:text-[#A34FE8]" />
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl
                  ? 'تقرير جاهزية منصة BASIT | باسط (سلم التحقق من 7 مستويات)'
                  : 'BASIT | باسط Honest Readiness Audit'}
              </h3>
            </div>

            <div className="space-y-2.5">
              {PHASE1_AUDIT_REPORT.map((item) => {
                const isTested = item.status.startsWith('6.') || item.status.startsWith('7.');
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl basit-glass-tile flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-[#292333] dark:text-white">
                        {isRtl ? item.featureAr : item.featureEn}
                      </div>
                      <div className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {isRtl ? item.notesAr : item.notesEn}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap self-start sm:self-auto ${
                        isTested
                          ? 'bg-emerald-50/85 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-[#A34FE8]/25 text-[#292333] dark:text-[#A34FE8] border border-[#A34FE8]/50'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Activity Log */}
          {activityLog.length > 0 && (
            <section className="p-5 rounded-3xl basit-liquid-glass space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                <h3 className="text-sm font-black text-[#292333] dark:text-white">
                  {isRtl ? 'سجل نشاط الجلسة (Activity Log)' : 'Session Activity Log'}
                </h3>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {activityLog.slice(0, 12).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-2xl basit-glass-tile flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="font-bold text-[#292333] dark:text-slate-100">
                      {isRtl ? act.actionAr : act.actionEn}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] shrink-0">
                      {act.actorRole} · {act.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
