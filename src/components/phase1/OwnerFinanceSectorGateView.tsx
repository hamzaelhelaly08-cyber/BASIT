import React from 'react';
import {
  Landmark,
  ShieldAlert,
  Lock,
  KeyRound,
  ShieldCheck,
  FileText,
  Vault,
  Users,
} from 'lucide-react';
import ownerFinanceHeroImg from '../../assets/images/sector_owner_finance_1795835811089.jpg';
import type { LanguageCode } from '../../data/phase1Data';

interface OwnerFinanceSectorGateViewProps {
  lang: LanguageCode;
  isOwnerAdmin: boolean;
  ownerEmail?: string;
  onOpenAuthGate: () => void;
  onOpenOwnerDashboard: () => void;
  onBackHome: () => void;
}

const PROTECTED_MODULES_SUMMARY = [
  {
    id: 'mod_ledger',
    titleAr: 'المركز المالي للمؤسسة',
    descAr: 'متابعة السيولة والتسويات المعتمدة (محجوب حتى التحقق)',
    icon: Landmark,
  },
  {
    id: 'mod_vault',
    titleAr: 'الخزينة المغلقة ونسبة 10%',
    descAr: 'حوكمة المخصصات والاحتياطيات (مقفلة بالصلاحيات)',
    icon: Vault,
  },
  {
    id: 'mod_managers',
    titleAr: 'اعتمادات المدير المالي',
    descAr: 'سجل مراجعة الصلاحيات والقيود غير القابلة للتعديل',
    icon: Users,
  },
  {
    id: 'mod_bol',
    titleAr: 'كشوف الإيرادات والمصروفات',
    descAr: 'البيانات المالية الفعلية لا تُعرض للزوار أو المرحلة الأولى',
    icon: FileText,
  },
];

export const OwnerFinanceSectorGateView: React.FC<
  OwnerFinanceSectorGateViewProps
> = ({
  lang,
  isOwnerAdmin,
  ownerEmail,
  onOpenAuthGate,
  onOpenOwnerDashboard,
  onBackHome,
}) => {
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-6 pb-8">
      {/* Executive Security Header */}
      <section className="relative rounded-3xl overflow-hidden bg-[#3B0764] shadow-md min-h-[228px] sm:min-h-[260px] flex flex-col justify-end">
        <img
          src={ownerFinanceHeroImg}
          alt={isRtl ? 'الإدارة المالية للمالك' : 'Owner Financial Management'}
          loading="eager"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#140324]/95 via-[#2E0854]/85 to-[#140324]/55"
        />
        <div className="relative z-10 p-5 sm:p-7 text-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#F5C451]">
            <Lock className="w-4 h-4 shrink-0" />
            <span className="font-latin tracking-wide">
              OWNER FINANCIAL MANAGEMENT
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black leading-tight">
            {isRtl
              ? 'الإدارة المالية للمالك — وصول مقيد بالصلاحيات'
              : 'Owner Financial Management — Restricted Access'}
          </h2>
          <p className="text-xs sm:text-sm text-[#EDE9FE]/90 max-w-2xl leading-relaxed">
            {isRtl
              ? 'هذه المساحة مخصصة لحساب المالك المعتمد فقط (RBAC)، ولا تعرض أي بيانات مالية حقيقية أو معاملات للزوار أو الحسابات غير المصرح لها.'
              : 'Strictly reserved for verified Owner RBAC credentials. No real financial balances or transactions are exposed to visitors.'}
          </p>
        </div>
      </section>

      {/* Authorization Status Box */}
      {isOwnerAdmin ? (
        <section className="rounded-3xl bg-white dark:bg-[#1B132B] border border-emerald-500/35 p-5 space-y-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#1E1633] dark:text-white">
                {isRtl ? 'تم التحقق من صلاحية المالك' : 'Owner Authorization Verified'}
              </h3>
              <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed">
                {isRtl
                  ? `الحساب المعتمد: ${ownerEmail || 'المالك'}. يمكنك فتح لوحة المالك المحفوظة بالمشروع، مع التنبيه أن تنفيذ أي معاملات مالية حقيقية متوقف في المرحلة الأولى.`
                  : `Verified account: ${ownerEmail || 'Owner'}. Preserved dashboard is unlocked for structural review only (live transactions paused in Phase 1).`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onOpenOwnerDashboard}
              className="min-h-[44px] px-5 py-2.5 rounded-xl basit-glass-btn-primary text-xs font-black cursor-pointer"
            >
              {isRtl ? 'فتح بوابة الإدارة المالية للمالك' : 'Open Owner Dashboard'}
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#231938] border border-[#4C1D95]/15 text-xs font-bold text-[#3B0764] dark:text-white cursor-pointer"
            >
              {isRtl ? 'العودة للرئيسية' : 'Back Home'}
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-white/10 p-5 space-y-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] dark:bg-[#2A1D42] text-[#3B0764] dark:text-[#F5C451] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#1E1633] dark:text-white">
                {isRtl
                  ? 'بوابة محمية — يتطلب الدخول بصلاحية المالك'
                  : 'Protected Portal — Owner Sign-In Required'}
              </h3>
              <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed">
                {isRtl
                  ? 'حفاظاً على السرية المالية وأمان النظام، تم حجب جميع الأرصدة والتفاصيل البنكية ولا يتم فتحها إلا بعد تسجيل الدخول بحساب المالك المعتمد.'
                  : 'All financial figures and treasury records are hidden until verified Owner authentication.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onOpenAuthGate}
              className="min-h-[44px] px-5 py-2.5 rounded-xl basit-glass-btn-primary text-xs font-black inline-flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#F5C451]" />
              <span>{isRtl ? 'التحقق الأمني وتسجيل دخول المالك' : 'Owner Sign-In Gate'}</span>
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#231938] border border-[#4C1D95]/15 text-xs font-bold text-[#3B0764] dark:text-white cursor-pointer"
            >
              {isRtl ? 'العودة للرئيسية' : 'Back Home'}
            </button>
          </div>
        </section>
      )}

      {/* Structural Capability Cards (Zero Real Figures Exposed) */}
      <section className="space-y-3">
        <h3 className="text-sm font-black text-[#1E1633] dark:text-white">
          {isRtl ? 'وحدات القطاع المحمية (عرض هيكلي بدون أرقام)' : 'Protected Sector Modules'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROTECTED_MODULES_SUMMARY.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/10 dark:border-white/10 p-4 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] dark:bg-[#231938] text-[#4C1D95] dark:text-[#F5C451] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={1.85} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#1E1633] dark:text-white">
                    {item.titleAr}
                  </h4>
                  <p className="text-[11px] text-[#5B5270] dark:text-slate-300 leading-relaxed">
                    {item.descAr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
