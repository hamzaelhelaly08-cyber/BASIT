import React from 'react';
import { 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  LogOut, 
  User, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Globe, 
  Lock,
  Download
} from 'lucide-react';
import { RoleProfile } from '../types/dashboard';
import { UserAccount } from '../lib/auth';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface InternalNavigationBarProps {
  currentRole: RoleProfile;
  activeAccount: UserAccount | null;
  onGoHome: () => void;
  onGoBack: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isRtl: boolean;
  onToggleLang: () => void;
  currentViewTitleAr: string;
  currentViewTitleEn: string;
  canGoBack?: boolean;
}

export const InternalNavigationBar: React.FC<InternalNavigationBarProps> = ({
  currentRole,
  activeAccount,
  onGoHome,
  onGoBack,
  onLogout,
  isDark,
  onToggleTheme,
  isRtl,
  onToggleLang,
  currentViewTitleAr,
  currentViewTitleEn,
  canGoBack = true
}) => {
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-[#62339A]/35 text-white px-4 sm:px-6 py-3 rounded-2xl shadow-lg mb-6 flex flex-wrap items-center justify-between gap-3 select-none">
      
      {/* 3 Main Required Action Buttons: Home, Back, Logout */}
      <div className="flex items-center gap-2">
        
        {/* 1. HOME BUTTON */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
          title={isRtl ? 'الرئيسية — العودة للواجهة الرئيسية لدورك' : 'Home — Return to role dashboard'}
        >
          <Home className="w-4 h-4" />
          <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
        </button>

        {/* 2. BACK BUTTON */}
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer ${
            !canGoBack ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'
          }`}
          title={isRtl ? 'الرجوع للصفحة السابقة' : 'Back to previous page'}
        >
          <BackIcon className="w-4 h-4 text-[#FFC928]" />
          <span>{isRtl ? 'الرجوع' : 'Back'}</span>
        </button>

        {/* 3. LOGOUT BUTTON */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs transition-all cursor-pointer"
          title={isRtl ? 'إنهاء الجلسة وتسجيل الخروج' : 'Logout & terminate session'}
        >
          <LogOut className="w-4 h-4" />
          <span>{isRtl ? 'تسجيل الخروج' : 'Logout'}</span>
        </button>

      </div>

      {/* Middle: Active View Breadcrumb Indicator */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-slate-400">{isRtl ? 'الموقع الحالي:' : 'Current View:'}</span>
        <span className="font-bold text-[#FFC928]">{isRtl ? currentViewTitleAr : currentViewTitleEn}</span>
      </div>

      {/* Right Zone: User Profile Badge, Install PWA, Theme & Lang */}
      <div className="flex items-center gap-2">
        
        {/* User Identity Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs">
          <div className="w-6 h-6 rounded-full bg-[#62339A] text-white font-black text-[10px] flex items-center justify-center shrink-0">
            {activeAccount?.avatarText || currentRole.avatarText}
          </div>
          <div className="text-right leading-tight">
            <span className="font-bold text-white block text-[11px] truncate max-w-[130px]">
              {activeAccount?.fullNameAr || currentRole.nameAr}
            </span>
            <span className="text-[10px] text-[#FFC928] font-medium truncate max-w-[130px] block">
              {activeAccount?.jobTitleAr || currentRole.titleAr.split('(')[0]}
            </span>
          </div>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton isRtl={isRtl} />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
          title={isDark ? (isRtl ? 'الوضع الفاتح' : 'Light Mode') : (isRtl ? 'الوضع الداكن' : 'Dark Mode')}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={onToggleLang}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
          title={isRtl ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe className="w-3.5 h-3.5 text-[#FFC928]" />
          <span>{isRtl ? 'EN' : 'عربي'}</span>
        </button>

      </div>

    </div>
  );
};
