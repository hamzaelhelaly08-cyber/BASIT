import type { FaydRole } from './faydEcosystem';

/**
 * 10 Configurable Canonical Roles across BASIT | باسط Platform
 */
export type CanonicalRole =
  | 'super_admin'
  | 'platform_admin'
  | 'client_owner'
  | 'client_manager'
  | 'client_employee'
  | 'kitchen_owner'
  | 'kitchen_manager'
  | 'kitchen_staff'
  | 'finance_manager'
  | 'customer';

export const ALL_CANONICAL_ROLES: CanonicalRole[] = [
  'super_admin',
  'platform_admin',
  'client_owner',
  'client_manager',
  'client_employee',
  'kitchen_owner',
  'kitchen_manager',
  'kitchen_staff',
  'finance_manager',
  'customer',
];

export type PermissionKey =
  | 'platform:approve_entities'
  | 'platform:manage_users'
  | 'platform:manage_roles'
  | 'platform:manage_offers_cms'
  | 'platform:view_audit_logs'
  | 'platform:manage_orders'
  | 'entity:manage_profile'
  | 'entity:invite_employees'
  | 'entity:assign_member_permissions'
  | 'entity:place_orders'
  | 'entity:view_orders'
  | 'kitchen:manage_menu'
  | 'kitchen:manage_orders'
  | 'kitchen:manage_staff'
  | 'finance:view_reports'
  | 'finance:manage_settlements'
  | 'customer:browse_and_order';

export interface PermissionMetadata {
  key: PermissionKey;
  group: 'platform' | 'entity' | 'kitchen' | 'finance' | 'customer';
  labelAr: string;
  labelEn: string;
}

export const ALL_PERMISSION_METADATA: PermissionMetadata[] = [
  {
    key: 'platform:approve_entities',
    group: 'platform',
    labelAr: 'اعتماد الشركات والمطابخ المركزية',
    labelEn: 'Approve Companies & Central Kitchens',
  },
  {
    key: 'platform:manage_users',
    group: 'platform',
    labelAr: 'إدارة المستخدمين وتجميد/تفعيل الحسابات',
    labelEn: 'Manage Users & Suspend/Activate',
  },
  {
    key: 'platform:manage_roles',
    group: 'platform',
    labelAr: 'تعديل مصفوفة الأدوار والصلاحيات',
    labelEn: 'Configure Roles & Permission Matrix',
  },
  {
    key: 'platform:manage_offers_cms',
    group: 'platform',
    labelAr: 'إدارة العروض والخصومات والهوية',
    labelEn: 'Manage Offers, Discounts & Identity',
  },
  {
    key: 'platform:view_audit_logs',
    group: 'platform',
    labelAr: 'مراجعة سجل التدقيق غير القابل للتعديل',
    labelEn: 'View Immutable Audit Logs',
  },
  {
    key: 'platform:manage_orders',
    group: 'platform',
    labelAr: 'الرقابة على الطلبات والشكاوى والتقييمات',
    labelEn: 'Track All Orders & Complaints',
  },
  {
    key: 'entity:manage_profile',
    group: 'entity',
    labelAr: 'إدارة ملف الشركة/المصنع والعقود',
    labelEn: 'Manage Company/Factory Profile & Contracts',
  },
  {
    key: 'entity:invite_employees',
    group: 'entity',
    labelAr: 'دعوة وإضافة موظفي الكيان',
    labelEn: 'Invite Entity Employees',
  },
  {
    key: 'entity:assign_member_permissions',
    group: 'entity',
    labelAr: 'تعيين صلاحيات الموظفين داخل الكيان',
    labelEn: 'Assign Member Permissions in Entity',
  },
  {
    key: 'entity:place_orders',
    group: 'entity',
    labelAr: 'إنشاء طلبات الإعاشة والوجبات للكيان',
    labelEn: 'Place Entity Catering Orders',
  },
  {
    key: 'entity:view_orders',
    group: 'entity',
    labelAr: 'عرض طلبات وتقارير الكيان فقط',
    labelEn: 'View Scoped Entity Orders',
  },
  {
    key: 'kitchen:manage_menu',
    group: 'kitchen',
    labelAr: 'إدارة منيو وأسعار المطبخ المركزي',
    labelEn: 'Manage Central Kitchen Menu & Pricing',
  },
  {
    key: 'kitchen:manage_orders',
    group: 'kitchen',
    labelAr: 'تنفيذ وتحديث طلبات المطبخ المركزي فقط',
    labelEn: 'Manage Central Kitchen Orders',
  },
  {
    key: 'kitchen:manage_staff',
    group: 'kitchen',
    labelAr: 'دعوة وتحديد صلاحيات طاقم المطبخ',
    labelEn: 'Manage Central Kitchen Staff',
  },
  {
    key: 'finance:view_reports',
    group: 'finance',
    labelAr: 'عرض الفواتير والتقارير المالية المعزولة',
    labelEn: 'View Isolated Financial Reports',
  },
  {
    key: 'finance:manage_settlements',
    group: 'finance',
    labelAr: 'مراجعة التسويات المالية والعمولات',
    labelEn: 'Manage Ledger Settlements',
  },
  {
    key: 'customer:browse_and_order',
    group: 'customer',
    labelAr: 'تصفح العروض والطلب الشخصي',
    labelEn: 'Browse, Order & Review',
  },
];

export interface CanonicalRoleDescriptor {
  role: CanonicalRole;
  labelAr: string;
  labelEn: string;
  scopeAr: string;
  scopeEn: string;
  tier: 'platform' | 'client' | 'kitchen' | 'finance' | 'customer';
}

export const CANONICAL_ROLE_META: Record<CanonicalRole, CanonicalRoleDescriptor> = {
  super_admin: {
    role: 'super_admin',
    labelAr: 'مدير النظام الأعلى (Super Admin)',
    labelEn: 'Super Admin (Owner)',
    scopeAr: 'تحكم كامل في المنصة والأدوار وتجميد الحسابات وسجل التدقيق',
    scopeEn: 'Full platform governance, RBAC matrix, session revocation & audit logs',
    tier: 'platform',
  },
  platform_admin: {
    role: 'platform_admin',
    labelAr: 'مدير المنصة (Platform Admin)',
    labelEn: 'Platform Admin',
    scopeAr: 'اعتماد الشركات والمطابخ، إدارة المستخدمين، الطلبات والشكاوى والعروض',
    scopeEn: 'Approve companies & kitchens, manage users, orders, complaints & offers',
    tier: 'platform',
  },
  client_owner: {
    role: 'client_owner',
    labelAr: 'مالك الشركة / المصنع (Client Owner)',
    labelEn: 'Client Owner',
    scopeAr: 'ملكية الكيان، إدارة العقود، دعوة وتعيين مدير/موظفي الشركة فقط',
    scopeEn: 'Entity ownership, contracts, inviting & scoping company managers/staff',
    tier: 'client',
  },
  client_manager: {
    role: 'client_manager',
    labelAr: 'مدير الشركة / المصنع (Client Manager)',
    labelEn: 'Client Manager',
    scopeAr: 'تشغيل طلبات الشركة ودعوة الموظفين ومتابعة العقود المعتمدة فقط',
    scopeEn: 'Company operations, employee permissions & contracted kitchen orders only',
    tier: 'client',
  },
  client_employee: {
    role: 'client_employee',
    labelAr: 'موظف الشركة (Client Employee)',
    labelEn: 'Client Employee',
    scopeAr: 'طلب الوجبات والمزايا المصرح بها ضمن عقد شركته فقط',
    scopeEn: 'Scoped meal & benefit ordering strictly inside employer contract',
    tier: 'client',
  },
  kitchen_owner: {
    role: 'kitchen_owner',
    labelAr: 'مالك المطبخ المركزي (Kitchen Owner)',
    labelEn: 'Kitchen Owner',
    scopeAr: 'إدارة المطبخ المركزي، القوائم، الطاقم، والعقود المرتبطة به فقط',
    scopeEn: 'Central kitchen ownership, menu pricing, staff & active client contracts',
    tier: 'kitchen',
  },
  kitchen_manager: {
    role: 'kitchen_manager',
    labelAr: 'مدير المطبخ المركزي (Kitchen Manager)',
    labelEn: 'Kitchen Manager',
    scopeAr: 'تشغيل الطلبات اليومية، جودة HACCP، وتعيين صلاحيات طاقم المطبخ',
    scopeEn: 'Daily kitchen production, HACCP quality & kitchen staff permissions',
    tier: 'kitchen',
  },
  kitchen_staff: {
    role: 'kitchen_staff',
    labelAr: 'طاقم المطبخ المركزي (Kitchen Staff)',
    labelEn: 'Kitchen Staff',
    scopeAr: 'تحضير وتحديث حالات طلبات مطبخه المصرح بها فقط',
    scopeEn: 'Order prep & status execution scoped strictly to assigned kitchen',
    tier: 'kitchen',
  },
  finance_manager: {
    role: 'finance_manager',
    labelAr: 'المدير المالي (Finance Manager)',
    labelEn: 'Finance Manager',
    scopeAr: 'مراجعة التقارير والتسويات المالية ضمن عزل إداري تام',
    scopeEn: 'Isolated financial audit & settlement visibility (no admin controls)',
    tier: 'finance',
  },
  customer: {
    role: 'customer',
    labelAr: 'العميل العادي (Customer)',
    labelEn: 'Customer',
    scopeAr: 'التصفح، الطلب الشخصي، العروض، والمفضلة ضمن حسابه فقط',
    scopeEn: 'Standard browsing, ordering, offers & favorites in own account',
    tier: 'customer',
  },
};

export type RolePermissionMatrix = Record<CanonicalRole, PermissionKey[]>;

export const DEFAULT_ROLE_PERMISSION_MATRIX: RolePermissionMatrix = {
  super_admin: ALL_PERMISSION_METADATA.map((p) => p.key),
  platform_admin: [
    'platform:approve_entities',
    'platform:manage_users',
    'platform:manage_offers_cms',
    'platform:view_audit_logs',
    'platform:manage_orders',
    'entity:view_orders',
    'kitchen:manage_orders',
    'finance:view_reports',
    'customer:browse_and_order',
  ],
  client_owner: [
    'entity:manage_profile',
    'entity:invite_employees',
    'entity:assign_member_permissions',
    'entity:place_orders',
    'entity:view_orders',
    'finance:view_reports',
    'customer:browse_and_order',
  ],
  client_manager: [
    'entity:invite_employees',
    'entity:assign_member_permissions',
    'entity:place_orders',
    'entity:view_orders',
    'customer:browse_and_order',
  ],
  client_employee: [
    'entity:place_orders',
    'entity:view_orders',
    'customer:browse_and_order',
  ],
  kitchen_owner: [
    'kitchen:manage_menu',
    'kitchen:manage_orders',
    'kitchen:manage_staff',
    'entity:manage_profile',
    'entity:invite_employees',
    'entity:assign_member_permissions',
    'finance:view_reports',
    'customer:browse_and_order',
  ],
  kitchen_manager: [
    'kitchen:manage_menu',
    'kitchen:manage_orders',
    'kitchen:manage_staff',
    'entity:invite_employees',
    'entity:assign_member_permissions',
    'customer:browse_and_order',
  ],
  kitchen_staff: [
    'kitchen:manage_orders',
    'customer:browse_and_order',
  ],
  finance_manager: [
    'finance:view_reports',
    'finance:manage_settlements',
  ],
  customer: [
    'customer:browse_and_order',
  ],
};

export function toCanonicalRole(
  role?: string | null,
  entityType?: string | null
): CanonicalRole {
  const r = String(role || '').trim().toLowerCase();
  switch (r) {
    case 'super_admin':
    case 'central_super_admin':
    case 'owner':
      return 'super_admin';
    case 'platform_admin':
    case 'central_admin':
    case 'basit_admin':
    case 'system_admin':
      return 'platform_admin';
    case 'client_owner':
      return 'client_owner';
    case 'client_manager':
    case 'entity_admin':
      return 'client_manager';
    case 'client_employee':
    case 'employee':
      return 'client_employee';
    case 'kitchen_owner':
    case 'kitchen_partner':
      return 'kitchen_owner';
    case 'kitchen_manager':
      return 'kitchen_manager';
    case 'kitchen_staff':
      return 'kitchen_staff';
    case 'merchant_owner':
      return entityType === 'central_kitchen' ? 'kitchen_owner' : 'client_owner';
    case 'merchant_staff':
      return entityType === 'central_kitchen' ? 'kitchen_staff' : 'client_employee';
    case 'finance_manager':
    case 'finance_admin':
      return 'finance_manager';
    case 'customer':
    case 'visitor':
    default:
      return 'customer';
  }
}

export function toLegacyFaydRole(canonical: CanonicalRole): FaydRole {
  switch (canonical) {
    case 'super_admin':
      return 'central_super_admin';
    case 'platform_admin':
      return 'central_admin';
    case 'client_owner':
      return 'entity_admin';
    case 'client_manager':
      return 'entity_admin';
    case 'client_employee':
      return 'employee';
    case 'kitchen_owner':
      return 'kitchen_partner';
    case 'kitchen_manager':
      return 'kitchen_partner';
    case 'kitchen_staff':
      return 'merchant_staff';
    case 'finance_manager':
      return 'finance_admin';
    case 'customer':
    default:
      return 'customer';
  }
}

export function hasEffectivePermission(
  matrix: RolePermissionMatrix,
  role: CanonicalRole,
  customPermissions: PermissionKey[] | undefined,
  required: PermissionKey
): boolean {
  if (role === 'super_admin') return true;
  if (customPermissions && customPermissions.length > 0) {
    return customPermissions.includes(required);
  }
  const rolePerms = matrix[role] || DEFAULT_ROLE_PERMISSION_MATRIX[role] || [];
  return rolePerms.includes(required);
}

export function sanitizeRoleMatrix(
  candidate: Partial<Record<CanonicalRole, PermissionKey[]>>
): RolePermissionMatrix {
  const validKeys = new Set<PermissionKey>(ALL_PERMISSION_METADATA.map((p) => p.key));
  const next: RolePermissionMatrix = { ...DEFAULT_ROLE_PERMISSION_MATRIX };

  for (const role of ALL_CANONICAL_ROLES) {
    if (role === 'super_admin') {
      // Super admin retains full baseline permissions unconditionally
      next.super_admin = [...DEFAULT_ROLE_PERMISSION_MATRIX.super_admin];
      continue;
    }
    const incomingList = candidate[role];
    if (Array.isArray(incomingList)) {
      next[role] = Array.from(
        new Set(incomingList.filter((k): k is PermissionKey => validKeys.has(k)))
      );
    } else {
      next[role] = [...DEFAULT_ROLE_PERMISSION_MATRIX[role]];
    }
  }
  return next;
}

export interface ExecutiveAccountSpec {
  uid: string;
  username: string;
  usernameAliases: string[];
  email: string;
  phone: string;
  fullNameAr: string;
  fullNameEn: string;
  canonicalRole: CanonicalRole;
  employeeCode?: string;
  tenantId: string;
  canApproveHabe: boolean;
  envInitialPasswordKey: string;
}

export const EXECUTIVE_ACCOUNTS: ExecutiveAccountSpec[] = [
  {
    uid: 'server_owner_hamza',
    username: 'hamza',
    usernameAliases: ['@hamza', 'hamza.elhelaly'],
    email: 'hamzaelhelaly08@gmail.com',
    phone: '',
    fullNameAr: 'حمزة الهلالي',
    fullNameEn: 'Hamza Elhelaly',
    canonicalRole: 'super_admin',
    tenantId: '',
    canApproveHabe: true,
    envInitialPasswordKey: 'ADMIN_HAMZA_INITIAL_PASSWORD',
  },
  {
    uid: 'exec_ahmed_adly',
    username: 'ahmed.adly',
    usernameAliases: ['@ahmed.adly', 'ahmed_adly', 'hb-024'],
    email: 'ahmed.adly@basit-catering.local',
    phone: '+201274799290',
    fullNameAr: 'معتمد رواتب وإدارة H-A-B-E',
    fullNameEn: 'H-A-B-E HR & Payroll Approver',
    canonicalRole: 'client_owner',
    employeeCode: 'HB-024',
    tenantId: 'tenant_client_habe',
    canApproveHabe: true,
    envInitialPasswordKey: 'ADMIN_ADLY_INITIAL_PASSWORD',
  },
  {
    uid: 'exec_ahmed_wahid',
    username: 'ahmed.wahid',
    usernameAliases: ['@ahmed.wahid', 'ahmed.wahed', '@ahmed.wahed', 'ahmed_wahid', 'hb-025'],
    email: 'ahmed.wahid@basit-catering.local',
    phone: '+201103611414',
    fullNameAr: 'معتمد رواتب وإدارة H-A-B-E',
    fullNameEn: 'H-A-B-E HR & Payroll Approver',
    canonicalRole: 'client_owner',
    employeeCode: 'HB-025',
    tenantId: 'tenant_client_habe',
    canApproveHabe: true,
    envInitialPasswordKey: 'ADMIN_WAHID_INITIAL_PASSWORD',
  },
];

export const EXECUTIVE_HABE_APPROVER_EMAILS = EXECUTIVE_ACCOUNTS.filter((e) => e.canApproveHabe).map(
  (e) => e.email.toLowerCase()
);

