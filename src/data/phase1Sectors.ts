import marketplaceImg from '../assets/images/basit_marketplace_produce_1795841339643.jpg';
import businessImg from '../assets/images/sector_basit_business_1795835809972.jpg';
const cardImg = '/assets/aistudio/image_31437b35.png';
import healthyImg from '../assets/images/sector_basit_healthy_1795835812014.jpg';
import factoryImg from '../assets/images/sector_factory_system_1795835811281.jpg';
import ownerFinanceImg from '../assets/images/sector_owner_finance_1795835811089.jpg';

export type SectorId =
  | 'marketplace'
  | 'business'
  | 'card'
  | 'healthy'
  | 'factory'
  | 'owner_finance';

export type AppRoute = 'home' | 'sectors' | SectorId;

export type SectorCategoryGroup = 'consumer' | 'operations';

export type SectorIconName =
  | 'shopping-bag'
  | 'briefcase'
  | 'credit-card'
  | 'heart-pulse'
  | 'factory'
  | 'landmark';

export interface SectorHighlightItem {
  titleAr: string;
  descAr: string;
}

export interface BasitSectorDefinition {
  id: SectorId;
  codeEn: string;
  titleAr: string;
  subtitleAr: string;
  summaryAr: string;
  categoryGroup: SectorCategoryGroup;
  categoryLabelAr: string;
  iconName: SectorIconName;
  imageUrl: string;
  imageAltAr: string;
  featuredGoldAccent?: boolean;
  overviewPoints: SectorHighlightItem[];
  operationalScope: SectorHighlightItem[];
  nextPhaseNotes: string[];
}

export const PHASE1_SECTORS: BasitSectorDefinition[] = [
  {
    id: 'marketplace',
    codeEn: 'BASIT MARKETPLACE',
    titleAr: 'سوق باسط',
    subtitleAr: 'الطلبات اليومية والمنتجات الطازجة والتوصيل المنظم',
    summaryAr: 'منصة تجارية موحدة للخضروات الطازجة، السلع الغذائية، والوجبات الجاهزة بجودة عالية.',
    categoryGroup: 'consumer',
    categoryLabelAr: 'الخدمات اليومية',
    iconName: 'shopping-bag',
    imageUrl: marketplaceImg,
    imageAltAr: 'صندوق منتجات طازجة ووجبات جاهزة من سوق باسط',
    overviewPoints: [
      {
        titleAr: 'تصفح منظم للأقسام الغذائية',
        descAr: 'هيكلة واضحة للفئات اليومية تشمل المنتجات الطازجة والوجبات والمشروبات دون ازدحام بصري.',
      },
      {
        titleAr: 'عرض واضح للبطاقات والأسعار',
        descAr: 'تصميم بطاقات متناسقة مقاس 4:3 تبرز جودة المنتج وسرعة الوصول إليه بلمسة واحدة.',
      },
      {
        titleAr: 'تجهيز وتغليف معتمد',
        descAr: 'إعداد الطلبات وفق معايير الشركة الوطنية اللوجستية لضمان السلامة الغذائية والسرعة.',
      },
    ],
    operationalScope: [
      {
        titleAr: 'فئة المنتجات الطازجة',
        descAr: 'خضروات وفواكه منتقاة ومغلفة يوميًا بمستوى عرض تجاري متكامل.',
      },
      {
        titleAr: 'فئة الوجبات السريعة والجاهزة',
        descAr: 'تشكيلة وجبات متوازنة جاهزة للتوصيل الفوري للأفراد والمكاتب.',
      },
    ],
    nextPhaseNotes: [
      'ربط كتالوج المنتجات الفعلي وسلة المشتريات في المرحلة الثانية.',
      'تفعيل تتبع حالة الطلب والعناوين المحفوظة للمستخدمين.',
    ],
  },
  {
    id: 'business',
    codeEn: 'BASIT BUSINESS',
    titleAr: 'باسط للأعمال',
    subtitleAr: 'خدمات الشركات والمؤسسات والضيافة التنفيذية',
    summaryAr: 'حلول إعاشة متكاملة للمؤتمرات والاجتماعات والشركات بعقود مرنة ومعايير ضيافة راقية.',
    categoryGroup: 'operations',
    categoryLabelAr: 'الأعمال والتشغيل',
    iconName: 'briefcase',
    imageUrl: businessImg,
    imageAltAr: 'مائدة ضيافة تنفيذية ومأكولات شركات من باسط للأعمال',
    overviewPoints: [
      {
        titleAr: 'ضيافة الاجتماعات والمؤتمرات',
        descAr: 'تنسيق بوفيهات وعبوات ضيافة مخصصة للوفود والفعاليات الإدارية والمؤسسية.',
      },
      {
        titleAr: 'قوائم تعاقد مخصصة للشركات',
        descAr: 'باقات شهرية وأسبوعية مصممة لفرق العمل والمقرات الإدارية بكفاءة تشغيلية عالية.',
      },
      {
        titleAr: 'متابعة موحدة للجهات المتعاقدة',
        descAr: 'إطار عمل منظم يفصل احتياجات كل شركة بدقة ووضوح في جدول التوريد.',
      },
    ],
    operationalScope: [
      {
        titleAr: 'تجهيز الفعاليات الكبرى',
        descAr: 'تغطية المؤتمرات والاجتماعات التنفيذية بأطقم تقديم ومعدات ضيافة متكاملة.',
      },
      {
        titleAr: 'إمداد المقرات الإدارية',
        descAr: 'جدول وجبات يومي منضبط المواعيد للشركات والبنوك والمؤسسات.',
      },
    ],
    nextPhaseNotes: [
      'إتاحة بوابة طلبات عروض الأسعار وجدولة العقود المؤسسية في المرحلة القادمة.',
      'تخصيص مساحات متابعة مستقلة لمسؤولي الشركات المتعاقدة.',
    ],
  },
  {
    id: 'card',
    codeEn: 'BASIT CARD',
    titleAr: 'بطاقة باسط',
    subtitleAr: 'مزايا الأعضاء والخصومات الحصرية والترفيه العائلي',
    summaryAr: 'بطاقة ولاء ومزايا رقمية تمنح حامليها خصومات معتمدة في المطاعم والترفيه والخدمات.',
    categoryGroup: 'consumer',
    categoryLabelAr: 'الخدمات اليومية',
    iconName: 'credit-card',
    imageUrl: cardImg,
    imageAltAr: 'بطاقة باسط الرسمية المعتمدة — الوجه الأمامي والخلفي',
    featuredGoldAccent: true,
    overviewPoints: [
      {
        titleAr: 'هوية رقمية موحدة للمزايا',
        descAr: 'بطاقة ذكية تجمع العروض التفضيلية والخصومات المباشرة في شبكة الشركاء المعتمدين.',
      },
      {
        titleAr: 'مزايا العائلة والترفيه',
        descAr: 'باقات متنوعة تشمل المطاعم، الأنشطة العائلية، والخدمات السياحية والفندقية.',
      },
      {
        titleAr: 'تجربة تفعيل واستخدام سلسة',
        descAr: 'تصميم واضح على شاشة الهاتف يسهّل استعراض العروض والوصول إلى تفاصيل كل ميزة.',
      },
    ],
    operationalScope: [
      {
        titleAr: 'شبكة المطاعم والشركاء',
        descAr: 'مزايا مخصصة وخصومات تعاقدية واضحة لحاملي بطاقة باسط.',
      },
      {
        titleAr: 'قسائم الترفيه والمناسبات',
        descAr: 'عروض موسمية وعائلية مصممة للعاملين بالكيانات المتعاقدة.',
      },
    ],
    nextPhaseNotes: [
      'إطلاق نظام رمز الاستجابة الرقمي وسجل الاستفادة المباشر في المراحل القادمة.',
      'ربط ملف العضوية والتحقق من البطاقات عبر حسابات المستخدمين.',
    ],
  },
  {
    id: 'healthy',
    codeEn: 'BASIT HEALTHY',
    titleAr: 'باسط هيلثي',
    subtitleAr: 'وجبات صحية متوازنة وأنظمة غذائية يومية',
    summaryAr: 'برامج تغذية حديثة محسوبة القيم الغذائية تجمع بين الطعم الطازج وجودة المكونات.',
    categoryGroup: 'consumer',
    categoryLabelAr: 'الخدمات اليومية',
    iconName: 'heart-pulse',
    imageUrl: healthyImg,
    imageAltAr: 'طبق صحي متوازن بالدجاج المشوي والأفوكادو والكينوا من باسط هيلثي',
    overviewPoints: [
      {
        titleAr: 'أطباق متوازنة القيم الغذائية',
        descAr: 'وجبات محضرة يوميًا بمكونات طازجة غنية بالبروتين والخضروات والحبوب الكاملة.',
      },
      {
        titleAr: 'مسارات غذائية مرنة',
        descAr: 'خيارات مصممة لأسلوب الحياة الصحي، اللياقة البدنية، والعمل المكتبي المتواصل.',
      },
      {
        titleAr: 'تغليف صحي يحفظ الطزاجة',
        descAr: 'عبوات آمنة غذائيًا تحافظ على القوام والنكهة دون إضافات غير ضرورية.',
      },
    ],
    operationalScope: [
      {
        titleAr: 'باقات الوجبات اليومية',
        descAr: 'وجبات غداء وعشاء متكاملة مع تفاصيل السعرات والمكونات بوضوح.',
      },
      {
        titleAr: 'خطط التغذية الأسبوعية',
        descAr: 'تنسيق جدول وجبات متنوع يتكيف مع روتين العميل اليومي.',
      },
    ],
    nextPhaseNotes: [
      'إضافة حاسبة الأهداف الغذائية وتخصيص مكونات الأطباق في المرحلة القادمة.',
      'ربط الاشتراكات الأسبوعية وجدول التوصيل الصباحي.',
    ],
  },
  {
    id: 'factory',
    codeEn: 'FACTORY SYSTEM',
    titleAr: 'نظام المصانع',
    subtitleAr: 'تشغيل المطابخ المركزية وخطوط الإعاشة الصناعية',
    summaryAr: 'منظومة تشغيلية لضبط إنتاج الوجبات، التغليف الحراري، وتوزيع الورديات للمناطق الصناعية.',
    categoryGroup: 'operations',
    categoryLabelAr: 'الأعمال والتشغيل',
    iconName: 'factory',
    imageUrl: factoryImg,
    imageAltAr: 'خط تحضير وتغليف وجبات حراري في مطبخ مركزي قياسي',
    overviewPoints: [
      {
        titleAr: 'إدارة ورديات التغذية الصناعية',
        descAr: 'هيكل واضح لتنظيم خطوط الإفطار والغداء والوجبات الليلية وفق جداول المصانع.',
      },
      {
        titleAr: 'معايير سلامة وتغليف حراري',
        descAr: 'مراقبة جودة الإعداد والتعبئة من المطبخ المركزي حتى نقطة الاستلام داخل المصنع.',
      },
      {
        titleAr: 'تنسيق لوجستي متعدد المطابخ',
        descAr: 'ربط منظم بين المطابخ المركزية المعتمدة ومسارات التوزيع الميدانية.',
      },
    ],
    operationalScope: [
      {
        titleAr: 'المطابخ المركزية المعتمدة',
        descAr: 'تنسيق الطاقة الإنتاجية بين مطبخ العين المركزي ومطبخ بيت العيلة ومطبخ أنجر ستيشن.',
      },
      {
        titleAr: 'خطوط التوزيع اللوجستي',
        descAr: 'تأمين وصول الوجبات الساخنة والمغلفة في مواعيد الورديات المحددة.',
      },
    ],
    nextPhaseNotes: [
      'تفعيل لوحة تشغيل خطوط الإنتاج وإشعارات الاستلام الميدانية في المرحلة القادمة.',
      'إضافة تقارير الكميات اليومية لكل مصنع ومطبخ مركزي.',
    ],
  },
  {
    id: 'owner_finance',
    codeEn: 'OWNER FINANCIAL MANAGEMENT',
    titleAr: 'الإدارة المالية للمالك',
    subtitleAr: 'المركز التنفيذي للحوكمة والرقابة المالية العليا',
    summaryAr: 'واجهة تنفيذية مخصصة لإدارة السياسات المالية، الاعتمادات العليا، ومتابعة التدفقات المؤسسية.',
    categoryGroup: 'operations',
    categoryLabelAr: 'الأعمال والتشغيل',
    iconName: 'landmark',
    imageUrl: ownerFinanceImg,
    imageAltAr: 'مكتب تنفيذي هادئ مع سجل جلدي بنفسجي ملكي وقلم ذهبي',
    featuredGoldAccent: true,
    overviewPoints: [
      {
        titleAr: 'هيكلة صلاحيات مستقلة وعالية الأمان',
        descAr: 'قطاع معزول تمامًا في البنية المعمارية ليكون مخصصًا لإدارة المالك وصلاحياتها فقط.',
      },
      {
        titleAr: 'رؤية واضحة للاعتمادات والالتزامات',
        descAr: 'تنظيم مبوب لملفات المراجعة والسياسات المالية دون خلطها بواجهات العملاء.',
      },
      {
        titleAr: 'تصميم تنفيذي هادئ وعالي التباين',
        descAr: 'عرض مبسط ومباشر يركز على الوضوح والدقة البصرية على شاشات الهاتف والحاسب.',
      },
    ],
    operationalScope: [
      {
        titleAr: 'نطاق الحوكمة والرقابة',
        descAr: 'إطار مبدئي جاهز لاستيعاب بوابات الاعتماد والتسويات في المراحل اللاحقة.',
      },
      {
        titleAr: 'فصل كامل عن مسار الزوار',
        descAr: 'تأكيد العزل البصري والوظيفي قبل ربط المصادقة وقاعدة البيانات لاحقًا.',
      },
    ],
    nextPhaseNotes: [
      'عدم ربط أي أرقام أو عمليات مالية حية في هذه المرحلة بناءً على خطة التأسيس.',
      'تفعيل المصادقة الصارمة وسجلات القيود في المرحلة المخصصة للعمليات المالية.',
    ],
  },
];

export const getSectorById = (id: SectorId): BasitSectorDefinition => {
  return PHASE1_SECTORS.find((sector) => sector.id === id) || PHASE1_SECTORS[0];
};
