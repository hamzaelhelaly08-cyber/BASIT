import React from 'react';
import { Globe2, Check, Clock } from 'lucide-react';
import { OfficialCountryFlag } from './OfficialCountryFlags';
import { CountryCode } from '../data/phase1Data';

export interface CountryBranchInfo {
  code: CountryCode;
  nameAr: string;
  nameEn: string;
  hubLabelAr: string;
  hubLabelEn: string;
  statusAr: string;
  statusEn: string;
  isActive: boolean;
  coverageTextAr: string;
  coverageTextEn: string;
  currency: string;
}

export const COUNTRY_BRANCHES: CountryBranchInfo[] = [
  {
    code: 'EG',
    nameAr: 'جمهورية مصر العربية',
    nameEn: 'Egypt',
    hubLabelAr: 'القاهرة الكبرى · مدينة نصر · مدينة بدر',
    hubLabelEn: 'Greater Cairo · Nasr City · Badr City',
    statusAr: 'نشط — المركز التشغيلي الرئيسي',
    statusEn: 'Active — Primary Operational Hub',
    isActive: true,
    coverageTextAr: 'الإعاشة والتغذية للمصانع والشركات · المزايا والترفيه · اعمل الخير · كفارات اليمين',
    coverageTextEn: 'Factory & Corporate Catering · Entertainment Benefits · Charity · Kaffarah',
    currency: 'EGP',
  },
  {
    code: 'QA',
    nameAr: 'دولة قطر',
    nameEn: 'Qatar',
    hubLabelAr: 'الدوحة · في انتظار الافتتاح',
    hubLabelEn: 'Doha · Awaiting Opening',
    statusAr: 'في انتظار الافتتاح',
    statusEn: 'Awaiting Opening',
    isActive: false,
    coverageTextAr: 'نطاق قطر في انتظار الافتتاح الرسمي واعتماد الإدارة.',
    coverageTextEn: 'Awaiting official opening & local launch activation.',
    currency: 'QAR',
  },
  {
    code: 'OM',
    nameAr: 'سلطنة عُمان',
    nameEn: 'Oman',
    hubLabelAr: 'مسقط · في انتظار الافتتاح',
    hubLabelEn: 'Muscat · Awaiting Opening',
    statusAr: 'في انتظار الافتتاح',
    statusEn: 'Awaiting Opening',
    isActive: false,
    coverageTextAr: 'نطاق سلطنة عُمان في انتظار الافتتاح الرسمي واعتماد الإدارة.',
    coverageTextEn: 'Awaiting official opening & local launch activation.',
    currency: 'OMR',
  },
  {
    code: 'GB',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    hubLabelAr: 'لندن · في انتظار الافتتاح',
    hubLabelEn: 'London · Awaiting Opening',
    statusAr: 'في انتظار الافتتاح',
    statusEn: 'Awaiting Opening',
    isActive: false,
    coverageTextAr: 'نطاق المملكة المتحدة في انتظار الافتتاح الرسمي واعتماد الإدارة.',
    coverageTextEn: 'Awaiting official opening & local launch activation.',
    currency: 'GBP',
  },
];

interface ThreeDCountryFlagsProps {
  selectedCountry: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  isRtl?: boolean;
  className?: string;
}

export const ThreeDCountryFlags: React.FC<ThreeDCountryFlagsProps> = ({
  selectedCountry,
  onSelectCountry,
  isRtl = true,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#62339A]/30 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#62339A] flex items-center justify-center text-white shadow-sm shadow-[#62339A]/30">
            <Globe2 className="w-4 h-4 text-[#BAE6FD]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#292333] dark:text-white flex items-center gap-2">
              <span>{isRtl ? 'النطاق الجغرافي المعتمد — BASIT | باسط' : 'Approved Geographic Scope — BASIT'}</span>
            </h4>
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              {isRtl
                ? 'مصر (السوق التشغيلي النشط) · قطر وسلطنة عُمان والمملكة المتحدة (في انتظار الافتتاح)'
                : 'Egypt (Active Market) · Qatar, Oman & UK (Awaiting Opening)'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0EA5E9] text-white text-[11px] font-black shadow-xs">
          <span>{isRtl ? 'مصر نشطة · QA / OM / GB في انتظار الافتتاح' : 'EG Active · QA / OM / GB Awaiting'}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {COUNTRY_BRANCHES.map((country) => {
          const isSelected = selectedCountry === country.code;

          return (
            <button
              key={country.code}
              type="button"
              onClick={() => onSelectCountry(country.code)}
              className={`group text-start p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0F9FF] dark:from-[#1E293B] dark:to-[#292333] border-[#62339A] shadow-lg shadow-[#62339A]/15 ring-1 ring-[#62339A]/40'
                  : 'bg-white dark:bg-[#292333] border-[#E2E8F0] dark:border-[#62339A]/25 hover:border-[#62339A]/70 hover:shadow-md'
              }`}
            >
              <div className="shrink-0">
                <OfficialCountryFlag country={country.code} className="w-12 h-8" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <h5 className="text-xs sm:text-sm font-black text-[#292333] dark:text-white truncate">
                    {isRtl ? country.nameAr : country.nameEn}
                  </h5>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-[#62339A] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : !country.isActive ? (
                    <Clock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0" />
                  ) : null}
                </div>

                <p className="text-[11px] font-bold text-[#62339A] dark:text-[#A34FE8] truncate">
                  {isRtl ? country.statusAr : country.statusEn}
                </p>

                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {isRtl ? country.coverageTextAr : country.coverageTextEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
