import React, { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { LanguageCode } from '../data/phase1Data';
import { BASET_FAMILY_CARD_ASSET } from '../data/basetBenefitsData';
import {
  MobileCoverWaves,
  BottomRoyalWaveFooter,
} from './MobileCoverFrame';

interface SplashScreenProps {
  lang: LanguageCode;
  customLogoDataUrl?: string | null;
  onEnterPlatform: () => void;
}

/**
 * Exact 5-Second Startup Splash Screen featuring the 3D BASET Family Benefits Card
 * prominently while loading, styled strictly in the BASET Royal Purple, Deep Purple,
 * Metallic Gold & Pure White aesthetic.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  lang,
  onEnterPlatform,
}) => {
  const isRtl = lang === 'ar';
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Exact 5.0-second startup loading window (4700ms exit transition -> 5000ms enter platform)
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, 4700);

    const doneTimer = window.setTimeout(() => {
      onEnterPlatform();
    }, 5000);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onEnterPlatform]);

  const handleSkip = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(onEnterPlatform, 220);
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`fixed inset-0 max-w-[430px] w-full mx-auto z-[100] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#2A1459] via-[#4C1D95] to-[#3B0764] text-white transition-opacity duration-300 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Royal Purple Cover */}
      <div className="relative z-20 bg-gradient-to-b from-[#2A1459] via-[#3B0764] to-[#4C1D95] pt-safe">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-[#FFD54F]/45 text-[10px] font-black text-[#FFD54F]">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isRtl ? 'برنامج مزايا كارت باسط العائلي' : 'BASET Family Benefits'}</span>
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="min-h-[36px] px-4 py-1 rounded-full bg-gradient-to-r from-[#FFD54F] to-[#FACC15] hover:brightness-105 text-[#2A1459] text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            {isRtl ? 'تخطي' : 'Skip'}
          </button>
        </div>
        <MobileCoverWaves />
      </div>

      {/* Centered 3D BASET Family Benefits Card with Metallic Gold Light Sweep */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 text-center ce-splash-fade">
        <div className="relative flex items-center justify-center mb-4 ce-splash-float w-full max-w-[305px]">
          {/* Distant Luminous Golden & Royal Purple Halo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute w-64 h-64 rounded-full bg-[#FFD54F]/35 blur-3xl ce-splash-ring"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute w-52 h-40 rounded-3xl bg-[#C084FC]/30 blur-2xl"
          />

          {/* Frosted Glassmorphism Card Showcase Pedestal */}
          <div className="relative w-full rounded-[28px] p-2.5 bg-[#16082E] border border-[#FFD54F]/60 shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_32px_rgba(255,213,79,0.28)] overflow-hidden">
            <img
              src={BASET_FAMILY_CARD_ASSET}
              alt="كارت باسط الرسمي المعتمد"
              className="relative z-10 w-full h-auto max-h-[210px] object-contain mx-auto rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black text-[#FFD54F]">
            <Sparkles className="w-3 h-3" />
            <span>BASET | باسط</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isRtl ? 'فعّل كارت باسط العائلي' : 'Activate BASET Family Card'}
          </h1>
        </div>

        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-[#EAB308] border border-white/80 shadow-[0_8px_24px_rgba(234,179,8,0.45)]">
            <ShieldCheck className="w-5 h-5 text-[#2A1459]" />
            <span className="text-sm font-black text-[#2A1459]">
              {isRtl ? 'خصومات ومزايا تصل إلى 10%' : 'Up to 10% Family Discounts'}
            </span>
          </div>

          <p className="text-xs font-extrabold text-[#EDE9FE] tracking-wide pt-0.5">
            {isRtl ? 'وجبات باسط · ترفيه العائلة · توفير واستمرارية' : 'Meals · Family Entertainment · Verified Savings'}
          </p>
        </div>
      </div>

      {/* Bottom Royal Purple + Gold Rising Footer with Exact 5s Progress Bar */}
      <BottomRoyalWaveFooter>
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-7 h-7 rounded-full border-[3px] border-[#FFD54F]/30 border-t-[#FFD54F] animate-spin"
            style={{ animationDuration: '1.15s' }}
            aria-hidden="true"
          />
          <span className="text-xs font-extrabold text-[#FFD54F] tracking-wide">
            {isRtl ? 'جاري تجهيز برنامج مزايا كارت باسط...' : 'Preparing BASET Family Benefits...'}
          </span>
          <div className="w-40 h-1.5 rounded-full bg-[#D8B4FE]/25 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FFD54F] via-[#FACC15] to-white ce-splash-5s-bar" />
          </div>
        </div>
      </BottomRoyalWaveFooter>
    </div>
  );
};
