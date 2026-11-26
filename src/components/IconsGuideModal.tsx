import React from 'react';
import {
  Bell,
  Heart,
  Globe2,
  Search,
  ShoppingCart,
  Download,
  Lightbulb,
  X,
  Menu,
} from 'lucide-react';
import { LanguageCode, CountryCode, SUPPORTED_COUNTRIES } from '../data/phase1Data';
import { OfficialCountryFlag } from './OfficialCountryFlags';

interface IconsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  country: CountryCode;
  onOpenFavorites: () => void;
  onOpenCart: () => void;
  onOpenDrawer: () => void;
}

export const IconsGuideModal: React.FC<IconsGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
  country,
  onOpenFavorites,
  onOpenCart,
  onOpenDrawer,
}) => {
  if (!isOpen) return null;
  const isRtl = lang === 'ar';

  const topIcons = [
    {
      id: 'notif',
      icon: Bell,
      titleAr: 'الإشعارات',
      titleEn: 'Notifications',
      descAr: 'يظهر لك التنبيهات والعروض الجديدة',
      descEn: 'Live alerts, RFQs and new offers',
      badge: '1',
    },
    {
      id: 'fav',
      icon: Heart,
      titleAr: 'المفضلة',
      titleEn: 'Favorites',
      descAr: 'لحفظ ما يعجبك من منتجات وخدمات',
      descEn: 'Save favorite restaurants & deals',
    },
    {
      id: 'lang',
      icon: Globe2,
      titleAr: 'تغيير اللغة',
      titleEn: 'Language',
      descAr: 'اختر اللغة المناسبة من الأيقونات',
      descEn: 'Switch Arabic / English instantly',
    },
    {
      id: 'search',
      icon: Search,
      titleAr: 'البحث',
      titleEn: 'Search',
      descAr: 'ابحث عن المطاعم، الخدمات، أو أي شيء آخر',
      descEn: 'Search restaurants, catering & parks',
    },
    {
      id: 'cart',
      icon: ShoppingCart,
      titleAr: 'السلة',
      titleEn: 'Cart',
      descAr: 'لعرض المنتجات المختارة',
      descEn: 'Review items & checkout',
      badge: '2',
    },
    {
      id: 'install',
      icon: Download,
      titleAr: 'تثبيت التطبيق',
      titleEn: 'Install App',
      descAr: 'قم بتثبيت التطبيق على جهازك',
      descEn: 'Add BASIT directly to home screen',
    },
  ];

  const steps = [
    {
      num: '1',
      textAr: 'اضغط على العلم لفتح قائمة الدول.',
      textEn: 'Tap the country flag to open the countries list.',
    },
    {
      num: '2',
      textAr: 'اختر الدولة التي تريدها.',
      textEn: 'Select your country (Egypt, Qatar, Oman, UK).',
    },
    {
      num: '3',
      textAr: 'ستتغير اللغة والمحتوى تلقائياً.',
      textEn: 'Currency, routing & content adapt automatically.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#292333]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#F7F5FA] dark:bg-[#140F1F] border border-[#62339A]/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Poster Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-l from-[#4A2378] via-[#62339A] to-[#5B2BA8] text-white flex items-center justify-between gap-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black mb-1">
              {isRtl ? 'دليل الاستخدام السريع' : 'Quick Walkthrough'}
            </span>
            <h2 className="text-base sm:text-xl font-black">
              {isRtl ? 'استخدام الأيقونات العلوية' : 'Using the Top Navigation Icons'}
            </h2>
            <p className="text-[11px] font-bold text-[#EDE9FE]">
              {isRtl
                ? 'لتتنقل بسهولة بين الإعدادات والخيارات المختلفة'
                : 'Navigate effortlessly between preferences and channels'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer shrink-0"
            aria-label={isRtl ? 'إغلاق الدليل' : 'Close guide'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Top Icons Explainers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topIcons.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#221936] border border-[#62339A]/12 shadow-xs flex flex-col items-center text-center gap-2"
                >
                  <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#62339A] to-[#4A2378] text-white flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-[#FFC928] text-[#292333] text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-black text-[#292333] dark:text-white">
                    {isRtl ? item.titleAr : item.titleEn}
                  </div>
                  <p className="text-[11px] font-medium text-[#64748B] dark:text-[#C4B5FD] leading-snug">
                    {isRtl ? item.descAr : item.descEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Country Flags Row */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#221936] border border-[#62339A]/15 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black text-[#292333] dark:text-white">
                {isRtl ? 'اختيار الدولة المتاحة' : 'Supported Countries'}
              </div>
              <p className="text-[11px] font-medium text-[#64748B] dark:text-[#C4B5FD]">
                {isRtl
                  ? 'اضغط على العلم في الشريط العلوي لعرض الدول المتاحة'
                  : 'Tap the flag in the header bar to pick a region'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {SUPPORTED_COUNTRIES.slice(0, 4).map((c) => (
                <div
                  key={c.code}
                  className={`p-1.5 rounded-full border-2 ${
                    c.code === country
                      ? 'border-[#62339A] bg-[#F5F0FF] dark:bg-[#2D2145]'
                      : 'border-[#E6E0F5] dark:border-[#62339A]/25'
                  }`}
                >
                  <OfficialCountryFlag country={c.code} className="w-7 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* 3-Step Walkthrough matching Poster 2 Bottom */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#221936] border border-[#62339A]/15 space-y-3">
            <h3 className="text-sm font-black text-[#292333] dark:text-white">
              {isRtl ? 'طريقة استخدام الأيقونات' : 'How to Use Icons & Markets'}
            </h3>
            <div className="space-y-2.5">
              {steps.map((s) => (
                <div key={s.num} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#FFC928] text-[#292333] text-xs font-black flex items-center justify-center shrink-0 tabular-nums">
                    {s.num}
                  </span>
                  <span className="text-xs font-bold text-[#292333] dark:text-white">
                    {isRtl ? s.textAr : s.textEn}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#F5F0FF] dark:bg-[#2D2145] border border-[#62339A]/20 flex items-center gap-2 text-xs font-bold text-[#4A2378] dark:text-[#FFC928]">
              <Lightbulb className="w-4 h-4 text-[#FFC928] shrink-0" />
              <span>
                {isRtl
                  ? 'يعمل التطبيق بعدة دول ولغات لراحتك.'
                  : 'BASIT works across multiple countries and languages seamlessly.'}
              </span>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFavorites();
                }}
                className="min-h-[44px] px-4 py-2 rounded-full bg-white dark:bg-[#221936] border border-[#62339A]/20 text-xs font-black text-[#62339A] dark:text-[#FFC928] flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span>{isRtl ? 'فتح المفضلة' : 'Open Favorites'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="min-h-[44px] px-4 py-2 rounded-full bg-white dark:bg-[#221936] border border-[#62339A]/20 text-xs font-black text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-[#62339A]" />
                <span>{isRtl ? 'عرض السلة' : 'View Cart'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDrawer();
              }}
              className="min-h-[44px] px-5 py-2 rounded-full basit-glass-btn-yellow text-xs font-black flex items-center gap-2 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>{isRtl ? 'اضغط على ☰ لفتح القائمة' : 'Open Side Menu ☰'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
