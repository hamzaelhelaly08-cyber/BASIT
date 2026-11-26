import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Printer,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { downloadHabeBrandedQrCard, RealQrCode } from './RealQrCode';
import { triggerCleanA4Print } from '../lib/pdfExport';

interface HabeDirectInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
  onOpenHabePortal?: () => void;
}

export const HabeDirectInstallModal: React.FC<HabeDirectInstallModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onOpenHabePortal,
}) => {
  const pwa = usePWAInstall();
  const [downloadingCard, setDownloadingCard] = useState(false);
  const printRef = React.useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const originUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://basit.app';
  const installAppUrl = `${originUrl}/habe?install=1`;
  const directOpenUrl = `${originUrl}/habe`;

  const canNativeInstallHabeRightNow =
    pwa.isInstallable && pwa.isPromptForHabeManifest;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installAppUrl);
      onShowToast?.('تم نسخ رابط تثبيت تطبيق Ha-Be المباشر');
    } catch {
      onShowToast?.('تعذر النسخ التلقائي');
    }
  };

  const handleDownloadCard = async () => {
    setDownloadingCard(true);
    try {
      await downloadHabeBrandedQrCard(installAppUrl);
      onShowToast?.('تم تحميل بطاقة كود QR لتطبيق Ha-Be بصيغة PNG');
    } finally {
      setDownloadingCard(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white text-slate-950 rounded-3xl border-2 border-red-600 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-red-600 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/habe-icon-192.png"
              alt="Ha-Be App Icon"
              className="w-11 h-11 rounded-2xl border-2 border-white bg-white shadow-sm shrink-0"
            />
            <div>
              <h3 className="text-sm sm:text-base font-black leading-tight">
                تثبيت تطبيق Ha-Be المستقل (من داخل باسط)
              </h3>
              <p className="text-[11px] text-white/90 font-bold">
                ينزل على الموبايل بأيقونة Ha-Be الحمراء المستقلة + تحميل كود QR مباشرة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-black/30 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          ref={printRef}
          className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-white text-slate-950"
        >
          {/* Direct App Action Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-red-700">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>التثبيت المباشر على أندرويد وآيفون بأيقونة Ha-Be فقط</span>
                </div>

                {pwa.isInstalled && pwa.isPromptForHabeManifest ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تطبيق Ha-Be مثبت بالفعل على هذا الهاتف</span>
                  </div>
                ) : canNativeInstallHabeRightNow ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const accepted = await pwa.install();
                      if (accepted) {
                        onShowToast?.('تم تثبيت تطبيق Ha-Be بأيقونته المستقلة بنجاح');
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت تطبيق Ha-Be الآن على الهاتف</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <a
                      href={installAppUrl}
                      target={pwa.isInIframe ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>
                        {pwa.isInIframe
                          ? 'فتح صفحة التثبيت المستقلة لـ Ha-Be في المتصفح وتثبيته'
                          : 'الانتقال لوضع التثبيت المستقل بأيقونة Ha-Be'}
                      </span>
                    </a>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                      يفتح رابط <strong>Ha-Be</strong> المستقل (Manifest خاص باللون الأحمر وأيقونة Ha-Be) لضمان تنزيل تطبيق المصنع منفصلاً عن تطبيق باسط دون أي تعليق.
                    </p>
                  </div>
                )}
              </div>

              {/* Copy & WhatsApp Share */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-black text-slate-700">
                  الرابط المباشر لتطبيق Ha-Be (أندرويد &amp; آيفون):
                </div>
                <code
                  dir="ltr"
                  className="block w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-900 truncate"
                >
                  {installAppUrl}
                </code>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `تطبيق موظفي Ha-Be المباشر (أندرويد وآيفون):\n${installAppUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>إرسال واتساب</span>
                  </a>
                </div>
              </div>

              {/* iPhone + Android 2-step summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-red-700 block mb-0.5">أندرويد (Chrome):</strong>
                  اضغط زر الفتح أعلاه ← من قائمة (⋮) اختر{' '}
                  <strong>تثبيت التطبيق / Install App</strong>.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-950 block mb-0.5">آيفون (Safari):</strong>
                  افتح الرابط في Safari ← اضغط <strong>مشاركة (⬆️)</strong> ←{' '}
                  <strong>Add to Home Screen</strong>.
                </div>
              </div>
            </div>

            {/* Right Scannable QR + Direct PNG Downloads */}
            <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50 border-2 border-slate-900 flex flex-col items-center text-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10.5px] font-black">
                QR تثبيت تطبيق Ha-Be مباشرة
              </span>

              <RealQrCode
                value={installAppUrl}
                size={165}
                darkColor="#292333"
                lightColor="#ffffff"
                alt="QR Install Ha-Be"
                downloadFilename="Ha-Be-QR-Only.png"
                downloadLabel="تحميل QR فقط (PNG)"
              />

              <button
                type="button"
                disabled={downloadingCard}
                onClick={handleDownloadCard}
                className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-slate-950 disabled:opacity-60 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors print:hidden"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {downloadingCard
                    ? 'جاري تجهيز البطاقة...'
                    : 'تحميل كارت QR بشعار Ha-Be (PNG)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => printRef.current && triggerCleanA4Print([printRef.current])}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-slate-950 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer print:hidden"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة بوستر التثبيت</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <a
              href={directOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-red-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>الرابط المباشر المستقل: /habe</span>
            </a>
            <div className="flex items-center gap-2">
              <a
                href={directOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-slate-950 text-white text-xs font-black flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح تطبيق Ha-Be المستقل</span>
              </a>
              {onOpenHabePortal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHabePortal();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-black cursor-pointer"
                >
                  عرض داخل المنصة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
