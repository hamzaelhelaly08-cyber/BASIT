import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Pencil,
  Check,
  X,
  PlusCircle,
  AlertTriangle,
  Anchor,
  Loader2,
} from 'lucide-react';
import {
  createOwnerBolRow,
  updateOwnerBolRow,
  type BolDocumentType,
  type FinancialUrgencyLevel,
  type OwnerBolDocumentRow,
  type OwnerFinanceDashboardPayload,
} from '../services/ownerFinanceService';
import { SmartVoiceMicButton } from './SmartVoiceMicButton';

interface OwnerBolFinancialGridProps {
  rows: OwnerBolDocumentRow[];
  onUpdated: (next: OwnerFinanceDashboardPayload) => void;
  onShowToast: (msg: string) => void;
}

const DOC_TYPE_LABELS: Record<BolDocumentType, string> = {
  owners_balances: 'تقرير أرصدة الملاك',
  expenses: 'كشف المصروفات',
  rents: 'الإيجارات',
  invoices: 'الفواتير والمستندات',
};

const URGENCY_LABELS: Record<FinancialUrgencyLevel, string> = {
  normal: 'عادي',
  urgent: 'عاجل',
  emergency: 'طوارئ',
};

export const OwnerBolFinancialGrid: React.FC<OwnerBolFinancialGridProps> = ({
  rows,
  onUpdated,
  onShowToast,
}) => {
  const [filterType, setFilterType] = useState<'all' | BolDocumentType>('all');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    partyName: string;
    statement: string;
    originLabel: string;
    debitEGP: string;
    creditEGP: string;
    remainingEGP: string;
    urgency: FinancialUrgencyLevel;
  }>({
    partyName: '',
    statement: '',
    originLabel: '',
    debitEGP: '0',
    creditEGP: '0',
    remainingEGP: '0',
    urgency: 'normal',
  });
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocType, setNewDocType] = useState<BolDocumentType>('owners_balances');
  const [newParty, setNewParty] = useState('');
  const [newStatement, setNewStatement] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDebit, setNewDebit] = useState('');
  const [newCredit, setNewCredit] = useState('');
  const [newRemaining, setNewRemaining] = useState('');
  const [newUrgency, setNewUrgency] = useState<FinancialUrgencyLevel>('normal');
  const [creating, setCreating] = useState(false);

  const visibleRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterType !== 'all' && r.docType !== filterType) return false;
      if (onlyUrgent && r.urgency === 'normal') return false;
      return true;
    });
  }, [rows, filterType, onlyUrgent]);

  const totals = useMemo(() => {
    return visibleRows.reduce(
      (acc, r) => ({
        debit: acc.debit + (Number(r.debitEGP) || 0),
        credit: acc.credit + (Number(r.creditEGP) || 0),
        remaining: acc.remaining + (Number(r.remainingEGP) || 0),
      }),
      { debit: 0, credit: 0, remaining: 0 }
    );
  }, [visibleRows]);

  const startInlineEdit = (r: OwnerBolDocumentRow) => {
    setEditingRowId(r.rowId);
    setDraft({
      partyName: r.partyName,
      statement: r.statement,
      originLabel: r.originLabel,
      debitEGP: String(r.debitEGP),
      creditEGP: String(r.creditEGP),
      remainingEGP: String(r.remainingEGP),
      urgency: r.urgency,
    });
  };

  const handleSaveInline = async (rowId: string) => {
    setSavingRowId(rowId);
    try {
      const d = Number(draft.debitEGP || 0);
      const c = Number(draft.creditEGP || 0);
      const rem = Number(draft.remainingEGP);
      const next = await updateOwnerBolRow(rowId, {
        partyName: draft.partyName.trim(),
        statement: draft.statement.trim(),
        originLabel: draft.originLabel.trim(),
        debitEGP: Number.isFinite(d) ? d : 0,
        creditEGP: Number.isFinite(c) ? c : 0,
        remainingEGP: Number.isFinite(rem) ? rem : c - d,
        urgency: draft.urgency,
      });
      onUpdated(next);
      setEditingRowId(null);
      onShowToast('تم حفظ تعديل ترويسة البوليصة مباشرة.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر حفظ التعديل.');
    } finally {
      setSavingRowId(null);
    }
  };

  const handleCreateRow = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = Number(newDebit || 0);
    const c = Number(newCredit || 0);
    const rem = newRemaining.trim() !== '' ? Number(newRemaining) : c - d;
    setCreating(true);
    try {
      const next = await createOwnerBolRow({
        docType: newDocType,
        partyName: newParty.trim(),
        statement: newStatement.trim(),
        originLabel: newOrigin.trim() || newStatement.trim(),
        debitEGP: Number.isFinite(d) ? d : 0,
        creditEGP: Number.isFinite(c) ? c : 0,
        remainingEGP: Number.isFinite(rem) ? rem : 0,
        urgency: newUrgency,
      });
      onUpdated(next);
      setNewParty('');
      setNewStatement('');
      setNewOrigin('');
      setNewDebit('');
      setNewCredit('');
      setNewRemaining('');
      setShowAddForm(false);
      onShowToast('تم قيد المستند بنجاح داخل شبكة بوليصة الشحن المالية.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر إضافة بند البوليصة.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-3 min-w-0">
      {/* Marine Bill of Lading Master Header Block */}
      <div className="border-2 border-[#3B0764] rounded-2xl overflow-hidden bg-gradient-to-b from-[#FFFBEB] to-[#EDE9FE] shadow-md">
        <div className="bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#581C87] text-white p-3 border-b-2 border-[#FFD54F] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#FFD54F] text-[#3B0764] flex items-center justify-center shrink-0 border border-white/60">
              <Anchor className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-[#FFD54F] truncate">
                بوليصة البيانات المالية الموحدة — BASIT B/L LEDGER
              </h3>
              <p className="text-[10px] font-bold text-[#EDE9FE]">
                كتل بيانات شبكية قابلة للتعديل المباشر (مدين · دائن · باقي)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="min-h-[36px] px-3 rounded-xl bg-[#FFD54F] text-[#3B0764] text-[11px] font-black flex items-center gap-1 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'إغلاق النموذج' : 'قيد بوليصة جديدة'}</span>
          </button>
        </div>

        {/* 3-Box Bill-of-Lading Summary Grid */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[#3B0764]/30 border-b-2 border-[#3B0764]/40 bg-[#FEF9C3]/75 text-center">
          <div className="p-2 min-w-0">
            <div className="text-[10px] font-black text-[#581C87]">إجمالي مدين</div>
            <div className="text-xs font-black text-rose-700 tabular-nums truncate">
              {totals.debit.toLocaleString()} ج.م
            </div>
          </div>
          <div className="p-2 min-w-0">
            <div className="text-[10px] font-black text-[#581C87]">إجمالي دائن</div>
            <div className="text-xs font-black text-emerald-700 tabular-nums truncate">
              {totals.credit.toLocaleString()} ج.م
            </div>
          </div>
          <div className="p-2 min-w-0">
            <div className="text-[10px] font-black text-[#581C87]">صافي الباقي</div>
            <div className="text-xs font-black text-[#3B0764] tabular-nums truncate">
              {totals.remaining.toLocaleString()} ج.م
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-2.5 flex flex-wrap items-center gap-1.5 bg-[#EDE9FE]/80">
          {(['all', 'owners_balances', 'expenses', 'rents', 'invoices'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                filterType === t
                  ? 'bg-[#3B0764] text-[#FFD54F] shadow-xs'
                  : 'bg-[#FFFBEB] text-[#3B0764] border border-[#4C1D95]/30'
              }`}
            >
              {t === 'all' ? 'كافة الوثائق' : DOC_TYPE_LABELS[t]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyUrgent((u) => !u)}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer ${
              onlyUrgent
                ? 'bg-rose-600 text-white'
                : 'bg-[#FFFBEB] text-rose-700 border border-rose-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>العاجل والطوارئ فقط</span>
          </button>
        </div>
      </div>

      {/* Add BoL Row Form with Smart Voice Input */}
      {showAddForm && (
        <form
          onSubmit={handleCreateRow}
          className="border-2 border-[#3B0764] rounded-2xl p-3 bg-[#FFFBEB] space-y-2.5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3B0764]/20 pb-2">
            <span className="text-xs font-black text-[#3B0764] flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-[#4C1D95]" />
              إدراج ترويسة بوليصة جديدة
            </span>
          </div>

          <SmartVoiceMicButton
            context="بوليصة الشحن المالية (مدين/دائن/باقي/إيجارات/أرصدة ملاك)"
            onParsed={(f) => {
              if (f.partyName) setNewParty(f.partyName);
              if (f.purpose) setNewStatement(f.purpose);
              if (f.originLabel) setNewOrigin(f.originLabel);
              if (f.amountEGP > 0) {
                if (f.direction === 'outflow') {
                  setNewDebit(String(f.amountEGP));
                  setNewCredit('0');
                  setNewRemaining(String(-f.amountEGP));
                } else {
                  setNewCredit(String(f.amountEGP));
                  setNewDebit('0');
                  setNewRemaining(String(f.amountEGP));
                }
              }
              setNewUrgency(f.urgency);
            }}
            onError={onShowToast}
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value as BolDocumentType)}
              className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
            >
              <option value="owners_balances">تقرير أرصدة الملاك</option>
              <option value="expenses">كشف المصروفات</option>
              <option value="rents">الإيجارات</option>
              <option value="invoices">الفواتير</option>
            </select>
            <select
              value={newUrgency}
              onChange={(e) => setNewUrgency(e.target.value as FinancialUrgencyLevel)}
              className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
            >
              <option value="normal">أولوية: عادي</option>
              <option value="urgent">أولوية: عاجل</option>
              <option value="emergency">أولوية: طوارئ</option>
            </select>
          </div>

          <input
            type="text"
            required
            value={newParty}
            onChange={(e) => setNewParty(e.target.value)}
            placeholder="الطرف / المالك / المورد / الجهة"
            className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
          />
          <input
            type="text"
            required
            value={newStatement}
            onChange={(e) => setNewStatement(e.target.value)}
            placeholder="البيان التفصيلي للوثيقة"
            className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
          />
          <input
            type="text"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            placeholder="هذا دخل من إيه؟ / هذا مصروف بتاع إيه؟"
            className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={newDebit}
              onChange={(e) => setNewDebit(e.target.value)}
              placeholder="مدين"
              className="w-full min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={newCredit}
              onChange={(e) => setNewCredit(e.target.value)}
              placeholder="دائن"
              className="w-full min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
            />
            <input
              type="number"
              step="0.01"
              value={newRemaining}
              onChange={(e) => setNewRemaining(e.target.value)}
              placeholder="باقي (تلقائي)"
              className="w-full min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>اعتماد وإدراج داخل البوليصة</span>
          </button>
        </form>
      )}

      {/* Bill of Lading Structured Grid Boxes */}
      <div className="space-y-3">
        {visibleRows.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border-2 border-dashed border-[#4C1D95]/30 bg-[#FFFBEB] text-xs font-bold text-[#581C87]">
            لا توجد مستندات بوليصة مطابقة للفلتر الحالي.
          </div>
        ) : (
          visibleRows.map((row) => {
            const isEditing = editingRowId === row.rowId;
            const isSaving = savingRowId === row.rowId;

            return (
              <div
                key={row.rowId}
                className="border-2 border-[#3B0764] rounded-xl overflow-hidden bg-white shadow-sm"
              >
                {/* BoL Box Top Strip */}
                <div className="px-2.5 py-2 bg-[#EDE9FE] border-b border-[#3B0764]/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-[#3B0764] text-[#FFD54F] text-[10px] font-black font-mono">
                      {row.docNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#FFD54F] text-[#3B0764] text-[10px] font-black">
                      {DOC_TYPE_LABELS[row.docType]}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        row.urgency === 'emergency'
                          ? 'bg-rose-600 text-white'
                          : row.urgency === 'urgent'
                            ? 'bg-amber-500 text-[#3B0764]'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {URGENCY_LABELS[row.urgency]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#581C87]">
                      {row.entryDate}
                    </span>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => startInlineEdit(row)}
                        className="min-h-[30px] px-2.5 py-1 rounded-lg bg-[#3B0764] text-[#FFD54F] text-[10px] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>تعديل مباشر</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSaveInline(row.rowId)}
                          className="min-h-[30px] px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>حفظ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRowId(null)}
                          className="min-h-[30px] px-2 py-1 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black flex items-center cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* BoL Data Blocks (Party / Statement / Origin) */}
                <div className="grid grid-cols-1 divide-y divide-[#3B0764]/25 bg-[#FFFBEB]/60">
                  <div className="p-2.5 grid grid-cols-1 gap-1.5">
                    <div>
                      <div className="text-[9px] font-black text-[#581C87]">
                        اسم الطرف / الحساب (CONSIGNEE / PARTY)
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={draft.partyName}
                          onChange={(e) => setDraft({ ...draft, partyName: e.target.value })}
                          className="w-full mt-0.5 px-2 py-1 rounded border border-[#3B0764] bg-white text-xs font-black text-[#3B0764]"
                        />
                      ) : (
                        <div className="text-xs font-black text-[#3B0764] break-words">
                          {row.partyName}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[9px] font-black text-[#581C87]">
                        البيان التفصيلي (DESCRIPTION OF PARTICULARS)
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={draft.statement}
                          onChange={(e) => setDraft({ ...draft, statement: e.target.value })}
                          className="w-full mt-0.5 px-2 py-1 rounded border border-[#3B0764] bg-white text-xs font-bold text-[#3B0764]"
                        />
                      ) : (
                        <div className="text-[11px] font-bold text-[#3B0764] break-words">
                          {row.statement}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[9px] font-black text-[#581C87]">
                        تصنيف الأصل (هذا دخل من إيه؟ / بتاع إيه؟)
                      </div>
                      {isEditing ? (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          <input
                            type="text"
                            value={draft.originLabel}
                            onChange={(e) => setDraft({ ...draft, originLabel: e.target.value })}
                            className="flex-1 min-w-[140px] px-2 py-1 rounded border border-[#3B0764] bg-white text-[11px] font-bold text-[#3B0764]"
                          />
                          <select
                            value={draft.urgency}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                urgency: e.target.value as FinancialUrgencyLevel,
                              })
                            }
                            className="px-2 py-1 rounded border border-[#3B0764] bg-white text-[11px] font-black text-[#3B0764]"
                          >
                            <option value="normal">عادي</option>
                            <option value="urgent">عاجل</option>
                            <option value="emergency">طوارئ</option>
                          </select>
                        </div>
                      ) : (
                        <div className="text-[11px] font-extrabold text-[#4C1D95] break-words">
                          {row.originLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3-Cell Numeric Accounting Block: مدين | دائن | باقى */}
                  <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[#3B0764]/35 bg-white">
                    <div className="p-2 min-w-0">
                      <div className="text-[9px] font-black text-rose-700">مدين (DEBIT)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.debitEGP}
                          onChange={(e) => {
                            const nextDebit = e.target.value;
                            const dVal = Number(nextDebit || 0);
                            const cVal = Number(draft.creditEGP || 0);
                            setDraft({
                              ...draft,
                              debitEGP: nextDebit,
                              remainingEGP: String(cVal - dVal),
                            });
                          }}
                          className="w-full mt-0.5 px-1.5 py-1 rounded border-2 border-[#FFD54F] bg-[#FFFBEB] text-xs font-black text-rose-700 tabular-nums"
                        />
                      ) : (
                        <div className="text-xs font-black text-rose-700 tabular-nums truncate">
                          {row.debitEGP.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="p-2 min-w-0">
                      <div className="text-[9px] font-black text-emerald-700">دائن (CREDIT)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.creditEGP}
                          onChange={(e) => {
                            const nextCredit = e.target.value;
                            const dVal = Number(draft.debitEGP || 0);
                            const cVal = Number(nextCredit || 0);
                            setDraft({
                              ...draft,
                              creditEGP: nextCredit,
                              remainingEGP: String(cVal - dVal),
                            });
                          }}
                          className="w-full mt-0.5 px-1.5 py-1 rounded border-2 border-[#FFD54F] bg-[#FFFBEB] text-xs font-black text-emerald-700 tabular-nums"
                        />
                      ) : (
                        <div className="text-xs font-black text-emerald-700 tabular-nums truncate">
                          {row.creditEGP.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="p-2 min-w-0 bg-[#EDE9FE]/50">
                      <div className="text-[9px] font-black text-[#3B0764]">باقى (BALANCE)</div>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={draft.remainingEGP}
                          onChange={(e) => setDraft({ ...draft, remainingEGP: e.target.value })}
                          className="w-full mt-0.5 px-1.5 py-1 rounded border-2 border-[#3B0764] bg-white text-xs font-black text-[#3B0764] tabular-nums"
                        />
                      ) : (
                        <div className="text-xs font-black text-[#3B0764] tabular-nums truncate">
                          {row.remainingEGP.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
