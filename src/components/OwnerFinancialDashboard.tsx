import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Fingerprint,
  Coins,
  Landmark,
  Wallet,
  Vault,
  ArrowDownCircle,
  ArrowUpCircle,
  FilePenLine,
  ReceiptText,
  PieChart as PieChartIcon,
  BrainCircuit,
  Lightbulb,
  Download,
  History,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Sparkles,
  Calendar,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Anchor,
  ShoppingBag,
  Percent,
  Siren,
  Users,
  UserPlus,
  UserX,
  UserCheck,
  Trash2,
  Archive,
  Bell,
  Camera,
  Eye,
  ScanFace,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { Phase1RfqSubmission } from './Phase1ServicesHub';
import type { B2BTrackedOrder } from '../data/freshWorldData';
import type { CommercialOrderDoc, VipDirectOrderDoc } from '../types/faydEcosystem';
import {
  OwnerFinanceStatus,
  OwnerFinanceDashboardPayload,
  OwnerFinanceChannel,
  OwnerExpenseCategory,
  OwnerAiInvestorAnalysis,
  FinancialUrgencyLevel,
  TotalFundsAuthMethod,
  EmergencyScanReport,
  fetchOwnerFinanceStatus,
  fetchOwnerFinanceDashboard,
  setupOwnerSecurityPassphrase,
  verifyOwnerSecurityPassphrase,
  isWebAuthnSupported,
  enrollOwnerBiometricWebAuthn,
  unlockOwnerBiometricWebAuthn,
  runOwnerWebAuthnAssertion,
  adjustOwnerAccountBalance,
  createOwnerFinanceEntry,
  createOwnerReceivable,
  collectOwnerReceivable,
  createOwnerPayable,
  payOwnerPayable,
  runOwnerAiSmartInvestor,
  recordOwnerPdfExportAudit,
  setTotalFundsAuthPolicy,
  unlockTotalAvailableFunds,
  lockTotalAvailableFunds,
  unlockLockedTreasury,
  withdrawFromLockedTreasury,
  runOwnerEmergencyScan,
  createOrUpdateFinanceManager,
  updateFinanceManagerStatus,
  deleteFinanceManagerPreserveArchive,
  runOwnerAiManagerAudit,
  markOwnerAuditAlertRead,
} from '../services/ownerFinanceService';
import { SmartVoiceMicButton } from './SmartVoiceMicButton';
import { OwnerBolFinancialGrid } from './OwnerBolFinancialGrid';
import { PurchasesInventoryModule } from './PurchasesInventoryModule';

interface OwnerFinancialDashboardProps {
  isRtl?: boolean;
  isStrictAppOwner: boolean;
  ownerEmail: string;
  rfqSubmissions?: Phase1RfqSubmission[];
  trackedB2bOrders?: B2BTrackedOrder[];
  allOrders?: CommercialOrderDoc[];
  allVipOrders?: VipDirectOrderDoc[];
  onBackHome: () => void;
  onShowToast: (msg: string) => void;
}

type OwnerFinanceTab =
  | 'overview'
  | 'bol_ledger'
  | 'purchases'
  | 'commissions'
  | 'locked_treasury'
  | 'emergencies'
  | 'managers'
  | 'inflows'
  | 'outflows'
  | 'receivables'
  | 'payables'
  | 'analytics_ai'
  | 'audit';

type PdfPeriod = 'day' | 'week' | 'month';

const EXPENSE_CATEGORIES: { id: Exclude<OwnerExpenseCategory, 'none'>; labelAr: string; color: string }[] = [
  { id: 'salaries', labelAr: 'رواتب', color: '#D4AF37' },
  { id: 'raw_materials', labelAr: 'مواد خام', color: '#38BDF8' },
  { id: 'marketing', labelAr: 'تسويق', color: '#A78BFA' },
  { id: 'commissions', labelAr: 'عمولات', color: '#F59E0B' },
  { id: 'logistics', labelAr: 'لوجستيات', color: '#34D399' },
  { id: 'other', labelAr: 'أخرى', color: '#94A3B8' },
];

const CHANNELS: { id: OwnerFinanceChannel; labelAr: string }[] = [
  { id: 'bank', labelAr: 'البنوك' },
  { id: 'e_wallet', labelAr: 'المحفظة الإلكترونية' },
  { id: 'treasury', labelAr: 'الخزينة' },
];

function fmtEgp(val: number): string {
  return Number(val || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getExpenseCategoryLabel(cat: OwnerExpenseCategory): string {
  const found = EXPENSE_CATEGORIES.find((c) => c.id === cat);
  return found ? found.labelAr : 'أخرى';
}

function getChannelLabel(ch: OwnerFinanceChannel): string {
  const found = CHANNELS.find((c) => c.id === ch);
  return found ? found.labelAr : ch;
}

export const OwnerFinancialDashboard: React.FC<OwnerFinancialDashboardProps> = ({
  isRtl = true,
  isStrictAppOwner,
  ownerEmail,
  rfqSubmissions = [],
  trackedB2bOrders = [],
  allOrders = [],
  allVipOrders = [],
  onBackHome,
  onShowToast,
}) => {
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [status, setStatus] = useState<OwnerFinanceStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<OwnerFinanceDashboardPayload | null>(null);
  const [dashLoading, setDashLoading] = useState(false);

  // 2FA & Biometric Lock Screen State
  const [pinInput, setPinInput] = useState('');
  const [pinConfirmInput, setPinConfirmInput] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<OwnerFinanceTab>('overview');

  // Modals / Forms
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjChannel, setAdjChannel] = useState<OwnerFinanceChannel>('bank');
  const [adjMode, setAdjMode] = useState<'set' | 'deposit' | 'withdraw'>('deposit');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');

  // Inflow Form
  const [showInflowForm, setShowInflowForm] = useState(false);
  const [inSource, setInSource] = useState('');
  const [inPurpose, setInPurpose] = useState('');
  const [inOriginLabel, setInOriginLabel] = useState('');
  const [inUrgency, setInUrgency] = useState<FinancialUrgencyLevel>('normal');
  const [inGross, setInGross] = useState('');
  const [inCommPct, setInCommPct] = useState('0');
  const [inChannel, setInChannel] = useState<OwnerFinanceChannel>('bank');
  const [inDate, setInDate] = useState(new Date().toISOString().slice(0, 10));

  // Outflow Form
  const [showOutflowForm, setShowOutflowForm] = useState(false);
  const [outBeneficiary, setOutBeneficiary] = useState('');
  const [outPurpose, setOutPurpose] = useState('');
  const [outOriginLabel, setOutOriginLabel] = useState('');
  const [outUrgency, setOutUrgency] = useState<FinancialUrgencyLevel>('normal');
  const [outCategory, setOutCategory] = useState<Exclude<OwnerExpenseCategory, 'none'>>('raw_materials');
  const [outChannel, setOutChannel] = useState<OwnerFinanceChannel>('treasury');
  const [outAmount, setOutAmount] = useState('');
  const [outDate, setOutDate] = useState(new Date().toISOString().slice(0, 10));

  // Receivable Form
  const [showRcvForm, setShowRcvForm] = useState(false);
  const [rcvClient, setRcvClient] = useState('');
  const [rcvPurpose, setRcvPurpose] = useState('');
  const [rcvAmount, setRcvAmount] = useState('');
  const [rcvDueDate, setRcvDueDate] = useState(new Date().toISOString().slice(0, 10));

  // Payable Form
  const [showPayForm, setShowPayForm] = useState(false);
  const [paySupplier, setPaySupplier] = useState('');
  const [payPurpose, setPayPurpose] = useState('');
  const [payScope, setPayScope] = useState<'external_supplier' | 'internal_platform'>('external_supplier');
  const [payUrgency, setPayUrgency] = useState<FinancialUrgencyLevel>('normal');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));

  // Total Available Funds Multi-Modal Security Gate
  const [totalFundsModalOpen, setTotalFundsModalOpen] = useState(false);
  const [totalFundsPinInput, setTotalFundsPinInput] = useState('');
  const [totalFundsBusy, setTotalFundsBusy] = useState(false);
  const [totalFundsError, setTotalFundsError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Locked Treasury (10% Profit Deduction)
  const [ltPinInput, setLtPinInput] = useState('');
  const [ltBusy, setLtBusy] = useState(false);
  const [ltWithdrawAmount, setLtWithdrawAmount] = useState('');
  const [ltWithdrawChannel, setLtWithdrawChannel] = useState<OwnerFinanceChannel>('bank');
  const [ltWithdrawReason, setLtWithdrawReason] = useState('');

  // Emergencies Scan
  const [emergencyScan, setEmergencyScan] = useState<EmergencyScanReport | null>(null);
  const [emergencyBusy, setEmergencyBusy] = useState(false);

  // Finance Managers Governance & 45-Day AI Audit
  const [mgrSlot, setMgrSlot] = useState<1 | 2>(1);
  const [mgrUsername, setMgrUsername] = useState('');
  const [mgrFullName, setMgrFullName] = useState('');
  const [mgrPassword, setMgrPassword] = useState('');
  const [mgrBusy, setMgrBusy] = useState(false);
  const [mgrViewSubTab, setMgrViewSubTab] = useState<'managers' | 'sub_treasury' | 'archive' | 'reports'>('managers');

  // AI Smart Investor State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<OwnerAiInvestorAnalysis | null>(null);
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string | null>(null);

  // Floating PDF Export Extractor State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfPeriod, setPdfPeriod] = useState<PdfPeriod>('month');
  const [isPrintingStatement, setIsPrintingStatement] = useState(false);

  const [actionBusy, setActionBusy] = useState(false);

  const stopTotalFundsCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopTotalFundsCamera();
    };
  }, [stopTotalFundsCamera]);

  const loadDashboardData = useCallback(async () => {
    setDashLoading(true);
    try {
      const payload = await fetchOwnerFinanceDashboard();
      setDashboard(payload);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل بيانات الإدارة المالية.';
      onShowToast(msg);
    } finally {
      setDashLoading(false);
    }
  }, [onShowToast]);

  const loadGateStatus = useCallback(async () => {
    if (!isStrictAppOwner) {
      setStatusLoading(false);
      return;
    }
    setStatusLoading(true);
    setStatusError(null);
    try {
      const st = await fetchOwnerFinanceStatus();
      setStatus(st);
      if (st.owner2faVerified) {
        await loadDashboardData();
      }
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'تعذر التحقق من جلسة المالك.');
    } finally {
      setStatusLoading(false);
    }
  }, [isStrictAppOwner, loadDashboardData]);

  useEffect(() => {
    void loadGateStatus();
  }, [loadGateStatus]);

  // Strict RBAC Isolation Guard — never render data to non-owners
  if (!isStrictAppOwner) {
    return (
      <div className="w-full max-w-[430px] mx-auto min-h-[60vh] rounded-3xl bg-[#0B132B] border border-[#D4AF37]/30 p-5 flex flex-col items-center justify-center text-center space-y-4 text-white shadow-2xl overflow-x-hidden">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400/50 flex items-center justify-center text-rose-300">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-[#F5D061]">
          {isRtl ? 'المنصة المالية الخاصة بالمالك — وصول محظور' : 'App Owner Financial Vault — Restricted'}
        </h2>
        <p className="text-xs text-slate-300">
          {isRtl
            ? 'هذه المنصة سرية للغاية ومقصورة حصرياً على مالك التطبيق الموثق فقط، ومحجوبة عن كافة الأدوار الأخرى.'
            : 'Strictly isolated for the verified Application Owner only.'}
        </p>
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-[44px] px-6 rounded-full bg-[#D4AF37] text-[#0B132B] font-black text-xs cursor-pointer"
        >
          {isRtl ? 'العودة للرئيسية' : 'Back Home'}
        </button>
      </div>
    );
  }

  const handlePassphraseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!status) return;

    setAuthBusy(true);
    try {
      if (!status.configuredPin) {
        if (pinInput.trim().length < 8) {
          throw new Error('يجب أن يتكون رمز الأمان الثنائي للمالك من 8 أحرف/أرقام على الأقل.');
        }
        if (pinInput.trim() !== pinConfirmInput.trim()) {
          throw new Error('تأكيد رمز الأمان غير متطابق.');
        }
        await setupOwnerSecurityPassphrase(pinInput.trim());
        onShowToast('تم تأسيس رمز المصادقة الثنائية للمالك وفتح الخزينة بنجاح.');
      } else {
        if (!pinInput.trim()) {
          throw new Error('يرجى إدخال رمز المصادقة الثنائية للمالك.');
        }
        await verifyOwnerSecurityPassphrase(pinInput.trim());
        onShowToast('تم التحقق من الهوية الثنائية — مرحباً بك في المنصة المالية الخاصة بالمالك.');
      }
      setPinInput('');
      setPinConfirmInput('');
      await loadGateStatus();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'فشل التحقق الثنائي.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleBiometricAction = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (status && status.webauthnRegisteredCount > 0) {
        await unlockOwnerBiometricWebAuthn();
        onShowToast('تم فتح المنصة المالية ببصمة الوجه/الإصبع بنجاح.');
      } else {
        await enrollOwnerBiometricWebAuthn();
        onShowToast('تم ربط بصمة الوجه/الإصبع بجهازك وفتح المنصة المالية للمالك.');
      }
      await loadGateStatus();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'تعذر إتمام المصادقة البيومترية.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(adjAmount);
    if (!Number.isFinite(num) || num < 0) {
      onShowToast('يرجى إدخال مبلغ صحيح.');
      return;
    }
    setActionBusy(true);
    try {
      const next = await adjustOwnerAccountBalance({
        channel: adjChannel,
        mode: adjMode,
        amountEGP: num,
        reason: adjReason.trim(),
      });
      setDashboard(next);
      setAdjustModalOpen(false);
      setAdjAmount('');
      setAdjReason('');
      onShowToast('تم تحديث رصيد الحساب وتسجيله في سجل التدقيق.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تعديل الرصيد.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCreateInflow = async (e: React.FormEvent) => {
    e.preventDefault();
    const gross = Number(inGross);
    const commPct = Number(inCommPct || 0);
    if (!inSource.trim() || !inPurpose.trim() || !Number.isFinite(gross) || gross <= 0) {
      onShowToast('يرجى استكمال بيانات المصدر والغرض والمبلغ.');
      return;
    }
    setActionBusy(true);
    try {
      const next = await createOwnerFinanceEntry({
        direction: 'inflow',
        sourceOrBeneficiary: inSource.trim(),
        purpose: inPurpose.trim(),
        originLabel: inOriginLabel.trim() || inPurpose.trim(),
        urgency: inUrgency,
        channel: inChannel,
        grossEGP: gross,
        commissionPct: commPct,
        entryDate: inDate,
      });
      setDashboard(next);
      setShowInflowForm(false);
      setInSource('');
      setInPurpose('');
      setInOriginLabel('');
      setInUrgency('normal');
      setInGross('');
      setInCommPct('0');
      onShowToast('تم قيد المتحصلات واستقطاع 10% للخزينة المقفولة وتحديث الرصيد.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل المتحصل.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCreateOutflow = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(outAmount);
    if (!outBeneficiary.trim() || !outPurpose.trim() || !Number.isFinite(amt) || amt <= 0) {
      onShowToast('يرجى استكمال بيانات المستفيد والغرض والمبلغ.');
      return;
    }
    setActionBusy(true);
    try {
      const next = await createOwnerFinanceEntry({
        direction: 'outflow',
        sourceOrBeneficiary: outBeneficiary.trim(),
        purpose: outPurpose.trim(),
        originLabel: outOriginLabel.trim() || outPurpose.trim(),
        urgency: outUrgency,
        expenseCategory: outCategory,
        channel: outChannel,
        grossEGP: amt,
        entryDate: outDate,
      });
      setDashboard(next);
      setShowOutflowForm(false);
      setOutBeneficiary('');
      setOutPurpose('');
      setOutOriginLabel('');
      setOutUrgency('normal');
      setOutAmount('');
      onShowToast('تم قيد المصروف الخارج وتحديث التحليلات والرصيد.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل المصروف.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCreateReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(rcvAmount);
    if (!rcvClient.trim() || !rcvPurpose.trim() || !Number.isFinite(amt) || amt <= 0) {
      onShowToast('يرجى إدخال بيانات العميل والمبلغ وتاريخ الاستحقاق.');
      return;
    }
    setActionBusy(true);
    try {
      const next = await createOwnerReceivable({
        clientName: rcvClient.trim(),
        purpose: rcvPurpose.trim(),
        totalAmountEGP: amt,
        dueDate: rcvDueDate,
      });
      setDashboard(next);
      setShowRcvForm(false);
      setRcvClient('');
      setRcvPurpose('');
      setRcvAmount('');
      onShowToast('تمت إضافة مديونية العميل (لينا بره) بنجاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر إضافة المديونية.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCollectReceivable = async (id: string, remaining: number) => {
    setActionBusy(true);
    try {
      const next = await collectOwnerReceivable(id, { amountEGP: remaining, channel: 'bank' });
      setDashboard(next);
      onShowToast('تم تحصيل مديونية العميل وترحيلها لصافي الأرصدة والمتحصلات.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تحصيل المديونية.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCreatePayable = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!paySupplier.trim() || !payPurpose.trim() || !Number.isFinite(amt) || amt <= 0) {
      onShowToast('يرجى إدخال بيانات المورد والمبلغ وتاريخ السداد.');
      return;
    }
    setActionBusy(true);
    try {
      const next = await createOwnerPayable({
        supplierName: paySupplier.trim(),
        purpose: payPurpose.trim(),
        supplierScope: payScope,
        urgency: payUrgency,
        totalAmountEGP: amt,
        scheduledPaymentDate: payDate,
      });
      setDashboard(next);
      setShowPayForm(false);
      setPaySupplier('');
      setPayPurpose('');
      setPayScope('external_supplier');
      setPayUrgency('normal');
      setPayAmount('');
      onShowToast('تمت جدولة مستحقات المورد (علينا بره) بنجاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر إضافة الالتزام.');
    } finally {
      setActionBusy(false);
    }
  };

  const handlePayPayable = async (id: string, remaining: number) => {
    setActionBusy(true);
    try {
      const next = await payOwnerPayable(id, { amountEGP: remaining, channel: 'bank' });
      setDashboard(next);
      onShowToast('تم سداد دفعة المورد وخصمها من الأرصدة وتسجيلها بالمصروفات.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر سداد الدفعة.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleSwitchTotalFundsPolicy = async (method: TotalFundsAuthMethod) => {
    setTotalFundsBusy(true);
    setTotalFundsError(null);
    stopTotalFundsCamera();
    try {
      const next = await setTotalFundsAuthPolicy(method);
      setDashboard(next);
      onShowToast('تم تحديث وسيلة أمان شاشة إجمالي المال المتاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تحديث وسيلة الأمان.');
    } finally {
      setTotalFundsBusy(false);
    }
  };

  const handleUnlockTotalFundsBiometric = async () => {
    if (!dashboard) return;
    setTotalFundsBusy(true);
    setTotalFundsError(null);
    try {
      const proof = await runOwnerWebAuthnAssertion();
      const next = await unlockTotalAvailableFunds({
        method: dashboard.totalFundsGate.authMethod,
        credentialId: proof.credentialId,
        clientDataJSON: proof.clientDataJSON,
      });
      setDashboard(next);
      setTotalFundsModalOpen(false);
      onShowToast('تم التحقق الحيوي وفتح إجمالي المال المتاح.');
    } catch (err) {
      setTotalFundsError(err instanceof Error ? err.message : 'تعذر التحقق الحيوي.');
    } finally {
      setTotalFundsBusy(false);
    }
  };

  const handleUnlockTotalFundsPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboard || !totalFundsPinInput.trim()) return;
    setTotalFundsBusy(true);
    setTotalFundsError(null);
    try {
      const next = await unlockTotalAvailableFunds({
        method: dashboard.totalFundsGate.authMethod,
        pin: totalFundsPinInput.trim(),
      });
      setDashboard(next);
      setTotalFundsPinInput('');
      setTotalFundsModalOpen(false);
      onShowToast('تم فتح شاشة إجمالي المال المتاح بنجاح.');
    } catch (err) {
      setTotalFundsError(err instanceof Error ? err.message : 'رمز الأمان غير صحيح.');
    } finally {
      setTotalFundsBusy(false);
    }
  };

  const startTotalFundsCamera = async () => {
    setTotalFundsError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setTotalFundsError('المتصفح لا يدعم تشغيل الكاميرا المباشرة.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setCameraActive(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      }, 60);
    } catch {
      setTotalFundsError('تم رفض صلاحية الكاميرا أو الكاميرا غير متاحة.');
    }
  };

  const captureAndUnlockTotalFundsCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const snapshot = canvas.toDataURL('image/jpeg', 0.8);
    setTotalFundsBusy(true);
    setTotalFundsError(null);
    try {
      const next = await unlockTotalAvailableFunds({
        method: 'camera_face',
        cameraSnapshotBase64: snapshot,
      });
      stopTotalFundsCamera();
      setDashboard(next);
      setTotalFundsModalOpen(false);
      onShowToast('تم التحقق بالكاميرا الحية وفتح إجمالي المال المتاح.');
    } catch (err) {
      setTotalFundsError(err instanceof Error ? err.message : 'فشل التحقق بالكاميرا الحية.');
    } finally {
      setTotalFundsBusy(false);
    }
  };

  const handleLockTotalFunds = async () => {
    try {
      const next = await lockTotalAvailableFunds();
      setDashboard(next);
      onShowToast('تم قفل شاشة إجمالي المال المتاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر القفل.');
    }
  };

  const handleUnlockLockedTreasuryBiometric = async () => {
    setLtBusy(true);
    try {
      const proof = await runOwnerWebAuthnAssertion();
      const next = await unlockLockedTreasury(proof);
      setDashboard(next);
      onShowToast('تم فتح الخزينة المقفولة ببصمة المالك.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر التحقق بالبصمة.');
    } finally {
      setLtBusy(false);
    }
  };

  const handleUnlockLockedTreasuryPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ltPinInput.trim()) return;
    setLtBusy(true);
    try {
      const next = await unlockLockedTreasury({ pin: ltPinInput.trim() });
      setDashboard(next);
      setLtPinInput('');
      onShowToast('تم فتح الخزينة المقفولة (10%) بنجاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'رمز المالك غير صحيح.');
    } finally {
      setLtBusy(false);
    }
  };

  const handleWithdrawLockedTreasury = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(ltWithdrawAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      onShowToast('أدخل مبلغ سحب صحيح من الخزينة المقفولة.');
      return;
    }
    setLtBusy(true);
    try {
      const next = await withdrawFromLockedTreasury({
        amountEGP: amt,
        targetChannel: ltWithdrawChannel,
        reason: ltWithdrawReason.trim() || 'تحويل مالك معتمد',
      });
      setDashboard(next);
      setLtWithdrawAmount('');
      setLtWithdrawReason('');
      onShowToast('تم السحب من الخزينة المقفولة وترحيله للحساب المختار.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر السحب من الخزينة المقفولة.');
    } finally {
      setLtBusy(false);
    }
  };

  const handleRunEmergencyScan = async () => {
    setEmergencyBusy(true);
    try {
      const scan = await runOwnerEmergencyScan();
      setEmergencyScan(scan);
      onShowToast('تم فحص الحالات العاجلة والطوارئ ومقارنتها بالسيولة.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تشغيل فحص الطوارئ.');
    } finally {
      setEmergencyBusy(false);
    }
  };

  const handleSaveFinanceManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mgrUsername.trim() || !mgrFullName.trim() || mgrPassword.trim().length < 6) {
      onShowToast('أدخل اسم المستخدم، الاسم الكامل، وكلمة مرور 6 أحرف فأكثر.');
      return;
    }
    setMgrBusy(true);
    try {
      const next = await createOrUpdateFinanceManager({
        slotNumber: mgrSlot,
        username: mgrUsername.trim(),
        fullName: mgrFullName.trim(),
        password: mgrPassword.trim(),
      });
      setDashboard(next);
      setMgrUsername('');
      setMgrFullName('');
      setMgrPassword('');
      onShowToast(`تم حفظ/تعيين المدير المالي رقم ${mgrSlot} بنجاح.`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تعيين المدير المالي.');
    } finally {
      setMgrBusy(false);
    }
  };

  const handleToggleManagerStatus = async (managerId: string, nextStatus: 'active' | 'suspended') => {
    setMgrBusy(true);
    try {
      const next = await updateFinanceManagerStatus(managerId, nextStatus);
      setDashboard(next);
      onShowToast(nextStatus === 'suspended' ? 'تم إيقاف حساب المدير مؤقتاً.' : 'تم تفعيل حساب المدير بنجاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تحديث حالة المدير.');
    } finally {
      setMgrBusy(false);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    setMgrBusy(true);
    try {
      const next = await deleteFinanceManagerPreserveArchive(managerId);
      setDashboard(next);
      onShowToast(
        `تم حذف المدير المالي مع حفظ كافة تسجيلاته (${next.archivedCount ?? 0} سجل) في الأرشيف العام.`
      );
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر حذف المدير.');
    } finally {
      setMgrBusy(false);
    }
  };

  const handleRunAiManagerAudit = async () => {
    setMgrBusy(true);
    try {
      const next = await runOwnerAiManagerAudit();
      setDashboard(next);
      onShowToast('تم تنفيذ المراجعة الذكية لحركات المديرين وإصدار التقرير.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تشغيل المراجعة الذكية.');
    } finally {
      setMgrBusy(false);
    }
  };

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      const next = await markOwnerAuditAlertRead(alertId);
      setDashboard(next);
    } catch {
      // non-fatal
    }
  };

  const handleRunSmartInvestor = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await runOwnerAiSmartInvestor();
      setAiAnalysis(res.analysis);
      setAiGeneratedAt(res.generatedAt);
      await loadDashboardData();
      onShowToast('تم تحليل السيولة والتدفقات النقدية عبر المستثمر الذكي بنجاح.');
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'تعذر تشغيل المستثمر الذكي في الوقت الحالي.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const inflows = useMemo(
    () => (dashboard?.entries || []).filter((e) => e.direction === 'inflow'),
    [dashboard]
  );
  const outflows = useMemo(
    () => (dashboard?.entries || []).filter((e) => e.direction === 'outflow'),
    [dashboard]
  );

  // Real-time KPI & Recharts datasets (Monthly Catering Volume, Pending RFQs, Net Revenue Trends)
  const kpiOverview = useMemo(() => {
    const entries = dashboard?.entries || [];
    const now = new Date();
    const monthBuckets: {
      key: string;
      label: string;
      cateringVolumeEGP: number;
      ordersCount: number;
      inflowsNet: number;
      outflowsTotal: number;
      netRevenue: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      monthBuckets.push({
        key,
        label: `${mm}/${String(yyyy).slice(-2)}`,
        cateringVolumeEGP: 0,
        ordersCount: 0,
        inflowsNet: 0,
        outflowsTotal: 0,
        netRevenue: 0,
      });
    }

    const findOrFirstBucket = (dateStr?: string) => {
      const monthPrefix = (dateStr || '').slice(0, 7);
      return (
        monthBuckets.find((b) => b.key === monthPrefix) ||
        monthBuckets[monthBuckets.length - 1]
      );
    };

    entries.forEach((entry) => {
      const bucket = findOrFirstBucket(entry.entryDate);
      if (entry.direction === 'inflow') {
        bucket.inflowsNet += entry.netEGP;
        bucket.cateringVolumeEGP += entry.grossEGP;
        bucket.ordersCount += 1;
      } else {
        bucket.outflowsTotal += entry.netEGP;
      }
    });

    trackedB2bOrders.forEach((order) => {
      const bucket = findOrFirstBucket(order.createdAt);
      bucket.cateringVolumeEGP += order.totalEgp || 0;
      bucket.ordersCount += 1;
    });

    allOrders.forEach((order) => {
      const createdIso = order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : '';
      const bucket = findOrFirstBucket(createdIso);
      bucket.cateringVolumeEGP += order.subtotalEGP || 0;
      bucket.ordersCount += 1;
    });

    allVipOrders.forEach((order) => {
      const createdIso = order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : '';
      const bucket = findOrFirstBucket(createdIso);
      bucket.cateringVolumeEGP += order.totalEGP || 0;
      bucket.ordersCount += 1;
    });

    monthBuckets.forEach((b) => {
      b.netRevenue = Math.round((b.inflowsNet - b.outflowsTotal) * 100) / 100;
      b.inflowsNet = Math.round(b.inflowsNet * 100) / 100;
      b.outflowsTotal = Math.round(b.outflowsTotal * 100) / 100;
      b.cateringVolumeEGP = Math.round(b.cateringVolumeEGP * 100) / 100;
    });

    // Pending RFQ & VIP Order Status breakdown
    const statusCounts: Record<'جديد' | 'قيد المراجعة' | 'بانتظار اعتماد السعر' | 'تم الاعتماد', number> = {
      'جديد': 0,
      'قيد المراجعة': 0,
      'بانتظار اعتماد السعر': 0,
      'تم الاعتماد': 0,
    };

    rfqSubmissions.forEach((rfq) => {
      if (rfq.status in statusCounts) {
        statusCounts[rfq.status] += 1;
      } else {
        statusCounts['جديد'] += 1;
      }
    });

    allVipOrders.forEach((v) => {
      if (v.status === 'pending_owner') statusCounts['جديد'] += 1;
      else if (v.status === 'preparing') statusCounts['قيد المراجعة'] += 1;
      else if (v.status === 'approved' || v.status === 'completed') statusCounts['تم الاعتماد'] += 1;
    });

    const rfqStatusSeries = [
      { key: 'جديد', name: isRtl ? 'جديد' : 'New', value: statusCounts['جديد'], color: '#F5D061' },
      { key: 'قيد المراجعة', name: isRtl ? 'قيد المراجعة' : 'In Review', value: statusCounts['قيد المراجعة'], color: '#38BDF8' },
      { key: 'بانتظار اعتماد السعر', name: isRtl ? 'بانتظار التسعير' : 'Awaiting Price', value: statusCounts['بانتظار اعتماد السعر'], color: '#F97316' },
      { key: 'تم الاعتماد', name: isRtl ? 'تم الاعتماد' : 'Approved', value: statusCounts['تم الاعتماد'], color: '#34D399' },
    ].filter((s) => s.value > 0);

    const pendingRfqCount =
      statusCounts['جديد'] + statusCounts['قيد المراجعة'] + statusCounts['بانتظار اعتماد السعر'];
    const totalRfqCount = pendingRfqCount + statusCounts['تم الاعتماد'];

    const currentMonthBucket = monthBuckets[monthBuckets.length - 1];
    const totalInflows = dashboard?.totals.totalInflowsNet || 0;
    const totalOutflows = dashboard?.totals.totalOutflows || 0;
    const netRevenueTotal = totalInflows - totalOutflows;
    const marginPct =
      totalInflows > 0 ? Math.round(((totalInflows - totalOutflows) / totalInflows) * 100) : 0;

    return {
      monthBuckets,
      rfqStatusSeries,
      pendingRfqCount,
      totalRfqCount,
      currentMonthVolumeEGP: currentMonthBucket?.cateringVolumeEGP || 0,
      currentMonthOrders: currentMonthBucket?.ordersCount || 0,
      netRevenueTotal,
      marginPct,
    };
  }, [dashboard, rfqSubmissions, trackedB2bOrders, allOrders, allVipOrders, isRtl]);

  // Period filtering for A4 PDF Report
  const periodFilteredReport = useMemo(() => {
    if (!dashboard) return null;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const cutoffDate = new Date(now);
    if (pdfPeriod === 'day') {
      cutoffDate.setDate(now.getDate());
    } else if (pdfPeriod === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setDate(now.getDate() - 30);
    }
    const cutoffStr = pdfPeriod === 'day' ? todayStr : cutoffDate.toISOString().slice(0, 10);

    const periodEntries = dashboard.entries.filter((e) => e.entryDate >= cutoffStr);
    const pInflows = periodEntries.filter((e) => e.direction === 'inflow');
    const pOutflows = periodEntries.filter((e) => e.direction === 'outflow');

    return {
      periodLabelAr:
        pdfPeriod === 'day'
          ? `تقرير اليوم (${todayStr})`
          : pdfPeriod === 'week'
            ? `تقرير الأسبوع (من ${cutoffStr} إلى ${todayStr})`
            : `التقرير الشهري (من ${cutoffStr} إلى ${todayStr})`,
      pInflows,
      pOutflows,
      inflowsGross: pInflows.reduce((s, e) => s + e.grossEGP, 0),
      inflowsCommissions: pInflows.reduce((s, e) => s + e.commissionEGP, 0),
      inflowsNet: pInflows.reduce((s, e) => s + e.netEGP, 0),
      outflowsTotal: pOutflows.reduce((s, e) => s + e.netEGP, 0),
    };
  }, [dashboard, pdfPeriod]);

  const handleTriggerPdfPrint = async () => {
    if (!dashboard) return;
    setPdfModalOpen(false);
    setIsPrintingStatement(true);
    await recordOwnerPdfExportAudit(pdfPeriod);
    void loadDashboardData();

    document.body.classList.add('ce-printing-portal');
    const cleanup = () => {
      document.body.classList.remove('ce-printing-portal');
      setIsPrintingStatement(false);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.setTimeout(() => {
      window.print();
    }, 180);
  };

  // Loading Gate
  if (statusLoading) {
    return (
      <div className="w-full max-w-[430px] mx-auto min-h-[60vh] rounded-3xl bg-[#0B132B] border border-[#D4AF37]/30 p-6 flex flex-col items-center justify-center text-white space-y-3 overflow-x-hidden">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5D061]" />
        <p className="text-sm font-bold text-slate-300 text-center">جاري فحص بوابة الحماية الخاصة بالمالك...</p>
      </div>
    );
  }

  // 2FA / Biometric Gate Screen
  if (!status?.owner2faVerified) {
    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="w-full max-w-[430px] mx-auto rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#111C3A] to-[#161F33] border border-[#D4AF37]/40 p-4 text-white shadow-2xl space-y-5 overflow-x-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[40px] px-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-[#D4AF37]/30 text-xs font-black text-[#F5D061] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <BackIcon className="w-4 h-4" />
            <span>{isRtl ? 'الرجوع للرئيسية' : 'Back Home'}</span>
          </button>
          <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[10px] font-mono text-[#F5D061] truncate max-w-full" dir="ltr">
            {ownerEmail}
          </span>
        </div>

        <div className="w-full py-2 text-center space-y-4">
          {/* Circular Gold Lock Icon */}
          <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-br from-[#D4AF37]/25 to-[#D4AF37]/5 border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_40px_-8px_rgba(212,175,55,0.55)]">
            <Lock className="w-7 h-7 text-[#F5D061]" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-emerald-300 text-[11px] font-black">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>دخول آمن مشفر · 2FA & Biometric Vault</span>
            </div>
            <h1 className="text-xl font-black text-[#F5D061] tracking-tight">
              المنصة المالية الخاصة بالمالك
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              تتطلب هذه الخزينة التنفيذية إتمام المصادقة الثنائية (رمز الخزينة الخاص أو بصمة الوجه/الإصبع) قبل كشف الأرصدة أو التدفقات النقدية.
            </p>
          </div>

          {(statusError || authError) && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-xs font-bold text-rose-200 flex items-center gap-2 text-start">
              <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
              <span className="break-words">{authError || statusError}</span>
            </div>
          )}

          {/* Biometric / Face ID WebAuthn Button */}
          {isWebAuthnSupported() && (
            <button
              type="button"
              disabled={authBusy}
              onClick={handleBiometricAction}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#D4AF37] text-[#0B132B] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/25 cursor-pointer hover:brightness-105 disabled:opacity-60 transition-all"
            >
              {authBusy ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Fingerprint className="w-4 h-4 shrink-0" />
              )}
              <span>
                {status?.webauthnRegisteredCount
                  ? 'الدخول السريع ببصمة الوجه / الإصبع'
                  : 'تفعيل وفتح الخزينة ببصمة الوجه / الإصبع'}
              </span>
            </button>
          )}

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex-1 h-px bg-white/10" />
            <span>أو عبر رمز الأمان الثنائي للمالك</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Server-Verified Salted Scrypt Passphrase Form */}
          <form onSubmit={handlePassphraseSubmit} className="space-y-3 text-start bg-[#161F33] p-4 rounded-2xl border border-white/10">
            <label className="block text-xs font-black text-[#F5D061]">
              {status?.configuredPin
                ? 'أدخل رمز الأمان الثنائي للمالك:'
                : 'إعداد رمز أمان ثنائي جديد للخزينة (8 أحرف/أرقام فأكثر):'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#D4AF37] absolute top-1/2 -translate-y-1/2 start-3.5" />
              <input
                type="password"
                required
                minLength={status?.configuredPin ? 1 : 8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[44px] ps-10 pe-4 rounded-xl bg-[#0B132B] border border-[#D4AF37]/30 text-white text-sm font-mono focus:outline-none focus:border-[#F5D061]"
              />
            </div>

            {!status?.configuredPin && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  تأكيد رمز الأمان الثنائي:
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={pinConfirmInput}
                  onChange={(e) => setPinConfirmInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[44px] px-4 rounded-xl bg-[#0B132B] border border-[#D4AF37]/30 text-white text-sm font-mono focus:outline-none focus:border-[#F5D061]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authBusy}
              className="w-full min-h-[44px] rounded-xl bg-white/10 hover:bg-white/15 border border-[#D4AF37]/40 text-[#F5D061] font-black text-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {authBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>
                {status?.configuredPin ? 'تحقق وافتح المنصة المالية' : 'تثبيت رمز الأمان وفتح المنصة'}
              </span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const printPortalTarget =
    typeof document !== 'undefined' ? document.getElementById('ce-print-portal') : null;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="w-full max-w-[430px] mx-auto space-y-4 pb-24 overflow-x-hidden min-w-0">
      {/* Executive Top Header Banner (Strictly Wrapped Inside 430px Mobile Viewport) */}
      <section className="rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#111C3A] to-[#161F33] border border-[#D4AF37]/40 p-4 text-white shadow-2xl min-w-0 overflow-hidden">
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center shrink-0 shadow-[0_0_24px_-4px_rgba(212,175,55,0.5)]">
              <Lock className="w-5 h-5 text-[#F5D061]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-black text-[#F5D061] leading-snug">
                المنصة المالية الخاصة بالمالك
              </h1>
              <p className="text-[11px] font-bold text-emerald-300 mt-0.5">
                محمية بـ 2FA · مالك التطبيق فقط
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                لوحة المؤشرات الحية، الأرصدة، التدفقات النقدية، الذمم، والمستثمر الذكي
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => void loadDashboardData()}
              disabled={dashLoading}
              className="flex-1 min-w-[120px] min-h-[40px] px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-black text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F5D061] shrink-0 ${dashLoading ? 'animate-spin' : ''}`} />
              <span>تحديث حي</span>
            </button>
            <button
              type="button"
              onClick={() => setPdfModalOpen(true)}
              className="flex-1 min-w-[140px] min-h-[40px] px-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>استخراج تقرير PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs — Flex-Wrap inside 430px so zero buttons clip off-screen */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5 min-w-0">
          {[
            { id: 'overview', label: 'نظرة عامة والأرصدة', icon: Coins },
            { id: 'bol_ledger', label: `البوليصة المالية (${dashboard?.bolRows?.length || 0})`, icon: Anchor },
            { id: 'purchases', label: `المشتريات والمخزون (${dashboard?.purchaseInvoices?.length || 0})`, icon: ShoppingBag },
            { id: 'commissions', label: 'العمولات والنفقات', icon: Percent },
            { id: 'locked_treasury', label: 'الخزينة المقفولة (10%)', icon: Vault },
            { id: 'emergencies', label: 'الحالات العاجلة والطوارئ', icon: Siren },
            { id: 'managers', label: `المدراء الماليين (${dashboard?.financeManagers?.filter((m) => m.status !== 'deleted').length || 0}/2)`, icon: Users },
            { id: 'inflows', label: `المتحصلات (${inflows.length})`, icon: ArrowDownCircle },
            { id: 'outflows', label: `المصروفات (${outflows.length})`, icon: ArrowUpCircle },
            { id: 'receivables', label: `لينا بره (${dashboard?.receivables.length || 0})`, icon: FilePenLine },
            { id: 'payables', label: `علينا بره (${dashboard?.payables.length || 0})`, icon: ReceiptText },
            { id: 'analytics_ai', label: 'المستثمر الذكي AI', icon: BrainCircuit },
            { id: 'audit', label: `سجل التدقيق (${dashboard?.auditLogs.length || 0})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as OwnerFinanceTab)}
                className={`min-h-[38px] px-2.5 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1 cursor-pointer transition-all shrink-0 max-w-full ${
                  active
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] shadow-sm'
                    : 'bg-[#161F33] text-slate-300 border border-white/10 hover:border-[#D4AF37]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {dashboard && (
        <>
          {/* Circular Icon KPI Summary Grid (Clean Single-Column Mobile Stack) */}
          <section className="grid grid-cols-1 gap-3 min-w-0">
            {/* 1. صافي الأرصدة الحالية */}
            <div className="rounded-3xl bg-[#111C3A] border border-[#D4AF37]/35 p-4 text-white shadow-lg flex flex-col justify-between space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D061] flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-300">صافي الأرصدة الحالية</div>
                    <div className="text-lg font-black text-[#F5D061] tabular-nums truncate" dir="ltr">
                      {fmtEgp(dashboard.accounts.totalNetBalance)} <span className="text-xs">EGP</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(true)}
                  className="min-h-[36px] px-3 py-1 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#F5D061] text-[11px] font-black cursor-pointer shrink-0"
                >
                  تعديل الأرصدة
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10 text-center min-w-0">
                <div className="p-2 rounded-2xl bg-[#161F33] min-w-0">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-300 font-bold">
                    <Landmark className="w-3 h-3 text-[#F5D061] shrink-0" />
                    <span className="truncate">البنوك</span>
                  </div>
                  <div className="text-[11px] font-black text-white tabular-nums mt-0.5 truncate" dir="ltr">
                    {fmtEgp(dashboard.accounts.bank)}
                  </div>
                </div>
                <div className="p-2 rounded-2xl bg-[#161F33] min-w-0">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-300 font-bold">
                    <Wallet className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate">المحفظة</span>
                  </div>
                  <div className="text-[11px] font-black text-white tabular-nums mt-0.5 truncate" dir="ltr">
                    {fmtEgp(dashboard.accounts.e_wallet)}
                  </div>
                </div>
                <div className="p-2 rounded-2xl bg-[#161F33] min-w-0">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-300 font-bold">
                    <Vault className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">الخزينة</span>
                  </div>
                  <div className="text-[11px] font-black text-white tabular-nums mt-0.5 truncate" dir="ltr">
                    {fmtEgp(dashboard.accounts.treasury)}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. إجمالي المتحصلات (الداخل) + العمولات المخصومة منفصلة */}
            <div className="rounded-3xl bg-[#111C3A] border border-emerald-400/30 p-4 text-white shadow-lg flex flex-col justify-between space-y-3 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center shrink-0">
                  <ArrowDownCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-300">إجمالي المتحصلات (الداخل الصافي)</div>
                  <div className="text-lg font-black text-emerald-400 tabular-nums truncate" dir="ltr">
                    {fmtEgp(dashboard.totals.totalInflowsNet)} <span className="text-xs">EGP</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs min-w-0">
                <div className="p-2 rounded-xl bg-[#161F33] min-w-0">
                  <span className="text-[10px] text-slate-400 block truncate">الإجمالي قبل الخصم</span>
                  <span className="font-black text-white tabular-nums block truncate" dir="ltr">
                    {fmtEgp(dashboard.totals.totalInflowsGross)} ج.م
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/25 min-w-0">
                  <span className="text-[10px] text-amber-300 block truncate">العمولات المخصومة</span>
                  <span className="font-black text-amber-300 tabular-nums block truncate" dir="ltr">
                    {fmtEgp(dashboard.totals.totalCommissionsDeducted)} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* 3. إجمالي المصروفات (الخارج) */}
            <div className="rounded-3xl bg-[#111C3A] border border-rose-400/30 p-4 text-white shadow-lg flex flex-col justify-between space-y-3 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-400 flex items-center justify-center shrink-0">
                  <ArrowUpCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-300">إجمالي المصروفات (الخارج)</div>
                  <div className="text-lg font-black text-rose-400 tabular-nums truncate" dir="ltr">
                    {fmtEgp(dashboard.totals.totalOutflows)} <span className="text-xs">EGP</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs min-w-0">
                <div className="p-2 rounded-xl bg-[#161F33] min-w-0">
                  <span className="text-[10px] text-sky-300 block truncate">لينا بره (العملاء)</span>
                  <span className="font-black text-sky-300 tabular-nums block truncate" dir="ltr">
                    {fmtEgp(dashboard.totals.totalReceivablesOpen)} ج.م
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#161F33] min-w-0">
                  <span className="text-[10px] text-amber-300 block truncate">علينا بره (الموردين)</span>
                  <span className="font-black text-amber-300 tabular-nums block truncate" dir="ltr">
                    {fmtEgp(dashboard.totals.totalPayablesOpen)} ج.م
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* OVERVIEW: Total Available Funds Security Gate + Real-Time KPI Overview Dashboard */}
          {activeTab === 'overview' && (
            <div className="space-y-4 min-w-0">
              {/* 7. TOTAL AVAILABLE FUNDS MULTI-MODAL GATE (Fingerprint / Iris / Live Camera Face) */}
              <section className="rounded-3xl bg-gradient-to-br from-[#1B1035] via-[#111C3A] to-[#0B132B] border-2 border-[#D4AF37]/60 p-4 text-white space-y-3 min-w-0 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F5D061] flex items-center justify-center shrink-0">
                      {dashboard.totalFundsGate.unlocked ? (
                        <Unlock className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-black text-[#F5D061]">
                        إجمالي المال المتاح (خزينة محمية)
                      </h2>
                      <p className="text-[11px] text-slate-300">
                        الوسيلة النشطة:{' '}
                        <strong className="text-white">
                          {dashboard.totalFundsGate.authMethod === 'fingerprint'
                            ? 'بصمة الإصبع'
                            : dashboard.totalFundsGate.authMethod === 'iris'
                              ? 'بصمة العين (القزحية)'
                              : 'الكاميرا الحية (بصمة الوجه)'}
                        </strong>
                      </p>
                    </div>
                  </div>
                  {dashboard.totalFundsGate.unlocked ? (
                    <button
                      type="button"
                      onClick={() => void handleLockTotalFunds()}
                      className="min-h-[36px] px-3 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-200 text-[11px] font-black cursor-pointer shrink-0"
                    >
                      قفل الآن
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTotalFundsError(null);
                        setTotalFundsModalOpen(true);
                      }}
                      className="min-h-[36px] px-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] text-[11px] font-black cursor-pointer shrink-0 shadow"
                    >
                      فتح العرض الآمن
                    </button>
                  )}
                </div>

                {/* Owner Policy Selector: Fingerprint / Iris / Live Camera */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-black min-w-0">
                  {(
                    [
                      { id: 'fingerprint', label: 'بصمة الإصبع', icon: Fingerprint },
                      { id: 'iris', label: 'بصمة العين', icon: Eye },
                      { id: 'camera_face', label: 'كاميرا حية', icon: Camera },
                    ] as const
                  ).map((m) => {
                    const MIcon = m.icon;
                    const active = dashboard.totalFundsGate.authMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={totalFundsBusy}
                        onClick={() => void handleSwitchTotalFundsPolicy(m.id)}
                        className={`min-h-[38px] px-2 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all min-w-0 ${
                          active
                            ? 'bg-[#D4AF37] text-[#0B132B] border-[#F5D061]'
                            : 'bg-[#161F33] text-slate-300 border-white/10 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <MIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {dashboard.totalFundsGate.unlocked ? (
                  <div className="p-3 rounded-2xl bg-[#0B132B]/90 border border-emerald-400/40 space-y-2">
                    <div className="text-[11px] text-emerald-300 font-bold">
                      الإجمالي الفعلي المتاح (السيولة السائلة + احتياطي 10% المقفول):
                    </div>
                    <div className="text-2xl font-black text-[#F5D061] tabular-nums" dir="ltr">
                      {fmtEgp(dashboard.totalFundsGate.availableFundsEGP || 0)} EGP
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
                      <div>
                        <span className="text-slate-400 block">السيولة الحرة:</span>
                        <span className="font-black text-white tabular-nums" dir="ltr">
                          {fmtEgp(dashboard.totalFundsGate.liquidFundsEGP || 0)} ج.م
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">الخزينة المقفولة 10%:</span>
                        <span className="font-black text-amber-300 tabular-nums" dir="ltr">
                          {fmtEgp(dashboard.totalFundsGate.lockedFundsEGP || 0)} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#0B132B]/70 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#F5D061] shrink-0" />
                    <span>
                      الأرقام الإجمالية الحقيقية محجوبة من السيرفر حتى يتم التحقق بالوسيلة المختارة أعلاه.
                    </span>
                  </div>
                )}
              </section>

              {/* Real-Time KPI Overview Header + 4 Live Metric Strip */}
              <section className="rounded-3xl bg-[#111C3A] border border-[#D4AF37]/30 p-4 text-white space-y-3.5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D061] flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-black text-[#F5D061]">
                        لوحة مؤشرات الأداء الحية (KPI Overview)
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        حجم الإعاشة الشهري · طلبات عروض الأسعار · اتجاه صافي الإيرادات
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2x2 Real-Time Operational KPI Grid */}
                <div className="grid grid-cols-2 gap-2.5 min-w-0">
                  <div className="p-3 rounded-2xl bg-[#161F33] border border-white/10 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 truncate">حجم الإعاشة الشهري</div>
                    <div className="text-sm font-black text-[#F5D061] tabular-nums mt-0.5 truncate" dir="ltr">
                      {fmtEgp(kpiOverview.currentMonthVolumeEGP)} EGP
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1 tabular-nums">
                      {kpiOverview.currentMonthOrders} طلب / عملية هذا الشهر
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161F33] border border-white/10 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 truncate">عروض الأسعار المعلقة</div>
                    <div className="text-sm font-black text-sky-300 tabular-nums mt-0.5">
                      {kpiOverview.pendingRfqCount} / {kpiOverview.totalRfqCount}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1">
                      {kpiOverview.pendingRfqCount > 0 ? 'بانتظار الاعتماد والتسعير' : 'لا توجد طلبات معلقة'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161F33] border border-white/10 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 truncate">صافي اتجاه الإيرادات</div>
                    <div
                      className={`text-sm font-black tabular-nums mt-0.5 truncate ${
                        kpiOverview.netRevenueTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                      dir="ltr"
                    >
                      {kpiOverview.netRevenueTotal >= 0 ? '+' : ''}
                      {fmtEgp(kpiOverview.netRevenueTotal)} EGP
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1 tabular-nums">
                      هامش التشغيل الصافي: {kpiOverview.marginPct}%
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#161F33] border border-white/10 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 truncate">تغطية التزامات الموردين</div>
                    <div className="text-sm font-black text-amber-300 tabular-nums mt-0.5" dir="ltr">
                      {dashboard.totals.totalPayablesOpen > 0
                        ? `${Math.min(999, Math.round((dashboard.accounts.totalNetBalance / dashboard.totals.totalPayablesOpen) * 100))}%`
                        : '100%'}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1 truncate">
                      الذمم المفتوحة: {dashboard.receivables.length + dashboard.payables.length}
                    </div>
                  </div>
                </div>
              </section>

              {/* Chart 1: Monthly Catering Volume (BarChart) */}
              <section className="rounded-3xl bg-[#111C3A] border border-white/10 p-4 text-white space-y-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-[#D4AF37]/40 text-[#F5D061] flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-[#F5D061]">حجم الإعاشة والتوريد الشهري (EGP)</h3>
                    <p className="text-[10px] text-slate-400">إجمالي قيم التعاقدات وطلبات التوريد خلال آخر 6 أشهر</p>
                  </div>
                </div>
                <div className="h-52 w-full min-w-0" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpiOverview.monthBuckets} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
                      <XAxis dataKey="label" stroke="#cbd5e1" fontSize={10} />
                      <YAxis stroke="#cbd5e1" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B132B',
                          borderColor: '#D4AF37',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Bar
                        dataKey="cateringVolumeEGP"
                        name={isRtl ? 'حجم التوريد (EGP)' : 'Catering Volume (EGP)'}
                        fill="#F5D061"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Chart 2: Net Revenue & Cashflow Trends (AreaChart) */}
              <section className="rounded-3xl bg-[#111C3A] border border-white/10 p-4 text-white space-y-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-emerald-300">اتجاه صافي الإيرادات والمصروفات</h3>
                    <p className="text-[10px] text-slate-400">مقارنة صافي المتحصلات مقابل المصروفات وصافي الربح الشهري</p>
                  </div>
                </div>
                <div className="h-52 w-full min-w-0" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpiOverview.monthBuckets} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ownerNetRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34D399" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="ownerOutflowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F87171" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#F87171" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
                      <XAxis dataKey="label" stroke="#cbd5e1" fontSize={10} />
                      <YAxis stroke="#cbd5e1" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B132B',
                          borderColor: '#34D399',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="inflowsNet"
                        name={isRtl ? 'المتحصلات الصافية' : 'Net Inflows'}
                        stroke="#F5D061"
                        strokeWidth={2}
                        fillOpacity={0}
                      />
                      <Area
                        type="monotone"
                        dataKey="netRevenue"
                        name={isRtl ? 'صافي الإيراد' : 'Net Revenue'}
                        stroke="#34D399"
                        strokeWidth={2.2}
                        fill="url(#ownerNetRevGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="outflowsTotal"
                        name={isRtl ? 'المصروفات' : 'Outflows'}
                        stroke="#F87171"
                        strokeWidth={1.8}
                        fill="url(#ownerOutflowGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Chart 3: Pending RFQ Statuses Distribution (PieChart) */}
              <section className="rounded-3xl bg-[#111C3A] border border-white/10 p-4 text-white space-y-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-sky-300">حالات طلبات عروض الأسعار (RFQ Statuses)</h3>
                    <p className="text-[10px] text-slate-400">التوزيع اللحظي لطلبات الشركات والولائم قيد المراجعة والاعتماد</p>
                  </div>
                </div>

                {kpiOverview.rfqStatusSeries.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    لا توجد طلبات عروض أسعار مسجلة حتى الآن — ستظهر الحالات فوراً عند ورود طلبات جديدة.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={kpiOverview.rfqStatusSeries}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={66}
                            paddingAngle={3}
                          >
                            {kpiOverview.rfqStatusSeries.map((entry) => (
                              <Cell key={entry.key} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B132B',
                              borderColor: '#38BDF8',
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '11px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {kpiOverview.rfqStatusSeries.map((item) => (
                        <div
                          key={item.key}
                          className="p-2.5 rounded-xl bg-[#161F33] flex items-center justify-between gap-2 min-w-0"
                        >
                          <span className="font-bold text-slate-200 truncate">{item.name}</span>
                          <span className="font-black tabular-nums shrink-0" style={{ color: item.color }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Smart Expense Analytics Preview */}
              <div className="rounded-3xl bg-[#111C3A] border border-white/10 p-4 text-white space-y-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-[#F5D061]">
                      تحليل المصروفات الذكي
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      توزيع المصروفات والعمولات حسب التصنيف
                    </p>
                  </div>
                </div>

                {dashboard.expenseAnalytics.length === 0 ? (
                  <div className="h-44 rounded-2xl bg-[#161F33] flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400">
                    لا توجد مصروفات أو عمولات مسجلة بعد لعرض الرسم البياني — أضف أول عملية مصروف أو عملية بيع.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboard.expenseAnalytics}
                            dataKey="totalEGP"
                            nameKey="labelAr"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={3}
                          >
                            {dashboard.expenseAnalytics.map((entry, idx) => {
                              const matched = EXPENSE_CATEGORIES.find((c) => c.id === entry.key);
                              return (
                                <Cell
                                  key={entry.key}
                                  fill={matched?.color || ['#D4AF37', '#38BDF8', '#A78BFA', '#34D399'][idx % 4]}
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B132B',
                              borderColor: '#D4AF37',
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '11px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {dashboard.expenseAnalytics.map((cat) => {
                        const matched = EXPENSE_CATEGORIES.find((c) => c.id === cat.key);
                        return (
                          <div
                            key={cat.key}
                            className="p-2.5 rounded-xl bg-[#161F33] flex items-center justify-between gap-2 text-xs min-w-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: matched?.color || '#94A3B8' }}
                              />
                              <span className="font-bold text-slate-200 truncate">{cat.labelAr}</span>
                            </div>
                            <span className="font-black text-[#F5D061] tabular-nums shrink-0" dir="ltr">
                              {fmtEgp(cat.totalEGP)} EGP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Smart Investor Launch Card */}
              <div className="rounded-3xl bg-gradient-to-br from-[#161F33] to-[#0B132B] border border-[#D4AF37]/40 p-4 text-white flex flex-col justify-between space-y-3.5 min-w-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#D4AF37]/25 border border-[#D4AF37] text-[#F5D061] flex items-center justify-center relative shrink-0">
                      <BrainCircuit className="w-5 h-5" />
                      <Lightbulb className="w-3.5 h-3.5 text-amber-200 absolute -top-1 -end-1" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-black text-[#F5D061]">المستثمر الذكي AI</h2>
                      <p className="text-[11px] text-slate-300">
                        تحليل التدفقات النقدية واقتراح فرص استثمارية آمنة للفائض المالي
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0B132B]/70 border border-white/10 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 truncate">صافي الموقف النقدي المتوقع:</span>
                      <span className="font-black text-[#F5D061] tabular-nums shrink-0" dir="ltr">
                        {fmtEgp(dashboard.totals.netCashflowPosition)} EGP
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 truncate">احتياطي تغطية الموردين:</span>
                      <span className="font-bold text-slate-200 tabular-nums shrink-0" dir="ltr">
                        {fmtEgp(dashboard.totals.totalPayablesOpen)} EGP
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => {
                    setActiveTab('analytics_ai');
                    void handleRunSmartInvestor();
                  }}
                  className="w-full min-h-[44px] rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-105 disabled:opacity-60"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>تشغيل المستثمر الذكي الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: INFLOWS (المتحصلات - الداخل) — Zero-Overflow Stacked Mobile Cards */}
          {activeTab === 'inflows' && (
            <section className="rounded-3xl bg-[#111C3A] border border-emerald-400/30 p-4 text-white space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center shrink-0">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white">إجمالي المتحصلات (الداخل)</h2>
                    <p className="text-[11px] text-slate-400">
                      مرتبط آلياً بعمليات الشراء مع فصل العمولات المخصومة
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInflowForm((p) => !p)}
                  className="w-full min-h-[42px] px-4 rounded-full bg-emerald-500 text-[#0B132B] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>تسجيل متحصل جديد</span>
                </button>
              </div>

              {showInflowForm && (
                <form
                  onSubmit={handleCreateInflow}
                  className="p-3.5 rounded-2xl bg-[#161F33] border border-emerald-400/30 grid grid-cols-1 gap-2.5 text-xs min-w-0"
                >
                  <SmartVoiceMicButton
                    context="تسجيل متحصل مالي / إيراد داخل"
                    onParsed={(f) => {
                      if (f.partyName) setInSource(f.partyName);
                      if (f.purpose) setInPurpose(f.purpose);
                      if (f.originLabel) setInOriginLabel(f.originLabel);
                      if (f.amountEGP > 0) setInGross(String(f.amountEGP));
                      if (f.urgency) setInUrgency(f.urgency);
                      onShowToast('تم ملء بيانات المتحصل صوتياً بالذكاء الاصطناعي.');
                    }}
                    onError={(msg) => onShowToast(msg)}
                  />
                  <input
                    type="text"
                    required
                    placeholder="المصدر (مثال: مصنع السويدي / عميل مباشر)"
                    value={inSource}
                    onChange={(e) => setInSource(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="الغرض (مثال: توريد وجبات وردية)"
                    value={inPurpose}
                    onChange={(e) => setInPurpose(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="هذا دخل من إيه؟ (مثال: دفعة تعاقد شهر نوفمبر / بيع فائض)"
                    value={inOriginLabel}
                    onChange={(e) => setInOriginLabel(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-emerald-400/40 text-white outline-none focus:border-[#D4AF37]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="الإجمالي (ج.م)"
                      value={inGross}
                      onChange={(e) => setInGross(e.target.value)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none focus:border-[#D4AF37] tabular-nums"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      placeholder="نسبة العمولة %"
                      value={inCommPct}
                      onChange={(e) => setInCommPct(e.target.value)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none focus:border-[#D4AF37] tabular-nums"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={inChannel}
                      onChange={(e) => setInChannel(e.target.value as OwnerFinanceChannel)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    >
                      {CHANNELS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.labelAr}
                        </option>
                      ))}
                    </select>
                    <select
                      value={inUrgency}
                      onChange={(e) => setInUrgency(e.target.value as FinancialUrgencyLevel)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    >
                      <option value="normal">أولوية: عادي</option>
                      <option value="urgent">أولوية: عاجل</option>
                      <option value="emergency">أولوية: طوارئ</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="date"
                      value={inDate}
                      onChange={(e) => setInDate(e.target.value)}
                      className="flex-1 min-w-[140px] min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    />
                    <button
                      type="submit"
                      disabled={actionBusy}
                      className="min-h-[42px] px-5 rounded-xl bg-[#D4AF37] text-[#0B132B] font-black cursor-pointer shrink-0"
                    >
                      حفظ
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5 min-w-0">
                {inflows.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    لا توجد متحصلات مسجلة بعد — أي عملية شراء أو دفع ستظهر هنا تلقائياً.
                  </div>
                ) : (
                  inflows.map((row) => (
                    <div
                      key={row.entryId}
                      className="p-3.5 rounded-2xl bg-[#161F33] border border-white/10 space-y-1.5 text-xs min-w-0"
                    >
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <span className="font-black text-white break-words min-w-0 flex-1">
                          {row.sourceOrBeneficiary}
                        </span>
                        <span className="font-black text-emerald-400 tabular-nums shrink-0" dir="ltr">
                          +{fmtEgp(row.netEGP)} EGP
                        </span>
                      </div>
                      <div className="text-slate-200 break-words">{row.purpose}</div>
                      {row.originLabel && (
                        <div className="text-[11px] font-bold text-emerald-300">
                          مصدر الدخل: {row.originLabel}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-white/10">
                        <span className="font-mono tabular-nums" dir="ltr">{row.entryDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getChannelLabel(row.channel)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-300 font-bold tabular-nums" dir="ltr">
                          عمولة: {fmtEgp(row.commissionEGP)} ({row.commissionPct}%)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* TAB: OUTFLOWS (المصروفات - الخارج) — Zero-Overflow Stacked Mobile Cards */}
          {activeTab === 'outflows' && (
            <section className="rounded-3xl bg-[#111C3A] border border-rose-400/30 p-4 text-white space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-400 flex items-center justify-center shrink-0">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white">إجمالي المصروفات (الخارج)</h2>
                    <p className="text-[11px] text-slate-400">
                      المستفيد، التاريخ، الغرض، ونوع المصروف لتغذية التحليل الذكي
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOutflowForm((p) => !p)}
                  className="w-full min-h-[42px] px-4 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>تسجيل مصروف جديد</span>
                </button>
              </div>

              {showOutflowForm && (
                <form
                  onSubmit={handleCreateOutflow}
                  className="p-3.5 rounded-2xl bg-[#161F33] border border-rose-400/30 grid grid-cols-1 gap-2.5 text-xs min-w-0"
                >
                  <SmartVoiceMicButton
                    context="تسجيل مصروف مالي خارج"
                    onParsed={(f) => {
                      if (f.partyName) setOutBeneficiary(f.partyName);
                      if (f.purpose) setOutPurpose(f.purpose);
                      if (f.originLabel) setOutOriginLabel(f.originLabel);
                      if (f.amountEGP > 0) setOutAmount(String(f.amountEGP));
                      if (f.urgency) setOutUrgency(f.urgency);
                      onShowToast('تم ملء بيانات المصروف صوتياً بالذكاء الاصطناعي.');
                    }}
                    onError={(msg) => onShowToast(msg)}
                  />
                  <input
                    type="text"
                    required
                    placeholder="المستفيد (مثال: مورد لحوم / رواتب فريق المطبخ)"
                    value={outBeneficiary}
                    onChange={(e) => setOutBeneficiary(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="الغرض من الصرف"
                    value={outPurpose}
                    onChange={(e) => setOutPurpose(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="هذا مصروف بتاع إيه؟ (مثال: صيانة طارئة / فاتورة كهرباء المطبخ)"
                    value={outOriginLabel}
                    onChange={(e) => setOutOriginLabel(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-rose-400/40 text-white outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="المبلغ (ج.م)"
                    value={outAmount}
                    onChange={(e) => setOutAmount(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none focus:border-[#D4AF37] tabular-nums"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={outCategory}
                      onChange={(e) => setOutCategory(e.target.value as Exclude<OwnerExpenseCategory, 'none'>)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          نوع المصروف: {c.labelAr}
                        </option>
                      ))}
                    </select>
                    <select
                      value={outUrgency}
                      onChange={(e) => setOutUrgency(e.target.value as FinancialUrgencyLevel)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    >
                      <option value="normal">أولوية: عادي</option>
                      <option value="urgent">أولوية: عاجل</option>
                      <option value="emergency">أولوية: طوارئ</option>
                    </select>
                  </div>
                  <select
                    value={outChannel}
                    onChange={(e) => setOutChannel(e.target.value as OwnerFinanceChannel)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c.id} value={c.id}>
                        خصم من: {c.labelAr}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="date"
                      value={outDate}
                      onChange={(e) => setOutDate(e.target.value)}
                      className="flex-1 min-w-[140px] min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    />
                    <button
                      type="submit"
                      disabled={actionBusy}
                      className="min-h-[42px] px-5 rounded-xl bg-[#D4AF37] text-[#0B132B] font-black cursor-pointer shrink-0"
                    >
                      حفظ
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5 min-w-0">
                {outflows.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    لا توجد مصروفات مسجلة بعد.
                  </div>
                ) : (
                  outflows.map((row) => (
                    <div
                      key={row.entryId}
                      className="p-3.5 rounded-2xl bg-[#161F33] border border-white/10 space-y-1.5 text-xs min-w-0"
                    >
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <span className="font-black text-white break-words min-w-0 flex-1">
                          {row.sourceOrBeneficiary}
                        </span>
                        <span className="font-black text-rose-400 tabular-nums shrink-0" dir="ltr">
                          -{fmtEgp(row.netEGP)} EGP
                        </span>
                      </div>
                      <div className="text-slate-200 break-words">{row.purpose}</div>
                      {row.originLabel && (
                        <div className="text-[11px] font-bold text-rose-300">
                          بتاع إيه: {row.originLabel}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-white/10">
                        <span className="font-mono tabular-nums" dir="ltr">{row.entryDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#F5D061] font-bold">
                          {getExpenseCategoryLabel(row.expenseCategory)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{getChannelLabel(row.channel)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* TAB: CLIENT RECEIVABLES (لينا بره) */}
          {activeTab === 'receivables' && (
            <section className="rounded-3xl bg-[#111C3A] border border-sky-400/30 p-4 text-white space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 flex items-center justify-center shrink-0">
                    <FilePenLine className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white">أرصدة العملاء (لينا بره)</h2>
                    <p className="text-[11px] text-slate-400">
                      متابعة مديونيات الشركات وتواريخ الاستحقاق والتحصيل
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRcvForm((p) => !p)}
                  className="w-full min-h-[42px] px-4 rounded-full bg-sky-400 text-[#0B132B] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>إضافة مستحق على عميل</span>
                </button>
              </div>

              {showRcvForm && (
                <form
                  onSubmit={handleCreateReceivable}
                  className="p-3.5 rounded-2xl bg-[#161F33] border border-sky-400/30 grid grid-cols-1 gap-2.5 text-xs min-w-0"
                >
                  <input
                    type="text"
                    required
                    placeholder="اسم العميل / الشركة"
                    value={rcvClient}
                    onChange={(e) => setRcvClient(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="البيان / رقم الفاتورة"
                    value={rcvPurpose}
                    onChange={(e) => setRcvPurpose(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                  />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="المبلغ المستحق (ج.م)"
                    value={rcvAmount}
                    onChange={(e) => setRcvAmount(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none tabular-nums"
                  />
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="date"
                      required
                      value={rcvDueDate}
                      onChange={(e) => setRcvDueDate(e.target.value)}
                      className="flex-1 min-w-[140px] min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    />
                    <button
                      type="submit"
                      disabled={actionBusy}
                      className="min-h-[42px] px-5 rounded-xl bg-[#D4AF37] text-[#0B132B] font-black cursor-pointer shrink-0"
                    >
                      إضافة
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 gap-3 min-w-0">
                {dashboard.receivables.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    لا توجد مديونيات عملاء مفتوحة حالياً.
                  </div>
                ) : (
                  dashboard.receivables.map((r) => {
                    const remaining = Math.max(0, r.totalAmountEGP - r.collectedAmountEGP);
                    const overdue = remaining > 0 && r.dueDate < todayStr;
                    return (
                      <div
                        key={r.receivableId}
                        className={`p-4 rounded-2xl bg-[#161F33] border flex flex-col justify-between gap-3 min-w-0 ${
                          overdue ? 'border-rose-400/50' : 'border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-white break-words">{r.clientName}</div>
                            <div className="text-xs text-slate-300 mt-0.5 break-words">{r.purpose}</div>
                          </div>
                          <span
                            className={`text-[10px] font-black shrink-0 ${
                              remaining === 0
                                ? 'text-emerald-300'
                                : overdue
                                  ? 'text-rose-300'
                                  : 'text-sky-300'
                            }`}
                          >
                            {remaining === 0 ? 'محصل بالكامل' : overdue ? 'متأخر السداد' : 'مستحق للتحصيل'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-[#F5D061] shrink-0" />
                            <span>الاستحقاق: <strong dir="ltr">{r.dueDate}</strong></span>
                          </div>
                          <div className="font-black text-[#F5D061] tabular-nums" dir="ltr">
                            {fmtEgp(remaining)} / {fmtEgp(r.totalAmountEGP)} EGP
                          </div>
                        </div>
                        {remaining > 0 && (
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => void handleCollectReceivable(r.receivableId, remaining)}
                            className="min-h-[40px] w-full rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>تحصيل المبلغ بالكامل وإيداعه بالبنك</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* TAB: SUPPLIER PAYABLES (علينا بره) */}
          {activeTab === 'payables' && (
            <section className="rounded-3xl bg-[#111C3A] border border-amber-400/30 p-4 text-white space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white">أرصدة الموردين (علينا بره)</h2>
                    <p className="text-[11px] text-slate-400">
                      مبالغ مستحقة للموردين وجدولة سداد الدفعات بدقة
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayForm((p) => !p)}
                  className="w-full min-h-[42px] px-4 rounded-full bg-amber-400 text-[#0B132B] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>جدولة سداد مورد</span>
                </button>
              </div>

              {showPayForm && (
                <form
                  onSubmit={handleCreatePayable}
                  className="p-3.5 rounded-2xl bg-[#161F33] border border-amber-400/30 grid grid-cols-1 gap-2.5 text-xs min-w-0"
                >
                  <input
                    type="text"
                    required
                    placeholder="اسم المورد / المزرعة"
                    value={paySupplier}
                    onChange={(e) => setPaySupplier(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="تفاصيل التوريد / الفاتورة"
                    value={payPurpose}
                    onChange={(e) => setPayPurpose(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                  />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="المبلغ المستحق (ج.م)"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none tabular-nums"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={payScope}
                      onChange={(e) =>
                        setPayScope(e.target.value as 'external_supplier' | 'internal_platform')
                      }
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    >
                      <option value="external_supplier">مورد خارجي</option>
                      <option value="internal_platform">التزام داخلي بالمنصة</option>
                    </select>
                    <select
                      value={payUrgency}
                      onChange={(e) => setPayUrgency(e.target.value as FinancialUrgencyLevel)}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    >
                      <option value="normal">عادي</option>
                      <option value="urgent">عاجل</option>
                      <option value="emergency">طوارئ</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="date"
                      required
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className="flex-1 min-w-[140px] min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white outline-none"
                    />
                    <button
                      type="submit"
                      disabled={actionBusy}
                      className="min-h-[42px] px-5 rounded-xl bg-[#D4AF37] text-[#0B132B] font-black cursor-pointer shrink-0"
                    >
                      جدولة
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 gap-3 min-w-0">
                {dashboard.payables.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    لا توجد التزامات موردين مجدولة حالياً.
                  </div>
                ) : (
                  dashboard.payables.map((p) => {
                    const remaining = Math.max(0, p.totalAmountEGP - p.paidAmountEGP);
                    return (
                      <div
                        key={p.payableId}
                        className={`p-4 rounded-2xl bg-[#161F33] border flex flex-col justify-between gap-3 min-w-0 ${
                          p.urgency === 'emergency'
                            ? 'border-rose-400/70'
                            : p.urgency === 'urgent'
                              ? 'border-amber-400/60'
                              : 'border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-black text-white break-words">{p.supplierName}</div>
                            <div className="text-xs text-slate-300 mt-0.5 break-words">{p.purpose}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1">
                              {p.supplierScope === 'internal_platform' ? 'التزام داخلي' : 'مورد خارجي'}
                              {p.urgency === 'emergency' ? ' · طوارئ' : p.urgency === 'urgent' ? ' · عاجل' : ''}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-black shrink-0 ${
                              remaining === 0 ? 'text-emerald-300' : 'text-amber-300'
                            }`}
                          >
                            {remaining === 0 ? 'مسدد بالكامل' : 'دفعة مجدولة'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-[#F5D061] shrink-0" />
                            <span>السداد: <strong dir="ltr">{p.scheduledPaymentDate}</strong></span>
                          </div>
                          <div className="font-black text-amber-300 tabular-nums" dir="ltr">
                            {fmtEgp(remaining)} / {fmtEgp(p.totalAmountEGP)} EGP
                          </div>
                        </div>
                        {remaining > 0 && (
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => void handlePayPayable(p.payableId, remaining)}
                            className="min-h-[40px] w-full rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>تنفيذ سداد الدفعة من البنك</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* TAB 1: BILL OF LADING FINANCIAL GRID */}
          {activeTab === 'bol_ledger' && (
            <OwnerBolFinancialGrid
              rows={dashboard.bolRows || []}
              onUpdated={(next) => setDashboard(next)}
              onShowToast={onShowToast}
            />
          )}

          {/* TAB 2: PURCHASES & LIVE INVENTORY */}
          {activeTab === 'purchases' && (
            <PurchasesInventoryModule
              inventoryItems={dashboard.inventoryItems || []}
              purchaseInvoices={dashboard.purchaseInvoices || []}
              purchaseReturns={dashboard.purchaseReturns || []}
              partyPayments={dashboard.partyPayments || []}
              onUpdated={(next) => setDashboard(next)}
              onShowToast={onShowToast}
            />
          )}

          {/* TAB 3: COMMISSIONS & EXPENSES DEDICATED VIEW */}
          {activeTab === 'commissions' && (
            <section className="rounded-3xl bg-[#111C3A] border border-amber-400/35 p-4 text-white space-y-4 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-[#F5D061]">العمولات والنفقات التفصيلية</h2>
                  <p className="text-[11px] text-slate-400">
                    فصل تام للعمولات المستقطعة عن مصاريف التشغيل الفعلية
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#161F33] border border-amber-400/30">
                  <span className="text-[10px] text-amber-300 block">إجمالي العمولات</span>
                  <span className="text-sm font-black text-white tabular-nums" dir="ltr">
                    {fmtEgp(dashboard.totals.totalCommissionsDeducted)} EGP
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#161F33] border border-rose-400/30">
                  <span className="text-[10px] text-rose-300 block">إجمالي النفقات</span>
                  <span className="text-sm font-black text-white tabular-nums" dir="ltr">
                    {fmtEgp(dashboard.totals.totalOutflows)} EGP
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(dashboard.commissionsAndExpenses || []).length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    لا توجد عمولات أو نفقات مسجلة بعد.
                  </div>
                ) : (
                  (dashboard.commissionsAndExpenses || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[#161F33] border border-white/10 space-y-1 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-black text-white break-words flex-1">{item.labelAr}</span>
                        <span
                          className={`font-black tabular-nums shrink-0 ${
                            item.kind === 'commission' ? 'text-amber-300' : 'text-rose-300'
                          }`}
                          dir="ltr"
                        >
                          {fmtEgp(item.amountEGP)} EGP
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 break-words">
                        الأصل / التوجيه: {item.originLabel || '—'}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-white/10">
                        <span>{item.kind === 'commission' ? 'عمولة مخصومة' : 'مصروف تشغيلي'} · {getChannelLabel(item.channel)}</span>
                        <span className="font-mono" dir="ltr">{item.entryDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* TAB 4: LOCKED TREASURY (10% AUTOMATIC PROFIT DEDUCTION) */}
          {activeTab === 'locked_treasury' && (
            <section className="rounded-3xl bg-gradient-to-br from-[#1B1035] via-[#111C3A] to-[#0B132B] border-2 border-[#D4AF37]/55 p-4 text-white space-y-4 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F5D061] flex items-center justify-center shrink-0">
                  <Vault className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-[#F5D061]">
                    الخزينة المقفولة (استقطاع {dashboard.lockedTreasury.deductionRatePct}% تلقائياً)
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    يُرحّل 10% من كل ربح صافي تلقائياً هنا ولا يُفتح إلا للمالك فقط
                  </p>
                </div>
              </div>

              {!dashboard.lockedTreasury.unlocked ? (
                <div className="p-4 rounded-2xl bg-[#161F33] border border-[#D4AF37]/30 space-y-3">
                  <div className="text-xs font-bold text-amber-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>الرصيد وسجل التحويلات محجوبان بالكامل — {dashboard.lockedTreasury.transfersCount} عملية استقطاع مسجلة.</span>
                  </div>
                  {isWebAuthnSupported() && (
                    <button
                      type="button"
                      disabled={ltBusy}
                      onClick={() => void handleUnlockLockedTreasuryBiometric()}
                      className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>فتح الخزينة المقفولة بالبصمة</span>
                    </button>
                  )}
                  <form onSubmit={handleUnlockLockedTreasuryPin} className="flex gap-2">
                    <input
                      type="password"
                      required
                      placeholder="أو أدخل رمز PIN للمالك"
                      value={ltPinInput}
                      onChange={(e) => setLtPinInput(e.target.value)}
                      className="flex-1 min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white text-xs font-mono outline-none"
                    />
                    <button
                      type="submit"
                      disabled={ltBusy}
                      className="min-h-[42px] px-4 rounded-xl bg-white/15 border border-[#D4AF37]/40 text-[#F5D061] font-black text-xs cursor-pointer shrink-0"
                    >
                      فتح
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-emerald-400/40 text-center space-y-1">
                    <div className="text-[11px] text-emerald-300 font-bold">رصيد الخزينة المقفولة المتاح</div>
                    <div className="text-2xl font-black text-[#F5D061] tabular-nums" dir="ltr">
                      {fmtEgp(dashboard.lockedTreasury.balanceEGP || 0)} EGP
                    </div>
                  </div>

                  <form
                    onSubmit={handleWithdrawLockedTreasury}
                    className="p-3.5 rounded-2xl bg-[#161F33] border border-white/10 space-y-2.5 text-xs"
                  >
                    <div className="font-black text-[#F5D061]">سحب أو تحويل من الخزينة المقفولة:</div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="المبلغ المراد تحويله (ج.م)"
                      value={ltWithdrawAmount}
                      onChange={(e) => setLtWithdrawAmount(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white tabular-nums"
                    />
                    <select
                      value={ltWithdrawChannel}
                      onChange={(e) => setLtWithdrawChannel(e.target.value as OwnerFinanceChannel)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
                    >
                      {CHANNELS.map((c) => (
                        <option key={c.id} value={c.id}>
                          تحويل إلى: {c.labelAr}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="سبب السحب / المرجع"
                      value={ltWithdrawReason}
                      onChange={(e) => setLtWithdrawReason(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
                    />
                    <button
                      type="submit"
                      disabled={ltBusy}
                      className="w-full min-h-[42px] rounded-xl bg-[#D4AF37] text-[#0B132B] font-black cursor-pointer"
                    >
                      اعتماد التحويل
                    </button>
                  </form>

                  <div className="space-y-2">
                    <div className="text-xs font-black text-slate-300">
                      سجل استقطاعات الـ 10% التلقائية ({dashboard.lockedTreasury.transfers.length}):
                    </div>
                    {dashboard.lockedTreasury.transfers.map((tr) => (
                      <div key={tr.transferId} className="p-3 rounded-2xl bg-[#161F33] border border-white/10 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white break-words flex-1">{tr.sourceLabel}</span>
                          <span className="font-black text-emerald-300 tabular-nums shrink-0" dir="ltr">
                            +{fmtEgp(tr.deductedAmountEGP)} EGP
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tr.noteAr} · صافي الربح الأساسي: {fmtEgp(tr.netProfitBaseEGP)} ج.م
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 6: EMERGENCIES & INTERNAL/EXTERNAL PAYABLES SCANNER */}
          {activeTab === 'emergencies' && (
            <section className="rounded-3xl bg-[#111C3A] border border-rose-500/45 p-4 text-white space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 flex items-center justify-center shrink-0">
                    <Siren className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-rose-300">الحالات العاجلة والطوارئ</h2>
                    <p className="text-[11px] text-slate-400">
                      فحص المستحقات العاجلة الداخلية والخارجية ونقص المخزون مقابل السيولة المتاحة
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={emergencyBusy}
                  onClick={() => void handleRunEmergencyScan()}
                  className="w-full min-h-[42px] px-4 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {emergencyBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Siren className="w-4 h-4" />}
                  <span>فحص الطوارئ والسيولة الآن</span>
                </button>
              </div>

              {emergencyScan ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-[#161F33] border border-emerald-400/30">
                      <span className="text-[10px] text-slate-400 block">السيولة الحرة</span>
                      <span className="font-black text-emerald-300 tabular-nums" dir="ltr">
                        {fmtEgp(emergencyScan.liquidTotalEGP)} EGP
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#161F33] border border-rose-400/30">
                      <span className="text-[10px] text-slate-400 block">إجمالي الاحتياج العاجل</span>
                      <span className="font-black text-rose-300 tabular-nums" dir="ltr">
                        {fmtEgp(emergencyScan.totalUrgentNeedEGP)} EGP
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#0B132B] border border-amber-400/35 text-xs space-y-1">
                    <div className="font-black text-[#F5D061]">
                      تغطية السيولة للطوارئ: {emergencyScan.coveragePct}%{' '}
                      {emergencyScan.deficitEGP > 0 ? `(عجز: ${fmtEgp(emergencyScan.deficitEGP)} ج.م)` : '(كافية)'}
                    </div>
                    <p className="text-slate-200 leading-relaxed">{emergencyScan.aiPriorityNoteAr}</p>
                  </div>

                  {emergencyScan.lowStockCount > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-xs space-y-1">
                      <div className="font-black text-amber-300">
                        أصناف مخزون وصلت لحد إعادة الطلب ({emergencyScan.lowStockCount}):
                      </div>
                      {emergencyScan.lowStockItems.map((it) => (
                        <div key={it.itemId} className="text-[11px] text-slate-200">
                          • {it.nameAr}: المتبقي {it.quantityOnHand} {it.unitAr} (الحد الأدنى {it.minStockAlert})
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {emergencyScan.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-[#161F33] border border-rose-400/35 text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-black text-white flex-1">{item.partyName}</span>
                          <span className="font-black text-rose-300 tabular-nums" dir="ltr">
                            {fmtEgp(item.amountEGP)} EGP
                          </span>
                        </div>
                        <div className="text-slate-300">{item.purpose}</div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                          <span>{item.scopeAr} · {item.urgency === 'emergency' ? 'طوارئ قصوى' : 'عاجل'}</span>
                          <span dir="ltr">{item.dueDate}</span>
                        </div>
                        {item.kind === 'payable' && (
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => void handlePayPayable(item.id, item.amountEGP)}
                            className="w-full min-h-[36px] rounded-xl bg-rose-500/25 border border-rose-400/50 text-rose-100 font-black text-[11px] cursor-pointer"
                          >
                            سداد فوري من السيولة البنكية
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                  اضغط على «فحص الطوارئ والسيولة الآن» لتحليل كافة الالتزامات العاجلة والطارئة.
                </div>
              )}
            </section>
          )}

          {/* TAB 5 & 9: TWO FINANCE MANAGERS GOVERNANCE + 45-DAY AI AUDIT */}
          {activeTab === 'managers' && (
            <section className="rounded-3xl bg-[#111C3A] border border-violet-400/40 p-4 text-white space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-400/60 text-violet-300 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-[#F5D061]">
                      المدراء الماليين والمراجعة الذكية (45 يوم)
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      حد أقصى 2 مديرين معزولين · المتبقي للفحص الدوري:{' '}
                      <strong className="text-white">{dashboard.daysUntilNextAudit} يوم</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={mgrBusy}
                  onClick={() => void handleRunAiManagerAudit()}
                  className="w-full min-h-[42px] px-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {mgrBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>تشغيل فحص AI لحركات المديرين الآن</span>
                </button>
              </div>

              {/* Owner Audit Alerts */}
              {(dashboard.ownerAuditAlerts || []).filter((a) => !a.readByOwner).length > 0 && (
                <div className="space-y-2">
                  {dashboard.ownerAuditAlerts
                    .filter((a) => !a.readByOwner)
                    .map((al) => (
                      <div
                        key={al.alertId}
                        className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-amber-300 flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5 shrink-0" />
                            <span>{al.titleAr}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleMarkAlertRead(al.alertId)}
                            className="text-[10px] font-black text-white underline cursor-pointer shrink-0"
                          >
                            تم الاطلاع
                          </button>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{al.bodyAr}</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Sub-Tabs inside Managers Hub */}
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-black">
                {(
                  [
                    { id: 'managers', label: 'إدارة الحسابين' },
                    { id: 'sub_treasury', label: `حركاتهم (${dashboard.managerSubTreasuryEntries?.length || 0})` },
                    { id: 'archive', label: `الأرشيف (${dashboard.archivedManagerRecords?.length || 0})` },
                    { id: 'reports', label: `تقارير AI (${dashboard.aiManagerAuditReports?.length || 0})` },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setMgrViewSubTab(st.id)}
                    className={`min-h-[36px] px-1.5 rounded-xl border cursor-pointer truncate ${
                      mgrViewSubTab === st.id
                        ? 'bg-[#D4AF37] text-[#0B132B] border-[#F5D061]'
                        : 'bg-[#161F33] text-slate-300 border-white/10'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {mgrViewSubTab === 'managers' && (
                <div className="space-y-3">
                  {/* Active Slots List */}
                  <div className="space-y-2">
                    {(dashboard.financeManagers || [])
                      .filter((m) => m.status !== 'deleted')
                      .map((m) => (
                        <div
                          key={m.managerId}
                          className="p-3.5 rounded-2xl bg-[#161F33] border border-white/10 text-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-black text-white">
                                مدير مالي #{m.slotNumber} — {m.fullName}
                              </div>
                              <div className="text-[11px] font-mono text-[#F5D061]" dir="ltr">
                                @{m.username}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-black shrink-0 ${
                                m.status === 'active' ? 'text-emerald-300' : 'text-amber-300'
                              }`}
                            >
                              {m.status === 'active' ? 'نشط' : 'موقوف مؤقتاً'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={mgrBusy}
                              onClick={() =>
                                void handleToggleManagerStatus(
                                  m.managerId,
                                  m.status === 'active' ? 'suspended' : 'active'
                                )
                              }
                              className="flex-1 min-h-[36px] px-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {m.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              <span>{m.status === 'active' ? 'إيقاف مؤقت' : 'إعادة تفعيل'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={mgrBusy}
                              onClick={() => void handleDeleteManager(m.managerId)}
                              className="flex-1 min-h-[36px] px-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف (مع حفظ الأرشيف)</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Create / Replace Slot Form */}
                  <form
                    onSubmit={handleSaveFinanceManager}
                    className="p-3.5 rounded-2xl bg-[#161F33] border border-violet-400/35 space-y-2.5 text-xs"
                  >
                    <div className="font-black text-[#F5D061] flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      <span>إنشاء أو استبدال حساب مدير مالي (1 أو 2)</span>
                    </div>
                    <select
                      value={mgrSlot}
                      onChange={(e) => setMgrSlot(Number(e.target.value) === 2 ? 2 : 1)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
                    >
                      <option value={1}>الخانة رقم 1 (المدير المالي الأول)</option>
                      <option value={2}>الخانة رقم 2 (المدير المالي الثاني)</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="اسم المستخدم للدخول (مثال: fm_ahmed)"
                      value={mgrUsername}
                      onChange={(e) => setMgrUsername(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="الاسم الكامل"
                      value={mgrFullName}
                      onChange={(e) => setMgrFullName(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
                    />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="كلمة المرور المبدئية (6 أحرف فأكثر)"
                      value={mgrPassword}
                      onChange={(e) => setMgrPassword(e.target.value)}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
                    />
                    <button
                      type="submit"
                      disabled={mgrBusy}
                      className="w-full min-h-[42px] rounded-xl bg-[#D4AF37] text-[#0B132B] font-black cursor-pointer"
                    >
                      حفظ وتفعيل حساب المدير المالي
                    </button>
                  </form>
                </div>
              )}

              {mgrViewSubTab === 'sub_treasury' && (
                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {(dashboard.managerSubTreasuryEntries || []).length === 0 ? (
                    <div className="p-5 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                      لا توجد عمليات مسجلة في الخزينة الفرعية للمدراء بعد.
                    </div>
                  ) : (
                    dashboard.managerSubTreasuryEntries.map((ent) => (
                      <div key={ent.entryId} className="p-3 rounded-2xl bg-[#161F33] border border-white/10 text-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-black text-white">{ent.partyName} — ({ent.managerName})</span>
                          <span className="font-black text-[#F5D061] tabular-nums" dir="ltr">
                            {fmtEgp(ent.amountEGP)} EGP
                          </span>
                        </div>
                        <div className="text-slate-300">{ent.description}</div>
                        <div className="text-[10px] text-slate-400">
                          حالة AI: {ent.aiAuditStatus} · {ent.entryDate}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {mgrViewSubTab === 'archive' && (
                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                    <Archive className="w-4 h-4 shrink-0" />
                    <span>الأرشيف العام محفوظ 100% حتى بعد حذف حساب أي مدير مالي.</span>
                  </div>
                  {(dashboard.archivedManagerRecords || []).length === 0 ? (
                    <div className="p-5 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                      لا توجد سجلات مؤرشفة من مديرين محذوفين حتى الآن.
                    </div>
                  ) : (
                    dashboard.archivedManagerRecords.map((ent) => (
                      <div key={ent.entryId} className="p-3 rounded-2xl bg-[#161F33] border border-white/10 text-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-black text-white">{ent.partyName} (@{ent.managerUsername})</span>
                          <span className="font-black text-slate-200 tabular-nums" dir="ltr">
                            {fmtEgp(ent.amountEGP)} EGP
                          </span>
                        </div>
                        <div className="text-slate-300">{ent.description}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {mgrViewSubTab === 'reports' && (
                <div className="space-y-2.5">
                  {(dashboard.aiManagerAuditReports || []).length === 0 ? (
                    <div className="p-5 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                      لم تصدر تقارير مراجعة ذكية بعد. اضغط على زر الفحص أعلاه.
                    </div>
                  ) : (
                    dashboard.aiManagerAuditReports.map((rep) => (
                      <div key={rep.reportId} className="p-3.5 rounded-2xl bg-[#161F33] border border-[#D4AF37]/30 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-[#F5D061]">
                            تقرير مراجعة ({rep.totalEntriesReviewed} قيد)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            {rep.generatedAt.slice(0, 10)}
                          </span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{rep.summaryAr}</p>
                        <div className="text-[11px] text-amber-300 font-bold">
                          إجمالي المبالغ المراجعة: {fmtEgp(rep.totalVolumeEGP)} ج.م · الملاحظات: {rep.flaggedCount}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          )}

          {/* TAB: SMART EXPENSE ANALYTICS + AI SMART INVESTOR */}
          {activeTab === 'analytics_ai' && (
            <div className="space-y-4 min-w-0">
              {/* Bar + Pie Expense Charts */}
              <section className="rounded-3xl bg-[#111C3A] border border-white/10 p-4 text-white space-y-4 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-[#F5D061]">
                      تحليل المصروفات الذكي والرسوم البيانية
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      مقارنة بصرية دقيقة لتصنيفات الصرف (رواتب، مواد خام، تسويق، عمولات، لوجستيات)
                    </p>
                  </div>
                </div>

                {dashboard.expenseAnalytics.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    سجل عمليات مصروفات أولاً لتفعيل التحليل البياني.
                  </div>
                ) : (
                  <div className="h-56 w-full min-w-0" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboard.expenseAnalytics} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                        <XAxis dataKey="labelAr" stroke="#cbd5e1" fontSize={10} />
                        <YAxis stroke="#cbd5e1" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0B132B',
                            borderColor: '#D4AF37',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="totalEGP" name="إجمالي الصرف (EGP)" radius={[8, 8, 0, 0]}>
                          {dashboard.expenseAnalytics.map((entry, idx) => {
                            const matched = EXPENSE_CATEGORIES.find((c) => c.id === entry.key);
                            return (
                              <Cell
                                key={entry.key}
                                fill={matched?.color || ['#D4AF37', '#38BDF8', '#A78BFA', '#34D399'][idx % 4]}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              {/* AI Smart Investor Full Panel */}
              <section className="rounded-3xl bg-gradient-to-br from-[#161F33] via-[#111C3A] to-[#0B132B] border border-[#D4AF37]/45 p-4 text-white space-y-4 min-w-0">
                <div className="flex flex-col gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#D4AF37]/25 border-2 border-[#D4AF37] text-[#F5D061] flex items-center justify-center relative shrink-0">
                      <BrainCircuit className="w-5 h-5" />
                      <Lightbulb className="w-3.5 h-3.5 text-amber-200 absolute -top-1 -end-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-black text-[#F5D061]">
                        المستثمر الذكي (AI Cash-Flow Advisor)
                      </h2>
                      <p className="text-[11px] text-slate-300">
                        يقرأ صافي الأرصدة والتدفقات النقدية ليقترح فرص استثمارية آمنة في السوق المصري
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() => void handleRunSmartInvestor()}
                    className="w-full min-h-[44px] px-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{aiAnalysis ? 'إعادة التحليل الذكي' : 'تحليل الفائض النقدي الآن'}</span>
                  </button>
                </div>

                {aiError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-xs font-bold text-rose-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                      <span className="break-words">{aiError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRunSmartInvestor()}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/30 hover:bg-rose-500/40 text-white font-black cursor-pointer shrink-0"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="space-y-3 min-w-0">
                    <div className="p-3.5 rounded-2xl bg-[#0B132B]/80 border border-[#D4AF37]/30 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#F5D061]">
                          الملخص الاستراتيجي ({aiGeneratedAt?.slice(0, 10) || todayStr})
                        </span>
                        <span className="text-emerald-300 text-[11px] font-black tabular-nums">
                          الفائض القابل للاستثمار: {fmtEgp(aiAnalysis.investableSurplusEGP)} ج.م · {aiAnalysis.riskPostureAr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed break-words">
                        {aiAnalysis.summaryAr}
                      </p>
                      {aiAnalysis.lockedTreasuryAdviceAr && (
                        <p className="text-[11px] font-bold text-amber-300 pt-1 border-t border-white/10">
                          توصية الخزينة المقفولة (10%): {aiAnalysis.lockedTreasuryAdviceAr}
                        </p>
                      )}
                    </div>

                    {Array.isArray(aiAnalysis.internalOpportunities) && aiAnalysis.internalOpportunities.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-black text-emerald-300">فرص استثمار وتطوير داخل المنصة:</div>
                        {aiAnalysis.internalOpportunities.map((opp, idx) => (
                          <div key={`int-${idx}`} className="p-3.5 rounded-2xl bg-[#161F33] border border-emerald-400/35 space-y-1 text-xs">
                            <div className="flex justify-between gap-2">
                              <span className="font-black text-[#F5D061]">{opp.titleAr}</span>
                              <span className="text-emerald-300 font-black tabular-nums" dir="ltr">{fmtEgp(opp.allocationEGP)} EGP</span>
                            </div>
                            <div className="text-[11px] text-sky-300">{opp.expectedYieldAr} · {opp.horizonAr}</div>
                            <p className="text-[11px] text-slate-300">{opp.rationaleAr}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {Array.isArray(aiAnalysis.externalOpportunities) && aiAnalysis.externalOpportunities.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-black text-sky-300">فرص استثمار خارجية آمنة:</div>
                        {aiAnalysis.externalOpportunities.map((opp, idx) => (
                          <div key={`ext-${idx}`} className="p-3.5 rounded-2xl bg-[#161F33] border border-sky-400/35 space-y-1 text-xs">
                            <div className="flex justify-between gap-2">
                              <span className="font-black text-[#F5D061]">{opp.titleAr}</span>
                              <span className="text-sky-300 font-black tabular-nums" dir="ltr">{fmtEgp(opp.allocationEGP)} EGP</span>
                            </div>
                            <div className="text-[11px] text-emerald-300">{opp.expectedYieldAr} · {opp.horizonAr}</div>
                            <p className="text-[11px] text-slate-300">{opp.rationaleAr}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {(aiAnalysis.opportunities || []).map((opp, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-[#161F33] border border-[#D4AF37]/30 space-y-1.5 flex flex-col justify-between min-w-0"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-black text-[#F5D061]">{opp.titleAr}</span>
                            <span className="text-emerald-300 text-[10px] font-black">
                              {opp.safetyLevelAr}
                            </span>
                          </div>
                          <div className="text-sm font-black text-white tabular-nums" dir="ltr">
                            تخصيص مقترح: {fmtEgp(opp.allocationEGP)} EGP
                          </div>
                          <div className="text-[11px] text-sky-300 font-bold">
                            العائد المتوقع: {opp.expectedYieldAr} · المدة: {opp.horizonAr}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed pt-1 break-words">
                            {opp.rationaleAr}
                          </p>
                        </div>
                      ))}
                    </div>

                    {Array.isArray(aiAnalysis.cashflowWarnings) && aiAnalysis.cashflowWarnings.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1">
                        <div className="text-xs font-black text-amber-300">تنبيهات وتحسينات التدفق النقدي:</div>
                        <ul className="space-y-1 text-xs text-slate-200 list-disc ps-5">
                          {aiAnalysis.cashflowWarnings.map((w, idx) => (
                            <li key={idx} className="break-words">{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB: IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <section className="rounded-3xl bg-[#111C3A] border border-white/15 p-4 text-white space-y-4 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D061] flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-[#F5D061]">سجل التدقيق التاريخي غير القابل للتعديل</h2>
                  <p className="text-[11px] text-slate-400">
                    يوثق جميع حركات التحصيل والمصروفات والتسويات واستخراج PDF
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto min-w-0">
                {dashboard.auditLogs.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#161F33] text-center text-xs text-slate-400">
                    لا توجد قيود تدقيق بعد.
                  </div>
                ) : (
                  dashboard.auditLogs.map((log) => (
                    <div
                      key={log.logId}
                      className="p-3.5 rounded-2xl bg-[#161F33] border border-white/10 space-y-1.5 text-xs min-w-0"
                    >
                      <div className="font-black text-white break-words">{log.actionAr}</div>
                      <div className="text-[11px] text-slate-400 break-words">{log.details}</div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-[10px]">
                        <span className="font-black text-[#F5D061]">{log.category}</span>
                        <span className="font-mono text-slate-400 tabular-nums" dir="ltr">
                          {log.createdAt.replace('T', ' ').slice(0, 19)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* Account Balance Adjust Modal (Constrained to 430px) */}
      {adjustModalOpen && (
        <div
          className="fixed inset-0 max-w-[430px] w-full mx-auto z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => setAdjustModalOpen(false)}
        >
          <form
            onSubmit={handleAdjustBalance}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-[#111C3A] border border-[#D4AF37]/40 p-5 text-white space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#F5D061]">تعديل أو تغذية صافي الأرصدة</h3>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <select
                value={adjChannel}
                onChange={(e) => setAdjChannel(e.target.value as OwnerFinanceChannel)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
              >
                {CHANNELS.map((c) => (
                  <option key={c.id} value={c.id}>
                    الحساب: {c.labelAr}
                  </option>
                ))}
              </select>
              <select
                value={adjMode}
                onChange={(e) => setAdjMode(e.target.value as 'set' | 'deposit' | 'withdraw')}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
              >
                <option value="deposit">إيداع / زيادة الرصيد (+)</option>
                <option value="withdraw">سحب / خفض الرصيد (-)</option>
                <option value="set">ضبط الرصيد الافتتاحي بقيمة محددة (=)</option>
              </select>
              <input
                type="number"
                step="0.01"
                required
                placeholder="المبلغ (ج.م)"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white tabular-nums"
              />
              <input
                type="text"
                placeholder="السبب أو المرجع البنكي (اختياري)"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={actionBusy}
              className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black text-xs cursor-pointer"
            >
              اعتماد التسوية
            </button>
          </form>
        </div>
      )}

      {/* Multi-Modal Security Unlock Modal for Total Available Funds */}
      {totalFundsModalOpen && dashboard && (
        <div
          className="fixed inset-0 max-w-[430px] w-full mx-auto z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => {
            stopTotalFundsCamera();
            setTotalFundsModalOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-[#111C3A] border-2 border-[#D4AF37]/60 p-5 text-white space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-[#F5D061]" />
                <h3 className="text-sm font-black text-[#F5D061]">
                  التحقق لفتح شاشة إجمالي المال المتاح
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopTotalFundsCamera();
                  setTotalFundsModalOpen(false);
                }}
                className="p-1.5 rounded-full bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {totalFundsError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/50 text-xs font-bold text-rose-200">
                {totalFundsError}
              </div>
            )}

            {dashboard.totalFundsGate.authMethod === 'camera_face' ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">
                  التقط صورة حية عبر الكاميرا الأمامية للتحقق من هوية المالك وفتح الإجمالي المتاح:
                </p>
                <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/15">
                  {cameraActive ? (
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-slate-500" />
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={() => void startTotalFundsCamera()}
                    className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black cursor-pointer"
                  >
                    تشغيل الكاميرا الحية
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={totalFundsBusy}
                    onClick={() => void captureAndUnlockTotalFundsCamera()}
                    className="w-full min-h-[44px] rounded-xl bg-emerald-400 text-[#0B132B] font-black cursor-pointer"
                  >
                    {totalFundsBusy ? 'جاري التحقق...' : 'التقاط الصورة وفتح الخزينة'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {isWebAuthnSupported() && (
                  <button
                    type="button"
                    disabled={totalFundsBusy}
                    onClick={() => void handleUnlockTotalFundsBiometric()}
                    className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {dashboard.totalFundsGate.authMethod === 'iris' ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Fingerprint className="w-4 h-4" />
                    )}
                    <span>
                      {dashboard.totalFundsGate.authMethod === 'iris'
                        ? 'التحقق عبر بصمة العين / Face ID'
                        : 'التحقق عبر بصمة الإصبع (WebAuthn)'}
                    </span>
                  </button>
                )}
                <form onSubmit={handleUnlockTotalFundsPin} className="space-y-2 pt-2 border-t border-white/10">
                  <input
                    type="password"
                    required
                    placeholder="أو أدخل رمز المالك السري (PIN)"
                    value={totalFundsPinInput}
                    onChange={(e) => setTotalFundsPinInput(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#0B132B] border border-white/15 text-white font-mono outline-none"
                  />
                  <button
                    type="submit"
                    disabled={totalFundsBusy}
                    className="w-full min-h-[42px] rounded-xl bg-white/15 border border-[#D4AF37]/40 text-[#F5D061] font-black cursor-pointer"
                  >
                    {totalFundsBusy ? 'جاري الفتح...' : 'فتح برمز المالك'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Gold PDF Report Extractor Button constrained cleanly inside 430px */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-0 max-w-[430px] mx-auto px-3 z-35 pointer-events-none flex justify-start">
        <button
          type="button"
          onClick={() => setPdfModalOpen(true)}
          className="pointer-events-auto h-11 px-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#D4AF37] text-[#0B132B] font-black text-xs shadow-[0_12px_28px_-6px_rgba(212,175,55,0.65)] ring-2 ring-[#0B132B] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>تقرير PDF</span>
        </button>
      </div>

      {/* Period PDF Selector Modal (Constrained to 430px) */}
      {pdfModalOpen && (
        <div
          className="fixed inset-0 max-w-[430px] w-full mx-auto z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => setPdfModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-3xl bg-[#111C3A] border border-[#D4AF37]/45 p-5 text-white space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#F5D061]">استخراج كشف الحساب التنفيذي PDF</h3>
              <button
                type="button"
                onClick={() => setPdfModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              اختر الفترة الزمنية لكشف الحساب المطبوع شاملةً الأرصدة والمتحصلات والعمولات والمصروفات والذمم:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'day', label: 'اليوم' },
                  { id: 'week', label: 'الأسبوع' },
                  { id: 'month', label: 'الشهر' },
                ] as { id: PdfPeriod; label: string }[]
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPdfPeriod(p.id)}
                  className={`min-h-[44px] rounded-xl text-xs font-black cursor-pointer border ${
                    pdfPeriod === p.id
                      ? 'bg-[#D4AF37] text-[#0B132B] border-[#F5D061]'
                      : 'bg-[#161F33] text-slate-300 border-white/15'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void handleTriggerPdfPrint()}
              className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B132B] font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>طباعة / حفظ بصيغة PDF (A4)</span>
            </button>
          </div>
        </div>
      )}

      {/* A4 Printable Statement Portal */}
      {isPrintingStatement &&
        printPortalTarget &&
        dashboard &&
        periodFilteredReport &&
        createPortal(
          <div dir="rtl" className="p-8 bg-white text-slate-900 font-sans space-y-6">
            <div className="border-b-2 border-[#0B132B] pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#0B132B]">
                  باسط | BASIT — المنصة المالية الخاصة بالمالك
                </h1>
                <p className="text-sm font-bold text-slate-600 mt-1">
                  كشف حساب مالي تنفيذي سري · {periodFilteredReport.periodLabelAr}
                </p>
              </div>
              <div className="text-left text-xs text-slate-500 font-mono" dir="ltr">
                <div>Owner: {ownerEmail}</div>
                <div>Generated: {new Date().toISOString().slice(0, 16).replace('T', ' ')}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl border border-slate-300">
                <div className="text-[11px] font-bold text-slate-500">صافي الأرصدة الحالية</div>
                <div className="text-base font-black text-[#0B132B] tabular-nums" dir="ltr">
                  {fmtEgp(dashboard.accounts.totalNetBalance)} EGP
                </div>
              </div>
              <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50">
                <div className="text-[11px] font-bold text-emerald-700">صافي المتحصلات (الفترة)</div>
                <div className="text-base font-black text-emerald-900 tabular-nums" dir="ltr">
                  {fmtEgp(periodFilteredReport.inflowsNet)} EGP
                </div>
              </div>
              <div className="p-3 rounded-xl border border-amber-300 bg-amber-50">
                <div className="text-[11px] font-bold text-amber-800">العمولات المخصومة (منفصلة)</div>
                <div className="text-base font-black text-amber-900 tabular-nums" dir="ltr">
                  {fmtEgp(periodFilteredReport.inflowsCommissions)} EGP
                </div>
              </div>
              <div className="p-3 rounded-xl border border-rose-300 bg-rose-50">
                <div className="text-[11px] font-bold text-rose-700">إجمالي المصروفات (الفترة)</div>
                <div className="text-base font-black text-rose-900 tabular-nums" dir="ltr">
                  {fmtEgp(periodFilteredReport.outflowsTotal)} EGP
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-100">
                <strong>البنوك:</strong> <span dir="ltr">{fmtEgp(dashboard.accounts.bank)} EGP</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100">
                <strong>المحفظة الإلكترونية:</strong> <span dir="ltr">{fmtEgp(dashboard.accounts.e_wallet)} EGP</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100">
                <strong>الخزينة النقدية:</strong> <span dir="ltr">{fmtEgp(dashboard.accounts.treasury)} EGP</span>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-black text-[#0B132B] mb-2">تفاصيل المتحصلات خلال الفترة</h2>
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-start">المصدر</th>
                    <th className="border border-slate-300 p-2 text-start">التاريخ</th>
                    <th className="border border-slate-300 p-2 text-start">الغرض</th>
                    <th className="border border-slate-300 p-2 text-start">العمولة المخصومة</th>
                    <th className="border border-slate-300 p-2 text-start">الصافي</th>
                  </tr>
                </thead>
                <tbody>
                  {periodFilteredReport.pInflows.map((row) => (
                    <tr key={row.entryId}>
                      <td className="border border-slate-300 p-2">{row.sourceOrBeneficiary}</td>
                      <td className="border border-slate-300 p-2 font-mono">{row.entryDate}</td>
                      <td className="border border-slate-300 p-2">{row.purpose}</td>
                      <td className="border border-slate-300 p-2 font-mono">{fmtEgp(row.commissionEGP)}</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{fmtEgp(row.netEGP)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="text-sm font-black text-[#0B132B] mb-2">تفاصيل المصروفات خلال الفترة</h2>
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-start">المستفيد</th>
                    <th className="border border-slate-300 p-2 text-start">التاريخ</th>
                    <th className="border border-slate-300 p-2 text-start">الغرض</th>
                    <th className="border border-slate-300 p-2 text-start">التصنيف</th>
                    <th className="border border-slate-300 p-2 text-start">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {periodFilteredReport.pOutflows.map((row) => (
                    <tr key={row.entryId}>
                      <td className="border border-slate-300 p-2">{row.sourceOrBeneficiary}</td>
                      <td className="border border-slate-300 p-2 font-mono">{row.entryDate}</td>
                      <td className="border border-slate-300 p-2">{row.purpose}</td>
                      <td className="border border-slate-300 p-2">{getExpenseCategoryLabel(row.expenseCategory)}</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{fmtEgp(row.netEGP)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-300">
              <div>
                <strong>إجمالي مستحقاتنا عند العملاء (لينا بره):</strong>{' '}
                <span dir="ltr">{fmtEgp(dashboard.totals.totalReceivablesOpen)} EGP</span>
              </div>
              <div>
                <strong>إجمالي التزاماتنا للموردين (علينا بره):</strong>{' '}
                <span dir="ltr">{fmtEgp(dashboard.totals.totalPayablesOpen)} EGP</span>
              </div>
            </div>
          </div>,
          printPortalTarget
        )}
    </div>
  );
};
