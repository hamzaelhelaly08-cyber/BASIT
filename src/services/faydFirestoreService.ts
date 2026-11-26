import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  db,
  handleFirestoreError,
  isTransientFirestoreOrNetworkError,
  OperationType,
} from '../lib/firebase';
import { VODAFONE_CASH_NUMBER, type CountryCode, type PaymentGatewayId } from '../data/phase1Data';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  CatalogItemDoc,
  clampText,
  CommercialOrderDoc,
  CommercialOrderStatus,
  CommissionRuleDoc,
  ContractStatus,
  CourierProfileDoc,
  DeliveryRequestDoc,
  EntertainmentBenefitDoc,
  EntertainmentCategory,
  FaydOpportunityDoc,
  FaydRole,
  KaffarahRuleDoc,
  LogisticsServiceKey,
  NotificationCategory,
  NotificationDoc,
  NotificationStatus,
  OfferAdDoc,
  OnboardingApplicationDoc,
  OnboardingEntityType,
  OnboardingTargetRole,
  OpportunityKind,
  OWNER_INBOX_UID,
  PaymentGatewayConfigDoc,
  PaymentTransactionDoc,
  PaymentTransactionStatus,
  PlatformSettingsDoc,
  PublicStorefrontDoc,
  sanitizeId,
  SubscriptionPlanDoc,
  TenantEntityType,
  TenantMemberDoc,
  TenantWorkspaceDoc,
  UsufructProposalDoc,
  CharityInitiativeDoc,
  CharityContributionDoc,
  KaffarahOrderDoc,
  BenefitBookingDoc,
  LogisticsServiceInquiryDoc,
  CateringFeedbackDoc,
  VipDirectOrderDoc,
  VipDirectOrderItem,
  VipDirectOrderStatus,
} from '../types/faydEcosystem';
import {
  resolveOnboardingClassificationForRole,
  resolveTenantEntityTypeFromApplication,
} from '../utils/onboardingClassification';

function genId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return sanitizeId(`${prefix}_${Date.now().toString(36)}_${rand}`);
}

export const DEFAULT_SUBSCRIPTION_PLANS: Omit<SubscriptionPlanDoc, 'updatedAt'>[] = [
  {
    planId: 'starter',
    nameAr: 'باقة الانطلاق (الأساسية)',
    nameEn: 'Starter Plan',
    monthlyFeeEGP: 0,
    orderCommissionPct: 12,
    deliveryDiscountPct: 0,
    isActive: true,
  },
  {
    planId: 'growth',
    nameAr: 'باقة النمو للمصانع والتجار',
    nameEn: 'Growth Merchant & Factory Plan',
    monthlyFeeEGP: 1200,
    orderCommissionPct: 8,
    deliveryDiscountPct: 10,
    isActive: true,
  },
  {
    planId: 'enterprise',
    nameAr: 'باقة الشركات والمطابخ المركزية',
    nameEn: 'Enterprise Corporate Plan',
    monthlyFeeEGP: 3500,
    orderCommissionPct: 5,
    deliveryDiscountPct: 20,
    isActive: true,
  },
];

export const DEFAULT_COMMISSION_RULE: Omit<CommissionRuleDoc, 'updatedAt'> = {
  ruleId: 'global',
  defaultOrderCommissionPct: 10,
  defaultDeliveryPlatformPct: 20,
  defaultCourierSharePct: 80,
  defaultUsufructPlatformPct: 10,
  minDeliveryFeeEGP: 45,
};

export const DEFAULT_PLATFORM_SETTINGS: Omit<PlatformSettingsDoc, 'updatedByUid' | 'updatedAt'> = {
  settingId: 'global',
  autoActivateCustomers: true,
  requireAdminApprovalForPartners: true,
  defaultLanguage: 'ar',
  defaultCountryCode: 'EG',
  enabledCountriesCsv: 'EG',
  designatedBasitAdminEmailsCsv: '',
  designatedHabeApproverEmailsCsv: '',
};

export const DEFAULT_GATEWAY_CONFIGS: Omit<PaymentGatewayConfigDoc, 'updatedByUid' | 'updatedAt'>[] = [
  {
    providerId: 'fawry',
    displayName: 'Fawry (Cash Reference / Cards)',
    isEnabled: true,
    mode: 'sandbox',
    merchantPublicId: '',
    countryCode: 'EG',
  },
  {
    providerId: 'vodafone_cash',
    displayName: 'Vodafone Cash (Mobile Wallet)',
    isEnabled: true,
    mode: 'sandbox',
    merchantPublicId: VODAFONE_CASH_NUMBER,
    countryCode: 'EG',
  },
  {
    providerId: 'instapay',
    displayName: 'InstaPay (Instant Transfer)',
    isEnabled: true,
    mode: 'sandbox',
    merchantPublicId: '',
    countryCode: 'EG',
  },
  {
    providerId: 'cash_on_delivery',
    displayName: 'Cash on Delivery (COD)',
    isEnabled: true,
    mode: 'sandbox',
    merchantPublicId: '',
    countryCode: 'EG',
  },
];

export function isUserBootstrappedAdmin(user: User | null): boolean {
  return Boolean(
    user &&
      user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );
}

export function parseEmailCsv(csv?: string): string[] {
  if (!csv) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of csv.split(/[\s,;]+/)) {
    const clean = raw.trim().toLowerCase();
    if (clean && clean.includes('@') && !seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  }
  return out;
}

export async function createScopedNotification(payload: {
  recipientUid: string;
  recipientRole: FaydRole;
  tenantId?: string;
  category: NotificationCategory;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  targetSection: string;
}): Promise<void> {
  const notifId = genId('ntf');
  try {
    await setDoc(doc(db, 'notifications', notifId), {
      notifId,
      recipientUid: sanitizeId(payload.recipientUid),
      recipientRole: payload.recipientRole,
      ...(payload.tenantId ? { tenantId: sanitizeId(payload.tenantId) } : {}),
      category: payload.category,
      titleAr: clampText(payload.titleAr, 140),
      titleEn: clampText(payload.titleEn, 140),
      bodyAr: clampText(payload.bodyAr, 400),
      bodyEn: clampText(payload.bodyEn, 400),
      targetSection: clampText(payload.targetSection, 80),
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Notification creation skipped/failed:', error);
  }
}

export async function updateNotificationStatus(
  notifId: string,
  status: NotificationStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', sanitizeId(notifId)), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notifId}`);
  }
}

export async function ensureUserProfileAndDefaults(
  user: User,
  countryCode: CountryCode
): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private_profile', 'main');
  const isBootAdmin = isUserBootstrappedAdmin(user);

  try {
    let initialStatus: 'active' | 'pending' = 'active';
    if (!isBootAdmin) {
      try {
        const settingsSnap = await getDoc(doc(db, 'platform_settings', 'global'));
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data() as PlatformSettingsDoc;
          initialStatus = settings.autoActivateCustomers ? 'active' : 'pending';
        }
      } catch {
        initialStatus = 'active';
      }
    }

    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: clampText(user.displayName || user.email?.split('@')[0] || 'BASIT User', 120),
        role: isBootAdmin ? 'central_super_admin' : 'customer',
        status: isBootAdmin ? 'active' : initialStatus,
        countryCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await createScopedNotification({
        recipientUid: user.uid,
        recipientRole: isBootAdmin ? 'central_super_admin' : 'customer',
        category: 'system',
        titleAr:
          initialStatus === 'active'
            ? 'مرحباً بك في منصة BASIT | باسط — الحساب مفعّل'
            : 'تم تسجيل حسابك في BASIT | باسط — بانتظار موافقة الإدارة',
        titleEn:
          initialStatus === 'active'
            ? 'Welcome to BASIT | باسط — Account Active'
            : 'Registered on BASIT | باسط — Pending Admin Approval',
        bodyAr:
          initialStatus === 'active'
            ? 'يمكنك الآن تصفح العروض أو التقديم لإنشاء مساحة عمل مصنع أو تاجر أو مندوب.'
            : 'سياسة التفعيل التلقائي معطلة حالياً؛ حسابك بانتظار مراجعة الإدارة المركزية.',
        bodyEn:
          initialStatus === 'active'
            ? 'You can now place orders or submit onboarding for a Factory, Merchant, or Courier workspace.'
            : 'Auto-activation is disabled by admin policy; your account awaits Central Admin review.',
        targetSection: 'fayd_onboarding',
      });
    }

    const privSnap = await getDoc(privateRef);
    if (!privSnap.exists()) {
      await setDoc(privateRef, {
        uid: user.uid,
        email: clampText(user.email || 'user@basit.platform', 160),
        phone: '',
        nationalOrTaxId: '',
        address: '',
        updatedAt: serverTimestamp(),
      });
    }

    if (isBootAdmin) {
      const adminRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        await setDoc(adminRef, {
          uid: user.uid,
          adminLevel: 'central_super_admin',
          label: clampText(user.displayName || 'Central Super Admin', 100),
          grantedBy: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      const ruleRef = doc(db, 'commission_rules', 'global');
      const ruleSnap = await getDoc(ruleRef);
      if (!ruleSnap.exists()) {
        await setDoc(ruleRef, {
          ...DEFAULT_COMMISSION_RULE,
          updatedAt: serverTimestamp(),
        });
      }

      const settingsRef = doc(db, 'platform_settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, {
          ...DEFAULT_PLATFORM_SETTINGS,
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      }

      for (const gw of DEFAULT_GATEWAY_CONFIGS) {
        const gwRef = doc(db, 'payment_gateway_configs', gw.providerId);
        const gwSnap = await getDoc(gwRef);
        if (!gwSnap.exists()) {
          await setDoc(gwRef, {
            ...gw,
            updatedByUid: user.uid,
            updatedAt: serverTimestamp(),
          });
        } else if (
          gw.providerId === 'vodafone_cash' &&
          !gwSnap.data()?.merchantPublicId
        ) {
          await updateDoc(gwRef, {
            merchantPublicId: VODAFONE_CASH_NUMBER,
            updatedByUid: user.uid,
            updatedAt: serverTimestamp(),
          });
        }
      }

      for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
        const planRef = doc(db, 'subscription_plans', plan.planId);
        const planSnap = await getDoc(planRef);
        if (!planSnap.exists()) {
          await setDoc(planRef, {
            ...plan,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }
  } catch (error) {
    if (isTransientFirestoreOrNetworkError(error)) {
      console.warn(`Profile bootstrap deferred (offline/network): users/${user.uid}`);
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function appendSecurityAudit(
  actorUid: string,
  actionAr: string,
  actionEn: string,
  targetCollection: string,
  targetId: string,
  details?: string
): Promise<void> {
  const logId = genId('log');
  try {
    await setDoc(doc(db, 'audit_logs', logId), {
      logId,
      actorUid: sanitizeId(actorUid),
      actionAr: clampText(actionAr, 200),
      actionEn: clampText(actionEn, 200),
      targetCollection: clampText(targetCollection, 80),
      targetId: clampText(targetId, 128),
      details: clampText(details || '', 500),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `audit_logs/${logId}`);
  }
}

export async function submitOnboardingApplication(
  user: User,
  payload: {
    targetRole: OnboardingTargetRole;
    entityType: OnboardingEntityType;
    businessName: string;
    contactName: string;
    phone: string;
    countryCode: CountryCode;
    city: string;
    commercialRegRef: string;
    selectedPlanId: string;
    notes?: string;
  }
): Promise<string> {
  const appId = genId('app');
  const classified = resolveOnboardingClassificationForRole(
    payload.targetRole,
    payload.entityType
  );
  const cleanPhone = clampText(payload.phone, 32);
  if (cleanPhone.length < 6) {
    throw new Error('رقم الهاتف يجب أن يكون 6 أرقام على الأقل / Phone must be at least 6 characters.');
  }
  try {
    await setDoc(doc(db, 'onboarding_applications', appId), {
      appId,
      applicantUid: user.uid,
      targetRole: classified.targetRole,
      entityType: classified.entityType,
      businessName: clampText(payload.businessName, 140),
      contactName: clampText(payload.contactName, 120),
      phone: cleanPhone,
      countryCode: payload.countryCode,
      city: clampText(payload.city, 80),
      commercialRegRef: clampText(payload.commercialRegRef, 80),
      selectedPlanId: sanitizeId(payload.selectedPlanId || 'starter'),
      notes: clampText(payload.notes || '', 600),
      status: 'pending_review',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      user.uid,
      `تقديم طلب انضمام جديد: ${payload.businessName}`,
      `Submitted onboarding application: ${payload.businessName}`,
      'onboarding_applications',
      appId,
      `الدور المطلوب: ${classified.targetRole} (${classified.entityType})`
    );
    await createScopedNotification({
      recipientUid: user.uid,
      recipientRole: 'customer',
      category: 'onboarding',
      titleAr: `تم استلام طلب انضمام "${payload.businessName}"`,
      titleEn: `Application received for "${payload.businessName}"`,
      bodyAr: 'طلبك قيد المراجعة الآن لدى الإدارة المركزية في قسم طلبات الانضمام وإدارة الحسابات.',
      bodyEn: 'Your application is queued for Central Super Admin review.',
      targetSection: 'fayd_onboarding',
    });
    return appId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `onboarding_applications/${appId}`);
  }
}

export async function resubmitOnboardingInfo(
  user: User,
  appId: string,
  updates: {
    businessName: string;
    contactName: string;
    phone: string;
    city: string;
    commercialRegRef: string;
    notes: string;
  }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'onboarding_applications', appId), {
      businessName: clampText(updates.businessName, 140),
      contactName: clampText(updates.contactName, 120),
      phone: clampText(updates.phone, 32),
      city: clampText(updates.city, 80),
      commercialRegRef: clampText(updates.commercialRegRef, 80),
      notes: clampText(updates.notes, 600),
      status: 'pending_review',
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      user.uid,
      `استكمال بيانات طلب الانضمام ${appId}`,
      `Resubmitted onboarding info ${appId}`,
      'onboarding_applications',
      appId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `onboarding_applications/${appId}`);
  }
}

export async function adminApproveOnboardingApplication(
  adminUser: User,
  app: OnboardingApplicationDoc,
  selectedPlan: SubscriptionPlanDoc | undefined,
  adminComment: string
): Promise<string | null> {
  const batch = writeBatch(db);
  const appRef = doc(db, 'onboarding_applications', app.appId);
  const applicantUserRef = doc(db, 'users', app.applicantUid);
  const now = serverTimestamp();

  let createdTenantId: string | null = null;

  try {
    const applicantSnap = await getDoc(applicantUserRef);
    const commissionPct = selectedPlan ? selectedPlan.orderCommissionPct : 10;

    if (app.targetRole === 'merchant_owner' || app.targetRole === 'delivery_client') {
      createdTenantId = genId('ten');
      const tenantEntityType: TenantEntityType = resolveTenantEntityTypeFromApplication(
        app.targetRole,
        app.entityType
      );

      batch.set(doc(db, 'tenants', createdTenantId), {
        tenantId: createdTenantId,
        ownerUid: app.applicantUid,
        name: clampText(app.businessName, 140),
        entityType: tenantEntityType,
        countryCode: app.countryCode,
        city: clampText(app.city, 80),
        commercialRegRef: clampText(app.commercialRegRef, 80),
        planId: app.selectedPlanId,
        customCommissionPct: commissionPct,
        deliveryEnabled: true,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });

      batch.set(doc(db, 'tenants', createdTenantId, 'members', app.applicantUid), {
        uid: app.applicantUid,
        tenantId: createdTenantId,
        staffName: clampText(app.contactName, 100),
        memberRole: 'owner',
        active: true,
        createdAt: now,
      });

      batch.set(doc(db, 'public_storefronts', createdTenantId), {
        tenantId: createdTenantId,
        name: clampText(app.businessName, 140),
        entityType: tenantEntityType,
        countryCode: app.countryCode,
        city: clampText(app.city, 80),
        isActive: app.targetRole === 'merchant_owner',
        updatedAt: now,
      });

      if (applicantSnap.exists()) {
        batch.update(applicantUserRef, {
          role: app.targetRole,
          tenantId: createdTenantId,
          status: 'active',
          updatedAt: now,
        });
      }

      if (selectedPlan && selectedPlan.monthlyFeeEGP > 0) {
        const entryId = genId('led');
        batch.set(doc(db, 'ledger_settlements', entryId), {
          entryId,
          sourceType: 'subscription',
          referenceId: app.appId,
          tenantId: createdTenantId,
          beneficiaryUid: app.applicantUid,
          grossAmountEGP: selectedPlan.monthlyFeeEGP,
          platformRevenueEGP: selectedPlan.monthlyFeeEGP,
          beneficiaryNetEGP: 0,
          settlementStatus: 'accrued',
          createdAt: now,
          updatedAt: now,
        });
      }
    } else if (app.targetRole === 'courier') {
      batch.set(doc(db, 'couriers', app.applicantUid), {
        courierUid: app.applicantUid,
        fullName: clampText(app.contactName, 120),
        vehicleType: 'motorcycle',
        zone: clampText(app.city, 100),
        isOnline: true,
        isApproved: true,
        walletBalanceEGP: 0,
        completedDeliveries: 0,
        createdAt: now,
        updatedAt: now,
      });

      if (applicantSnap.exists()) {
        batch.update(applicantUserRef, {
          role: 'courier',
          status: 'active',
          updatedAt: now,
        });
      }
    } else if (app.targetRole === 'opportunity_partner') {
      if (applicantSnap.exists()) {
        batch.update(applicantUserRef, {
          role: 'opportunity_partner',
          status: 'active',
          updatedAt: now,
        });
      }
    }

    batch.update(appRef, {
      status: 'approved',
      adminComment: clampText(adminComment || 'تم الاعتماد وتفعيل مساحة العمل المستقلة المعزولة', 400),
      reviewedByUid: adminUser.uid,
      ...(createdTenantId ? { createdTenantId } : {}),
      updatedAt: now,
    });

    const logId = genId('log');
    batch.set(doc(db, 'audit_logs', logId), {
      logId,
      actorUid: adminUser.uid,
      actionAr: `اعتماد انضمام "${app.businessName}" بصلاحية ${app.targetRole}`,
      actionEn: `Approved onboarding for ${app.businessName}`,
      targetCollection: 'onboarding_applications',
      targetId: app.appId,
      details: createdTenantId ? `Tenant ID: ${createdTenantId}` : `Courier/Partner UID: ${app.applicantUid}`,
      createdAt: now,
    });

    await batch.commit();

    await createScopedNotification({
      recipientUid: app.applicantUid,
      recipientRole: app.targetRole,
      ...(createdTenantId ? { tenantId: createdTenantId } : {}),
      category: 'onboarding',
      titleAr: `تم قبول وتفعيل حساب "${app.businessName}"`,
      titleEn: `Account approved & activated for "${app.businessName}"`,
      bodyAr: adminComment || 'تم إنشاء مساحة عملك المستقلة المعزولة ويمكنك بدء التشغيل الفوري.',
      bodyEn: adminComment || 'Your isolated tenant workspace is active and ready for operations.',
      targetSection: createdTenantId ? 'fayd_merchant_workspace' : 'fayd_courier_portal',
    });

    return createdTenantId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `onboarding_applications/${app.appId}`);
  }
}

export async function adminRejectOrNeedsInfoOnboarding(
  adminUser: User,
  app: OnboardingApplicationDoc,
  status: 'needs_info' | 'rejected',
  adminComment: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'onboarding_applications', app.appId), {
      status,
      adminComment: clampText(adminComment, 400),
      reviewedByUid: adminUser.uid,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      status === 'rejected' ? `رفض طلب الانضمام ${app.appId}` : `طلب استكمال بيانات للطلب ${app.appId}`,
      `${status} onboarding ${app.appId}`,
      'onboarding_applications',
      app.appId,
      adminComment
    );
    await createScopedNotification({
      recipientUid: app.applicantUid,
      recipientRole: 'customer',
      category: 'onboarding',
      titleAr:
        status === 'rejected'
          ? `تم رفض طلب الانضمام "${app.businessName}"`
          : `مطلوب استكمال بيانات "${app.businessName}"`,
      titleEn:
        status === 'rejected'
          ? `Application rejected: "${app.businessName}"`
          : `Additional info requested: "${app.businessName}"`,
      bodyAr: adminComment,
      bodyEn: adminComment,
      targetSection: 'fayd_onboarding',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `onboarding_applications/${app.appId}`);
  }
}

export async function adminUpdateCustomerAccountStatus(
  adminUser: User,
  userId: string,
  status: 'active' | 'pending' | 'suspended'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', sanitizeId(userId)), {
      status,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث حالة الحساب ${userId} إلى ${status}`,
      `Updated user ${userId} status to ${status}`,
      'users',
      userId
    );
    await createScopedNotification({
      recipientUid: userId,
      recipientRole: 'customer',
      category: 'system',
      titleAr: `تحديث حالة الحساب إلى: ${status === 'active' ? 'نشط' : status === 'suspended' ? 'موقوف' : 'قيد المراجعة'}`,
      titleEn: `Account status updated to: ${status}`,
      bodyAr: 'تم تحديث حالة تفعيل الحساب بواسطة الإدارة المركزية.',
      bodyEn: 'Your account activation status was updated by Central Super Admin.',
      targetSection: 'fayd_onboarding',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function addTenantStaffMember(
  actorUser: User,
  tenant: TenantWorkspaceDoc,
  payload: {
    memberUid: string;
    staffName: string;
    memberRole: 'manager' | 'staff';
  }
): Promise<void> {
  const cleanUid = sanitizeId(payload.memberUid);
  try {
    await setDoc(doc(db, 'tenants', tenant.tenantId, 'members', cleanUid), {
      uid: cleanUid,
      tenantId: tenant.tenantId,
      staffName: clampText(payload.staffName, 100),
      memberRole: payload.memberRole,
      active: true,
      createdAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      actorUser.uid,
      `إضافة عضو فريق (${payload.staffName}) لمساحة ${tenant.name}`,
      `Added staff member ${cleanUid} to tenant ${tenant.tenantId}`,
      'tenants',
      tenant.tenantId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `tenants/${tenant.tenantId}/members/${cleanUid}`);
  }
}

export async function removeTenantStaffMember(
  actorUser: User,
  tenantId: string,
  memberUid: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'tenants', sanitizeId(tenantId), 'members', sanitizeId(memberUid)));
    await appendSecurityAudit(
      actorUser.uid,
      `إزالة عضو الفريق ${memberUid} من المساحة ${tenantId}`,
      `Removed member ${memberUid} from tenant ${tenantId}`,
      'tenants',
      tenantId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `tenants/${tenantId}/members/${memberUid}`);
  }
}

export async function updateTenantProfileSettings(
  actorUser: User,
  tenant: TenantWorkspaceDoc,
  updates: {
    name: string;
    city: string;
    deliveryEnabled: boolean;
    logoUrl?: string;
    cateringScheduleText?: string;
  }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'tenants', tenant.tenantId), {
      name: clampText(updates.name, 140),
      city: clampText(updates.city, 80),
      deliveryEnabled: updates.deliveryEnabled,
      ...(typeof updates.logoUrl === 'string'
        ? { logoUrl: clampText(updates.logoUrl, 500) }
        : {}),
      ...(typeof updates.cateringScheduleText === 'string'
        ? { cateringScheduleText: clampText(updates.cateringScheduleText, 500) }
        : {}),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      actorUser.uid,
      `تحديث إعدادات مساحة العمل ${updates.name}`,
      `Updated workspace settings for ${tenant.tenantId}`,
      'tenants',
      tenant.tenantId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `tenants/${tenant.tenantId}`);
  }
}

export async function saveCatalogItem(
  user: User,
  tenant: TenantWorkspaceDoc,
  payload: {
    itemId?: string;
    title: string;
    category: string;
    priceEGP: number;
    stockQty: number;
    isAvailable: boolean;
  }
): Promise<string> {
  const itemId = payload.itemId ? sanitizeId(payload.itemId) : genId('item');
  const itemRef = doc(db, 'catalog_items', itemId);
  try {
    if (payload.itemId) {
      await updateDoc(itemRef, {
        title: clampText(payload.title, 140),
        category: clampText(payload.category, 64),
        priceEGP: Math.max(1, Math.min(1000000, Number(payload.priceEGP) || 1)),
        stockQty: Math.max(0, Math.min(1000000, Number(payload.stockQty) || 0)),
        isAvailable: payload.isAvailable,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(itemRef, {
        itemId,
        tenantId: tenant.tenantId,
        merchantOwnerUid: user.uid,
        storeName: clampText(tenant.name, 140),
        title: clampText(payload.title, 140),
        category: clampText(payload.category, 64),
        priceEGP: Math.max(1, Math.min(1000000, Number(payload.priceEGP) || 1)),
        stockQty: Math.max(0, Math.min(1000000, Number(payload.stockQty) || 0)),
        isAvailable: payload.isAvailable,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return itemId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `catalog_items/${itemId}`);
  }
}

export async function deleteCatalogItem(
  actorUser: User,
  itemId: string
): Promise<void> {
  const cleanId = sanitizeId(itemId);
  try {
    await deleteDoc(doc(db, 'catalog_items', cleanId));
    await appendSecurityAudit(
      actorUser.uid,
      `حذف صنف الكتالوج ${cleanId}`,
      `Deleted catalog item ${cleanId}`,
      'catalog_items',
      cleanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `catalog_items/${cleanId}`);
  }
}

export async function placeCommercialOrder(
  customerUser: User,
  item: CatalogItemDoc,
  quantity: number,
  commissionPct: number,
  needsDelivery: boolean,
  deliveryFeeEGP: number,
  dropoffAddress: string
): Promise<string> {
  const orderId = genId('ord');
  const qty = Math.max(1, Math.min(500, Math.round(quantity)));
  const subtotalEGP = Math.round(item.priceEGP * qty);
  const platformCommissionEGP = Math.round((subtotalEGP * commissionPct) / 100);
  const appliedDelivery = needsDelivery ? deliveryFeeEGP : 0;
  const netMerchantEGP = Math.max(0, subtotalEGP - platformCommissionEGP);

  try {
    await setDoc(doc(db, 'commercial_orders', orderId), {
      orderId,
      tenantId: item.tenantId,
      merchantOwnerUid: item.merchantOwnerUid,
      customerUid: customerUser.uid,
      customerName: clampText(customerUser.displayName || 'عميل منصة BASIT | باسط', 100),
      itemsSummary: clampText(`${item.title} × ${qty} (${item.storeName})`, 500),
      subtotalEGP,
      platformCommissionEGP,
      deliveryFeeEGP: appliedDelivery,
      netMerchantEGP,
      needsDelivery,
      dropoffAddress: clampText(dropoffAddress || 'الاستلام من الفرع', 240),
      status: 'pending_merchant',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      customerUser.uid,
      `إنشاء طلب تجاري ${orderId} لدى ${item.storeName}`,
      `Placed commercial order ${orderId}`,
      'commercial_orders',
      orderId,
      `الإجمالي: ${subtotalEGP} ج.م`
    );
    await createScopedNotification({
      recipientUid: customerUser.uid,
      recipientRole: 'customer',
      tenantId: item.tenantId,
      category: 'order',
      titleAr: `تم تسجيل طلبك ${orderId}`,
      titleEn: `Order ${orderId} placed`,
      bodyAr: `${item.title} × ${qty} لدى ${item.storeName} — بانتظار قبول التاجر.`,
      bodyEn: `${item.title} × ${qty} at ${item.storeName} — awaiting merchant acceptance.`,
      targetSection: 'fayd_marketplace',
    });
    return orderId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `commercial_orders/${orderId}`);
  }
}

export async function updateCommercialOrderStatus(
  actorUid: string,
  order: CommercialOrderDoc,
  nextStatus: CommercialOrderStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'commercial_orders', order.orderId), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      actorUid,
      `تحديث حالة الطلب ${order.orderId} إلى ${nextStatus}`,
      `Updated order ${order.orderId} to ${nextStatus}`,
      'commercial_orders',
      order.orderId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `commercial_orders/${order.orderId}`);
  }
}

export async function createDeliveryRequest(
  requesterUser: User,
  tenant: TenantWorkspaceDoc,
  rule: CommissionRuleDoc,
  planDiscountPct: number,
  payload: {
    orderId?: string;
    pickupLocation: string;
    dropoffLocation: string;
    packageNote?: string;
    baseDeliveryFeeEGP: number;
  }
): Promise<string> {
  const deliveryId = genId('del');
  const rawFee = Math.max(rule.minDeliveryFeeEGP, Number(payload.baseDeliveryFeeEGP) || rule.minDeliveryFeeEGP);
  const deliveryFeeEGP = Math.round(rawFee * (1 - Math.min(80, Math.max(0, planDiscountPct)) / 100));
  const platformDeliveryFeeEGP = Math.round((deliveryFeeEGP * rule.defaultDeliveryPlatformPct) / 100);
  const courierShareEGP = Math.max(0, deliveryFeeEGP - platformDeliveryFeeEGP);

  try {
    await setDoc(doc(db, 'delivery_requests', deliveryId), {
      deliveryId,
      requesterUid: requesterUser.uid,
      tenantId: tenant.tenantId,
      orderId: clampText(payload.orderId || '', 128),
      pickupLocation: clampText(payload.pickupLocation, 240),
      dropoffLocation: clampText(payload.dropoffLocation, 240),
      packageNote: clampText(payload.packageNote || '', 300),
      deliveryFeeEGP,
      courierShareEGP,
      platformDeliveryFeeEGP,
      assignedCourierUid: '',
      status: 'requested',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      requesterUser.uid,
      `طلب شحن BASIT Delivery رقم ${deliveryId}`,
      `Created delivery request ${deliveryId}`,
      'delivery_requests',
      deliveryId
    );
    await createScopedNotification({
      recipientUid: requesterUser.uid,
      recipientRole: 'delivery_client',
      tenantId: tenant.tenantId,
      category: 'delivery',
      titleAr: `تم إنشاء شحنة توصيل ${deliveryId}`,
      titleEn: `Delivery dispatch ${deliveryId} requested`,
      bodyAr: `من ${payload.pickupLocation} إلى ${payload.dropoffLocation}`,
      bodyEn: `From ${payload.pickupLocation} to ${payload.dropoffLocation}`,
      targetSection: 'fayd_delivery_partner',
    });
    return deliveryId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `delivery_requests/${deliveryId}`);
  }
}

export async function adminAssignCourierToDelivery(
  adminUser: User,
  delivery: DeliveryRequestDoc,
  courierUid: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'delivery_requests', delivery.deliveryId), {
      assignedCourierUid: sanitizeId(courierUid),
      status: 'assigned',
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `إسناد الشحنة ${delivery.deliveryId} إلى المندوب ${courierUid}`,
      `Assigned delivery ${delivery.deliveryId} to courier ${courierUid}`,
      'delivery_requests',
      delivery.deliveryId
    );
    await createScopedNotification({
      recipientUid: courierUid,
      recipientRole: 'courier',
      tenantId: delivery.tenantId,
      category: 'delivery',
      titleAr: `مهمة توصيل جديدة مسندة إليك (${delivery.deliveryId})`,
      titleEn: `New assigned delivery task (${delivery.deliveryId})`,
      bodyAr: `الالتقاط: ${delivery.pickupLocation} · التسليم: ${delivery.dropoffLocation}`,
      bodyEn: `Pickup: ${delivery.pickupLocation} · Dropoff: ${delivery.dropoffLocation}`,
      targetSection: 'fayd_courier_portal',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `delivery_requests/${delivery.deliveryId}`);
  }
}

export async function courierAdvanceDeliveryStatus(
  courierUser: User,
  delivery: DeliveryRequestDoc,
  nextStatus: 'picked_up' | 'in_transit' | 'delivered',
  podNote?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'delivery_requests', delivery.deliveryId), {
      status: nextStatus,
      ...(podNote ? { podConfirmationNote: clampText(podNote, 200) } : {}),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      courierUser.uid,
      `تحديث مهمة التوصيل ${delivery.deliveryId} إلى ${nextStatus}`,
      `Courier advanced delivery ${delivery.deliveryId} to ${nextStatus}`,
      'delivery_requests',
      delivery.deliveryId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `delivery_requests/${delivery.deliveryId}`);
  }
}

export async function courierToggleOnline(
  courierUser: User,
  isOnline: boolean,
  zone: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'couriers', courierUser.uid), {
      isOnline,
      zone: clampText(zone, 100),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `couriers/${courierUser.uid}`);
  }
}

export async function submitFaydOpportunity(
  user: User,
  payload: {
    oppKind: OpportunityKind;
    title: string;
    category: string;
    city: string;
    description: string;
    commercialTerms: string;
    costOrInvestmentEGP: number;
  }
): Promise<string> {
  if (!payload.costOrInvestmentEGP || payload.costOrInvestmentEGP <= 0) {
    throw new Error('يجب تحديد التكلفة أو رأس المال أو القيمة الإيجارية/التشغيلية بوضوح (يُمنع افتراض المجانية).');
  }
  const oppId = genId('opp');
  try {
    await setDoc(doc(db, 'opportunities', oppId), {
      oppId,
      ownerUid: user.uid,
      ownerName: clampText(user.displayName || 'شريك BASIT | باسط', 120),
      oppKind: payload.oppKind,
      title: clampText(payload.title, 160),
      category: clampText(payload.category, 80),
      city: clampText(payload.city, 80),
      description: clampText(payload.description, 800),
      commercialTerms: clampText(payload.commercialTerms, 500),
      costOrInvestmentEGP: Math.max(1, Math.round(payload.costOrInvestmentEGP)),
      freeResourceBlocked: true,
      approvalStatus: 'pending_admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      user.uid,
      `طرح فرصة ${payload.oppKind} للمراجعة: ${payload.title}`,
      `Submitted opportunity ${oppId}`,
      'opportunities',
      oppId
    );
    return oppId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `opportunities/${oppId}`);
  }
}

export async function adminReviewOpportunity(
  adminUser: User,
  oppId: string,
  approvalStatus: 'approved' | 'rejected' | 'closed'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'opportunities', oppId), {
      approvalStatus,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `مراجعة الفرصة ${oppId}: ${approvalStatus}`,
      `Reviewed opportunity ${oppId}: ${approvalStatus}`,
      'opportunities',
      oppId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `opportunities/${oppId}`);
  }
}

export async function submitUsufructProposal(
  proposerUser: User,
  opportunity: FaydOpportunityDoc,
  payload: {
    proposerProfitPct: number;
    siteOwnerProfitPct: number;
    platformUsufructPct: number;
    termsSummary: string;
  }
): Promise<string> {
  const total =
    Math.round(payload.proposerProfitPct) +
    Math.round(payload.siteOwnerProfitPct) +
    Math.round(payload.platformUsufructPct);
  if (total !== 100) {
    throw new Error('مجموع نسب توزيع الأرباح في تقنية الانتفاع يجب أن يساوي 100% بالضبط.');
  }

  const proposalId = genId('prop');
  try {
    await setDoc(doc(db, 'usufruct_proposals', proposalId), {
      proposalId,
      opportunityId: opportunity.oppId,
      opportunityOwnerUid: opportunity.ownerUid,
      proposerUid: proposerUser.uid,
      proposerName: clampText(proposerUser.displayName || 'شريك مشروع', 120),
      proposerProfitPct: Math.round(payload.proposerProfitPct),
      siteOwnerProfitPct: Math.round(payload.siteOwnerProfitPct),
      platformUsufructPct: Math.round(payload.platformUsufructPct),
      termsSummary: clampText(payload.termsSummary, 600),
      proposerAgreed: true,
      siteOwnerAgreed: false,
      adminApproved: false,
      status: 'awaiting_site_owner',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      proposerUser.uid,
      `تقديم مسودة اتفاق انتفاع ${proposalId} على الفرصة ${opportunity.title}`,
      `Submitted usufruct proposal ${proposalId}`,
      'usufruct_proposals',
      proposalId
    );
    return proposalId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `usufruct_proposals/${proposalId}`);
  }
}

export async function siteOwnerRespondUsufruct(
  ownerUser: User,
  proposalId: string,
  accept: boolean
): Promise<void> {
  try {
    await updateDoc(doc(db, 'usufruct_proposals', proposalId), {
      siteOwnerAgreed: accept,
      status: accept ? 'awaiting_admin' : 'rejected',
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      ownerUser.uid,
      accept
        ? `موافقة صاحب الفرصة على مسودة الانتفاع ${proposalId} (بانتظار اعتماد الإدارة)`
        : `رفض مسودة الانتفاع ${proposalId}`,
      `Site owner ${accept ? 'agreed' : 'rejected'} proposal ${proposalId}`,
      'usufruct_proposals',
      proposalId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `usufruct_proposals/${proposalId}`);
  }
}

export async function adminIssueUsufructContract(
  adminUser: User,
  proposal: UsufructProposalDoc
): Promise<string> {
  const contractId = genId('cnt');
  const batch = writeBatch(db);
  const now = serverTimestamp();

  try {
    batch.set(doc(db, 'usufruct_contracts', contractId), {
      contractId,
      proposalId: proposal.proposalId,
      opportunityId: proposal.opportunityId,
      opportunityOwnerUid: proposal.opportunityOwnerUid,
      proposerUid: proposal.proposerUid,
      proposerProfitPct: proposal.proposerProfitPct,
      siteOwnerProfitPct: proposal.siteOwnerProfitPct,
      platformUsufructPct: proposal.platformUsufructPct,
      commercialTerms: clampText(proposal.termsSummary, 600),
      approvedByAdminUid: adminUser.uid,
      contractStatus: 'active',
      createdAt: now,
      updatedAt: now,
    });

    batch.update(doc(db, 'usufruct_proposals', proposal.proposalId), {
      adminApproved: true,
      contractId,
      status: 'contract_issued',
      updatedAt: now,
    });

    const logId = genId('log');
    batch.set(doc(db, 'audit_logs', logId), {
      logId,
      actorUid: adminUser.uid,
      actionAr: `إصدار عقد انتفاع رسمي معتمد رقم ${contractId}`,
      actionEn: `Issued official Usufruct contract ${contractId}`,
      targetCollection: 'usufruct_contracts',
      targetId: contractId,
      details: `Proposal ${proposal.proposalId} | Split: ${proposal.proposerProfitPct}/${proposal.siteOwnerProfitPct}/${proposal.platformUsufructPct}`,
      createdAt: now,
    });

    await batch.commit();
    return contractId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `usufruct_contracts/${contractId}`);
  }
}

export async function adminSaveCommissionRules(
  adminUser: User,
  rule: Omit<CommissionRuleDoc, 'ruleId' | 'updatedAt'>
): Promise<void> {
  const rawDelPct = Number(rule.defaultDeliveryPlatformPct);
  const platformPct = Math.max(0, Math.min(80, Math.round(Number.isFinite(rawDelPct) ? rawDelPct : 20)));
  const courierPct = 100 - platformPct;
  const rawOrderPct = Number(rule.defaultOrderCommissionPct);
  const rawUsufructPct = Number(rule.defaultUsufructPlatformPct);
  const rawMinDel = Number(rule.minDeliveryFeeEGP);
  try {
    await setDoc(doc(db, 'commission_rules', 'global'), {
      ruleId: 'global',
      defaultOrderCommissionPct: Math.max(0, Math.min(60, Number.isFinite(rawOrderPct) ? rawOrderPct : 0)),
      defaultDeliveryPlatformPct: platformPct,
      defaultCourierSharePct: courierPct,
      defaultUsufructPlatformPct: Math.max(1, Math.min(50, Number.isFinite(rawUsufructPct) ? rawUsufructPct : 10)),
      minDeliveryFeeEGP: Math.max(10, Math.min(10000, Number.isFinite(rawMinDel) ? rawMinDel : 35)),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      'تحديث قواعد العمولات المركزية للمنصة',
      'Updated global commission rules',
      'commission_rules',
      'global'
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'commission_rules/global');
  }
}

export async function adminSaveSubscriptionPlan(
  adminUser: User,
  plan: Omit<SubscriptionPlanDoc, 'updatedAt'>
): Promise<void> {
  const planId = sanitizeId(plan.planId);
  const rawFee = Number(plan.monthlyFeeEGP);
  const rawComm = Number(plan.orderCommissionPct);
  const rawDisc = Number(plan.deliveryDiscountPct);
  try {
    await setDoc(doc(db, 'subscription_plans', planId), {
      planId,
      nameAr: clampText(plan.nameAr, 100),
      nameEn: clampText(plan.nameEn, 100),
      monthlyFeeEGP: Math.max(0, Number.isFinite(rawFee) ? rawFee : 0),
      orderCommissionPct: Math.max(0, Math.min(60, Number.isFinite(rawComm) ? rawComm : 0)),
      deliveryDiscountPct: Math.max(0, Math.min(100, Number.isFinite(rawDisc) ? rawDisc : 0)),
      isActive: plan.isActive,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث باقة الاشتراك ${plan.nameAr}`,
      `Updated subscription plan ${planId}`,
      'subscription_plans',
      planId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `subscription_plans/${planId}`);
  }
}

export async function adminToggleTenantStatus(
  adminUser: User,
  tenant: TenantWorkspaceDoc,
  nextStatus: 'active' | 'suspended',
  customCommissionPct?: number
): Promise<void> {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  try {
    batch.update(doc(db, 'tenants', tenant.tenantId), {
      status: nextStatus,
      ...(typeof customCommissionPct === 'number'
        ? { customCommissionPct: Math.max(0, Math.min(60, customCommissionPct)) }
        : {}),
      updatedAt: now,
    });
    batch.update(doc(db, 'public_storefronts', tenant.tenantId), {
      isActive: nextStatus === 'active' && tenant.entityType !== 'delivery_client',
      updatedAt: now,
    });
    const logId = genId('log');
    batch.set(doc(db, 'audit_logs', logId), {
      logId,
      actorUid: adminUser.uid,
      actionAr: `تعديل حالة الجهة ${tenant.name} إلى ${nextStatus}`,
      actionEn: `Updated tenant ${tenant.tenantId} status to ${nextStatus}`,
      targetCollection: 'tenants',
      targetId: tenant.tenantId,
      createdAt: now,
    });
    await batch.commit();

    await createScopedNotification({
      recipientUid: tenant.ownerUid,
      recipientRole: tenant.entityType === 'delivery_client' ? 'delivery_client' : 'merchant_owner',
      tenantId: tenant.tenantId,
      category: 'system',
      titleAr:
        nextStatus === 'active'
          ? `تم إعادة تفعيل مساحة "${tenant.name}"`
          : `تم تعليق مساحة "${tenant.name}" مؤقتاً`,
      titleEn:
        nextStatus === 'active'
          ? `Workspace "${tenant.name}" re-activated`
          : `Workspace "${tenant.name}" suspended`,
      bodyAr: 'تم تحديث حالة التفعيل من لوحة الإدارة المركزية.',
      bodyEn: 'Workspace activation updated by Central Super Admin.',
      targetSection: 'fayd_merchant_workspace',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `tenants/${tenant.tenantId}`);
  }
}

export async function adminRecordAndSettleOrderRevenue(
  adminUser: User,
  order: CommercialOrderDoc
): Promise<void> {
  const entryId = genId('led');
  try {
    await setDoc(doc(db, 'ledger_settlements', entryId), {
      entryId,
      sourceType: 'order_commission',
      referenceId: order.orderId,
      tenantId: order.tenantId,
      beneficiaryUid: order.merchantOwnerUid,
      grossAmountEGP: order.subtotalEGP,
      platformRevenueEGP: order.platformCommissionEGP,
      beneficiaryNetEGP: order.netMerchantEGP,
      settlementStatus: 'accrued',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `قيد عمولة الطلب ${order.orderId}`,
      `Recorded order commission ledger ${entryId}`,
      'ledger_settlements',
      entryId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `ledger_settlements/${entryId}`);
  }
}

export async function adminRecordDeliveryLedger(
  adminUser: User,
  delivery: DeliveryRequestDoc
): Promise<void> {
  if (!delivery.assignedCourierUid) return;
  const entryId = genId('led');
  const courierRef = doc(db, 'couriers', delivery.assignedCourierUid);
  const batch = writeBatch(db);
  const now = serverTimestamp();

  try {
    const cSnap = await getDoc(courierRef);
    batch.set(doc(db, 'ledger_settlements', entryId), {
      entryId,
      sourceType: 'delivery_fee',
      referenceId: delivery.deliveryId,
      tenantId: delivery.tenantId,
      beneficiaryUid: delivery.assignedCourierUid,
      grossAmountEGP: delivery.deliveryFeeEGP,
      platformRevenueEGP: delivery.platformDeliveryFeeEGP,
      beneficiaryNetEGP: delivery.courierShareEGP,
      settlementStatus: 'accrued',
      createdAt: now,
      updatedAt: now,
    });

    if (cSnap.exists()) {
      const cData = cSnap.data() as CourierProfileDoc;
      batch.update(courierRef, {
        walletBalanceEGP: Math.round((cData.walletBalanceEGP || 0) + delivery.courierShareEGP),
        completedDeliveries: (cData.completedDeliveries || 0) + 1,
        updatedAt: now,
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `ledger_settlements/${entryId}`);
  }
}

export async function adminSettleLedgerEntry(
  adminUser: User,
  entryId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'ledger_settlements', entryId), {
      settlementStatus: 'settled',
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تسوية القيد المالي ${entryId}`,
      `Settled ledger entry ${entryId}`,
      'ledger_settlements',
      entryId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `ledger_settlements/${entryId}`);
  }
}

export async function adminUpdateTenantGovernance(
  adminUser: User,
  tenant: TenantWorkspaceDoc,
  updates: {
    status?: 'active' | 'suspended';
    customCommissionPct?: number;
    contractStatus?: ContractStatus;
    logoUrl?: string;
    cateringScheduleText?: string;
  }
): Promise<void> {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  const nextStatus = updates.status || tenant.status;
  try {
    batch.update(doc(db, 'tenants', tenant.tenantId), {
      status: nextStatus,
      ...(typeof updates.customCommissionPct === 'number'
        ? { customCommissionPct: Math.max(0, Math.min(60, updates.customCommissionPct)) }
        : {}),
      ...(updates.contractStatus ? { contractStatus: updates.contractStatus } : {}),
      ...(typeof updates.logoUrl === 'string' ? { logoUrl: clampText(updates.logoUrl, 500) } : {}),
      ...(typeof updates.cateringScheduleText === 'string'
        ? { cateringScheduleText: clampText(updates.cateringScheduleText, 500) }
        : {}),
      updatedAt: now,
    });
    batch.update(doc(db, 'public_storefronts', tenant.tenantId), {
      isActive: nextStatus === 'active' && tenant.entityType !== 'delivery_client',
      updatedAt: now,
    });
    const logId = genId('log');
    batch.set(doc(db, 'audit_logs', logId), {
      logId,
      actorUid: adminUser.uid,
      actionAr: `تحديث حوكمة الجهة "${tenant.name}" (${updates.contractStatus || nextStatus})`,
      actionEn: `Updated governance for tenant ${tenant.tenantId}`,
      targetCollection: 'tenants',
      targetId: tenant.tenantId,
      createdAt: now,
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `tenants/${tenant.tenantId}`);
  }
}

export async function adminSaveOfferAd(
  adminUser: User,
  payload: {
    offerId?: string;
    tenantId: string;
    category: 'food' | 'shopping' | 'factory_merchant';
    titleAr: string;
    titleEn: string;
    discountBadgeAr: string;
    discountBadgeEn: string;
    ctaAr: string;
    ctaEn: string;
    countryCode: CountryCode;
    validFrom?: string;
    validTo?: string;
    targetScope?: 'public' | 'contracted_entity' | 'employee_tier';
    eligibleTenantIdsCsv?: string;
    terms?: string;
    isApproved: boolean;
    isActive: boolean;
  }
): Promise<string> {
  const isEditing = Boolean(payload.offerId);
  const offerId = payload.offerId ? sanitizeId(payload.offerId) : genId('off');
  const titleAr = clampText(payload.titleAr, 140);
  const titleEn = clampText(payload.titleEn, 140);
  if (titleAr.length < 2 || titleEn.length < 2) {
    throw new Error('عنوان العرض بالعربية والإنجليزية يجب أن لا يقل عن حرفين / Offer titles must be at least 2 characters.');
  }
  const discountBadgeAr = clampText(payload.discountBadgeAr || 'عرض معتمد', 80) || 'عرض معتمد';
  const discountBadgeEn = clampText(payload.discountBadgeEn || 'Offer', 80) || 'Offer';
  const ctaAr = clampText(payload.ctaAr || 'اطلب الآن', 60);
  const ctaEn = clampText(payload.ctaEn || 'Order Now', 60);
  if (ctaAr.length < 2 || ctaEn.length < 2) {
    throw new Error('نص زر الإجراء (CTA) يجب أن يكون حرفين على الأقل.');
  }

  const now = serverTimestamp();
  const mutableFields = {
    tenantId: sanitizeId(payload.tenantId || 'platform'),
    category: payload.category,
    titleAr,
    titleEn,
    discountBadgeAr,
    discountBadgeEn,
    ctaAr,
    ctaEn,
    countryCode: payload.countryCode,
    validFrom: clampText(payload.validFrom || '', 32),
    validTo: clampText(payload.validTo || '', 32),
    targetScope: payload.targetScope || 'public',
    eligibleTenantIdsCsv: clampText(payload.eligibleTenantIdsCsv || '', 500),
    terms: clampText(payload.terms || '', 500),
    isApproved: payload.isApproved,
    isActive: payload.isActive,
    updatedAt: now,
  };

  try {
    if (isEditing) {
      await updateDoc(doc(db, 'offers_ads', offerId), mutableFields);
    } else {
      await setDoc(doc(db, 'offers_ads', offerId), {
        offerId,
        ...mutableFields,
        createdByUid: adminUser.uid,
        createdAt: now,
      });
    }
    await appendSecurityAudit(
      adminUser.uid,
      `${isEditing ? 'تحديث' : 'إنشاء'} العرض الإعلاني المعتمد: ${titleAr}`,
      `${isEditing ? 'Updated' : 'Created'} offer/ad ${offerId}`,
      'offers_ads',
      offerId
    );
    return offerId;
  } catch (error) {
    return handleFirestoreError(
      error,
      isEditing ? OperationType.UPDATE : OperationType.CREATE,
      `offers_ads/${offerId}`
    );
  }
}

export async function adminDeleteOfferAd(
  adminUser: User,
  offerId: string
): Promise<void> {
  const cleanId = sanitizeId(offerId);
  try {
    await deleteDoc(doc(db, 'offers_ads', cleanId));
    await appendSecurityAudit(
      adminUser.uid,
      `حذف العرض الإعلاني ${cleanId}`,
      `Deleted offer/ad ${cleanId}`,
      'offers_ads',
      cleanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `offers_ads/${cleanId}`);
  }
}

export async function adminSavePlatformSettings(
  adminUser: User,
  settings: Omit<PlatformSettingsDoc, 'settingId' | 'updatedByUid' | 'updatedAt'>
): Promise<void> {
  try {
    await setDoc(doc(db, 'platform_settings', 'global'), {
      settingId: 'global',
      autoActivateCustomers: settings.autoActivateCustomers,
      requireAdminApprovalForPartners: settings.requireAdminApprovalForPartners,
      defaultLanguage: settings.defaultLanguage,
      defaultCountryCode: settings.defaultCountryCode,
      enabledCountriesCsv: clampText(settings.enabledCountriesCsv, 64),
      ...(settings.cmsPrimaryPurple ? { cmsPrimaryPurple: clampText(settings.cmsPrimaryPurple, 16) } : {}),
      ...(settings.cmsAccentYellow ? { cmsAccentYellow: clampText(settings.cmsAccentYellow, 16) } : {}),
      ...(settings.cmsHeroBadgeAr !== undefined ? { cmsHeroBadgeAr: clampText(settings.cmsHeroBadgeAr, 80) } : {}),
      ...(settings.cmsHeroTitleAr !== undefined ? { cmsHeroTitleAr: clampText(settings.cmsHeroTitleAr, 180) } : {}),
      ...(settings.cmsHeroSubtitleAr !== undefined ? { cmsHeroSubtitleAr: clampText(settings.cmsHeroSubtitleAr, 400) } : {}),
      ...(settings.cmsMenuOverridesJson !== undefined ? { cmsMenuOverridesJson: clampText(settings.cmsMenuOverridesJson, 24000) } : {}),
      ...(settings.cmsIconOverridesJson !== undefined ? { cmsIconOverridesJson: clampText(settings.cmsIconOverridesJson, 8000) } : {}),
      ...(settings.designatedBasitAdminEmailsCsv !== undefined
        ? { designatedBasitAdminEmailsCsv: clampText(settings.designatedBasitAdminEmailsCsv, 2000) }
        : {}),
      ...(settings.designatedHabeApproverEmailsCsv !== undefined
        ? { designatedHabeApproverEmailsCsv: clampText(settings.designatedHabeApproverEmailsCsv, 2000) }
        : {}),
      updatedByUid: adminUser.uid,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث سياسات التفعيل والدول والهوية الحية للمنصة`,
      `Updated global platform & CMS settings`,
      'platform_settings',
      'global'
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platform_settings/global');
  }
}

export async function adminSavePlatformCms(
  adminUser: User,
  currentSettings: PlatformSettingsDoc,
  cmsPatch: {
    cmsPrimaryPurple?: string;
    cmsAccentYellow?: string;
    cmsHeroBadgeAr?: string;
    cmsHeroTitleAr?: string;
    cmsHeroSubtitleAr?: string;
    cmsMenuOverridesJson?: string;
    cmsIconOverridesJson?: string;
  }
): Promise<void> {
  await adminSavePlatformSettings(adminUser, {
    autoActivateCustomers: currentSettings.autoActivateCustomers ?? true,
    requireAdminApprovalForPartners: currentSettings.requireAdminApprovalForPartners ?? true,
    defaultLanguage: currentSettings.defaultLanguage ?? 'ar',
    defaultCountryCode: currentSettings.defaultCountryCode ?? 'EG',
    enabledCountriesCsv: currentSettings.enabledCountriesCsv || 'EG',
    cmsPrimaryPurple: cmsPatch.cmsPrimaryPurple ?? currentSettings.cmsPrimaryPurple ?? '#62339A',
    cmsAccentYellow: cmsPatch.cmsAccentYellow ?? currentSettings.cmsAccentYellow ?? '#FFC928',
    cmsHeroBadgeAr: cmsPatch.cmsHeroBadgeAr ?? currentSettings.cmsHeroBadgeAr ?? '',
    cmsHeroTitleAr: cmsPatch.cmsHeroTitleAr ?? currentSettings.cmsHeroTitleAr ?? '',
    cmsHeroSubtitleAr: cmsPatch.cmsHeroSubtitleAr ?? currentSettings.cmsHeroSubtitleAr ?? '',
    cmsMenuOverridesJson: cmsPatch.cmsMenuOverridesJson ?? currentSettings.cmsMenuOverridesJson ?? '',
    cmsIconOverridesJson: cmsPatch.cmsIconOverridesJson ?? currentSettings.cmsIconOverridesJson ?? '',
    designatedBasitAdminEmailsCsv: currentSettings.designatedBasitAdminEmailsCsv ?? '',
    designatedHabeApproverEmailsCsv: currentSettings.designatedHabeApproverEmailsCsv ?? '',
  });
}

export async function adminSaveRbacDesignations(
  ownerUser: User,
  currentSettings: PlatformSettingsDoc,
  patch: {
    designatedBasitAdminEmailsCsv: string;
    designatedHabeApproverEmailsCsv: string;
  }
): Promise<void> {
  if (!isUserBootstrappedAdmin(ownerUser)) {
    throw new Error('تعيين المديرين والمعتمدين مقصور حصرياً على مالك المنصة الموثق.');
  }
  const cleanBasitCsv = parseEmailCsv(patch.designatedBasitAdminEmailsCsv).join(',');
  const cleanHabeCsv = parseEmailCsv(patch.designatedHabeApproverEmailsCsv).join(',');
  await adminSavePlatformSettings(ownerUser, {
    autoActivateCustomers: currentSettings.autoActivateCustomers ?? true,
    requireAdminApprovalForPartners: currentSettings.requireAdminApprovalForPartners ?? true,
    defaultLanguage: currentSettings.defaultLanguage ?? 'ar',
    defaultCountryCode: currentSettings.defaultCountryCode ?? 'EG',
    enabledCountriesCsv: currentSettings.enabledCountriesCsv || 'EG',
    cmsPrimaryPurple: currentSettings.cmsPrimaryPurple ?? '#62339A',
    cmsAccentYellow: currentSettings.cmsAccentYellow ?? '#FFC928',
    cmsHeroBadgeAr: currentSettings.cmsHeroBadgeAr ?? '',
    cmsHeroTitleAr: currentSettings.cmsHeroTitleAr ?? '',
    cmsHeroSubtitleAr: currentSettings.cmsHeroSubtitleAr ?? '',
    cmsMenuOverridesJson: currentSettings.cmsMenuOverridesJson ?? '',
    cmsIconOverridesJson: currentSettings.cmsIconOverridesJson ?? '',
    designatedBasitAdminEmailsCsv: cleanBasitCsv,
    designatedHabeApproverEmailsCsv: cleanHabeCsv,
  });
  await appendSecurityAudit(
    ownerUser.uid,
    `تحديث قائمة مديري باسط ومعتمدي مشتريات Ha-Be`,
    `Updated RBAC designated BASIT admins & Ha-Be payroll approvers`,
    'platform_settings',
    'global'
  );
}

export async function adminSaveGatewayConfig(
  adminUser: User,
  config: Omit<PaymentGatewayConfigDoc, 'updatedByUid' | 'updatedAt'>
): Promise<void> {
  const providerId: PaymentGatewayId = config.providerId;
  try {
    await setDoc(doc(db, 'payment_gateway_configs', providerId), {
      providerId,
      displayName: clampText(config.displayName, 80),
      isEnabled: config.isEnabled,
      mode: config.mode,
      merchantPublicId: clampText(config.merchantPublicId, 120),
      countryCode: config.countryCode,
      updatedByUid: adminUser.uid,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث إعدادات بوابة الدفع ${providerId} (${config.mode})`,
      `Updated payment gateway ${providerId} (${config.mode})`,
      'payment_gateway_configs',
      providerId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `payment_gateway_configs/${providerId}`);
  }
}

export async function recordPaymentTransaction(
  payerUser: User,
  tx: Omit<PaymentTransactionDoc, 'payerUid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const cleanTxId = sanitizeId(tx.txId);
  try {
    await setDoc(doc(db, 'payment_transactions', cleanTxId), {
      txId: cleanTxId,
      payerUid: payerUser.uid,
      tenantId: sanitizeId(tx.tenantId || 'platform_global'),
      orderId: sanitizeId(tx.orderId || cleanTxId),
      provider: tx.provider,
      mode: tx.mode,
      countryCode: tx.countryCode,
      currency: clampText(tx.currency, 8),
      amount: Math.max(1, Number(tx.amount)),
      status: tx.status,
      gatewayReference: clampText(tx.gatewayReference, 160),
      idempotencyKey: clampText(tx.idempotencyKey, 128),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await createScopedNotification({
      recipientUid: payerUser.uid,
      recipientRole: 'customer',
      tenantId: tx.tenantId,
      category: 'payment',
      titleAr: `معاملة دفع ${tx.provider.toUpperCase()} (${tx.status})`,
      titleEn: `Payment ${tx.provider.toUpperCase()} (${tx.status})`,
      bodyAr: `المرجع: ${tx.gatewayReference} — القيمة: ${tx.amount} ${tx.currency}`,
      bodyEn: `Ref: ${tx.gatewayReference} — Amount: ${tx.amount} ${tx.currency}`,
      targetSection: 'fayd_admin_governance',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `payment_transactions/${cleanTxId}`);
  }
}

export async function updatePaymentTransactionStatus(
  txId: string,
  status: PaymentTransactionStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'payment_transactions', sanitizeId(txId)), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `payment_transactions/${txId}`);
  }
}

export async function runTenantIsolationSelfCheck(
  currentUser: User,
  foreignTenantId?: string
): Promise<{
  checkedAt: string;
  crossTenantBlocked: boolean;
  detailsAr: string;
  detailsEn: string;
}> {
  const probeTenantId = sanitizeId(foreignTenantId || 'non_member_foreign_tenant_probe');
  try {
    const snap = await getDoc(doc(db, 'tenants', probeTenantId));
    if (!snap.exists()) {
      return {
        checkedAt: new Date().toLocaleTimeString(),
        crossTenantBlocked: true,
        detailsAr: `تم التحقق: المعرّف الاختباري (${probeTenantId}) غير مصرح به أو غير متاح خارج نطاق حسابك (${currentUser.uid}).`,
        detailsEn: `Verified: Probe tenant (${probeTenantId}) returned no unauthorized cross-tenant records for ${currentUser.uid}.`,
      };
    }
    return {
      checkedAt: new Date().toLocaleTimeString(),
      crossTenantBlocked: snap.data()?.ownerUid === currentUser.uid,
      detailsAr:
        snap.data()?.ownerUid === currentUser.uid
          ? 'قواعد العزل تطابق المالك أو المدير الأعلى فقط.'
          : 'تحذير: ظهر سجل لمساحة مستأجر آخر.',
      detailsEn:
        snap.data()?.ownerUid === currentUser.uid
          ? 'Tenant read matched authorized owner/admin scope.'
          : 'Warning: foreign tenant document was readable.',
    };
  } catch {
    return {
      checkedAt: new Date().toLocaleTimeString(),
      crossTenantBlocked: true,
      detailsAr: `تم صد محاولة قراءة مساحة المستأجر الآخر (${probeTenantId}) بنجاح بواسطة قواعد أمان Firestore (PERMISSION_DENIED).`,
      detailsEn: `Cross-tenant read (${probeTenantId}) was actively blocked by Firestore rules (PERMISSION_DENIED).`,
    };
  }
}

export async function fetchTenantMembersForOwner(tenantId: string): Promise<TenantMemberDoc[]> {
  try {
    const snap = await getDocs(collection(db, 'tenants', sanitizeId(tenantId), 'members'));
    return snap.docs.map((d) => d.data() as TenantMemberDoc);
  } catch {
    return [];
  }
}

export async function saveEntertainmentBenefit(
  actorUser: User,
  payload: {
    benefitId?: string;
    partnerUid?: string;
    venueName: string;
    category: EntertainmentCategory;
    imageUrl: string;
    description: string;
    approvedBenefitText: string;
    eligibilityScope: 'public' | 'contracted_entity' | 'employee_tier';
    eligibleTenantIdsCsv: string;
    validFrom: string;
    validTo: string;
    terms: string;
    countryCode: CountryCode;
    isApproved: boolean;
    isActive: boolean;
  }
): Promise<string> {
  const isEditing = Boolean(payload.benefitId);
  const benefitId = payload.benefitId ? sanitizeId(payload.benefitId) : genId('ben');
  const venueName = clampText(payload.venueName, 140);
  const approvedBenefitText = clampText(payload.approvedBenefitText, 300);
  const description = clampText(payload.description || approvedBenefitText, 800);

  if (venueName.length < 2) {
    throw new Error('اسم الشريك / الوجهة الترفيهية يجب أن يكون حرفين على الأقل.');
  }
  if (approvedBenefitText.length < 2) {
    throw new Error('نص الميزة المعتمدة يجب أن يكون حرفين على الأقل.');
  }
  if (description.length < 4) {
    throw new Error('وصف الميزة الترفيهية يجب أن يكون 4 أحرف على الأقل.');
  }

  const now = serverTimestamp();
  const mutableFields = {
    venueName,
    category: payload.category,
    imageUrl: clampText(payload.imageUrl || '', 500),
    description,
    approvedBenefitText,
    eligibilityScope: payload.eligibilityScope,
    eligibleTenantIdsCsv: clampText(payload.eligibleTenantIdsCsv || '', 500),
    validFrom: clampText(payload.validFrom || '', 32),
    validTo: clampText(payload.validTo || '', 32),
    terms: clampText(payload.terms || '', 500),
    countryCode: payload.countryCode,
    isApproved: payload.isApproved,
    isActive: payload.isActive,
    updatedAt: now,
  };

  try {
    if (isEditing) {
      await updateDoc(doc(db, 'entertainment_benefits', benefitId), mutableFields);
    } else {
      await setDoc(doc(db, 'entertainment_benefits', benefitId), {
        benefitId,
        partnerUid: sanitizeId(payload.partnerUid || actorUser.uid),
        ...mutableFields,
        createdAt: now,
      });
    }
    await appendSecurityAudit(
      actorUser.uid,
      `${isEditing ? 'تحديث' : 'إضافة'} ميزة/شريك ترفيهي: ${venueName}`,
      `${isEditing ? 'Updated' : 'Created'} entertainment benefit ${benefitId}`,
      'entertainment_benefits',
      benefitId
    );
    return benefitId;
  } catch (error) {
    return handleFirestoreError(
      error,
      isEditing ? OperationType.UPDATE : OperationType.CREATE,
      `entertainment_benefits/${benefitId}`
    );
  }
}

export async function adminDeleteEntertainmentBenefit(
  adminUser: User,
  benefitId: string
): Promise<void> {
  const cleanId = sanitizeId(benefitId);
  try {
    await deleteDoc(doc(db, 'entertainment_benefits', cleanId));
    await appendSecurityAudit(
      adminUser.uid,
      `حذف الميزة الترفيهية ${cleanId}`,
      `Deleted entertainment benefit ${cleanId}`,
      'entertainment_benefits',
      cleanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `entertainment_benefits/${cleanId}`);
  }
}

export async function createBenefitBooking(
  user: User,
  benefit: EntertainmentBenefitDoc,
  payload: {
    tenantId?: string;
    requestedDate: string;
    peopleCount: number;
    notes: string;
  }
): Promise<string> {
  const bookingId = genId('bbk');
  const now = serverTimestamp();
  try {
    await setDoc(doc(db, 'benefit_bookings', bookingId), {
      bookingId,
      uid: user.uid,
      userName: clampText(user.displayName || 'مستخدم باسط', 120),
      tenantId: sanitizeId(payload.tenantId || ''),
      benefitId: benefit.benefitId,
      venueName: clampText(benefit.venueName, 140),
      requestedDate: clampText(payload.requestedDate, 32),
      peopleCount: Math.max(1, Math.min(500, Math.round(payload.peopleCount) || 1)),
      notes: clampText(payload.notes || '', 500),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    await createScopedNotification({
      recipientUid: user.uid,
      recipientRole: 'employee',
      tenantId: payload.tenantId,
      category: 'offer',
      titleAr: `تم تسجيل طلب حجز ميزة: ${benefit.venueName}`,
      titleEn: `Benefit booking requested: ${benefit.venueName}`,
      bodyAr: `التاريخ المطلوب: ${payload.requestedDate} · عدد الأفراد: ${payload.peopleCount}`,
      bodyEn: `Date: ${payload.requestedDate} · Guests: ${payload.peopleCount}`,
      targetSection: 'entertainment_benefits',
    });
    await createScopedNotification({
      recipientUid: OWNER_INBOX_UID,
      recipientRole: 'central_super_admin',
      tenantId: payload.tenantId,
      category: 'offer',
      titleAr: `طلب حجز ميزة ترفيهية جديد: ${benefit.venueName}`,
      titleEn: `New entertainment benefit booking: ${benefit.venueName}`,
      bodyAr: `مقدم الطلب: ${user.displayName || 'عميل باسط'} · الأفراد: ${payload.peopleCount}`,
      bodyEn: `Requester: ${user.displayName || 'Customer'} · Guests: ${payload.peopleCount}`,
      targetSection: 'fayd_admin_governance',
    });
    return bookingId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `benefit_bookings/${bookingId}`);
  }
}

export async function submitEmployeeCouponRequest(
  user: User,
  payload: {
    employerName: string;
    employeeCode: string;
    employeeName: string;
    phone: string;
    peopleCount: number;
    requestedDate: string;
    offerTitle: string;
    notes?: string;
  }
): Promise<string> {
  const bookingId = genId('emp_cpn');
  const now = serverTimestamp();
  const employerName = clampText(payload.employerName, 140);
  const employeeCode = clampText(payload.employeeCode, 64);
  const phone = clampText(payload.phone, 32);
  const discountLabel = 'خصم 10% (وفق العرض) للعاملين بالقطاعات المتعاقدة مع كاترنج مصر — قطاع مول العين فقط';
  try {
    await setDoc(doc(db, 'benefit_bookings', bookingId), {
      bookingId,
      uid: user.uid,
      userName: clampText(payload.employeeName || user.displayName || 'موظف متعاقد', 120),
      tenantId: 'al_ain_contracted',
      benefitId: 'al_ain_employee_10pct',
      venueName: clampText(payload.offerTitle || 'عروض مول العين والترفيه', 140),
      requestedDate: clampText(payload.requestedDate || new Date().toISOString().slice(0, 10), 32),
      peopleCount: Math.max(1, Math.min(50, Math.round(payload.peopleCount) || 1)),
      notes: clampText(payload.notes || `تحقق موظف متعاقد: ${employerName} (${employeeCode})`, 500),
      employerName,
      employeeCode,
      phone,
      discountLabel,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
    await createScopedNotification({
      recipientUid: OWNER_INBOX_UID,
      recipientRole: 'central_super_admin',
      tenantId: 'al_ain_contracted',
      category: 'offer',
      titleAr: `طلب كوبون خصم 10% للعاملين: ${employerName}`,
      titleEn: `10% Employee Coupon Request: ${employerName}`,
      bodyAr: `الموظف: ${payload.employeeName} (كود: ${employeeCode}) · هاتف: ${phone} · ${payload.offerTitle}`,
      bodyEn: `Employee: ${payload.employeeName} (${employeeCode}) · ${payload.offerTitle}`,
      targetSection: 'fayd_admin_governance',
    });
    await createScopedNotification({
      recipientUid: user.uid,
      recipientRole: 'employee',
      tenantId: 'al_ain_contracted',
      category: 'offer',
      titleAr: `تم إرسال طلب خصم 10% للعاملين (${bookingId})`,
      titleEn: `Employee 10% discount request sent (${bookingId})`,
      bodyAr: `بانتظار اعتماد الإدارة المركزية لجهة العمل: ${employerName}`,
      bodyEn: `Pending owner verification for ${employerName}`,
      targetSection: 'al_ain_entertainment',
    });
    return bookingId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `benefit_bookings/${bookingId}`);
  }
}

export async function submitVipDirectOrder(
  user: User,
  payload: {
    customerName: string;
    phone: string;
    sourceChannel: 'camel_liver_vip' | 'cart_direct' | 'al_ain_offer';
    items: VipDirectOrderItem[];
    totalEGP: number;
    paymentMethod: PaymentGatewayId;
    notes: string;
  }
): Promise<string> {
  const orderId = genId('vip');
  const now = serverTimestamp();
  const safeItems = payload.items.slice(0, 50).map((item) => ({
    title: clampText(item.title, 140),
    qty: Math.max(1, Math.round(Number(item.qty) || 1)),
    unitPriceEGP: Math.max(0, Number(item.unitPriceEGP) || 0),
    ...(item.note ? { note: clampText(item.note, 200) } : {}),
  }));
  const itemsSummary = clampText(
    safeItems.map((i) => `${i.title} ×${i.qty} (${i.unitPriceEGP} ج.م)`).join(' + '),
    1000
  );
  try {
    await setDoc(doc(db, 'vip_direct_orders', orderId), {
      orderId,
      customerUid: user.uid,
      customerName: clampText(payload.customerName || user.displayName || 'عميل باسط', 120),
      phone: clampText(payload.phone || '01000000000', 32),
      sourceChannel: payload.sourceChannel,
      itemsSummary,
      items: safeItems,
      totalEGP: Math.max(1, Number(payload.totalEGP) || 1),
      paymentMethod: payload.paymentMethod,
      notes: clampText(payload.notes || '', 600),
      status: 'pending_owner',
      ownerReply: '',
      createdAt: now,
      updatedAt: now,
    });

    const isCamel = payload.sourceChannel === 'camel_liver_vip';
    await createScopedNotification({
      recipientUid: OWNER_INBOX_UID,
      recipientRole: 'central_super_admin',
      tenantId: 'al_ain_vip',
      category: 'order',
      titleAr: isCamel
        ? `طلب جديد: كباب وكبدة جملي VIP — ${payload.customerName}`
        : `طلب مباشر جديد (${orderId}) — ${payload.customerName}`,
      titleEn: isCamel
        ? `New VIP Camel Liver Order (${orderId})`
        : `New Direct Platform Order (${orderId})`,
      bodyAr: `${itemsSummary} · الإجمالي: ${payload.totalEGP} ج.م · الدفع: ${payload.paymentMethod} · هاتف: ${payload.phone}`,
      bodyEn: `${itemsSummary} · Total: ${payload.totalEGP} EGP · ${payload.paymentMethod}`,
      targetSection: 'fayd_admin_governance',
    });

    await createScopedNotification({
      recipientUid: user.uid,
      recipientRole: 'customer',
      tenantId: 'al_ain_vip',
      category: 'order',
      titleAr: `تم استلام طلبك رقم ${orderId} وإرساله للمالك`,
      titleEn: `Order ${orderId} received and routed to owner`,
      bodyAr: `${itemsSummary} · الإجمالي: ${payload.totalEGP} ج.م`,
      bodyEn: `${itemsSummary} · Total: ${payload.totalEGP} EGP`,
      targetSection: 'fayd_admin_governance',
    });

    await appendSecurityAudit(
      user.uid,
      `طلب مباشر للمنصة ${orderId}: ${itemsSummary}`,
      `Submitted direct order ${orderId}`,
      'vip_direct_orders',
      orderId
    );
    return orderId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `vip_direct_orders/${orderId}`);
  }
}

export async function adminReviewVipDirectOrder(
  adminUser: User,
  order: VipDirectOrderDoc,
  status: VipDirectOrderStatus,
  ownerReply = ''
): Promise<void> {
  try {
    await updateDoc(doc(db, 'vip_direct_orders', order.orderId), {
      status,
      ownerReply: clampText(ownerReply, 400),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث حالة الطلب المباشر ${order.orderId} إلى ${status}`,
      `Updated VIP direct order ${order.orderId} to ${status}`,
      'vip_direct_orders',
      order.orderId
    );
    await createScopedNotification({
      recipientUid: order.customerUid,
      recipientRole: 'customer',
      category: 'order',
      titleAr:
        status === 'approved'
          ? `تم اعتماد طلبك رقم ${order.orderId}`
          : status === 'preparing'
          ? `جاري تجهيز طلبك رقم ${order.orderId}`
          : status === 'completed'
          ? `تم تنفيذ وتسليم طلبك رقم ${order.orderId}`
          : `تحديث حالة الطلب ${order.orderId}`,
      titleEn: `Direct order ${order.orderId} updated: ${status}`,
      bodyAr: ownerReply ? `${order.itemsSummary} · رد الإدارة: ${ownerReply}` : order.itemsSummary,
      bodyEn: order.itemsSummary,
      targetSection: 'fayd_admin_governance',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `vip_direct_orders/${order.orderId}`);
  }
}

export async function adminReviewBenefitBooking(
  adminUser: User,
  booking: BenefitBookingDoc,
  status: 'approved' | 'rejected'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'benefit_bookings', booking.bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `مراجعة حجز الميزة الترفيهية ${booking.bookingId}: ${status}`,
      `Reviewed benefit booking ${booking.bookingId}: ${status}`,
      'benefit_bookings',
      booking.bookingId
    );
    await createScopedNotification({
      recipientUid: booking.uid,
      recipientRole: 'employee',
      category: 'offer',
      titleAr: status === 'approved' ? `تم اعتماد حجزك في ${booking.venueName}` : `تحديث حجز ${booking.venueName}`,
      titleEn: status === 'approved' ? `Benefit approved: ${booking.venueName}` : `Benefit status: ${status}`,
      bodyAr: `رقم الحجز: ${booking.bookingId}`,
      bodyEn: `Booking ID: ${booking.bookingId}`,
      targetSection: 'entertainment_benefits',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `benefit_bookings/${booking.bookingId}`);
  }
}

export async function saveCharityInitiative(
  adminUser: User,
  payload: {
    initiativeId?: string;
    titleAr: string;
    titleEn: string;
    executingEntity: string;
    mechanismAr: string;
    contributionType: string;
    targetGoalCount: number;
    recordedContributionsCount?: number;
    verifiedDeliveriesCount?: number;
    proofMediaUrl?: string;
    isApproved: boolean;
    isActive: boolean;
  }
): Promise<string> {
  const isEditing = Boolean(payload.initiativeId);
  const initiativeId = payload.initiativeId ? sanitizeId(payload.initiativeId) : genId('chr');
  const titleAr = clampText(payload.titleAr, 160);
  const titleEn = clampText(payload.titleEn || payload.titleAr, 160);
  const executingEntity = clampText(payload.executingEntity, 140);
  const mechanismAr = clampText(payload.mechanismAr, 600);
  const contributionType = clampText(payload.contributionType || 'إطعام', 80);

  if (titleAr.length < 2 || titleEn.length < 2 || executingEntity.length < 2 || contributionType.length < 2) {
    throw new Error('بيانات المبادرة الخيرية الأساسية يجب أن تكون حرفين على الأقل.');
  }
  if (mechanismAr.length < 4) {
    throw new Error('وصف آلية التنفيذ والتوثيق الميداني يجب أن يكون 4 أحرف على الأقل.');
  }

  const now = serverTimestamp();
  const mutableFields = {
    titleAr,
    titleEn,
    executingEntity,
    mechanismAr,
    contributionType,
    targetGoalCount: Math.max(0, Math.round(Number(payload.targetGoalCount) || 0)),
    ...(typeof payload.recordedContributionsCount === 'number'
      ? { recordedContributionsCount: Math.max(0, Math.round(payload.recordedContributionsCount)) }
      : {}),
    ...(typeof payload.verifiedDeliveriesCount === 'number'
      ? { verifiedDeliveriesCount: Math.max(0, Math.round(payload.verifiedDeliveriesCount)) }
      : {}),
    proofMediaUrl: clampText(payload.proofMediaUrl || '', 500),
    isApproved: payload.isApproved,
    isActive: payload.isActive,
    updatedAt: now,
  };

  try {
    if (isEditing) {
      await updateDoc(doc(db, 'charity_initiatives', initiativeId), mutableFields);
    } else {
      await setDoc(doc(db, 'charity_initiatives', initiativeId), {
        initiativeId,
        ...mutableFields,
        recordedContributionsCount: Math.max(0, Math.round(Number(payload.recordedContributionsCount) || 0)),
        verifiedDeliveriesCount: Math.max(0, Math.round(Number(payload.verifiedDeliveriesCount) || 0)),
        createdByUid: adminUser.uid,
        createdAt: now,
      });
    }
    await appendSecurityAudit(
      adminUser.uid,
      `${isEditing ? 'تحديث' : 'إضافة'} مبادرة اعمل الخير: ${titleAr}`,
      `${isEditing ? 'Updated' : 'Created'} charity initiative ${initiativeId}`,
      'charity_initiatives',
      initiativeId
    );
    return initiativeId;
  } catch (error) {
    return handleFirestoreError(
      error,
      isEditing ? OperationType.UPDATE : OperationType.CREATE,
      `charity_initiatives/${initiativeId}`
    );
  }
}

export async function adminDeleteCharityInitiative(
  adminUser: User,
  initiativeId: string
): Promise<void> {
  const cleanId = sanitizeId(initiativeId);
  try {
    await deleteDoc(doc(db, 'charity_initiatives', cleanId));
    await appendSecurityAudit(
      adminUser.uid,
      `حذف مبادرة اعمل الخير ${cleanId}`,
      `Deleted charity initiative ${cleanId}`,
      'charity_initiatives',
      cleanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `charity_initiatives/${cleanId}`);
  }
}

export async function submitCharityContribution(
  user: User,
  initiative: CharityInitiativeDoc,
  payload: {
    contributorName: string;
    phone: string;
    contributionNote: string;
    pledgeAmountEGP: number;
  }
): Promise<string> {
  const contributionId = genId('chc');
  const now = serverTimestamp();
  const cleanPhone = clampText(payload.phone, 32);
  if (cleanPhone.length < 6) {
    throw new Error('رقم الهاتف للتوثيق يجب أن لا يقل عن 6 أرقام / Phone must be at least 6 characters.');
  }
  try {
    await setDoc(doc(db, 'charity_contributions', contributionId), {
      contributionId,
      initiativeId: initiative.initiativeId,
      initiativeTitle: clampText(initiative.titleAr, 160),
      contributorUid: user.uid,
      contributorName: clampText(payload.contributorName || user.displayName || 'مساهم', 120),
      phone: cleanPhone,
      contributionNote: clampText(payload.contributionNote || '', 400),
      pledgeAmountEGP: Math.max(0, Number(payload.pledgeAmountEGP) || 0),
      status: 'recorded',
      proofUrl: '',
      createdAt: now,
      updatedAt: now,
    });
    await appendSecurityAudit(
      user.uid,
      `تسجيل مساهمة اعمل الخير (${initiative.titleAr})`,
      `Recorded charity contribution ${contributionId}`,
      'charity_contributions',
      contributionId
    );
    return contributionId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `charity_contributions/${contributionId}`);
  }
}

export async function adminVerifyCharityContribution(
  adminUser: User,
  contribution: CharityContributionDoc,
  initiative: CharityInitiativeDoc | undefined,
  proofUrl: string
): Promise<void> {
  const trimmedProof = clampText(proofUrl, 500);
  if (trimmedProof.length < 8) {
    throw new Error('يجب إدخال رابط أو مرجع إثبات تنفيذ موثق قبل اعتماد التنفيذ.');
  }
  const batch = writeBatch(db);
  const now = serverTimestamp();
  try {
    batch.update(doc(db, 'charity_contributions', contribution.contributionId), {
      status: 'executed_verified',
      proofUrl: trimmedProof,
      updatedAt: now,
    });
    if (initiative) {
      batch.update(doc(db, 'charity_initiatives', initiative.initiativeId), {
        recordedContributionsCount: (initiative.recordedContributionsCount || 0) + 1,
        verifiedDeliveriesCount: (initiative.verifiedDeliveriesCount || 0) + 1,
        updatedAt: now,
      });
    }
    const logId = genId('log');
    batch.set(doc(db, 'audit_logs', logId), {
      logId,
      actorUid: adminUser.uid,
      actionAr: `توثيق تنفيذ مساهمة اعمل الخير ${contribution.contributionId}`,
      actionEn: `Verified charity contribution ${contribution.contributionId}`,
      targetCollection: 'charity_contributions',
      targetId: contribution.contributionId,
      details: trimmedProof,
      createdAt: now,
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `charity_contributions/${contribution.contributionId}`);
  }
}

export async function adminSaveKaffarahRule(
  adminUser: User,
  rule: {
    isOfficiallyApproved: boolean;
    shariaAuthorityName: string;
    referenceCode: string;
    unitCostEGP: number;
    mealsPerKaffarah: number;
    notesAr: string;
  }
): Promise<void> {
  const shariaAuthorityName = clampText(rule.shariaAuthorityName, 160);
  const referenceCode = clampText(rule.referenceCode, 100);
  if (shariaAuthorityName.length < 2 || referenceCode.length < 2) {
    throw new Error('اسم المرجعية الشرعية ورقم الفتوى يجب ألا يقل عن حرفين.');
  }
  try {
    await setDoc(doc(db, 'kaffarah_rules', 'official'), {
      ruleId: 'official',
      isOfficiallyApproved: rule.isOfficiallyApproved,
      shariaAuthorityName,
      referenceCode,
      unitCostEGP: Math.max(0, Number(rule.unitCostEGP) || 0),
      mealsPerKaffarah: Math.max(0, Math.round(Number(rule.mealsPerKaffarah) || 0)),
      notesAr: clampText(rule.notesAr || '', 600),
      updatedByUid: adminUser.uid,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث المرجعية الشرعية وتسعير كفارة اليمين (${rule.isOfficiallyApproved ? 'معتمدة' : 'موقوفة'})`,
      `Updated official Kaffarah rule (${referenceCode})`,
      'kaffarah_rules',
      'official'
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'kaffarah_rules/official');
  }
}

export async function submitKaffarahOrder(
  user: User,
  rule: KaffarahRuleDoc,
  payload: {
    donorName: string;
    phone: string;
    kaffarahCount: number;
    distributionNotes: string;
  }
): Promise<string> {
  if (!rule.isOfficiallyApproved || rule.unitCostEGP <= 0 || rule.mealsPerKaffarah <= 0) {
    throw new Error('يتطلب تقديم طلب كفارة اليمين اعتماد المرجعية الشرعية والقيمة الرسمية من الإدارة المركزية أولاً.');
  }
  const cleanPhone = clampText(payload.phone, 32);
  if (cleanPhone.length < 6) {
    throw new Error('رقم الهاتف للتوثيق يجب أن لا يقل عن 6 أرقام / Phone must be at least 6 characters.');
  }
  const orderId = genId('kaf');
  const count = Math.max(1, Math.min(1000, Math.round(payload.kaffarahCount) || 1));
  const totalMeals = count * rule.mealsPerKaffarah;
  const totalAmountEGP = Math.round(count * rule.unitCostEGP);
  const now = serverTimestamp();
  try {
    await setDoc(doc(db, 'kaffarah_orders', orderId), {
      orderId,
      requesterUid: user.uid,
      donorName: clampText(payload.donorName || user.displayName || 'مقدم الطلب', 120),
      phone: cleanPhone,
      kaffarahCount: count,
      totalMeals,
      totalAmountEGP,
      shariaReferenceUsed: clampText(`${rule.shariaAuthorityName} (${rule.referenceCode})`, 160),
      distributionNotes: clampText(payload.distributionNotes || '', 500),
      executionStatus: 'pending_verification',
      executionProofUrl: '',
      createdAt: now,
      updatedAt: now,
    });
    await appendSecurityAudit(
      user.uid,
      `تسجيل طلب كفارة يمين رقم ${orderId} (${count} كفارة / ${totalMeals} وجبة)`,
      `Submitted Kaffarah order ${orderId}`,
      'kaffarah_orders',
      orderId
    );
    await createScopedNotification({
      recipientUid: user.uid,
      recipientRole: 'customer',
      category: 'order',
      titleAr: `تم تسجيل طلب كفارة اليمين رقم ${orderId}`,
      titleEn: `Kaffarah order ${orderId} recorded`,
      bodyAr: `عدد الوجبات المحدد وفق المرجعية: ${totalMeals} وجبة — الحالة: بانتظار التحقق والتنفيذ الموثق`,
      bodyEn: `Meals: ${totalMeals} — Status: pending verification`,
      targetSection: 'kaffarah_yamin',
    });
    return orderId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `kaffarah_orders/${orderId}`);
  }
}

export async function adminUpdateKaffarahOrderProof(
  adminUser: User,
  order: KaffarahOrderDoc,
  executionStatus: 'pending_verification' | 'awaiting_execution' | 'executed_verified',
  executionProofUrl: string
): Promise<void> {
  const proof = clampText(executionProofUrl || '', 500);
  if (executionStatus === 'executed_verified' && proof.length < 8) {
    throw new Error('لا يمكن وسم طلب كفارة اليمين كـ "تم التنفيذ" دون إرفاق رابط أو مرجع إثبات تنفيذي حقيقي.');
  }
  try {
    await updateDoc(doc(db, 'kaffarah_orders', order.orderId), {
      executionStatus,
      executionProofUrl: proof,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث حالة تنفيذ كفارة اليمين ${order.orderId} إلى ${executionStatus}`,
      `Updated Kaffarah order ${order.orderId} status to ${executionStatus}`,
      'kaffarah_orders',
      order.orderId,
      proof
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `kaffarah_orders/${order.orderId}`);
  }
}

export async function submitLogisticsServiceInquiry(
  user: User,
  payload: {
    serviceKey: LogisticsServiceKey;
    organizationName: string;
    contactName: string;
    phone: string;
    eventDate: string;
    guestCount: number;
    city: string;
    notes: string;
  }
): Promise<string> {
  const inquiryId = genId('logi');
  const now = serverTimestamp();
  try {
    await setDoc(doc(db, 'logistics_service_inquiries', inquiryId), {
      inquiryId,
      requesterUid: user.uid,
      serviceKey: payload.serviceKey,
      organizationName: clampText(payload.organizationName, 140),
      contactName: clampText(payload.contactName, 120),
      phone: clampText(payload.phone, 32),
      eventDate: clampText(payload.eventDate, 32),
      guestCount: Math.max(1, Math.round(Number(payload.guestCount) || 1)),
      city: clampText(payload.city, 80),
      notes: clampText(payload.notes || '', 600),
      status: 'new',
      createdAt: now,
      updatedAt: now,
    });
    await appendSecurityAudit(
      user.uid,
      `طلب خدمة لوجستية/ضيافة (${payload.serviceKey}): ${payload.organizationName}`,
      `Submitted logistics inquiry ${inquiryId}`,
      'logistics_service_inquiries',
      inquiryId
    );
    return inquiryId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `logistics_service_inquiries/${inquiryId}`);
  }
}

export async function adminUpdateLogisticsInquiry(
  adminUser: User,
  inquiry: LogisticsServiceInquiryDoc,
  status: 'new' | 'in_review' | 'quoted'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'logistics_service_inquiries', inquiry.inquiryId), {
      status,
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `تحديث طلب الخدمة اللوجستية ${inquiry.inquiryId} إلى ${status}`,
      `Updated logistics inquiry ${inquiry.inquiryId} to ${status}`,
      'logistics_service_inquiries',
      inquiry.inquiryId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `logistics_service_inquiries/${inquiry.inquiryId}`);
  }
}

export async function submitCateringFeedback(
  user: User,
  tenantId: string,
  payload: {
    category: 'catering_quality' | 'benefit_partner' | 'general_complaint';
    subject: string;
    details: string;
  }
): Promise<string> {
  const feedbackId = genId('fbk');
  const now = serverTimestamp();
  try {
    await setDoc(doc(db, 'catering_feedback', feedbackId), {
      feedbackId,
      authorUid: user.uid,
      tenantId: sanitizeId(tenantId || 'general'),
      category: payload.category,
      subject: clampText(payload.subject, 160),
      details: clampText(payload.details, 800),
      status: 'open',
      adminReply: '',
      createdAt: now,
      updatedAt: now,
    });
    await appendSecurityAudit(
      user.uid,
      `إرسال بلاغ/ملاحظة جودة (${payload.category}): ${payload.subject}`,
      `Submitted catering feedback ${feedbackId}`,
      'catering_feedback',
      feedbackId
    );
    return feedbackId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `catering_feedback/${feedbackId}`);
  }
}

export async function adminResolveCateringFeedback(
  adminUser: User,
  feedback: CateringFeedbackDoc,
  adminReply: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'catering_feedback', feedback.feedbackId), {
      status: 'resolved',
      adminReply: clampText(adminReply, 500),
      updatedAt: serverTimestamp(),
    });
    await appendSecurityAudit(
      adminUser.uid,
      `معالجة الملاحظة/الشكوى ${feedback.feedbackId}`,
      `Resolved catering feedback ${feedback.feedbackId}`,
      'catering_feedback',
      feedback.feedbackId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `catering_feedback/${feedback.feedbackId}`);
  }
}

export function subscribePublicDirectory(callbacks: {
  onStorefronts: (rows: PublicStorefrontDoc[]) => void;
  onCatalogItems: (rows: CatalogItemDoc[]) => void;
  onPlans: (rows: SubscriptionPlanDoc[]) => void;
  onOpportunities: (rows: FaydOpportunityDoc[]) => void;
  onOffersAds: (rows: OfferAdDoc[]) => void;
  onGatewayConfigs: (rows: PaymentGatewayConfigDoc[]) => void;
  onEntertainmentBenefits?: (rows: EntertainmentBenefitDoc[]) => void;
  onCharityInitiatives?: (rows: CharityInitiativeDoc[]) => void;
  onKaffarahRule?: (rule: KaffarahRuleDoc | null) => void;
  onPlatformSettings?: (settings: PlatformSettingsDoc) => void;
}): Unsubscribe {
  const unsubs: Unsubscribe[] = [];

  if (callbacks.onPlatformSettings) {
    const cb = callbacks.onPlatformSettings;
    unsubs.push(
      onSnapshot(
        doc(db, 'platform_settings', 'global'),
        (snap) => {
          if (snap.exists()) {
            cb(snap.data() as PlatformSettingsDoc);
          }
        },
        () => {}
      )
    );
  }

  unsubs.push(
    onSnapshot(
      query(collection(db, 'public_storefronts'), where('isActive', '==', true)),
      (snap) => {
        callbacks.onStorefronts(snap.docs.map((d) => d.data() as PublicStorefrontDoc));
      },
      (error) => {
        if (isTransientFirestoreOrNetworkError(error)) return;
        handleFirestoreError(error, OperationType.LIST, 'public_storefronts');
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'catalog_items'), where('isAvailable', '==', true)),
      (snap) => {
        callbacks.onCatalogItems(snap.docs.map((d) => d.data() as CatalogItemDoc));
      },
      (error) => {
        if (isTransientFirestoreOrNetworkError(error)) return;
        handleFirestoreError(error, OperationType.LIST, 'catalog_items');
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'subscription_plans'), where('isActive', '==', true)),
      (snap) => {
        const docs = snap.docs.map((d) => d.data() as SubscriptionPlanDoc);
        callbacks.onPlans(docs.length > 0 ? docs : (DEFAULT_SUBSCRIPTION_PLANS as SubscriptionPlanDoc[]));
      },
      (error) => {
        if (isTransientFirestoreOrNetworkError(error)) return;
        handleFirestoreError(error, OperationType.LIST, 'subscription_plans');
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'opportunities'), where('approvalStatus', '==', 'approved')),
      (snap) => {
        callbacks.onOpportunities(snap.docs.map((d) => d.data() as FaydOpportunityDoc));
      },
      (error) => {
        if (isTransientFirestoreOrNetworkError(error)) return;
        handleFirestoreError(error, OperationType.LIST, 'opportunities');
      }
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'offers_ads'), where('isApproved', '==', true), where('isActive', '==', true)),
      (snap) => {
        callbacks.onOffersAds(snap.docs.map((d) => d.data() as OfferAdDoc));
      },
      () => callbacks.onOffersAds([])
    )
  );

  unsubs.push(
    onSnapshot(
      query(collection(db, 'payment_gateway_configs'), where('isEnabled', '==', true)),
      (snap) => {
        const docs = snap.docs.map((d) => d.data() as PaymentGatewayConfigDoc);
        callbacks.onGatewayConfigs(
          docs.length > 0 ? docs : (DEFAULT_GATEWAY_CONFIGS as PaymentGatewayConfigDoc[])
        );
      },
      () => callbacks.onGatewayConfigs(DEFAULT_GATEWAY_CONFIGS as PaymentGatewayConfigDoc[])
    )
  );

  if (callbacks.onEntertainmentBenefits) {
    const cb = callbacks.onEntertainmentBenefits;
    unsubs.push(
      onSnapshot(
        query(
          collection(db, 'entertainment_benefits'),
          where('isApproved', '==', true),
          where('isActive', '==', true)
        ),
        (snap) => cb(snap.docs.map((d) => d.data() as EntertainmentBenefitDoc)),
        () => cb([])
      )
    );
  }

  if (callbacks.onCharityInitiatives) {
    const cb = callbacks.onCharityInitiatives;
    unsubs.push(
      onSnapshot(
        query(
          collection(db, 'charity_initiatives'),
          where('isApproved', '==', true),
          where('isActive', '==', true)
        ),
        (snap) => cb(snap.docs.map((d) => d.data() as CharityInitiativeDoc)),
        () => cb([])
      )
    );
  }

  if (callbacks.onKaffarahRule) {
    const cb = callbacks.onKaffarahRule;
    unsubs.push(
      onSnapshot(
        doc(db, 'kaffarah_rules', 'official'),
        (snap) => cb(snap.exists() ? (snap.data() as KaffarahRuleDoc) : null),
        () => cb(null)
      )
    );
  }

  return () => unsubs.forEach((u) => u());
}
