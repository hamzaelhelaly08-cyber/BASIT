import React, { useState } from 'react';
import {
  CheckCircle2,
  Send,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { LanguageCode } from '../data/phase1Data';
import type {
  LogisticsServiceInquiryDoc,
  LogisticsServiceKey,
} from '../types/faydEcosystem';
import { submitLogisticsServiceInquiry } from '../services/faydFirestoreService';
import { Service3DIcon } from './Service3DIcon';
import {
  CORPORATE_PORTFOLIO_SECTORS,
  LUXURY_OPEN_BUFFET_IMG,
  PARTNERS_PORTFOLIO_BOARD_IMG,
} from '../data/visitorWorldData';

interface LogisticsComplementaryServicesViewProps {
  lang: LanguageCode;
  user: User | null;
  myInquiries: LogisticsServiceInquiryDoc[];
  onRequireSignIn: () => void;
  onBackHome: () => void;
  onToast: (msg: string) => void;
}

const LOGISTICS_SERVICES: {
  key: LogisticsServiceKey;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  iconKey: string;
}[] = [
  {
    key: 'weddings_occasions',
    titleAr: 'خدمات الأفراح والمناسبات',
    titleEn: 'Weddings & Major Occasions',
    descAr: 'تجهيز وإدارة ولائم ومآدب الأفراح والمناسبات الكبرى وفق معايير الجودة والضيافة المتكاملة.',
    descEn: 'Turnkey banquet & catering management for weddings and grand celebrations.',
    iconKey: 'party',
  },
  {
    key: 'conferences_events',
    titleAr: 'المؤتمرات والفعاليات الرسمية',
    titleEn: 'Conferences & Corporate Events',
    descAr: 'تغطية ضيافة ووجبات المؤتمرات والمعارض والقمم والفعاليات المؤسسية بأعداد كبيرة.',
    descEn: 'Executive hospitality, coffee breaks & banquet logistics for summits and expos.',
    iconKey: 'business',
  },
  {
    key: 'open_buffets',
    titleAr: 'البوفيهات المفتوحة والمآدب',
    titleEn: 'Open Buffets & Executive Dining',
    descAr: 'تصميم وتنفيذ خطوط البوفيه المفتوح المتنوعة مع طاقم إشراف وتشغيل محترف.',
    descEn: 'Custom hot & cold open buffet service with trained hospitality supervision.',
    iconKey: 'utensils',
  },
  {
    key: 'hospitality',
    titleAr: 'الضيافة المتكاملة والـ VIP',
    titleEn: 'Full Hospitality & VIP Service',
    descAr: 'فرق ضيافة مدربة لاستقبال الوفود وكبار الشخصيات والفعاليات الخاصة والمؤسسية.',
    descEn: 'Trained hospitality brigades for VIP delegations and corporate receptions.',
    iconKey: 'sparkles',
  },
  {
    key: 'central_kitchens_setup',
    titleAr: 'تجهيز وإدارة المطابخ المركزية',
    titleEn: 'Central Kitchens Setup & Operations',
    descAr: 'توريد وتصميم وتجهيز وتشغيل المطابخ المركزية للمصانع والمؤسسات وفق أنظمة HACCP.',
    descEn: 'End-to-end engineering, equipment setup & HACCP-certified kitchen management.',
    iconKey: 'chef',
  },
  {
    key: 'institutional_events_catering',
    titleAr: 'تنظيم وإمداد الفعاليات المؤسسية',
    titleEn: 'Institutional & Industrial Events Catering',
    descAr: 'إمداد الوجبات الدورية والموسمية للافتتاحات والمصانع والمنشآت الصحية والتعليمية.',
    descEn: 'Scheduled meal provisioning for factory inaugurations, hospitals & campuses.',
    iconKey: 'layers',
  },
  {
    key: 'supply_distribution_logistics',
    titleAr: 'لوجستيات التوريد والتوزيع والأسطول المبرد',
    titleEn: 'Supply & Distribution Logistics',
    descAr: 'توزيع الوجبات والإمدادات الغذائية عبر شبكة الوطنية اللوجستية والأسطول المبرد.',
    descEn: 'Chilled & dry supply-chain distribution backed by Elwataniya Logistics fleet.',
    iconKey: 'truck',
  },
];

export const LogisticsComplementaryServicesView: React.FC<
  LogisticsComplementaryServicesViewProps
> = ({ lang, user, myInquiries, onRequireSignIn, onBackHome, onToast }) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [serviceKey, setServiceKey] = useState<LogisticsServiceKey>('weddings_occasions');
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [guestCount, setGuestCount] = useState('150');
  const [city, setCity] = useState('القاهرة');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireSignIn();
      return;
    }
    if (!organizationName.trim() || !contactName.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      const id = await submitLogisticsServiceInquiry(user, {
        serviceKey,
        organizationName,
        contactName,
        phone,
        eventDate,
        guestCount: Math.max(1, Number(guestCount) || 50),
        city,
        notes,
      });
      setOrganizationName('');
      setNotes('');
      onToast(
        isRtl
          ? `تم تسجيل طلب الخدمة اللوجستية رقم ${id} بنجاح وإحالته لفريق الشركة الوطنية اللوجستية.`
          : `Logistics inquiry ${id} submitted successfully.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full basit-glass-pill text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
          <span>{isRtl ? 'العودة للرئيسية' : 'Back Home'}</span>
        </button>
        <span className="px-4 py-2 rounded-full basit-glass-pill text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
          {isRtl ? 'الشركة الوطنية اللوجستية — 7 خدمات متكاملة' : 'Elwataniya Logistics — 7 Services'}
        </span>
      </div>

      {/* Hero Section */}
      <section className="rounded-[28px] overflow-hidden bg-gradient-to-br from-[#292333]/95 via-[#1E293B]/95 to-[#62339A]/95 backdrop-blur-xl text-white border border-white/25 shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <div className="text-xs font-black text-[#A34FE8]">
            {isRtl
              ? 'الخدمات المكملة — الشركة الوطنية اللوجستية & BASIT'
              : 'Complementary Operational Services — Elwataniya Logistics'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            {isRtl
              ? 'الأفراح، المؤتمرات، البوفيهات، الضيافة، وتجهيز المطابخ المركزية'
              : 'Events, Conferences, Open Buffets, Hospitality & Central Kitchen Setup'}
          </h1>
          <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed max-w-2xl">
            {isRtl
              ? 'تقدم المنظومة السبع خدمات التشغيلية واللوجستية الكبرى بطلبات عروض أسعار حقيقية (RFQ) مرتبطة مباشرة بالإدارة المركزية دون أسعار جزافية مسبقة.'
              : 'Request custom commercial proposals (RFQ) across our 7 core hospitality and logistics pillars directly managed through BASIT Central Operations.'}
          </p>
        </div>
        <div className="lg:col-span-5 relative min-h-[220px]">
          <img
            src={LUXURY_OPEN_BUFFET_IMG}
            alt={isRtl ? 'خدمات الضيافة والبوفيه المفتوح والمؤتمرات والوطنية اللوجستية' : 'Luxury Open Buffet, Hospitality and Logistics'}
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#292333]/75 via-transparent to-transparent" />
        </div>
      </section>

      {/* 7 Complementary Services Cards with Enlarged Glass Medallions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LOGISTICS_SERVICES.map((srv) => {
          const selected = serviceKey === srv.key;
          return (
            <button
              key={srv.key}
              type="button"
              onClick={() => setServiceKey(srv.key)}
              className={`text-start p-5 rounded-[28px] transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                selected
                  ? 'basit-glass-btn-primary text-white ring-2 ring-[#A34FE8]/80'
                  : 'basit-glass-tile text-[#292333] dark:text-white'
              }`}
            >
              <div className="space-y-3">
                <Service3DIcon iconKey={srv.iconKey} size="md" />
                <h3 className="text-sm font-black leading-snug">
                  {isRtl ? srv.titleAr : srv.titleEn}
                </h3>
                <p className={`text-xs leading-relaxed ${selected ? 'text-[#E2E8F0]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
                  {isRtl ? srv.descAr : srv.descEn}
                </p>
              </div>
              <span className={`text-[11px] font-black flex items-center gap-1 ${selected ? 'text-[#A34FE8]' : 'text-[#62339A] dark:text-[#A34FE8]'}`}>
                {selected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{isRtl ? 'محدد في نموذج الطلب' : 'Selected in Form'}</span>
                  </>
                ) : (
                  <span>{isRtl ? 'اختر لطلب عرض سعر' : 'Select for RFQ'}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Firestore RFQ Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-[28px] basit-liquid-glass space-y-4 text-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-[#292333] dark:text-white">
              {isRtl ? 'نموذج طلب تسعير وتعاقد خدمة مكملة (RFQ)' : 'Request Complementary Service Proposal'}
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {isRtl
                ? 'يُحفظ الطلب في Firestore وتراجعه الإدارة المركزية لتقديم عرض السعر المعتمد.'
                : 'Stored directly in Firestore for Central Admin review and official quotation.'}
            </p>
          </div>
          {!user && (
            <button
              type="button"
              onClick={onRequireSignIn}
              className="px-4 py-2 rounded-full basit-glass-btn-primary font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#A34FE8]" />
              <span>{isRtl ? 'دخول بحساب Google للإرسال' : 'Sign in to Submit'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold mb-1">{isRtl ? 'الخدمة المطلوبة *' : 'Service *'}</label>
            <select
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value as LogisticsServiceKey)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30 font-bold"
            >
              {LOGISTICS_SERVICES.map((srv) => (
                <option key={srv.key} value={srv.key}>
                  {isRtl ? srv.titleAr : srv.titleEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">
              {isRtl ? 'اسم الجهة / الشركة / صاحب المناسبة *' : 'Organization / Client *'}
            </label>
            <input
              type="text"
              required
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder={isRtl ? 'مثال: مصنع أو شركة أو عائلة...' : 'Entity or client name'}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">{isRtl ? 'اسم المسؤول *' : 'Contact Name *'}</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">{isRtl ? 'رقم الهاتف *' : 'Phone *'}</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">{isRtl ? 'التاريخ المستهدف *' : 'Event Date *'}</label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">{isRtl ? 'العدد التقريبي *' : 'Guests *'}</label>
              <input
                type="number"
                min={1}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">{isRtl ? 'المدينة *' : 'City *'}</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">{isRtl ? 'المواصفات والمتطلبات التفصيلية' : 'Detailed Requirements'}</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRtl ? 'أوضح تفاصيل الوجبات، التجهيزات، الموقع، أو نظام التشغيل المطلوب...' : 'Specify menus, kitchen specs, location, or schedule...'}
            className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-full basit-glass-btn-primary font-black flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Send className="w-4 h-4 text-[#A34FE8]" />
          <span>
            {submitting
              ? isRtl ? 'جاري تسجيل الطلب...' : 'Submitting...'
              : isRtl ? 'إرسال طلب الخدمة للشركة الوطنية اللوجستية' : 'Submit Service Inquiry'}
          </span>
        </button>
      </form>

      {/* Inquiry Tracking */}
      {user && myInquiries.length > 0 && (
        <section className="p-5 rounded-[28px] basit-liquid-glass space-y-3 text-xs">
          <h3 className="text-sm font-black text-[#292333] dark:text-white">
            {isRtl ? `طلباتي للخدمات المكملة (${myInquiries.length})` : `My Service Inquiries (${myInquiries.length})`}
          </h3>
          <div className="space-y-2">
            {myInquiries.map((inq) => (
              <div
                key={inq.inquiryId}
                className="p-3.5 rounded-2xl basit-glass-tile flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="font-black text-[#292333] dark:text-white">
                    {inq.organizationName} ({inq.city}) — {inq.guestCount} {isRtl ? 'فرد' : 'guests'}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {inq.inquiryId} · {inq.serviceKey} · {inq.eventDate}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full basit-glass-pill text-[#62339A] dark:text-[#A34FE8] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{inq.status}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Proven Corporate Track Record & Long-Standing Partners */}
      <section className="rounded-[28px] basit-liquid-glass overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-l from-[#292333]/95 via-[#1E293B]/95 to-[#62339A]/95 text-white flex items-center gap-4">
          <Service3DIcon iconKey="portfolio" size="md" />
          <div>
            <span className="inline-block px-3 py-0.5 rounded-full basit-glass-btn-yellow text-[10px] font-black mb-1">
              {isRtl ? 'على مدار سنوات عديدة ومكملين' : 'Multi-Year Continuous Partnerships'}
            </span>
            <h3 className="text-lg font-black text-white">
              {isRtl ? 'سابقة الأعمال وشعارات الشركاء والمؤسسات' : 'Proven Corporate & Institutional Portfolio'}
            </h3>
          </div>
        </div>
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-white/40 dark:border-[#62339A]/35 bg-[#292333]">
            <img
              src={PARTNERS_PORTFOLIO_BOARD_IMG}
              alt={isRtl ? 'شعارات الشركات والمؤسسات الشريكة — سابقة الأعمال' : 'Partner Corporate Logos Board'}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CORPORATE_PORTFOLIO_SECTORS.map((sec) => (
              <div
                key={sec.id}
                className="p-4 rounded-2xl basit-glass-tile space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <Service3DIcon iconKey={sec.iconKey} size="md" />
                  <h4 className="text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
                    {isRtl ? sec.sectorTitleAr : sec.sectorTitleEn}
                  </h4>
                </div>
                <ul className="space-y-1">
                  {sec.partners.map((p) => (
                    <li key={p.nameEn} className="text-[11px] font-bold text-[#292333] dark:text-white">
                      • {isRtl ? p.nameAr : p.nameEn}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
