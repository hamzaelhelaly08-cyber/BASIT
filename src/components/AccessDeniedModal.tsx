import React from 'react';
import { ShieldAlert, Lock, X, CheckCircle, ArrowRight } from 'lucide-react';
import { AdminModule, RoleProfile } from '../types/dashboard';
import { USER_ROLES } from '../data/mockOperationalData';

interface AccessDeniedModalProps {
  module: AdminModule | null;
  currentRole: RoleProfile;
  isRtl: boolean;
  onClose: () => void;
  onRequestAccess: (module: AdminModule) => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  module,
  currentRole,
  isRtl,
  onClose,
  onRequestAccess
}) => {
  if (!module) return null;

  const allowedRoleObjects = USER_ROLES.filter((r) =>
    module.allowedRoles.includes(r.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white relative animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Lock Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
              {isRtl ? 'ضوابط السرية وصلاحيات الإدارة' : 'RBAC Access Restriction'}
            </span>
            <h3 className="text-lg font-bold text-white">
              {isRtl ? `صلاحية مقيدة: ${module.titleAr}` : `Access Restricted: ${module.titleEn}`}
            </h3>
          </div>
        </div>

        {/* Explanation text */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 text-xs text-slate-300 space-y-2 mb-4 leading-relaxed">
          <p>
            {isRtl
              ? `عفواً، لا يمتلك حسابك الحالي (${currentRole.titleAr}) تصريح الوصول إلى هذا القسم الإداري الحساس. وفقاً لسياسة سرية الإدارة بالشركة الوطنية اللوجستية، لا تظهر الحسابات، المخزون، تكاليف الوجبات، أو البيانات التشغيلية المركزية إلا للأقسام المفوضة.`
              : `Access restricted. Your active role (${currentRole.titleEn}) lacks authorization for this module under National Logistics enterprise governance rules.`}
          </p>
        </div>

        {/* Allowed Roles Matrix */}
        <div className="mb-5 space-y-2">
          <div className="text-xs font-semibold text-slate-400">
            {isRtl ? 'الأدوار المصرح لها بدخول هذا الموديول:' : 'Authorized roles for this module:'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allowedRoleObjects.map((role) => (
              <span
                key={role.id}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F7F5FA]0" />
                <span>{isRtl ? role.titleAr : role.titleEn}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onRequestAccess(module);
              onClose();
            }}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-semibold text-xs transition-colors shadow-lg shadow-[#62339A]/25 flex items-center justify-center gap-2"
          >
            <span>{isRtl ? 'طلب تصريح استثنائي (تسجيل في Audit Log)' : 'Request Temporary Clearance'}</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            {isRtl ? 'إلغاء وفهمت ذلك' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
