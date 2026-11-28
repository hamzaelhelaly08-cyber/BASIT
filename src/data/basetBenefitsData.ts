import eidMeatCleanImg from '../assets/images/basit_eid_meat_fresh_1795846885518.jpg';
import ramadanPantryCleanImg from '../assets/images/basit_ramadan_box_pro_1795846886042.jpg';
import eidKahkCleanImg from '../assets/images/basit_kahk_eid_box_1795846886628.jpg';
import oasisDatesCleanImg from '../assets/images/basit_dates_collection_grade_a_1795846885412.jpg';
import mawlidSweetBoxImg from '../assets/images/basit_mawlid_sweet_box_1795846885879.jpg';
import familyLeisureHeroCleanImg from '../assets/images/family_leisure_hero_clean_1795839382523.jpg';

import circusImg from '../assets/images/al_ain_kids_circus_fun_1794529872787.jpg';
import cinemaImg from '../assets/images/madinaty_cinema_vip_1794852898185.jpg';
import screensGamingImg from '../assets/images/basit_family_screens_lounge_1795841341709.jpg';
import touristResortsImg from '../assets/images/baset_tourist_resorts_1795635310828.jpg';
import spaImg from '../assets/images/spa_relaxation_care_1794836174339.jpg';
import saltHouseImg from '../assets/images/therapeutic_salt_cave_room_1795443030309.jpg';
import familyTripsImg from '../assets/images/baset_family_trips_1795635311568.jpg';
import coastalChaletsImg from '../assets/images/baset_coastal_chalets_1795635311736.jpg';

export const BASIT_OFFICIAL_CARD_ASSET = '/assets/aistudio/image_31437b35.png';
export const BASET_FAMILY_CARD_ASSET = BASIT_OFFICIAL_CARD_ASSET;
export const BASET_ENTERTAINMENT_HERO_ASSET = familyLeisureHeroCleanImg;

export interface BasetFoodOfferItem {
  id: 'eid_adha_meat' | 'ramadan_carton' | 'eid_kahk_box' | 'zadi_ramadan_dates' | 'mawlid_sweet_box';
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  partnerBrandAr: string;
  partnerBrandEn: string;
  originTagAr?: string;
  originTagEn?: string;
  primaryImage: string;
  secondaryImage?: string;
  discountPct: number;
  basePriceEgp: number | null;
  unitLabelAr: string;
  unitLabelEn: string;
  contentsAr: string[];
  contentsEn: string[];
  termsAr: string[];
  termsEn: string[];
}

export const FOOD_BENEFIT_OFFERS: BasetFoodOfferItem[] = [
  {
    id: 'eid_adha_meat',
    titleAr: 'لحوم الأضحية والطازج',
    titleEn: 'Eid Al-Adha & Fresh Sacrifice Meat',
    subtitleAr: 'بوكس CATERING EGYPT المبرد لقطعيات اللحم الطازج البلدي (جريد A)',
    subtitleEn: 'CATERING EGYPT chilled box with curated fresh prime cuts Grade A',
    partnerBrandAr: 'CATERING MISR / CATERING EGYPT',
    partnerBrandEn: 'CATERING MISR / CATERING EGYPT',
    primaryImage: eidMeatCleanImg,
    discountPct: 10,
    basePriceEgp: 1950,
    unitLabelAr: 'بوكس عائلي / 5 كجم',
    unitLabelEn: 'Family Box / 5 kg',
    contentsAr: [
      'قطعيات ستيك وكباب حلة ومكعبات طازجة معبأة حرارياً (Grade A)',
      'إشراف بيطري كامل وسلسلة تبريد HACCP معتمدة',
      'تغليف فاخر بشعار CATERING MISR وبطاقة الضمان',
    ],
    contentsEn: [
      'Fresh vacuum-sealed prime steaks, ribs & stew cuts Grade A',
      'Full veterinary certification & HACCP cold-chain delivery',
      'Official CATERING MISR thermal packaging',
    ],
    termsAr: [
      'يُطبّق خصم 10% فورياً فقط عند تفعيل كارت باسط العائلي والتحقق من الرقم التسلسلي.',
      'متاح للعاملين بالمنشآت المتعاقدة وللأسر المشتركة بالبرنامج.',
      'التسليم المبرد في القاهرة الكبرى، بدر، العبور، والعاشر من رمضان.',
    ],
    termsEn: [
      '10% instant discount applies exclusively after verifying an active BASET Family Card.',
      'Available to contracted corporate staff & registered program families.',
      'Chilled delivery across Greater Cairo, Badr, Obour & 10th of Ramadan.',
    ],
  },
  {
    id: 'ramadan_carton',
    titleAr: 'كرتونة السلع والتموين الرمضاني',
    titleEn: 'Ramadan Grocery & Pantry Carton',
    subtitleAr: 'كرتونة التموين والسلع الأساسية المتكاملة من CATERING MISR',
    subtitleEn: 'Complete Ramadan pantry & staple carton by CATERING MISR',
    partnerBrandAr: 'CATERING MISR',
    partnerBrandEn: 'CATERING MISR',
    primaryImage: ramadanPantryCleanImg,
    discountPct: 10,
    basePriceEgp: 680,
    unitLabelAr: 'كرتونة سلع متكاملة',
    unitLabelEn: 'Full Staple Carton',
    contentsAr: [
      'أرز، مكرونة، زيت طعام نقي، سكر، سمن/زيت، وشاي فاخر',
      'منتجات أصلية مغلفة بعناية داخل كرتونة CATERING MISR',
      'مناسبة للاستهلاك العائلي الشهري وتوزيعات الشركات',
    ],
    contentsEn: [
      'Premium rice, pasta, pure cooking oil, sugar, ghee & tea',
      'Genuine national consumer pantry brands packed by CATERING MISR',
      'Tailored for family monthly stock & corporate Ramadan drives',
    ],
    termsAr: [
      'خصم 10% مباشر لحاملي كارت باسط المفعّل عبر الكود الرقمي.',
      'تتوفر كميات تعاقدية للشركات والمصانع مع جدول تسليم موحد.',
      'لا يجمع مع خصومات التصفية الموسمية إلا بقرار الإدارة.',
    ],
    termsEn: [
      'Direct 10% off for verified active BASET Family Card holders.',
      'Bulk enterprise schedules available for factories & corporate accounts.',
      'Cannot be combined with clearance markdowns unless authorized.',
    ],
  },
  {
    id: 'eid_kahk_box',
    titleAr: 'علبة كحك وبسكويت عيد الفطر',
    titleEn: 'Eid Al-Fitr Kahk & Biscuits Luxury Box',
    subtitleAr: 'كحك وبسكويت العيد بالسكر البودرة الفاخر من مطابخ CATERING MISR',
    subtitleEn: 'Traditional butter Kahk & Eid biscuits by CATERING MISR',
    partnerBrandAr: 'CATERING MISR',
    partnerBrandEn: 'CATERING MISR',
    primaryImage: eidKahkCleanImg,
    discountPct: 10,
    basePriceEgp: 540,
    unitLabelAr: 'علبة فاخرة 2 كجم',
    unitLabelEn: 'Luxury 2 kg Box',
    contentsAr: [
      'كحك سادة وعجمية ومكسرات بالسمن الطبيعي 100%',
      'بسكويت زبدة وغريبة وبيتي فور طازج يومياً',
      'تغليف هدايا أنيق بختم CATERING MISR وخصم كارت باسط',
    ],
    contentsEn: [
      'Pure-ghee Kahk plain, agameya & walnut varieties',
      'Fresh daily butter biscuits, ghorayeba & petit-four',
      'Signature CATERING MISR gift box eligible for BASET 10% discount',
    ],
    termsAr: [
      'يشترط إبراز QR كارت باسط المفعّل عند الطلب أو الاستلام للحصول على خصم 10%.',
      'الحجز المسبق للكميات الكبيرة يُسلم قبل العيد بـ 48 ساعة على الأقل.',
    ],
    termsEn: [
      'Active BASET QR presentation required at checkout/pickup for 10% off.',
      'Bulk pre-orders are delivered at least 48h prior to Eid.',
    ],
  },
  {
    id: 'zadi_ramadan_dates',
    titleAr: 'تمور زادي — تمر الوادي والمجدول الفاخر (مقاسات S, M, L وجامبو وسوبر جامبو - جودة A & AB)',
    titleEn: 'Zadi Dates — Premium Al-Wadi & Medjool (S, M, L, Jumbo & Super Jumbo - Grade A & AB)',
    subtitleAr: 'تمور طبيعية فاخرة من واحات الوادي والفرافرة بتصنيف دقيق لجميع المقاسات (Grade A / AB)',
    subtitleEn: 'Authentic oasis dates from El-Wadi & Farafra with rigorous sizing Grade A & AB',
    partnerBrandAr: 'ZADI | تمور الوادي والمجدول · CATERING MISR',
    partnerBrandEn: 'ZADI | El-Wadi & Medjool Dates · CATERING MISR',
    originTagAr: 'تمور طبيعية 100% — جامبو وسوبر جامبو (جريد A & AB)',
    originTagEn: '100% Natural Dates — Jumbo & Super Jumbo (Grade A & AB)',
    primaryImage: oasisDatesCleanImg,
    discountPct: 10,
    basePriceEgp: 420,
    unitLabelAr: 'عبوة مختارة (مقاسات S, M, L, Jumbo)',
    unitLabelEn: 'Selected Box (S, M, L, Jumbo)',
    contentsAr: [
      'تمر مجدول فاخر (مقاسات S, M, L, وجامبو، وسوبر جامبو) — جودة A و AB',
      'تمر الوادي الطبيعي منتقى بعناية وخالٍ من الإضافات الكيميائية',
      'عبوات هدايا خشبية وكرتونية راقية تناسب الاستهلاك المؤسسي والعائلي',
    ],
    contentsEn: [
      'Premium Medjool dates (S, M, L, Jumbo & Super Jumbo) — Grade A & AB',
      'Natural El-Wadi oasis dates carefully sorted without chemical additives',
      'High-end wooden & carton gift presentation boxes',
    ],
    termsAr: [
      'خصم 10% فوري لحاملي بطاقة باسط العائلية المفعّلة.',
      'متاح للشحن الفوري لجميع الشركات والمصانع والأفراد في مصر.',
    ],
    termsEn: [
      'Instant 10% discount for active BASET Family Card holders.',
      'Available for immediate dispatch across corporate accounts in Egypt.',
    ],
  },
  {
    id: 'mawlid_sweet_box',
    titleAr: 'صندوق حلاوة المولد النبوي الشريف (صندوق خشبي تراثي)',
    titleEn: 'Prophet Mawlid Heritage Wooden Chest Box',
    subtitleAr: 'صندوق خشبي تراثي فاخر محفور يدوياً يضم أطايب حلاوة المولد (سمسمية، فستقية، ملبن، وقشطة)',
    subtitleEn: 'Hand-carved wooden chest box filled with traditional Egyptian Mawlid sweets',
    partnerBrandAr: 'CATERING MISR / تراث الحلويات المصرية',
    partnerBrandEn: 'CATERING MISR / Heritage Sweets',
    originTagAr: 'حلويات تقليدية فاخرة — صُنِع في مصر',
    originTagEn: 'Traditional Premium Sweets — Made in Egypt',
    primaryImage: mawlidSweetBoxImg,
    discountPct: 10,
    basePriceEgp: 750,
    unitLabelAr: 'صندوق خشبي تراثي فاخر',
    unitLabelEn: 'Luxury Wooden Chest',
    contentsAr: [
      'سمسمية، فولية، حمصية، فستقية، بندقية، وملبن عين جمل',
      'قشطة بالبندق وملبن محشي جيلي ومكسرات',
      'صندوق خشبي تراثي فاخر قابل لإعادة الاستخدام بشعار باسط',
    ],
    contentsEn: [
      'Sesame, peanut & chickpea brittle, pistachio, hazelnut & walnut malban',
      'Marshmallow nougat rolls & fruit jellies',
      'Reusable handcrafted wooden chest box with BASIT insignia',
    ],
    termsAr: [
      'يسري خصم 10% الفوري باستخدام كارت باسط المفعّل.',
      'متاح لحجوزات الشركات والجهات الحكومية والخاصة.',
    ],
    termsEn: [
      '10% instant discount applies with active BASET card verification.',
      'Available for corporate and institutional bulk reservations.',
    ],
  },
];

export type EntertainmentIconKind =
  | 'circus'
  | 'cinema'
  | 'screens'
  | 'resort'
  | 'spa'
  | 'salt'
  | 'trips'
  | 'chalets';

export interface FamilyEntertainmentCategoryItem {
  id: string;
  iconKind: EntertainmentIconKind;
  titleAr: string;
  titleEn: string;
  partnerAr: string;
  partnerEn: string;
  locationAr: string;
  locationEn: string;
  imageUrl: string;
  discountBadgeAr: string;
  discountBadgeEn: string;
  agreementStatus: 'approved_partner' | 'contract_tier';
  summaryAr: string;
  summaryEn: string;
  termsAr: string;
  termsEn: string;
}

export const FAMILY_ENTERTAINMENT_CATEGORIES: FamilyEntertainmentCategoryItem[] = [
  {
    id: 'cat_circus',
    iconKind: 'circus',
    titleAr: 'السيرك',
    titleEn: 'Circus & Live Shows',
    partnerAr: 'السيرك الكبير أمام مول العين',
    partnerEn: 'Grand Circus — Opposite Al Ain Mall',
    locationAr: 'أمام مول العين — مدينة بدر / السخنة',
    locationEn: 'Opposite Al Ain Mall — Badr / Sokhna',
    imageUrl: circusImg,
    discountBadgeAr: 'خصم يصل إلى 10% بالكارت',
    discountBadgeEn: 'Up to 10% Off with Card',
    agreementStatus: 'approved_partner',
    summaryAr: 'عروض بهلوانية ومهرجين واستعراضات عائلية حية آمنة للأطفال والكبار.',
    summaryEn: 'Live acrobatic & family shows tailored for children and families.',
    termsAr: 'يُطبق الخصم عند تفعيل كارت باسط وإبراز الكود بشباك التذاكر أو الحجز المسبق.',
    termsEn: 'Discount applies upon verified BASET Card QR check at box office.',
  },
  {
    id: 'cat_cinemas',
    iconKind: 'cinema',
    titleAr: 'السينمات وأحدث الأفلام',
    titleEn: 'Cinemas & Latest Movies',
    partnerAr: 'سينما مدينتي VIP وسينما دايموند العاشر',
    partnerEn: 'Madinaty VIP & Diamond 10th Cinema',
    locationAr: 'مدينتي · العاشر من رمضان',
    locationEn: 'Madinaty · 10th of Ramadan',
    imageUrl: cinemaImg,
    discountBadgeAr: 'خصم 10% تذاكر العائلة',
    discountBadgeEn: '10% Family Ticket Discount',
    agreementStatus: 'approved_partner',
    summaryAr: 'قاعات عرض مجهزة لأحدث أفلام الموسم بتجربة عائلية وباقات سناكس.',
    summaryEn: 'Latest blockbuster screenings with VIP seating and family snack packages.',
    termsAr: 'يسري الخصم على تذاكر الدرجة القياسية والعائلية طوال أيام الأسبوع لحاملي الكارت.',
    termsEn: 'Valid on standard & family tickets all week for active card holders.',
  },
  {
    id: 'cat_screens',
    iconKind: 'screens',
    titleAr: 'الشاشات والترفيه',
    titleEn: 'Screens & Interactive Play',
    partnerAr: 'صالات الشاشات التفاعلية والألعاب',
    partnerEn: 'Interactive Screens & Play Lounge',
    locationAr: 'مول العين · مناطق ألعاب العائلات',
    locationEn: 'Al Ain Mall · Family Play Zones',
    imageUrl: screensGamingImg,
    discountBadgeAr: 'خصم 10% باقات اللعب',
    discountBadgeEn: '10% Play Passes Off',
    agreementStatus: 'approved_partner',
    summaryAr: 'ألعاب واقع افتراضي وشاشات تفاعلية ومسابقات عائلية وجوائز فورية.',
    summaryEn: 'VR lounges, interactive screens, arcade stations & family tournaments.',
    termsAr: 'خصم 10% على كروت الشحن الترفيهية عند التفعيل المسبق لكارت باسط.',
    termsEn: '10% off entertainment recharge cards with verified BASET activation.',
  },
  {
    id: 'cat_resorts',
    iconKind: 'resort',
    titleAr: 'القرى السياحية',
    titleEn: 'Tourist Resorts & Villages',
    partnerAr: 'منتجعات وقرى السخنة والبحر الأحمر',
    partnerEn: 'Ain Sokhna & Red Sea Partner Resorts',
    locationAr: 'العين السخنة · البحر الأحمر',
    locationEn: 'Ain Sokhna · Red Sea Coast',
    imageUrl: touristResortsImg,
    discountBadgeAr: 'مزايا وحجوزات تعاقدية',
    discountBadgeEn: 'Contracted Resort Perks',
    agreementStatus: 'contract_tier',
    summaryAr: 'حجوزات اليوم الواحد والإقامة العائلية بأسعار تعاقدية عبر باسط.',
    summaryEn: 'Day-use & family resort stays with partner-verified BASET rates.',
    termsAr: 'خاضع لتوافر الغرف وموافقة الحجز المسبق وفق اتفاقية المنشأة المتعاقدة.',
    termsEn: 'Subject to seasonal availability & verified pre-booking approval.',
  },
  {
    id: 'cat_spa',
    iconKind: 'spa',
    titleAr: 'السبا',
    titleEn: 'Spa & Wellness Lounge',
    partnerAr: 'سبا وحمام مغربي العائلات — العين',
    partnerEn: 'Al Ain Wellness & Moroccan Spa',
    locationAr: 'مول العين — مدينة بدر',
    locationEn: 'Al Ain Mall — Badr City',
    imageUrl: spaImg,
    discountBadgeAr: 'خصم 10% جلسات العناية',
    discountBadgeEn: '10% Wellness Sessions',
    agreementStatus: 'approved_partner',
    summaryAr: 'جلسات استرخاء، حمام مغربي وبخار، وعناية متكاملة في خصوصية تامة.',
    summaryEn: 'Relaxation therapy, steam & Moroccan hammam sessions with privacy.',
    termsAr: 'يتطلب حجز موعد مسبق مع إبراز كارت باسط العائلي المفعّل.',
    termsEn: 'Advance appointment & active BASET QR required upon arrival.',
  },
  {
    id: 'cat_salt_house',
    iconKind: 'salt',
    titleAr: 'بيت الملح',
    titleEn: 'Salt House Halotherapy',
    partnerAr: 'كهف وبيت الملح الاستشفائي',
    partnerEn: 'Therapeutic Salt House Cave',
    locationAr: 'مركز العافية — مول العين',
    locationEn: 'Wellness Wing — Al Ain Mall',
    imageUrl: saltHouseImg,
    discountBadgeAr: 'خصم 10% جلسات الاستشفاء',
    discountBadgeEn: '10% Salt Cave Sessions',
    agreementStatus: 'approved_partner',
    summaryAr: 'غرف ملح طبيعي لتنقية الجهاز التنفسي وتجديد الطاقة للعائلة والأطفال.',
    summaryEn: 'Natural mineral salt therapy rooms for respiratory wellness & calm.',
    termsAr: 'الخصم مفعّل للعضو والتابعين من الدرجة الأولى عند التفعيل الموثق.',
    termsEn: 'Verified 10% discount extends to member and registered family guests.',
  },
  {
    id: 'cat_trips',
    iconKind: 'trips',
    titleAr: 'الرحلات',
    titleEn: 'Family Trips & Excursions',
    partnerAr: 'برنامج رحلات النيل والمعالم للعائلات',
    partnerEn: 'Nile & Heritage Family Excursions',
    locationAr: 'القاهرة · النيل · العين السخنة',
    locationEn: 'Cairo · Nile Cruise · Ain Sokhna',
    imageUrl: familyTripsImg,
    discountBadgeAr: 'ميزة تعاقدية حتى 10%',
    discountBadgeEn: 'Up to 10% Group Benefit',
    agreementStatus: 'contract_tier',
    summaryAr: 'رحلات نيلية ويوميات عائلية شاملة النقل والضيافة بوجبات باسط.',
    summaryEn: 'Curated Nile & heritage day trips with transport and BASIT hospitality.',
    termsAr: 'تنفذ الرحلات وفق الجدول المعتمد للمجموعات والأسر المشتركة بالكارت.',
    termsEn: 'Scheduled group departures subject to verified card-holder roster.',
  },
  {
    id: 'cat_chalets',
    iconKind: 'chalets',
    titleAr: 'الشاليهات',
    titleEn: 'Beachfront Family Chalets',
    partnerAr: 'شاليهات العائلات — الساحل والسخنة',
    partnerEn: 'Coastal & Lagoon Family Chalets',
    locationAr: 'الساحل الشمالي · العين السخنة',
    locationEn: 'North Coast · Ain Sokhna',
    imageUrl: coastalChaletsImg,
    discountBadgeAr: 'خصم 10% إقامة موثقة',
    discountBadgeEn: '10% Verified Stay Off',
    agreementStatus: 'contract_tier',
    summaryAr: 'وحدات وشاليهات عائلية مطلة على البحر بإدارة حجز مضمونة وشفافة.',
    summaryEn: 'Handpicked family beachfront chalets with transparent partner booking.',
    termsAr: 'يؤكد الخصم 10% بعد مراجعة التواريخ وسريان تفعيل كارت باسط العائلي.',
    termsEn: '10% rate confirmed upon date approval & active card verification.',
  },
];
