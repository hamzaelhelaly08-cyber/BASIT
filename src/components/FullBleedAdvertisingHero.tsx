import React, { useState } from 'react';
import {
  Building2,
  UtensilsCrossed,
  ChefHat,
  Flame,
  FileText,
  Sparkles,
  Award,
  Printer,
  Star,
  ArrowUpRight,
  Headphones,
  HeartHandshake,
  Scale,
  Ticket,
  Search,
} from 'lucide-react';
import { BasitBrandMark } from './BasitBrandMark';
import { OfficialCountryFlag } from './OfficialCountryFlags';
import type { CountryCode } from '../data/phase1Data';
import basitCateringHeroImg from '../assets/images/basit_catering_buffet_1795841338773.jpg';

interface FullBleedAdvertisingHeroProps {
  isRtl: boolean;
  onOpenServiceTab: (sectionId: string) => void;
  onOpenPrintQuotation: (company: string) => void;
  onOpenPrintMenuCatalog?: () => void;
  onShowToast: (msg: string) => void;
}

export const FullBleedAdvertisingHero: React.FC<FullBleedAdvertisingHeroProps> = ({
  isRtl,
  onOpenServiceTab,
  onOpenPrintQuotation,
  onOpenPrintMenuCatalog,
  onShowToast,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<CountryCode>('EG');

  const advertisingServices = [
    { id: 'factory_catering', label: 'إعاشة وتغذية المصانع', tab: 'fayd_merchant_workspace', icon: Flame, badge: 'عقود تشغيل' },
    { id: 'corporate_catering', label: 'إعاشة الشركات والهيئات', tab: 'fayd_onboarding', icon: Building2, badge: 'بوابة جهة' },
    { id: 'subsistence_services', label: 'الإفطار والغداء والعشاء', tab: 'service_meals_offer', icon: UtensilsCrossed, badge: 'ورديات يومية' },
    { id: 'entertainment_benefits', label: 'الترفيه والمزايا للعاملين', tab: 'entertainment_benefits', icon: Ticket, badge: 'شركاء معتمدون' },
    { id: 'kitchens', label: 'المطابخ المركزية وتجهيزها', tab: 'kitchens', icon: ChefHat, badge: 'تجمع·بدر·لاهون' },
    { id: 'logistics_events', label: 'الزفاف والمؤتمرات والبوفيهات', tab: 'logistics_services', icon: Award, badge: 'الوطنية اللوجستية' },
    { id: 'charity_good_deeds', label: 'اعمل الخير (مبادرات مجتمعية)', tab: 'charity_good_deeds', icon: HeartHandshake, badge: 'قسم مستقل' },
    { id: 'kaffarah_section', label: 'كفارات اليمين (توثيق شرعي)', tab: 'kaffarah_yamin', icon: Scale, badge: 'إثبات تنفيذ' },
    { id: 'request_quote', label: 'طلب عرض سعر رسمي PDF', tab: 'quotation', icon: FileText, badge: 'توريد B2B' },
    { id: 'test_sample', label: 'طلب عينة تذوق TEST', tab: 'test_sample', icon: Star, badge: 'للمصانع والشركات' },
    { id: 'track_orders', label: 'متابعة التوريد والشكاوى', tab: 'track_order', icon: Search, badge: 'رقابة جودة' },
    { id: 'tech_support', label: 'خدمة العملاء والدعم', tab: 'support', icon: Headphones, badge: 'استجابة مباشرة' },
  ];

  const handleBranchClick = (branchCode: CountryCode) => {
    setSelectedBranch(branchCode);
    if (branchCode === 'EG') {
      onShowToast('النطاق النشط حالياً: جمهورية مصر العربية — منظومة BASIT | باسط.');
    } else if (branchCode === 'QA') {
      onShowToast('دولة قطر: في انتظار الافتتاح — غير مفعّل للتشغيل المباشر قبل اعتماد الإدارة.');
    } else if (branchCode === 'OM') {
      onShowToast('سلطنة عُمان: في انتظار الافتتاح — غير مفعّل للتشغيل المباشر قبل اعتماد الإدارة.');
    } else {
      onShowToast('المملكة المتحدة: في انتظار الافتتاح — غير مفعّل للتشغيل المباشر قبل اعتماد الإدارة.');
    }
  };

  return (
    <section className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-[#62339A]/50 bg-[#292333] text-white select-none my-2">
      <div className="absolute inset-0 z-0">
        <img
          src={basitCateringHeroImg}
          alt="BASIT | باسط — الإعاشة والتغذية والمزايا"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#292333] via-[#292333]/75 to-[#292333]/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#292333] via-[#62339A]/45 to-transparent" />
      </div>

      <div className="relative z-10 px-4 sm:px-8 lg:px-10 py-7 sm:py-10 flex flex-col justify-between min-h-[580px]">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <BasitBrandMark size="md" isRtl={isRtl} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-xl sm:text-2xl text-white tracking-tight">
                  BASIT <span className="text-[#A34FE8]">| باسط</span>
                </span>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-[#62339A] text-white border border-white/20">
                  الذراع الرقمي للشركة الوطنية اللوجستية
                </span>
              </div>
              <p className="text-[11px] text-[#E2E8F0] font-medium mt-0.5">
                Elwataniya Logistics Digital Arm — Catering, Corporate Benefits & Hospitality
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#292333]/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#62339A]/50 shadow-xl self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleBranchClick('EG')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedBranch === 'EG'
                  ? 'bg-[#0EA5E9] text-white shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <OfficialCountryFlag country="EG" className="w-5 h-3.5" />
              <span>مصر (نشط)</span>
            </button>

            <button
              type="button"
              onClick={() => handleBranchClick('QA')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBranch === 'QA'
                  ? 'bg-[#62339A] text-white'
                  : 'text-white/75 hover:text-[#A34FE8]'
              }`}
              title="في انتظار الافتتاح"
            >
              <OfficialCountryFlag country="QA" className="w-5 h-3.5" />
              <span className="hidden sm:inline">قطر</span>
            </button>

            <button
              type="button"
              onClick={() => handleBranchClick('OM')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBranch === 'OM'
                  ? 'bg-[#62339A] text-white'
                  : 'text-white/75 hover:text-[#A34FE8]'
              }`}
              title="في انتظار الافتتاح"
            >
              <OfficialCountryFlag country="OM" className="w-5 h-3.5" />
              <span className="hidden sm:inline">عُمان</span>
            </button>

            <button
              type="button"
              onClick={() => handleBranchClick('GB')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBranch === 'GB'
                  ? 'bg-[#62339A] text-white'
                  : 'text-white/75 hover:text-[#A34FE8]'
              }`}
              title="في انتظار الافتتاح"
            >
              <OfficialCountryFlag country="GB" className="w-5 h-3.5" />
              <span className="hidden sm:inline">بريطانيا</span>
            </button>
          </div>
        </div>

        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-[#292333]/90 px-4 py-2 rounded-full border border-[#A34FE8]/60 shadow-lg">
              <OfficialCountryFlag country={selectedBranch} className="w-5 h-3.5" />
              <span className="text-xs font-black text-[#A34FE8] tracking-wide">
                {selectedBranch === 'EG'
                  ? 'النطاق التشغيلي المعتمد: جمهورية مصر العربية'
                  : 'في انتظار الافتتاح الرسمي واعتماد الإدارة'}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-md">
                منظومة الإعاشة والتغذية والمزايا للمصانع والشركات
              </h1>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#BAE6FD]">
                بوابات مستقلة لكل جهة متعاقدة — بإدارة وتشغيل الوطنية اللوجستية
              </h2>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenServiceTab('test_sample')}
                className="px-5 py-3.5 rounded-2xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#62339A]/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-[#BAE6FD]" />
                <span>اطلب عينة تذوق أو عرض تعاقد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenPrintMenuCatalog) {
                    onOpenPrintMenuCatalog();
                  } else {
                    onOpenPrintQuotation('ملف عرض التوريد المعتمد');
                  }
                }}
                className="px-5 py-3.5 rounded-2xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>إصدار عرض سعر PDF</span>
              </button>
            </div>
          </div>

          {/* Service Guide Rail */}
          <div className="lg:col-span-5">
            <div className="bg-[#292333]/90 backdrop-blur-md p-4 rounded-3xl border border-[#62339A]/50 shadow-2xl space-y-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-white/15">
                <span className="text-xs font-black text-[#A34FE8] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مسارات الخدمة والتشغيل في BASIT | باسط</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#A34FE8]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {advertisingServices.map((srv) => {
                  const Icon = srv.icon;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => onOpenServiceTab(srv.tab)}
                      className="group flex items-center gap-3 p-2 rounded-2xl bg-white/5 hover:bg-[#62339A]/35 border border-white/10 hover:border-[#A34FE8]/60 transition-all text-start cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#62339A] flex items-center justify-center text-[#BAE6FD] shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-white truncate">
                          {srv.label}
                        </span>
                        <span className="text-[10px] font-black bg-[#0EA5E9] text-white px-2 py-0.5 rounded-lg shrink-0 hidden sm:inline">
                          {srv.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
