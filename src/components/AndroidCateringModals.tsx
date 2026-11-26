import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  FileText,
  ChefHat,
  Truck,
  PartyPopper,
  ClipboardList,
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
  Mail,
  Lock,
} from 'lucide-react';
import {
  CountryCode,
  LanguageCode,
  OrganizedCateringMenu,
  SUPPORTED_COUNTRIES,
  THREE_CENTRAL_KITCHENS,
  EIGHT_CATERING_MENUS,
} from '../data/phase1Data';
import type { Phase1RfqSubmission } from './Phase1ServicesHub';

export type AndroidModalType =
  | 'quote_tasting'
  | 'events_conference_quote'
  | 'client_supply_order'
  | 'courier_apply'
  | 'kitchen_partner_apply'
  | null;

interface AndroidCateringModalsProps {
  lang: LanguageCode;
  country: CountryCode;
  activeModal: AndroidModalType;
  selectedMenu: OrganizedCateringMenu | null;
  preselectedKitchenName?: string;
  isGuestMode: boolean;
  onCloseModal: () => void;
  onCloseMenu: () => void;
  onSubmitRfq: (rfq: Phase1RfqSubmission) => void;
  onOpenAuthGate?: () => void;
  onShowToast?: (msg: string) => void;
}

const COVERAGE_ZONES = [
  'العاصمة الإدارية',
  'مدينة بدر',
  'مصانع مدينة بدر',
  'الشروق',
  'مدينتي',
  'أخرى (داخل مصر)',
];

const EVENT_TYPES_AR = [
  'مؤتمر / منتدى مؤسسي',
  'حفل زفاف / فرح',
  'عيد ميلاد / احتفال عائلي',
  'مناسبة خاصة / عزومة كبرى',
  'افتتاح شركة / خط إنتاج',
];

export const AndroidCateringModals: React.FC<AndroidCateringModalsProps> = ({
  lang,
  country,
  activeModal,
  selectedMenu,
  preselectedKitchenName,
  isGuestMode,
  onCloseModal,
  onCloseMenu,
  onSubmitRfq,
  onOpenAuthGate,
  onShowToast,
}) => {
  const isRtl = lang === 'ar';
  const countryObj = SUPPORTED_COUNTRIES.find((c) => c.code === country) || SUPPORTED_COUNTRIES[0];

  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState(COVERAGE_ZONES[2]);
  const [targetKitchen, setTargetKitchen] = useState(
    preselectedKitchenName || THREE_CENTRAL_KITCHENS[0].nameAr
  );
  const [selectedMenuTitle, setSelectedMenuTitle] = useState(EIGHT_CATERING_MENUS[0].titleAr);
  const [eventType, setEventType] = useState(EVENT_TYPES_AR[0]);
  const [mealsOrGuests, setMealsOrGuests] = useState('100');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [includeTasting, setIncludeTasting] = useState(true);
  const [courierVehicle, setCourierVehicle] = useState('دراجة نارية / سكوتر حراري');
  const [partnerCapacity, setPartnerCapacity] = useState('1,500 - 3,000 وجبة يومياً');
  const [hasHaccpCert, setHasHaccpCert] = useState(true);
  const [notes, setNotes] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedKitchenName) {
      setTargetKitchen(preselectedKitchenName);
    }
    setSubmittedRef(null);
  }, [activeModal, preselectedKitchenName]);

  const modalTitle = (() => {
    if (activeModal === 'quote_tasting') {
      return isRtl ? 'طلب عرض سعر وتست (تذوق)' : 'Request Quote & Tasting';
    }
    if (activeModal === 'events_conference_quote') {
      return isRtl
        ? 'عروض أسعار المؤتمرات والحفلات وأعياد الميلاد والمناسبات والأفراح'
        : 'Conferences, Weddings & Events Quotations';
    }
    if (activeModal === 'client_supply_order') {
      return isRtl ? 'طلبات العملاء والتوريد اليومي' : 'Client Supply Order';
    }
    if (activeModal === 'courier_apply') {
      return isRtl ? 'الانضمام كمندوب توصيل (باسط)' : 'Join as BASIT Courier';
    }
    if (activeModal === 'kitchen_partner_apply') {
      return isRtl
        ? 'الانضمام كمطبخ مركزي / شريك بمطبخ مركزي'
        : 'Join as Central Kitchen / Partner';
    }
    return '';
  })();

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || phone.trim().length < 6) {
      onShowToast?.(
        isRtl
          ? 'يرجى كتابة الاسم ورقم الهاتف الصحيح.'
          : 'Please enter a valid contact name and phone.'
      );
      return;
    }

    const prefix =
      activeModal === 'kitchen_partner_apply'
        ? 'KTP'
        : activeModal === 'courier_apply'
          ? 'DRV'
          : activeModal === 'events_conference_quote'
            ? 'EVT'
            : activeModal === 'client_supply_order'
              ? 'SUP'
              : 'QTE';

    const refId = `${prefix}-${Date.now().toString().slice(-6)}`;

    const extraNotesParts = [
      `${isRtl ? 'النطاق' : 'Zone'}: ${area}`,
      activeModal === 'events_conference_quote'
        ? `${isRtl ? 'المناسبة' : 'Event'}: ${eventType} · ${preferredDate}`
        : `${isRtl ? 'التاريخ' : 'Date'}: ${preferredDate}`,
      activeModal === 'quote_tasting'
        ? `${isRtl ? 'طلب تست' : 'Tasting'}: ${includeTasting ? (isRtl ? 'نعم' : 'Yes') : isRtl ? 'لا' : 'No'}`
        : '',
      activeModal === 'courier_apply' ? `${isRtl ? 'المركبة' : 'Vehicle'}: ${courierVehicle}` : '',
      activeModal === 'kitchen_partner_apply'
        ? `الطاقة: ${partnerCapacity} | HACCP: ${hasHaccpCert ? 'معتمد' : 'قيد الاستخراج'} | توجيه الإدارة: hamzaelhelaly08@gmail.com`
        : '',
      notes.trim(),
    ].filter(Boolean);

    onSubmitRfq({
      id: refId,
      type: activeModal === 'kitchen_partner_apply' ? 'join_kitchen' : 'quotation',
      organizationOrKitchenName:
        orgName.trim() || contactName.trim() || modalTitle,
      contactName: contactName.trim(),
      country,
      dialCode: countryObj.dialCode,
      phone: phone.trim(),
      email:
        activeModal === 'kitchen_partner_apply'
          ? email.trim() || 'hamzaelhelaly08@gmail.com'
          : email.trim(),
      serviceCategory:
        activeModal === 'events_conference_quote'
          ? eventType
          : activeModal === 'courier_apply'
            ? 'مندوب توصيل'
            : activeModal === 'kitchen_partner_apply'
              ? 'شريك مطبخ مركزي'
              : selectedMenuTitle,
      targetKitchen,
      estimatedMealsPerDay: mealsOrGuests || '100',
      notes: extraNotesParts.join(' · '),
      status: 'جديد',
      createdAt: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    });

    setSubmittedRef(refId);
  };

  return (
    <>
      {/* 1) Operational Action Sheet Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white dark:bg-[#160F24] border border-[#62339A]/25 shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 py-3.5 bg-gradient-to-r from-[#2D0E4E] via-[#4A2378] to-[#62339A] text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFC928] text-[#22093A] flex items-center justify-center shrink-0">
                  {activeModal === 'events_conference_quote' ? (
                    <PartyPopper className="w-5 h-5" />
                  ) : activeModal === 'courier_apply' ? (
                    <Truck className="w-5 h-5" />
                  ) : activeModal === 'kitchen_partner_apply' ? (
                    <ChefHat className="w-5 h-5" />
                  ) : activeModal === 'client_supply_order' ? (
                    <ClipboardList className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white leading-snug">
                    {modalTitle}
                  </h3>
                  <p className="text-[10px] font-bold text-[#FFE066]">
                    {activeModal === 'kitchen_partner_apply'
                      ? isRtl
                        ? 'مراجعة واعتماد الإدارة العليا: hamzaelhelaly08@gmail.com'
                        : 'Executive Review: hamzaelhelaly08@gmail.com'
                      : isRtl
                        ? 'استجابة سريعة من تشغيل باسط | BASIT'
                        : 'Fast BASIT Operations Desk'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseModal}
                aria-label={isRtl ? 'إغلاق' : 'Close'}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {submittedRef ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-700/60 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="text-base font-black text-[#292333] dark:text-white">
                    {isRtl ? 'تم تسجيل وإرسال الطلب بنجاح!' : 'Request Submitted Successfully!'}
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {isRtl ? 'الرقم المرجعي للمتابعة:' : 'Tracking Reference:'}{' '}
                    <span dir="ltr" className="font-mono font-black text-[#62339A] dark:text-[#FFC928]">
                      {submittedRef}
                    </span>
                  </p>
                  {activeModal === 'kitchen_partner_apply' && (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1F172F] border border-[#62339A]/20 text-[11px] font-bold text-[#4A2378] dark:text-[#FFC928] flex items-center justify-center gap-1.5">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>
                        {isRtl
                          ? 'موجّه لإدارة الشراكات: hamzaelhelaly08@gmail.com'
                          : 'Routed to Executive Partner Desk: hamzaelhelaly08@gmail.com'}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onCloseModal}
                      className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#FFC928] text-[#22093A] text-xs font-black cursor-pointer"
                    >
                      {isRtl ? 'تم / إغلاق' : 'Done'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitModal} className="space-y-3 text-xs">
                  {activeModal === 'kitchen_partner_apply' && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-[#2D0E4E] to-[#4A2378] text-white flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-black text-[#FFC928] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>{isRtl ? 'قناة اعتماد المطابخ المركزية' : 'Central Kitchen Approval Channel'}</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/90" dir="ltr">
                          hamzaelhelaly08@gmail.com
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                        {activeModal === 'kitchen_partner_apply'
                          ? isRtl
                            ? 'اسم المطبخ المركزي *'
                            : 'Central Kitchen Name *'
                          : activeModal === 'courier_apply'
                            ? isRtl
                              ? 'المدينة / المحافظة *'
                              : 'City / Governorate *'
                            : isRtl
                              ? 'اسم المصنع / الشركة / الجهة *'
                              : 'Organization / Company *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder={
                          activeModal === 'kitchen_partner_apply'
                            ? isRtl
                              ? 'مثال: مطبخ النخبة المركزي'
                              : 'Kitchen brand name'
                            : isRtl
                              ? 'مثال: مصنع النساجون / شركة...'
                              : 'Company / Factory name'
                        }
                        className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                        {isRtl ? 'اسم المسؤول / مقدم الطلب *' : 'Contact Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder={isRtl ? 'الاسم الكامل' : 'Full name'}
                        className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                        {isRtl ? 'رقم الهاتف / الواتساب *' : 'Phone / WhatsApp *'}
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={`${countryObj.dialCode} 10XXXXXXXX`}
                        className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                        {isRtl ? 'منطقة الخدمة / النطاق' : 'Coverage Area'}
                      </label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                      >
                        {COVERAGE_ZONES.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {activeModal === 'events_conference_quote' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                          {isRtl ? 'نوع المناسبة / الحفل' : 'Event Type'}
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white"
                        >
                          {EVENT_TYPES_AR.map((ev) => (
                            <option key={ev} value={ev}>
                              {ev}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                          {isRtl ? 'عدد المدعوين / الوجبات المتوقع' : 'Estimated Guests'}
                        </label>
                        <input
                          type="number"
                          min="10"
                          value={mealsOrGuests}
                          onChange={(e) => setMealsOrGuests(e.target.value)}
                          className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white tabular-nums"
                        />
                      </div>
                    </div>
                  )}

                  {(activeModal === 'quote_tasting' || activeModal === 'client_supply_order') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                          {isRtl ? 'المطبخ المركزي' : 'Central Kitchen'}
                        </label>
                        <select
                          value={targetKitchen}
                          onChange={(e) => setTargetKitchen(e.target.value)}
                          className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white"
                        >
                          {THREE_CENTRAL_KITCHENS.map((k) => (
                            <option key={k.id} value={isRtl ? k.nameAr : k.nameEn}>
                              {isRtl ? k.nameAr : k.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                          {isRtl ? 'المنيو المطلوب (من الـ 8 منيوهات)' : 'Target Menu'}
                        </label>
                        <select
                          value={selectedMenuTitle}
                          onChange={(e) => setSelectedMenuTitle(e.target.value)}
                          className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white"
                        >
                          {EIGHT_CATERING_MENUS.map((m) => (
                            <option key={m.id} value={isRtl ? m.titleAr : m.titleEn}>
                              {isRtl ? m.titleAr : m.titleEn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                          {isRtl ? 'الكمية / عدد الوجبات' : 'Meals Quantity'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={mealsOrGuests}
                          onChange={(e) => setMealsOrGuests(e.target.value)}
                          className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                          {isRtl ? 'التاريخ المفضل للتست / التوريد' : 'Preferred Date'}
                        </label>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {activeModal === 'quote_tasting' && (
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F5F0FF] dark:bg-[#221836] border border-[#62339A]/25 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTasting}
                        onChange={(e) => setIncludeTasting(e.target.checked)}
                        className="w-4 h-4 accent-[#62339A]"
                      />
                      <span className="text-xs font-black text-[#4A2378] dark:text-[#FFC928]">
                        {isRtl
                          ? 'إدراج عينات تذوق (Tasting Box) مجاناً مع عرض السعر المعتمد'
                          : 'Include Free Tasting Box with Quotation'}
                      </span>
                    </label>
                  )}

                  {activeModal === 'courier_apply' && (
                    <div>
                      <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                        {isRtl ? 'وسيلة التوصيل المتاحة' : 'Delivery Vehicle'}
                      </label>
                      <select
                        value={courierVehicle}
                        onChange={(e) => setCourierVehicle(e.target.value)}
                        className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white"
                      >
                        <option value="دراجة نارية / سكوتر حراري">دراجة نارية / سكوتر حراري</option>
                        <option value="سيارة ربع نقل / فان مبرد">سيارة ربع نقل / فان مبرد</option>
                        <option value="سيارة ملاكي لنقل بوكسات الشركات">سيارة ملاكي لنقل بوكسات الشركات</option>
                      </select>
                    </div>
                  )}

                  {activeModal === 'kitchen_partner_apply' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                          {isRtl ? 'الطاقة الإنتاجية اليومية' : 'Daily Capacity'}
                        </label>
                        <select
                          value={partnerCapacity}
                          onChange={(e) => setPartnerCapacity(e.target.value)}
                          className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white"
                        >
                          <option value="500 - 1,500 وجبة يومياً">500 - 1,500 وجبة يومياً</option>
                          <option value="1,500 - 3,000 وجبة يومياً">1,500 - 3,000 وجبة يومياً</option>
                          <option value="أكثر من 5,000 وجبة يومياً">أكثر من 5,000 وجبة يومياً</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5F0FF] dark:bg-[#221836] border border-[#62339A]/25 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasHaccpCert}
                            onChange={(e) => setHasHaccpCert(e.target.checked)}
                            className="w-4 h-4 accent-[#62339A]"
                          />
                          <span className="text-[11px] font-black text-[#4A2378] dark:text-[#FFC928]">
                            {isRtl ? 'مرخص سلامة الغذاء / HACCP' : 'Food Safety / HACCP Certified'}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                      {isRtl ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="min-h-[44px] w-full px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-[#292333] dark:text-[#E2D9F3] mb-1">
                      {isRtl ? 'ملاحظات إضافية' : 'Notes'}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        isRtl ? 'أضف أي تفاصيل عن المنيو أو الورديات أو مواعيد التسليم...' : 'Additional requirements...'
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/40 text-xs font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-[#FFDF66] via-[#FFC928] to-[#D97706] text-[#22093A] text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isRtl ? 'إرسال الطلب الآن' : 'Submit Request'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2) Menu Detail Sheet (Strictly hides meal prices when isGuestMode === true) */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white dark:bg-[#160F24] border border-[#62339A]/25 shadow-2xl">
            <div className="relative h-44 w-full overflow-hidden bg-[#22093A]">
              <img
                src={selectedMenu.imageUrl}
                alt={isRtl ? selectedMenu.titleAr : selectedMenu.titleEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#160F24] via-black/40 to-transparent" />
              <button
                type="button"
                onClick={onCloseMenu}
                aria-label={isRtl ? 'إغلاق المنيو' : 'Close menu'}
                className="absolute top-3 end-3 min-h-[44px] min-w-[44px] rounded-full bg-black/50 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 inset-x-4 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#22093A] text-[10px] font-black mb-1">
                  #{selectedMenu.order} · {isRtl ? selectedMenu.clientTierNoteAr : selectedMenu.clientTierNoteEn}
                </span>
                <h3 className="text-base sm:text-lg font-black">
                  {isRtl ? selectedMenu.titleAr : selectedMenu.titleEn}
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {isGuestMode && (
                <div className="p-3 rounded-2xl bg-[#FFFBEB] dark:bg-[#2A1D3D] border border-[#FFC928]/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#4A2378] dark:text-[#FFC928]">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      {isRtl
                        ? 'الأسعار مخفية للزوار — سجّل أو اطلب عرض سعر مخصص'
                        : 'Prices hidden for visitors — Register or request quote'}
                    </span>
                  </div>
                  {onOpenAuthGate && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu();
                        onOpenAuthGate();
                      }}
                      className="min-h-[36px] px-3 py-1 rounded-xl bg-[#62339A] text-white text-[10px] font-black shrink-0 cursor-pointer"
                    >
                      {isRtl ? 'تسجيل' : 'Register'}
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                  {isRtl ? 'مكونات وبنود المنيو المعتمدة:' : 'Approved Menu Highlights:'}
                </h4>
                {(isRtl ? selectedMenu.sampleDishesAr : selectedMenu.sampleDishesEn).map((dish, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#221836] border border-[#E6E0F5] dark:border-[#62339A]/30 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UtensilsCrossed className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] shrink-0" />
                      <span className="text-xs font-extrabold text-[#292333] dark:text-white leading-snug">
                        {dish}
                      </span>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-[#140D22] text-[10px] font-black text-[#62339A] dark:text-[#FFC928] border border-[#62339A]/20">
                      {isGuestMode
                        ? isRtl
                          ? 'اطلب عرض سعر'
                          : 'Quote Only'
                        : isRtl
                          ? 'تسعير التعاقد'
                          : 'Contract Rate'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMenuTitle(isRtl ? selectedMenu.titleAr : selectedMenu.titleEn);
                    onCloseMenu();
                    onShowToast?.(
                      isRtl
                        ? `تم تحديد "${selectedMenu.titleAr}" لطلب عرض السعر.`
                        : `Selected "${selectedMenu.titleEn}" for quotation.`
                    );
                  }}
                  className="min-h-[46px] px-4 rounded-2xl bg-gradient-to-r from-[#FFDF66] to-[#FFC928] text-[#22093A] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isRtl ? 'اختيار وطلب عرض سعر' : 'Select for Quote'}</span>
                </button>
                <button
                  type="button"
                  onClick={onCloseMenu}
                  className="min-h-[46px] px-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#221836] text-[#292333] dark:text-white border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs font-black cursor-pointer"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
