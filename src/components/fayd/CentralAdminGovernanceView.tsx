import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Scale,
  DollarSign,
  History,
  Lock,
  Building2,
  Save,
  Megaphone,
  CreditCard,
  Users,
  Settings,
  TestTube2,
  Ticket,
  HeartHandshake,
  MessageSquare,
  AlertTriangle,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { User } from 'firebase/auth';
import { VODAFONE_CASH_NUMBER, type CountryCode, type LanguageCode, type PaymentGatewayId } from '../../data/phase1Data';
import type {
  BenefitBookingDoc,
  CateringFeedbackDoc,
  CharityContributionDoc,
  CharityInitiativeDoc,
  CommercialOrderDoc,
  CommissionRuleDoc,
  ContractStatus,
  CourierProfileDoc,
  DeliveryRequestDoc,
  EntertainmentBenefitDoc,
  EntertainmentCategory,
  FaydOpportunityDoc,
  KaffarahOrderDoc,
  KaffarahRuleDoc,
  LedgerSettlementDoc,
  LogisticsServiceInquiryDoc,
  OfferAdDoc,
  OnboardingApplicationDoc,
  PaymentGatewayConfigDoc,
  PaymentTransactionDoc,
  PlatformSettingsDoc,
  SecurityAuditLogDoc,
  SubscriptionPlanDoc,
  TenantWorkspaceDoc,
  UserProfileDoc,
  UsufructContractDoc,
  UsufructProposalDoc,
} from '../../types/faydEcosystem';
import {
  adminApproveOnboardingApplication,
  adminAssignCourierToDelivery,
  adminDeleteCharityInitiative,
  adminDeleteEntertainmentBenefit,
  adminDeleteOfferAd,
  adminIssueUsufructContract,
  adminRecordAndSettleOrderRevenue,
  adminRecordDeliveryLedger,
  adminRejectOrNeedsInfoOnboarding,
  adminResolveCateringFeedback,
  adminReviewBenefitBooking,
  adminReviewOpportunity,
  adminSaveCommissionRules,
  adminSaveGatewayConfig,
  adminSaveKaffarahRule,
  adminSaveOfferAd,
  adminSavePlatformSettings,
  adminSaveSubscriptionPlan,
  adminSettleLedgerEntry,
  adminUpdateCustomerAccountStatus,
  adminUpdateKaffarahOrderProof,
  adminUpdateLogisticsInquiry,
  adminUpdateTenantGovernance,
  adminVerifyCharityContribution,
  recordPaymentTransaction,
  runTenantIsolationSelfCheck,
  saveCharityInitiative,
  saveEntertainmentBenefit,
  updatePaymentTransactionStatus,
} from '../../services/faydFirestoreService';
import {
  extractContractDates,
  embedContractDates,
  getContractExpiryState,
} from '../../utils/contractDates';
import { AuditLogDrawer } from '../AuditLogDrawer';
import { INITIAL_AUDIT_LOGS } from '../../data/mockOperationalData';
import type { AuditLogEntry } from '../../types/dashboard';

interface ProviderReadinessItem {
  providerId: PaymentGatewayId;
  displayName: string;
  countries: string[];
  sandboxReady: boolean;
  liveConfigured: boolean;
  missingEnvVars: string[];
}

interface CentralAdminGovernanceViewProps {
  lang: LanguageCode;
  user: User | null;
  isAdmin: boolean;
  onRequireSignIn: () => void;
  allApplications: OnboardingApplicationDoc[];
  allUsers?: UserProfileDoc[];
  allTenants: TenantWorkspaceDoc[];
  allCouriers: CourierProfileDoc[];
  allDeliveries: DeliveryRequestDoc[];
  allOrders: CommercialOrderDoc[];
  allOpportunities: FaydOpportunityDoc[];
  allProposals: UsufructProposalDoc[];
  allContracts: UsufructContractDoc[];
  allOffersAds?: OfferAdDoc[];
  allPaymentTransactions?: PaymentTransactionDoc[];
  gatewayConfigs?: PaymentGatewayConfigDoc[];
  platformSettings?: PlatformSettingsDoc;
  subscriptionPlans: SubscriptionPlanDoc[];
  commissionRule: CommissionRuleDoc;
  allLedgerEntries: LedgerSettlementDoc[];
  auditLogs: SecurityAuditLogDoc[];
  allEntertainmentBenefits?: EntertainmentBenefitDoc[];
  allBenefitBookings?: BenefitBookingDoc[];
  allCharityInitiatives?: CharityInitiativeDoc[];
  allCharityContributions?: CharityContributionDoc[];
  kaffarahRule?: KaffarahRuleDoc | null;
  allKaffarahOrders?: KaffarahOrderDoc[];
  allLogisticsInquiries?: LogisticsServiceInquiryDoc[];
  allCateringFeedback?: CateringFeedbackDoc[];
  onToast: (msg: string) => void;
}

export const CentralAdminGovernanceView: React.FC<CentralAdminGovernanceViewProps> = ({
  lang,
  user,
  isAdmin,
  onRequireSignIn,
  allApplications,
  allUsers = [],
  allTenants,
  allCouriers,
  allDeliveries,
  allOrders,
  allOpportunities,
  allProposals,
  allContracts,
  allOffersAds = [],
  allPaymentTransactions = [],
  gatewayConfigs = [],
  platformSettings,
  subscriptionPlans,
  commissionRule,
  allLedgerEntries,
  auditLogs,
  allEntertainmentBenefits = [],
  allBenefitBookings = [],
  allCharityInitiatives = [],
  allCharityContributions = [],
  kaffarahRule = null,
  allKaffarahOrders = [],
  allLogisticsInquiries = [],
  allCateringFeedback = [],
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [adminTab, setAdminTab] = useState<
    | 'approvals'
    | 'partners_delivery'
    | 'benefits_ops'
    | 'charity_kaffarah'
    | 'inquiries_feedback'
    | 'usufruct'
    | 'offers_ads'
    | 'payments_settings'
    | 'revenue_engine'
    | 'audit'
  >('approvals');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'pending_review' | 'needs_info' | 'approved' | 'rejected'>('all');
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Commission Engine Form State
  const [orderCommPct, setOrderCommPct] = useState(commissionRule.defaultOrderCommissionPct);
  const [deliveryPlatPct, setDeliveryPlatPct] = useState(commissionRule.defaultDeliveryPlatformPct);
  const [usufructPlatPct, setUsufructPlatPct] = useState(commissionRule.defaultUsufructPlatformPct);
  const [minDeliveryFee, setMinDeliveryFee] = useState(commissionRule.minDeliveryFeeEGP);

  // Plan editor state
  const [editingPlanId, setEditingPlanId] = useState(subscriptionPlans[0]?.planId || 'growth');
  const currentEditingPlan =
    subscriptionPlans.find((p) => p.planId === editingPlanId) || subscriptionPlans[0];
  const [planFee, setPlanFee] = useState(String(currentEditingPlan?.monthlyFeeEGP ?? 1200));
  const [planComm, setPlanComm] = useState(String(currentEditingPlan?.orderCommissionPct ?? 8));
  const [planDisc, setPlanDisc] = useState(String(currentEditingPlan?.deliveryDiscountPct ?? 10));

  const [courierPick, setCourierPick] = useState<Record<string, string>>({});
  const [commentByApp, setCommentByApp] = useState<Record<string, string>>({});
  const [customCommByTenant, setCustomCommByTenant] = useState<Record<string, string>>({});
  const [contractStatusByTenant, setContractStatusByTenant] = useState<Record<string, ContractStatus>>({});
  const [scheduleByTenant, setScheduleByTenant] = useState<Record<string, string>>({});
  const [logoByTenant, setLogoByTenant] = useState<Record<string, string>>({});
  const [contractStartByTenant, setContractStartByTenant] = useState<Record<string, string>>({});
  const [contractEndByTenant, setContractEndByTenant] = useState<Record<string, string>>({});

  // Multi-Tenant Isolation Self Check
  const [isolationResult, setIsolationResult] = useState<{
    checkedAt: string;
    crossTenantBlocked: boolean;
    detailsAr: string;
    detailsEn: string;
  } | null>(null);

  // Offers & Ads Studio
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [adCategory, setAdCategory] = useState<'food' | 'shopping' | 'factory_merchant'>('food');
  const [adTitleAr, setAdTitleAr] = useState('');
  const [adTitleEn, setAdTitleEn] = useState('');
  const [adBadgeAr, setAdBadgeAr] = useState('عرض معتمد');
  const [adBadgeEn, setAdBadgeEn] = useState('Approved Offer');
  const [adCtaAr, setAdCtaAr] = useState('اطلب الآن');
  const [adCtaEn, setAdCtaEn] = useState('Order Now');
  const [adCountry, setAdCountry] = useState<CountryCode>('EG');
  const [adValidFrom, setAdValidFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [adValidTo, setAdValidTo] = useState('');
  const [adScope, setAdScope] = useState<'public' | 'contracted_entity' | 'employee_tier'>('public');
  const [adEligibleTenants, setAdEligibleTenants] = useState('');
  const [adTerms, setAdTerms] = useState('');

  // Entertainment Benefits Admin Form
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [benVenueName, setBenVenueName] = useState('');
  const [benCategory, setBenCategory] = useState<EntertainmentCategory>('club');
  const [benApprovedText, setBenApprovedText] = useState('');
  const [benDesc, setBenDesc] = useState('');
  const [benScope, setBenScope] = useState<'public' | 'contracted_entity' | 'employee_tier'>('employee_tier');
  const [benTenantsCsv, setBenTenantsCsv] = useState('');
  const [benValidFrom, setBenValidFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [benValidTo, setBenValidTo] = useState('');
  const [benTerms, setBenTerms] = useState('');
  const [benImageUrl, setBenImageUrl] = useState('');

  // Charity Initiatives Admin Form
  const [editingInitiativeId, setEditingInitiativeId] = useState<string | null>(null);
  const [chrTitleAr, setChrTitleAr] = useState('');
  const [chrTitleEn, setChrTitleEn] = useState('');
  const [chrEntity, setChrEntity] = useState('');
  const [chrMechanism, setChrMechanism] = useState('');
  const [chrType, setChrType] = useState('إطعام');
  const [chrGoal, setChrGoal] = useState('100');
  const [chrProofMap, setChrProofMap] = useState<Record<string, string>>({});

  // Official Kaffarah Rule Admin Form
  const [kafApproved, setKafApproved] = useState(kaffarahRule?.isOfficiallyApproved ?? false);
  const [kafAuthority, setKafAuthority] = useState(kaffarahRule?.shariaAuthorityName ?? '');
  const [kafRefCode, setKafRefCode] = useState(kaffarahRule?.referenceCode ?? '');
  const [kafUnitCost, setKafUnitCost] = useState(String(kaffarahRule?.unitCostEGP ?? 0));
  const [kafMealsCount, setKafMealsCount] = useState(String(kaffarahRule?.mealsPerKaffarah ?? 10));
  const [kafNotes, setKafNotes] = useState(kaffarahRule?.notesAr ?? '');
  const [kafProofByOrder, setKafProofByOrder] = useState<Record<string, string>>({});

  // Feedback Reply state
  const [fbReplyMap, setFbReplyMap] = useState<Record<string, string>>({});

  // Platform Settings State
  const [autoActivateCustomers, setAutoActivateCustomers] = useState(
    platformSettings?.autoActivateCustomers ?? true
  );
  const [defaultLangSetting, setDefaultLangSetting] = useState<'ar' | 'en'>(
    platformSettings?.defaultLanguage || 'ar'
  );
  const [defaultCountrySetting, setDefaultCountrySetting] = useState<CountryCode>(
    platformSettings?.defaultCountryCode || 'EG'
  );
  const [enabledCountriesCsv, setEnabledCountriesCsv] = useState(
    platformSettings?.enabledCountriesCsv || 'EG'
  );

  // Real Server Gateway Readiness & Sandbox Tester
  const [serverProviders, setServerProviders] = useState<ProviderReadinessItem[]>([]);
  const [channelReadiness, setChannelReadiness] = useState<{
    inAppFirestore: boolean;
  } | null>(null);
  const [testGatewayId, setTestGatewayId] = useState<PaymentGatewayId>('fawry');
  const [testGatewayMode, setTestGatewayMode] = useState<'sandbox' | 'live'>('sandbox');
  const [testAmount, setTestAmount] = useState('150');
  const [testIntentResult, setTestIntentResult] = useState<string | null>(null);
  const [lastCreatedIntent, setLastCreatedIntent] = useState<{
    txId: string;
    provider: PaymentGatewayId;
    mode: 'sandbox' | 'live';
    gatewayReference: string;
    hmacSignature: string;
    amount: number;
    currency: string;
  } | null>(null);

  useEffect(() => {
    setOrderCommPct(commissionRule.defaultOrderCommissionPct);
    setDeliveryPlatPct(commissionRule.defaultDeliveryPlatformPct);
    setUsufructPlatPct(commissionRule.defaultUsufructPlatformPct);
    setMinDeliveryFee(commissionRule.minDeliveryFeeEGP);
  }, [
    commissionRule.defaultOrderCommissionPct,
    commissionRule.defaultDeliveryPlatformPct,
    commissionRule.defaultUsufructPlatformPct,
    commissionRule.minDeliveryFeeEGP,
  ]);

  useEffect(() => {
    const matched = subscriptionPlans.find((p) => p.planId === editingPlanId);
    if (!matched && subscriptionPlans[0]) {
      setEditingPlanId(subscriptionPlans[0].planId);
      return;
    }
    if (matched) {
      setPlanFee(String(matched.monthlyFeeEGP));
      setPlanComm(String(matched.orderCommissionPct));
      setPlanDisc(String(matched.deliveryDiscountPct));
    }
  }, [subscriptionPlans, editingPlanId]);

  useEffect(() => {
    if (!kaffarahRule) return;
    setKafApproved(kaffarahRule.isOfficiallyApproved);
    setKafAuthority(kaffarahRule.shariaAuthorityName || '');
    setKafRefCode(kaffarahRule.referenceCode || '');
    setKafUnitCost(String(kaffarahRule.unitCostEGP ?? 0));
    setKafMealsCount(String(kaffarahRule.mealsPerKaffarah ?? 10));
    setKafNotes(kaffarahRule.notesAr || '');
  }, [
    kaffarahRule?.isOfficiallyApproved,
    kaffarahRule?.shariaAuthorityName,
    kaffarahRule?.referenceCode,
    kaffarahRule?.unitCostEGP,
    kaffarahRule?.mealsPerKaffarah,
    kaffarahRule?.notesAr,
  ]);

  useEffect(() => {
    if (!platformSettings) return;
    setAutoActivateCustomers(platformSettings.autoActivateCustomers);
    setDefaultLangSetting(platformSettings.defaultLanguage || 'ar');
    setDefaultCountrySetting(platformSettings.defaultCountryCode || 'EG');
    setEnabledCountriesCsv(platformSettings.enabledCountriesCsv || 'EG');
  }, [
    platformSettings?.autoActivateCustomers,
    platformSettings?.defaultLanguage,
    platformSettings?.defaultCountryCode,
    platformSettings?.enabledCountriesCsv,
  ]);

  useEffect(() => {
    if (adminTab !== 'payments_settings') return;
    fetch('/api/payments/providers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.gateways)) setServerProviders(data.gateways);
        if (data.notificationChannels) setChannelReadiness(data.notificationChannels);
      })
      .catch(() => {});
  }, [adminTab]);

  const filteredApplications = useMemo(() => {
    if (appStatusFilter === 'all') return allApplications;
    return allApplications.filter((a) => a.status === appStatusFilter);
  }, [allApplications, appStatusFilter]);

  const revenueChartData = useMemo(() => {
    const groups: Record<string, { category: string; platform: number; partnerNet: number }> = {
      order_commission: {
        category: isRtl ? 'عمولات الطلبات' : 'Orders',
        platform: 0,
        partnerNet: 0,
      },
      delivery_fee: {
        category: isRtl ? 'رسوم التوصيل' : 'Delivery',
        platform: 0,
        partnerNet: 0,
      },
      subscription: {
        category: isRtl ? 'الاشتراكات' : 'Subscriptions',
        platform: 0,
        partnerNet: 0,
      },
      usufruct_share: {
        category: isRtl ? 'تقنية الانتفاع' : 'Usufruct',
        platform: 0,
        partnerNet: 0,
      },
    };
    allLedgerEntries.forEach((entry) => {
      const bucket = groups[entry.sourceType];
      if (bucket) {
        bucket.platform += entry.platformRevenueEGP || 0;
        bucket.partnerNet += entry.beneficiaryNetEGP || 0;
      }
    });
    return Object.values(groups);
  }, [allLedgerEntries, isRtl]);

  const totalPlatformRevenue = allLedgerEntries.reduce(
    (sum, e) => sum + (e.platformRevenueEGP || 0),
    0
  );

  if (!user) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 text-center space-y-3">
        <Lock className="w-8 h-8 text-[#62339A] dark:text-[#A34FE8] mx-auto" />
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl ? 'لوحة الإدارة المركزية والحوكمة — BASIT | باسط' : 'BASIT | باسط Central Governance'}
        </h3>
        <button
          type="button"
          onClick={onRequireSignIn}
          className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
        >
          {isRtl ? 'تسجيل الدخول بحساب الإدارة' : 'Sign in as Central Admin'}
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-[#292333] border border-red-200 dark:border-red-900 text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl ? 'صلاحية مقصورة على الإدارة المركزية فقط' : 'Restricted to Central Governance Admins'}
        </h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
          {isRtl
            ? 'يفرض النظام وقواعد أمان Firestore عزلاً كاملاً؛ لا يمكن لغير مدير النظام الأعلى اعتماد الشركاء أو تعديل العمولات أو بوابات الدفع.'
            : 'Strict RBAC isolates administrative approvals, tenant isolation, and payment controls exclusively to Super Admin.'}
        </p>
      </div>
    );
  }

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminSaveCommissionRules(user, {
        defaultOrderCommissionPct: Number(orderCommPct),
        defaultDeliveryPlatformPct: Number(deliveryPlatPct),
        defaultCourierSharePct: 100 - Number(deliveryPlatPct),
        defaultUsufructPlatformPct: Number(usufructPlatPct),
        minDeliveryFeeEGP: Number(minDeliveryFee),
      });
      onToast(isRtl ? 'تم تحديث محرك العمولات والتسعير المركزي بنجاح.' : 'Global commission rules updated.');
    } catch (err) {
      onToast(err instanceof Error ? err.message : isRtl ? 'تعذر حفظ قواعد العمولات.' : 'Failed to save rules.');
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingPlan) return;
    try {
      await adminSaveSubscriptionPlan(user, {
        ...currentEditingPlan,
        monthlyFeeEGP: Number(planFee) || 0,
        orderCommissionPct: Number(planComm) || 0,
        deliveryDiscountPct: Number(planDisc) || 0,
      });
      onToast(isRtl ? `تم تحديث باقة ${currentEditingPlan.nameAr} بنجاح.` : 'Plan updated.');
    } catch (err) {
      onToast(err instanceof Error ? err.message : isRtl ? 'تعذر تحديث الباقة.' : 'Failed to update plan.');
    }
  };

  const [liveAuditLogs, setLiveAuditLogs] = useState<AuditLogEntry[]>(() => {
    const fromProps = (auditLogs || []).map((l) => ({
      id: l.logId,
      timestamp: l.targetCollection || 'اليوم 09:00 ص',
      userRole: 'ops_director' as const,
      userName: l.actorUid ? l.actorUid.slice(0, 10) : 'النظام',
      moduleName: l.targetId || 'الأمان المركزي',
      actionAr: l.actionAr,
      actionEn: l.actionEn,
      details: l.details || '',
      severity: 'info' as const,
    }));
    return fromProps.length > 0 ? [...fromProps, ...INITIAL_AUDIT_LOGS] : INITIAL_AUDIT_LOGS;
  });

  const handleAddLiveAuditLog = (entry: AuditLogEntry) => {
    setLiveAuditLogs((prev) => [entry, ...prev]);
    onToast(isRtl ? `تم تسجيل قيد جديد: [${entry.id}] بنجاح.` : `Audit log [${entry.id}] logged.`);
  };

  const handleClearAuditLogs = () => {
    setLiveAuditLogs([]);
    onToast(isRtl ? 'تم مسح سجل التدقيق وتنظيف الحالة بنجاح.' : 'Audit logs cleared successfully.');
  };

  const handleRestoreAuditLogs = () => {
    setLiveAuditLogs(INITIAL_AUDIT_LOGS);
    onToast(isRtl ? 'تمت استعادة سجلات التدقيق الافتراضية.' : 'Default audit logs restored.');
  };

  const handleDeleteAuditLog = (id: string) => {
    setLiveAuditLogs((prev) => prev.filter((l) => l.id !== id));
    onToast(isRtl ? `تم حذف قيد التدقيق ${id}.` : `Audit log ${id} deleted.`);
  };

  const handleAddQuickSampleLog = () => {
    const timestamp = new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${isRtl ? 'اليوم' : 'Today'} ${timestamp}`,
      userRole: 'ops_director',
      userName: isRtl ? 'الإدارة التنفيذية' : 'Executive Ops',
      moduleName: isRtl ? 'الحوكمة المركزية' : 'Central Governance',
      actionAr: 'فحص فوري للاعتمادات وحسابات النظام',
      actionEn: 'Real-time security audit check on accounts',
      details: isRtl
        ? 'تمت مراجعة دورة الاعتماد، والتأكد من مطابقة شروط الحوكمة وقواعد الأمان.'
        : 'Reviewed approval cycle and verified security governance constraints.',
      severity: 'info',
    };
    handleAddLiveAuditLog(newEntry);
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Header & Tabs */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-[#62339A] dark:text-[#A34FE8]">
              BASIT | باسط — CENTRAL SUPER ADMIN GOVERNANCE
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#292333] dark:text-white mt-0.5">
              {isRtl
                ? 'لوحة الإدارة المركزية — طلبات الانضمام، الحسابات، العروض وبوابات الدفع'
                : 'Super Admin — Onboarding Approvals, Accounts, Offers & Payment Gateways'}
            </h2>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 text-xs">
            <span className="text-[#64748B] dark:text-[#94A3B8]">
              {isRtl ? 'إجمالي إيرادات المنصة المقيدة: ' : 'Platform Revenue: '}
            </span>
            <span className="font-black text-[#62339A] dark:text-[#A34FE8] tabular-nums">
              {totalPlatformRevenue.toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        {/* Live DB Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[11px]">
          {[
            [isRtl ? 'المستخدمون' : 'Users', allUsers.length],
            [isRtl ? 'الجهات المتعاقدة' : 'Entities', allTenants.length],
            [isRtl ? 'الطلبات التجارية' : 'Orders', allOrders.length],
            [isRtl ? 'مزايا الترفيه' : 'Benefits', allEntertainmentBenefits.length],
            [isRtl ? 'اعمل الخير' : 'Charity', allCharityInitiatives.length],
            [isRtl ? 'كفارات اليمين' : 'Kaffarah', allKaffarahOrders.length],
            [isRtl ? 'طلبات اللوجستيات' : 'Logistics RFQ', allLogisticsInquiries.length],
          ].map(([label, val]) => (
            <div
              key={String(label)}
              className="p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/25"
            >
              <div className="text-[#64748B] dark:text-[#94A3B8] font-bold">{label}</div>
              <div className="font-black text-sm text-[#62339A] dark:text-[#A34FE8] tabular-nums">{val}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['approvals', isRtl ? `طلبات الانضمام والحسابات (${allApplications.length})` : `Approvals & Accounts (${allApplications.length})`],
              ['partners_delivery', isRtl ? `الجهات والعزل والتوصيل (${allTenants.length})` : 'Entities, Isolation & Delivery'],
              ['benefits_ops', isRtl ? `الترفيه والمزايا (${allEntertainmentBenefits.length})` : `Benefits (${allEntertainmentBenefits.length})`],
              ['charity_kaffarah', isRtl ? `الخير (${allCharityInitiatives.length}) وكفارات اليمين (${allKaffarahOrders.length})` : 'Charity & Kaffarah'],
              ['inquiries_feedback', isRtl ? `اللوجستيات والشكاوى (${allLogisticsInquiries.length + allCateringFeedback.length})` : 'Inquiries & Feedback'],
              ['offers_ads', isRtl ? `العروض والإعلانات (${allOffersAds.length})` : `Offers & Ads (${allOffersAds.length})`],
              ['payments_settings', isRtl ? 'بوابات الدفع وإعدادات التفعيل' : 'Payments & Policies'],
              ['usufruct', isRtl ? `عقود الانتفاع (${allProposals.length})` : 'Usufruct Contracts'],
              ['revenue_engine', isRtl ? 'العمولات والاشتراكات' : 'Revenue Engine'],
              ['audit', isRtl ? `سجل التدقيق (${liveAuditLogs.length})` : `Audit (${liveAuditLogs.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setAdminTab(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-colors ${
                adminTab === key
                  ? 'bg-[#62339A] text-white shadow-xs'
                  : 'bg-[#F8FAFC] dark:bg-[#292333] text-[#292333] dark:text-[#E2E8F0] hover:bg-[#F7F5FA]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: طلبات الانضمام وإدارة الحسابات */}
      {adminTab === 'approvals' && (
        <div className="space-y-5">
          {/* Applications Queue with Filter */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl ? 'طلبات الانضمام وإدارة الحسابات' : 'Partner Onboarding & Account Approvals'}
              </h3>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {(
                  [
                    ['all', isRtl ? 'الكل' : 'All'],
                    ['pending_review', isRtl ? 'قيد المراجعة' : 'Pending'],
                    ['needs_info', isRtl ? 'يحتاج استكمال' : 'Needs Info'],
                    ['approved', isRtl ? 'مقبول' : 'Approved'],
                    ['rejected', isRtl ? 'مرفوض' : 'Rejected'],
                  ] as const
                ).map(([st, lbl]) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAppStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-extrabold cursor-pointer ${
                      appStatusFilter === st
                        ? 'bg-[#62339A] text-white'
                        : 'bg-[#F8FAFC] dark:bg-[#292333] text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {isRtl ? 'لا توجد طلبات انضمام مطابقة للفلتر الحالي.' : 'No applications matching filter.'}
              </p>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.appId}
                  className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        {app.appId} · {app.entityType} · {app.targetRole}
                      </span>
                      <div className="text-sm font-black text-[#292333] dark:text-white">
                        {app.businessName} — {app.city} ({app.commercialRegRef})
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {app.contactName} · {app.phone} · Plan: {app.selectedPlanId} · Country: {app.countryCode}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-bold text-[#62339A] dark:text-[#A34FE8]">
                      {app.status}
                    </span>
                  </div>

                  {app.status !== 'approved' && app.status !== 'rejected' && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={commentByApp[app.appId] || ''}
                        onChange={(e) =>
                          setCommentByApp((prev) => ({ ...prev, [app.appId]: e.target.value }))
                        }
                        placeholder={isRtl ? 'سبب الرفض أو ملاحظات الاعتماد / الاستكمال...' : 'Admin review comment / rejection reason...'}
                        className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const plan = subscriptionPlans.find((p) => p.planId === app.selectedPlanId);
                          await adminApproveOnboardingApplication(
                            user,
                            app,
                            plan,
                            commentByApp[app.appId] || ''
                          );
                          onToast(isRtl ? `تم قبول وتفعيل ${app.businessName}.` : 'Approved and provisioned.');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'قبول وتفعيل المساحة' : 'Approve & Provision'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          adminRejectOrNeedsInfoOnboarding(
                            user,
                            app,
                            'needs_info',
                            commentByApp[app.appId] || 'يرجى استكمال مستندات السجل التجاري'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black flex items-center gap-1 cursor-pointer"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'طلب استكمال' : 'Request Info'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const reason = (commentByApp[app.appId] || '').trim();
                          if (!reason) {
                            onToast(isRtl ? 'يرجى كتابة سبب الرفض في خانة الملاحظة.' : 'Please enter rejection reason.');
                            return;
                          }
                          adminRejectOrNeedsInfoOnboarding(user, app, 'rejected', reason);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'رفض' : 'Reject'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Registered Users & Customer Account Status Control */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? `حسابات المستخدمين والعملاء المسجلين (${allUsers.length})` : `Registered User Accounts (${allUsers.length})`}</span>
            </h3>
            {allUsers.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {isRtl ? 'لا توجد حسابات إضافية مسجلة بعد.' : 'No registered users yet.'}
              </p>
            ) : (
              <div className="space-y-2">
                {allUsers.map((usr) => (
                  <div
                    key={usr.uid}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-black text-[#292333] dark:text-white">
                        {usr.displayName} ({usr.role})
                      </div>
                      <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                        UID: {usr.uid} · Country: {usr.countryCode} · Status: {usr.status}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {usr.status !== 'active' && (
                        <button
                          type="button"
                          onClick={() => adminUpdateCustomerAccountStatus(user, usr.uid, 'active')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                        >
                          {isRtl ? 'تفعيل الحساب' : 'Activate'}
                        </button>
                      )}
                      {usr.status !== 'suspended' && (
                        <button
                          type="button"
                          onClick={() => adminUpdateCustomerAccountStatus(user, usr.uid, 'suspended')}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                        >
                          {isRtl ? 'تعليق' : 'Suspend'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opportunities Review */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h3 className="text-base font-black text-[#292333] dark:text-white">
              {isRtl ? 'اعتماد فرص BASIT | باسط والتحقق من الشروط' : 'Opportunities Commercial Review'}
            </h3>
            {allOpportunities.map((opp) => (
              <div
                key={opp.oppId}
                className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-black text-[#292333] dark:text-white">
                    {opp.title} — {opp.costOrInvestmentEGP.toLocaleString()} ج.م
                  </div>
                  <div className="text-[#64748B] dark:text-[#94A3B8]">{opp.commercialTerms}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#62339A] dark:text-[#A34FE8]">{opp.approvalStatus}</span>
                  {opp.approvalStatus === 'pending_admin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => adminReviewOpportunity(user, opp.oppId, 'approved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                      >
                        {isRtl ? 'نشر واعتماد' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => adminReviewOpportunity(user, opp.oppId, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold cursor-pointer"
                      >
                        {isRtl ? 'رفض' : 'Reject'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TENANTS, MULTI-TENANT ISOLATION CHECK & DELIVERY */}
      {adminTab === 'partners_delivery' && (
        <div className="space-y-5">
          {/* Live Multi-Tenant Isolation Tester */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
                  <TestTube2 className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                  <span>{isRtl ? 'اختبار العزل متعدد المستأجرين (Multi-Tenant Isolation Check)' : 'Multi-Tenant Isolation Verification'}</span>
                </h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  {isRtl
                    ? 'تحقق فعلي أمام Firestore بأن المساحات معزولة عبر tenantId وownerUid ولا يتسرب أي سجل.'
                    : 'Run a live Firestore probe confirming strict tenantId & ownerUid isolation.'}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await runTenantIsolationSelfCheck(user, allTenants[0]?.tenantId);
                  setIsolationResult(res);
                  onToast(isRtl ? res.detailsAr : res.detailsEn);
                }}
                className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer"
              >
                {isRtl ? 'تشغيل اختبار العزل الفعلي' : 'Run Isolation Check'}
              </button>
            </div>
            {isolationResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
                [{isolationResult.checkedAt}] {isRtl ? isolationResult.detailsAr : isolationResult.detailsEn}
              </div>
            )}
          </div>

          {/* Provisioned Tenants */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? 'الجهات والمصانع والمساحات المستقلة المفعّلة' : 'Provisioned Isolated Workspaces'}</span>
            </h3>
            {allTenants.map((ten) => {
              const parsedContract = extractContractDates(ten.cateringScheduleText);
              const startVal = contractStartByTenant[ten.tenantId] ?? parsedContract.startDate;
              const endVal = contractEndByTenant[ten.tenantId] ?? parsedContract.endDate;
              const scheduleVal = scheduleByTenant[ten.tenantId] ?? parsedContract.cleanSchedule;
              const expiryState = getContractExpiryState(endVal);

              return (
                <div
                  key={ten.tenantId}
                  className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-3 text-xs"
                >
                  {(expiryState.isExpired || expiryState.isExpiringSoon) && (
                    <div
                      className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-[11px] font-black ${
                        expiryState.isExpired
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-200'
                          : 'bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#0369A1] dark:text-[#A34FE8]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          {expiryState.isExpired
                            ? isRtl
                              ? `تنبيه تعاقدي: انتهى عقد "${ten.name}" بتاريخ ${endVal}`
                              : `Contract Expired on ${endVal}`
                            : isRtl
                              ? `تنبيه قرب الانتهاء: يتبقى ${expiryState.daysRemaining} يوم على انتهاء عقد "${ten.name}"`
                              : `Expiring Soon: ${expiryState.daysRemaining} days left`}
                        </span>
                      </span>
                      {ten.status === 'active' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await adminUpdateTenantGovernance(user, ten, { status: 'suspended' });
                            onToast(isRtl ? `تم الإيقاف المؤقت لجهة "${ten.name}".` : 'Entity paused.');
                          }}
                          className="min-h-[36px] px-3 py-1 rounded-lg bg-rose-600 text-white font-black cursor-pointer"
                        >
                          {isRtl ? 'إيقاف مؤقت فوري' : 'One-Click Pause'}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-[#292333] dark:text-white">
                        {ten.name} ({ten.entityType}) — {ten.city}
                      </div>
                      <div dir="ltr" className="text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        Tenant ID: {ten.tenantId} · Status: {ten.status} · Contract: {ten.contractStatus || 'contracted'} · Commission: {ten.customCommissionPct}%
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={contractStatusByTenant[ten.tenantId] || ten.contractStatus || 'contracted'}
                        onChange={(e) =>
                          setContractStatusByTenant((p) => ({
                            ...p,
                            [ten.tenantId]: e.target.value as ContractStatus,
                          }))
                        }
                        className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
                      >
                        <option value="contracted">{isRtl ? 'جهة متعاقدة' : 'Contracted'}</option>
                        <option value="in_contracting">{isRtl ? 'تعاقد جاري' : 'In Contracting'}</option>
                        <option value="prospective">{isRtl ? 'جهة مرشحة' : 'Prospective'}</option>
                        <option value="unlaunched_sector">{isRtl ? 'قطاع لم يطلق بعد' : 'Unlaunched Sector'}</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={customCommByTenant[ten.tenantId] ?? String(ten.customCommissionPct)}
                        onChange={(e) =>
                          setCustomCommByTenant((p) => ({ ...p, [ten.tenantId]: e.target.value }))
                        }
                        className="min-h-[44px] w-20 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                  </div>

                  {/* Contract Start/End Dates + Schedule & Logo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                        {isRtl ? 'بداية العقد' : 'Contract Start'}
                      </label>
                      <input
                        type="date"
                        value={startVal}
                        onChange={(e) =>
                          setContractStartByTenant((p) => ({ ...p, [ten.tenantId]: e.target.value }))
                        }
                        className="min-h-[44px] w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                        {isRtl ? 'نهاية العقد' : 'Contract End'}
                      </label>
                      <input
                        type="date"
                        value={endVal}
                        onChange={(e) =>
                          setContractEndByTenant((p) => ({ ...p, [ten.tenantId]: e.target.value }))
                        }
                        className="min-h-[44px] w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                        {isRtl ? 'شعار المنشأة Logo URL' : 'Logo URL'}
                      </label>
                      <input
                        type="text"
                        value={logoByTenant[ten.tenantId] ?? ten.logoUrl ?? ''}
                        onChange={(e) =>
                          setLogoByTenant((p) => ({ ...p, [ten.tenantId]: e.target.value }))
                        }
                        placeholder="https://..."
                        className="min-h-[44px] w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                        {isRtl ? 'جدول الإعاشة والورديات' : 'Catering Schedule'}
                      </label>
                      <input
                        type="text"
                        value={scheduleVal}
                        onChange={(e) =>
                          setScheduleByTenant((p) => ({ ...p, [ten.tenantId]: e.target.value }))
                        }
                        placeholder={isRtl ? 'جدول الإعاشة والورديات...' : 'Schedule...'}
                        className="min-h-[44px] w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const packedSchedule = embedContractDates(scheduleVal, startVal, endVal);
                        await adminUpdateTenantGovernance(user, ten, {
                          status: ten.status,
                          customCommissionPct: Number(customCommByTenant[ten.tenantId] ?? ten.customCommissionPct),
                          contractStatus: contractStatusByTenant[ten.tenantId] ?? ten.contractStatus ?? 'contracted',
                          logoUrl: logoByTenant[ten.tenantId] ?? ten.logoUrl ?? '',
                          cateringScheduleText: packedSchedule,
                        });
                        onToast(isRtl ? `تم تحديث حوكمة وتواريخ عقد "${ten.name}".` : 'Tenant contract governance updated.');
                      }}
                      className="min-h-[44px] flex-1 px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold cursor-pointer"
                    >
                      {isRtl ? 'حفظ التعاقد والتواريخ والبيانات' : 'Save Contract & Dates'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const nextSt = ten.status === 'active' ? 'suspended' : 'active';
                        await adminUpdateTenantGovernance(user, ten, { status: nextSt });
                        onToast(
                          nextSt === 'suspended'
                            ? isRtl ? `تم الإيقاف المؤقت لجهة "${ten.name}".` : 'Entity paused.'
                            : isRtl ? `تم استئناف تفعيل جهة "${ten.name}".` : 'Entity resumed.'
                        );
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#292333] text-[#A34FE8] font-bold cursor-pointer"
                    >
                      {ten.status === 'active'
                        ? isRtl ? 'إيقاف مؤقت بضغطة واحدة' : 'One-Click Pause'
                        : isRtl ? 'استئناف التشغيل' : 'Resume Entity'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Dispatch & Courier Assignment */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? 'إدارة شبكة BASIT Delivery وإسناد المندوبين' : 'Delivery Dispatch & Courier Assignment'}</span>
            </h3>
            {allDeliveries.map((del) => (
              <div
                key={del.deliveryId}
                className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-[#292333] dark:text-white">
                    {del.deliveryId} — {del.pickupLocation} ← {del.dropoffLocation}
                  </div>
                  <div className="text-[#64748B] dark:text-[#94A3B8]">
                    Status: <span className="font-bold text-[#62339A] dark:text-[#A34FE8]">{del.status}</span> · Fee: {del.deliveryFeeEGP} ج.م
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {del.status === 'requested' && (
                    <>
                      <select
                        value={courierPick[del.deliveryId] || allCouriers[0]?.courierUid || ''}
                        onChange={(e) =>
                          setCourierPick((p) => ({ ...p, [del.deliveryId]: e.target.value }))
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      >
                        <option value="">{isRtl ? 'اختر مندوباً...' : 'Select Courier...'}</option>
                        {allCouriers.map((c) => (
                          <option key={c.courierUid} value={c.courierUid}>
                            {c.fullName} ({c.zone})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const picked = courierPick[del.deliveryId] || allCouriers[0]?.courierUid;
                          if (!picked) {
                            onToast(isRtl ? 'لا يوجد مندوب معتمد متاح.' : 'No approved courier available.');
                            return;
                          }
                          adminAssignCourierToDelivery(user, del, picked);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#62339A] text-white font-bold cursor-pointer"
                      >
                        {isRtl ? 'إسناد للمندوب' : 'Assign'}
                      </button>
                    </>
                  )}
                  {del.status === 'delivered' && (
                    <button
                      type="button"
                      onClick={() => adminRecordDeliveryLedger(user, del)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      {isRtl ? 'ترحيل قيد التوصيل والمحفظة' : 'Post Delivery Ledger'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {allOrders.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
              <h3 className="text-sm font-black text-[#292333] dark:text-white">
                {isRtl ? 'ترحيل عمولات الطلبات المكتملة' : 'Post Completed Order Commissions'}
              </h3>
              {allOrders
                .filter((o) => o.status === 'completed')
                .map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-between text-xs"
                  >
                    <span>
                      {ord.orderId} · {ord.itemsSummary} ({ord.platformCommissionEGP} ج.م عمولة)
                    </span>
                    <button
                      type="button"
                      onClick={() => adminRecordAndSettleOrderRevenue(user, ord)}
                      className="px-3 py-1 rounded-lg bg-[#62339A] text-white font-bold cursor-pointer"
                    >
                      {isRtl ? 'قيد بالدفتر' : 'Post Ledger'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2B: ENTERTAINMENT & BENEFITS OPERATIONS */}
      {adminTab === 'benefits_ops' && (
        <div className="space-y-5 text-xs">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!benVenueName.trim() || !benApprovedText.trim()) return;
              const existingBenefit = editingBenefitId
                ? allEntertainmentBenefits.find((b) => b.benefitId === editingBenefitId)
                : undefined;
              try {
                const bid = await saveEntertainmentBenefit(user, {
                  ...(editingBenefitId ? { benefitId: editingBenefitId } : {}),
                  ...(existingBenefit ? { partnerUid: existingBenefit.partnerUid } : {}),
                  venueName: benVenueName,
                  category: benCategory,
                  imageUrl: benImageUrl,
                  description: benDesc || benApprovedText,
                  approvedBenefitText: benApprovedText,
                  eligibilityScope: benScope,
                  eligibleTenantIdsCsv: benTenantsCsv,
                  validFrom: benValidFrom,
                  validTo: benValidTo,
                  terms: benTerms,
                  countryCode: existingBenefit?.countryCode || 'EG',
                  isApproved: existingBenefit?.isApproved ?? true,
                  isActive: existingBenefit?.isActive ?? true,
                });
                setEditingBenefitId(null);
                setBenVenueName('');
                setBenApprovedText('');
                setBenDesc('');
                setBenTenantsCsv('');
                setBenValidTo('');
                setBenTerms('');
                setBenImageUrl('');
                onToast(
                  editingBenefitId
                    ? isRtl
                      ? `تم تحديث الميزة الترفيهية ${bid} مع الحفاظ على تاريخ الإنشاء.`
                      : `Updated benefit ${bid}.`
                    : isRtl
                      ? `تم نشر واعتماد ميزة الترفيه ${bid}.`
                      : `Saved entertainment benefit ${bid}.`
                );
              } catch (err) {
                onToast(err instanceof Error ? err.message : isRtl ? 'تعذر حفظ الميزة الترفيهية.' : 'Failed to save benefit.');
              }
            }}
            className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                <span>
                  {editingBenefitId
                    ? isRtl
                      ? `تعديل الميزة الترفيهية (${editingBenefitId})`
                      : `Edit Benefit (${editingBenefitId})`
                    : isRtl
                      ? 'اعتماد وإضافة شركاء ومزايا الترفيه للجهات والأفراد'
                      : 'Publish Verified Entertainment & Leisure Benefits'}
                </span>
              </h3>
              {editingBenefitId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBenefitId(null);
                    setBenVenueName('');
                    setBenApprovedText('');
                    setBenDesc('');
                    setBenTenantsCsv('');
                    setBenValidTo('');
                    setBenTerms('');
                    setBenImageUrl('');
                  }}
                  className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] font-bold cursor-pointer"
                >
                  {isRtl ? 'إلغاء التعديل' : 'Cancel Edit'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                minLength={2}
                value={benVenueName}
                onChange={(e) => setBenVenueName(e.target.value)}
                placeholder={isRtl ? 'اسم المكان / الشريك الترفيهي *' : 'Venue / Partner Name *'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <select
                value={benCategory}
                onChange={(e) => setBenCategory(e.target.value as EntertainmentCategory)}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
              >
                <option value="circus">{isRtl ? 'سيرك وعروض' : 'Circus'}</option>
                <option value="amusement_park">{isRtl ? 'ملاهي ومدن ألعاب' : 'Amusement Park'}</option>
                <option value="club">{isRtl ? 'نادي اجتماعي/رياضي' : 'Club'}</option>
                <option value="hotel_resort">{isRtl ? 'فندق / منتجع' : 'Hotel & Resort'}</option>
                <option value="beach">{isRtl ? 'شاطئ / قرية' : 'Beach'}</option>
                <option value="kids_area">{isRtl ? 'منطقة ألعاب أطفال' : 'Kids Area'}</option>
                <option value="trip">{isRtl ? 'رحلات وأنشطة' : 'Trips'}</option>
                <option value="seasonal">{isRtl ? 'عروض موسمية' : 'Seasonal'}</option>
              </select>
              <input
                type="text"
                required
                minLength={2}
                value={benApprovedText}
                onChange={(e) => setBenApprovedText(e.target.value)}
                placeholder={isRtl ? 'نص الميزة/الخصم المعتمد فعلياً *' : 'Approved Benefit Text *'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <select
                value={benScope}
                onChange={(e) => setBenScope(e.target.value as 'public' | 'contracted_entity' | 'employee_tier')}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
              >
                <option value="employee_tier">{isRtl ? 'مخصص للعاملين بالجهات المتعاقدة' : 'Employee Tier Only'}</option>
                <option value="contracted_entity">{isRtl ? 'مخصص للجهات المتعاقدة' : 'Contracted Entities'}</option>
                <option value="public">{isRtl ? 'متاح للجميع' : 'Public'}</option>
              </select>
              <input
                type="text"
                value={benTenantsCsv}
                onChange={(e) => setBenTenantsCsv(e.target.value)}
                placeholder={isRtl ? 'معرفات الجهات المستحقة CSV (اختياري)' : 'Eligible Tenant IDs CSV'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="url"
                dir="ltr"
                value={benImageUrl}
                onChange={(e) => setBenImageUrl(e.target.value)}
                placeholder={isRtl ? 'رابط صورة الميزة (اختياري)' : 'Image URL (optional)'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="date"
                value={benValidFrom}
                onChange={(e) => setBenValidFrom(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="date"
                value={benValidTo}
                onChange={(e) => setBenValidTo(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                value={benTerms}
                onChange={(e) => setBenTerms(e.target.value)}
                placeholder={isRtl ? 'الشروط والضوابط المعتمدة' : 'Terms & Conditions'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
            </div>
            <textarea
              rows={2}
              value={benDesc}
              onChange={(e) => setBenDesc(e.target.value)}
              placeholder={isRtl ? 'وصف الوجهة الترفيهية وتفاصيل الاستفادة' : 'Description'}
              className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer">
              {editingBenefitId
                ? isRtl
                  ? 'حفظ تعديلات الميزة الترفيهية'
                  : 'Save Benefit Changes'
                : isRtl
                  ? 'نشر واعتماد الميزة الترفيهية'
                  : 'Publish Approved Benefit'}
            </button>
          </form>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h4 className="font-black text-sm text-[#292333] dark:text-white">
              {isRtl ? `المزايا المسجلة (${allEntertainmentBenefits.length}) وطلبات الحجز (${allBenefitBookings.length})` : 'Published Benefits & Booking Queue'}
            </h4>
            {allEntertainmentBenefits.map((b) => (
              <div key={b.benefitId} className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-black text-[#292333] dark:text-white">{b.venueName}</span>
                  <span className="mx-2 text-[#62339A] dark:text-[#A34FE8] font-bold">[{b.category} · {b.eligibilityScope}]</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBenefitId(b.benefitId);
                      setBenVenueName(b.venueName);
                      setBenCategory(b.category);
                      setBenApprovedText(b.approvedBenefitText);
                      setBenDesc(b.description);
                      setBenScope(b.eligibilityScope);
                      setBenTenantsCsv(b.eligibleTenantIdsCsv || '');
                      setBenValidFrom(b.validFrom || '');
                      setBenValidTo(b.validTo || '');
                      setBenTerms(b.terms || '');
                      setBenImageUrl(b.imageUrl || '');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await saveEntertainmentBenefit(user, { ...b, isActive: !b.isActive });
                        onToast(isRtl ? 'تم تحديث حالة الميزة الترفيهية.' : 'Benefit status updated.');
                      } catch (err) {
                        onToast(err instanceof Error ? err.message : 'Update failed');
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-[#62339A] text-white font-bold cursor-pointer"
                  >
                    {b.isActive ? (isRtl ? 'تعطيل' : 'Deactivate') : (isRtl ? 'تفعيل' : 'Activate')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await adminDeleteEntertainmentBenefit(user, b.benefitId);
                        if (editingBenefitId === b.benefitId) setEditingBenefitId(null);
                        onToast(isRtl ? `تم حذف الميزة ${b.venueName}.` : `Deleted benefit ${b.benefitId}.`);
                      } catch (err) {
                        onToast(err instanceof Error ? err.message : 'Delete failed');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isRtl ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
            {allBenefitBookings.map((bk) => (
              <div key={bk.bookingId} className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-black text-[#292333] dark:text-white">{bk.userName} — {bk.venueName}</div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{bk.bookingId} · {bk.requestedDate} · {bk.peopleCount} {isRtl ? 'أفراد' : 'guests'} · {bk.status}</div>
                </div>
                {bk.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => adminReviewBenefitBooking(user, bk, 'approved')}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      {isRtl ? 'اعتماد' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => adminReviewBenefitBooking(user, bk, 'rejected')}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                    >
                      {isRtl ? 'رفض' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2C: CHARITY & STANDALONE KAFFARAH GOVERNANCE */}
      {adminTab === 'charity_kaffarah' && (
        <div className="space-y-6 text-xs">
          {/* Section 1: اعمل الخير */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                <span>
                  {editingInitiativeId
                    ? isRtl
                      ? `تعديل مبادرة "اعمل الخير" (${editingInitiativeId})`
                      : `Edit Initiative (${editingInitiativeId})`
                    : isRtl
                      ? 'القسم الأول (مستقل): إدارة مبادرات "اعمل الخير" وتوثيق المساهمات'
                      : 'Good Deeds Charity Initiatives'}
                </span>
              </h3>
              {editingInitiativeId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingInitiativeId(null);
                    setChrTitleAr('');
                    setChrTitleEn('');
                    setChrEntity('');
                    setChrMechanism('');
                    setChrType('إطعام');
                    setChrGoal('100');
                  }}
                  className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] font-bold cursor-pointer"
                >
                  {isRtl ? 'إلغاء التعديل' : 'Cancel Edit'}
                </button>
              )}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!chrTitleAr.trim() || !chrEntity.trim() || !chrMechanism.trim()) return;
                const existingInit = editingInitiativeId
                  ? allCharityInitiatives.find((i) => i.initiativeId === editingInitiativeId)
                  : undefined;
                try {
                  const id = await saveCharityInitiative(user, {
                    ...(editingInitiativeId ? { initiativeId: editingInitiativeId } : {}),
                    titleAr: chrTitleAr,
                    titleEn: chrTitleEn || chrTitleAr,
                    executingEntity: chrEntity,
                    mechanismAr: chrMechanism,
                    contributionType: chrType,
                    targetGoalCount: Number(chrGoal) || 100,
                    proofMediaUrl: existingInit?.proofMediaUrl || '',
                    isApproved: existingInit?.isApproved ?? true,
                    isActive: existingInit?.isActive ?? true,
                  });
                  setEditingInitiativeId(null);
                  setChrTitleAr('');
                  setChrTitleEn('');
                  setChrEntity('');
                  setChrMechanism('');
                  setChrType('إطعام');
                  setChrGoal('100');
                  onToast(
                    editingInitiativeId
                      ? isRtl
                        ? `تم تحديث مبادرة اعمل الخير ${id} مع الحفاظ على تاريخ الإنشاء.`
                        : `Charity initiative ${id} updated.`
                      : isRtl
                        ? `تم حفظ واعتماد مبادرة اعمل الخير ${id}.`
                        : `Charity initiative ${id} saved.`
                  );
                } catch (err) {
                  onToast(err instanceof Error ? err.message : isRtl ? 'تعذر حفظ المبادرة الخيرية.' : 'Failed to save initiative.');
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <input
                type="text"
                required
                minLength={2}
                value={chrTitleAr}
                onChange={(e) => setChrTitleAr(e.target.value)}
                placeholder={isRtl ? 'عنوان المبادرة بالعربي *' : 'Arabic Title *'}
                className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                value={chrTitleEn}
                onChange={(e) => setChrTitleEn(e.target.value)}
                placeholder={isRtl ? 'عنوان المبادرة بالإنجليزي' : 'English Title'}
                className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                required
                minLength={2}
                value={chrEntity}
                onChange={(e) => setChrEntity(e.target.value)}
                placeholder={isRtl ? 'الجهة المنفذة المعتمدة *' : 'Executing Entity *'}
                className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                minLength={2}
                value={chrType}
                onChange={(e) => setChrType(e.target.value)}
                placeholder={isRtl ? 'نوع المساهمة (إطعام/توزيع)' : 'Type'}
                className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="number"
                min={1}
                value={chrGoal}
                onChange={(e) => setChrGoal(e.target.value)}
                placeholder={isRtl ? 'المستهدف' : 'Target Goal'}
                className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                required
                minLength={4}
                value={chrMechanism}
                onChange={(e) => setChrMechanism(e.target.value)}
                placeholder={isRtl ? 'آلية التنفيذ والتوثيق الميداني *' : 'Execution Mechanism *'}
                className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <button type="submit" className="sm:col-span-3 px-4 py-2.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer">
                {editingInitiativeId
                  ? isRtl
                    ? 'حفظ تعديلات مبادرة اعمل الخير'
                    : 'Save Initiative Changes'
                  : isRtl
                    ? 'إضافة واعتماد مبادرة اعمل الخير'
                    : 'Add Approved Initiative'}
              </button>
            </form>

            {allCharityInitiatives.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#62339A]/25">
                <div className="font-black text-[#292333] dark:text-white">
                  {isRtl ? `المبادرات الخيرية المسجلة (${allCharityInitiatives.length})` : `Charity Initiatives (${allCharityInitiatives.length})`}
                </div>
                {allCharityInitiatives.map((init) => (
                  <div key={init.initiativeId} className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-black text-[#292333] dark:text-white">
                        {isRtl ? init.titleAr : init.titleEn} — {init.executingEntity}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {init.contributionType} · {isRtl ? 'المستهدف' : 'Goal'}: {init.targetGoalCount} · {isRtl ? 'الموثق' : 'Verified'}: {init.recordedContributionsCount} · {init.isActive ? (isRtl ? 'مفعّلة' : 'Active') : (isRtl ? 'معطلة' : 'Inactive')}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInitiativeId(init.initiativeId);
                          setChrTitleAr(init.titleAr);
                          setChrTitleEn(init.titleEn);
                          setChrEntity(init.executingEntity);
                          setChrMechanism(init.mechanismAr);
                          setChrType(init.contributionType);
                          setChrGoal(String(init.targetGoalCount));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await saveCharityInitiative(user, {
                              initiativeId: init.initiativeId,
                              titleAr: init.titleAr,
                              titleEn: init.titleEn,
                              executingEntity: init.executingEntity,
                              mechanismAr: init.mechanismAr,
                              contributionType: init.contributionType,
                              targetGoalCount: init.targetGoalCount,
                              proofMediaUrl: init.proofMediaUrl,
                              isApproved: init.isApproved,
                              isActive: !init.isActive,
                            });
                            onToast(isRtl ? 'تم تحديث حالة المبادرة الخيرية.' : 'Initiative status updated.');
                          } catch (err) {
                            onToast(err instanceof Error ? err.message : 'Update failed');
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-[#62339A] text-white font-bold cursor-pointer"
                      >
                        {init.isActive ? (isRtl ? 'تعطيل' : 'Deactivate') : (isRtl ? 'تفعيل' : 'Activate')}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await adminDeleteCharityInitiative(user, init.initiativeId);
                            if (editingInitiativeId === init.initiativeId) setEditingInitiativeId(null);
                            onToast(isRtl ? `تم حذف المبادرة ${init.titleAr}.` : `Deleted initiative ${init.initiativeId}.`);
                          } catch (err) {
                            onToast(err instanceof Error ? err.message : 'Delete failed');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isRtl ? 'حذف' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allCharityContributions.map((c) => {
              const relatedInit = allCharityInitiatives.find((i) => i.initiativeId === c.initiativeId);
              return (
                <div key={c.contributionId} className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-black text-[#292333] dark:text-white">{c.contributorName} — {c.initiativeTitle} ({c.pledgeAmountEGP} ج.م)</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{c.contributionId} · {c.status}</div>
                  </div>
                  {c.status !== 'executed_verified' && (
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="url"
                        dir="ltr"
                        value={chrProofMap[c.contributionId] || ''}
                        onChange={(e) => setChrProofMap((p) => ({ ...p, [c.contributionId]: e.target.value }))}
                        placeholder="https://proof-url..."
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await adminVerifyCharityContribution(user, c, relatedInit, chrProofMap[c.contributionId] || '');
                            onToast(isRtl ? 'تم توثيق المساهمة وتحديث العداد الموثق.' : 'Contribution verified.');
                          } catch (err) {
                            onToast(err instanceof Error ? err.message : 'Proof required');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                      >
                        {isRtl ? 'توثيق التنفيذ بإثبات' : 'Verify With Proof'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 2: كفارات اليمين (منفصل تماماً) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border-2 border-[#62339A]/40 space-y-4">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? 'القسم الثاني (منفصل تماماً): المرجعية الشرعية وإثباتات تنفيذ كفارات اليمين' : 'Official Kaffarah Governance (Strictly Standalone)'}</span>
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await adminSaveKaffarahRule(user, {
                    isOfficiallyApproved: kafApproved,
                    shariaAuthorityName: kafAuthority,
                    referenceCode: kafRefCode,
                    unitCostEGP: Number(kafUnitCost) || 0,
                    mealsPerKaffarah: Number(kafMealsCount) || 10,
                    notesAr: kafNotes,
                  });
                  onToast(isRtl ? 'تم حفظ المرجعية الشرعية وقواعد كفارة اليمين في Firestore.' : 'Kaffarah rule saved.');
                } catch (err) {
                  onToast(err instanceof Error ? err.message : isRtl ? 'تعذر حفظ المرجعية الشرعية.' : 'Failed to save Kaffarah rule.');
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]"
            >
              <label className="sm:col-span-3 flex items-center gap-2 font-black cursor-pointer">
                <input type="checkbox" checked={kafApproved} onChange={(e) => setKafApproved(e.target.checked)} />
                <span>{isRtl ? 'تفعيل واعتماد خدمة كفارات اليمين بالمرجعية الرسمية (يجب إتمام الحقول أدناه)' : 'Approve & Enable Official Kaffarah Service'}</span>
              </label>
              <input
                type="text"
                required
                value={kafAuthority}
                onChange={(e) => setKafAuthority(e.target.value)}
                placeholder={isRtl ? 'اسم الجهة / المرجعية الشرعية الرسمية *' : 'Sharia Authority Name *'}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                required
                value={kafRefCode}
                onChange={(e) => setKafRefCode(e.target.value)}
                placeholder={isRtl ? 'رقم الفتوى / القرار الشرعي المعتمد *' : 'Fatwa / Reference Code *'}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  required
                  value={kafMealsCount}
                  onChange={(e) => setKafMealsCount(e.target.value)}
                  placeholder={isRtl ? 'عدد الوجبات' : 'Meals'}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
                <input
                  type="number"
                  min={1}
                  required
                  value={kafUnitCost}
                  onChange={(e) => setKafUnitCost(e.target.value)}
                  placeholder={isRtl ? 'القيمة ج.م' : 'Cost EGP'}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <input
                type="text"
                value={kafNotes}
                onChange={(e) => setKafNotes(e.target.value)}
                placeholder={isRtl ? 'ضوابط التنفيذ والتوزيع الشرعي' : 'Distribution notes'}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#62339A] text-white font-black cursor-pointer">
                {isRtl ? 'حفظ المرجعية الشرعية الرسمية' : 'Save Official Sharia Rule'}
              </button>
            </form>

            {allKaffarahOrders.map((ord) => (
              <div key={ord.orderId} className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-black text-[#292333] dark:text-white">
                    {ord.orderId} — {ord.donorName} ({ord.kaffarahCount} / {ord.totalMeals} وجبة)
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {ord.shariaReferenceUsed} · Status: {ord.executionStatus}
                  </div>
                </div>
                {ord.executionStatus !== 'executed_verified' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="url"
                      dir="ltr"
                      value={kafProofByOrder[ord.orderId] || ''}
                      onChange={(e) => setKafProofByOrder((p) => ({ ...p, [ord.orderId]: e.target.value }))}
                      placeholder="https://execution-proof-url..."
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <button
                      type="button"
                      onClick={() => adminUpdateKaffarahOrderProof(user, ord, 'awaiting_execution', kafProofByOrder[ord.orderId] || '')}
                      className="px-3 py-1.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black cursor-pointer"
                    >
                      {isRtl ? 'قيد التنفيذ الميداني' : 'Awaiting Execution'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await adminUpdateKaffarahOrderProof(user, ord, 'executed_verified', kafProofByOrder[ord.orderId] || '');
                          onToast(isRtl ? 'تم إغلاق طلب كفارة اليمين بإثبات تنفيذي موثق.' : 'Verified with proof.');
                        } catch (err) {
                          onToast(err instanceof Error ? err.message : 'Proof URL required');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black cursor-pointer"
                    >
                      {isRtl ? 'تم التنفيذ بإثبات موثق' : 'Mark Executed & Verified'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2D: LOGISTICS INQUIRIES & ENTITY FEEDBACK */}
      {adminTab === 'inquiries_feedback' && (
        <div className="space-y-5 text-xs">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? `طلبات الخدمات المكملة واللوجستيات (${allLogisticsInquiries.length})` : `Complementary Logistics Inquiries (${allLogisticsInquiries.length})`}</span>
            </h3>
            {allLogisticsInquiries.map((inq) => (
              <div key={inq.inquiryId} className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-black text-[#292333] dark:text-white">{inq.organizationName} ({inq.serviceKey}) — {inq.guestCount} فرد</div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{inq.contactName} · {inq.phone} · {inq.city} · {inq.eventDate} · Status: {inq.status}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => adminUpdateLogisticsInquiry(user, inq, 'in_review')}
                    className="px-3 py-1 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black cursor-pointer"
                  >
                    {isRtl ? 'قيد الدراسة' : 'In Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => adminUpdateLogisticsInquiry(user, inq, 'quoted')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-black cursor-pointer"
                  >
                    {isRtl ? 'تم إرسال التسعير' : 'Quoted'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? `بلاغات وملاحظات الجهات على الإعاشة والمزايا (${allCateringFeedback.length})` : `Catering & Benefit Feedback (${allCateringFeedback.length})`}</span>
            </h3>
            {allCateringFeedback.map((fb) => (
              <div key={fb.feedbackId} className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#292333] dark:text-white">{fb.subject} ({fb.tenantId} · {fb.category})</span>
                  <span className="font-bold text-[#62339A] dark:text-[#A34FE8]">{fb.status}</span>
                </div>
                <p className="text-[#64748B] dark:text-[#94A3B8]">{fb.details}</p>
                {fb.status === 'open' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fbReplyMap[fb.feedbackId] || ''}
                      onChange={(e) => setFbReplyMap((p) => ({ ...p, [fb.feedbackId]: e.target.value }))}
                      placeholder={isRtl ? 'اكتب الإجراء التصحيحي ورد الإدارة...' : 'Admin resolution reply...'}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <button
                      type="button"
                      onClick={() => adminResolveCateringFeedback(user, fb, fbReplyMap[fb.feedbackId] || 'تمت المعالجة والمتابعة الميدانية')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black cursor-pointer"
                    >
                      {isRtl ? 'إغلاق ورد الإدارة' : 'Resolve'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OFFERS & ADS STUDIO */}
      {adminTab === 'offers_ads' && (
        <div className="space-y-5 text-xs">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!adTitleAr.trim() || !adTitleEn.trim()) return;
              const existingOffer = editingOfferId
                ? allOffersAds.find((o) => o.offerId === editingOfferId)
                : undefined;
              try {
                const id = await adminSaveOfferAd(user, {
                  ...(editingOfferId ? { offerId: editingOfferId } : {}),
                  tenantId: existingOffer?.tenantId || 'platform',
                  category: adCategory,
                  titleAr: adTitleAr,
                  titleEn: adTitleEn,
                  discountBadgeAr: adBadgeAr,
                  discountBadgeEn: adBadgeEn,
                  ctaAr: adCtaAr,
                  ctaEn: adCtaEn,
                  countryCode: adCountry,
                  validFrom: adValidFrom,
                  validTo: adValidTo,
                  targetScope: adScope,
                  eligibleTenantIdsCsv: adEligibleTenants,
                  terms: adTerms,
                  isApproved: existingOffer?.isApproved ?? true,
                  isActive: existingOffer?.isActive ?? true,
                });
                setEditingOfferId(null);
                setAdTitleAr('');
                setAdTitleEn('');
                setAdBadgeAr('عرض معتمد');
                setAdBadgeEn('Approved Offer');
                setAdCtaAr('اطلب الآن');
                setAdCtaEn('Order Now');
                setAdValidTo('');
                setAdEligibleTenants('');
                setAdTerms('');
                onToast(
                  editingOfferId
                    ? isRtl
                      ? `تم تحديث العرض ${id} مع الحفاظ على تاريخ الإنشاء.`
                      : `Updated offer ${id}.`
                    : isRtl
                      ? `تم نشر العرض المعتمد ${id} على الرئيسية.`
                      : `Published approved offer ${id}.`
                );
              } catch (err) {
                onToast(err instanceof Error ? err.message : isRtl ? 'تعذر حفظ العرض.' : 'Failed to save offer.');
              }
            }}
            className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                <span>
                  {editingOfferId
                    ? isRtl
                      ? `تعديل العرض المعتمد (${editingOfferId})`
                      : `Edit Offer (${editingOfferId})`
                    : isRtl
                      ? 'إنشاء واعتماد بطاقات العروض الموسمية والموجهّة'
                      : 'Publish Approved Seasonal & Scoped BASIT Offers'}
                </span>
              </h3>
              {editingOfferId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingOfferId(null);
                    setAdTitleAr('');
                    setAdTitleEn('');
                    setAdBadgeAr('عرض معتمد');
                    setAdBadgeEn('Approved Offer');
                    setAdCtaAr('اطلب الآن');
                    setAdCtaEn('Order Now');
                    setAdValidTo('');
                    setAdEligibleTenants('');
                    setAdTerms('');
                  }}
                  className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] font-bold cursor-pointer"
                >
                  {isRtl ? 'إلغاء التعديل' : 'Cancel Edit'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={adCategory}
                onChange={(e) => setAdCategory(e.target.value as 'food' | 'shopping' | 'factory_merchant')}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
              >
                <option value="food">{isRtl ? 'بطاقة الإعاشة والضيافة (Food)' : 'Catering & Dining Card'}</option>
                <option value="shopping">{isRtl ? 'بطاقة الترفيه والمزايا / السوق' : 'Benefits & Shopping Card'}</option>
                <option value="factory_merchant">{isRtl ? 'بطاقة الجهات والمصانع (B2B)' : 'Factory & Entity Card'}</option>
              </select>
              <select
                value={adCountry}
                onChange={(e) => setAdCountry(e.target.value as CountryCode)}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
              >
                <option value="EG">مصر — EG (النشط حالياً)</option>
                <option value="QA">دولة قطر — QA (في انتظار الافتتاح)</option>
                <option value="OM">سلطنة عُمان — OM (في انتظار الافتتاح)</option>
                <option value="GB">المملكة المتحدة — GB (في انتظار الافتتاح)</option>
              </select>
              <select
                value={adScope}
                onChange={(e) => setAdScope(e.target.value as 'public' | 'contracted_entity' | 'employee_tier')}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
              >
                <option value="public">{isRtl ? 'نطاق عام للجميع' : 'Public'}</option>
                <option value="contracted_entity">{isRtl ? 'مخصص للجهات المتعاقدة' : 'Contracted Entities'}</option>
                <option value="employee_tier">{isRtl ? 'مخصص لمزايا العاملين' : 'Employee Tier'}</option>
              </select>
              <input
                type="text"
                value={adBadgeAr}
                onChange={(e) => setAdBadgeAr(e.target.value)}
                placeholder={isRtl ? 'شارة العرض بالعربي' : 'Arabic Badge'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                required
                minLength={2}
                value={adTitleAr}
                onChange={(e) => setAdTitleAr(e.target.value)}
                placeholder={isRtl ? 'عنوان العرض بالعربي *' : 'Arabic Title *'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                required
                minLength={2}
                value={adTitleEn}
                onChange={(e) => setAdTitleEn(e.target.value)}
                placeholder={isRtl ? 'عنوان العرض بالإنجليزي *' : 'English Title *'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="date"
                value={adValidFrom}
                onChange={(e) => setAdValidFrom(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="date"
                value={adValidTo}
                onChange={(e) => setAdValidTo(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                value={adEligibleTenants}
                onChange={(e) => setAdEligibleTenants(e.target.value)}
                placeholder={isRtl ? 'معرفات الجهات المستحقة CSV (اختياري)' : 'Eligible Tenants CSV'}
                className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <input
                type="text"
                value={adTerms}
                onChange={(e) => setAdTerms(e.target.value)}
                placeholder={isRtl ? 'شروط الاستحقاق والصلاحية' : 'Offer Terms'}
                className="sm:col-span-2 px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  minLength={2}
                  value={adCtaAr}
                  onChange={(e) => setAdCtaAr(e.target.value)}
                  placeholder="زر الإجراء"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer"
                >
                  {editingOfferId ? (isRtl ? 'حفظ التعديل' : 'Save Edit') : (isRtl ? 'نشر العرض' : 'Publish')}
                </button>
              </div>
            </div>
          </form>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-2.5">
            <h4 className="font-black text-sm text-[#292333] dark:text-white">
              {isRtl ? 'العروض المسجلة في Firestore' : 'Saved Firestore Offers & Ads'}
            </h4>
            {allOffersAds.map((off) => (
              <div
                key={off.offerId}
                className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <span className="font-black text-[#292333] dark:text-white">{isRtl ? off.titleAr : off.titleEn}</span>
                  <span className="mx-2 text-[#62339A] dark:text-[#A34FE8] font-bold">
                    [{off.category} · {off.countryCode}]
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOfferId(off.offerId);
                      setAdCategory(off.category);
                      setAdTitleAr(off.titleAr);
                      setAdTitleEn(off.titleEn);
                      setAdBadgeAr(off.discountBadgeAr);
                      setAdBadgeEn(off.discountBadgeEn);
                      setAdCtaAr(off.ctaAr);
                      setAdCtaEn(off.ctaEn);
                      setAdCountry(off.countryCode);
                      setAdValidFrom(off.validFrom || '');
                      setAdValidTo(off.validTo || '');
                      setAdScope(off.targetScope || 'public');
                      setAdEligibleTenants(off.eligibleTenantIdsCsv || '');
                      setAdTerms(off.terms || '');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await adminSaveOfferAd(user, {
                          ...off,
                          isActive: !off.isActive,
                        });
                        onToast(isRtl ? 'تم تحديث حالة العرض.' : 'Offer status updated.');
                      } catch (err) {
                        onToast(err instanceof Error ? err.message : 'Update failed');
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-[#62339A] text-white font-bold cursor-pointer"
                  >
                    {off.isActive ? (isRtl ? 'تعطيل العرض' : 'Deactivate') : (isRtl ? 'تفعيل العرض' : 'Activate')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await adminDeleteOfferAd(user, off.offerId);
                        if (editingOfferId === off.offerId) setEditingOfferId(null);
                        onToast(isRtl ? `تم حذف العرض ${off.titleAr}.` : `Deleted offer ${off.offerId}.`);
                      } catch (err) {
                        onToast(err instanceof Error ? err.message : 'Delete failed');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isRtl ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT GATEWAYS & PLATFORM SETTINGS */}
      {adminTab === 'payments_settings' && (
        <div className="space-y-5 text-xs">
          {/* Customer Auto-Activation & Platform Policies */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await adminSavePlatformSettings(user, {
                  autoActivateCustomers,
                  requireAdminApprovalForPartners: true,
                  defaultLanguage: defaultLangSetting,
                  defaultCountryCode: defaultCountrySetting,
                  enabledCountriesCsv,
                });
                onToast(isRtl ? 'تم حفظ سياسات المنصة والدول والتفعيل بنجاح.' : 'Platform policies saved.');
              } catch (err) {
                onToast(err instanceof Error ? err.message : isRtl ? 'تعذر حفظ إعدادات المنصة.' : 'Failed to save platform settings.');
              }
            }}
            className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4"
          >
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? 'سياسات تفعيل العملاء والدول واللغة' : 'Customer Activation & Localization Policies'}</span>
            </h3>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 font-black cursor-pointer">
              <input
                type="checkbox"
                checked={autoActivateCustomers}
                onChange={(e) => setAutoActivateCustomers(e.target.checked)}
              />
              <span>
                {isRtl
                  ? 'التفعيل التلقائي لحسابات العملاء (عند إيقافه يدخل العملاء بحالة انتظار موافقة الإدارة المركزية)'
                  : 'Auto-activate new Customer accounts (disable to enforce Admin approval)'}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'الدولة الافتراضية' : 'Default Country'}</label>
                <select
                  value={defaultCountrySetting}
                  onChange={(e) => setDefaultCountrySetting(e.target.value as CountryCode)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                >
                  <option value="EG">EG — مصر (السوق النشط)</option>
                  <option value="QA">QA — دولة قطر (في انتظار الافتتاح)</option>
                  <option value="OM">OM — سلطنة عُمان (في انتظار الافتتاح)</option>
                  <option value="GB">GB — المملكة المتحدة (في انتظار الافتتاح)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'اللغة الافتراضية' : 'Default Language'}</label>
                <select
                  value={defaultLangSetting}
                  onChange={(e) => setDefaultLangSetting(e.target.value as 'ar' | 'en')}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                >
                  <option value="ar">العربية (RTL)</option>
                  <option value="en">English (LTR)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'الدول المفعّلة' : 'Enabled Countries CSV'}</label>
                <input
                  type="text"
                  dir="ltr"
                  value={enabledCountriesCsv}
                  onChange={(e) => setEnabledCountriesCsv(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#A34FE8]" />
              <span>{isRtl ? 'حفظ سياسات التفعيل' : 'Save Platform Settings'}</span>
            </button>
          </form>

          {/* Payment Gateway Readiness & Live/Sandbox Controls */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>
                {isRtl
                  ? 'حالة وإعدادات وسائل الدفع (فوري · فودافون كاش · إنستا باي · الدفع عند الاستلام)'
                  : 'Payment Methods Console (Fawry · Vodafone Cash · InstaPay · Cash on Delivery)'}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {gatewayConfigs
                .filter((gw) =>
                  ['fawry', 'vodafone_cash', 'instapay', 'cash_on_delivery'].includes(gw.providerId)
                )
                .map((gw) => {
                const srvInfo = serverProviders.find((s) => s.providerId === gw.providerId);
                return (
                  <div
                    key={gw.providerId}
                    className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[#292333] dark:text-white">{gw.displayName}</span>
                      <span className="px-2 py-0.5 rounded bg-[#62339A] text-white font-bold uppercase text-[10px]">
                        {gw.mode}
                      </span>
                    </div>
                    {gw.providerId === 'vodafone_cash' && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-[#64748B] dark:text-[#94A3B8]">
                          {isRtl ? 'رقم المحفظة:' : 'Wallet:'}
                        </span>
                        <span dir="ltr" className="font-mono font-black text-[#62339A] dark:text-[#A34FE8] select-all">
                          {gw.merchantPublicId || VODAFONE_CASH_NUMBER}
                        </span>
                      </div>
                    )}
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {srvInfo?.liveConfigured ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'مفاتيح LIVE مهيأة بالخادم' : 'Live server keys configured'}</span>
                        </span>
                      ) : isRtl ? (
                        `Sandbox جاهز · وضع Live يتطلب: ${(srvInfo?.missingEnvVars || []).join(', ') || 'مفاتيح التاجر'}`
                      ) : (
                        `Sandbox ready · Live missing: ${(srvInfo?.missingEnvVars || []).join(', ')}`
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          adminSaveGatewayConfig(user, {
                            ...gw,
                            mode: gw.mode === 'sandbox' ? 'live' : 'sandbox',
                          })
                        }
                        className="px-3 py-1 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black cursor-pointer"
                      >
                        {gw.mode === 'sandbox' ? (isRtl ? 'تحويل إلى Live' : 'Switch to Live') : (isRtl ? 'تحويل إلى Sandbox' : 'Switch to Sandbox')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          adminSaveGatewayConfig(user, {
                            ...gw,
                            isEnabled: !gw.isEnabled,
                          })
                        }
                        className="px-3 py-1 rounded-lg bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-bold cursor-pointer"
                      >
                        {gw.isEnabled ? (isRtl ? 'مفعّلة' : 'Enabled') : (isRtl ? 'معطلة' : 'Disabled')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {channelReadiness && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap gap-4 text-[11px] font-bold">
                <span className="inline-flex items-center gap-1">
                  <span>Firestore Alerts:</span>
                  {channelReadiness.inAppFirestore ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>LIVE</span>
                    </span>
                  ) : (
                    'OFF'
                  )}
                </span>
              </div>
            )}

            {/* Executable Payment API & Webhook Test Console */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#62339A]/30 space-y-3">
              <div className="font-black text-[#292333] dark:text-white">
                {isRtl ? 'اختبار خادم الدفع الفعلي وWebhooks (/api/payments/*)' : 'Live Express Payment & Webhook Tester'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={testGatewayId}
                  onChange={(e) => setTestGatewayId(e.target.value as PaymentGatewayId)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
                >
                  <option value="fawry">Fawry (فوري)</option>
                  <option value="vodafone_cash">Vodafone Cash (فودافون كاش)</option>
                  <option value="instapay">InstaPay (إنستا باي)</option>
                  <option value="cash_on_delivery">Cash on Delivery (الدفع عند الاستلام)</option>
                </select>
                <select
                  value={testGatewayMode}
                  onChange={(e) => setTestGatewayMode(e.target.value as 'sandbox' | 'live')}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
                >
                  <option value="sandbox">Sandbox</option>
                  <option value="live">Live (Credential Check)</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const orderId = `ADM-TST-${Date.now().toString().slice(-5)}`;
                    const resp = await fetch('/api/payments/create-intent', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        provider: testGatewayId,
                        mode: testGatewayMode,
                        amount: Number(testAmount) || 100,
                        currency: 'EGP',
                        countryCode: 'EG',
                        orderId,
                        tenantId: 'platform_global',
                      }),
                    });
                    const data = await resp.json();
                    if (!resp.ok || !data.ok) {
                      setTestIntentResult(`[HTTP ${resp.status}] ${isRtl ? data.messageAr || data.error : data.messageEn || data.error}`);
                      return;
                    }
                    setLastCreatedIntent(data.intent);
                    setTestIntentResult(`Intent Created: ${data.intent.gatewayReference} (${data.intent.status})`);
                    await recordPaymentTransaction(user, {
                      txId: data.intent.txId,
                      tenantId: 'platform_global',
                      orderId,
                      provider: data.intent.provider,
                      mode: data.intent.mode,
                      countryCode: 'EG',
                      currency: data.intent.currency,
                      amount: data.intent.amount,
                      status: 'Pending',
                      gatewayReference: data.intent.gatewayReference,
                      idempotencyKey: data.intent.idempotencyKey,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#62339A] text-white font-black cursor-pointer"
                >
                  {isRtl ? 'تشغيل اختبار Intent' : 'Test Create Intent'}
                </button>

                {lastCreatedIntent && lastCreatedIntent.mode === 'sandbox' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const resp = await fetch('/api/payments/sandbox-action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          txId: lastCreatedIntent.txId,
                          action: 'Paid',
                          hmacSignature: lastCreatedIntent.hmacSignature,
                        }),
                      });
                      const data = await resp.json();
                      if (resp.ok && data.ok) {
                        await updatePaymentTransactionStatus(lastCreatedIntent.txId, 'Paid');
                        setTestIntentResult(`Sandbox Confirmed Paid & HMAC Verified (${lastCreatedIntent.gatewayReference})`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black cursor-pointer"
                  >
                    {isRtl ? 'تأكيد Paid + HMAC' : 'Confirm Paid + HMAC'}
                  </button>
                )}
              </div>

              {testIntentResult && (
                <div className="p-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold text-[#292333] dark:text-[#A34FE8]">
                  {testIntentResult}
                </div>
              )}

              {allPaymentTransactions.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="font-black text-[#292333] dark:text-white">
                    {isRtl ? `آخر المعاملات المالية (${allPaymentTransactions.length})` : `Recent Transactions (${allPaymentTransactions.length})`}
                  </div>
                  {allPaymentTransactions.slice(0, 6).map((tx) => (
                    <div key={tx.txId} className="p-2.5 rounded-lg bg-white dark:bg-[#292333] flex items-center justify-between">
                      <span className="font-mono">{tx.gatewayReference} ({tx.provider})</span>
                      <span className="font-bold tabular-nums">{tx.amount} {tx.currency} · {tx.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USUFRUCT LEGAL CONTRACT ISSUANCE */}
      {adminTab === 'usufruct' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
          <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
            <span>{isRtl ? 'اعتماد وإصدار عقود تقنية الانتفاع' : 'Central Approval & Usufruct Contract Issuance'}</span>
          </h3>
          {allProposals.map((p) => (
            <div
              key={p.proposalId}
              className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-black text-[#292333] dark:text-white">
                  {p.proposalId} — {p.proposerName} ({p.proposerProfitPct}% / {p.siteOwnerProfitPct}% / {p.platformUsufructPct}%)
                </div>
                <div className="text-[#64748B] dark:text-[#94A3B8]">{p.termsSummary}</div>
                <div className="text-[11px] font-bold text-[#62339A] dark:text-[#A34FE8] mt-1">
                  {isRtl
                    ? `الحالة: ${p.status} | موافقة صاحب الفرصة: ${p.siteOwnerAgreed ? 'نعم' : 'لا'}`
                    : `Status: ${p.status}`}
                </div>
              </div>
              {p.status === 'awaiting_admin' && p.siteOwnerAgreed && p.proposerAgreed && (
                <button
                  type="button"
                  onClick={async () => {
                    const cid = await adminIssueUsufructContract(user, p);
                    onToast(isRtl ? `تم إصدار عقد الانتفاع الرسمي ${cid}.` : `Contract ${cid} issued.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black cursor-pointer"
                >
                  {isRtl ? 'اعتماد وإصدار عقد الانتفاع الرسمي' : 'Issue Official Contract'}
                </button>
              )}
            </div>
          ))}
          {allContracts.length > 0 && (
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#62339A]/25 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {isRtl ? `إجمالي عقود الانتفاع السارية والموثقة: ${allContracts.length}` : `Active Contracts: ${allContracts.length}`}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REVENUE, COMMISSIONS & SUBSCRIPTIONS ENGINE */}
      {adminTab === 'revenue_engine' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
              <span>{isRtl ? 'تحليل إيرادات المنصة مقابل صافي الشركاء (ج.م)' : 'Platform Revenue vs Partner Payouts'}</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="platform"
                    name={isRtl ? 'إيراد BASIT' : 'BASIT Revenue'}
                    fill="#62339A"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="partnerNet"
                    name={isRtl ? 'صافي الشركاء/المندوبين' : 'Partner Net'}
                    fill="#0EA5E9"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <form
              onSubmit={handleSaveRules}
              className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3 text-xs"
            >
              <h4 className="text-sm font-black text-[#292333] dark:text-white">
                {isRtl ? 'ضبط نسب العمولات الافتراضية' : 'Global Commission Controls'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isRtl ? 'عمولة الطلبات %' : 'Order Comm %'}</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={orderCommPct}
                    onChange={(e) => setOrderCommPct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isRtl ? 'نسبة المنصة بالتوصيل %' : 'Delivery Plat %'}</label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={deliveryPlatPct}
                    onChange={(e) => setDeliveryPlatPct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isRtl ? 'نسبة الانتفاع للمنصة %' : 'Usufruct %'}</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={usufructPlatPct}
                    onChange={(e) => setUsufructPlatPct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isRtl ? 'أقل رسوم توصيل ج.م' : 'Min Delivery EGP'}</label>
                  <input
                    type="number"
                    min={10}
                    value={minDeliveryFee}
                    onChange={(e) => setMinDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#62339A] text-white font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#A34FE8]" />
                <span>{isRtl ? 'حفظ قواعد العمولات' : 'Save Rules'}</span>
              </button>
            </form>

            <form
              onSubmit={handleSavePlan}
              className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3 text-xs"
            >
              <h4 className="text-sm font-black text-[#292333] dark:text-white">
                {isRtl ? 'إدارة باقات الاشتراك' : 'Subscription Plan Controls'}
              </h4>
              <select
                value={editingPlanId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setEditingPlanId(pid);
                  const found = subscriptionPlans.find((p) => p.planId === pid);
                  if (found) {
                    setPlanFee(String(found.monthlyFeeEGP));
                    setPlanComm(String(found.orderCommissionPct));
                    setPlanDisc(String(found.deliveryDiscountPct));
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
              >
                {subscriptionPlans.map((p) => (
                  <option key={p.planId} value={p.planId}>
                    {isRtl ? p.nameAr : p.nameEn}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">{isRtl ? 'الرسوم/شهر' : 'Fee EGP'}</label>
                  <input
                    type="number"
                    min={0}
                    value={planFee}
                    onChange={(e) => setPlanFee(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isRtl ? 'العمولة %' : 'Comm %'}</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={planComm}
                    onChange={(e) => setPlanComm(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isRtl ? 'خصم شحن %' : 'Ship Disc %'}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={planDisc}
                    onChange={(e) => setPlanDisc(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#292333] text-[#A34FE8] font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تحديث الباقة' : 'Update Plan'}</span>
              </button>
            </form>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <h4 className="text-sm font-black text-[#292333] dark:text-white">
              {isRtl ? 'دفتر التسويات والقيود المالية' : 'Revenue & Settlement Ledger'}
            </h4>
            {allLedgerEntries.map((entry) => (
              <div
                key={entry.entryId}
                className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold">{entry.sourceType}</span> · {entry.referenceId}
                </div>
                <div className="flex items-center gap-3">
                  <span>{isRtl ? `منصة: ${entry.platformRevenueEGP} ج.م` : `Platform: ${entry.platformRevenueEGP}`}</span>
                  {entry.settlementStatus === 'accrued' ? (
                    <button
                      type="button"
                      onClick={() => adminSettleLedgerEntry(user, entry.entryId)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      {isRtl ? 'اعتماد التسوية' : 'Mark Settled'}
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-bold">{entry.settlementStatus}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT TRAIL */}
      {adminTab === 'audit' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[#62339A] dark:text-[#A34FE8]" />
                <span>{isRtl ? 'سجل الحوكمة والتدقيق والعمليات' : 'Security & Operational Audit Log'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFC928] text-slate-950 font-black text-xs">
                  {liveAuditLogs.length}
                </span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                {isRtl
                  ? 'توثيق كامل لكافة الاعتمادات والعمليات ومحاولات النظام مع إمكانية الفحص والتفريغ والإضافة الفورية.'
                  : 'Full documentation of operations, approvals, and events with real-time dynamic additions.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddQuickSampleLog}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span>{isRtl ? 'إضافة قيد تدقيق تجريبي' : 'Add Test Log'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAuditLogs}
                disabled={liveAuditLogs.length === 0}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors ${
                  liveAuditLogs.length === 0
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRtl ? 'مسح السجل' : 'Clear Log'}</span>
              </button>

              {liveAuditLogs.length === 0 && (
                <button
                  type="button"
                  onClick={handleRestoreAuditLogs}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-[#FFC928] text-xs font-black cursor-pointer transition-colors"
                >
                  <span>{isRtl ? 'استعادة الافتراضي' : 'Restore'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsAuditDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#7E3FD6] text-white text-xs font-black cursor-pointer shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>{isRtl ? 'فتح درج التدقيق' : 'Open Audit Drawer'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">{isRtl ? 'إجمالي السجلات' : 'Total Logs'}</span>
              <span className="text-lg font-black text-[#292333] dark:text-white tabular-nums">{liveAuditLogs.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block">{isRtl ? 'حالة السجل' : 'Audit State'}</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                {liveAuditLogs.length > 0 ? (isRtl ? 'نشط ومحدث' : 'Active & Live') : (isRtl ? 'تم التفريغ' : 'Cleared')}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <span className="text-[11px] text-purple-800 dark:text-purple-300 block">{isRtl ? 'المصدر الأمني' : 'Security Source'}</span>
              <span className="text-xs font-black text-purple-700 dark:text-purple-300">INITIAL_AUDIT_LOGS</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="text-[11px] text-amber-800 dark:text-amber-300 block">{isRtl ? 'التفاعل الفوري' : 'Reactivity'}</span>
              <span className="text-xs font-black text-amber-700 dark:text-amber-300">{isRtl ? 'ديناميكي ومحدث' : 'Dynamic State'}</span>
            </div>
          </div>

          {/* Logs List in Tab */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto text-xs">
            {liveAuditLogs.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] dark:bg-[#1E293B] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <p className="text-slate-500 font-bold">{isRtl ? 'تم مسح سجل التدقيق وتنظيف الحالة بنجاح.' : 'Audit logs have been cleared.'}</p>
                <button
                  type="button"
                  onClick={handleRestoreAuditLogs}
                  className="px-4 py-1.5 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
                >
                  {isRtl ? 'استعادة السجلات الافتراضية' : 'Restore Default Logs'}
                </button>
              </div>
            ) : (
              liveAuditLogs.map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-black text-[#62339A] dark:text-[#FFC928]">
                        {l.id}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {isRtl ? l.actionAr : l.actionEn}
                      </span>
                      <span className="text-[10px] text-slate-400">({l.timestamp})</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {l.moduleName} — {l.userName} | {l.details}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteAuditLog(l.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title={isRtl ? 'حذف هذا القيد' : 'Delete log'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={liveAuditLogs}
        onClearLogs={handleClearAuditLogs}
        onAddTestLog={handleAddLiveAuditLog}
        onDeleteLog={handleDeleteAuditLog}
        onRestoreLogs={handleRestoreAuditLogs}
        isRtl={isRtl}
      />
    </div>
  );
};
