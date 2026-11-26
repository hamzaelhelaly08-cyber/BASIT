import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  Eye,
  EyeOff,
  Plus,
  TrendingUp,
  DollarSign,
  Receipt,
  Building2,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  ChefHat,
  Database,
  Link2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calculator,
  Search,
  Calendar,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Banknote,
  Coins,
} from 'lucide-react';
import {
  FinancialTransaction,
  FoodIngredient,
  MenuItemRecipe,
  StoreIntegration,
  TransactionDirection,
  AccountChannel,
} from '../types/financeCost';

interface FinancialCostControlHubProps {
  isRtl: boolean;
  onShowToast: (msg: string) => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
}

const INITIAL_INGREDIENTS: FoodIngredient[] = [];
const INITIAL_RECIPES: MenuItemRecipe[] = [];

export const FinancialCostControlHub: React.FC<FinancialCostControlHubProps> = ({
  isRtl,
  onShowToast,
  onAddAuditLog,
}) => {
  // Owner PIN Lock Gate State
  const [ownerPin, setOwnerPin] = useState<string>(() => localStorage.getItem('basit_owner_pin') || '1234');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showChangePin, setShowChangePin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');

  // Privacy Eye Toggle
  const [isMasked, setIsMasked] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'transactions' | 'food_cost' | 'stores_sync'>('transactions');

  // Transactions State (Start clean at 0.00 by default unless saved)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('basit_fin_transactions_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return []; // Clean start with zero dummy data
  });

  // Food Cost Ingredients & Recipes State
  const [ingredients, setIngredients] = useState<FoodIngredient[]>(() => {
    const saved = localStorage.getItem('basit_food_ingredients_v2');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [recipes, setRecipes] = useState<MenuItemRecipe[]>(() => {
    const saved = localStorage.getItem('basit_menu_recipes_v2');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  // Store Integrations State
  const [stores, setStores] = useState<StoreIntegration[]>(() => {
    const saved = localStorage.getItem('basit_store_integrations_v2');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'store_habe',
            storeName: 'تطبيق H-A-B-E (مدفوعات هابي الداخلية)',
            webhookUrl: 'https://ais-dev-gnhy35harwbwwc6w5w7yr4.europe-west2.run.app/api/habe/financial-webhook',
            apiKey: 'habe_secure_fin_99',
            isActive: true,
            autoImportEnabled: true,
          },
          {
            id: 'store_alain',
            storeName: 'متجر عالم مول العين',
            webhookUrl: 'https://ais-dev-gnhy35harwbwwc6w5w7yr4.europe-west2.run.app/api/alain/webhook',
            apiKey: 'alain_sec_1188',
            isActive: true,
            autoImportEnabled: true,
          },
        ];
  });

  // Filter States
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Transaction Entry Form State
  const [amount, setAmount] = useState<string>('');
  const [direction, setDirection] = useState<TransactionDirection>('inflow');
  const [partyName, setPartyName] = useState<string>('');
  const [category, setCategory] = useState<string>('توريد وجبات');
  const [channel, setChannel] = useState<AccountChannel>('vodafone_cash');
  const [commissionPct, setCommissionPct] = useState<string>('0');
  const [baseCost, setBaseCost] = useState<string>('0');
  const [isOwedToMe, setIsOwedToMe] = useState<boolean>(false);
  const [isOwedByMe, setIsOwedByMe] = useState<boolean>(false);
  const [trxDate, setTrxDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [trxNotes, setTrxNotes] = useState<string>('');

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('basit_fin_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('basit_food_ingredients_v2', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('basit_menu_recipes_v2', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('basit_store_integrations_v2', JSON.stringify(stores));
  }, [stores]);

  // Handle Unlock PIN
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === ownerPin) {
      setIsUnlocked(true);
      onShowToast(isRtl ? 'تم فتح قفل النظام المالي بنجاح.' : 'Financial system unlocked.');
    } else {
      onShowToast(isRtl ? 'الرقم السري خطأ. حاول مرة أخرى.' : 'Incorrect PIN.');
    }
  };

  // Handle Change PIN
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      setOwnerPin(newPin.trim());
      localStorage.setItem('basit_owner_pin', newPin.trim());
      setShowChangePin(false);
      setNewPin('');
      onShowToast(isRtl ? 'تم تحديث الرقم السري للـمالك بنجاح.' : 'Owner PIN updated.');
    } else {
      onShowToast(isRtl ? 'يجب أن يكون الرقم السري 4 أرقام على الأقل.' : 'PIN must be at least 4 digits.');
    }
  };

  // Clear All Data (Clean Start)
  const handleClearAllData = () => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من مسح جميع السجلات والبدء على نظافة (0.00)؟' : 'Clear all data to 0.00?')) {
      setTransactions([]);
      setIngredients([]);
      setRecipes([]);
      localStorage.removeItem('basit_fin_transactions_v2');
      localStorage.removeItem('basit_food_ingredients_v2');
      localStorage.removeItem('basit_menu_recipes_v2');
      onShowToast(isRtl ? 'تمت تصفية النظام والبدء على نظافة بنجاح.' : 'System cleared to clean start.');
    }
  };

  // Calculations & Summaries
  const summary = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalBaseCost = 0;
    let totalCommission = 0;
    let totalReceivables = 0; // ليا
    let totalPayables = 0; // عليا

    // Channel breakdown
    let vodafoneCashBalance = 0;
    let bankBalance = 0;
    let cashBalance = 0;
    let inAppHabeBalance = 0;

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      const cost = Number(t.baseCost) || 0;
      const comm = (amt * (Number(t.commissionPercentage) || 0)) / 100;

      if (t.direction === 'inflow') {
        totalInflow += amt;
        totalBaseCost += cost;
        totalCommission += comm;
        if (t.channel === 'vodafone_cash') vodafoneCashBalance += amt;
        else if (t.channel === 'bank') bankBalance += amt;
        else if (t.channel === 'cash') cashBalance += amt;
        else if (t.channel === 'in_app_habe') inAppHabeBalance += amt;
      } else if (t.direction === 'outflow' || t.direction === 'personal') {
        totalOutflow += amt;
        if (t.channel === 'vodafone_cash') vodafoneCashBalance -= amt;
        else if (t.channel === 'bank') bankBalance -= amt;
        else if (t.channel === 'cash') cashBalance -= amt;
        else if (t.channel === 'in_app_habe') inAppHabeBalance -= amt;
      }

      if (t.isOwedToMe) totalReceivables += amt;
      if (t.isOwedByMe) totalPayables += amt;
    });

    // Net profit = Inflow - Base Cost - Commission - Outflow (or specific profit isolation)
    const netProfit = totalInflow - totalBaseCost - totalCommission - totalOutflow;
    const remainingBalance = totalInflow - totalOutflow;

    return {
      totalInflow,
      totalOutflow,
      totalBaseCost,
      totalCommission,
      totalReceivables,
      totalPayables,
      netProfit,
      remainingBalance,
      vodafoneCashBalance,
      bankBalance,
      cashBalance,
      inAppHabeBalance,
    };
  }, [transactions]);

  const fmt = (val: number) => {
    if (isMasked) return '••••••';
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Add Transaction Handler
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = Number(amount);
    if (!Number.isFinite(amtNum) || amtNum <= 0) {
      onShowToast(isRtl ? 'يرجى إدخال مبلغ صحيح أكبر من صفر.' : 'Enter a valid amount.');
      return;
    }

    const costNum = Number(baseCost) || 0;
    const commPct = Number(commissionPct) || 0;
    const commAmt = (amtNum * commPct) / 100;
    const netProf = direction === 'inflow' ? amtNum - costNum - commAmt : -amtNum;

    const newTrx: FinancialTransaction = {
      id: 'trx_' + Date.now(),
      amount: amtNum,
      direction,
      partyName: partyName.trim() || (isRtl ? 'جهة عامة' : 'General Party'),
      category: category.trim(),
      channel,
      commissionPercentage: commPct,
      baseCost: costNum,
      netProfit: netProf,
      isOwedToMe,
      isOwedByMe,
      date: trxDate,
      notes: trxNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    setTransactions([newTrx, ...transactions]);
    onShowToast(isRtl ? 'تم تسجيل الحركة المالية وتحديث الحسابات بنجاح.' : 'Transaction recorded & balances updated.');
    onAddAuditLog(
      `تسجيل عملية (${direction}) بمبلغ ${amtNum} ج.م عبر (${channel})`,
      `Recorded Transaction (${direction})`,
      partyName
    );

    setAmount('');
    setPartyName('');
    setBaseCost('0');
    setCommissionPct('0');
    setTrxNotes('');
    setIsOwedToMe(false);
    setIsOwedByMe(false);
  };

  // Delete Transaction
  const handleDeleteTrx = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    onShowToast(isRtl ? 'تم حذف الحركة المالية.' : 'Transaction deleted.');
  };

  // Simulate Webhook Incoming Payment (e.g. from HABE app or internal manager)
  const handleSimulateWebhook = (storeName: string) => {
    const mockAmt = Math.floor(Math.random() * 3000) + 500;
    const mockCost = Math.floor(mockAmt * 0.45);
    const newTrx: FinancialTransaction = {
      id: 'trx_webhook_' + Date.now(),
      amount: mockAmt,
      direction: 'inflow',
      partyName: `${storeName} (تحصيل تلقائي)`,
      category: 'مدفوعات تطبيق هابي / توريد',
      channel: 'in_app_habe',
      commissionPercentage: 5,
      baseCost: mockCost,
      netProfit: mockAmt * 0.95 - mockCost,
      isOwedToMe: false,
      isOwedByMe: false,
      date: new Date().toISOString().slice(0, 10),
      notes: 'تم الوارد عبر Webhook متجر هابي / المدير المالي',
      createdAt: new Date().toISOString(),
    };

    setTransactions([newTrx, ...transactions]);
    onShowToast(
      isRtl
        ? `تم استلام دفعة جديدة من ${storeName} بقيمة ${mockAmt} ج.م وتحديث الأرباح فوراً!`
        : `Webhook received from ${storeName} for ${mockAmt} EGP!`
    );
    onAddAuditLog('استلام دفعة عبر Webhook المتاجر والتطبيقات', 'Webhook Ingestion Received', storeName);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterDirection !== 'all' && t.direction !== filterDirection) return false;
      if (filterChannel !== 'all' && t.channel !== filterChannel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.partyName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      }
      return true;
    });
  }, [transactions, filterDirection, filterChannel, searchQuery]);

  // ==================== OWNER PIN LOCK GATE SCREEN ====================
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-[32px] bg-white dark:bg-[#292333] border-2 border-[#62339A]/40 shadow-[0_20px_50px_rgba(98,51,154,0.25)] space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#62339A] text-[#FFC928] mx-auto flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[#292333] dark:text-white">
            {isRtl ? 'بوابة الخصوصية والأمان — المالك فقط' : 'Owner-Only Financial Security Gate'}
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'هذا القسم محمي بكلمة مرور خاصة بالمالك. يرجى إدخال الرقم السري لعرض الحسابات والأرباح.'
              : 'This financial section is strictly locked for the owner. Please enter your PIN.'}
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-5 h-5 text-slate-400 absolute start-3.5 top-3.5" />
            <input
              type="password"
              maxLength={8}
              required
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder={isRtl ? 'أدخل الرقم السري (الافتراضي: 1234)' : 'Enter PIN (Default: 1234)'}
              className="min-h-[48px] w-full ps-11 pe-4 rounded-2xl bg-slate-100 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/40 text-sm font-black tracking-widest text-center"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] w-full rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black cursor-pointer shadow-md active:scale-95 transition-transform"
          >
            {isRtl ? 'فتح القفل المحاسبي' : 'Unlock Financial System'}
          </button>
        </form>

        <div className="text-[11px] font-bold text-slate-400">
          {isRtl ? 'الرقم السري الافتراضي للتجربة هو: 1234' : 'Default PIN is: 1234'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header with Privacy Eye Toggle & Clean Start Options */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#1E162F] via-[#292333] to-[#120B1F] text-white border border-[#FFC928]/30 shadow-[0_15px_40px_rgba(98,51,154,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC928] via-[#F59E0B] to-[#D97706] flex items-center justify-center text-[#292333] shadow-lg shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isRtl ? 'الإدارة المالية، كوست كنترول الأغذية وحساب "أنت كسبان كام"' : 'Financial & Food Cost Hub (Owner Mode)'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                {isRtl ? 'محمي للمالك فقط' : 'Owner Locked'}
              </span>
            </div>
            <p className="text-xs font-medium text-[#EFE9F9]/80">
              {isRtl
                ? 'تتبع لحظي لفودافون كاش، الحسابات البنكية، مدفوعات تطبيق هابي، عزل الأرباح، وتتبع (ليا / عليا).'
                : 'Real-time tracking of Vodafone Cash, bank accounts, HABE in-app payments, and Net Profit isolation.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Privacy Eye Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMasked(!isMasked)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-white flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            title={isMasked ? 'إظهار الأرصدة' : 'إخفاء الأرصدة (خصوصية)'}
          >
            {isMasked ? <EyeOff className="w-4 h-4 text-[#FFC928]" /> : <Eye className="w-4 h-4 text-emerald-400" />}
            <span>{isMasked ? (isRtl ? 'إظهار الأرقام' : 'Reveal') : isRtl ? 'وضع الخصوصية (إخفاء)' : 'Mask Privacy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowChangePin(!showChangePin)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#FFC928]" />
            <span>{isRtl ? 'تغيير الرقم السري' : 'Change PIN'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearAllData}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-black text-rose-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isRtl ? 'بدء على نظافة (صفر)' : 'Clean Start'}</span>
          </button>
        </div>
      </div>

      {/* Change PIN Modal / Form */}
      {showChangePin && (
        <form onSubmit={handleChangePin} className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#62339A]/30 space-y-3 max-w-sm">
          <div className="text-xs font-black text-[#292333] dark:text-white">
            {isRtl ? 'تعيين رقم سري جديد للمالك:' : 'Set New Owner PIN:'}
          </div>
          <input
            type="password"
            required
            minLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder={isRtl ? 'أدخل الرقم السري الجديد (4 أرقام فأكثر)' : 'New PIN'}
            className="min-h-[40px] w-full px-3 rounded-xl bg-slate-100 dark:bg-[#1E162F] border border-slate-300 text-xs font-black"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
            >
              {isRtl ? 'حفظ الرقم السري' : 'Save PIN'}
            </button>
            <button
              type="button"
              onClick={() => setShowChangePin(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-black cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {/* 2. Real-Time Accounts & Wallets Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-rose-500/30 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600">
            <span>{isRtl ? 'فودافون كاش' : 'Vodafone Cash'}</span>
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#292333] dark:text-white tabular-nums" dir="ltr">
            {fmt(summary.vodafoneCashBalance)} <span className="text-xs font-bold">EGP</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-blue-500/30 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-blue-600">
            <span>{isRtl ? 'الحساب البنكي' : 'Bank Account'}</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#292333] dark:text-white tabular-nums" dir="ltr">
            {fmt(summary.bankBalance)} <span className="text-xs font-bold">EGP</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-amber-500/30 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-600">
            <span>{isRtl ? 'النقدية (الخزنة)' : 'Cash in Hand'}</span>
            <Banknote className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#292333] dark:text-white tabular-nums" dir="ltr">
            {fmt(summary.cashBalance)} <span className="text-xs font-bold">EGP</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#62339A]/30 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#62339A] dark:text-[#FFC928]">
            <span>{isRtl ? 'مدفوعات تطبيق هابي' : 'In-App HABE Payments'}</span>
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#292333] dark:text-white tabular-nums" dir="ltr">
            {fmt(summary.inAppHabeBalance)} <span className="text-xs font-bold">EGP</span>
          </div>
        </div>
      </div>

      {/* 3. "How Much Did I Earn?" Net Profit & Receivables vs Payables Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Profit Card ("أنت كسبان كام") */}
        <div className="p-5 rounded-[24px] bg-gradient-to-br from-[#FFC928] via-[#F59E0B] to-[#D97706] text-[#292333] shadow-lg space-y-2 relative overflow-hidden">
          <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/20 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-black">
            <span>{isRtl ? 'صافي الربح الفعلي (أنت كسبان كام؟)' : 'Exact Net Profit (Earned)'}</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight tabular-nums" dir="ltr">
            {fmt(summary.netProfit)} <span className="text-sm font-bold">{isRtl ? 'ج.م' : 'EGP'}</span>
          </div>
          <div className="text-[11px] font-extrabold opacity-95">
            {isRtl ? 'إجمالي الداخل ناقص التكاليف الأساسية والعمولات والمصروفات' : 'Gross inflow minus base costs & expenses'}
          </div>
        </div>

        {/* Receivables ("اللي ليا / عند الغير") */}
        <div className="p-5 rounded-[24px] bg-white dark:bg-[#292333] border border-emerald-500/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{isRtl ? 'مستحقات لنا (ليا عند الغير)' : 'Receivables (Owed to Me)'}</span>
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums" dir="ltr">
            {fmt(summary.totalReceivables)} <span className="text-xs font-bold">{isRtl ? 'ج.م' : 'EGP'}</span>
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            {isRtl ? 'أموال وحقوق لنا لدى العملاء أو الجهات' : 'Rights & receivables to collect'}
          </div>
        </div>

        {/* Payables & Debts ("اللي عليا / مديون به") */}
        <div className="p-5 rounded-[24px] bg-white dark:bg-[#292333] border border-rose-500/30 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
            <span>{isRtl ? 'التزامات وديون (اللي عليا)' : 'Payables & Debts (Owed by Me)'}</span>
            <Receipt className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums" dir="ltr">
            {fmt(summary.totalPayables)} <span className="text-xs font-bold">{isRtl ? 'ج.م' : 'EGP'}</span>
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            {isRtl ? 'التزامات ومستحقات واجبة السداد للموردين' : 'Liabilities & debts to pay'}
          </div>
        </div>
      </div>

      {/* 4. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#62339A]/20 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black cursor-pointer transition-all ${
            activeTab === 'transactions'
              ? 'bg-[#62339A] text-white shadow-md'
              : 'bg-white dark:bg-[#292333] text-slate-700 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          {isRtl ? 'سجل العمليات اليومية والإدخال السريع' : 'Daily Transactions & Entry'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stores_sync')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black cursor-pointer transition-all ${
            activeTab === 'stores_sync'
              ? 'bg-[#62339A] text-white shadow-md'
              : 'bg-white dark:bg-[#292333] text-slate-700 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          {isRtl ? 'روابط متاجر التطبيق وتطبيق هابي (Webhook Sync)' : 'App Webhooks & HABE Sync'}
        </button>
      </div>

      {/* ==================== TAB 1: TRANSACTIONS & QUICK ENTRY ==================== */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Quick Entry Form */}
          <form
            onSubmit={handleAddTransaction}
            className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#292333] border border-[#62339A]/20 space-y-4 shadow-sm"
          >
            <h3 className="text-sm font-black text-[#62339A] dark:text-[#FFC928] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إدخال بسيط وسريع لحركة مالية جديدة (فودافون كاش، بنك، نقدي، هابي)' : 'Quick Entry (Vodafone Cash, Bank, Cash, HABE)'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'اتجاه العملية' : 'Direction'}
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as TransactionDirection)}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-bold"
                >
                  <option value="inflow">{isRtl ? 'داخل / اللي بيخش (Inflow / Income)' : 'Inflow'}</option>
                  <option value="outflow">{isRtl ? 'طالع / مصروف (Outflow / Expense)' : 'Outflow'}</option>
                  <option value="personal">{isRtl ? 'التزام شخصي (Personal Obligation)' : 'Personal'}</option>
                  <option value="receivable">{isRtl ? 'ليا عند الغير (Receivable)' : 'Receivable (Owed to Me)'}</option>
                  <option value="payable">{isRtl ? 'عليا / مديون (Payable / Debt)' : 'Payable (Owed by Me)'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'المبلغ (ج.م)' : 'Amount (EGP)'}
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'الحساب / القناة المستخدمة' : 'Account Channel'}
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as AccountChannel)}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-bold"
                >
                  <option value="vodafone_cash">{isRtl ? 'فودافون كاش (Vodafone Cash)' : 'Vodafone Cash'}</option>
                  <option value="bank">{isRtl ? 'الحساب البنكي (Bank Account)' : 'Bank Account'}</option>
                  <option value="cash">{isRtl ? 'نقدي بالخزنة (Cash)' : 'Cash'}</option>
                  <option value="in_app_habe">{isRtl ? 'تطبيق هابي / مدفوعات داخلية (In-App HABE)' : 'In-App HABE'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'داخل من عند مين / رايح لمين' : 'Party Name'}
                </label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder={isRtl ? 'مثال: موظف مصنع، مورد لحوم...' : 'Party Name'}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'التصنيف' : 'Category'}
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={isRtl ? 'تصنيف العملية...' : 'Category'}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'التكلفة الأساسية (ج.م)' : 'Base Cost'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={baseCost}
                  onChange={(e) => setBaseCost(e.target.value)}
                  placeholder="0.00"
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'نسبة العمولة أو الحصة %' : 'Commission %'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(e.target.value)}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'التاريخ' : 'Date'}
                </label>
                <input
                  type="date"
                  value={trxDate}
                  onChange={(e) => setTrxDate(e.target.value)}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 font-mono text-xs"
                />
              </div>
            </div>

            {/* Checkboxes for "ليا / عليا" */}
            <div className="flex flex-wrap items-center gap-4 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOwedToMe}
                  onChange={(e) => setIsOwedToMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#62339A]"
                />
                <span>{isRtl ? 'إضافة إلى رصيد (ليا عند الغير / ذمم مدينة)' : 'Mark as Owed to Me (Receivable)'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOwedByMe}
                  onChange={(e) => setIsOwedByMe(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600"
                />
                <span>{isRtl ? 'إضافة إلى رصيد (عليا / مديون به)' : 'Mark as Owed by Me (Debt/Payable)'}</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'ملاحظات إضافية' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={trxNotes}
                  onChange={(e) => setTrxNotes(e.target.value)}
                  placeholder={isRtl ? 'تفاصيل الحركة...' : 'Transaction notes...'}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-slate-50 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 text-xs"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] px-6 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black cursor-pointer shrink-0 shadow-md"
              >
                {isRtl ? 'حفظ الحركة وتحديث الأرصدة' : 'Save & Update Balances'}
              </button>
            </div>
          </form>

          {/* Transactions Table with Filters */}
          <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#292333] border border-[#62339A]/20 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#62339A]" />
                <h3 className="text-sm sm:text-base font-black text-[#292333] dark:text-white">
                  {isRtl ? 'سجل العمليات والحركات اللحظية' : 'Real-Time Transactions Ledger'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#62339A]/10 text-[#62339A] dark:text-[#FFC928] text-xs font-black">
                  {filteredTransactions.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRtl ? 'بحث في السجل...' : 'Search records...'}
                    className="min-h-[38px] w-full sm:w-48 ps-9 pe-3 rounded-xl bg-slate-100 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 text-xs font-bold"
                  />
                </div>

                <select
                  value={filterDirection}
                  onChange={(e) => setFilterDirection(e.target.value)}
                  className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 text-xs font-bold"
                >
                  <option value="all">{isRtl ? 'كل الاتجاهات' : 'All Directions'}</option>
                  <option value="inflow">{isRtl ? 'داخل' : 'Inflow'}</option>
                  <option value="outflow">{isRtl ? 'طالع' : 'Outflow'}</option>
                  <option value="personal">{isRtl ? 'التزام شخصي' : 'Personal'}</option>
                  <option value="receivable">{isRtl ? 'لي عند الغير' : 'Receivable'}</option>
                  <option value="payable">{isRtl ? 'عليا / مديون' : 'Payable'}</option>
                </select>

                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-[#1E162F] border border-slate-300 dark:border-[#62339A]/30 text-xs font-bold"
                >
                  <option value="all">{isRtl ? 'كل الحسابات' : 'All Channels'}</option>
                  <option value="vodafone_cash">{isRtl ? 'فودافون كاش' : 'Vodafone Cash'}</option>
                  <option value="bank">{isRtl ? 'البنك' : 'Bank'}</option>
                  <option value="cash">{isRtl ? 'نقدي' : 'Cash'}</option>
                  <option value="in_app_habe">{isRtl ? 'تطبيق هابي' : 'In-App HABE'}</option>
                </select>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold text-xs">
                {isRtl ? 'لا توجد حركات مسجلة حالياً. ابدأ بإدخال أول عملية.' : 'No transactions recorded yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="text-[11px] font-black text-slate-500 border-b border-slate-200 bg-slate-50 dark:bg-[#1E162F]">
                    <tr>
                      <th className="py-3 px-3 text-start">{isRtl ? 'التاريخ' : 'Date'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'الاتجاه' : 'Direction'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'الحساب' : 'Channel'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'الطرف / الجهة' : 'Party'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'المبلغ' : 'Amount'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'صافي الربح' : 'Net Profit'}</th>
                      <th className="py-3 px-3 text-start">{isRtl ? 'حالة ليا / عليا' : 'Owed Status'}</th>
                      <th className="py-3 px-3 text-center">{isRtl ? 'حذف' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#62339A]/20">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-[#1E162F]/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{t.date}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              t.direction === 'inflow'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {t.direction === 'inflow' ? (isRtl ? 'داخل' : 'Inflow') : (isRtl ? 'طالع' : 'Outflow')}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#62339A] dark:text-[#FFC928]">
                          {t.channel === 'vodafone_cash'
                            ? 'فودافون كاش'
                            : t.channel === 'bank'
                              ? 'حساب بنكي'
                              : t.channel === 'cash'
                                ? 'نقدي خزنة'
                                : 'تطبيق هابي'}
                        </td>
                        <td className="py-3 px-3 font-black text-[#292333] dark:text-white">{t.partyName}</td>
                        <td className="py-3 px-3 font-mono font-black" dir="ltr">
                          {fmt(t.amount)} EGP
                        </td>
                        <td
                          className={`py-3 px-3 font-mono font-black ${
                            t.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                          dir="ltr"
                        >
                          {fmt(t.netProfit)} EGP
                        </td>
                        <td className="py-3 px-3">
                          {t.isOwedToMe && <span className="text-emerald-600 font-black">ليا</span>}
                          {t.isOwedByMe && <span className="text-rose-600 font-black">عليا</span>}
                          {!t.isOwedToMe && !t.isOwedByMe && <span className="text-slate-400">-</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteTrx(t.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: STORE WEBHOOK & APP SYNC ==================== */}
      {activeTab === 'stores_sync' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-[#292333] border border-[#62339A]/20 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#62339A] dark:text-[#FFC928] flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#292333] dark:text-white">
                  {isRtl ? 'روابط متاجر التطبيق وتطبيق هابي (Webhook & API Ingestion)' : 'App Webhooks & HABE API Ingestion'}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {isRtl
                    ? 'المدفوعات والطلبات الواردة من تطبيق هابي أو المتاجر يتم قراءتها وإضافتها وإعادة حساب الأرباح و(ليا/عليا) فوراً.'
                    : 'Incoming payments from HABE app are parsed, added, and recalculated immediately.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E162F] border border-slate-200 dark:border-[#62339A]/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-black text-sm text-[#292333] dark:text-white">{st.storeName}</div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      {isRtl ? 'مفعل' : 'Active'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-500 font-bold">{isRtl ? 'رابط الـ Webhook:' : 'Webhook URL:'}</div>
                    <div className="p-2 rounded-lg bg-white dark:bg-[#292333] font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all">
                      {st.webhookUrl}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      API Key: <code className="font-mono font-black text-[#62339A]">{st.apiKey}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSimulateWebhook(st.storeName)}
                      className="min-h-[38px] px-4 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'محاكاة استقبال دفعة هابي (Test Sync)' : 'Test Webhook'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
