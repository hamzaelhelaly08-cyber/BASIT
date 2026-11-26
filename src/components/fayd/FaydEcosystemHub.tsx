import React from 'react';
import {
  UserPlus,
  Store,
  Truck,
  Navigation,
  Briefcase,
  ShieldCheck,
  LogIn,
  LogOut,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { CountryCode, LanguageCode } from '../../data/phase1Data';
import type { useFaydEcosystem } from '../../hooks/useFaydEcosystem';
import { PartnerOnboardingPortal } from './PartnerOnboardingPortal';
import { MerchantWorkspaceView } from './MerchantWorkspaceView';
import { FaydDeliveryPartnerView } from './FaydDeliveryPartnerView';
import { CourierPortalView } from './CourierPortalView';
import { CentralAdminGovernanceView } from './CentralAdminGovernanceView';

export type FaydPortalTab =
  | 'onboarding'
  | 'merchant'
  | 'delivery'
  | 'courier'
  | 'central_admin';

interface FaydEcosystemHubProps {
  lang: LanguageCode;
  countryCode: CountryCode;
  ecosystem: ReturnType<typeof useFaydEcosystem>;
  activePortal: FaydPortalTab;
  onSelectPortal: (portal: FaydPortalTab) => void;
  initialMerchantMode?: 'storefront_market' | 'my_workspace';
  onExportContractPdf: (companyTitle: string) => void;
  onShowToast: (msg: string) => void;
  onBackHome: () => void;
}

export const FaydEcosystemHub: React.FC<FaydEcosystemHubProps> = ({
  lang,
  countryCode,
  ecosystem: eco,
  activePortal,
  onSelectPortal,
  initialMerchantMode = 'storefront_market',
  onExportContractPdf,
  onShowToast,
  onBackHome,
}) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const handleRequireSignIn = async () => {
    try {
      const user = await eco.signInWithGoogle();
      if (user) {
        onShowToast(
          isRtl
            ? 'تم تسجيل الدخول وربط الجلسة بقاعدة البيانات السحابية بنجاح.'
            : 'Signed in and connected to cloud database.'
        );
      } else {
        onShowToast(
          isRtl
            ? 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.'
            : 'Google sign-in popup was closed before completion.'
        );
      }
    } catch {
      onShowToast(
        isRtl
          ? 'تعذر إتمام تسجيل الدخول عبر Google، يرجى المحاولة مرة أخرى.'
          : 'Google sign-in was cancelled or failed.'
      );
    }
  };

  const portalTabs: {
    id: FaydPortalTab;
    labelAr: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'onboarding',
      labelAr: 'بوابة الانضمام والتسجيل',
      labelEn: 'Partner Onboarding',
      icon: <UserPlus className="w-4 h-4" />,
    },
    {
      id: 'merchant',
      labelAr: 'المصانع والمتاجر ومساحة التاجر',
      labelEn: 'Merchant & Factory Workspace',
      icon: <Store className="w-4 h-4" />,
    },
    {
      id: 'delivery',
      labelAr: 'باسط للتوصيل للجهات',
      labelEn: 'BASIT Delivery',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: 'courier',
      labelAr: 'بوابة المندوبين',
      labelEn: 'Courier Portal',
      icon: <Navigation className="w-4 h-4" />,
    },
    {
      id: 'central_admin',
      labelAr: 'الإدارة المركزية والعمولات',
      labelEn: 'Central Admin & Governance',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Top Action & Auth Identity Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#62339A] text-xs font-extrabold text-[#292333] dark:text-white shadow-xs cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A]" />
          <span>{isRtl ? 'العودة للرئيسية' : 'Back Home'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {eco.firebaseUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs">
              <div className="min-w-0">
                <span className="font-black text-[#292333] dark:text-white block truncate max-w-[180px]">
                  {eco.firebaseUser.displayName || eco.firebaseUser.email}
                </span>
                <span className="text-[10px] font-bold text-[#62339A] dark:text-[#A34FE8]">
                  {eco.isAdmin
                    ? isRtl ? 'مدير المنصة المركزي' : 'Central Super Admin'
                    : eco.userProfile?.role || 'customer'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => eco.signOutAccount()}
                className="p-1.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 hover:text-red-600 cursor-pointer"
                title={isRtl ? 'تسجيل الخروج' : 'Sign Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={eco.authLoading}
              onClick={handleRequireSignIn}
              className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#BAE6FD]" />
              <span>
                {eco.authLoading
                  ? isRtl ? 'جاري الاتصال...' : 'Signing in...'
                  : isRtl ? 'دخول بحساب Google لمنصة باسط' : 'Sign in with Google'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Isolated Workspace Selector */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {portalTabs.map((tab) => {
            const active = activePortal === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectPortal(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#62339A] text-white shadow-sm'
                    : 'text-[#292333] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:text-[#62339A]'
                }`}
              >
                <span className={active ? 'text-[#BAE6FD]' : 'text-[#62339A]'}>{tab.icon}</span>
                <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Workspace Screen */}
      {activePortal === 'onboarding' && (
        <PartnerOnboardingPortal
          lang={lang}
          countryCode={countryCode}
          user={eco.firebaseUser}
          userProfile={eco.userProfile}
          platformSettings={eco.platformSettings}
          onRequireSignIn={handleRequireSignIn}
          plans={eco.subscriptionPlans}
          myApplications={eco.myApplications}
          onToast={onShowToast}
        />
      )}

      {activePortal === 'merchant' && (
        <MerchantWorkspaceView
          lang={lang}
          countryCode={countryCode}
          user={eco.firebaseUser}
          onRequireSignIn={handleRequireSignIn}
          onGoToOnboarding={() => onSelectPortal('onboarding')}
          myTenant={eco.myTenant}
          myTenantMembers={eco.myTenantMembers}
          myMerchantCatalog={eco.myMerchantCatalog}
          myMerchantOrders={eco.myMerchantOrders}
          myCustomerOrders={eco.myCustomerOrders}
          myLedgerEntries={eco.myLedgerEntries}
          myPaymentTransactions={eco.myPaymentTransactions}
          gatewayConfigs={eco.gatewayConfigs}
          publicStorefronts={eco.publicStorefronts}
          publicCatalogItems={eco.publicCatalogItems}
          plans={eco.subscriptionPlans}
          commissionRule={eco.commissionRule}
          myCateringFeedback={eco.myCateringFeedback}
          initialMode={initialMerchantMode}
          onToast={onShowToast}
        />
      )}

      {activePortal === 'delivery' && (
        <FaydDeliveryPartnerView
          lang={lang}
          user={eco.firebaseUser}
          onRequireSignIn={handleRequireSignIn}
          onGoToOnboarding={() => onSelectPortal('onboarding')}
          myTenant={eco.myTenant}
          myDeliveryRequests={eco.myDeliveryRequests}
          commissionRule={eco.commissionRule}
          plans={eco.subscriptionPlans}
          onToast={onShowToast}
        />
      )}

      {activePortal === 'courier' && (
        <CourierPortalView
          lang={lang}
          user={eco.firebaseUser}
          onRequireSignIn={handleRequireSignIn}
          onGoToOnboarding={() => onSelectPortal('onboarding')}
          myCourierProfile={eco.myCourierProfile}
          myAssignedDeliveries={eco.myAssignedDeliveries}
          onToast={onShowToast}
        />
      )}

      {activePortal === 'central_admin' && (
        <CentralAdminGovernanceView
          lang={lang}
          user={eco.firebaseUser}
          isAdmin={eco.isAdmin}
          onRequireSignIn={handleRequireSignIn}
          allApplications={eco.allApplications}
          allUsers={eco.allUsers}
          allTenants={eco.allTenants}
          allCouriers={eco.allCouriers}
          allDeliveries={eco.allDeliveries}
          allOrders={eco.allOrders}
          allOpportunities={eco.allOpportunities}
          allProposals={eco.allProposals}
          allContracts={eco.allContracts}
          allOffersAds={eco.allOffersAds}
          allPaymentTransactions={eco.allPaymentTransactions}
          gatewayConfigs={eco.gatewayConfigs}
          platformSettings={eco.platformSettings}
          subscriptionPlans={eco.subscriptionPlans}
          commissionRule={eco.commissionRule}
          allLedgerEntries={eco.allLedgerEntries}
          auditLogs={eco.auditLogs}
          allEntertainmentBenefits={eco.allEntertainmentBenefits}
          allBenefitBookings={eco.allBenefitBookings}
          allCharityInitiatives={eco.allCharityInitiatives}
          allCharityContributions={eco.allCharityContributions}
          kaffarahRule={eco.kaffarahRule}
          allKaffarahOrders={eco.allKaffarahOrders}
          allLogisticsInquiries={eco.allLogisticsInquiries}
          allCateringFeedback={eco.allCateringFeedback}
          onToast={onShowToast}
        />
      )}
    </div>
  );
};
