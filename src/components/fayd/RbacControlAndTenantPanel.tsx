import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Copy,
  KeyRound,
  Lock,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  XCircle,
} from 'lucide-react';
import {
  ALL_CANONICAL_ROLES,
  ALL_PERMISSION_METADATA,
  CANONICAL_ROLE_META,
  DEFAULT_ROLE_PERMISSION_MATRIX,
  type CanonicalRole,
  type PermissionKey,
  type RolePermissionMatrix,
} from '../../types/rbac';

interface ManagedAccountSafe {
  uid: string;
  email: string;
  phone: string;
  fullName: string;
  canonicalRole: CanonicalRole;
  requestedKind: 'customer' | 'client_company' | 'central_kitchen';
  approvalStatus: 'approved' | 'pending_review' | 'rejected' | 'suspended';
  tenantId: string;
  customPermissions: PermissionKey[];
  businessName: string;
  commercialRegRef: string;
  city: string;
  countryCode: string;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
}

interface ServerTenantSummary {
  tenantId: string;
  name: string;
  kind: 'client_company' | 'central_kitchen' | 'merchant';
  ownerUid: string;
  ownerEmail: string;
  commercialRegRef: string;
  city: string;
  countryCode: string;
  contractedKitchenIds: string[];
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

interface ServerAuditEntry {
  logId: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  actorRole: CanonicalRole;
  action: string;
  targetType: string;
  targetId: string;
  severity: 'info' | 'warning' | 'security_alert';
  details: string;
}

interface ServerInvitationSafe {
  inviteId: string;
  tenantId: string;
  tenantName: string;
  invitedEmail: string;
  invitedName: string;
  assignedRole: CanonicalRole;
  assignedPermissions: PermissionKey[];
  status: 'pending' | 'accepted' | 'revoked';
  createdAt: string;
}

interface ServerTenantOrderSafe {
  orderId: string;
  clientTenantId: string;
  clientTenantName: string;
  kitchenTenantId: string;
  kitchenTenantName: string;
  placedByName: string;
  itemsSummary: string;
  totalEGP: number;
  status: string;
  createdAt: string;
}

interface MasterRbacAndGovernancePanelProps {
  isRtl?: boolean;
  isSuperAdmin?: boolean;
  onShowToast: (msg: string) => void;
}

export const MasterRbacAndGovernancePanel: React.FC<MasterRbacAndGovernancePanelProps> = ({
  isRtl = true,
  isSuperAdmin = false,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'approvals' | 'users' | 'matrix' | 'audit'>('approvals');
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [pendingApprovals, setPendingApprovals] = useState<ManagedAccountSafe[]>([]);
  const [users, setUsers] = useState<ManagedAccountSafe[]>([]);
  const [tenants, setTenants] = useState<ServerTenantSummary[]>([]);
  const [matrix, setMatrix] = useState<RolePermissionMatrix>(DEFAULT_ROLE_PERMISSION_MATRIX);
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<CanonicalRole>('client_owner');
  const [auditLogs, setAuditLogs] = useState<ServerAuditEntry[]>([]);
  const [auditProbeResult, setAuditProbeResult] = useState<string | null>(null);

  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [selectedKitchensMap, setSelectedKitchensMap] = useState<Record<string, string[]>>({});
  const [userRoleDrafts, setUserRoleDrafts] = useState<Record<string, CanonicalRole>>({});

  const centralKitchens = useMemo(
    () => tenants.filter((t) => t.kind === 'central_kitchen' && t.status === 'active'),
    [tenants]
  );

  const loadAllGovernance = useCallback(async () => {
    setLoading(true);
    try {
      const [appResp, matResp, audResp] = await Promise.all([
        fetch('/api/admin/approvals', { credentials: 'include' }),
        fetch('/api/rbac/matrix', { credentials: 'include' }),
        fetch('/api/admin/audit-logs', { credentials: 'include' }),
      ]);

      if (appResp.ok) {
        const appJson = (await appResp.json()) as {
          ok?: boolean;
          pendingApprovals?: ManagedAccountSafe[];
          users?: ManagedAccountSafe[];
          tenants?: ServerTenantSummary[];
        };
        if (appJson.ok) {
          setPendingApprovals(appJson.pendingApprovals || []);
          setUsers(appJson.users || []);
          setTenants(appJson.tenants || []);
        }
      }
      if (matResp.ok) {
        const matJson = (await matResp.json()) as { ok?: boolean; matrix?: RolePermissionMatrix };
        if (matJson.ok && matJson.matrix) {
          setMatrix(matJson.matrix);
        }
      }
      if (audResp.ok) {
        const audJson = (await audResp.json()) as { ok?: boolean; logs?: ServerAuditEntry[] };
        if (audJson.ok) {
          setAuditLogs(audJson.logs || []);
        }
      }
    } catch {
      // ignore transient offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllGovernance();
  }, [loadAllGovernance]);

  const handleApprovalDecision = async (
    acct: ManagedAccountSafe,
    decision: 'approve' | 'reject'
  ) => {
    setBusyKey(acct.uid);
    try {
      const defaultKitchens =
        acct.requestedKind === 'client_company'
          ? selectedKitchensMap[acct.uid]?.length
            ? selectedKitchensMap[acct.uid]
            : centralKitchens.slice(0, 1).map((k) => k.tenantId)
          : [];

      const resp = await fetch(`/api/admin/approvals/${encodeURIComponent(acct.uid)}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          decision,
          reviewNote: reviewNotes[acct.uid] || undefined,
          contractedKitchenIds: defaultKitchens,
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string; messageEn?: string };
      onShowToast(
        (isRtl ? data.messageAr : data.messageEn) ||
          data.messageAr ||
          (resp.ok ? 'تم تنفيذ القرار بنجاح.' : 'تعذر تنفيذ القرار.')
      );
      if (resp.ok) {
        await loadAllGovernance();
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleUpdateUserRoleOrStatus = async (
    acct: ManagedAccountSafe,
    patch: { canonicalRole?: CanonicalRole; approvalStatus?: 'approved' | 'suspended' }
  ) => {
    setBusyKey(acct.uid);
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(acct.uid)}/role-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...patch,
          reason:
            patch.approvalStatus === 'suspended'
              ? 'تجميد إداري فوري من لوحة الحوكمة'
              : undefined,
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string; messageEn?: string };
      onShowToast(
        (isRtl ? data.messageAr : data.messageEn) ||
          data.messageAr ||
          (resp.ok ? 'تم تحديث الحساب بنجاح.' : 'تعذر التحديث.')
      );
      if (resp.ok) {
        await loadAllGovernance();
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleToggleMatrixPerm = (role: CanonicalRole, perm: PermissionKey) => {
    if (!isSuperAdmin || role === 'super_admin') return;
    setMatrix((prev) => {
      const current = prev[role] || [];
      const exists = current.includes(perm);
      const nextList = exists ? current.filter((p) => p !== perm) : [...current, perm];
      return { ...prev, [role]: nextList };
    });
  };

  const handleSaveMatrix = async () => {
    if (!isSuperAdmin) return;
    setBusyKey('save_matrix');
    try {
      const resp = await fetch('/api/rbac/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matrix }),
      });
      const data = (await resp.json()) as {
        ok?: boolean;
        matrix?: RolePermissionMatrix;
        messageAr?: string;
        messageEn?: string;
      };
      onShowToast(
        (isRtl ? data.messageAr : data.messageEn) ||
          data.messageAr ||
          (resp.ok ? 'تم حفظ مصفوفة الأدوار.' : 'تعذر حفظ المصفوفة.')
      );
      if (resp.ok && data.matrix) {
        setMatrix(data.matrix);
        await loadAllGovernance();
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleProbeImmutableAudit = async () => {
    setBusyKey('audit_probe');
    try {
      const resp = await fetch('/api/admin/audit-logs/probe_immutable_guard', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await resp.json()) as { code?: string; messageAr?: string; messageEn?: string };
      const msg = `HTTP ${resp.status} (${data.code || 'BLOCKED'}): ${
        isRtl ? data.messageAr : data.messageEn
      }`;
      setAuditProbeResult(msg);
      onShowToast(msg);
      await loadAllGovernance();
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section className="rounded-3xl bg-white dark:bg-[#1F172F] border-2 border-[#62339A]/25 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-[#FFC928] text-[#292333] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#62339A] text-[#FFC928] flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black text-[#4A2378] block">
              {isRtl
                ? 'نظام الصلاحيات المعتمد (10 أدوار) واعتماد الجهات وسجل التدقيق'
                : '10-Role Configurable RBAC, Entity Approvals & Immutable Audit'}
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#292333]">
              {isRtl ? 'حوكمة المنصة والعزل الإداري الكامل' : 'Master Governance & Tenant Isolation'}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadAllGovernance()}
          className="px-4 py-2 rounded-full bg-white text-[#62339A] text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isRtl ? 'تحديث البيانات' : 'Refresh'}</span>
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="p-3 bg-[#F7F5FA] dark:bg-[#140F1F] border-b border-[#62339A]/15 flex items-center gap-2 overflow-x-auto">
        {[
          {
            id: 'approvals' as const,
            label: isRtl
              ? `طلبات اعتماد الجهات (${pendingApprovals.length})`
              : `Approvals (${pendingApprovals.length})`,
            icon: Building2,
          },
          {
            id: 'users' as const,
            label: isRtl ? `المستخدمون والأدوار (${users.length})` : `Users (${users.length})`,
            icon: UserCheck,
          },
          {
            id: 'matrix' as const,
            label: isRtl ? 'مصفوفة الـ 10 أدوار' : '10-Role Matrix',
            icon: KeyRound,
          },
          {
            id: 'audit' as const,
            label: isRtl ? `سجل التدقيق المحمي (${auditLogs.length})` : `Audit Log (${auditLogs.length})`,
            icon: ShieldAlert,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                active
                  ? 'bg-[#62339A] text-white shadow-sm'
                  : 'bg-white dark:bg-[#271E3B] text-[#292333] dark:text-slate-200 border border-[#62339A]/20 hover:border-[#62339A]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#FFC928]' : 'text-[#62339A] dark:text-[#FFC928]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* TAB 1: PENDING APPROVALS */}
        {subTab === 'approvals' && (
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/15 text-center space-y-1.5">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <p className="text-xs font-black text-[#292333] dark:text-white">
                  {isRtl
                    ? 'لا توجد طلبات تسجيل شركات أو مطابخ مركزية معلقة حالياً.'
                    : 'No pending company or central kitchen approvals.'}
                </p>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-slate-400">
                  {isRtl
                    ? 'أي شركة أو مطبخ يسجل من شاشة الدخول يتم احتجازه في pending_review لحين اعتمادك هنا.'
                    : 'New company/kitchen registrations stay in pending_review until approved here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((acct) => {
                  const chosenKitchens =
                    selectedKitchensMap[acct.uid] || centralKitchens.slice(0, 1).map((k) => k.tenantId);
                  return (
                    <div
                      key={acct.uid}
                      className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/25 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black">
                              {acct.requestedKind === 'central_kitchen'
                                ? isRtl
                                  ? 'مطبخ مركزي'
                                  : 'Central Kitchen'
                                : isRtl
                                  ? 'شركة / مصنع'
                                  : 'Company / Factory'}
                            </span>
                            <span className="text-sm font-black text-[#292333] dark:text-white">
                              {acct.businessName || acct.fullName}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#62339A] dark:text-[#C4B5FD]">
                            {acct.fullName} · <span dir="ltr">{acct.email}</span>
                            {acct.phone ? ` · ${acct.phone}` : ''}
                          </p>
                          <p className="text-[11px] font-medium text-[#64748B] dark:text-slate-300">
                            {isRtl ? 'السجل / الترخيص:' : 'Reg Ref:'}{' '}
                            <strong className="font-mono">{acct.commercialRegRef || '—'}</strong> ·{' '}
                            {acct.city}, {acct.countryCode}
                          </p>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                          pending_review
                        </span>
                      </div>

                      {acct.requestedKind === 'client_company' && centralKitchens.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-black text-[#292333] dark:text-white block">
                            {isRtl
                              ? 'تحديد المطابخ المركزية المتعاقد معها لهذه الشركة فقط:'
                              : 'Assign Approved Contracted Kitchens:'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {centralKitchens.map((k) => {
                              const checked = chosenKitchens.includes(k.tenantId);
                              return (
                                <label
                                  key={k.tenantId}
                                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer ${
                                    checked
                                      ? 'bg-[#62339A] text-white border-[#62339A]'
                                      : 'bg-white dark:bg-[#1F172F] text-[#292333] dark:text-slate-200 border-[#62339A]/20'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      setSelectedKitchensMap((prev) => {
                                        const curr = prev[acct.uid] || chosenKitchens;
                                        const next = curr.includes(k.tenantId)
                                          ? curr.filter((x) => x !== k.tenantId)
                                          : [...curr, k.tenantId];
                                        return { ...prev, [acct.uid]: next };
                                      });
                                    }}
                                    className="accent-[#FFC928]"
                                  />
                                  <span>{k.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#62339A]/15">
                        <input
                          type="text"
                          value={reviewNotes[acct.uid] || ''}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({ ...prev, [acct.uid]: e.target.value }))
                          }
                          placeholder={isRtl ? 'ملاحظة الاعتماد أو الرفض (اختياري)...' : 'Review note...'}
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20 text-xs text-[#292333] dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={busyKey === acct.uid}
                          onClick={() => void handleApprovalDecision(acct, 'approve')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'اعتماد وتفعيل العزل' : 'Approve & Isolate'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === acct.uid}
                          onClick={() => void handleApprovalDecision(acct, 'reject')}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'رفض' : 'Reject'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USERS & INSTANT FREEZE */}
        {subTab === 'users' && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] text-center text-xs font-bold text-[#64748B]">
                {isRtl
                  ? 'لا توجد حسابات مسجلة بكلمة مرور بعد. عند تسجيل العملاء والشركات سيظهرون هنا لإدارتهم.'
                  : 'No registered password accounts yet.'}
              </div>
            ) : (
              users.map((u) => {
                const draftRole = userRoleDrafts[u.uid] || u.canonicalRole;
                const roleMeta = CANONICAL_ROLE_META[u.canonicalRole];
                const isFrozen = u.approvalStatus === 'suspended';
                return (
                  <div
                    key={u.uid}
                    className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/20 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-[220px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-[#292333] dark:text-white">
                          {u.fullName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#62339A] text-white text-[10px] font-black">
                          {isRtl ? roleMeta.labelAr : roleMeta.labelEn}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isFrozen
                              ? 'bg-rose-100 text-rose-800'
                              : u.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.approvalStatus}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#64748B] dark:text-slate-300" dir="ltr">
                        {u.email} {u.phone ? `· ${u.phone}` : ''}
                      </p>
                      {u.tenantId && (
                        <p className="text-[11px] font-bold text-[#62339A] dark:text-[#FFC928]">
                          Tenant: {u.businessName || u.tenantId} ({u.tenantId})
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={draftRole}
                        onChange={(e) =>
                          setUserRoleDrafts((prev) => ({
                            ...prev,
                            [u.uid]: e.target.value as CanonicalRole,
                          }))
                        }
                        className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/25 text-xs font-bold text-[#292333] dark:text-white"
                      >
                        {ALL_CANONICAL_ROLES.filter((r) => isSuperAdmin || r !== 'super_admin').map((r) => (
                          <option key={r} value={r}>
                            {isRtl ? CANONICAL_ROLE_META[r].labelAr : CANONICAL_ROLE_META[r].labelEn}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busyKey === u.uid}
                        onClick={() =>
                          void handleUpdateUserRoleOrStatus(u, { canonicalRole: draftRole })
                        }
                        className="px-3.5 py-2 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
                      >
                        {isRtl ? 'تطبيق الدور' : 'Apply Role'}
                      </button>
                      {isFrozen ? (
                        <button
                          type="button"
                          disabled={busyKey === u.uid}
                          onClick={() =>
                            void handleUpdateUserRoleOrStatus(u, { approvalStatus: 'approved' })
                          }
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer"
                        >
                          {isRtl ? 'إلغاء التجميد' : 'Reactivate'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyKey === u.uid}
                          onClick={() =>
                            void handleUpdateUserRoleOrStatus(u, { approvalStatus: 'suspended' })
                          }
                          className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'تجميد وإلغاء الجلسات' : 'Freeze & Kill Sessions'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: 10-ROLE PERMISSION MATRIX */}
        {subTab === 'matrix' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="font-bold text-[#292333] dark:text-slate-200">
                {isSuperAdmin
                  ? isRtl
                    ? 'اختر أي دور من الأدوار العشرة لتخصيص صلاحياته الدقيقة وحفظها على الخادم.'
                    : 'Select any of the 10 roles to customize and enforce permissions.'
                  : isRtl
                    ? 'للقراءة فقط: تعديل مصفوفة الصلاحيات العامة مقصور على مدير النظام الأعلى (Super Admin).'
                    : 'Read-only: Only Super Admin may modify the global RBAC matrix.'}
              </div>
              {isSuperAdmin && (
                <button
                  type="button"
                  disabled={busyKey === 'save_matrix'}
                  onClick={() => void handleSaveMatrix()}
                  className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#FFC928]" />
                  <span>{isRtl ? 'حفظ مصفوفة الصلاحيات' : 'Save Matrix'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {ALL_CANONICAL_ROLES.map((r) => {
                const active = selectedMatrixRole === r;
                const count = (matrix[r] || []).length;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedMatrixRole(r)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      active
                        ? 'bg-[#FFC928] text-[#292333] ring-2 ring-[#62339A]'
                        : 'bg-[#F7F5FA] dark:bg-[#271E3B] text-[#292333] dark:text-slate-200 border border-[#62339A]/15'
                    }`}
                  >
                    {isRtl ? CANONICAL_ROLE_META[r].labelAr : CANONICAL_ROLE_META[r].labelEn} ({count})
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black text-[#62339A] dark:text-[#FFC928]">
                    {isRtl
                      ? CANONICAL_ROLE_META[selectedMatrixRole].labelAr
                      : CANONICAL_ROLE_META[selectedMatrixRole].labelEn}
                  </h4>
                  <p className="text-[11px] font-medium text-[#64748B] dark:text-slate-300">
                    {isRtl
                      ? CANONICAL_ROLE_META[selectedMatrixRole].scopeAr
                      : CANONICAL_ROLE_META[selectedMatrixRole].scopeEn}
                  </p>
                </div>
                {selectedMatrixRole === 'super_admin' && (
                  <span className="px-3 py-1 rounded-full bg-[#62339A] text-white text-[10px] font-black flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#FFC928]" />
                    <span>{isRtl ? 'صلاحيات كاملة دائمة' : 'Locked Full Access'}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {ALL_PERMISSION_METADATA.map((perm) => {
                  const checked = (matrix[selectedMatrixRole] || []).includes(perm.key);
                  const disabled = !isSuperAdmin || selectedMatrixRole === 'super_admin';
                  return (
                    <label
                      key={perm.key}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                        disabled ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        checked
                          ? 'bg-white dark:bg-[#1F172F] border-[#62339A] text-[#292333] dark:text-white'
                          : 'bg-white/60 dark:bg-[#140F1F]/60 border-[#62339A]/15 text-[#64748B] dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => handleToggleMatrixPerm(selectedMatrixRole, perm.key)}
                        className="mt-0.5 accent-[#62339A]"
                      />
                      <div>
                        <div className="font-black">
                          {isRtl ? perm.labelAr : perm.labelEn}
                        </div>
                        <div className="font-mono text-[10px] opacity-75" dir="ltr">
                          {perm.key}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMMUTABLE AUDIT LOGS */}
        {subTab === 'audit' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/25 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#292333] dark:text-slate-200">
                <Lock className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] shrink-0" />
                <span>
                  {isRtl
                    ? 'سجل تدقيق أمني للإضافة فقط (Append-Only): يمنع الخادم وقاعدة البيانات أي تعديل أو حذف.'
                    : 'Append-Only Security Audit Log: Modifications & deletions are blocked by server & Firestore.'}
                </span>
              </div>
              <button
                type="button"
                disabled={busyKey === 'audit_probe'}
                onClick={() => void handleProbeImmutableAudit()}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/30 text-xs font-black text-[#62339A] dark:text-[#FFC928] cursor-pointer"
              >
                {isRtl ? 'اختبار منع الحذف (403)' : 'Test Immutable Guard'}
              </button>
            </div>

            {auditProbeResult && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs font-black text-emerald-900 dark:text-emerald-200">
                {auditProbeResult}
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  {isRtl ? 'لا توجد أحداث مسجلة بعد.' : 'No audit entries yet.'}
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.logId}
                    className={`p-3 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                      log.severity === 'security_alert'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        : log.severity === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                          : 'bg-[#F7F5FA] dark:bg-[#271E3B] border-[#62339A]/15'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {log.severity === 'security_alert' && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span className="font-black text-[#292333] dark:text-white">
                          {log.action}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#1F172F] text-[10px] font-mono font-bold text-[#62339A] dark:text-[#FFC928]">
                          {log.actorRole}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-slate-300" dir="ltr">
                        {log.actorEmail} · {log.details}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-[#64748B] dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

interface TenantManagerWorkspacePanelProps {
  isRtl?: boolean;
  tenantId: string;
  canonicalRole?: CanonicalRole;
  userPermissions?: string[];
  onShowToast: (msg: string) => void;
}

export const TenantManagerWorkspacePanel: React.FC<TenantManagerWorkspacePanelProps> = ({
  isRtl = true,
  tenantId,
  canonicalRole = 'client_employee',
  userPermissions = [],
  onShowToast,
}) => {
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<ServerTenantSummary | null>(null);
  const [members, setMembers] = useState<ManagedAccountSafe[]>([]);
  const [invitations, setInvitations] = useState<ServerInvitationSafe[]>([]);
  const [orders, setOrders] = useState<ServerTenantOrderSafe[]>([]);
  const [contractedKitchens, setContractedKitchens] = useState<ServerTenantSummary[]>([]);

  const [invitedName, setInvitedName] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [invitedRole, setInvitedRole] = useState<CanonicalRole>('client_employee');
  const [latestInviteCode, setLatestInviteCode] = useState<string | null>(null);

  const [orderKitchenId, setOrderKitchenId] = useState('');
  const [orderSummary, setOrderSummary] = useState('');
  const [orderAmount, setOrderAmount] = useState('450');

  const [isolationProbeMsg, setIsolationProbeMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isKitchen = tenant?.kind === 'central_kitchen' || canonicalRole.startsWith('kitchen_');
  const canInviteMembers =
    userPermissions.includes('entity:invite_employees') ||
    userPermissions.includes('kitchen:manage_staff') ||
    canonicalRole === 'client_owner' ||
    canonicalRole === 'client_manager' ||
    canonicalRole === 'kitchen_owner' ||
    canonicalRole === 'kitchen_manager';

  const canPlaceOrders =
    !isKitchen &&
    (userPermissions.includes('entity:place_orders') ||
      canonicalRole === 'client_owner' ||
      canonicalRole === 'client_manager' ||
      canonicalRole === 'client_employee');

  const loadTenantOverview = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const resp = await fetch(`/api/tenant/${encodeURIComponent(tenantId)}/overview`, {
        credentials: 'include',
      });
      if (!resp.ok) return;
      const data = (await resp.json()) as {
        ok?: boolean;
        tenant?: ServerTenantSummary;
        members?: ManagedAccountSafe[];
        invitations?: ServerInvitationSafe[];
        orders?: ServerTenantOrderSafe[];
        contractedKitchens?: ServerTenantSummary[];
      };
      if (data.ok && data.tenant) {
        setTenant(data.tenant);
        setMembers(data.members || []);
        setInvitations(data.invitations || []);
        setOrders(data.orders || []);
        setContractedKitchens(data.contractedKitchens || []);
        setInvitedRole(
          data.tenant.kind === 'central_kitchen' ? 'kitchen_staff' : 'client_employee'
        );
        if ((data.contractedKitchens || []).length > 0 && !orderKitchenId) {
          setOrderKitchenId(data.contractedKitchens![0].tenantId);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [tenantId, orderKitchenId]);

  useEffect(() => {
    void loadTenantOverview();
  }, [loadTenantOverview]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitedName.trim() || !invitedEmail.trim()) return;
    setBusy(true);
    try {
      const resp = await fetch(`/api/tenant/${encodeURIComponent(tenantId)}/members/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invitedName: invitedName.trim(),
          invitedEmail: invitedEmail.trim().toLowerCase(),
          assignedRole: invitedRole,
        }),
      });
      const data = (await resp.json()) as {
        ok?: boolean;
        inviteCodeForApplicant?: string;
        messageAr?: string;
        messageEn?: string;
      };
      onShowToast(
        (isRtl ? data.messageAr : data.messageEn) ||
          data.messageAr ||
          (resp.ok ? 'تم إصدار الدعوة.' : 'تعذر إصدار الدعوة.')
      );
      if (resp.ok) {
        setLatestInviteCode(data.inviteCodeForApplicant || null);
        setInvitedName('');
        setInvitedEmail('');
        await loadTenantOverview();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleMemberToggleSuspend = async (m: ManagedAccountSafe) => {
    setBusy(true);
    try {
      const resp = await fetch(
        `/api/tenant/${encodeURIComponent(tenantId)}/members/${encodeURIComponent(m.uid)}/permissions`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            suspended: m.approvalStatus !== 'suspended',
          }),
        }
      );
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string; messageEn?: string };
      onShowToast((isRtl ? data.messageAr : data.messageEn) || data.messageAr || '');
      if (resp.ok) await loadTenantOverview();
    } finally {
      setBusy(false);
    }
  };

  const handlePlaceScopedOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderKitchenId || !orderSummary.trim()) return;
    setBusy(true);
    try {
      const resp = await fetch(`/api/tenant/${encodeURIComponent(tenantId)}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          kitchenTenantId: orderKitchenId,
          itemsSummary: orderSummary.trim(),
          totalEGP: Number(orderAmount) || 100,
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string; messageEn?: string };
      onShowToast((isRtl ? data.messageAr : data.messageEn) || data.messageAr || '');
      if (resp.ok) {
        setOrderSummary('');
        await loadTenantOverview();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleTestCrossTenantIsolation = async () => {
    setBusy(true);
    try {
      const foreignTenant =
        tenantId === 'tenant_kitchen_alain' ? 'tenant_kitchen_hanger' : 'tenant_kitchen_alain';
      const resp = await fetch(`/api/tenant/${foreignTenant}/overview`, {
        credentials: 'include',
      });
      const data = (await resp.json()) as { code?: string; messageAr?: string; messageEn?: string };
      const msg =
        resp.status === 403
          ? `HTTP 403 (${data.code || 'TENANT_ISOLATION_VIOLATION'}): ${
              isRtl ? data.messageAr : data.messageEn
            }`
          : `HTTP ${resp.status}`;
      setIsolationProbeMsg(msg);
      onShowToast(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!tenant) {
    return (
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20 text-xs font-bold text-[#64748B]">
        {loading
          ? isRtl
            ? 'جاري تحميل مساحة العمل المعزولة...'
            : 'Loading isolated tenant workspace...'
          : isRtl
            ? 'مساحة عمل الكيان المعزول'
            : 'Isolated Tenant Workspace'}
      </div>
    );
  }

  return (
    <section className="rounded-3xl bg-white dark:bg-[#1F172F] border-2 border-[#62339A]/25 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-[#62339A] text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFC928] text-[#292333] flex items-center justify-center shrink-0">
            {isKitchen ? <ChefHat className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[11px] font-black text-[#FFC928] block">
              {isKitchen
                ? isRtl
                  ? 'بوابة المطبخ المركزي المعزولة'
                  : 'Isolated Central Kitchen Workspace'
                : isRtl
                  ? 'مساحة عمل الشركة / المصنع المعزولة'
                  : 'Isolated Company / Factory Workspace'}
            </span>
            <h3 className="text-base sm:text-lg font-black">{tenant.name}</h3>
            <p className="text-[11px] text-white/80 font-mono" dir="ltr">
              {tenant.tenantId} · {tenant.commercialRegRef}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleTestCrossTenantIsolation()}
          className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-[#FFC928]" />
          <span>{isRtl ? 'اختبار عزل الجهات' : 'Verify Isolation'}</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {isolationProbeMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs font-black text-emerald-900 dark:text-emerald-200">
            {isolationProbeMsg}
          </div>
        )}

        {/* Contracted Kitchens */}
        {!isKitchen && (
          <div className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/15 space-y-2">
            <h4 className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
              {isRtl
                ? `المطابخ المركزية المتعاقدة والمعتمدة لجهتكم فقط (${contractedKitchens.length})`
                : `Contracted Central Kitchens (${contractedKitchens.length})`}
            </h4>
            <div className="flex flex-wrap gap-2">
              {contractedKitchens.map((k) => (
                <span
                  key={k.tenantId}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-[#1F172F] border border-[#62339A]/25 text-xs font-black text-[#292333] dark:text-white"
                >
                  {k.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Place Scoped Catering Order (Company -> Contracted Kitchen only) */}
        {canPlaceOrders && contractedKitchens.length > 0 && (
          <form
            onSubmit={handlePlaceScopedOrder}
            className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/20 space-y-3"
          >
            <h4 className="text-xs font-black text-[#292333] dark:text-white flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" />
              <span>
                {isRtl
                  ? 'إنشاء طلب إعاشة ضمن العقود المعتمدة فقط'
                  : 'Place Contract-Scoped Catering Order'}
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <select
                value={orderKitchenId}
                onChange={(e) => setOrderKitchenId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20 font-bold"
              >
                {contractedKitchens.map((k) => (
                  <option key={k.tenantId} value={k.tenantId}>
                    {k.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={orderSummary}
                onChange={(e) => setOrderSummary(e.target.value)}
                placeholder={isRtl ? 'تفاصيل الوجبات (مثال: 50 وجبة غداء)...' : 'Meals summary...'}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  required
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20 font-black"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#FFC928] text-[#292333] font-black cursor-pointer"
                >
                  {isRtl ? 'إرسال' : 'Order'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Scoped Orders List */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-[#292333] dark:text-white">
            {isRtl ? `طلبات النطاق المعزول (${orders.length})` : `Tenant Orders (${orders.length})`}
          </h4>
          {orders.length === 0 ? (
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {isRtl ? 'لا توجد طلبات مسجلة في هذا النطاق بعد.' : 'No scoped orders yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {orders.map((ord) => (
                <div
                  key={ord.orderId}
                  className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/15 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-mono font-black text-[#62339A] dark:text-[#FFC928]">
                      {ord.orderId}
                    </span>{' '}
                    · <strong className="text-[#292333] dark:text-white">{ord.itemsSummary}</strong>
                    <div className="text-[11px] text-[#64748B] dark:text-slate-300">
                      {ord.clientTenantName} → {ord.kitchenTenantName}
                    </div>
                  </div>
                  <div className="text-end font-black text-[#62339A] dark:text-[#FFC928]">
                    {ord.totalEGP} EGP · {ord.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite Employees inside Tenant Scope */}
        {canInviteMembers && (
          <form
            onSubmit={handleInviteMember}
            className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/20 space-y-3"
          >
            <h4 className="text-xs font-black text-[#292333] dark:text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" />
              <span>
                {isKitchen
                  ? isRtl
                    ? 'دعوة طاقم/مدير للمطبخ المركزي فقط'
                    : 'Invite Kitchen Staff / Manager'
                  : isRtl
                    ? 'دعوة موظف أو مدير داخل الشركة فقط'
                    : 'Invite Company Employee / Manager'}
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <input
                type="text"
                required
                value={invitedName}
                onChange={(e) => setInvitedName(e.target.value)}
                placeholder={isRtl ? 'اسم الموظف *' : 'Employee Name *'}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20"
              />
              <input
                type="email"
                required
                dir="ltr"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                placeholder="employee@company.com"
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20 font-mono"
              />
              <select
                value={invitedRole}
                onChange={(e) => setInvitedRole(e.target.value as CanonicalRole)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20 font-bold"
              >
                {(isKitchen
                  ? (['kitchen_manager', 'kitchen_staff'] as CanonicalRole[])
                  : (['client_manager', 'client_employee'] as CanonicalRole[])
                ).map((r) => (
                  <option key={r} value={r}>
                    {isRtl ? CANONICAL_ROLE_META[r].labelAr : CANONICAL_ROLE_META[r].labelEn}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-[#62339A] text-white font-black cursor-pointer"
              >
                {isRtl ? 'إصدار رمز دعوة' : 'Issue Invite'}
              </button>
            </div>

            {latestInviteCode && (
              <div className="p-3 rounded-xl bg-white dark:bg-[#1F172F] border border-[#FFC928] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-black text-[#62339A] dark:text-[#FFC928]">
                    {isRtl ? 'رمز الدعوة للموظف (يُستخدم مرة واحدة عند التسجيل):' : 'One-Time Invite Code:'}
                  </span>{' '}
                  <code className="font-mono font-black select-all" dir="ltr">
                    {latestInviteCode}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(latestInviteCode);
                    onShowToast(isRtl ? 'تم نسخ رمز الدعوة.' : 'Invite code copied.');
                  }}
                  className="px-3 py-1 rounded-lg bg-[#FFC928] text-[#292333] font-black flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'نسخ' : 'Copy'}</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* Tenant Members & Pending Invites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-black text-[#292333] dark:text-white">
              {isRtl ? `أعضاء الكيان (${members.length})` : `Tenant Members (${members.length})`}
            </h4>
            {members.map((m) => (
              <div
                key={m.uid}
                className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/15 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-black text-[#292333] dark:text-white truncate">
                    {m.fullName}
                  </div>
                  <div className="text-[11px] font-mono text-[#64748B] truncate" dir="ltr">
                    {m.email} · {m.canonicalRole}
                  </div>
                </div>
                {canInviteMembers && m.canonicalRole !== 'client_owner' && m.canonicalRole !== 'kitchen_owner' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleMemberToggleSuspend(m)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer ${
                      m.approvalStatus === 'suspended'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {m.approvalStatus === 'suspended'
                      ? isRtl
                        ? 'تفعيل'
                        : 'Activate'
                      : isRtl
                        ? 'تجميد'
                        : 'Suspend'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-[#292333] dark:text-white">
              {isRtl ? `الدعوات الصادرة (${invitations.length})` : `Issued Invitations (${invitations.length})`}
            </h4>
            {invitations.length === 0 ? (
              <p className="text-xs text-[#64748B]">
                {isRtl ? 'لا توجد دعوات صادرة.' : 'No invitations yet.'}
              </p>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.inviteId}
                  className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] border border-[#62339A]/15 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-black text-[#292333] dark:text-white truncate">
                      {inv.invitedName}
                    </div>
                    <div className="text-[11px] font-mono text-[#64748B] truncate" dir="ltr">
                      {inv.invitedEmail} · {inv.assignedRole}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#1F172F] text-[10px] font-black text-[#62339A] dark:text-[#FFC928]">
                    {inv.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
