import React, { Suspense, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CLIENT_TENANTS,
} from './data/mockOperationalData';
import {
  AuditLogEntry,
  ClientTenant,
} from './types/dashboard';
import type {
  UniversalDocType,
  DocItem,
} from './components/UniversalDocumentBuilderModal';
import { OwnerCmsProvider } from './context/OwnerCmsContext';
import { Phase1TopBar, type NotificationItem } from './components/Phase1TopBar';
import { Phase1HomeView } from './components/Phase1HomeView';
import type { Phase1RfqSubmission } from './components/Phase1ServicesHub';
import type { Phase1CartItem } from './components/Phase1CartDrawer';
import { SplashScreen } from './components/SplashScreen';
import type {
  Phase1ActivityItem,
  UnifiedSubmoduleKey,
} from './components/Phase1AuthAdminView';
import type { SupportMessageEntry } from './components/Phase1SupportDrawer';
import {
  CountryCode,
  LanguageCode,
  PHASE1_I18N,
  RoleScope,
  SUPPORTED_COUNTRIES,
  CentralKitchenId,
  OrganizedCateringMenu,
} from './data/phase1Data';
import {
  ShieldCheck,
  CheckCircle2,
  Home,
  UtensilsCrossed,
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Briefcase,
  X,
  CalendarClock,
  Wallet,
  PhoneCall,
  Plus,
  UserRound,
  LogIn,
  LogOut,
  Search,
  ShoppingCart,
} from 'lucide-react';
import type { FaydPortalTab } from './components/fayd/FaydEcosystemHub';
import { useFaydEcosystem } from './hooks/useFaydEcosystem';
import {
  submitVipDirectOrder,
  updateNotificationStatus,
} from './services/faydFirestoreService';
import { Phase1LoginView, type OtpCustomerSession } from './components/Phase1LoginView';
import { getLastGoogleAuthErrorMessage } from './lib/firebase';
import { EXECUTIVE_ACCOUNTS, DEFAULT_ROLE_PERMISSION_MATRIX } from './types/rbac';
import { HabeDirectInstallModal } from './components/HabeDirectInstallModal';
import type { ShowcaseSubpageKey } from './components/Phase1ShowcaseSubpages';
import type { FavoriteEntry } from './components/FavoritesDrawer';
import type { AndroidModalType } from './components/AndroidCateringModals';
import type { B2BTrackedOrder } from './data/freshWorldData';
import { ingestPurchaseToOwnerLedger } from './services/ownerFinanceService';

const CustomerPortalView = React.lazy(() => import('./components/CustomerPortalView').then((m) => ({ default: m.CustomerPortalView })));
const HaccpInspectionHub = React.lazy(() => import('./components/HaccpInspectionHub').then((m) => ({ default: m.HaccpInspectionHub })));
const HabeGermanMarketPortal = React.lazy(() => import('./components/HabeGermanMarketPortal').then((m) => ({ default: m.HabeGermanMarketPortal })));
const OfficialLegalPaperworkModal = React.lazy(() => import('./components/OfficialLegalPaperworkModal').then((m) => ({ default: m.OfficialLegalPaperworkModal })));
const DepartmentsHubView = React.lazy(() => import('./components/DepartmentsHubView').then((m) => ({ default: m.DepartmentsHubView })));
const FinancialPortalView = React.lazy(() => import('./components/FinancialPortalView').then((m) => ({ default: m.FinancialPortalView })));
const FinancialCostControlHub = React.lazy(() => import('./components/FinancialCostControlHub').then((m) => ({ default: m.FinancialCostControlHub })));
const PrintableReportModal = React.lazy(() => import('./components/PrintableReportModal').then((m) => ({ default: m.PrintableReportModal })));
const UniversalDocumentBuilderModal = React.lazy(() => import('./components/UniversalDocumentBuilderModal').then((m) => ({ default: m.UniversalDocumentBuilderModal })));
const CamelLiverVipModal = React.lazy(() => import('./components/CamelLiverVipModal').then((m) => ({ default: m.CamelLiverVipModal })));
const OperationalTasksModal = React.lazy(() => import('./components/OperationalTasksModal').then((m) => ({ default: m.OperationalTasksModal })));
const PaymentMethodsHubView = React.lazy(() => import('./components/PaymentMethodsHubView').then((m) => ({ default: m.PaymentMethodsHubView })));
const Phase1KitchensView = React.lazy(() => import('./components/Phase1KitchensView').then((m) => ({ default: m.Phase1KitchensView })));
const Phase1ServicesHub = React.lazy(() => import('./components/Phase1ServicesHub').then((m) => ({ default: m.Phase1ServicesHub })));
const Phase1CartDrawer = React.lazy(() => import('./components/Phase1CartDrawer').then((m) => ({ default: m.Phase1CartDrawer })));
const AlAinVisitorWorldView = React.lazy(() => import('./components/AlAinVisitorWorldView').then((m) => ({ default: m.AlAinVisitorWorldView })));
const Phase1AuthAdminView = React.lazy(() => import('./components/Phase1AuthAdminView').then((m) => ({ default: m.Phase1AuthAdminView })));
const Phase1SupportDrawer = React.lazy(() => import('./components/Phase1SupportDrawer').then((m) => ({ default: m.Phase1SupportDrawer })));
const FaydEcosystemHub = React.lazy(() => import('./components/fayd/FaydEcosystemHub').then((m) => ({ default: m.FaydEcosystemHub })));
const EntertainmentBenefitsView = React.lazy(() => import('./components/EntertainmentBenefitsView').then((m) => ({ default: m.EntertainmentBenefitsView })));
const LogisticsComplementaryServicesView = React.lazy(() => import('./components/LogisticsComplementaryServicesView').then((m) => ({ default: m.LogisticsComplementaryServicesView })));
const CharityGoodDeedsView = React.lazy(() => import('./components/CharityGoodDeedsView').then((m) => ({ default: m.CharityGoodDeedsView })));
const KaffarahView = React.lazy(() => import('./components/KaffarahView').then((m) => ({ default: m.KaffarahView })));
const Phase1ShowcaseSubpages = React.lazy(() => import('./components/Phase1ShowcaseSubpages').then((m) => ({ default: m.Phase1ShowcaseSubpages })));
const FavoritesDrawer = React.lazy(() => import('./components/FavoritesDrawer').then((m) => ({ default: m.FavoritesDrawer })));
const IconsGuideModal = React.lazy(() => import('./components/IconsGuideModal').then((m) => ({ default: m.IconsGuideModal })));
const AndroidCateringModals = React.lazy(() => import('./components/AndroidCateringModals').then((m) => ({ default: m.AndroidCateringModals })));
const ClientWorkspaceTabs = React.lazy(() => import('./components/ClientWorkspaceTabs').then((m) => ({ default: m.ClientWorkspaceTabs })));
const VisitorContactView = React.lazy(() => import('./components/VisitorContactView').then((m) => ({ default: m.VisitorContactView })));
const FreshWorldStorefrontView = React.lazy(() => import('./components/FreshWorldStorefrontView').then((m) => ({ default: m.FreshWorldStorefrontView })));
const B2BCheckoutTrackingView = React.lazy(() => import('./components/B2BCheckoutTrackingView').then((m) => ({ default: m.B2BCheckoutTrackingView })));
const OwnerFinancialDashboard = React.lazy(() => import('./components/OwnerFinancialDashboard').then((m) => ({ default: m.OwnerFinancialDashboard })));
const FinanceManagerPortalView = React.lazy(() => import('./components/FinanceManagerPortalView').then((m) => ({ default: m.FinanceManagerPortalView })));
const BasetFoodBenefitsView = React.lazy(() => import('./components/BasetFoodBenefitsView').then((m) => ({ default: m.BasetFoodBenefitsView })));
const BasetFamilyEntertainmentView = React.lazy(() => import('./components/BasetFamilyEntertainmentView').then((m) => ({ default: m.BasetFamilyEntertainmentView })));
const BasetCardShowcaseView = React.lazy(() => import('./components/BasetCardShowcaseView').then((m) => ({ default: m.BasetCardShowcaseView })));
import {
  fetchBasetCardStatus,
  type BasetCardRecord,
  type BasetRedemptionRecord,
} from './services/basetBenefitsService';

const SHOWCASE_SUBPAGE_KEYS: ShowcaseSubpageKey[] = [
  'b2b_services_hub',
  'al_ain_hub',
  'entertainment_showcase',
  'corporate_portfolio',
  'auxiliary_portals',
  'all_functions_directory',
];

function isGuestSectionAllowed(section: string): boolean {
  return (
    section === 'home' ||
    section === 'fresh_world' ||
    section === 'b2b_checkout' ||
    section === 'b2b_tracking' ||
    section === 'visitor_contact' ||
    section === 'al_ain_restaurants' ||
    section === 'al_ain_coupons' ||
    section === 'al_ain_habe' ||
    section === 'service_meals_offer' ||
    section === 'service_corporate' ||
    section === 'service_weddings' ||
    section === 'logistics_services' ||
    section === 'baset_food_benefits' ||
    section === 'baset_family_entertainment' ||
    section === 'baset_card' ||
    section === 'fayd_marketplace' ||
    section === 'payments' ||
    section === 'payment_methods' ||
    section === 'finance_manager_portal' ||
    section === 'login' ||
    section.startsWith('al_ain_restaurant:')
  );
}

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Real Light / Dark Theme State (Default: Pure Radiant Milky-White Light Mode)
  const [isDark, setIsDark] = useState<boolean>(() =>
    readStoredJson<boolean>('ce_theme_dark', false)
  );
  const [isRtl, setIsRtl] = useState<boolean>(() => {
    const saved = readStoredJson<LanguageCode>('ce_phase1_lang', 'ar');
    return saved === 'ar';
  });

  // Unified Single-App Navigation State (Always starts with 3s Android Splash -> Onboarding)
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [phase1Country, setPhase1Country] = useState<CountryCode>(() => {
    const saved = readStoredJson<string>('ce_phase1_country', 'EG');
    return saved === 'QA' || saved === 'OM' || saved === 'GB' ? saved : 'EG';
  });
  const [phase1Role, setPhase1Role] = useState<RoleScope>('visitor');
  const [phase1Section, setPhase1Section] = useState<string>('home');
  const [sectionHistory, setSectionHistory] = useState<string[]>([]);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [otpSession, setOtpSession] = useState<OtpCustomerSession | null>(null);
  const [serverRole, setServerRole] = useState<'customer' | 'basit_admin' | 'finance_admin' | 'owner' | null>(null);
  const [ecosystemPortal, setEcosystemPortal] = useState<FaydPortalTab>('onboarding');
  const [merchantInitialMode, setMerchantInitialMode] = useState<'storefront_market' | 'my_workspace'>('storefront_market');
  const [activeSubmodule, setActiveSubmodule] = useState<UnifiedSubmoduleKey | null>(null);
  const [selectedKitchenId, setSelectedKitchenId] = useState<
    CentralKitchenId | null
  >(null);

  const ecosystem = useFaydEcosystem(phase1Country);
  const [preselectedQuoteKitchen, setPreselectedQuoteKitchen] = useState<string>('');
  const [customLogoDataUrl, setCustomLogoDataUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ce_phase1_logo');
    } catch {
      return null;
    }
  });

  // Cart, Favorites & Submissions Persistence
  const [cartItems, setCartItems] = useState<Phase1CartItem[]>(() =>
    readStoredJson<Phase1CartItem[]>('ce_phase1_cart', [])
  );
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() =>
    readStoredJson<FavoriteEntry[]>('ce_basit_favorites', [])
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isIconsGuideOpen, setIsIconsGuideOpen] = useState(false);
  const [rfqSubmissions, setRfqSubmissions] = useState<Phase1RfqSubmission[]>(() =>
    readStoredJson<Phase1RfqSubmission[]>('ce_phase1_rfqs', [])
  );
  const [supportMessages, setSupportMessages] = useState<SupportMessageEntry[]>(() =>
    readStoredJson<SupportMessageEntry[]>('ce_phase1_support', [])
  );
  const [phase1Activity, setPhase1Activity] = useState<Phase1ActivityItem[]>(() =>
    readStoredJson<Phase1ActivityItem[]>('ce_phase1_activity', [])
  );

  // Preserved Operational Datasets & Modals inside Unified Shell
  const [tenants] = useState<ClientTenant[]>(INITIAL_CLIENT_TENANTS);
  const [, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [isLegalPaperworkModalOpen, setIsLegalPaperworkModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isUniversalDocBuilderOpen, setIsUniversalDocBuilderOpen] = useState(false);
  const [universalDocType, setUniversalDocType] = useState<UniversalDocType>('quotation');
  const [universalDocCompany, setUniversalDocCompany] = useState<string | undefined>(undefined);
  const [universalDocItems, setUniversalDocItems] = useState<DocItem[] | undefined>(undefined);
  const [universalDocOrderRef, setUniversalDocOrderRef] = useState<string | undefined>(undefined);
  const [universalDocNotes, setUniversalDocNotes] = useState<string | undefined>(undefined);
  const [universalDocContact, setUniversalDocContact] = useState<string | undefined>(undefined);
  const [isCamelLiverModalOpen, setIsCamelLiverModalOpen] = useState(false);
  const [isOperationalTasksModalOpen, setIsOperationalTasksModalOpen] = useState(false);
  const [tasksModalInitialTitle, setTasksModalInitialTitle] = useState<string | undefined>(undefined);
  const [tasksModalInitialNotes, setTasksModalInitialNotes] = useState<string | undefined>(undefined);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHabeInstallModalOpen, setIsHabeInstallModalOpen] = useState<boolean>(false);
  const [activeCateringModal, setActiveCateringModal] = useState<AndroidModalType>(null);
  const [cateringModalKitchen, setCateringModalKitchen] = useState<string>('');
  const [selectedMenuSheet, setSelectedMenuSheet] = useState<OrganizedCateringMenu | null>(null);
  const [trackedB2bOrders, setTrackedB2bOrders] = useState<B2BTrackedOrder[]>(() =>
    readStoredJson<B2BTrackedOrder[]>('basit_b2b_tracked_orders', [])
  );
  const [flyParticles, setFlyParticles] = useState<
    { id: string; startX: number; startY: number; deltaX: number; deltaY: number; active: boolean }[]
  >([]);
  const [basetCardState, setBasetCardState] = useState<{
    loading: boolean;
    activated: boolean;
    card: BasetCardRecord | null;
    redemptions: BasetRedemptionRecord[];
  }>({
    loading: true,
    activated: false,
    card: null,
    redemptions: [],
  });
  const isAuthenticated = Boolean(ecosystem.firebaseUser) || Boolean(otpSession);
  const isStrictAppOwner = Boolean(
    ecosystem.firebaseUser?.email?.toLowerCase() === 'hamzaelhelaly08@gmail.com' ||
      (otpSession?.email?.toLowerCase() === 'hamzaelhelaly08@gmail.com' &&
        otpSession.canonicalRole === 'super_admin')
  );
  const showPreLoginFinanceManagerPortal =
    !isAuthenticated && !isGuestMode && phase1Section === 'finance_manager_portal';
  const isAuthGateScreen =
    !isAuthenticated && !isGuestMode && !showPreLoginFinanceManagerPortal;

  // Sync Dark / Light Theme across entire document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('ce_theme_dark', JSON.stringify(isDark));
    } catch {
      // ignore
    }
  }, [isDark]);

  // Sync RTL/LTR direction
  useEffect(() => {
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isRtl ? 'ar' : 'en');
    try {
      localStorage.setItem('ce_phase1_lang', JSON.stringify(isRtl ? 'ar' : 'en'));
    } catch {
      // ignore
    }
  }, [isRtl]);

  useEffect(() => {
    try {
      localStorage.setItem('ce_phase1_country', JSON.stringify(phase1Country));
    } catch {
      // ignore
    }
  }, [phase1Country]);

  useEffect(() => {
    try {
      localStorage.setItem('ce_phase1_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('ce_basit_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('basit_b2b_tracked_orders', JSON.stringify(trackedB2bOrders));
    } catch {
      // ignore
    }
  }, [trackedB2bOrders]);

  useEffect(() => {
    const onOpenCateringEvent = (e: Event) => {
      const detail = (e as CustomEvent<AndroidModalType>).detail;
      if (detail) {
        setCateringModalKitchen('');
        setActiveCateringModal(detail);
      }
    };
    window.addEventListener('basit:open-catering-modal', onOpenCateringEvent);
    return () => window.removeEventListener('basit:open-catering-modal', onOpenCateringEvent);
  }, []);

  const refreshBasetCardStatus = async () => {
    const resp = await fetchBasetCardStatus();
    setBasetCardState({
      loading: false,
      activated: Boolean(resp.activated),
      card: resp.card || null,
      redemptions: Array.isArray(resp.redemptions) ? resp.redemptions : [],
    });
  };

  useEffect(() => {
    void refreshBasetCardStatus();
  }, [ecosystem.firebaseUser?.uid, otpSession?.email]);

  useEffect(() => {
    try {
      localStorage.setItem('ce_phase1_rfqs', JSON.stringify(rfqSubmissions));
    } catch {
      // ignore
    }
  }, [rfqSubmissions]);

  useEffect(() => {
    try {
      localStorage.setItem('ce_phase1_support', JSON.stringify(supportMessages));
    } catch {
      // ignore
    }
  }, [supportMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('ce_phase1_activity', JSON.stringify(phase1Activity));
    } catch {
      // ignore
    }
  }, [phase1Activity]);

  // Hydrate client session directly from Firebase Authentication (no server session endpoints)
  useEffect(() => {
    const fbUser = ecosystem.firebaseUser;
    if (!fbUser) {
      setOtpSession(null);
      setServerRole(null);
      return;
    }

    const emailLower = (fbUser.email || '').trim().toLowerCase();
    const matchedExec = EXECUTIVE_ACCOUNTS.find((a) => a.email.toLowerCase() === emailLower);
    const isOwner = emailLower === 'hamzaelhelaly08@gmail.com';
    const canonicalRole = isOwner
      ? 'super_admin'
      : matchedExec?.canonicalRole || 'customer';
    const resolvedRole: 'customer' | 'basit_admin' | 'finance_admin' | 'owner' = isOwner
      ? 'owner'
      : canonicalRole === 'platform_admin'
        ? 'basit_admin'
        : canonicalRole === 'finance_manager'
          ? 'finance_admin'
          : 'customer';

    setServerRole(resolvedRole);
    setIsGuestMode(false);
    setOtpSession({
      email: fbUser.email || '',
      uid: fbUser.uid,
      fullName:
        fbUser.displayName ||
        (isRtl ? matchedExec?.fullNameAr : matchedExec?.fullNameEn) ||
        (fbUser.email ? fbUser.email.split('@')[0] : 'BASIT User'),
      verifiedAt: new Date().toLocaleTimeString(),
      role: resolvedRole,
      canonicalRole,
      tenantId: matchedExec?.tenantId,
      tenantName:
        matchedExec?.tenantId === 'tenant_client_habe'
          ? 'H-A-B-E Industrial'
          : undefined,
      tenantKind:
        matchedExec?.tenantId === 'tenant_client_habe'
          ? 'client_company'
          : undefined,
      permissions: DEFAULT_ROLE_PERMISSION_MATRIX[canonicalRole],
      approvalStatus: 'approved',
      canApproveHabe: matchedExec?.canApproveHabe || isOwner,
      authKind: fbUser.providerData.some((p) => p.providerId === 'google.com')
        ? 'google_firebase'
        : 'password',
    });
  }, [ecosystem.firebaseUser]);

  // Keep BASIT app cleanly scoped at '/' with its own indigo/slate identity (Ha-Be lives isolated at '/habe')
  useEffect(() => {
    document.title = 'BASIT | باسط — منظومة الإعاشة والتغذية والمزايا للشركة الوطنية اللوجستية';
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const langCode: LanguageCode = isRtl ? 'ar' : 'en';
  const t1 = PHASE1_I18N[langCode];

  const triggerGoogleSignIn = (navigateHomeOnSuccess = false) => {
    void ecosystem.signInWithGoogle().then((u) => {
      if (u) {
        setIsGuestMode(false);
        if (navigateHomeOnSuccess) {
          setPhase1Section('home');
        }
        showToast(isRtl ? 'تم تسجيل الدخول عبر Google بنجاح.' : 'Signed in with Google.');
      } else {
        const errMsg = getLastGoogleAuthErrorMessage(langCode);
        if (errMsg) {
          showToast(errMsg);
        }
      }
    });
  };
  const activeCountryObj =
    SUPPORTED_COUNTRIES.find((c) => c.code === phase1Country) || SUPPORTED_COUNTRIES[0];
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const actSeqRef = React.useRef(0);

  const logPhase1Action = (actionAr: string, actionEn: string) => {
    actSeqRef.current += 1;
    setPhase1Activity((prev) => [
      {
        id: `ACT-${Date.now().toString().slice(-5)}-${actSeqRef.current}`,
        actionAr,
        actionEn,
        actorRole: phase1Role,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const handleAddAuditLog = (actionAr: string, actionEn: string, details: string) => {
    actSeqRef.current += 1;
    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}-${actSeqRef.current}`,
        timestamp: isRtl ? 'الآن' : 'Just now',
        userRole: 'ops_director',
        userName: phase1Role,
        moduleName: 'BASIT | باسط',
        actionAr,
        actionEn,
        details,
        severity: 'info',
      },
      ...prev,
    ]);
    logPhase1Action(actionAr, actionEn);
  };

  const handleFullSignOut = () => {
    void ecosystem.signOutAccount().then(() => {
      setOtpSession(null);
      setServerRole(null);
      setIsGuestMode(false);
      setActiveSubmodule(null);
      setSectionHistory([]);
      setPhase1Section('login');
      showToast(isRtl ? 'تم تسجيل الخروج بنجاح.' : 'Signed out successfully.');
    });
  };

  const handlePhase1Navigate = (
    section: string,
    kitchenId?: CentralKitchenId
  ) => {
    if (!isAuthenticated && !isGuestSectionAllowed(section)) {
      showToast(
        isRtl
          ? 'يرجى تسجيل الدخول بحساب معتمد للوصول إلى هذا القسم.'
          : 'Please sign in with an authorized account to access this section.'
      );
      setIsGuestMode(false);
      setActiveSubmodule(null);
      setPhase1Section('login');
      return;
    }

    if (section === 'owner_finance' && !isStrictAppOwner) {
      showToast(
        isRtl
          ? 'محظور (403): المنصة المالية الخاصة بالمالك مقصورة حصرياً على مالك التطبيق المعتمد.'
          : 'Forbidden (403): Owner Financial Platform is strictly restricted to the App Owner.'
      );
      return;
    }

    setActiveSubmodule(null);

    let nextTarget = section;
    if (section === 'fayd_onboarding') {
      setSelectedKitchenId(null);
      setEcosystemPortal('onboarding');
      nextTarget = 'fayd_ecosystem';
    } else if (section === 'fayd_merchant_workspace') {
      setSelectedKitchenId(null);
      setMerchantInitialMode('my_workspace');
      setEcosystemPortal('merchant');
      nextTarget = 'fayd_ecosystem';
    } else if (section === 'fayd_marketplace') {
      setSelectedKitchenId(null);
      setMerchantInitialMode('storefront_market');
      setEcosystemPortal('merchant');
      nextTarget = 'fayd_ecosystem';
    } else if (section === 'fayd_delivery_partner') {
      setSelectedKitchenId(null);
      setEcosystemPortal('delivery');
      nextTarget = 'fayd_ecosystem';
    } else if (section === 'fayd_courier_portal') {
      setSelectedKitchenId(null);
      setEcosystemPortal('courier');
      nextTarget = 'fayd_ecosystem';
    } else if (section === 'fayd_admin_governance') {
      setSelectedKitchenId(null);
      setEcosystemPortal('central_admin');
      nextTarget = 'fayd_ecosystem';
    } else if (section === 'notifications_panel') {
      setSelectedKitchenId(null);
      nextTarget = 'admin';
    } else if (section === 'service_hygiene') {
      setSelectedKitchenId(null);
      nextTarget = section;
    } else if (section === 'kitchen_detail' && kitchenId) {
      setSelectedKitchenId(kitchenId);
      nextTarget = 'kitchens';
    } else if (section === 'kitchens') {
      setSelectedKitchenId(null);
      nextTarget = 'kitchens';
    } else {
      setSelectedKitchenId(null);
      nextTarget = section;
    }

    setPhase1Section((prev) => {
      if (prev && prev !== nextTarget) {
        setSectionHistory((h) => [...h.slice(-14), prev]);
      }
      return nextTarget;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackNav = () => {
    if (activeSubmodule) {
      setActiveSubmodule(null);
      return;
    }
    setSectionHistory((h) => {
      if (h.length === 0) {
        setPhase1Section('home');
        return [];
      }
      const nextHist = [...h];
      const previous = nextHist.pop() || 'home';
      setPhase1Section(previous);
      return nextHist;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubmodule = (key: UnifiedSubmoduleKey) => {
    if (!isAuthenticated) {
      showToast(
        isRtl
          ? 'يلزم تسجيل الدخول للوصول إلى البوابات التشغيلية والمالية.'
          : 'Sign in required to access operational and financial submodules.'
      );
      setIsGuestMode(false);
      setPhase1Section('login');
      return;
    }
    if (key === 'financial_cost_control' && !isStrictAppOwner) {
      showToast(
        isRtl
          ? 'غير مصرح (403): هذه المنظومة المالية مقصورة حصرياً على مالك التطبيق.'
          : 'Forbidden (403): This financial module is restricted to the App Owner.'
      );
      return;
    }
    if (key === 'legal_paperwork') {
      setIsLegalPaperworkModalOpen(true);
      return;
    }
    setActiveSubmodule(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadOfficialLogo = (dataUrl: string) => {
    if (!ecosystem.canManageBasitOps) {
      showToast(
        isRtl
          ? 'تحديث الشعار الرسمي للمنصة مقصور فقط على المالك أو المدير المعين عبر Google.'
          : 'Updating official platform logo is restricted to Owner or designated admins.'
      );
      return;
    }
    setCustomLogoDataUrl(dataUrl);
    try {
      localStorage.setItem('ce_phase1_logo', dataUrl);
    } catch {
      // ignore
    }
    logPhase1Action('تحديث الشعار الرسمي للمنصة', 'Updated Official Platform Logo');
    showToast(isRtl ? 'تم رفع وحفظ الشعار الرسمي بنجاح.' : 'Official logo uploaded and saved.');
  };

  const handleResetOfficialLogo = () => {
    if (!ecosystem.canManageBasitOps) {
      showToast(
        isRtl
          ? 'تغيير الشعار الرسمي مقصور فقط على المالك أو المدير المعين عبر Google.'
          : 'Resetting official platform logo is restricted to Owner or designated admins.'
      );
      return;
    }
    setCustomLogoDataUrl(null);
    try {
      localStorage.removeItem('ce_phase1_logo');
    } catch {
      // ignore
    }
    showToast(isRtl ? 'تمت استعادة مساحة الشعار الرسمي.' : 'Official logo slot reset.');
  };

  const handleAddToCart = (item: Omit<Phase1CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    logPhase1Action(`إضافة "${item.nameAr}" إلى السلة`, `Added "${item.nameEn}" to cart`);
    showToast(isRtl ? `تمت إضافة "${item.nameAr}" إلى السلة.` : `Added "${item.nameEn}" to cart.`);
  };

  const handleAddProductWithFly = (
    item: Omit<Phase1CartItem, 'quantity'>,
    sourceEl: HTMLElement | null
  ) => {
    handleAddToCart(item);

    const targetEl = document.querySelector('[data-basit-cart-target="true"]') as HTMLElement | null;
    if (!sourceEl || !targetEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const dstRect = targetEl.getBoundingClientRect();
    const startX = srcRect.left + srcRect.width / 2;
    const startY = srcRect.top + srcRect.height / 2;
    const deltaX = dstRect.left + dstRect.width / 2 - startX;
    const deltaY = dstRect.top + dstRect.height / 2 - startY;
    const pId = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    setFlyParticles((prev) => [
      ...prev,
      { id: pId, startX, startY, deltaX, deltaY, active: false },
    ]);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFlyParticles((prev) =>
          prev.map((p) => (p.id === pId ? { ...p, active: true } : p))
        );
      });
    });

    window.setTimeout(() => {
      setFlyParticles((prev) => prev.filter((p) => p.id !== pId));
    }, 520);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleFavorite = (entry: FavoriteEntry) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === entry.id);
      if (exists) {
        showToast(isRtl ? `تمت إزالة "${entry.titleAr}" من المفضلة.` : `Removed "${entry.titleEn}" from favorites.`);
        return prev.filter((f) => f.id !== entry.id);
      }
      showToast(isRtl ? `تمت إضافة "${entry.titleAr}" إلى المفضلة.` : `Added "${entry.titleEn}" to favorites.`);
      return [entry, ...prev];
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const openGenericDocBuilder = (type: UniversalDocType, company?: string) => {
    setUniversalDocItems(undefined);
    setUniversalDocOrderRef(undefined);
    setUniversalDocNotes(undefined);
    setUniversalDocContact(undefined);
    setUniversalDocType(type);
    setUniversalDocCompany(company);
    setIsUniversalDocBuilderOpen(true);
  };

  const openWideHabeMenuPdf = () => {
    openGenericDocBuilder('wide_habe_menu', 'شركة ها-بي المصرية للخرسانة والكيماويات (Ha-Be / Ba_He)');
  };

  const handleCheckoutAndInvoice = async () => {
    if (cartItems.length === 0) return;

    const cartDocItems: DocItem[] = cartItems.map((c) => ({
      id: c.id,
      description: isRtl ? c.nameAr : c.nameEn,
      portionSpec:
        c.approvedPrice === null
          ? isRtl
            ? `${c.kitchenNameAr} (بانتظار تسعير المطبخ)`
            : `${c.kitchenNameEn} (Pending kitchen pricing)`
          : isRtl
          ? c.kitchenNameAr
          : c.kitchenNameEn,
      quantity: c.quantity,
      unitPrice: typeof c.approvedPrice === 'number' ? c.approvedPrice : 0,
    }));

    const subtotal = cartDocItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const hasPendingPrices = cartItems.some((c) => c.approvedPrice === null);
    let orderId = `CART-${Date.now().toString().slice(-6)}`;

    if (ecosystem.firebaseUser) {
      try {
        orderId = await submitVipDirectOrder(ecosystem.firebaseUser, {
          customerName:
            ecosystem.firebaseUser.displayName ||
            (isRtl ? 'عميل سلة باسط' : 'BASIT Cart Customer'),
          phone: '01000000000',
          sourceChannel: 'cart_direct',
          items: cartDocItems.map((d) => ({
            title: d.description,
            qty: d.quantity,
            unitPriceEGP: d.unitPrice,
            note: d.portionSpec,
          })),
          totalEGP: Math.max(1, subtotal),
          paymentMethod: 'vodafone_cash',
          notes: hasPendingPrices
            ? isRtl
              ? 'طلب مباشر من السلة (يشمل أصناف بانتظار تسعير المطبخ)'
              : 'Direct cart order (includes items pending kitchen pricing)'
            : isRtl
            ? 'طلب مباشر من سلة الطلبات — BASIT | باسط'
            : 'Direct cart checkout — BASIT | باسط',
        });
        if (subtotal > 0) {
          void ingestPurchaseToOwnerLedger({
            source: 'سلة المشتريات — باسط',
            purpose: `فاتورة سلة (${cartItems.length} أصناف)`,
            grossEGP: subtotal,
            paymentMethod: 'vodafone_cash',
            orderRef: `CART-${orderId}`,
          });
        }
        handleAddAuditLog(
          `إرسال طلب السلة [${orderId}] للمالك`,
          `Submitted cart order [${orderId}] to owner`,
          `${cartItems.length} أصناف · ${subtotal} ج.م`
        );
        showToast(
          isRtl
            ? `تم إرسال طلب السلة [${orderId}] للمالك وإصدار الفاتورة.`
            : `Cart order [${orderId}] sent to owner and invoice ready.`
        );
      } catch {
        showToast(
          isRtl
            ? 'تم تجهيز الفاتورة مباشرة. يرجى مراجعة الاتصال لإتمام الحفظ.'
            : 'Invoice prepared. Please check connection to persist.'
        );
      }
    } else {
      showToast(
        isRtl
          ? 'تم تجهيز فاتورة السلة بدقة. سجّل الدخول بـ Google لإرسالها فوراً لصندوق المالك.'
          : 'Cart invoice ready. Sign in with Google to route order to Owner Inbox.'
      );
    }

    setIsCartOpen(false);
    setUniversalDocType('commercial_invoice');
    setUniversalDocCompany(
      ecosystem.firebaseUser?.displayName || (isRtl ? 'عميل منصة باسط' : 'BASIT Platform Client')
    );
    setUniversalDocItems(cartDocItems);
    setUniversalDocOrderRef(orderId);
    setUniversalDocContact(ecosystem.firebaseUser?.email || '+201010430347');
    setUniversalDocNotes(
      hasPendingPrices
        ? isRtl
          ? 'فاتورة سلة الطلبات الفعلية — الأصناف بقيمة 0 تخضع للتسعير النهائي من المطبخ.'
          : 'Exact cart invoice — items at 0 are pending final kitchen pricing.'
        : isRtl
        ? 'فاتورة طلب مباشر من سلة باسط — الدفع فودافون كاش / إنستاباي / فوري / كاش.'
        : 'Direct BASIT Cart Invoice — Vodafone Cash / InstaPay / Fawry / COD.'
    );
    setIsUniversalDocBuilderOpen(true);
  };

  const handlePhase1SubmitRfq = (rfq: Phase1RfqSubmission) => {
    setRfqSubmissions((prev) => [rfq, ...prev]);
    logPhase1Action(
      `إرسال طلب [${rfq.id}] — ${rfq.organizationOrKitchenName}`,
      `Submitted request [${rfq.id}] — ${rfq.organizationOrKitchenName}`
    );
    showToast(
      isRtl
        ? `تم تسجيل طلبك وحفظه برقم: ${rfq.id}`
        : `Request confirmed with tracking ID: ${rfq.id}`
    );
  };

  const phase1Notifications: NotificationItem[] = useMemo(() => {
    const base: NotificationItem[] = [
      {
        id: 'n_public_1',
        titleAr: 'مرحباً بك في منصة BASIT | باسط الشاملة',
        titleEn: 'Welcome to the unified BASIT | باسط platform',
        category: 'offer',
        allowedRoles: [
          'visitor',
          'individual',
          'corporate_client',
          'kitchen_manager',
          'system_admin',
        ],
        timeLabel: isRtl ? 'النظام' : 'System',
      },
    ];
    rfqSubmissions.slice(0, 3).forEach((rfq) => {
      base.unshift({
        id: `n_rfq_${rfq.id}`,
        titleAr: `طلب [${rfq.id}]: ${rfq.organizationOrKitchenName} (${rfq.status})`,
        titleEn: `RFQ [${rfq.id}]: ${rfq.organizationOrKitchenName}`,
        category: 'order',
        allowedRoles: ['kitchen_manager', 'system_admin'],
        timeLabel: rfq.createdAt,
      });
    });
    if (cartItems.length > 0) {
      base.push({
        id: 'n_cart_reminder',
        titleAr: `لديك ${cartItems.length} أصناف محفوظة في سلة الطلبات`,
        titleEn: `You have ${cartItems.length} saved items in your cart`,
        category: 'order',
        allowedRoles: [
          'visitor',
          'individual',
          'corporate_client',
          'kitchen_manager',
          'system_admin',
        ],
        timeLabel: isRtl ? 'السلة' : 'Cart',
      });
    }
    return base;
  }, [rfqSubmissions, cartItems.length, isRtl]);

  const isAlAinVisitorSection = phase1Section.startsWith('al_ain_');
  const isServicesSection =
    phase1Section.startsWith('service_') ||
    phase1Section === 'quotation' ||
    phase1Section === 'join_kitchen';

  const totalNotificationCount = useMemo(() => {
    const isAuth = Boolean(ecosystem.firebaseUser) || Boolean(otpSession);
    if (isAuth) {
      const list = ecosystem.canManageBasitOps
        ? ecosystem.allNotifications
        : ecosystem.myNotifications;
      return list.filter((n) => n.status === 'new').length;
    }
    return phase1Notifications.filter((n) => n.allowedRoles.includes(phase1Role)).length;
  }, [
    ecosystem.firebaseUser,
    ecosystem.canManageBasitOps,
    ecosystem.allNotifications,
    ecosystem.myNotifications,
    otpSession,
    phase1Notifications,
    phase1Role,
  ]);

  return (
    <OwnerCmsProvider settings={ecosystem.platformSettings}>
      <div className="min-h-[100dvh] w-full bg-[#EDE9FE] flex justify-center overflow-x-hidden">
      <div className="relative min-h-[100dvh] max-w-[430px] w-full mx-auto overflow-x-hidden bg-gradient-to-b from-[#FEF9C3] via-[#FEF3C7]/85 to-[#EDE9FE] text-[#3B0764] flex flex-col font-sans pb-[calc(5.25rem+env(safe-area-inset-bottom))] shadow-[0_0_48px_rgba(59,7,100,0.16)] transition-colors duration-200">
      {/* Flying Add-to-Cart Particle Trail Overlay */}
      {flyParticles.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          className="fixed z-[100] pointer-events-none w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-gradient-to-br from-[#FFD54F] via-[#FACC15] to-[#4C1D95] shadow-[0_0_18px_rgba(255,213,79,0.9)] ring-2 ring-[#3B0764] transition-all duration-450 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            transform: p.active
              ? `translate3d(${p.deltaX}px, ${p.deltaY}px, 0) scale(0.45)`
              : 'translate3d(0, 0, 0) scale(1.15)',
            opacity: p.active ? 0.25 : 1,
          }}
        />
      ))}

      {/* Official BASIT | باسط Android Splash Screen (3s -> Onboarding / App) */}
      {showSplash && (
        <SplashScreen
          lang={langCode}
          customLogoDataUrl={customLogoDataUrl}
          onEnterPlatform={() => {
            setShowSplash(false);
            if (!ecosystem.firebaseUser && !otpSession) {
              setPhase1Section('login');
            }
          }}
        />
      )}

      {/* Global Toast */}
      {!showSplash && toastMessage && (
        <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] inset-x-0 max-w-[430px] mx-auto px-3 z-[95] pointer-events-none">
          <div className="pointer-events-auto w-full bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-white border border-[#FFD54F] rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-[#FFD54F] shrink-0" />
              <p className="text-xs font-bold leading-relaxed break-words">{toastMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#EDE9FE] hover:text-[#FFD54F] min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Unified Top Bar (Hidden while SplashScreen or Mandatory Pre-Login Auth Gate is visible) */}
      {!showSplash && !isAuthGateScreen && (
      <Phase1TopBar
        lang={langCode}
        onToggleLang={() => setIsRtl((p) => !p)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((p) => !p)}
        country={phase1Country}
        onSelectCountry={(c) => {
          setPhase1Country(c);
          logPhase1Action(`تغيير الدولة النشطة إلى ${c}`, `Changed active country to ${c}`);
        }}
        role={phase1Role}
        customLogoDataUrl={customLogoDataUrl}
        onUploadLogo={handleUploadOfficialLogo}
        onResetLogo={handleResetOfficialLogo}
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenIconsGuide={() => setIsIconsGuideOpen(true)}
        notifications={phase1Notifications}
        firestoreNotifications={
          ecosystem.canManageBasitOps ? ecosystem.allNotifications : ecosystem.myNotifications
        }
        isAuthenticated={isAuthenticated}
        isGuestMode={isGuestMode}
        isAdminUser={
          ecosystem.canManageBasitOps ||
          serverRole === 'owner' ||
          serverRole === 'basit_admin' ||
          otpSession?.canonicalRole === 'super_admin' ||
          otpSession?.canonicalRole === 'platform_admin'
        }
        isStrictAppOwner={isStrictAppOwner}
        loggedInEmail={ecosystem.firebaseUser?.email || otpSession?.email || ''}
        onOpenPdfBuilder={() => openGenericDocBuilder('quotation')}
        onOpenOperationalTasks={() => setIsOperationalTasksModalOpen(true)}
        onOpenAuthGate={() => {
          setIsGuestMode(false);
          setPhase1Section('login');
        }}
        onSignOut={handleFullSignOut}
        onMarkNotificationStatus={async (notifId, status) => {
          if (!ecosystem.firebaseUser) return;
          await updateNotificationStatus(notifId, status);
        }}
        onNavigateSection={handlePhase1Navigate}
      />
      )}

      {/* Main Content Container (Strictly Constrained Inside 430px Mobile Viewport) */}
      <main className="flex-1 w-full min-w-0 mx-auto px-3 pt-3 pb-20 overflow-x-hidden">
        <Suspense
          fallback={
            <div className="py-12 text-center text-xs font-black text-[#62339A] dark:text-[#FFC928]">
              {isRtl ? 'جاري تحميل القسم...' : 'Loading section...'}
            </div>
          }
        >
        {/* MANDATORY AUTH GATE: Unauthenticated visitors see ONLY the Golden-Yellow Login Gate */}
        {isAuthGateScreen ? (
          <Phase1LoginView
            lang={langCode}
            onToggleLang={() => setIsRtl((p) => !p)}
            isAuthGateMode
            isGoogleAuthenticated={Boolean(ecosystem.firebaseUser)}
            googleDisplayName={ecosystem.firebaseUser?.displayName || undefined}
            googleEmail={ecosystem.firebaseUser?.email || undefined}
            isOwnerAdmin={ecosystem.isOwnerAdmin}
            canManageBasitOps={ecosystem.canManageBasitOps}
            canApproveHabePurchases={ecosystem.canApproveHabePurchases}
            otpSession={otpSession}
            onOtpVerified={(session) => {
              setOtpSession(session);
              if (session.role) setServerRole(session.role);
              setIsGuestMode(false);
              setPhase1Section('home');
            }}
            onClearOtpSession={handleFullSignOut}
            onGoogleSignIn={() => triggerGoogleSignIn(true)}
            onSignOutGoogle={handleFullSignOut}
            onBackHome={() => setPhase1Section('home')}
            onContinueAsGuest={() => {
              setIsGuestMode(true);
              setSectionHistory([]);
              setPhase1Section('home');
              showToast(
                isRtl
                  ? 'مرحباً بك كزائر في باسط — سجّل الآن لفتح جميع المزايا والأسعار.'
                  : 'Welcome to BASIT Visitor Preview — Register anytime for full features.'
              );
            }}
            onOpenFinanceManagerPortal={() => {
              setIsGuestMode(false);
              setPhase1Section('finance_manager_portal');
            }}
            onOpenAdminHub={() => handlePhase1Navigate('admin')}
            onOpenTenantWorkspace={() => handlePhase1Navigate('admin')}
            onShowToast={showToast}
          />
        ) : (
        <>
        {/* UNIFORM SUB-PAGE HEADER BAR (Back · Home · Logout / Sign In) */}
        {(activeSubmodule || phase1Section !== 'home') && (
          <div className="mb-4 p-2 rounded-2xl bg-[#EDE9FE]/90 border border-[#4C1D95]/20 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackNav}
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FFFBEB] border border-[#4C1D95]/25 text-xs font-black text-[#3B0764] flex items-center gap-1.5 cursor-pointer"
              >
                <BackIcon className="w-4 h-4 text-[#4C1D95]" />
                <span>{isRtl ? 'الرجوع' : 'Back'}</span>
              </button>
              <button
                type="button"
                onClick={() => handlePhase1Navigate('home')}
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#4C1D95] text-xs font-black text-[#FFD54F] flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{t1.nav.home}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleFullSignOut}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#3B0764] text-[#FFD54F] border border-[#FFD54F]/50 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isRtl ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              ) : (
                phase1Section !== 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsGuestMode(false);
                      setPhase1Section('login');
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl basit-glass-btn-yellow text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isRtl ? 'تسجيل الدخول' : 'Sign In'}</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* If a preserved operational subsystem is opened inside the unified app, wrap it safely */}
        {activeSubmodule ? (
          <div className="space-y-4">
            {activeSubmodule === 'catering_finance' && (
              <FinancialPortalView
                isRtl={isRtl}
                readOnly={false}
                canManageFinance={Boolean(
                  ecosystem.isOwnerAdmin ||
                    ecosystem.isFinanceAdmin ||
                    serverRole === 'owner' ||
                    serverRole === 'finance_admin' ||
                    otpSession?.canonicalRole === 'super_admin' ||
                    otpSession?.canonicalRole === 'finance_manager'
                )}
                onOpenPrintReport={() => setIsPrintModalOpen(true)}
                onAddAuditLog={handleAddAuditLog}
                onShowToast={showToast}
              />
            )}

            {activeSubmodule === 'financial_cost_control' && isStrictAppOwner && (
              <FinancialCostControlHub
                isRtl={isRtl}
                onShowToast={showToast}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {activeSubmodule === 'departments' && (
              <DepartmentsHubView
                isRtl={isRtl}
                onClose={() => setActiveSubmodule(null)}
                onOpenDocBuilder={(type, company) => {
                  openGenericDocBuilder(type || 'quotation', company);
                }}
                onOpenCamelLiverModal={() => setIsCamelLiverModalOpen(true)}
                onAddAuditLog={handleAddAuditLog}
                onShowToast={showToast}
              />
            )}

            {activeSubmodule === 'haccp' && (
              <HaccpInspectionHub
                isRtl={isRtl}
                onOpenPrintReport={() => setIsPrintModalOpen(true)}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {activeSubmodule === 'client_portal' && (
              <CustomerPortalView
                tenants={tenants}
                isRtl={isRtl}
                onOpenSupport={() => handlePhase1Navigate('quotation')}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {activeSubmodule === 'habe_german' && (
              <HabeGermanMarketPortal
                isRtl={isRtl}
                onClose={() => setActiveSubmodule(null)}
                onAddAuditLog={handleAddAuditLog}
                onShowToast={showToast}
                onOpenWideMenuPdf={openWideHabeMenuPdf}
                canApproveHabePurchases={
                  ecosystem.canApproveHabePurchases || Boolean(otpSession?.canApproveHabe)
                }
                isOwnerAdmin={
                  ecosystem.isOwnerAdmin ||
                  serverRole === 'owner' ||
                  otpSession?.canonicalRole === 'super_admin'
                }
                currentAuthUserEmail={ecosystem.firebaseUser?.email || otpSession?.email || ''}
                currentUsername={otpSession?.username}
                currentEmployeeCode={otpSession?.employeeCode}
                isAuthVerified={isAuthenticated}
                onGoogleSignIn={() => triggerGoogleSignIn(false)}
                onSignOut={handleFullSignOut}
              />
            )}
          </div>
        ) : (
          <>
            {phase1Section === 'home' && (
              <Phase1HomeView
                lang={langCode}
                country={phase1Country}
                customLogoDataUrl={customLogoDataUrl}
                onUploadLogo={handleUploadOfficialLogo}
                approvedOffersAds={ecosystem.approvedOffersAds}
                myTenant={ecosystem.myTenant}
                isOwnerAdmin={ecosystem.canManageBasitOps}
                isStrictAppOwner={isStrictAppOwner}
                isGuestMode={isGuestMode}
                favoriteIds={favorites.map((f) => f.id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenIconsGuide={() => setIsIconsGuideOpen(true)}
                onOpenOwnerStudio={() => handlePhase1Navigate('admin')}
                onOpenOwnerExecutiveFinance={() => handlePhase1Navigate('owner_finance')}
                onOpenCamelLiverModal={() => setIsCamelLiverModalOpen(true)}
                onNavigateSection={handlePhase1Navigate}
                onOpenReportPdf={() => setIsPrintModalOpen(true)}
                onOpenQuotePdf={() => openGenericDocBuilder('quotation')}
                onOpenCateringModal={(modal, kName) => {
                  setCateringModalKitchen(kName || '');
                  setActiveCateringModal(modal);
                }}
                onSelectMenu={(menu) => setSelectedMenuSheet(menu)}
                onOpenControlDashboard={() => window.dispatchEvent(new CustomEvent('basit:open-menu-drawer'))}
              />
            )}

            {phase1Section === 'fresh_world' && (
              <FreshWorldStorefrontView
                lang={langCode}
                currencyLabel={isRtl ? activeCountryObj.currencyAr : activeCountryObj.currencyEn}
                cartItems={cartItems}
                onAddProductWithFly={handleAddProductWithFly}
                onOpenCart={() => setIsCartOpen(true)}
                onBackHome={() => handlePhase1Navigate('home')}
              />
            )}

            {(phase1Section === 'b2b_checkout' || phase1Section === 'b2b_tracking') && (
              <B2BCheckoutTrackingView
                mode={phase1Section === 'b2b_checkout' ? 'checkout' : 'tracking'}
                lang={langCode}
                currencyLabel={isRtl ? activeCountryObj.currencyAr : activeCountryObj.currencyEn}
                cartItems={cartItems}
                trackedOrders={trackedB2bOrders}
                onCreateOrder={(order) => {
                  setTrackedB2bOrders((prev) => [order, ...prev]);
                  setCartItems([]);
                  if (order.totalEgp > 0) {
                    void ingestPurchaseToOwnerLedger({
                      source: `تعاقد B2B — ${order.companyName || 'منشأة متعاقدة'}`,
                      purpose: `تعاقد توريد وجبات (${order.items.length} أصناف) — ${order.mapPinLabel}`,
                      grossEGP: order.totalEgp,
                      paymentMethod: 'bank_transfer',
                      orderRef: `B2B-${order.id}`,
                    });
                  }
                  handlePhase1Navigate('b2b_tracking');
                  showToast(
                    isRtl
                      ? `تم تأكيد التعاقد [${order.id}] وبدء تتبع توريد الوجبات.`
                      : `Contract [${order.id}] confirmed. Tracking active.`
                  );
                }}
                onAdvanceOrderStage={(orderId) => {
                  setTrackedB2bOrders((prev) =>
                    prev.map((o) =>
                      o.id === orderId && o.stageIndex < 3
                        ? { ...o, stageIndex: (o.stageIndex + 1) as 0 | 1 | 2 | 3 }
                        : o
                    )
                  );
                }}
                onSwitchMode={(nextMode) =>
                  handlePhase1Navigate(nextMode === 'checkout' ? 'b2b_checkout' : 'b2b_tracking')
                }
                onBackHome={() => handlePhase1Navigate('home')}
                onBrowseFreshWorld={() => handlePhase1Navigate('fresh_world')}
              />
            )}

            {(phase1Section === 'client_schedule' ||
              phase1Section === 'client_wallet' ||
              phase1Section === 'client_settings') && (
              <ClientWorkspaceTabs
                activeTab={phase1Section}
                lang={langCode}
                isDark={isDark}
                onToggleTheme={() => setIsDark((p) => !p)}
                onToggleLang={() => setIsRtl((p) => !p)}
                isOwnerAdmin={Boolean(
                  ecosystem.isOwnerAdmin ||
                    serverRole === 'owner' ||
                    otpSession?.canonicalRole === 'super_admin'
                )}
                isStrictAppOwner={isStrictAppOwner}
                userEmail={ecosystem.firebaseUser?.email || otpSession?.email || ''}
                userDisplayName={
                  ecosystem.firebaseUser?.displayName || otpSession?.fullName || undefined
                }
                rfqSubmissions={rfqSubmissions}
                onOpenModal={(modal) => {
                  setCateringModalKitchen('');
                  setActiveCateringModal(modal);
                }}
                onOpenFinancialHub={() => handleOpenSubmodule('financial_cost_control')}
                onOpenOwnerExecutiveFinance={() => handlePhase1Navigate('owner_finance')}
                onOpenPayments={() => handlePhase1Navigate('payments')}
                onOpenOperationalTasks={() => setIsOperationalTasksModalOpen(true)}
                onNavigateSection={handlePhase1Navigate}
                onSignOut={handleFullSignOut}
              />
            )}

            {phase1Section === 'visitor_contact' && (
              <VisitorContactView
                lang={langCode}
                country={phase1Country}
                onSubmitRfq={handlePhase1SubmitRfq}
                onOpenAuthGate={() => {
                  setIsGuestMode(false);
                  setPhase1Section('login');
                }}
              />
            )}

            {(phase1Section === 'payments' || phase1Section === 'payment_methods') && (
              <PaymentMethodsHubView
                isRtl={isRtl}
                isStandalonePage
                totalAmount={cartItems.reduce((acc, i) => acc + (i.approvedPrice || 0) * i.quantity, 0)}
                currencyLabel={activeCountryObj.currencyEn || 'EGP'}
                onPaymentSuccess={(method, refId) => {
                  const cartSubtotal = cartItems.reduce(
                    (acc, i) => acc + (i.approvedPrice || 0) * i.quantity,
                    0
                  );
                  if (cartSubtotal > 0) {
                    void ingestPurchaseToOwnerLedger({
                      source: 'بوابة الدفع المباشر — باسط',
                      purpose: `سداد طلب عبر ${method}`,
                      grossEGP: cartSubtotal,
                      paymentMethod: method,
                      orderRef: `PAY-${refId}`,
                    });
                  }
                  showToast(
                    isRtl
                      ? `تم تأكيد العملية بنجاح عبر ${method} برقم مرجعي: ${refId}`
                      : `Payment confirmed via ${method} with reference: ${refId}`
                  );
                }}
                onBack={() => handlePhase1Navigate('home')}
              />
            )}

            {phase1Section === 'owner_finance' && isStrictAppOwner && (
              <OwnerFinancialDashboard
                isRtl={isRtl}
                isStrictAppOwner={isStrictAppOwner}
                ownerEmail={
                  ecosystem.firebaseUser?.email ||
                  otpSession?.email ||
                  'hamzaelhelaly08@gmail.com'
                }
                rfqSubmissions={rfqSubmissions}
                trackedB2bOrders={trackedB2bOrders}
                allOrders={ecosystem.allOrders}
                allVipOrders={ecosystem.allVipOrders}
                onBackHome={() => handlePhase1Navigate('home')}
                onShowToast={showToast}
              />
            )}

            {phase1Section === 'finance_manager_portal' && (
              <FinanceManagerPortalView
                onBack={() => handlePhase1Navigate('home')}
                onShowToast={showToast}
              />
            )}

            {SHOWCASE_SUBPAGE_KEYS.includes(phase1Section as ShowcaseSubpageKey) && (
              <Phase1ShowcaseSubpages
                section={phase1Section as ShowcaseSubpageKey}
                lang={langCode}
                country={phase1Country}
                approvedOffersAds={ecosystem.approvedOffersAds}
                myTenant={ecosystem.myTenant}
                onOpenIconsGuide={() => setIsIconsGuideOpen(true)}
                onOpenHabeInstallModal={() => setIsHabeInstallModalOpen(true)}
                onNavigateSection={handlePhase1Navigate}
              />
            )}

            {phase1Section === 'login' && (
              <Phase1LoginView
                lang={langCode}
                onToggleLang={() => setIsRtl((p) => !p)}
                isGoogleAuthenticated={Boolean(ecosystem.firebaseUser)}
                googleDisplayName={ecosystem.firebaseUser?.displayName || undefined}
                googleEmail={ecosystem.firebaseUser?.email || undefined}
                isOwnerAdmin={ecosystem.isOwnerAdmin}
                canManageBasitOps={ecosystem.canManageBasitOps}
                canApproveHabePurchases={ecosystem.canApproveHabePurchases}
                otpSession={otpSession}
                onOtpVerified={(session) => {
                  setOtpSession(session);
                  if (session.role) setServerRole(session.role);
                  setIsGuestMode(false);
                }}
                onClearOtpSession={handleFullSignOut}
                onGoogleSignIn={() => triggerGoogleSignIn(false)}
                onSignOutGoogle={handleFullSignOut}
                onBackHome={() => handlePhase1Navigate('home')}
                onContinueAsGuest={() => {
                  setIsGuestMode(true);
                  setPhase1Section('home');
                }}
                onOpenFinanceManagerPortal={() => {
                  setIsGuestMode(false);
                  setPhase1Section('finance_manager_portal');
                }}
                onOpenAdminHub={() => handlePhase1Navigate('admin')}
                onOpenTenantWorkspace={() => handlePhase1Navigate('admin')}
                onShowToast={showToast}
              />
            )}

            {phase1Section === 'baset_food_benefits' && (
              <BasetFoodBenefitsView
                lang={langCode}
                currencyLabel={isRtl ? activeCountryObj.currencyAr : activeCountryObj.currencyEn}
                cardActivated={basetCardState.activated}
                cardLoading={basetCardState.loading}
                card={basetCardState.card}
                onNavigateTab={(tab) => handlePhase1Navigate(tab)}
                onBackHome={() => handlePhase1Navigate('home')}
                onRefreshCardStatus={refreshBasetCardStatus}
                onAddToCart={handleAddToCart}
                onToast={showToast}
              />
            )}

            {phase1Section === 'baset_family_entertainment' && (
              <BasetFamilyEntertainmentView
                lang={langCode}
                cardActivated={basetCardState.activated}
                cardLoading={basetCardState.loading}
                card={basetCardState.card}
                onNavigateTab={(tab) => handlePhase1Navigate(tab)}
                onBackHome={() => handlePhase1Navigate('home')}
                onOpenLegacyEntertainmentPortal={() => handlePhase1Navigate('entertainment_benefits')}
                onRefreshCardStatus={refreshBasetCardStatus}
                onToast={showToast}
              />
            )}

            {phase1Section === 'baset_card' && (
              <BasetCardShowcaseView
                lang={langCode}
                cardActivated={basetCardState.activated}
                cardLoading={basetCardState.loading}
                card={basetCardState.card}
                redemptions={basetCardState.redemptions}
                defaultName={
                  ecosystem.firebaseUser?.displayName || otpSession?.fullName || ''
                }
                onNavigateTab={(tab) => handlePhase1Navigate(tab)}
                onBackHome={() => handlePhase1Navigate('home')}
                onCardStateUpdated={(next) =>
                  setBasetCardState({
                    loading: false,
                    activated: next.activated,
                    card: next.card,
                    redemptions: next.redemptions,
                  })
                }
                onToast={showToast}
              />
            )}

            {phase1Section === 'entertainment_benefits' && (
              <EntertainmentBenefitsView
                lang={langCode}
                countryCode={phase1Country}
                user={ecosystem.firebaseUser}
                myTenant={ecosystem.myTenant}
                benefits={ecosystem.entertainmentBenefits}
                myBookings={ecosystem.myBenefitBookings}
                onRequireSignIn={() => triggerGoogleSignIn(false)}
                onBackHome={() => handlePhase1Navigate('home')}
                onToast={showToast}
              />
            )}

            {phase1Section === 'logistics_services' && (
              <LogisticsComplementaryServicesView
                lang={langCode}
                user={ecosystem.firebaseUser}
                myInquiries={ecosystem.myLogisticsInquiries}
                onRequireSignIn={() => triggerGoogleSignIn(false)}
                onBackHome={() => handlePhase1Navigate('home')}
                onToast={showToast}
              />
            )}

            {phase1Section === 'charity_good_deeds' && (
              <CharityGoodDeedsView
                lang={langCode}
                user={ecosystem.firebaseUser}
                initiatives={ecosystem.charityInitiatives}
                myContributions={ecosystem.myCharityContributions}
                onRequireSignIn={() => triggerGoogleSignIn(false)}
                onBackHome={() => handlePhase1Navigate('home')}
                onToast={showToast}
              />
            )}

            {phase1Section === 'kaffarah_yamin' && (
              <KaffarahView
                lang={langCode}
                user={ecosystem.firebaseUser}
                kaffarahRule={ecosystem.kaffarahRule}
                myKaffarahOrders={ecosystem.myKaffarahOrders}
                onRequireSignIn={() => triggerGoogleSignIn(false)}
                onBackHome={() => handlePhase1Navigate('home')}
                onToast={showToast}
              />
            )}

            {isAlAinVisitorSection && (
              <AlAinVisitorWorldView
                lang={langCode}
                activeSection={phase1Section}
                customLogoDataUrl={customLogoDataUrl}
                onUploadLogo={handleUploadOfficialLogo}
                onNavigateSection={handlePhase1Navigate}
                firebaseUser={ecosystem.firebaseUser}
                onRequireSignIn={() => triggerGoogleSignIn(false)}
                onShowToast={showToast}
                onOpenCamelLiverModal={() => setIsCamelLiverModalOpen(true)}
                onAddAuditLog={handleAddAuditLog}
                onOpenWideMenuPdf={openWideHabeMenuPdf}
                canApproveHabePurchases={
                  ecosystem.canApproveHabePurchases || Boolean(otpSession?.canApproveHabe)
                }
                isOwnerAdmin={
                  ecosystem.isOwnerAdmin ||
                  serverRole === 'owner' ||
                  otpSession?.canonicalRole === 'super_admin'
                }
                isAuthVerified={isAuthenticated}
                isGuestMode={isGuestMode}
                currentAuthUserEmail={ecosystem.firebaseUser?.email || otpSession?.email || ''}
                currentUsername={otpSession?.username}
                currentEmployeeCode={otpSession?.employeeCode}
                onSignOut={handleFullSignOut}
                favoriteIds={favorites.map((f) => f.id)}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
              />
            )}

            {phase1Section === 'kitchens' && (
              <Phase1KitchensView
                lang={langCode}
                selectedKitchenId={selectedKitchenId}
                onSelectKitchen={setSelectedKitchenId}
                onBackHome={() => handlePhase1Navigate('home')}
                onRequestQuoteForKitchen={(kName) => {
                  setPreselectedQuoteKitchen(kName);
                  handlePhase1Navigate('quotation');
                }}
                onAddToCart={handleAddToCart}
                onOpenOperationalTasksWithDetails={(title, notes) => {
                  setTasksModalInitialTitle(title);
                  setTasksModalInitialNotes(notes);
                  setIsOperationalTasksModalOpen(true);
                }}
              />
            )}

            {isServicesSection && (
              <Phase1ServicesHub
                lang={langCode}
                country={phase1Country}
                role={phase1Role}
                activeSection={phase1Section}
                preselectedKitchenName={preselectedQuoteKitchen}
                cartItems={cartItems}
                onNavigateSection={handlePhase1Navigate}
                onAddToCart={handleAddToCart}
                onSubmitRfq={handlePhase1SubmitRfq}
                rfqSubmissions={rfqSubmissions}
                onOpenHaccpHub={() => handleOpenSubmodule('haccp')}
              />
            )}

            {phase1Section === 'fayd_ecosystem' && (
              <FaydEcosystemHub
                lang={langCode}
                countryCode={phase1Country}
                ecosystem={ecosystem}
                activePortal={ecosystemPortal}
                onSelectPortal={setEcosystemPortal}
                initialMerchantMode={merchantInitialMode}
                onExportContractPdf={(companyTitle) => {
                  openGenericDocBuilder('quotation', companyTitle);
                }}
                onShowToast={showToast}
                onBackHome={() => handlePhase1Navigate('home')}
              />
            )}

            {phase1Section === 'admin' && (
              <Phase1AuthAdminView
                lang={langCode}
                country={phase1Country}
                onSelectCountry={setPhase1Country}
                role={phase1Role}
                onChangeRole={(r) => {
                  if ((r === 'kitchen_manager' || r === 'system_admin') && !ecosystem.canManageBasitOps) {
                    showToast(
                      isRtl
                        ? 'لا يمكن التبديل إلى دور الإدارة إلا لحساب المالك أو المديرين المعينين عبر Google.'
                        : 'Admin roles require verified Owner or designated Google admin login.'
                    );
                    return;
                  }
                  setPhase1Role(r);
                  logPhase1Action(`تغيير الدور النشط إلى ${r}`, `Switched active role to ${r}`);
                }}
                rfqSubmissions={rfqSubmissions}
                onUpdateRfqStatus={(id, status) => {
                  if (!ecosystem.canManageBasitOps) {
                    showToast(
                      isRtl
                        ? 'تحديث حالات الطلبات مقصور على المالك أو المدير المعين عبر Google.'
                        : 'Updating RFQ status is restricted to Owner or designated Google admin.'
                    );
                    return;
                  }
                  setRfqSubmissions((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, status } : item))
                  );
                  logPhase1Action(`تحديث حالة الطلب ${id} إلى ${status}`, `Updated RFQ ${id}`);
                }}
                activityLog={phase1Activity}
                onLogAccountRegistration={(type, label) => {
                  logPhase1Action(
                    `تسجيل حساب ${type === 'individual' ? 'أفراد' : 'شركات'}: ${label}`,
                    `Registered ${type} account: ${label}`
                  );
                }}
                onOpenSubmodule={handleOpenSubmodule}
                onOpenFaydEcosystem={() => handlePhase1Navigate('fayd_ecosystem')}
                onBackHome={() => handlePhase1Navigate('home')}
                isAuthenticated={Boolean(ecosystem.firebaseUser) || Boolean(otpSession)}
                userDisplayName={ecosystem.firebaseUser?.displayName || otpSession?.fullName || undefined}
                userEmail={ecosystem.firebaseUser?.email || otpSession?.email || undefined}
                isOwnerAdmin={
                  ecosystem.isOwnerAdmin ||
                  serverRole === 'owner' ||
                  otpSession?.canonicalRole === 'super_admin'
                }
                isStrictAppOwner={isStrictAppOwner}
                isServerOwner={serverRole === 'owner' || otpSession?.canonicalRole === 'super_admin'}
                isFinanceAdmin={
                  ecosystem.isFinanceAdmin ||
                  serverRole === 'finance_admin' ||
                  otpSession?.canonicalRole === 'finance_manager'
                }
                canManageAdminControls={
                  ecosystem.canManageBasitOps ||
                  serverRole === 'owner' ||
                  serverRole === 'basit_admin' ||
                  otpSession?.canonicalRole === 'super_admin' ||
                  otpSession?.canonicalRole === 'platform_admin'
                }
                onGoogleSignIn={() => triggerGoogleSignIn(false)}
                onSignOut={handleFullSignOut}
                onToggleLang={() => setIsRtl((p) => !p)}
                onOpenPrintReport={() => setIsPrintModalOpen(true)}
                onOpenOwnerExecutiveFinance={() => handlePhase1Navigate('owner_finance')}
                onAddAuditLog={handleAddAuditLog}
                platformSettings={ecosystem.platformSettings}
                allVipOrders={ecosystem.allVipOrders}
                allBenefitBookings={ecosystem.allBenefitBookings}
                firebaseUser={ecosystem.firebaseUser}
                otpSession={otpSession}
                onShowToast={showToast}
                onNavigateSection={handlePhase1Navigate}
              />
            )}
          </>
        )}
        </>
        )}
        </Suspense>
      </main>

      {/* Clean Brand Footer (Hidden during Splash & Mandatory Pre-Login Auth Gate) */}
      {!showSplash && !isAuthGateScreen && (
      <footer className="mt-8 border-t border-[#4C1D95]/15 bg-gradient-to-b from-[#EDE9FE] to-[#FEF9C3]/80 py-6 text-center transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <div className="text-base sm:text-lg font-black text-[#3B0764] tracking-wide">
            {t1.footerBrand}
          </div>
          <div className="text-xs sm:text-sm font-bold text-[#581C87]">
            {t1.footerRights}
          </div>
        </div>
      </footer>
      )}

      {/* Gold Floating Action Button ('+' طلب جديد / عرض سعر) constrained to 430px Mobile Shell */}
      {!showSplash && !isAuthGateScreen && !isGuestMode && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-0 max-w-[430px] mx-auto px-3 z-40 pointer-events-none flex justify-end">
          <button
            type="button"
            onClick={() => {
              setCateringModalKitchen('');
              setActiveCateringModal('quote_tasting');
            }}
            aria-label={isRtl ? 'طلب جديد / عرض سعر' : 'New Request / Quote'}
            className="pointer-events-auto h-11 px-3.5 rounded-full bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] text-[#3B0764] font-black text-xs shadow-[0_12px_28px_-6px_rgba(255,213,79,0.65)] ring-2 ring-[#4C1D95] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>{isRtl ? 'طلب جديد / عرض سعر' : 'New Quote'}</span>
          </button>
        </div>
      )}

      {/* Bottom Royal Purple Navigation Bar with Pure Unboxed White & Luminous Gold Icons */}
      {!showSplash && !isAuthGateScreen && (
      <nav
        aria-label={isRtl ? 'التنقل السفلي للموبايل' : 'Mobile Bottom Navigation'}
        className="fixed bottom-0 inset-x-0 max-w-[430px] w-full mx-auto z-40 pb-safe bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#581C87] border-t-2 border-[#FFD54F]/60 shadow-[0_-10px_28px_-8px_rgba(59,7,100,0.48)]"
      >
        {isGuestMode ? (
          <div className="grid grid-cols-5 h-[60px] px-1 items-center">
            <button
              type="button"
              onClick={() => handlePhase1Navigate('home')}
              className={`relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer transition-colors ${
                phase1Section === 'home' && !activeSubmodule
                  ? 'text-[#FFD54F]'
                  : 'text-white hover:text-[#FFD54F]'
              }`}
            >
              {phase1Section === 'home' && !activeSubmodule && (
                <span className="absolute top-0 inset-x-3 h-[2.5px] rounded-full bg-[#FFD54F]" />
              )}
              <Home className="w-5 h-5" strokeWidth={1.9} />
              <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('basit:open-search'))}
              className="relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer text-white hover:text-[#FFD54F]"
            >
              <Search className="w-5 h-5" strokeWidth={1.9} />
              <span>{isRtl ? 'بحث' : 'Search'}</span>
            </button>

            <button
              type="button"
              data-basit-cart-target="true"
              onClick={() => setIsCartOpen(true)}
              className="relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer text-white hover:text-[#FFD54F]"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" strokeWidth={1.9} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -end-2 text-[9px] font-black text-[#FFD54F] tabular-nums">
                    {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </div>
              <span>{isRtl ? 'السلة' : 'Cart'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsGuestMode(false);
                setPhase1Section('login');
              }}
              className="relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer text-white hover:text-[#FFD54F]"
            >
              <UserRound className="w-5 h-5" strokeWidth={1.9} />
              <span>{isRtl ? 'حسابي' : 'Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => handlePhase1Navigate('visitor_contact')}
              className={`relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer transition-colors ${
                phase1Section === 'visitor_contact'
                  ? 'text-[#FFD54F]'
                  : 'text-white hover:text-[#FFD54F]'
              }`}
            >
              {phase1Section === 'visitor_contact' && (
                <span className="absolute top-0 inset-x-3 h-[2.5px] rounded-full bg-[#FFD54F]" />
              )}
              <PhoneCall className="w-5 h-5" strokeWidth={1.9} />
              <span>{isRtl ? 'تواصل' : 'Contact'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 h-[60px] px-1 items-center">
            <button
              type="button"
              onClick={() => handlePhase1Navigate('home')}
              className={`relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer transition-colors ${
                phase1Section === 'home' && !activeSubmodule
                  ? 'text-[#FFD54F]'
                  : 'text-white hover:text-[#FFD54F]'
              }`}
            >
              {phase1Section === 'home' && !activeSubmodule && (
                <span className="absolute top-0 inset-x-3 h-[2.5px] rounded-full bg-[#FFD54F]" />
              )}
              <Home className="w-5 h-5" strokeWidth={1.9} />
              <span className="truncate max-w-full px-0.5 leading-tight">{isRtl ? 'الرئيسية' : 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('basit:open-search'))}
              className="relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer text-white hover:text-[#FFD54F]"
            >
              <Search className="w-5 h-5" strokeWidth={1.9} />
              <span className="truncate max-w-full px-0.5 leading-tight">{isRtl ? 'بحث' : 'Search'}</span>
            </button>

            <button
              type="button"
              data-basit-cart-target="true"
              onClick={() => setIsCartOpen(true)}
              className="relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer text-white hover:text-[#FFD54F]"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" strokeWidth={1.9} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -end-2 text-[9px] font-black text-[#FFD54F] tabular-nums">
                    {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </div>
              <span className="truncate max-w-full px-0.5 leading-tight">{isRtl ? 'السلة' : 'Cart'}</span>
            </button>

            <button
              type="button"
              onClick={() => handlePhase1Navigate('client_schedule')}
              className={`relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer transition-colors ${
                phase1Section === 'client_schedule' && !activeSubmodule
                  ? 'text-[#FFD54F]'
                  : 'text-white hover:text-[#FFD54F]'
              }`}
            >
              {phase1Section === 'client_schedule' && !activeSubmodule && (
                <span className="absolute top-0 inset-x-3 h-[2.5px] rounded-full bg-[#FFD54F]" />
              )}
              <CalendarClock className="w-5 h-5" strokeWidth={1.9} />
              <span className="truncate max-w-full px-0.5 leading-tight">
                {isRtl ? 'الطلبات' : 'Orders'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handlePhase1Navigate('client_wallet')}
              className={`relative min-h-[46px] py-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold cursor-pointer transition-colors ${
                (phase1Section === 'client_wallet' || activeSubmodule === 'financial_cost_control')
                  ? 'text-[#FFD54F]'
                  : 'text-white hover:text-[#FFD54F]'
              }`}
            >
              {(phase1Section === 'client_wallet' || activeSubmodule === 'financial_cost_control') && (
                <span className="absolute top-0 inset-x-3 h-[2.5px] rounded-full bg-[#FFD54F]" />
              )}
              <Wallet className="w-5 h-5" strokeWidth={1.9} />
              <span className="truncate max-w-full px-0.5 leading-tight">{isRtl ? 'المحفظة' : 'Wallet'}</span>
            </button>
          </div>
        )}
      </nav>
      )}

      <Suspense fallback={null}>
      {/* Cart Drawer */}
      {isCartOpen && (
      <Phase1CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lang={langCode}
        currencyLabel={isRtl ? activeCountryObj.currencyAr : activeCountryObj.currencyEn}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onConvertToQuote={() => {
          setIsCartOpen(false);
          handlePhase1Navigate('quotation');
        }}
        onProceedToB2BContract={() => {
          setIsCartOpen(false);
          handlePhase1Navigate('b2b_checkout');
        }}
        onCheckoutAndInvoice={() => {
          void handleCheckoutAndInvoice();
        }}
      />
      )}

      {/* Favorites Drawer */}
      {isFavoritesOpen && (
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        lang={langCode}
        items={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onNavigateSection={(sec) => handlePhase1Navigate(sec)}
      />
      )}

      {/* Icons & Walkthrough Guide Modal */}
      {isIconsGuideOpen && (
      <IconsGuideModal
        isOpen={isIconsGuideOpen}
        onClose={() => setIsIconsGuideOpen(false)}
        lang={langCode}
        country={phase1Country}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenDrawer={() => window.dispatchEvent(new CustomEvent('basit:open-menu-drawer'))}
      />
      )}

      {/* Freely Draggable Floating AI & Support Icon (Hidden during Splash & Mandatory Auth Gate) */}
      {!showSplash && !isAuthGateScreen && (
      <Phase1SupportDrawer
        lang={langCode}
        userRole={isGuestMode ? 'visitor' : serverRole || phase1Role}
        messages={supportMessages}
        onSendMessage={(msg) => {
          setSupportMessages((prev) => [...prev, msg]);
          logPhase1Action(`فتح تذكرة دعم ${msg.id} من ${msg.senderName}`, `Support ticket ${msg.id} logged`);
        }}
        onUpdateMessage={(id, patch) => {
          setSupportMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
          );
        }}
        onQuickNavigate={(sec) => handlePhase1Navigate(sec)}
      />
      )}

      {/* Preserved Enterprise Modals mounted cleanly inside unified app */}
      {isLegalPaperworkModalOpen && (
      <OfficialLegalPaperworkModal
        isOpen={isLegalPaperworkModalOpen}
        onClose={() => setIsLegalPaperworkModalOpen(false)}
        isRtl={isRtl}
        onShowToast={showToast}
        onAddAuditLog={handleAddAuditLog}
      />
      )}

      {isPrintModalOpen && (
      <PrintableReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        initialType="haccp_certificate"
        customData={{ recipientOrg: 'BASIT | باسط — HACCP Inspection Report' }}
      />
      )}

      {isUniversalDocBuilderOpen && (
      <UniversalDocumentBuilderModal
        isOpen={isUniversalDocBuilderOpen}
        onClose={() => setIsUniversalDocBuilderOpen(false)}
        isRtl={isRtl}
        initialType={universalDocType}
        recipientCompany={universalDocCompany}
        initialItems={universalDocItems}
        initialOrderRef={universalDocOrderRef}
        initialNotes={universalDocNotes}
        initialContact={universalDocContact}
        onAddAuditLog={handleAddAuditLog}
        onShowToast={showToast}
      />
      )}

      {isCamelLiverModalOpen && (
      <CamelLiverVipModal
        isOpen={isCamelLiverModalOpen}
        onClose={() => setIsCamelLiverModalOpen(false)}
        isRtl={isRtl}
        firebaseUser={ecosystem.firebaseUser}
        onRequireSignIn={() => triggerGoogleSignIn(false)}
        onAddAuditLog={handleAddAuditLog}
        onShowToast={showToast}
        onOpenInvoicePdf={(payload) => {
          setIsCamelLiverModalOpen(false);
          setUniversalDocType('commercial_invoice');
          setUniversalDocCompany(payload.recipientCompany);
          setUniversalDocItems(payload.items);
          setUniversalDocOrderRef(payload.orderRef);
          setUniversalDocNotes(payload.notes);
          setUniversalDocContact(payload.contact);
          setIsUniversalDocBuilderOpen(true);
        }}
      />
      )}

      {isOperationalTasksModalOpen && (
      <OperationalTasksModal
        isOpen={isOperationalTasksModalOpen}
        onClose={() => {
          setIsOperationalTasksModalOpen(false);
          setTasksModalInitialTitle(undefined);
          setTasksModalInitialNotes(undefined);
        }}
        isRtl={isRtl}
        initialTaskTitle={tasksModalInitialTitle}
        initialTaskNotes={tasksModalInitialNotes}
      />
      )}

      {isHabeInstallModalOpen && (
      <HabeDirectInstallModal
        isOpen={isHabeInstallModalOpen}
        onClose={() => setIsHabeInstallModalOpen(false)}
        onShowToast={showToast}
        onOpenHabePortal={() => {
          setIsHabeInstallModalOpen(false);
          handleOpenSubmodule('habe_german');
        }}
      />
      )}

      {Boolean(activeCateringModal || selectedMenuSheet) && (
      <AndroidCateringModals
        lang={langCode}
        country={phase1Country}
        activeModal={activeCateringModal}
        selectedMenu={selectedMenuSheet}
        preselectedKitchenName={cateringModalKitchen}
        isGuestMode={isGuestMode}
        onCloseModal={() => setActiveCateringModal(null)}
        onCloseMenu={() => setSelectedMenuSheet(null)}
        onSubmitRfq={handlePhase1SubmitRfq}
        onOpenAuthGate={() => {
          setIsGuestMode(false);
          setPhase1Section('login');
        }}
        onShowToast={showToast}
      />
      )}
      </Suspense>
      </div>
      </div>
    </OwnerCmsProvider>
  );
}
