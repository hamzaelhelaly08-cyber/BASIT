import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Building2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Globe,
  UserPlus,
  LogIn,
  KeyRound,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { UserAccount, getStoredUsers, saveStoredUsers, setActiveSessionUser } from '../lib/auth';
import { RoleProfile, AccountRegistrationRequest } from '../types/dashboard';
import { USER_ROLES } from '../data/mockOperationalData';
import { BrandLogo } from './BrandLogo';

interface EnterpriseLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount, matchedRole: RoleProfile) => void;
  onGuestAccess: () => void;
  onRegisterRequest: (request: AccountRegistrationRequest) => void;
  isRtl: boolean;
}

export const EnterpriseLoginModal: React.FC<EnterpriseLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onGuestAccess,
  onRegisterRequest,
  isRtl
}) => {
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'force_change'>('login');

  // Form states
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forced password change states
  const [targetChangeUser, setTargetChangeUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Registration form states
  const [regFullName, setRegFullName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('القاهرة');
  const [regIndustry, setRegIndustry] = useState('مصانع وقطاع صناعي');
  const [regReason, setRegReason] = useState('');
  const [regSuccessId, setRegSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    void onLoginSuccess;
    void getStoredUsers;
    void saveStoredUsers;
    void setActiveSessionUser;
    void targetChangeUser;
    setErrorMessage(
      isRtl
        ? 'تم تعطيل تسجيل الدخول بكلمات المرور المحلية الثابتة. يرجى استخدام الدخول الآمن عبر بوابة الوطنية اللوجستية المالية (Google / Email OTP).'
        : 'Static password login is disabled for security. Use Google Sign-In or Email OTP.'
    );
  };

  const handleForceChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(
      isRtl
        ? 'تغيير كلمة المرور يتم فقط من إعدادات الحساب الموثق عبر الخادم.'
        : 'Password management is handled server-side.'
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regCompanyName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setErrorMessage(isRtl ? 'يرجى استكمال الحقول الإلزامية' : 'Please fill all required fields');
      return;
    }

    const newReqId = `REG-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest: AccountRegistrationRequest = {
      id: newReqId,
      fullName: regFullName.trim(),
      companyName: regCompanyName.trim(),
      jobTitle: regJobTitle.trim() || 'مدير إداري',
      workEmail: regEmail.trim(),
      phone: regPhone.trim(),
      companyAddress: regCity,
      city: regCity,
      industryType: regIndustry,
      requestReason: regReason.trim() || 'طلب فتح حساب تعاقدي لإعاشة العاملين والوجبات اليومية',
      contactLiaison: regFullName.trim(),
      privacyAgreed: true,
      status: 'بانتظار المراجعة',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onRegisterRequest(newRequest);
    setRegSuccessId(newReqId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in select-none">
      <div 
        className="w-full max-w-xl my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden"
        role="dialog"
      >
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <BrandLogo size="lg" className="mx-auto" showGlow={true} />
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              CATERING <span className="text-[#62339A]">EGYPT</span>
            </h2>
            <p className="text-xs text-[#62339A] dark:text-[#FFC928] font-bold mt-0.5">
              {isRtl ? 'المنظومة المركزية للشركة الوطنية اللوجستية' : 'ELWATANYA LOGISTICS Central Platform'}
            </p>
          </div>
        </div>

        {/* VIEW 1: MAIN LOGIN SCREEN */}
        {authView === 'login' && (
          <div className="space-y-5">
            
            <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isRtl ? 'تسجيل الدخول للنظام الداخلي' : 'Internal System Login'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'الدخول محمي ومقيد بالصلاحيات والتحقق المعتمد' : 'Restricted enterprise authentication'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="mostafa.shaaban"
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#62339A]"
                  />
                </div>
              </div>

              {/* Password Input with Eye Toggle */}
              <div className="space-y-1.5 text-right">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setAuthView('forgot')}
                    className="text-[11px] text-[#62339A] dark:text-[#FFC928] hover:underline cursor-pointer"
                  >
                    {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'كلمة المرور' : 'Password'}
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pr-10 pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#62339A]"
                  />
                  {/* Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#62339A] focus:ring-[#62339A]"
                  />
                  <span>{isRtl ? 'تذكرني على هذا الجهاز' : 'Remember me'}</span>
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تشفير 256-bit SSL</span>
                </span>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#62339A] to-[#4A2378] hover:from-[#4A2378] hover:to-[#62339A] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#62339A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isRtl ? 'تسجيل الدخول للمنظومة' : 'Login to System'}</span>
              </button>

            </form>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 text-right">
              {isRtl
                ? 'تنويه أمني: تم إلغاء كافة كلمات المرور الافتراضية الثابتة من الواجهة وفق سياسة الوطنية اللوجستية المالية.'
                : 'Security Policy: Static demo credentials have been disabled.'}
            </div>

            {/* Bottom Actions: Guest Access & Request Account */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  onGuestAccess();
                  onClose();
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#62339A]" />
                <span>{isRtl ? 'دخول زائر (تصفح عام)' : 'Guest Access'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="text-[#62339A] dark:text-[#FFC928] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'طلب فتح حساب للشركات' : 'Register Company'}</span>
              </button>
            </div>

          </div>
        )}

        {/* VIEW 2: FORCED PASSWORD CHANGE ON FIRST LOGIN WITH TEMPORARY PASSWORD */}
        {authView === 'force_change' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isRtl ? 'يلزم تغيير كلمة المرور المؤقتة' : 'Change Temporary Password Required'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isRtl 
                  ? 'لقد سجلت الدخول بكلمة مرور مؤقتة صادرة من الإدارة. يرجى إنشاء كلمة مرور جديدة خاصة بك للمتابعة.' 
                  : 'You logged in with a temporary password. Please set a new personal password.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleForceChangeSubmit} className="space-y-4">
              <div className="space-y-1 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'كلمة المرور الجديدة (6 أحرف على الأقل)' : 'New Password'}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#62339A]"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#62339A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#62339A] to-[#4A2378] text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                {isRtl ? 'حفظ كلمة المرور وتفعيل الحساب' : 'Save & Activate Account'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: FORGOT PASSWORD REQUEST */}
        {authView === 'forgot' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isRtl ? 'استعادة كلمة المرور' : 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl 
                  ? 'أدخل بريدك الإلكتروني لإرسال طلب إعادة التعيين لمدير العمليات' 
                  : 'Enter your email to request password reset'}
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="font-bold">
                  {isRtl ? 'تم إرسال طلب إعادة التعيين إلى مدير العمليات بنجاح.' : 'Reset request sent to Operations Director.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isRtl ? 'سيتم إصدار كلمة مرور مؤقتة وإرسالها إلى بريدك الإلكتروني بعد المراجعة.' : 'A temporary password will be issued upon review.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSent(false);
                    setAuthView('login');
                  }}
                  className="mt-2 px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  {isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail.trim()) setForgotSent(true);
                }} 
                className="space-y-3"
              >
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'البريد الإلكتروني المسجل' : 'Registered Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#62339A]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    {isRtl ? 'إرسال طلب الاستعادة' : 'Send Reset Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* VIEW 4: REQUEST NEW COMPANY ACCOUNT */}
        {authView === 'register' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isRtl ? 'طلب إنشاء حساب جديد للشركات والمصانع' : 'Request Enterprise Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl 
                  ? 'يتم فحص الطلب واعتماده من مهندس مصطفى شعبان وإصدار بيانات الدخول' 
                  : 'Reviewed and approved by Eng. Mostafa Shaaban'}
              </p>
            </div>

            {regSuccessId ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="font-bold">
                  {isRtl ? `تم استلام طلب الحساب برقم [${regSuccessId}] بنجاح!` : `Registration request [${regSuccessId}] submitted!`}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isRtl ? 'سيقوم فريق العمليات بالتواصل معكم وتفعيل البوابة الخاصة بالمنشأة.' : 'Operations will contact you to activate your tenant.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRegSuccessId(null);
                    setAuthView('login');
                  }}
                  className="mt-2 px-4 py-1.5 rounded-xl bg-[#62339A] text-white font-bold text-xs"
                >
                  {isRtl ? 'العودة لشاشة الدخول' : 'Back to Login'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'اسم المسؤول الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="أحمد علي"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'اسم الشركة أو المصنع *' : 'Company Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      placeholder="شركة الصناعات المتقدمة"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'البريد الإلكتروني للعمل *' : 'Work Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="procure@factory.eg"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'رقم الهاتف للتواصل *' : 'Phone *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'القطاع' : 'Industry'}
                    </label>
                    <select
                      value={regIndustry}
                      onChange={(e) => setRegIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="مصانع وقطاع صناعي">مصانع وقطاع صناعي</option>
                      <option value="مستشفيات ورعاية صحية">مستشفيات ورعاية صحية</option>
                      <option value="شركات ومقرات إدارية">شركات ومقرات إدارية</option>
                      <option value="مواقع إنشاء وطاقة">مواقع إنشاء وطاقة</option>
                      <option value="جمعيات خيرية وإطعام">جمعيات خيرية وإطعام</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'المدينة / المنطقة' : 'City / Location'}
                    </label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="العاشر من رمضان"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'حجم الوجبات التقريبي المطلوب يومياً وملاحظات' : 'Daily Meal Requirements & Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value)}
                    placeholder="طلب توريد 450 وجبة غداء ساخنة لورديات المصنع..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#62339A] to-[#4A2378] text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    {isRtl ? 'إرسال طلب فتح الحساب' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
