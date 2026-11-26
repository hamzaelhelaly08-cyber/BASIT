export type UserRole = 
  | 'ops_director'       // مهندس مصطفى شعبان - مدير العمليات (المسؤول الأعلى - صلاحيات كاملة 100%)
  | 'cfo_accountant'     // عبد المجيد الرخاوي - المدير المالي (حساب مستقل للوحدات المالية المعتمدة)
  | 'client_manager'     // مدير ومسؤول العميل المتعاقد
  | 'client_employee'    // موظف العميل المتعاقد
  | 'public_visitor';    // الزوار والمستخدمون العامون (دخول زائر)

export interface RoleProfile {
  id: UserRole;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  username: string;
  avatarText: string;
  badgeColor: string;
  descriptionAr: string;
  allowedModules: string[];
  canManageUsers?: boolean;
  canApproveContracts?: boolean;
  canAccessVault?: boolean;
}

export type ModuleCategory = 
  | 'all'
  | 'kitchens_ops'     // العمليات والمطابخ
  | 'clients_contracts' // العملاء والتعاقدات
  | 'quality_hygiene'   // الجودة والهايجين
  | 'finance_procure'   // المالية والمخزون
  | 'commercial_season' // المواسم والتسويق
  | 'admin_governance'; // الإدارة والحوكمة

export interface AdminModule {
  id: string;
  number: number;
  titleAr: string;
  titleEn: string;
  category: ModuleCategory;
  categoryNameAr: string;
  categoryNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  kpiPrimary: {
    value: string;
    labelAr: string;
    labelEn: string;
  };
  kpiSecondary?: {
    value: string;
    labelAr: string;
    labelEn: string;
  };
  statusBadge: {
    textAr: string;
    textEn: string;
    variant: 'success' | 'warning' | 'info' | 'neutral';
  };
  allowedRoles: UserRole[];
  quickActionAr: string;
  quickActionEn: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  moduleName: string;
  actionAr: string;
  actionEn: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

// Multi-tenant Customer Portal Data Model
export type ClientServiceType = 'catering' | 'market' | 'hybrid';

export interface ClientTenant {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  serviceType: ClientServiceType;
  industry: string;
  locationAr: string;
  dailyMeals?: number;
  contractStatus: 'active' | 'pending_renewal' | 'expired';
  contractStartDate: string;
  contractEndDate: string;
  hasActiveAnnualContract: boolean;
  contractDiscountRate: number; // e.g. 10%
  authorizedContact: string;
  contactPhone: string;
  contactEmail: string;
  menuTiers: string[];
  marketCategories?: string[];
  marketItemsCount?: number;
  activeOrdersToday: number;
  openComplaintsCount: number;
  complianceScore: number;
  logoUrl?: string;
}

// Contract Opportunity & Pipeline Models
export type OpportunityStatus = 
  | 'فرصة جديدة'
  | 'تم التواصل'
  | 'عرض مرسل'
  | 'تفاوض'
  | 'انتظار رد'
  | 'تم القبول'
  | 'تم القبول — تم تحويله إلى عميل'
  | 'مرفوض';

export interface ContractOpportunity {
  id: string;
  projectName: string;
  clientName: string;
  industry: string;
  serviceType: ClientServiceType;
  location: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  description: string;
  expectedContractSize: string;
  createdAt: string;
  followUpDate: string;
  status: OpportunityStatus;
  statusColor?: string;
  nextAction: string;
  notes: string;
  attachments: string[];
  convertedClientId?: string;
  convertedAt?: string;
}

// Account Registration Request Model (Section 3: Create New Account)
export interface AccountRegistrationRequest {
  id: string;
  fullName: string;
  companyName: string;
  jobTitle: string;
  workEmail: string;
  phone: string;
  companyAddress: string;
  city: string;
  industryType: string;
  requestReason: string;
  contactLiaison: string;
  attachedDocName?: string;
  privacyAgreed: boolean;
  status: 'بانتظار المراجعة' | 'تمت الموافقة والتفعيل' | 'مرفوض' | 'طلب استكمال بيانات';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  tempPasswordIssued?: string;
}

// Official Document Vault Model (Section 7: Official Document Vault)
export type VaultCategory = 
  | 'commercial_registry' 
  | 'vat_tax_card' 
  | 'exporter_card' 
  | 'tax_return' 
  | 'health_license' 
  | 'iso_haccp_cert' 
  | 'other';

export interface VaultDocument {
  id: string;
  slotNumber: number;
  titleAr: string;
  titleEn: string;
  category: VaultCategory;
  categoryNameAr: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  pageCount: number;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'jpeg';
  reviewStatus: 'معتمد ومفهرس' | 'بانتظار الفحص والمراجعة' | 'يحتاج مراجعة وتحديث';
  thumbnailUrl?: string;
  ocrExtractedText?: string;
  ocrConfidence?: number;
  ocrNeedsReview?: boolean;
  tags: string[];
  changeLog: { timestamp: string; user: string; action: string }[];
  isProtected?: boolean;
  secureShareLinks?: { id: string; expiresAt: string; token: string; revoked: boolean }[];
}

// Request TEST Sample Model
export interface TestSampleRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  mealType: string;
  sampleCount: number;
  industryType: string;
  proposedDate: string;
  notes: string;
  status: 'جديد — بانتظار المراجعة' | 'تمت الموافقة وتحديد الموعد' | 'قيد التجهيز بالمطبخ' | 'تم التسليم للتذوق' | 'مرفوض';
  scheduledTastingDate?: string;
  assignedKitchenId?: string;
  createdAt: string;
}

// Custom Menu Proposal Model
export interface CustomMenuProposal {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  dishName: string;
  ingredients: string;
  portionGramWeight: string;
  serviceType: string;
  expectedDailyVolume: number;
  nutritionNotes?: string;
  status: 'قيد مراجعة الشيف والتسعير' | 'تم إعداد عرض السعر المعتمد' | 'تم الإرسال للعميل' | 'معتمد بالعقد';
  approvedPublicPriceEGP?: number;
  internalCostBOM?: number;
  createdAt: string;
}

// Support Ticket Model
export interface SupportTicket {
  id: string;
  clientName: string;
  contactPhone: string;
  subject: string;
  category: 'جودة الوجبة' | 'موعد التوريد' | 'طلب عينة' | 'استفسار فاتورة' | 'خدمة الكنتين' | 'دعم فني عام';
  message: string;
  status: 'مفتوحة — قيد المتابعة' | 'تم الرد' | 'تم الحل والإغلاق';
  priority: 'عادي' | 'عاجل' | 'طارئ';
  adminResponse?: string;
  createdAt: string;
}

// Printable Document Models
export type PrintableDocType = 
  | 'quotation' 
  | 'test_sample' 
  | 'haccp_certificate' 
  | 'operations_order'
  | 'menu_catalog'
  | 'charity_delegation';

export interface PrintableDocData {
  type: PrintableDocType;
  titleAr: string;
  documentNumber: string;
  issueDate: string;
  recipientName: string;
  recipientOrg: string;
  recipientLocation: string;
  items: {
    description: string;
    portionSpec?: string;
    quantity: number | string;
    unitPrice?: number | string;
    totalPrice?: number | string;
  }[];
  notes: string[];
  preparedBy: string;
  approvedBy: string;
  qrCodeText?: string;
}
