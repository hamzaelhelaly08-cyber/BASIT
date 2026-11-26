import React, { useState } from 'react';
import { PhoneCall, MapPin, Send, CheckCircle2, LogIn, ChefHat } from 'lucide-react';
import {
  CountryCode,
  LanguageCode,
  SUPPORTED_COUNTRIES,
  THREE_CENTRAL_KITCHENS,
} from '../data/phase1Data';
import type { Phase1RfqSubmission } from './Phase1ServicesHub';

interface VisitorContactViewProps {
  lang: LanguageCode;
  country: CountryCode;
  onSubmitRfq: (rfq: Phase1RfqSubmission) => void;
  onOpenAuthGate: () => void;
}

export const VisitorContactView: React.FC<VisitorContactViewProps> = ({
  lang,
  country,
  onSubmitRfq,
  onOpenAuthGate,
}) => {
  const isRtl = lang === 'ar';
  const countryObj = SUPPORTED_COUNTRIES.find((c) => c.code === country) || SUPPORTED_COUNTRIES[0];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('مصانع مدينة بدر');
  const [details, setDetails] = useState('');
  const [sentId, setSentId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) return;
    const id = `VIS-${Date.now().toString().slice(-5)}`;
    onSubmitRfq({
      id,
      type: 'quotation',
      organizationOrKitchenName: name.trim(),
      contactName: name.trim(),
      country,
      dialCode: countryObj.dialCode,
      phone: phone.trim(),
      email: '',
      serviceCategory: isRtl ? 'تواصل زائر وطلب عرض سعر وتست' : 'Visitor Quote & Tasting Inquiry',
      targetKitchen: THREE_CENTRAL_KITCHENS[0].nameAr,
      estimatedMealsPerDay: 'تواصل مباشر',
      notes: `${zone}${details.trim() ? ` · ${details.trim()}` : ''}`,
      status: 'جديد',
      createdAt: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    });
    setSentId(id);
    setName('');
    setPhone('');
    setDetails('');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-[24px] bg-gradient-to-r from-[#2D0E4E] to-[#62339A] text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFC928] text-[#22093A] flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">
              {isRtl ? 'تواصل مع باسط | طلب عرض سعر وتست' : 'Contact BASIT | Request Quote'}
            </h2>
            <p className="text-[11px] font-bold text-[#FFE066]">
              {isRtl
                ? 'سجّل حسابك لفتح الأسعار والعقود الكاملة أو أرسل استفسارك مباشرة'
                : 'Register to unlock full pricing or send a direct inquiry'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenAuthGate}
          className="min-h-[44px] px-4 rounded-xl bg-[#FFC928] text-[#22093A] text-xs font-black flex items-center gap-1.5 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{isRtl ? 'تسجيل حساب كامل' : 'Sign In / Register'}</span>
        </button>
      </div>

      {sentId ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-700 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <div className="text-sm font-black text-[#292333] dark:text-white">
            {isRtl ? 'تم استلام طلبك بنجاح!' : 'Inquiry Received!'}
          </div>
          <div className="text-xs font-mono font-bold text-[#62339A] dark:text-[#FFC928]">{sentId}</div>
          <button
            type="button"
            onClick={() => setSentId(null)}
            className="min-h-[40px] px-4 rounded-xl bg-[#62339A] text-white text-xs font-black cursor-pointer"
          >
            {isRtl ? 'إرسال استفسار آخر' : 'Send Another'}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-[24px] bg-white dark:bg-[#1E1430] border border-[#E6E0F5] dark:border-[#62339A]/35 space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isRtl ? 'الاسم أو اسم المصنع / الشركة *' : 'Name / Organization *'}
              className="min-h-[44px] px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#140D22] border border-[#E6E0F5] dark:border-[#62339A]/35 font-bold"
            />
            <input
              type="tel"
              required
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={`${countryObj.dialCode} 10XXXXXXXX *`}
              className="min-h-[44px] px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#140D22] border border-[#E6E0F5] dark:border-[#62339A]/35 font-bold"
            />
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl bg-[#F7F5FA] dark:bg-[#140D22] border border-[#E6E0F5] dark:border-[#62339A]/35 font-bold"
            >
              <option value="العاصمة الإدارية">العاصمة الإدارية</option>
              <option value="مدينة بدر">مدينة بدر</option>
              <option value="مصانع مدينة بدر">مصانع مدينة بدر</option>
              <option value="الشروق">الشروق</option>
              <option value="مدينتي">مدينتي</option>
            </select>
          </div>
          <textarea
            rows={2}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={isRtl ? 'اكتب طلب عرض السعر أو موعد التست المطلوب...' : 'Inquiry details...'}
            className="w-full px-3 py-2.5 rounded-xl bg-[#F7F5FA] dark:bg-[#140D22] border border-[#E6E0F5] dark:border-[#62339A]/35 font-bold"
          />
          <button
            type="submit"
            className="min-h-[46px] w-full rounded-2xl bg-gradient-to-r from-[#FFDF66] to-[#FFC928] text-[#22093A] font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isRtl ? 'إرسال طلب التواصل وعرض السعر' : 'Send Quote Request'}</span>
          </button>
        </form>
      )}

      {/* Coverage Directory */}
      <div className="p-4 rounded-[24px] bg-white dark:bg-[#1E1430] border border-[#E6E0F5] dark:border-[#62339A]/35 space-y-2.5">
        <div className="text-xs font-black text-[#62339A] dark:text-[#FFC928] flex items-center gap-1.5">
          <ChefHat className="w-4 h-4" />
          <span>{isRtl ? 'نطاق تغطية المطابخ المركزية:' : 'Central Kitchens Coverage:'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {THREE_CENTRAL_KITCHENS.map((k) => (
            <div
              key={k.id}
              className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#140D22] border border-[#E6E0F5] dark:border-[#62339A]/30 flex items-center gap-2.5"
            >
              <img
                src={k.officialLogoUrl || k.imageUrl}
                alt={isRtl ? k.nameAr : k.nameEn}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-contain bg-white p-1 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-[#292333] dark:text-white truncate">
                  {isRtl ? k.nameAr : k.nameEn}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-300 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#FFC928] shrink-0" />
                  <span className="truncate">{isRtl ? k.coverageAr : k.coverageEn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
