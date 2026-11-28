import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Wallet,
  Settings,
  Plus,
  CheckCircle2,
  Lock,
  CreditCard,
  ShieldCheck,
  Languages,
  Moon,
  Sun,
  LogOut,
  Users,
  ClipboardList,
  Trash2,
} from 'lucide-react';
import type { LanguageCode } from '../data/phase1Data';
import type { Phase1RfqSubmission } from './Phase1ServicesHub';
import type { AndroidModalType } from './AndroidCateringModals';

interface WeeklyScheduleEntry {
  id: string;
  dayAr: string;
  kitchenAr: string;
  mealsCount: number;
  shiftAr: string;
}

interface ClientWorkspaceTabsProps {
  activeTab: 'client_schedule' | 'client_wallet' | 'client_settings';
  lang: LanguageCode;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  isOwnerAdmin: boolean;
  isStrictAppOwner?: boolean;
  userEmail?: string;
  userDisplayName?: string;
  rfqSubmissions: Phase1RfqSubmission[];
  onOpenModal: (modal: AndroidModalType) => void;
  onOpenFinancialHub: () => void;
  onOpenOwnerExecutiveFinance?: () => void;
  onOpenPayments: () => void;
  onOpenOperationalTasks: () => void;
  onNavigateSection: (sec: string) => void;
  onSignOut: () => void;
}

const WEEK_DAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

export const ClientWorkspaceTabs: React.FC<ClientWorkspaceTabsProps> = ({
  activeTab,
  lang,
  isDark,
  onToggleTheme,
  onToggleLang,
  isOwnerAdmin,
  isStrictAppOwner = false,
  userEmail,
  userDisplayName,
  rfqSubmissions,
  onOpenModal,
  onOpenFinancialHub,
  onOpenOwnerExecutiveFinance,
  onOpenPayments,
  onOpenOperationalTasks,
  onNavigateSection,
  onSignOut,
}) => {
  const isRtl = lang === 'ar';

  // Recurring weekly schedule state (starts clean at empty array — zero fake data)
  const [scheduleEntries, setScheduleEntries] = useState<WeeklyScheduleEntry[]>(() => {
    try {
      const saved = localStorage.getItem('basit_client_weekly_schedule');
      return saved ? (JSON.parse(saved) as WeeklyScheduleEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [dayAr, setDayAr] = useState(WEEK_DAYS_AR[0]);
  const [kitchenAr, setKitchenAr] = useState('مطبخ العين المركزي');
  const [mealsCount, setMealsCount] = useState('50');
  const [shiftAr, setShiftAr] = useState('الوردية الصباحية (12:30 ظهراً)');

  useEffect(() => {
    try {
      localStorage.setItem('basit_client_weekly_schedule', JSON.stringify(scheduleEntries));
    } catch {
      // ignore
    }
  }, [scheduleEntries]);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.max(1, Number(mealsCount) || 1);
    setScheduleEntries((prev) => [
      {
        id: `SCH-${Date.now().toString().slice(-5)}`,
        dayAr,
        kitchenAr,
        mealsCount: count,
        shiftAr,
      },
      ...prev,
    ]);
  };

  if (activeTab === 'client_schedule') {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-[24px] bg-gradient-to-r from-[#2D0E4E] to-[#62339A] text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFC928] text-[#22093A] flex items-center justify-center shrink-0">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {isRtl ? 'الطلبات والجدول الأسبوعي للإعاشة' : 'Orders & Weekly Catering Schedule'}
              </h2>
              <p className="text-[11px] font-bold text-[#FFE066]">
                {isRtl
                  ? 'جدول التوريد الدوري وطلبات عروض الأسعار المرسلة'
                  : 'Recurring shift deliveries & active RFQ requests'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenModal('client_supply_order')}
            className="min-h-[44px] px-4 rounded-xl bg-[#FFC928] text-[#22093A] text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? 'طلب توريد جديد' : 'New Supply Order'}</span>
          </button>
        </div>

        {/* Add Weekly Schedule Slot */}
        <form
          onSubmit={handleAddSchedule}
          className="p-4 rounded-[24px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-[#C084FC]/20 shadow-xs space-y-3"
        >
          <div className="text-xs font-black text-[#4C1D95] dark:text-[#F5C451]">
            {isRtl ? 'إضافة موعد توريد أسبوعي للجدول:' : 'Add Weekly Catering Schedule Slot:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={dayAr}
              onChange={(e) => setDayAr(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 dark:border-[#C084FC]/30 text-xs font-bold text-[#1E1633] dark:text-white"
            >
              {WEEK_DAYS_AR.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={kitchenAr}
              onChange={(e) => setKitchenAr(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 dark:border-[#C084FC]/30 text-xs font-bold text-[#1E1633] dark:text-white"
            >
              <option value="مطبخ العين المركزي">مول العين (مدينة بدر)</option>
              <option value="مطبخ أنجر ستيشن المركزي">هنجر ستيشن</option>
              <option value="مطبخ بيت العيلة المركزي">بيت العيلة</option>
            </select>
            <input
              type="number"
              min="1"
              value={mealsCount}
              onChange={(e) => setMealsCount(e.target.value)}
              placeholder={isRtl ? 'عدد الوجبات' : 'Meals'}
              className="min-h-[44px] px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 dark:border-[#C084FC]/30 text-xs font-bold text-[#1E1633] dark:text-white tabular-nums"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#F5C451]" />
              <span>{isRtl ? 'جدولة' : 'Schedule'}</span>
            </button>
          </div>
          <input
            type="text"
            value={shiftAr}
            onChange={(e) => setShiftAr(e.target.value)}
            placeholder={isRtl ? 'تفاصيل الوردية أو عنوان التسليم' : 'Shift details'}
            className="min-h-[44px] w-full px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#120D1D] border border-[#4C1D95]/20 dark:border-[#C084FC]/30 text-xs font-bold text-[#1E1633] dark:text-white"
          />
        </form>

        {/* Weekly Entries */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-[#1E1633] dark:text-white px-1">
            {isRtl ? `جدول الأسبوع المسجل (${scheduleEntries.length}):` : `Weekly Slots (${scheduleEntries.length}):`}
          </h3>
          {scheduleEntries.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 text-xs font-bold text-[#5E5570] dark:text-[#C4B5FD] text-center">
              {isRtl
                ? 'الجدول فارغ حالياً — أضف مواعيد التوريد الأسبوعية من الأعلى.'
                : 'No scheduled slots yet — add a recurring delivery above.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheduleEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-black text-[#4C1D95] dark:text-[#F5C451]">
                      {item.dayAr} · {item.mealsCount} {isRtl ? 'وجبة' : 'meals'}
                    </div>
                    <div className="text-xs font-bold text-[#1E1633] dark:text-white truncate">
                      {item.kitchenAr}
                    </div>
                    <div className="text-[10px] text-[#5E5570] dark:text-[#C4B5FD] truncate">
                      {item.shiftAr}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setScheduleEntries((prev) => prev.filter((x) => x.id !== item.id))
                    }
                    aria-label={isRtl ? 'حذف' : 'Remove'}
                    className="min-h-[40px] min-w-[40px] rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submitted RFQs / Orders */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-[#1E1633] dark:text-white px-1">
            {isRtl ? `سجل طلبات التوريد وعروض الأسعار (${rfqSubmissions.length}):` : `Active Requests (${rfqSubmissions.length}):`}
          </h3>
          {rfqSubmissions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 text-xs font-bold text-[#5E5570] dark:text-[#C4B5FD] text-center">
              {isRtl ? 'لا توجد طلبات مسجلة بعد.' : 'No active requests yet.'}
            </div>
          ) : (
            <div className="space-y-2">
              {rfqSubmissions.slice(0, 8).map((rfq) => (
                <div
                  key={rfq.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-black text-[#1E1633] dark:text-white truncate">
                      {rfq.organizationOrKitchenName}
                    </div>
                    <div className="text-[11px] font-bold text-[#5E5570] dark:text-[#C4B5FD] truncate">
                      {rfq.targetKitchen} · {rfq.estimatedMealsPerDay}
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F5F3FF] dark:bg-[#241B38] text-[#4C1D95] dark:text-[#F5C451] text-[10px] font-black">
                      {rfq.status}
                    </span>
                    <div className="text-[10px] font-mono text-[#64748B] mt-0.5" dir="ltr">
                      {rfq.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'client_wallet') {
    return (
      <div className="space-y-4">
        <div className="p-5 rounded-[26px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] text-white border border-[#F5C451]/40 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#F5C451] text-[#2A0E4D] flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F5C451]">
                  {isRtl ? 'رصيد المحفظة والفواتير (البداية النظيفة)' : 'Clean Account Balance'}
                </div>
                <div className="text-2xl font-black text-white tabular-nums" dir="ltr">
                  0.00 EGP
                </div>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-[#F5C451]" />
          </div>

          <p className="text-[11px] font-bold text-[#EDE9FE]">
            {isRtl
              ? 'رصيد الحساب يبدأ بـ 0.00 بدون أي أرقام وهمية — تظهر المعاملات والفواتير الفعلية هنا فور اعتمادها.'
              : 'Account starts clean at 0.00 with zero dummy balances — real verified transactions appear here.'}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenPayments}
              className="min-h-[44px] px-4 rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isRtl ? 'وسائل الدفع المعتمدة' : 'Payment Gateways'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenModal('quote_tasting')}
              className="min-h-[44px] px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-[#F5C451]" />
              <span>{isRtl ? 'طلب فاتورة / عرض سعر' : 'Request Quotation'}</span>
            </button>
          </div>
        </div>

        {isStrictAppOwner && (
          <div className="p-4 rounded-[24px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] border border-[#F5C451]/60 shadow-md flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F5C451] text-[#2A0E4D] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-[#F5C451]">
                  {isRtl ? 'المنصة المالية الخاصة بالمالك' : 'App Owner Executive Finance'}
                </h3>
                <p className="text-[11px] font-bold text-[#EDE9FE]">
                  {isRtl
                    ? 'محمية بمصادقة ثنائية (2FA) — مقصورة حصرياً على مالك التطبيق'
                    : 'Protected by 2FA — App Owner Only'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (onOpenOwnerExecutiveFinance ? onOpenOwnerExecutiveFinance() : onOpenFinancialHub())}
              className="min-h-[44px] px-4 rounded-xl bg-[#F5C451] text-[#2A0E4D] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isRtl ? 'فتح الإدارة المالية' : 'Open Owner Finance'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="p-4 rounded-[24px] bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-white flex items-center gap-3 shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-[#F5C451] text-[#2A0E4D] flex items-center justify-center shrink-0">
          <Settings className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black text-white truncate">
            {userDisplayName || (isRtl ? 'حساب وإعدادات المنشأة' : 'Account & Settings')}
          </h2>
          <p className="text-[11px] font-bold text-[#F5C451] truncate" dir="ltr">
            {userEmail || 'BASIT Account'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateSection('login')}
          className="min-h-[54px] p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 text-start flex items-center gap-3 cursor-pointer hover:border-[#4C1D95] transition-colors shadow-xs"
        >
          <Users className="w-5 h-5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
          <div>
            <div className="text-xs font-black text-[#1E1633] dark:text-white">
              {isRtl ? 'تفاصيل الحساب والأمان' : 'Account & Security'}
            </div>
            <div className="text-[10px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
              {isRtl ? 'كلمة المرور، الجلسات والصلاحيات' : 'Password, sessions & roles'}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenOperationalTasks}
          className="min-h-[54px] p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 text-start flex items-center gap-3 cursor-pointer hover:border-[#4C1D95] transition-colors shadow-xs"
        >
          <ClipboardList className="w-5 h-5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
          <div>
            <div className="text-xs font-black text-[#1E1633] dark:text-white">
              {isRtl ? 'مهام التشغيل والمتابعة' : 'Operational Tasks'}
            </div>
            <div className="text-[10px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
              {isRtl ? 'متابعة مهام التوريد اليومية' : 'Daily catering & kitchen tasks'}
            </div>
          </div>
        </button>

        {(isOwnerAdmin || isStrictAppOwner) && (
          <button
            type="button"
            onClick={() => onNavigateSection('admin')}
            className="min-h-[54px] p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 text-start flex items-center gap-3 cursor-pointer hover:border-[#4C1D95] transition-colors shadow-xs"
          >
            <ShieldCheck className="w-5 h-5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
            <div>
              <div className="text-xs font-black text-[#1E1633] dark:text-white">
                {isRtl ? 'بوابة الشركة والفريق' : 'Team & Enterprise Hub'}
              </div>
              <div className="text-[10px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                {isRtl ? 'الإدارة، الجهات والموافقات' : 'Governance & Approvals'}
              </div>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleLang}
          className="min-h-[54px] p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 text-start flex items-center gap-3 cursor-pointer hover:border-[#4C1D95] transition-colors shadow-xs"
        >
          <Languages className="w-5 h-5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
          <div>
            <div className="text-xs font-black text-[#1E1633] dark:text-white">
              {isRtl ? 'تغيير اللغة (العربية / EN)' : 'Switch Language (AR / EN)'}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="min-h-[54px] p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 text-start flex items-center gap-3 cursor-pointer hover:border-[#4C1D95] transition-colors shadow-xs"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-[#F5C451] shrink-0" />
          ) : (
            <Moon className="w-5 h-5 text-[#4C1D95] shrink-0" />
          )}
          <div>
            <div className="text-xs font-black text-[#1E1633] dark:text-white">
              {isDark
                ? isRtl
                  ? 'التبديل للوضع الفاتح'
                  : 'Switch to Light Mode'
                : isRtl
                  ? 'التبديل للوضع الداكن'
                  : 'Switch to Dark Mode'}
            </div>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="min-h-[48px] w-full rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>{isRtl ? 'تسجيل الخروج من الحساب' : 'Sign Out'}</span>
      </button>
    </div>
  );
};
