import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  Flame,
  Home,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  MessageSquareWarning,
  Minus,
  Phone,
  Plus,
  Printer,
  QrCode,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Tag,
  Trash2,
  Truck,
  User,
  Users,
  UtensilsCrossed,
  X,
  XCircle,
} from 'lucide-react';
import {
  HABE_CONTACTS,
  HABE_EGYPT_EMPLOYEES,
  HABE_FULL_MENU,
  HABE_MENU_CATEGORIES,
  HABE_SATURDAY_OFFERS,
  HABE_SUPPLY_TERMS,
  HabeEmployeeRecord,
  HabeMenuCategoryKey,
  HabeMenuItem,
  habeHeroMealCupImg,
} from '../data/habeAndBuffetData';
import {
  HabeAwningLogo,
  HabeMarketProductVisual,
  HabeSkuVectorGlyph,
  PaymentMethodIcon,
} from './HabeMarketProductArt';
import { downloadHabeBrandedQrCard, RealQrCode } from './RealQrCode';
import { exportElementsToA4Pdf, triggerCleanA4Print } from '../lib/pdfExport';
import { usePWAInstall } from '../lib/usePWAInstall';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
} from 'firebase/auth';

type HabeLang = 'ar' | 'en' | 'de';
type HabeTab =
  | 'home'
  | 'meals'
  | 'market'
  | 'orders'
  | 'offers'
  | 'employees'
  | 'admin_payroll'
  | 'poster'
  | 'install'
  | 'account';
type PaymentMethodKey = 'vodafone_cash' | 'instapay' | 'payroll_deduction' | 'cash';
type OrderApprovalStatus = 'confirmed_paid' | 'pending_admin' | 'approved' | 'rejected';

interface CartLine {
  item: HabeMenuItem;
  qty: number;
}

interface HabeOrderRecord {
  id: string;
  createdAt: string;
  isoDate: string;
  employeeCode: string;
  employeeName: string;
  username: string;
  department: string;
  compNumber: string;
  anonymousVoucherMode: boolean;
  voucherCode?: string;
  paymentMethod: PaymentMethodKey;
  approvalStatus: OrderApprovalStatus;
  approvedAt?: string;
  trxRef: string;
  items: { code: string; nameAr: string; nameEn: string; qty: number; priceEGP: number }[];
  totalEGP: number;
}

interface ComplaintEntry {
  id: string;
  createdAt: string;
  sender: string;
  phone: string;
  message: string;
}

interface HabeGermanMarketPortalProps {
  isRtl: boolean;
  onClose?: () => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
  onRecordFinancialTransaction?: (entry: {
    id: string;
    description: string;
    amount: number;
    type: 'income';
    category: 'canteen_sales';
    paymentMethod: 'vodafone_cash';
    referenceNumber: string;
    siteId: string;
    siteName: string;
  }) => void;
  onShowToast: (msg: string) => void;
  onOpenWideMenuPdf?: () => void;
  isStandaloneApp?: boolean;
  canApproveHabePurchases?: boolean;
  isOwnerAdmin?: boolean;
  currentAuthUserEmail?: string;
  currentUsername?: string;
  currentEmployeeCode?: string;
  isAuthVerified?: boolean;
  onSessionAuthenticated?: (user: unknown) => void;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
}

interface ServerHabeOrderRecord {
  orderId: string;
  trxRef: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  placedByUid: string;
  placedByEmail: string;
  placedByUsername?: string;
  placedByName: string;
  paymentMethod: PaymentMethodKey;
  paymentAccountOrNote?: string;
  approvalStatus: 'confirmed_paid' | 'pending_approval' | 'approved' | 'rejected';
  kitchenName?: string;
  items: Array<{ id: string; code: string; nameAr: string; unitPriceEGP: number; qty: number; lineTotalEGP: number }>;
  totalEGP: number;
  createdAt: string;
  updatedAt: string;
  decidedByName?: string;
}

interface ExecutiveSetupStatusItem {
  username: string;
  fullNameAr: string;
  fullNameEn: string;
  roleLabelAr: string;
  hasPassword: boolean;
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore storage errors
  }
}

function mapServerOrderToUi(o: ServerHabeOrderRecord): HabeOrderRecord {
  return {
    id: o.orderId,
    createdAt: new Date(o.createdAt).toLocaleString('ar-EG'),
    isoDate: o.createdAt.slice(0, 10),
    employeeCode: o.employeeCode,
    employeeName: o.employeeName,
    username: o.placedByUsername || o.placedByEmail || '@habe.staff',
    department: o.department,
    compNumber: '',
    anonymousVoucherMode: false,
    paymentMethod: o.paymentMethod,
    approvalStatus: o.approvalStatus === 'pending_approval' ? 'pending_admin' : o.approvalStatus,
    approvedAt: o.decidedByName ? `${o.decidedByName} · ${new Date(o.updatedAt).toLocaleString('ar-EG')}` : undefined,
    trxRef: o.trxRef,
    items: (o.items || []).map((it) => ({
      code: it.code,
      nameAr: it.nameAr,
      nameEn: it.nameAr,
      qty: it.qty,
      priceEGP: it.unitPriceEGP,
    })),
    totalEGP: o.totalEGP,
  };
}

export const HabeGermanMarketPortal: React.FC<HabeGermanMarketPortalProps> = ({
  isRtl,
  onClose,
  onAddAuditLog,
  onRecordFinancialTransaction,
  onShowToast,
  onOpenWideMenuPdf,
  isStandaloneApp = false,
  canApproveHabePurchases = false,
  isOwnerAdmin = false,
  currentAuthUserEmail = '',
  currentUsername = '',
  currentEmployeeCode = '',
  isAuthVerified = false,
  onSessionAuthenticated,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [uiLang, setUiLang] = useState<HabeLang>(isRtl ? 'ar' : 'en');
  const [activeTab, setActiveTab] = useState<HabeTab>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('install') === '1') return 'install';
    } catch {
      // ignore
    }
    return 'home';
  });

  // Pre-Login Auth Gate State (Hard Gate on /habe)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [claimMode, setClaimMode] = useState(false);
  const [claimIdentifier, setClaimIdentifier] = useState('');
  const [claimFullName, setClaimFullName] = useState('');
  const [claimNewPassword, setClaimNewPassword] = useState('');
  const [claimConfirmPassword, setClaimConfirmPassword] = useState('');
  const [executivesStatus, setExecutivesStatus] = useState<ExecutiveSetupStatusItem[]>([]);

  // Account Tab Change Password State
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNext, setCpNext] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpFeedback, setCpFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Meals & Market filtering
  const [activeMealCategory, setActiveMealCategory] = useState<'all_meals' | Exclude<HabeMenuCategoryKey, 'drinks_snacks'>>('all_meals');
  const [activeMarketSubGroup, setActiveMarketSubGroup] = useState<'all' | 'drinks' | 'chips' | 'sweets'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Two-Step Orders Flow: 'cart' -> 'payment_gateway' -> 'receipt'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment_gateway' | 'receipt'>('cart');

  // Server-Isolated Employee Directory (Full 86+ for Approvers, Self-Only for Staff)
  const [allEmployees, setAllEmployees] = useState<HabeEmployeeRecord[]>([]);
  const [empFilterGroup, setEmpFilterGroup] = useState<'all' | 'corporate_sheet' | 'plant_operations'>('all');
  const [empSearch, setEmpSearch] = useState('');
  const [selectedQrEmployee, setSelectedQrEmployee] = useState<HabeEmployeeRecord | null>(null);
  const empBadgePrintRef = useRef<HTMLDivElement | null>(null);

  // Selected Identity State (Locked to authenticated self for regular staff)
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeUsername, setEmployeeUsername] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('التشغيل والإدارة');
  const [employeePhone, setEmployeePhone] = useState<string>('');
  const [anonymousVoucherMode, setAnonymousVoucherMode] = useState<boolean>(false);

  // Cart & Payment State
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>('vodafone_cash');
  const [trxRefInput, setTrxRefInput] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<HabeOrderRecord | null>(null);

  // Server-Authoritative Orders & Complaints Ledger (No cross-user localStorage bleed)
  const [ordersHistory, setOrdersHistory] = useState<HabeOrderRecord[]>([]);

  const [complaintsList, setComplaintsList] = useState<ComplaintEntry[]>(() =>
    readStored<ComplaintEntry[]>('habe_complaints_list', [])
  );
  const [complaintSender, setComplaintSender] = useState('');
  const [complaintPhone, setComplaintPhone] = useState('');
  const [complaintMsg, setComplaintMsg] = useState('');
  const [satCheckedAt, setSatCheckedAt] = useState<string | null>(null);
  const [isExportingMonthlyPdf, setIsExportingMonthlyPdf] = useState(false);

  // PWA Install hook
  const pwa = usePWAInstall();

  // Print refs
  const receiptPrintRef = useRef<HTMLDivElement | null>(null);
  const posterPrintRef = useRef<HTMLDivElement | null>(null);
  const paymentQrSlipPrintRef = useRef<HTMLDivElement | null>(null);
  const monthlyReportPrintRef = useRef<HTMLDivElement | null>(null);
  const installPosterPrintRef = useRef<HTMLDivElement | null>(null);

  // Executive setup statuses are resolved via Firebase Auth directly (no server /api/auth/* lookup)
  useEffect(() => {
    if (isAuthVerified) return;
    setExecutivesStatus([]);
  }, [isAuthVerified]);

  // Hydrate server-isolated Employees & Orders once authenticated
  const refreshServerHabeData = useCallback(async () => {
    if (!isAuthVerified) {
      setAllEmployees([]);
      setOrdersHistory([]);
      return;
    }
    try {
      const [empRes, ordRes] = await Promise.all([
        fetch('/api/habe/employees', { credentials: 'include' }),
        fetch('/api/habe/orders', { credentials: 'include' }),
      ]);
      if (empRes.ok) {
        const empJson = (await empRes.json()) as {
          ok?: boolean;
          employees?: Array<{ id: string; name: string; code: string; department: string; phone?: string; email?: string }>;
        };
        if (empJson.ok && Array.isArray(empJson.employees)) {
          const mapped: HabeEmployeeRecord[] = empJson.employees.map((se) => {
            const localMeta = HABE_EGYPT_EMPLOYEES.find(
              (m) => m.code.toUpperCase() === se.code.toUpperCase()
            );
            return {
              id: se.id,
              code: se.code,
              username: localMeta?.username || `@${se.code.toLowerCase()}`,
              nameAr: localMeta?.nameAr || se.name,
              nameEn: localMeta?.nameEn || se.name,
              department: localMeta?.department || se.department,
              departmentAr: localMeta?.departmentAr || se.department,
              jobTitle: localMeta?.jobTitle || 'موظف / إداري Ha-Be',
              compNumber: se.phone || localMeta?.compNumber || '—',
              sourceGroup: localMeta?.sourceGroup || 'corporate_sheet',
            };
          });
          setAllEmployees(mapped);

          // Lock regular staff strictly to their own server record
          if (!canApproveHabePurchases) {
            const selfRec = mapped[0];
            if (selfRec) {
              setEmployeeCode(selfRec.code);
              setEmployeeName(selfRec.nameAr || selfRec.nameEn);
              setEmployeeUsername(currentUsername || selfRec.username);
              setDepartmentName(selfRec.departmentAr || selfRec.department);
              setEmployeePhone(selfRec.compNumber);
            } else {
              setEmployeeCode(currentEmployeeCode || 'SELF');
              setEmployeeName(currentUsername ? `@${currentUsername}` : currentAuthUserEmail || 'حسابي');
              setEmployeeUsername(currentUsername ? `@${currentUsername}` : currentAuthUserEmail);
              setDepartmentName('حساب موظف / عميل موثق');
            }
            setAnonymousVoucherMode(false);
          }
        }
      }
      if (ordRes.ok) {
        const ordJson = (await ordRes.json()) as { ok?: boolean; orders?: ServerHabeOrderRecord[] };
        if (ordJson.ok && Array.isArray(ordJson.orders)) {
          setOrdersHistory(ordJson.orders.map(mapServerOrderToUi));
        }
      }
    } catch {
      // keep existing UI state on transient error
    }
  }, [isAuthVerified, canApproveHabePurchases, currentEmployeeCode, currentUsername, currentAuthUserEmail]);

  useEffect(() => {
    void refreshServerHabeData();
  }, [refreshServerHabeData]);

  // Enforce strict role boundaries on activeTab and ?emp=
  useEffect(() => {
    if (!canApproveHabePurchases && (activeTab === 'employees' || activeTab === 'admin_payroll')) {
      setActiveTab('home');
    }
  }, [canApproveHabePurchases, activeTab]);

  // Auto-select employee from ?emp= ONLY if signed in as Approver (Disabled for normal staff to prevent cross-account snooping)
  useEffect(() => {
    if (!isAuthVerified || !canApproveHabePurchases) return;
    try {
      const empParam = new URLSearchParams(window.location.search).get('emp');
      if (empParam && allEmployees.length > 0) {
        const match = allEmployees.find(
          (e) => e.code.toLowerCase() === empParam.toLowerCase()
        );
        if (match) {
          setEmployeeCode(match.code);
          setEmployeeName(match.nameAr || match.nameEn);
          setEmployeeUsername(match.username);
          setDepartmentName(match.department);
          setEmployeePhone(match.compNumber);
          setAnonymousVoucherMode(false);
        }
      }
    } catch {
      // ignore
    }
  }, [isAuthVerified, canApproveHabePurchases, allEmployees]);

  const dir = uiLang === 'ar' ? 'rtl' : 'ltr';
  const BackArrow = uiLang === 'ar' ? ArrowRight : ArrowLeft;
  const isSaturdayToday = new Date().getDay() === 6;

  const txt = useMemo(() => {
    const d: Record<
      HabeLang,
      {
        backToBasit: string;
        welcome: string;
        heroSub: string;
        heroLead: string;
        partnerTop: string;
        partnerSub: string;
        empNode: string;
        empNodeEn: string;
        nlNode: string;
        nlNodeEn: string;
        tileMeals: string;
        tileMarket: string;
        tileOrders: string;
        tileOffers: string;
        tileAccount: string;
        sloganAr: string;
        sloganEn: string;
        bNavHome: string;
        bNavAlerts: string;
        bNavScan: string;
        bNavSettings: string;
        widePdfBtn: string;
      }
    > = {
      ar: {
        backToBasit: 'باسط',
        welcome: 'مرحباً بك',
        heroSub: 'Welcome',
        heroLead: 'خدماتك الغذائية والشرائية في مكان واحد',
        partnerTop: 'بالتعاون مع',
        partnerSub: 'Powered & Managed by National Logistics | Catering Egypt',
        empNode: 'موظفو المصنع',
        empNodeEn: 'Factory Employees',
        nlNode: 'الوطنية اللوجستية',
        nlNodeEn: 'National Logistics Catering Egypt',
        tileMeals: 'الوجبات',
        tileMarket: 'الماركت',
        tileOrders: 'طلباتي',
        tileOffers: 'العروض',
        tileAccount: 'حسابي',
        sloganAr: 'معاً .. لبيئة عمل أفضل',
        sloganEn: 'Together for a Better Work Environment',
        bNavHome: 'الرئيسية',
        bNavAlerts: 'الإشعارات',
        bNavScan: 'المسح',
        bNavSettings: 'الإعدادات',
        widePdfBtn: 'منيو Ba_He العريض (PDF)',
      },
      en: {
        backToBasit: 'BASIT',
        welcome: 'Welcome',
        heroSub: 'Ha-Be Point',
        heroLead: 'Your daily meals, market & direct pay in one place',
        partnerTop: 'In Cooperation With',
        partnerSub: 'Powered & Managed by National Logistics | Catering Egypt',
        empNode: 'Factory Employees',
        empNodeEn: 'Ha-Be Egypt Staff',
        nlNode: 'National Logistics',
        nlNodeEn: 'Catering Egypt',
        tileMeals: 'Meals',
        tileMarket: 'Market',
        tileOrders: 'My Orders',
        tileOffers: 'Offers',
        tileAccount: 'My Account',
        sloganAr: 'Together for a Better Work Environment',
        sloganEn: 'معاً .. لبيئة عمل أفضل',
        bNavHome: 'Home',
        bNavAlerts: 'Alerts',
        bNavScan: 'QR Scan',
        bNavSettings: 'Settings',
        widePdfBtn: 'Wide Menu PDF',
      },
      de: {
        backToBasit: 'BASIT',
        welcome: 'Willkommen',
        heroSub: 'Ha-Be Verpflegungspunkt',
        heroLead: 'Mahlzeiten, Markt & Direktzahlung an einem Ort',
        partnerTop: 'In Zusammenarbeit mit',
        partnerSub: 'Powered & Managed by National Logistics | Catering Egypt',
        empNode: 'Werksmitarbeiter',
        empNodeEn: 'Ha-Be Team Ägypten',
        nlNode: 'National Logistics',
        nlNodeEn: 'Catering Egypt',
        tileMeals: 'Mahlzeiten',
        tileMarket: 'Markt',
        tileOrders: 'Bestellungen',
        tileOffers: 'Angebote',
        tileAccount: 'Mein Konto',
        sloganAr: 'Gemeinsam für ein besseres Arbeitsumfeld',
        sloganEn: 'Together for a Better Work Environment',
        bNavHome: 'Start',
        bNavAlerts: 'Meldungen',
        bNavScan: 'QR-Scan',
        bNavSettings: 'Einstellungen',
        widePdfBtn: 'Menü PDF (Quer)',
      },
    };
    return d[uiLang];
  }, [uiLang]);

  const itemName = (item: HabeMenuItem) =>
    uiLang === 'ar' ? item.nameAr : uiLang === 'de' ? item.nameDe : item.nameEn;

  const itemDesc = (item: HabeMenuItem) =>
    uiLang === 'ar' ? item.descAr : uiLang === 'de' ? item.descDe : item.descEn;

  const mealMenuItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HABE_FULL_MENU.filter((m) => {
      if (m.category === 'drinks_snacks') return false;
      const catOk = activeMealCategory === 'all_meals' || m.category === activeMealCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        m.nameAr.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.nameDe.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.descAr.toLowerCase().includes(q)
      );
    });
  }, [activeMealCategory, searchQuery]);

  const marketItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HABE_FULL_MENU.filter((m) => {
      if (m.category !== 'drinks_snacks') return false;
      const subOk = activeMarketSubGroup === 'all' || m.subGroup === activeMarketSubGroup;
      if (!subOk) return false;
      if (!q) return true;
      return (
        m.nameAr.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.nameDe.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        (m.shortBrandTag || '').toLowerCase().includes(q)
      );
    });
  }, [activeMarketSubGroup, searchQuery]);

  const filteredEmployees = useMemo(() => {
    const q = empSearch.trim().toLowerCase();
    return allEmployees.filter((emp) => {
      if (empFilterGroup !== 'all' && emp.sourceGroup !== empFilterGroup) return false;
      if (!q) return true;
      return (
        emp.nameAr.toLowerCase().includes(q) ||
        emp.nameEn.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.departmentAr.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.compNumber.includes(q) ||
        emp.username.toLowerCase().includes(q)
      );
    });
  }, [allEmployees, empFilterGroup, empSearch]);

  const cartCount = cart.reduce((acc, l) => acc + l.qty, 0);
  const cartTotalEGP = cart.reduce((acc, l) => acc + l.item.priceEGP * l.qty, 0);

  const pendingAdminOrders = useMemo(
    () => ordersHistory.filter((o) => o.approvalStatus === 'pending_admin'),
    [ordersHistory]
  );

  const approvedPayrollOrders = useMemo(
    () => ordersHistory.filter((o) => o.paymentMethod === 'payroll_deduction' && o.approvalStatus === 'approved'),
    [ordersHistory]
  );

  // Aggregated End-of-Month Consolidated Report per Employee ("خد إيه" & "عليه إيه")
  const consolidatedMonthlyRows = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        employeeCode: string;
        employeeName: string;
        username: string;
        department: string;
        compNumber: string;
        orderCount: number;
        totalEGP: number;
        itemMap: Map<string, { nameAr: string; qty: number; lineTotalEGP: number }>;
        dates: Set<string>;
      }
    >();

    for (const ord of approvedPayrollOrders) {
      const key = ord.anonymousVoucherMode
        ? `VOUCHER:${ord.voucherCode || ord.id}`
        : `${ord.employeeCode}:${ord.employeeName}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          employeeCode: ord.employeeCode || 'HB',
          employeeName: ord.employeeName,
          username: ord.username,
          department: ord.department,
          compNumber: ord.compNumber,
          orderCount: 0,
          totalEGP: 0,
          itemMap: new Map(),
          dates: new Set(),
        });
      }
      const bucket = map.get(key)!;
      bucket.orderCount += 1;
      bucket.totalEGP += ord.totalEGP;
      bucket.dates.add(ord.isoDate || ord.createdAt);

      for (const it of ord.items) {
        const existing = bucket.itemMap.get(it.code);
        if (existing) {
          existing.qty += it.qty;
          existing.lineTotalEGP += it.qty * it.priceEGP;
        } else {
          bucket.itemMap.set(it.code, {
            nameAr: it.nameAr,
            qty: it.qty,
            lineTotalEGP: it.qty * it.priceEGP,
          });
        }
      }
    }

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        itemsList: Array.from(row.itemMap.values()),
        datesList: Array.from(row.dates),
      }))
      .sort((a, b) => b.totalEGP - a.totalEGP);
  }, [approvedPayrollOrders]);

  const totalApprovedPayrollEGP = consolidatedMonthlyRows.reduce((s, r) => s + r.totalEGP, 0);

  // Payment & Install QR Payloads (Strictly pointing to isolated /habe standalone app)
  const originUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://basit-catering.app';
  const installAppUrl = `${originUrl}/habe?install=1`;
  const vodafoneUssdCode = `*9*7*${HABE_CONTACTS.vodafoneCash}${cartTotalEGP > 0 ? `*${cartTotalEGP}` : ''}#`;
  const vodafoneDialHref = `tel:*9*7*${HABE_CONTACTS.vodafoneCash}${cartTotalEGP > 0 ? `*${cartTotalEGP}` : ''}%23`;
  const instapayQrPayload = `https://ipn.eg/S/${HABE_CONTACTS.instapay}/instapay${cartTotalEGP > 0 ? `/${cartTotalEGP}` : ''}`;

  const addToCart = (item: HabeMenuItem, goToOrders = false) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { item, qty: 1 }];
    });
    if (goToOrders) {
      setCheckoutStep('payment_gateway');
      setActiveTab('orders');
    } else {
      onShowToast(
        uiLang === 'ar'
          ? `تمت إضافة "${item.nameAr}" (${item.priceEGP} ج.م)`
          : `Added "${itemName(item)}" (${item.priceEGP} EGP)`
      );
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.item.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const selectEmployee = (emp: HabeEmployeeRecord) => {
    if (!canApproveHabePurchases) {
      onShowToast('لا يمكنك التبديل لحساب موظف آخر لحماية الخصوصية المالية.');
      return;
    }
    const resolvedName = emp.nameAr ? `${emp.nameAr} — ${emp.nameEn}` : emp.nameEn;
    setEmployeeCode(emp.code);
    setEmployeeName(resolvedName);
    setEmployeeUsername(emp.username);
    setDepartmentName(emp.departmentAr || emp.department);
    setEmployeePhone(emp.compNumber);
    setAnonymousVoucherMode(false);
    onShowToast(
      uiLang === 'ar'
        ? `تم تحديد الموظف: ${emp.nameEn} (${emp.code})`
        : `Selected employee: ${emp.nameEn} (${emp.code})`
    );
  };

  const copyText = (val: string, labelAr: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(val);
    }
    onShowToast(uiLang === 'ar' ? `تم نسخ ${labelAr}: ${val}` : `Copied: ${val}`);
  };

  const toggleAnonVoucher = (nextVal: boolean) => {
    if (!canApproveHabePurchases) {
      setAnonymousVoucherMode(false);
      return;
    }
    setAnonymousVoucherMode(nextVal);
  };

  const handleConfirmOrderAndPay = async () => {
    if (cart.length === 0) {
      onShowToast(uiLang === 'ar' ? 'السلة فارغة، أضف أصنافاً أولاً.' : 'Cart is empty.');
      return;
    }

    if (canApproveHabePurchases && paymentMethod === 'payroll_deduction' && !anonymousVoucherMode && !employeeName.trim()) {
      onShowToast(
        uiLang === 'ar'
          ? 'يرجى اختيار الموظف من دليل الموظفين أو كتابة الاسم لإرسال طلب الخصم للإدارة.'
          : 'Please select an employee or enter a name for payroll approval.'
      );
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/habe/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: canApproveHabePurchases && !anonymousVoucherMode ? employeeCode || undefined : undefined,
          paymentMethod,
          paymentAccountOrNote: trxRefInput.trim() || (anonymousVoucherMode ? 'COMPANY-VOUCHER' : ''),
          items: cart.map((l) => ({
            id: l.item.id,
            code: l.item.code,
            qty: l.qty,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        order?: ServerHabeOrderRecord;
        messageAr?: string;
        messageEn?: string;
      };

      if (!res.ok || !data.ok || !data.order) {
        onShowToast(data.messageAr || data.messageEn || 'تعذر تسجيل الطلب على الخادم.');
        return;
      }

      const record = mapServerOrderToUi(data.order);
      setOrdersHistory((prev) => [record, ...prev]);
      setLastReceipt(record);
      setCart([]);
      setTrxRefInput('');
      setCheckoutStep('receipt');

      onAddAuditLog(
        paymentMethod === 'payroll_deduction'
          ? `طلب على الراتب [${record.id}] بانتظار تأكيد الإدارة — ${record.employeeName}`
          : `طلب Ha-Be [${record.id}] — ${record.employeeName}`,
        `Ha-Be Order [${record.id}]`,
        `${record.items.length} أصناف · ${record.totalEGP} ج.م · ${paymentMethod} · ${record.trxRef}`
      );

      if (paymentMethod !== 'payroll_deduction' && onRecordFinancialTransaction) {
        onRecordFinancialTransaction({
          id: `TX-${record.id}`,
          description: `نقطة بيع Ha-Be (${record.id}) — ${record.employeeName}`,
          amount: record.totalEGP,
          type: 'income',
          category: 'canteen_sales',
          paymentMethod: 'vodafone_cash',
          referenceNumber: record.trxRef,
          siteId: 'site_habe_egypt',
          siteName: 'نقطة Ha-Be — الشركة الوطنية اللوجستية',
        });
      }

      onShowToast(
        data.messageAr ||
          (paymentMethod === 'payroll_deduction'
            ? `تم إرسال طلب [${record.id}] للاعتماد بمبلغ ${record.totalEGP} ج.م.`
            : `تم تأكيد الطلب [${record.id}] وإصدار الإيصال الرسمي (${record.totalEGP} ج.م).`)
      );

      if (paymentMethod === 'vodafone_cash') {
        const a = document.createElement('a');
        a.href = `tel:*9*7*${HABE_CONTACTS.vodafoneCash}*${record.totalEGP}%23`;
        a.click();
      }
    } catch {
      onShowToast('تعذر الاتصال بخادم الطلبات.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleAdminApproveOrder = async (orderId: string, decision: 'approved' | 'rejected') => {
    if (!canApproveHabePurchases) {
      onShowToast(
        uiLang === 'ar'
          ? 'اعتماد أو رفض مشتريات Ha-Be مقصور على حمزة أو أحمد عدلي أو أحمد وحيد فقط.'
          : 'Ha-Be purchase approvals are restricted to designated governance executives.'
      );
      return;
    }

    try {
      const res = await fetch(`/api/habe/orders/${encodeURIComponent(orderId)}/decide`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        order?: ServerHabeOrderRecord;
        messageAr?: string;
        messageEn?: string;
      };
      if (!res.ok || !data.ok || !data.order) {
        onShowToast(data.messageAr || data.messageEn || 'تعذر تنفيذ القرار على الخادم.');
        return;
      }

      const mapped = mapServerOrderToUi(data.order);
      setOrdersHistory((prev) => prev.map((o) => (o.id === orderId ? mapped : o)));
      if (lastReceipt?.id === orderId) {
        setLastReceipt(mapped);
      }

      if (decision === 'approved' && onRecordFinancialTransaction) {
        onRecordFinancialTransaction({
          id: `TX-PAY-${mapped.id}`,
          description: `اعتماد خصم راتب Ha-Be (${mapped.id}) — ${mapped.employeeName}`,
          amount: mapped.totalEGP,
          type: 'income',
          category: 'canteen_sales',
          paymentMethod: 'vodafone_cash',
          referenceNumber: mapped.trxRef,
          siteId: 'site_habe_egypt',
          siteName: 'نقطة Ha-Be — الشركة الوطنية اللوجستية',
        });
      }

      onAddAuditLog(
        decision === 'approved'
          ? `تأكيد الإدارة لطلب الراتب [${mapped.id}] — ${mapped.employeeName}`
          : `رفض الإدارة لطلب الراتب [${mapped.id}]`,
        `Admin ${decision} [${mapped.id}]`,
        `${mapped.totalEGP} ج.م`
      );

      onShowToast(
        data.messageAr ||
          (decision === 'approved'
            ? `تم تأكيد طلب [${mapped.id}] وإضافته لتقرير آخر الشهر المجمع.`
            : `تم رفض الطلب [${mapped.id}].`)
      );
    } catch {
      onShowToast('تعذر الاتصال بخادم الاعتمادات.');
    }
  };

  const handleDownloadMonthlyPdf = async () => {
    if (!monthlyReportPrintRef.current) return;
    setIsExportingMonthlyPdf(true);
    const res = await exportElementsToA4Pdf({
      pageElements: [monthlyReportPrintRef.current],
      filename: `HaBe_Monthly_Payroll_Consolidated_${new Date().toISOString().slice(0, 10)}.pdf`,
      orientation: 'portrait',
    });
    setIsExportingMonthlyPdf(false);
    if (res.success) {
      onShowToast(
        uiLang === 'ar'
          ? `تم تحميل التقرير المجمع الشهري PDF (${res.filename}) بنجاح.`
          : `Downloaded ${res.filename}`
      );
    } else {
      onShowToast(res.errorMessage || 'تعذر إنشاء ملف PDF');
    }
  };

  const handlePrintMonthlyReport = () => {
    if (!monthlyReportPrintRef.current) return;
    triggerCleanA4Print([monthlyReportPrintRef.current]);
  };

  const handleExportPayrollCsv = () => {
    if (consolidatedMonthlyRows.length === 0) {
      onShowToast(
        uiLang === 'ar'
          ? 'لا توجد طلبات راتب مؤكدة من الإدارة بعد.'
          : 'No approved payroll orders to export yet.'
      );
      return;
    }
    const headers = [
      'كود الموظف',
      'اسم الموظف / الفوتشر',
      'اليوزرنيم',
      'القسم',
      'رقم الشركة',
      'عدد الطلبات المعتمدة',
      'خد إيه (تفصيل الأصناف)',
      'عليه إيه (الإجمالي ج.م)',
    ];
    const lines = consolidatedMonthlyRows.map((row) => [
      row.employeeCode,
      row.employeeName,
      row.username,
      row.department,
      row.compNumber || '-',
      String(row.orderCount),
      row.itemsList.map((i) => `${i.nameAr} ×${i.qty} (${i.lineTotalEGP}ج)`).join(' | '),
      String(row.totalEGP),
    ]);
    const csvContent =
      '\uFEFF' +
      [headers, ...lines]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HaBe_Monthly_Consolidated_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(uiLang === 'ar' ? 'تم تصدير الكشف المجمع Excel / CSV.' : 'Exported Monthly CSV.');
  };

  const handleAddCustomEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canApproveHabePurchases) {
      onShowToast('إضافة موظفين جدد مقصورة على الإدارة المعتمدة فقط.');
      return;
    }
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const nAr = String(fd.get('newNameAr') || '').trim();
    const nEn = String(fd.get('newNameEn') || '').trim();
    const dept = String(fd.get('newDept') || '').trim() || 'Operations';
    const job = String(fd.get('newJob') || '').trim() || 'Staff';
    const phone = String(fd.get('newPhone') || '').trim();
    if (!nAr && !nEn) return;
    const nextIdx = allEmployees.length + 1;
    const code = `HB-${String(nextIdx).padStart(3, '0')}`;

    try {
      const res = await fetch('/api/habe/employees', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nAr || nEn,
          code,
          department: dept,
          phone,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        employee?: { id: string; name: string; code: string; department: string; phone?: string };
        messageAr?: string;
      };
      if (!res.ok || !data.ok || !data.employee) {
        onShowToast(data.messageAr || 'تعذر إضافة الموظف على الخادم.');
        return;
      }

      const rec: HabeEmployeeRecord = {
        id: data.employee.id,
        code: data.employee.code,
        username: `@staff.${nextIdx}`,
        nameAr: nAr || data.employee.name,
        nameEn: nEn || data.employee.name,
        department: data.employee.department,
        departmentAr: data.employee.department,
        jobTitle: job,
        compNumber: data.employee.phone || '—',
        sourceGroup: 'corporate_sheet',
      };
      setAllEmployees((prev) => [rec, ...prev]);
      formEl.reset();
      onShowToast(data.messageAr || `تمت إضافة الموظف (${rec.nameAr}) بكود ${rec.code}`);
    } catch {
      onShowToast('تعذر الاتصال بالخادم.');
    }
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMsg.trim()) return;
    const entry: ComplaintEntry = {
      id: `CMP-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toLocaleString('ar-EG'),
      sender: anonymousVoucherMode
        ? 'موظف (فوتشر سري)'
        : complaintSender.trim() || employeeName.trim() || 'موظف Ha-Be',
      phone: complaintPhone.trim() || employeePhone || 'غير مسجل',
      message: complaintMsg.trim(),
    };
    const next = [entry, ...complaintsList];
    setComplaintsList(next);
    writeStored('habe_complaints_list', next);
    setComplaintMsg('');
    onAddAuditLog(
      `مقترح/شكوى Ha-Be [${entry.id}]`,
      `Ha-Be Feedback [${entry.id}]`,
      `${entry.sender} (${entry.phone}): ${entry.message}`
    );
    onShowToast(
      uiLang === 'ar'
        ? `تم تسجيل رسالتك [${entry.id}] وإرسالها لرقم المتابعة ${HABE_CONTACTS.complaints}`
        : `Feedback [${entry.id}] submitted.`
    );
  };

  const handleAuthGatePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setAuthError('يرجى إدخال اسم المستخدم أو البريد أو الهاتف وكلمة المرور.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const raw = loginIdentifier.trim().toLowerCase();
      const email = raw.includes('@') ? raw : `${raw}@basit.eg`;
      const cred = await signInWithEmailAndPassword(auth, email, loginPassword);
      const userObj = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        fullName: cred.user.displayName || email,
        role: (cred.user.email || email).toLowerCase() === 'hamzaelhelaly08@gmail.com' ? 'owner' : 'customer',
        canonicalRole: (cred.user.email || email).toLowerCase() === 'hamzaelhelaly08@gmail.com' ? 'super_admin' : 'customer',
        approvalStatus: 'approved',
      };
      setLoginPassword('');
      onSessionAuthenticated?.(userObj);
      window.dispatchEvent(new CustomEvent('basit:session-updated'));
      onShowToast('تم تسجيل الدخول إلى نظام H-A-B-E بنجاح.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'بيانات الدخول غير صحيحة.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleClaimExecutivePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimIdentifier.trim() || claimNewPassword.length < 8) {
      setAuthError('كلمة المرور يجب ألا تقل عن 8 أحرف أو أرقام.');
      return;
    }
    if (claimNewPassword !== claimConfirmPassword) {
      setAuthError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const raw = claimIdentifier.trim().toLowerCase();
      const email = raw.includes('@') ? raw : `${raw}@basit.eg`;
      let user = auth.currentUser;
      if (!user) {
        const cred = await createUserWithEmailAndPassword(auth, email, claimNewPassword);
        user = cred.user;
        await updateProfile(user, { displayName: claimFullName || raw });
      } else {
        await updatePassword(user, claimNewPassword);
      }
      const userObj = {
        uid: user.uid,
        email: user.email || email,
        fullName: user.displayName || email,
        role: (user.email || email).toLowerCase() === 'hamzaelhelaly08@gmail.com' ? 'owner' : 'customer',
        canonicalRole: (user.email || email).toLowerCase() === 'hamzaelhelaly08@gmail.com' ? 'super_admin' : 'customer',
        approvalStatus: 'approved',
      };
      setClaimMode(false);
      setClaimNewPassword('');
      setClaimConfirmPassword('');
      onSessionAuthenticated?.(userObj);
      window.dispatchEvent(new CustomEvent('basit:session-updated'));
      onShowToast('تم تفعيل حسابك ودخولك بنجاح عبر Firebase Authentication.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'تعذر تفعيل كلمة المرور.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpNext.length < 8) {
      setCpFeedback({ ok: false, msg: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف/أرقام على الأقل.' });
      return;
    }
    if (!auth.currentUser) {
      setCpFeedback({ ok: false, msg: 'يرجى تسجيل الدخول عبر Firebase Auth أولاً.' });
      return;
    }
    setCpLoading(true);
    setCpFeedback(null);
    try {
      await updatePassword(auth.currentUser, cpNext);
      setCpCurrent('');
      setCpNext('');
      setCpFeedback({ ok: true, msg: 'تم تحديث كلمة المرور بنجاح عبر Firebase Auth.' });
      onShowToast('تم تحديث كلمة المرور.');
    } catch (err) {
      setCpFeedback({ ok: false, msg: err instanceof Error ? err.message : 'تعذر تغيير كلمة المرور.' });
    } finally {
      setCpLoading(false);
    }
  };

  // HARD PRE-LOGIN AUTH GATE: Never mount internal tabs, employees, orders, or payroll data before authentication
  if (!isAuthVerified) {
    const unclaimedExecs = executivesStatus.filter((ex) => !ex.hasPassword);
    return (
      <div dir={dir} className="w-full max-w-xl mx-auto px-2 py-4 sm:py-8 font-sans">
        <div className="rounded-[28px] overflow-hidden border-2 border-[#0f172a] shadow-2xl bg-gradient-to-br from-[#F6D95B] via-[#FFC928] to-[#F59E0B] text-slate-950">
          {/* Top Golden Header Bar */}
          <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-b border-amber-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <BackArrow className="w-4 h-4" />
                  <span>{txt.backToBasit}</span>
                </button>
              ) : (
                <a
                  href="/"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1.5"
                >
                  <BackArrow className="w-4 h-4" />
                  <span>{txt.backToBasit}</span>
                </a>
              )}
              <HabeAwningLogo size="sm" showDots={false} />
            </div>

            <div className="inline-flex items-center rounded-full bg-slate-100 p-1 border border-slate-200 text-[11px] font-black">
              {(['ar', 'en', 'de'] as HabeLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setUiLang(l)}
                  className={`min-h-[36px] px-2.5 rounded-full uppercase cursor-pointer transition-all ${
                    uiLang === l ? 'bg-red-600 text-white shadow-xs' : 'text-slate-700 hover:text-red-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-[#FFC928] text-[11px] font-black">
                <Lock className="w-3.5 h-3.5" />
                <span>H-A-B-E Portal · بوابة موظفي وإدارة ها-بي</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
                {claimMode ? 'تفعيل كلمة مرور الإدارة المستقلة' : 'تسجيل الدخول قبل الدخول للنظام'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-900/85">
                {claimMode
                  ? `تعيين كلمة مرور خاصة للحساب التنفيذي (${claimFullName || claimIdentifier})`
                  : 'جميع القوائم والطلبات وكشوف الموظفين محمية بالكامل وتتطلب تسجيل الدخول الفعلي أولاً.'}
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-950 text-rose-100 text-xs font-bold border border-rose-500">
                {authError}
              </div>
            )}

            {!claimMode ? (
              <form onSubmit={(e) => void handleAuthGatePasswordLogin(e)} className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-amber-200 shadow-lg space-y-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    اسم المستخدم أو البريد أو رقم الموبايل
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="hamza / ahmed.adly / ahmed.wahid / @hb.xxx"
                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-950 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-[46px] ps-3.5 pe-11 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-950 focus:border-red-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((p) => !p)}
                      className="min-w-[44px] min-h-[44px] absolute end-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-600 cursor-pointer"
                      aria-label="Toggle password"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[48px] py-3 rounded-2xl bg-slate-950 hover:bg-red-600 text-white text-sm font-black cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{authLoading ? 'جاري التحقق...' : 'دخول إلى H-A-B-E'}</span>
                </button>

                {onGoogleSignIn && (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="w-full min-h-[46px] py-2.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-950 text-slate-950 text-xs font-black cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>دخول المعتمدين عبر Google</span>
                  </button>
                )}

                {unclaimedExecs.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>تفعيل أول دخول للإدارة (بدون كلمة مرور افتراضية):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {unclaimedExecs.map((ex) => (
                        <button
                          key={ex.username}
                          type="button"
                          onClick={() => {
                            setClaimIdentifier(ex.username);
                            setClaimFullName(ex.fullNameAr);
                            setClaimMode(true);
                            setAuthError(null);
                          }}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-400 text-[11px] font-black text-slate-950 cursor-pointer"
                        >
                          {ex.fullNameAr} ({ex.username})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            ) : (
              <form onSubmit={(e) => void handleClaimExecutivePassword(e)} className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-amber-200 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-600">تعيين كلمة المرور لأول مرة</span>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimMode(false);
                      setAuthError(null);
                    }}
                    className="min-h-[36px] px-2.5 text-xs font-black text-slate-700 hover:text-red-600 cursor-pointer"
                  >
                    العودة للدخول
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">الحساب التنفيذي</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={claimIdentifier}
                    onChange={(e) => setClaimIdentifier(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور الجديدة (8 أحرف فأكثر)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    dir="ltr"
                    value={claimNewPassword}
                    onChange={(e) => setClaimNewPassword(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    dir="ltr"
                    value={claimConfirmPassword}
                    onChange={(e) => setClaimConfirmPassword(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-950"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[48px] py-3 rounded-2xl bg-red-600 hover:bg-slate-950 text-white text-sm font-black cursor-pointer"
                >
                  {authLoading ? 'جاري التفعيل...' : 'حفظ كلمة المرور والدخول'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="w-full max-w-6xl mx-auto pb-8 font-sans">
      <div className="rounded-3xl bg-white text-slate-950 border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[820px]">
        {/* TOP HEADER (Mobile-first >= 44px touch targets) */}
        <header className="px-3 sm:px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black transition-colors cursor-pointer shrink-0"
              >
                <BackArrow className="w-4 h-4" />
                <span>{txt.backToBasit}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="min-h-[44px] text-start cursor-pointer flex items-center"
            >
              <HabeAwningLogo size="sm" showDots />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Compact AR | EN | DE Switcher */}
            <div className="inline-flex items-center rounded-full bg-slate-50 p-1 border border-slate-200 text-[11px] font-black">
              {(['ar', 'en', 'de'] as HabeLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setUiLang(l)}
                  className={`min-h-[36px] px-2.5 rounded-full uppercase cursor-pointer transition-all ${
                    uiLang === l ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-red-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {!isStandaloneApp && (
              <a
                href="/habe"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {uiLang === 'ar' ? 'تطبيق Ha-Be مستقل' : 'Standalone /habe'}
                </span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('install')}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">
                {uiLang === 'ar' ? 'تثبيت' : 'Install'}
              </span>
            </button>

            {onOpenWideMenuPdf && (
              <button
                type="button"
                onClick={onOpenWideMenuPdf}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-red-600 text-slate-900 hover:text-red-600 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileDown className="w-4 h-4 text-red-600" />
                <span className="hidden md:inline">{txt.widePdfBtn}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 ps-2.5 pe-1 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-black text-slate-900 min-h-[44px]">
              {canApproveHabePurchases ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <User className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="hidden sm:inline max-w-[130px] truncate" dir="ltr">
                {currentUsername ? `@${currentUsername}` : currentAuthUserEmail || (isOwnerAdmin ? 'Owner' : 'Verified')}
              </span>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                  title={uiLang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* SUB-HEADER BAR */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950 text-white text-[11px] font-bold flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>
              {anonymousVoucherMode && canApproveHabePurchases
                ? 'وضع فوتشر دعم الشركة (بدون أسماء)'
                : employeeName.trim()
                ? `${employeeName} (${employeeCode})`
                : currentUsername
                ? `@${currentUsername} (${currentEmployeeCode || 'SELF'})`
                : 'حساب موثق — H-A-B-E'}
            </span>
            {canApproveHabePurchases && pendingAdminOrders.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('admin_payroll')}
                className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black cursor-pointer animate-pulse"
              >
                {pendingAdminOrders.length} بانتظار الاعتماد
              </button>
            )}
          </div>

          <a
            href={`tel:${HABE_CONTACTS.complaints}`}
            dir="ltr"
            className="inline-flex items-center gap-1.5 text-white hover:text-red-400 transition-colors"
          >
            <Phone className="w-3 h-3 text-red-500" />
            <span>{HABE_CONTACTS.complaints}</span>
          </a>
        </div>

        {/* DESKTOP / QUICK TAB NAVIGATION STRIP (Role-Gated) */}
        <nav className="px-3 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: 'home', label: txt.bNavHome, icon: Home, show: true },
              { id: 'meals', label: txt.tileMeals, icon: UtensilsCrossed, show: true },
              { id: 'market', label: `${txt.tileMarket} (34)`, icon: ShoppingCart, show: true },
              { id: 'orders', label: `${txt.tileOrders}${cartCount > 0 ? ` (${cartCount})` : ''}`, icon: ShoppingBag, show: true },
              { id: 'offers', label: txt.tileOffers, icon: Tag, show: true },
              { id: 'employees', label: uiLang === 'ar' ? `الموظفين (${allEmployees.length})` : `Staff (${allEmployees.length})`, icon: Users, show: canApproveHabePurchases },
              {
                id: 'admin_payroll',
                label:
                  uiLang === 'ar'
                    ? `تأكيد الإدارة والشهري${pendingAdminOrders.length > 0 ? ` (${pendingAdminOrders.length})` : ''}`
                    : `Admin & Monthly${pendingAdminOrders.length > 0 ? ` (${pendingAdminOrders.length})` : ''}`,
                icon: FileSpreadsheet,
                show: canApproveHabePurchases,
              },
              { id: 'poster', label: uiLang === 'ar' ? 'بوستر QR' : 'QR Poster', icon: QrCode, show: true },
              { id: 'install', label: uiLang === 'ar' ? 'تثبيت الهاتف' : 'Install App', icon: Smartphone, show: true },
              { id: 'account', label: txt.tileAccount, icon: User, show: true },
            ] as const
          )
            .filter((t) => t.show)
            .map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 hover:border-red-600 hover:text-red-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
        </nav>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 bg-white space-y-6">
          {/* ==================== 1. HOME (MATCHES MOCKUP EXACTLY) ==================== */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* HERO SECTION (Greeting + Meal Bento & Awning Cup) */}
              <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center gap-3">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
                      {txt.welcome}
                    </h1>
                    <div className="text-xl sm:text-2xl font-bold text-slate-800">{txt.heroSub}</div>
                    <p className="text-sm font-bold text-slate-600 mt-1.5">{txt.heroLead}</p>
                    <div className="w-20 h-1 rounded-full bg-red-600 mt-3" />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('meals')}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>{uiLang === 'ar' ? 'اطلب وجبتك' : 'Order Meals'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('market')}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{uiLang === 'ar' ? 'الماركت (34 صنف)' : 'Open Market'}</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-6 relative min-h-[210px] sm:min-h-[240px] bg-white">
                  <img
                    src={habeHeroMealCupImg}
                    alt="Ha-Be Bento Meal & Takeaway Beverage Point"
                    className="w-full h-full object-cover"
                  />
                  {/* Diagonal Red Curve Accent matching mockup */}
                  <div
                    className="hidden md:block absolute top-0 bottom-0 start-0 w-10 bg-gradient-to-e from-white via-white/75 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* PARTNERSHIP FLOW DIAGRAM CARD ("بالتعاون مع / Powered & Managed by...") */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-900">{txt.partnerTop}</div>
                  <div className="text-xs font-bold text-slate-600">Powered &amp; Managed by</div>
                  <div className="text-sm sm:text-base font-black text-slate-950">
                    National Logistics &nbsp;|&nbsp; Catering Egypt
                  </div>
                  <div className="w-36 h-0.5 bg-red-600 mx-auto mt-2 rounded-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 pt-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="text-xs font-black text-slate-950">{txt.empNode}</div>
                    <div className="text-[11px] font-medium text-slate-500">{txt.empNodeEn}</div>
                  </div>

                  <div className="hidden sm:flex items-center justify-center">
                    <div className="w-full border-t-2 border-dashed border-red-500 relative">
                      <span className="w-2 h-2 rounded-full bg-red-600 absolute -top-1 start-0" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-1">
                    <HabeAwningLogo size="sm" showDots={false} />
                  </div>

                  <div className="hidden sm:flex items-center justify-center">
                    <div className="w-full border-t-2 border-dashed border-red-500 relative">
                      <span className="w-2 h-2 rounded-full bg-red-600 absolute -top-1 end-0" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800">
                      <Truck className="w-7 h-7" />
                    </div>
                    <div className="text-xs font-black text-slate-950">{txt.nlNode}</div>
                    <div className="text-[11px] font-medium text-slate-500">{txt.nlNodeEn}</div>
                  </div>
                </div>
              </div>

              {/* PRIMARY 5 MOCKUP TILES: Meals, Market, My Orders, Offers, My Account */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {(
                  [
                    {
                      id: 'meals',
                      titleAr: 'الوجبات',
                      titleSub: 'Meals',
                      icon: UtensilsCrossed,
                      accentRed: false,
                    },
                    {
                      id: 'market',
                      titleAr: 'الماركت',
                      titleSub: 'Market (34)',
                      icon: ShoppingCart,
                      accentRed: false,
                    },
                    {
                      id: 'orders',
                      titleAr: 'طلباتي',
                      titleSub: `My Orders${cartCount > 0 ? ` (${cartCount})` : ''}`,
                      icon: ClipboardList,
                      accentRed: true,
                    },
                    {
                      id: 'offers',
                      titleAr: 'العروض',
                      titleSub: 'Offers',
                      icon: Tag,
                      accentRed: true,
                    },
                    {
                      id: 'account',
                      titleAr: 'حسابي',
                      titleSub: 'My Account',
                      icon: User,
                      accentRed: false,
                    },
                  ] as const
                ).map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => {
                        if (tile.id === 'orders') setCheckoutStep('cart');
                        setActiveTab(tile.id);
                      }}
                      className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-600 hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer group"
                    >
                      {/* Top-right soft pink corner accent matching mockup */}
                      <span
                        className="absolute -top-4 -start-4 w-12 h-12 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors"
                        aria-hidden="true"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center relative z-10">
                        <Icon
                          className={`w-7 h-7 ${
                            tile.accentRed ? 'text-red-600' : 'text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-950">{tile.titleAr}</div>
                        <div className="text-xs font-medium text-slate-500">{tile.titleSub}</div>
                      </div>
                      <span className="w-7 h-7 rounded-full bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors">
                        {uiLang === 'ar' ? (
                          <ArrowLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* CORE MANAGEMENT & MOBILE DEPLOYMENT STRIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {canApproveHabePurchases && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('employees')}
                    className="min-h-[68px] p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-red-600 text-start transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-black text-red-600">
                        {allEmployees.length} {uiLang === 'ar' ? 'موظف وعامل' : 'Employees'}
                      </span>
                      <div className="text-sm font-black text-slate-950">
                        {uiLang === 'ar' ? 'كشف الموظفين والعاملين' : 'Employee Directory & QR'}
                      </div>
                    </div>
                    <Users className="w-6 h-6 text-slate-800 shrink-0" />
                  </button>
                )}

                {canApproveHabePurchases && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin_payroll')}
                    className="min-h-[68px] p-4 rounded-2xl bg-slate-950 hover:bg-red-600 text-white text-start transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-black text-red-400">
                        {pendingAdminOrders.length}{' '}
                        {uiLang === 'ar' ? 'بانتظار الاعتماد' : 'Pending Approval'}
                      </span>
                      <div className="text-sm font-black">
                        {uiLang === 'ar' ? 'تأكيد الإدارة والتقرير الشهري' : 'Admin Approval & Monthly PDF'}
                      </div>
                    </div>
                    <FileSpreadsheet className="w-6 h-6 text-white shrink-0" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('install')}
                  className="min-h-[68px] p-4 rounded-2xl bg-red-600 hover:bg-slate-950 text-white text-start transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-black text-red-100">Android &amp; iOS</span>
                    <div className="text-sm font-black">
                      {uiLang === 'ar' ? 'رابط وكود تثبيت تطبيق Ha-Be' : 'Install Ha-Be Mobile App + QR'}
                    </div>
                  </div>
                  <Smartphone className="w-6 h-6 text-white shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('poster')}
                  className="min-h-[68px] p-4 rounded-2xl bg-white hover:border-red-600 border border-slate-200 text-start transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-black text-slate-500">Vodafone + InstaPay</span>
                    <div className="text-sm font-black text-slate-950">
                      {uiLang === 'ar' ? 'بوستر الدفع QR للطباعة' : 'Caravan QR Poster'}
                    </div>
                  </div>
                  <QrCode className="w-6 h-6 text-red-600 shrink-0" />
                </button>
              </div>



              {/* CLOSING MOTTO MATCHING MOCKUP FOOTER */}
              <div className="pt-2 text-center space-y-1">
                <div className="text-sm font-black text-slate-950">{txt.sloganAr}</div>
                <div className="text-xs font-medium text-slate-500">{txt.sloganEn}</div>
              </div>
            </div>
          )}

          {/* ==================== 2. MEALS TAB (الوجبات) ==================== */}
          {activeTab === 'meals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      uiLang === 'ar'
                        ? 'ابحث في الوجبات (فطور 49، غداء 92، كريب 80، بيتزا، تونة، وجبات السحر...)'
                        : 'Search meals...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:border-red-600 focus:bg-white focus:outline-none"
                  />
                </div>
                {cartCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('cart');
                      setActiveTab('orders');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {uiLang === 'ar'
                        ? `السلة (${cartCount}) · ${cartTotalEGP} ج.م`
                        : `Cart (${cartCount}) · ${cartTotalEGP} EGP`}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveMealCategory('all_meals')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer ${
                    activeMealCategory === 'all_meals'
                      ? 'bg-slate-950 text-white'
                      : 'bg-white border border-slate-200 text-slate-800 hover:border-red-600'
                  }`}
                >
                  {uiLang === 'ar' ? 'كل الوجبات' : 'All Meals'}
                </button>
                {HABE_MENU_CATEGORIES.filter((c) => c.key !== 'drinks_snacks').map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      setActiveMealCategory(cat.key as Exclude<HabeMenuCategoryKey, 'drinks_snacks'>)
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer ${
                      activeMealCategory === cat.key
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-800 hover:border-red-600'
                    }`}
                  >
                    {uiLang === 'ar' ? cat.ar : uiLang === 'de' ? cat.de : cat.en}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {mealMenuItems.map((item) => {
                  const inCart = cart.find((c) => c.item.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white border border-slate-200 hover:border-red-600 transition-all overflow-hidden flex flex-col justify-between shadow-2xs"
                    >
                      <div className="flex gap-3 p-3.5">
                        <HabeMarketProductVisual item={item} />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {item.code}
                            </span>
                            <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                              <HabeSkuVectorGlyph item={item} className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <h3 className="text-xs font-black text-slate-950 leading-snug line-clamp-2">
                            {itemName(item)}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {itemDesc(item)}
                          </p>
                        </div>
                      </div>

                      <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-red-600 tabular-nums">
                          {item.priceEGP} ج.م
                        </span>
                        <div className="flex items-center gap-1.5">
                          {inCart ? (
                            <div className="inline-flex items-center gap-1 bg-white border border-red-600 rounded-lg px-1.5 py-1">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-5 h-5 rounded bg-red-50 text-red-600 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black px-1">{inCart.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(item, false)}
                              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-red-600 text-white text-[11px] font-black cursor-pointer transition-colors"
                            >
                              + {uiLang === 'ar' ? 'إضافة' : 'Add'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => addToCart(item, true)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-black cursor-pointer"
                          >
                            {uiLang === 'ar' ? 'شراء فوري' : 'Pay Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 3. MARKET TAB (ALL 34 DISTINCT PRODUCTS) ==================== */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    {uiLang === 'ar'
                      ? 'الماركت — 34 صنف (مشروبات وشيبسي وبسكويتات)'
                      : 'Market — 34 Distinct Beverages, Chips & Chocolates'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {uiLang === 'ar'
                      ? 'أيقونات وصور منتجات حقيقية مميزة لكل صنف على حدة · بدون تكرار'
                      : 'Distinct product visual, flavor badge & instant cart pricing per SKU.'}
                  </p>
                </div>

                {cartCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('cart');
                      setActiveTab('orders');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {uiLang === 'ar'
                        ? `الانتقال للسلة والدفع (${cartCount}) · ${cartTotalEGP} ج.م`
                        : `Go to Cart (${cartCount}) · ${cartTotalEGP} EGP`}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      uiLang === 'ar'
                        ? 'ابحث بالاسم أو الكود (بيبسي، جهينة، ريد بول، شيبسي، دوريتوس، جالكسي، أوريو...)'
                        : 'Search SKU by name or code...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:border-red-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(
                    [
                      { id: 'all', ar: 'الكل (34)', en: 'All (34)' },
                      { id: 'drinks', ar: 'مشروبات وعصائر (13)', en: 'Drinks (13)' },
                      { id: 'chips', ar: 'شيبسي ومقرمشات (7)', en: 'Chips (7)' },
                      { id: 'sweets', ar: 'شوكولاتة وبسكويت (14)', en: 'Chocolates & Biscuits (14)' },
                    ] as const
                  ).map((sg) => (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => setActiveMarketSubGroup(sg.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer ${
                        activeMarketSubGroup === sg.id
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 hover:border-red-600'
                      }`}
                    >
                      {uiLang === 'ar' ? sg.ar : sg.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {marketItems.map((item) => {
                  const inCart = cart.find((c) => c.item.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white border border-slate-200 hover:border-red-600 transition-all overflow-hidden flex flex-col justify-between shadow-2xs"
                    >
                      <div className="flex gap-3 p-3.5">
                        <HabeMarketProductVisual item={item} />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-black text-slate-400">
                              {item.code}
                            </span>
                            <span
                              style={{
                                backgroundColor: `${item.brandColor || '#dc2626'}15`,
                                color: item.brandColor || '#dc2626',
                              }}
                              className="w-7 h-7 rounded-xl flex items-center justify-center"
                            >
                              <HabeSkuVectorGlyph item={item} className="w-4 h-4" />
                            </span>
                          </div>
                          <h3 className="text-xs font-black text-slate-950 leading-snug">
                            {itemName(item)}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{itemDesc(item)}</p>
                        </div>
                      </div>

                      <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-red-600 tabular-nums">
                          {item.priceEGP} ج.م
                        </span>
                        <div className="flex items-center gap-1.5">
                          {inCart ? (
                            <div className="inline-flex items-center gap-1 bg-white border border-red-600 rounded-lg px-1.5 py-1">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-5 h-5 rounded bg-red-50 text-red-600 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black px-1">{inCart.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(item, false)}
                              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-red-600 text-white text-[11px] font-black cursor-pointer transition-colors"
                            >
                              + {uiLang === 'ar' ? 'إضافة' : 'Add'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => addToCart(item, true)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-black cursor-pointer"
                          >
                            {uiLang === 'ar' ? 'شراء فوري' : 'Pay Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 4. TWO-STEP ORDERS -> DEDICATED PAYMENT GATEWAY -> RECEIPT ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {/* Stepper Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className={`px-3.5 py-2 rounded-xl cursor-pointer transition-colors ${
                      checkoutStep === 'cart'
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    1. {uiLang === 'ar' ? `السلة (${cartCount})` : `Cart (${cartCount})`}
                  </button>
                  <span className="text-slate-400">→</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (cart.length > 0) setCheckoutStep('payment_gateway');
                    }}
                    disabled={cart.length === 0}
                    className={`px-3.5 py-2 rounded-xl cursor-pointer transition-colors disabled:opacity-40 ${
                      checkoutStep === 'payment_gateway'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    2. {uiLang === 'ar' ? 'واجهة الدفع الإلكتروني' : 'Payment Gateway'}
                  </button>
                  {lastReceipt && (
                    <>
                      <span className="text-slate-400">→</span>
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('receipt')}
                        className={`px-3.5 py-2 rounded-xl cursor-pointer transition-colors ${
                          checkoutStep === 'receipt'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        3. {uiLang === 'ar' ? 'الإيصال المعتمد' : 'Receipt'}
                      </button>
                    </>
                  )}
                </div>

                {cartTotalEGP > 0 && (
                  <div className="text-sm font-black text-red-600 tabular-nums">
                    {uiLang === 'ar' ? 'المجموع:' : 'Total:'} {cartTotalEGP} ج.م
                  </div>
                )}
              </div>

              {/* STEP 1: CART REVIEW */}
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                      <ShoppingBag className="w-10 h-10 text-red-600 mx-auto" />
                      <p className="text-sm font-black text-slate-900">
                        {uiLang === 'ar' ? 'السلة فارغة حالياً' : 'Your cart is empty'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('meals')}
                          className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black cursor-pointer"
                        >
                          {uiLang === 'ar' ? 'تصفح الوجبات' : 'Browse Meals'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('market')}
                          className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-black cursor-pointer"
                        >
                          {uiLang === 'ar' ? 'تصفح الماركت' : 'Browse Market'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-slate-200 divide-y divide-slate-200 bg-white">
                        {cart.map(({ item, qty }) => (
                          <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                            <HabeMarketProductVisual item={item} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-mono text-slate-400">{item.code}</div>
                              <div className="text-xs sm:text-sm font-black text-slate-950">{itemName(item)}</div>
                              <div className="text-xs font-bold text-red-600 mt-0.5">
                                {item.priceEGP} × {qty} = {item.priceEGP * qty} ج.م
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-900 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black w-5 text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-900 flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="p-4 bg-slate-950 text-white flex items-center justify-between font-black text-sm">
                          <span>{uiLang === 'ar' ? 'إجمالي الطلب:' : 'Cart Total:'}</span>
                          <span className="text-xl text-red-400 tabular-nums">{cartTotalEGP} ج.م</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setCart([])}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 text-red-600 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{uiLang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCheckoutStep('payment_gateway')}
                          className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-slate-950 text-white text-sm font-black shadow-lg cursor-pointer transition-colors flex items-center gap-2"
                        >
                          <span>
                            {uiLang === 'ar'
                              ? 'الانتقال لواجهة الدفع واختيار الوسيلة ←'
                              : 'Proceed to Payment Screen →'}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2: DEDICATED PAYMENT GATEWAY SCREEN (Vodafone Cash / InstaPay / Payroll / Cash) */}
              {checkoutStep === 'payment_gateway' && cart.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Employee Identity + Payment Method Selection */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Employee Selector / Company Voucher Bar */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-black text-slate-950">
                            {canApproveHabePurchases
                              ? 'بيانات الموظف صاحب الطلب (إدارة)'
                              : 'بيانات حسابك المؤمّن (معزول تلقائياً)'}
                          </span>
                        </div>
                        {canApproveHabePurchases && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveTab('employees')}
                              className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[10px] font-black cursor-pointer"
                            >
                              {uiLang === 'ar' ? 'اختيار من دليل الموظفين (86)' : 'Pick from 86 Staff'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAnonVoucher(!anonymousVoucherMode)}
                              className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1 ${
                                anonymousVoucherMode
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700'
                              }`}
                            >
                              <EyeOff className="w-3 h-3" />
                              <span>{anonymousVoucherMode ? 'فوتشر بدون أسماء (مفعّل)' : 'فوتشر بدون أسماء'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {!anonymousVoucherMode && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            readOnly={!canApproveHabePurchases}
                            value={employeeName}
                            onChange={(e) => canApproveHabePurchases && setEmployeeName(e.target.value)}
                            placeholder={uiLang === 'ar' ? 'اسم الموظف *' : 'Employee Name *'}
                            className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${
                              canApproveHabePurchases
                                ? 'bg-white border-slate-300 focus:border-red-600'
                                : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                            }`}
                          />
                          <input
                            type="text"
                            readOnly={!canApproveHabePurchases}
                            value={departmentName}
                            onChange={(e) => canApproveHabePurchases && setDepartmentName(e.target.value)}
                            placeholder={uiLang === 'ar' ? 'القسم / الإدارة' : 'Department'}
                            className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${
                              canApproveHabePurchases
                                ? 'bg-white border-slate-300 focus:border-red-600'
                                : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* 4 Recognizable Payment Cards */}
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-black text-slate-950 uppercase">
                        {uiLang === 'ar' ? 'اختر وسيلة الدفع المناسبة:' : 'Select Payment Method:'}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(
                          [
                            {
                              id: 'vodafone_cash',
                              ar: 'فودافون كاش',
                              en: 'Vodafone Cash',
                              sub: HABE_CONTACTS.vodafoneCash,
                            },
                            {
                              id: 'instapay',
                              ar: 'إنستاباي',
                              en: 'InstaPay',
                              sub: HABE_CONTACTS.instapay,
                            },
                            {
                              id: 'payroll_deduction',
                              ar: 'على الراتب',
                              en: 'Payroll',
                              sub: 'بانتظار تأكيد الإدارة',
                            },
                            {
                              id: 'cash',
                              ar: 'نقدي / كاش',
                              en: 'Cash',
                              sub: 'عند الاستلام',
                            },
                          ] as const
                        ).map((pm) => (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`min-h-[88px] p-3 rounded-2xl border-2 text-start flex flex-col gap-2 cursor-pointer transition-all ${
                              paymentMethod === pm.id
                                ? 'border-red-600 bg-red-50/60 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-400'
                            }`}
                          >
                            <PaymentMethodIcon method={pm.id} className="w-9 h-9" />
                            <div>
                              <div className="text-xs font-black text-slate-950">
                                {uiLang === 'ar' ? pm.ar : pm.en}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-red-600 truncate" dir="ltr">
                                {pm.sub}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>


                    </div>

                    {paymentMethod !== 'payroll_deduction' && (
                      <input
                        type="text"
                        value={trxRefInput}
                        onChange={(e) => setTrxRefInput(e.target.value)}
                        placeholder={
                          uiLang === 'ar'
                            ? 'رقم مرجع التحويل (اختياري — يُنشأ تلقائياً)'
                            : 'Transfer Reference (optional)'
                        }
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold focus:border-red-600 focus:outline-none"
                      />
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="min-h-[48px] px-4 py-3 rounded-2xl bg-slate-100 text-slate-800 text-xs font-black cursor-pointer"
                      >
                        {uiLang === 'ar' ? 'تعديل السلة' : 'Edit Cart'}
                      </button>

                      <button
                        type="button"
                        disabled={submittingOrder}
                        onClick={() => void handleConfirmOrderAndPay()}
                        className="min-h-[48px] flex-1 py-3 px-5 rounded-2xl bg-red-600 hover:bg-slate-950 text-white text-sm font-black shadow-lg cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {submittingOrder
                            ? 'جاري تسجيل الطلب...'
                            : paymentMethod === 'payroll_deduction'
                            ? `إرسال للاعتماد من الإدارة (${cartTotalEGP} ج.م)`
                            : `تأكيد الدفع وإصدار الإيصال (${cartTotalEGP} ج.م)`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Live Scannable + Downloadable + Printable QR Payment Card */}
                  <div className="lg:col-span-5">
                    <div
                      ref={paymentQrSlipPrintRef}
                      dir="rtl"
                      className="p-5 rounded-3xl bg-white border-2 border-slate-950 shadow-md space-y-4 text-center"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <HabeAwningLogo size="sm" showText={false} />
                        <div className="text-start">
                          <div className="text-xs font-black text-slate-950">بوابة الدفع الفوري Ha-Be</div>
                          <div className="text-xs font-black text-red-600">
                            المطلوب: {cartTotalEGP} ج.م
                          </div>
                        </div>
                        <PaymentMethodIcon method={paymentMethod} className="w-9 h-9" />
                      </div>

                      {paymentMethod === 'vodafone_cash' && (
                        <div className="space-y-3">
                          <div className="text-xs font-black text-red-600">
                            فودافون كاش المباشر بالمبلغ الكامل ({cartTotalEGP} ج.م)
                          </div>
                          <div className="flex justify-center">
                            <RealQrCode
                              value={`tel:${vodafoneUssdCode}`}
                              size={168}
                              darkColor="#111827"
                              alt="Vodafone Cash Amount QR"
                              downloadFilename={`vodafone-cash-${cartTotalEGP}egp-qr.png`}
                              downloadLabel="تحميل كود QR (PNG)"
                            />
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-black text-slate-950" dir="ltr">
                            {vodafoneUssdCode}
                          </div>
                          <div className="flex flex-wrap justify-center gap-2 print:hidden">
                            <a
                              href={vodafoneDialHref}
                              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black inline-flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>تشغيل كود فودافون كاش *9*7#</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => copyText(vodafoneUssdCode, 'كود الدفع')}
                              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer"
                            >
                              نسخ الكود
                            </button>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'instapay' && (
                        <div className="space-y-3">
                          <div className="text-xs font-black text-slate-950">
                            إنستاباي الفوري (InstaPay) — {cartTotalEGP} ج.م
                          </div>
                          <div className="flex justify-center">
                            <RealQrCode
                              value={instapayQrPayload}
                              size={168}
                              darkColor="#111827"
                              alt="InstaPay Amount QR"
                              downloadFilename={`instapay-${cartTotalEGP}egp-qr.png`}
                              downloadLabel="تحميل كود QR (PNG)"
                            />
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-black text-red-600" dir="ltr">
                            {HABE_CONTACTS.instapay}
                          </div>
                          <div className="flex flex-wrap justify-center gap-2 print:hidden">
                            <a
                              href={instapayQrPayload}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black inline-flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>فتح رابط إنستاباي</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => copyText(HABE_CONTACTS.instapay, 'رقم إنستاباي')}
                              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer"
                            >
                              نسخ الرقم
                            </button>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'payroll_deduction' && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-start">
                          <div className="font-black text-slate-950 flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-red-600" />
                            <span>نظام الخصم على الراتب وتأكيد الإدارة</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            عند الضغط على زر الإرسال، يدخل هذا الطلب فوراً في <strong>قائمة تأكيد الإدارة</strong>. بمجرد أن يضغط المسؤول على <strong>تأكيد الطلب</strong>، ينزل رسمياً في كشف حساب الموظف آخر الشهر (خد إيه وعليه إيه).
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'cash' && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-start">
                          <div className="font-black text-slate-950">الدفع النقدي المباشر عند الاستلام</div>
                          <p className="text-slate-600">
                            سيتم إصدار إيصال رسمي مختوم بالكود لتسليمه مع الطلب النقدي في نقطة Ha-Be.
                          </p>
                        </div>
                      )}

                      {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && (
                        <button
                          type="button"
                          onClick={() =>
                            paymentQrSlipPrintRef.current &&
                            triggerCleanA4Print([paymentQrSlipPrintRef.current])
                          }
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer print:hidden"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{uiLang === 'ar' ? 'طباعة كود الدفع مباشرة' : 'Print Payment QR Slip'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: RECEIPT VIEW */}
              {checkoutStep === 'receipt' && lastReceipt && (
                <div className="max-w-lg mx-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-950">
                      {uiLang === 'ar' ? 'الإيصال الرسمي القابل للطباعة' : 'Printable Official Receipt'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          receiptPrintRef.current && triggerCleanA4Print([receiptPrintRef.current])
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{uiLang === 'ar' ? 'طباعة الإيصال' : 'Print Receipt'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('meals')}
                        className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-black cursor-pointer"
                      >
                        {uiLang === 'ar' ? 'طلب جديد' : 'New Order'}
                      </button>
                    </div>
                  </div>

                  <div
                    ref={receiptPrintRef}
                    dir="rtl"
                    className="p-6 rounded-2xl bg-white text-slate-950 border-2 border-slate-950 shadow-md space-y-3 text-xs"
                  >
                    <div className="text-center border-b-2 border-red-600 pb-3 space-y-1">
                      <div className="font-black text-lg text-slate-950">Ha-Be | الوطنية اللوجستية</div>
                      <div className="text-[11px] font-bold text-red-600">
                        {lastReceipt.approvalStatus === 'pending_admin'
                          ? 'إيصال طلب على الراتب — بانتظار تأكيد الإدارة'
                          : 'إيصال طلب وسداد رسمي معتمد'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-600">
                        {lastReceipt.id} · {lastReceipt.createdAt}
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">الموظف / المستفيد:</span>
                        <span className="font-black text-slate-950">{lastReceipt.employeeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">القسم:</span>
                        <span className="font-bold">{lastReceipt.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">وسيلة الدفع:</span>
                        <span className="font-black text-red-600">
                          {lastReceipt.paymentMethod === 'vodafone_cash'
                            ? `فودافون كاش (${HABE_CONTACTS.vodafoneCash})`
                            : lastReceipt.paymentMethod === 'instapay'
                            ? `إنستاباي (${HABE_CONTACTS.instapay})`
                            : lastReceipt.paymentMethod === 'cash'
                            ? 'نقدي / كاش'
                            : 'على الراتب (خصم شهري)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">حالة الاعتماد:</span>
                        <span className="font-black text-slate-950">
                          {lastReceipt.approvalStatus === 'pending_admin'
                            ? 'قيد مراجعة الإدارة'
                            : lastReceipt.approvalStatus === 'approved'
                            ? 'مؤكد ومعتمد من الإدارة'
                            : lastReceipt.approvalStatus === 'rejected'
                            ? 'مرفوض'
                            : 'مدفوع ومؤكد'}
                        </span>
                      </div>
                    </div>

                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 font-black">
                          <th className="py-1 text-right">الصنف</th>
                          <th className="py-1 text-center">ك</th>
                          <th className="py-1 text-left">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {lastReceipt.items.map((it, i) => (
                          <tr key={i}>
                            <td className="py-1.5 font-bold">
                              [{it.code}] {it.nameAr}
                            </td>
                            <td className="py-1.5 text-center font-mono">{it.qty}</td>
                            <td className="py-1.5 text-left font-black tabular-nums">
                              {it.qty * it.priceEGP} ج.م
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="pt-2 border-t-2 border-slate-950 flex items-center justify-between text-sm font-black">
                      <span>الإجمالي:</span>
                      <span className="text-red-600 tabular-nums">{lastReceipt.totalEGP} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ISOLATED SERVER-BACKED ORDER HISTORY */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-950">
                    {canApproveHabePurchases
                      ? `سجل كافة طلبات نقطة Ha-Be (${ordersHistory.length})`
                      : `طلباتي المسجلة على حسابي (${ordersHistory.length})`}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700">مربوط بخادم الحساب المعزول</span>
                </div>
                {ordersHistory.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-500">
                    لا توجد طلبات مسجلة حتى الآن.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ordersHistory.slice(0, 12).map((ord) => (
                      <div key={ord.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-black text-slate-950">{ord.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              ord.approvalStatus === 'pending_admin'
                                ? 'bg-amber-100 text-amber-900'
                                : ord.approvalStatus === 'rejected'
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {ord.approvalStatus === 'pending_admin'
                              ? 'بانتظار الاعتماد'
                              : ord.approvalStatus === 'approved'
                              ? 'معتمد من الإدارة'
                              : ord.approvalStatus === 'rejected'
                              ? 'مرفوض'
                              : 'مدفوع ومؤكد'}
                          </span>
                        </div>
                        <div className="font-black text-slate-900">{ord.employeeName}</div>
                        <div className="text-[11px] text-slate-600 line-clamp-1">
                          {ord.items.map((it) => `${it.nameAr} ×${it.qty}`).join(' + ')}
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-500">{ord.createdAt}</span>
                          <span className="font-black text-red-600 tabular-nums">{ord.totalEGP} ج.م</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 5. COMPLETE HABE STAFF DIRECTORY (APPROVERS ONLY) ==================== */}
          {activeTab === 'employees' && canApproveHabePurchases && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    {uiLang === 'ar'
                      ? `دليل الموظفين والعاملين الكامل (${allEmployees.length} موظف)`
                      : `Complete Ha-Be Employee Directory (${allEmployees.length} Staff)`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {uiLang === 'ar'
                      ? 'شامل جميع الإدارات العليا والمالية والمبيعات والمشتريات والجودة والموارد البشرية والمخازن والتحصيل وأطقم التشغيل بالمصنع.'
                      : 'Includes Corporate Management Sheet (30) + Plant Operations Roster (56) with individual QR codes.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder={
                      uiLang === 'ar'
                        ? 'ابحث بالاسم (عربي أو إنجليزي)، القسم، المسمى الوظيفي، أو رقم الشركة...'
                        : 'Search name, department, title, code or company number...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:border-red-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(
                    [
                      { id: 'all', label: `الكل (${allEmployees.length})` },
                      { id: 'corporate_sheet', label: 'كشف الإدارات الرسمي (30)' },
                      { id: 'plant_operations', label: 'تشغيل المصنع والورديات (56)' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEmpFilterGroup(f.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer ${
                        empFilterGroup === f.id
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 hover:border-red-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Employee Form (Strictly gated to Owner or Designated Ha-Be Approver) */}
              {canApproveHabePurchases ? (
                <form
                  onSubmit={handleAddCustomEmployee}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center"
                >
                  <input
                    name="newNameAr"
                    placeholder="الاسم بالعربي"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                  <input
                    name="newNameEn"
                    placeholder="English Name"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                  <input
                    name="newDept"
                    placeholder="القسم (Sales / Finance...)"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                  <input
                    name="newJob"
                    placeholder="المسمى الوظيفي"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                  <input
                    name="newPhone"
                    dir="ltr"
                    placeholder="01XXXXXXXXX"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black cursor-pointer"
                  >
                    + إضافة موظف
                  </button>
                </form>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      {uiLang === 'ar'
                        ? 'إضافة موظفين جدد متاحة فقط للمالك أو المعتمد المعين عبر Google.'
                        : 'Adding employees is restricted to Owner or designated Ha-Be approvers.'}
                    </span>
                  </div>
                  {!isAuthVerified && onGoogleSignIn && (
                    <button
                      type="button"
                      onClick={onGoogleSignIn}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-[11px] font-black cursor-pointer"
                    >
                      {uiLang === 'ar' ? 'تسجيل دخول المعتمد (Google)' : 'Google Sign In'}
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredEmployees.map((emp) => {
                  const isCurrent = employeeCode === emp.code && !anonymousVoucherMode;
                  const empApprovedTotal = approvedPayrollOrders
                    .filter((o) => o.employeeCode === emp.code)
                    .reduce((s, o) => s + o.totalEGP, 0);

                  return (
                    <div
                      key={emp.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'border-2 border-red-600 bg-red-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 text-white text-[10px] font-mono font-black">
                            {emp.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-black">
                            {emp.department}
                          </span>
                        </div>
                        <div className="text-sm font-black text-slate-950 leading-snug pt-1">
                          {emp.nameEn}
                        </div>
                        {emp.nameAr && emp.nameAr !== emp.nameEn && (
                          <div className="text-xs font-bold text-slate-700">{emp.nameAr}</div>
                        )}
                        <div className="text-[11px] font-medium text-slate-500">{emp.jobTitle}</div>
                        <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-600" dir="ltr">
                          <span>{emp.compNumber}</span>
                          <span>{emp.username}</span>
                        </div>
                        {empApprovedTotal > 0 && (
                          <div className="text-[11px] font-black text-red-600 pt-1">
                            مسحوبات الراتب المعتمدة: {empApprovedTotal} ج.م
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectEmployee(emp)}
                          className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-[11px] font-black cursor-pointer transition-colors"
                        >
                          {isCurrent ? 'المستخدم النشط ✓' : 'تحديد للطلب'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedQrEmployee(emp)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-800 text-[11px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 6. ADMIN CONFIRMATION QUEUE + CONSOLIDATED MONTHLY STATEMENT (APPROVERS ONLY) ==================== */}
          {activeTab === 'admin_payroll' && canApproveHabePurchases && (
            <div className="space-y-6">
              {/* SECTION A: PENDING ADMIN CONFIRMATIONS */}
              <div className="p-5 rounded-3xl bg-slate-50 border-2 border-red-600 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black">
                      واجهة التأكيد من الإدارة
                    </span>
                    <h2 className="text-lg font-black text-slate-950 mt-1">
                      طلبات الخصم على الراتب بانتظار الاعتماد ({pendingAdminOrders.length})
                    </h2>
                  </div>
                </div>

                {!canApproveHabePurchases && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-amber-950">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-5 h-5 text-red-600 shrink-0" />
                      <span>
                        {uiLang === 'ar'
                          ? 'اعتماد مشتريات Ha-Be والخصم على الراتب مقصور حصرياً على المالك أو المعتمدين المعينين (1–2 مستخدم) بعد تسجيل الدخول بـ Google.'
                          : 'Approving Ha-Be purchases is restricted strictly to the Platform Owner or designated approvers signed in via Google.'}
                      </span>
                    </div>
                    {!isAuthVerified && onGoogleSignIn && (
                      <button
                        type="button"
                        onClick={onGoogleSignIn}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{uiLang === 'ar' ? 'تسجيل دخول Google' : 'Sign In with Google'}</span>
                      </button>
                    )}
                  </div>
                )}

                {pendingAdminOrders.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center text-xs font-bold text-slate-500">
                    لا توجد طلبات خصم على الراتب معلقة حالياً. أي طلب جديد بطريقة "على الراتب" سيظهر هنا لتأكيده أولاً قبل اعتماده في تقرير آخر الشهر.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingAdminOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black px-2 py-0.5 rounded bg-slate-950 text-white">
                              {ord.id}
                            </span>
                            <span className="font-black text-slate-950 text-sm">{ord.employeeName}</span>
                            <span className="text-slate-500">({ord.department})</span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-700">
                            الأصناف:{' '}
                            {ord.items.map((it) => `${it.nameAr} ×${it.qty}`).join(' + ')}
                          </div>
                          <div className="text-[10px] text-slate-400">{ord.createdAt}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-base font-black text-red-600 tabular-nums me-2">
                            {ord.totalEGP} ج.م
                          </span>
                          {canApproveHabePurchases ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAdminApproveOrder(ord.id, 'approved')}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>تأكيد الطلب</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdminApproveOrder(ord.id, 'rejected')}
                                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-red-600 hover:text-white text-slate-800 text-xs font-black flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>رفض</span>
                              </button>
                            </>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-black text-slate-600 inline-flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-red-600" />
                              <span>{uiLang === 'ar' ? 'بانتظار المعتمد المعين' : 'Approver Only'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: CONSOLIDATED MONTHLY REPORT (PDF + PRINT + CSV) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-950">
                      التقرير المجمع الشهري للرواتب (خد إيه / عليه إيه)
                    </h3>
                    <p className="text-xs text-slate-500">
                      يشمل كافة الطلبات المؤكدة من الإدارة مجمعة لكل موظف مع إجمالي المستحق للخصم الشهري
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadMonthlyPdf}
                      disabled={isExportingMonthlyPdf}
                      className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>{isExportingMonthlyPdf ? 'جاري التحميل...' : 'تحميل التقرير المجمع PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintMonthlyReport}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>طباعة التقرير المجمع</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPayrollCsv}
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-red-600 text-slate-900 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-red-600" />
                      <span>Excel / CSV</span>
                    </button>
                  </div>
                </div>

                {/* Printable / Exportable A4 Report Sheet */}
                <div
                  ref={monthlyReportPrintRef}
                  dir="rtl"
                  className="p-5 sm:p-6 rounded-2xl bg-white text-slate-950 border-2 border-slate-950 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-red-600 pb-3">
                    <div>
                      <div className="text-lg font-black text-slate-950">
                        Ha-Be Egypt — كشف خصومات الرواتب المجمع آخر الشهر
                      </div>
                      <div className="text-xs font-bold text-slate-600">
                        إدارة: الشركة الوطنية للخدمات اللوجستية | كاترينج مصر
                      </div>
                    </div>
                    <div className="text-left text-xs font-black">
                      <div>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</div>
                      <div className="text-red-600 text-sm">
                        الإجمالي العام المعتمد: {totalApprovedPayrollEGP.toLocaleString()} ج.م
                      </div>
                    </div>
                  </div>

                  {consolidatedMonthlyRows.length === 0 ? (
                    <div className="p-6 text-center text-xs font-bold text-slate-500">
                      لا توجد طلبات رواتب معتمدة بعد. اضغط "تأكيد الطلب" في القسم أعلاه لإدراج الموظف في كشف نهاية الشهر.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-white font-black">
                            <th className="p-2.5 border border-slate-800">الكود</th>
                            <th className="p-2.5 border border-slate-800">اسم الموظف / القسم</th>
                            <th className="p-2.5 border border-slate-800">خد إيه (تفصيل الأصناف والكميات)</th>
                            <th className="p-2.5 border border-slate-800 text-center">الطلبات</th>
                            <th className="p-2.5 border border-slate-800 text-left">عليه إيه (المستحق)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {consolidatedMonthlyRows.map((row) => (
                            <tr key={row.key} className="hover:bg-slate-50">
                              <td className="p-2.5 border border-slate-200 font-mono font-bold">
                                {row.employeeCode}
                              </td>
                              <td className="p-2.5 border border-slate-200">
                                <div className="font-black text-slate-950">{row.employeeName}</div>
                                <div className="text-[10px] text-slate-500">{row.department}</div>
                              </td>
                              <td className="p-2.5 border border-slate-200">
                                <ul className="space-y-0.5 text-[11px]">
                                  {row.itemsList.map((it, idx) => (
                                    <li key={idx}>
                                      • <strong>{it.nameAr}</strong> ×{it.qty} ({it.lineTotalEGP} ج.م)
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td className="p-2.5 border border-slate-200 text-center font-mono font-bold">
                                {row.orderCount}
                              </td>
                              <td className="p-2.5 border border-slate-200 text-left font-black text-red-600 tabular-nums">
                                {row.totalEGP} ج.م
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-red-50 font-black text-sm">
                            <td colSpan={4} className="p-3 border border-slate-300 text-slate-950">
                              الإجمالي الشهري المجمع المطلوب خصمه ({consolidatedMonthlyRows.length} موظف)
                            </td>
                            <td className="p-3 border border-slate-300 text-left text-red-600 tabular-nums">
                              {totalApprovedPayrollEGP} ج.م
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Complaints & Suggestions Section */}
              <form
                onSubmit={handleSubmitComplaint}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <MessageSquareWarning className="w-4 h-4 text-red-600" />
                    <span>المقترحات والشكاوى والمتابعة</span>
                  </h3>
                  <a
                    href={`tel:${HABE_CONTACTS.complaints}`}
                    dir="ltr"
                    className="text-xs font-mono font-black text-red-600 hover:underline"
                  >
                    {HABE_CONTACTS.complaints}
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={complaintSender}
                    onChange={(e) => setComplaintSender(e.target.value)}
                    disabled={anonymousVoucherMode}
                    placeholder={anonymousVoucherMode ? 'الاسم مخفي (وضع فوتشر)' : 'الاسم (اختياري)'}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                  <input
                    type="tel"
                    dir="ltr"
                    value={complaintPhone}
                    onChange={(e) => setComplaintPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  value={complaintMsg}
                  onChange={(e) => setComplaintMsg(e.target.value)}
                  placeholder="اكتب مقترحك أو ملاحظتك لإرسالها فوراً..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black cursor-pointer"
                >
                  إرسال الملاحظة للإدارة
                </button>
              </form>
            </div>
          )}

          {/* ==================== 7. SATURDAY WEEKLY OFFERS ==================== */}
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>
                      {isSaturdayToday
                        ? 'اليوم هو السبت — يوم فحص عروض الأسبوع'
                        : 'العروض الأسبوعية — فحص كل سبت لأيام العمل الأحد حتى الخميس'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black">منظومة العروض الأسبوعية والفحص الدوري</h2>
                  {satCheckedAt && (
                    <p className="text-[11px] text-emerald-400 font-bold">آخر فحص: {satCheckedAt}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nowStr = new Date().toLocaleString('ar-EG');
                    setSatCheckedAt(nowStr);
                    onShowToast('تم فحص عروض السبت الأسبوعية وتحديث باقات الأحد — الخميس.');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-white hover:text-red-600 text-white text-xs font-black cursor-pointer"
                >
                  فحص عروض السبت الآن
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HABE_SATURDAY_OFFERS.map((off) => (
                  <div
                    key={off.id}
                    className="p-5 rounded-2xl bg-white border-2 border-slate-950 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black">
                        {uiLang === 'ar' ? off.badgeAr : uiLang === 'de' ? off.badgeDe : off.badgeEn}
                      </span>
                      <h3 className="text-base font-black text-slate-950">
                        {uiLang === 'ar' ? off.titleAr : uiLang === 'de' ? off.titleDe : off.titleEn}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {uiLang === 'ar' ? off.descAr : uiLang === 'de' ? off.descDe : off.descEn}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-500">{off.code}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (off.id === 'sat_02') {
                            toggleAnonVoucher(true);
                            onShowToast('تم تفعيل وضع فوتشر دعم الشركة (بدون أسماء).');
                          } else {
                            setActiveTab('meals');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-red-600 text-white font-black cursor-pointer"
                      >
                        {off.id === 'sat_02' ? 'تفعيل فوتشر بدون أسماء' : 'تصفح الوجبات'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 8. CARAVAN WOOD-MOUNT QR POSTER ==================== */}
          {activeTab === 'poster' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950">
                    بوستر الكرفان للدفع المباشر والمنيو (جاهز للطباعة على A4)
                  </h2>
                  <p className="text-xs text-slate-500">
                    رموز QR حقيقية قابلة للتحميل PNG والطباعة المباشرة للتثبيت بالكرفان
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    posterPrintRef.current && triggerCleanA4Print([posterPrintRef.current])
                  }
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة البوستر A4</span>
                </button>
              </div>

              <div
                ref={posterPrintRef}
                dir="rtl"
                className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white text-slate-950 border-[6px] border-slate-950 shadow-xl space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-red-600 pb-4">
                  <HabeAwningLogo size="md" />
                  <div className="text-start">
                    <h3 className="text-lg font-black text-slate-950">
                      الشركة الوطنية للخدمات اللوجستية | كاترينج مصر
                    </h3>
                    <p className="text-xs font-bold text-red-600">
                      امسح الكود لفتح تطبيق Ha-Be أو الدفع المباشر فوراً
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
                  <div className="p-4 rounded-2xl border-2 border-red-600 bg-red-50/30 flex flex-col items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black">
                      1. فودافون كاش
                    </span>
                    <RealQrCode
                      value={`tel:*9*7*${HABE_CONTACTS.vodafoneCash}#`}
                      size={165}
                      darkColor="#111827"
                      alt="Vodafone Cash QR"
                      downloadFilename="poster-vodafone-01041482940.png"
                    />
                    <div className="font-mono text-base font-black text-slate-950" dir="ltr">
                      {HABE_CONTACTS.vodafoneCash}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 flex flex-col items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-xs font-black">
                      2. إنستاباي InstaPay
                    </span>
                    <RealQrCode
                      value={instapayQrPayload}
                      size={165}
                      darkColor="#111827"
                      alt="InstaPay QR"
                      downloadFilename="poster-instapay-01015090888.png"
                    />
                    <div className="font-mono text-base font-black text-slate-950" dir="ltr">
                      {HABE_CONTACTS.instapay}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-red-600 bg-white flex flex-col items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black">
                      3. تثبيت تطبيق Ha-Be
                    </span>
                    <RealQrCode
                      value={installAppUrl}
                      size={165}
                      darkColor="#dc2626"
                      alt="Install Ha-Be App QR"
                      downloadFilename="poster-install-habe-app.png"
                      downloadLabel="تحميل QR فقط PNG"
                    />
                    <button
                      type="button"
                      onClick={() => void downloadHabeBrandedQrCard(installAppUrl)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-slate-950 text-white text-[11px] font-black cursor-pointer print:hidden"
                    >
                      تحميل كارت Ha-Be الكامل PNG
                    </button>
                    <div className="text-xs font-black text-red-600">تثبيت مباشر Android / iPhone</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                  <span>{HABE_SUPPLY_TERMS.preOrderAr}</span>
                  <span dir="ltr" className="text-red-400 font-mono">
                    Support: {HABE_CONTACTS.complaints}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 9. DEDICATED HABE MOBILE APP INSTALL CENTER (ANDROID + IOS + QR) ==================== */}
          {activeTab === 'install' && (
            <div className="space-y-5">
              <div
                ref={installPosterPrintRef}
                dir="rtl"
                className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-950 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="/habe-icon-192.png"
                      alt="Ha-Be App Icon"
                      className="w-16 h-16 rounded-2xl border-2 border-red-600 shadow-md"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                        تطبيق Ha-Be المستقل للموظفين — Android &amp; iOS
                      </span>
                      <h2 className="text-xl font-black text-slate-950 mt-1">
                        تثبيت تطبيق نقطة Ha-Be على شاشة الهاتف
                      </h2>
                      <p className="text-xs text-slate-600">
                        ينزل التطبيق بأيقونة Ha-Be الحمراء المستقلة ليفتح مباشرة على وجبات وماركت Ha-Be دون الحاجة لفتح باقي منصة باسط.
                      </p>
                    </div>
                  </div>

                  {/* Direct App Install Link */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-black text-slate-700">
                      رابط التثبيت المباشر لعمال وموظفي Ha-Be:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <code
                        dir="ltr"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 truncate"
                      >
                        {installAppUrl}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyText(installAppUrl, 'رابط تثبيت Ha-Be')}
                        className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `رابط تثبيت تطبيق موظفي Ha-Be المباشر (أندرويد وآيفون):\n${installAppUrl}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>مشاركة واتساب</span>
                      </a>
                    </div>
                  </div>

                  {/* Native Android Install Button + Direct Reload Launcher + iPhone Safari Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
                    <div className="p-4 rounded-2xl border-2 border-red-600 bg-red-50/40 space-y-2">
                      <div className="text-xs font-black text-red-700">
                        أولاً: أجهزة أندرويد والكمبيوتر (Chrome / Edge)
                      </div>
                      {pwa.isInstalled && pwa.isPromptForHabeManifest ? (
                        <div className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تطبيق Ha-Be مثبت بالفعل بأيقونته المستقلة</span>
                        </div>
                      ) : pwa.isInstallable && pwa.isPromptForHabeManifest ? (
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await pwa.install();
                            if (ok) {
                              onShowToast('تم تثبيت تطبيق Ha-Be بنجاح بأيقونته المستقلة');
                            }
                          }}
                          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>تثبيت تطبيق Ha-Be الآن</span>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <a
                            href={installAppUrl}
                            target={pwa.isInIframe ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>
                              {pwa.isInIframe
                                ? 'فتح وتثبيت تطبيق Ha-Be في المتصفح'
                                : 'تفعيل التثبيت الفوري بأيقونة Ha-Be'}
                            </span>
                          </a>
                          <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                            يضمن هذا الزر تحميل تطبيق <strong>Ha-Be فقط</strong> بأيقونته الحمراء بدلاً من تطبيق باسط، أو من قائمة Chrome (⋮) ← <strong>Install App</strong>.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-slate-900 bg-slate-50 space-y-2">
                      <div className="text-xs font-black text-slate-950">
                        ثانياً: أجهزة آيفون (iPhone / Safari)
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                        افتح الرابط في متصفح <strong>Safari</strong> ← اضغط زر المشاركة (Share ⬆️) بالأسفل ← اختر <strong>Add to Home Screen (إضافة للشاشة الرئيسية)</strong> ← تنزل أيقونة <strong>Ha-Be</strong> فوراً.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scannable Install QR + Direct Branded Card PNG + Print */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-50 border border-slate-200 gap-2.5 text-center">
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black">
                    امسح الكود بكاميرا الهاتف لتثبيت Ha-Be
                  </span>
                  <RealQrCode
                    value={installAppUrl}
                    size={185}
                    darkColor="#0f172a"
                    alt="QR Install Ha-Be Mobile App"
                    downloadFilename="habe-app-install-qr.png"
                    downloadLabel="تحميل QR فقط PNG"
                  />
                  <button
                    type="button"
                    onClick={() => void downloadHabeBrandedQrCard(installAppUrl)}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer print:hidden shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل كارت QR بشعار Ha-Be (PNG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      installPosterPrintRef.current &&
                      triggerCleanA4Print([installPosterPrintRef.current])
                    }
                    className="w-full py-2 px-4 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer print:hidden"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة بوستر التثبيت للعمال</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 10. MY ACCOUNT TAB (حسابي) ==================== */}
          {activeTab === 'account' && (
            <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-950 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-950">حسابي وأمان الدخول</h2>
                    <p className="text-xs text-slate-500">
                      {canApproveHabePurchases
                        ? 'وضع الاعتماد التنفيذي — إدارة كشوف الموظفين والفوتشر'
                        : 'حسابك معزول تماماً — بياناتك وطلباتك مخصصة لك فقط'}
                    </p>
                  </div>
                </div>
                {canApproveHabePurchases && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('employees')}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 text-white text-xs font-black cursor-pointer"
                  >
                    دليل الموظفين
                  </button>
                )}
              </div>

              {canApproveHabePurchases && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-red-700">
                      إلغاء الأسماء — وضع فوتشر دعم الشركة
                    </div>
                    <div className="text-[11px] text-slate-700 mt-0.5">
                      يصدر الإيصال والفاتورة برقم فوتشر المؤسسة بدون طباعة أسماء شخصية
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAnonVoucher(!anonymousVoucherMode)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer shrink-0 ${
                      anonymousVoucherMode
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-800'
                    }`}
                  >
                    {anonymousVoucherMode ? 'مفعّل' : 'تفعيل'}
                  </button>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-black text-slate-900 mb-1">اسم الموظف / الحساب</label>
                  <input
                    type="text"
                    readOnly={!canApproveHabePurchases}
                    disabled={anonymousVoucherMode}
                    value={employeeName}
                    onChange={(e) => canApproveHabePurchases && setEmployeeName(e.target.value)}
                    placeholder={anonymousVoucherMode ? 'ملغي بوضع الفوتشر' : 'بيانات حسابك'}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border font-bold ${
                      canApproveHabePurchases
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-900 mb-1">الكود / اليوزرنيم</label>
                    <input
                      type="text"
                      dir="ltr"
                      readOnly
                      value={currentUsername ? `@${currentUsername}` : employeeUsername || employeeCode}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-900 mb-1">القسم</label>
                    <input
                      type="text"
                      readOnly={!canApproveHabePurchases}
                      value={departmentName}
                      onChange={(e) => canApproveHabePurchases && setDepartmentName(e.target.value)}
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border font-bold ${
                        canApproveHabePurchases
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Self-Service Change Password Card */}
              <form onSubmit={(e) => void handleChangePassword(e)} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-950">
                  <KeyRound className="w-4 h-4 text-red-600" />
                  <span>تغيير كلمة المرور الخاصة بحسابك</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="password"
                    dir="ltr"
                    value={cpCurrent}
                    onChange={(e) => setCpCurrent(e.target.value)}
                    placeholder="كلمة المرور الحالية"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                  <input
                    type="password"
                    dir="ltr"
                    minLength={8}
                    required
                    value={cpNext}
                    onChange={(e) => setCpNext(e.target.value)}
                    placeholder="كلمة المرور الجديدة (8+ أحرف)"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  />
                </div>
                {cpFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-bold ${
                      cpFeedback.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {cpFeedback.msg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={cpLoading}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black cursor-pointer"
                >
                  {cpLoading ? 'جاري التحديث...' : 'حفظ كلمة المرور الجديدة'}
                </button>
              </form>



              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full min-h-[46px] py-3 rounded-xl bg-rose-50 hover:bg-rose-600 border border-rose-200 text-rose-700 hover:text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION BAR (Mobile >= 44px touch targets & role-gated 2nd button) */}
        <div className="px-2 py-1.5 bg-white border-t border-slate-200 grid grid-cols-4 text-center select-none">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-black cursor-pointer ${
              activeTab === 'home' ? 'text-red-600' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>{txt.bNavHome}</span>
          </button>

          {canApproveHabePurchases ? (
            <button
              type="button"
              onClick={() => setActiveTab('admin_payroll')}
              className={`min-h-[44px] relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-black cursor-pointer ${
                activeTab === 'admin_payroll' ? 'text-red-600' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Bell className="w-5 h-5" />
              {pendingAdminOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1 ms-5" />
              )}
              <span>{txt.bNavAlerts}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCheckoutStep('cart');
                setActiveTab('orders');
              }}
              className={`min-h-[44px] relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-black cursor-pointer ${
                activeTab === 'orders' ? 'text-red-600' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1 ms-5" />
              )}
              <span>{txt.tileOrders}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-black cursor-pointer ${
              activeTab === 'poster' || activeTab === 'install'
                ? 'text-red-600'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>{txt.bNavScan}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-black cursor-pointer ${
              activeTab === 'account' ? 'text-red-600' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>{txt.bNavSettings}</span>
          </button>
        </div>
      </div>

      {/* EMPLOYEE PERSONAL QR BADGE MODAL */}
      {selectedQrEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-950 rounded-3xl border-2 border-slate-950 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <span className="text-xs font-black">
                بطاقة وكود QR الموظف — {selectedQrEmployee.code}
              </span>
              <button
                type="button"
                onClick={() => setSelectedQrEmployee(null)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-red-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={empBadgePrintRef} dir="rtl" className="p-6 text-center space-y-3 bg-white">
              <div className="flex justify-center">
                <HabeAwningLogo size="sm" showDots={false} />
              </div>
              <div>
                <div className="text-base font-black text-slate-950">{selectedQrEmployee.nameEn}</div>
                {selectedQrEmployee.nameAr !== selectedQrEmployee.nameEn && (
                  <div className="text-xs font-bold text-slate-700">{selectedQrEmployee.nameAr}</div>
                )}
                <div className="text-xs font-bold text-red-600 mt-1">
                  {selectedQrEmployee.department} · {selectedQrEmployee.jobTitle}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5" dir="ltr">
                  {selectedQrEmployee.code} · {selectedQrEmployee.compNumber}
                </div>
              </div>

              <div className="flex justify-center py-2">
                <RealQrCode
                  value={`${originUrl}/habe?emp=${selectedQrEmployee.code}`}
                  size={170}
                  darkColor="#0f172a"
                  alt={`QR ${selectedQrEmployee.code}`}
                  downloadFilename={`habe-employee-${selectedQrEmployee.code}.png`}
                  downloadLabel="تحميل QR الموظف PNG"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  empBadgePrintRef.current && triggerCleanA4Print([empBadgePrintRef.current])
                }
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer print:hidden"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة كارت QR الموظف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
