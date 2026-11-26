import React, { useState } from 'react';
import {
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Boxes,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  createPartyPayment,
  createPurchaseInvoice,
  createPurchaseReturn,
  type InventoryStockItem,
  type OwnerFinanceChannel,
  type OwnerFinanceDashboardPayload,
  type PartyPaymentRecord,
  type PurchaseInvoiceRecord,
  type PurchaseReturnRecord,
} from '../services/ownerFinanceService';
import { SmartVoiceMicButton } from './SmartVoiceMicButton';

interface PurchasesInventoryModuleProps {
  inventoryItems: InventoryStockItem[];
  purchaseInvoices: PurchaseInvoiceRecord[];
  purchaseReturns: PurchaseReturnRecord[];
  partyPayments: PartyPaymentRecord[];
  onUpdated: (next: OwnerFinanceDashboardPayload) => void;
  onShowToast: (msg: string) => void;
}

export const PurchasesInventoryModule: React.FC<PurchasesInventoryModuleProps> = ({
  inventoryItems,
  purchaseInvoices,
  purchaseReturns,
  partyPayments,
  onUpdated,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'invoices' | 'returns' | 'payments' | 'stock'>('invoices');
  const [busy, setBusy] = useState(false);

  // Purchase Invoice form
  const [supplierName, setSupplierName] = useState('');
  const [supplierScope, setSupplierScope] = useState<'external_supplier' | 'internal_platform'>('external_supplier');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [unitAr, setUnitAr] = useState('كجم');
  const [qty, setQty] = useState('10');
  const [unitCostEGP, setUnitCostEGP] = useState('');
  const [paidEGP, setPaidEGP] = useState('');
  const [invChannel, setInvChannel] = useState<OwnerFinanceChannel>('bank');
  const [invNotes, setInvNotes] = useState('');

  // Purchase Return form
  const [retInvoiceId, setRetInvoiceId] = useState('');
  const [qtyReturned, setQtyReturned] = useState('1');
  const [retReason, setRetReason] = useState('');
  const [settlementMode, setSettlementMode] = useState<'reduce_payable' | 'cash_refund'>('reduce_payable');
  const [retChannel, setRetChannel] = useState<OwnerFinanceChannel>('bank');

  // Party Payment form
  const [partyType, setPartyType] = useState<'supplier' | 'customer'>('supplier');
  const [partyName, setPartyName] = useState('');
  const [direction, setDirection] = useState<'debit' | 'credit'>('debit');
  const [pmtAmount, setPmtAmount] = useState('');
  const [pmtChannel, setPmtChannel] = useState<OwnerFinanceChannel>('bank');
  const [pmtNotes, setPmtNotes] = useState('');

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const q = Number(qty || 0);
      const c = Number(unitCostEGP || 0);
      const p = paidEGP.trim() !== '' ? Number(paidEGP) : 0;
      const next = await createPurchaseInvoice({
        supplierName: supplierName.trim(),
        supplierScope,
        itemId: selectedItemId || undefined,
        itemName: !selectedItemId ? customItemName.trim() : undefined,
        unitAr: unitAr.trim() || 'وحدة',
        qty: q,
        unitCostEGP: c,
        paidEGP: p,
        channel: invChannel,
        notes: invNotes.trim(),
      });
      onUpdated(next);
      setSupplierName('');
      setCustomItemName('');
      setUnitCostEGP('');
      setPaidEGP('');
      setInvNotes('');
      onShowToast('تم إصدار فاتورة المشتريات وتحديث المخزون والحسابات تلقائياً.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل فاتورة المشتريات.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retInvoiceId) {
      onShowToast('يرجى اختيار فاتورة المشتريات المراد إرجاعها.');
      return;
    }
    setBusy(true);
    try {
      const next = await createPurchaseReturn({
        invoiceId: retInvoiceId,
        qtyReturned: Number(qtyReturned || 0),
        reason: retReason.trim() || 'مرتجع جودة / تسوية مخزون',
        settlementMode,
        channel: retChannel,
      });
      onUpdated(next);
      setRetReason('');
      onShowToast('تم تسجيل مرتجع المشتريات وتعديل رصيد المخزون والمورد بنجاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل المرتجع.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await createPartyPayment({
        partyType,
        partyName: partyName.trim(),
        direction,
        amountEGP: Number(pmtAmount || 0),
        channel: pmtChannel,
        notes: pmtNotes.trim(),
      });
      onUpdated(next);
      setPartyName('');
      setPmtAmount('');
      setPmtNotes('');
      onShowToast('تم ترحيل قيد الدفع/التحصيل إلى دفتر الأستاذ العام.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل السداد.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 min-w-0">
      {/* Sub-navigation Tabs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: 'invoices' as const, label: 'فواتير المشتريات', icon: ShoppingBag },
          { id: 'returns' as const, label: 'مرتجعات المشتريات', icon: RotateCcw },
          { id: 'payments' as const, label: 'مدفوعات (مدين/دائن)', icon: CreditCard },
          { id: 'stock' as const, label: `المخزون (${inventoryItems.length})`, icon: Boxes },
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`min-h-[42px] px-2.5 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] shadow-sm border border-[#FFD54F]'
                  : 'bg-[#FFFBEB] text-[#3B0764] border border-[#4C1D95]/30'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Purchase Invoices */}
      {subTab === 'invoices' && (
        <div className="space-y-3">
          <form
            onSubmit={handleSubmitInvoice}
            className="rounded-2xl border-2 border-[#3B0764] bg-[#FFFBEB] p-3 space-y-2.5"
          >
            <div className="text-xs font-black text-[#3B0764]">
              إصدار فاتورة مشتريات جديدة (تحديث فوري للمخزون)
            </div>

            <SmartVoiceMicButton
              context="إصدار فاتورة مشتريات وتوريد مخزون"
              onParsed={(f) => {
                if (f.partyName) setSupplierName(f.partyName);
                if (f.purpose) setCustomItemName(f.purpose);
                if (f.amountEGP > 0) setUnitCostEGP(String(f.amountEGP));
              }}
              onError={onShowToast}
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="اسم المورد"
                className="w-full min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              />
              <select
                value={supplierScope}
                onChange={(e) =>
                  setSupplierScope(
                    e.target.value === 'internal_platform' ? 'internal_platform' : 'external_supplier'
                  )
                }
                className="w-full min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              >
                <option value="external_supplier">مورد خارجي</option>
                <option value="internal_platform">مورد داخلي بالمنصة</option>
              </select>
            </div>

            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
            >
              <option value="">-- إضافة صنف مخزني جديد --</option>
              {inventoryItems.map((item) => (
                <option key={item.itemId} value={item.itemId}>
                  {item.nameAr} (المتاح: {item.quantityOnHand} {item.unitAr})
                </option>
              ))}
            </select>

            {!selectedItemId && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="اسم الصنف الجديد"
                  className="col-span-2 min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
                />
                <input
                  type="text"
                  value={unitAr}
                  onChange={(e) => setUnitAr(e.target.value)}
                  placeholder="الوحدة"
                  className="min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="الكمية"
                className="min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
              />
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={unitCostEGP}
                onChange={(e) => setUnitCostEGP(e.target.value)}
                placeholder="سعر الوحدة"
                className="min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={paidEGP}
                onChange={(e) => setPaidEGP(e.target.value)}
                placeholder="المدفوع الآن"
                className="min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={invChannel}
                onChange={(e) => setInvChannel(e.target.value as OwnerFinanceChannel)}
                className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              >
                <option value="bank">بنك</option>
                <option value="e_wallet">محفظة إلكترونية</option>
                <option value="treasury">الخزينة النقدية</option>
              </select>
              <input
                type="text"
                value={invNotes}
                onChange={(e) => setInvNotes(e.target.value)}
                placeholder="ملاحظات الفاتورة"
                className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>اعتماد فاتورة المشتريات وتحديث المخزون</span>
            </button>
          </form>

          <div className="space-y-2">
            {purchaseInvoices.length === 0 ? (
              <div className="p-4 text-center rounded-xl border border-dashed border-[#4C1D95]/30 bg-[#FFFBEB] text-xs font-bold text-[#581C87]">
                لا توجد فواتير مشتريات مسجلة بعد.
              </div>
            ) : (
              purchaseInvoices.map((inv) => (
                <div
                  key={inv.invoiceId}
                  className="p-3 rounded-xl border border-[#3B0764]/35 bg-white space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#3B0764]">
                      {inv.invoiceNumber} — {inv.supplierName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inv.status === 'paid' ? 'مسددة' : inv.status === 'partial' ? 'جزئي' : 'آجل غير مسدد'}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#581C87]">
                    {inv.items.map((it) => `${it.itemName} (${it.qty} × ${it.unitCostEGP})`).join(' · ')}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-black tabular-nums pt-1 border-t border-[#4C1D95]/15">
                    <span className="text-[#3B0764]">الإجمالي: {inv.totalEGP.toLocaleString()} ج.م</span>
                    <span className="text-emerald-700">مدفوع: {inv.paidEGP.toLocaleString()}</span>
                    <span className="text-rose-700">متبقي: {inv.remainingEGP.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Purchase Returns */}
      {subTab === 'returns' && (
        <div className="space-y-3">
          <form
            onSubmit={handleSubmitReturn}
            className="rounded-2xl border-2 border-[#3B0764] bg-[#FFFBEB] p-3 space-y-2.5"
          >
            <div className="text-xs font-black text-[#3B0764]">
              تسجيل مرتجع مشتريات وتعديل أرصدة المخزون والمورد
            </div>

            <select
              required
              value={retInvoiceId}
              onChange={(e) => setRetInvoiceId(e.target.value)}
              className="w-full min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
            >
              <option value="">-- اختر فاتورة المشتريات --</option>
              {purchaseInvoices.map((inv) => (
                <option key={inv.invoiceId} value={inv.invoiceId}>
                  {inv.invoiceNumber} · {inv.supplierName} · {inv.items[0]?.itemName} ({inv.items[0]?.qty})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={qtyReturned}
                onChange={(e) => setQtyReturned(e.target.value)}
                placeholder="الكمية المرتجعة"
                className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
              />
              <select
                value={settlementMode}
                onChange={(e) =>
                  setSettlementMode(e.target.value === 'cash_refund' ? 'cash_refund' : 'reduce_payable')
                }
                className="min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              >
                <option value="reduce_payable">خصم من مديونية المورد</option>
                <option value="cash_refund">استرداد نقدي للحساب</option>
              </select>
            </div>

            {settlementMode === 'cash_refund' && (
              <select
                value={retChannel}
                onChange={(e) => setRetChannel(e.target.value as OwnerFinanceChannel)}
                className="w-full min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              >
                <option value="bank">إيداع بالبنك</option>
                <option value="e_wallet">إيداع بالمحفظة</option>
                <option value="treasury">توريد للخزينة</option>
              </select>
            )}

            <input
              type="text"
              value={retReason}
              onChange={(e) => setRetReason(e.target.value)}
              placeholder="سبب المرتجع (تلف، اختلاف مواصفات، فائض)"
              className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>تأكيد مرتجع المشتريات</span>
            </button>
          </form>

          <div className="space-y-2">
            {purchaseReturns.map((r) => (
              <div key={r.returnId} className="p-3 rounded-xl border border-[#3B0764]/30 bg-white space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-[#3B0764]">
                  <span>مرتجع {r.invoiceNumber} — {r.supplierName}</span>
                  <span className="text-emerald-700 tabular-nums">+{r.refundAmountEGP.toLocaleString()} ج.م</span>
                </div>
                <div className="text-[11px] font-bold text-[#581C87]">
                  {r.itemName} (الكمية المرتجعة: {r.qtyReturned}) · {r.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Supplier & Customer Payments (Debit / Credit -> GL) */}
      {subTab === 'payments' && (
        <div className="space-y-3">
          <form
            onSubmit={handleSubmitPayment}
            className="rounded-2xl border-2 border-[#3B0764] bg-[#FFFBEB] p-3 space-y-2.5"
          >
            <div className="text-xs font-black text-[#3B0764]">
              تسجيل مدفوعات الموردين وتحصيلات العملاء (مربوط بدفتر الأستاذ العام)
            </div>

            <SmartVoiceMicButton
              context="تسجيل دفعة مورد أو تحصيل عميل (مدين / دائن)"
              onParsed={(f) => {
                if (f.partyName) setPartyName(f.partyName);
                if (f.purpose) setPmtNotes(f.purpose);
                if (f.amountEGP > 0) setPmtAmount(String(f.amountEGP));
                if (f.direction === 'inflow') {
                  setPartyType('customer');
                  setDirection('credit');
                } else {
                  setPartyType('supplier');
                  setDirection('debit');
                }
              }}
              onError={onShowToast}
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={partyType}
                onChange={(e) => {
                  const pt = e.target.value === 'customer' ? 'customer' : 'supplier';
                  setPartyType(pt);
                  setDirection(pt === 'customer' ? 'credit' : 'debit');
                }}
                className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              >
                <option value="supplier">سداد لمورد</option>
                <option value="customer">تحصيل من عميل</option>
              </select>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value === 'credit' ? 'credit' : 'debit')}
                className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              >
                <option value="debit">حركة مدين (Debit)</option>
                <option value="credit">حركة دائن (Credit)</option>
              </select>
            </div>

            <input
              type="text"
              required
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder={partyType === 'supplier' ? 'اسم المورد' : 'اسم العميل'}
              className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={pmtAmount}
                onChange={(e) => setPmtAmount(e.target.value)}
                placeholder="المبلغ بالجنيه"
                className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
              />
              <select
                value={pmtChannel}
                onChange={(e) => setPmtChannel(e.target.value as OwnerFinanceChannel)}
                className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
              >
                <option value="bank">البنك (1020)</option>
                <option value="e_wallet">المحفظة (1020)</option>
                <option value="treasury">الخزينة (1010)</option>
              </select>
            </div>

            <input
              type="text"
              value={pmtNotes}
              onChange={(e) => setPmtNotes(e.target.value)}
              placeholder="البيان / رقم الشيك أو التحويل"
              className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>ترحيل الحركة لدفتر الأستاذ</span>
            </button>
          </form>

          <div className="space-y-2">
            {partyPayments.map((p) => (
              <div key={p.paymentId} className="p-3 rounded-xl border border-[#3B0764]/30 bg-white space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black text-[#3B0764]">
                  <span>
                    {p.partyType === 'supplier' ? 'مورد:' : 'عميل:'} {p.partyName}
                  </span>
                  <span className={p.direction === 'credit' ? 'text-emerald-700 tabular-nums' : 'text-rose-700 tabular-nums'}>
                    {p.amountEGP.toLocaleString()} ج.م ({p.direction === 'credit' ? 'دائن' : 'مدين'})
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-[#581C87]">
                  <span className="font-mono">{p.glAccountCode}</span>
                  <span>{p.paymentDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Live Inventory Stock */}
      {subTab === 'stock' && (
        <div className="space-y-2">
          {inventoryItems.map((item) => {
            const isLow = item.quantityOnHand <= item.minStockAlert;
            return (
              <div
                key={item.itemId}
                className={`p-3 rounded-xl border-2 ${
                  isLow ? 'border-rose-500 bg-rose-50' : 'border-[#3B0764]/30 bg-white'
                } space-y-1`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#3B0764]">{item.nameAr}</div>
                    <div className="text-[10px] font-mono text-[#581C87]">{item.sku}</div>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="text-xs font-black text-[#3B0764] tabular-nums">
                      {item.quantityOnHand} {item.unitAr}
                    </div>
                    <div className="text-[10px] font-bold text-[#581C87] tabular-nums">
                      متوسط التكلفة: {item.avgUnitCostEGP.toLocaleString()} ج.م
                    </div>
                  </div>
                </div>
                {isLow && (
                  <div className="flex items-center gap-1 text-[10px] font-black text-rose-700 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>تنبيه نقص مخزون (الحد الأدنى: {item.minStockAlert} {item.unitAr})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
