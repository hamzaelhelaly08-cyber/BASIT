// Dedicated datasets for Ha-Be German Cement Portal, 12 Buffet Themes, Dates, Camel Liver, and the 6 Professional Departments
import canteenHotMealsImg from '../assets/images/canteen_hot_meals_platter_1794852898424.jpg';
import alAinFeastImg from '../assets/images/al_ain_restaurants_feast_1794529871083.jpg';
import sweetsPatisserieImg from '../assets/images/sweets_patisserie_offer_1794836175470.jpg';
import habeSodaCansImg from '../assets/images/habe_soda_cans_1794994256071.jpg';
import habeJuiceEnergyMaltImg from '../assets/images/habe_juice_energy_malt_1794994256552.jpg';
import habeChipsSnacksImg from '../assets/images/habe_chips_corn_snacks_1794994256677.jpg';
import habeChocolateBiscuitsImg from '../assets/images/habe_chocolate_biscuits_1794994257281.jpg';
import habeHeroMealCupImg from '../assets/images/habe_hero_meal_cup_1794994257811.jpg';

export { habeHeroMealCupImg };

export interface GermanEmployee {
  id: string;
  code: string;
  username?: string;
  nameAr: string;
  departmentAr: string;
  shift: 'وردية صباحية' | 'وردية مسائية' | 'وردية ليلية';
  jobTitle: string;
  dailyAllowanceEGP: number;
  cashbackBalanceEGP: number;
  monthlyMealsRemaining: number;
  assignedMealPlan: string;
  phone: string;
  status: 'نشط' | 'في إجازة';
}

// Full 81 Factory Employees of German Cement Company (الشركة الألمانية للأسمنت)
export const GERMAN_CEMENT_81_EMPLOYEES: GermanEmployee[] = [
  // خط الإنتاج 1 والأفران (Production Line 1 & Kilns)
  { id: 'emp_01', code: 'GER-001', nameAr: 'م/ سامح قاسم الشناوي', departmentAr: 'إدارة العمليات والتشغيل', shift: 'وردية صباحية', jobTitle: 'مدير الموقع والموارد البشرية', dailyAllowanceEGP: 150, cashbackBalanceEGP: 320, monthlyMealsRemaining: 26, assignedMealPlan: 'بوفيه تنفيذي + وجبة ساخنة', phone: '01198765432', status: 'نشط' },
  { id: 'emp_02', code: 'GER-002', nameAr: 'م/ تامر عبد العال مبروك', departmentAr: 'قسم الأفران الدوارة والكلنكر', shift: 'وردية صباحية', jobTitle: 'رئيس مهندسي الأفران', dailyAllowanceEGP: 130, cashbackBalanceEGP: 215, monthlyMealsRemaining: 24, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223341', status: 'نشط' },
  { id: 'emp_03', code: 'GER-003', nameAr: 'أحمد صابر الدسوقي', departmentAr: 'قسم الأفران الدوارة والكلنكر', shift: 'وردية صباحية', jobTitle: 'مشرف تشغيل الفرن رقم 1', dailyAllowanceEGP: 120, cashbackBalanceEGP: 180, monthlyMealsRemaining: 25, assignedMealPlan: 'فطار عمالي + غداء ساخن', phone: '01011223342', status: 'نشط' },
  { id: 'emp_04', code: 'GER-004', nameAr: 'محمود جاد الكريم علي', departmentAr: 'قسم الأفران الدوارة والكلنكر', shift: 'وردية مسائية', jobTitle: 'فني تحكم حراري', dailyAllowanceEGP: 120, cashbackBalanceEGP: 145, monthlyMealsRemaining: 23, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223343', status: 'نشط' },
  { id: 'emp_05', code: 'GER-005', nameAr: 'رمضان حسني البشبيشي', departmentAr: 'قسم الأفران الدوارة والكلنكر', shift: 'وردية ليلية', jobTitle: 'مشغل رافعة الكلنكر', dailyAllowanceEGP: 120, cashbackBalanceEGP: 190, monthlyMealsRemaining: 26, assignedMealPlan: 'وجبة ساخنة ليلية + مشروب طاقة', phone: '01011223344', status: 'نشط' },
  { id: 'emp_06', code: 'GER-006', nameAr: 'علاء إسماعيل الطوخي', departmentAr: 'قسم الأفران الدوارة والكلنكر', shift: 'وردية صباحية', jobTitle: 'فني صيانة حراريات', dailyAllowanceEGP: 120, cashbackBalanceEGP: 110, monthlyMealsRemaining: 22, assignedMealPlan: 'فطار عمالي + غداء ساخن', phone: '01011223345', status: 'نشط' },
  { id: 'emp_07', code: 'GER-007', nameAr: 'سيد عبد الفتاح مرسي', departmentAr: 'قسم الأفران الدوارة والكلنكر', shift: 'وردية مسائية', jobTitle: 'مساعد مشغل أفران', dailyAllowanceEGP: 120, cashbackBalanceEGP: 95, monthlyMealsRemaining: 26, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223346', status: 'نشط' },
  { id: 'emp_08', code: 'GER-008', nameAr: 'إبراهيم شوقي رضوان', departmentAr: 'قسم طواحين الأسمنت', shift: 'وردية صباحية', jobTitle: 'مشرف طواحين الخام', dailyAllowanceEGP: 120, cashbackBalanceEGP: 160, monthlyMealsRemaining: 25, assignedMealPlan: 'فطار عمالي + غداء ساخن', phone: '01011223347', status: 'نشط' },
  { id: 'emp_09', code: 'GER-009', nameAr: 'وليد عبد الوهاب رشاد', departmentAr: 'قسم طواحين الأسمنت', shift: 'وردية مسائية', jobTitle: 'فني طواحين أسمنت بورتلاندي', dailyAllowanceEGP: 120, cashbackBalanceEGP: 130, monthlyMealsRemaining: 24, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223348', status: 'نشط' },
  { id: 'emp_10', code: 'GER-010', nameAr: 'حسن متولي الشرقاوي', departmentAr: 'قسم طواحين الأسمنت', shift: 'وردية ليلية', jobTitle: 'مشغل سيور نقل الحجر الجيري', dailyAllowanceEGP: 120, cashbackBalanceEGP: 175, monthlyMealsRemaining: 26, assignedMealPlan: 'وجبة ساخنة ليلية', phone: '01011223349', status: 'نشط' },
  
  // الصيانة الميكانيكية والكهربائية (Maintenance)
  { id: 'emp_11', code: 'GER-011', nameAr: 'م/ خالد عبد المنعم درويش', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية صباحية', jobTitle: 'مدير الصيانة المركزية', dailyAllowanceEGP: 140, cashbackBalanceEGP: 280, monthlyMealsRemaining: 25, assignedMealPlan: 'بوفيه تنفيذي + وجبة ساخنة', phone: '01011223350', status: 'نشط' },
  { id: 'emp_12', code: 'GER-012', nameAr: 'طارق مصطفى البنداري', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية صباحية', jobTitle: 'مهندس كهرباء جهد متوسط', dailyAllowanceEGP: 130, cashbackBalanceEGP: 220, monthlyMealsRemaining: 23, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223351', status: 'نشط' },
  { id: 'emp_13', code: 'GER-013', nameAr: 'عصام مجدي النجار', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية صباحية', jobTitle: 'فني ميكانيكا هيدروليك', dailyAllowanceEGP: 120, cashbackBalanceEGP: 140, monthlyMealsRemaining: 26, assignedMealPlan: 'فطار عمالي + غداء ساخن', phone: '01011223352', status: 'نشط' },
  { id: 'emp_14', code: 'GER-014', nameAr: 'سامح لطفي البحيري', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية مسائية', jobTitle: 'فني لحام ضغط عالي', dailyAllowanceEGP: 120, cashbackBalanceEGP: 155, monthlyMealsRemaining: 24, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223353', status: 'نشط' },
  { id: 'emp_15', code: 'GER-015', nameAr: 'مدحت سمير زكريا', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية ليلية', jobTitle: 'فني أجهزة قياس وتحكم PLC', dailyAllowanceEGP: 125, cashbackBalanceEGP: 195, monthlyMealsRemaining: 26, assignedMealPlan: 'وجبة ساخنة ليلية', phone: '01011223354', status: 'نشط' },
  { id: 'emp_16', code: 'GER-016', nameAr: 'هاني فريد غباشي', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية صباحية', jobTitle: 'فني تزييت وتشحيم تروس', dailyAllowanceEGP: 120, cashbackBalanceEGP: 90, monthlyMealsRemaining: 25, assignedMealPlan: 'فطار عمالي + غداء ساخن', phone: '01011223355', status: 'نشط' },
  { id: 'emp_17', code: 'GER-017', nameAr: 'ياسر محمد الجزار', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية مسائية', jobTitle: 'فني تبريد وتكييف صناعي', dailyAllowanceEGP: 120, cashbackBalanceEGP: 105, monthlyMealsRemaining: 22, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223356', status: 'نشط' },
  { id: 'emp_18', code: 'GER-018', nameAr: 'عمرو رشاد هنداوي', departmentAr: 'الصيانة الميكانيكية والكهربائية', shift: 'وردية ليلية', jobTitle: 'فني طوارئ صيانة ليلية', dailyAllowanceEGP: 125, cashbackBalanceEGP: 165, monthlyMealsRemaining: 26, assignedMealPlan: 'وجبة ساخنة ليلية', phone: '01011223357', status: 'نشط' },

  // اللوجستيات والمخازن ومحطة التعبئة (Logistics, Packaging & Silos)
  { id: 'emp_19', code: 'GER-019', nameAr: 'أشرف عبد العزيز الفيومي', departmentAr: 'اللوجستيات ومحطة التعبئة', shift: 'وردية صباحية', jobTitle: 'مدير محطة تعبئة الأسمنت السائب والمكيس', dailyAllowanceEGP: 130, cashbackBalanceEGP: 240, monthlyMealsRemaining: 25, assignedMealPlan: 'بوفيه تنفيذي + غداء ساخن', phone: '01011223358', status: 'نشط' },
  { id: 'emp_20', code: 'GER-020', nameAr: 'مجدي نبيل عثمان', departmentAr: 'اللوجستيات ومحطة التعبئة', shift: 'وردية صباحية', jobTitle: 'مشرف موازين شاحنات التصدير', dailyAllowanceEGP: 120, cashbackBalanceEGP: 150, monthlyMealsRemaining: 26, assignedMealPlan: 'فطار عمالي + غداء ساخن', phone: '01011223359', status: 'نشط' },
  { id: 'emp_21', code: 'GER-021', nameAr: 'نبيل حامد بدوي', departmentAr: 'اللوجستيات ومحطة التعبئة', shift: 'وردية مسائية', jobTitle: 'مشغل ماكينة التعبئة روتو باكر', dailyAllowanceEGP: 120, cashbackBalanceEGP: 135, monthlyMealsRemaining: 23, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223360', status: 'نشط' },
  { id: 'emp_22', code: 'GER-022', nameAr: 'صلاح كمال المنشاوي', departmentAr: 'اللوجستيات ومحطة التعبئة', shift: 'وردية ليلية', jobTitle: 'سائق فوركلفت شحن شاحنات', dailyAllowanceEGP: 120, cashbackBalanceEGP: 160, monthlyMealsRemaining: 26, assignedMealPlan: 'وجبة ساخنة ليلية', phone: '01011223361', status: 'نشط' },
  { id: 'emp_23', code: 'GER-023', nameAr: 'عادل يوسف البرنس', departmentAr: 'اللوجستيات ومحطة التعبئة', shift: 'وردية صباحية', jobTitle: 'أمين مخازن قطع الغيار', dailyAllowanceEGP: 120, cashbackBalanceEGP: 115, monthlyMealsRemaining: 25, assignedMealPlan: 'فطار عمالي + غداء ساخن', phone: '01011223362', status: 'نشط' },
  { id: 'emp_24', code: 'GER-024', nameAr: 'باسم فوزي الجندي', departmentAr: 'اللوجستيات ومحطة التعبئة', shift: 'وردية مسائية', jobTitle: 'مسؤول ميزان بيلت كونتينيوس', dailyAllowanceEGP: 120, cashbackBalanceEGP: 100, monthlyMealsRemaining: 24, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223363', status: 'نشط' },

  // مختبر الجودة وسلامة العمليات (Quality Lab & Safety)
  { id: 'emp_25', code: 'GER-025', nameAr: 'كيميائي/ مروان شاكر زيدان', departmentAr: 'مختبر الجودة والتحاليل الكيميائية', shift: 'وردية صباحية', jobTitle: 'مدير توكيد الجودة والمختبرات', dailyAllowanceEGP: 135, cashbackBalanceEGP: 260, monthlyMealsRemaining: 26, assignedMealPlan: 'بوفيه تنفيذي + وجبة ساخنة', phone: '01011223364', status: 'نشط' },
  { id: 'emp_26', code: 'GER-026', nameAr: 'كيميائي/ إسلام نصر الدين', departmentAr: 'مختبر الجودة والتحاليل الكيميائية', shift: 'وردية صباحية', jobTitle: 'كيميائي تحليل عينات الكلنكر والجبس', dailyAllowanceEGP: 125, cashbackBalanceEGP: 185, monthlyMealsRemaining: 24, assignedMealPlan: 'وجبة ساخنة صحية', phone: '01011223365', status: 'نشط' },
  { id: 'emp_27', code: 'GER-027', nameAr: 'أحمد ماهر الشربيني', departmentAr: 'مختبر الجودة والتحاليل الكيميائية', shift: 'وردية مسائية', jobTitle: 'فني اختبارات مقاومة الضغط والنعومة', dailyAllowanceEGP: 120, cashbackBalanceEGP: 140, monthlyMealsRemaining: 25, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223366', status: 'نشط' },
  { id: 'emp_28', code: 'GER-028', nameAr: 'م/ تامر وجيه سلامة', departmentAr: 'السلامة والصحة المهنية HSE', shift: 'وردية صباحية', jobTitle: 'مدير السلامة والبيئة ومطابقة HACCP', dailyAllowanceEGP: 135, cashbackBalanceEGP: 230, monthlyMealsRemaining: 26, assignedMealPlan: 'بوفيه تنفيذي + وجبة صحية', phone: '01011223367', status: 'نشط' },
  { id: 'emp_29', code: 'GER-029', nameAr: 'شريف مجدي عبد النبي', departmentAr: 'السلامة والصحة المهنية HSE', shift: 'وردية مسائية', jobTitle: 'مفتش سلامة ومطابقة بيئية بالموقع', dailyAllowanceEGP: 120, cashbackBalanceEGP: 120, monthlyMealsRemaining: 25, assignedMealPlan: 'وجبة ساخنة بروتين عالي', phone: '01011223368', status: 'نشط' },

  // ورديات الإنتاج الإضافية وطواقم المحاجر (Production Shifts 30-81)
  ...Array.from({ length: 52 }, (_, idx) => {
    const num = idx + 30;
    const padNum = String(num).padStart(3, '0');
    const firstNames = ['محمود', 'علي', 'حسين', 'سعيد', 'مصطفى', 'شريف', 'كريم', 'ياسين', 'علاء', 'عاطف', 'ضياء', 'هيثم', 'أيمن', 'صلاح'];
    const midNames = ['عبد الرحمن', 'فتحي', 'إسماعيل', 'عثمان', 'البدري', 'رمضان', 'شعبان', 'السيد', 'جلال', 'فاروق', 'ممدوح'];
    const families = ['المصري', 'الهلالي', 'الشناوي', 'السويسي', 'المنوفي', 'الصعيدي', 'الشرقاوي', 'البحيري', 'الدمياطي', 'الديب'];
    
    const fName = firstNames[idx % firstNames.length];
    const mName = midNames[(idx * 3) % midNames.length];
    const lName = families[(idx * 7) % families.length];
    
    const depts = [
      'خط الإنتاج الرئيسي 1',
      'قسم الأفران وتجهيز الخام',
      'قطاع المحاجر وسحق الحجر',
      'طواحين الأسمنت والسيلوهات',
      'الشحن والنقل الداخلي',
      'الخدمات المعاونة والمرافق'
    ];
    const dept = depts[idx % depts.length];
    const shifts: ('وردية صباحية' | 'وردية مسائية' | 'وردية ليلية')[] = ['وردية صباحية', 'وردية مسائية', 'وردية ليلية'];
    const shift = shifts[idx % shifts.length];

    const mealPlans = [
      'وجبة ساخنة بروتين عالي',
      'فطار عمالي + غداء ساخن',
      'وجبة ساخنة ليلية',
      'وجبة صحية متوازنة'
    ];

    return {
      id: `emp_${num}`,
      code: `GER-${padNum}`,
      nameAr: `${fName} ${mName} ${lName}`,
      departmentAr: dept,
      shift,
      jobTitle: `فني تشغيل ${dept.split(' ')[0]}`,
      dailyAllowanceEGP: 120,
      cashbackBalanceEGP: Math.floor(60 + (idx * 4.5) % 150),
      monthlyMealsRemaining: Math.floor(18 + (idx % 9)),
      assignedMealPlan: mealPlans[idx % mealPlans.length],
      phone: `010112233${70 + (idx % 30)}`,
      status: (idx % 12 === 0 ? 'في إجازة' : 'نشط') as ('في إجازة' | 'نشط')
    };
  })
];

// 12 Open Buffet Themes for Events & Weddings ("وجبات مناسبتك")
export interface BuffetTheme {
  id: string;
  number: number;
  nameAr: string;
  nameEn: string;
  category: 'أفراح ومناسبات' | 'مؤتمرات ورجال أعمال' | 'شركات ومصانع' | 'عزائم عائلية';
  capacity: string;
  basePricePerPlateEGP: number;
  highlightDish: string;
  descriptionAr: string;
  image: string;
  features: string[];
}

export const TWELVE_BUFFET_THEMES: BuffetTheme[] = [
  {
    id: 'buffet_01',
    number: 1,
    nameAr: 'بوفيه الفرح الملكي الأسطوري',
    nameEn: 'Royal Wedding Grand Gala',
    category: 'أفراح ومناسبات',
    capacity: '100 — 1,500 فرد',
    basePricePerPlateEGP: 380,
    highlightDish: 'فخدة ضأن مشوية بالفرن مع أرز مكسرات ملكي وكفتة داوود باشا',
    descriptionAr: 'تجربة زفاف راقية شاملة السخانات الإيطالية المذهبة، تشكيلة لحوم ودواجن مشوية، 12 نوع مقبلات ساخنة وباردة، وحلويات شرقية وغربية فاخرة.',
    image: '/assets/aistudio/image_4922ff2a.jpg',
    features: ['مشروب ترحيبي عصير طبيعي', 'شيفات مباشر للتقطيع والتقديم', 'طاقم ويترز بزي موحد', 'سخانات نحاس وشافنج ديش فاخر']
  },
  {
    id: 'buffet_02',
    number: 2,
    nameAr: 'بوفيه كبار الزوار ورجال الأعمال VIP',
    nameEn: 'Executive VIP Board Buffet',
    category: 'مؤتمرات ورجال أعمال',
    capacity: '30 — 300 فرد',
    basePricePerPlateEGP: 450,
    highlightDish: 'ستيك ريب آي بصوص الفلفل الأسود + سالمون مشوي صوص الشبت',
    descriptionAr: 'مخصص للاجتماعات الوزارية والوفود الدولية ومجالس الإدارات، يقدم أطباقاً عالمية متوازنة مع مقبلات فرنسية وعصائر معصورة طازجة.',
    image: '/assets/catering/camel_liver_tray.jpg',
    features: ['خدمة فندقية 5 نجوم', 'مشروبات دافئة واستراحة شاي كاملة', 'تقديم فردي راقي للضيوف', 'أطباق صحية خالية من الجلوتين']
  },
  {
    id: 'buffet_03',
    number: 3,
    nameAr: 'بوفيه مؤتمرات التغذية والقطاع الطبي',
    nameEn: 'Medical & Healthcare Conference Buffet',
    category: 'مؤتمرات ورجال أعمال',
    capacity: '150 — 2,000 فرد',
    basePricePerPlateEGP: 290,
    highlightDish: 'صدور دجاج مشوية بالأعشاب والليمون + خضار سوتيه على البخار',
    descriptionAr: 'محسوب السعرات والقيم الغذائية ومطابق لاشتراطات أطباء التغذية، خفيف وسريع التناول مع تشكيلة كانابيهات وسلطات عضوية طازجة.',
    image: '/assets/catering/charity_meals.jpg',
    features: ['توضيح السعرات والمكونات على كل طبق', 'خدمة سريعة بدون تكدس', 'عبوات تعبئة معقمة ومحكمة', 'تنوع واسع في السلطات الخضراء']
  },
  {
    id: 'buffet_04',
    number: 4,
    nameAr: 'بوفيه العزومة العائلية ولمة الأحباب',
    nameEn: 'Family Gathering & Festive Buffet',
    category: 'عزائم عائلية',
    capacity: '20 — 150 فرد',
    basePricePerPlateEGP: 260,
    highlightDish: 'صينية الرقاق باللحمة المفرومة + طاجن بامية باللحم الضاني',
    descriptionAr: 'أجواء البيت المصري الأصيل، طواجن فخار بلدي ساخنة، محاشي مشكلة، وكباب حلة بالسمن البلدي مع كود خصم "قوتنا في لمتنا".',
    image: '/assets/aistudio/image_4922ff2a.jpg',
    features: ['كوبون خصم عائلي "قوتنا في لمتنا"', 'توصيل ساخن جاهز للسفرة فوراً', 'طواجن فخارية طبيعية', 'سرفيس كامل وملاعق تقديم']
  },
  {
    id: 'buffet_05',
    number: 5,
    nameAr: 'بوفيه المشويات الشرقية على الفحم',
    nameEn: 'Charcoal Oriental Grill Buffet',
    category: 'شركات ومصانع',
    capacity: '50 — 1,000 فرد',
    basePricePerPlateEGP: 310,
    highlightDish: 'شيش طاووق، كفتة حاتي بلدي، طرب، وريش بتلو على الفحم المباشر',
    descriptionAr: 'محطة شوي حية لايف ستيشن أمام الحضور، مع خبز بلدي ساخن من الفرن وطحينة سمسم صافي وسلطات بلدي حارة.',
    image: '/assets/catering/camel_liver_tray.jpg',
    features: ['لايف ستيشن شواية فحم متنقلة', 'خبز بلدي يخبز ساخناً', 'سلطات وطحينة ومخللات بلدية', 'شوربة لسان عصفور ترحيبية']
  },
  {
    id: 'buffet_06',
    number: 6,
    nameAr: 'بوفيه الأسماك والمأكولات البحرية الفاخرة',
    nameEn: 'Mediterranean Seafood Feast',
    category: 'أفراح ومناسبات',
    capacity: '50 — 400 فرد',
    basePricePerPlateEGP: 480,
    highlightDish: 'جمبري جامبو مشوي + سمك دنيس بالزيت والليمون + طاجن كاليماري',
    descriptionAr: 'صيد اليوم الطازج من السويس والإسكندرية، شوربة سي فود بالكريمة والزعفران، أرز صيادية بالجمبري، وسلطات رنجة وبابا غنوج.',
    image: '/assets/aistudio/image_4922ff2a.jpg',
    features: ['مأكولات بحرية طازجة غير مجمدة', 'شوربة بحرية بالكريمة الغنية', 'سلطة سيفود ومقبلات باردة', 'ليمون وأعشاب بحرية طازجة']
  },
  {
    id: 'buffet_07',
    number: 7,
    nameAr: 'بوفيه واحة سيوة والعزائم البدوية الأصيلة',
    nameEn: 'Siwa Oasis & Bedouin Heritage Buffet',
    category: 'عزائم عائلية',
    capacity: '40 — 500 فرد',
    basePricePerPlateEGP: 330,
    highlightDish: 'لحم حنيذ بدوي مدفون تحت الرمل + أرز بالخلطة وتمور سيوة وزبيب',
    descriptionAr: 'نكهة الصحراء الغربية وسيوة، لحم ماعز وضأن مطهو ببطء على الحطب، سلطة زيتون وزيت زيتون سيوة البكر، وشاي زردة على الفحم.',
    image: '/assets/catering/siwa_dates.jpg',
    features: ['تمور سيوة العضوية وزيت زيتون بكر', 'شاي زردة سيوي بالنعناع البلدي', 'طريقة طهي مدفونة بدوية', 'جلسات عربية وسجاد تراثي']
  },
  {
    id: 'buffet_08',
    number: 8,
    nameAr: 'بوفيه المصانع والورديات الثقيلة (طاقة وبروتين)',
    nameEn: 'Industrial High-Energy Factory Buffet',
    category: 'شركات ومصانع',
    capacity: '200 — 5,000 فرد',
    basePricePerPlateEGP: 175,
    highlightDish: 'نصف دجاجة محمرة + أرز مصري بالشعرية + خضار بالصلصة + مخلل وعيش',
    descriptionAr: 'وجبة مشبعة وغنية بالطاقة للعمال والفنيين، مصممة لتحمل بيئات العمل الصناعية ومقدمة في حافظات حرارية عازلة.',
    image: '/assets/catering/charity_meals.jpg',
    features: ['حصص بروتينية مضاعفة للعمال', 'سريعة التوزيع على الورديات', 'حفظ درجة الحرارة فوق 65 مئوية', 'سعر اقتصادي مدعوم للشركات']
  },
  {
    id: 'buffet_09',
    number: 9,
    nameAr: 'بوفيه حفلات التخرج وأعياد الميلاد والمناسبات السعيدة',
    nameEn: 'Graduation & Birthday Celebrations Buffet',
    category: 'أفراح ومناسبات',
    capacity: '40 — 350 فرد',
    basePricePerPlateEGP: 220,
    highlightDish: 'ميني برجر سلايدرز + أصابع كرسبي دجاج + بيتزا وفطائر ميني + تورتة',
    descriptionAr: 'تشكيلة فينجر فود وساندوتشات ميني مقرمشة ومحبوبة للشباب والعائلات، مع كانابيهات ملونة ونافورة شوكولاتة كإضافة مميزة.',
    image: '/assets/aistudio/image_4922ff2a.jpg',
    features: ['أصناف فينجر فود محبوبة وسهلة الأكل', 'ركن حلويات وتورتة المناسبة', 'عصائر موخيتو وعصائر فريش', 'ديكور بالونات وطاولات مبهجة']
  },
  {
    id: 'buffet_10',
    number: 10,
    nameAr: 'بوفيه الغداء الإيطالي والباستا الطازجة',
    nameEn: 'Italian Pasta & Gourmet Grills Buffet',
    category: 'مؤتمرات ورجال أعمال',
    capacity: '50 — 500 فرد',
    basePricePerPlateEGP: 285,
    highlightDish: 'لايف ستيشن باستا بأنواعها (بيني ألفريدو + فوزيلي بيستو) + إسكالوب بانيه',
    descriptionAr: 'محطة طبخ فوري للمكرونة الإيطالية بأنواع الصوص الأبيض والأحمر والبيستو وجبن البارميزان الأصلي مع بيتزا نابوليتانا ساخنة.',
    image: '/assets/aistudio/image_4922ff2a.jpg',
    features: ['محطة تجهيز باستا أمام الضيف', 'أجبان بارميزان وموزاريلا طبيعية', 'خبز بالثوم والأعشاب الإيطالية', 'سلطة سيزر بالدجاج المشوي']
  },
  {
    id: 'buffet_11',
    number: 11,
    nameAr: 'بوفيه ليالي رمضان والخيام الرمضانية الساهرة',
    nameEn: 'Ramadan Nights & Tent Iftar Buffet',
    category: 'عزائم عائلية',
    capacity: '100 — 2,500 فرد',
    basePricePerPlateEGP: 320,
    highlightDish: 'طواجن لحم بالبصل المكرمل + بط محمر برتقال + قطايف وكنافة نابلسية',
    descriptionAr: 'روحانيات الإفطار والسحور الرمضاني، عصائر قمر الدين والكركديه والتمر هندي، تمور سيوة الفاخرة، ومأكولات شرقية رمضانية دافئة.',
    image: '/assets/aistudio/image_78717cad.jpg',
    features: ['مشروبات رمضانية وتمر سيوة على السفرة', 'كنافة وقطايف ساخنة لايف', 'شوربة كريمة ولسان عصفور ساخنة وقت الأذان', 'أجواء رمضانية وفوانيس مضيئة']
  },
  {
    id: 'buffet_12',
    number: 12,
    nameAr: 'بوفيه الكوكتيل والمقبلات الفاخرة (Standing Cocktail)',
    nameEn: 'Luxury Standing Cocktail & Canapés Buffet',
    category: 'مؤتمرات ورجال أعمال',
    capacity: '50 — 800 فرد',
    basePricePerPlateEGP: 210,
    highlightDish: 'كانابيه سالمون مدخن + تارت كبدة دجاج بالكراميل + ميني كباب كفتة',
    descriptionAr: 'مثالي لحفلات افتتاح المقرات والمعارض الفنية وتوقيع العقود، يقدم لقيمات راقية محمولة باليد تسمح بالحركة والتواصل بين الضيوف.',
    image: '/assets/aistudio/image_4922ff2a.jpg',
    features: ['خدمة تمرير الصواني عبر الويترز Passing Trays', 'طاولات كوكتيل عالية مع زهور طبيعية', 'أصناف متنوعة خفيفة بدون جلوس', 'مشروبات كوكتيل منعشة']
  }
];

// Siwa & New Valley Dates Agricultural Portfolio
export interface DateProductSpec {
  id: string;
  nameAr: string;
  nameEn: string;
  originAr: string;
  grade: string;
  sizesAvailable: string[];
  packagingTypes: string[];
  priceEGPPerKg: number;
  exportReady: boolean;
  descriptionAr: string;
  image: string;
}

export const SIWA_AND_VALLEY_DATES: DateProductSpec[] = [
  {
    id: 'date_medjool_luxury',
    nameAr: 'تمر المجدول الملكي (الوادي الجديد والفرافرة وسيوة)',
    nameEn: 'Royal Medjool Dates',
    originAr: 'مزارع الوادي الجديد والفرافرة وسيوة — منتجين منذ الإنتاجية وحتى التعبئة والتغليف',
    grade: 'سوبر جامبو ملكي — أفضل جودة في مصر',
    sizesAvailable: ['سوبر جامبو (حبة 24-28 جم)', 'جامبو (20-24 جم)', 'لارج (16-20 جم)', 'ميديم'],
    packagingTypes: ['صندوق هدايا كرتون فاخر 1 كجم', 'كرتونة شحن دولي Golden Harvest 5 كجم', 'تغليف مفرغ Vacuum'],
    priceEGPPerKg: 195,
    exportReady: true,
    descriptionAr: 'ملك التمور المصرية بلا منازع، منتج داخل مزارعنا من النخلة وحتى خطوط الفرز والتعبئة والتغليف، رطوبة مثالية 18-22% وطعم كراميل طبيعي مطابق للتصدير.',
    image: '/assets/catering/siwa_dates.jpg'
  },
  {
    id: 'date_barhi_golden',
    nameAr: 'تمر البرحي الذهبي الطازج (الفرافرة والوادي)',
    nameEn: 'Fresh Golden Barhi Dates',
    originAr: 'مزارع الفرافرة والواحات البحرية — إنتاج وتعبئة وتغليف ذاتي مباشر',
    grade: 'نخب أول طازج Golden Barhi',
    sizesAvailable: ['قطوف ذهبية طازجة', 'جامبو مقرمش', 'رطب عسلي فاخر'],
    packagingTypes: ['أقفاص مزارع مهواة 10 كجم', 'عبوات فريش مبردة 1 كجم و 2 كجم', 'كراتين توريد الفنادق والمولات'],
    priceEGPPerKg: 110,
    exportReady: true,
    descriptionAr: 'تمور البرحي المصرية الصفراء الشهيرة بقوامها المقرمش ونكهتها العسلية الطبيعية، تُجنى في ذروة نضجها وتُعبأ وتُغلف مباشرة تحت رقابة الجودة.',
    image: '/assets/catering/siwa_dates.jpg'
  },
  {
    id: 'date_siwa_seidi',
    nameAr: 'تمور الوادي الجديد وسيوة الصعيدي',
    nameEn: 'Organic Siwa & Wadi Seidi Dates',
    originAr: 'مزارع واحة سيوة والداخلة والخارجة — الوادي الجديد',
    grade: 'نخب أول تصدير Extra Grade',
    sizesAvailable: ['جامبو Jumbo', 'كبير Large', 'متوسط Medium'],
    packagingTypes: ['كرتونة تصدير 5 كجم', 'عبوة مستهلك 1 كجم فاخرة', 'أقفاص بلاستيكية للمصانع 10 كجم'],
    priceEGPPerKg: 85,
    exportReady: true,
    descriptionAr: 'تمور الوادي وسيوة مجففة طبيعياً دون أي إضافات كيميائية أو سكريات صناعية، قشرة ناعمة ولحم كثيف غني بالمعادن والألياف.',
    image: '/assets/catering/siwa_dates.jpg'
  },
  {
    id: 'date_farafra_reserve',
    nameAr: 'تمور واحة الفرافرة الفاخرة (تعبئة وتغليف كامل)',
    nameEn: 'Farafra Oasis Reserve Dates',
    originAr: 'مزارع الفرافرة البكر — سلسلة إنتاج متكاملة حتى التعبئة والتغليف',
    grade: 'فرز أول زراعي وتصديري',
    sizesAvailable: ['جامبو', 'كبير', 'وسط مبروم'],
    packagingTypes: ['كراتين Golden Harvest 5 كجم', 'أكياس تغليف محكمة 800 جم', 'بالتات شحن مبردة'],
    priceEGPPerKg: 95,
    exportReady: true,
    descriptionAr: 'من أنقى مزارع المياه الجوفية العميقة بالفرافرة والوادي الجديد، يتم فرزها وتدريجها وتغليفها في محطاتنا لتصل بأعلى جودة في مصر وعمر تخزيني يصل إلى 18 شهراً.',
    image: '/assets/catering/siwa_dates.jpg'
  }
];

// The 6 Professional Corporate Departments Metadata (Section 3 of User Prompt)
export interface CorporateDepartment {
  id: string;
  code: string;
  number: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  scopeListAr: string[];
  iconKey: string;
  leadOfficerAr: string;
  metrics: { labelAr: string; value: string }[];
  primaryImage: string;
}

export const SIX_CORPORATE_DEPARTMENTS: CorporateDepartment[] = [
  {
    id: 'dept_01',
    code: 'DEPT-NUTRITION',
    number: '01',
    titleAr: 'إدارة التغذية والإعاشة المركزية',
    titleEn: 'Central Nutrition & Catering Operations',
    shortDescAr: 'إدارة الوجبات، المطابخ المركزية الثلاثة، المدارس، المصانع، المستشفيات، وعقود الإعاشة المؤسسية الكبرى.',
    scopeListAr: ['المطابخ المركزية الثلاثة (مطبخ ومركز العين ببدر، هنجر ستيشن بأرض المعارض بمدينة نصر، مطبخ بيت العيلة)', 'وجبات المستشفيات العلاجية ومستشفى رويال والشروق', 'إعاشة المصانع الثقيلة والشركة الألمانية للأسمنت', 'عقود التوريد اليومية ومتابعة خطط الطهي'],
    iconKey: 'Utensils',
    leadOfficerAr: 'م/ مصطفى شعبان (مدير العمليات المركزية)',
    metrics: [
      { labelAr: 'طاقة الإنتاج اليومية', value: '18,500 وجبة' },
      { labelAr: 'المطابخ العاملة', value: '3 مطابخ مركزية' },
      { labelAr: 'معدل التوريد في الموعد', value: '99.4%' }
    ],
    primaryImage: '/assets/aistudio/image_4922ff2a.jpg'
  },
  {
    id: 'dept_02',
    code: 'DEPT-QUALITY',
    number: '02',
    titleAr: 'إدارة الجودة وسلامة الغذاء',
    titleEn: 'Food Safety & HACCP Quality Directorate',
    shortDescAr: 'أنظمة HACCP وISO 22000، التفتيش والرقابة الدورية، التتبع الرقمي، تحليل المخاطر، واعتمادات سلامة الغذاء.',
    scopeListAr: ['فحص نقاط التحكم الحرجة CCP وسجلات درجات الحرارة', 'التفتيش الميداني اليومي ومطابقة الهيئة القومية NFSA', 'شهادات الجودة ISO 22000 و FSSC 22000', 'إجراءات تصحيحية فورية ومسار التتبع من المزرعة للمستهلك'],
    iconKey: 'ShieldCheck',
    leadOfficerAr: 'د/ شريف عثمان & د/ حاتم البشبيشي',
    metrics: [
      { labelAr: 'مؤشر المطابقة والسلامة', value: '99.8%' },
      { labelAr: 'فحوصات CCP اليومية', value: '142 نقطة فحص' },
      { labelAr: 'شهادات الاعتماد', value: 'HACCP + ISO 22000' }
    ],
    primaryImage: '/assets/catering/charity_meals.jpg'
  },
  {
    id: 'dept_03',
    code: 'DEPT-LABS',
    number: '03',
    titleAr: 'إدارة البحوث والمعامل المركزية',
    titleEn: 'Central Research & Food Testing Laboratories',
    shortDescAr: 'الفحوصات الميكروبيولوجية، التحاليل الكيميائية، سحب العينات، التقارير الفنية، ونتائج اختبارات الصلاحية.',
    scopeListAr: ['تحاليل البكتيريا والميكروبات E.Coli & Salmonella', 'فحص متبقيات المبيدات والمعادن الثقيلة بالخضار واللحوم', 'اختبار نقاء مياه الطهي وشبكات التعقيم', 'الاحتفاظ بعينات إرجاعية لمدة 72 ساعة لكل وجبة'],
    iconKey: 'Microscope',
    leadOfficerAr: 'د/ لمياء رضوان (استشاري التحاليل والتغذية)',
    metrics: [
      { labelAr: 'عينات مفحوصة شهرياً', value: '850 عينة' },
      { labelAr: 'زمن ظهور النتيجة', value: 'أقل من 24 ساعة' },
      { labelAr: 'حفظ العينات الإرجاعية', value: '100% مطبق' }
    ],
    primaryImage: '/assets/catering/siwa_dates.jpg'
  },
  {
    id: 'dept_04',
    code: 'DEPT-AGRI',
    number: '04',
    titleAr: 'الإدارة الزراعية والحاصلات',
    titleEn: 'Agricultural & Harvest Directorate (Green Nile Harvest)',
    shortDescAr: 'مزارع النيل الأخضر، تمور المجدول والبرحي والوادي والفرافرة — منتجين منذ الإنتاجية وحتى التعبئة والتغليف.',
    scopeListAr: ['مزارع تمور المجدول والبرحي والوادي والفرافرة وسيوة (أفضل جودة في مصر)', 'سلسلة الإنتاج الكاملة: من النخلة والفرز والتدريج حتى التعبئة والتغليف التصديري', 'محاصيل الخضروات الورقية والدرنية للطعام المؤسسي', 'تحالف Green Nile Harvest للتميز الزراعي'],
    iconKey: 'Sprout',
    leadOfficerAr: 'م/ عصام عبد الشافي (مدير القطاع الزراعي)',
    metrics: [
      { labelAr: 'مساحة المزارع المتعاقدة', value: '2,400 فدان' },
      { labelAr: 'إنتاج تمور سيوة والوادي', value: '1,200 طن/موسم' },
      { labelAr: 'توريد مباشر للمطابخ', value: 'بدون وسيط 0%' }
    ],
    primaryImage: '/assets/catering/siwa_dates.jpg'
  },
  {
    id: 'dept_05',
    code: 'DEPT-EXPORT',
    number: '05',
    titleAr: 'إدارة التوريد وسجل المصدرين والتجارة',
    titleEn: 'Supply Chain, Procurement & Export Division',
    shortDescAr: 'المشتريات الاستراتيجية، التعاقدات السنوية، التوريد اللوجستي، التصدير الدولي، ومستندات الرقابة على الصادرات GOEIC.',
    scopeListAr: ['أسطول الشاحنات المبردة المجهزة بنظام GPS ومستشعرات حرارة', 'بطاقة قيد سجل المصدرين المعتمدة لتصدير الحاصلات والتمور', 'المشتريات المركزية من كبرى الشركات الوطنية (الزيوت، السكر، اللحوم)', 'إدارة المناقصات وعقود التوريد مع الجهات الحكومية والخاصة'],
    iconKey: 'Truck',
    leadOfficerAr: 'أ/ هاني بهجت & أ/ عبد المجيد الرخاوي',
    metrics: [
      { labelAr: 'أسطول السيارات المبردة', value: '28 شاحنة مبردة' },
      { labelAr: 'دول التصدير المستهدفة', value: '8 دول عربية وأوروبية' },
      { labelAr: 'سجل المصدرين GOEIC', value: 'ساري ومعتمد' }
    ],
    primaryImage: '/assets/aistudio/image_78717cad.jpg'
  },
  {
    id: 'dept_06',
    code: 'DEPT-AI',
    number: '06',
    titleAr: 'الذكاء والتحليل المؤسسي والتنبؤ بالطلب',
    titleEn: 'Enterprise AI Intelligence & Predictive Forecasting',
    shortDescAr: 'الذكاء الاصطناعي، تحليل البيانات الضخمة، التنبؤ بالطلب الموسمي، تقييم المخاطر، وتحسين كفاءة التشغيل والتكلفة.',
    scopeListAr: ['تحليل الأنماط الموسمية وتغير الطلب بين الصيف والشتاء ومواسم رمضان', 'التنبؤ الذكي بالاستهلاك اليومي لكل موقع متعاقد لمنع الهالك الغذائي', 'مراقبة تكلفة الوجبة التراكمية وهوامش الربح لكل عقد مؤسسي', 'خوارزميات التنبيه المبكر لنقص المواد الخام وإعادة الطلب التلقائي'],
    iconKey: 'Cpu',
    leadOfficerAr: 'م/ مصطفى شعبان (مدير التخطيط الرقمي والعمليات)',
    metrics: [
      { labelAr: 'دقة التنبؤ بالوجبات', value: '98.2%' },
      { labelAr: 'خفض الهالك الغذائي', value: '34% انخفاض' },
      { labelAr: 'تحديث البيانات الحية', value: 'فوري كل ثانية' }
    ],
    primaryImage: '/assets/aistudio/image_4922ff2a.jpg'
  }
];

// =========================================================================
// Ha-Be / Ba_He Official Commercial Point (Zero "كانتين" / Zero "Combo")
// =========================================================================

export const HABE_CONTACTS = {
  vodafoneCash: '01041482940',
  instapay: '01015090888',
  complaints: '01010430347',
  brandNameAr: 'الشركة الوطنية للخدمات اللوجستية | كاترينج مصر',
  brandNameEn: 'National Logistics | Catering Egypt',
  brandNameDe: 'Ha-Be Standort Ägypten — National Logistics',
};

export const HABE_SUPPLY_TERMS = {
  preOrderAr:
    'مواعيد الطلب المسبق: لضمان وصول الوجبات طازجة وبأعلى معايير الجودة، يُرجى إرسال الطلب قبل موعد التوريد بمدة لا تقل عن 30 دقيقة (يُستثنى من ذلك الأصناف الجاهزة ضمن التشغيل اليومي المعتاد).',
  preOrderEn:
    'Pre-order Timing: To ensure meals arrive fresh at peak quality standards, please place custom meal orders at least 30 minutes prior to dispatch (ready daily point items are served immediately).',
  preOrderDe:
    'Vorbestellzeit: Um frische Zubereitung zu garantieren, geben Sie Bestellungen bitte mindestens 30 Minuten vor Auslieferung auf.',
  priceNoteAr:
    'تحديث الأسعار: أسعار المشروبات ومنتجات نقطة المبيعات قابلة للتعديل طبقاً لأسعار الشركات الموردة والأسعار السائدة بالسوق وقت التوريد.',
  priceNoteEn:
    'Price Policy: Beverage and retail product prices are subject to supplier adjustments and market rates at delivery time.',
  priceNoteDe:
    'Preisaktualisierung: Getränke- und Einzelhandelspreise richten sich nach den Lieferanten- und Marktpreisen zum Lieferzeitpunkt.',
};

export type HabeMenuCategoryKey =
  | 'breakfast'
  | 'lunch'
  | 'sahar_meals'
  | 'pastries'
  | 'koshary_pizza_crepe'
  | 'sandwiches'
  | 'drinks_snacks';

export interface HabeMenuItem {
  id: string;
  code: string;
  category: HabeMenuCategoryKey;
  subGroup?: 'drinks' | 'chips' | 'sweets' | 'pizza' | 'koshary' | 'crepe' | 'classic' | 'grill_sand';
  nameAr: string;
  nameEn: string;
  nameDe: string;
  descAr: string;
  descEn: string;
  descDe: string;
  priceEGP: number;
  imageUrl: string;
  iconKey: string;
  badgeAr?: string;
  brandColor?: string;
  accentColor?: string;
  imagePosition?: string;
  imageScale?: string;
  visualType?:
    | 'soda_can'
    | 'energy_can'
    | 'malt_bottle'
    | 'juice_pack'
    | 'chips_bag'
    | 'tortilla_bag'
    | 'cheese_puffs'
    | 'chocolate_bar'
    | 'wafer_pack'
    | 'cookie_pack'
    | 'cake_roll'
    | 'meal_plate';
  shortBrandTag?: string;
}

export const HABE_MENU_CATEGORIES: {
  key: HabeMenuCategoryKey;
  ar: string;
  en: string;
  de: string;
  iconKey: string;
}[] = [
  { key: 'breakfast', ar: 'إفطار الشركات (49 ج.م)', en: 'Breakfast (49 EGP)', de: 'Frühstück (49 EGP)', iconKey: 'utensils' },
  { key: 'lunch', ar: 'غداء اقتصادي (92 ج.م)', en: 'Economy Lunch (92 EGP)', de: 'Mittagessen (92 EGP)', iconKey: 'chef' },
  { key: 'sahar_meals', ar: 'وجبات السحر اليومية', en: 'Daily Sahar Specials', de: 'Tägliche Spezialitäten', iconKey: 'sahar_meals' },
  { key: 'pastries', ar: 'المعجنات الطازجة (37 ج.م)', en: 'Fresh Pastries (37 EGP)', de: 'Gebäck (37 EGP)', iconKey: 'sweets' },
  { key: 'koshary_pizza_crepe', ar: 'الكشري والبيتزا والكريب', en: 'Koshary, Pizza & Crepe', de: 'Koshary, Pizza & Crêpe', iconKey: 'pizza' },
  { key: 'sandwiches', ar: 'السندوتشات المنفصلة', en: 'Single Sandwiches', de: 'Einzel-Sandwiches', iconKey: 'grills' },
  { key: 'drinks_snacks', ar: 'المشروبات والشيبسي والبسكوتات', en: 'Drinks, Chips & Biscuits', de: 'Getränke, Chips & Süßes', iconKey: 'coffee' },
];

export const HABE_FULL_MENU: HabeMenuItem[] = [
  // 1. Corporate Breakfast (49 EGP)
  {
    id: 'cbk_01',
    code: 'CBK-01',
    category: 'breakfast',
    nameAr: 'فول بالزيت والطحينة + جبنة بالخلطة + 1 بيضة مسلوقة + طرشي + 3 أرغفة خبز فاخر كبير',
    nameEn: 'Corporate Breakfast CBK-01 (Foul Tahini, Cheese Mix, Boiled Egg, 3 Bread)',
    nameDe: 'Frühstück CBK-01 (Foul mit Tahina, Gewürzkäse, Ei, 3 Brote)',
    descAr: 'فول بالزيت والطحينة + جبنة بالخلطة + 1 بيضة مسلوقة + طرشي + 3 أرغفة خبز فاخر كبير',
    descEn: 'Oil & tahini foul + herb cheese + 1 boiled egg + pickles + 3 large deluxe loaves',
    descDe: 'Foul mit Öl & Tahina + Käsemischung + 1 gekochtes Ei + Pickles + 3 große Brote',
    priceEGP: 49,
    imageUrl: '/assets/catering/charity_meals.jpg',
    iconKey: 'utensils',
    badgeAr: 'وجبة إفطار 49 ج.م',
  },
  {
    id: 'cbk_02',
    code: 'CBK-02',
    category: 'breakfast',
    nameAr: 'فول بالزيت والطحينة + علبة لبنة بالزعتر والبقدونس + بورشن مربى + مخلل + 3 أرغفة خبز',
    nameEn: 'Corporate Breakfast CBK-02 (Foul, Labneh Thyme, Jam Portion, 3 Bread)',
    nameDe: 'Frühstück CBK-02 (Foul, Labneh mit Thymian, Marmelade, 3 Brote)',
    descAr: 'فول بالزيت والطحينة + علبة لبنة بالزعتر والبقدونس + بورشن مربى + مخلل + 3 أرغفة خبز فاخر كبير',
    descEn: 'Oil & tahini foul + thyme labneh + jam pack + pickles + 3 large deluxe loaves',
    descDe: 'Foul + Labneh Thymian & Petersilie + Marmelade + 3 große Brote',
    priceEGP: 49,
    imageUrl: '/assets/catering/charity_meals.jpg',
    iconKey: 'utensils',
    badgeAr: 'وجبة إفطار 49 ج.م',
  },
  {
    id: 'cbk_03',
    code: 'CBK-03',
    category: 'breakfast',
    nameAr: 'فول بالزيت والليمون + طاجن مسقعة + مخلل + 3 أرغفة خبز فاخر كبير',
    nameEn: 'Corporate Breakfast CBK-03 (Lemon Foul, Eggplant Moussaka, 3 Bread)',
    nameDe: 'Frühstück CBK-03 (Zitronen-Foul, Auberginen-Moussaka, 3 Brote)',
    descAr: 'فول بالزيت والليمون + طاجن مسقعة + مخلل + 3 أرغفة خبز فاخر كبير',
    descEn: 'Olive oil & lemon foul + baked moussaka + pickles + 3 large deluxe loaves',
    descDe: 'Foul mit Zitrone + Moussaka-Auflauf + Pickles + 3 große Brote',
    priceEGP: 49,
    imageUrl: '/assets/catering/charity_meals.jpg',
    iconKey: 'utensils',
    badgeAr: 'وجبة إفطار 49 ج.م',
  },
  {
    id: 'cbk_04',
    code: 'CBK-04',
    category: 'breakfast',
    nameAr: 'فول برائحة الزبدة البلدي + طاجن بطاطس بوريه + مخلل + 3 أرغفة خبز فاخر كبير',
    nameEn: 'Corporate Breakfast CBK-04 (Ghee Foul, Mashed Potato Casserole, 3 Bread)',
    nameDe: 'Frühstück CBK-04 (Butter-Foul, Kartoffelpüree-Auflauf, 3 Brote)',
    descAr: 'فول برائحة الزبدة البلدي + طاجن بطاطس بوريه + مخلل + 3 أرغفة خبز فاخر كبير',
    descEn: 'Natural butter foul + mashed potato bake + pickles + 3 large deluxe loaves',
    descDe: 'Foul mit Landbutter + Kartoffelpüree + Pickles + 3 große Brote',
    priceEGP: 49,
    imageUrl: '/assets/catering/charity_meals.jpg',
    iconKey: 'utensils',
    badgeAr: 'وجبة إفطار 49 ج.م',
  },
  {
    id: 'cbk_05',
    code: 'CBK-05',
    category: 'breakfast',
    nameAr: 'فول بالزيت والطحينة + جبنة فيتا + دومتي بلس 80 جم + بيضة مسلوقة + 3 أرغفة خبز',
    nameEn: 'Corporate Breakfast CBK-05 (Foul, Feta, Domty Plus 80g, Boiled Egg, 3 Bread)',
    nameDe: 'Frühstück CBK-05 (Foul, Feta, Domty 80g, Ei, 3 Brote)',
    descAr: 'فول بالزيت والطحينة + جبنة فيتا + علبة جبنة دومتي بلس 80 جم + 1 بيضة مسلوقة + مخلل + 3 أرغفة خبز فاخر كبير',
    descEn: 'Foul tahini + feta + 80g Domty pack + 1 boiled egg + pickles + 3 loaves',
    descDe: 'Foul + Feta + 80g Domty Käse + gekochtes Ei + 3 große Brote',
    priceEGP: 49,
    imageUrl: '/assets/catering/charity_meals.jpg',
    iconKey: 'utensils',
    badgeAr: 'وجبة إفطار 49 ج.م',
  },

  // 2. Economy Lunch Meals (92 EGP — Kabab Halla removed per instruction)
  {
    id: 'fct_01',
    code: 'FCT-01',
    category: 'lunch',
    nameAr: 'فراخ روستو + أرز أبيض بالشعرية مفلفل + تورلي بالصلصة + خبز + مخلل + سلطة بدون طماطم',
    nameEn: 'Roast Chicken Meal + Vermicelli Rice + Torly Vegetables + Bread + Salad',
    nameDe: 'Brathähnchen + Reis mit Fadennudeln + Gemüse-Torly + Brot & Salat',
    descAr: 'فراخ روستو + أرز أبيض بالشعرية مفلفل + تورلي بالصلصة + خبز + مخلل + سلطة بدون طماطم',
    descEn: 'Oven-roasted chicken + fluffy vermicelli rice + torly veggies + bread + tomato-free salad',
    descDe: 'Ofen-Hähnchen + Reis + Torly-Gemüse + Brot + Salat ohne Tomaten',
    priceEGP: 92,
    imageUrl: canteenHotMealsImg,
    iconKey: 'chef',
    badgeAr: 'غداء اقتصادي 92 ج.م',
  },
  {
    id: 'fct_02',
    code: 'FCT-02',
    category: 'lunch',
    nameAr: 'داوود باشا بالصوص + أرز بالشعرية + بطاطس بصوص الداود باشا + خيار + خبز + مخلل',
    nameEn: 'Dawood Pasha Meatballs + Rice + Potato Sauce + Cucumber + Bread',
    nameDe: 'Dawood Pasha Hackbällchen + Reis + Kartoffelsoße + Brot',
    descAr: 'داوود باشا بالصوص + أرز بالشعرية + خضار بطاطس مع صوص الداود باشا + شرائح خيار + خبز + مخلل',
    descEn: 'Spiced beef meatballs in tomato sauce + vermicelli rice + potatoes + cucumber + bread',
    descDe: 'Gewürzte Rindfleischbällchen + Reis + Kartoffeln + Gurke + Brot',
    priceEGP: 92,
    imageUrl: canteenHotMealsImg,
    iconKey: 'chef',
    badgeAr: 'غداء اقتصادي 92 ج.م',
  },
  {
    id: 'fct_04',
    code: 'FCT-04',
    category: 'lunch',
    nameAr: '120 جم كفتة مشوية + أرز بسمتي أصفر + بطاطس بوم فريت + خيار + طحينة + خبز',
    nameEn: '120g Charcoal Kofta + Yellow Basmati Rice + Fries + Tahini + Bread',
    nameDe: '120g Grill-Kofta + Gelber Basmatireis + Pommes + Tahina + Brot',
    descAr: '120 جم كفتة مشوية + أرز بسمتي أصفر + بطاطس بوم فريت + شرائح خيار + طحينة + خبز + مخلل',
    descEn: '120g grilled kofta + golden basmati rice + french fries + cucumber + tahini + bread',
    descDe: '120g gegrillte Kofta + gelber Basmatireis + Pommes + Tahina + Brot',
    priceEGP: 92,
    imageUrl: canteenHotMealsImg,
    iconKey: 'grills',
    badgeAr: 'غداء اقتصادي 92 ج.م',
  },
  {
    id: 'fct_05',
    code: 'FCT-05',
    category: 'lunch',
    nameAr: '120 جم شيش على الفحم + أرز بسمتي أصفر + بطاطس بوم فريت + خيار + طحينة + خبز',
    nameEn: '120g Charcoal Shish Tawook + Basmati Rice + Fries + Tahini + Bread',
    nameDe: '120g Shish Tawook vom Grill + Basmatireis + Pommes + Tahina',
    descAr: '120 جم شيش على الفحم + أرز بسمتي أصفر + بطاطس بوم فريت + شرائح خيار + طحينة + خبز + مخلل',
    descEn: '120g charcoal chicken skewers + saffron rice + fries + cucumber + tahini + bread',
    descDe: '120g gegrillte Hähnchenspieße + Basmatireis + Pommes + Tahina + Brot',
    priceEGP: 92,
    imageUrl: canteenHotMealsImg,
    iconKey: 'grills',
    badgeAr: 'غداء اقتصادي 92 ج.م',
  },
  {
    id: 'fct_06',
    code: 'FCT-06',
    category: 'lunch',
    nameAr: 'فراخ مشوية (ربع صدر أو ورك) + أرز بسمتي أصفر + بطاطس بوم فريت + طحينة + خبز',
    nameEn: 'Charcoal Quarter Chicken + Yellow Basmati Rice + Fries + Tahini + Bread',
    nameDe: 'Viertel Grillhähnchen + Gelber Basmatireis + Pommes + Tahina',
    descAr: 'فراخ مشوية (ربع صدر أو ورك) + أرز بسمتي أصفر + بطاطس بوم فريت + شرائح خيار + طحينة + خبز + مخلل',
    descEn: 'Charcoal quarter chicken + yellow basmati rice + fries + cucumber + tahini + bread',
    descDe: 'Viertel Grillhähnchen + Gelber Basmatireis + Pommes + Gurke + Tahina',
    priceEGP: 92,
    imageUrl: canteenHotMealsImg,
    iconKey: 'grills',
    badgeAr: 'غداء اقتصادي 92 ج.م',
  },

  // 3. Daily Sahar Chef Specials (3 signature meals from second photo)
  {
    id: 'shr_01',
    code: 'SHR-01',
    category: 'sahar_meals',
    nameAr: 'طاجن معكرونة ساخن بصوص الجبن الشيدر والكبدة البلدي والسجق',
    nameEn: 'Sahar Special: Oven Pasta Bake with Cheddar, Liver & Oriental Sausage',
    nameDe: 'Tagesgericht: Überbackene Pasta mit Käse, Leber & Sucuk',
    descAr: 'مكرونة بيني غنية بصوص الشيدر الذائب ومغطاة بالكبدة المتبلة وقطع السجق البلدي + مخلل مشكل',
    descEn: 'Oven-baked penne with melted cheddar glaze, spiced oriental liver & sausage',
    descDe: 'Penne mit geschmolzenem Cheddar, gewürzter Leber & orientalischer Wurst',
    priceEGP: 95,
    imageUrl: alAinFeastImg,
    iconKey: 'sahar_meals',
    badgeAr: 'وجبات السحر',
  },
  {
    id: 'shr_02',
    code: 'SHR-02',
    category: 'sahar_meals',
    nameAr: 'مكس جريل السحر (كفتة الحاتي + شيش طاووق + محشي ورق عنب + أرز أصفر)',
    nameEn: 'Sahar Mixed Grill Feast (Kofta, Shish Tawook, Grape Leaves & Yellow Rice)',
    nameDe: 'Grill-Platte Spezial (Kofta, Shish, Weinblätter & Safranreis)',
    descAr: '3 أصابع كفتة حاتي مشوية على الفحم + قطعتين شيش طاووق + 5 أصابع ورق عنب بالليمون + أرز أصفر بالزعفران',
    descEn: '3 charcoal kofta skewers + 2 shish pieces + 5 stuffed grape leaves + saffron rice',
    descDe: '3 Kofta-Spieße + 2 Shish Tawook + 5 Weinblätter + Gelber Reis',
    priceEGP: 125,
    imageUrl: canteenHotMealsImg,
    iconKey: 'sahar_meals',
    badgeAr: 'وجبات السحر',
  },
  {
    id: 'shr_03',
    code: 'SHR-03',
    category: 'sahar_meals',
    nameAr: 'ستيك لحم بتلو مشوي بصوص المشروم الديمي جلاس + أرز أبيض وخضار سوتيه',
    nameEn: 'Sahar Executive Veal Steak with Mushroom Sauce, Rice & Sauteed Veggies',
    nameDe: 'Kalbssteak mit Champignonsoße, Weißreis & Gedünstetem Gemüse',
    descAr: 'شريحتان ستيك لحم بتلو مشوي على الجريل + صوص ديمي جلاس بالمشروم + أرز أبيض + خضار سوتيه على البخار',
    descEn: 'Two grilled veal steak medallions with mushroom demi-glace, steamed rice & veggies',
    descDe: 'Zwei gegrillte Kalbssteaks mit Champignon-Demi-Glace, Reis & Gemüse',
    priceEGP: 145,
    imageUrl: '/assets/aistudio/image_4922ff2a.jpg',
    iconKey: 'sahar_meals',
    badgeAr: 'وجبات السحر VIP',
  },

  // 4. Fresh Pastries (37 EGP)
  {
    id: 'pst_01',
    code: 'PST-01',
    category: 'pastries',
    nameAr: 'باتيه كبير جبنة رومي بالخضار',
    nameEn: 'Large Puff Pâté — Roumy Cheese & Vegetables',
    nameDe: 'Große Blätterteigtasche — Roumy-Käse & Gemüse',
    descAr: 'باتيه مخبوز طازج بحجم كبير محشو جبنة رومي معتقة وفلفل وخضار طازج',
    descEn: 'Freshly baked large puff pastry filled with aged Roumy cheese and diced veggies',
    descDe: 'Frisch gebackenes Blätterteiggebäck mit Roumy-Käse und Gemüse',
    priceEGP: 37,
    imageUrl: sweetsPatisserieImg,
    iconKey: 'sweets',
    badgeAr: 'طازج 37 ج.م',
  },
  {
    id: 'pst_02',
    code: 'PST-02',
    category: 'pastries',
    nameAr: 'باتيه كبير جبنة وزيتون',
    nameEn: 'Large Puff Pâté — White Cheese & Olives',
    nameDe: 'Große Blätterteigtasche — Weißkäse & Oliven',
    descAr: 'باتيه ذهبي مقرمش محشو جبنة بيضاء فاخرة وشرائح الزيتون الأسود',
    descEn: 'Flaky golden puff pastry filled with feta cheese and black olive slices',
    descDe: 'Knuspriger Blätterteig mit Weißkäse und schwarzen Oliven',
    priceEGP: 37,
    imageUrl: sweetsPatisserieImg,
    iconKey: 'sweets',
    badgeAr: 'طازج 37 ج.م',
  },
  {
    id: 'pst_03',
    code: 'PST-03',
    category: 'pastries',
    nameAr: 'كرواسون كبير سادة بالزبدة',
    nameEn: 'Large Plain Butter Croissant',
    nameDe: 'Großes Butter-Croissant Natur',
    descAr: 'كرواسون فرنسي مورق بالزبدة الطبيعية بحجم كبير',
    descEn: 'Large multi-layered French butter croissant baked every morning',
    descDe: 'Großes französisches Butter-Croissant täglich frisch gebacken',
    priceEGP: 37,
    imageUrl: sweetsPatisserieImg,
    iconKey: 'sweets',
    badgeAr: 'طازج 37 ج.م',
  },
  {
    id: 'pst_04',
    code: 'PST-04',
    category: 'pastries',
    nameAr: 'كرواسون كبير جبنة رومي',
    nameEn: 'Large Roumy Cheese Croissant',
    nameDe: 'Großes Croissant mit Roumy-Käse',
    descAr: 'كرواسون كبير مورق محشو شرائح جبنة رومي ذائبة',
    descEn: 'Fresh flaky butter croissant stuffed with savory Roumy cheese',
    descDe: 'Frisches Blätterteig-Croissant gefüllt mit herzhaftem Roumy-Käse',
    priceEGP: 37,
    imageUrl: sweetsPatisserieImg,
    iconKey: 'sweets',
    badgeAr: 'طازج 37 ج.م',
  },
  {
    id: 'pst_05',
    code: 'PST-05',
    category: 'pastries',
    nameAr: 'رول باتيه بالجبنة والخضار',
    nameEn: 'Cheese & Vegetable Roll Pastry',
    nameDe: 'Käse-Gemüse-Blätterteigrolle',
    descAr: 'رول معجنات ساخن محشو بالجبنة المتبلة والخضروات الطازجة',
    descEn: 'Baked savory puff roll filled with seasoned cheese and garden vegetables',
    descDe: 'Herzhafte Rolle gefüllt mit gewürztem Käse und frischem Gemüse',
    priceEGP: 37,
    imageUrl: sweetsPatisserieImg,
    iconKey: 'sweets',
    badgeAr: 'طازج 37 ج.م',
  },

  // 5. Koshary, Pizza & Crepe (Oriental Full Pizza 180, Italian Full Pizza 170, Crepe 80)
  {
    id: 'ksh_01',
    code: 'K-01',
    category: 'koshary_pizza_crepe',
    subGroup: 'koshary',
    nameAr: 'كشري مصري ممتاز (حجم وسط)',
    nameEn: 'Egyptian Koshary Bowl (Medium)',
    nameDe: 'Ägyptisches Koshary (Mittel)',
    descAr: 'كشري مصري بالصلصة والدقة والكمون والبصل المحمر والملحقات',
    descEn: 'Classic medium Egyptian Koshary with red sauce, garlic vinegar & crispy onions',
    descDe: 'Klassisches Koshary mit Tomatensoße, Knoblauch-Essig & Röstzwiebeln',
    priceEGP: 40,
    imageUrl: alAinFeastImg,
    iconKey: 'utensils',
  },
  {
    id: 'ksh_02',
    code: 'K-02',
    category: 'koshary_pizza_crepe',
    subGroup: 'koshary',
    nameAr: 'كشري مصري ممتاز (حجم كبير)',
    nameEn: 'Egyptian Koshary Bowl (Large)',
    nameDe: 'Ägyptisches Koshary (Groß)',
    descAr: 'عبوة كبيرة من الكشري المصري بالصلصة والشطة والدقة والبصل المقرمش',
    descEn: 'Large Egyptian Koshary bowl with all sauces & crispy onions',
    descDe: 'Große Portion Koshary mit allen Soßen & Röstzwiebeln',
    priceEGP: 48,
    imageUrl: alAinFeastImg,
    iconKey: 'utensils',
  },
  {
    id: 'ksh_03',
    code: 'K-03',
    category: 'koshary_pizza_crepe',
    subGroup: 'koshary',
    nameAr: 'كشري مصري ممتاز (حجم عائلي / جامبو)',
    nameEn: 'Egyptian Koshary Bowl (Jumbo / Family)',
    nameDe: 'Ägyptisches Koshary (Jumbo / Familie)',
    descAr: 'عبوة جامبو مشبعة من الكشري المصري الممتاز بالملحقات الكاملة',
    descEn: 'Jumbo family-size Egyptian Koshary with extra toppings and sauces',
    descDe: 'Jumbo Koshary-Box mit Extra-Beilagen und Röstzwiebeln',
    priceEGP: 58,
    imageUrl: alAinFeastImg,
    iconKey: 'utensils',
  },
  {
    id: 'sl_01',
    code: 'SL-01',
    category: 'koshary_pizza_crepe',
    subGroup: 'pizza',
    nameAr: '2 قطعة بيتزا (سلايز) مارجريتا',
    nameEn: '2 Margherita Pizza Slices',
    nameDe: '2 Stücke Pizza Margherita',
    descAr: 'قطعتا بيتزا سلايز بصوص الطماطم الإيطالي وجبن الموزاريلا',
    descEn: 'Two generous slices of classic Margherita mozzarella pizza',
    descDe: 'Zwei große Stücke Pizza Margherita mit Mozzarella',
    priceEGP: 58,
    imageUrl: alAinFeastImg,
    iconKey: 'pizza',
  },
  {
    id: 'sl_02',
    code: 'SL-02',
    category: 'koshary_pizza_crepe',
    subGroup: 'pizza',
    nameAr: '2 قطعة بيتزا (سلايز) لحمة مفرومة',
    nameEn: '2 Minced Beef Pizza Slices',
    nameDe: '2 Stücke Pizza Hackfleisch',
    descAr: 'قطعتا بيتزا سلايز باللحم المفروم المتبل والفلفل والزيتون والموزاريلا',
    descEn: 'Two slices topped with spiced minced beef, peppers, olives & mozzarella',
    descDe: 'Zwei Stücke Pizza mit gewürztem Rinderhack, Oliven & Mozzarella',
    priceEGP: 58,
    imageUrl: alAinFeastImg,
    iconKey: 'pizza',
  },
  {
    id: 'sl_03',
    code: 'SL-03',
    category: 'koshary_pizza_crepe',
    subGroup: 'pizza',
    nameAr: '2 قطعة بيتزا (سلايز) فراخ',
    nameEn: '2 Chicken Pizza Slices',
    nameDe: '2 Stücke Pizza Hähnchen',
    descAr: 'قطعتا بيتزا سلايز بقطع الدجاج المشوي والزيتون والموزاريلا',
    descEn: 'Two slices loaded with roasted chicken breast & mozzarella cheese',
    descDe: 'Zwei Stücke Pizza mit gegrilltem Hähnchen & Mozzarella',
    priceEGP: 58,
    imageUrl: alAinFeastImg,
    iconKey: 'pizza',
  },
  {
    id: 'pz_or_full',
    code: 'PZ-OR',
    category: 'koshary_pizza_crepe',
    subGroup: 'pizza',
    nameAr: 'بيتزا شرقي كاملة (فطير شرقي محشو كامل)',
    nameEn: 'Full Oriental Stuffed Pizza (Whole Pie)',
    nameDe: 'Ganze Orientalische Gefüllte Pizza',
    descAr: 'فطيرة بيتزا شرقي كاملة طازجة باللحم أو السجق والجبن والخضار',
    descEn: 'Whole freshly baked Egyptian oriental pie stuffed with meat, vegetables & cheese',
    descDe: 'Ganze frisch gebackene orientalische Pizza nach Wahl gefüllt',
    priceEGP: 180,
    imageUrl: alAinFeastImg,
    iconKey: 'pizza',
    badgeAr: 'شرقي كاملة 180 ج.م',
  },
  {
    id: 'pz_it_full',
    code: 'PZ-IT',
    category: 'koshary_pizza_crepe',
    subGroup: 'pizza',
    nameAr: 'بيتزا إيطالي كاملة (Whole Italian Pizza)',
    nameEn: 'Full Italian Stone-Baked Pizza (Whole)',
    nameDe: 'Ganze Italienische Steinofen-Pizza',
    descAr: 'بيتزا إيطالي كاملة بعجينة مخمرة وصلصة طماطم وموزاريلا طبيعية',
    descEn: 'Whole artisan Italian pizza with fermented crust & stretchy mozzarella',
    descDe: 'Ganze italienische Pizza mit knusprigem Rand & Mozzarella',
    priceEGP: 170,
    imageUrl: alAinFeastImg,
    iconKey: 'pizza',
    badgeAr: 'إيطالي كاملة 170 ج.م',
  },
  {
    id: 'crp_01',
    code: 'CRP-01',
    category: 'koshary_pizza_crepe',
    subGroup: 'crepe',
    nameAr: 'كريب طازج ساخن (قطعة واحدة كاملة)',
    nameEn: 'Fresh Savory Crepe (Whole)',
    nameDe: 'Frischer Herzhafter Crêpe',
    descAr: 'كريب مقرمش محشو بانيه أو شيش أو لحم مع جبن موزاريلا وبطاطس وصوص',
    descEn: 'Crispy freshly griddled savory crepe filled with chicken/beef, fries & melted cheese',
    descDe: 'Knuspriger herzhafter Crêpe mit Hähnchen, Käse, Pommes & Soße',
    priceEGP: 80,
    imageUrl: alAinFeastImg,
    iconKey: 'chef',
    badgeAr: 'كريب 80 ج.م',
  },

  // 6. Individual Sandwiches ONLY (Zero "كومبو" anywhere, Tuna Spicy = 20 EGP, strictly 1 item per button)
  {
    id: 'snd_01',
    code: 'SND-01',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش فول',
    nameEn: 'Foul Sandwich',
    nameDe: 'Foul-Sandwich',
    descAr: 'سندوتش فول مدمس طازج بالزيت والليمون والكمون والطحينة',
    descEn: 'Fresh Egyptian fava beans sandwich with sesame tahini',
    descDe: 'Frisches Foul-Sandwich mit Sesam-Tahina',
    priceEGP: 12,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_02',
    code: 'SND-02',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش طعمية',
    nameEn: 'Taameya (Falafel) Sandwich',
    nameDe: 'Taameya-Falafel-Sandwich',
    descAr: 'سندوتش طعمية مصرية مقرمشة بالسلطة الخضراء والطحينة',
    descEn: 'Crispy green Egyptian falafel sandwich with salad & tahini',
    descDe: 'Knuspriges ägyptisches Falafel-Sandwich mit Salat & Tahina',
    priceEGP: 12,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_03',
    code: 'SND-03',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش جبنة',
    nameEn: 'White Cheese Sandwich',
    nameDe: 'Weißkäse-Sandwich',
    descAr: 'سندوتش جبنة بيضاء طازجة في خبز طازج',
    descEn: 'Fresh white cheese sandwich in oven-fresh bread',
    descDe: 'Frisches Weißkäse-Sandwich',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_04',
    code: 'SND-04',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش جبنة بالخلطة',
    nameEn: 'Spiced Cheese Mix Sandwich',
    nameDe: 'Gewürzkäse-Sandwich',
    descAr: 'سندوتش جبنة بالخلطة والطماطم والفلفل وزيت الذرة',
    descEn: 'Creamy herb-spiced cheese blend with tomato and diced pepper',
    descDe: 'Cremiger Gewürzkäse mit Tomaten und Paprika',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_05',
    code: 'SND-05',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش جبنة كيري (فينو)',
    nameEn: 'Kiri Cheese Sandwich (Fino)',
    nameDe: 'Kiri-Frischkäse-Brötchen',
    descAr: 'سندوتش جبنة كيري كريمي داخل خبز فينو طازج',
    descEn: 'Creamy Kiri cheese in soft Fino roll',
    descDe: 'Cremiger Kiri-Käse im weichen Fino-Brötchen',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_06',
    code: 'SND-06',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش لانشون حلواني (فينو)',
    nameEn: 'Beef Luncheon Sandwich (Fino)',
    nameDe: 'Rinder-Aufschnitt-Brötchen',
    descAr: 'شرائح لانشون بقري حلواني أو اللحيمي داخل خبز فينو طازج',
    descEn: 'Halwani beef luncheon slices in fresh Fino bun',
    descDe: 'Frisches Fino-Brötchen mit Rinder-Aufschnitt',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_07',
    code: 'SND-07',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش جبنة رومي (فينو)',
    nameEn: 'Roumy Aged Cheese Sandwich (Fino)',
    nameDe: 'Roumy-Käse-Brötchen',
    descAr: 'شرائح جبنة رومي معتقة فاخرة داخل خبز فينو',
    descEn: 'Aged savory Egyptian Roumy cheese slices in Fino bun',
    descDe: 'Herzhafter gereifter Roumy-Käse im Fino-Brötchen',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_08',
    code: 'SND-08',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش حلاوة بالقشطة (فينو)',
    nameEn: 'Halawa & Cream Sandwich (Fino)',
    nameDe: 'Halwa-Sahne-Brötchen',
    descAr: 'سندوتش حلاوة طحينية غنية مع قشطة طازجة في خبز فينو',
    descEn: 'Sweet sesame halawa with fresh cream in Fino roll',
    descDe: 'Süßes Sesam-Halwa mit frischer Sahne im Fino-Brötchen',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_09',
    code: 'SND-09',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش بطاطس مهروسة',
    nameEn: 'Mashed Potato Sandwich',
    nameDe: 'Kartoffelpüree-Sandwich',
    descAr: 'سندوتش بطاطس مهروسة متبلة بالكمون والكسبرة',
    descEn: 'Herb-seasoned mashed potato sandwich',
    descDe: 'Gewürztes Kartoffelpüree-Sandwich',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_10',
    code: 'SND-10',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش بطاطس صوابع',
    nameEn: 'French Fries Sandwich',
    nameDe: 'Pommes-Sandwich',
    descAr: 'سندوتش بطاطس محمرة مقرمشة مع مخلل وطحينة',
    descEn: 'Crispy golden fries sandwich with pickles & tahini',
    descDe: 'Knusprige Pommes frites Sandwich',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_11',
    code: 'SND-11',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش بطاطس جمبري',
    nameEn: 'Spiced Shrimp-Style Potato Sandwich',
    nameDe: 'Würz-Kartoffel-Sandwich',
    descAr: 'سندوتش بطاطس مقرمشة بتتبيلة الجمبري الساخنة',
    descEn: 'Crispy potato strips seasoned with savory shrimp-spice batter',
    descDe: 'Gewürzte Kartoffelstäbchen im Sandwich',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_12',
    code: 'SND-12',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش بابا غنوج',
    nameEn: 'Smoked Baba Ghanoush Sandwich',
    nameDe: 'Baba-Ghanoush-Sandwich',
    descAr: 'سندوتش باذنجان مشوي بالطحينة والثوم والليمون',
    descEn: 'Charcoal-smoked eggplant & tahini spread sandwich',
    descDe: 'Gegrilltes Auberginen-Tahina-Sandwich',
    priceEGP: 15,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_13',
    code: 'SND-13',
    category: 'sandwiches',
    subGroup: 'classic',
    nameAr: 'سندوتش تونة بالمايونيز والفلفل (سبايسي)',
    nameEn: 'Spicy Tuna Mayo Sandwich',
    nameDe: 'Scharfes Thunfisch-Mayo-Sandwich',
    descAr: 'سندوتش تونة فاخرة بالمايونيز والفلفل السبايسي (سعر خاص)',
    descEn: 'Premium tuna fillet mixed with mayonnaise and spicy pepper',
    descDe: 'Thunfisch-Sandwich mit Mayonnaise und scharfer Paprika',
    priceEGP: 20,
    imageUrl: canteenHotMealsImg,
    iconKey: 'chef',
    badgeAr: 'سعر خاص 20 ج.م',
  },
  {
    id: 'snd_14',
    code: 'SND-14',
    category: 'sandwiches',
    subGroup: 'grill_sand',
    nameAr: 'سندوتش برجر',
    nameEn: 'Beef Burger Sandwich',
    nameDe: 'Beef-Burger-Sandwich',
    descAr: 'سندوتش برجر لحم مشوي طازج في خبز برجر مع خس ومخلل',
    descEn: 'Fresh grilled beef burger patty with crisp lettuce and pickles',
    descDe: 'Gegrilltes Rindfleisch-Burger-Sandwich',
    priceEGP: 45,
    imageUrl: canteenHotMealsImg,
    iconKey: 'grills',
  },
  {
    id: 'snd_15',
    code: 'SND-15',
    category: 'sandwiches',
    subGroup: 'grill_sand',
    nameAr: 'كلوب ساندوتش',
    nameEn: 'Club Sandwich',
    nameDe: 'Club-Sandwich',
    descAr: 'توست محمص ثلاث طبقات مع الدجاج والجبن الشيدر والمدخن والخس والطماطم',
    descEn: 'Triple-decker toasted club sandwich with chicken, cheddar & smoked turkey',
    descDe: 'Dreistöckiges Club-Sandwich mit Hähnchen & Cheddar',
    priceEGP: 75,
    imageUrl: canteenHotMealsImg,
    iconKey: 'chef',
  },
  {
    id: 'snd_16',
    code: 'SND-16',
    category: 'sandwiches',
    subGroup: 'grill_sand',
    nameAr: 'تشيز ميكس ساندوتش',
    nameEn: 'Four-Cheese Mix Sandwich',
    nameDe: 'Käsemix-Sandwich',
    descAr: 'سندوتش خلطة أجبان ذائبة (شيدر، موزاريلا، رومي)',
    descEn: 'Hot melted blend of cheddar, mozzarella & Roumy cheese',
    descDe: 'Geschmolzene Dreikäsemischung im warmen Brötchen',
    priceEGP: 45,
    imageUrl: canteenHotMealsImg,
    iconKey: 'utensils',
  },
  {
    id: 'snd_17',
    code: 'SND-17',
    category: 'sandwiches',
    subGroup: 'grill_sand',
    nameAr: 'سندوتش كفتة مشوية',
    nameEn: 'Grilled Kofta Sandwich',
    nameDe: 'Gegrilltes Kofta-Sandwich',
    descAr: 'أصابع كفتة مشوية على الفحم بالطحينة والبقدونس والمخلل',
    descEn: 'Charcoal-grilled kofta fingers with tahini and pickles',
    descDe: 'Holzkohle-Kofta-Sandwich mit Tahina',
    priceEGP: 55,
    imageUrl: canteenHotMealsImg,
    iconKey: 'grills',
  },
  {
    id: 'snd_18',
    code: 'SND-18',
    category: 'sandwiches',
    subGroup: 'grill_sand',
    nameAr: 'سندوتش شيش مشوي',
    nameEn: 'Grilled Shish Tawook Sandwich',
    nameDe: 'Gegrilltes Shish-Tawook-Sandwich',
    descAr: 'قطع شيش طاووق مشوية على الفحم بالثومية والمخلل',
    descEn: 'Charcoal chicken skewers sandwich with garlic sauce and pickles',
    descDe: 'Gegrilltes Hähnchenspieß-Sandwich mit Knoblauchsoße',
    priceEGP: 55,
    imageUrl: canteenHotMealsImg,
    iconKey: 'grills',
  },
  {
    id: 'snd_19',
    code: 'SND-19',
    category: 'sandwiches',
    subGroup: 'grill_sand',
    nameAr: 'سندوتش بانيه',
    nameEn: 'Crispy Chicken Pane Sandwich',
    nameDe: 'Knuspriges Hähnchenschnitzel-Sandwich',
    descAr: 'صدر دجاج بانيه مقرمش ذهبي مع خس ومايونيز ومخلل',
    descEn: 'Golden crispy breaded chicken breast sandwich with mayo & lettuce',
    descDe: 'Goldgelbes Hähnchenschnitzel im Brötchen',
    priceEGP: 65,
    imageUrl: canteenHotMealsImg,
    iconKey: 'chef',
  },

  // 7. Separated Drinks, Chips & Chocolates/Biscuits — 34 Distinct Products (Zero shared cake placeholder!)
  { id: 'drk_01', code: 'DRK-01', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'بيبسي (Pepsi)', nameEn: 'Pepsi Can', nameDe: 'Pepsi Dose', descAr: 'مشروب غازي بارد بيبسي الأصلي', descEn: 'Chilled Pepsi soft drink', descDe: 'Gekühlte Pepsi', priceEGP: 15, imageUrl: habeSodaCansImg, iconKey: 'coffee', brandColor: '#004B93', accentColor: '#DC2626', imagePosition: '12% 55%', imageScale: 'scale-[1.7]', visualType: 'soda_can', shortBrandTag: 'PEPSI' },
  { id: 'drk_02', code: 'DRK-02', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'ميرندا برتقال (Mirinda)', nameEn: 'Mirinda Orange', nameDe: 'Mirinda Orange', descAr: 'مشروب غازي ميرندا برتقال بارد', descEn: 'Chilled Mirinda orange soda', descDe: 'Gekühlte Mirinda', priceEGP: 15, imageUrl: habeSodaCansImg, iconKey: 'coffee', brandColor: '#EA580C', accentColor: '#16A34A', imagePosition: '37% 55%', imageScale: 'scale-[1.7]', visualType: 'soda_can', shortBrandTag: 'MIRINDA' },
  { id: 'drk_03', code: 'DRK-03', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'سفن أب (7UP)', nameEn: '7UP Can', nameDe: '7UP Dose', descAr: 'مشروب غازي ليمون منعش سفن أب', descEn: 'Refreshing lemon-lime 7UP', descDe: 'Erfrischende 7UP', priceEGP: 15, imageUrl: habeSodaCansImg, iconKey: 'coffee', brandColor: '#047857', accentColor: '#DC2626', imagePosition: '62% 55%', imageScale: 'scale-[1.7]', visualType: 'soda_can', shortBrandTag: '7UP' },
  { id: 'drk_04', code: 'DRK-04', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'ماونتن ديو (Mountain Dew)', nameEn: 'Mountain Dew', nameDe: 'Mountain Dew', descAr: 'مشروب حمضيات منعش ماونتن ديو', descEn: 'Chilled citrus Mountain Dew', descDe: 'Gekühlte Mountain Dew', priceEGP: 15, imageUrl: habeSodaCansImg, iconKey: 'coffee', brandColor: '#4D7C0F', accentColor: '#EF4444', imagePosition: '88% 55%', imageScale: 'scale-[1.7]', visualType: 'soda_can', shortBrandTag: 'M. DEW' },
  { id: 'drk_05', code: 'DRK-05', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'بيبسي الهضبة (Pepsi El Hadaba)', nameEn: 'Pepsi El Hadaba', nameDe: 'Pepsi El Hadaba', descAr: 'مشروب بيبسي الهضبة البارد (سعر اقتصادي)', descEn: 'Pepsi El Hadaba classic chilled soda', descDe: 'Gekühlte Pepsi El Hadaba', priceEGP: 10, imageUrl: habeSodaCansImg, iconKey: 'coffee', brandColor: '#1E293B', accentColor: '#2563EB', imagePosition: '15% 58%', imageScale: 'scale-[1.55]', visualType: 'soda_can', shortBrandTag: 'HADABA' },
  { id: 'drk_06', code: 'DRK-06', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'شويبس (Schweppes)', nameEn: 'Schweppes Can', nameDe: 'Schweppes Dose', descAr: 'مشروب شويبس رمان أو جولد أو ليمون بارد', descEn: 'Chilled Schweppes pomegranate/gold soda', descDe: 'Gekühlte Schweppes', priceEGP: 17, imageUrl: habeSodaCansImg, iconKey: 'coffee', brandColor: '#9F1239', accentColor: '#F59E0B', imagePosition: '36% 58%', imageScale: 'scale-[1.5]', visualType: 'soda_can', shortBrandTag: 'SCHWEPPES' },
  { id: 'drk_07', code: 'DRK-07', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'فيروز شعير وفاكهة (Fayrouz)', nameEn: 'Fayrouz Malt Beverage', nameDe: 'Fayrouz Malzgetränk', descAr: 'مشروب شعير طبيعي بالفاكهة فيروز بارد', descEn: 'Non-alcoholic fruit malt Fayrouz', descDe: 'Alkoholfreies Fruchtmalzgetränk', priceEGP: 20, imageUrl: habeJuiceEnergyMaltImg, iconKey: 'coffee', brandColor: '#D97706', accentColor: '#FDE047', imagePosition: '92% 52%', imageScale: 'scale-[1.6]', visualType: 'malt_bottle', shortBrandTag: 'FAYROUZ' },
  { id: 'drk_08', code: 'DRK-08', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'بريل شعير كلاسيك (Birell)', nameEn: 'Birell Classic Malt', nameDe: 'Birell Klassik', descAr: 'مشروب شعير بريل منعش وبارد', descEn: 'Classic chilled Birell malt', descDe: 'Gekühltes Birell Malzgetränk', priceEGP: 20, imageUrl: habeJuiceEnergyMaltImg, iconKey: 'coffee', brandColor: '#15803D', accentColor: '#FBBF24', imagePosition: '89% 55%', imageScale: 'scale-[1.55]', visualType: 'malt_bottle', shortBrandTag: 'BIRELL' },
  { id: 'drk_09', code: 'DRK-09', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'ريد بول طاقة (Red Bull)', nameEn: 'Red Bull Energy', nameDe: 'Red Bull Energy Drink', descAr: 'مشروب طاقة ريد بول بارد للورديات', descEn: 'Chilled Red Bull energy can', descDe: 'Gekühlter Red Bull Energy Drink', priceEGP: 20, imageUrl: habeJuiceEnergyMaltImg, iconKey: 'rally', brandColor: '#1D4ED8', accentColor: '#DC2626', imagePosition: '68% 60%', imageScale: 'scale-[1.75]', visualType: 'energy_can', shortBrandTag: 'RED BULL' },
  { id: 'drk_10', code: 'DRK-10', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'عصير جهينة تفاح', nameEn: 'Juhayna Apple Juice', nameDe: 'Juhayna Apfelsaft', descAr: 'عبوة عصير جهينة بنكهة التفاح الطبيعي', descEn: 'Chilled Juhayna natural apple juice', descDe: 'Juhayna Apfelsaft', priceEGP: 10, imageUrl: habeJuiceEnergyMaltImg, iconKey: 'coffee', brandColor: '#B91C1C', accentColor: '#22C55E', imagePosition: '31% 52%', imageScale: 'scale-[1.75]', visualType: 'juice_pack', shortBrandTag: 'تفاح APPLE' },
  { id: 'drk_11', code: 'DRK-11', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'عصير جهينة مانجو', nameEn: 'Juhayna Mango Juice', nameDe: 'Juhayna Mangosaft', descAr: 'عبوة عصير جهينة بنكهة المانجو الطبيعية', descEn: 'Chilled Juhayna mango juice', descDe: 'Juhayna Mangosaft', priceEGP: 10, imageUrl: habeJuiceEnergyMaltImg, iconKey: 'coffee', brandColor: '#CA8A04', accentColor: '#16A34A', imagePosition: '12% 52%', imageScale: 'scale-[1.75]', visualType: 'juice_pack', shortBrandTag: 'مانجو MANGO' },
  { id: 'drk_12', code: 'DRK-12', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'عصير جهينة برتقال', nameEn: 'Juhayna Orange Juice', nameDe: 'Juhayna Orangensaft', descAr: 'عبوة عصير جهينة بنكهة البرتقال المنعش', descEn: 'Chilled Juhayna orange juice', descDe: 'Juhayna Orangensaft', priceEGP: 10, imageUrl: habeJuiceEnergyMaltImg, iconKey: 'coffee', brandColor: '#EA580C', accentColor: '#FDE047', imagePosition: '50% 52%', imageScale: 'scale-[1.75]', visualType: 'juice_pack', shortBrandTag: 'برتقال ORANGE' },
  { id: 'drk_13', code: 'DRK-13', category: 'drinks_snacks', subGroup: 'drinks', nameAr: 'عصير جهينة كوكتيل', nameEn: 'Juhayna Fruit Cocktail', nameDe: 'Juhayna Fruchtcocktail', descAr: 'عبوة عصير جهينة كوكتيل فواكه مشكلة', descEn: 'Chilled Juhayna mixed fruit juice', descDe: 'Juhayna Multivitaminsaft', priceEGP: 10, imageUrl: habeJuiceEnergyMaltImg, iconKey: 'coffee', brandColor: '#BE185D', accentColor: '#F59E0B', imagePosition: '28% 55%', imageScale: 'scale-[1.35]', visualType: 'juice_pack', shortBrandTag: 'كوكتيل MIX' },

  // Chips & Crunchy Snacks (Each focused on exact snack texture bowl + crisp pack emblem)
  { id: 'chp_01', code: 'CHP-01', category: 'drinks_snacks', subGroup: 'chips', nameAr: 'شيبسي بالملح', nameEn: 'Chipsy Salted', nameDe: 'Chipsy Gesalzen', descAr: 'كيس شيبسي بالملح مقرمش وطازج', descEn: 'Crispy classic salted potato chips', descDe: 'Knusprige Kartoffelchips Gesalzen', priceEGP: 10, imageUrl: habeChipsSnacksImg, iconKey: 'offers', brandColor: '#DC2626', accentColor: '#FEF08A', imagePosition: '10% 55%', imageScale: 'scale-[1.8]', visualType: 'chips_bag', shortBrandTag: 'شيبسي ملح' },
  { id: 'chp_02', code: 'CHP-02', category: 'drinks_snacks', subGroup: 'chips', nameAr: 'شيبسي بالجبنة', nameEn: 'Chipsy Cheese', nameDe: 'Chipsy Käse', descAr: 'كيس شيبسي بالجبنة المتبلة', descEn: 'Crispy cheese-flavored potato chips', descDe: 'Knusprige Kartoffelchips Käse', priceEGP: 10, imageUrl: habeChipsSnacksImg, iconKey: 'offers', brandColor: '#D97706', accentColor: '#FEF9C3', imagePosition: '36% 58%', imageScale: 'scale-[1.8]', visualType: 'chips_bag', shortBrandTag: 'شيبسي جبنة' },
  { id: 'chp_03', code: 'CHP-03', category: 'drinks_snacks', subGroup: 'chips', nameAr: 'تايجر شيبس (ملح)', nameEn: 'Tiger Chips Salted', nameDe: 'Tiger Chips Gesalzen', descAr: 'كيس تايجر مقرمش بالملح', descEn: 'Crunchy Tiger salted chips', descDe: 'Knusprige Tiger Chips Salz', priceEGP: 10, imageUrl: habeChipsSnacksImg, iconKey: 'offers', brandColor: '#0F172A', accentColor: '#F59E0B', imagePosition: '14% 52%', imageScale: 'scale-[1.6]', visualType: 'chips_bag', shortBrandTag: 'TIGER ملح' },
  { id: 'chp_04', code: 'CHP-04', category: 'drinks_snacks', subGroup: 'chips', nameAr: 'تايجر شيبس (جبنة)', nameEn: 'Tiger Chips Cheese', nameDe: 'Tiger Chips Käse', descAr: 'كيس تايجر مقرمش بالجبنة', descEn: 'Crunchy Tiger cheese chips', descDe: 'Knusprige Tiger Chips Käse', priceEGP: 10, imageUrl: habeChipsSnacksImg, iconKey: 'offers', brandColor: '#B45309', accentColor: '#0F172A', imagePosition: '38% 54%', imageScale: 'scale-[1.65]', visualType: 'chips_bag', shortBrandTag: 'TIGER جبنة' },
  { id: 'chp_05', code: 'CHP-05', category: 'drinks_snacks', subGroup: 'chips', nameAr: 'دوريتوس ناتشو', nameEn: 'Doritos Nacho Cheese', nameDe: 'Doritos Nacho Käse', descAr: 'مقرمشات دوريتوس بنكهة الجبنة الناتشو', descEn: 'Nacho cheese corn tortilla chips', descDe: 'Maischips Nacho Käse', priceEGP: 15, imageUrl: habeChipsSnacksImg, iconKey: 'offers', brandColor: '#B91C1C', accentColor: '#FACC15', imagePosition: '64% 55%', imageScale: 'scale-[1.8]', visualType: 'tortilla_bag', shortBrandTag: 'DORITOS ناتشو' },
  { id: 'chp_06', code: 'CHP-06', category: 'drinks_snacks', subGroup: 'chips', nameAr: 'دوريتوس حار / سويت تشيلي', nameEn: 'Doritos Sweet Chili / Spicy', nameDe: 'Doritos Sweet Chili', descAr: 'مقرمشات دوريتوس سويت تشيلي أو حار', descEn: 'Sweet chili or spicy tortilla chips', descDe: 'Tortilla-Chips Sweet Chili', priceEGP: 15, imageUrl: habeChipsSnacksImg, iconKey: 'offers', brandColor: '#111827', accentColor: '#EF4444', imagePosition: '66% 50%', imageScale: 'scale-[1.65]', visualType: 'tortilla_bag', shortBrandTag: 'DORITOS حار' },
  { id: 'chp_07', code: 'CHP-07', category: 'drinks_snacks', subGroup: 'chips', nameAr: 'شيتوس مقرمش (Cheetos)', nameEn: 'Cheetos Crunchy', nameDe: 'Cheetos Knusprig', descAr: 'شيتوس بالجبنة مقرمش وطازج', descEn: 'Crispy cheese Cheetos snack', descDe: 'Knusprige Cheetos Käse-Snacks', priceEGP: 15, imageUrl: habeChipsSnacksImg, iconKey: 'offers', brandColor: '#EA580C', accentColor: '#1E293B', imagePosition: '90% 55%', imageScale: 'scale-[1.8]', visualType: 'cheese_puffs', shortBrandTag: 'CHEETOS' },

  // Chocolates & Biscuits (14 Distinct SKUs with unique visual types, crops & brand colors)
  { id: 'swt_01', code: 'SWT-01', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'شوكولاتة جالكسي (Galaxy)', nameEn: 'Galaxy Milk Chocolate', nameDe: 'Galaxy Schokolade', descAr: 'بار شوكولاتة جالكسي بالحليب الناعم', descEn: 'Smooth Galaxy milk chocolate bar', descDe: 'Feine Vollmilchschokolade Galaxy', priceEGP: 15, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#4A2511', accentColor: '#D97706', imagePosition: '50% 48%', imageScale: 'scale-[1.7]', visualType: 'chocolate_bar', shortBrandTag: 'GALAXY' },
  { id: 'swt_02', code: 'SWT-02', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'شوكولاتة كادبوري / ديلايت', nameEn: 'Cadbury Dairy Milk', nameDe: 'Cadbury Schokolade', descAr: 'بار شوكولاتة كادبوري الحليب الأصلية', descEn: 'Classic Cadbury milk chocolate', descDe: 'Klassische Cadbury Milchschokolade', priceEGP: 15, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#581C87', accentColor: '#FDE047', imagePosition: '46% 52%', imageScale: 'scale-[1.6]', visualType: 'chocolate_bar', shortBrandTag: 'CADBURY' },
  { id: 'swt_03', code: 'SWT-03', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'فلوتس 2 صابع شوكولاتة', nameEn: 'Flutes 2-Finger Chocolate', nameDe: 'Flutes Schokoriegel', descAr: 'بسكويت ويفر بالكريمة والشوكولاتة (صابعين)', descEn: 'Crispy wafer roll filled with creamy chocolate (2 sticks)', descDe: 'Knusprige Waffelröllchen mit Schokoladenfüllung', priceEGP: 15, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#991B1B', accentColor: '#FBBF24', imagePosition: '15% 58%', imageScale: 'scale-[1.7]', visualType: 'wafer_pack', shortBrandTag: 'FLUTES ×2' },
  { id: 'swt_04', code: 'SWT-04', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'شوكولاتة مورو (Moro)', nameEn: 'Cadbury Moro Bar', nameDe: 'Moro Schokoriegel', descAr: 'بار شوكولاتة بالكراميل والنوجا مورو', descEn: 'Caramel & nougat chocolate bar', descDe: 'Karamell-Nougat-Schokoriegel', priceEGP: 12, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#3B0764', accentColor: '#F59E0B', imagePosition: '18% 50%', imageScale: 'scale-[1.55]', visualType: 'chocolate_bar', shortBrandTag: 'MORO' },
  { id: 'swt_05', code: 'SWT-05', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'شوكولاتة ماندولين (Mandolin)', nameEn: 'Mandolin Chocolate', nameDe: 'Mandolin Schokoriegel', descAr: 'بار ويفر كراميل مغطى بالشوكولاتة ماندولين', descEn: 'Wafer & caramel chocolate bar', descDe: 'Karamell-Waffel-Schokoriegel', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#B91C1C', accentColor: '#FFFFFF', imagePosition: '22% 68%', imageScale: 'scale-[1.65]', visualType: 'wafer_pack', shortBrandTag: 'MANDOLIN' },
  { id: 'swt_06', code: 'SWT-06', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'ماندولين ويفر (Mandolin Wafer)', nameEn: 'Mandolin Mini Wafer', nameDe: 'Mandolin Waffel', descAr: 'قطعة ماندولين ويفر المقرمشة 5 ج.م', descEn: 'Crisp mini chocolate wafer', descDe: 'Knusprige Mini-Schokowaffel', priceEGP: 5, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#9A3412', accentColor: '#FDE047', imagePosition: '12% 72%', imageScale: 'scale-[1.8]', visualType: 'wafer_pack', shortBrandTag: 'WAFER 5£' },
  { id: 'swt_07', code: 'SWT-07', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'بسكويت هالي (Hally)', nameEn: 'Hally Biscuit Pack', nameDe: 'Hally Keks', descAr: 'بسكويت سادة/محشو هالي اللذيذ', descEn: 'Hally sweet biscuit pack', descDe: 'Hally Gebäckpackung', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#0F766E', accentColor: '#FEF08A', imagePosition: '36% 18%', imageScale: 'scale-[1.7]', visualType: 'cookie_pack', shortBrandTag: 'HALLY' },
  { id: 'swt_08', code: 'SWT-08', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'دايجستف شوكولاتة', nameEn: 'Digestive Chocolate Biscuit', nameDe: 'Digestive Schokokeks', descAr: 'بسكويت دايجستف القمح الكامل المغطى بالشوكولاتة', descEn: 'Whole-wheat digestive biscuit coated in chocolate', descDe: 'Vollkorn-Keks mit Schokoladenüberzug', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#92400E', accentColor: '#FDE68A', imagePosition: '36% 15%', imageScale: 'scale-[1.75]', visualType: 'cookie_pack', shortBrandTag: 'DIGESTIVE' },
  { id: 'swt_09', code: 'SWT-09', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'بسكويت أوريو (Oreo)', nameEn: 'Oreo Sandwich Cookies', nameDe: 'Oreo Doppelkeks', descAr: 'بسكويت أوريو كاكاو بكريمة الفانيليا', descEn: 'Classic chocolate cookies with vanilla cream', descDe: 'Klassische Kakaokekse mit Vanillecreme', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#1E3A8A', accentColor: '#FFFFFF', imagePosition: '82% 24%', imageScale: 'scale-[1.85]', visualType: 'cookie_pack', shortBrandTag: 'OREO' },
  { id: 'swt_10', code: 'SWT-10', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'كيك هوهوز (HoHos)', nameEn: 'HoHos Rolled Chocolate Cake', nameDe: 'HoHos Schokokuchen', descAr: 'كيك هوهوز ملفوف بكريمة الفانيليا والشوكولاتة', descEn: 'Cream-filled chocolate Swiss roll snack', descDe: 'Gefüllter Schoko-Biskuitrolle', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#7C2D12', accentColor: '#DC2626', imagePosition: '76% 74%', imageScale: 'scale-[1.75]', visualType: 'cake_roll', shortBrandTag: 'HOHOS' },
  { id: 'swt_11', code: 'SWT-11', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'بسكويت بيمبو (Bimbo)', nameEn: 'Bimbo Chocolate Biscuit', nameDe: 'Bimbo Schokokeks', descAr: 'بسكويت بيمبو المصري المغطى بالشوكولاتة', descEn: 'Egyptian classic chocolate-glazed biscuit', descDe: 'Klassischer Schokoglasur-Keks', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#111827', accentColor: '#DC2626', imagePosition: '34% 22%', imageScale: 'scale-[1.6]', visualType: 'cookie_pack', shortBrandTag: 'BIMBO' },
  { id: 'swt_12', code: 'SWT-12', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'دريو / توبو براوني كيك', nameEn: 'Drio / Topo Brownie Cake', nameDe: 'Brownie-Kuchen', descAr: 'قطعة كيك دريو أو توبو براوني الغنية بالكاكاو', descEn: 'Rich cocoa brownie cake slice', descDe: 'Saftiger Schoko-Brownie', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#451A03', accentColor: '#F59E0B', imagePosition: '68% 72%', imageScale: 'scale-[1.65]', visualType: 'cake_roll', shortBrandTag: 'BROWNIE' },
  { id: 'swt_13', code: 'SWT-13', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'لمبادا ويفر (Lambada)', nameEn: 'Lambada Crispy Wafer', nameDe: 'Lambada Waffeln', descAr: 'بسكويت ويفر لمبادا بكريمة الكاكاو أو البندق', descEn: 'Layered crispy hazelnut/cocoa wafer pack', descDe: 'Knusprige Haselnuss-Waffel', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#B45309', accentColor: '#DC2626', imagePosition: '20% 60%', imageScale: 'scale-[1.55]', visualType: 'wafer_pack', shortBrandTag: 'LAMBADA' },
  { id: 'swt_14', code: 'SWT-14', category: 'drinks_snacks', subGroup: 'sweets', nameAr: 'جيمبو شوكو ميكس / زمزمية بسكويت', nameEn: 'Jumbo Choco Mix / Zamzamia Biscuit', nameDe: 'Schoko-Gebäck-Mix', descAr: 'عبوة بسكويت محشو جيمبو شوكو ميكس أو زمزمية', descEn: 'Crunchy chocolate biscuit mix pack', descDe: 'Schokoladenkeks-Packung', priceEGP: 10, imageUrl: habeChocolateBiscuitsImg, iconKey: 'sweets', brandColor: '#374151', accentColor: '#F43F5E', imagePosition: '76% 32%', imageScale: 'scale-[1.45]', visualType: 'cookie_pack', shortBrandTag: 'JUMBO MIX' },
];

export const HABE_SATURDAY_OFFERS = [
  {
    id: 'sat_01',
    code: 'WEEK-SUN-THU',
    badgeAr: 'فحص كل سبت — عمل من الأحد للخميس',
    badgeEn: 'Checked Every Saturday · Active Sun–Thu',
    badgeDe: 'Samstags-Check · Aktiv So–Do',
    titleAr: 'عرض الأحد للخميس الأسبوعي لعمال وموظفي المصنع',
    titleEn: 'Sun–Thu Weekly Shift Meal & Beverage Bundle',
    titleDe: 'Wöchentliches Schicht-Angebot (So–Do)',
    descAr: 'يُفتح الفحص كل يوم سبت (عطلة المصنع الأسبوعية) لاعتماد وتنزيل باقات الخصم المخصصة لأيام العمل الأحد حتى الخميس: وجبة غداء 92 ج.م + مشروب بيبسي الهضبة بـ 10 ج.م أو جهينة.',
    descEn: 'Checked each Saturday (weekend off) to publish new Sun–Thu discounts: 92 EGP Economy Lunch + 10 EGP cold beverage.',
    descDe: 'Jeden Samstag (Wochenende) wird geprüft, welche Angebote für Sonntag bis Donnerstag freigeschaltet werden.',
    discountTextAr: 'فحص السبت الأسبوعي',
  },
  {
    id: 'sat_02',
    code: 'COMPANY-VOUCHER',
    badgeAr: 'دعم الشركة — فوتشر بدون أسماء',
    badgeEn: 'Company Subsidy — Anonymous Voucher',
    badgeDe: 'Firmenzuschuss — Anonymer Gutschein',
    titleAr: 'فوتشر الدعم المؤسسي المعتمد (مع إلغاء الأسماء)',
    titleEn: 'Company-Subsidized Anonymous Employee Voucher',
    titleDe: 'Anonymer Firmen-Essensgutschein',
    descAr: 'في حالة نزول فوتشر دعم مباشر من الشركة، تصدر الفواتير والإيصالات بوضع "فوتشر دعم الشركة — بدون أسماء" لحماية خصوصية العاملين واقتصارها على الحصص المعتمدة.',
    descEn: 'When company meal subsidy vouchers are issued, receipts can hide personal names automatically for privacy.',
    descDe: 'Bei Firmenzuschüssen werden Quittungen auf Wunsch ohne persönliche Namen ausgestellt.',
    discountTextAr: 'دعم 100% / فوتشر',
  },
];

// =========================================================================
// Ha-Be Egypt Unified Employee Roster (Re-exported from pure TS core)
// =========================================================================
export type { HabeEmployeeRecord } from './habeDirectoryCore';
export { HABE_CORPORATE_SHEET_30, HABE_EGYPT_EMPLOYEES } from './habeDirectoryCore';
