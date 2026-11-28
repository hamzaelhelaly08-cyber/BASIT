import React from 'react';
import { PlayCircle, ShieldCheck, Smartphone, X } from 'lucide-react';
import { BASIT_OFFICIAL_LOGO_PNG } from '../BasitBrandMark';
import { PWAInstallButton } from '../PWAInstallButton';

interface AboutBasitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayWelcomeVideo: () => void;
}

export const AboutBasitModal: React.FC<AboutBasitModalProps> = ({
  isOpen,
  onClose,
  onReplayWelcomeVideo,
}) => {
  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-[#1D0B3B]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-[28px] bg-[#FAF8F5] dark:bg-[#1B132B] text-[#1E1633] dark:text-white border border-[#4C1D95]/20 shadow-2xl p-5 space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-[#4C1D95]/15 shadow-sm shrink-0 overflow-hidden">
              <img
                src={BASIT_OFFICIAL_LOGO_PNG}
                alt="BASIT | باسط — الشعار الرسمي"
                className="w-full h-full object-contain rounded-xl bg-white"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-[#1E1633] dark:text-white">
                عن BASIT | باسط
              </h2>
              <p className="text-xs font-bold text-[#4C1D95] dark:text-[#F5C451] truncate">
                الشركة الوطنية اللوجستية — المرحلة الأولى
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-white dark:bg-[#241B38] border border-[#4C1D95]/15 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#5B5270] dark:text-slate-300 leading-relaxed">
          منصة <span className="font-black text-[#3B0764] dark:text-[#F5C451]">BASIT | باسط</span>{' '}
          هي الذراع الرقمي الموحد للشركة الوطنية اللوجستية في تجربة تطبيق موبايل متكاملة
          تشمل السوق، خدمات الأعمال، بطاقة باسط الرسمية، باسط هيلثي، نظام المصانع، والإدارة
          المالية للمالك.
        </p>

        {/* Replay Official Welcome Video */}
        <button
          type="button"
          id="basit-about-replay-video-btn"
          onClick={() => {
            onClose();
            onReplayWelcomeVideo();
          }}
          className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#3B0764] hover:bg-[#4C1D95] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
        >
          <PlayCircle className="w-5 h-5 text-[#F5C451]" />
          <span>إعادة مشاهدة الفيديو الترحيبي الرسمي</span>
        </button>

        {/* App Installation Section (PWA + Android Capacitor Readiness) */}
        <div className="rounded-2xl bg-white dark:bg-[#241B38] border border-[#4C1D95]/12 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-[#3B0764] dark:text-[#F5C451]">
            <Smartphone className="w-4 h-4" />
            <span>تثبيت تطبيق BASIT على الهاتف</span>
          </div>
          <p className="text-[11px] text-[#5B5270] dark:text-slate-300 leading-relaxed">
            يمكن تثبيت المنصة كتطبيق ويب تقدمي (PWA) عبر المتصفح على Android وiPhone بالأيقونة
            الرسمية المعتمدة. كما تم تجهيز مشروع Capacitor لنظام Android في مجلد{' '}
            <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#120D1D]">
              android/
            </code>{' '}
            لبناء ملف APK في بيئة Android Studio / JDK خارجية.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <PWAInstallButton isRtl className="w-full justify-center min-h-[44px]" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-[#5B5270] dark:text-slate-400 pt-1">
          <ShieldCheck className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" />
          <span>الهوية الرسمية والشعار والفيديو وبطاقة باسط معتمدة وفق تعليمات المرحلة الأولى.</span>
        </div>
      </div>
    </div>
  );
};
