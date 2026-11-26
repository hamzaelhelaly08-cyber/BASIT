import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageCode, CentralKitchenId } from '../data/phase1Data';

export interface PurePhotoSlide {
  id: string;
  imageUrl: string;
  altAr: string;
  altEn: string;
  targetSection: string;
  kitchenId?: CentralKitchenId;
}

interface ContinuousPhotoStripProps {
  lang: LanguageCode;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  slides: PurePhotoSlide[];
  onNavigateSlide: (
    section: string,
    kitchenId?: CentralKitchenId
  ) => void;
  reverseDirection?: boolean;
}

export const ContinuousPhotoStrip: React.FC<ContinuousPhotoStripProps> = ({
  lang,
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  slides,
  onNavigateSlide,
  reverseDirection = false,
}) => {
  const isRtl = lang === 'ar';
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [didMove, setDidMove] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  // Duplicate slides so CSS infinite marquee loops seamlessly without visible jump
  const loopedSlides = [...slides, ...slides];

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollerRef.current) return;
    setIsDragging(true);
    setDidMove(false);
    setStartX(e.pageX - scrollerRef.current.offsetLeft);
    setScrollStart(scrollerRef.current.scrollLeft);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollerRef.current) return;
    const x = e.pageX - scrollerRef.current.offsetLeft;
    const delta = x - startX;
    if (Math.abs(delta) > 6) setDidMove(true);
    scrollerRef.current.scrollLeft = scrollStart - delta * 1.4;
  };

  const onPointerUpOrLeave = () => {
    setIsDragging(false);
    setTimeout(() => setDidMove(false), 50);
  };

  const scrollByStep = (dir: 'prev' | 'next') => {
    if (!scrollerRef.current) return;
    const px = dir === 'next' ? (isRtl ? -280 : 280) : isRtl ? 280 : -280;
    scrollerRef.current.scrollBy({ left: px, behavior: 'smooth' });
  };

  return (
    <section className="space-y-3">
      {/* Clean Standalone Section Title + 1-line Subtitle OUTSIDE photo frames */}
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {isRtl ? titleAr : titleEn}
          </h2>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {isRtl ? subtitleAr : subtitleEn}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scrollByStep('prev')}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 hover:border-[#62339A] text-[#292333] dark:text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
            aria-label="Scroll Previous"
          >
            {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => scrollByStep('next')}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#62339A]/30 hover:border-[#62339A] text-[#292333] dark:text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
            aria-label="Scroll Next"
          >
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pure Independent Auto-Scrolling & Drag-Swipeable Photo Strip */}
      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrLeave}
        onPointerCancel={onPointerUpOrLeave}
        onPointerLeave={onPointerUpOrLeave}
        className={`ce-marquee-container relative overflow-x-auto rounded-2xl select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          className="ce-marquee-track gap-3.5 py-1"
          style={{
            animationDirection: reverseDirection ? 'reverse' : 'normal',
            animationDuration: `${Math.max(24, slides.length * 6)}s`,
          }}
        >
          {loopedSlides.map((slide, idx) => (
            <button
              key={`${slide.id}_${idx}`}
              type="button"
              onClick={() => {
                if (!didMove) {
                  onNavigateSlide(slide.targetSection, slide.kitchenId);
                }
              }}
              title={isRtl ? slide.altAr : slide.altEn}
              aria-label={isRtl ? slide.altAr : slide.altEn}
              className="group relative shrink-0 w-64 sm:w-72 h-36 sm:h-40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-[#62339A]/20 focus:outline-none focus:ring-2 focus:ring-[#62339A] cursor-pointer transition-transform duration-200 hover:scale-[1.02] bg-[#F8FAFC] dark:bg-[#1E293B]"
            >
              <img
                src={slide.imageUrl}
                alt={isRtl ? slide.altAr : slide.altEn}
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-full h-full object-cover brightness-105 contrast-105 saturate-110 transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
