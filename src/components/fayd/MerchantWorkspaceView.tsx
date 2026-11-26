import React, { useEffect, useState } from 'react';
import {
  Store,
  Plus,
  Package,
  ShoppingBag,
  Wallet,
  Lock,
  Truck,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Users,
  Settings,
  CreditCard,
  ShieldCheck,
  Trash2,
  Edit3,
  MessageSquare,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react';
import {
  extractContractDates,
  embedContractDates,
  getContractExpiryState,
} from '../../utils/contractDates';
import type { User } from 'firebase/auth';
import {
  PAYMENT_METHOD_LABELS,
  SUPPORTED_COUNTRIES,
  VODAFONE_CASH_NUMBER,
  type CountryCode,
  type LanguageCode,
  type PaymentGatewayId,
} from '../../data/phase1Data';
import type {
  CatalogItemDoc,
  CateringFeedbackDoc,
  CommercialOrderDoc,
  CommercialOrderStatus,
  CommissionRuleDoc,
  LedgerSettlementDoc,
  PaymentGatewayConfigDoc,
  PaymentTransactionDoc,
  PublicStorefrontDoc,
  SubscriptionPlanDoc,
  TenantMemberDoc,
  TenantWorkspaceDoc,
} from '../../types/faydEcosystem';
import {
  addTenantStaffMember,
  createDeliveryRequest,
  deleteCatalogItem,
  placeCommercialOrder,
  recordPaymentTransaction,
  removeTenantStaffMember,
  saveCatalogItem,
  submitCateringFeedback,
  updateCommercialOrderStatus,
  updatePaymentTransactionStatus,
  updateTenantProfileSettings,
} from '../../services/faydFirestoreService';

interface MerchantWorkspaceViewProps {
  lang: LanguageCode;
  countryCode: CountryCode;
  user: User | null;
  onRequireSignIn: () => void;
  onGoToOnboarding: () => void;
  myTenant: TenantWorkspaceDoc | null;
  myTenantMembers?: TenantMemberDoc[];
  myMerchantCatalog: CatalogItemDoc[];
  myMerchantOrders: CommercialOrderDoc[];
  myCustomerOrders: CommercialOrderDoc[];
  myLedgerEntries: LedgerSettlementDoc[];
  myPaymentTransactions?: PaymentTransactionDoc[];
  gatewayConfigs?: PaymentGatewayConfigDoc[];
  publicStorefronts: PublicStorefrontDoc[];
  publicCatalogItems: CatalogItemDoc[];
  plans: SubscriptionPlanDoc[];
  commissionRule: CommissionRuleDoc;
  myCateringFeedback?: CateringFeedbackDoc[];
  initialMode?: 'storefront_market' | 'my_workspace';
  onToast: (msg: string) => void;
}

export const MerchantWorkspaceView: React.FC<MerchantWorkspaceViewProps> = ({
  lang,
  countryCode,
  user,
  onRequireSignIn,
  onGoToOnboarding,
  myTenant,
  myTenantMembers = [],
  myMerchantCatalog,
  myMerchantOrders,
  myCustomerOrders,
  myLedgerEntries,
  myPaymentTransactions = [],
  gatewayConfigs = [],
  publicStorefronts,
  publicCatalogItems,
  plans,
  commissionRule,
  myCateringFeedback = [],
  initialMode,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'storefront_market' | 'my_workspace'>(
    initialMode || (myTenant ? 'my_workspace' : 'storefront_market')
  );
  const [wsSubTab, setWsSubTab] = useState<'catalog' | 'orders' | 'payments' | 'team' | 'feedback' | 'settings'>('catalog');

  // Catalog Form
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('وجبات وتغذية');
  const [itemPrice, setItemPrice] = useState('120');
  const [itemStock, setItemStock] = useState('50');
  const [savingItem, setSavingItem] = useState(false);

  // Team Member Form
  const [staffUid, setStaffUid] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'manager' | 'staff'>('staff');

  // Workspace Settings Form
  const [wsName, setWsName] = useState(myTenant?.name || '');
  const [wsCity, setWsCity] = useState(myTenant?.city || '');
  const [wsDelivery, setWsDelivery] = useState(myTenant?.deliveryEnabled ?? true);
  const [wsLogoUrl, setWsLogoUrl] = useState(myTenant?.logoUrl || '');
  const [wsCateringSchedule, setWsCateringSchedule] = useState(myTenant?.cateringScheduleText || '');

  useEffect(() => {
    if (initialMode) {
      setActiveTab(initialMode);
    } else if (myTenant) {
      setActiveTab('my_workspace');
    }
  }, [initialMode, myTenant?.tenantId]);

  useEffect(() => {
    if (!myTenant) return;
    setWsName(myTenant.name || '');
    setWsCity(myTenant.city || '');
    setWsDelivery(myTenant.deliveryEnabled ?? true);
    setWsLogoUrl(myTenant.logoUrl || '');
    setWsCateringSchedule(extractContractDates(myTenant.cateringScheduleText).cleanSchedule);
  }, [
    myTenant?.tenantId,
    myTenant?.name,
    myTenant?.city,
    myTenant?.deliveryEnabled,
    myTenant?.logoUrl,
    myTenant?.cateringScheduleText,
  ]);

  // Entity Catering / Benefit Feedback Form
  const [fbCategory, setFbCategory] = useState<'catering_quality' | 'benefit_partner' | 'general_complaint'>('catering_quality');
  const [fbSubject, setFbSubject] = useState('');
  const [fbDetails, setFbDetails] = useState('');
  const [sendingFb, setSendingFb] = useState(false);

  // Customer Marketplace state
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [needsDelivery, setNeedsDelivery] = useState(true);

  // Real Server Payment Checkout Panel State
  const activeCountryObj =
    SUPPORTED_COUNTRIES.find((c) => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  const [checkoutOrderId, setCheckoutOrderId] = useState('');
  const [checkoutAmount, setCheckoutAmount] = useState('250');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayId>(
    activeCountryObj.supportedGateways[0] || 'fawry'
  );

  useEffect(() => {
    const preferred = activeCountryObj.supportedGateways[0] || 'fawry';
    if (!activeCountryObj.supportedGateways.includes(selectedGateway)) {
      setSelectedGateway(preferred);
    }
  }, [countryCode, activeCountryObj.supportedGateways, selectedGateway]);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [activeIntent, setActiveIntent] = useState<{
    txId: string;
    provider: PaymentGatewayId;
    mode: 'sandbox' | 'live';
    gatewayReference: string;
    hmacSignature: string;
    amount: number;
    currency: string;
    status: string;
  } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const activePlan = plans.find((p) => p.planId === myTenant?.planId);
  const effectiveCommission =
    myTenant?.customCommissionPct ?? activePlan?.orderCommissionPct ?? commissionRule.defaultOrderCommissionPct;

  const resetCatalogForm = () => {
    setEditingItemId(null);
    setItemTitle('');
    setItemCategory('وجبات وتغذية');
    setItemPrice('120');
    setItemStock('50');
  };

  const handleSaveCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !myTenant) return;
    if (!itemTitle.trim()) return;
    setSavingItem(true);
    try {
      await saveCatalogItem(user, myTenant, {
        ...(editingItemId ? { itemId: editingItemId } : {}),
        title: itemTitle,
        category: itemCategory,
        priceEGP: Number(itemPrice) || 50,
        stockQty: Number(itemStock) || 10,
        isAvailable: true,
      });
      onToast(
        editingItemId
          ? isRtl
            ? 'تم تحديث الصنف مع الحفاظ على تاريخ الإنشاء.'
            : 'Catalog item updated.'
          : isRtl
            ? 'تمت إضافة الصنف إلى مساحة عملك المعزولة.'
            : 'Item added to isolated workspace.'
      );
      resetCatalogForm();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item: CatalogItemDoc) => {
    if (!user) return;
    try {
      await deleteCatalogItem(user, item.itemId);
      if (editingItemId === item.itemId) resetCatalogForm();
      onToast(isRtl ? `تم حذف الصنف "${item.title}".` : `Deleted "${item.title}".`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleToggleItem = async (item: CatalogItemDoc) => {
    if (!user || !myTenant) return;
    try {
      await saveCatalogItem(user, myTenant, {
        itemId: item.itemId,
        title: item.title,
        category: item.category,
        priceEGP: item.priceEGP,
        stockQty: item.stockQty,
        isAvailable: !item.isAvailable,
      });
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleCustomerOrder = async (item: CatalogItemDoc) => {
    if (!user) {
      onRequireSignIn();
      return;
    }
    const addr = dropoffAddress.trim() || (isRtl ? 'الاستلام أو التوصيل للعنوان المسجل' : 'Registered address');
    const orderId = await placeCommercialOrder(
      user,
      item,
      1,
      commissionRule.defaultOrderCommissionPct,
      needsDelivery,
      commissionRule.minDeliveryFeeEGP,
      addr
    );
    setCheckoutOrderId(orderId);
    setCheckoutAmount(String(item.priceEGP + (needsDelivery ? commissionRule.minDeliveryFeeEGP : 0)));
    onToast(
      isRtl
        ? `تم تسجيل طلبك رقم ${orderId} وإرساله مباشرة لمساحة "${item.storeName}". يمكنك سداده إلكترونياً الآن.`
        : `Order ${orderId} sent directly to "${item.storeName}".`
    );
  };

  const handleOrderProgress = async (order: CommercialOrderDoc, nextStatus: CommercialOrderStatus) => {
    if (!user) return;
    await updateCommercialOrderStatus(user.uid, order, nextStatus);
    onToast(isRtl ? `تم تحديث الطلب إلى: ${nextStatus}` : `Order updated to ${nextStatus}`);
  };

  const handleDispatchOrderDelivery = async (order: CommercialOrderDoc) => {
    if (!user || !myTenant) return;
    const deliveryId = await createDeliveryRequest(
      user,
      myTenant,
      commissionRule,
      activePlan?.deliveryDiscountPct || 0,
      {
        orderId: order.orderId,
        pickupLocation: `${myTenant.name} — ${myTenant.city}`,
        dropoffLocation: order.dropoffAddress,
        packageNote: order.itemsSummary,
        baseDeliveryFeeEGP: order.deliveryFeeEGP || commissionRule.minDeliveryFeeEGP,
      }
    );
    await updateCommercialOrderStatus(user.uid, order, 'in_delivery');
    onToast(
      isRtl
        ? `تم إرسال شحنة التوصيل ${deliveryId} إلى شبكة التوصيل BASIT Delivery.`
        : `Dispatched delivery ${deliveryId} to BASIT Delivery.`
    );
  };

  const handleCreatePaymentIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireSignIn();
      return;
    }
    const gwConf = gatewayConfigs.find((g) => g.providerId === selectedGateway);
    const mode = gwConf?.mode || 'sandbox';
    const orderRef = checkoutOrderId.trim() || `ORD-${Date.now().toString().slice(-6)}`;
    const amountNum = Number(checkoutAmount) || 100;

    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const resp = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedGateway,
          mode,
          amount: amountNum,
          currency: activeCountryObj.currencyEn,
          countryCode,
          orderId: orderRef,
          tenantId: myTenant?.tenantId || 'platform_global',
          idempotencyKey: `${orderRef}_${selectedGateway}_${amountNum}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        setCheckoutError(
          isRtl ? data.messageAr || data.error : data.messageEn || data.error
        );
        return;
      }

      const intent = data.intent;
      setActiveIntent(intent);
      await recordPaymentTransaction(user, {
        txId: intent.txId,
        tenantId: myTenant?.tenantId || 'platform_global',
        orderId: orderRef,
        provider: intent.provider,
        mode: intent.mode,
        countryCode,
        currency: intent.currency,
        amount: intent.amount,
        status: 'Pending',
        gatewayReference: intent.gatewayReference,
        idempotencyKey: intent.idempotencyKey,
      });
      onToast(
        isRtl
          ? `تم إنشاء نية دفع (${intent.mode.toUpperCase()}) عبر ${intent.provider.toUpperCase()} برقم ${intent.gatewayReference}.`
          : `Payment intent ${intent.gatewayReference} initialized.`
      );
    } finally {
      setCheckoutBusy(false);
    }
  };

  const handleSandboxOutcome = async (action: 'Paid' | 'Failed' | 'Cancelled' | 'Refunded') => {
    if (!activeIntent) return;
    setCheckoutBusy(true);
    try {
      const resp = await fetch('/api/payments/sandbox-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId: activeIntent.txId,
          action,
          hmacSignature: activeIntent.hmacSignature,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.ok) {
        setActiveIntent(data.intent);
        await updatePaymentTransactionStatus(activeIntent.txId, action);
        onToast(
          isRtl
            ? `تم تأكيد حالة الدفع (${action}) والتحقق من التوقيع HMAC.`
            : `Payment transaction updated to ${action} (HMAC verified).`
        );
      } else {
        setCheckoutError(data.error || 'Sandbox confirmation failed');
      }
    } finally {
      setCheckoutBusy(false);
    }
  };

  const filteredPublicCatalog =
    selectedStoreId === 'all'
      ? publicCatalogItems
      : publicCatalogItems.filter((i) => i.tenantId === selectedStoreId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('my_workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'my_workspace'
              ? 'bg-[#62339A] text-white shadow-xs'
              : 'bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-[#E2E8F0]'
          }`}
        >
          <Store className="w-4 h-4 text-[#A34FE8]" />
          <span>{isRtl ? 'مساحة عملي المستقلة (المصنع / التاجر)' : 'My Isolated Tenant Workspace'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('storefront_market')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'storefront_market'
              ? 'bg-[#62339A] text-white shadow-xs'
              : 'bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-[#292333] dark:text-[#E2E8F0]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#A34FE8]" />
          <span>
            {isRtl
              ? `سوق المتاجر والمصانع (${publicCatalogItems.length})`
              : `Public Storefronts (${publicCatalogItems.length})`}
          </span>
        </button>
      </div>

      {/* TAB 1: ISOLATED MERCHANT / FACTORY WORKSPACE */}
      {activeTab === 'my_workspace' && (
        <>
          {!user ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 text-center space-y-3">
              <Lock className="w-8 h-8 text-[#62339A] dark:text-[#A34FE8] mx-auto" />
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl ? 'سجّل الدخول للوصول إلى مساحة عمل جهتك المعزولة' : 'Sign in to access your isolated workspace'}
              </h3>
              <button
                type="button"
                onClick={onRequireSignIn}
                className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
              >
                {isRtl ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}
              </button>
            </div>
          ) : !myTenant ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 text-center space-y-3">
              <Store className="w-8 h-8 text-[#62339A] dark:text-[#A34FE8] mx-auto" />
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl ? 'لا توجد مساحة عمل معزولة مفعّلة لهذا الحساب بعد' : 'No active Tenant Workspace linked yet'}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
                {isRtl
                  ? 'للحصول على مساحة عمل معزولة لمصنعك أو متجرك أو مطعمك، قدّم طلب الانضمام ليتم اعتماده من الإدارة المركزية.'
                  : 'Submit an onboarding application to unlock your isolated workspace upon Central Admin approval.'}
              </p>
              <button
                type="button"
                onClick={onGoToOnboarding}
                className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
              >
                {isRtl ? 'الانتقال إلى اختيار نوع الحساب وبوابة الانضمام' : 'Go to Account & Onboarding'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Isolated Tenant Identity & Sub-Tabs */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {myTenant.logoUrl && (
                      <img
                        src={myTenant.logoUrl}
                        alt={myTenant.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#E2E8F0] dark:border-[#62339A]/40 bg-[#F8FAFC] shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#62339A] text-white inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#A34FE8]" />
                          <span>Isolated Tenant: {myTenant.tenantId}</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {myTenant.status}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#0EA5E9]/15 text-[#0369A1] dark:text-[#A34FE8] font-black">
                          {myTenant.contractStatus === 'in_contracting'
                            ? isRtl ? 'تعاقد جاري' : 'In Contracting'
                            : myTenant.contractStatus === 'prospective'
                              ? isRtl ? 'جهة مرشحة' : 'Prospective'
                              : myTenant.contractStatus === 'unlaunched_sector'
                                ? isRtl ? 'قطاع لم يطلق بعد' : 'Unlaunched Sector'
                                : isRtl ? 'جهة متعاقدة' : 'Contracted Entity'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#F8FAFC] dark:bg-[#292333] text-[#292333] dark:text-[#A34FE8]">
                          {myTenant.entityType}
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-[#292333] dark:text-white mt-1.5">
                        {myTenant.name} — {myTenant.city}
                      </h2>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {isRtl
                          ? `الباقة: ${activePlan?.nameAr || myTenant.planId} · عمولة المنصة: ${effectiveCommission}% · المالك: ${myTenant.ownerUid.slice(0, 10)}...`
                          : `Plan: ${activePlan?.nameEn || myTenant.planId} · Commission: ${effectiveCommission}%`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ['catalog', isRtl ? `المنتجات (${myMerchantCatalog.length})` : `Catalog (${myMerchantCatalog.length})`],
                        ['orders', isRtl ? `الطلبات (${myMerchantOrders.length})` : `Orders (${myMerchantOrders.length})`],
                        ['payments', isRtl ? 'المدفوعات والتسويات' : 'Payments & Payouts'],
                        ['team', isRtl ? `الفريق (${myTenantMembers.length})` : `Team (${myTenantMembers.length})`],
                        ['feedback', isRtl ? `ملاحظات الإعاشة (${myCateringFeedback.length})` : `Feedback (${myCateringFeedback.length})`],
                        ['settings', isRtl ? 'إعدادات المساحة' : 'Settings'],
                      ] as const
                    ).map(([tab, label]) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setWsSubTab(tab)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                          wsSubTab === tab
                            ? 'bg-[#62339A] text-white shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#292333] text-[#292333] dark:text-[#E2E8F0]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const parsed = extractContractDates(myTenant.cateringScheduleText);
                  const exp = getContractExpiryState(parsed.endDate);
                  return (
                    <>
                      {(exp.isExpired || exp.isExpiringSoon || parsed.startDate || parsed.endDate) && (
                        <div
                          className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                            exp.isExpired
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-200 font-black'
                              : exp.isExpiringSoon
                                ? 'bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#0369A1] dark:text-[#A34FE8] font-black'
                                : 'bg-[#F7F5FA] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#62339A]/30 text-[#62339A] dark:text-[#A34FE8] font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>
                              {exp.isExpired
                                ? isRtl
                                  ? `تنبيه تعاقدي: انتهت مدة العقد بتاريخ ${parsed.endDate} — يرجى التواصل مع الإدارة للتجديد.`
                                  : `Contract expired on ${parsed.endDate} — please contact Central Admin.`
                                : exp.isExpiringSoon
                                  ? isRtl
                                    ? `تنبيه قرب الانتهاء: يتبقى ${exp.daysRemaining} يوم على انتهاء التعاقد الحالي.`
                                    : `Expiring soon: ${exp.daysRemaining} days left on active contract.`
                                  : isRtl
                                    ? 'فترة التعاقد المعتمدة:'
                                    : 'Active Contract Term:'}
                            </span>
                          </div>
                          {(parsed.startDate || parsed.endDate) && (
                            <span dir="ltr" className="font-mono font-black tabular-nums">
                              {parsed.startDate || '—'} → {parsed.endDate || '—'}
                            </span>
                          )}
                        </div>
                      )}

                      {parsed.cleanSchedule && (
                        <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 flex items-start gap-2.5 text-xs">
                          <CalendarClock className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-[#292333] dark:text-white">
                              {isRtl ? 'جدول الإعاشة والورديات المعتمد: ' : 'Approved Catering Schedule: '}
                            </span>
                            <span className="text-[#64748B] dark:text-[#CBD5E1]">
                              {parsed.cleanSchedule}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Sub-Tab 1: Catalog & Stock */}
              {wsSubTab === 'catalog' && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
                  <form onSubmit={handleSaveCatalogItem} className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs">
                    <input
                      type="text"
                      required
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      placeholder={isRtl ? 'اسم الصنف / المنتج *' : 'Product / Meal Title *'}
                      className="sm:col-span-2 px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <input
                      type="text"
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      placeholder={isRtl ? 'التصنيف' : 'Category'}
                      className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <input
                      type="number"
                      min={1}
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder={isRtl ? 'السعر' : 'Price'}
                      className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <input
                      type="number"
                      min={0}
                      value={itemStock}
                      onChange={(e) => setItemStock(e.target.value)}
                      placeholder={isRtl ? 'المخزون' : 'Stock'}
                      className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="submit"
                        disabled={savingItem}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#A34FE8]" />
                        <span>
                          {editingItemId
                            ? isRtl ? 'حفظ التعديل' : 'Save Edit'
                            : isRtl ? 'إضافة صنف' : 'Add SKU'}
                        </span>
                      </button>
                      {editingItemId && (
                        <button
                          type="button"
                          onClick={resetCatalogForm}
                          className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold cursor-pointer"
                        >
                          {isRtl ? 'إلغاء' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {myMerchantCatalog.map((item) => (
                      <div
                        key={item.itemId}
                        className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-black text-[#292333] dark:text-white">{item.title}</div>
                          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            {item.category} ·{' '}
                            <span className="text-[#62339A] dark:text-[#A34FE8] font-bold tabular-nums">
                              {item.priceEGP} ج.م
                            </span>{' '}
                            · {isRtl ? `المتاح: ${item.stockQty}` : `Stock: ${item.stockQty}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(item.itemId);
                              setItemTitle(item.title);
                              setItemCategory(item.category);
                              setItemPrice(String(item.priceEGP));
                              setItemStock(String(item.stockQty));
                            }}
                            title={isRtl ? 'تعديل' : 'Edit'}
                            className="p-1.5 rounded-lg bg-white dark:bg-[#292333] text-[#62339A] dark:text-[#A34FE8] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleItem(item)}
                            title={item.isAvailable ? (isRtl ? 'تعطيل' : 'Deactivate') : (isRtl ? 'تفعيل' : 'Activate')}
                            className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {item.isAvailable ? (
                              <ToggleRight className="w-6 h-6 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            title={isRtl ? 'حذف' : 'Delete'}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Orders */}
              {wsSubTab === 'orders' && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
                  {myMerchantOrders.length === 0 ? (
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {isRtl ? 'لا توجد طلبات واردة لمتجرك حتى الآن.' : 'No orders yet.'}
                    </p>
                  ) : (
                    myMerchantOrders.map((ord) => (
                      <div
                        key={ord.orderId}
                        className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            {ord.orderId} · {ord.status}
                          </div>
                          <div className="font-black text-[#292333] dark:text-white">{ord.itemsSummary}</div>
                          <div className="text-[#64748B] dark:text-[#94A3B8]">
                            {ord.customerName} — {ord.dropoffAddress}
                          </div>
                          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                            {isRtl
                              ? `إجمالي ${ord.subtotalEGP} ج.م · عمولة ${ord.platformCommissionEGP} ج.م · صافي الجهة ${ord.netMerchantEGP} ج.م`
                              : `Subtotal ${ord.subtotalEGP} EGP · Net ${ord.netMerchantEGP} EGP`}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {ord.status === 'pending_merchant' && (
                            <button
                              type="button"
                              onClick={() => handleOrderProgress(ord, 'accepted_preparing')}
                              className="px-3 py-1.5 rounded-xl bg-[#62339A] text-white font-bold cursor-pointer"
                            >
                              {isRtl ? 'قبول وتجهيز' : 'Accept'}
                            </button>
                          )}
                          {ord.status === 'accepted_preparing' && (
                            <button
                              type="button"
                              onClick={() => handleDispatchOrderDelivery(ord)}
                              className="px-3 py-1.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black flex items-center gap-1 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'طلب توصيل BASIT' : 'Dispatch Delivery'}</span>
                            </button>
                          )}
                          {ord.status === 'in_delivery' && (
                            <button
                              type="button"
                              onClick={() => handleOrderProgress(ord, 'completed')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                            >
                              {isRtl ? 'إتمام التسليم' : 'Complete'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Online Payments & Settlements */}
              {wsSubTab === 'payments' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-black text-[#292333] dark:text-white">
                        <CreditCard className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                        <span>{isRtl ? 'تحصيل وسداد الفواتير عبر بوابات الدفع' : 'Online Invoice & Order Checkout'}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#62339A] dark:text-[#A34FE8]">
                        {activeCountryObj.currencyEn} ·{' '}
                        {activeCountryObj.supportedGateways
                          .map((g) => (isRtl ? PAYMENT_METHOD_LABELS[g].ar : PAYMENT_METHOD_LABELS[g].en))
                          .join(' / ')}
                      </span>
                    </div>

                    <form onSubmit={handleCreatePaymentIntent} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={checkoutOrderId}
                        onChange={(e) => setCheckoutOrderId(e.target.value)}
                        placeholder={isRtl ? 'رقم الطلب / الفاتورة' : 'Order / Invoice Ref'}
                        className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                      <input
                        type="number"
                        min={1}
                        required
                        value={checkoutAmount}
                        onChange={(e) => setCheckoutAmount(e.target.value)}
                        placeholder={isRtl ? 'المبلغ المطلوب' : 'Amount'}
                        className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                      <select
                        value={selectedGateway}
                        onChange={(e) => setSelectedGateway(e.target.value as PaymentGatewayId)}
                        className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
                      >
                        {activeCountryObj.supportedGateways.map((gw) => (
                          <option key={gw} value={gw}>
                            {isRtl ? PAYMENT_METHOD_LABELS[gw].ar : PAYMENT_METHOD_LABELS[gw].en}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={checkoutBusy}
                        className="px-4 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer"
                      >
                        {checkoutBusy ? (isRtl ? 'جاري التنفيذ...' : 'Processing...') : isRtl ? 'إنشاء طلب دفع' : 'Create Payment'}
                      </button>
                    </form>

                    {selectedGateway === 'vodafone_cash' && (
                      <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-red-700 dark:text-red-300">
                          {isRtl
                            ? 'رقم محفظة فودافون كاش المعتمد للتحويل:'
                            : 'Official Vodafone Cash Wallet Number:'}
                        </span>
                        <span dir="ltr" className="px-3 py-1 rounded-lg bg-white dark:bg-[#292333] border border-red-300 dark:border-red-700 font-mono font-black text-red-700 dark:text-[#A34FE8] select-all">
                          {gatewayConfigs.find((g) => g.providerId === 'vodafone_cash')?.merchantPublicId || VODAFONE_CASH_NUMBER}
                        </span>
                      </div>
                    )}

                    {checkoutError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-bold">
                        {checkoutError}
                      </div>
                    )}

                    {activeIntent && (
                      <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#62339A]/40 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-black text-[#292333] dark:text-white">
                            {activeIntent.provider.toUpperCase()} ({activeIntent.mode}) — {activeIntent.gatewayReference}
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#0EA5E9] text-white font-black">
                            {activeIntent.status} · {activeIntent.amount} {activeIntent.currency}
                          </span>
                        </div>
                        {activeIntent.provider === 'vodafone_cash' && (
                          <div className="text-[11px] font-bold text-red-700 dark:text-red-300">
                            {isRtl ? 'حوّل المبلغ على رقم فودافون كاش:' : 'Transfer to Vodafone Cash:'}{' '}
                            <span dir="ltr" className="font-mono font-black select-all">
                              {gatewayConfigs.find((g) => g.providerId === 'vodafone_cash')?.merchantPublicId || VODAFONE_CASH_NUMBER}
                            </span>
                          </div>
                        )}
                        {activeIntent.mode === 'sandbox' && (
                          <div className="flex flex-wrap gap-2">
                            {(['Paid', 'Failed', 'Cancelled', 'Refunded'] as const).map((act) => (
                              <button
                                key={act}
                                type="button"
                                disabled={checkoutBusy}
                                onClick={() => handleSandboxOutcome(act)}
                                className="px-3 py-1.5 rounded-lg bg-[#62339A] text-white font-bold cursor-pointer"
                              >
                                {isRtl ? `محاكاة نتيجة: ${act}` : `Simulate ${act}`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {myPaymentTransactions.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="font-black text-[#292333] dark:text-white">
                          {isRtl ? 'سجل معاملات الدفع الإلكتروني' : 'Payment Transactions Log'}
                        </div>
                        {myPaymentTransactions.map((tx) => (
                          <div
                            key={tx.txId}
                            className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/25 flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-mono font-bold text-[#62339A] dark:text-[#A34FE8]">{tx.gatewayReference}</span>
                              <span className="mx-2 text-[#64748B] dark:text-[#94A3B8]">
                                ({tx.provider.toUpperCase()} · {tx.mode})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black tabular-nums">
                                {tx.amount} {tx.currency}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-white dark:bg-[#292333] font-bold">
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ledger Settlements */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-black text-[#292333] dark:text-white">
                      <Wallet className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                      <span>{isRtl ? 'كشف حساب المستحقات والعمولات المعزول' : 'Isolated Settlements Ledger'}</span>
                    </div>
                    {myLedgerEntries.length === 0 ? (
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{isRtl ? 'لا توجد تسويات مسجلة بعد.' : 'No ledger entries yet.'}</p>
                    ) : (
                      myLedgerEntries.map((entry) => (
                        <div
                          key={entry.entryId}
                          className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#292333] dark:text-white">
                              {entry.sourceType} ({entry.referenceId})
                            </div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                              {isRtl
                                ? `إجمالي: ${entry.grossAmountEGP} · حصة المنصة: ${entry.platformRevenueEGP}`
                                : `Gross: ${entry.grossAmountEGP} · Platform: ${entry.platformRevenueEGP}`}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="font-black text-emerald-600 tabular-nums">{entry.beneficiaryNetEGP} ج.م</div>
                            <span className="text-[10px] font-bold">{entry.settlementStatus}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Team Members & RBAC */}
              {wsSubTab === 'team' && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-sm font-black text-[#292333] dark:text-white">
                    <Users className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                    <span>{isRtl ? 'فريق عمل المساحة المعزولة والصلاحيات' : 'Isolated Workspace Team Members'}</span>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!staffUid.trim() || !staffName.trim()) return;
                      await addTenantStaffMember(user, myTenant, {
                        memberUid: staffUid,
                        staffName,
                        memberRole: staffRole,
                      });
                      setStaffUid('');
                      setStaffName('');
                      onToast(isRtl ? 'تمت إضافة عضو الفريق بنجاح.' : 'Staff member added.');
                    }}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-2.5"
                  >
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder={isRtl ? 'اسم الموظف / المدير *' : 'Staff Name *'}
                      className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <input
                      type="text"
                      required
                      value={staffUid}
                      onChange={(e) => setStaffUid(e.target.value)}
                      placeholder={isRtl ? 'معرف الحساب UID *' : 'Member UID *'}
                      className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as 'manager' | 'staff')}
                      className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
                    >
                      <option value="manager">{isRtl ? 'مدير مساحة (Manager)' : 'Manager'}</option>
                      <option value="staff">{isRtl ? 'موظف تشغيل (Staff)' : 'Staff'}</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#62339A] text-white font-black cursor-pointer"
                    >
                      {isRtl ? 'إضافة عضو للفريق' : 'Add Member'}
                    </button>
                  </form>

                  <div className="space-y-2">
                    {myTenantMembers.map((m) => (
                      <div
                        key={m.uid}
                        className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-black text-[#292333] dark:text-white">{m.staffName}</div>
                          <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                            {m.uid} · {m.memberRole}
                          </div>
                        </div>
                        {m.memberRole !== 'owner' && (
                          <button
                            type="button"
                            onClick={() => removeTenantStaffMember(user, myTenant.tenantId, m.uid)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 5: Entity Catering & Partner Feedback */}
              {wsSubTab === 'feedback' && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-sm font-black text-[#292333] dark:text-white">
                    <MessageSquare className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                    <span>
                      {isRtl
                        ? 'ملاحظات وبلاغات جودة الإعاشة وشركاء المزايا (معزولة لهذه الجهة)'
                        : 'Entity Catering Quality & Partner Feedback'}
                    </span>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!fbSubject.trim() || !fbDetails.trim()) return;
                      setSendingFb(true);
                      try {
                        const fid = await submitCateringFeedback(user, myTenant.tenantId, {
                          category: fbCategory,
                          subject: fbSubject,
                          details: fbDetails,
                        });
                        setFbSubject('');
                        setFbDetails('');
                        onToast(
                          isRtl
                            ? `تم رفع البلاغ رقم ${fid} للإدارة المركزية.`
                            : `Feedback ${fid} sent to Central Admin.`
                        );
                      } catch (err) {
                        onToast(
                          err instanceof Error
                            ? err.message
                            : isRtl
                              ? 'تعذر إرسال البلاغ.'
                              : 'Failed to submit feedback.'
                        );
                      } finally {
                        setSendingFb(false);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={fbCategory}
                        onChange={(e) =>
                          setFbCategory(
                            e.target.value as 'catering_quality' | 'benefit_partner' | 'general_complaint'
                          )
                        }
                        className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
                      >
                        <option value="catering_quality">
                          {isRtl ? 'ملاحظة على جودة الإعاشة والوجبات' : 'Catering Quality Feedback'}
                        </option>
                        <option value="benefit_partner">
                          {isRtl ? 'ملاحظة على شريك ترفيه ومزايا' : 'Benefit Partner Feedback'}
                        </option>
                        <option value="general_complaint">
                          {isRtl ? 'شكوى أو طلب تشغيلي' : 'Operational Complaint'}
                        </option>
                      </select>
                      <input
                        type="text"
                        required
                        value={fbSubject}
                        onChange={(e) => setFbSubject(e.target.value)}
                        placeholder={isRtl ? 'موضوع الملاحظة / البلاغ *' : 'Subject *'}
                        className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={fbDetails}
                      onChange={(e) => setFbDetails(e.target.value)}
                      placeholder={isRtl ? 'التفاصيل المطلوب معالجتها من الإدارة المركزية...' : 'Details...'}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                    />
                    <button
                      type="submit"
                      disabled={sendingFb}
                      className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer disabled:opacity-60"
                    >
                      {sendingFb
                        ? isRtl ? 'جاري الإرسال...' : 'Sending...'
                        : isRtl ? 'إرسال للإدارة المركزية' : 'Submit Feedback'}
                    </button>
                  </form>

                  {myCateringFeedback.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#62339A]/25">
                      {myCateringFeedback.map((fb) => (
                        <div
                          key={fb.feedbackId}
                          className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-[#292333] dark:text-white">{fb.subject}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#292333] font-black text-[#62339A] dark:text-[#A34FE8]">
                              {fb.status}
                            </span>
                          </div>
                          <p className="text-[#64748B] dark:text-[#94A3B8]">{fb.details}</p>
                          {fb.adminReply && (
                            <p className="text-emerald-700 dark:text-emerald-300 font-bold">
                              {isRtl ? 'رد الإدارة: ' : 'Admin Reply: '}
                              {fb.adminReply}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 6: Workspace Profile Settings */}
              {wsSubTab === 'settings' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const existingDates = extractContractDates(myTenant.cateringScheduleText);
                      await updateTenantProfileSettings(user, myTenant, {
                        name: wsName || myTenant.name,
                        city: wsCity || myTenant.city,
                        deliveryEnabled: wsDelivery,
                        logoUrl: wsLogoUrl || myTenant.logoUrl || '',
                        cateringScheduleText: embedContractDates(
                          wsCateringSchedule || existingDates.cleanSchedule,
                          existingDates.startDate,
                          existingDates.endDate
                        ),
                      });
                      onToast(isRtl ? 'تم حفظ إعدادات مساحة العمل.' : 'Workspace settings saved.');
                    } catch (err) {
                      onToast(
                        err instanceof Error
                          ? err.message
                          : isRtl
                            ? 'تعذر حفظ إعدادات مساحة العمل.'
                            : 'Failed to save workspace settings.'
                      );
                    }
                  }}
                  className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4 text-xs"
                >
                  <div className="flex items-center gap-2 text-sm font-black text-[#292333] dark:text-white">
                    <Settings className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                    <span>{isRtl ? 'بيانات النشاط وإعدادات المساحة المستقلة' : 'Tenant Workspace Settings'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">{isRtl ? 'الاسم التجاري' : 'Business Name'}</label>
                      <input
                        type="text"
                        value={wsName || myTenant.name}
                        onChange={(e) => setWsName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">{isRtl ? 'المدينة / المقر' : 'City'}</label>
                      <input
                        type="text"
                        value={wsCity || myTenant.city}
                        onChange={(e) => setWsCity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">{isRtl ? 'رابط شعار الجهة / المنشأة (Logo URL)' : 'Entity Logo URL'}</label>
                      <input
                        type="url"
                        dir="ltr"
                        value={wsLogoUrl}
                        onChange={(e) => setWsLogoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">{isRtl ? 'جدول الإعاشة والورديات' : 'Catering Schedule'}</label>
                      <input
                        type="text"
                        value={wsCateringSchedule}
                        onChange={(e) => setWsCateringSchedule(e.target.value)}
                        placeholder={isRtl ? 'مثال: 3 ورديات يومياً — تسليم 7ص / 2م / 10م' : 'e.g. 3 daily shifts'}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wsDelivery}
                      onChange={(e) => setWsDelivery(e.target.checked)}
                    />
                    <span>{isRtl ? 'تفعيل التوصيل عبر شبكة BASIT Delivery' : 'Enable BASIT Delivery Integration'}</span>
                  </label>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer"
                  >
                    {isRtl ? 'حفظ التغييرات' : 'Save Workspace Settings'}
                  </button>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: PUBLIC MARKETPLACE & CUSTOMER ORDERS + DIRECT PAYMENT */}
      {activeTab === 'storefront_market' && (
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#292333] dark:text-white">
                  {isRtl ? 'الجهات والمصانع والمتاجر المعتمدة في BASIT | باسط' : 'Approved Partner Storefronts'}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {isRtl ? 'تصفح واطلب مباشرة من أي جهة منضمة مع الدفع الإلكتروني' : 'Browse, order & checkout online'}
                </p>
              </div>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs font-bold"
              >
                <option value="all">{isRtl ? 'كل المتاجر والمصانع' : 'All Storefronts'}</option>
                {publicStorefronts.map((s) => (
                  <option key={s.tenantId} value={s.tenantId}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8FAFC] dark:bg-[#292333] p-3.5 rounded-2xl">
              <input
                type="text"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                placeholder={isRtl ? 'عنوان التوصيل المطلوب للطلب...' : 'Delivery dropoff address...'}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
              <label className="flex items-center gap-2 font-bold text-[#292333] dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsDelivery}
                  onChange={(e) => setNeedsDelivery(e.target.checked)}
                />
                <span>
                  {isRtl
                    ? `شامل توصيل BASIT Delivery (${commissionRule.minDeliveryFeeEGP} ج.م)`
                    : `Include BASIT Delivery (${commissionRule.minDeliveryFeeEGP} EGP)`}
                </span>
              </label>
            </div>

            {filteredPublicCatalog.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                {isRtl
                  ? 'لا توجد أصناف منشورة من التجار المعتمدين حالياً. يمكنك تقديم طلب انضمام وإضافة منتجاتك من مساحتك المعزولة.'
                  : 'No active storefront items yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPublicCatalog.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#62339A] dark:text-[#A34FE8]">{item.storeName}</span>
                      <div className="text-sm font-black text-[#292333] dark:text-white mt-0.5">{item.title}</div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{item.category}</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#62339A]/25">
                      <span className="text-sm font-black text-[#292333] dark:text-white tabular-nums">
                        {item.priceEGP} {isRtl ? 'ج.م' : 'EGP'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCustomerOrder(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer"
                      >
                        {isRtl ? 'اطلب الآن' : 'Order'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && myCustomerOrders.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
              <h3 className="text-sm font-black text-[#292333] dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
                <span>{isRtl ? 'طلباتي التجارية' : 'My Commercial Orders'}</span>
              </h3>
              <div className="space-y-2">
                {myCustomerOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#292333] dark:text-white">{ord.itemsSummary}</div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{ord.orderId} · {ord.dropoffAddress}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#62339A]/15 text-[#62339A] dark:text-[#A34FE8] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
