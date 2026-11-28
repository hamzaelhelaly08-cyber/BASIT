import React, { useState } from 'react';
import {
  Gift,
  Tag,
  Check,
  Copy,
  ShoppingCart,
  Sparkles,
  Heart,
  Package,
  Layers,
  Percent,
} from 'lucide-react';
import ramadanCartonImg from '../assets/images/ramadan_pantry_clean_hamper_1795839382069.jpg';
import eidMeatPacksImg from '../assets/images/eid_meat_clean_box_1795839381870.jpg';
import kahkEidBoxImg from '../assets/images/eid_kahk_clean_platter_1795839382000.jpg';

const charityCaravanImg = '/assets/aistudio/image_78717cad.jpg';
const datesHarvestImg = '/assets/catering/siwa_dates.jpg';

export interface SeasonalGoodItem {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  descAr: string;
  descEn: string;
  packageContentsAr: string[];
  originalPriceEGP: number;
  discountedPriceEGP: number;
  discountPct: number;
  badgeLabelAr: string;
  badgeLabelEn: string;
  imageUrl: string;
  entityNoteAr: string;
}

export const SEASONAL_CHARITY_GOODS: SeasonalGoodItem[] = [
  {
    id: 'season_ramadan_box',
    nameAr: 'كرتونة إمدادات رمضان للمصانع والشركات',
    nameEn: 'Corporate Ramadan Supply Carton Box',
    categoryAr: 'كراتين إمداد غذائي',
    categoryEn: 'Food Supply Cartons',
    descAr: 'كرتونة متكاملة من السلع التموينية الأساسية المعتمدة، معبأة لتوزيعات المصانع والشركات ومبادرات الإطعام المؤسسية.',
    descEn: 'Fully packed Ramadan supply box with premium pantry staples for factory employees and community initiatives.',
    packageContentsAr: [
      'زيت طعام ممتاز نقي (1 لتر كريستال/سلايت)',
      'سكر أبيض نقي فاخر (1 كجم الضحى)',
      'سمنة نباتي ممتازة معبأة في علبة محكمة',
      'مكرونة وأرز مصري رفيع عالي الجودة (2 كجم)',
      'علبة تمور الوادي وسيوة الفاخرة (1 كجم)',
      'شاي ناعم وبقوليات منتقاة بعناية',
    ],
    originalPriceEGP: 650,
    discountedPriceEGP: 585,
    discountPct: 10,
    badgeLabelAr: 'خصم 10% للعاملين المتعاقدين',
    badgeLabelEn: '10% Contracted Employee Discount',
    imageUrl: ramadanCartonImg,
    entityNoteAr: 'خدمة دعم أقوى منتجات في مصر من مزارع الوادي والفرافرة ومزارع دينا ومزارع الوطنية للعاملين في كارفور والشركات المتعاقدة وتطبيق باسط.',
  },
  {
    id: 'season_charity_bag',
    nameAr: 'شنطة الخير لدعم الأسر والمجتمع',
    nameEn: 'Shantet El Kheir Charity Provision Bag',
    categoryAr: 'شنط الخير والمواسم',
    categoryEn: 'Charity Bags',
    descAr: 'حقيبة إطعام قماشية مقواة بشعار باسط ومزارع الوطنية، مجهزة بالسلع الأساسية لتوزيعات قوافل الخير في رمضان والمواسم.',
    descEn: 'Reinforced charitable food bag branded with BASIT & Elwataniya farms, packed with essential food staples.',
    packageContentsAr: [
      'زيت نباتي نقي مكرر',
      'أرز مصري ممتاز كسر منخفض',
      'سكر أبيض بلوري نقي',
      'مكرونة مشكلة سريعة الطهي',
      'فول تدميس بلدي وعدس أصفر',
      'تمر سيوة نصف جاف فاخر',
    ],
    originalPriceEGP: 480,
    discountedPriceEGP: 432,
    discountPct: 10,
    badgeLabelAr: 'خصم 10% لقوافل الخير',
    badgeLabelEn: '10% Charity Convoy Discount',
    imageUrl: charityCaravanImg,
    entityNoteAr: 'منتجات مزارعنا المتعاقدة بالفرافرة وسيوة لضمان أعلى جودة بأقل تكلفة للجمعيات والشركات.',
  },
  {
    id: 'season_adha_meat',
    nameAr: 'أكياس لحوم الأضاحي البلدية المعتمدة',
    nameEn: 'Certified Baladi Eid al-Adha Meat Packs',
    categoryAr: 'لحوم الأضاحي والذبائح',
    categoryEn: 'Eid Meat Packs',
    descAr: 'لحوم بلدية طازجة من مزارع الوطنية بالفرافرة، مقطعة ومجهزة في أكياس مفرغة ومعقمة ومختومة بختم الجودة والكشف البيطري.',
    descEn: 'Fresh municipal beef cuts packed in sterile, food-grade vacuum bags with official veterinary seals.',
    packageContentsAr: [
      'لحم بقري/عجالي بلدي صافي طازج 100%',
      'تعبئة حرارية مفرغة ومحكمة مانعة للتسريب',
      'كشف بيطري رسمي وختم سلامة الغذاء',
      'أوزان معتمدة (1 كجم / 2 كجم / 5 كجم)',
      'جاهزة للتسليم المباشر لموظفي الشركات والمصانع',
    ],
    originalPriceEGP: 450,
    discountedPriceEGP: 405,
    discountPct: 10,
    badgeLabelAr: 'خصم 10% أضاحي العيد',
    badgeLabelEn: '10% Adha Meat Discount',
    imageUrl: eidMeatPacksImg,
    entityNoteAr: 'توريد مباشر من مزارع الثروة الحيوانية للوطنية اللوجستية إلى ثلاجات المقرات والمصانع.',
  },
  {
    id: 'season_kahk_box',
    nameAr: 'علبة كحك وبسكويت العيد الفاخرة (طراز العبد وتسيباس)',
    nameEn: 'Luxury Festive Eid Kahk & Biscuits Box',
    categoryAr: 'حلويات العيد والمناسبات',
    categoryEn: 'Festive Confectionery',
    descAr: 'علبة هدايا معدنية/كرتونية فاخرة مقسمة بعناية تضم كحك السمن البلدي الفاخر بالسكر والبيتي فور والغريبة وبسكويت النشادر.',
    descEn: 'Ornate gift box with compartments of authentic clarified butter kahk, petit fours, ghorayeba and biscuits.',
    packageContentsAr: [
      'كحك سمن بلدي محشو عجوة وعين جمل وملبن',
      'سكر بودرة منخول للتزيين المباشر',
      'بيتي فور شوكولاتة ومربى فاخرة',
      'غريبة ناعمة بالسمن البلدي والفستق',
      'بسكويت نشادر وبرتقال مقرمش',
      'تغليف هدايا احتفالي فاخر للشركات',
    ],
    originalPriceEGP: 550,
    discountedPriceEGP: 495,
    discountPct: 10,
    badgeLabelAr: 'خصم 10% لكحك العيد',
    badgeLabelEn: '10% Festive Sweets Discount',
    imageUrl: kahkEidBoxImg,
    entityNoteAr: 'مخبوز بأجود أنواع السمن البلدي الطبيعي بمواصفات كبرى مصانع الحلويات في مصر.',
  },
  {
    id: 'season_mowled_box',
    nameAr: 'علبة حلاوة المولد النبوي الشريف الفاخرة',
    nameEn: 'Prophet Birthday Luxury Confection Box',
    categoryAr: 'حلاوة المولد التراثية',
    categoryEn: 'Mowled Sweets',
    descAr: 'علبة مستطيلة فاخرة تضم تشكيلة حلاوة المولد المصرية التقليدية بالسمسم والفول السوداني والحمص والملبن المحشو بالمكسرات.',
    descEn: 'Traditional rectangular festive box packed with sesame, peanut, chickpea brittle bars and walnut malban.',
    packageContentsAr: [
      'أقراص وبارات سمسمية ذهبية مقرمشة',
      'فولية سوداني طازج محمص بالعسل',
      'حمصية كرانشي هشة',
      'ملبن أحمر محشو بعين الجمل الفاخر',
      'دومية ولديدة جوز هند طرية',
      'علبة شيك مخصصة لهدايا العاملين والمؤسسات',
    ],
    originalPriceEGP: 420,
    discountedPriceEGP: 378,
    discountPct: 10,
    badgeLabelAr: 'خصم 10% حلاوة المولد',
    badgeLabelEn: '10% Mowled Discount',
    imageUrl: kahkEidBoxImg,
    entityNoteAr: 'تشكيلة سنوية معتمدة للشركات والمصانع بأسعار تعاقدية تنافسية مع مزارع الوطنية.',
  },
  {
    id: 'season_dates_box',
    nameAr: 'تمور المجدول والبرحي والوادي والفرافرة الفاخرة',
    nameEn: 'Royal Medjool & Fresh Barhi Dates Box',
    categoryAr: 'تمور المزارع التعاقدية',
    categoryEn: 'Oasis Farm Dates',
    descAr: 'إنتاج مباشر من مزارعنا في الفرافرة والوادي الجديد وسيوة، تمور المجدول الملكي والبرحي بتعبئة وتغليف تصديري فاخر.',
    descEn: 'Direct farm harvest from our Farafra, New Valley & Siwa farms: Royal Medjool and fresh golden Barhi dates.',
    packageContentsAr: [
      'تمر مجدول ملكي سوبر جامبو فرز أول',
      'تمر برحي ذهبي طازج قطف المزرعة',
      'تمر صعيدي سيوة نصف جاف غني بالطاقة',
      'تعبئة كرتونية فاخرة مقاومة للرطوبة',
      'مغلفة صحياً ومطابقة للمواصفات التصديرية',
    ],
    originalPriceEGP: 350,
    discountedPriceEGP: 315,
    discountPct: 10,
    badgeLabelAr: 'خصم 10% تمور المزارع',
    badgeLabelEn: '10% Oasis Dates Discount',
    imageUrl: datesHarvestImg,
    entityNoteAr: 'إنتاج مزارعنا الوطنية من الغرس حتى الفرز والتعبئة الآلية لضمان الجودة والوفر.',
  },
];

interface SeasonalCharityGoodsProps {
  isRtl?: boolean;
  onAddToCart?: (item: {
    id: string;
    nameAr: string;
    nameEn: string;
    kitchenNameAr: string;
    kitchenNameEn: string;
    approvedPrice: number;
    dishImageUrl?: string;
  }) => void;
  onShowToast?: (msg: string) => void;
}

export const SeasonalCharityGoodsSection: React.FC<SeasonalCharityGoodsProps> = ({
  isRtl = true,
  onAddToCart,
  onShowToast,
}) => {
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCoupon(true);
      if (onShowToast) {
        onShowToast(
          isRtl
            ? `تم نسخ كود الخصم (${code}) بنجاح! الصقه في السلة لتطبيق خصم الـ 10%.`
            : `Coupon code (${code}) copied! Paste it in your cart for 10% off.`
        );
      }
      setTimeout(() => setCopiedCoupon(false), 2400);
    });
  };

  return (
    <section className="space-y-4">
      {/* Section Header & Festive 10% Banner */}
      <div className="rounded-[28px] overflow-hidden p-5 sm:p-7 bg-gradient-to-br from-[#851C2C] via-[#62339A] to-[#36185B] text-white shadow-xl relative border border-[#F6D95B]/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC928] text-[#292333] text-xs font-black shadow-sm">
              <Gift className="w-4 h-4 text-[#851C2C]" />
              <span>{isRtl ? 'المواسم وشنط الخير ومنتجات المزارع التعاقدية' : 'Seasonal Provisions & Farm Harvest'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isRtl
                ? 'خدمة دعم أقوى منتجات مصر من مزارع الوادي والفرافرة ومزارع دينا ومزارع الوطنية'
                : 'Egypt’s Finest Agricultural & Pantry Harvest from National Farms'}
            </h2>
            <p className="text-xs sm:text-sm text-[#F7F5FA]/90 leading-relaxed font-medium">
              {isRtl
                ? 'مخصصة للعاملين في كارفور، الشركات والمصانع المتعاقدة، ومستخدمي تطبيق باسط — تشمل كراتين رمضان، شنط الخير، لحوم الأضاحي، كحك العيد، حلاوة المولد، وتمور المزارع مع كوبون خصم 10% فوري.'
                : 'Dedicated to Carrefour staff, corporate contract partners & BASIT users: Ramadan cartons, charity bags, Eid meats, festive cookies & dates with a 10% exclusive discount.'}
            </p>
          </div>

          {/* Interactive Coupon Box */}
          <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-[#FFC928]/40 flex flex-col items-center gap-2.5 text-center shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#FFC928]">
              <Tag className="w-4 h-4" />
              <span>{isRtl ? 'كود الخصم الحصري للعاملين' : 'Employee Coupon Code'}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#FFC928] text-[#292333] font-mono font-black text-lg tracking-wider border-2 border-dashed border-[#851C2C] flex items-center gap-3 shadow-inner">
              <span>BAST10</span>
              <button
                type="button"
                onClick={() => handleCopyCoupon('BAST10')}
                className="p-1 rounded-lg bg-[#292333] text-white hover:bg-black transition-colors cursor-pointer"
                title={isRtl ? 'نسخ كود الخصم' : 'Copy Code'}
                aria-label="Copy Code"
              >
                {copiedCoupon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-white/80 font-bold">
              {isRtl ? 'خصم 10% ساري على جميع منتجات المواسم' : '10% off all seasonal packages'}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEASONAL_CHARITY_GOODS.map((item) => (
          <div
            key={item.id}
            className="group rounded-[26px] basit-liquid-glass overflow-hidden border border-[#62339A]/20 hover:border-[#62339A] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Product Visual with Festive Ribbon Badge */}
              <div className="relative h-56 bg-[#292333] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={isRtl ? item.nameAr : item.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F172F]/90 via-black/25 to-transparent" />

                {/* Festive Ribbon Badge (Yellow with Red Accent & Bow) */}
                <div className="absolute top-3 start-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFC928] text-[#851C2C] font-black text-xs shadow-lg border border-[#851C2C]/30">
                  <span className="text-sm">🎀</span>
                  <span>{item.badgeLabelAr}</span>
                </div>

                {/* Discount Percentage Pill */}
                <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-xl bg-[#851C2C] text-white text-[11px] font-black flex items-center gap-1 shadow-md">
                  <Percent className="w-3.5 h-3.5 text-[#FFC928]" />
                  <span>{item.discountPct}% {isRtl ? 'وفر' : 'OFF'}</span>
                </div>

                {/* Category kicker */}
                <div className="absolute bottom-3 start-3 text-white">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                    {isRtl ? item.categoryAr : item.categoryEn}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-5 space-y-3">
                <div>
                  <h3 className="text-base font-black text-[#292333] dark:text-white leading-snug">
                    {isRtl ? item.nameAr : item.nameEn}
                  </h3>
                  <p className="text-xs text-[#5E5570] dark:text-[#C4B5FD] mt-1 leading-relaxed">
                    {isRtl ? item.descAr : item.descEn}
                  </p>
                </div>

                {/* Package Highlights */}
                <div className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#271E3B] space-y-1.5 text-xs">
                  <div className="font-extrabold text-[#62339A] dark:text-[#FFC928] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'محتويات الصندوق المعتمدة:' : 'Box Contents:'}</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-[#292333] dark:text-[#E2E8F0] font-medium">
                    {item.packageContentsAr.map((cnt, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{cnt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Entity backing note */}
                <p className="text-[10px] font-bold text-[#62339A] dark:text-[#FFC928] bg-[#62339A]/10 dark:bg-[#FFC928]/10 p-2 rounded-xl">
                  {item.entityNoteAr}
                </p>
              </div>
            </div>

            {/* Price & Action Bar */}
            <div className="p-4 sm:p-5 pt-0 border-t border-[#62339A]/15 mt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#5E5570] dark:text-[#94A3B8] line-through block" dir="ltr">
                    {item.originalPriceEGP} ج.م
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-[#62339A] dark:text-[#FFC928] tabular-nums" dir="ltr">
                      {item.discountedPriceEGP}
                    </span>
                    <span className="text-xs font-black text-[#292333] dark:text-white">
                      {isRtl ? 'ج.م (بعد الخصم)' : 'EGP'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCoupon('BAST10')}
                  className="px-3 py-1.5 rounded-xl border border-[#FFC928] bg-[#FFC928]/15 hover:bg-[#FFC928]/30 text-xs font-black text-[#292333] dark:text-[#FFC928] cursor-pointer flex items-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'كوبون 10%' : '10% Coupon'}</span>
                </button>
              </div>

              {onAddToCart && (
                <button
                  type="button"
                  onClick={() =>
                    onAddToCart({
                      id: item.id,
                      nameAr: item.nameAr,
                      nameEn: item.nameEn,
                      kitchenNameAr: 'الشركة الوطنية اللوجستية — قسم المواسم والمزارع',
                      kitchenNameEn: 'Elwataniya Logistics — Seasonal & Farms',
                      approvedPrice: item.discountedPriceEGP,
                      dishImageUrl: item.imageUrl,
                    })
                  }
                  className="w-full min-h-[44px] py-2 px-4 rounded-full basit-glass-btn-yellow font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShoppingCart className="w-4 h-4 text-[#292333]" />
                  <span>{isRtl ? 'إضافة إلى سلة الطلبات' : 'Add to Order Cart'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
