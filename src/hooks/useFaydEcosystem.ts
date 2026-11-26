import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, Unsubscribe, where } from 'firebase/firestore';
import {
  auth,
  db,
  ecosystemGoogleSignIn,
  handleFirestoreError,
  isTransientFirestoreOrNetworkError,
  logout,
  OperationType,
  redirectAuthResultPromise,
  testFirestoreConnection,
} from '../lib/firebase';
import type { CountryCode } from '../data/phase1Data';
import {
  DEFAULT_COMMISSION_RULE,
  DEFAULT_GATEWAY_CONFIGS,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_SUBSCRIPTION_PLANS,
  ensureUserProfileAndDefaults,
  isUserBootstrappedAdmin,
  parseEmailCsv,
  subscribePublicDirectory,
} from '../services/faydFirestoreService';
import type {
  BenefitBookingDoc,
  CatalogItemDoc,
  CateringFeedbackDoc,
  CharityContributionDoc,
  CharityInitiativeDoc,
  CommercialOrderDoc,
  CommissionRuleDoc,
  CourierProfileDoc,
  DeliveryRequestDoc,
  EntertainmentBenefitDoc,
  FaydOpportunityDoc,
  KaffarahOrderDoc,
  KaffarahRuleDoc,
  LedgerSettlementDoc,
  LogisticsServiceInquiryDoc,
  NotificationDoc,
  OfferAdDoc,
  OnboardingApplicationDoc,
  PaymentGatewayConfigDoc,
  PaymentTransactionDoc,
  PlatformSettingsDoc,
  PublicStorefrontDoc,
  SecurityAuditLogDoc,
  SubscriptionPlanDoc,
  TenantMemberDoc,
  TenantWorkspaceDoc,
  UserProfileDoc,
  UsufructContractDoc,
  UsufructProposalDoc,
  VipDirectOrderDoc,
} from '../types/faydEcosystem';

export function useFaydEcosystem(countryCode: CountryCode) {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionVerified, setConnectionVerified] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfileDoc | null>(null);
  const [publicStorefronts, setPublicStorefronts] = useState<PublicStorefrontDoc[]>([]);
  const [publicCatalogItems, setPublicCatalogItems] = useState<CatalogItemDoc[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanDoc[]>(
    DEFAULT_SUBSCRIPTION_PLANS as SubscriptionPlanDoc[]
  );
  const [commissionRule, setCommissionRule] = useState<CommissionRuleDoc>(
    DEFAULT_COMMISSION_RULE as CommissionRuleDoc
  );
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsDoc>(
    DEFAULT_PLATFORM_SETTINGS as PlatformSettingsDoc
  );
  const [gatewayConfigs, setGatewayConfigs] = useState<PaymentGatewayConfigDoc[]>(
    DEFAULT_GATEWAY_CONFIGS as PaymentGatewayConfigDoc[]
  );
  const [approvedOffersAds, setApprovedOffersAds] = useState<OfferAdDoc[]>([]);
  const [allOffersAds, setAllOffersAds] = useState<OfferAdDoc[]>([]);
  const [approvedOpportunities, setApprovedOpportunities] = useState<FaydOpportunityDoc[]>([]);

  const [myApplications, setMyApplications] = useState<OnboardingApplicationDoc[]>([]);
  const [allApplications, setAllApplications] = useState<OnboardingApplicationDoc[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfileDoc[]>([]);
  const [myTenants, setMyTenants] = useState<TenantWorkspaceDoc[]>([]);
  const [allTenants, setAllTenants] = useState<TenantWorkspaceDoc[]>([]);
  const [myTenantMembers, setMyTenantMembers] = useState<TenantMemberDoc[]>([]);
  const [myMerchantCatalog, setMyMerchantCatalog] = useState<CatalogItemDoc[]>([]);
  const [myMerchantOrders, setMyMerchantOrders] = useState<CommercialOrderDoc[]>([]);
  const [myCustomerOrders, setMyCustomerOrders] = useState<CommercialOrderDoc[]>([]);
  const [allOrders, setAllOrders] = useState<CommercialOrderDoc[]>([]);

  const [myDeliveryRequests, setMyDeliveryRequests] = useState<DeliveryRequestDoc[]>([]);
  const [myAssignedDeliveries, setMyAssignedDeliveries] = useState<DeliveryRequestDoc[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<DeliveryRequestDoc[]>([]);

  const [myCourierProfile, setMyCourierProfile] = useState<CourierProfileDoc | null>(null);
  const [allCouriers, setAllCouriers] = useState<CourierProfileDoc[]>([]);

  const [myOpportunities, setMyOpportunities] = useState<FaydOpportunityDoc[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<FaydOpportunityDoc[]>([]);

  const [myProposalsAsProposer, setMyProposalsAsProposer] = useState<UsufructProposalDoc[]>([]);
  const [myProposalsAsOwner, setMyProposalsAsOwner] = useState<UsufructProposalDoc[]>([]);
  const [allProposals, setAllProposals] = useState<UsufructProposalDoc[]>([]);

  const [myContractsAsProposer, setMyContractsAsProposer] = useState<UsufructContractDoc[]>([]);
  const [myContractsAsOwner, setMyContractsAsOwner] = useState<UsufructContractDoc[]>([]);
  const [allContracts, setAllContracts] = useState<UsufructContractDoc[]>([]);

  const [myLedgerEntries, setMyLedgerEntries] = useState<LedgerSettlementDoc[]>([]);
  const [allLedgerEntries, setAllLedgerEntries] = useState<LedgerSettlementDoc[]>([]);
  const [myNotifications, setMyNotifications] = useState<NotificationDoc[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationDoc[]>([]);
  const [myPaymentTransactions, setMyPaymentTransactions] = useState<PaymentTransactionDoc[]>([]);
  const [allPaymentTransactions, setAllPaymentTransactions] = useState<PaymentTransactionDoc[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogDoc[]>([]);

  const [entertainmentBenefits, setEntertainmentBenefits] = useState<EntertainmentBenefitDoc[]>([]);
  const [allEntertainmentBenefits, setAllEntertainmentBenefits] = useState<EntertainmentBenefitDoc[]>([]);
  const [myBenefitBookings, setMyBenefitBookings] = useState<BenefitBookingDoc[]>([]);
  const [allBenefitBookings, setAllBenefitBookings] = useState<BenefitBookingDoc[]>([]);

  const [charityInitiatives, setCharityInitiatives] = useState<CharityInitiativeDoc[]>([]);
  const [allCharityInitiatives, setAllCharityInitiatives] = useState<CharityInitiativeDoc[]>([]);
  const [myCharityContributions, setMyCharityContributions] = useState<CharityContributionDoc[]>([]);
  const [allCharityContributions, setAllCharityContributions] = useState<CharityContributionDoc[]>([]);

  const [kaffarahRule, setKaffarahRule] = useState<KaffarahRuleDoc | null>(null);
  const [myKaffarahOrders, setMyKaffarahOrders] = useState<KaffarahOrderDoc[]>([]);
  const [allKaffarahOrders, setAllKaffarahOrders] = useState<KaffarahOrderDoc[]>([]);

  const [myLogisticsInquiries, setMyLogisticsInquiries] = useState<LogisticsServiceInquiryDoc[]>([]);
  const [allLogisticsInquiries, setAllLogisticsInquiries] = useState<LogisticsServiceInquiryDoc[]>([]);

  const [myCateringFeedback, setMyCateringFeedback] = useState<CateringFeedbackDoc[]>([]);
  const [allCateringFeedback, setAllCateringFeedback] = useState<CateringFeedbackDoc[]>([]);
  const [myVipOrders, setMyVipOrders] = useState<VipDirectOrderDoc[]>([]);
  const [allVipOrders, setAllVipOrders] = useState<VipDirectOrderDoc[]>([]);

  const isBootAdmin = isUserBootstrappedAdmin(firebaseUser);
  const isOwnerAdmin = isBootAdmin;
  const isSuspendedProfile = !isOwnerAdmin && userProfile?.status === 'suspended';
  const verifiedEmail =
    firebaseUser?.emailVerified && firebaseUser.email
      ? firebaseUser.email.trim().toLowerCase()
      : '';
  const isDesignatedBasitAdmin = Boolean(
    !isSuspendedProfile &&
      verifiedEmail &&
      parseEmailCsv(platformSettings?.designatedBasitAdminEmailsCsv).includes(verifiedEmail)
  );
  const isDesignatedHabeApprover = Boolean(
    !isSuspendedProfile &&
      verifiedEmail &&
      parseEmailCsv(platformSettings?.designatedHabeApproverEmailsCsv).includes(verifiedEmail)
  );
  const canManageBasitOps =
    isOwnerAdmin ||
    (!isSuspendedProfile &&
      (isDesignatedBasitAdmin ||
        userProfile?.role === 'central_super_admin' ||
        userProfile?.role === 'central_admin'));
  const isFinanceAdmin = !isSuspendedProfile && userProfile?.role === 'finance_admin';
  const canApproveHabePurchases = isOwnerAdmin || isDesignatedHabeApprover;
  const isAdmin = canManageBasitOps;

  const countryCodeRef = useRef(countryCode);
  countryCodeRef.current = countryCode;

  useEffect(() => {
    let active = true;
    testFirestoreConnection().then((ok) => {
      if (!active) return;
      setDbConnected(ok);
      setConnectionVerified(true);
    });

    const handleOnlineRecovery = () => {
      if (!active) return;
      testFirestoreConnection().then((ok) => {
        if (!active) return;
        setDbConnected(ok);
        setConnectionVerified(true);
      });
      const current = auth.currentUser;
      if (current) {
        void ensureUserProfileAndDefaults(current, countryCodeRef.current);
      }
    };
    window.addEventListener('online', handleOnlineRecovery);

    void redirectAuthResultPromise.then((redirectedUser) => {
      if (!active || !redirectedUser) return;
      setFirebaseUser(redirectedUser);
      setAuthReady(true);
    });

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      setFirebaseUser(user);
      setAuthReady(true);
      if (user) {
        try {
          await ensureUserProfileAndDefaults(user, countryCodeRef.current);
          window.dispatchEvent(new CustomEvent('basit:session-updated'));
        } catch (err) {
          if (!isTransientFirestoreOrNetworkError(err)) {
            console.error('Profile initialization error:', err);
          }
        }
      } else {
        setUserProfile(null);
        setMyApplications([]);
        setAllApplications([]);
        setAllUsers([]);
        setMyTenants([]);
        setAllTenants([]);
        setMyTenantMembers([]);
        setMyMerchantCatalog([]);
        setMyMerchantOrders([]);
        setMyCustomerOrders([]);
        setAllOrders([]);
        setMyDeliveryRequests([]);
        setMyAssignedDeliveries([]);
        setAllDeliveries([]);
        setMyCourierProfile(null);
        setAllCouriers([]);
        setMyOpportunities([]);
        setAllOpportunities([]);
        setMyProposalsAsProposer([]);
        setMyProposalsAsOwner([]);
        setAllProposals([]);
        setMyContractsAsProposer([]);
        setMyContractsAsOwner([]);
        setAllContracts([]);
        setMyLedgerEntries([]);
        setAllLedgerEntries([]);
        setMyNotifications([]);
        setAllNotifications([]);
        setMyPaymentTransactions([]);
        setAllPaymentTransactions([]);
        setAllOffersAds([]);
        setAuditLogs([]);
        setAllEntertainmentBenefits([]);
        setMyBenefitBookings([]);
        setAllBenefitBookings([]);
        setAllCharityInitiatives([]);
        setMyCharityContributions([]);
        setAllCharityContributions([]);
        setMyKaffarahOrders([]);
        setAllKaffarahOrders([]);
        setMyLogisticsInquiries([]);
        setAllLogisticsInquiries([]);
        setMyCateringFeedback([]);
        setAllCateringFeedback([]);
        setMyVipOrders([]);
        setAllVipOrders([]);
      }
    });

    return () => {
      active = false;
      window.removeEventListener('online', handleOnlineRecovery);
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !connectionVerified || !dbConnected) return;
    const unsubPublic = subscribePublicDirectory({
      onStorefronts: setPublicStorefronts,
      onCatalogItems: setPublicCatalogItems,
      onPlans: setSubscriptionPlans,
      onOpportunities: setApprovedOpportunities,
      onOffersAds: setApprovedOffersAds,
      onGatewayConfigs: setGatewayConfigs,
      onEntertainmentBenefits: setEntertainmentBenefits,
      onCharityInitiatives: setCharityInitiatives,
      onKaffarahRule: setKaffarahRule,
      onPlatformSettings: setPlatformSettings,
    });
    return () => unsubPublic();
  }, [authReady, connectionVerified, dbConnected]);

  useEffect(() => {
    if (!authReady || !connectionVerified || !dbConnected || !firebaseUser) return;

    const uid = firebaseUser.uid;
    const unsubs: Unsubscribe[] = [];
    const safeSnapErr = (op: OperationType, path: string) => (error: unknown) => {
      if (isTransientFirestoreOrNetworkError(error)) {
        setDbConnected(false);
        return;
      }
      handleFirestoreError(error, op, path);
    };

    unsubs.push(
      onSnapshot(
        doc(db, 'users', uid),
        (snap) => {
          setDbConnected(true);
          setUserProfile(snap.exists() ? (snap.data() as UserProfileDoc) : null);
        },
        safeSnapErr(OperationType.GET, `users/${uid}`)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'commission_rules', 'global'),
        (snap) => {
          if (snap.exists()) {
            setCommissionRule(snap.data() as CommissionRuleDoc);
          }
        },
        safeSnapErr(OperationType.GET, 'commission_rules/global')
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'platform_settings', 'global'),
        (snap) => {
          if (snap.exists()) {
            setPlatformSettings(snap.data() as PlatformSettingsDoc);
          }
        },
        () => {}
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'notifications'), where('recipientUid', '==', uid)),
        (snap) => setMyNotifications(snap.docs.map((d) => d.data() as NotificationDoc)),
        safeSnapErr(OperationType.LIST, 'notifications')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'payment_transactions'), where('payerUid', '==', uid)),
        (snap) => setMyPaymentTransactions(snap.docs.map((d) => d.data() as PaymentTransactionDoc)),
        safeSnapErr(OperationType.LIST, 'payment_transactions')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'onboarding_applications'), where('applicantUid', '==', uid)),
        (snap) => setMyApplications(snap.docs.map((d) => d.data() as OnboardingApplicationDoc)),
        safeSnapErr(OperationType.LIST, 'onboarding_applications')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'tenants'), where('ownerUid', '==', uid)),
        (snap) => setMyTenants(snap.docs.map((d) => d.data() as TenantWorkspaceDoc)),
        safeSnapErr(OperationType.LIST, 'tenants')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'catalog_items'), where('merchantOwnerUid', '==', uid)),
        (snap) => setMyMerchantCatalog(snap.docs.map((d) => d.data() as CatalogItemDoc)),
        safeSnapErr(OperationType.LIST, 'catalog_items')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'commercial_orders'), where('merchantOwnerUid', '==', uid)),
        (snap) => setMyMerchantOrders(snap.docs.map((d) => d.data() as CommercialOrderDoc)),
        safeSnapErr(OperationType.LIST, 'commercial_orders')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'commercial_orders'), where('customerUid', '==', uid)),
        (snap) => setMyCustomerOrders(snap.docs.map((d) => d.data() as CommercialOrderDoc)),
        safeSnapErr(OperationType.LIST, 'commercial_orders')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'delivery_requests'), where('requesterUid', '==', uid)),
        (snap) => setMyDeliveryRequests(snap.docs.map((d) => d.data() as DeliveryRequestDoc)),
        safeSnapErr(OperationType.LIST, 'delivery_requests')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'delivery_requests'), where('assignedCourierUid', '==', uid)),
        (snap) => setMyAssignedDeliveries(snap.docs.map((d) => d.data() as DeliveryRequestDoc)),
        safeSnapErr(OperationType.LIST, 'delivery_requests')
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'couriers', uid),
        (snap) => setMyCourierProfile(snap.exists() ? (snap.data() as CourierProfileDoc) : null),
        safeSnapErr(OperationType.GET, `couriers/${uid}`)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'opportunities'), where('ownerUid', '==', uid)),
        (snap) => setMyOpportunities(snap.docs.map((d) => d.data() as FaydOpportunityDoc)),
        safeSnapErr(OperationType.LIST, 'opportunities')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'usufruct_proposals'), where('proposerUid', '==', uid)),
        (snap) => setMyProposalsAsProposer(snap.docs.map((d) => d.data() as UsufructProposalDoc)),
        safeSnapErr(OperationType.LIST, 'usufruct_proposals')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'usufruct_proposals'), where('opportunityOwnerUid', '==', uid)),
        (snap) => setMyProposalsAsOwner(snap.docs.map((d) => d.data() as UsufructProposalDoc)),
        safeSnapErr(OperationType.LIST, 'usufruct_proposals')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'usufruct_contracts'), where('proposerUid', '==', uid)),
        (snap) => setMyContractsAsProposer(snap.docs.map((d) => d.data() as UsufructContractDoc)),
        safeSnapErr(OperationType.LIST, 'usufruct_contracts')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'usufruct_contracts'), where('opportunityOwnerUid', '==', uid)),
        (snap) => setMyContractsAsOwner(snap.docs.map((d) => d.data() as UsufructContractDoc)),
        safeSnapErr(OperationType.LIST, 'usufruct_contracts')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'ledger_settlements'), where('beneficiaryUid', '==', uid)),
        (snap) => setMyLedgerEntries(snap.docs.map((d) => d.data() as LedgerSettlementDoc)),
        safeSnapErr(OperationType.LIST, 'ledger_settlements')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'benefit_bookings'), where('uid', '==', uid)),
        (snap) => setMyBenefitBookings(snap.docs.map((d) => d.data() as BenefitBookingDoc)),
        () => setMyBenefitBookings([])
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'charity_contributions'), where('contributorUid', '==', uid)),
        (snap) => setMyCharityContributions(snap.docs.map((d) => d.data() as CharityContributionDoc)),
        () => setMyCharityContributions([])
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'kaffarah_orders'), where('requesterUid', '==', uid)),
        (snap) => setMyKaffarahOrders(snap.docs.map((d) => d.data() as KaffarahOrderDoc)),
        () => setMyKaffarahOrders([])
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'logistics_service_inquiries'), where('requesterUid', '==', uid)),
        (snap) => setMyLogisticsInquiries(snap.docs.map((d) => d.data() as LogisticsServiceInquiryDoc)),
        () => setMyLogisticsInquiries([])
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'catering_feedback'), where('authorUid', '==', uid)),
        (snap) => setMyCateringFeedback(snap.docs.map((d) => d.data() as CateringFeedbackDoc)),
        () => setMyCateringFeedback([])
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'vip_direct_orders'), where('customerUid', '==', uid)),
        (snap) => setMyVipOrders(snap.docs.map((d) => d.data() as VipDirectOrderDoc)),
        () => setMyVipOrders([])
      )
    );

    if (isBootAdmin) {
      unsubs.push(
        onSnapshot(
          collection(db, 'users'),
          (snap) => setAllUsers(snap.docs.map((d) => d.data() as UserProfileDoc)),
          safeSnapErr(OperationType.LIST, 'users')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'onboarding_applications'),
          (snap) => setAllApplications(snap.docs.map((d) => d.data() as OnboardingApplicationDoc)),
          safeSnapErr(OperationType.LIST, 'onboarding_applications')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'tenants'),
          (snap) => setAllTenants(snap.docs.map((d) => d.data() as TenantWorkspaceDoc)),
          safeSnapErr(OperationType.LIST, 'tenants')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'commercial_orders'),
          (snap) => setAllOrders(snap.docs.map((d) => d.data() as CommercialOrderDoc)),
          safeSnapErr(OperationType.LIST, 'commercial_orders')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'couriers'),
          (snap) => setAllCouriers(snap.docs.map((d) => d.data() as CourierProfileDoc)),
          safeSnapErr(OperationType.LIST, 'couriers')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'delivery_requests'),
          (snap) => setAllDeliveries(snap.docs.map((d) => d.data() as DeliveryRequestDoc)),
          safeSnapErr(OperationType.LIST, 'delivery_requests')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'opportunities'),
          (snap) => setAllOpportunities(snap.docs.map((d) => d.data() as FaydOpportunityDoc)),
          safeSnapErr(OperationType.LIST, 'opportunities')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'usufruct_proposals'),
          (snap) => setAllProposals(snap.docs.map((d) => d.data() as UsufructProposalDoc)),
          safeSnapErr(OperationType.LIST, 'usufruct_proposals')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'usufruct_contracts'),
          (snap) => setAllContracts(snap.docs.map((d) => d.data() as UsufructContractDoc)),
          safeSnapErr(OperationType.LIST, 'usufruct_contracts')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'ledger_settlements'),
          (snap) => setAllLedgerEntries(snap.docs.map((d) => d.data() as LedgerSettlementDoc)),
          safeSnapErr(OperationType.LIST, 'ledger_settlements')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'notifications'),
          (snap) => setAllNotifications(snap.docs.map((d) => d.data() as NotificationDoc)),
          safeSnapErr(OperationType.LIST, 'notifications')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'offers_ads'),
          (snap) => setAllOffersAds(snap.docs.map((d) => d.data() as OfferAdDoc)),
          safeSnapErr(OperationType.LIST, 'offers_ads')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'payment_transactions'),
          (snap) => setAllPaymentTransactions(snap.docs.map((d) => d.data() as PaymentTransactionDoc)),
          safeSnapErr(OperationType.LIST, 'payment_transactions')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'payment_gateway_configs'),
          (snap) => {
            const docs = snap.docs.map((d) => d.data() as PaymentGatewayConfigDoc);
            if (docs.length > 0) setGatewayConfigs(docs);
          },
          safeSnapErr(OperationType.LIST, 'payment_gateway_configs')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'audit_logs'),
          (snap) => setAuditLogs(snap.docs.map((d) => d.data() as SecurityAuditLogDoc)),
          safeSnapErr(OperationType.LIST, 'audit_logs')
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'entertainment_benefits'),
          (snap) => setAllEntertainmentBenefits(snap.docs.map((d) => d.data() as EntertainmentBenefitDoc)),
          () => setAllEntertainmentBenefits([])
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'benefit_bookings'),
          (snap) => setAllBenefitBookings(snap.docs.map((d) => d.data() as BenefitBookingDoc)),
          () => setAllBenefitBookings([])
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'charity_initiatives'),
          (snap) => setAllCharityInitiatives(snap.docs.map((d) => d.data() as CharityInitiativeDoc)),
          () => setAllCharityInitiatives([])
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'charity_contributions'),
          (snap) => setAllCharityContributions(snap.docs.map((d) => d.data() as CharityContributionDoc)),
          () => setAllCharityContributions([])
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'kaffarah_orders'),
          (snap) => setAllKaffarahOrders(snap.docs.map((d) => d.data() as KaffarahOrderDoc)),
          () => setAllKaffarahOrders([])
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'logistics_service_inquiries'),
          (snap) => setAllLogisticsInquiries(snap.docs.map((d) => d.data() as LogisticsServiceInquiryDoc)),
          () => setAllLogisticsInquiries([])
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'catering_feedback'),
          (snap) => setAllCateringFeedback(snap.docs.map((d) => d.data() as CateringFeedbackDoc)),
          () => setAllCateringFeedback([])
        )
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'vip_direct_orders'),
          (snap) => setAllVipOrders(snap.docs.map((d) => d.data() as VipDirectOrderDoc)),
          () => setAllVipOrders([])
        )
      );
    }

    return () => unsubs.forEach((u) => u());
  }, [authReady, connectionVerified, dbConnected, firebaseUser, isBootAdmin]);

  const activeTenantId = myTenants[0]?.tenantId;
  useEffect(() => {
    if (!authReady || !connectionVerified || !dbConnected || !firebaseUser?.emailVerified || !activeTenantId) {
      setMyTenantMembers([]);
      return;
    }
    const unsub = onSnapshot(
      collection(db, 'tenants', activeTenantId, 'members'),
      (snap) => setMyTenantMembers(snap.docs.map((d) => d.data() as TenantMemberDoc)),
      () => setMyTenantMembers([])
    );
    return () => unsub();
  }, [authReady, connectionVerified, dbConnected, firebaseUser, activeTenantId]);

  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthLoading(true);
    try {
      return await ecosystemGoogleSignIn();
    } catch (error) {
      console.error('Sign-in error:', error);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutAccount = async () => {
    await logout();
    window.dispatchEvent(new CustomEvent('basit:session-updated'));
  };

  return {
    authReady,
    firebaseUser,
    dbConnected,
    authLoading,
    signInWithGoogle,
    signOutAccount,
    isAdmin,
    isBootAdmin,
    isOwnerAdmin,
    isFinanceAdmin,
    isDesignatedBasitAdmin,
    isDesignatedHabeApprover,
    canManageBasitOps,
    canApproveHabePurchases,
    userProfile,
    allUsers,
    publicStorefronts,
    publicCatalogItems,
    subscriptionPlans,
    commissionRule,
    platformSettings,
    gatewayConfigs,
    approvedOffersAds,
    allOffersAds,
    approvedOpportunities,
    myApplications,
    allApplications,
    myTenant: myTenants[0] || null,
    myTenants,
    allTenants,
    myTenantMembers,
    myMerchantCatalog,
    myMerchantOrders,
    myCustomerOrders,
    allOrders,
    myDeliveryRequests,
    myAssignedDeliveries,
    allDeliveries,
    myCourierProfile,
    allCouriers,
    myOpportunities,
    allOpportunities,
    myProposalsAsProposer,
    myProposalsAsOwner,
    allProposals,
    myContractsAsProposer,
    myContractsAsOwner,
    allContracts,
    myLedgerEntries,
    allLedgerEntries,
    myNotifications,
    allNotifications,
    myPaymentTransactions,
    allPaymentTransactions,
    auditLogs,
    entertainmentBenefits,
    allEntertainmentBenefits,
    myBenefitBookings,
    allBenefitBookings,
    charityInitiatives,
    allCharityInitiatives,
    myCharityContributions,
    allCharityContributions,
    kaffarahRule,
    myKaffarahOrders,
    allKaffarahOrders,
    myLogisticsInquiries,
    allLogisticsInquiries,
    myCateringFeedback,
    allCateringFeedback,
    myVipOrders,
    allVipOrders,
  };
}
