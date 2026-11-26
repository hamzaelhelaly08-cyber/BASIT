import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  ChefHat,
  CreditCard,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  Lock,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Utensils,
  Wallet,
  X,
} from 'lucide-react';

interface LedgerEntryRow {
  entryId: string;
  entryType: 'supply_revenue' | 'recorded_expense' | 'receivable' | 'payable';
  clientTenantId: string;
  clientName: string;
  kitchenTenantId: string;
  kitchenName: string;
  contractRef: string;
  mealsCount: number;
  mealUnitPriceEGP: number;
  amountEGP: number;
  paidAmountEGP: number;
  entryDate: string;
  sourceChannel: 'central_order' | 'habe' | 'manual_voucher';
  notes: string;
  createdByEmail: string;
  createdAt: string;
}

interface ClientBreakdownRow {
  clientTenantId: string;
  clientName: string;
  mealsCount: number;
  supplyValueEGP: number;
  actualRevenueEGP: number;
  receivablesEGP: number;
  recordsCount: number;
}

interface KitchenBreakdownRow {
  kitchenTenantId: string;
  kitchenName: string;
  mealsCount: number;
  supplyValueEGP: number;
  expensesEGP: number;
  recordsCount: number;
}

interface TenantOption {
  tenantId: string;
  name: string;
  kind: string;
  city?: string;
}

interface CateringLedgerApiResponse {
  ok: boolean;
  accessScope: 'governance_full' | 'tenant_scoped';
  canWriteVouchers: boolean;
  questions: {
    totalMealsSupplied: number;
    avgMealUnitPriceEGP: number | null;
    totalSupplyValueEGP: number;
    byClient: ClientBreakdownRow[];
    byKitchen: KitchenBreakdownRow[];
    actualRevenueEGP: number;
    hasRecordedExpenses: boolean;
    recordedExpensesEGP: number;
    netProfitEGP: number | null;
    profitMarginPct: number | null;
    receivablesEGP: number;
    hasRecordedPayables: boolean;
    payablesEGP: number;
  };
  habeSummary: {
    recordsCount: number;
    totalValueEGP: number;
    collectedEGP: number;
  } | null;
  incompleteNotices: string[];
  entries: LedgerEntryRow[];
  availableClients: TenantOption[];
  availableKitchens: TenantOption[];
}

interface FinancialPortalViewProps {
  isRtl: boolean;
  readOnly?: boolean;
  canManageFinance?: boolean;
  onOpenPrintReport: (docTitleAr?: string) => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
  onShowToast: (msg: string) => void;
}

function fmtMoney(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const FinancialPortalView: React.FC<FinancialPortalViewProps> = ({
  isRtl,
  readOnly = false,
  canManageFinance = false,
  onOpenPrintReport,
  onAddAuditLog,
  onShowToast,
}) => {
  const [clientId, setClientId] = useState<string>('all');
  const [kitchenId, setKitchenId] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [contractRef, setContractRef] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [ledgerData, setLedgerData] = useState<CateringLedgerApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Add voucher drawer state
  const [showVoucherForm, setShowVoucherForm] = useState<boolean>(false);
  const [submittingVoucher, setSubmittingVoucher] = useState<boolean>(false);
  const [syncingHabe, setSyncingHabe] = useState<boolean>(false);

  const [vType, setVType] = useState<LedgerEntryRow['entryType']>('supply_revenue');
  const [vClientId, setVClientId] = useState<string>('tenant_client_habe');
  const [vClientCustom, setVClientCustom] = useState<string>('');
  const [vKitchenId, setVKitchenId] = useState<string>('tenant_kitchen_alain');
  const [vContractRef, setVContractRef] = useState<string>('CTR-2026-01');
  const [vMealsCount, setVMealsCount] = useState<string>('100');
  const [vAmountEGP, setVAmountEGP] = useState<string>('');
  const [vPaidAmountEGP, setVPaidAmountEGP] = useState<string>('');
  const [vEntryDate, setVEntryDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [vNotes, setVNotes] = useState<string>('');

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    setAuthErrorMsg(null);
    try {
      const qs = new URLSearchParams();
      if (clientId && clientId !== 'all') qs.set('clientId', clientId);
      if (kitchenId && kitchenId !== 'all') qs.set('kitchenId', kitchenId);
      if (fromDate) qs.set('fromDate', fromDate);
      if (toDate) qs.set('toDate', toDate);
      if (contractRef.trim()) qs.set('contractRef', contractRef.trim());

      const res = await fetch(`/api/finance/catering-ledger?${qs.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      const json = (await res.json()) as Partial<CateringLedgerApiResponse> & {
        messageAr?: string;
        messageEn?: string;
      };
      if (!res.ok || !json.ok) {
        setLedgerData(null);
        setAuthErrorMsg(
          (isRtl ? json.messageAr : json.messageEn) ||
            (isRtl
              ? 'يرجى تسجيل الدخول بحساب مالي أو إداري أو حساب جهة متعاقدة لعرض الدفتر المحاسبي.'
              : 'Please authenticate with an authorized finance, admin, or entity account.')
        );
        return;
      }
      setLedgerData(json as CateringLedgerApiResponse);
    } catch {
      setAuthErrorMsg(
        isRtl
          ? 'تعذر الاتصال بخادم الحسابات المركزية — تأكد من استقرار الشبكة.'
          : 'Unable to reach central accounting server.'
      );
    } finally {
      setLoading(false);
    }
  }, [clientId, kitchenId, fromDate, toDate, contractRef, isRtl]);

  useEffect(() => {
    void fetchLedger();
  }, [fetchLedger]);

  const filteredRows = useMemo(() => {
    const entries = ledgerData?.entries || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (r) =>
        r.entryId.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.kitchenName.toLowerCase().includes(q) ||
        r.contractRef.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q)
    );
  }, [ledgerData, searchQuery]);

  const allowWrite = Boolean(ledgerData?.canWriteVouchers) && (!readOnly || canManageFinance);

  const handleSubmitVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allowWrite) return;
    const amountNum = Number(vAmountEGP);
    const paidNum = vPaidAmountEGP === '' ? (vType === 'supply_revenue' ? 0 : amountNum) : Number(vPaidAmountEGP);
    const mealsNum = Math.max(0, Math.round(Number(vMealsCount || 0)));

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      onShowToast(isRtl ? 'يرجى إدخال مبلغ مالي صحيح أكبر من صفر.' : 'Enter a valid positive amount.');
      return;
    }

    setSubmittingVoucher(true);
    try {
      const selectedClientObj = ledgerData?.availableClients.find((c) => c.tenantId === vClientId);
      const selectedKitchenObj = ledgerData?.availableKitchens.find((k) => k.tenantId === vKitchenId);

      const res = await fetch('/api/finance/entries', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryType: vType,
          clientTenantId: vClientId === 'custom' ? 'custom_client' : vClientId,
          clientName:
            vClientId === 'custom'
              ? vClientCustom.trim() || 'عميل خارجي'
              : selectedClientObj?.name || vClientId,
          kitchenTenantId: vKitchenId,
          kitchenName: selectedKitchenObj?.name || vKitchenId,
          contractRef: vContractRef.trim() || 'CONTRACT-2026',
          mealsCount: vType === 'supply_revenue' ? mealsNum : 0,
          amountEGP: amountNum,
          paidAmountEGP: paidNum,
          entryDate: vEntryDate,
          notes: vNotes.trim(),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageAr?: string; entry?: LedgerEntryRow };
      if (!res.ok || !json.ok) {
        onShowToast(json.messageAr || (isRtl ? 'تعذر حفظ القيد المالي.' : 'Could not save entry.'));
        return;
      }
      onShowToast(json.messageAr || (isRtl ? 'تم تسجيل القيد المالي بنجاح.' : 'Financial entry recorded.'));
      onAddAuditLog(
        `تسجيل قيد محاسبي (${vType}) بمبلغ ${amountNum} ج.م`,
        `Recorded B2B Finance Voucher (${vType})`,
        `${selectedClientObj?.name || vClientCustom} · ${vContractRef}`
      );
      setShowVoucherForm(false);
      setVAmountEGP('');
      setVPaidAmountEGP('');
      setVNotes('');
      await fetchLedger();
    } catch {
      onShowToast(isRtl ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'Network error recording entry.');
    } finally {
      setSubmittingVoucher(false);
    }
  };

  const handleSyncHabeOrders = async () => {
    setSyncingHabe(true);
    try {
      const raw = localStorage.getItem('habe_orders_ledger');
      const localOrders = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
      const syncable = localOrders
        .filter((o) => o.approvalStatus === 'confirmed_paid' || o.approvalStatus === 'approved')
        .map((o) => ({
          orderId: String(o.id || ''),
          employeeName: String(o.employeeName || ''),
          employeeCode: String(o.employeeCode || ''),
          paymentMethod: String(o.paymentMethod || ''),
          approvalStatus: String(o.approvalStatus || ''),
          totalEGP: Number(o.totalEGP || 0),
          mealsCount: Array.isArray(o.items)
            ? o.items.reduce((s, it) => s + (Number((it as { qty?: number }).qty) || 1), 0)
            : 1,
          trxRef: String(o.trxRef || ''),
          isoDate: String(o.isoDate || '').slice(0, 10),
        }))
        .filter((o) => o.orderId && o.totalEGP > 0);

      if (syncable.length === 0) {
        onShowToast(
          isRtl
            ? 'لا توجد طلبات H.A.B.E معتمدة أو مدفوعة مخزنة محلياً للمزامنة الآن.'
            : 'No local approved/paid H.A.B.E orders pending sync.'
        );
        return;
      }

      const res = await fetch('/api/habe/ledger-sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: syncable }),
      });
      const json = (await res.json()) as { ok?: boolean; messageAr?: string };
      if (!res.ok || !json.ok) {
        onShowToast(json.messageAr || (isRtl ? 'فشلت مزامنة H.A.B.E.' : 'H.A.B.E sync failed.'));
        return;
      }
      onShowToast(json.messageAr || (isRtl ? 'تمت مزامنة سجلات H.A.B.E.' : 'H.A.B.E synced.'));
      await fetchLedger();
    } catch {
      onShowToast(isRtl ? 'تعذر قراءة أو مزامنة سجلات H.A.B.E.' : 'Error syncing H.A.B.E records.');
    } finally {
      setSyncingHabe(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      onShowToast(isRtl ? 'لا توجد قيود مسجلة لتصديرها.' : 'No ledger entries to export.');
      return;
    }
    const headers = [
      'Entry ID',
      'Date',
      'Type',
      'Client',
      'Kitchen',
      'Contract',
      'Meals Count',
      'Unit Price EGP',
      'Amount EGP',
      'Paid EGP',
      'Channel',
      'Notes',
    ];
    const lines = [
      headers.join(','),
      ...filteredRows.map((r) =>
        [
          r.entryId,
          r.entryDate,
          r.entryType,
          `"${(r.clientName || '').replace(/"/g, '""')}"`,
          `"${(r.kitchenName || '').replace(/"/g, '""')}"`,
          `"${(r.contractRef || '').replace(/"/g, '""')}"`,
          r.mealsCount,
          r.mealUnitPriceEGP,
          r.amountEGP,
          r.paidAmountEGP,
          r.sourceChannel,
          `"${(r.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basit-catering-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onAddAuditLog('تصدير دفتر حسابات الإعاشة CSV', 'Exported B2B Catering CSV Ledger', `${filteredRows.length} rows`);
  };

  const q = ledgerData?.questions;
  const notRecordedLabel = isRtl ? 'بيانات غير مسجلة بعد' : 'Not recorded yet';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#62339A] flex items-center justify-center text-white shadow-md shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#292333] dark:text-white">
                {isRtl
                  ? 'النظام المحاسبي والإدارة المالية لإعاشة الشركات والتوريدات'
                  : 'B2B Catering & Supply Financial Accounting'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                <ShieldCheck className="w-3 h-3" />
                <span>
                  {ledgerData?.accessScope === 'tenant_scoped'
                    ? isRtl
                      ? 'نطاق معزول لجهتك فقط'
                      : 'Strict Tenant Scope'
                    : isRtl
                      ? 'رقابة مركزية حقيقية (بلا بيانات وهمية)'
                      : 'Verified Real Ledger'}
                </span>
              </span>
            </div>
            <p className="text-xs font-medium text-[#64748B] dark:text-[#CBD5E1]">
              {isRtl
                ? 'تقارير الوجبات الموردة، أسعار التعاقد، الإيرادات الفعلية، الذمم المدينة والدائنة، وحجم تعامل كل مطبخ وعميل من واقع السجلات المعتمدة فقط.'
                : 'Live meal volume, average unit pricing, real collected revenues, client/kitchen breakdowns, receivables & payables.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => void fetchLedger()}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs font-extrabold text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isRtl ? 'تحديث الأرقام' : 'Refresh'}</span>
          </button>

          {allowWrite && (
            <button
              type="button"
              onClick={() => setShowVoucherForm((prev) => !prev)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'تسجيل قيد / مصروف / تحصيل' : 'Record Ledger Entry'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs font-extrabold text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#62339A]" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenPrintReport(
                isRtl
                  ? 'التقرير المالي المعتمد لتوريدات الإعاشة والوجبات'
                  : 'Official B2B Catering Financial Report'
              )
            }
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#eab518] text-[#292333] text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isRtl ? 'طباعة PDF' : 'Print PDF'}</span>
          </button>
        </div>
      </div>

      {/* RBAC Auth Required / Error Notice */}
      {authErrorMsg && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 flex items-start gap-3">
          <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-black text-amber-950 dark:text-amber-200">
              {isRtl ? 'تحقق من صلاحية الحساب المالي' : 'Financial Ledger Access Check'}
            </h3>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 leading-relaxed">
              {authErrorMsg}
            </p>
          </div>
        </div>
      )}

      {/* Manual Voucher Form (Admin / Finance Only) */}
      {showVoucherForm && allowWrite && (
        <form
          onSubmit={(e) => void handleSubmitVoucher(e)}
          className="p-5 sm:p-6 rounded-3xl bg-[#F7F5FA] dark:bg-[#1E293B] border-2 border-[#62339A]/40 space-y-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#62339A] dark:text-[#FFC928] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" />
              <span>
                {isRtl
                  ? 'إضافة قيد محاسبي موثق إلى دفتر إعاشة الشركات (مؤمن بسجل التدقيق)'
                  : 'Post Verified Accounting Entry to Central Ledger'}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setShowVoucherForm(false)}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#292333] flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'نوع القيد المالي' : 'Entry Type'}
              </label>
              <select
                value={vType}
                onChange={(e) => setVType(e.target.value as LedgerEntryRow['entryType'])}
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-bold text-[#292333] dark:text-white"
              >
                <option value="supply_revenue">{isRtl ? 'توريد وجبات وإيراد تعاقدي' : 'Meal Supply & Revenue'}</option>
                <option value="recorded_expense">{isRtl ? 'مصروف وتكلفة تشغيلية فعلية' : 'Recorded Operating Expense'}</option>
                <option value="receivable">{isRtl ? 'ذمة مدينة (مستحق لنا عند عميل)' : 'Receivable Owed to Us'}</option>
                <option value="payable">{isRtl ? 'التزام دائن (مستحق علينا لمورد)' : 'Payable Owed by Us'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'العميل / الجهة المتعاقدة' : 'Client / Entity'}
              </label>
              <select
                value={vClientId}
                onChange={(e) => setVClientId(e.target.value)}
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-bold text-[#292333] dark:text-white"
              >
                {(ledgerData?.availableClients || []).map((c) => (
                  <option key={c.tenantId} value={c.tenantId}>
                    {c.name}
                  </option>
                ))}
                <option value="custom">{isRtl ? 'عميل / جهة أخرى (كتابة يدوية)' : 'Other Entity (Custom)'}</option>
              </select>
            </div>

            {vClientId === 'custom' && (
              <div className="space-y-1">
                <label className="font-black text-[#292333] dark:text-slate-200 block">
                  {isRtl ? 'اسم الجهة يدوياً' : 'Custom Client Name'}
                </label>
                <input
                  type="text"
                  required
                  value={vClientCustom}
                  onChange={(e) => setVClientCustom(e.target.value)}
                  placeholder={isRtl ? 'مثال: مستشفى رويال أو مصنع الأسمنت' : 'Client name'}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-bold text-[#292333] dark:text-white"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'المطبخ المركزي المنفذ' : 'Central Kitchen'}
              </label>
              <select
                value={vKitchenId}
                onChange={(e) => setVKitchenId(e.target.value)}
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-bold text-[#292333] dark:text-white"
              >
                {(ledgerData?.availableKitchens || []).map((k) => (
                  <option key={k.tenantId} value={k.tenantId}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'مرجع العقد / أمر التوريد' : 'Contract Ref'}
              </label>
              <input
                type="text"
                value={vContractRef}
                onChange={(e) => setVContractRef(e.target.value)}
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-mono text-xs text-[#292333] dark:text-white"
              />
            </div>

            {vType === 'supply_revenue' && (
              <div className="space-y-1">
                <label className="font-black text-[#292333] dark:text-slate-200 block">
                  {isRtl ? 'عدد الوجبات الموردة' : 'Meals Supplied'}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={vMealsCount}
                  onChange={(e) => setVMealsCount(e.target.value)}
                  className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-mono font-bold text-[#292333] dark:text-white"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'إجمالي المبلغ (ج.م)' : 'Total Amount (EGP)'}
              </label>
              <input
                type="number"
                min={1}
                step="0.01"
                required
                value={vAmountEGP}
                onChange={(e) => setVAmountEGP(e.target.value)}
                placeholder="0.00"
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-mono font-bold text-[#292333] dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'المبلغ المحصل / المسدد فعلياً (ج.م)' : 'Paid / Collected EGP'}
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={vPaidAmountEGP}
                onChange={(e) => setVPaidAmountEGP(e.target.value)}
                placeholder={vType === 'supply_revenue' ? '0 = آجل' : vAmountEGP || '0.00'}
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-mono font-bold text-[#292333] dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'تاريخ القيد' : 'Entry Date'}
              </label>
              <input
                type="date"
                value={vEntryDate}
                onChange={(e) => setVEntryDate(e.target.value)}
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 font-mono text-xs text-[#292333] dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-black text-[#292333] dark:text-slate-200 block">
                {isRtl ? 'بيان وملاحظات القيد' : 'Voucher Notes'}
              </label>
              <input
                type="text"
                value={vNotes}
                onChange={(e) => setVNotes(e.target.value)}
                placeholder={isRtl ? 'تفاصيل التوريد أو بند المصروف الفعلي...' : 'Supply or expense details...'}
                className="min-h-[44px] w-full px-3 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 text-xs text-[#292333] dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={submittingVoucher}
              className="min-h-[44px] px-6 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black cursor-pointer shrink-0 disabled:opacity-60"
            >
              {submittingVoucher
                ? isRtl
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : isRtl
                  ? 'اعتماد وحفظ القيد المالي'
                  : 'Save Verified Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Multi-Dimensional Accounting Filters */}
      {ledgerData && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-[#62339A] dark:text-[#FFC928]">
            <Filter className="w-4 h-4" />
            <span>
              {isRtl ? 'فلاتر التحليل المحاسبي (حسب العميل، المطبخ المركزي، الفترة، والعقد):' : 'Accounting Filters:'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              aria-label={isRtl ? 'تصفية حسب العميل' : 'Filter by Client'}
              className="min-h-[44px] px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 font-bold text-[#292333] dark:text-white"
            >
              <option value="all">{isRtl ? 'جميع العملاء والجهات' : 'All Clients'}</option>
              {ledgerData.availableClients.map((c) => (
                <option key={c.tenantId} value={c.tenantId}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={kitchenId}
              onChange={(e) => setKitchenId(e.target.value)}
              aria-label={isRtl ? 'تصفية حسب المطبخ المركزي' : 'Filter by Kitchen'}
              className="min-h-[44px] px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 font-bold text-[#292333] dark:text-white"
            >
              <option value="all">{isRtl ? 'المطابخ المركزية الثلاثة' : 'All 3 Central Kitchens'}</option>
              {ledgerData.availableKitchens.map((k) => (
                <option key={k.tenantId} value={k.tenantId}>
                  {k.name}
                </option>
              ))}
            </select>

            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute start-3 pointer-events-none" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label={isRtl ? 'من تاريخ' : 'From Date'}
                className="min-h-[44px] w-full ps-9 pe-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 font-mono text-xs text-[#292333] dark:text-white"
              />
            </div>

            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute start-3 pointer-events-none" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label={isRtl ? 'إلى تاريخ' : 'To Date'}
                className="min-h-[44px] w-full ps-9 pe-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 font-mono text-xs text-[#292333] dark:text-white"
              />
            </div>

            <input
              type="text"
              value={contractRef}
              onChange={(e) => setContractRef(e.target.value)}
              placeholder={isRtl ? 'تصفية برقم العقد...' : 'Contract ref filter...'}
              className="min-h-[44px] px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs font-bold text-[#292333] dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Honest Accounting Notices when Expenses / Payables are Unrecorded */}
      {ledgerData && ledgerData.incompleteNotices.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-[#241B35] border border-[#62339A]/35 space-y-1.5 text-xs">
          {ledgerData.incompleteNotices.map((notice, idx) => (
            <div key={idx} className="flex items-start gap-2 font-bold text-[#4A2378] dark:text-[#E9D5FF]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#62339A] dark:text-[#FFC928]" />
              <span>{notice}</span>
            </div>
          ))}
        </div>
      )}

      {/* The 8 Top-Level Numerical Answers (out of the 10 Core Catering Questions) */}
      {q && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Q1: كم وجبة تم توريدها؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>1. {isRtl ? 'كم وجبة تم توريدها؟' : 'Meals Supplied'}</span>
              <Utensils className="w-4 h-4 text-[#62339A]" />
            </div>
            <div className="text-xl font-black text-[#292333] dark:text-white tabular-nums">
              {q.totalMealsSupplied.toLocaleString('en-US')}{' '}
              <span className="text-xs font-bold text-[#64748B]">{isRtl ? 'وجبة' : 'meals'}</span>
            </div>
          </div>

          {/* Q2: ما سعر الوجبة؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>2. {isRtl ? 'ما متوسط سعر الوجبة؟' : 'Avg Meal Price'}</span>
              <Banknote className="w-4 h-4 text-[#62339A]" />
            </div>
            <div className="text-xl font-black text-[#292333] dark:text-white tabular-nums">
              {q.avgMealUnitPriceEGP !== null ? (
                <>
                  {fmtMoney(q.avgMealUnitPriceEGP)}{' '}
                  <span className="text-xs font-bold text-[#64748B]">{isRtl ? 'ج.م' : 'EGP'}</span>
                </>
              ) : (
                <span className="text-xs font-black text-amber-600">{notRecordedLabel}</span>
              )}
            </div>
          </div>

          {/* Q3: ما إجمالي قيمة التوريد؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>3. {isRtl ? 'ما إجمالي قيمة التوريد؟' : 'Total Supply Value'}</span>
              <CreditCard className="w-4 h-4 text-[#62339A]" />
            </div>
            <div className="text-xl font-black text-[#62339A] dark:text-[#FFC928] tabular-nums">
              {fmtMoney(q.totalSupplyValueEGP)}{' '}
              <span className="text-xs font-bold">{isRtl ? 'ج.م' : 'EGP'}</span>
            </div>
          </div>

          {/* Q6: ما الإيرادات الفعلية؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>6. {isRtl ? 'ما الإيرادات المحصلة فعلياً؟' : 'Actual Revenue'}</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {fmtMoney(q.actualRevenueEGP)}{' '}
              <span className="text-xs font-bold">{isRtl ? 'ج.م' : 'EGP'}</span>
            </div>
          </div>

          {/* Q7: ما المصروفات والتكاليف المسجلة؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>7. {isRtl ? 'ما المصروفات والتكاليف المسجلة؟' : 'Recorded Expenses'}</span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-black text-[#292333] dark:text-white tabular-nums">
              {q.hasRecordedExpenses ? (
                <>
                  {fmtMoney(q.recordedExpensesEGP)}{' '}
                  <span className="text-xs font-bold text-[#64748B]">{isRtl ? 'ج.م' : 'EGP'}</span>
                </>
              ) : (
                <span className="text-xs font-black text-amber-600">{notRecordedLabel}</span>
              )}
            </div>
          </div>

          {/* Q8: ما هامش الربح وصافي الربح؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>8. {isRtl ? 'ما هامش الربح وصافي الربح؟' : 'Net Profit & Margin'}</span>
              <CheckCircle2 className="w-4 h-4 text-[#62339A]" />
            </div>
            <div className="text-lg font-black text-[#292333] dark:text-white tabular-nums">
              {q.netProfitEGP !== null ? (
                <>
                  {fmtMoney(q.netProfitEGP)} <span className="text-xs">{isRtl ? 'ج.م' : 'EGP'}</span>
                  {q.profitMarginPct !== null && (
                    <span className="ms-1.5 text-xs font-extrabold text-emerald-600">
                      ({q.profitMarginPct}%)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs font-black text-amber-600">{notRecordedLabel}</span>
              )}
            </div>
          </div>

          {/* Q9: ما المبالغ المستحقة لنا؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>9. {isRtl ? 'ما المبالغ المستحقة لنا؟' : 'Receivables (Owed to Us)'}</span>
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {fmtMoney(q.receivablesEGP)}{' '}
              <span className="text-xs font-bold">{isRtl ? 'ج.م' : 'EGP'}</span>
            </div>
          </div>

          {/* Q10: ما الالتزامات والمبالغ المستحقة علينا؟ */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-slate-300">
              <span>10. {isRtl ? 'ما الالتزامات المستحقة علينا؟' : 'Payables (Owed by Us)'}</span>
              <ShieldCheck className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-black text-[#292333] dark:text-white tabular-nums">
              {q.hasRecordedPayables ? (
                <>
                  {fmtMoney(q.payablesEGP)}{' '}
                  <span className="text-xs font-bold text-[#64748B]">{isRtl ? 'ج.م' : 'EGP'}</span>
                </>
              ) : (
                <span className="text-xs font-black text-amber-600">{notRecordedLabel}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Q4 & Q5 Breakdowns: Client/Entity Meals & Central Kitchens Volume */}
      {q && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Q4: ما عدد الوجبات لكل عميل أو جهة؟ */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#292333] dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#62339A]" />
                <span>4. {isRtl ? 'عدد الوجبات والتوريد لكل عميل أو جهة' : 'Meals & Supply per Client'}</span>
              </h3>
              <span className="text-[11px] font-bold text-[#64748B]">
                {q.byClient.length} {isRtl ? 'جهة' : 'clients'}
              </span>
            </div>

            {q.byClient.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#64748B]">
                {notRecordedLabel}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="text-[11px] font-black text-[#64748B] border-b border-[#E2E8F0] dark:border-[#62339A]/25">
                    <tr>
                      <th className="py-2 text-start">{isRtl ? 'العميل / الجهة' : 'Client'}</th>
                      <th className="py-2 text-start">{isRtl ? 'الوجبات' : 'Meals'}</th>
                      <th className="py-2 text-start">{isRtl ? 'قيمة التوريد' : 'Supply EGP'}</th>
                      <th className="py-2 text-start">{isRtl ? 'مستحق لنا' : 'Due'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]/60 dark:divide-[#62339A]/20">
                    {q.byClient.map((row) => (
                      <tr key={row.clientTenantId}>
                        <td className="py-2.5 font-black text-[#292333] dark:text-white">{row.clientName}</td>
                        <td className="py-2.5 font-bold tabular-nums">{row.mealsCount.toLocaleString('en-US')}</td>
                        <td className="py-2.5 font-black text-[#62339A] dark:text-[#FFC928] tabular-nums">
                          {fmtMoney(row.supplyValueEGP)} ج.م
                        </td>
                        <td className="py-2.5 font-bold text-amber-600 tabular-nums">
                          {fmtMoney(row.receivablesEGP)} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Q5: ما حجم تعاملات كل مطبخ مركزي؟ */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[#292333] dark:text-white flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#62339A]" />
                <span>5. {isRtl ? 'حجم تعاملات كل مطبخ مركزي' : 'Volume per Central Kitchen'}</span>
              </h3>
              <span className="text-[11px] font-bold text-[#64748B]">
                {q.byKitchen.length} {isRtl ? 'مطبخ' : 'kitchens'}
              </span>
            </div>

            {q.byKitchen.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#64748B]">
                {notRecordedLabel}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="text-[11px] font-black text-[#64748B] border-b border-[#E2E8F0] dark:border-[#62339A]/25">
                    <tr>
                      <th className="py-2 text-start">{isRtl ? 'المطبخ المركزي' : 'Kitchen'}</th>
                      <th className="py-2 text-start">{isRtl ? 'الوجبات' : 'Meals'}</th>
                      <th className="py-2 text-start">{isRtl ? 'حجم التوريد' : 'Supply EGP'}</th>
                      <th className="py-2 text-start">{isRtl ? 'المصروفات' : 'Expenses'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]/60 dark:divide-[#62339A]/20">
                    {q.byKitchen.map((row) => (
                      <tr key={row.kitchenTenantId}>
                        <td className="py-2.5 font-black text-[#292333] dark:text-white">{row.kitchenName}</td>
                        <td className="py-2.5 font-bold tabular-nums">{row.mealsCount.toLocaleString('en-US')}</td>
                        <td className="py-2.5 font-black text-[#62339A] dark:text-[#FFC928] tabular-nums">
                          {fmtMoney(row.supplyValueEGP)} ج.م
                        </td>
                        <td className="py-2.5 font-bold text-rose-600 tabular-nums">
                          {fmtMoney(row.expensesEGP)} ج.م
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

      {/* Authorized H.A.B.E Financial Linkage Panel (Visible ONLY for Governance or H.A.B.E Tenant) */}
      {ledgerData?.habeSummary !== null && ledgerData?.habeSummary !== undefined && (
        <div className="p-5 rounded-3xl bg-[#F7F5FA] dark:bg-[#241B35] border border-[#62339A]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
              {isRtl
                ? 'الربط المحاسبي المعتمد مع بوابة H.A.B.E (معزول وفق الصلاحية)'
                : 'Authorized H.A.B.E Financial Bridge'}
            </div>
            <p className="text-xs font-bold text-[#292333] dark:text-slate-200 tabular-nums">
              {isRtl
                ? `المعاملات المربوطة: ${ledgerData.habeSummary.recordsCount} · إجمالي القيمة: ${fmtMoney(ledgerData.habeSummary.totalValueEGP)} ج.م · المحصل الفعلي: ${fmtMoney(ledgerData.habeSummary.collectedEGP)} ج.م`
                : `Synced Orders: ${ledgerData.habeSummary.recordsCount} · Value: ${fmtMoney(ledgerData.habeSummary.totalValueEGP)} EGP · Collected: ${fmtMoney(ledgerData.habeSummary.collectedEGP)} EGP`}
            </p>
          </div>
          <button
            type="button"
            disabled={syncingHabe}
            onClick={() => void handleSyncHabeOrders()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingHabe ? 'animate-spin' : ''}`} />
            <span>
              {syncingHabe
                ? isRtl
                  ? 'جاري المزامنة...'
                  : 'Syncing...'
                : isRtl
                  ? 'مزامنة معاملات H.A.B.E المعتمدة الآن'
                  : 'Sync Approved H.A.B.E Orders'}
            </span>
          </button>
        </div>
      )}

      {/* Traceable Ledger Records Table */}
      {ledgerData && (
        <div className="rounded-3xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/35 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#62339A]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black text-[#292333] dark:text-white">
              {isRtl
                ? `سجل القيود والحركات الفعلية (${filteredRows.length})`
                : `Verified Accounting Entries (${filteredRows.length})`}
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث في القيود والعملاء...' : 'Search ledger...'}
                className="min-h-[44px] w-full ps-9 pe-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 text-xs font-bold text-[#292333] dark:text-white"
              />
            </div>
          </div>

          {filteredRows.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-[#64748B] dark:text-slate-300">
              {isRtl
                ? 'لا توجد قيود محاسبية مسجلة ضمن الفلاتر الحالية — ابدأ بإضافة قيد توريد أو مصروف فعلي أو مزامنة العقود.'
                : 'No accounting entries recorded in the selected scope.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] text-[11px] font-black text-[#64748B]">
                  <tr>
                    <th className="p-3.5 text-start">{isRtl ? 'رقم القيد والتاريخ' : 'ID & Date'}</th>
                    <th className="p-3.5 text-start">{isRtl ? 'التصنيف' : 'Type'}</th>
                    <th className="p-3.5 text-start">{isRtl ? 'العميل والعقد' : 'Client & Contract'}</th>
                    <th className="p-3.5 text-start">{isRtl ? 'المطبخ' : 'Kitchen'}</th>
                    <th className="p-3.5 text-start">{isRtl ? 'الوجبات' : 'Meals'}</th>
                    <th className="p-3.5 text-start">{isRtl ? 'القيمة والمحصل' : 'Amount / Paid'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/60 dark:divide-[#62339A]/20">
                  {filteredRows.map((row) => (
                    <tr key={row.entryId} className="hover:bg-[#F7F5FA]/50 dark:hover:bg-white/5">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-[#62339A] dark:text-[#FFC928]">{row.entryId}</div>
                        <div className="text-[11px] text-[#64748B] tabular-nums">{row.entryDate}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-[11px]">
                          {row.entryType === 'supply_revenue'
                            ? isRtl
                              ? 'توريد وجبات'
                              : 'Supply Revenue'
                            : row.entryType === 'recorded_expense'
                              ? isRtl
                                ? 'مصروف فعلي'
                                : 'Expense'
                              : row.entryType === 'receivable'
                                ? isRtl
                                  ? 'مستحق لنا'
                                  : 'Receivable'
                                : isRtl
                                  ? 'التزام علينا'
                                  : 'Payable'}
                        </span>
                        <div className="text-[10px] text-[#64748B] mt-0.5">
                          {row.sourceChannel === 'habe'
                            ? 'H.A.B.E'
                            : row.sourceChannel === 'central_order'
                              ? isRtl
                                ? 'طلب عقد'
                                : 'Contract Order'
                              : isRtl
                                ? 'قيد يدوي'
                                : 'Voucher'}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-black text-[#292333] dark:text-white">{row.clientName}</div>
                        <div className="text-[11px] font-mono text-[#64748B]">{row.contractRef}</div>
                      </td>
                      <td className="p-3.5 font-bold text-[#292333] dark:text-slate-200">{row.kitchenName}</td>
                      <td className="p-3.5 font-bold tabular-nums">
                        {row.mealsCount > 0 ? `${row.mealsCount.toLocaleString('en-US')}` : '—'}
                      </td>
                      <td className="p-3.5 tabular-nums">
                        <div className="font-black text-[#292333] dark:text-white">{fmtMoney(row.amountEGP)} ج.م</div>
                        <div className="text-[11px] font-bold text-emerald-600">
                          {isRtl ? 'مسدد/محصل:' : 'Paid:'} {fmtMoney(row.paidAmountEGP)} ج.م
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
