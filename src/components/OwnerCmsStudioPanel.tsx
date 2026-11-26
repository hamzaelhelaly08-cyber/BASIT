import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  Palette,
  Type,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Save,
  BellRing,
  Loader2,
  Ticket,
  Crown,
  ShieldCheck,
  UserPlus,
  AlertTriangle,
  X,
  RefreshCw,
  UserX,
  RotateCcw,
} from 'lucide-react';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  BenefitBookingDoc,
  CmsMenuOverrideItem,
  PlatformSettingsDoc,
  VipDirectOrderDoc,
  VipDirectOrderStatus,
} from '../types/faydEcosystem';
import {
  adminReviewBenefitBooking,
  adminReviewVipDirectOrder,
  adminSavePlatformCms,
  adminSaveRbacDesignations,
  parseEmailCsv,
} from '../services/faydFirestoreService';
import {
  DEFAULT_HERO_BADGE_AR,
  DEFAULT_HERO_SUBTITLE_AR,
  DEFAULT_HERO_TITLE_AR,
  useOwnerCms,
} from '../context/OwnerCmsContext';
import { Service3DIcon } from './Service3DIcon';
import { MasterRbacAndGovernancePanel } from './fayd/RbacControlAndTenantPanel';

interface OwnerCmsStudioPanelProps {
  firebaseUser: User | null;
  platformSettings: PlatformSettingsDoc;
  allVipOrders: VipDirectOrderDoc[];
  allBenefitBookings: BenefitBookingDoc[];
  onShowToast: (msg: string) => void;
  isRtl?: boolean;
  isServerOwner?: boolean;
  isPlatformAdmin?: boolean;
}

const COLOR_PRESETS = [
  { label: 'باسط الأساسي (Indigo & Sky)', purple: '#62339A', yellow: '#0EA5E9' },
  { label: 'سليت ملكي (Slate & Indigo)', purple: '#4A2378', yellow: '#A34FE8' },
  { label: 'أزرق سماوي (Ocean Blue)', purple: '#2563EB', yellow: '#0284C7' },
  { label: 'زمردي مؤسسي (Emerald Slate)', purple: '#292333', yellow: '#10B981' },
];

interface ActiveServerSessionItem {
  sessionPrefix: string;
  email: string;
  uid: string;
  fullName: string;
  role: string;
  authKind: string;
  createdAt: string;
  expiresAt: string;
}

interface RevokedSubjectItem {
  subject: string;
  reason: string;
  revokedAt: string;
  revokedBy: string;
}

interface ExecutiveSetupStatusItem {
  username: string;
  fullNameAr: string;
  fullNameEn: string;
  roleLabelAr: string;
  canonicalRole: string;
  hasPassword: boolean;
}

const BASE_EDITABLE_CATALOG: CmsMenuOverrideItem[] = [
  {
    id: 'offer_camel_liver',
    titleAr: 'طاسة كبدة جملي VIP وسجق بلدي (2 كجم)',
    merchantAr: 'ركن الجملي — مجلس العين',
    priceEGP: 1280,
    oldPriceEGP: 1550,
    discountBadge: 'VIP',
    section: 'newest_offers',
  },
  {
    id: 'offer_sushi_16',
    titleAr: 'بوكس سوشي 16 قطعة طازج',
    merchantAr: 'Al Ain Sushi Bar',
    priceEGP: 460,
    oldPriceEGP: 620,
    discountBadge: '26%',
    section: 'newest_offers',
  },
  {
    id: 'offer_sweets_box',
    titleAr: 'علبة حلويات شرقية مشكل VIP',
    merchantAr: 'Desserts & Patisserie',
    priceEGP: 340,
    oldPriceEGP: 450,
    discountBadge: '24%',
    section: 'newest_offers',
  },
  {
    id: 'spa_ghazal',
    titleAr: 'خصم حتى 77% في غزال سبا للرجال',
    merchantAr: 'غزال سبا',
    priceEGP: 599,
    oldPriceEGP: 2550,
    discountBadge: '77%',
    section: 'care_spa',
  },
  {
    id: 'spa_chillout',
    titleAr: 'خصم حتى 60% في شيل أوت مساج',
    merchantAr: 'شيل أوت مساج',
    priceEGP: 400,
    oldPriceEGP: 1200,
    discountBadge: '60%',
    section: 'care_spa',
  },
  {
    id: 'cinema_diamond',
    titleAr: 'تذكرة سينما دايموند العاشر من رمضان',
    merchantAr: 'سينما دايموند',
    priceEGP: 135,
    oldPriceEGP: 180,
    discountBadge: '25%',
    section: 'cinema',
  },
  {
    id: 'cinema_madinaty',
    titleAr: 'عرض VIP في سينما مدينتي',
    merchantAr: 'سينما مدينتي',
    priceEGP: 195,
    oldPriceEGP: 260,
    discountBadge: '25%',
    section: 'cinema',
  },
];

const ICON_SLOTS = [
  { key: 'utensils', label: 'أيقونة المطاعم والطعام' },
  { key: 'cinema', label: 'أيقونة وقت السينما' },
  { key: 'salt', label: 'أيقونة بيت الملح والعناية' },
  { key: 'circus', label: 'أيقونة سيرك العين' },
  { key: 'aqua_park', label: 'أيقونة أكوا بارك للأطفال' },
  { key: 'rally', label: 'أيقونة سباق الرالي' },
  { key: 'kids', label: 'أيقونة منطقة الأطفال' },
  { key: 'gift', label: 'أيقونة الهدايا وبطاقات الألعاب' },
  { key: 'grills', label: 'أيقونة المندي والمشويات' },
  { key: 'coupon', label: 'أيقونة القسائم والخصومات' },
];

const AVAILABLE_ICON_GLYPHS = [
  { key: 'utensils', label: 'طبق ضيافة (utensils)' },
  { key: 'chef', label: 'مطبخ وطاهٍ (chef)' },
  { key: 'grills', label: 'مشويات ونار (grills)' },
  { key: 'pizza', label: 'بيتزا (pizza)' },
  { key: 'sushi', label: 'متجر/سوشي (sushi)' },
  { key: 'cinema', label: 'سينما (cinema)' },
  { key: 'circus', label: 'سيرك (circus)' },
  { key: 'aqua_park', label: 'أكوا بارك (aqua_park)' },
  { key: 'rally', label: 'سباق رالي (rally)' },
  { key: 'salt', label: 'بيت الملح (salt)' },
  { key: 'spa', label: 'سبا وعناية (spa)' },
  { key: 'barber', label: 'صالون حلاقة (barber)' },
  { key: 'kids', label: 'ألعاب أطفال (kids)' },
  { key: 'oud', label: 'طرب شرقي (oud)' },
  { key: 'gift', label: 'هدايا وألعاب (gift)' },
  { key: 'coupon', label: 'قسائم خصم (coupon)' },
  { key: 'banquet', label: 'مجلس ضيافة (banquet)' },
];

export const OwnerCmsStudioPanel: React.FC<OwnerCmsStudioPanelProps> = ({
  firebaseUser,
  platformSettings,
  allVipOrders,
  allBenefitBookings,
  onShowToast,
  isRtl = true,
  isServerOwner = false,
  isPlatformAdmin = false,
}) => {
  const isStrictOwner = Boolean(
    firebaseUser?.emailVerified &&
      firebaseUser.email?.trim().toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );
  const canSuperAdmin = isStrictOwner || isServerOwner;

  const cms = useOwnerCms();
  const [activeTab, setActiveTab] = useState<
    'governance_rbac' | 'approvals' | 'rbac' | 'sessions' | 'menus' | 'colors' | 'words' | 'icons'
  >(canSuperAdmin ? 'governance_rbac' : 'governance_rbac');
  const [saving, setSaving] = useState(false);

  // Server Active Sessions & Immediate Revocation state
  const [activeSessions, setActiveSessions] = useState<ActiveServerSessionItem[]>([]);
  const [revokedSubjects, setRevokedSubjects] = useState<RevokedSubjectItem[]>([]);
  const [designatedServerRoles, setDesignatedServerRoles] = useState<Record<string, string>>({});
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [roleEmailInput, setRoleEmailInput] = useState('');
  const [roleSelectInput, setRoleSelectInput] = useState<'basit_admin' | 'finance_admin' | 'none'>('finance_admin');
  const [revokeReasonInput, setRevokeReasonInput] = useState('');
  const [executiveStatuses, setExecutiveStatuses] = useState<ExecutiveSetupStatusItem[]>([]);
  const [execTargetUsername, setExecTargetUsername] = useState('ahmed.adly');
  const [execNewPassword, setExecNewPassword] = useState('');

  // RBAC Designations state
  const [basitAdminEmails, setBasitAdminEmails] = useState<string[]>(() =>
    parseEmailCsv(platformSettings.designatedBasitAdminEmailsCsv)
  );
  const [habeApproverEmails, setHabeApproverEmails] = useState<string[]>(() =>
    parseEmailCsv(platformSettings.designatedHabeApproverEmailsCsv)
  );
  const [newBasitAdminEmail, setNewBasitAdminEmail] = useState('');
  const [newHabeApproverEmail, setNewHabeApproverEmail] = useState('');

  useEffect(() => {
    setBasitAdminEmails(parseEmailCsv(platformSettings.designatedBasitAdminEmailsCsv));
    setHabeApproverEmails(parseEmailCsv(platformSettings.designatedHabeApproverEmailsCsv));
  }, [platformSettings.designatedBasitAdminEmailsCsv, platformSettings.designatedHabeApproverEmailsCsv]);

  // Colors state
  const [purple, setPurple] = useState(cms.primaryPurple);
  const [yellow, setYellow] = useState(cms.accentYellow);

  // Words / Hero copy state
  const [heroBadge, setHeroBadge] = useState(cms.heroBadgeAr);
  const [heroTitle, setHeroTitle] = useState(cms.heroTitleAr);
  const [heroSubtitle, setHeroSubtitle] = useState(cms.heroSubtitleAr);

  // Menu Overrides state
  const [menuList, setMenuList] = useState<CmsMenuOverrideItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMerchant, setNewMerchant] = useState('');
  const [newPrice, setNewPrice] = useState('250');
  const [newOldPrice, setNewOldPrice] = useState('350');
  const [newBadge, setNewBadge] = useState('جديد');
  const [newSection, setNewSection] = useState('newest_offers');

  // Icon Overrides state
  const [iconMap, setIconMap] = useState<Record<string, string>>(cms.iconOverrides);

  // Owner reply per order
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setPurple(cms.primaryPurple);
    setYellow(cms.accentYellow);
    setHeroBadge(cms.heroBadgeAr);
    setHeroTitle(cms.heroTitleAr);
    setHeroSubtitle(cms.heroSubtitleAr);
    setIconMap(cms.iconOverrides);

    // Merge defaults + saved overrides
    const merged: CmsMenuOverrideItem[] = BASE_EDITABLE_CATALOG.map((base) => {
      const ov = cms.menuOverrides.find((m) => m.id === base.id);
      return ov ? { ...base, ...ov } : base;
    });
    const customs = cms.menuOverrides.filter(
      (m) => m.isCustom || !BASE_EDITABLE_CATALOG.some((b) => b.id === m.id)
    );
    setMenuList([...merged, ...customs]);
  }, [cms]);

  const loadServerSessions = async () => {
    setSessionsLoading(true);
    try {
      const resp = await fetch('/api/admin/sessions', { credentials: 'include' });
      if (!resp.ok) return;
      const data = (await resp.json()) as {
        ok?: boolean;
        activeSessions?: ActiveServerSessionItem[];
        revokedSubjects?: RevokedSubjectItem[];
        designatedRoles?: Record<string, string>;
      };
      if (data.ok) {
        setActiveSessions(data.activeSessions || []);
        setRevokedSubjects(data.revokedSubjects || []);
        setDesignatedServerRoles(data.designatedRoles || {});
      }
    } catch {
      // ignore
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleProvisionExecutivePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execTargetUsername || execNewPassword.length < 8) {
      onShowToast('كلمة المرور يجب أن تكون 8 أحرف/أرقام على الأقل.');
      return;
    }
    setSaving(true);
    try {
      const resp = await fetch('/api/admin/provision-executive-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: execTargetUsername,
          newPassword: execNewPassword,
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string };
      onShowToast(data.messageAr || (resp.ok ? 'تم تعيين كلمة المرور بنجاح.' : 'تعذر تعيين كلمة المرور.'));
      if (resp.ok) {
        setExecNewPassword('');
        await loadServerSessions();
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      void loadServerSessions();
    }
  }, [activeTab]);

  const handleServerAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = roleEmailInput.trim().toLowerCase();
    if (!cleanEmail) return;
    setSaving(true);
    try {
      const resp = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, role: roleSelectInput }),
      });
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string };
      onShowToast(data.messageAr || (resp.ok ? 'تم تحديث دور الخادم بنجاح.' : 'تعذر تحديث الدور.'));
      if (resp.ok) {
        setRoleEmailInput('');
        await loadServerSessions();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleServerRevokeAccess = async (email: string, uid?: string) => {
    setSaving(true);
    try {
      const resp = await fetch('/api/admin/revoke-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          uid,
          reason: revokeReasonInput.trim() || 'سحب صلاحية إداري فوري من المالك',
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string };
      onShowToast(data.messageAr || (resp.ok ? 'تم سحب الصلاحية وإلغاء الجلسات فوراً.' : 'تعذر سحب الصلاحية.'));
      if (resp.ok) {
        setRevokeReasonInput('');
        await loadServerSessions();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleServerRestoreAccess = async (subject: string) => {
    setSaving(true);
    try {
      const resp = await fetch('/api/admin/restore-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject }),
      });
      const data = (await resp.json()) as { ok?: boolean; messageAr?: string };
      onShowToast(data.messageAr || (resp.ok ? 'تمت إعادة إتاحة الحساب.' : 'تعذر إعادة الإتاحة.'));
      if (resp.ok) {
        await loadServerSessions();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!canSuperAdmin && !isPlatformAdmin) {
    return null;
  }

  const handleAddDesignatedEmail = (target: 'basit' | 'habe') => {
    const raw = (target === 'basit' ? newBasitAdminEmail : newHabeApproverEmail).trim().toLowerCase();
    if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      onShowToast('أدخل بريداً إلكترونياً صحيحاً مرتبطاً بحساب Google.');
      return;
    }
    if (target === 'basit') {
      if (!basitAdminEmails.includes(raw)) {
        setBasitAdminEmails((prev) => [...prev, raw]);
      }
      setNewBasitAdminEmail('');
    } else {
      if (!habeApproverEmails.includes(raw)) {
        setHabeApproverEmails((prev) => [...prev, raw]);
      }
      setNewHabeApproverEmail('');
    }
  };

  const handleSaveRbac = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await adminSaveRbacDesignations(firebaseUser, platformSettings, {
        designatedBasitAdminEmailsCsv: basitAdminEmails.join(','),
        designatedHabeApproverEmailsCsv: habeApproverEmails.join(','),
      });
      onShowToast('تم حفظ وتفعيل صلاحيات المديرين والمعتمدين عبر السحابة فوراً!');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر حفظ صلاحيات RBAC');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveColors = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await adminSavePlatformCms(firebaseUser, platformSettings, {
        cmsPrimaryPurple: purple,
        cmsAccentYellow: yellow,
      });
      onShowToast('تم حفظ ألوان الهوية الجديدة وتطبيقها حياً لجميع المستخدمين!');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر حفظ الألوان');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWords = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await adminSavePlatformCms(firebaseUser, platformSettings, {
        cmsHeroBadgeAr: heroBadge,
        cmsHeroTitleAr: heroTitle,
        cmsHeroSubtitleAr: heroSubtitle,
      });
      onShowToast('تم حفظ النصوص والعناوين الجديدة ونشرها فوراً!');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر حفظ النصوص');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMenus = async (listToSave = menuList) => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await adminSavePlatformCms(firebaseUser, platformSettings, {
        cmsMenuOverridesJson: JSON.stringify(listToSave),
      });
      onShowToast('تم تحديث القوائم والأسعار بنجاح ونشرها في المنصة!');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر حفظ القوائم');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMerchant.trim()) return;
    const item: CmsMenuOverrideItem = {
      id: `custom_${Date.now().toString(36)}`,
      titleAr: newTitle.trim(),
      merchantAr: newMerchant.trim(),
      priceEGP: Math.max(1, Number(newPrice) || 100),
      oldPriceEGP: Number(newOldPrice) > 0 ? Number(newOldPrice) : undefined,
      discountBadge: newBadge.trim() || 'جديد',
      section: newSection,
      isCustom: true,
    };
    const next = [item, ...menuList];
    setMenuList(next);
    setNewTitle('');
    setNewMerchant('');
    await handleSaveMenus(next);
  };

  const handleSaveIcons = async () => {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await adminSavePlatformCms(firebaseUser, platformSettings, {
        cmsIconOverridesJson: JSON.stringify(iconMap),
      });
      onShowToast('تم حفظ تعديلات الأيقونات وتطبيقها على المنصة بالكامل!');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر حفظ الأيقونات');
    } finally {
      setSaving(false);
    }
  };

  const handleVipStatus = async (order: VipDirectOrderDoc, status: VipDirectOrderStatus) => {
    if (!firebaseUser) return;
    setBusyId(order.orderId);
    try {
      await adminReviewVipDirectOrder(
        firebaseUser,
        order,
        status,
        replyDrafts[order.orderId] || ''
      );
      onShowToast(`تم تحديث الطلب ${order.orderId} إلى: ${status}`);
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر تحديث الطلب');
    } finally {
      setBusyId(null);
    }
  };

  const handleBookingReview = async (booking: BenefitBookingDoc, status: 'approved' | 'rejected') => {
    if (!firebaseUser) return;
    setBusyId(booking.bookingId);
    try {
      await adminReviewBenefitBooking(firebaseUser, booking, status);
      onShowToast(
        status === 'approved'
          ? `تم اعتماد كوبون الموظف ${booking.userName}`
          : `تم رفض طلب ${booking.userName}`
      );
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'تعذر مراجعة الطلب');
    } finally {
      setBusyId(null);
    }
  };

  const pendingOrdersCount = allVipOrders.filter((o) => o.status === 'pending_owner').length;
  const pendingBookingsCount = allBenefitBookings.filter((b) => b.status === 'pending').length;

  return (
    <section className="rounded-3xl bg-white dark:bg-[#292333] border-2 border-[#62339A] shadow-lg overflow-hidden">
      {/* Studio Header */}
      <div className="bg-gradient-to-l from-[#4A2378] via-[#62339A] to-[#4A2378] text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shadow-md shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black text-[#BAE6FD] block">
              غرفة تحكم صاحب المنصة (CMS Live & الحوكمة الأمنية)
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              إدارة المالك الحية — حمزة الهلالي
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-black">
          <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white tabular-nums">
            {pendingOrdersCount + pendingBookingsCount} بانتظار اعتمادك
          </span>
        </div>
      </div>

      {/* Studio Tabs */}
      <div className="p-3 bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#62339A]/30 flex items-center gap-2 overflow-x-auto">
        {(
          [
            {
              id: 'governance_rbac' as const,
              label: isRtl ? 'اعتماد الجهات والأدوار الـ10 والتدقيق' : '10-Role RBAC & Approvals',
              icon: ShieldCheck,
              visible: true,
            },
            {
              id: 'approvals' as const,
              label: `صندوق الاعتمادات (${allVipOrders.length + allBenefitBookings.length})`,
              icon: BellRing,
              visible: true,
            },
            {
              id: 'rbac' as const,
              label: `تعيين المديرين (${basitAdminEmails.length + habeApproverEmails.length})`,
              icon: ShieldCheck,
              visible: canSuperAdmin,
            },
            {
              id: 'sessions' as const,
              label: `الجلسات وسحب الصلاحية (${activeSessions.length})`,
              icon: UserX,
              visible: canSuperAdmin,
            },
            { id: 'menus' as const, label: 'القوائم والأسعار', icon: UtensilsCrossed, visible: true },
            { id: 'colors' as const, label: 'الألوان والهوية', icon: Palette, visible: canSuperAdmin },
            { id: 'words' as const, label: 'الكلمات والعناوين', icon: Type, visible: canSuperAdmin },
            { id: 'icons' as const, label: 'تغيير الأيقونات', icon: Sparkles, visible: canSuperAdmin },
          ] as const
        )
          .filter((t) => t.visible)
          .map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  active
                    ? 'bg-[#62339A] text-white shadow-md shadow-[#62339A]/25'
                    : 'bg-white dark:bg-[#292333] text-[#292333] dark:text-slate-200 border border-[#E2E8F0] dark:border-[#62339A]/30 hover:border-[#62339A]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FFC928]' : 'text-[#62339A]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {activeTab === 'governance_rbac' && (
          <MasterRbacAndGovernancePanel
            isRtl={isRtl}
            isSuperAdmin={canSuperAdmin}
            onShowToast={onShowToast}
          />
        )}

        {/* TAB 1: OWNER APPROVALS INBOX */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            {/* Direct Orders (Camel Liver VIP & Cart) */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#62339A]" />
                <span>الطلبات المباشرة الواردة (الكبدة الجملي VIP والسلة) — {allVipOrders.length}</span>
              </h3>

              {allVipOrders.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                  لا توجد طلبات مباشرة مسجلة بعد — أي طلب جديد سيظهر هنا وفي جرس الإشعارات فوراً.
                </div>
              ) : (
                <div className="space-y-3">
                  {allVipOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#62339A] text-white text-[10px] font-mono font-black">
                              {ord.orderId}
                            </span>
                            <span className="text-sm font-black text-[#292333] dark:text-white">
                              {ord.customerName}
                            </span>
                            <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]" dir="ltr">
                              {ord.phone}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#292333] dark:text-[#E2E8F0] mt-1.5">
                            {ord.itemsSummary}
                          </p>
                          {ord.notes && (
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                              {ord.notes}
                            </p>
                          )}
                        </div>

                        <div className="text-end">
                          <span className="text-base font-black text-[#62339A] dark:text-[#A34FE8] block tabular-nums">
                            {ord.totalEGP.toLocaleString()} ج.م
                          </span>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-[#0EA5E9] text-white text-[10px] font-black">
                            {ord.status === 'pending_owner'
                              ? 'بانتظار اعتمادك'
                              : ord.status === 'approved'
                                ? 'معتمد'
                                : ord.status === 'preparing'
                                  ? 'قيد التجهيز'
                                  : ord.status === 'completed'
                                    ? 'مكتمل'
                                    : 'مرفوض'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#62339A]/20">
                        <input
                          type="text"
                          value={replyDrafts[ord.orderId] || ''}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [ord.orderId]: e.target.value }))
                          }
                          placeholder="رد المالك للعميل (اختياري)..."
                          className="flex-1 min-w-[180px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs text-[#292333] dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={busyId === ord.orderId}
                          onClick={() => handleVipStatus(ord, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>قبول واعتماد</span>
                        </button>
                        <button
                          type="button"
                          disabled={busyId === ord.orderId}
                          onClick={() => handleVipStatus(ord, 'preparing')}
                          className="px-3 py-1.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#A34FE8]" />
                          <span>تجهيز</span>
                        </button>
                        <button
                          type="button"
                          disabled={busyId === ord.orderId}
                          onClick={() => handleVipStatus(ord, 'completed')}
                          className="px-3 py-1.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-black cursor-pointer"
                        >
                          تم التسليم
                        </button>
                        <button
                          type="button"
                          disabled={busyId === ord.orderId}
                          onClick={() => handleVipStatus(ord, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contracted Employee 10% Coupon Requests */}
            <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-[#62339A]/25">
              <h3 className="text-sm sm:text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#62339A]" />
                <span>طلبات كوبون خصم 10% للعاملين بالقطاعات المتعاقدة ({allBenefitBookings.length})</span>
              </h3>

              {allBenefitBookings.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                  لا توجد طلبات تحقق موظفين بعد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allBenefitBookings.map((bk) => (
                    <div
                      key={bk.bookingId}
                      className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/35 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
                            {bk.venueName}
                          </div>
                          <div className="text-sm font-black text-[#292333] dark:text-white mt-0.5">
                            {bk.userName} {bk.employeeCode ? `(${bk.employeeCode})` : ''}
                          </div>
                          {bk.employerName && (
                            <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                              جهة العمل: {bk.employerName} · هاتف: {bk.phone || '—'}
                            </div>
                          )}
                          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                            الموعد: {bk.requestedDate} · الأفراد: {bk.peopleCount}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                            bk.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bk.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-[#0EA5E9] text-white'
                          }`}
                        >
                          {bk.status === 'approved'
                            ? 'معتمد'
                            : bk.status === 'rejected'
                              ? 'مرفوض'
                              : 'معلق'}
                        </span>
                      </div>

                      {bk.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#62339A]/20">
                          <button
                            type="button"
                            disabled={busyId === bk.bookingId}
                            onClick={() => handleBookingReview(bk, 'approved')}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer"
                          >
                            اعتماد خصم 10%
                          </button>
                          <button
                            type="button"
                            disabled={busyId === bk.bookingId}
                            onClick={() => handleBookingReview(bk, 'rejected')}
                            className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer"
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE MENUS & PRICES */}
        {activeTab === 'menus' && (
          <div className="space-y-6">
            {/* Add New Menu Item */}
            <form
              onSubmit={handleAddCustomMenu}
              className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#62339A]/35 space-y-3"
            >
              <h3 className="text-sm font-black text-[#292333] dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#62339A]" />
                <span>إضافة منيو أو عرض جديد بالأسعار فوراً</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="اسم الصنف / العرض *"
                  className="lg:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-[#292333] dark:text-white"
                />
                <input
                  type="text"
                  required
                  value={newMerchant}
                  onChange={(e) => setNewMerchant(e.target.value)}
                  placeholder="اسم المطعم / المتجر *"
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-[#292333] dark:text-white"
                />
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="السعر الحالي"
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-[#292333] dark:text-white"
                />
                <input
                  type="number"
                  value={newOldPrice}
                  onChange={(e) => setNewOldPrice(e.target.value)}
                  placeholder="السعر قبل الخصم"
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-[#292333] dark:text-white"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#A34FE8]" />
                  <span>إضافة ونشر</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="font-bold text-[#64748B]">القسم المستهدف:</label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-bold text-[#292333] dark:text-white"
                >
                  <option value="newest_offers">أجدد العروض</option>
                  <option value="cinema">وقت السينما</option>
                  <option value="care_spa">عناية وسبا</option>
                  <option value="gifts_gaming">هدايا وبطاقات ألعاب</option>
                </select>
                <label className="font-bold text-[#64748B]">شارة الخصم:</label>
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-bold text-[#292333] dark:text-white"
                />
              </div>
            </form>

            {/* Existing Items Price Editor */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-[#292333] dark:text-white">
                  تعديل أسعار وعناوين المنيو والعروض الحالية:
                </h3>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSaveMenus()}
                  className="px-4 py-2 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>حفظ كل الأسعار</span>
                </button>
              </div>

              <div className="space-y-2">
                {menuList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <input
                      type="text"
                      value={item.titleAr}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMenuList((prev) =>
                          prev.map((m, i) => (i === idx ? { ...m, titleAr: v } : m))
                        );
                      }}
                      className="md:col-span-5 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-bold text-[#292333] dark:text-white"
                    />
                    <input
                      type="text"
                      value={item.merchantAr}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMenuList((prev) =>
                          prev.map((m, i) => (i === idx ? { ...m, merchantAr: v } : m))
                        );
                      }}
                      className="md:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-[#292333] dark:text-white"
                    />
                    <input
                      type="number"
                      value={item.priceEGP}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        setMenuList((prev) =>
                          prev.map((m, i) => (i === idx ? { ...m, priceEGP: v } : m))
                        );
                      }}
                      className="md:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-black text-[#62339A] tabular-nums"
                    />
                    <input
                      type="text"
                      value={item.discountBadge || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMenuList((prev) =>
                          prev.map((m, i) => (i === idx ? { ...m, discountBadge: v } : m))
                        );
                      }}
                      placeholder="شارة %"
                      className="md:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-bold text-[#292333] dark:text-white"
                    />
                    <div className="md:col-span-1 flex justify-end">
                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = menuList.filter((_, i) => i !== idx);
                            setMenuList(next);
                          }}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COLORS & IDENTITY */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] space-y-2">
                <label className="text-xs font-black text-[#292333] dark:text-white block">
                  اللون الرئيسي للمنصة (--basit-purple)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={purple}
                    onChange={(e) => setPurple(e.target.value)}
                    className="w-14 h-11 rounded-xl border border-[#E2E8F0] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={purple}
                    onChange={(e) => setPurple(e.target.value)}
                    dir="ltr"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] space-y-2">
                <label className="text-xs font-black text-[#292333] dark:text-white block">
                  اللون الثانوي الداعم (--basit-yellow)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={yellow}
                    onChange={(e) => setYellow(e.target.value)}
                    className="w-14 h-11 rounded-xl border border-[#E2E8F0] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={yellow}
                    onChange={(e) => setYellow(e.target.value)}
                    dir="ltr"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setPurple(p.purple);
                    setYellow(p.yellow);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] text-xs font-black flex items-center gap-2 cursor-pointer hover:border-[#62339A]"
                >
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.purple }} />
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.yellow }} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveColors()}
              className="px-6 py-3 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#A34FE8]" />}
              <span>تطبيق وحفظ الألوان في التطبيق</span>
            </button>
          </div>
        )}

        {/* TAB 4: WORDS & HERO COPY */}
        {activeTab === 'words' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-black text-[#292333] dark:text-white block">
                شارة التعريف العلوية (Badge):
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-black text-[#292333] dark:text-white block">
                العنوان الرئيسي للواجهة (Headline):
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] font-black text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-black text-[#292333] dark:text-white block">
                النص التوضيحي تحت العنوان (Subtitle):
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveWords()}
                className="px-6 py-3 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#A34FE8]" />}
                <span>حفظ ونشر النصوص الجديدة</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeroBadge(DEFAULT_HERO_BADGE_AR);
                  setHeroTitle(DEFAULT_HERO_TITLE_AR);
                  setHeroSubtitle(DEFAULT_HERO_SUBTITLE_AR);
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#292333] dark:text-white font-bold cursor-pointer"
              >
                استعادة النصوص الافتراضية
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE ICON SWITCHER */}
        {activeTab === 'icons' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ICON_SLOTS.map((slot) => {
                const chosen = iconMap[slot.key] || slot.key;
                return (
                  <div
                    key={slot.key}
                    className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Service3DIcon iconKey={chosen} size="sm" />
                      <span className="text-xs font-black text-[#292333] dark:text-white truncate">
                        {slot.label}
                      </span>
                    </div>
                    <select
                      value={chosen}
                      onChange={(e) =>
                        setIconMap((prev) => ({ ...prev, [slot.key]: e.target.value }))
                      }
                      className="px-2.5 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-xs font-bold text-[#292333] dark:text-white"
                    >
                      {AVAILABLE_ICON_GLYPHS.map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveIcons()}
              className="px-6 py-3 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#A34FE8]" />}
              <span>حفظ وتطبيق الأيقونات فوراً</span>
            </button>
          </div>
        )}

        {/* TAB 6: OWNER-ONLY RBAC DESIGNATIONS */}
        {activeTab === 'rbac' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#62339A]/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
                <ShieldCheck className="w-4 h-4" />
                <span>صلاحية مالك المنصة الحصرية — تعيين 1 إلى 2 من المديرين والمعتمدين</span>
              </div>
              <p className="text-[11px] font-bold text-[#292333] dark:text-slate-200 leading-relaxed">
                بريدك الأساسي <span dir="ltr" className="font-mono text-[#62339A] dark:text-[#A34FE8]">{BOOTSTRAPPED_ADMIN_EMAIL}</span> يمتلك الصلاحية الكاملة دائماً. أضف هنا فقط بريد Google الخاص بالمدير أو المعتمد المصرح له بتنفيذ الاعتمادات.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* BASIT Designated Admins */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-3">
                <div>
                  <h3 className="text-sm font-black text-[#292333] dark:text-white">
                    1. مديرو منصة باسط المعينون
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    يملكون صلاحية تعديل حالات عروض الأسعار (RFQ) وتحديث الشعار الرسمي والإدارة التشغيلية.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    dir="ltr"
                    value={newBasitAdminEmail}
                    onChange={(e) => setNewBasitAdminEmail(e.target.value)}
                    placeholder="manager@company.com"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDesignatedEmail('basit')}
                    className="px-3.5 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#A34FE8]" />
                    <span>إضافة</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {basitAdminEmails.length === 0 ? (
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                      لا يوجد مديرون معينون حالياً (المالك فقط).
                    </span>
                  ) : (
                    basitAdminEmails.map((em) => (
                      <span
                        key={em}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#292333] border border-[#62339A]/30 text-xs font-mono font-bold text-[#292333] dark:text-white"
                      >
                        <span>{em}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setBasitAdminEmails((prev) => prev.filter((item) => item !== em))
                          }
                          className="text-rose-600 hover:text-rose-700 cursor-pointer"
                          aria-label={`Remove ${em}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Ha-Be Payroll Approvers */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 space-y-3">
                <div>
                  <h3 className="text-sm font-black text-[#292333] dark:text-white">
                    2. معتمدو مشتريات Ha-Be والخصم على الراتب
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    يملكون حصرياً حق تأكيد/رفض طلبات الخصم على الراتب وإضافة موظفين جدد في تطبيق Ha-Be المعزول.
                  </p>
                </div>

                {habeApproverEmails.length > 2 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>تنبيه حوكمة: يُفضل حصر معتمدي Ha-Be في مستخدم واحد أو اثنين فقط لضبط الرقابة المالية.</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="email"
                    dir="ltr"
                    value={newHabeApproverEmail}
                    onChange={(e) => setNewHabeApproverEmail(e.target.value)}
                    placeholder="habe.approver@company.com"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/40 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDesignatedEmail('habe')}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {habeApproverEmails.length === 0 ? (
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                      لا يوجد معتمدون معينون حالياً (المالك فقط يعتمد مشتريات Ha-Be).
                    </span>
                  ) : (
                    habeApproverEmails.map((em) => (
                      <span
                        key={em}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#292333] border border-red-600/30 text-xs font-mono font-bold text-[#292333] dark:text-white"
                      >
                        <span>{em}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setHabeApproverEmails((prev) => prev.filter((item) => item !== em))
                          }
                          className="text-rose-600 hover:text-rose-700 cursor-pointer"
                          aria-label={`Remove ${em}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSaveRbac()}
              className="px-6 py-3 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#A34FE8]" />}
              <span>حفظ صلاحيات المديرين والمعتمدين (RBAC)</span>
            </button>
          </div>
        )}
        {/* TAB 7: SERVER ACTIVE SESSIONS, ROLE ASSIGNMENT & IMMEDIATE REVOCATION */}
        {activeTab === 'sessions' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#62339A]/30">
              <div>
                <h3 className="text-sm font-black text-[#292333] dark:text-white">
                  إدارة الجلسات النشطة وسحب الصلاحية الفوري على الخادم
                </h3>
                <p className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                  عند سحب صلاحية أي مدير أو مدير مالي، يتم إنهاء جميع جلساته النشطة في الخادم فوراً ومنع دخوله مجدداً.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadServerSessions()}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-xs font-black text-[#62339A] dark:text-[#A34FE8] flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} />
                <span>تحديث الجلسات</span>
              </button>
            </div>

            {/* Executive Password Provisioning (حمزة المالك · معتمدو رواتب H-A-B-E) */}
            <div className="p-4 rounded-2xl bg-[#FFFDF0] dark:bg-[#1E293B] border-2 border-[#FFC928] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#292333] dark:text-white">
                    تعيين / تدوير كلمات المرور (حمزة الهلالي المالك · معتمدو رواتب وفواتشر H-A-B-E)
                  </h4>
                  <p className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                    تطبيق باسط له مالك واحد فقط (حمزة الهلالي). صلاحيات اعتماد رواتب وفواتشر شركة H-A-B-E مقصورة على معتمدي الشركة (ahmed.adly و ahmed.wahid) فقط دون عرض أسمائهم على واجهات باسط العامة.
                  </p>
                </div>
              </div>

              {executiveStatuses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {executiveStatuses.map((ex) => (
                    <div
                      key={ex.username}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-black text-[#292333] dark:text-white">
                          {ex.username === 'hamza'
                            ? 'حمزة الهلالي (مالك المنصة)'
                            : ex.fullNameAr || 'معتمد رواتب H-A-B-E'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            ex.hasPassword
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ex.hasPassword ? 'مفعّلة' : 'بانتظار التفعيل'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#62339A] dark:text-[#FFC928]" dir="ltr">
                        @{ex.username}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleProvisionExecutivePassword}
                className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs"
              >
                <select
                  value={execTargetUsername}
                  onChange={(e) => setExecTargetUsername(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-bold text-[#292333] dark:text-white"
                >
                  <option value="hamza">حمزة الهلالي (المالك والمشرف العام — BASIT Super Admin)</option>
                  <option value="ahmed.adly">معتمد رواتب وفواتشر H-A-B-E (@ahmed.adly · HB-024)</option>
                  <option value="ahmed.wahid">معتمد رواتب وفواتشر H-A-B-E (@ahmed.wahid · HB-025)</option>
                </select>
                <input
                  type="password"
                  required
                  minLength={8}
                  dir="ltr"
                  autoComplete="new-password"
                  value={execNewPassword}
                  onChange={(e) => setExecNewPassword(e.target.value)}
                  placeholder="كلمة مرور جديدة قوية (8+ أحرف)"
                  className="md:col-span-2 px-3 py-2.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-mono text-[#292333] dark:text-white"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F3BC1C] text-[#292333] font-black cursor-pointer"
                >
                  حفظ وتعيين كلمة المرور
                </button>
              </form>
            </div>

            {/* Assign Server Role on Active Sessions */}
            <form
              onSubmit={handleServerAssignRole}
              className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs"
            >
              <input
                type="email"
                required
                dir="ltr"
                value={roleEmailInput}
                onChange={(e) => setRoleEmailInput(e.target.value)}
                placeholder="admin.or.finance@company.com"
                className="md:col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-mono text-[#292333] dark:text-white"
              />
              <select
                value={roleSelectInput}
                onChange={(e) =>
                  setRoleSelectInput(e.target.value as 'basit_admin' | 'finance_admin' | 'none')
                }
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] font-bold text-[#292333] dark:text-white"
              >
                <option value="finance_admin">المدير المالي (معزول / قراءة فقط)</option>
                <option value="basit_admin">مدير عمليات باسط</option>
                <option value="none">إزالة الدور الإداري (عميل عادي)</option>
              </select>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer"
              >
                تعيين دور الخادم فوراً
              </button>
            </form>

            {/* Designated Roles List */}
            {Object.keys(designatedServerRoles).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#292333] dark:text-white">
                  الأدوار المعينة على مستوى الخادم:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(designatedServerRoles).map(([em, roleVal]) => (
                    <div
                      key={em}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-xs flex items-center gap-2"
                    >
                      <span dir="ltr" className="font-mono font-bold">{em}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#F7F5FA] text-[#62339A] font-black text-[10px]">
                        {roleVal}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleServerRevokeAccess(em)}
                        className="text-rose-600 hover:text-rose-700 font-black text-[11px] cursor-pointer"
                      >
                        سحب فوري
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Sessions */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-black text-[#292333] dark:text-white">
                  الجلسات النشطة حالياً ({activeSessions.length})
                </h4>
                <input
                  type="text"
                  value={revokeReasonInput}
                  onChange={(e) => setRevokeReasonInput(e.target.value)}
                  placeholder="سبب السحب الفوري (اختياري)..."
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-[#E2E8F0] text-xs min-w-[220px]"
                />
              </div>

              {activeSessions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] text-xs text-[#64748B]">
                  لا توجد جلسات خادم مسجلة في الذاكرة الحالية سوى جلستك أو جلسات قيد الفتح.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeSessions.map((sess) => (
                    <div
                      key={sess.sessionPrefix + sess.email}
                      className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-[#292333] dark:text-white">{sess.fullName}</span>
                          <span dir="ltr" className="font-mono text-[#62339A] dark:text-[#A34FE8]">{sess.email}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#F7F5FA] text-[#4A2378] font-black text-[10px]">
                            {sess.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#64748B]" dir="ltr">
                          {sess.authKind} · {sess.sessionPrefix}
                        </div>
                      </div>
                      {sess.role !== 'owner' && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleServerRevokeAccess(sess.email, sess.uid)}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>إلغاء الجلسة وسحب الصلاحية فوراً</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revoked Subjects */}
            {revokedSubjects.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-black text-rose-700 dark:text-rose-300">
                  الحسابات الموقوفة ومسحوبة الصلاحية ({revokedSubjects.length})
                </h4>
                <div className="space-y-2">
                  {revokedSubjects.map((rev) => (
                    <div
                      key={rev.subject}
                      className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span dir="ltr" className="font-mono font-black text-rose-900 dark:text-rose-200">
                          {rev.subject}
                        </span>
                        <p className="text-[11px] text-rose-700 dark:text-rose-300">{rev.reason}</p>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleServerRestoreAccess(rev.subject)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#292333] border border-emerald-300 text-emerald-700 dark:text-emerald-300 font-black flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إعادة إتاحة الحساب</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
