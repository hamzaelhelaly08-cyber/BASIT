import React from 'react';
import { 
  ChefHat, 
  Building2, 
  Hourglass, 
  ShieldCheck, 
  Percent, 
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

interface StatsBannerProps {
  isRtl: boolean;
  totalModules: number;
  accessibleCount: number;
  roleTitle: string;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  isRtl,
  totalModules,
  accessibleCount,
  roleTitle
}) => {
  return (
    <div className="mb-8 space-y-4">
      {/* Corporate Trust Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#62339A] via-[#4A2378] to-[#62339A] p-4 sm:p-6 text-white shadow-xl shadow-[#62339A]/25 border border-[#FFC928]/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-200" />
              <span className="text-xs font-bold tracking-wider uppercase text-amber-100 bg-black/20 px-2 py-0.5 rounded">
                {isRtl ? 'الشركة الوطنية اللوجستية' : 'National Logistics Corporation'}
              </span>
              <span className="text-xs bg-white/20 text-white font-semibold px-2 py-0.5 rounded">
                ISO 22000 & HACCP
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              {isRtl 
                ? 'جودة تستحق الثقة — عروض خاصة لعملاء الوطنية اللوجستية' 
                : 'Quality Deserving Trust — Special Offers for National Logistics Clients'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl font-medium">
              {isRtl 
                ? 'إدارة متكاملة لـ 3 مطابخ مركزية، 3 مواقع استراتيجية، و5 فرص تعاقد تحت الانتظار مع خصومات تصل إلى 10% لعملائنا التابعين للشركة وفقاً للاعتماد الإداري.' 
                : 'Centralized command for 3 central kitchens, 3 active contracted facilities, 5 pending bids, and up to 10% partner discounts.'}
            </p>
          </div>

          {/* Quick RBAC indicator status */}
          <div className="bg-black/25 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[11px] text-amber-200 font-medium">
                {isRtl ? 'صلاحياتك الحالية' : 'Current RBAC Scope'}
              </div>
              <div className="text-sm font-extrabold text-white truncate max-w-[160px]">
                {roleTitle}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-lg font-black text-white tabular-nums">
                {accessibleCount}<span className="text-xs text-amber-200 font-normal">/{totalModules}</span>
              </div>
              <div className="text-[10px] text-amber-200 font-semibold uppercase">
                {isRtl ? 'موديول متاح' : 'Unlocked'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Essential Operational Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Central Kitchens */}
        <div className="rounded-xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRtl ? 'المطابخ المركزية (3)' : 'Central Kitchens (3)'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              18,500 <span className="text-xs font-semibold text-slate-500">{isRtl ? 'وجبة/يوم' : 'meals/d'}</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{isRtl ? '14,240 منتجة اليوم' : '14,240 cooked today'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#62339A]/10 dark:bg-[#62339A]/20 text-[#62339A] dark:text-[#FFC928] flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Active Sites */}
        <div className="rounded-xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRtl ? 'المواقع المتعاقدة' : 'Active Sites'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              3 <span className="text-xs font-semibold text-slate-500">{isRtl ? 'مواقع استراتيجية' : 'live facilities'}</span>
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
              {isRtl ? 'رويال · الألمانية · الشروق' : 'Royal · German · Shorouk'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Pending Contracts */}
        <div className="rounded-xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRtl ? 'صفقات تحت الانتظار' : 'Pending Deals'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              14.8M <span className="text-xs font-semibold text-slate-500">{isRtl ? 'ج.م قيمة متوقعة' : 'EGP Pipeline'}</span>
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              {isRtl ? '5 جهات قيد التفاوض' : '5 prospects in pipeline'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Food Safety & HACCP */}
        <div className="rounded-xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isRtl ? 'الهايجين وسلامة الغذاء' : 'HACCP & Food Safety'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              99.4% <span className="text-xs font-semibold text-slate-500">{isRtl ? 'امتثال صحي' : 'Compliance'}</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {isRtl ? '0 حوادث (240 يوماً متصلة)' : 'Zero incidents (240 days)'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>
    </div>
  );
};
