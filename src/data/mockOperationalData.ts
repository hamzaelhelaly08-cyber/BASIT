import { 
  AdminModule, 
  RoleProfile, 
  AuditLogEntry, 
  UserRole,
  ClientTenant,
  ContractOpportunity,
  TestSampleRequest,
  CustomMenuProposal,
  SupportTicket,
  PrintableDocData
} from '../types/dashboard';

// Official High-Resolution Catering Egypt Pyramidal Emblem
export const CATERING_EGYPT_LOGO = '/basit-official-logo.png';

// RBAC Role Profiles - Section 5 Compliance
export const USER_ROLES: RoleProfile[] = [
  {
    id: 'ops_director',
    nameAr: 'م/ مصطفى شعبان',
    nameEn: 'Eng. Mostafa Shaaban',
    titleAr: 'مدير العمليات المركزية (المسؤول الأعلى للنظام)',
    titleEn: 'Chief Operations Officer (Supreme Admin)',
    username: 'mostafa.shaaban',
    avatarText: 'MS',
    badgeColor: 'bg-[#62339A] text-white',
    descriptionAr: 'المسؤول الأعلى عن التطبيق - الصلاحيات الكاملة بنسبة 100% في الموافقة على تسجيل الحسابات، إنشاء وتفعيل وإيقاف المستخدمين، إدارة الصلاحيات، التحكم في فتح وإغلاق الوحدات، الحافظة الرسمية للمستندات، وإعدادات الأمان.',
    canManageUsers: true,
    canApproveContracts: true,
    canAccessVault: true,
    allowedModules: [
      'central_kitchens', 'active_sites', 'pending_contracts', 'client_directory',
      'contracts_mgmt', 'staff_mgmt', 'menus_recipes', 'offers_updates',
      'coupons_cashback', 'inventory_procurement', 'financials_ledger', 'billing_collections',
      'complaints_mgmt', 'quality_assurance', 'hygiene_food_safety', 'reports_analytics',
      'users_permissions', 'internal_comms', 'seasonal_campaigns', 'enterprise_settings'
    ]
  },
  {
    id: 'cfo_accountant',
    nameAr: 'أ/ عبد المجيد الرخاوي',
    nameEn: 'Abdelmegid El Rakhawy',
    titleAr: 'المدير المالي ورئيس الحسابات',
    titleEn: 'Chief Financial Officer (Finance & Accounts)',
    username: 'abdelmegid.rakhawy',
    avatarText: 'AR',
    badgeColor: 'bg-purple-600 text-white',
    descriptionAr: 'حساب مستقل للاطلاع على الوحدات المالية المصرح بها، مراجعة التقارير المالية، متابعة الحسابات والفواتير والمدفوعات والمخزون، دون صلاحية تغيير إعدادات الأمان أو إدارة صلاحيات المدير الأعلى.',
    canManageUsers: false,
    canApproveContracts: false,
    canAccessVault: false,
    allowedModules: [
      'contracts_mgmt', 'inventory_procurement', 'financials_ledger', 'billing_collections',
      'reports_analytics', 'coupons_cashback'
    ]
  },
  {
    id: 'client_manager',
    nameAr: 'مدير العميل (مستشفى رويال / الألمانية / هابي ماركت)',
    nameEn: 'Client Institutional Manager',
    titleAr: 'مسؤول التعاقد وإدارة الموقع التابع للمؤسسة',
    titleEn: 'Client Facility Manager',
    username: 'client.manager',
    avatarText: 'CM',
    badgeColor: 'bg-blue-600 text-white',
    descriptionAr: 'بوابة العميل المستقلة - يرى فقط بيانات منشأته، منيوهات الموقع، متابعة الوجبات والطلبات، تقديم الشكاوى، والاستفادة من عروض العقد السنوي.',
    canManageUsers: false,
    canApproveContracts: false,
    canAccessVault: false,
    allowedModules: [
      'active_sites', 'menus_recipes', 'offers_updates', 'coupons_cashback',
      'complaints_mgmt', 'internal_comms'
    ]
  },
  {
    id: 'client_employee',
    nameAr: 'موظف العميل المتعاقد',
    nameEn: 'Contracted Site Employee',
    titleAr: 'موظف مستفيد من وجبات الموقع والكنتين',
    titleEn: 'Site Beneficiary Employee',
    username: 'site.employee',
    avatarText: 'EMP',
    badgeColor: 'bg-slate-600 text-white',
    descriptionAr: 'حساب موظف تابع للموقع - استعراض منيو اليوم، طلب الوجبات المصرح بها، عروض الكنتين، الكوبونات المصرحة، وتقديم الاقتراحات والشكاوى الشخصية.',
    canManageUsers: false,
    canApproveContracts: false,
    canAccessVault: false,
    allowedModules: [
      'menus_recipes', 'offers_updates', 'coupons_cashback', 'complaints_mgmt'
    ]
  },
  {
    id: 'public_visitor',
    nameAr: 'زائر المنظومة (دخول زائر)',
    nameEn: 'Guest Visitor (Public Access)',
    titleAr: 'تصفح خدمات وتوريدات كاترينج مصر العامة',
    titleEn: 'Guest Public Portal',
    username: 'guest',
    avatarText: 'GST',
    badgeColor: 'bg-[#62339A] text-white',
    descriptionAr: 'دخول حر للزائرين دون حساب - استعراض المينيوهات، عروض الوجبات، طلب عرض سعر، طلب عينة TEST، واقتراح منيو مخصص دون الوصول للبيانات الخاصة.',
    canManageUsers: false,
    canApproveContracts: false,
    canAccessVault: false,
    allowedModules: []
  }
];

// Initial Registration Requests (Section 3: Create New Account)
export const INITIAL_REGISTRATION_REQUESTS = [
  {
    id: 'REG-2026-081',
    fullName: 'م/ عصام عبد الشافي',
    companyName: 'شركة النصر لصناعة السيارات (NASCO)',
    jobTitle: 'مدير الخدمات الإدارية والموارد البشرية',
    workEmail: 'e.shafi@nasco-auto.eg',
    phone: '01011229988',
    companyAddress: 'وادي حوف — حلوان',
    city: 'القاهرة',
    industryType: 'صناعة السيارات وتجميع الآلات',
    requestReason: 'طلب حساب تعاقدي لتوريد وجبات لـ 1,800 عامل بـ 3 ورديات يومياً وإدارة كنتين المصنع.',
    contactLiaison: 'م/ عصام عبد الشافي',
    attachedDocName: 'السجل_التجاري_شركة_النصر.pdf',
    privacyAgreed: true,
    status: 'بانتظار المراجعة' as const,
    createdAt: '2026-11-11 08:15'
  },
  {
    id: 'REG-2026-080',
    fullName: 'د/ لمياء رضوان',
    companyName: 'مستشفى الأندلسية التخصصي',
    jobTitle: 'رئيس قسم التغذية العلاجية وإعاشة المرضى',
    workEmail: 'dietetics@andalusia-med.com',
    phone: '01122334455',
    companyAddress: 'المعادي الجديدة — شارع النصر',
    city: 'القاهرة',
    industryType: 'مستشفيات ورعاية صحية متقدمة',
    requestReason: 'تفعيل بوابة عميل لمتابعة وجبات التغذية السريرية وبوفيه الاستشاريين.',
    contactLiaison: 'د/ لمياء رضوان',
    attachedDocName: 'ترخيص_مستشفى_الاندلسية.pdf',
    privacyAgreed: true,
    status: 'تمت الموافقة والتفعيل' as const,
    createdAt: '2026-11-10 16:30',
    reviewedBy: 'م/ مصطفى شعبان',
    reviewedAt: '2026-11-10 17:45',
    tempPasswordIssued: 'Andalusia@2026'
  }
];

// Official Document Vault Initial Preconfigured Slots (Section 7.C)
export const INITIAL_VAULT_DOCUMENTS = [
  {
    id: 'doc_cr_page1',
    slotNumber: 1,
    titleAr: 'مستخرج السجل التجاري — الصفحة الأولى',
    titleEn: 'Commercial Registry Extract — Page 1',
    category: 'commercial_registry' as const,
    categoryNameAr: 'السجل التجاري',
    documentNumber: 'بانتظار فحص الأصل',
    issuingAuthority: 'مصلحة السجل التجاري — وزارة التموين والتجارة الداخلية',
    issueDate: 'بانتظار مراجعة الأصل',
    expiryDate: 'بانتظار مراجعة الأصل',
    pageCount: 1,
    fileName: 'سجل_تجاري_صفحة_1.pdf',
    fileSize: '1.8 MB',
    fileType: 'pdf' as const,
    reviewStatus: 'بانتظار الفحص والمراجعة' as const,
    auditNotes: 'خانة جاهزة لاستقبال المستند الأصلي فور رفعه من الإدارة واعتماد بياناته الرسمية.',
    ocrExtractedText: 'جمهورية مصر العربية — وزارة التموين والتجارة الداخلية — مصلحة السجل التجاري — كاترينج مصر للخدمات الغذائية وإعاشة الشركات (إحدى شركات الوطنية اللوجستية)...',
    ocrConfidence: 94,
    ocrNeedsReview: true,
    tags: ['سجل تجاري', 'رسمي', 'تأسيس', 'مصر'],
    changeLog: [
      { timestamp: '2026-11-11 08:00', user: 'م/ مصطفى شعبان', action: 'إنشاء وتخصيص خانة حفظ مستخرج السجل التجاري ص1' }
    ],
    isProtected: true
  },
  {
    id: 'doc_cr_page2',
    slotNumber: 2,
    titleAr: 'مستخرج السجل التجاري — الصفحة الثانية',
    titleEn: 'Commercial Registry Extract — Page 2',
    category: 'commercial_registry' as const,
    categoryNameAr: 'السجل التجاري',
    documentNumber: 'بانتظار فحص الأصل',
    issuingAuthority: 'مصلحة السجل التجاري — وزارة التموين والتجارة الداخلية',
    issueDate: 'بانتظار مراجعة الأصل',
    expiryDate: 'بانتظار مراجعة الأصل',
    pageCount: 1,
    fileName: 'سجل_تجاري_صفحة_2.pdf',
    fileSize: '1.6 MB',
    fileType: 'pdf' as const,
    reviewStatus: 'بانتظار الفحص والمراجعة' as const,
    auditNotes: 'تتضمن بيانات الشركاء ورأس المال والأنشطة والوكلاء التجاريين.',
    ocrExtractedText: 'تابع السجل التجاري — الغرض من الشركة: توريد الأغذية المطهية وغير المطهية وإدارة المطاعم والكنتين للمنشآت والمصانع...',
    ocrConfidence: 92,
    ocrNeedsReview: true,
    tags: ['سجل تجاري', 'ص2', 'صلاحيات'],
    changeLog: [
      { timestamp: '2026-11-11 08:00', user: 'م/ مصطفى شعبان', action: 'تخصيص خانة حفظ ص2 من السجل التجاري' }
    ],
    isProtected: true
  },
  {
    id: 'doc_vat_card',
    slotNumber: 3,
    titleAr: 'مستند ضريبة القيمة المضافة والتسجيل الضريبي',
    titleEn: 'VAT Registration & Tax Card Certificate',
    category: 'vat_tax_card' as const,
    categoryNameAr: 'التسجيل الضريبي',
    documentNumber: 'بانتظار فحص الأصل',
    issuingAuthority: 'وزارة المالية — مصلحة الضرائب المصرية',
    issueDate: 'بانتظار مراجعة الأصل',
    expiryDate: 'سارية',
    pageCount: 1,
    fileName: 'شهادة_التسجيل_الضريبي_VAT.pdf',
    fileSize: '1.2 MB',
    fileType: 'pdf' as const,
    reviewStatus: 'بانتظار الفحص والمراجعة' as const,
    auditNotes: 'شهادة التسجيل في ضريبة القيمة المضافة ومستند البطاقة الضريبية للمركز الرئيسي.',
    ocrExtractedText: 'مصلحة الضرائب المصرية — شهادة تسجيل مكلف بضريبة القيمة المضافة — كاترينج مصر...',
    ocrConfidence: 96,
    ocrNeedsReview: true,
    tags: ['ضرائب', 'قيمة مضافة', 'فاتورة إلكترونية'],
    changeLog: [
      { timestamp: '2026-11-11 08:00', user: 'م/ مصطفى شعبان', action: 'تجهيز خانة مستند القيمة المضافة' }
    ],
    isProtected: true
  },
  {
    id: 'doc_exporter_front',
    slotNumber: 4,
    titleAr: 'بطاقة قيد سجل المصدرين — الوجه الأول',
    titleEn: 'Exporter Registry Card — Front Face',
    category: 'exporter_card' as const,
    categoryNameAr: 'سجل المصدرين',
    documentNumber: 'بانتظار فحص الأصل',
    issuingAuthority: 'الهيئة العامة للرقابة على الصادرات والواردات (GOEIC)',
    issueDate: 'بانتظار مراجعة الأصل',
    expiryDate: 'بانتظار مراجعة الأصل',
    pageCount: 1,
    fileName: 'بطاقة_المصدرين_وجه.jpg',
    fileSize: '890 KB',
    fileType: 'jpg' as const,
    reviewStatus: 'بانتظار الفحص والمراجعة' as const,
    auditNotes: 'بطاقة قيد بسجل المصدرين صادرة عن الهيئة العامة للرقابة على الصادرات والواردات.',
    ocrExtractedText: 'جمهورية مصر العربية — وزارة التجارة والصناعة — الهيئة العامة للرقابة على الصادرات والواردات — بطاقة قيد بسجل المصدرين...',
    ocrConfidence: 95,
    ocrNeedsReview: true,
    tags: ['سجل المصدرين', 'تصدير', 'GOEIC'],
    changeLog: [
      { timestamp: '2026-11-11 08:00', user: 'م/ مصطفى شعبان', action: 'إنشاء خانة بطاقة المصدرين وجه' }
    ],
    isProtected: true
  },
  {
    id: 'doc_exporter_back',
    slotNumber: 5,
    titleAr: 'بطاقة قيد سجل المصدرين — الظهر',
    titleEn: 'Exporter Registry Card — Back Face',
    category: 'exporter_card' as const,
    categoryNameAr: 'سجل المصدرين',
    documentNumber: 'بانتظار فحص الأصل',
    issuingAuthority: 'الهيئة العامة للرقابة على الصادرات والواردات (GOEIC)',
    issueDate: 'بانتظار مراجعة الأصل',
    expiryDate: 'بانتظار مراجعة الأصل',
    pageCount: 1,
    fileName: 'بطاقة_المصدرين_ظهر.jpg',
    fileSize: '840 KB',
    fileType: 'jpg' as const,
    reviewStatus: 'بانتظار الفحص والمراجعة' as const,
    auditNotes: 'ظهر بطاقة قيد سجل المصدرين موضحاً المجموعات السلعية والجهات الرقابية.',
    ocrExtractedText: 'المجموعات السلعية المصرح بتصديرها — التجديدات والتأشيرات الرسمية...',
    ocrConfidence: 91,
    ocrNeedsReview: true,
    tags: ['سجل المصدرين', 'ظهر', 'مجموعات سلعية'],
    changeLog: [
      { timestamp: '2026-11-11 08:00', user: 'م/ مصطفى شعبان', action: 'إنشاء خانة بطاقة المصدرين ظهر' }
    ],
    isProtected: true
  },
  {
    id: 'doc_tax_return',
    slotNumber: 6,
    titleAr: 'المستند الضريبي الإضافي أو الإقرار/النموذج',
    titleEn: 'Additional Tax Declaration / Official Form',
    category: 'tax_return' as const,
    categoryNameAr: 'الإقرارات الضريبية',
    documentNumber: 'بانتظار فحص الأصل',
    issuingAuthority: 'مصلحة الضرائب المصرية',
    issueDate: 'بانتظار مراجعة الأصل',
    expiryDate: 'ساري',
    pageCount: 1,
    fileName: 'المستند_الضريبي_الاضافي.pdf',
    fileSize: '1.4 MB',
    fileType: 'pdf' as const,
    reviewStatus: 'بانتظار الفحص والمراجعة' as const,
    auditNotes: 'خانة مخصصة لاستقبال الإقرار أو النموذج الضريبي الإضافي فور إرفاقه من الإدارة.',
    ocrExtractedText: 'مصلحة الضرائب المصرية — الإقرار الضريبي الرسمي المعتمد...',
    ocrConfidence: 90,
    ocrNeedsReview: true,
    tags: ['إقرار ضريبي', 'نموذج رسمي'],
    changeLog: [
      { timestamp: '2026-11-11 08:00', user: 'م/ مصطفى شعبان', action: 'تخصيص خانة الإقرار الضريبي الإضافي' }
    ],
    isProtected: true
  },
  {
    id: 'doc_health_license',
    slotNumber: 7,
    titleAr: 'تراخيص المنشأة وشهادات سلامة الغذاء HACCP',
    titleEn: 'Facility Health License & HACCP Food Safety Certs',
    category: 'health_license' as const,
    categoryNameAr: 'التراخيص الصحية',
    documentNumber: 'بانتظار فحص الأصل',
    issuingAuthority: 'الهيئة القومية لسلامة الغذاء (NFSA) والطب الوقائي',
    issueDate: 'بانتظار مراجعة الأصل',
    expiryDate: 'سارية',
    pageCount: 1,
    fileName: 'ترخيص_تشغيل_المطابخ_المركزية.pdf',
    fileSize: '2.1 MB',
    fileType: 'pdf' as const,
    reviewStatus: 'بانتظار الفحص والمراجعة' as const,
    auditNotes: 'تراخيص تشغيل المطابخ المركزية (مطبخ ومركز العين ببدر، هنجر ستيشن بأرض المعارض بمدينة نصر، ومطبخ بيت العيلة).',
    ocrExtractedText: 'الهيئة القومية لسلامة الغذاء — ترخيص تشغيل مطبخ مركزي لإعداد وتجهيز الوجبات الغذائية...',
    ocrConfidence: 97,
    ocrNeedsReview: true,
    tags: ['سلامة الغذاء', 'تراخيص', 'HACCP'],
    changeLog: [
      { timestamp: '2026-11-11 08:00', user: 'م/ مصطفى شعبان', action: 'تجهيز خانة التراخيص الصحية والشهادات' }
    ],
    isProtected: true
  }
];

// Multi-Tenant Customer Directory ("Application Inside Application") - Section 6
export const INITIAL_CLIENT_TENANTS: ClientTenant[] = [
  {
    id: 'site_royal',
    code: 'ROYAL-MED',
    nameAr: 'مستشفى رويال الدولي',
    nameEn: 'Royal International Hospital',
    serviceType: 'catering',
    industry: 'قطاع المستشفيات والرعاية الطبية الفاخرة',
    locationAr: 'القاهرة الجديدة — التجمع الخامس',
    dailyMeals: 1450,
    contractStatus: 'active',
    contractStartDate: '2026-01-01',
    contractEndDate: '2026-12-31',
    hasActiveAnnualContract: true,
    contractDiscountRate: 10,
    authorizedContact: 'د/ شريف عثمان (مدير الخدمات الطبية)',
    contactPhone: '01012345671',
    contactEmail: 'services@royalhospital.eg',
    menuTiers: [
      'وجبات اعتيادية للطاقم الطبي والتمريض',
      'وجبات علاجية لمرضى السكر والضغط والكلى',
      'وجبات جافة معقمة لغرف الرعاية والطوارئ',
      'بوفيه مفتوح للاستشاريين وكبار الزوار'
    ],
    activeOrdersToday: 42,
    openComplaintsCount: 1,
    complianceScore: 99.8
  },
  {
    id: 'site_german_cement',
    code: 'GERMAN-CEM',
    nameAr: 'الشركة الألمانية للأسمنت',
    nameEn: 'German Cement Company',
    serviceType: 'hybrid',
    industry: 'القطاع الصناعي الثقيل ومصانع الطاقة',
    locationAr: 'المنطقة الصناعية — طريق السويس - العين السخنة',
    dailyMeals: 2800,
    contractStatus: 'active',
    contractStartDate: '2025-06-01',
    contractEndDate: '2026-06-01',
    hasActiveAnnualContract: true,
    contractDiscountRate: 10,
    authorizedContact: 'م/ سامح قاسم (مدير الموارد البشرية والخدمات)',
    contactPhone: '01198765432',
    contactEmail: 'catering@germancement.com',
    menuTiers: [
      'وجبات إفطار عمالي متكامل (فول، جبن، بيض، عيش بلدي ساخن)',
      'وجبات ساخنة عالية البروتين لورديات الأفران والتشغيل',
      'سناكس ومشروبات طاقة لمناطق المحاجر'
    ],
    marketCategories: ['مشروبات ساخنة وباردة', 'سناكس وبسكويت', 'معلبات سريعة', 'عصائر طازجة'],
    marketItemsCount: 68,
    activeOrdersToday: 118,
    openComplaintsCount: 0,
    complianceScore: 98.6
  },
  {
    id: 'site_shorouk',
    code: 'SHOROUK-MED',
    nameAr: 'مستشفى الشروق التخصصي',
    nameEn: 'El Shorouk Specialized Hospital',
    serviceType: 'catering',
    industry: 'مجمع طبي استشفائي وجراحة تخصصية',
    locationAr: 'مدينة الشروق — مدخل 2',
    dailyMeals: 980,
    contractStatus: 'active',
    contractStartDate: '2025-09-15',
    contractEndDate: '2026-09-15',
    hasActiveAnnualContract: true,
    contractDiscountRate: 8,
    authorizedContact: 'أ/ محمود عاطف (مسؤول التغذية العلاجية)',
    contactPhone: '01234567890',
    contactEmail: 'dietetics@shoroukhospital.com',
    menuTiers: [
      'حميات غذائية خاصة موزونة بالجرامات والسعرات',
      'وجبات عادية للمرافقين والزوار',
      'سناكس وفاكهة معقمة للأطفال'
    ],
    activeOrdersToday: 26,
    openComplaintsCount: 0,
    complianceScore: 99.1
  },
  {
    id: 'site_habe_market',
    code: 'HABE-MKT',
    nameAr: 'هابي ماركت — HABE MARKET',
    nameEn: 'Habe Market & Retail Canteen',
    serviceType: 'market',
    industry: 'ماركت وسلاسل توريد سريعة وكنتين تجزئة',
    locationAr: 'مدينة بدر — مول العين التجاري',
    contractStatus: 'active',
    contractStartDate: '2026-02-01',
    contractEndDate: '2027-02-01',
    hasActiveAnnualContract: true,
    contractDiscountRate: 10,
    authorizedContact: 'أ/ هاني بهجت (مدير المشتريات والفرع)',
    contactPhone: '01055566677',
    contactEmail: 'manager@habemarket.com',
    menuTiers: [],
    marketCategories: [
      'منتجات الألبان والأجبان الطازجة',
      'مخبوزات وحلويات مطابخ كاترينج مصر المركزية',
      'عصائر ومشروبات طبيعية',
      'وجبات جاهزة للتسخين Ready-to-Heat'
    ],
    marketItemsCount: 142,
    activeOrdersToday: 84,
    openComplaintsCount: 0,
    complianceScore: 99.5
  }
];

// Contract Opportunities Pipeline - Section 4 Compliance
export const INITIAL_OPPORTUNITIES: ContractOpportunity[] = [
  {
    id: 'p1',
    projectName: 'مشروع إعاشة المقر الرئيسي لنجوى تكنولوجي',
    clientName: 'نجوى تكنولوجي — NAGWA TECHNOLOGY',
    industry: 'تكنولوجيا وبرمجيات',
    serviceType: 'catering',
    location: 'القرية الذكية — مبنى B12',
    contactPerson: 'أ/ مروان صبري (HR Director)',
    contactPhone: '01023456789',
    contactEmail: 'procurement@nagwa.com',
    description: 'توريد وجبات غداء بوفيه مفتوح يومي لـ 850 مهندس وموظف، مع محطات طهي حي وعصائر طبيعية.',
    expectedContractSize: '850 وجبة يومياً (4.2M ج.م سنوياً)',
    createdAt: '2026-10-15',
    followUpDate: '2026-11-15',
    status: 'تفاوض',
    nextAction: 'جلسة تذوق وتجربة الأطباق بمطبخ مول العين بمدينة بدر',
    notes: 'العميل يطلب معايير تغذية صحية وأطباق كيتو ونباتية خاصة.',
    attachments: ['الملف_التعريفي.pdf', 'مسودة_عرض_الأسعار.pdf']
  },
  {
    id: 'p2',
    projectName: 'توريد إعاشة الـ 3 ورديات لمطبعة الشروق',
    clientName: 'مطبعة الشروق — AL SHOROUK PRINTING PRESS',
    industry: 'طباعة وتغليف صناعي',
    serviceType: 'hybrid',
    location: 'مدينة العبور — المنطقة الصناعية الأولى',
    contactPerson: 'م/ عادل توفيق (مدير المشتريات)',
    contactPhone: '01123456780',
    contactEmail: 'purchasing@shoroukpress.com',
    description: 'توفير وجبات إفطار وغداء وعشاء لـ 1,400 فني وعامل موزعين على ثلاث ورديات، مع تشغيل بوفيه الكنتين.',
    expectedContractSize: '1,400 وجبة يومياً (6.8M ج.م سنوياً)',
    createdAt: '2026-10-22',
    followUpDate: '2026-11-18',
    status: 'عرض مرسل',
    nextAction: 'مناقشة اشتراطات الدفع الآجل (45 يوماً) ومدة الائتمان',
    notes: 'طلبوا تضمين الخبز والمخبوزات الطازجة من مطابخنا المركزية.',
    attachments: ['كراسة_الشروط_الفنية.pdf']
  },
  {
    id: 'p3',
    projectName: 'عقد توريد وجبات جافة وطوارئ — مستر مينا',
    clientName: 'مستر مينا — متعهد ومقاول إعاشة',
    industry: 'تعهدات إعاشة ومقاولات حكومية',
    serviceType: 'catering',
    location: 'الجيزة — 6 أكتوبر',
    contactPerson: 'السيد / مينا فريد (المقاول العام)',
    contactPhone: '01299887766',
    description: 'توريد وجبات جافة مفرغة من الهواء Flash Vacuum طويلة الصلاحية للمواقع الإنشائية النائية.',
    expectedContractSize: '3,000 وجبة جافة أسبوعياً',
    createdAt: '2026-10-28',
    followUpDate: '2026-11-20',
    status: 'انتظار رد',
    nextAction: 'استلام عينات التغليف والموافقة الفنية على مواصفات الكرتونة',
    notes: 'الكميات قابلة للزيادة في فترات ذروة تنفيذ المشروعات القومية.',
    attachments: ['سجل_المواصفات_الجافة.pdf']
  },
  {
    id: 'p4',
    projectName: 'إعاشة غرف الأبحاث النظيفة — يونيماك للأدوية',
    clientName: 'يونيماك — مصنع أدوية ومستحضرات (UNIMAC)',
    industry: 'صناعات دوائية نظيفة (Cleanrooms)',
    serviceType: 'catering',
    location: 'مدينة العاشر من رمضان — المنطقة A3',
    contactPerson: 'د/ سمر كمال (مدير السلامة والجودة)',
    contactPhone: '01077665544',
    contactEmail: 'qa@unimac-pharma.com',
    description: 'وجبات معقمة بنظام التغليف الطبي المغلق بإحكام لتفادي أي انبعاثات أو تلوث داخل منشآت الأدوية.',
    expectedContractSize: '600 وجبة يومياً (2.9M ج.م سنوياً)',
    createdAt: '2026-11-02',
    followUpDate: '2026-11-14',
    status: 'فرصة جديدة',
    nextAction: 'إرسال العرض المالي وشهادات تحليل مسحات الهايجين لمطبخ هنجر استيشن',
    notes: 'يشترطون تقارير فحص حراري مع كل شحنة توريد مبردة.',
    attachments: ['اشتراطات_مصانع_الدواء.pdf']
  },
  {
    id: 'p5',
    projectName: 'توريد التغذية العلاجية لمستشفى القصر العيني الفرنساوي',
    clientName: 'القصر العيني الفرنساوي — KASR AL AINY FRENCH',
    industry: 'مستشفيات جامعية ومراكز علاجية تخصصية',
    serviceType: 'catering',
    location: 'القاهرة — المنيل',
    contactPerson: 'لجنة الإشراف على التغذية العلاجية',
    contactPhone: '0223654000',
    description: 'تغذية علاجية متكاملة لـ 2,200 مريض ومقيم يومياً وفقاً لجداول السعرات الطبية المعتمدة.',
    expectedContractSize: '2,200 وجبة يومياً (11.2M ج.م سنوياً)',
    createdAt: '2026-10-10',
    followUpDate: '2026-11-16',
    status: 'تفاوض',
    nextAction: 'تقديم خطة الاعتماد لمعايير الهايجين وتجارب سحب العينات العشوائية',
    notes: 'مناقصة كبرى بانتظار البت النهائي من مجلس الإدارة الطبي.',
    attachments: ['ملف_المناقصة_العامة.pdf', 'جدول_الحميات.pdf']
  }
];

// Public Request TEST Samples - Section 8 Compliance
export const INITIAL_TEST_SAMPLES: TestSampleRequest[] = [
  {
    id: 'TEST-2026-101',
    companyName: 'شركة السويدي إلكتريك — قطاع الكابلات',
    contactPerson: 'م/ إبراهيم حلمي',
    phone: '01011223344',
    email: 'catering-test@elsewedy.com',
    location: 'مدينة العاشر من رمضان',
    mealType: 'وجبات ساخنة بروتين عالي (غداء عمالي وتشغيل)',
    sampleCount: 15,
    industryType: 'صناعات كابلات وطاقة',
    proposedDate: '2026-11-18',
    notes: 'نرغب في تجربة أصناف الدجاج المشوي واللحم بالخضار والأرز البسمتي.',
    status: 'جديد — بانتظار المراجعة',
    createdAt: '2026-11-09 14:20'
  },
  {
    id: 'TEST-2026-102',
    companyName: 'مستشفى الشفاء التخصصي',
    contactPerson: 'د/ مروة عبد العزيز',
    phone: '01155443322',
    email: 'nutrition@shifa-hospital.eg',
    location: 'التجمع الخامس — القاهرة الجديدة',
    mealType: 'وجبات علاجية لمرضى القلب والسكر (قليلة الملح والدهون)',
    sampleCount: 10,
    industryType: 'رعاية صحية ومستشفيات',
    proposedDate: '2026-11-19',
    notes: 'يرجى إرفاق بطاقة التحليل الغذائي والسعرات لكل صنف.',
    status: 'تمت الموافقة وتحديد الموعد',
    scheduledTastingDate: '2026-11-19 11:30 ص',
    assignedKitchenId: 'k2',
    createdAt: '2026-11-08 10:15'
  }
];

// Custom Menu Proposals - Section 9 Compliance
export const INITIAL_CUSTOM_MENUS: CustomMenuProposal[] = [
  {
    id: 'PROP-2026-501',
    companyName: 'شركة فاليو للبرمجيات (Valeo)',
    contactPerson: 'أ/ نورا الشريف',
    phone: '01223344556',
    dishName: 'طبق سالمون مشوي مع أرز بري وخضار سوتيه مقرمش',
    ingredients: 'فيليه سالمون طازج (180 جم)، أرز بني بري، بروكلي، جزر صغير، صوص ليمون وشبت خفيف.',
    portionGramWeight: '450 جم إجمالي الطبق',
    serviceType: 'غداء يومي للمديرين والخبراء',
    expectedDailyVolume: 120,
    nutritionNotes: 'أوميجا 3 عالية وخالي من الجلوتين والزيوت المهدرجة.',
    status: 'تم إعداد عرض السعر المعتمد',
    approvedPublicPriceEGP: 185, // Only public price shown to client!
    internalCostBOM: 98, // Hidden internal cost
    createdAt: '2026-11-07'
  }
];

// Live Support Tickets - Section 10 Compliance
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-991',
    clientName: 'الشركة الألمانية للأسمنت',
    contactPhone: '01198765432',
    subject: 'طلب إضافة صنف شوربة العدس الساخنة لمنيو وردية الليل',
    category: 'جودة الوجبة',
    message: 'نظراً لدخول فصل الشتاء والأجواء الباردة بالمنطقة الصناعية، نرجو إضافة شوربة عدس ساخنة مع وجبة منتصف الليل للعمال.',
    status: 'تم الرد',
    priority: 'عادي',
    adminResponse: 'تمت الموافقة من مدير العمليات م/ مصطفى شعبان، وسيتم إدراجها ضمن التوريد المعتمد ابتداءً من السبت القادم.',
    createdAt: '2026-11-10 09:15'
  },
  {
    id: 'TKT-992',
    clientName: 'مستشفى رويال الدولي',
    contactPhone: '01012345671',
    subject: 'استفسار عن موعد توريد وجبات إفطار الطاقم الطبي ليوم الجمعة',
    category: 'موعد التوريد',
    message: 'نرجو تأكيد وصول سيارة التوريد المبردة في تمام الساعة 06:30 صباحاً لتوزيع الإفطار قبل بدء نوبات العمليات.',
    status: 'تم الحل والإغلاق',
    priority: 'عاجل',
    adminResponse: 'تم التنسيق مع أسطول النقل بمطبخ هنجر استيشن، وخروج الشاحنة محدد 05:45 ص مع جهاز تتبع GPS ودرجة تبريد 3.2° م.',
    createdAt: '2026-11-11 06:40'
  }
];

// The 20 Administrative Modules
export const ADMIN_MODULES: AdminModule[] = [
  {
    id: 'central_kitchens',
    number: 1,
    titleAr: 'المطابخ المركزية',
    titleEn: 'Central Kitchens',
    category: 'kitchens_ops',
    categoryNameAr: 'العمليات والإنتاج',
    categoryNameEn: 'Operations & Production',
    descriptionAr: 'متابعة تشغيل الـ 3 مطابخ: مطبخ ومركز العين ببدر، هنجر ستيشن بأرض المعارض بمدينة نصر، ومطبخ بيت العيلة.',
    descriptionEn: 'Live operational control of Mall Al Ain Badr, Hanger Station Nasr City, and Bait Al-Eila kitchens.',
    iconName: 'ChefHat',
    kpiPrimary: {
      value: '3 مطابخ',
      labelAr: 'نشطة بطاقة 18,500 وجبة',
      labelEn: 'Active (18,500 meals/day cap)'
    },
    kpiSecondary: {
      value: '14,240',
      labelAr: 'وجبة منتجة اليوم',
      labelEn: 'Meals cooked today'
    },
    statusBadge: {
      textAr: 'تعمل بكفاءة 96%',
      textEn: 'Operating at 96%',
      variant: 'success'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'فتح خطوط التشغيل',
    quickActionEn: 'Open Kitchen Hub'
  },
  {
    id: 'active_sites',
    number: 2,
    titleAr: 'المواقع والعملاء المتعاقدون',
    titleEn: 'Active Contracted Sites & Portals',
    category: 'clients_contracts',
    categoryNameAr: 'العملاء والتشغيل',
    categoryNameEn: 'Clients & Operations',
    descriptionAr: 'بوابات المواقع النشطة: مستشفى رويال، الشركة الألمانية للأسمنت، مستشفى الشروق، وهابي ماركت.',
    descriptionEn: 'Dedicated portals for Royal Hospital, German Cement Company, El Shorouk Hospital, and Habe Market.',
    iconName: 'Building2',
    kpiPrimary: {
      value: '4 مواقع',
      labelAr: 'مؤسسات بعقود نشطة',
      labelEn: 'Live operational sites'
    },
    kpiSecondary: {
      value: '100%',
      labelAr: 'انتظام توريد اليوم',
      labelEn: 'On-time delivery today'
    },
    statusBadge: {
      textAr: 'جميع المواقع مغطاة',
      textEn: 'All sites active',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'client_manager'],
    quickActionAr: 'إدارة بوابات المواقع',
    quickActionEn: 'Manage Sites'
  },
  {
    id: 'pending_contracts',
    number: 3,
    titleAr: 'فرص التعاقد والمشاريع الجديدة',
    titleEn: 'Contract Opportunities & Pipeline',
    category: 'clients_contracts',
    categoryNameAr: 'العملاء والصفقات',
    categoryNameEn: 'Clients & Pipeline',
    descriptionAr: 'إضافة ومتابعة المشروعات والفرص (نجوى، مطبعة الشروق، مستر مينا، يونيماك، القصر الفرنساوي) مع زر القبول والتحويل الفوري لعميل.',
    descriptionEn: 'Add new projects, track pipeline, and execute one-click acceptance and conversion to active client.',
    iconName: 'Hourglass',
    kpiPrimary: {
      value: '5 فرص',
      labelAr: 'قيد التفاوض والمتابعة',
      labelEn: 'In active negotiation'
    },
    kpiSecondary: {
      value: '14.8M ج.م',
      labelAr: 'قيمة العقود المقدرة',
      labelEn: 'Estimated pipeline value'
    },
    statusBadge: {
      textAr: 'فرص نشطة ومحدثة',
      textEn: 'Active pipeline',
      variant: 'warning'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'متابعة وإضافة المشاريع',
    quickActionEn: 'Manage Pipeline'
  },
  {
    id: 'client_directory',
    number: 4,
    titleAr: 'العملاء الحاليون والملفات',
    titleEn: 'Client Directory & Accounts',
    category: 'clients_contracts',
    categoryNameAr: 'العملاء والعقود',
    categoryNameEn: 'Clients & Contracts',
    descriptionAr: 'سجل شامل لبيانات العملاء، جهات الاتصال المفوضة، اتفاقيات مستوى الخدمة SLA وتفضيلات الوجبات.',
    descriptionEn: 'Comprehensive directory of institutional clients, authorized liaisons, and SLA specs.',
    iconName: 'Users2',
    kpiPrimary: {
      value: '4 جهات كبرى',
      labelAr: 'حسابات استراتيجية معتمدة',
      labelEn: 'Institutional accounts'
    },
    kpiSecondary: {
      value: '98.5%',
      labelAr: 'معدل تجديد العقود',
      labelEn: 'Contract renewal rate'
    },
    statusBadge: {
      textAr: 'حسابات سارية ومستقرة',
      textEn: 'Valid accounts',
      variant: 'info'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'سجل العملاء',
    quickActionEn: 'Client Profiles'
  },
  {
    id: 'contracts_mgmt',
    number: 5,
    titleAr: 'إدارة العقود والتعاقدات',
    titleEn: 'Contract & SLA Management',
    category: 'clients_contracts',
    categoryNameAr: 'التعاقدات والقانونية',
    categoryNameEn: 'Contracts & Legal',
    descriptionAr: 'أرشفة ومتابعة بنود العقود المبرمة، شروط التوريد والجزاءات، مواعيد التجديد وملحقات الأسعار.',
    descriptionEn: 'Central repository of catering agreements, SLA penalty tiers, pricing annexes, and renewals.',
    iconName: 'FileText',
    kpiPrimary: {
      value: '4 عقود',
      labelAr: 'سارية بقيمة 38.6M ج.م',
      labelEn: 'Active worth 38.6M EGP'
    },
    kpiSecondary: {
      value: '180 يوم',
      labelAr: 'لأقرب تجديد (رويال)',
      labelEn: 'Next renewal milestone'
    },
    statusBadge: {
      textAr: 'موثقة ومؤمنة',
      textEn: 'Fully documented',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'cfo_accountant'],
    quickActionAr: 'استعراض العقود',
    quickActionEn: 'View Contracts'
  },
  {
    id: 'staff_mgmt',
    number: 6,
    titleAr: 'إدارة الموظفين والكوادر',
    titleEn: 'Staff & Shift Management',
    category: 'kitchens_ops',
    categoryNameAr: 'الموارد البشرية والتشغيل',
    categoryNameEn: 'HR & Operations',
    descriptionAr: 'إدارة طواقم الطهاة، ومساعدي الشيف، وعمال النظافة والتعبئة، وسائقي أسطول النقل المبرد.',
    descriptionEn: 'Personnel management for executive chefs, line cooks, stewards, and refrigerated fleet drivers.',
    iconName: 'UserCheck',
    kpiPrimary: {
      value: '142 فرد',
      labelAr: 'قوة العمالة الفعلية',
      labelEn: 'Active operations staff'
    },
    kpiSecondary: {
      value: '100%',
      labelAr: 'شهادات صحية سارية',
      labelEn: 'Valid health cards'
    },
    statusBadge: {
      textAr: '3 ورديات منتظمة',
      textEn: '3 shifts on schedule',
      variant: 'success'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'جدول الورديات',
    quickActionEn: 'Manage Shifts'
  },
  {
    id: 'menus_recipes',
    number: 7,
    titleAr: 'إدارة المنيوهات والوجبات',
    titleEn: 'Menus, Recipes & Portions',
    category: 'kitchens_ops',
    categoryNameAr: 'الإنتاج والوجبات',
    categoryNameEn: 'Culinary & Production',
    descriptionAr: 'قواعد الوجبات: اعتيادية، علاجية للمرضى، وجبات جافة، ووجبات ساخنة ومنيو الكنتين الصناعي.',
    descriptionEn: 'Recipe formulation for regular diets, patient clinical diets, dry rations, and industrial canteen.',
    iconName: 'UtensilsCrossed',
    kpiPrimary: {
      value: '84 وجبة',
      labelAr: 'معتمدة بالقيمة الغذائية',
      labelEn: 'Nutritionally certified recipes'
    },
    kpiSecondary: {
      value: '5 فئات',
      labelAr: 'وجبات متخصصة',
      labelEn: 'Specialized menu tiers'
    },
    statusBadge: {
      textAr: 'منيو الأسبوع معتمد',
      textEn: 'Weekly cycle approved',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'client_manager', 'client_employee'],
    quickActionAr: 'تعديل المنيوهات',
    quickActionEn: 'Edit Menus'
  },
  {
    id: 'offers_updates',
    number: 8,
    titleAr: 'إدارة العروض والتحديثات',
    titleEn: 'Live Offers & Broadcasts',
    category: 'commercial_season',
    categoryNameAr: 'التسويق والعروض',
    categoryNameEn: 'Marketing & Promos',
    descriptionAr: 'إطلاق عروض اليوم، العروض الأسبوعية الخاصة بالشركات، ونشرات الوجبات الخاصة ورسائل التطبيق.',
    descriptionEn: 'Publish daily chef specials, site-specific corporate discounts, and system broadcasts.',
    iconName: 'Megaphone',
    kpiPrimary: {
      value: '6 عروض',
      labelAr: 'نشطة وموزعة حالياً',
      labelEn: 'Live promotional broadcasts'
    },
    kpiSecondary: {
      value: '4,120',
      labelAr: 'مشاهدة من العاملين',
      labelEn: 'Employee reach today'
    },
    statusBadge: {
      textAr: 'تم البث اليوم',
      textEn: 'Broadcast active',
      variant: 'info'
    },
    allowedRoles: ['ops_director', 'client_manager', 'client_employee'],
    quickActionAr: 'إنشاء عرض جديد',
    quickActionEn: 'Create Offer'
  },
  {
    id: 'coupons_cashback',
    number: 9,
    titleAr: 'الكوبونات والكاش باك',
    titleEn: 'Coupons & Cashback Engine',
    category: 'commercial_season',
    categoryNameAr: 'الحوافز والمكافآت',
    categoryNameEn: 'Incentives & Cashback',
    descriptionAr: 'بطاقات وكوبونات الخصم المشرشرة، أكواد الخصم المعتمدة للشركات، وبرنامج استرداد الكاش باك.',
    descriptionEn: 'Serrated promotional vouchers, institutional promo codes, and automated employee cashback.',
    iconName: 'TicketPercent',
    kpiPrimary: {
      value: '8 كوبونات',
      labelAr: 'متاحة بخصم حتى 10%',
      labelEn: 'Active coupons (up to 10%)'
    },
    kpiSecondary: {
      value: '18,450 ج.م',
      labelAr: 'كاش باك محتسب هذا الشهر',
      labelEn: 'Accrued cashback'
    },
    statusBadge: {
      textAr: 'كوبونات معتمدة ومقيدة',
      textEn: 'Regulated vouchers',
      variant: 'warning'
    },
    allowedRoles: ['ops_director', 'cfo_accountant', 'client_manager', 'client_employee'],
    quickActionAr: 'إدارة الكوبونات',
    quickActionEn: 'Coupon Vault'
  },
  {
    id: 'inventory_procurement',
    number: 10,
    titleAr: 'المخزون والمشتريات',
    titleEn: 'Inventory & Raw Procurement',
    category: 'finance_procure',
    categoryNameAr: 'المخازن وسلاسل الإمداد',
    categoryNameEn: 'Supply Chain & Stock',
    descriptionAr: 'أرصدة الثلاجات، اللحوم والدواجن المجمدة والمبردة، الأرز والزيوت، أوامر التوريد ومشتريات الموردين.',
    descriptionEn: 'Cold storage stock, proteins, dry grains, edible oils, purchase orders, and supplier receipts.',
    iconName: 'Boxes',
    kpiPrimary: {
      value: '48 طن',
      labelAr: 'مخزون استراتيجي آمن',
      labelEn: 'Cold & dry strategic buffer'
    },
    kpiSecondary: {
      value: '7.2 أيام',
      labelAr: 'كفاية المخزون للاستهلاك',
      labelEn: 'Stock coverage span'
    },
    statusBadge: {
      textAr: 'في الحدود الآمنة',
      textEn: 'Safe thresholds',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'cfo_accountant'],
    quickActionAr: 'جرد المخازن',
    quickActionEn: 'Audit Stock'
  },
  {
    id: 'financials_ledger',
    number: 11,
    titleAr: 'الحسابات والإيرادات والمصروفات',
    titleEn: 'Financial Ledger & P&L',
    category: 'finance_procure',
    categoryNameAr: 'المالية والتدقيق',
    categoryNameEn: 'Finance & P&L',
    descriptionAr: 'قوائم الإيرادات الشهرية، تكلفة الوجبة الغذائية BOM، الأجور ومصروفات الوقود والتشغيل اليومي (سرّي للإدارة فقط).',
    descriptionEn: 'Monthly revenue ledger, meal Bill of Materials cost, payroll, logistics fuel, and OPEX (Confidential).',
    iconName: 'Landmark',
    kpiPrimary: {
      value: '4.82M ج.م',
      labelAr: 'إيراد تشغيلي شهري',
      labelEn: 'Monthly billing run-rate'
    },
    kpiSecondary: {
      value: '22.8%',
      labelAr: 'هامش الربح الإجمالي',
      labelEn: 'Gross operating margin'
    },
    statusBadge: {
      textAr: 'سرّي للغاية - الإدارة والمالية',
      textEn: 'Confidential - Admin only',
      variant: 'neutral'
    },
    allowedRoles: ['ops_director', 'cfo_accountant'],
    quickActionAr: 'سجل اليومية المالي',
    quickActionEn: 'Open Ledger'
  },
  {
    id: 'billing_collections',
    number: 12,
    titleAr: 'متابعة الحسابات والتحصيل',
    titleEn: 'Billing & AR Collections',
    category: 'finance_procure',
    categoryNameAr: 'المطالبات والتحصيل',
    categoryNameEn: 'AR & Cash Flow',
    descriptionAr: 'إصدار الفواتير الضريبية المعتمدة للمواقع، فترات الائتمان، ومتابعة تحصيل شيكات المستشفيات والمصانع.',
    descriptionEn: 'E-invoicing dispatch, aging receivables ledger, hospital & factory payment cycle reconciliation.',
    iconName: 'Receipt',
    kpiPrimary: {
      value: '94.2%',
      labelAr: 'نسبة التحصيل الشهري',
      labelEn: 'Collection efficiency'
    },
    kpiSecondary: {
      value: '680K ج.م',
      labelAr: 'مستحقات تستحق خلال 7 أيام',
      labelEn: 'Due within 7 days'
    },
    statusBadge: {
      textAr: 'انتظام تام بالتحصيل',
      textEn: 'Healthy cashflow',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'cfo_accountant'],
    quickActionAr: 'فواتير ومطالبات',
    quickActionEn: 'Invoicing Hub'
  },
  {
    id: 'complaints_mgmt',
    number: 13,
    titleAr: 'إدارة الشكاوى والدعم الفني',
    titleEn: 'Complaints & Ticketing',
    category: 'quality_hygiene',
    categoryNameAr: 'خدمة العملاء والجودة',
    categoryNameEn: 'Customer Resolution',
    descriptionAr: 'منظومة فورية لتلقي ملاحظات الوجبات ودرجة الحرارة وتذاكر الدعم الفني المباشر والرد خلال 30 دقيقة.',
    descriptionEn: 'Incident tracker for temperature, meal presentation, delivery time, with 30-min SLA response.',
    iconName: 'MessageSquareWarning',
    kpiPrimary: {
      value: '2 شكاوى',
      labelAr: 'قيد المتابعة والمعالجة',
      labelEn: 'Open tickets (Under SLA)'
    },
    kpiSecondary: {
      value: '18 دقيقة',
      labelAr: 'متوسط سرعة الإغلاق',
      labelEn: 'Avg resolution speed'
    },
    statusBadge: {
      textAr: '98.8% نسبة الرضا',
      textEn: '98.8% satisfaction',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'client_manager', 'client_employee'],
    quickActionAr: 'سجل البلاغات والدعم',
    quickActionEn: 'Ticket Queue'
  },
  {
    id: 'quality_assurance',
    number: 14,
    titleAr: 'إدارة الجودة والمقاييس',
    titleEn: 'Quality Assurance & QA/QC',
    category: 'quality_hygiene',
    categoryNameAr: 'ضبط وتأكيد الجودة',
    categoryNameEn: 'QA & Compliance',
    descriptionAr: 'فحوصات التذوق الدوري، مطابقة أوزان الحصص بالجرام، معايرة درجات الطهي وسجلات الجودة اليومية.',
    descriptionEn: 'Daily organoleptic tasting audits, portion weight gram checks, probe calibrations, and QC cards.',
    iconName: 'ShieldCheck',
    kpiPrimary: {
      value: '99.4%',
      labelAr: 'مطابقة أوزان الحصص',
      labelEn: 'Portion weight precision'
    },
    kpiSecondary: {
      value: '42 فحص',
      labelAr: 'تم إجراؤها اليوم',
      labelEn: 'Daily QC audits conducted'
    },
    statusBadge: {
      textAr: 'معايير الجودة مطبقة',
      textEn: 'QA verified',
      variant: 'success'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'سجل الفحوصات',
    quickActionEn: 'QA Inspection'
  },
  {
    id: 'hygiene_food_safety',
    number: 15,
    titleAr: 'الجودة والهايجين — HACCP',
    titleEn: 'Hygiene & HACCP Food Safety',
    category: 'quality_hygiene',
    categoryNameAr: 'الصحة وسلامة الغذاء',
    categoryNameEn: 'Food Safety & Hygiene',
    descriptionAr: 'منظومة HACCP لسلامة الغذاء: سلسلة التبريد (+1° إلى +4° م)، درجات الطهي (+75° م)، مسحات الأسطح، ونظافة المعدات.',
    descriptionEn: 'Cold chain telemetry (+1° to +4°C), cooking core probes (+75°C), surface swabs, and HACCP compliance.',
    iconName: 'Sparkles',
    kpiPrimary: {
      value: '99.4%',
      labelAr: 'مؤشر الامتثال الصحي',
      labelEn: 'HACCP Safety Index'
    },
    kpiSecondary: {
      value: '0 حوادث',
      labelAr: 'خلال 240 يوماً متتالية',
      labelEn: 'Zero incidents (240d)'
    },
    statusBadge: {
      textAr: 'فحص صباحي معتمد HACCP',
      textEn: 'HACCP cleared',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'client_manager'],
    quickActionAr: 'سجل الهايجين وتفتيش HACCP',
    quickActionEn: 'HACCP Audit Hub'
  },
  {
    id: 'reports_analytics',
    number: 16,
    titleAr: 'التقارير والتحليلات والطباعة PDF',
    titleEn: 'Executive Analytics & PDF Printing',
    category: 'admin_governance',
    categoryNameAr: 'التقارير والذكاء التشغيلي',
    categoryNameEn: 'Business Intelligence',
    descriptionAr: 'تصدير وطباعة عروض الأسعار الرسمية، أوامر التشغيل، أذونات عينات التذوق، وتقارير الهايجين بصيغة A4 بالعربية.',
    descriptionEn: 'Export official quotations, tasting sample slips, HACCP audit sheets, and operational reports.',
    iconName: 'BarChart3',
    kpiPrimary: {
      value: '432,000',
      labelAr: 'وجبة تم تقديمها هذا الشهر',
      labelEn: 'Meals served this month'
    },
    kpiSecondary: {
      value: 'A4 PDF',
      labelAr: 'طباعة فورية باللغة العربية',
      labelEn: 'Native Arabic printing'
    },
    statusBadge: {
      textAr: 'نظام طباعة معتمد جاهز',
      textEn: 'Print engine active',
      variant: 'info'
    },
    allowedRoles: ['ops_director', 'cfo_accountant'],
    quickActionAr: 'طباعة وتصدير التقارير',
    quickActionEn: 'Print & PDF Engine'
  },
  {
    id: 'users_permissions',
    number: 17,
    titleAr: 'إدارة المستخدمين والصلاحيات (الأمان)',
    titleEn: 'Users & Security Governance',
    category: 'admin_governance',
    categoryNameAr: 'الحوكمة والأمان',
    categoryNameEn: 'RBAC & Security',
    descriptionAr: 'صلاحيات م/ مصطفى شعبان الحصرية: إنشاء الحسابات، إعادة تعيين كلمات المرور، غلق وفتح الموديولات، وسياسة الجلسات.',
    descriptionEn: 'Exclusive supreme powers of Eng. Mostafa Shaaban: account creation, resets, and RBAC firewall.',
    iconName: 'LockKeyhole',
    kpiPrimary: {
      value: 'م/ مصطفى شعبان',
      labelAr: 'المسؤول الأعلى الحصري للأمان',
      labelEn: 'Supreme Administrator'
    },
    kpiSecondary: {
      value: 'مشفر',
      labelAr: 'حسابات مستقلة بكلمات مرور',
      labelEn: 'Isolated user credentials'
    },
    statusBadge: {
      textAr: 'صلاحيات محصورة بمدير العمليات',
      textEn: 'Supreme Admin Enforced',
      variant: 'neutral'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'إدارة المستخدمين والأمان',
    quickActionEn: 'Manage Users'
  },
  {
    id: 'internal_comms',
    number: 18,
    titleAr: 'مركز الإشعارات والدردشة الداخلية',
    titleEn: 'Internal Dispatch & Comms',
    category: 'kitchens_ops',
    categoryNameAr: 'التواصل والعمليات',
    categoryNameEn: 'Dispatch & Messaging',
    descriptionAr: 'قنوات مشفرة بين الإدارة، ومديري المطابخ، ومسؤولي المواقع، مع عزل محادثات المواقع عن بعضها.',
    descriptionEn: 'Restricted communications channels between HQ, kitchen chiefs, and site supervisors.',
    iconName: 'MessageCircle',
    kpiPrimary: {
      value: '12 رسالة',
      labelAr: 'تحديثات عمليات اليوم',
      labelEn: 'Operations updates'
    },
    kpiSecondary: {
      value: '3 قنوات',
      labelAr: 'مشفرة حسب الموقع',
      labelEn: 'Isolated site channels'
    },
    statusBadge: {
      textAr: 'اتصال مباشر',
      textEn: 'Dispatch online',
      variant: 'success'
    },
    allowedRoles: ['ops_director', 'client_manager'],
    quickActionAr: 'فتح غرفة العمليات',
    quickActionEn: 'Open Dispatch'
  },
  {
    id: 'seasonal_campaigns',
    number: 19,
    titleAr: 'العروض الموسمية ومزايا المتعاقدين',
    titleEn: 'Seasonal Offers & Partner Perks',
    category: 'commercial_season',
    categoryNameAr: 'المواسم والمبادرات',
    categoryNameEn: 'Seasonal & Mega Campaigns',
    descriptionAr: 'كرتونة وشنطة رمضان، كحك العيد، لحوم الأضاحي، تمور الواحات، ومزايا العملاء ذوي العقود السنوية السارية.',
    descriptionEn: 'Ramadan relief boxes, Eid Kahk, Adha livestock packs, Oasis dates, and certified annual contract perks.',
    iconName: 'Flame',
    kpiPrimary: {
      value: '8 حملات',
      labelAr: 'مواسم الخير المعتمدة',
      labelEn: 'Certified seasonal offers'
    },
    kpiSecondary: {
      value: 'خصم معتمد',
      labelAr: 'لأصحاب العقود السنوية السارية',
      labelEn: 'Annual contract holders'
    },
    statusBadge: {
      textAr: 'عروض معتمدة من الإدارة',
      textEn: 'Admin approved',
      variant: 'warning'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'حملات الخير والمواسم',
    quickActionEn: 'Seasonal Hub'
  },
  {
    id: 'enterprise_settings',
    number: 20,
    titleAr: 'إعدادات المؤسسة والهوية والشعار',
    titleEn: 'Enterprise System Settings',
    category: 'admin_governance',
    categoryNameAr: 'النظام والهوية',
    categoryNameEn: 'System & Branding',
    descriptionAr: 'بيانات السجل التجاري والبطاقة الضريبية للشركة الوطنية، الفروع، الشعار المعتمد، سجل التدقيق Audit Log.',
    descriptionEn: 'National Logistics enterprise profile, tax ID, official logo assets, audit trail, and security logs.',
    iconName: 'Sliders',
    kpiPrimary: {
      value: 'الوطنية',
      labelAr: 'الشركة الوطنية اللوجستية',
      labelEn: 'National Logistics Corp'
    },
    kpiSecondary: {
      value: 'v4.0 Pro',
      labelAr: 'إصدار المنظومة المتكامل',
      labelEn: 'Enterprise release'
    },
    statusBadge: {
      textAr: 'نظام متكامل ومستقر',
      textEn: 'System optimal',
      variant: 'success'
    },
    allowedRoles: ['ops_director'],
    quickActionAr: 'تكوين النظام',
    quickActionEn: 'System Config'
  }
];

// Audit Trail Initial Logs - Section 5 & 16
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-1001',
    timestamp: 'اليوم 09:30 ص',
    userRole: 'ops_director',
    userName: 'م/ مصطفى شعبان',
    moduleName: 'فرص التعاقد والمشاريع الجديدة',
    actionAr: 'مراجعة عروض المشاريع الجديدة',
    actionEn: 'Reviewed project opportunities',
    details: 'فحص ملفات التعاقد لـ 5 فرص نشطة والتأكيد على اشتراطات قبول المشاريع.',
    severity: 'info'
  },
  {
    id: 'AUD-1002',
    timestamp: 'اليوم 08:45 ص',
    userRole: 'ops_director',
    userName: 'م/ مصطفى شعبان',
    moduleName: 'الجودة والهايجين — HACCP',
    actionAr: 'اعتماد تقرير التفتيش الصباحي HACCP',
    actionEn: 'Approved HACCP morning inspection',
    details: 'اعتماد درجات حرارة شاحنات التبريد وسلسلة الإمداد لمستشفى رويال والألمانية للأسمنت.',
    severity: 'info'
  },
  {
    id: 'AUD-1003',
    timestamp: 'اليوم 07:15 ص',
    userRole: 'ops_director',
    userName: 'م/ مصطفى شعبان',
    moduleName: 'المطابخ المركزية',
    actionAr: 'متابعة تشغيل خطوط الإنتاج',
    actionEn: 'Monitored central kitchens',
    details: 'التأكد من انتظام خط الوجبات الساخنة بمطبخ مول العين بمدينة بدر وهنجر استيشن.',
    severity: 'info'
  },
  {
    id: 'AUD-1004',
    timestamp: 'أمس 04:30 م',
    userRole: 'cfo_accountant',
    userName: 'المدير المالي',
    moduleName: 'متابعة الحسابات والتحصيل',
    actionAr: 'تسجيل سداد مستخلص',
    actionEn: 'Recorded invoice settlement',
    details: 'تم قيد سداد مستخلص مستشفى رويال الدولي عن النصف الأول من الدورة التوريدية.',
    severity: 'info'
  }
];

// Kitchens Operational Dataset
export const KITCHENS_DATA = [
  {
    id: 'k1',
    nameAr: 'مطبخ ومركز العين — مدينة بدر',
    nameEn: 'Mall Al Ain Central Kitchen — Badr City',
    locationAr: 'مدينة بدر — المقر الرئيسي للتشغيل',
    capacityMeals: 6500,
    currentToday: 5120,
    staffCount: 46,
    hygieneScore: 99.4,
    status: 'نشط — المقر الرئيسي للتشغيل وتوريد المصانع والمستشفيات',
    manager: 'شيف / سامي عبد القوي',
    sections: ['خط وجبات المصانع والمستشفيات', 'خط الوجبات الجافة', 'خط التبريد السريع Blast Chilling']
  },
  {
    id: 'k2',
    nameAr: 'مطبخ هنجر ستيشن المركزي',
    nameEn: 'Hanger Station Central Kitchen',
    locationAr: 'أرض المعارض بمدينة نصر',
    capacityMeals: 8000,
    currentToday: 6420,
    staffCount: 52,
    hygieneScore: 99.4,
    status: 'نشط ويعمل بطاقة قصوى',
    manager: 'شيف / عصام الدسوقي',
    sections: ['قسم الطهي الساخن', 'قسم الحلويات والمخبوزات', 'قسم التعبئة المعقمة', 'مستودع التجميد -18°']
  },
  {
    id: 'k3',
    nameAr: 'مطبخ بيت العيلة المركزي',
    nameEn: 'Bait Al-Eila Central Kitchen',
    locationAr: 'القاهرة الكبرى — مطبخ الطهي البيتي والولائم',
    capacityMeals: 4000,
    currentToday: 2700,
    staffCount: 44,
    hygieneScore: 99.2,
    status: 'نشط — طهي بيتي فاخر وصواني العزائم والولائم',
    manager: 'شيف / يحيى رضوان',
    sections: ['قسم الطواجن والمحاشي والممبار', 'قسم الطيور والمشويات البلدي', 'أسطول شاحنات التوصيل الحراري']
  }
];

// Seasonal Campaigns Data
export const SEASONAL_OFFERS_DATA = [
  {
    id: 'c1',
    nameAr: 'عرض كرتونة رمضان المتكاملة',
    nameEn: 'Ramadan Relief Food Carton',
    badge: 'الأكثر طلباً للشركات والمصانع',
    discount: 'خصم معتمد للمتعاقدين',
    price: 'من 420 ج.م للكرتونة',
    descriptionAr: 'تحتوي على أجود أنواع الأرز، السكر، الزيت، السمن، المكرونة، التمر الفاخر، والشاي معبأة بكرتونة سميكة فاخرة.',
    eligibleSites: 'جميع الشركات والمواقع ذات العقود السنوية السارية'
  },
  {
    id: 'c2',
    nameAr: 'عرض شنطة الخير الرمضانية',
    nameEn: 'Ramadan Charity Gift Bag',
    badge: 'مثالية للإهداء وتوزيع العمال',
    discount: 'سعر خاص للكميات +1000',
    price: 'من 265 ج.م للشنطة',
    descriptionAr: 'شنطة قماشية صديقة للبيئة تحتوي على أساسيات المائدة الرمضانية للأسر المتعففة وتوزيع العمال.',
    eligibleSites: 'المؤسسات الخيرية وشركات المقاولات'
  },
  {
    id: 'c3',
    nameAr: 'علبة كحك وبسكويت العيد الفاخر',
    nameEn: 'Eid Luxury Kahk & Biscuits Box',
    badge: 'سمن بلدي طبيعي 100%',
    discount: 'حجز مسبق معتمد',
    price: 'تشكيلة 1 كجم إلى 4 كجم',
    descriptionAr: 'إنتاج مخابزنا المركزية بسمن بلدي صافي، غريبة بالفستق، بيتي فور فرنسي، وكحك عين جمل وسادة.',
    eligibleSites: 'المستشفيات والشركات المتعاقدة'
  },
  {
    id: 'c4',
    nameAr: 'عروض لحوم وأضاحي عيد الأضحى',
    nameEn: 'Eid Al-Adha Meat Packs',
    badge: 'ذبح شرعي ومجازر معتمدة',
    discount: 'حجز مبكر بخصم معتمد',
    price: 'أوزان مبردة ومعقمة',
    descriptionAr: 'عجول وضأن بلدي، تقطيع وتشفية وتعبئة مفرغة من الهواء Flash Vacuum، وتوزيع مباشر على المواقع.',
    eligibleSites: 'الشركة الألمانية ومواقع الإعاشة الكبرى'
  },
  {
    id: 'c5',
    nameAr: 'عروض تمور الواحات وسيوة الفاخرة',
    nameEn: 'Oasis & Siwa Dates Collection',
    badge: 'تمور عضوية مجدولة وصعيدي',
    discount: 'سعر خاص للمواقع',
    price: 'عبوات 800 جم و 2 كجم',
    descriptionAr: 'تمر نخب أول منتقى بعناية ومغسول ومجفف بأحدث التقنيات للحفاظ على المذاق الغني والقيمة الغذائية.',
    eligibleSites: 'بوابات العملاء وكنتين المواقع وهابي ماركت'
  },
  {
    id: 'c6',
    nameAr: 'عروض حلوى المولد النبوي الشريف',
    nameEn: 'Mawlid Sweets Premium Boxes',
    badge: 'مكسرات فاخرة وعسل نحل',
    discount: 'خصم معتمد من الإدارة',
    price: 'علب 2 كجم و 5 كجم فاخرة',
    descriptionAr: 'تشكيلة السمسمية، الحمصية، الفستقية، والملبن الحبل بعسل النحل الطبيعي لعملاء المنظومة.',
    eligibleSites: 'جميع المؤسسات المتعاقدة'
  }
];

// Serrated Edge Promotional Coupons
export const SERRATED_COUPONS = [
  {
    id: 'cp-101',
    code: 'NAT-RAMADAN-10',
    titleAr: 'كوبون كرتونة رمضان للشركات',
    discountText: '10% خصم',
    validUntil: '15 شعبان 1448',
    usedCount: 420,
    maxUses: 1000,
    siteRestriction: 'عملاء الوطنية اللوجستية المتعاقدون',
    color: 'from-[#62339A] to-[#4A2378]'
  },
  {
    id: 'cp-102',
    code: 'ROYAL-MEAL-CASH',
    titleAr: 'كاش باك وجبات رويال الطبية',
    discountText: '5% كاش باك',
    validUntil: 'نهاية الشهر الحالي',
    usedCount: 890,
    maxUses: 2000,
    siteRestriction: 'مستشفى رويال الدولي - الطاقم الطبي',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'cp-103',
    code: 'GERMAN-CANTEEN-FREE',
    titleAr: 'قسيمة مشروب + سناك الكنتين',
    discountText: 'قسيمة مجانية',
    validUntil: '30 يوماً',
    usedCount: 1540,
    maxUses: 3000,
    siteRestriction: 'الشركة الألمانية للأسمنت',
    color: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'cp-104',
    code: 'HABE-MARKET-5',
    titleAr: 'قسيمة مشتريات هابي ماركت',
    discountText: '5% رصيد مشتريات',
    validUntil: 'مستمر طوال العقد',
    usedCount: 310,
    maxUses: 1500,
    siteRestriction: 'عملاء هابي ماركت — مدينة بدر',
    color: 'from-purple-600 to-pink-600'
  }
];
