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
      <section className="relative rounded-[24px] overflow-hidden bg-[linear-gradient(135deg,#240046,#4B148C,#1A052E)] border border-[rgba(212,175,55,0.45)] text-[#FFFFFF] p-4 shadow-[0_14px_32px_-12px_rgba(36,0,70,0.48)]">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[44px] px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/15 text-[#FFFFFF] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BackIcon className="w-4 h-4 text-[#FFE875]" />
              <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="min-h-[44px] px-3.5 rounded-xl bg-[linear-gradient(135deg,#FFE875,#FACC15,#D4AF37)] text-[#240046] font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isRtl ? 'السلة' : 'Cart'}</span>
              {totalCartUnits > 0 && (
                <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-[#240046] text-[#FFE875] text-[10px] font-black flex items-center justify-center tabular-nums">
                  {totalCartUnits}
                </span>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#FFE875]">
              <Leaf className="w-3.5 h-3.5 text-[#FFE875]" />
              <span>{isRtl ? 'توريد مبرد للمصانع والشركات' : 'Refrigerated Corporate Supply'}</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-[#FFFFFF]">
              {isRtl
                ? 'حصاد النيل الأخضر | Fresh World'
                : 'Green Nile Harvest | Fresh World'}
            </h1>
            <p className="text-xs font-medium text-[#FFFDF7]/90 leading-relaxed">
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
                className="group flex flex-col items-center gap-1.5 shrink-0 min-w-[68px] min-h-[44px] cursor-pointer focus:outline-none"
              >
                <div
                  className={`relative w-14 h-14 rounded-2xl p-0.5 transition-all duration-200 ${
                    active
                      ? 'bg-[#5A189A] ring-2 ring-[#FFE875] shadow-md scale-105'
                      : 'bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] group-hover:border-[#5A189A]'
                  }`}
                >
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#FFFDF7] dark:bg-[#1A052E]">
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
                      ? 'text-[#5A189A] dark:text-[#FFE875]'
                      : 'text-[#3B123F] dark:text-[#FFFDF7]'
                  }`}
                >
                  {isRtl ? cat.labelAr : cat.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Featured "Discover New" Highlight Card on Milky Cream */}
      <section className="rounded-[22px] overflow-hidden bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] shadow-sm flex flex-col">
        <div className="aspect-[16/9] bg-[#FFFDF7] dark:bg-[#1A052E] shrink-0 overflow-hidden relative">
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
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-[#D4AF37] dark:text-[#FFE875]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRtl ? 'منتج مميز جديد' : 'Featured Arrival'}</span>
            </div>
            <h2 className="text-sm font-black text-[#240046] dark:text-[#FFFFFF] leading-snug">
              {isRtl ? discoverNewProduct.nameAr : discoverNewProduct.nameEn}
            </h2>
            <p className="text-xs font-medium text-[#3B123F] dark:text-[#FFFDF7]/85 leading-snug">
              {isRtl ? discoverNewProduct.subtitleAr : discoverNewProduct.subtitleEn}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[rgba(212,175,55,0.3)]">
            <span className="text-sm font-black text-[#5A189A] dark:text-[#FFE875] tabular-nums" dir="ltr">
              {discoverNewProduct.priceEgp} {currencyLabel}
            </span>
            <button
              type="button"
              onClick={(e) => handleAdd(discoverNewProduct, e)}
              className="min-h-[44px] px-4 rounded-xl bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all border border-[rgba(212,175,55,0.4)]"
            >
              <Plus className="w-4 h-4 text-[#FFE875]" strokeWidth={2.5} />
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

      {/* 4. Clean 2-Column 4:3 Catalog Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm font-black text-[#240046] dark:text-[#FFFFFF]">
            {isRtl
              ? `المنتجات الطازجة (${filteredProducts.length})`
              : `Fresh Catalog (${filteredProducts.length})`}
          </h2>
          <span className="text-[11px] font-bold text-[#3B123F] dark:text-[#FFFDF7]/80">
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
                className={`rounded-[20px] overflow-hidden bg-[rgba(255,255,255,0.95)] dark:bg-[#240046]/85 border border-[rgba(212,175,55,0.4)] shadow-xs flex flex-col justify-between transition-transform duration-150 ${
                  isPulsing ? 'scale-[0.98] ring-2 ring-[#FFE875]' : ''
                }`}
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFFDF7] dark:bg-[#1A052E]">
                    <img
                      src={product.imageUrl}
                      alt={isRtl ? product.nameAr : product.nameEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-2.5 pb-1.5 space-y-1">
                    <h3 className="text-xs font-black text-[#240046] dark:text-[#FFFFFF] leading-snug line-clamp-2">
                      {isRtl ? product.nameAr : product.nameEn}
                    </h3>
                    <p className="text-[10px] font-medium text-[#3B123F] dark:text-[#FFFDF7]/80 line-clamp-1">
                      {isRtl ? product.unitAr : product.unitEn}
                    </p>
                  </div>
                </div>

                <div className="px-2.5 pb-2.5 pt-1 flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-black text-[#5A189A] dark:text-[#FFE875] tabular-nums"
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
                    className={`min-h-[44px] min-w-[44px] px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-90 shrink-0 ${
                      qtyInCart > 0
                        ? 'bg-[linear-gradient(135deg,#FFE875,#D4AF37)] text-[#240046]'
                        : 'bg-[linear-gradient(135deg,#5A189A,#4B148C,#240046)] text-[#FFFFFF] border border-[rgba(212,175,55,0.4)]'
                    }`}
                  >
                    {qtyInCart > 0 ? (
                      <span className="tabular-nums flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {qtyInCart}
                      </span>
                    ) : (
                      <Plus className="w-4 h-4 text-[#FFE875]" strokeWidth={2.5} />
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
