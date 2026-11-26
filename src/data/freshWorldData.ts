import greenNileCarrotsImg from '../assets/images/green_nile_carrots_dew_1795563667625.jpg';
import factoryMicrowavableMealImg from '../assets/images/b2b_factory_microwavable_meal_1795563667819.jpg';
import basitLoyaltyCardHeroImg from '../assets/images/basit_loyalty_card_hero_1795563667645.jpg';
import fresh3dFruitsCollectionImg from '../assets/images/fresh_3d_fruits_collection_1795563668485.jpg';
import sweetSpicySandwichHeroImg from '../assets/images/sweet_spicy_sandwich_hero_1795563668343.jpg';
import basitCateringHeroImg from '../assets/images/basit_catering_hero_1794650655662.jpg';
import alAinAttaraHerbsImg from '../assets/images/al_ain_attara_herbs_1795368109370.jpg';
import alAinGrandMarketImg from '../assets/images/al_ain_grand_market_aisle_1795368108690.jpg';
import microwaveMealBoxesImg from '../assets/images/basit_microwave_meal_boxes_1795562708424.jpg';
import macaronaBechamelImg from '../assets/images/baked_macarona_bechamel_tray_1795443068298.jpg';
import charcoalGrillsImg from '../assets/images/succulent_charcoal_grills_1795443029475.jpg';
import canteenHotMealsImg from '../assets/images/canteen_hot_meals_platter_1794852898424.jpg';
import factoryStripImg from '../assets/images/strip_factory_catering_1794519256376.jpg';
import sweetsPatisserieImg from '../assets/images/sweets_patisserie_offer_1794836175470.jpg';
import coffeeNutsImg from '../assets/images/coffee_nuts_roastery_1794847882208.jpg';
import wataniyaGiftBoxesImg from '../assets/images/wataniya_seasonal_gift_boxes_1794529872199.jpg';
import kahkLuxuryBoxImg from '../assets/images/kahk_eid_luxury_box_1795443065782.jpg';
import kosharyBoxImg from '../assets/images/authentic_egyptian_koshary_box_1795443032946.jpg';
import foulTaameyaImg from '../assets/images/egyptian_foul_taameya_breakfast_1795443033030.jpg';
import traditionalAttaraImg from '../assets/images/traditional_attara_spice_shop_1795443031358.jpg';
import regeneratedProduceImg from '../assets/images/regenerated_image_1795588931333.jpg';

export const GREEN_NILE_HERO_ASSETS = {
  carrotsDew: greenNileCarrotsImg,
  factoryMeal: factoryMicrowavableMealImg,
  loyaltyCard: basitLoyaltyCardHeroImg,
  fruits3d: fresh3dFruitsCollectionImg,
  sweetSpicySandwich: sweetSpicySandwichHeroImg,
  cateringHero: basitCateringHeroImg,
};

export interface B2BHeroSlide {
  id: string;
  imageUrl: string;
  tagAr: string;
  tagEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  ctaAr: string;
  ctaEn: string;
  actionType: 'fresh_world' | 'factory_quote' | 'events_quote' | 'basit_card';
  isBasitCardSlide?: boolean;
}

export const B2B_HERO_CAROUSEL_SLIDES: B2BHeroSlide[] = [
  {
    id: 'slide_factory_meal',
    imageUrl: factoryMicrowavableMealImg,
    tagAr: 'تغذية المصانع والشركات B2B',
    tagEn: 'Corporate & Factory Meals',
    titleAr: 'وجبات المصانع الحرارية الجاهزة للميكرويف',
    titleEn: 'Microwavable Factory Meal Packages',
    subtitleAr: 'تغليف صحي محكم الغلق مطابق لمعايير السلامة الغذائية HACCP لجميع الورديات',
    subtitleEn: 'Hermetically sealed hygienic thermal boxes built for daily factory shifts',
    ctaAr: 'اطلب تعاقد توريد المصانع',
    ctaEn: 'Request Factory Contract',
    actionType: 'factory_quote',
  },
  {
    id: 'slide_green_nile_dew',
    imageUrl: greenNileCarrotsImg,
    tagAr: 'حصاد النيل الأخضر | Fresh World',
    tagEn: 'Green Nile Harvest | 3D Store',
    titleAr: 'خضروات وفواكه طازجة من المزرعة للمطبخ',
    titleEn: 'Dew-Fresh Produce Direct From Farm',
    subtitleAr: 'فواكه موسمية، خضروات منتقاة، ووجبات جاهزة بتجربة تسوق ثلاثية الأبعاد',
    subtitleEn: 'Hand-picked produce, specialty fruits & ready meals in our 3D Fresh World',
    ctaAr: 'تصفح حصاد النيل الأخضر',
    ctaEn: 'Explore Fresh World',
    actionType: 'fresh_world',
  },
  {
    id: 'slide_catering_events',
    imageUrl: basitCateringHeroImg,
    tagAr: 'كيترينج الفعاليات والمؤتمرات',
    tagEn: 'Events & Banquet Catering',
    titleAr: 'بوفيهات مفتوحة وضيافة احترافية للشركات',
    titleEn: 'Corporate Catering & Open Buffets',
    subtitleAr: 'تجهيز كامل لحفلات الافتتاح، المؤتمرات الدولية، والأفراح الكبرى',
    subtitleEn: 'End-to-end culinary execution for conferences, openings & gala weddings',
    ctaAr: 'احجز كيترينج المناسبة',
    ctaEn: 'Book Event Catering',
    actionType: 'events_quote',
  },
  {
    id: 'slide_basit_card',
    imageUrl: basitLoyaltyCardHeroImg,
    tagAr: 'برنامج ولاء باسط | Basit Card',
    tagEn: 'Basit Card Loyalty Program',
    titleAr: 'بطاقة باسط — خصم 10% للعاملين المتعاقدين',
    titleEn: 'Basit Card — 10% Off For Contracted Staff',
    subtitleAr: 'خصم 10% للعاملين المتعاقدين مع باسط في المطاعم، السوبر ماركت والوجبات',
    subtitleEn: '10% instant discount for contracted employees across dining & Fresh World',
    ctaAr: 'عرض بطاقة باسط',
    ctaEn: 'Open Basit Card',
    actionType: 'basit_card',
    isBasitCardSlide: true,
  },
];

export type FreshWorldCategoryId = 'all' | 'fruits' | 'vegetables' | 'ready_meals';

export interface FreshWorldCategory {
  id: FreshWorldCategoryId;
  emoji: string;
  labelAr: string;
  labelEn: string;
  imageUrl: string;
}

export const FRESH_WORLD_CATEGORIES: FreshWorldCategory[] = [
  {
    id: 'all',
    emoji: '✨',
    labelAr: 'الكل',
    labelEn: 'All',
    imageUrl: alAinGrandMarketImg,
  },
  {
    id: 'fruits',
    emoji: '🍎',
    labelAr: 'فواكه',
    labelEn: 'Fruits',
    imageUrl: fresh3dFruitsCollectionImg,
  },
  {
    id: 'vegetables',
    emoji: '🥕',
    labelAr: 'خضروات',
    labelEn: 'Vegetables',
    imageUrl: alAinAttaraHerbsImg,
  },
  {
    id: 'ready_meals',
    emoji: '🍽️',
    labelAr: 'وجبات جاهزة',
    labelEn: 'Ready Meals',
    imageUrl: sweetSpicySandwichHeroImg,
  },
];

export interface FreshWorldProduct {
  id: string;
  category: Exclude<FreshWorldCategoryId, 'all'>;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  unitAr: string;
  unitEn: string;
  priceEgp: number;
  imageUrl: string;
  badgeAr?: string;
  badgeEn?: string;
  isNewDiscovery?: boolean;
}

export const FRESH_WORLD_PRODUCTS: FreshWorldProduct[] = [
  {
    id: 'fw_sweet_spicy_sandwich',
    category: 'ready_meals',
    nameAr: 'سويت أند سبايسي ساندوتش',
    nameEn: 'Sweet & Spicy Sandwich',
    subtitleAr: 'دجاج مشوي متبل مع هالابينو وعسل بريوش في خبز فرنسي مقرمش',
    subtitleEn: 'Chargrilled glazed chicken, jalapeño & spicy honey on artisan baguette',
    unitAr: 'ساندوتش فردي 320 جم',
    unitEn: 'Single Pack 320g',
    priceEgp: 145,
    imageUrl: canteenHotMealsImg,
    badgeAr: 'اكتشف الجديد',
    badgeEn: 'Discover New',
    isNewDiscovery: true,
  },
  {
    id: 'fw_factory_microwavable_box',
    category: 'ready_meals',
    nameAr: 'علبة وجبة المصنع الحرارية B2B',
    nameEn: 'Microwavable Factory Meal Box',
    subtitleAr: 'بروتين مشوي + أرز بالخلطة + خضار سوتيه + سلطة ومخللات محكمة الغلق',
    subtitleEn: 'Grilled protein, seasoned rice, sautéed veggies & side salad in sealed box',
    unitAr: 'وجبة كاملة 550 جم',
    unitEn: 'Complete Meal 550g',
    priceEgp: 165,
    imageUrl: factoryStripImg,
    badgeAr: 'الأكثر تعاقداً',
    badgeEn: 'B2B Best Seller',
  },
  {
    id: 'fw_macarona_bechamel_tray',
    category: 'ready_meals',
    nameAr: 'طاجن مكرونة بالبشاميل الساخن',
    nameEn: 'Baked Macarona Bechamel Tray',
    subtitleAr: 'مكرونة باللحم المفروم وصوص البشاميل الذهبي جاهزة للتسخين الفوري',
    subtitleEn: 'Oven-baked pasta with minced beef and creamy golden bechamel sauce',
    unitAr: 'عبوة 500 جم',
    unitEn: '500g Meal Pack',
    priceEgp: 135,
    imageUrl: macaronaBechamelImg,
  },
  {
    id: 'fw_charcoal_grills_box',
    category: 'ready_meals',
    nameAr: 'بوكس مشويات الفحم الملكي',
    nameEn: 'Royal Charcoal Grills Box',
    subtitleAr: 'كفتة وكباب وشيش طاووق مشوي على الفحم مع أرز بسمتي وسلطة طحينة',
    subtitleEn: 'Charcoal kofta, kebab & shish tawook with basmati rice & tahina',
    unitAr: 'وجبة VIP 600 جم',
    unitEn: 'VIP Box 600g',
    priceEgp: 220,
    imageUrl: charcoalGrillsImg,
  },
  {
    id: 'fw_microwave_variety_pack',
    category: 'ready_meals',
    nameAr: 'باقة وجبات الوردية المتنوعة',
    nameEn: 'Shift Variety Meal Packs',
    subtitleAr: 'تشكيلة وجبات ميكرويف حرارية للورديات الصباحية والمسائية',
    subtitleEn: 'Assorted thermal microwavable packs tailored for factory shifts',
    unitAr: 'عبوة مزدوجة',
    unitEn: 'Dual Shift Pack',
    priceEgp: 190,
    imageUrl: microwaveMealBoxesImg,
  },
  {
    id: 'fw_apples_red_premium',
    category: 'fruits',
    nameAr: 'تفاح أحمر مستورد فاخر',
    nameEn: 'Crisp Red & Gala Apples',
    subtitleAr: 'فرز أول مقرمش ومنتقى بعناية للضيافة المؤسسية وصناديق الفاكهة',
    subtitleEn: 'Hand-graded extra-sweet crisp apples for executive fruit boxes',
    unitAr: 'عبوة 1 كجم',
    unitEn: '1 kg Pack',
    priceEgp: 95,
    imageUrl: wataniyaGiftBoxesImg,
  },
  {
    id: 'fw_avocado_hass',
    category: 'fruits',
    nameAr: 'أفوكادو هاس ناضج للطهي',
    nameEn: 'Ripe Hass Avocados',
    subtitleAr: 'أفوكادو كريمي طازج مثالي لسلطات الموظفين وبوفيهات المؤتمرات',
    subtitleEn: 'Creamy ready-to-slice avocados curated for healthy corporate menus',
    unitAr: 'عبوة 500 جم (2 حبة)',
    unitEn: '500g Twin Pack',
    priceEgp: 140,
    imageUrl: sweetsPatisserieImg,
  },
  {
    id: 'fw_plum_ruby',
    category: 'fruits',
    nameAr: 'برقوق روبي طازج',
    nameEn: 'Ruby Fresh Plums',
    subtitleAr: 'برقوق حلو العصارة مغسول ومغلف في عبوات مبردة آمنة',
    subtitleEn: 'Juicy ruby-skinned plums packed in chilled food-safe punnets',
    unitAr: 'عبوة 750 جم',
    unitEn: '750g Punnet',
    priceEgp: 85,
    imageUrl: kahkLuxuryBoxImg,
  },
  {
    id: 'fw_banana_nile',
    category: 'fruits',
    nameAr: 'موز بلدي ذهبي فاخر',
    nameEn: 'Golden Harvest Bananas',
    subtitleAr: 'موز مزارع الدلتا المختار بمستوى نضج مثالي لوجبات الإفطار',
    subtitleEn: 'Delta-grown golden bananas ideal for daily worker breakfast packs',
    unitAr: 'كجم صافي',
    unitEn: '1 kg Bunch',
    priceEgp: 42,
    imageUrl: coffeeNutsImg,
  },
  {
    id: 'fw_dates_medjool',
    category: 'fruits',
    nameAr: 'تمور مجدول فاخرة — حصاد النيل',
    nameEn: 'Royal Medjool Dates',
    subtitleAr: 'تمور سيوى ومجدول درجة أولى من الإنتاجية وحتى التعبئة والتغليف',
    subtitleEn: 'Grade-A oasis Medjool dates harvested and packed under cold chain',
    unitAr: 'علبة 1 كجم',
    unitEn: '1 kg Gift Box',
    priceEgp: 195,
    imageUrl: '/assets/catering/siwa_dates.jpg',
  },
  {
    id: 'fw_carrots_dew',
    category: 'vegetables',
    nameAr: 'جزر بلدي طازج بقطرات الندى',
    nameEn: 'Dew-Fresh Nile Carrots',
    subtitleAr: 'جزر حصاد النيل الأخضر المغسول والمبرد مباشرة من المزرعة',
    subtitleEn: 'Sweet crunchy Nile carrots washed and chilled straight from harvest',
    unitAr: 'كيس 1 كجم',
    unitEn: '1 kg Bag',
    priceEgp: 35,
    imageUrl: regeneratedProduceImg,
  },
  {
    id: 'fw_eggplant_dark',
    category: 'vegetables',
    nameAr: 'باذنجان رومي أسود لامع',
    nameEn: 'Fresh Egyptian Eggplant',
    subtitleAr: 'باذنجان طازج فائق الجودة لوجبات المسقعة والمشويات المؤسسية',
    subtitleEn: 'Glossy farm eggplant curated for daily kitchen prep & grills',
    unitAr: 'عبوة 1.5 كجم',
    unitEn: '1.5 kg Crate',
    priceEgp: 45,
    imageUrl: kosharyBoxImg,
  },
  {
    id: 'fw_parsley_fresh',
    category: 'vegetables',
    nameAr: 'بقدونس وخضرة مزارع طازجة',
    nameEn: 'Garden Fresh Parsley & Greens',
    subtitleAr: 'حزم خضروات ورقية مغسولة ومعقمة بالأوزون جاهزة للاستخدام المباشر',
    subtitleEn: 'Ozone-sanitized culinary parsley and herbs ready for direct prep',
    unitAr: 'باقة 3 حزم',
    unitEn: '3-Bunch Bundle',
    priceEgp: 28,
    imageUrl: traditionalAttaraImg || foulTaameyaImg,
  },
];

export type B2BLocationType =
  | 'factory'
  | 'company'
  | 'construction_site'
  | 'villa'
  | 'worker_housing';

export const B2B_LOCATION_TYPES: { id: B2BLocationType; labelAr: string; labelEn: string }[] = [
  { id: 'factory', labelAr: 'مصنع', labelEn: 'Factory' },
  { id: 'company', labelAr: 'شركة / مقر إداري', labelEn: 'Company / HQ' },
  { id: 'construction_site', labelAr: 'موقع إنشاءات', labelEn: 'Construction Site' },
  { id: 'villa', labelAr: 'فيلا / إقامة خاصة', labelEn: 'Villa / Residence' },
  { id: 'worker_housing', labelAr: 'سكن عمال ومهندسين', labelEn: 'Worker Housing' },
];

export const B2B_MAP_PINS = [
  {
    id: 'pin_badr',
    labelAr: 'المنطقة الصناعية — مدينة بدر',
    labelEn: 'Badr City Industrial Zone',
    coords: '30.138° N, 31.737° E',
  },
  {
    id: 'pin_capital',
    labelAr: 'العاصمة الإدارية الجديدة (حي المال والأعمال)',
    labelEn: 'New Administrative Capital',
    coords: '30.013° N, 31.741° E',
  },
  {
    id: 'pin_shorouk',
    labelAr: 'مدينة الشروق — محور السادات',
    labelEn: 'El Shorouk City — Sadat Axis',
    coords: '30.121° N, 31.608° E',
  },
  {
    id: 'pin_10ramadan',
    labelAr: 'العاشر من رمضان — منطقة A3 الصناعية',
    labelEn: '10th of Ramadan Industrial Park',
    coords: '30.292° N, 31.742° E',
  },
  {
    id: 'pin_madinaty',
    labelAr: 'مدينتي والقطامية التجمع الخامس',
    labelEn: 'Madinaty & New Cairo',
    coords: '30.088° N, 31.635° E',
  },
];

export interface B2BTrackedOrder {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  address: string;
  mapPinLabel: string;
  floor: string;
  apartment: string;
  locationType: B2BLocationType;
  items: { nameAr: string; nameEn: string; qty: number; priceEgp: number }[];
  totalEgp: number;
  stageIndex: 0 | 1 | 2 | 3;
  createdAt: string;
  createCorporateAccount?: boolean;
}
