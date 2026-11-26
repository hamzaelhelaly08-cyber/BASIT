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
    }, 380);

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
    <div className="space-y-4 pb-8">
      {/* 1. Storefront Royal Purple & Luminous Gold Header */}
      <section className="relative rounded-[24px] overflow-hidden bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#581C87] text-white p-4 shadow-[0_18px_40px_-14px_rgba(59,7,100,0.55)] border border-[#FFD54F]/40">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[36px] px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BackIcon className="w-4 h-4 text-[#FFD54F]" />
              <span>{isRtl ? 'بوابة الأعمال' : 'B2B Home'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="min-h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#FFD54F] to-[#EAB308] text-[#3B0764] font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isRtl ? 'السلة' : 'Cart'}</span>
              {totalCartUnits > 0 && (
                <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-[#3B0764] text-[#FFD54F] text-[10px] font-black flex items-center justify-center tabular-nums">
                  {totalCartUnits}
                </span>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] font-black text-[#FFD54F]">
              <Leaf className="w-3.5 h-3.5" />
              <span>{isRtl ? 'توريد مبرد للمصانع والشركات' : 'Refrigerated Corporate Supply'}</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white">
              {isRtl
                ? 'حصاد النيل الأخضر | Fresh World'
                : 'Green Nile Harvest | Fresh World'}
            </h1>
            <p className="text-[11px] font-medium text-[#EDE9FE] leading-relaxed">
              {isRtl
                ? 'خضروات وفواكه الدلتا، تمور، ووجبات جاهزة بأسعار التوريد المعتمدة.'
                : 'Farm-fresh fruits, vegetables & ready meals at verified corporate pricing.'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Compact Circular Category Scroller */}
      <section aria-label={isRtl ? 'تصنيفات حصاد النيل الأخضر' : 'Fresh World Categories'}>
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1 px-0.5">
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
                  className={`relative w-14 h-14 rounded-full p-0.5 transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-br from-[#4C1D95] to-[#FFD54F] shadow-md scale-105'
                      : 'bg-gradient-to-br from-[#FEF9C3] to-[#FDE68A] border border-[#C084FC]/45 group-hover:border-[#4C1D95]'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#FEF9C3]">
                    <img
                      src={cat.imageUrl}
                      alt={isRtl ? cat.labelAr : cat.labelEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span
                  className={`text-[11px] font-black whitespace-nowrap ${
                    active ? 'text-[#4C1D95]' : 'text-[#3B0764]'
                  }`}
                >
                  {isRtl ? cat.labelAr : cat.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Compact "اكتشف الجديد" (Discover New) Card with Small Thumbnail */}
      <section className="rounded-[22px] p-3.5 bg-gradient-to-br from-[#FFFDF0] via-[#FEF9C3] to-[#EDE9FE] border border-[#EAB308]/55 shadow-sm flex items-center gap-3">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#FEF9C3] border border-[#FFD54F]/70 shrink-0 shadow-xs">
          <img
            src={discoverNewProduct.imageUrl}
            alt={isRtl ? discoverNewProduct.nameAr : discoverNewProduct.nameEn}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="inline-flex items-center gap-1 text-[10px] font-black text-[#4C1D95]">
            <Sparkles className="w-3 h-3 text-[#EAB308]" />
            <span>{isRtl ? 'اكتشف الجديد' : 'Discover New'}</span>
          </div>
          <h2 className="text-sm font-black text-[#3B0764] leading-snug truncate">
            {isRtl ? discoverNewProduct.nameAr : discoverNewProduct.nameEn}
          </h2>
          <p className="text-[11px] font-semibold text-[#581C87] line-clamp-1">
            {isRtl ? discoverNewProduct.subtitleAr : discoverNewProduct.subtitleEn}
          </p>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-sm font-black text-[#3B0764] tabular-nums" dir="ltr">
              {discoverNewProduct.priceEgp} {currencyLabel}
            </span>
            <button
              type="button"
              onClick={(e) => handleAdd(discoverNewProduct, e)}
              className="min-h-[36px] px-3 rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] font-black text-[11px] flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>
                {isRtl ? 'أضف' : 'Add'}
                {getCartQty(discoverNewProduct.id) > 0
                  ? ` (${getCartQty(discoverNewProduct.id)})`
                  : ''}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Compact Horizontal Product Cards (Crisp Small Thumbnails + Zero Clutter) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-[#3B0764]">
            {isRtl
              ? `منتجات حصاد النيل الأخضر (${filteredProducts.length})`
              : `Green Nile Catalog (${filteredProducts.length})`}
          </h2>
          <span className="text-[11px] font-bold text-[#4C1D95]">
            {isRtl ? 'اضغط + للسلة' : 'Tap + to add'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {filteredProducts.map((product) => {
            const qtyInCart = getCartQty(product.id);
            const isPulsing = pulsingId === product.id;

            return (
              <article
                key={product.id}
                className={`rounded-2xl p-2.5 bg-gradient-to-br from-[#FFFDF0] via-[#FEF9C3]/95 to-[#EDE9FE]/85 border border-[#C084FC]/45 shadow-xs flex items-center gap-3 transition-transform ${
                  isPulsing ? 'scale-[0.98] ring-2 ring-[#FFD54F]' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FEF9C3] border border-[#EAB308]/40 shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={isRtl ? product.nameAr : product.nameEn}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="text-xs font-black text-[#3B0764] leading-snug truncate">
                    {isRtl ? product.nameAr : product.nameEn}
                  </h3>
                  <p className="text-[10px] font-semibold text-[#581C87] line-clamp-1">
                    {isRtl ? product.subtitleAr : product.subtitleEn}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-xs font-black text-[#4C1D95] tabular-nums" dir="ltr">
                      {product.priceEgp} {currencyLabel}
                    </span>
                    <span className="text-[10px] font-bold text-[#581C87]/80 truncate">
                      · {isRtl ? product.unitAr : product.unitEn}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleAdd(product, e)}
                  aria-label={
                    isRtl ? `إضافة ${product.nameAr} للسلة` : `Add ${product.nameEn} to cart`
                  }
                  className="min-h-[42px] min-w-[42px] px-2.5 rounded-xl bg-gradient-to-br from-[#3B0764] to-[#4C1D95] hover:brightness-110 text-[#FFD54F] flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-transform active:scale-90 shrink-0"
                >
                  {qtyInCart > 0 ? (
                    <span className="text-xs font-black tabular-nums flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" />
                      {qtyInCart}
                    </span>
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
