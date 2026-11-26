import React, { useState } from 'react';
import { 
  PartyPopper, 
  UtensilsCrossed, 
  Heart, 
  Users, 
  Calendar, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Tag, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  X
} from 'lucide-react';
import { TWELVE_BUFFET_THEMES, BuffetTheme } from '../data/habeAndBuffetData';

interface EventWeddingBuffetModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
  onShowToast: (msg: string) => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
  onOpenPrintQuotation?: (company: string) => void;
}

export const EventWeddingBuffetModal: React.FC<EventWeddingBuffetModalProps> = ({
  isOpen,
  onClose,
  isRtl = true,
  onShowToast,
  onAddAuditLog,
  onOpenPrintQuotation
}) => {
  const [activeTab, setActiveTab] = useState<'twelve_buffets' | 'custom_wedding' | 'family_invite'>('twelve_buffets');
  const [selectedTheme, setSelectedTheme] = useState<BuffetTheme>(TWELVE_BUFFET_THEMES[0]);

  // "فصّل وجبة فرحك بنفسك" Interactive Builder State
  const [selectedAppetizer, setSelectedAppetizer] = useState<'سمبوسك وكبيبة' | 'كانابيهات وسبرنج رول' | 'ميني فطائر شرقية'>('سمبوسك وكبيبة');
  const [selectedSoup, setSelectedSoup] = useState<'شوربة كريمة فراخ' | 'لسان عصفور بلدي' | 'شوربة سي فود'>('شوربة كريمة فراخ');
  const [selectedProtein, setSelectedProtein] = useState<'نصف دجاجة مشوية + كفتة' | 'فخدة لحم ضأن ورستو' | 'ستيك بتلو + شيش طاووق' | 'دنيس وسالمون بحري'>('نصف دجاجة مشوية + كفتة');
  const [selectedCarb, setSelectedCarb] = useState<'أرز بسمتي بالمكسرات' | 'أرز خلطة مصري بالزبيب' | 'باستا وايت صوص بالمشروم'>('أرز بسمتي بالمكسرات');
  const [selectedSalad, setSelectedSalad] = useState<'سلطة خضراء + طحينة + تبولة' | 'سيزر سلط بالدجاج' | 'مقبلات باردة مشكلة 5 أصناف'>('سلطة خضراء + طحينة + تبولة');
  const [selectedDessert, setSelectedDessert] = useState<'أم علي بالسمن البلدي + كنافة' | 'جاتوه وتورتة سبيشيال' | 'فاكهة الموسم معقمة'>('أم علي بالسمن البلدي + كنافة');
  const [weddingGuestCount, setWeddingGuestCount] = useState<number>(200);
  const [weddingCoupleName, setWeddingCoupleName] = useState('');
  const [weddingPhone, setWeddingPhone] = useState('');
  const [weddingHallName, setWeddingHallName] = useState('');
  const [weddingDate, setWeddingDate] = useState('2026-12-15');

  // "اعزم عائلتك وسيب الباقي علينا" Coupon State
  const [familyCouponApplied, setFamilyCouponApplied] = useState(false);
  const [familyGuestCount, setFamilyGuestCount] = useState<number>(35);
  const [familyContactName, setFamilyContactName] = useState('');
  const [familyContactPhone, setFamilyContactPhone] = useState('');

  if (!isOpen) return null;

  // Calculate Plate Dynamic Cost for Wedding Builder
  const baseProteinPrices: Record<string, number> = {
    'نصف دجاجة مشوية + كفتة': 190,
    'فخدة لحم ضأن ورستو': 285,
    'ستيك بتلو + شيش طاووق': 260,
    'دنيس وسالمون بحري': 340
  };

  const appetizerPrice = selectedAppetizer === 'سمبوسك وكبيبة' ? 35 : 45;
  const soupPrice = selectedSoup === 'شوربة سي فود' ? 65 : 30;
  const carbPrice = selectedCarb === 'أرز بسمتي بالمكسرات' ? 35 : 30;
  const saladPrice = 25;
  const dessertPrice = selectedDessert === 'جاتوه وتورتة سبيشيال' ? 45 : 35;
  const proteinPrice = baseProteinPrices[selectedProtein] || 200;

  // Subtotal per plate
  const rawPlatePrice = appetizerPrice + soupPrice + proteinPrice + carbPrice + saladPrice + dessertPrice;
  // Volume Support Discount: "وهنسند معاك ونديك السعر اللي يناسبك"
  const volumeDiscountPercent = weddingGuestCount >= 500 ? 18 : weddingGuestCount >= 250 ? 12 : weddingGuestCount >= 100 ? 8 : 0;
  const finalPlatePrice = Math.round(rawPlatePrice * (1 - volumeDiscountPercent / 100));
  const totalWeddingCost = finalPlatePrice * weddingGuestCount;

  // Handle Wedding Booking
  const handleConfirmWeddingBuilder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingCoupleName.trim() || !weddingPhone.trim()) {
      onShowToast('يرجى كتابة الاسم ورقم الهاتف لإرسال عرض السعر المعتمد.');
      return;
    }

    const orderRef = `WED-${Math.floor(1000 + Math.random() * 9000)}`;
    onAddAuditLog(
      `طلب بوفيه فرح مخصص [${orderRef}] — ${weddingCoupleName}`,
      `Custom Wedding Buffet Builder Order [${orderRef}]`,
      `العروسين: ${weddingCoupleName} (${weddingPhone}) · القاعة: ${weddingHallName} · المعازيم: ${weddingGuestCount} فرد · سعر الوجبة بعد الدعم: ${finalPlatePrice} ج.م · الإجمالي: ${totalWeddingCost.toLocaleString()} ج.م`
    );
    onShowToast(`ألف مبروك! تم تسجيل تفاصيل وجبة الفرح بكود [${orderRef}]، وجاري إعداد العرض الشامل.`);
  };

  const handleApplyFamilyCoupon = () => {
    setFamilyCouponApplied(true);
    onShowToast('تم تفعيل كوبون الخصم "قوتنا في لمتنا" بنسبة 15% خصم فوري على العزومة العائلية!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header Hero with Live Open Buffet Image */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
          <img
            src="/assets/aistudio/image_4922ff2a.jpg"
            alt="Open Buffet & Luxury Hospitality Catering"
            className="w-full h-full object-cover select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Slogan & Titles */}
          <div className="absolute bottom-4 right-4 z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#62339A] text-white text-[11px] font-black shadow-lg mb-1.5">
              <PartyPopper className="w-3.5 h-3.5" />
              <span>وجبات مناسبتك · بوفيه مفتوح وأفراح ومؤتمرات كبرى</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              12 وجهة بوفيه مفتوح مع إمكانية تفصيل وجبتك بالسعر المناسب
            </h3>
            <p className="text-xs text-[#F6D95B] mt-1">
              تنظيم حفلات · مؤتمرات طبية وصناعية · أعياد ميلاد · عزائم عائلية
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('twelve_buffets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'twelve_buffets'
                ? 'bg-[#62339A] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>12 وجهة بوفيه مفتوح (اختر باقتك)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_wedding')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'custom_wedding'
                ? 'bg-[#62339A] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>فصّل وجبة فرحك بنفسك (وهنسند معاك بالسعر)</span>
          </button>

          <button
            onClick={() => setActiveTab('family_invite')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'family_invite'
                ? 'bg-[#62339A] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>اعزم عائلتك وسيب الباقي علينا (كوبون: قوتنا في لمتنا)</span>
          </button>
        </div>

        {/* Tab 1: 12 Open Buffet Themes */}
        {activeTab === 'twelve_buffets' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left Selector List (12 themes) */}
              <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                  اختر من بين 12 وجهة بوفيه متخصصة:
                </span>

                {TWELVE_BUFFET_THEMES.map((theme) => {
                  const isSelected = theme.id === selectedTheme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#F7F5FA] dark:bg-[#2A2040] border-[#62339A] shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-700 font-black text-xs flex items-center justify-center text-[#62339A]">
                          {theme.number}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{theme.nameAr}</h4>
                          <span className="text-[10px] text-slate-400">{theme.category} · {theme.capacity}</span>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="font-black text-xs text-[#62339A]">{theme.basePricePerPlateEGP} ج.م</span>
                        <span className="text-[9px] text-slate-400 block">/ فرد</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Theme Details Showcase */}
              <div className="md:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] bg-[#F7F5FA] text-[#62339A] font-bold px-2 py-0.5 rounded-full border border-[#62339A]/20">
                      الباقة رقم #{selectedTheme.number} — {selectedTheme.category}
                    </span>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white mt-1">
                      {selectedTheme.nameAr}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedTheme.nameEn}</p>
                  </div>

                  <div className="text-left">
                    <span className="text-2xl font-black text-[#62339A]">{selectedTheme.basePricePerPlateEGP}</span>
                    <span className="text-xs text-slate-400 block">ج.م / للفرد</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#2A2040] border border-[#62339A]/20 dark:border-[#A34FE8]/30">
                  <span className="text-[10px] font-bold text-[#62339A] block mb-0.5">الطبق الرئيسي والنجم:</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{selectedTheme.highlightDish}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedTheme.descriptionAr}
                </p>

                {/* Features Checklist */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    مشتملات الخدمة والتجهيز:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTheme.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      if (onOpenPrintQuotation) onOpenPrintQuotation(selectedTheme.nameAr);
                      onShowToast(`تم تجهيز عرض سعر لباقة: ${selectedTheme.nameAr}`);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black text-xs shadow-md shadow-[#62339A]/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>طلب عرض سعر رسمي للباقة PDF</span>
                  </button>

                  <a
                    href="tel:01010430347"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#62339A]" />
                    <span>حجز مباشر</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Wedding Meal Builder ("فصّل وجبة فرحك بنفسك") */}
        {activeTab === 'custom_wedding' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#62339A] via-[#4A2378] to-[#62339A] text-white shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  مبادرة كاترينج مصر لدعم الشباب والأفراح
                </span>
                <h3 className="font-black text-lg mt-1">فصّل وجبة فرحك بنفسك .. وهنسند معاك ونديك السعر اللي يناسبك!</h3>
                <p className="text-xs text-[#F7F5FA] mt-0.5">
                  اختر أصناف السفرة والمعازيم واحصل على خصم فوري يصل إلى 18% مع جودة 5 نجوم.
                </p>
              </div>

              <div className="text-center bg-white/10 p-3 rounded-2xl backdrop-blur-md shrink-0 hidden sm:block">
                <span className="text-[10px] text-[#F7F5FA] block">سعر الوجبة بعد الدعم</span>
                <span className="text-2xl font-black text-white">{finalPlatePrice}</span>
                <span className="text-xs text-[#F6D95B] block">ج.م / للفرد</span>
              </div>
            </div>

            <form onSubmit={handleConfirmWeddingBuilder} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Selectors (7 cols) */}
              <div className="md:col-span-7 space-y-4 text-xs">
                
                {/* 1. البروتين الرئيسي Main Protein */}
                <div className="space-y-1.5">
                  <label className="font-black text-slate-900 dark:text-white flex items-center justify-between">
                    <span>1. طبق البروتين واللحوم الرئيسي:</span>
                    <span className="text-[#62339A] font-bold">{baseProteinPrices[selectedProtein]} ج.م</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(baseProteinPrices).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setSelectedProtein(p as any)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          selectedProtein === p
                            ? 'bg-[#F7F5FA] dark:bg-[#2A2040] border-[#62339A] font-bold text-[#4A2378] dark:text-[#FFC928]'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. الأرز والمكرونة Carbs */}
                <div className="space-y-1.5">
                  <label className="font-black text-slate-900 dark:text-white">2. صنف النشويات والأرز:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['أرز بسمتي بالمكسرات', 'أرز خلطة مصري بالزبيب', 'باستا وايت صوص بالمشروم'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setSelectedCarb(c as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedCarb === c
                            ? 'bg-[#F7F5FA] dark:bg-[#2A2040] border-[#62339A] font-bold text-[#4A2378] dark:text-[#FFC928]'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. الشوربة والمقبلات */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-black text-slate-900 dark:text-white block mb-1">3. الشوربة الترحيبية:</label>
                    <select
                      value={selectedSoup}
                      onChange={(e) => setSelectedSoup(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                    >
                      <option value="شوربة كريمة فراخ">شوربة كريمة فراخ بالمشروم</option>
                      <option value="لسان عصفور بلدي">شوربة لسان عصفور بلدي</option>
                      <option value="شوربة سي فود">شوربة مأكولات بحرية بالزعفران</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-black text-slate-900 dark:text-white block mb-1">4. المقبلات الساخنة:</label>
                    <select
                      value={selectedAppetizer}
                      onChange={(e) => setSelectedAppetizer(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                    >
                      <option value="سمبوسك وكبيبة">سمبوسك جبن ولحم + كبيبة شامية</option>
                      <option value="كانابيهات وسبرنج رول">سبرنج رول خضار + كانابيهات</option>
                      <option value="ميني فطائر شرقية">ميني فطائر شرقية باللحم</option>
                    </select>
                  </div>
                </div>

                {/* 4. السلطات والحلويات */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-black text-slate-900 dark:text-white block mb-1">5. السلطات والمقبلات الباردة:</label>
                    <select
                      value={selectedSalad}
                      onChange={(e) => setSelectedSalad(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                    >
                      <option value="سلطة خضراء + طحينة + تبولة">سلطة خضراء + طحينة + تبولة</option>
                      <option value="سيزر سلط بالدجاج">سيزر سلاد بارميزان ودجاج</option>
                      <option value="مقبلات باردة مشكلة 5 أصناف">مقبلات مشكلة (حمص، متبل، بابا غنوج)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-black text-slate-900 dark:text-white block mb-1">6. ركن الحلو:</label>
                    <select
                      value={selectedDessert}
                      onChange={(e) => setSelectedDessert(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs"
                    >
                      <option value="أم علي بالسمن البلدي + كنافة">أم علي بالسمن البلدي + كنافة نابلسية</option>
                      <option value="جاتوه وتورتة سبيشيال">قطعة تورتة زفاف ملكية + ميني تارت</option>
                      <option value="فاكهة الموسم معقمة">سلايدز فاكهة الموسم الطازجة</option>
                    </select>
                  </div>
                </div>

                {/* Number of Guests */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">عدد المعازيم والضيوف:</span>
                    <span className="text-[10px] text-slate-400">كلما زاد العدد، زادت نسبة الدعم والخصم المؤسسي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWeddingGuestCount(Math.max(50, weddingGuestCount - 50))}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-black text-base w-12 text-center text-[#62339A]">{weddingGuestCount}</span>
                    <button
                      type="button"
                      onClick={() => setWeddingGuestCount(weddingGuestCount + 50)}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Summary & Submit Form (5 cols) */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                    فاتورة وجبة فرحك المعتمدة:
                  </h4>

                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">السعر الأصلي للوجبة:</span>
                      <span className="line-through text-slate-400">{rawPlatePrice} ج.م</span>
                    </div>

                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>دعم كاترينج مصر ({volumeDiscountPercent}%):</span>
                      <span>- {rawPlatePrice - finalPlatePrice} ج.م / وجبة</span>
                    </div>

                    <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span>سعر الوجبة النهائي للفرد:</span>
                      <span className="text-[#62339A]">{finalPlatePrice} ج.م</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#62339A] text-white text-center font-black mt-3">
                      <span className="text-[10px] text-[#F6D95B] block">إجمالي تكلفة الفرح لـ {weddingGuestCount} فرد:</span>
                      <span className="text-xl">{totalWeddingCost.toLocaleString()} ج.م</span>
                    </div>
                  </div>

                  {/* Contact inputs */}
                  <div className="space-y-2 mt-4 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="اسم العروسين / صاحب الفرح"
                      value={weddingCoupleName}
                      onChange={(e) => setWeddingCoupleName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                    />

                    <input
                      type="tel"
                      required
                      placeholder="رقم الهاتف للتواصل وتثبيت الحجز"
                      value={weddingPhone}
                      onChange={(e) => setWeddingPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                    />

                    <input
                      type="text"
                      placeholder="اسم القاعة أو المكان وموعد الفرح"
                      value={weddingHallName}
                      onChange={(e) => setWeddingHallName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black text-xs shadow-lg shadow-[#62339A]/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تثبيت سعر وجبة الفرح وطلب معاينة وتذوق</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Tab 3: Family Invitation & Gathering Coupon */}
        {activeTab === 'family_invite' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#62339A] to-[#4A2378] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold">
                  عزومات العائلة ولمة الأحباب
                </span>
                <h3 className="font-black text-2xl mt-1">اعزم عائلتك .. وسيب الباقي علينا!</h3>
                <p className="text-xs text-rose-100 mt-1 max-w-lg leading-relaxed">
                  طواجن بلدي، صواني مشويات، ممبار، كفتة، محاشي مشكلة، وحلويات شرقية تصلك ساخنة في صوانيها جاهزة على السفرة بدون أي تعب، مع كوبون خصم عائلي فوري.
                </p>
              </div>

              {/* Serrated Coupon Box */}
              <div className="p-4 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-rose-400 text-center shadow-2xl shrink-0">
                <span className="text-[10px] text-rose-600 font-bold block">كود خصم فوري 15%</span>
                <span className="font-mono font-black text-lg text-slate-900 block my-1">قوتنا في لمتنا</span>
                <button
                  type="button"
                  onClick={handleApplyFamilyCoupon}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    familyCouponApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  {familyCouponApplied ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم التفعيل</span>
                    </span>
                  ) : (
                    'تفعيل الكوبون الآن'
                  )}
                </button>
              </div>
            </div>

            {/* Family Feast Form */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم صاحب العزومة:</label>
                <input
                  type="text"
                  placeholder="الاسم الكريم"
                  value={familyContactName}
                  onChange={(e) => setFamilyContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رقم الهاتف لتأكيد موعد التوصيل:</label>
                <input
                  type="tel"
                  placeholder="010xxxxxxxx"
                  value={familyContactPhone}
                  onChange={(e) => setFamilyContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-600 dark:text-slate-300">
                    توصيل في حافظات حرارية عازلة تحافظ على حرارة الطعام لأكثر من 4 ساعات.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!familyContactName || !familyContactPhone) {
                      onShowToast('يرجى ملء الاسم ورقم الهاتف.');
                      return;
                    }
                    onAddAuditLog(
                      `طلب عزومة عائلية — كود "قوتنا في لمتنا"`,
                      `Family Feast Order with Coupon`,
                      `العميل: ${familyContactName} (${familyContactPhone}) · تم تطبيق الخصم: ${familyCouponApplied ? '15%' : '0%'}`
                    );
                    onShowToast('تم استلام تفاصيل العزومة العائلية، وسيتصل بكم شيف الحفلات للتأكيد!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer shadow-md"
                >
                  تأكيد حجز العزومة
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
