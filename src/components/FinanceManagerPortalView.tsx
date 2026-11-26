import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShoppingBag,
  Truck,
  Wallet,
  FileText,
  Mail,
  MessageCircle,
  KeyRound,
  LogOut,
  ArrowRight,
  Lock,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  changeFinanceManagerPassword,
  fetchFinanceManagerSession,
  fetchFinanceManagerWorkspace,
  getInMemoryFinanceManagerToken,
  loginFinanceManager,
  logoutFinanceManager,
  submitFinanceManagerOperation,
  type FinanceManagerWorkspacePayload,
} from '../services/financeManagerService';
import type { FinanceManagerPublicRecord, OwnerFinanceChannel } from '../services/ownerFinanceService';
import { SmartVoiceMicButton } from './SmartVoiceMicButton';
import { BasitBrandMark } from './BasitBrandMark';

interface FinanceManagerPortalViewProps {
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

export const FinanceManagerPortalView: React.FC<FinanceManagerPortalViewProps> = ({
  onBack,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState<FinanceManagerPublicRecord | null>(null);
  const [workspace, setWorkspace] = useState<FinanceManagerWorkspacePayload | null>(null);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Operation Form State (Strictly restricted: purchase, supply, collection, quotation)
  const [actionType, setActionType] = useState<'purchase' | 'supply' | 'collection' | 'quotation'>('purchase');
  const [partyName, setPartyName] = useState('');
  const [description, setDescription] = useState('');
  const [amountEGP, setAmountEGP] = useState('');
  const [channel, setChannel] = useState<OwnerFinanceChannel>('treasury');
  const [sharedVia, setSharedVia] = useState<'none' | 'email' | 'whatsapp'>('none');
  const [shareTarget, setShareTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastShareLinks, setLastShareLinks] = useState<{
    whatsappUrl: string;
    mailtoUrl: string;
  } | null>(null);

  // Self Password Change State
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const loadWorkspace = async () => {
    try {
      const ws = await fetchFinanceManagerWorkspace();
      setWorkspace(ws);
      setManager(ws.manager);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تحميل مساحة المدير المالي.');
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const sess = await fetchFinanceManagerSession();
      if (!active) return;
      if (sess) {
        setManager(sess);
        await loadWorkspace();
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await loginFinanceManager({
        username: username.trim(),
        password,
      });
      setManager(res.manager);
      setPassword('');
      await loadWorkspace();
      onShowToast(`مرحباً ${res.manager.fullName} — تم فتح الخزينة الفرعية المعزولة.`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل الدخول.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutFinanceManager();
    setManager(null);
    setWorkspace(null);
    setLastShareLinks(null);
    onShowToast('تم تسجيل الخروج من بوابة المدير المالي.');
  };

  const handleOperationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitFinanceManagerOperation({
        actionType,
        partyName: partyName.trim(),
        description: description.trim(),
        amountEGP: Number(amountEGP || 0),
        channel,
        sharedVia,
        shareTarget: shareTarget.trim(),
      });
      setLastShareLinks(res.shareLinks);
      setPartyName('');
      setDescription('');
      setAmountEGP('');
      await loadWorkspace();
      onShowToast('تم ترحيل الحركة بنجاح إلى الخزينة الفرعية وجدولة المراجعة الدورية.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تسجيل العملية.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPwd(true);
    try {
      await changeFinanceManagerPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setShowPwdForm(false);
      onShowToast('تم تحديث كلمة المرور بنجاح.');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تحديث كلمة المرور.');
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[430px] w-full mx-auto p-6 text-center text-xs font-black text-[#3B0764]">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4C1D95]" />
        جاري التحقق من بوابة المدير المالي...
      </div>
    );
  }

  if (!manager) {
    return (
      <div
        dir="rtl"
        className="max-w-[430px] w-full mx-auto p-4 space-y-4 overflow-x-hidden"
      >
        <button
          type="button"
          onClick={onBack}
          className="min-h-[40px] px-3.5 rounded-xl bg-[#EDE9FE] border border-[#4C1D95]/30 text-xs font-black text-[#3B0764] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للشاشة الرئيسية</span>
        </button>

        <div className="rounded-[28px] bg-gradient-to-b from-[#3B0764] via-[#4C1D95] to-[#581C87] border-2 border-[#FFD54F] p-5 text-white shadow-xl space-y-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-1.5 rounded-2xl bg-white shadow-[0_10px_28px_rgba(255,213,79,0.55)]">
              <BasitBrandMark size="md" isRtl />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD54F] text-[#3B0764] text-[11px] font-black">
              <Shield className="w-3.5 h-3.5" />
              <span>بوابة المدير المالي (الخزينة الفرعية)</span>
            </div>
            <p className="text-[11px] font-bold text-[#EDE9FE] leading-relaxed">
              دخول مخصص للمديرين الماليين المعتمدين من المالك فقط. الصلاحيات مقصورة على: المشتريات، التوريد، تحصيل العملاء، وعروض الأسعار.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-black text-[#FFD54F] mb-1">
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: fm_cairo1"
                dir="ltr"
                className="w-full min-h-[44px] px-3 rounded-xl bg-white text-[#3B0764] text-xs font-black border-2 border-[#FFD54F]/70"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#FFD54F] mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full min-h-[44px] px-3 rounded-xl bg-white text-[#3B0764] text-xs font-black border-2 border-[#FFD54F]/70"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full min-h-[46px] rounded-2xl bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] text-[#3B0764] text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>دخول بوابة المدير المالي</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="max-w-[430px] w-full mx-auto p-3 space-y-3.5 overflow-x-hidden pb-16"
    >
      {/* Top Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#581C87] border border-[#FFD54F]/75 p-3 text-white flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-black text-[#FFD54F] truncate">
            {manager.fullName} (@{manager.username})
          </div>
          <div className="text-[10px] font-bold text-[#EDE9FE]">
            حساب المدير المالي #{manager.slotNumber} · خزينة فرعية معزولة
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowPwdForm((p) => !p)}
            className="min-h-[36px] px-2.5 rounded-xl bg-[#FFD54F] text-[#3B0764] text-[10px] font-black flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>كلمة المرور</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[36px] px-2.5 rounded-xl bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Sub-Treasury Isolated Counter (NEVER shows Owner Balances) */}
      <div className="rounded-2xl bg-gradient-to-r from-[#FEF9C3] to-[#FFD54F] border-2 border-[#3B0764] p-3 flex flex-wrap items-center justify-between gap-2 text-[#3B0764]">
        <div>
          <div className="text-[10px] font-black">إجمالي عمليات خزينتك الفرعية</div>
          <div className="text-lg font-black tabular-nums">
            {(workspace?.subTreasuryTotalEGP || 0).toLocaleString()} ج.م
          </div>
        </div>
        <div className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#3B0764] text-[#FFD54F]">
          مراقبة ذكية كل 45 يوماً
        </div>
      </div>

      {showPwdForm && (
        <form
          onSubmit={handlePasswordChange}
          className="rounded-2xl border-2 border-[#3B0764] bg-[#FFFBEB] p-3 space-y-2"
        >
          <div className="text-xs font-black text-[#3B0764]">تغيير كلمة المرور الخاصة بك</div>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="كلمة المرور الحالية"
            className="w-full min-h-[38px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold"
          />
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
            className="w-full min-h-[38px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold"
          />
          <button
            type="submit"
            disabled={changingPwd}
            className="w-full min-h-[40px] rounded-xl bg-[#3B0764] text-[#FFD54F] text-xs font-black cursor-pointer"
          >
            {changingPwd ? 'جاري التحديث...' : 'حفظ كلمة المرور الجديدة'}
          </button>
        </form>
      )}

      {/* Strictly Allowed 4 Scope Actions */}
      <form
        onSubmit={handleOperationSubmit}
        className="rounded-2xl border-2 border-[#3B0764] bg-[#FFFBEB] p-3 space-y-2.5"
      >
        <div className="text-xs font-black text-[#3B0764]">
          تسجيل حركة جديدة (الخزينة الفرعية)
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'purchase' as const, label: 'المشتريات', icon: ShoppingBag },
            { id: 'supply' as const, label: 'توريد', icon: Truck },
            { id: 'collection' as const, label: 'تحصيل عملاء', icon: Wallet },
            { id: 'quotation' as const, label: 'عروض سعر', icon: FileText },
          ].map((btn) => {
            const Icon = btn.icon;
            const active = actionType === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActionType(btn.id)}
                className={`min-h-[42px] px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-[#3B0764] text-[#FFD54F] border border-[#FFD54F]'
                    : 'bg-white text-[#3B0764] border border-[#4C1D95]/30'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        <SmartVoiceMicButton
          context={`بوابة المدير المالي - ${actionType}`}
          fmToken={getInMemoryFinanceManagerToken()}
          onParsed={(f) => {
            if (f.partyName) setPartyName(f.partyName);
            if (f.purpose) setDescription(f.purpose);
            if (f.amountEGP > 0) setAmountEGP(String(f.amountEGP));
          }}
          onError={onShowToast}
        />

        <input
          type="text"
          required
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          placeholder="اسم العميل أو المورد"
          className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
        />
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="تفاصيل العملية أو بنود عرض السعر"
          className="w-full min-h-[40px] px-3 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={amountEGP}
            onChange={(e) => setAmountEGP(e.target.value)}
            placeholder="المبلغ (ج.م)"
            className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764] tabular-nums"
          />
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as OwnerFinanceChannel)}
            className="min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
          >
            <option value="treasury">الخزينة الفرعية</option>
            <option value="bank">تحويل بنكي</option>
            <option value="e_wallet">محفظة إلكترونية</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={sharedVia}
            onChange={(e) =>
              setSharedVia(
                e.target.value === 'whatsapp' || e.target.value === 'email' ? e.target.value : 'none'
              )
            }
            className="min-h-[40px] px-2 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
          >
            <option value="none">تسجيل فقط</option>
            <option value="whatsapp">تجهيز إرسال واتساب</option>
            <option value="email">تجهيز إرسال إيميل</option>
          </select>
          <input
            type="text"
            value={shareTarget}
            onChange={(e) => setShareTarget(e.target.value)}
            placeholder={sharedVia === 'email' ? 'البريد المستلم' : 'رقم الواتساب (اختياري)'}
            className="min-h-[40px] px-2.5 rounded-xl border border-[#4C1D95]/35 bg-white text-xs font-bold text-[#3B0764]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>ترحيل الحركة إلى الخزينة الفرعية</span>
        </button>

        {lastShareLinks && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={lastShareLinks.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[38px] px-3 rounded-xl bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>إرسال عبر واتساب</span>
            </a>
            <a
              href={lastShareLinks.mailtoUrl}
              className="flex-1 min-h-[38px] px-3 rounded-xl bg-[#4C1D95] text-[#FFD54F] text-[11px] font-black flex items-center justify-center gap-1.5"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>إرسال بالإيميل</span>
            </a>
          </div>
        )}
      </form>

      {/* Sub-Treasury Operations Log */}
      <div className="space-y-2">
        <div className="text-xs font-black text-[#3B0764] px-1">
          سجل حركات الخزينة الفرعية ({workspace?.entries.length || 0})
        </div>
        {(workspace?.entries || []).map((entry) => (
          <div
            key={entry.entryId}
            className="p-3 rounded-xl border border-[#3B0764]/30 bg-white space-y-1"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black text-[#3B0764]">
              <span>
                {entry.actionType === 'purchase'
                  ? 'مشتريات'
                  : entry.actionType === 'supply'
                    ? 'توريد'
                    : entry.actionType === 'collection'
                      ? 'تحصيل'
                      : 'عرض سعر'}{' '}
                — {entry.partyName}
              </span>
              <span className="tabular-nums">{entry.amountEGP.toLocaleString()} ج.م</span>
            </div>
            <div className="text-[11px] font-bold text-[#581C87]">{entry.description}</div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-black">
              <span className="text-[#581C87]">{entry.entryDate}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  entry.aiAuditStatus === 'flagged'
                    ? 'bg-rose-100 text-rose-700'
                    : entry.aiAuditStatus === 'reviewed_ok'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                }`}
              >
                {entry.aiAuditStatus === 'flagged' ? (
                  <AlertCircle className="w-3 h-3" />
                ) : entry.aiAuditStatus === 'reviewed_ok' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                <span>
                  {entry.aiAuditStatus === 'flagged'
                    ? 'تنبيه مراجعة للمالك'
                    : entry.aiAuditStatus === 'reviewed_ok'
                      ? 'مراجعة AI مطابقة'
                      : 'دورة تدقيق 45 يوم'}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
