import React from 'react';
import { Briefcase, ShieldCheck, Truck } from 'lucide-react';
import { LanguageCode } from '../data/phase1Data';

interface FleetControlIconsProps {
  lang: LanguageCode;
  onNavigateSection?: (section: string) => void;
}

export const FleetControlIcons: React.FC<FleetControlIconsProps> = ({
  lang,
  onNavigateSection,
}) => {
  const isRtl = lang === 'ar';

  const items = [
    {
      id: 'fleet_dispatch',
      icon: Truck,
      titleAr: 'إدارة الأسطول والتوصيل',
      titleEn: 'Fleet & Dispatch Control',
      descAr: 'تتبع مركبات التوريد وتوزيع الوجبات للمصانع والمواقع.',
      descEn: 'Track delivery vehicles and scheduled route dispatches.',
      actionAr: 'فتح بوابة التوصيل',
      actionEn: 'Open Dispatch',
      targetSection: 'fayd_delivery_partner',
    },
    {
      id: 'fleet_ops',
      icon: Briefcase,
      titleAr: 'العقود وإدارة التشغيل',
      titleEn: 'Operations & B2B Contracts',
      descAr: 'تنظيم عقود الجهات والشركات وجداول الإعاشة اليومية.',
      descEn: 'Manage institutional agreements and daily meal schedules.',
      actionAr: 'فتح مساحة الأعمال',
      actionEn: 'Open Workspace',
      targetSection: 'fayd_merchant_workspace',
    },
    {
      id: 'fleet_compliance',
      icon: ShieldCheck,
      titleAr: 'رقابة الجودة والأمان',
      titleEn: 'Fleet Safety & Compliance',
      descAr: 'اعتماد مسارات النقل وسلامة الغذاء وحوكمة الصلاحيات.',
      descEn: 'Verified transport compliance, HACCP & role governance.',
      actionAr: 'لوحة الاعتماد',
      actionEn: 'Open Governance',
      targetSection: 'fayd_admin_governance',
    },
  ];

  return (
    <section
      aria-label={isRtl ? 'منظومة إدارة الأسطول والتحكم' : 'Fleet Control System'}
      className="space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#292333] dark:text-[#F7F5FA]">
            {isRtl ? 'منظومة إدارة الأسطول والتحكم التشغيلي' : 'Fleet & Operational Control'}
          </h2>
          <p className="text-xs font-medium text-[#5E5570] dark:text-[#C8BBE0]">
            {isRtl
              ? 'إدارة حركة الإمداد، التوصيل اللوجستي، والالتزام بالمعايير المعتمدة'
              : 'Unified dispatch oversight, corporate operations & safety governance'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigateSection?.(item.targetSection)}
              className="group text-start rounded-[22px] bg-white dark:bg-[#1F172F] border border-[#62339A]/15 dark:border-[#A34FE8]/25 p-5 shadow-[0_8px_22px_-14px_rgba(98,51,154,0.18)] hover:border-[#62339A]/45 dark:hover:border-[#FFC928]/60 transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Icon
                  className="w-9 h-9 text-[#62339A] dark:text-[#A34FE8] shrink-0 transition-transform duration-200 group-hover:scale-105"
                  strokeWidth={1.85}
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFC928] shrink-0" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-[#292333] dark:text-[#F7F5FA] group-hover:text-[#62339A] dark:group-hover:text-[#FFC928] transition-colors">
                  {isRtl ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-xs font-medium text-[#5E5570] dark:text-[#C8BBE0] leading-relaxed">
                  {isRtl ? item.descAr : item.descEn}
                </p>
              </div>

              <div className="pt-2 border-t border-[#62339A]/10 dark:border-[#A34FE8]/15 flex items-center justify-between text-xs font-black text-[#62339A] dark:text-[#FFC928]">
                <span>{isRtl ? item.actionAr : item.actionEn}</span>
                <span aria-hidden="true">{isRtl ? '←' : '→'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
