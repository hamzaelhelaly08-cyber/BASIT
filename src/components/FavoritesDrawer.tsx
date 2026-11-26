import React from 'react';
import { Heart, X, ArrowUpRight, Trash2, UtensilsCrossed } from 'lucide-react';
import { LanguageCode } from '../data/phase1Data';

export interface FavoriteEntry {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  imageUrl?: string;
  targetSection: string;
}

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  items: FavoriteEntry[];
  onRemoveFavorite: (id: string) => void;
  onNavigateSection: (section: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  items,
  onRemoveFavorite,
  onNavigateSection,
}) => {
  if (!isOpen) return null;
  const isRtl = lang === 'ar';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#292333]/55 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#140F1F] h-full shadow-2xl border-s border-[#62339A]/15 flex flex-col pt-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#62339A]/15 flex items-center justify-between bg-[#F7F5FA] dark:bg-[#1F172F]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#62339A] to-[#4A2378] text-white flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-[#FFC928] fill-[#FFC928]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#292333] dark:text-white">
                {isRtl ? 'المفضلة' : 'Favorites'}
              </h3>
              <p className="text-xs font-bold text-[#62339A] dark:text-[#FFC928] tabular-nums">
                {items.length} {isRtl ? 'عنصر محفوظ' : 'saved items'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full bg-white dark:bg-[#140F1F] border border-[#62339A]/20 text-[#292333] dark:text-white flex items-center justify-center cursor-pointer"
            aria-label={isRtl ? 'إغلاق المفضلة' : 'Close Favorites'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F5FA] dark:bg-[#110D1B]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-20 h-20 rounded-[22px] basit-glass-icon-halo text-[#62339A] dark:text-[#FFC928] flex items-center justify-center">
                <Heart className="w-9 h-9" />
              </div>
              <p className="text-sm font-black text-[#292333] dark:text-white">
                {isRtl ? 'قائمة المفضلة فارغة حالياً' : 'Your Favorites List is Empty'}
              </p>
              <p className="text-xs font-medium text-[#64748B] dark:text-[#C4B5FD] max-w-xs leading-relaxed">
                {isRtl
                  ? 'اضغط على أيقونة القلب بجانب أي مطعم أو خدمة أو عرض لإضافته هنا للوصول السريع.'
                  : 'Tap the heart icon on any restaurant, service, or offer to save it here.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateSection('al_ain_restaurants');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-full basit-glass-btn-primary text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4 text-[#FFC928]" />
                <span>{isRtl ? 'استعراض مطاعم العين' : 'Browse Restaurants'}</span>
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#211834] border border-[#62339A]/15 shadow-xs flex items-center gap-3"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={isRtl ? item.titleAr : item.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#F7F5FA]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#F3EEFC] dark:bg-[#2D2145] text-[#62339A] dark:text-[#FFC928] flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateSection(item.targetSection);
                  }}
                  className="flex-1 text-start min-w-0 cursor-pointer space-y-0.5"
                >
                  <div className="text-xs sm:text-sm font-black text-[#292333] dark:text-white truncate flex items-center gap-1">
                    <span className="truncate">{isRtl ? item.titleAr : item.titleEn}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#62339A] dark:text-[#FFC928] shrink-0" />
                  </div>
                  <div className="text-[11px] font-medium text-[#64748B] dark:text-[#C4B5FD] line-clamp-1">
                    {isRtl ? item.subtitleAr : item.subtitleEn}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveFavorite(item.id)}
                  className="min-w-[44px] min-h-[44px] rounded-xl text-[#64748B] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer shrink-0"
                  aria-label={isRtl ? 'حذف من المفضلة' : 'Remove favorite'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
