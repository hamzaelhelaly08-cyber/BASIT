import hangerStationImg from '../assets/images/kitchen_eg_hanger_station_1794519256392.jpg';
import mallAlAinImg from '../assets/images/kitchen_eg_mall_al_ain_1794519255070.jpg';
import baitAlEilaImg from '../assets/images/bait_al_eila_kitchen_prep_1795368109434.jpg';
import factoryStripImg from '../assets/images/strip_factory_catering_1794519256376.jpg';
import offersStripImg from '../assets/images/strip_catering_offers_1794519256900.jpg';
import cateringVipSpreadImg from '../assets/images/catering_vip_spread_1794513442775.jpg';
import coffeeNutsImg from '../assets/images/coffee_nuts_roastery_1794847882208.jpg';
import macaronaBechamelImg from '../assets/images/baked_macarona_bechamel_tray_1795443068298.jpg';
import charcoalGrillsImg from '../assets/images/succulent_charcoal_grills_1795443029475.jpg';
import camelLiverImg from '../assets/images/sizzling_camel_liver_tasa_1795443029110.jpg';
import eidMeatPacksImg from '../assets/images/eid_meat_clean_box_1795839381870.jpg';
import pizzaMixImg from '../assets/images/pizza_oriental_western_mix_1795443026422.jpg';
import basitCouponsImg from '../assets/images/basit_discount_coupons_1795562708296.jpg';
import microwaveMealBoxesImg from '../assets/images/basit_microwave_meal_boxes_1795562708424.jpg';
import vipMajlisBanquetImg from '../assets/images/vip_majlis_7star_banquet_1795443028287.jpg';
import boardroomMeetingsImg from '../assets/images/basit_boardroom_meetings_menu_1795841343955.jpg';
import charityMealsCleanImg from '../assets/images/basit_charity_meals_1795841339828.jpg';
import hospitalClinicalMealImg from '../assets/images/basit_hospital_clinical_meal_1795841340700.jpg';
import healthyBowlCleanImg from '../assets/images/sector_basit_healthy_1795835812014.jpg';

export const BASIT_COUPONS_ARTWORK = basitCouponsImg;
export const BASIT_MICROWAVE_ARTWORK = microwaveMealBoxesImg;

export type LanguageCode = 'ar' | 'en';
export type CountryCode = 'EG' | 'QA' | 'OM' | 'GB';

export type PaymentGatewayId = 'fawry' | 'vodafone_cash' | 'instapay' | 'cash_on_delivery';

export const VODAFONE_CASH_NUMBER = '+201010430347';

export const PAYMENT_METHOD_LABELS: Record<PaymentGatewayId, { ar: string; en: string }> = {
  fawry: { ar: 'فوري (Fawry)', en: 'Fawry' },
  vodafone_cash: { ar: 'فودافون كاش (Vodafone Cash)', en: 'Vodafone Cash' },
  instapay: { ar: 'إنستا باي (InstaPay)', en: 'InstaPay' },
  cash_on_delivery: { ar: 'الدفع عند الاستلام (COD)', en: 'Cash on Delivery' },
};

export interface CountryOption {
  code: CountryCode;
  dialCode: string;
  nameAr: string;
  nameEn: string;
  currencyAr: string;
  currencyEn: string;
  defaultLanguage: LanguageCode;
  supportedGateways: PaymentGatewayId[];
  isFeatured?: boolean;
  isActiveMarket?: boolean;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  {
    code: 'EG',
    dialCode: '+20',
    nameAr: 'مصر (النشط)',
    nameEn: 'Egypt (Active)',
    currencyAr: 'ج.م',
    currencyEn: 'EGP',
    defaultLanguage: 'ar',
    supportedGateways: ['fawry', 'vodafone_cash', 'instapay', 'cash_on_delivery'],
    isFeatured: true,
    isActiveMarket: true,
  },
  {
    code: 'QA',
    dialCode: '+974',
    nameAr: 'قطر (في انتظار الافتتاح)',
    nameEn: 'Qatar (Awaiting Opening)',
    currencyAr: 'ر.ق',
    currencyEn: 'QAR',
    defaultLanguage: 'ar',
    supportedGateways: ['cash_on_delivery'],
    isFeatured: false,
    isActiveMarket: false,
  },
  {
    code: 'OM',
    dialCode: '+968',
    nameAr: 'سلطنة عُمان (في انتظار الافتتاح)',
    nameEn: 'Oman (Awaiting Opening)',
    currencyAr: 'ر.ع',
    currencyEn: 'OMR',
    defaultLanguage: 'ar',
    supportedGateways: ['cash_on_delivery'],
    isFeatured: false,
    isActiveMarket: false,
  },
  {
    code: 'GB',
    dialCode: '+44',
    nameAr: 'المملكة المتحدة (في انتظار الافتتاح)',
    nameEn: 'United Kingdom (Awaiting Opening)',
    currencyAr: 'ج.إ',
    currencyEn: 'GBP',
    defaultLanguage: 'en',
    supportedGateways: ['cash_on_delivery'],
    isFeatured: false,
    isActiveMarket: false,
  },
];

export type SearchScope =
  | 'all'
  | 'products'
  | 'catering'
  | 'companies'
  | 'offers'
  | 'places'
  | 'invoices'
  | 'gift_cards'
  | 'meals'
  | 'kitchens';

export interface PlatformFunctionTile {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  iconKey: string;
  targetSection: string;
  group: 'operations' | 'commerce' | 'workspace' | 'system';
  highlighted?: boolean;
}

/** 20 Core Actionable Platform Functions inside BASIT | باسط */
export const PLATFORM_FUNCTIONS: PlatformFunctionTile[] = [
  {
    id: 'fn_factories',
    titleAr: 'بوابة المصانع والشركات',
    titleEn: 'Factories & Companies',
    subtitleAr: 'مساحة مستقلة لتوريد الإنتاج والعمالة والعقود',
    subtitleEn: 'Isolated workspace for industrial & B2B contracts',
    iconKey: 'factory',
    targetSection: 'fayd_merchant_workspace',
    group: 'workspace',
    highlighted: true,
  },
  {
    id: 'fn_merchants',
    titleAr: 'التجار ومقدمو الخدمات',
    titleEn: 'Merchants & Providers',
    subtitleAr: 'إدارة المتجر، القوائم، الأسعار والمخزون',
    subtitleEn: 'Storefront, catalog, pricing & stock workspace',
    iconKey: 'merchant',
    targetSection: 'fayd_merchant_workspace',
    group: 'workspace',
    highlighted: true,
  },
  {
    id: 'fn_food_hospitality',
    titleAr: 'المطاعم والوجبات والمجالس',
    titleEn: 'Restaurants & Hospitality',
    subtitleAr: 'الطلب الفوري وحجز المطاعم والمجالس',
    subtitleEn: 'Live dining, catering & VIP Majlis bookings',
    iconKey: 'utensils',
    targetSection: 'al_ain_majlis',
    group: 'commerce',
  },
  {
    id: 'fn_delivery',
    titleAr: 'شبكة التوصيل والمناديب',
    titleEn: 'Delivery & Couriers',
    subtitleAr: 'إرسال الشحنات وتتبع مهام المندوبين',
    subtitleEn: 'Dispatch shipments & courier task tracking',
    iconKey: 'delivery',
    targetSection: 'fayd_delivery_partner',
    group: 'operations',
    highlighted: true,
  },
  {
    id: 'fn_products_stock',
    titleAr: 'المنتجات والمخزون',
    titleEn: 'Products & Inventory',
    subtitleAr: 'كتالوج الأصناف، التسعير وتنبيهات النفاد',
    subtitleEn: 'Multi-tenant SKU catalog & live inventory',
    iconKey: 'products',
    targetSection: 'fayd_merchant_workspace',
    group: 'commerce',
  },
  {
    id: 'fn_orders',
    titleAr: 'الطلبات والتنفيذ',
    titleEn: 'Orders & Fulfillment',
    subtitleAr: 'متابعة حالة الطلبات للعميل والتاجر',
    subtitleEn: 'Real-time order pipeline & fulfillment',
    iconKey: 'orders',
    targetSection: 'fayd_merchant_workspace',
    group: 'operations',
  },
  {
    id: 'fn_entertainment_benefits',
    titleAr: 'الترفيه والمزايا للعاملين',
    titleEn: 'Entertainment & Benefits',
    subtitleAr: 'سيرك، ملاهي، نوادي، فنادق، شواطئ، ومناطق ألعاب معتمدة',
    subtitleEn: 'Circus, parks, clubs, resorts, beaches & employee discounts',
    iconKey: 'offers',
    targetSection: 'entertainment_benefits',
    group: 'commerce',
    highlighted: true,
  },
  {
    id: 'fn_logistics_services',
    titleAr: 'خدمات الوطنية اللوجستية المكملة',
    titleEn: 'National Logistics Services',
    subtitleAr: 'الأفراح، المؤتمرات، البوفيهات، الضيافة، وتجهيز المطابخ',
    subtitleEn: 'Weddings, conferences, open buffets & central kitchen setup',
    iconKey: 'banquet',
    targetSection: 'logistics_services',
    group: 'operations',
    highlighted: true,
  },
  {
    id: 'fn_charity_good_deeds',
    titleAr: 'اعمل الخير (قسم مستقل)',
    titleEn: 'Do Good — Charity Initiatives',
    subtitleAr: 'مبادرات الإطعام والخير المعتمدة مع توثيق آلية التنفيذ',
    subtitleEn: 'Verified charity feeding initiatives with execution tracking',
    iconKey: 'heart',
    targetSection: 'charity_good_deeds',
    group: 'commerce',
  },
  {
    id: 'fn_kaffarah_yamin',
    titleAr: 'كفارات اليمين (توثيق شرعي)',
    titleEn: 'Kaffarat Al-Yamin (Standalone)',
    subtitleAr: 'قسم منفصل تماماً — بالمرجع الشرعي وإثبات التنفيذ',
    subtitleEn: 'Dedicated Kaffarah workflow gated by Sharia authority & proof',
    iconKey: 'scale',
    targetSection: 'kaffarah_yamin',
    group: 'operations',
  },
  {
    id: 'fn_payments',
    titleAr: 'بوابات الدفع والتحصيل',
    titleEn: 'Payments & Gateways',
    subtitleAr: 'فوري · فودافون كاش · إنستا باي · الدفع عند الاستلام',
    subtitleEn: 'Fawry · Vodafone Cash · InstaPay · Cash on Delivery',
    iconKey: 'wallet',
    targetSection: 'fayd_admin_governance',
    group: 'operations',
    highlighted: true,
  },
  {
    id: 'fn_invoices_rfq',
    titleAr: 'الفواتير وعروض الأسعار',
    titleEn: 'Invoices & Quotations',
    subtitleAr: 'طلب عرض سعر وإصدار PDF معتمد',
    subtitleEn: 'Official RFQ submission & A4 PDF export',
    iconKey: 'receipt',
    targetSection: 'quotation',
    group: 'operations',
  },
  {
    id: 'fn_register_account',
    titleAr: 'اختيار نوع الحساب والتسجيل',
    titleEn: 'Account Type & Register',
    subtitleAr: 'جهة متعاقدة · مطبخ مركزي · شريك ترفيه · موظف · عميل',
    subtitleEn: 'Entity · Central Kitchen · Benefit Partner · Employee · Customer',
    iconKey: 'register',
    targetSection: 'fayd_onboarding',
    group: 'system',
    highlighted: true,
  },
  {
    id: 'fn_customer_portal',
    titleAr: 'بوابة العملاء والشراء',
    titleEn: 'Customer Commerce',
    subtitleAr: 'السوق الموحد، السلة، وتتبع الطلبات',
    subtitleEn: 'Marketplace checkout & live order tracking',
    iconKey: 'customer',
    targetSection: 'fayd_marketplace',
    group: 'commerce',
  },
  {
    id: 'fn_kitchens',
    titleAr: 'المطابخ المركزية',
    titleEn: 'Central Kitchens',
    subtitleAr: 'مدينة بدر، أرض المعارض بمدينة نصر، ومطبخ بيت العيلة',
    subtitleEn: 'Mall Al Ain (Badr), Hanger Station (Nasr City) & Bait Al-Eila',
    iconKey: 'chef',
    targetSection: 'kitchens',
    group: 'operations',
  },

  {
    id: 'fn_notifications',
    titleAr: 'الإشعارات والتنبيهات الفورية',
    titleEn: 'Live Notifications',
    subtitleAr: 'تنبيهات الطلبات والموافقات والدفع من Firestore',
    subtitleEn: 'Real Firestore event alerts & unread queue',
    iconKey: 'notifications',
    targetSection: 'notifications_panel',
    group: 'system',
  },
  {
    id: 'fn_analytics_reports',
    titleAr: 'التقارير والتسويات المالية',
    titleEn: 'Reports & Settlements',
    subtitleAr: 'العمولات، الأرصدة وكشوف الحساب',
    subtitleEn: 'Commissions, ledgers & merchant payouts',
    iconKey: 'analytics',
    targetSection: 'fayd_admin_governance',
    group: 'operations',
  },
  {
    id: 'fn_countries_settings',
    titleAr: 'الدول والعملات واللغات',
    titleEn: 'Countries & Localization',
    subtitleAr: 'مصر (نشط) · قطر وعُمان وبريطانيا (في انتظار الافتتاح)',
    subtitleEn: 'EG (Active) · QA, OM & GB (Awaiting Opening)',
    iconKey: 'globe',
    targetSection: 'fayd_admin_governance',
    group: 'system',
  },
  {
    id: 'fn_admin_governance',
    titleAr: 'الإدارة المركزية والمراجعات',
    titleEn: 'Super Admin Governance',
    subtitleAr: 'حوكمة الجهات، التصنيف التعاقدي، العزل، والمزايا',
    subtitleEn: 'Governance, contract classification, isolation & approvals',
    iconKey: 'admin',
    targetSection: 'fayd_admin_governance',
    group: 'system',
    highlighted: true,
  },
];

export const PLATFORM_18_FUNCTIONS: PlatformFunctionTile[] = PLATFORM_FUNCTIONS;
export type ServiceItem12 = PlatformFunctionTile;
export const TWELVE_SERVICES: ServiceItem12[] = PLATFORM_FUNCTIONS;

export type CentralKitchenId =
  | 'hanger_station'
  | 'mall_al_ain'
  | 'bait_al_eila';

export interface CentralKitchenProfile {
  id: CentralKitchenId;
  codeNameEn: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  officialLogoUrl?: string;
  hasOfficialLogo?: boolean;
  locationAr: string;
  locationEn: string;
  coverageAr: string;
  coverageEn: string;
  coverageAreasAr: string[];
  coverageAreasEn: string[];
  isHeadquarters?: boolean;
  servicesAr: string[];
  servicesEn: string[];
  menuCategoriesAr: string[];
  menuCategoriesEn: string[];
  sampleMenuItems: {
    id: string;
    nameAr: string;
    nameEn: string;
    descAr: string;
    descEn: string;
    approvedPrice: number | null;
    rating: number | null;
    dishImageUrl?: string;
  }[];
}

export const THREE_CENTRAL_KITCHENS: CentralKitchenProfile[] = [
  {
    id: 'mall_al_ain',
    codeNameEn: 'MALL AL AIN CENTRAL KITCHEN',
    nameAr: 'مطبخ العين المركزي',
    nameEn: 'Al Ain Central Kitchen',
    imageUrl: mallAlAinImg,
    officialLogoUrl: '/assets/branding/al_ain_central_kitchen_logo.png',
    hasOfficialLogo: true,
    locationAr: 'مدينة بدر — المقر الرئيسي للتشغيل',
    locationEn: 'Badr City — Operations Headquarters',
    coverageAr: 'العاصمة الإدارية، مدينة بدر، مصانع مدينة بدر، الشروق، مدينتي',
    coverageEn: 'New Capital, Badr City, Badr Industrial Factories, El Shorouk, Madinaty',
    coverageAreasAr: ['العاصمة الإدارية', 'مدينة بدر', 'مصانع مدينة بدر', 'الشروق', 'مدينتي'],
    coverageAreasEn: ['New Capital', 'Badr City', 'Badr Factories', 'El Shorouk', 'Madinaty'],
    isHeadquarters: true,
    servicesAr: [
      'المقر الرئيسي لإدارة التشغيل والجودة والهايجين',
      'إنتاج وجبات المصانع والورديات عالية الطاقة',
      'إدارة وتنسيق عقود الإعاشة والمناسبات الكبرى',
    ],
    servicesEn: [
      'Operations HQ for quality assurance & hygiene oversight',
      'High-volume factory & industrial shift meal production',
      'Large-scale subsistence contracts & events dispatch',
    ],
    menuCategoriesAr: ['إعاشة المصانع والورديات', 'وجبات المشويات والولائم', 'باقات الأفراح والمناسبات'],
    menuCategoriesEn: ['Factory & Shift Subsistence', 'Grills & Feasts', 'Weddings & Events'],
    sampleMenuItems: [
      {
        id: 'ma_meal_1',
        nameAr: 'وجبة وردية صناعية متكاملة',
        nameEn: 'Complete Industrial Shift Meal',
        descAr: 'مصممة لتغطية احتياجات الطاقة للعاملين بالمصانع',
        descEn: 'Designed for high-energy factory shift requirements',
        approvedPrice: null,
        rating: null,
      },
      {
        id: 'ma_meal_2',
        nameAr: 'باقة وليمة ومناسبات عائلية',
        nameEn: 'Family Banquet & Occasion Pack',
        descAr: 'تجهيز وتعبئة فاخرة وفق عدد الضيوف المطلوب',
        descEn: 'Premium preparation scaled to guest headcount',
        approvedPrice: null,
        rating: null,
      },
    ],
  },
  {
    id: 'hanger_station',
    codeNameEn: 'HUNGERSTATION CENTRAL KITCHEN',
    nameAr: 'مطبخ أنجر ستيشن المركزي',
    nameEn: 'HUNGERSTATION Central Kitchen',
    imageUrl: hangerStationImg,
    officialLogoUrl: '/assets/branding/hungerstation_official_logo.png',
    hasOfficialLogo: true,
    locationAr: 'أرض المعارض بمدينة نصر',
    locationEn: 'Fairgrounds — Nasr City',
    coverageAr: 'مدينة نصر، القاهرة الجديدة، العاصمة الإدارية، الشروق، مدينتي',
    coverageEn: 'Nasr City, New Cairo, New Capital, El Shorouk, Madinaty',
    coverageAreasAr: ['أرض المعارض بمدينة نصر', 'العاصمة الإدارية', 'القاهرة الجديدة', 'الشروق', 'مدينتي'],
    coverageAreasEn: ['Nasr City Fairgrounds', 'New Capital', 'New Cairo', 'El Shorouk', 'Madinaty'],
    servicesAr: [
      'إنتاج الوجبات الساخنة اليومية للمنشآت الإدارية والتجارية',
      'تجهيز بوفيهات المؤتمرات والضيافة المؤسسية',
      'التعبئة الحرارية المراقبة وفق اشتراطات سلامة الغذاء',
    ],
    servicesEn: [
      'Daily hot meal production for corporate & commercial facilities',
      'Conference buffets and executive hospitality catering',
      'Thermally sealed packaging compliant with food safety rules',
    ],
    menuCategoriesAr: ['وجبات الشركات اليومية', 'بوفيهات المديرين VIP', 'السندوتشات والمخبوزات'],
    menuCategoriesEn: ['Daily Corporate Meals', 'Executive VIP Buffets', 'Sandwiches & Bakery'],
    sampleMenuItems: [
      {
        id: 'hs_meal_1',
        nameAr: 'وجبة بروتين مشوي للشركات (نموذج تشغيلي)',
        nameEn: 'Corporate Grilled Protein Meal (Operational Template)',
        descAr: 'وجبة متكاملة مع أرز وسلطة وتغليف حراري محكم',
        descEn: 'Balanced meal with rice, salad, and thermal sealing',
        approvedPrice: null,
        rating: null,
      },
      {
        id: 'hs_meal_2',
        nameAr: 'بوكس إفطار واجتماعات صباحي',
        nameEn: 'Morning Meeting Breakfast Box',
        descAr: 'تشكيلة مخبوزات وجبن ومشروبات للاجتماعات',
        descEn: 'Curated bakery, cheese, and beverages for meetings',
        approvedPrice: null,
        rating: null,
      },
    ],
  },
  {
    id: 'bait_al_eila',
    codeNameEn: 'BAIT AL EILA CENTRAL KITCHEN',
    nameAr: 'مطبخ بيت العيلة المركزي',
    nameEn: 'Bait Al-Eila Central Kitchen',
    imageUrl: baitAlEilaImg,
    officialLogoUrl: '/assets/branding/bait_al_eila_official_logo.png',
    hasOfficialLogo: true,
    locationAr: 'القاهرة الكبرى — مطبخ الطهي البيتي والولائم',
    locationEn: 'Greater Cairo — Authentic Home-Style Kitchen',
    coverageAr: 'مدينة بدر، الشروق، مدينتي، العاصمة الإدارية، والقاهرة الجديدة',
    coverageEn: 'Badr City, El Shorouk, Madinaty, New Capital & New Cairo',
    coverageAreasAr: ['العاصمة الإدارية', 'مدينة بدر', 'الشروق', 'مدينتي', 'القاهرة الجديدة'],
    coverageAreasEn: ['New Capital', 'Badr City', 'El Shorouk', 'Madinaty', 'New Cairo'],
    servicesAr: [
      'طهي بيتي فاخر بأجود المكونات البلدية (لذة البيت في كل لقمة)',
      'تجهيز صواني العزائم والولائم والطلبات الفورية بالوزن والقطعة',
      'التعبئة الساخنة المعقمة جاهزة للتسليم والتوريد المؤسسي والفردي',
    ],
    servicesEn: [
      'Authentic home-style cooking made with fresh local ingredients',
      'Custom banquet trays and portioned orders ready for delivery',
      'Thermally sealed hot packaging for individual & corporate events',
    ],
    menuCategoriesAr: ['الطيور والمشويات', 'المحاشي والممبار', 'الصواني والطواجن والأرز'],
    menuCategoriesEn: ['Poultry & Grills', 'Stuffed Vegetables & Mombar', 'Oven Bakes & Rice'],
    sampleMenuItems: [
      {
        id: 'be_01',
        nameAr: 'بطة بلدى تلاتة كيلو محشية رز بالخلطة',
        nameEn: 'Local Duck (3kg) Stuffed with Spiced Rice',
        descAr: 'بطة بلدي محمرة بالفرن بعناية ومحشوة بأرز الخلطة والكبد والقوانص والمكسرات',
        descEn: 'Slow-roasted 3kg Egyptian duck stuffed with aromatic liver rice',
        approvedPrice: 500,
        rating: 4.9,
        dishImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.19.10_PM__2__b8555681.jpeg',
      },
      {
        id: 'be_02',
        nameAr: 'كفتة شوى بلدى على الفحم الطبيعي',
        nameEn: 'Local Charcoal Grilled Kofta Skewers',
        descAr: 'كفتة لحم بلدي طازجة متبلة ومشوية على الفحم بنكهة بيتي أصيلة تفتح النفس',
        descEn: 'Charcoal-grilled seasoned Egyptian beef kofta skewers',
        approvedPrice: 350,
        rating: 4.9,
        dishImageUrl: charcoalGrillsImg,
      },
      {
        id: 'be_03',
        nameAr: 'شيش طاووق دجاج بلدي متبل على الفحم',
        nameEn: 'Charcoal-Grilled Marinated Shish Tawook',
        descAr: 'أسياخ شيش طاووق دجاج طري متبل بالبصل والفلفل الألوان والمشوي على الفحم',
        descEn: 'Succulent marinated chicken skewers grilled with fresh peppers & onions',
        approvedPrice: 320,
        rating: 4.8,
        dishImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.19.09_PM_46e0d50a.jpeg',
      },
      {
        id: 'be_04',
        nameAr: 'صينية مكرونة بشاميل باللحمة المفرومة',
        nameEn: 'Golden Baked Macarona Bechamel Tray',
        descAr: 'مكرونة قلم محشوة باللحم المفروم المتبل وطبقة بشاميل كريمية محمرة بالفرن',
        descEn: 'Layered Egyptian pasta bake with seasoned minced beef & bubbly golden bechamel',
        approvedPrice: 260,
        rating: 4.9,
        dishImageUrl: macaronaBechamelImg,
      },
      {
        id: 'be_05',
        nameAr: 'حمام محشى بلدى ع التحمير مع رز بالخلطة',
        nameEn: 'Stuffed Local Pigeon (2pcs) with Spiced Rice',
        descAr: 'حمام بلدي محشي أرز بالخلطة والكبد جاهز ومحمر بلون ذهبي شهي',
        descEn: 'Tender stuffed Egyptian pigeons paired with seasoned rice',
        approvedPrice: 400,
        rating: 5.0,
        dishImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.19.10_PM__1__bc8d562b.jpeg',
      },
      {
        id: 'be_06',
        nameAr: 'سيرفيس دجاج بانيه مقرمش (1.5 كجم)',
        nameEn: 'Crispy Breaded Chicken Pane Platter (1.5 kg)',
        descAr: 'صدور دجاج بانيه بلدي مقرمشة ومتبلة بخلطة بيت العيلة ومحمرة حتى اللون الذهبي',
        descEn: 'Golden crispy Egyptian-style breaded chicken pane platter',
        approvedPrice: 310,
        rating: 4.8,
        dishImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.19.09_PM__1__97acc211.jpeg',
      },
      {
        id: 'be_07',
        nameAr: 'كيلو محشى مشكل (كوسة وفلفل وباذنجان وورق عنب)',
        nameEn: 'Mixed Stuffed Vegetables (1 kg)',
        descAr: 'تشكيلة محاشي بيتي طازجة من الكوسة والباذنجان والفلفل وورق العنب بالأرز والخضرة',
        descEn: 'Zucchini, eggplant, bell peppers & vine leaves stuffed with herb rice',
        approvedPrice: 150,
        rating: 4.9,
        dishImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.19.09_PM__2__a0c566b4.jpeg',
      },
      {
        id: 'be_08',
        nameAr: 'كيلو ممبار بلدي متحمر ومقرمش بالسيرفيس',
        nameEn: 'Crispy Fried Stuffed Mombar (1 kg)',
        descAr: 'ممبار بلدي محشي بالأرز والخلطة ومحمر مقرمش مع البقدونس الطازج',
        descEn: 'Golden crisp Egyptian stuffed mombar packed hot and ready to serve',
        approvedPrice: 280,
        rating: 4.9,
        dishImageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_1.19.10_PM_0f270cf2.jpeg',
      },
      {
        id: 'be_09',
        nameAr: 'طاسة كبدة جملي بلدي بالثوم والفلفل على الصاج',
        nameEn: 'Sizzling Camel Liver Griddle Platter',
        descAr: 'كبدة جملي طازجة محضرة على الصاج الساخن بالثوم والفلفل الأخضر الحار والليمون',
        descEn: 'Sautéed fresh camel liver with garlic, green chilies, and lemon on a hot griddle',
        approvedPrice: 360,
        rating: 5.0,
        dishImageUrl: camelLiverImg,
      },
      {
        id: 'be_10',
        nameAr: 'أكياس لحوم أضاحي بلدي طازجة معقمة (2 كجم)',
        nameEn: 'Fresh Baladi Meat Packs for Eid & Banquets (2 kg)',
        descAr: 'لحم بقري بلدي طازج من مزارع الوطنية معبأ ومفرغ من الهواء ومختوم بالكشف البيطري',
        descEn: 'Vacuum-packed fresh municipal beef portions ready for corporate distribution',
        approvedPrice: 810,
        rating: 4.9,
        dishImageUrl: eidMeatPacksImg,
      },
      {
        id: 'be_11',
        nameAr: 'فطير وبيتزا شرقي باللحم والجبن الرومي والسجق',
        nameEn: 'Egyptian Savory Meat & Cheese Feteer Pizza',
        descAr: 'فطيرة شرقي مورقة مخبوزة بالسمن البلدي والجبنة الرومي والسجق البلدي المتبل',
        descEn: 'Flaky layered Egyptian savory feteer pizza with spiced sausage & melted cheese',
        approvedPrice: 240,
        rating: 4.8,
        dishImageUrl: pizzaMixImg,
      },
    ],
  },
];

export interface OrganizedCateringMenu {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  shortLabelAr: string;
  shortLabelEn: string;
  accentGradient: string;
  imageUrl: string;
  sampleDishesAr: string[];
  sampleDishesEn: string[];
  clientTierNoteAr: string;
  clientTierNoteEn: string;
}

export const EIGHT_CATERING_MENUS: OrganizedCateringMenu[] = [
  {
    id: 'menu_workers',
    order: 1,
    titleAr: 'منيو العمالة',
    titleEn: 'Workforce Menu',
    shortLabelAr: 'منيو العمالة',
    shortLabelEn: 'Workers',
    accentGradient: 'from-[#4C1D95] to-[#3B0764]',
    imageUrl: factoryStripImg,
    sampleDishesAr: ['وجبة وردية ساخنة (ربع دجاج + أرز + خضار + سلطة)', 'وجبة كفتة مشوية + مكرونة + طحينة', 'علب ميكرويف حرارية للورديات'],
    sampleDishesEn: ['Hot Shift Meal (Quarter Chicken + Rice + Veg)', 'Grilled Kofta + Pasta Tray', 'Microwave-Safe Shift Box'],
    clientTierNoteAr: 'تعاقدات المصانع وخطوط الإنتاج',
    clientTierNoteEn: 'Factory & Shift Contracts',
  },
  {
    id: 'menu_conferences',
    order: 2,
    titleAr: 'منيو المؤتمرات',
    titleEn: 'Conferences Menu',
    shortLabelAr: 'المؤتمرات',
    shortLabelEn: 'Conferences',
    accentGradient: 'from-[#581C87] to-[#4C1D95]',
    imageUrl: vipMajlisBanquetImg,
    sampleDishesAr: ['كوفي بريك ومخبوزات فرنسية فاخرة', 'بوكس غداء تنفيذي VIP', 'سناكس وحلويات شرقية وغربية'],
    sampleDishesEn: ['Luxury Coffee Break & Pastries', 'VIP Executive Lunch Box', 'Finger Food & Pastries'],
    clientTierNoteAr: 'المنتديات والفعاليات الكبرى',
    clientTierNoteEn: 'Summits & Large Events',
  },
  {
    id: 'menu_meetings',
    order: 3,
    titleAr: 'منيو الاجتماعات',
    titleEn: 'Meetings Menu',
    shortLabelAr: 'الاجتماعات',
    shortLabelEn: 'Meetings',
    accentGradient: 'from-[#4C1D95] to-[#581C87]',
    imageUrl: boardroomMeetingsImg,
    sampleDishesAr: ['بوكس إفطار مجالس الإدارة', 'ساندوتشات كلوب وكرواسون محشو', 'قهوة مختصة ومشروبات ساخنة'],
    sampleDishesEn: ['Boardroom Breakfast Box', 'Club Sandwiches & Croissants', 'Specialty Coffee Service'],
    clientTierNoteAr: 'اجتماعات الشركات والوفود',
    clientTierNoteEn: 'Corporate Boardrooms',
  },
  {
    id: 'menu_weddings',
    order: 4,
    titleAr: 'منيو المناسبات والأفراح',
    titleEn: 'Events & Weddings Menu',
    shortLabelAr: 'المناسبات والأفراح',
    shortLabelEn: 'Weddings',
    accentGradient: 'from-[#3B0764] to-[#4C1D95]',
    imageUrl: '/assets/aistudio/image_4922ff2a.jpg',
    sampleDishesAr: ['ولائم صواني العزائم الملكية', 'مشويات فحم وحمام محشي', 'تورتة وحلويات الأفراح وأعياد الميلاد'],
    sampleDishesEn: ['Royal Banquet Feast Trays', 'Charcoal Grills & Stuffed Pigeon', 'Wedding & Birthday Desserts'],
    clientTierNoteAr: 'أفراح · أعياد ميلاد · احتفالات',
    clientTierNoteEn: 'Weddings, Birthdays & Galas',
  },
  {
    id: 'menu_charity',
    order: 5,
    titleAr: 'منيو أعمال الخير',
    titleEn: 'Charity Deeds Menu',
    shortLabelAr: 'أعمال الخير',
    shortLabelEn: 'Charity',
    accentGradient: 'from-[#4C1D95] to-[#3B0764]',
    imageUrl: charityMealsCleanImg,
    sampleDishesAr: ['وجبات إطعام ساخنة معقمة', 'كراتين إطعام ومواد غذائية موثقة', 'وجبات إفطار صائم والمناسبات'],
    sampleDishesEn: ['Sealed Hot Charity Meals', 'Documented Food Aid Cartons', 'Seasonal Feeding Campaigns'],
    clientTierNoteAr: 'مبادرات الإطعام بتوثيق كامل',
    clientTierNoteEn: 'Verified Feeding Campaigns',
  },
  {
    id: 'menu_hospitals',
    order: 6,
    titleAr: 'منيو المستشفيات والمرضى',
    titleEn: 'Hospitals & Patients Menu',
    shortLabelAr: 'المستشفيات والمرضى',
    shortLabelEn: 'Hospitals',
    accentGradient: 'from-[#5A189A] to-[#4B148C]',
    imageUrl: hospitalClinicalMealImg,
    sampleDishesAr: ['وجبات منخفضة الصوديوم والدهون', 'بروتين مسلوق وسوتيه معقم طبياً', 'وجبات مخصصة للطاقم الطبي والمناوبات'],
    sampleDishesEn: ['Low-Sodium Therapeutic Meals', 'Steamed Clinical Protein & Veggies', 'Medical Staff Shift Meals'],
    clientTierNoteAr: 'اشتراطات طبية وغذائية دقيقة',
    clientTierNoteEn: 'Strict Clinical Nutrition',
  },
  {
    id: 'menu_healthy_gym',
    order: 7,
    titleAr: 'منيو الهيلثي والمراكز الرياضية وصالات الجيم',
    titleEn: 'Healthy, Sports & Gym Menu',
    shortLabelAr: 'الهيلثي والجيم',
    shortLabelEn: 'Healthy & Gym',
    accentGradient: 'from-[#5A189A] to-[#4B148C]',
    imageUrl: healthyBowlCleanImg,
    sampleDishesAr: ['صدور دجاج مشوية بالزعتر + كينوا وأرز بني', 'أطباق هاي بروتين محسوبة السعرات', 'سمك سلمون فيليه وخضار مشوي'],
    sampleDishesEn: ['Herb Chicken + Quinoa & Brown Rice', 'Calorie-Counted High Protein Bowls', 'Grilled Salmon & Steamed Greens'],
    clientTierNoteAr: 'محسوب السعرات والبروتين',
    clientTierNoteEn: 'Macro & Calorie Tracked',
  },
  {
    id: 'menu_open_buffet',
    order: 8,
    titleAr: 'منيو الأوبن بوفيه',
    titleEn: 'Open Buffet Menu',
    shortLabelAr: 'الأوبن بوفيه',
    shortLabelEn: 'Open Buffet',
    accentGradient: 'from-[#3B0764] to-[#581C87]',
    imageUrl: '/assets/catering/open_buffet.jpg',
    sampleDishesAr: ['بوفيه مفتوح متكامل (مقبلات + ساخن + مشويات + حلويات)', 'محطات طهي حية (Live Cooking Stations)', 'تجهيز كامل بالشيفات وفريق الضيافة'],
    sampleDishesEn: ['Full Open Buffet Spread', 'Live Cooking & Carving Stations', 'Chefs & Full Hospitality Crew'],
    clientTierNoteAr: 'شامل التجهيز والمعدات والخدمة',
    clientTierNoteEn: 'Full Setup, Warmers & Crew',
  },
];

export const CENTRAL_KITCHENS = THREE_CENTRAL_KITCHENS;

export interface CarouselShowcaseSlide {
  id: string;
  altAr: string;
  altEn: string;
  imageUrl: string;
  targetSection: string;
  kitchenId?: CentralKitchenId;
}

export const MAIN_SERVICES_PHOTO_STRIP: CarouselShowcaseSlide[] = [
  {
    id: 'strip_mall_al_ain',
    altAr: 'مطبخ ومركز العين — مدينة بدر',
    altEn: 'Mall Al Ain Central Kitchen — Badr City',
    imageUrl: mallAlAinImg,
    targetSection: 'kitchen_detail',
    kitchenId: 'mall_al_ain',
  },
  {
    id: 'strip_hanger',
    altAr: 'مطبخ هنجر ستيشن المركزي — أرض المعارض بمدينة نصر',
    altEn: 'Hanger Station Central Kitchen — Fairgrounds Nasr City',
    imageUrl: hangerStationImg,
    targetSection: 'kitchen_detail',
    kitchenId: 'hanger_station',
  },
  {
    id: 'strip_bait_al_eila',
    altAr: 'مطبخ بيت العيلة المركزي — طعم الدفء البيتي',
    altEn: 'Bait Al-Eila Central Kitchen — Home-Style Menu',
    imageUrl: baitAlEilaImg,
    targetSection: 'kitchen_detail',
    kitchenId: 'bait_al_eila',
  },
  {
    id: 'strip_spread_vip',
    altAr: 'عروض الوجبات والضيافة المؤسسية',
    altEn: 'Corporate Meals & Hospitality',
    imageUrl: cateringVipSpreadImg,
    targetSection: 'service_meals_offer',
  },
  {
    id: 'strip_weddings_buffet',
    altAr: 'بطاقات الأفراح والبوفيه المفتوح والضيافة الفاخرة',
    altEn: 'Weddings, Open Buffets & Luxury Hospitality',
    imageUrl: '/assets/aistudio/image_4922ff2a.jpg',
    targetSection: 'service_weddings',
  },
];

export const FACTORY_CORPORATE_PHOTO_STRIP: CarouselShowcaseSlide[] = [
  {
    id: 'fac_line_1',
    altAr: 'تغذية خطوط الإنتاج والمصانع',
    altEn: 'Factory Dining & Shift Meals',
    imageUrl: factoryStripImg,
    targetSection: 'service_corporate',
  },
  {
    id: 'fac_kitchen_1',
    altAr: 'إنتاج وجبات الشركات والمواقع — مدينة بدر',
    altEn: 'Central Kitchen Corporate Production',
    imageUrl: mallAlAinImg,
    targetSection: 'service_catering_req',
  },
  {
    id: 'fac_packing_1',
    altAr: 'أطباق وولائم مطبخ بيت العيلة المركزية',
    altEn: 'Bait Al-Eila Feasts & Thermal Packaging',
    imageUrl: baitAlEilaImg,
    targetSection: 'kitchen_detail',
    kitchenId: 'bait_al_eila',
  },
  {
    id: 'fac_prep_1',
    altAr: 'تجهيز وجبات الموظفين — أرض المعارض بمدينة نصر',
    altEn: 'Hygienic Employee Meal Assembly — Nasr City',
    imageUrl: hangerStationImg,
    targetSection: 'service_hygiene',
  },
];

export const OFFERS_PHOTO_STRIP: CarouselShowcaseSlide[] = [
  {
    id: 'off_meals_1',
    altAr: 'عروض وجبات الشركات والمشويات',
    altEn: 'Corporate Meal & Grill Offers',
    imageUrl: offersStripImg,
    targetSection: 'service_meals_offer',
  },
  {
    id: 'off_vip_1',
    altAr: 'ولائم وبوفيهات المناسبات',
    altEn: 'VIP Banquets & Occasions',
    imageUrl: cateringVipSpreadImg,
    targetSection: 'service_weddings',
  },
  {
    id: 'off_dates_1',
    altAr: 'تمور المجدول والبرحي والوادي والفرافرة — أفضل جودة في مصر منذ الإنتاجية وحتى التعبئة والتغليف',
    altEn: 'Medjool, Barhi, Wadi & Farafra Dates — Farm Production to Packaging',
    imageUrl: '/assets/catering/siwa_dates.jpg',
    targetSection: 'al_ain_restaurant:dates_world_al_ain',
  },
  {
    id: 'off_coffee_nuts_1',
    altAr: 'محمصة البن والمكسرات الفاخرة — عالم من المذاقات',
    altEn: 'Artisanal Coffee Roastery & Luxury Nuts',
    imageUrl: coffeeNutsImg,
    targetSection: 'al_ain_restaurant:coffee_nuts',
  },
  {
    id: 'off_charity_1',
    altAr: 'تجهيز وجبات الإطعام والمناسبات الكبرى',
    altEn: 'Bulk Charity & Event Meal Boxes',
    imageUrl: '/assets/catering/charity_meals.jpg',
    targetSection: 'service_events_trips',
  },
];

export const SWIPEABLE_GALLERY_SLIDES = MAIN_SERVICES_PHOTO_STRIP;

export const FOOD_CATEGORIES = [
  { id: 'breakfast', ar: 'الإفطار', en: 'Breakfast' },
  { id: 'pizza', ar: 'البيتزا', en: 'Pizza' },
  { id: 'foul_taameya', ar: 'الفول والطعمية', en: 'Foul & Falafel' },
  { id: 'pastries', ar: 'المعجنات', en: 'Pastries' },
  { id: 'sushi', ar: 'السوشي', en: 'Sushi' },
  { id: 'pasta', ar: 'الباستا', en: 'Pasta' },
  { id: 'desserts', ar: 'الحلويات', en: 'Desserts' },
  { id: 'grills', ar: 'المشويات', en: 'Grills' },
  { id: 'koshary', ar: 'الكشري', en: 'Koshary' },
  { id: 'sandwiches', ar: 'السندوتشات', en: 'Sandwiches' },
  { id: 'juices', ar: 'العصائر', en: 'Juices' },
  { id: 'full_meals', ar: 'الوجبات الكاملة', en: 'Full Meals' },
  { id: 'delivery', ar: 'الدليفري', en: 'Delivery' },
  { id: 'restaurants', ar: 'المطاعم', en: 'Restaurants' },
  { id: 'reservations', ar: 'الحجوزات', en: 'Reservations' },
];

export type RoleScope =
  | 'visitor'
  | 'individual'
  | 'corporate_client'
  | 'kitchen_manager'
  | 'system_admin';

export interface Phase1RoleConfig {
  id: RoleScope;
  nameAr: string;
  nameEn: string;
  permissionsAr: string[];
  permissionsEn: string[];
  canViewInvoices: boolean;
  canViewAdminPanel: boolean;
  canEditKitchens: boolean;
}

export const PHASE1_ROLES: Phase1RoleConfig[] = [
  {
    id: 'visitor',
    nameAr: 'زائر عام',
    nameEn: 'Public Visitor',
    permissionsAr: ['تصفح الوظائف الـ 20', 'استعراض المطابخ المركزية', 'طلب عرض سعر'],
    permissionsEn: ['Browse 20 Functions', 'View Central Kitchens', 'Submit RFQ'],
    canViewInvoices: false,
    canViewAdminPanel: false,
    canEditKitchens: false,
  },
  {
    id: 'individual',
    nameAr: 'حساب أفراد / عملاء',
    nameEn: 'Customer Account',
    permissionsAr: ['السوق والوجبات', 'سلة الطلبات وحفظها', 'دعم العملاء'],
    permissionsEn: ['Marketplace & Dining', 'Persistent Cart', 'Customer Support'],
    canViewInvoices: true,
    canViewAdminPanel: false,
    canEditKitchens: false,
  },
  {
    id: 'corporate_client',
    nameAr: 'مصانع وشركات وتجار',
    nameEn: 'Factory / Merchant Tenant',
    permissionsAr: ['مساحة عمل معزولة', 'طلبات التوريد والكتالوج', 'الفواتير والتسويات'],
    permissionsEn: ['Isolated Tenant Workspace', 'Orders & Catalog', 'Invoices & Payouts'],
    canViewInvoices: true,
    canViewAdminPanel: false,
    canEditKitchens: false,
  },
  {
    id: 'kitchen_manager',
    nameAr: 'إدارة التشغيل والمطابخ',
    nameEn: 'Operations & Kitchens',
    permissionsAr: ['متابعة طلبات عروض الأسعار', 'مراجعة تشغيل المطابخ', 'سجل العمليات'],
    permissionsEn: ['Review RFQ Orders', 'Kitchen Ops Control', 'Activity Log'],
    canViewInvoices: true,
    canViewAdminPanel: true,
    canEditKitchens: true,
  },
  {
    id: 'system_admin',
    nameAr: 'المدير الأعلى للمنصة',
    nameEn: 'Super Administrator',
    permissionsAr: ['قبول ورفض الحسابات', 'العزل متعدد المستأجرين', 'بوابات الدفع والإشعارات'],
    permissionsEn: ['Approve & Reject Accounts', 'Multi-Tenant Isolation', 'Gateways & Alerts'],
    canViewInvoices: true,
    canViewAdminPanel: true,
    canEditKitchens: true,
  },
];

export type TaskCompletionStatus =
  | '1. لم تبدأ'
  | '2. قيد التنفيذ'
  | '3. واجهة منفذة فقط'
  | '4. الوظيفة منفذة'
  | '5. الربط الفعلي مكتمل'
  | '6. الاختبار الفعلي ناجح'
  | '7. مكتمل ومعتمد';

export interface Phase1VerificationItem {
  id: string;
  featureAr: string;
  featureEn: string;
  status: TaskCompletionStatus;
  notesAr: string;
  notesEn: string;
}

export const PHASE1_AUDIT_REPORT: Phase1VerificationItem[] = [
  {
    id: 'chk_layout',
    featureAr: 'الهوية البصرية المعتمدة BASIT | باسط (#852BEB / #F4E600 / #FAF9FC / #241936)',
    featureEn: 'Approved BASIT Identity (#852BEB / #F4E600 / #FAF9FC / #241936)',
    status: '7. مكتمل ومعتمد',
    notesAr: 'تم توحيد الشعار الرسمي وأيقونات الويب والتطبيق 3D وPWA بدون تشويه.',
    notesEn: 'Unified official brand marks, 3D icons, and PWA assets with zero distortion.',
  },
  {
    id: 'chk_countries',
    featureAr: 'النطاق الجغرافي المعتمد (مصر نشطة + قطر وعُمان وبريطانيا في انتظار الافتتاح) وبوابات الدفع',
    featureEn: 'Approved Markets (EG Active + QA/OM/GB Awaiting Opening) & Payment Gateways',
    status: '6. الاختبار الفعلي ناجح',
    notesAr: 'أعلام رسمية لـ EG / QA / OM / GB مع ربط بوابات الدفع.',
    notesEn: 'Official flags for EG / QA / OM / GB with awaiting-opening gating.',
  },
  {
    id: 'chk_tenant',
    featureAr: 'العزل الفعلي متعدد الأطراف (Multi-Tenant Isolation) ومساحة عمل المصانع والتجار',
    featureEn: 'Verified Multi-Tenant Isolation & Factory/Merchant Workspaces',
    status: '6. الاختبار الفعلي ناجح',
    notesAr: 'تطبيق قواعد Firestore حسب tenantId وownerUid وعدم كشف بيانات أي حساب لآخر.',
    notesEn: 'Firestore rules enforce strict tenantId & ownerUid isolation across workspaces.',
  },
  {
    id: 'chk_admin_queue',
    featureAr: 'لوحة الإدارة المركزية وطلبات الانضمام وبوابات الدفع والإشعارات الحقيقية',
    featureEn: 'Super Admin Onboarding Approvals, Live Payment API & Notifications',
    status: '6. الاختبار الفعلي ناجح',
    notesAr: 'مراجعة الحسابات (قبول/رفض/طلب استكمال/تعليق)، مسارات Express /api/payments/* وإشعارات Firestore.',
    notesEn: 'Full account lifecycle queue, Express payment intent/webhook routes, and real Firestore notifications.',
  },
];

export const PHASE1_I18N = {
  ar: {
    brandName: 'BASIT | باسط',
    brandSub: 'الذراع الرقمي للشركة الوطنية اللوجستية',
    officialLogoPlaceholder: 'الشعار الرسمي المعتمد — BASIT | باسط',
    uploadLogoHint: 'رفع أو استبدال الشعار',
    resetLogo: 'إعادة ضبط',
    searchPlaceholder: 'ابحث في الإعاشة، المصانع والشركات، الترفيه والمزايا، اعمل الخير، كفارات اليمين...',
    scopes: {
      all: 'الكل',
      products: 'المنتجات',
      catering: 'خدمات الكيترينج',
      companies: 'الشركات',
      offers: 'العروض والمزايا',
      places: 'الترفيه والجهات',
      invoices: 'الفواتير',
      gift_cards: 'القسائم',
      meals: 'الإعاشة والوجبات',
      kitchens: 'المطابخ',
    },
    nav: {
      home: 'المنصة',
      services: 'الوظائف الـ 20',
      kitchens: 'المطابخ',
      admin: 'الحساب والإدارة',
      enterpriseLegacy: 'مركز المستندات وPDF',
    },
    heroBadge: 'BASIT | باسط — الذراع الرقمي للشركة الوطنية اللوجستية',
    heroTitle: 'تشغيل منظومة الإعاشة والتغذية والترفيه والمزايا للكيانات المتعاقدة مع الوطنية اللوجستية',
    heroDesc: 'بوابات مستقلة وآمنة لكل مصنع وشركة، مزايا وترفيه للعاملين، خدمات لوجستية مكملة، واقسام مستقلة لأعمال الخير وكفارات اليمين.',
    heroPrimaryCta: 'بوابة تسجيل وانضمام الجهات',
    heroSecondaryCta: 'بوابة الجهة المتعاقدة',
    servicesHeading: 'منظومة وظائف BASIT | باسط التشغيلية (20 مساراً)',
    servicesSubheading: 'إعاشة المصانع والشركات · المزايا والترفيه · الوطنية اللوجستية · اعمل الخير · كفارات اليمين',
    galleryHeading: 'جولة سريعة في المرافق والمطابخ المركزية',
    galleryHint: 'اسحب البطاقات أو اضغط لفتح ملف المطبخ مباشرة',
    kitchensHeading: 'المطابخ المركزية المعتمدة',
    kitchensSubheading: 'ثلاثة مطابخ مركزية متكاملة بتغطية جغرافية منظمة',
    awaitingApproval: 'بانتظار اعتماد السعر',
    hqLabel: 'المقر الرئيسي للتشغيل',
    locationLabel: 'الموقع',
    coverageLabel: 'نطاق الخدمة الفعلي',
    servicesOfferedLabel: 'الخدمات المتوفرة',
    menusLabel: 'قوائم وتصنيفات الطعام',
    openKitchenPage: 'فتح صفحة المطبخ المستقلة',
    backToAllKitchens: 'العودة لكل المطابخ',
    requestKitchenQuote: 'طلب عرض سعر لهذا المطبخ',
    addToCartTest: 'إضافة للسلة',
    cartTitle: 'سلة الطلبات',
    cartEmpty: 'سلة الطلبات فارغة حالياً',
    cartItemQty: 'الكمية',
    cartRemove: 'حذف',
    cartSubtotal: 'الإجمالي المقدر للبنود المعتمدة',
    cartUnapprovedNote: 'بنود بانتظار اعتماد السعر النهائي من الإدارة',
    cartConvertQuote: 'تحويل السلة لطلب عرض سعر رسمي',
    notificationsTitle: 'مركز الإشعارات الفورية',
    notificationsScopedBy: 'تنبيهات حقيقية مقيدة بصلاحيات الحساب النشط:',
    noNotifications: 'لا توجد إشعارات جديدة مسجلة لهذا الحساب.',
    supportFloatingTitle: 'مركز دعم BASIT | باسط',
    supportWelcome: 'مرحباً بك في دعم منصة BASIT | باسط. اكتب استفسارك أو اختر إجراءً مباشراً.',
    supportSend: 'إرسال',
    quoteModalTitle: 'نموذج طلب عرض سعر رسمي',
    joinKitchenTitle: 'طلب انضمام كمطبخ مركزي',
    roleSwitcherLabel: 'عرض صلاحية المعاينة',
    footerBrand: 'BASIT | باسط',
    footerRights: 'منصة رقمية متكاملة للمصانع، التجار، العملاء، التوصيل، والفرص',
    illustrativePhotoNote: 'صورة تشغيلية توضيحية للمرفق',
  },
  en: {
    brandName: 'BASIT | باسط',
    brandSub: 'Multi-Tenant Commerce, Factories, Merchants, Delivery & Opportunities',
    officialLogoPlaceholder: 'Official BASIT | باسط Brand Mark',
    uploadLogoHint: 'Upload or Replace Logo',
    resetLogo: 'Reset',
    searchPlaceholder: 'Search factories, merchants, dining, offers, delivery, invoices...',
    scopes: {
      all: 'All',
      products: 'Products',
      catering: 'Catering Services',
      companies: 'Companies',
      offers: 'Offers',
      places: 'Places',
      invoices: 'Invoices',
      gift_cards: 'Gift Cards',
      meals: 'Meals',
      kitchens: 'Kitchens',
    },
    nav: {
      home: 'Platform',
      services: '20 Functions',
      kitchens: 'Kitchens',
      admin: 'Account & Admin',
      enterpriseLegacy: 'Docs & A4 PDF',
    },
    heroBadge: 'BASIT | باسط — Multi-Tenant Operations Platform',
    heroTitle: 'Live Workspaces for Factories, Merchants, Customers, Delivery & Opportunities',
    heroDesc: 'Launch any platform function, manage isolated tenant workspaces, or process approvals and payments.',
    heroPrimaryCta: 'Choose Account / Start',
    heroSecondaryCta: 'Merchant & Factory Portal',
    servicesHeading: '20 Core Interactive Functions',
    servicesSubheading: 'Direct operational access across catalogs, orders, payments, delivery & governance',
    galleryHeading: 'Central Kitchens & Facilities Showcase',
    galleryHint: 'Swipe or tap any facility card to open its workspace',
    kitchensHeading: 'Approved Central Kitchens',
    kitchensSubheading: 'Three dedicated regional central kitchens with defined coverage',
    awaitingApproval: 'Awaiting Price Approval',
    hqLabel: 'Operations Headquarters',
    locationLabel: 'Location',
    coverageLabel: 'Active Service Coverage',
    servicesOfferedLabel: 'Available Services',
    menusLabel: 'Food Categories & Menus',
    openKitchenPage: 'Open Dedicated Kitchen Page',
    backToAllKitchens: 'Back to All Kitchens',
    requestKitchenQuote: 'Request Quote for This Kitchen',
    addToCartTest: 'Add to Cart',
    cartTitle: 'Order Cart',
    cartEmpty: 'Your cart is currently empty',
    cartItemQty: 'Qty',
    cartRemove: 'Remove',
    cartSubtotal: 'Estimated Subtotal (Approved Prices)',
    cartUnapprovedNote: 'Items awaiting final admin price approval',
    cartConvertQuote: 'Convert Cart to Quotation Request',
    notificationsTitle: 'Real-Time Notifications',
    notificationsScopedBy: 'Scoped strictly to the active authenticated account:',
    noNotifications: 'No new notifications recorded for this account.',
    supportFloatingTitle: 'BASIT | باسط Support Center',
    supportWelcome: 'Welcome to BASIT | باسط Support. Send an inquiry or jump to any action.',
    supportSend: 'Send',
    quoteModalTitle: 'Official Quotation Request Form',
    joinKitchenTitle: 'Join as a Central Kitchen',
    roleSwitcherLabel: 'Preview Permission Scope',
    footerBrand: 'BASIT | باسط',
    footerRights: 'Multi-Tenant Platform for Factories, Merchants, Customers, Delivery & Opportunities',
    illustrativePhotoNote: 'Illustrative operational photography',
  },
};
