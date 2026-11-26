import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { LanguageCode } from '../data/phase1Data';
import type { KaffarahOrderDoc, KaffarahRuleDoc } from '../types/faydEcosystem';
import { submitKaffarahOrder } from '../services/faydFirestoreService';
import { Service3DIcon } from './Service3DIcon';

interface KaffarahViewProps {
  lang: LanguageCode;
  user: User | null;
  kaffarahRule: KaffarahRuleDoc | null;
  myKaffarahOrders: KaffarahOrderDoc[];
  onRequireSignIn: () => void;
  onBackHome: () => void;
  onToast: (msg: string) => void;
}

export const KaffarahView: React.FC<KaffarahViewProps> = ({
  lang,
  user,
  kaffarahRule,
  myKaffarahOrders,
  onRequireSignIn,
  onBackHome,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [kaffarahCount, setKaffarahCount] = useState('1');
  const [distributionNotes, setDistributionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRuleActive = Boolean(
    kaffarahRule &&
      kaffarahRule.isOfficiallyApproved &&
      kaffarahRule.unitCostEGP > 0 &&
      kaffarahRule.mealsPerKaffarah > 0 &&
      kaffarahRule.shariaAuthorityName.trim().length > 0 &&
      kaffarahRule.referenceCode.trim().length > 0
  );

  const countNum = Math.max(1, Math.min(1000, Math.round(Number(kaffarahCount) || 1)));
  const calculatedMeals = isRuleActive && kaffarahRule ? countNum * kaffarahRule.mealsPerKaffarah : 0;
  const calculatedTotalEGP = isRuleActive && kaffarahRule ? Math.round(countNum * kaffarahRule.unitCostEGP) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRuleActive || !kaffarahRule) return;
    if (!user) {
      onRequireSignIn();
      return;
    }
    setSubmitting(true);
    try {
      const orderId = await submitKaffarahOrder(user, kaffarahRule, {
        donorName: donorName || user.displayName || 'مقدم الطلب',
        phone,
        kaffarahCount: countNum,
        distributionNotes,
      });
      setDistributionNotes('');
      onToast(
        isRtl
          ? `تم تسجيل طلب كفارة اليمين رقم ${orderId} وفق المرجعية الرسمية المعتمدة.`
          : `Kaffarah order ${orderId} recorded.`
      );
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full basit-glass-pill text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
          <span>{isRtl ? 'العودة للرئيسية' : 'Back Home'}</span>
        </button>

        <span className="px-4 py-2 rounded-full basit-glass-pill text-[#62339A] dark:text-[#A34FE8] text-xs font-black">
          {isRtl ? 'قسم مستقل ومنضبط شرعياً — كفارات اليمين' : 'Standalone Governed Module — Kaffarah'}
        </span>
      </div>

      {/* Header */}
      <section className="rounded-[28px] bg-gradient-to-br from-[#292333]/95 via-[#1E293B]/95 to-[#62339A]/95 backdrop-blur-xl text-white p-6 sm:p-8 shadow-2xl border border-white/25 flex flex-col sm:flex-row sm:items-center gap-5">
        <Service3DIcon iconKey="scale" size="lg" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#A34FE8]">
            <Scale className="w-4 h-4" />
            <span>{isRtl ? 'نظام كفارات اليمين الموثق — BASIT | باسط' : 'BASIT Verified Kaffarah Execution'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isRtl ? 'كفارات اليمين وفق المرجعية الشرعية الرسمية المعتمدة' : 'Kaffarah Execution Under Approved Sharia Reference'}
          </h1>
          <p className="text-xs sm:text-sm text-[#E2E8F0] max-w-3xl leading-relaxed">
            {isRtl
              ? 'يخضع هذا القسم لضوابط شرعية وإدارية صارمة ومستقلة تماماً عن المبادرات العامة: لا يتم تحديد أي قيمة أو عدد وجبات من النظام تلقائياً، ولا يُغلق أي طلب كـ "تم التنفيذ" إلا بعد إرفاق إثبات تنفيذي فعلي ومراجعته.'
              : 'Strictly isolated module governed by official Sharia reference settings from Central Admin. No prices or meal counts are invented locally, and verified completion strictly requires documented execution proof.'}
          </p>
        </div>
      </section>

      {/* Sharia Gate Status */}
      {!isRuleActive || !kaffarahRule ? (
        <div className="p-8 rounded-[28px] basit-liquid-glass ring-2 ring-[#A34FE8]/80 space-y-3 text-center">
          <AlertTriangle className="w-10 h-10 text-[#62339A] dark:text-[#A34FE8] mx-auto" />
          <h2 className="text-lg font-black text-[#292333] dark:text-white">
            {isRtl
              ? 'الخدمة متوقفة لحين اعتماد المرجعية الشرعية الرسمية من الإدارة المركزية'
              : 'Kaffarah Submissions Disabled Pending Official Sharia Authority Approval'}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? 'يتطلب تفعيل كفارات اليمين اعتماد المرجعية الشرعية الرسمية وقيمة الإطعام وعدد الوجبات المعتمد من الإدارة المركزية أولاً في سجل (kaffarah_rules/official) قبل قبول أي طلب.'
              : 'Kaffarah orders require Central Admin to configure and approve the official Sharia authority reference, meal count, and unit cost in Firestore (kaffarah_rules/official).'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Official Rule Summary */}
          <div className="lg:col-span-5 p-6 rounded-[28px] basit-liquid-glass space-y-4 text-xs">
            <div className="flex items-center gap-2 text-sm font-black text-[#62339A] dark:text-[#A34FE8]">
              <ShieldCheck className="w-5 h-5" />
              <span>{isRtl ? 'المرجعية الشرعية والتسعير المعتمد' : 'Approved Sharia Authority & Pricing'}</span>
            </div>

            <div className="space-y-2.5 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30">
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8] block">
                  {isRtl ? 'الجهة / المرجعية الشرعية:' : 'Sharia Authority:'}
                </span>
                <span className="font-black text-sm text-[#292333] dark:text-white">
                  {kaffarahRule.shariaAuthorityName}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8] block">
                  {isRtl ? 'رقم المرجع / الفتوى المعتمدة:' : 'Reference Code:'}
                </span>
                <span className="font-mono font-black text-[#62339A] dark:text-[#A34FE8]">
                  {kaffarahRule.referenceCode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#62339A]/25">
                <div>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                    {isRtl ? 'عدد الوجبات / الكفارة' : 'Meals / Kaffarah'}
                  </span>
                  <span className="font-black text-base text-[#292333] dark:text-white tabular-nums">
                    {kaffarahRule.mealsPerKaffarah}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                    {isRtl ? 'القيمة المعتمدة / الكفارة' : 'Approved Cost'}
                  </span>
                  <span className="font-black text-base text-[#62339A] dark:text-[#A34FE8] tabular-nums">
                    {kaffarahRule.unitCostEGP} {isRtl ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>
            </div>

            {kaffarahRule.notesAr && (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                {kaffarahRule.notesAr}
              </p>
            )}
          </div>

          {/* Kaffarah Order Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 p-6 rounded-[28px] basit-liquid-glass space-y-4 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl ? 'تقديم طلب تنفيذ كفارة يمين موثق' : 'Submit Kaffarah Execution Request'}
              </h2>
              {!user && (
                <button
                  type="button"
                  onClick={onRequireSignIn}
                  className="px-4 py-2 rounded-full basit-glass-btn-primary font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#A34FE8]" />
                  <span>{isRtl ? 'دخول بحساب Google' : 'Sign in'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'اسم مقدم الطلب *' : 'Applicant Name *'}</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'رقم الهاتف للتوثيق *' : 'Phone *'}</label>
                <input
                  type="tel"
                  required
                  minLength={6}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'عدد الكفارات *' : 'Count *'}</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  required
                  value={kaffarahCount}
                  onChange={(e) => setKaffarahCount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/25">
                <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  {isRtl ? 'إجمالي الوجبات' : 'Total Meals'}
                </span>
                <span className="font-black text-sm text-[#292333] dark:text-white tabular-nums">
                  {calculatedMeals} {isRtl ? 'وجبة' : 'meals'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#62339A]/30">
                <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  {isRtl ? 'الإجمالي المعتمد' : 'Total Cost'}
                </span>
                <span className="font-black text-sm text-[#62339A] dark:text-[#A34FE8] tabular-nums">
                  {calculatedTotalEGP.toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">
                {isRtl ? 'نطاق التوزيع أو ملاحظات التوثيق' : 'Distribution Area / Notes'}
              </label>
              <textarea
                rows={2}
                value={distributionNotes}
                onChange={(e) => setDistributionNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-full basit-glass-btn-primary font-black cursor-pointer disabled:opacity-60"
            >
              {submitting
                ? isRtl ? 'جاري التسجيل...' : 'Submitting...'
                : isRtl ? 'تسجيل طلب الكفارة وإحالته للتنفيذ الموثق' : 'Submit Kaffarah Order'}
            </button>
          </form>
        </div>
      )}

      {/* User Kaffarah Orders */}
      <section className="p-5 rounded-[28px] basit-liquid-glass space-y-3 text-xs">
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl ? 'سجل طلبات كفارات اليمين وإثباتات التنفيذ' : 'My Kaffarah Orders & Execution Proofs'}
        </h3>
        {!user ? (
          <p className="text-[#64748B] dark:text-[#94A3B8]">
            {isRtl ? 'سجّل الدخول لعرض طلباتك وحالة التوثيق والتنفيذ.' : 'Sign in to inspect your orders.'}
          </p>
        ) : myKaffarahOrders.length === 0 ? (
          <p className="text-[#64748B] dark:text-[#94A3B8]">
            {isRtl ? 'لا توجد طلبات كفارة يمين مسجلة بحسابك حالياً.' : 'No Kaffarah orders submitted yet.'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {myKaffarahOrders.map((ord) => (
              <div
                key={ord.orderId}
                className="p-4 rounded-2xl basit-glass-tile flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="font-black text-[#292333] dark:text-white">
                    {ord.orderId} — {ord.kaffarahCount} {isRtl ? 'كفارة' : 'Kaffarah'} ({ord.totalMeals}{' '}
                    {isRtl ? 'وجبة' : 'meals'}) · {ord.totalAmountEGP} {isRtl ? 'ج.م' : 'EGP'}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {isRtl ? 'المرجعية: ' : 'Ref: '}
                    {ord.shariaReferenceUsed}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ord.executionProofUrl && (
                    <a
                      href={ord.executionProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E293B] border border-[#62339A]/30 text-[#62339A] dark:text-[#A34FE8] font-black hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إثبات التنفيذ' : 'Execution Proof'}</span>
                    </a>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full font-black flex items-center gap-1 ${
                      ord.executionStatus === 'executed_verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-[#0EA5E9]/20 text-[#0369A1] dark:text-[#A34FE8]'
                    }`}
                  >
                    {ord.executionStatus === 'executed_verified' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {ord.executionStatus === 'executed_verified'
                        ? isRtl ? 'تم التنفيذ الموثق' : 'Executed & Verified'
                        : ord.executionStatus === 'awaiting_execution'
                          ? isRtl ? 'قيد التنفيذ الميداني' : 'Awaiting Execution'
                          : isRtl ? 'بانتظار المراجعة والتحقق' : 'Pending Verification'}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
