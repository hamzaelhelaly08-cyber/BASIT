import React from 'react';
import {
  MapPin,
  ChefHat,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  FileText,
  ShoppingCart,
  AlertCircle,
  ShieldCheck,
  Info,
  ImageOff,
  Star,
  ClipboardList,
} from 'lucide-react';
import {
  CentralKitchenProfile,
  LanguageCode,
  PHASE1_I18N,
  THREE_CENTRAL_KITCHENS,
  CentralKitchenId,
} from '../data/phase1Data';
import { Phase1CartItem } from './Phase1CartDrawer';
import { BaitAlEilaBrandLogo } from './BaitAlEilaBrandLogo';

interface Phase1KitchensViewProps {
  lang: LanguageCode;
  selectedKitchenId: CentralKitchenId | null;
  onSelectKitchen: (id: CentralKitchenId | null) => void;
  onBackHome: () => void;
  onRequestQuoteForKitchen: (kitchenName: string) => void;
  onAddToCart: (item: Omit<Phase1CartItem, 'quantity'>) => void;
  onOpenOperationalTasksWithDetails?: (title: string, notes: string) => void;
}

export const Phase1KitchensView: React.FC<Phase1KitchensViewProps> = ({
  lang,
  selectedKitchenId,
  onSelectKitchen,
  onBackHome,
  onRequestQuoteForKitchen,
  onAddToCart,
  onOpenOperationalTasksWithDetails,
}) => {
  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const activeKitchen: CentralKitchenProfile | undefined = selectedKitchenId
    ? THREE_CENTRAL_KITCHENS.find((k) => k.id === selectedKitchenId)
    : undefined;

  // Dedicated Independent Kitchen Detail Page
  if (activeKitchen) {
    const hasPricedMenu = activeKitchen.sampleMenuItems.some((i) => i.approvedPrice !== null);

    return (
      <div className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelectKitchen(null)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full basit-glass-pill hover:border-[#62339A] text-xs font-extrabold text-slate-800 dark:text-white transition-colors cursor-pointer"
          >
            <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" strokeWidth={1.85} />
            <span>{t.backToAllKitchens}</span>
          </button>

          {activeKitchen.isHeadquarters && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full basit-glass-btn-primary text-xs font-extrabold">
              <Building2 className="w-4 h-4 text-[#FFC928]" strokeWidth={1.85} />
              <span>{t.hqLabel}</span>
            </span>
          )}
        </div>

        {/* Dedicated Kitchen Hero */}
        <div className="rounded-[24px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1">
            <div className="flex flex-col">
              <div className="relative aspect-[16/9] bg-[#F5F3FF] dark:bg-[#241B38] overflow-hidden">
                <img
                  src={activeKitchen.imageUrl}
                  alt={isRtl ? activeKitchen.nameAr : activeKitchen.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-3.5 py-2 bg-[#FAF8F5] dark:bg-[#120D1D] border-t border-[#4C1D95]/10 dark:border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                <Info className="w-3.5 h-3.5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" strokeWidth={1.85} />
                <span>{t.illustrativePhotoNote}</span>
              </div>
            </div>

            {/* Kitchen Core Details */}
            <div className="p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#4C1D95] dark:text-[#F5C451] font-extrabold">
                      {activeKitchen.codeNameEn}
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-[#1E1633] dark:text-white mt-0.5">
                      {isRtl ? activeKitchen.nameAr : activeKitchen.nameEn}
                    </h1>
                  </div>

                  {/* Official Logo */}
                  {activeKitchen.id === 'bait_al_eila' ? (
                    <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/15 shadow-xs">
                      <BaitAlEilaBrandLogo className="w-11 h-11" />
                      <div className="pe-1">
                        <span className="text-[10px] font-black text-[#1E1633] dark:text-white block">
                          {isRtl ? 'شعار مطبخ بيت العيلة المعتمد' : 'Bait Al-Eila Kitchen Logo'}
                        </span>
                        <span className="text-[9px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                          {isRtl ? 'أشهى المأكولات المنزلية والولائم' : 'Authentic Home-Style Kitchen'}
                        </span>
                      </div>
                    </div>
                  ) : activeKitchen.hasOfficialLogo && activeKitchen.officialLogoUrl ? (
                    <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/15 shadow-xs">
                      <img
                        src={activeKitchen.officialLogoUrl}
                        alt={isRtl ? `شعار ${activeKitchen.nameAr}` : `${activeKitchen.nameEn} Official Logo`}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-contain bg-white"
                      />
                      <span className="text-[10px] font-black text-[#1E1633] dark:text-white pe-1">
                        {isRtl ? 'الشعار الرسمي المعتمد' : 'Verified Logo'}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#241B38] border border-[#4C1D95]/15 text-[11px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                      <ImageOff className="w-4 h-4 shrink-0" strokeWidth={1.85} />
                      <span>
                        {isRtl
                          ? 'لم يُرفع الشعار الرسمي بعد — بانتظار الاعتماد'
                          : 'Official logo awaiting upload'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location & Coverage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl basit-glass-tile space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#62339A] dark:text-[#FFC928]">
                      <MapPin className="w-4 h-4" strokeWidth={1.85} />
                      <span>{t.locationLabel}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {isRtl ? activeKitchen.locationAr : activeKitchen.locationEn}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl basit-glass-tile space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#62339A] dark:text-[#FFC928]">
                      <ShieldCheck className="w-4 h-4" strokeWidth={1.85} />
                      <span>{t.coverageLabel}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {isRtl ? activeKitchen.coverageAr : activeKitchen.coverageEn}
                    </div>
                  </div>
                </div>

                {/* Available Services */}
                <div className="space-y-2.5">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl basit-glass-btn-primary flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-[#FFC928]" strokeWidth={1.85} />
                    </span>
                    <span>{t.servicesOfferedLabel}</span>
                  </h2>
                  <ul className="space-y-2">
                    {(isRtl ? activeKitchen.servicesAr : activeKitchen.servicesEn).map(
                      (srv, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#62339A] dark:text-[#FFC928] shrink-0 mt-0.5" strokeWidth={1.85} />
                          <span>{srv}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Menu Categories */}
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    {t.menusLabel}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(isRtl ? activeKitchen.menuCategoriesAr : activeKitchen.menuCategoriesEn).map(
                      (cat, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-full basit-glass-pill text-slate-900 dark:text-slate-100 text-xs font-bold"
                        >
                          {cat}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-white/40 dark:border-[#62339A]/25 flex flex-wrap items-center justify-between gap-3">
                {hasPricedMenu ? (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/40 px-3.5 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.85} />
                    <span>
                      {isRtl
                        ? `قائمة مفعلة (${activeKitchen.sampleMenuItems.length} صنفاً) بالأسعار المعتمدة للطلب المباشر داخل باسط`
                        : `${activeKitchen.sampleMenuItems.length} priced items live for immediate order inside BASIT`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/40 px-3.5 py-2 rounded-full border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.85} />
                    <span>
                      {isRtl
                        ? 'عقود التوريد المؤسسي المخصصة: تسعّر حسب أعداد الوجبات اليومية ومواصفات التعاقد'
                        : 'Corporate meal contracts priced per shift volume & agreed specifications'}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {onOpenOperationalTasksWithDetails && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenOperationalTasksWithDetails(
                          isRtl
                            ? `متابعة تشغيل وتوريد: ${activeKitchen.nameAr}`
                            : `Catering Task: ${activeKitchen.nameEn}`,
                          isRtl
                            ? `المطبخ المركزي: ${activeKitchen.codeNameEn}\nالموقع: ${activeKitchen.locationAr}\nالتغطية: ${activeKitchen.coverageAr}`
                            : `Central Kitchen: ${activeKitchen.codeNameEn}\nLocation: ${activeKitchen.locationEn}`
                        )
                      }
                      className="min-h-[44px] px-5 py-2.5 rounded-full basit-glass-pill hover:border-[#62339A] text-xs font-extrabold text-[#62339A] dark:text-[#FFC928] flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <ClipboardList className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" strokeWidth={1.85} />
                      <span>{isRtl ? 'مهام التشغيل والمتابعة' : 'Operational Tasks'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onRequestQuoteForKitchen(
                        isRtl ? activeKitchen.nameAr : activeKitchen.nameEn
                      )
                    }
                    className="min-h-[44px] px-6 py-2.5 rounded-full basit-glass-btn-primary text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#FFC928]" strokeWidth={1.85} />
                    <span>{t.requestKitchenQuote}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kitchen Menu Items */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {hasPricedMenu
                ? isRtl
                  ? `قائمة أصناف ${activeKitchen.nameAr} (${activeKitchen.sampleMenuItems.length} صنفاً)`
                  : `${activeKitchen.nameEn} Menu (${activeKitchen.sampleMenuItems.length} items)`
                : isRtl
                  ? 'نماذج الوجبات المرتبطة بالمطبخ'
                  : 'Operational Meal Templates'}
            </h3>
            {hasPricedMenu ? (
              <span className="text-[11px] font-black text-[#62339A] dark:text-[#FFC928] bg-[#F7F5FA] dark:bg-[#2A2040] px-3 py-1 rounded-full border border-[#62339A]/20">
                {isRtl ? 'الأسعار بالجنيه المصري — طلب فوري للسلة' : 'Approved EGP Pricing — Direct Cart'}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                {t.awaitingApproval}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeKitchen.sampleMenuItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[20px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {item.dishImageUrl ? (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5F3FF] dark:bg-[#241B38]">
                      <img
                        src={item.dishImageUrl}
                        alt={isRtl ? item.nameAr : item.nameEn}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full bg-[#F5F3FF] dark:bg-[#241B38] flex items-center justify-center text-[#4C1D95] dark:text-[#F5C451]">
                      <ChefHat className="w-8 h-8" strokeWidth={1.75} />
                    </div>
                  )}

                  <div className="p-3.5 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-black text-[#1E1633] dark:text-white leading-snug">
                        {isRtl ? item.nameAr : item.nameEn}
                      </h4>
                      {item.rating !== null && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#4C1D95] dark:text-[#F5C451] tabular-nums shrink-0">
                          <Star className="w-3.5 h-3.5 text-[#F5C451] fill-[#F5C451]" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed line-clamp-2">
                      {isRtl ? item.descAr : item.descEn}
                    </p>
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 pt-2.5 border-t border-[#4C1D95]/10 dark:border-white/10 flex items-center justify-between gap-2">
                  {item.approvedPrice !== null ? (
                    <div className="text-sm font-black text-[#4C1D95] dark:text-[#F5C451] tabular-nums">
                      {item.approvedPrice.toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#5E5570] dark:text-[#C4B5FD]">
                      {isRtl ? 'السعر وفق التعاقد' : 'Contract pricing'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onAddToCart({
                        id: item.id,
                        nameAr: item.nameAr,
                        nameEn: item.nameEn,
                        kitchenNameAr: activeKitchen.nameAr,
                        kitchenNameEn: activeKitchen.nameEn,
                        approvedPrice: item.approvedPrice,
                        imageUrl: item.dishImageUrl || activeKitchen.imageUrl,
                      })
                    }
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-[#F5C451]" strokeWidth={1.85} />
                    <span>{item.approvedPrice !== null ? (isRtl ? 'أضف للسلة' : 'Add to Cart') : t.addToCartTest}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Overview of the 3 Central Kitchens
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full basit-glass-pill hover:border-[#62339A] text-xs font-extrabold text-slate-800 dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#FFC928]" strokeWidth={1.85} />
          <span>{t.nav.home}</span>
        </button>

        <button
          type="button"
          onClick={() => onRequestQuoteForKitchen('')}
          className="min-h-[44px] px-5 py-2 rounded-full basit-glass-btn-primary text-xs font-extrabold flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#FFC928]" strokeWidth={1.85} />
          <span>{t.heroPrimaryCta}</span>
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.kitchensHeading}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
          {t.kitchensSubheading} · {t.illustrativePhotoNote}
        </p>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-[#C084FC]/20 text-[11px] font-bold text-[#1E1633] dark:text-[#EDE9FE] flex items-center gap-2 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451] shrink-0" strokeWidth={1.85} />
          <span>
            {isRtl
              ? 'تشمل المطابخ المركزية والجهات المعتمدة: مطبخ العين المركزي، مطبخ بيت العيلة المركزي، ومطبخ أنجر ستيشن المركزي.'
              : 'Approved central kitchens: Al Ain, Bait Al-Eila, and HungerStation.'}
          </span>
        </div>
      </div>

      {/* Central Kitchens Cards with Crisp 16:9 Photography */}
      <div className="grid grid-cols-1 gap-4">
        {THREE_CENTRAL_KITCHENS.map((kitchen) => (
          <div
            key={kitchen.id}
            className="group rounded-[24px] bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 shadow-xs overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[16/9] w-full bg-[#F5F3FF] dark:bg-[#241B38] overflow-hidden">
              <img
                src={kitchen.imageUrl}
                alt={isRtl ? kitchen.nameAr : kitchen.nameEn}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {kitchen.id === 'bait_al_eila' ? (
                <div className="absolute top-3 end-3 rounded-xl bg-white p-1 shadow-md">
                  <BaitAlEilaBrandLogo className="w-10 h-10" />
                </div>
              ) : kitchen.hasOfficialLogo && kitchen.officialLogoUrl ? (
                <div className="absolute top-3 end-3 w-11 h-11 rounded-xl bg-white p-1 shadow-md">
                  <img
                    src={kitchen.officialLogoUrl}
                    alt={isRtl ? `شعار ${kitchen.nameAr}` : `${kitchen.nameEn} logo`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : null}
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-[#4C1D95] dark:text-[#F5C451] font-extrabold tracking-wider">
                  {kitchen.codeNameEn}
                </div>
                <h3 className="text-base font-black text-[#1E1633] dark:text-white leading-snug">
                  {isRtl ? kitchen.nameAr : kitchen.nameEn}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E5570] dark:text-[#C4B5FD]">
                  <MapPin className="w-3.5 h-3.5 text-[#4C1D95] dark:text-[#F5C451] shrink-0" strokeWidth={1.85} />
                  <span className="truncate">{isRtl ? kitchen.locationAr : kitchen.locationEn}</span>
                </div>
              </div>

              <p className="text-xs font-medium text-[#5E5570] dark:text-[#C4B5FD] leading-relaxed">
                {isRtl ? kitchen.coverageAr : kitchen.coverageEn}
              </p>

              <button
                type="button"
                onClick={() => onSelectKitchen(kitchen.id)}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-black transition-colors cursor-pointer"
              >
                {kitchen.id === 'bait_al_eila'
                  ? isRtl
                    ? 'عرض منيو بيت العيلة (15 صنفاً)'
                    : 'Open Bait Al-Eila Menu (15)'
                  : t.openKitchenPage}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
