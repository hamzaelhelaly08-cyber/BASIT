import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { CmsMenuOverrideItem, PlatformSettingsDoc } from '../types/faydEcosystem';

export const DEFAULT_HERO_BADGE_AR = 'الشريك الرقمي للشركة الوطنية اللوجستية';
export const DEFAULT_HERO_TITLE_AR = 'منظومة باسط الشاملة للإعاشة والمزايا وعالم مول العين';
export const DEFAULT_HERO_SUBTITLE_AR =
  'اطلب من مطاعم العين، استمتع بخصومات السينما والسبا والترفيه، وأدر تعاقدات المصانع والمطابخ المركزية في منصة واحدة.';

interface OwnerCmsContextValue {
  primaryPurple: string;
  accentYellow: string;
  heroBadgeAr: string;
  heroTitleAr: string;
  heroSubtitleAr: string;
  menuOverrides: CmsMenuOverrideItem[];
  iconOverrides: Record<string, string>;
  resolveIconKey: (defaultKey: string) => string;
  resolveMenuItem: (
    id: string,
    defaults: {
      titleAr: string;
      merchantAr: string;
      priceEGP: number;
      oldPriceEGP?: number;
      discountBadge?: string;
    }
  ) => {
    titleAr: string;
    merchantAr: string;
    priceEGP: number;
    oldPriceEGP?: number;
    discountBadge?: string;
    isHidden: boolean;
  };
}

const DEFAULT_CONTEXT: OwnerCmsContextValue = {
  primaryPurple: '#62339A',
  accentYellow: '#FFC928',
  heroBadgeAr: DEFAULT_HERO_BADGE_AR,
  heroTitleAr: DEFAULT_HERO_TITLE_AR,
  heroSubtitleAr: DEFAULT_HERO_SUBTITLE_AR,
  menuOverrides: [],
  iconOverrides: {},
  resolveIconKey: (k) => k,
  resolveMenuItem: (_id, d) => ({ ...d, isHidden: false }),
};

const OwnerCmsContext = createContext<OwnerCmsContextValue>(DEFAULT_CONTEXT);

function safeParseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isTrueRoyalPurpleHex(hex: string | undefined): hex is string {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex.trim())) return false;
  const clean = hex.trim().toUpperCase();
  if (clean === '#4F46E5' || clean === '#3730A3' || clean === '#312E81') return false;
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return b >= 140 && b > g + 40 && r >= 65 && r <= 170;
}

function isGoldYellowHex(hex: string | undefined): hex is string {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex.trim())) return false;
  const clean = hex.trim().toUpperCase();
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return r >= 220 && g >= 180 && b <= 110;
}

export const OwnerCmsProvider: React.FC<{
  settings?: PlatformSettingsDoc | null;
  children: React.ReactNode;
}> = ({ settings, children }) => {
  const primaryPurple = isTrueRoyalPurpleHex(settings?.cmsPrimaryPurple)
    ? settings!.cmsPrimaryPurple!.trim().toUpperCase()
    : '#62339A';

  const accentYellow = isGoldYellowHex(settings?.cmsAccentYellow)
    ? settings!.cmsAccentYellow!.trim().toUpperCase()
    : '#FFC928';

  const heroBadgeAr =
    settings?.cmsHeroBadgeAr && settings.cmsHeroBadgeAr.trim().length >= 2
      ? settings.cmsHeroBadgeAr.trim()
      : DEFAULT_HERO_BADGE_AR;

  const heroTitleAr =
    settings?.cmsHeroTitleAr && settings.cmsHeroTitleAr.trim().length >= 2
      ? settings.cmsHeroTitleAr.trim()
      : DEFAULT_HERO_TITLE_AR;

  const heroSubtitleAr =
    settings?.cmsHeroSubtitleAr && settings.cmsHeroSubtitleAr.trim().length >= 2
      ? settings.cmsHeroSubtitleAr.trim()
      : DEFAULT_HERO_SUBTITLE_AR;

  const menuOverrides = useMemo(() => {
    const parsed = safeParseJson<CmsMenuOverrideItem[]>(settings?.cmsMenuOverridesJson, []);
    return Array.isArray(parsed) ? parsed : [];
  }, [settings?.cmsMenuOverridesJson]);

  const iconOverrides = useMemo(() => {
    const parsed = safeParseJson<Record<string, string>>(settings?.cmsIconOverridesJson, {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }, [settings?.cmsIconOverridesJson]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--basit-purple', primaryPurple);
    document.documentElement.style.setProperty('--basit-yellow', accentYellow);
  }, [primaryPurple, accentYellow]);

  const value = useMemo<OwnerCmsContextValue>(
    () => ({
      primaryPurple,
      accentYellow,
      heroBadgeAr,
      heroTitleAr,
      heroSubtitleAr,
      menuOverrides,
      iconOverrides,
      resolveIconKey: (defaultKey: string) => iconOverrides[defaultKey] || defaultKey,
      resolveMenuItem: (id, defaults) => {
        const found = menuOverrides.find((m) => m.id === id);
        if (!found) {
          return { ...defaults, isHidden: false };
        }
        return {
          titleAr: found.titleAr || defaults.titleAr,
          merchantAr: found.merchantAr || defaults.merchantAr,
          priceEGP: Number.isFinite(found.priceEGP) ? found.priceEGP : defaults.priceEGP,
          oldPriceEGP:
            typeof found.oldPriceEGP === 'number' ? found.oldPriceEGP : defaults.oldPriceEGP,
          discountBadge: found.discountBadge ?? defaults.discountBadge,
          isHidden: Boolean(found.isHidden),
        };
      },
    }),
    [
      primaryPurple,
      accentYellow,
      heroBadgeAr,
      heroTitleAr,
      heroSubtitleAr,
      menuOverrides,
      iconOverrides,
    ]
  );

  return <OwnerCmsContext.Provider value={value}>{children}</OwnerCmsContext.Provider>;
};

export function useOwnerCms(): OwnerCmsContextValue {
  return useContext(OwnerCmsContext);
}
