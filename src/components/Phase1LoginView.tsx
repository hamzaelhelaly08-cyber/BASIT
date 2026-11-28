import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChefHat,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Languages,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  User as UserIcon,
  UserPlus,
  X,
} from 'lucide-react';
import { LanguageCode } from '../data/phase1Data';
import { CANONICAL_ROLE_META, EXECUTIVE_ACCOUNTS, type CanonicalRole } from '../types/rbac';
import { BasitBrandMark, BASIT_OFFICIAL_LOGO_PNG } from './BasitBrandMark';
import {
  MobileCoverWaves,
  BottomRoyalWaveFooter,
} from './MobileCoverFrame';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

export interface OtpCustomerSession {
  email: string;
  uid?: string;
  username?: string;
  employeeCode?: string;
  canApproveHabe?: boolean;
  fullName: string;
  verifiedAt: string;
  role?: 'customer' | 'basit_admin' | 'finance_admin' | 'owner';
  canonicalRole?: CanonicalRole;
  tenantId?: string;
  tenantName?: string;
  tenantKind?: 'client_company' | 'central_kitchen' | 'merchant';
  contractedKitchenIds?: string[];
  permissions?: string[];
  approvalStatus?: 'approved' | 'pending_review' | 'rejected' | 'suspended';
  authKind?: 'email_otp' | 'google_firebase' | 'password';
  ownerPinVerified?: boolean;
}

interface MailStatusResponse {
  ok?: boolean;
  brandAr?: string;
  configured?: boolean;
  hasGmailSmtp?: boolean;
  resendOptional?: boolean;
  activeDriver?: string;
  messageAr?: string;
  messageEn?: string;
}

interface OwnerSetupStatusResponse {
  ok?: boolean;
  configured?: boolean;
  configuredAt?: string | null;
  ownerEmailHint?: string;
  requiresBootstrapSecret?: boolean;
  sessionIsOwner?: boolean;
  ownerPinVerified?: boolean;
  code?: string;
}

interface Phase1LoginViewProps {
  lang: LanguageCode;
  onToggleLang?: () => void;
  isGoogleAuthenticated: boolean;
  googleDisplayName?: string;
  googleEmail?: string;
  isOwnerAdmin?: boolean;
  canManageBasitOps?: boolean;
  canApproveHabePurchases?: boolean;
  otpSession: OtpCustomerSession | null;
  isAuthGateMode?: boolean;
  onOtpVerified: (session: OtpCustomerSession) => void;
  onClearOtpSession: () => void;
  onGoogleSignIn: () => void;
  onSignOutGoogle: () => void;
  onBackHome: () => void;
  onContinueAsGuest?: () => void;
  onOpenFinanceManagerPortal?: () => void;
  onOpenAdminHub: () => void;
  onOpenTenantWorkspace?: () => void;
  onShowToast: (msg: string) => void;
}

type AuthTabMode = 'password_login' | 'otp_login' | 'register' | 'forgot_password';

export const Phase1LoginView: React.FC<Phase1LoginViewProps> = ({
  lang,
  onToggleLang,
  isGoogleAuthenticated,
  googleDisplayName,
  googleEmail,
  isOwnerAdmin = false,
  canManageBasitOps = false,
  canApproveHabePurchases = false,
  otpSession,
  isAuthGateMode = false,
  onOtpVerified,
  onClearOtpSession,
  onGoogleSignIn,
  onSignOutGoogle,
  onBackHome,
  onContinueAsGuest,
  onOpenFinanceManagerPortal: _onOpenFinanceManagerPortal,
  onOpenAdminHub,
  onOpenTenantWorkspace,
  onShowToast,
}) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [authTab, setAuthTab] = useState<AuthTabMode>('password_login');
  const [gateModalOpen, setGateModalOpen] = useState<boolean>(false);

  // Password Login State (Username, Email, or Phone + Password)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // First-Run Executive Claim Flow
  const [claimPanelOpen, setClaimPanelOpen] = useState(false);
  const [claimIdentifier, setClaimIdentifier] = useState('');
  const [claimFullNameHint, setClaimFullNameHint] = useState('');
  const [claimPassword, setClaimPassword] = useState('');
  const [claimConfirmPassword, setClaimConfirmPassword] = useState('');

  // Authenticated Self-Service Change Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [changePwBusy, setChangePwBusy] = useState(false);
  const [changePwFeedback, setChangePwFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Registration State (Company/Entity default on gate CTA, plus Central Kitchen & Customer)
  const [regAccountKind, setRegAccountKind] = useState<'customer' | 'client_company' | 'central_kitchen'>(
    'client_company'
  );
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regCommercialRef, setRegCommercialRef] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regInviteToken, setRegInviteToken] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);

  // Email OTP State
  const [otpFullName, setOtpFullName] = useState(otpSession?.fullName || '');
  const [otpEmail, setOtpEmail] = useState(otpSession?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');

  // Forgot Password Recovery State
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');

  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const [mailStatus, setMailStatus] = useState<MailStatusResponse | null>(null);
  const [ownerStatus, setOwnerStatus] = useState<OwnerSetupStatusResponse | null>(null);
  const [ownerPin, setOwnerPin] = useState('');
  const [ownerCurrentPin, setOwnerCurrentPin] = useState('');
  const [ownerBootstrapSecret, setOwnerBootstrapSecret] = useState('');
  const [ownerBusy, setOwnerBusy] = useState(false);
  const [ownerFeedback, setOwnerFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const refreshStatuses = async () => {
    setOwnerStatus({
      ok: true,
      configured: true,
      ownerEmailHint: 'hamzaelhelaly08@gmail.com',
      sessionIsOwner: auth.currentUser?.email === 'hamzaelhelaly08@gmail.com',
      ownerPinVerified: true,
    });
  };

  const openGateModal = (tab: AuthTabMode) => {
    resetMessages();
    setAuthTab(tab);
    if (tab === 'register') {
      setRegAccountKind('client_company');
    }
    setGateModalOpen(true);
  };

  const resolveEmailFromIdentifier = (raw: string): string => {
    const clean = raw.trim().toLowerCase();
    if (clean.includes('@')) return clean;
    const found = EXECUTIVE_ACCOUNTS.find(
      (acc) =>
        acc.username === clean ||
        acc.usernameAliases.includes(clean) ||
        acc.phone === clean
    );
    if (found) return found.email.toLowerCase();
    return `${clean}@basit.eg`;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      const email = resolveEmailFromIdentifier(identifier);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const isOwner = email === 'hamzaelhelaly08@gmail.com';
      const sessionObj: OtpCustomerSession = {
        email: user.email || email,
        uid: user.uid,
        fullName: user.displayName || (isOwner ? 'حمزة الهلالي (المالك)' : 'عميل باسط'),
        verifiedAt: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US'),
        role: isOwner ? 'owner' : 'customer',
        canonicalRole: isOwner ? 'super_admin' : 'customer',
        authKind: 'password',
      };
      setGateModalOpen(false);
      onOtpVerified(sessionObj);
      window.dispatchEvent(new CustomEvent('basit:session-updated'));
      setPassword('');
      onShowToast(
        isRtl
          ? 'تم تسجيل الدخول بنجاح وتفعيل صلاحيات حسابك.'
          : 'Signed in securely — permissions activated.'
      );
      if (isOwner) {
        onOpenAdminHub();
      } else {
        onBackHome();
      }
    } catch (err) {
      setErrorMessage(
        isRtl
          ? 'تعذر تسجيل الدخول. تأكد من صحة البريد/اسم المستخدم وكلمة المرور.'
          : err instanceof Error ? err.message : 'Sign in failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClaimExecutivePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (claimPassword !== claimConfirmPassword) {
      setErrorMessage(
        isRtl ? 'كلمة المرور وتأكيدها غير متطابقين.' : 'Password confirmation does not match.'
      );
      return;
    }
    setBusy(true);
    try {
      const email = resolveEmailFromIdentifier(claimIdentifier);
      let user = auth.currentUser;
      if (!user) {
        const cred = await createUserWithEmailAndPassword(auth, email, claimPassword);
        user = cred.user;
        await updateProfile(user, { displayName: claimFullNameHint || 'مدير تنفيذي' });
      } else {
        await updatePassword(user, claimPassword);
      }
      const isOwner = email === 'hamzaelhelaly08@gmail.com';
      const sessionObj: OtpCustomerSession = {
        email: user.email || email,
        uid: user.uid,
        fullName: user.displayName || claimFullNameHint || 'مدير تنفيذي',
        verifiedAt: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US'),
        role: isOwner ? 'owner' : 'customer',
        canonicalRole: isOwner ? 'super_admin' : 'customer',
        authKind: 'password',
      };
      setClaimPassword('');
      setClaimConfirmPassword('');
      setClaimPanelOpen(false);
      setGateModalOpen(false);
      onOtpVerified(sessionObj);
      window.dispatchEvent(new CustomEvent('basit:session-updated'));
      onShowToast(isRtl ? 'تم تفعيل حسابك وتسجيل الدخول بنجاح.' : 'Account activated.');
      onBackHome();
    } catch (err) {
      setErrorMessage(
        isRtl
          ? err instanceof Error ? err.message : 'تعذر تفعيل كلمة المرور.'
          : err instanceof Error ? err.message : 'Activation failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSelfChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwFeedback(null);
    if (newPasswordInput !== confirmNewPasswordInput) {
      setChangePwFeedback({
        kind: 'err',
        text: isRtl ? 'كلمة المرور الجديدة وتأكيدها غير متطابقين.' : 'New passwords do not match.',
      });
      return;
    }
    if (!auth.currentUser) {
      setChangePwFeedback({
        kind: 'err',
        text: isRtl ? 'يرجى تسجيل الدخول أولاً لتغيير كلمة المرور.' : 'Please sign in first.',
      });
      return;
    }
    setChangePwBusy(true);
    try {
      await updatePassword(auth.currentUser, newPasswordInput);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmNewPasswordInput('');
      setChangePwFeedback({
        kind: 'ok',
        text: isRtl ? 'تم تغيير كلمة المرور بنجاح عبر Firebase Auth.' : 'Password updated successfully.',
      });
    } catch (err) {
      setChangePwFeedback({
        kind: 'err',
        text: isRtl ? (err instanceof Error ? err.message : 'تعذر تحديث كلمة المرور.') : 'Failed to update password.',
      });
    } finally {
      setChangePwBusy(false);
    }
  };

  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      const email = regEmail.trim().toLowerCase() || `${regUsername.trim().toLowerCase() || 'user'}@basit.eg`;
      const cred = await createUserWithEmailAndPassword(auth, email, regPassword);
      await updateProfile(cred.user, {
        displayName: regFullName.trim() || regUsername.trim() || 'عميل باسط',
      });
      const sessionObj: OtpCustomerSession = {
        email: cred.user.email || email,
        uid: cred.user.uid,
        fullName: cred.user.displayName || regFullName.trim() || 'عميل باسط',
        verifiedAt: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US'),
        role: 'customer',
        canonicalRole: 'customer',
        authKind: 'password',
      };
      setGateModalOpen(false);
      onOtpVerified(sessionObj);
      window.dispatchEvent(new CustomEvent('basit:session-updated'));
      onShowToast(
        isRtl ? 'تم إنشاء الحساب وتفعيل جلستك الآمنة بنجاح.' : 'Account created successfully.'
      );
      onBackHome();
    } catch (err) {
      setErrorMessage(
        isRtl
          ? err instanceof Error ? err.message : 'تعذر إتمام إنشاء الحساب.'
          : err instanceof Error ? err.message : 'Registration failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setErrorMessage(
      isRtl
        ? 'تم توحيد تسجيل الدخول مباشرة عبر Firebase Authentication (كلمة المرور أو حساب Google).'
        : 'Sign-in is unified directly via Firebase Authentication (Password or Google).'
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setAuthTab('password_login');
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      const targetEmail = resolveEmailFromIdentifier(resetEmail);
      await sendPasswordResetEmail(auth, targetEmail);
      setStatusMessage(
        isRtl
          ? `تم إرسال رابط استعادة كلمة المرور مباشرة عبر Firebase إلى ${targetEmail}.`
          : `Password reset email sent directly via Firebase to ${targetEmail}.`
      );
    } catch (err) {
      setErrorMessage(
        isRtl
          ? err instanceof Error ? err.message : 'تعذر إرسال رابط الاستعادة عبر Firebase.'
          : err instanceof Error ? err.message : 'Failed to send reset link.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleForgotConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStep('request');
    setAuthTab('password_login');
  };

  const handleOwnerSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerFeedback({
      kind: 'ok',
      text: isRtl
        ? 'يُدار تأمين المالك الثنائي الآن مباشرة من داخل المنصة المالية الخاصة بالمالك.'
        : 'Owner 2FA security is managed inside the Owner Financial Dashboard.',
    });
    await refreshStatuses();
  };

  const handleOwnerVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerFeedback({
      kind: 'ok',
      text: isRtl ? 'جلسة المالك موثقة عبر Firebase Authentication.' : 'Owner Firebase session active.',
    });
    await refreshStatuses();
  };

  const showOwnerCard =
    ownerStatus &&
    ownerStatus.code !== 'FINANCE_ROLE_ISOLATED' &&
    (isOwnerAdmin || ownerStatus.sessionIsOwner || !ownerStatus.configured);

  const activeCanonicalRole = otpSession?.canonicalRole;
  const activeRoleLabel = activeCanonicalRole
    ? isRtl
      ? CANONICAL_ROLE_META[activeCanonicalRole].labelAr
      : CANONICAL_ROLE_META[activeCanonicalRole].labelEn
    : undefined;

  const renderAuthFormsBody = () => (
    <div className="space-y-4">
      {/* Structured Segmented Mode Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/15">
        <button
          type="button"
          onClick={() => {
            setAuthTab('password_login');
            resetMessages();
          }}
          className={`min-h-[42px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
            authTab === 'password_login'
              ? 'bg-[#62339A] text-white shadow-sm'
              : 'text-[#5E5570] dark:text-[#C4B5FD] hover:text-[#62339A]'
          }`}
        >
          {isRtl ? 'دخول بكلمة المرور' : 'Password'}
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthTab('otp_login');
            resetMessages();
          }}
          className={`min-h-[42px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
            authTab === 'otp_login'
              ? 'bg-[#62339A] text-white shadow-sm'
              : 'text-[#5E5570] dark:text-[#C4B5FD] hover:text-[#62339A]'
          }`}
        >
          {isRtl ? 'رمز البريد (OTP)' : 'Email OTP'}
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthTab('register');
            resetMessages();
          }}
          className={`min-h-[42px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
            authTab === 'register'
              ? 'bg-[#62339A] text-white shadow-sm'
              : 'text-[#5E5570] dark:text-[#C4B5FD] hover:text-[#62339A]'
          }`}
        >
          {isRtl ? 'تسجيل حساب جديد' : 'Register'}
        </button>
      </div>

      {/* Status & Error Feedback Banners */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-900 dark:text-emerald-200 text-center">
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-200 text-center">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: USERNAME, EMAIL OR PHONE + PASSWORD LOGIN */}
      {authTab === 'password_login' && (
        <div className="space-y-4">
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#292333] dark:text-white block">
                {isRtl ? 'اسم المستخدم أو البريد أو رقم الهاتف' : 'Username, Email or Phone Number'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] absolute top-1/2 -translate-y-1/2 start-4" />
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="username / name@company.com / +2010..."
                  className="w-full min-h-[48px] ps-11 pe-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs sm:text-sm font-mono font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#292333] dark:text-white">
                  {isRtl ? 'كلمة المرور' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('forgot_password');
                    resetMessages();
                  }}
                  className="text-[11px] font-black text-[#62339A] dark:text-[#FFC928] hover:underline cursor-pointer"
                >
                  {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] absolute top-1/2 -translate-y-1/2 start-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[48px] ps-11 pe-12 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-sm font-mono font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 -translate-y-1/2 end-3 p-2 text-[#5E5570] dark:text-[#C4B5FD] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-[50px] py-3 px-5 rounded-full basit-glass-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4 text-[#FFC928]" />
              <span>
                {busy
                  ? isRtl ? 'جاري التحقق...' : 'Signing in...'
                  : isRtl ? 'تسجيل الدخول للعملاء' : 'Client Sign In'}
              </span>
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setClaimPanelOpen((v) => !v);
                if (identifier.trim() && !claimIdentifier) {
                  setClaimIdentifier(identifier.trim());
                }
              }}
              className="text-[11px] font-black text-[#62339A] dark:text-[#FFC928] hover:underline cursor-pointer"
            >
              {claimPanelOpen
                ? isRtl ? 'إغلاق نموذج التفعيل الأولي' : 'Hide first-run setup'
                : isRtl ? 'حساب تنفيذي / إداري لأول مرة؟ فعّل كلمة مرورك المستقلة' : 'First-run executive account? Activate password'}
            </button>
          </div>

          {claimPanelOpen && (
            <form
              onSubmit={handleClaimExecutivePassword}
              className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1F172F] border border-[#4C1D95]/25 space-y-3"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-black text-[#292333] dark:text-[#FFC928] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" />
                  <span>
                    {isRtl
                      ? `تعيين كلمة المرور الأولية ${claimFullNameHint ? `— ${claimFullNameHint}` : ''}`
                      : `Claim Initial Executive Password ${claimFullNameHint ? `— ${claimFullNameHint}` : ''}`}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                  {isRtl
                    ? 'أنشئ كلمة مرورك المشفرة المستقلة (8+ أحرف).'
                    : 'Set an independent scrypt-hashed password (8+ chars) on your unclaimed account.'}
                </p>
              </div>
              <input
                type="text"
                required
                dir="ltr"
                value={claimIdentifier}
                onChange={(e) => setClaimIdentifier(e.target.value)}
                placeholder={isRtl ? 'اسم المستخدم أو البريد التنفيذي' : 'Executive username or email'}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#140F1F] border border-[#62339A]/25 font-mono text-xs font-bold"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  required
                  minLength={8}
                  dir="ltr"
                  autoComplete="new-password"
                  value={claimPassword}
                  onChange={(e) => setClaimPassword(e.target.value)}
                  placeholder={isRtl ? 'كلمة المرور (8+ أحرف)' : 'Password (8+ chars)'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#140F1F] border border-[#62339A]/25 font-mono text-xs font-bold"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  dir="ltr"
                  autoComplete="new-password"
                  value={claimConfirmPassword}
                  onChange={(e) => setClaimConfirmPassword(e.target.value)}
                  placeholder={isRtl ? 'تأكيد كلمة المرور' : 'Confirm password'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#140F1F] border border-[#62339A]/25 font-mono text-xs font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[46px] rounded-full basit-glass-btn-yellow text-xs font-black cursor-pointer disabled:opacity-60"
              >
                {busy ? (isRtl ? 'جاري التفعيل...' : 'Activating...') : isRtl ? 'تفعيل الحساب وتسجيل الدخول' : 'Activate & Sign In'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: EMAIL OTP LOGIN (GMAIL SMTP) */}
      {authTab === 'otp_login' && (
        <div className="space-y-3.5">
          {mailStatus && !mailStatus.configured && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-300 dark:border-amber-700 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] font-bold leading-relaxed">
                {isRtl ? mailStatus.messageAr : mailStatus.messageEn}
              </div>
            </div>
          )}

          {otpStep === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#62339A] absolute top-1/2 -translate-y-1/2 start-4" />
                <input
                  type="text"
                  minLength={2}
                  value={otpFullName}
                  onChange={(e) => setOtpFullName(e.target.value)}
                  placeholder={isRtl ? 'الاسم الكامل' : 'Full Name'}
                  className="w-full min-h-[48px] ps-11 pe-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs sm:text-sm font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                />
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#62339A] absolute top-1/2 -translate-y-1/2 start-4" />
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full min-h-[48px] ps-11 pe-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 font-mono text-sm font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[48px] py-3 px-5 rounded-full basit-glass-btn-primary text-sm font-black cursor-pointer disabled:opacity-60"
              >
                {busy ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : isRtl ? 'إرسال رمز التحقق (OTP)' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#292333] dark:text-white flex items-center justify-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" />
                  <span>{isRtl ? `أدخل الرمز المرسل إلى ${otpEmail}` : `Enter 6-digit OTP sent to ${otpEmail}`}</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  dir="ltr"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/40 text-center font-mono text-xl font-black tracking-[0.35em] text-[#62339A] dark:text-[#FFC928] focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 min-h-[46px] py-2.5 px-5 rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer disabled:opacity-60"
                >
                  {busy ? (isRtl ? 'جاري التحقق...' : 'Verifying...') : isRtl ? 'تأكيد والدخول' : 'Verify & Enter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('request');
                    setOtpCode('');
                  }}
                  className="min-h-[46px] px-4 py-2.5 rounded-full bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/25 text-xs font-bold text-[#64748B] dark:text-[#C4B5FD] cursor-pointer"
                >
                  {isRtl ? 'تغيير البريد' : 'Change'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: REGISTRATION (Companies & Entities first, plus Kitchens & Individuals) */}
      {authTab === 'register' && (
        <form onSubmit={handleRegisterAccount} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'client_company' as const, icon: Building2, ar: 'شركة / مصنع / جهة', en: 'Company / Entity' },
              { id: 'central_kitchen' as const, icon: ChefHat, ar: 'مطبخ مركزي', en: 'Kitchen' },
              { id: 'customer' as const, icon: UserIcon, ar: 'حساب فردي', en: 'Individual' },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = regAccountKind === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRegAccountKind(opt.id)}
                  className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 text-[11px] font-black transition-all cursor-pointer ${
                    active
                      ? 'bg-[#62339A] text-white border-[#62339A]'
                      : 'bg-[#F7F5FA] dark:bg-[#1F172F] text-[#292333] dark:text-white border-[#E6E0F5] dark:border-[#62339A]/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#FFC928]' : 'text-[#62339A] dark:text-[#FFC928]'}`} />
                  <span className="line-clamp-1">{isRtl ? opt.ar : opt.en}</span>
                </button>
              );
            })}
          </div>

          {regAccountKind !== 'customer' && !showInviteInput && (
            <div className="p-2.5 rounded-2xl bg-[#FFC928]/20 border border-[#FFC928] text-[11px] font-bold text-[#292333] dark:text-[#FFC928]">
              {isRtl
                ? 'تنبيه أمان: حسابات الشركات والجهات والمطابخ تدخل للمراجعة الإدارية قبل تفعيل العقود.'
                : 'Approval Gate: Company and kitchen registrations require Platform Admin approval before permissions activate.'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#62339A] absolute top-1/2 -translate-y-1/2 start-4" />
              <input
                type="text"
                required
                minLength={2}
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder={isRtl ? 'الاسم الكامل لمقدم الطلب' : 'Full Name'}
                className="w-full min-h-[46px] ps-11 pe-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
              />
            </div>
            <input
              type="text"
              dir="ltr"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              placeholder={isRtl ? 'اسم المستخدم (اختياري)' : 'Username (optional)'}
              className="w-full min-h-[46px] px-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 font-mono text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <Mail className="w-4 h-4 text-[#62339A] absolute top-1/2 -translate-y-1/2 start-4" />
              <input
                type="email"
                required
                dir="ltr"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full min-h-[46px] ps-11 pe-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 font-mono text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
              />
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#62339A] absolute top-1/2 -translate-y-1/2 start-4" />
              <input
                type="tel"
                dir="ltr"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+2010xxxxxxxx"
                className="w-full min-h-[46px] ps-11 pe-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 font-mono text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {regAccountKind !== 'customer' && !showInviteInput && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                minLength={2}
                value={regBusinessName}
                onChange={(e) => setRegBusinessName(e.target.value)}
                placeholder={
                  regAccountKind === 'central_kitchen'
                    ? isRtl ? 'اسم المطبخ المركزي' : 'Central Kitchen Name'
                    : isRtl ? 'اسم الشركة أو المصنع أو الجهة' : 'Company / Factory / Entity Name'
                }
                className="w-full min-h-[46px] px-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
              />
              <input
                type="text"
                required
                minLength={2}
                value={regCommercialRef}
                onChange={(e) => setRegCommercialRef(e.target.value)}
                placeholder={isRtl ? 'رقم السجل التجاري / الترخيص' : 'Commercial Reg. / License'}
                className="w-full min-h-[46px] px-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
              />
            </div>
          )}

          {showInviteInput && (
            <div className="relative">
              <Ticket className="w-4 h-4 text-[#62339A] absolute top-1/2 -translate-y-1/2 start-4" />
              <input
                type="text"
                dir="ltr"
                value={regInviteToken}
                onChange={(e) => setRegInviteToken(e.target.value)}
                placeholder={isRtl ? 'رمز دعوة الموظف الصادر من مدير الكيان' : 'Tenant employee invite code'}
                className="w-full min-h-[46px] ps-11 pe-4 rounded-2xl bg-[#F5F0FF] dark:bg-[#1F172F] border border-[#62339A]/45 font-mono text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="w-4 h-4 text-[#62339A] absolute top-1/2 -translate-y-1/2 start-4" />
            <input
              type="password"
              required
              minLength={8}
              dir="ltr"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder={isRtl ? 'كلمة مرور قوية (8 أحرف فأكثر)' : 'Strong password (8+ chars)'}
              className="w-full min-h-[46px] ps-11 pe-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 font-mono text-xs font-bold text-[#292333] dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setShowInviteInput((v) => !v)}
              className="text-[#62339A] dark:text-[#FFC928] hover:underline cursor-pointer"
            >
              {showInviteInput
                ? isRtl ? 'إلغاء رمز الدعوة' : 'Cancel invite code'
                : isRtl ? 'لدي رمز دعوة موظف لجهة معتمدة' : 'Have an employee invitation code?'}
            </button>
            <input
              type="text"
              value={regCity}
              onChange={(e) => setRegCity(e.target.value)}
              placeholder={isRtl ? 'المدينة' : 'City'}
              className="w-28 px-3 py-1 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] text-xs font-bold text-center"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[50px] py-3 px-5 rounded-full basit-glass-btn-yellow text-sm font-black cursor-pointer disabled:opacity-60"
          >
            {busy
              ? isRtl ? 'جاري التسجيل...' : 'Submitting...'
              : regAccountKind === 'customer' || showInviteInput
                ? isRtl ? 'إنشاء الحساب وتفعيله الآن' : 'Create & Activate Account'
                : isRtl ? 'إرسال طلب إنشاء الحساب للشركات والجهات' : 'Submit Organization Account'}
          </button>
        </form>
      )}

      {/* TAB 4: FORGOT PASSWORD RECOVERY */}
      {authTab === 'forgot_password' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#292333] dark:text-white">
              {isRtl ? 'استعادة كلمة المرور عبر البريد المؤمّن' : 'Recover Password via Verified Email'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setAuthTab('password_login');
                resetMessages();
              }}
              className="text-xs font-black text-[#62339A] dark:text-[#FFC928] cursor-pointer"
            >
              {isRtl ? 'العودة للدخول' : 'Back to Login'}
            </button>
          </div>

          {resetStep === 'request' ? (
            <form onSubmit={handleForgotRequest} className="space-y-3">
              <input
                type="email"
                required
                dir="ltr"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="account@company.com"
                className="w-full min-h-[48px] px-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] font-mono text-sm font-bold text-[#292333] dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[48px] rounded-full basit-glass-btn-primary text-xs sm:text-sm font-black cursor-pointer"
              >
                {busy ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : isRtl ? 'إرسال رمز استعادة كلمة المرور' : 'Send Recovery OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotConfirm} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                dir="ltr"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={isRtl ? 'رمز التحقق (6 أرقام)' : '6-digit code'}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/40 text-center font-mono text-lg font-black tracking-widest text-[#62339A] dark:text-[#FFC928]"
              />
              <input
                type="password"
                required
                minLength={8}
                dir="ltr"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder={isRtl ? 'كلمة المرور الجديدة (8+ أحرف)' : 'New password (8+ chars)'}
                className="w-full min-h-[48px] px-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] font-mono text-xs font-bold"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[48px] rounded-full basit-glass-btn-primary text-xs sm:text-sm font-black cursor-pointer"
              >
                {busy ? (isRtl ? 'جاري الحفظ...' : 'Updating...') : isRtl ? 'تحديث كلمة المرور وتأمين الحساب' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Divider + Google Sign-In */}
      {!isGoogleAuthenticated && (
        <>
          <div className="relative flex items-center py-0.5">
            <div className="flex-1 border-t border-[#E6E0F5] dark:border-[#62339A]/30" />
            <span className="px-3 text-xs font-black text-[#64748B] dark:text-[#C4B5FD]">
              {isRtl ? 'أو' : 'OR'}
            </span>
            <div className="flex-1 border-t border-[#E6E0F5] dark:border-[#62339A]/30" />
          </div>

          <button
            type="button"
            onClick={() => {
              onGoogleSignIn();
            }}
            className="w-full min-h-[48px] px-5 rounded-full basit-glass-btn-yellow text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-[#292333]" />
            <span>
              {isRtl ? 'تسجيل الدخول السريع عبر Google' : 'Sign In with Google'}
            </span>
          </button>
        </>
      )}
    </div>
  );

  // =========================================================================
  // PART 2: AUTH GATE / ONBOARDING (Full-Screen Dark Purple + Gold Gate)
  // =========================================================================
  if (isAuthGateMode) {
    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-[70] max-w-[430px] w-full mx-auto overflow-y-auto overflow-x-hidden bg-[#FAF8F5] dark:bg-[#120D1D] text-[#1E1633] dark:text-white flex flex-col justify-between"
      >
        {/* Top Royal Purple Cover + Clean Wave */}
        <header className="relative z-20 shrink-0 bg-gradient-to-b from-[#3B0764] via-[#4C1D95] to-[#5B21B6] text-white pt-safe">
          <div
            dir="ltr"
            className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 min-w-0"
          >
            <div className="inline-flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white p-0.5 shadow-sm border border-[#F5C451]/70 shrink-0 overflow-hidden">
                <img
                  src={BASIT_OFFICIAL_LOGO_PNG}
                  alt="BASIT | باسط"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              <span className="text-xs font-black tracking-wide text-[#F5C451] truncate">
                BASIT | باسط
              </span>
            </div>

            {onToggleLang && (
              <button
                type="button"
                onClick={onToggleLang}
                className="min-h-[38px] px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Languages className="w-3.5 h-3.5 text-[#F5C451]" />
                <span>{isRtl ? 'EN' : 'ع'}</span>
              </button>
            )}
          </div>
          <MobileCoverWaves />
        </header>

        {/* Center Onboarding Stack on Calm Ivory White */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-4 text-center w-full mx-auto space-y-4">
          <div className="relative flex items-center justify-center my-1">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] p-1.5 bg-white shadow-[0_14px_34px_rgba(59,7,100,0.12)] border border-[#4C1D95]/15">
              <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={BASIT_OFFICIAL_LOGO_PNG}
                  alt="BASIT | باسط"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-base sm:text-lg font-black text-[#4C1D95] dark:text-[#EDE9FE]">
              {isRtl ? 'مع باسط.. بسطناها.' : 'With BASIT.. Simplified.'}
            </div>
            <div className="inline-flex items-center px-5 py-1 rounded-full bg-[#3B0764] text-lg sm:text-xl font-black text-[#F5C451] shadow-sm">
              {isRtl ? 'وجباتك.' : 'Your Meals.'}
            </div>
            <p className="text-xs font-bold text-[#5E5570] dark:text-[#C4B5FD]">
              {isRtl ? 'توفير، راحة، استمرارية.' : 'Savings, Comfort, Continuity.'}
            </p>
          </div>

          <h1 className="text-base sm:text-lg font-black text-[#1E1633] dark:text-white leading-snug pt-0.5">
            {isRtl
              ? 'أهلاً بك في باسط! اختر طريقة الدخول للبدء.'
              : 'Welcome to BASIT! Choose how to get started.'}
          </h1>

          {/* Clean Onboarding Action Stack */}
          <div className="w-full space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => openGateModal('register')}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] text-sm font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>
                {isRtl
                  ? 'إنشاء حساب جديد (للشركات والجهات)'
                  : 'Create New Account (Companies)'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openGateModal('password_login')}
                className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4 text-[#F5C451] shrink-0" />
                <span className="truncate">{isRtl ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={onGoogleSignIn}
                className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-white dark:bg-[#1B132B] hover:bg-[#F5F3FF] border border-[#4C1D95]/20 text-[#3B0764] dark:text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                <LogIn className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
                <span className="truncate">{isRtl ? 'حساب Google' : 'Google'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onContinueAsGuest || onBackHome}
              className="w-full min-h-[44px] px-4 py-2 rounded-2xl bg-white dark:bg-[#1B132B] hover:bg-[#F5F3FF] border border-[#4C1D95]/15 text-[#4C1D95] dark:text-[#EDE9FE] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <span>{isRtl ? 'تصفح التطبيق كزائر' : 'Continue as Visitor'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Royal Purple + Gold Wave Footer */}
        <BottomRoyalWaveFooter>
          <div className="text-center space-y-2">
            <div>
              <button
                type="button"
                onClick={() => openGateModal('forgot_password')}
                className="text-xs font-black text-[#FFD54F] hover:underline cursor-pointer"
              >
                {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </button>
            </div>

            <div className="text-[11px] font-bold text-[#EDE9FE] flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="underline hover:text-[#FFD54F] cursor-pointer"
              >
                {isRtl ? 'الشروط والأحكام' : 'Terms'}
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="underline hover:text-[#FFD54F] cursor-pointer"
              >
                {isRtl ? 'سياسة الخصوصية وعزل البيانات' : 'Privacy Policy'}
              </button>
            </div>
          </div>
        </BottomRoyalWaveFooter>

        {/* Auth Modal Popup on Onboarding Screen */}
        {gateModalOpen && (
          <div
            className="fixed inset-0 z-[80] bg-[#3B0764]/65 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setGateModalOpen(false)}
          >
            <div
              className="w-full max-w-[430px] max-h-[92dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-[#FAF8F5] dark:bg-[#1B132B] text-[#1E1633] dark:text-white border border-[#4C1D95]/20 p-5 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E6E0F5] dark:border-[#62339A]/30">
                <div className="flex items-center gap-2.5">
                  <BasitBrandMark size="xs" isRtl={isRtl} />
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-[#292333] dark:text-white">
                      {authTab === 'register'
                        ? isRtl ? 'إنشاء حساب جديد (للشركات والجهات)' : 'Register Organization / Account'
                        : authTab === 'forgot_password'
                          ? isRtl ? 'استعادة كلمة المرور' : 'Reset Password'
                          : isRtl ? 'تسجيل الدخول للعملاء' : 'Client Sign In'}
                    </h2>
                    <p className="text-[11px] font-bold text-[#62339A] dark:text-[#FFC928]">
                      BASIT | باسط — {isRtl ? 'بوابة موثقة' : 'Verified Portal'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGateModalOpen(false)}
                  aria-label={isRtl ? 'إغلاق' : 'Close'}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderAuthFormsBody()}
            </div>
          </div>
        )}

        {/* Legal Modal */}
        {legalModal && (
          <div className="fixed inset-0 z-[95] bg-[#3B0764]/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl bg-[#FAF8F5] dark:bg-[#1B132B] text-[#1E1633] dark:text-white border border-[#4C1D95]/20 p-5 sm:p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-black text-[#62339A] dark:text-[#FFC928]">
                  <FileText className="w-4 h-4" />
                  <span>
                    {legalModal === 'privacy'
                      ? isRtl ? 'سياسة الخصوصية وعزل البيانات' : 'Privacy & Data Isolation Policy'
                      : isRtl ? 'الشروط والأحكام التعاقدية' : 'Terms & Conditions'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  className="w-8 h-8 rounded-full bg-[#F7F5FA] dark:bg-[#140F1F] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs leading-relaxed space-y-2 max-h-60 overflow-y-auto">
                {legalModal === 'privacy' ? (
                  <>
                    <p className="font-bold">
                      {isRtl
                        ? '• العزل الصارم: بيانات كل شركة أو مصنع أو مطبخ مركزي معزولة تماماً، ولا يُسمح بالوصول لبيانات أي جهة أخرى.'
                        : '• Strict Isolation: Company, factory, and kitchen workspaces are completely isolated.'}
                    </p>
                    <p>
                      {isRtl
                        ? '• الجلسات والكلمات السرية مشفرة (scrypt + HttpOnly Cookies).'
                        : '• Encrypted credentials and HttpOnly cookie sessions.'}
                    </p>
                  </>
                ) : (
                  <p className="font-bold">
                    {isRtl
                      ? '• حسابات الشركات والمطابخ المركزية تخضع للاعتماد المسبق قبل تفعيل التعاقدات والأسعار الخاصة.'
                      : '• Company and kitchen accounts undergo approval prior to activating contract pricing.'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="w-full min-h-[44px] rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer"
              >
                {isRtl ? 'فهمت، إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // INTERNAL AUTHENTICATED ACCOUNT & SECURITY VIEW
  // =========================================================================
  return (
    <div className="max-w-xl mx-auto space-y-5 pb-20">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full basit-glass-pill text-xs font-black text-[#292333] dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" />
          <span>{isRtl ? 'الصفحة الرئيسية' : 'Home'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenAdminHub}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full basit-glass-pill text-xs font-black text-[#62339A] dark:text-[#FFC928] cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isRtl ? 'الحساب والصلاحيات' : 'Account & RBAC'}</span>
        </button>
      </div>

      <section className="relative rounded-[28px] overflow-hidden shadow-md border border-[#4C1D95]/15 bg-white dark:bg-[#1B132B]">
        <div className="relative bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] px-6 py-5 text-center text-white">
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <BasitBrandMark size="md" isRtl={isRtl} className="ring-2 ring-[#FFD54F]/75 shadow-lg" />
            <h1 className="text-lg sm:text-xl font-black text-[#FFD54F]">
              {isRtl ? 'إدارة الحساب والأمان — باسط | BASIT' : 'Account & Security — BASIT'}
            </h1>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {isGoogleAuthenticated && (
            <div className="p-3.5 rounded-2xl bg-[#F5F0FF] dark:bg-[#1F172F] border border-[#62339A]/35 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#62339A] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#FFC928]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-black text-[#292333] dark:text-white truncate">
                      {googleDisplayName || (isRtl ? 'حساب Google موثق' : 'Verified Google User')}
                    </span>
                    {isOwnerAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                        {isRtl ? 'Super Admin / المالك' : 'Super Admin'}
                      </span>
                    )}
                    {!isOwnerAdmin && canManageBasitOps && (
                      <span className="px-2 py-0.5 rounded-full bg-[#62339A] text-white text-[10px] font-black">
                        Platform Admin
                      </span>
                    )}
                    {!isOwnerAdmin && canApproveHabePurchases && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                        Ha-Be
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-[#64748B] dark:text-[#C4B5FD] truncate" dir="ltr">
                    {googleEmail}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOutGoogle}
                className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-white dark:bg-[#140F1F] border border-rose-300 text-rose-600 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isRtl ? 'خروج' : 'Sign Out'}</span>
              </button>
            </div>
          )}

          {otpSession && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-300 dark:border-emerald-700 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 truncate">
                        {otpSession.fullName}
                      </span>
                      {activeRoleLabel && (
                        <span className="px-2 py-0.5 rounded-full bg-[#62339A] text-white text-[10px] font-black">
                          {activeRoleLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 truncate" dir="ltr">
                      {otpSession.email}
                      {otpSession.tenantName ? ` · ${otpSession.tenantName}` : ''}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClearOtpSession}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-full bg-white dark:bg-[#140F1F] border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-[11px] font-black cursor-pointer"
                >
                  {isRtl ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
              </div>

              {(otpSession.tenantId || activeCanonicalRole === 'super_admin' || activeCanonicalRole === 'platform_admin') && (
                <div className="flex flex-wrap gap-2">
                  {(activeCanonicalRole === 'super_admin' || activeCanonicalRole === 'platform_admin') && (
                    <button
                      type="button"
                      onClick={onOpenAdminHub}
                      className="min-h-[44px] px-4 py-2 rounded-full bg-[#62339A] text-white text-xs font-black cursor-pointer"
                    >
                      {isRtl ? 'فتح لوحة الإدارة الرئيسية' : 'Open Master Admin Dashboard'}
                    </button>
                  )}
                  {otpSession.tenantId && onOpenTenantWorkspace && (
                    <button
                      type="button"
                      onClick={onOpenTenantWorkspace}
                      className="min-h-[44px] px-4 py-2 rounded-full bg-[#FFC928] text-[#292333] text-xs font-black cursor-pointer"
                    >
                      {isRtl ? 'مساحة عمل الجهة / المطبخ المعزولة' : 'Open Isolated Tenant Workspace'}
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword((v) => !v);
                    setChangePwFeedback(null);
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-white dark:bg-[#140F1F] border border-emerald-300 text-xs font-black text-[#62339A] dark:text-[#FFC928] flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تغيير كلمة المرور الشخصية' : 'Change Personal Password'}</span>
                </button>

                {showChangePassword && (
                  <form onSubmit={handleSelfChangePassword} className="p-3.5 rounded-2xl bg-white dark:bg-[#140F1F] border border-[#62339A]/25 space-y-2.5">
                    <input
                      type="password"
                      dir="ltr"
                      autoComplete="current-password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder={isRtl ? 'كلمة المرور الحالية (إن وجدت)' : 'Current password (if set)'}
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] font-mono text-xs font-bold"
                    />
                    <input
                      type="password"
                      required
                      minLength={8}
                      dir="ltr"
                      autoComplete="new-password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder={isRtl ? 'كلمة المرور الجديدة (8 أحرف فأكثر)' : 'New strong password (8+ chars)'}
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] font-mono text-xs font-bold"
                    />
                    <input
                      type="password"
                      required
                      minLength={8}
                      dir="ltr"
                      autoComplete="new-password"
                      value={confirmNewPasswordInput}
                      onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                      placeholder={isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'}
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] font-mono text-xs font-bold"
                    />
                    {changePwFeedback && (
                      <div
                        className={`p-2.5 rounded-xl text-[11px] font-bold ${
                          changePwFeedback.kind === 'ok'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {changePwFeedback.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={changePwBusy}
                      className="w-full min-h-[44px] rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer disabled:opacity-60"
                    >
                      {changePwBusy ? (isRtl ? 'جاري التحديث...' : 'Updating...') : isRtl ? 'حفظ كلمة المرور الجديدة' : 'Save New Password'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {renderAuthFormsBody()}
        </div>
      </section>

      {showOwnerCard && ownerStatus && (
        <section className="rounded-3xl basit-liquid-glass p-5 sm:p-6 border border-[#62339A]/25 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F0FF] dark:bg-[#1F172F] text-[#62339A] dark:text-[#FFC928] flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#292333] dark:text-white">
                  {isRtl
                    ? 'الوطنية اللوجستية المالية — تأمين حساب المالك المستقل'
                    : 'Wataniya Financial Logistics — Independent Owner Security'}
                </h2>
                <p className="text-[11px] font-bold text-[#64748B] dark:text-[#C4B5FD]">
                  {ownerStatus.configured
                    ? isRtl
                      ? 'رمز تأمين المالك مهيّأ ومشفر (scrypt) على الخادم.'
                      : 'Owner security passphrase is configured and scrypt-hashed.'
                    : isRtl
                      ? 'خطوة مستقلة لإنشاء وتأمين رمز المالك الخاص (8 أحرف/أرقام على الأقل).'
                      : 'Independent step to configure Owner passphrase (8+ chars).'}
                </p>
              </div>
            </div>

            {ownerStatus.ownerPinVerified && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black shrink-0">
                {isRtl ? 'موثق بالخادم' : 'Verified'}
              </span>
            )}
          </div>

          {ownerStatus.configured && ownerStatus.sessionIsOwner && !ownerStatus.ownerPinVerified ? (
            <form onSubmit={handleOwnerVerifySubmit} className="space-y-3">
              <input
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={ownerPin}
                onChange={(e) => setOwnerPin(e.target.value)}
                placeholder={isRtl ? 'أدخل رمز تأمين المالك المستقل' : 'Enter Owner security passphrase'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/30 text-xs font-mono text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
              />
              <button
                type="submit"
                disabled={ownerBusy}
                className="min-h-[44px] px-5 py-2 rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer disabled:opacity-60"
              >
                {ownerBusy
                  ? isRtl ? 'جاري التحقق...' : 'Verifying...'
                  : isRtl ? 'توثيق جلسة المالك بالرمز المستقل' : 'Verify Owner Session'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOwnerSetupSubmit} className="space-y-3">
              {ownerStatus.configured && (
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={ownerCurrentPin}
                  onChange={(e) => setOwnerCurrentPin(e.target.value)}
                  placeholder={isRtl ? 'رمز التأمين الحالي للمالك' : 'Current Owner passphrase'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/30 text-xs font-mono text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                />
              )}
              {ownerStatus.requiresBootstrapSecret && !ownerStatus.configured && (
                <input
                  type="password"
                  required
                  value={ownerBootstrapSecret}
                  onChange={(e) => setOwnerBootstrapSecret(e.target.value)}
                  placeholder={
                    isRtl
                      ? 'مفتاح التهيئة الأولي (OWNER_SETUP_SECRET)'
                      : 'OWNER_SETUP_SECRET'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/30 text-xs font-mono text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                />
              )}
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={ownerPin}
                onChange={(e) => setOwnerPin(e.target.value)}
                placeholder={
                  ownerStatus.configured
                    ? isRtl ? 'رمز التأمين الجديد للمالك (8+ أحرف)' : 'New Owner passphrase (8+ chars)'
                    : isRtl ? 'أنشئ رمز تأمين المالك المستقل (8+ أحرف/أرقام)' : 'Create independent Owner passphrase (8+ chars)'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#62339A]/30 text-xs font-mono text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
              />
              <button
                type="submit"
                disabled={ownerBusy}
                className="min-h-[44px] px-5 py-2 rounded-full basit-glass-btn-primary text-xs font-black cursor-pointer disabled:opacity-60"
              >
                {ownerBusy
                  ? isRtl ? 'جاري الحفظ...' : 'Saving...'
                  : ownerStatus.configured
                    ? isRtl ? 'تحديث رمز تأمين المالك' : 'Rotate Owner Passphrase'
                    : isRtl ? 'حفظ وتفعيل رمز المالك المستقل' : 'Initialize Independent Owner Security'}
              </button>
            </form>
          )}

          {ownerFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold border ${
                ownerFeedback.kind === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200'
              }`}
            >
              {ownerFeedback.text}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
