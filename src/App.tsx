import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { auth, ecosystemGoogleSignIn, logout } from './lib/firebase';
import { OwnerCmsProvider } from './context/OwnerCmsContext';
import {
  PHASE1_SECTORS,
  getSectorById,
  type SectorId,
} from './data/phase1Sectors';
import {
  type CentralKitchenId,
  type CountryCode,
  type LanguageCode,
  type OrganizedCateringMenu,
  SUPPORTED_COUNTRIES,
} from './data/phase1Data';
import {
  fetchBasetCardStatus,
  type BasetCardRecord,
  type BasetRedemptionRecord,
} from './services/basetBenefitsService';
import { SplashScreenView } from './components/phase1/SplashScreenView';
import { AboutBasitModal } from './components/phase1/AboutBasitModal';
import {
  MobileHeader,
  type ExtendedAppRoute,
} from './components/phase1/MobileHeader';
import { BottomNavBar } from './components/phase1/BottomNavBar';
import { SectorsHubView } from './components/phase1/SectorsHubView';
import { SectorIcon } from './components/phase1/SectorIcon';
import { SectorMediaImage } from './components/phase1/SectorMediaImage';
import { BasitHealthySectorView } from './components/phase1/BasitHealthySectorView';
import { FactorySystemSectorView } from './components/phase1/FactorySystemSectorView';
import { OwnerFinanceSectorGateView } from './components/phase1/OwnerFinanceSectorGateView';
import { Phase1HomeView } from './components/Phase1HomeView';
import { FreshWorldStorefrontView } from './components/FreshWorldStorefrontView';
import { Phase1KitchensView } from './components/Phase1KitchensView';
import {
  Phase1ServicesHub,
  type Phase1RfqSubmission,
} from './components/Phase1ServicesHub';
import { BasetCardShowcaseView } from './components/BasetCardShowcaseView';
import { BasetFoodBenefitsView } from './components/BasetFoodBenefitsView';
import { BasetFamilyEntertainmentView } from './components/BasetFamilyEntertainmentView';
import type { BasetProgramTab } from './components/BasetBenefitsHeaderNav';
import { AlAinVisitorWorldView } from './components/AlAinVisitorWorldView';
import {
  Phase1CartDrawer,
  type Phase1CartItem,
} from './components/Phase1CartDrawer';
import {
  AndroidCateringModals,
  type AndroidModalType,
} from './components/AndroidCateringModals';
import {
  Phase1LoginView,
  type OtpCustomerSession,
} from './components/Phase1LoginView';
import { OwnerFinancialDashboard } from './components/OwnerFinancialDashboard';

const STRICT_OWNER_EMAIL = 'hamzaelhelaly08@gmail.com';

const ROUTE_TITLES_AR: Record<ExtendedAppRoute, string> = {
  home: 'BASIT | باسط',
  sectors: 'القطاعات الستة',
  marketplace: 'BASIT MARKETPLACE',
  business: 'BASIT BUSINESS',
  card: 'BASIT CARD',
  healthy: 'BASIT HEALTHY',
  factory: 'FACTORY SYSTEM',
  owner_finance: 'OWNER FINANCIAL',
  al_ain: 'عالم الزوار والمطاعم',
  auth_gate: 'بوابة الدخول والصلاحيات',
  owner_dashboard: 'الإدارة المالية للمالك',
};

const WELCOME_VIDEO_SEEN_KEY = 'basit_welcome_video_seen_v1';

function readWelcomeVideoNeedsShow(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_VIDEO_SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(readWelcomeVideoNeedsShow);
  const [replayingWelcome, setReplayingWelcome] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [lang] = useState<LanguageCode>('ar');
  const [country] = useState<CountryCode>('EG');
  const [darkMode, setDarkMode] = useState(false);

  const [routeHistory, setRouteHistory] = useState<ExtendedAppRoute[]>(['home']);
  const activeRoute = routeHistory[routeHistory.length - 1] || 'home';

  // Preserved sub-navigation states inside sectors
  const [businessTab, setBusinessTab] = useState<'kitchens' | 'rfq' | 'al_ain'>('kitchens');
  const [selectedKitchenId, setSelectedKitchenId] = useState<CentralKitchenId | null>(null);
  const [basetTab, setBasetTab] = useState<BasetProgramTab>('baset_card');

  // Auth & RBAC state (Strict Owner protection, zero automatic financial bypass)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [otpSession, setOtpSession] = useState<OtpCustomerSession | null>(null);

  // Cart, Modals & RFQ state (Preview-only in Phase 1 — no real payments executed)
  const [cartItems, setCartItems] = useState<Phase1CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCateringModal, setActiveCateringModal] = useState<AndroidModalType>(null);
  const [selectedMenu, setSelectedMenu] = useState<OrganizedCateringMenu | null>(null);
  const [preselectedKitchenName, setPreselectedKitchenName] = useState<string | undefined>(undefined);
  const [rfqSubmissions, setRfqSubmissions] = useState<Phase1RfqSubmission[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Baset Card non-transactional preview status
  const [cardActivated, setCardActivated] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardRecord, setCardRecord] = useState<BasetCardRecord | null>(null);
  const [cardRedemptions, setCardRedemptions] = useState<BasetRedemptionRecord[]>([]);

  const currencyLabel = useMemo(
    () =>
      SUPPORTED_COUNTRIES.find((c) => c.code === country)?.currencyAr || 'ج.م',
    [country]
  );

  const isOwnerAdmin = useMemo(() => {
    const fbEmail = firebaseUser?.email?.toLowerCase() || '';
    const otpEmail = otpSession?.email?.toLowerCase() || '';
    return (
      (Boolean(firebaseUser?.emailVerified) && fbEmail === STRICT_OWNER_EMAIL) ||
      otpSession?.canonicalRole === 'super_admin' ||
      otpSession?.role === 'owner' ||
      otpEmail === STRICT_OWNER_EMAIL
    );
  }, [firebaseUser, otpSession]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dir = 'rtl';
    root.lang = 'ar';
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  const refreshBasetCard = useCallback(async () => {
    setCardLoading(true);
    try {
      const res = await fetchBasetCardStatus();
      setCardActivated(Boolean(res.activated));
      setCardRecord(res.card || null);
      setCardRedemptions(res.redemptions || []);
    } catch {
      setCardActivated(false);
      setCardRecord(null);
      setCardRedemptions([]);
    } finally {
      setCardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeRoute === 'card') {
      void refreshBasetCard();
    }
  }, [activeRoute, refreshBasetCard]);

  const navigateTo = useCallback((nextRoute: ExtendedAppRoute) => {
    setRouteHistory((prev) => {
      const current = prev[prev.length - 1];
      if (current === nextRoute) return prev;
      if (nextRoute === 'home') return ['home'];
      return [...prev.slice(-10), nextRoute];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateBack = useCallback(() => {
    if (activeRoute === 'business' && selectedKitchenId) {
      setSelectedKitchenId(null);
      return;
    }
    setRouteHistory((prev) => {
      if (prev.length <= 1) return ['home'];
      return prev.slice(0, -1);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeRoute, selectedKitchenId]);

  const handleLegacySectionNavigate = useCallback(
    (section: string, kitchenId?: CentralKitchenId) => {
      if (section === 'fresh_world') {
        navigateTo('marketplace');
      } else if (section === 'baset_card') {
        setBasetTab('baset_card');
        navigateTo('card');
      } else if (section === 'baset_food_benefits') {
        setBasetTab('baset_food_benefits');
        navigateTo('card');
      } else if (section === 'baset_family_entertainment') {
        setBasetTab('baset_family_entertainment');
        navigateTo('card');
      } else if (section === 'kitchens' || section === 'kitchen_detail') {
        setBusinessTab('kitchens');
        setSelectedKitchenId(kitchenId || null);
        navigateTo('business');
      } else if (section === 'quotation') {
        setBusinessTab('rfq');
        navigateTo('business');
      } else if (section === 'b2b_tracking') {
        navigateTo('factory');
      } else if (section.startsWith('al_ain')) {
        navigateTo('al_ain');
      } else {
        navigateTo('sectors');
      }
    },
    [navigateTo]
  );

  const handleAddToCart = useCallback(
    (item: Omit<Phase1CartItem, 'quantity'>) => {
      setCartItems((prev) => {
        const idx = prev.findIndex((x) => x.id === item.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
          return updated;
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      showToast(`تمت إضافة «${item.nameAr}» إلى سلة المعاينة`);
    },
    [showToast]
  );

  const handleUpdateQty = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const handleFinishWelcome = useCallback(() => {
    try {
      window.localStorage.setItem(WELCOME_VIDEO_SEEN_KEY, '1');
    } catch {
      // ignore storage failure
    }
    setShowSplash(false);
    setReplayingWelcome(false);
  }, []);

  if (showSplash || replayingWelcome) {
    return (
      <SplashScreenView
        isReplayMode={replayingWelcome}
        onContinue={handleFinishWelcome}
      />
    );
  }

  return (
    <OwnerCmsProvider>
      <div
        dir="rtl"
        className="min-h-dvh bg-[#FAF8F5] dark:bg-[#120D1D] text-[#1E1633] dark:text-[#FAF8F5] flex flex-col"
      >
        <MobileHeader
          activeRoute={activeRoute}
          titleAr={ROUTE_TITLES_AR[activeRoute]}
          cartCount={totalCartCount}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onOpenCart={() => setCartOpen(true)}
          onOpenAbout={() => setAboutModalOpen(true)}
          onBack={activeRoute !== 'home' ? navigateBack : undefined}
          onNavigate={navigateTo}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-24 md:pb-10">
          {/* HOME SCREEN: Real Phase1HomeView + All 6 Sectors Launcher */}
          {activeRoute === 'home' && (
            <div className="space-y-8">
              <Phase1HomeView
                lang={lang}
                country={country}
                customLogoDataUrl={null}
                onUploadLogo={() => {}}
                isOwnerAdmin={isOwnerAdmin}
                isGuestMode={!firebaseUser && !otpSession}
                onNavigateSection={handleLegacySectionNavigate}
                onOpenCateringModal={(modal, kitchenName) => {
                  setPreselectedKitchenName(kitchenName);
                  setActiveCateringModal(modal);
                }}
                onSelectMenu={(menu) => setSelectedMenu(menu)}
              />

              {/* Direct Visual Launcher to All 6 Independent Sectors */}
              <section aria-labelledby="six-sectors-grid" className="space-y-3 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2
                      id="six-sectors-grid"
                      className="text-base sm:text-lg font-black text-[#1E1633] dark:text-white"
                    >
                      قطاعات منصة BASIT | باسط الستة
                    </h2>
                    <p className="text-xs text-[#5B5270] dark:text-slate-300">
                      انتقال مباشر إلى الصفحة المستقلة لكل قطاع
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('sectors')}
                    className="min-h-[40px] px-3 text-xs font-extrabold text-[#4C1D95] dark:text-[#F5C451] hover:underline cursor-pointer shrink-0"
                  >
                    عرض الدليل
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {PHASE1_SECTORS.map((sector) => (
                    <button
                      key={sector.id}
                      type="button"
                      onClick={() => navigateTo(sector.id as SectorId)}
                      className="group text-start rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 shadow-2xs hover:shadow-md overflow-hidden flex flex-col cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <SectorMediaImage
                        src={sector.imageUrl}
                        alt={sector.imageAltAr}
                        fallbackTitle={sector.titleAr}
                        iconName={sector.iconName}
                        aspectClass="aspect-[4/3]"
                      />
                      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2 w-full">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-latin text-[11px] font-extrabold text-[#4C1D95] dark:text-[#F5C451]">
                              {sector.codeEn}
                            </span>
                            <SectorIcon
                              name={sector.iconName}
                              className="w-4 h-4 text-[#4C1D95] dark:text-[#F5C451]"
                            />
                          </div>
                          <h3 className="text-sm font-black text-[#1E1633] dark:text-white">
                            {sector.titleAr}
                          </h3>
                          <p className="text-xs text-[#5B5270] dark:text-slate-300 line-clamp-2">
                            {sector.subtitleAr}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#4C1D95]/8 dark:border-white/8 flex items-center justify-between text-xs font-extrabold text-[#3B0764] dark:text-[#F5C451]">
                          <span>فتح القطاع</span>
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* SECTORS HUB */}
          {activeRoute === 'sectors' && (
            <SectorsHubView
              onNavigate={navigateTo}
              onOpenAlAinWorld={() => navigateTo('al_ain')}
              onOpenAuthGate={() => navigateTo('auth_gate')}
              onOpenAbout={() => setAboutModalOpen(true)}
            />
          )}

          {/* SECTOR 1: BASIT MARKETPLACE */}
          {activeRoute === 'marketplace' && (
            <FreshWorldStorefrontView
              lang={lang}
              currencyLabel={currencyLabel}
              cartItems={cartItems}
              onAddProductWithFly={(item) => handleAddToCart(item)}
              onOpenCart={() => setCartOpen(true)}
              onBackHome={() => navigateTo('home')}
            />
          )}

          {/* SECTOR 2: BASIT BUSINESS */}
          {activeRoute === 'business' && (
            <div className="space-y-5 pb-8">
              <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white dark:bg-[#1B132B] border border-[#4C1D95]/12 dark:border-white/10 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setBusinessTab('kitchens');
                    setSelectedKitchenId(null);
                  }}
                  className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                    businessTab === 'kitchens'
                      ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
                      : 'text-[#5B5270] dark:text-slate-300'
                  }`}
                >
                  المطابخ المركزية
                </button>
                <button
                  type="button"
                  onClick={() => setBusinessTab('rfq')}
                  className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                    businessTab === 'rfq'
                      ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
                      : 'text-[#5B5270] dark:text-slate-300'
                  }`}
                >
                  عروض الأسعار
                </button>
                <button
                  type="button"
                  onClick={() => setBusinessTab('al_ain')}
                  className={`min-h-[44px] px-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                    businessTab === 'al_ain'
                      ? 'bg-[#3B0764] text-white dark:bg-[#F5C451] dark:text-[#2A0548]'
                      : 'text-[#5B5270] dark:text-slate-300'
                  }`}
                >
                  مطاعم العين
                </button>
              </div>

              {businessTab === 'kitchens' && (
                <Phase1KitchensView
                  lang={lang}
                  selectedKitchenId={selectedKitchenId}
                  onSelectKitchen={(id) => setSelectedKitchenId(id)}
                  onBackHome={() => navigateTo('home')}
                  onRequestQuoteForKitchen={(kName) => {
                    setPreselectedKitchenName(kName);
                    setActiveCateringModal('quote_tasting');
                  }}
                  onAddToCart={handleAddToCart}
                />
              )}

              {businessTab === 'rfq' && (
                <Phase1ServicesHub
                  lang={lang}
                  country={country}
                  role={isOwnerAdmin ? 'system_admin' : firebaseUser || otpSession ? 'corporate_client' : 'visitor'}
                  activeSection="quotation"
                  preselectedKitchenName={preselectedKitchenName}
                  cartItems={cartItems}
                  onNavigateSection={handleLegacySectionNavigate}
                  onAddToCart={handleAddToCart}
                  onSubmitRfq={(rfq) => {
                    setRfqSubmissions((prev) => [rfq, ...prev]);
                    showToast('تم تسجيل مسودة طلب عرض السعر للمراجعة.');
                  }}
                  rfqSubmissions={rfqSubmissions}
                />
              )}

              {businessTab === 'al_ain' && (
                <AlAinVisitorWorldView
                  lang={lang}
                  activeSection="al_ain_restaurants"
                  customLogoDataUrl={null}
                  onUploadLogo={() => {}}
                  onNavigateSection={handleLegacySectionNavigate}
                  firebaseUser={firebaseUser}
                  onRequireSignIn={() => navigateTo('auth_gate')}
                  onShowToast={showToast}
                  isOwnerAdmin={isOwnerAdmin}
                  isGuestMode={!firebaseUser && !otpSession}
                  onAddToCart={handleAddToCart}
                />
              )}
            </div>
          )}

          {/* SECTOR 3: BASIT CARD */}
          {activeRoute === 'card' && (
            <>
              {basetTab === 'baset_card' && (
                <BasetCardShowcaseView
                  lang={lang}
                  cardActivated={cardActivated}
                  cardLoading={cardLoading}
                  card={cardRecord}
                  redemptions={cardRedemptions}
                  defaultName={firebaseUser?.displayName || otpSession?.fullName || ''}
                  onNavigateTab={setBasetTab}
                  onBackHome={() => navigateTo('home')}
                  onCardStateUpdated={(next) => {
                    setCardActivated(next.activated);
                    setCardRecord(next.card);
                    setCardRedemptions(next.redemptions);
                  }}
                  onToast={showToast}
                />
              )}

              {basetTab === 'baset_food_benefits' && (
                <BasetFoodBenefitsView
                  lang={lang}
                  currencyLabel={currencyLabel}
                  cardActivated={cardActivated}
                  cardLoading={cardLoading}
                  card={cardRecord}
                  onNavigateTab={setBasetTab}
                  onBackHome={() => navigateTo('home')}
                  onRefreshCardStatus={refreshBasetCard}
                  onAddToCart={handleAddToCart}
                  onToast={showToast}
                />
              )}

              {basetTab === 'baset_family_entertainment' && (
                <BasetFamilyEntertainmentView
                  lang={lang}
                  cardActivated={cardActivated}
                  cardLoading={cardLoading}
                  card={cardRecord}
                  onNavigateTab={setBasetTab}
                  onBackHome={() => navigateTo('home')}
                  onOpenLegacyEntertainmentPortal={() => navigateTo('al_ain')}
                  onRefreshCardStatus={refreshBasetCard}
                  onToast={showToast}
                />
              )}
            </>
          )}

          {/* SECTOR 4: BASIT HEALTHY */}
          {activeRoute === 'healthy' && (
            <BasitHealthySectorView
              lang={lang}
              currencyLabel={currencyLabel}
              cartItems={cartItems}
              onAddProduct={handleAddToCart}
              onOpenCart={() => setCartOpen(true)}
              onSelectMenu={(menu) => setSelectedMenu(menu)}
              onRequestHealthyQuote={() => setActiveCateringModal('quote_tasting')}
            />
          )}

          {/* SECTOR 5: FACTORY SYSTEM */}
          {activeRoute === 'factory' && (
            <FactorySystemSectorView
              lang={lang}
              currencyLabel={currencyLabel}
              onSelectKitchen={(id) => {
                setBusinessTab('kitchens');
                setSelectedKitchenId(id);
                navigateTo('business');
              }}
              onSelectMenu={(menu) => setSelectedMenu(menu)}
              onRequestFactoryQuote={() => setActiveCateringModal('quote_tasting')}
              onAddToCart={handleAddToCart}
              onShowToast={showToast}
            />
          )}

          {/* SECTOR 6: OWNER FINANCIAL MANAGEMENT (STRICT RBAC) */}
          {activeRoute === 'owner_finance' && (
            <OwnerFinanceSectorGateView
              lang={lang}
              isOwnerAdmin={isOwnerAdmin}
              ownerEmail={firebaseUser?.email || otpSession?.email}
              onOpenAuthGate={() => navigateTo('auth_gate')}
              onOpenOwnerDashboard={() => navigateTo('owner_dashboard')}
              onBackHome={() => navigateTo('home')}
            />
          )}

          {/* PRESERVED AL AIN VISITOR WORLD */}
          {activeRoute === 'al_ain' && (
            <AlAinVisitorWorldView
              lang={lang}
              activeSection="al_ain_restaurants"
              customLogoDataUrl={null}
              onUploadLogo={() => {}}
              onNavigateSection={handleLegacySectionNavigate}
              firebaseUser={firebaseUser}
              onRequireSignIn={() => navigateTo('auth_gate')}
              onShowToast={showToast}
              isOwnerAdmin={isOwnerAdmin}
              isGuestMode={!firebaseUser && !otpSession}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* PRESERVED AUTH / RBAC LOGIN PORTAL */}
          {activeRoute === 'auth_gate' && (
            <Phase1LoginView
              lang={lang}
              isGoogleAuthenticated={Boolean(firebaseUser)}
              googleDisplayName={firebaseUser?.displayName || undefined}
              googleEmail={firebaseUser?.email || undefined}
              isOwnerAdmin={isOwnerAdmin}
              otpSession={otpSession}
              onOtpVerified={(session) => {
                setOtpSession(session);
                showToast(`مرحباً ${session.fullName}`);
                if (
                  session.role === 'owner' ||
                  session.canonicalRole === 'super_admin' ||
                  session.email.toLowerCase() === STRICT_OWNER_EMAIL
                ) {
                  navigateTo('owner_finance');
                }
              }}
              onClearOtpSession={() => setOtpSession(null)}
              onGoogleSignIn={() => {
                void ecosystemGoogleSignIn().catch((err) => {
                  showToast(
                    err instanceof Error ? err.message : 'تعذر تسجيل الدخول بجوجل'
                  );
                });
              }}
              onSignOutGoogle={() => {
                void logout();
                setOtpSession(null);
              }}
              onBackHome={() => navigateTo('home')}
              onOpenAdminHub={() => navigateTo('owner_finance')}
              onShowToast={showToast}
            />
          )}

          {/* OWNER FINANCIAL DASHBOARD (Strictly locked behind verified isOwnerAdmin) */}
          {activeRoute === 'owner_dashboard' && (
            isOwnerAdmin ? (
              <OwnerFinancialDashboard
                isRtl
                isStrictAppOwner={isOwnerAdmin}
                ownerEmail={firebaseUser?.email || otpSession?.email || STRICT_OWNER_EMAIL}
                rfqSubmissions={rfqSubmissions}
                onBackHome={() => navigateTo('owner_finance')}
                onShowToast={showToast}
              />
            ) : (
              <OwnerFinanceSectorGateView
                lang={lang}
                isOwnerAdmin={false}
                onOpenAuthGate={() => navigateTo('auth_gate')}
                onOpenOwnerDashboard={() => navigateTo('owner_dashboard')}
                onBackHome={() => navigateTo('home')}
              />
            )
          )}
        </main>

        {/* Phase 1 Non-Transactional Cart Preview Drawer */}
        <Phase1CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          lang={lang}
          currencyLabel={currencyLabel}
          items={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={(id) =>
            setCartItems((prev) => prev.filter((item) => item.id !== id))
          }
          onClearCart={() => setCartItems([])}
          onConvertToQuote={() => {
            setCartOpen(false);
            setBusinessTab('rfq');
            navigateTo('business');
            showToast('تم تحويل الأصناف لمعاينة عرض السعر (بدون دفع مالي بالمرحلة الأولى).');
          }}
        />

        {/* Preserved Catering Menu & Quote Modals */}
        <AndroidCateringModals
          lang={lang}
          country={country}
          activeModal={activeCateringModal}
          selectedMenu={selectedMenu}
          preselectedKitchenName={preselectedKitchenName}
          isGuestMode={!firebaseUser && !otpSession}
          onCloseModal={() => setActiveCateringModal(null)}
          onCloseMenu={() => setSelectedMenu(null)}
          onSubmitRfq={(rfq) => {
            setRfqSubmissions((prev) => [rfq, ...prev]);
            setActiveCateringModal(null);
            showToast('تم تسجيل مسودة طلب عرض السعر.');
          }}
          onOpenAuthGate={() => navigateTo('auth_gate')}
          onShowToast={showToast}
        />

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-20 md:bottom-6 inset-x-4 sm:inset-x-auto sm:start-6 z-50 max-w-sm rounded-2xl bg-[#3B0764] text-white px-4 py-3 shadow-xl border border-[#F5C451]/40 flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#F5C451] shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        <footer className="hidden md:block border-t border-[#4C1D95]/10 dark:border-white/10 py-5 px-6 text-center text-xs font-semibold text-[#5B5270] dark:text-slate-400">
          {getSectorById('marketplace').codeEn.split(' ')[0]} | باسط — الشركة الوطنية اللوجستية · المرحلة الأولى
        </footer>

        <BottomNavBar activeRoute={activeRoute} onNavigate={navigateTo} />

        <AboutBasitModal
          isOpen={aboutModalOpen}
          onClose={() => setAboutModalOpen(false)}
          onReplayWelcomeVideo={() => setReplayingWelcome(true)}
        />
      </div>
    </OwnerCmsProvider>
  );
}
