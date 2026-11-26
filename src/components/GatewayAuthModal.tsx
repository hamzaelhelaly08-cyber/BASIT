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
  MapPin, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Globe,
  UserPlus,
  LogIn,
  KeyRound
} from 'lucide-react';
import { RoleProfile, AccountRegistrationRequest } from '../types/dashboard';
import { USER_ROLES } from '../data/mockOperationalData';
import { BrandLogo } from './BrandLogo';

interface GatewayAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: RoleProfile;
  onLoginAsRole: (role: RoleProfile) => void;
  onGuestAccess: () => void;
  onRegisterRequest: (request: AccountRegistrationRequest) => void;
  isRtl: boolean;
}

export const GatewayAuthModal: React.FC<GatewayAuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onLoginAsRole,
  onGuestAccess,
  onRegisterRequest,
  isRtl
}) => {
  // Mode: 'gateway' (the 3 cards) | 'login' | 'register'
  const [authMode, setAuthMode] = useState<'gateway' | 'login' | 'register'>('gateway');

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Registration form states (Section 3: Create New Account)
  const [regFullName, setRegFullName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('القاهرة');
  const [regIndustry, setRegIndustry] = useState('مصانع وقطاع صناعي');
  const [regReason, setRegReason] = useState('');
  const [regLiaison, setRegLiaison] = useState('');
  const [regDocName, setRegDocName] = useState('السجل_التجاري.pdf');
  const [regPrivacyAgreed, setRegPrivacyAgreed] = useState(true);
  const [regSubmittedId, setRegSubmittedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSuccess(null);
    void onLoginAsRole;
    void loginUsername;
    void loginPassword;
    setLoginError(
      isRtl
        ? 'تم تعطيل تسجيل الدخول الثابت المحلي لأسباب أمنية. استخدم بوابة الوطنية اللوجستية المالية للدخول الآمن عبر Google أو البريد الإلكتروني OTP.'
        : 'Legacy hardcoded login disabled. Use Google Sign-In or verified Email OTP.'
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regCompanyName.trim() || !regEmail.trim() || !regPhone.trim()) {
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
      companyAddress: regAddress.trim() || 'المنطقة الصناعية',
      city: regCity.trim(),
      industryType: regIndustry,
      requestReason: regReason.trim() || 'طلب فتح حساب تعاقدي لإعاشة العاملين والوجبات اليومية',
      contactLiaison: regLiaison.trim() || regFullName.trim(),
      attachedDocName: regDocName,
      privacyAgreed: regPrivacyAgreed,
      status: 'بانتظار المراجعة',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onRegisterRequest(newRequest);
    setRegSubmittedId(newReqId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white relative overflow-hidden"
        role="dialog"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <BrandLogo size="lg" className="mx-auto" showGlow={true} />
          
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              CATERING <span className="text-[#62339A]">EGYPT</span>
            </h2>
            <p className="text-xs font-bold text-[#62339A] dark:text-[#FFC928]">
              An ELWATANYA LOGISTICS Company · كاترينج مصر — إحدى شركات الوطنية اللوجستية
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              منظومة توريد الوجبات وإدارة الإعاشة الغذائية للمصانع والشركات
            </p>
          </div>
        </div>

        {/* SCREEN 1: THE 3 GATEWAY CHOICES (Section 3) */}
        {authMode === 'gateway' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                اختر طريقة الدخول للمنظومة
              </span>
            </div>

            {/* Option 1: Guest Access (دخول زائر) */}
            <div
              onClick={() => {
                onGuestAccess();
                onClose();
              }}
              className="group p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-[#62339A] bg-slate-50/50 dark:bg-slate-950/40 hover:bg-[#F7F5FA]/20 dark:hover:bg-[#2A2040]/40 cursor-pointer transition-all flex items-center justify-between shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#62339A]/10 text-[#62339A] dark:text-[#FFC928] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      دخول زائر (GUEST ACCESS)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F7F5FA] dark:bg-[#2A2040] text-[#62339A]">
                      بدون حساب
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    تصفح المينيوهات العامة، طلب عينة TEST، اقترح منيو، طلب عرض سعر، والدعم الفني المباشر دون الحاجة لتسجيل حساب.
                  </p>
                </div>
              </div>
              <ArrowRight className={`w-5 h-5 text-slate-400 group-hover:text-[#62339A] transition-transform ${isRtl ? 'rotate-180' : ''}`} />
            </div>

            {/* Option 2: Create New Account (تسجيل حساب جديد) */}
            <div
              onClick={() => setAuthMode('register')}
              className="group p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 cursor-pointer transition-all flex items-center justify-between shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      تسجيل حساب منشأة جديد (CREATE NEW ACCOUNT)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      طلب مراجعة
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    للشركات والمصانع الراغبة في فتح بوابة عميل رسمية لتوريد الوجبات اليومية (يخضع لمراجعة واعتماد مدير العمليات).
                  </p>
                </div>
              </div>
              <ArrowRight className={`w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
            </div>

            {/* Option 3: Login (تسجيل الدخول) */}
            <div
              onClick={() => setAuthMode('login')}
              className="group p-4 sm:p-5 rounded-2xl border-2 border-[#62339A]/35 bg-gradient-to-r from-[#62339A] to-[#4A2378] text-white cursor-pointer transition-all flex items-center justify-between shadow-lg shadow-[#62339A]/25 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold shrink-0">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">
                      تسجيل الدخول (LOGIN)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/30 text-amber-200">
                      حساب مفعل
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
                    الدخول الآمن لمدير العمليات، المدير المالي، بوابات العملاء المتعاقدين، وموظفي المنشآت.
                  </p>
                </div>
              </div>
              <ArrowRight className={`w-5 h-5 text-white transition-transform ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          </div>
        )}

        {/* SCREEN 2: LOGIN FORM WITH EYE TOGGLE (Section 3) */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#62339A]" />
                <span>تسجيل الدخول الآمن للحساب</span>
              </h3>
              <button
                type="button"
                onClick={() => setAuthMode('gateway')}
                className="text-[#62339A] dark:text-[#FFC928] font-bold hover:underline"
              >
                ← العودة للاختيارات
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-300 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المستخدم أو البريد الإلكتروني الرسمي *
              </label>
              <div className="relative">
                <User className={`w-4 h-4 text-slate-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="mostafa.shaaban أو abdelmegid.rakhawy"
                  className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-[#62339A] ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  كلمة المرور *
                </label>
                <span className="text-[11px] text-[#62339A] hover:underline cursor-pointer">
                  نسيت كلمة المرور؟
                </span>
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:ring-1 focus:ring-[#62339A] ${isRtl ? 'pr-9 pl-10' : 'pl-9 pr-10'}`}
                />
                
                {/* Mandatory Eye Toggle Button (Section 3) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-2.5 ${isRtl ? 'left-3' : 'right-3'} p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors`}
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#62339A] focus:ring-[#62339A]"
                />
                <span>تذكر جلستي وفق معايير الأمان</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black text-xs shadow-lg shadow-[#62339A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>

            <div className="pt-2 text-center text-slate-500 text-[11px]">
              ليس لديك حساب؟{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-[#62339A] font-bold hover:underline"
              >
                قدم طلب تسجيل حساب جديد الآن
              </button>
            </div>
          </form>
        )}

        {/* SCREEN 3: CREATE NEW ACCOUNT REGISTRATION FORM (Section 3) */}
        {authMode === 'register' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>طلب تسجيل حساب منشأة جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setAuthMode('gateway')}
                className="text-[#62339A] dark:text-[#FFC928] font-bold hover:underline"
              >
                ← العودة للاختيارات
              </button>
            </div>

            {regSubmittedId ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 space-y-3">
                <div className="flex items-center gap-2 font-black text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>تم استلام طلب التسجيل بنجاح برقم: <span className="font-mono underline">{regSubmittedId}</span></span>
                </div>
                <p className="text-xs leading-relaxed">
                  الحالة: <strong>«طلب تسجيل — بانتظار المراجعة»</strong>.
                  وصل إشعار بالطلب إلى مدير العمليات <strong>م/ مصطفى شعبان</strong> لفحص بيانات المنشأة. سيتم التواصل معكم فوراً أو إصدار بيانات الدخول المؤقتة بعد الاعتماد الرسمي.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRegSubmittedId(null);
                    setAuthMode('gateway');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  فهمت ذلك — العودة للمنصة
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الاسم الكامل لمقدم الطلب *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="الاسم الثلاثي"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#62339A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم الشركة أو المصنع *
                    </label>
                    <input
                      type="text"
                      required
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      placeholder="مثال: شركة العاشر للغزل والنسيج"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#62339A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المسمى الوظيفي *
                    </label>
                    <input
                      type="text"
                      required
                      value={regJobTitle}
                      onChange={(e) => setRegJobTitle(e.target.value)}
                      placeholder="مثال: مدير المشتريات / مدير الموارد البشرية"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#62339A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نوع النشاط *
                    </label>
                    <select
                      value={regIndustry}
                      onChange={(e) => setRegIndustry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold"
                    >
                      <option value="مصانع وقطاع صناعي">مصانع وقطاع صناعي ثقيل</option>
                      <option value="مستشفيات ورعاية صحية">مستشفيات ورعاية طبية</option>
                      <option value="شركات ومكاتب كبرى">شركات ومقرات إدارية</option>
                      <option value="مقاولات ومشروعات إنشائية">مقاولات ومشروعات إنشائية</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      البريد الإلكتروني الرسمي للعمل *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#62339A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الهاتف للتواصل الرسمي *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#62339A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الشركة أو موقع المصنع *
                    </label>
                    <input
                      type="text"
                      required
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="المنطقة الصناعية — بلوك 4"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المدينة / المحافظة *
                    </label>
                    <input
                      type="text"
                      required
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="القاهرة / العاشر من رمضان / السويس / بني سويف"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سبب طلب الحساب واحتياج الوجبات *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value)}
                    placeholder="مثال: توريد 600 وجبة غداء يومية للعمال وإدارة كنتين الموقع..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مستند تعريفي بالشركة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={regDocName}
                    onChange={(e) => setRegDocName(e.target.value)}
                    placeholder="السجل_التجاري.pdf أو البطاقة_الضريبية.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      required
                      checked={regPrivacyAgreed}
                      onChange={(e) => setRegPrivacyAgreed(e.target.checked)}
                      className="rounded text-[#62339A] focus:ring-[#62339A]"
                    />
                    <span>أوافق على سياسة الخصوصية وشروط الاستخدام لنظام كاترينج مصر</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('gateway')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إرسال طلب التسجيل للإدارة</span>
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
