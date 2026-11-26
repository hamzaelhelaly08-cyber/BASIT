import React from 'react';
import {
  Briefcase,
  Coffee,
  Cookie,
  Flame,
  Package,
  Pizza,
  Sandwich,
  Soup,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import type { HabeMenuItem } from '../data/habeAndBuffetData';

/**
 * Striped Red-and-White Awning + Bold Black "H" Ha-Be Brand Emblem
 * Matches the official reference mockup (0c200176-485c-46bd-b457-615b1b449b97).
 */
export const HabeAwningLogo: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showDots?: boolean;
}> = ({ size = 'md', showText = true, showDots = true }) => {
  const iconDim = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  const titleCls = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const subCls = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[11px]' : 'text-[9px]';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 64 64"
        className={`${iconDim} shrink-0`}
        aria-label="Ha-Be Logo"
      >
        {/* Red-and-white striped awning */}
        <path
          d="M11 8 L53 8 L58 21 L6 21 Z"
          fill="#ffffff"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect x="11" y="9" width="7" height="12" fill="#dc2626" />
        <rect x="25" y="9" width="7" height="12" fill="#dc2626" />
        <rect x="39" y="9" width="7" height="12" fill="#dc2626" />
        <path d="M6 21 C6 25, 13 25, 13 21 C13 25, 20 25, 20 21 C20 25, 27 25, 27 21 C27 25, 34 25, 34 21 C34 25, 41 25, 41 21 C41 25, 48 25, 48 21 C48 25, 58 25, 58 21 Z" fill="#dc2626" />

        {/* Bold Black "H" Pillars & Bar */}
        <rect x="13" y="26" width="11" height="31" rx="4" fill="#0f172a" />
        <rect x="40" y="26" width="11" height="31" rx="4" fill="#0f172a" />
        <rect x="18" y="36" width="28" height="9" rx="2" fill="#0f172a" />
      </svg>

      {showText && (
        <div className="leading-none">
          <div className="flex items-center gap-2">
            <span className={`${titleCls} font-black tracking-tight text-slate-950`}>Ha-Be</span>
            {showDots && (
              <div className="grid grid-cols-2 gap-1" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
            )}
          </div>
          <div className={`${subCls} font-black tracking-[0.14em] text-slate-500 uppercase mt-1`}>
            EMPLOYEE FOOD &amp; BEVERAGE POINT
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Distinct Vector Silhouette Icon for Each Product Type (Never an empty yellow sphere).
 */
export const HabeSkuVectorGlyph: React.FC<{ item: HabeMenuItem; className?: string }> = ({
  item,
  className = 'w-4 h-4',
}) => {
  const vt = item.visualType;
  if (vt === 'soda_can' || vt === 'energy_can') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="4" width="12" height="16" rx="2.5" />
        <path d="M6 8h12M9 2h6M10 13l2-2 2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (vt === 'malt_bottle') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 2h4v4l3 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l3-4V2z" />
        <path d="M7 13h10" />
      </svg>
    );
  }
  if (vt === 'juice_pack') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 7l3-4h4l3 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7z" />
        <path d="M7 10h10M13 2l3 2" strokeLinecap="round" />
      </svg>
    );
  }
  if (vt === 'chips_bag' || vt === 'tortilla_bag' || vt === 'cheese_puffs') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4h12l-1 16H7L6 4z" strokeLinejoin="round" />
        <path d="M5 4h14M6 20h12M10 11l2-3 2 3-2 3-2-3z" strokeLinecap="round" />
      </svg>
    );
  }
  if (vt === 'chocolate_bar' || vt === 'wafer_pack') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M5 9h14M5 14h14M12 4v16" />
      </svg>
    );
  }
  if (vt === 'cookie_pack' || vt === 'cake_roll') {
    return <Cookie className={className} />;
  }
  if (item.subGroup === 'pizza') return <Pizza className={className} />;
  if (item.subGroup === 'koshary') return <Soup className={className} />;
  if (item.category === 'sandwiches') return <Sandwich className={className} />;
  if (item.category === 'sahar_meals') return <Flame className={className} />;
  if (item.category === 'drinks_snacks') return <Coffee className={className} />;
  if (item.category === 'pastries') return <Package className={className} />;
  return <UtensilsCrossed className={className} />;
};

/**
 * Distinct Card Visual for Every Product (34 unique Market items + Meal items):
 * Uses real studio photography cropped dynamically to the exact flavor/product spot + color-coded brand badge.
 */
export const HabeMarketProductVisual: React.FC<{ item: HabeMenuItem }> = ({ item }) => {
  const brandBg = item.brandColor || '#dc2626';
  const accent = item.accentColor || '#ffffff';
  const isMarket = item.category === 'drinks_snacks';

  return (
    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-white shrink-0 relative border border-slate-200 shadow-2xs flex items-center justify-center">
      <img
        src={item.imageUrl}
        alt={item.nameAr}
        style={
          item.imagePosition
            ? { objectPosition: item.imagePosition }
            : undefined
        }
        className={`w-full h-full object-cover transition-transform duration-300 ${
          item.imageScale || ''
        }`}
      />
      {/* Crisp corner packaging badge for drinks/chips/chocolates */}
      {isMarket && (
        <div
          style={{ backgroundColor: brandBg }}
          className="absolute bottom-1 inset-x-1 px-1.5 py-0.5 rounded-md text-white flex items-center justify-between gap-1 shadow-xs border border-white/40"
        >
          <span style={{ color: accent }} className="shrink-0">
            <HabeSkuVectorGlyph item={item} className="w-3 h-3" />
          </span>
          <span className="text-[8px] font-black tracking-tight truncate uppercase">
            {item.shortBrandTag || item.code}
          </span>
        </div>
      )}
    </div>
  );
};

import { VodafoneCashLogo, InstaPayLogo } from './BankAndPaymentLogos';

/**
 * Authentic Recognizable Payment Method Icons (Vodafone Cash, InstaPay, Payroll, Cash).
 */
export const PaymentMethodIcon: React.FC<{
  method: 'vodafone_cash' | 'instapay' | 'payroll_deduction' | 'cash';
  className?: string;
}> = ({ method, className = 'w-12 h-8' }) => {
  if (method === 'vodafone_cash') {
    return (
      <div className={`${className} aspect-[3/2] shrink-0 overflow-hidden rounded-lg`}>
        <VodafoneCashLogo className="w-full h-full object-contain" />
      </div>
    );
  }
  if (method === 'instapay') {
    return (
      <div className={`${className} aspect-[3/2] shrink-0 overflow-hidden rounded-lg`}>
        <InstaPayLogo className="w-full h-full object-contain" />
      </div>
    );
  }
  if (method === 'payroll_deduction') {
    return (
      <div className={`${className} rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0`}>
        <Briefcase className="w-4 h-4 text-red-400" />
      </div>
    );
  }
  return (
    <div className={`${className} rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0`}>
      <Wallet className="w-4 h-4" />
    </div>
  );
};
