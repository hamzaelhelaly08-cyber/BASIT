import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Moon, 
  Sun, 
  Languages, 
  History, 
  ChevronDown, 
  Search,
  CheckCircle2,
  Lock,
  Layers,
  Globe,
  LayoutDashboard,
  Building2,
  Printer,
  LogIn,
  LogOut,
  KeyRound,
  TrendingUp
} from 'lucide-react';
import { RoleProfile, ModuleCategory } from '../types/dashboard';
import { UserAccount } from '../lib/auth';
import { USER_ROLES } from '../data/mockOperationalData';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';

export type AppView = 'public' | 'admin' | 'financial' | 'clients' | 'haccp' | 'vault' | 'habe_german' | 'departments';

interface AdminHeaderProps {
  currentRole: RoleProfile;
  onSelectRole: (role: RoleProfile) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isRtl: boolean;
  onToggleLang: () => void;
  activeCategory: ModuleCategory;
  onSelectCategory: (cat: ModuleCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuditLogs: () => void;
  auditCount: number;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onOpenPrintModal: () => void;
  onOpenAuthModal: () => void;
  pendingRegistrationCount?: number;
  onOpenRegistrationModal?: () => void;
  onOpenPrintMenuCatalog?: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  activeAccount?: UserAccount | null;
  onOpenLegalPaperwork?: () => void;
  onOpenUniversalDocBuilder?: () => void;
  onOpenCamelLiverModal?: () => void;
  onOpenEventWeddingModal?: () => void;
  onOpenForecastingModal?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentRole,
  onSelectRole,
  isDark,
  onToggleTheme,
  isRtl,
  onToggleLang,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAuditLogs,
  auditCount,
  currentView,
  onChangeView,
  onOpenPrintModal,
  onOpenAuthModal,
  pendingRegistrationCount = 0,
  onOpenRegistrationModal,
  onOpenPrintMenuCatalog,
  onOpenLegalPaperwork,
  onOpenUniversalDocBuilder,
  onOpenCamelLiverModal,
  onOpenEventWeddingModal,
  onOpenForecastingModal
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const categories: { id: ModuleCategory; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'كافة الموديولات (20)', labelEn: 'All Modules (20)' },
    { id: 'kitchens_ops', labelAr: 'المطابخ والتشغيل', labelEn: 'Kitchens & Ops' },
    { id: 'clients_contracts', labelAr: 'العملاء والتعاقدات', labelEn: 'Clients & Contracts' },
    { id: 'quality_hygiene', labelAr: 'الجودة والهايجين HACCP', labelEn: 'Quality & HACCP' },
    { id: 'finance_procure', labelAr: 'المالية والمخزون', labelEn: 'Finance & Stock' },
    { id: 'commercial_season', labelAr: 'العروض والمواسم', labelEn: 'Offers & Seasons' },
    { id: 'admin_governance', labelAr: 'الإدارة والحوكمة', labelEn: 'Governance' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-[#62339A]/35 text-white shadow-xl select-none">
      
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Zone 1: Real Brand Logo & Identity */}
        <div 
          onClick={() => onChangeView('public')}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
          title={isRtl ? 'الرئيسية — كاترينج مصر' : 'Home — Catering Egypt'}
        >
          <BrandLogo size="md" showGlow={true} />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-xl tracking-tight text-white whitespace-nowrap">
                CATERING <span className="text-[#62339A]">EGYPT</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#62339A]/20 text-[#FFC928] border border-[#62339A]/35">
                الوطنية اللوجستية
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">
              {isRtl ? 'المطابخ المركزية · بوابات العملاء · سلامة الغذاء HACCP' : 'Central Kitchens · Client Portals · HACCP'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation View Switcher (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs font-bold">
          <button
            onClick={() => onChangeView('public')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'public'
                ? 'bg-[#62339A] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isRtl ? 'الواجهة العامة' : 'Public Home'}</span>
          </button>

          {/* New Button: وجهة الألمانية Ha-Be */}
          <button
            onClick={() => onChangeView('habe_german')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'habe_german'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-400 hover:text-white hover:bg-slate-700/60'
            }`}
            title="وجهة الشركة الألمانية للأسمنت و Ha-Be Market (81 موظف)"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{isRtl ? 'وجهة الألمانية (Ha-Be)' : 'German Cement (Ha-Be)'}</span>
          </button>

          {/* New Button: الإدارات الستة 01-06 */}
          <button
            onClick={() => onChangeView('departments')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'departments'
                ? 'bg-[#62339A] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="تقسيم التطبيق إلى 6 إدارات احترافية"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isRtl ? 'الإدارات (01-06)' : 'Departments'}</span>
          </button>

          <button
            onClick={() => onChangeView('admin')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-[#62339A] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{isRtl ? 'لوحة الإدارة (20)' : 'Admin'}</span>
          </button>

          <button
            onClick={() => onChangeView('clients')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'clients'
                ? 'bg-[#62339A] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isRtl ? 'بوابات العملاء' : 'Clients'}</span>
          </button>

          <button
            onClick={() => onChangeView('haccp')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'haccp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HACCP</span>
          </button>

          {/* Official Document Vault Button */}
          {currentRole.canAccessVault && (
            <button
              onClick={() => onChangeView('vault')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'vault'
                  ? 'bg-gradient-to-r from-[#62339A] to-[#4A2378] text-white shadow-xs'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-700/60'
              }`}
              title={isRtl ? 'الحافظة الرسمية للمستندات والشهادات' : 'Official Document Vault'}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'خزينة الوثائق' : 'Vault'}</span>
            </button>
          )}
        </div>

        {/* Zone 3: Interactive Controls & User Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Prominent Button: التعريف بالشركة والأوراق الرسمية */}
          {onOpenLegalPaperwork && (
            <button
              onClick={onOpenLegalPaperwork}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFC928]/20 to-[#62339A]/25 hover:from-[#FFC928]/30 hover:to-[#62339A]/35 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="التعريف بالشركة والاطلاع على الأوراق الرسمية الممسوحة ضوئياً"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isRtl ? 'الأوراق الرسمية والتعريف' : 'Official Docs'}</span>
            </button>
          )}

          {/* Prominent Button: محرر الفواتير الإلكترونية المعتمدة */}
          {onOpenUniversalDocBuilder && (
            <button
              onClick={onOpenUniversalDocBuilder}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="محرر العروض والفواتير الإلكترونية المعتمدة من مصلحة الضرائب ETA"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFC928]" />
              <span className="hidden xl:inline">{isRtl ? 'الفاتورة الإلكترونية والعروض' : 'E-Invoice'}</span>
            </button>
          )}

          {/* Registration Requests Notification (For Eng. Mostafa Shaaban) */}
          {currentRole.canManageUsers && onOpenRegistrationModal && (
            <button
              onClick={onOpenRegistrationModal}
              className="relative p-2 rounded-xl bg-[#62339A]/20 hover:bg-[#62339A]/30 text-[#FFC928] hover:text-white border border-[#62339A]/35 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title={isRtl ? 'طلبات تسجيل الحسابات الجديدة للشركات والمصانع' : 'Account Registration Requests'}
            >
              <KeyRound className="w-4 h-4" />
              <span className="hidden 2xl:inline">{isRtl ? 'طلبات الحسابات' : 'Requests'}</span>
              {pendingRegistrationCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#62339A] text-white text-[10px] font-black flex items-center justify-center">
                  {pendingRegistrationCount}
                </span>
              )}
            </button>
          )}
          
          {/* Print & PDF button */}
          <button
            onClick={onOpenPrintModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title={isRtl ? 'طباعة المستندات وتصدير PDF' : 'Print & PDF Reports'}
          >
            <Printer className="w-4 h-4 text-[#FFC928]" />
            <span className="hidden lg:inline">{isRtl ? 'طباعة PDF' : 'Print'}</span>
          </button>

          {/* User Sign-In / Role Display */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-[#62339A]/35 transition-all text-xs font-semibold text-slate-100 shadow-xs cursor-pointer"
              title={isRtl ? 'الحساب والصلاحيات' : 'Account & Roles'}
            >
              <div className={`w-6 h-6 rounded-lg ${currentRole.badgeColor} flex items-center justify-center text-[10px] font-bold shadow-xs`}>
                {currentRole.avatarText}
              </div>
              <div className="text-start hidden sm:block">
                <div className="text-[11px] font-bold text-white truncate max-w-[120px]">
                  {isRtl ? currentRole.nameAr : currentRole.nameEn}
                </div>
                <div className="text-[9px] text-[#FFC928] font-medium truncate max-w-[120px]">
                  {isRtl ? currentRole.titleAr.split('(')[0] : currentRole.titleEn}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Dropdown */}
            {roleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)} />
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150`}>
                  <div className="px-3 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#FFC928]">
                        {isRtl ? 'الحسابات المعتمدة ونظام الصلاحيات' : 'Authorized Role Accounts'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isRtl ? 'إدارة العمليات والأمان بإشراف م/ مصطفى شعبان' : 'Executive Security by Eng. Mostafa Shaaban'}
                      </p>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-[#62339A]" />
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                    {USER_ROLES.map((role) => {
                      const isSelected = role.id === currentRole.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => {
                            onSelectRole(role);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-start transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#62339A]/15 border border-[#62339A]/35' 
                              : 'hover:bg-slate-800/80 border border-transparent'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg shrink-0 ${role.badgeColor} flex items-center justify-center font-bold text-xs`}>
                            {role.avatarText}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">
                                {isRtl ? role.nameAr : role.nameEn}
                              </span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC928] shrink-0" />}
                            </div>
                            <span className="block text-[10px] text-[#FFC928] font-medium">
                              {isRtl ? role.titleAr : role.titleEn}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="text-xs text-[#FFC928] hover:underline font-bold flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تسجيل دخول بحساب آخر' : 'Switch Account'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Audit Log Drawer Button */}
          <button
            onClick={onOpenAuditLogs}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isRtl ? 'سجل التدقيق والعمليات (Audit Log)' : 'Audit Trail Logs'}
          >
            <History className="w-4 h-4" />
            {auditCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#62339A] text-white text-[10px] font-bold flex items-center justify-center">
                {auditCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors font-semibold text-xs flex items-center gap-1"
          >
            <Languages className="w-4 h-4 text-[#FFC928]" />
            <span className="hidden sm:inline">{isRtl ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

      </div>

      {/* Category Pills (Visible when in Admin view) */}
      {currentView === 'admin' && (
        <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 min-w-max">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#62339A] text-white shadow-md shadow-[#62339A]/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {isRtl ? cat.labelAr : cat.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Quick search input */}
            <div className="hidden lg:flex items-center relative w-64">
              <Search className={`w-3.5 h-3.5 text-slate-400 absolute ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isRtl ? 'بحث في الـ 20 موديول...' : 'Search modules...'}
                className={`w-full bg-slate-900 border border-slate-700 text-xs rounded-lg py-1.5 ${isRtl ? 'pr-8 pl-2' : 'pl-8 pr-2'} text-white outline-none focus:border-[#62339A]`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Android & iPhone native feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around text-[10px] font-bold text-slate-400">
        <button
          onClick={() => onChangeView('public')}
          className={`flex flex-col items-center gap-1 ${currentView === 'public' ? 'text-[#62339A]' : ''}`}
        >
          <Globe className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => onChangeView('admin')}
          className={`flex flex-col items-center gap-1 ${currentView === 'admin' ? 'text-[#62339A]' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>الإدارة (20)</span>
        </button>

        <button
          onClick={() => onChangeView('clients')}
          className={`flex flex-col items-center gap-1 ${currentView === 'clients' ? 'text-[#62339A]' : ''}`}
        >
          <Building2 className="w-4 h-4" />
          <span>بوابات العملاء</span>
        </button>

        <button
          onClick={() => onChangeView('haccp')}
          className={`flex flex-col items-center gap-1 ${currentView === 'haccp' ? 'text-emerald-500' : ''}`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>HACCP</span>
        </button>
      </div>

    </header>
  );
};
