import React from 'react';
import { 
  ChefHat, 
  Building2, 
  Hourglass, 
  Users2, 
  FileText, 
  UserCheck, 
  UtensilsCrossed, 
  Megaphone, 
  TicketPercent, 
  Boxes, 
  Landmark, 
  Receipt, 
  MessageSquareWarning, 
  ShieldCheck, 
  Sparkles, 
  BarChart3, 
  LockKeyhole, 
  MessageCircle, 
  Flame, 
  Sliders,
  Lock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { AdminModule, UserRole } from '../types/dashboard';

interface ModuleCardProps {
  module: AdminModule;
  currentUserRole: UserRole;
  isRtl: boolean;
  onOpenModule: (module: AdminModule) => void;
  onAccessDenied: (module: AdminModule) => void;
}

// Map string icon names to Lucide icon components
const ICON_MAP: Record<string, React.ElementType> = {
  ChefHat,
  Building2,
  Hourglass,
  Users2,
  FileText,
  UserCheck,
  UtensilsCrossed,
  Megaphone,
  TicketPercent,
  Boxes,
  Landmark,
  Receipt,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  BarChart3,
  LockKeyhole,
  MessageCircle,
  Flame,
  Sliders,
};

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  currentUserRole,
  isRtl,
  onOpenModule,
  onAccessDenied,
}) => {
  const IconComponent = ICON_MAP[module.iconName] || Boxes;
  const isAuthorized = module.allowedRoles.includes(currentUserRole);

  const handleClick = () => {
    if (isAuthorized) {
      onOpenModule(module);
    } else {
      onAccessDenied(module);
    }
  };

  const getStatusBadgeStyle = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'warning':
        return 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'info':
        return 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'neutral':
      default:
        return 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className={`group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 text-start cursor-pointer border select-none ${
        isAuthorized
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#62339A]/35 hover:shadow-xl hover:shadow-[#62339A]/25 hover:-translate-y-1'
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 opacity-80 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Header Row of Card */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          
          {/* Icon Container with subtle orange ambient glow */}
          <div className="relative">
            <div
              className={`w-13 h-13 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isAuthorized
                  ? 'bg-gradient-to-br from-[#62339A] to-[#4A2378] text-white shadow-md shadow-[#62339A]/25 group-hover:scale-105 group-hover:shadow-[#62339A]/25'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            {!isAuthorized && (
              <div 
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-amber-400 border border-slate-700 flex items-center justify-center shadow-xs"
                title={isRtl ? 'محمي بصلاحيات الوصول' : 'Access Restricted'}
              >
                <Lock className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {/* Module Index & Status indicator */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums">
              <span>#{String(module.number).padStart(2, '0')}</span>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                module.statusBadge.variant
              )}`}
            >
              {isRtl ? module.statusBadge.textAr : module.statusBadge.textEn}
            </span>
          </div>
        </div>

        {/* Card Titles and Categorization */}
        <div className="space-y-1 mb-3">
          <div className="text-[11px] font-semibold text-[#62339A] dark:text-[#FFC928] uppercase tracking-wide">
            {isRtl ? module.categoryNameAr : module.categoryNameEn}
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#62339A] transition-colors line-clamp-1">
            {isRtl ? module.titleAr : module.titleEn}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {isRtl ? module.descriptionAr : module.descriptionEn}
          </p>
        </div>
      </div>

      {/* Card Bottom Area: Primary KPIs & Action trigger */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        
        {/* KPI metrics row */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
              {module.kpiPrimary.value}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isRtl ? module.kpiPrimary.labelAr : module.kpiPrimary.labelEn}
            </div>
          </div>

          {module.kpiSecondary && (
            <div className="text-end">
              <div className="text-sm font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">
                {module.kpiSecondary.value}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isRtl ? module.kpiSecondary.labelAr : module.kpiSecondary.labelEn}
              </div>
            </div>
          )}
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center justify-between text-xs font-semibold">
          {isAuthorized ? (
            <span className="text-[#62339A] dark:text-[#FFC928] group-hover:text-[#62339A] flex items-center gap-1 transition-colors">
              <span>{isRtl ? module.quickActionAr : module.quickActionEn}</span>
              <ArrowUpRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isRtl ? 'rotate-[-90deg]' : ''}`} />
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-500 flex items-center gap-1 text-[11px]">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>{isRtl ? 'يتطلب تصريح إداري' : 'Role restricted'}</span>
            </span>
          )}

          <span className="text-[10px] font-mono text-slate-400">
            {isAuthorized ? (isRtl ? 'مصرح به' : 'Authorized') : (isRtl ? 'مقيد' : 'Locked')}
          </span>
        </div>
      </div>
    </div>
  );
};
