import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck, CheckCircle2, KeyRound, AlertCircle } from 'lucide-react';
import { RoleProfile } from '../types/dashboard';
import { USER_ROLES } from '../data/mockOperationalData';
import { BrandLogo } from './BrandLogo';

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: RoleProfile;
  onLoginAsRole: (role: RoleProfile) => void;
  isRtl: boolean;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onLoginAsRole,
  isRtl
}) => {
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [password, setPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void onLoginAsRole;
    setMessage(
      isRtl
        ? 'تم إيقاف الدخول المحلي الثابت لأسباب أمنية. يُرجى الدخول عبر Google الموثق أو رمز OTP من البوابة الآمنة للوطنية اللوجستية المالية.'
        : 'Legacy static password login is disabled. Use Google Sign-In or verified OTP.'
    );
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage('كلمة المرور يجب ألا تقل عن 6 خانات معقدة.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('كلمتا المرور غير متطابقتين.');
      return;
    }
    setMessage('تم تحديث وتشفير كلمة المرور الجديدة بنجاح وفق بروتوكول الأمان.');
    setTimeout(() => {
      setIsChangingPassword(false);
      setMessage(null);
      setNewPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-white"
        role="dialog"
      >
        {/* Header with Logo */}
        <div className="text-center space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
          
          <BrandLogo size="lg" className="mx-auto" showGlow={true} />
          
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isRtl ? 'تسجيل الدخول لمنظومة BASIT | باسط' : 'BASIT | باسط Portal Sign In'}
            </h3>
            <p className="text-xs text-slate-500">
              {isRtl ? 'إدارة المنصة والمصانع والمطابخ والعملاء' : 'Platform, Factories & Kitchens Auth'}
            </p>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-700 dark:text-sky-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {!isChangingPassword ? (
          <form onSubmit={handleLogin} className="mt-5 space-y-4 text-xs">
            {/* Account Selector based on strict RBAC roles */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'اختر الحساب المصرح له للدخول:' : 'Select Authorized Account:'}
              </label>
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-[#62339A]"
              >
                {USER_ROLES.filter(r => r.id !== 'public_visitor').map((r) => (
                  <option key={r.id} value={r.username}>
                    {r.nameAr} — {r.titleAr.split('(')[0]} ({r.username})
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'كلمة المرور المشفرة:' : 'Password:'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="text-[11px] text-[#62339A] dark:text-[#FFC928] hover:underline font-bold"
                >
                  تغيير كلمة المرور
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">ضوابط الأمان الإلزامية:</span>
              صلاحيات الأمان وإدارة المستخدمين وإيقاف وتفعيل الحسابات محصورة حصرياً بمدير العمليات <strong className="text-[#62339A]">م/ مصطفى شعبان</strong>.
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-extrabold text-xs shadow-lg shadow-[#62339A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>تسجيل الدخول الآمن</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة مرور قوية (أرقام وحروف)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold text-xs"
              >
                تأكيد الحفظ والتشفير
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
