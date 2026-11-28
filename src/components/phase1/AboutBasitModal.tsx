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
      className="fixed inset-0 z-50 bg-[#1A052E]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[406px] max-h-[90dvh] overflow-y-auto rounded-[28px] bg-[#FFFDF7] dark:bg-[#240046] text-[#240046] dark:text-[#FFFDF7] border border-[rgba(212,175,55,0.45)] shadow-2xl p-5 space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-[rgba(212,175,55,0.4)] shadow-sm shrink-0 overflow-hidden">
              <img
                src={BASIT_OFFICIAL_LOGO_PNG}
                alt="BASIT | باسط — الشعار الرسمي"
                className="w-full h-full object-contain rounded-xl bg-white"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-[#240046] dark:text-[#FFFDF7]">
                عن BASIT | باسط
              </h2>
              <p className="text-xs font-bold text-[#5A189A] dark:text-[#FFE875] leading-snug">
                الشركة الوطنية اللوجستية — المرحلة الأولى
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white dark:bg-[#1A052E] border border-[rgba(212,175,55,0.4)] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 text-[#3B123F] dark:text-[#FFE875]" />
          </button>
        </div>

        <p className="text-xs text-[#3B123F] dark:text-[#FFFDF7]/85 leading-relaxed">
          منصة <span className="font-black text-[#5A189A] dark:text-[#FFE875]">BASIT | باسط</span>{' '}
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
          className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-white text-xs font-black flex items-center justify-center gap-2 border border-[rgba(212,175,55,0.45)] shadow-sm cursor-pointer transition-all hover:brightness-105"
        >
          <PlayCircle className="w-5 h-5 text-[#FFE875]" />
          <span>إعادة مشاهدة الفيديو الترحيبي الرسمي</span>
        </button>

        {/* App Installation Section (PWA + Android Capacitor Readiness) */}
        <div className="rounded-2xl bg-[rgba(255,255,255,0.95)] dark:bg-[#1A052E] border border-[rgba(212,175,55,0.4)] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-[#5A189A] dark:text-[#FFE875]">
            <Smartphone className="w-4 h-4 text-[#D4AF37]" />
            <span>تثبيت تطبيق BASIT على الهاتف</span>
          </div>
          <p className="text-[11px] text-[#3B123F] dark:text-[#FFFDF7]/80 leading-relaxed">
            يمكن تثبيت المنصة كتطبيق ويب تقدمي (PWA) عبر المتصفح على Android وiPhone بالأيقونة
            الرسمية المعتمدة. كما تم تجهيز مشروع Capacitor لنظام Android في مجلد{' '}
            <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[#FFFDF7] dark:bg-[#240046]">
              android/
            </code>{' '}
            لبناء ملف APK في بيئة Android Studio / JDK خارجية.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <PWAInstallButton isRtl className="w-full justify-center min-h-[44px]" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-[#3B123F] dark:text-[#FFFDF7]/75 pt-1">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>الهوية الرسمية والشعار والفيديو وبطاقة باسط معتمدة وفق تعليمات المرحلة الأولى.</span>
        </div>
      </div>
    </div>
  );
};
