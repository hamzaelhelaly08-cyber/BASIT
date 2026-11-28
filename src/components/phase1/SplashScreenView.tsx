import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { BASIT_OFFICIAL_LOGO_PNG } from '../BasitBrandMark';

export const BASIT_WELCOME_VIDEO_SRC = '/assets/aistudio/__________________7__035816fc.mp4';

interface SplashScreenViewProps {
  onContinue: () => void;
  isReplayMode?: boolean;
}

export const SplashScreenView: React.FC<SplashScreenViewProps> = ({
  onContinue,
  isReplayMode = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(!isReplayMode);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = isMuted;
    const playPromise = vid.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        if (!vid.muted) {
          vid.muted = true;
          setIsMuted(true);
          void vid.play().catch(() => {});
        }
      });
    }
  }, [isReplayMode]);

  const handleToggleSound = () => {
    const vid = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (vid) {
      vid.muted = nextMuted;
      if (vid.paused) {
        void vid.play().catch(() => {});
      }
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration || Number.isNaN(vid.duration)) return;
    const pct = Math.min(100, Math.max(0, (vid.currentTime / vid.duration) * 100));
    setVideoProgress(pct);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex justify-center bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] text-white overflow-y-auto"
    >
      <div className="w-full max-w-[430px] min-h-dvh flex flex-col justify-between px-3.5 py-5 pt-safe pb-safe bg-[linear-gradient(180deg,#240046,#4B148C,#1A052E)] sm:border-x sm:border-[rgba(212,175,55,0.4)] sm:shadow-2xl">
        {/* Top Official Brand Header */}
        <div className="w-full flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-[rgba(212,175,55,0.55)] shadow-md shrink-0 overflow-hidden">
              <img
                src={BASIT_OFFICIAL_LOGO_PNG}
                alt="BASIT | باسط — الشعار الرسمي"
                className="w-full h-full object-contain rounded-xl bg-white"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-white tracking-tight leading-snug">
                BASIT <span className="text-[#FFE875]">|</span> باسط
              </div>
              <div className="text-[11px] font-bold text-[#FFE875] leading-snug">
                الشركة الوطنية اللوجستية
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'تفعيل صوت الفيديو' : 'كتم صوت الفيديو'}
            className="min-h-[44px] min-w-[44px] px-2.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-[rgba(212,175,55,0.4)] text-white text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-[#FFE875] shrink-0" />
                <span className="hidden xs:inline sm:inline">الصوت</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#FFE875] shrink-0" />
                <span className="hidden xs:inline sm:inline">كتم</span>
              </>
            )}
          </button>
        </div>

        {/* Main 16:9 Official Welcome Video Container */}
        <div className="w-full my-auto py-4 flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[rgba(212,175,55,0.5)] shadow-2xl">
            {!videoError ? (
              <video
                ref={videoRef}
                src={BASIT_WELCOME_VIDEO_SRC}
                autoPlay
                muted={isMuted}
                playsInline
                preload="auto"
                poster={BASIT_OFFICIAL_LOGO_PNG}
                onTimeUpdate={handleTimeUpdate}
                onEnded={onContinue}
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#240046] space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg">
                  <img
                    src={BASIT_OFFICIAL_LOGO_PNG}
                    alt="BASIT | باسط"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm font-bold text-[#FFFDF7]">
                  أهلاً بكم في منصة BASIT | باسط — الشركة الوطنية اللوجستية
                </p>
              </div>
            )}
          </div>

          {/* Video Progress Bar */}
          <div className="w-full space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#D4AF37,#FFE875)] transition-all duration-150"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
            <p className="text-center text-xs font-semibold text-[#FFFDF7]/90 leading-relaxed">
              {isReplayMode
                ? 'إعادة تشغيل الفيديو الترحيبي الرسمي لمنصة BASIT | باسط'
                : 'مرحباً بكم في منصة BASIT | باسط — ينتقل التطبيق تلقائياً بعد انتهاء العرض'}
            </p>
          </div>
        </div>

        {/* Bottom Clear Skip / Enter Action */}
        <div className="w-full pb-2">
          <button
            type="button"
            id="basit-splash-skip-btn"
            onClick={onContinue}
            className="w-full min-h-[48px] px-6 py-3 rounded-2xl bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] hover:brightness-105 active:scale-[0.98] text-[#240046] text-sm font-black flex items-center justify-center gap-2 shadow-lg border border-[rgba(212,175,55,0.8)] transition-all cursor-pointer"
          >
            <span>{isReplayMode ? 'العودة إلى التطبيق' : 'تخطي ودخول المنصة'}</span>
            <ArrowLeft className="w-4 h-4 text-[#240046]" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
};
