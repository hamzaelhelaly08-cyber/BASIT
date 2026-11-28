import React, { useState, useMemo } from 'react';
import {
  Plus,
  ShoppingCart,
  Sparkles,
  Leaf,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { LanguageCode } from '../data/phase1Data';
import {
  FRESH_WORLD_CATEGORIES,
  FRESH_WORLD_PRODUCTS,
  FreshWorldCategoryId,
  FreshWorldProduct,
} from '../data/freshWorldData';
import { Phase1CartItem } from './Phase1CartDrawer';

interface FreshWorldStorefrontViewProps {
  lang: LanguageCode;
  currencyLabel: string;
  cartItems: Phase1CartItem[];
  onAddProductWithFly: (
    item: Omit<Phase1CartItem, 'quantity'>,
    sourceEl: HTMLElement | null
  ) => void;
  onOpenCart: () => void;
  onBackHome: () => void;
}

export const FreshWorldStorefrontView: React.FC<FreshWorldStorefrontViewProps> = ({
  lang,
  currencyLabel,
  cartItems,
  onAddProductWithFly,
  onOpenCart,
  onBackHome,
}) => {
  const isRtl = lang === 'ar';
  const [activeCategory, setActiveCategory] = useState<FreshWorldCategoryId>('all');
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const discoverNewProduct = useMemo(
    () =>
      FRESH_WORLD_PRODUCTS.find((p) => p.isNewDiscovery) ||
      FRESH_WORLD_PRODUCTS[0],
    []
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return FRESH_WORLD_PRODUCTS;
    return FRESH_WORLD_PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const getCartQty = (id: string) =>
    cartItems.find((c) => c.id === id)?.quantity || 0;

  const handleAdd = (
    product: FreshWorldProduct,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const sourceEl = e.currentTarget;
    setPulsingId(product.id);
    setTimeout(() => {
      setPulsingId((prev) => (prev === product.id ? null : prev));
    }, 280);

    onAddProductWithFly(
      {
        id: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        kitchenNameAr: 'حصاد النيل الأخضر | Fresh World',
        kitchenNameEn: 'Green Nile Harvest | Fresh World',
        approvedPrice: product.priceEgp,
        imageUrl: product.imageUrl,
      },
      sourceEl
    );
  };

  const totalCartUnits = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Storefront Royal Purple Header */}
      <section className="relative rounded-[24px] overflow-hidden bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#5B21B6] text-white p-4 shadow-[0_14px_32px_-12px_rgba(59,7,100,0.48)]">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[40px] px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BackIcon className="w-4 h-4 text-[#F5C451]" />
              <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#F5C451] hover:bg-[#EAB308] text-[#2A0E4D] font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isRtl ? 'السلة' : 'Cart'}</span>
              {totalCartUnits > 0 && (
                <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-[#3B0764] text-[#F5C451] text-[10px] font-black flex items-center justify-center tabular-nums">
                  {totalCartUnits}
                </span>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#F5C451]">
              <Leaf className="w-3.5 h-3.5" />
              <span>{isRtl ? 'توريد مبرد للمصانع والشركات' : 'Refrigerated Corporate Supply'}</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white">
              {isRtl
                ? 'حصاد النيل الأخضر | Fresh World'
                : 'Green Nile Harvest | Fresh World'}
            </h1>
            <p className="text-xs font-medium text-[#EDE9FE] leading-relaxed">
              {isRtl
                ? 'خضروات وفواكه الدلتا، تمور، ووجبات جاهزة بأسعار التوريد المعتمدة.'
                : 'Farm-fresh fruits, vegetables & ready meals at verified corporate pricing.'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Clean Category Strip */}
      <section aria-label={isRtl ? 'تصنيفات حصاد النيل الأخضر' : 'Fresh World Categories'}>
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1 px-0.5">
          {FRESH_WORLD_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="group flex flex-col items-center gap-1.5 shrink-0 min-w-[68px] cursor-pointer focus:outline-none"
              >
                <div
                  className={`relative w-14 h-14 rounded-2xl p-0.5 transition-all duration-200 ${
                    active
                      ? 'bg-[#4C1D95] ring-2 ring-[#F5C451] shadow-md scale-105'
                      : 'bg-white dark:bg-[#1B132B] border border-[#4C1D95]/15 dark:border-[#C084FC]/25 group-hover:border-[#4C1D95]'
                  }`}
                >
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#F5F3FF] dark:bg-[#241B38]">
                    <img
                      src={cat.imageUrl}
                      alt={isRtl ? cat.labelAr : cat.labelEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span
                  className={`text-[11px] font-extrabold whitespace-nowrap ${
                    active
                      ? 'text-[#4C1D95] dark:text-[#F5C451]'
                      : 'text-[#3B0764] dark:text-[#EDE9FE]'
                  }`}
                >
                  {isRtl ? cat.labelAr : cat.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Featured "Discover New" Highlight Card on Calm Ivory */}
      <section className="rounded-[22px] overflow-hidden bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 shadow-sm flex flex-col sm:flex-row">
        <div className="sm:w-40 aspect-[4/3] sm:aspect-auto bg-[#F5F3FF] dark:bg-[#241B38] shrink-0 overflow-hidden relative">
          <img
            src={discoverNewProduct.imageUrl}
            alt={isRtl ? discoverNewProduct.nameAr : discoverNewProduct.nameEn}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 p-3.5 min-w-0 flex flex-col justify-between gap-2.5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#B45309] dark:text-[#F5C451]">
              <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>{isRtl ? 'منتج مميز جديد' : 'Featured Arrival'}</span>
            </div>
            <h2 className="text-sm font-black text-[#1E1633] dark:text-white leading-snug">
              {isRtl ? discoverNewProduct.nameAr : discoverNewProduct.nameEn}
            </h2>
            <p className="text-xs font-medium text-[#5E5570] dark:text-[#C4B5FD] line-clamp-1">
              {isRtl ? discoverNewProduct.subtitleAr : discoverNewProduct.subtitleEn}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#4C1D95]/10 dark:border-white/10">
            <span className="text-sm font-black text-[#4C1D95] dark:text-[#F5C451] tabular-nums" dir="ltr">
              {discoverNewProduct.priceEgp} {currencyLabel}
            </span>
            <button
              type="button"
              onClick={(e) => handleAdd(discoverNewProduct, e)}
              className="min-h-[40px] px-4 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#F5C451]" strokeWidth={2.5} />
              <span>
                {isRtl ? 'أضف للسلة' : 'Add'}
                {getCartQty(discoverNewProduct.id) > 0
                  ? ` (${getCartQty(discoverNewProduct.id)})`
                  : ''}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Clean 2-Column 4:3 Catalog Grid (Talabat Mart Clarity) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#1E1633] dark:text-white">
            {isRtl
              ? `المنتجات الطازجة (${filteredProducts.length})`
              : `Fresh Catalog (${filteredProducts.length})`}
          </h2>
          <span className="text-[11px] font-bold text-[#5E5570] dark:text-[#C4B5FD]">
            {isRtl ? 'اضغط + للإضافة' : 'Tap + to add'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const qtyInCart = getCartQty(product.id);
            const isPulsing = pulsingId === product.id;

            return (
              <article
                key={product.id}
                className={`rounded-[20px] overflow-hidden bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-[#C084FC]/20 shadow-xs flex flex-col justify-between transition-transform duration-150 ${
                  isPulsing ? 'scale-[0.98] ring-2 ring-[#F5C451]' : ''
                }`}
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F3FF] dark:bg-[#241B38]">
                    <img
                      src={product.imageUrl}
                      alt={isRtl ? product.nameAr : product.nameEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-2.5 pb-1.5 space-y-1">
                    <h3 className="text-xs font-black text-[#1E1633] dark:text-white leading-snug line-clamp-1">
                      {isRtl ? product.nameAr : product.nameEn}
                    </h3>
                    <p className="text-[10px] font-medium text-[#5E5570] dark:text-[#C4B5FD] line-clamp-1">
                      {isRtl ? product.unitAr : product.unitEn}
                    </p>
                  </div>
                </div>

                <div className="px-2.5 pb-2.5 pt-1 flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-black text-[#4C1D95] dark:text-[#F5C451] tabular-nums"
                    dir="ltr"
                  >
                    {product.priceEgp} {currencyLabel}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleAdd(product, e)}
                    aria-label={
                      isRtl ? `إضافة ${product.nameAr} للسلة` : `Add ${product.nameEn} to cart`
                    }
                    className={`min-h-[38px] min-w-[38px] px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-90 shrink-0 ${
                      qtyInCart > 0
                        ? 'bg-[#F5C451] text-[#2A0E4D]'
                        : 'bg-[#4C1D95] hover:bg-[#3B0764] text-white'
                    }`}
                  >
                    {qtyInCart > 0 ? (
                      <span className="tabular-nums flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {qtyInCart}
                      </span>
                    ) : (
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
