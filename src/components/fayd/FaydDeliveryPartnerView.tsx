import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Lock, Send, Clock, CheckCircle2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { LanguageCode } from '../../data/phase1Data';
import type {
  CommissionRuleDoc,
  DeliveryRequestDoc,
  SubscriptionPlanDoc,
  TenantWorkspaceDoc,
} from '../../types/faydEcosystem';
import { createDeliveryRequest } from '../../services/faydFirestoreService';

interface FaydDeliveryPartnerViewProps {
  lang: LanguageCode;
  user: User | null;
  onRequireSignIn: () => void;
  onGoToOnboarding: () => void;
  myTenant: TenantWorkspaceDoc | null;
  myDeliveryRequests: DeliveryRequestDoc[];
  commissionRule: CommissionRuleDoc;
  plans: SubscriptionPlanDoc[];
  onToast: (msg: string) => void;
}

export const FaydDeliveryPartnerView: React.FC<FaydDeliveryPartnerViewProps> = ({
  lang,
  user,
  onRequireSignIn,
  onGoToOnboarding,
  myTenant,
  myDeliveryRequests,
  commissionRule,
  plans,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [pickupLocation, setPickupLocation] = useState(
    myTenant ? `${myTenant.name} — ${myTenant.city}` : ''
  );
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [packageNote, setPackageNote] = useState('');
  const [baseFee, setBaseFee] = useState(String(commissionRule.minDeliveryFeeEGP || 45));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (myTenant && !pickupLocation.trim()) {
      setPickupLocation(`${myTenant.name} — ${myTenant.city}`);
    }
  }, [myTenant?.tenantId, myTenant?.name, myTenant?.city, pickupLocation]);

  useEffect(() => {
    if (commissionRule.minDeliveryFeeEGP) {
      setBaseFee(String(commissionRule.minDeliveryFeeEGP));
    }
  }, [commissionRule.minDeliveryFeeEGP]);

  const activePlan = plans.find((p) => p.planId === myTenant?.planId);
  const discountPct = activePlan?.deliveryDiscountPct || 0;
  const computedFee = Math.round(
    Math.max(commissionRule.minDeliveryFeeEGP, Number(baseFee) || commissionRule.minDeliveryFeeEGP) *
      (1 - discountPct / 100)
  );
  const platformFee = Math.round((computedFee * commissionRule.defaultDeliveryPlatformPct) / 100);
  const courierShare = Math.max(0, computedFee - platformFee);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireSignIn();
      return;
    }
    if (!myTenant || !pickupLocation.trim() || !dropoffLocation.trim()) return;
    setSubmitting(true);
    try {
      const delId = await createDeliveryRequest(user, myTenant, commissionRule, discountPct, {
        pickupLocation,
        dropoffLocation,
        packageNote,
        baseDeliveryFeeEGP: Number(baseFee) || commissionRule.minDeliveryFeeEGP,
      });
      setDropoffLocation('');
      setPackageNote('');
      onToast(
        isRtl
          ? `تم تسجيل طلب شحن BASIT Delivery رقم ${delId} وبانتظار إسناد المندوب.`
          : `Delivery request ${delId} created on BASIT Delivery.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-center space-y-3 shadow-xs">
        <Lock className="w-8 h-8 text-[#62339A] mx-auto" />
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl ? 'بوابة التوصيل للشركاء والمصانع BASIT | باسط' : 'BASIT Delivery Partner Portal'}
        </h3>
        <button
          type="button"
          onClick={onRequireSignIn}
          className="px-5 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black cursor-pointer"
        >
          {isRtl ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  if (!myTenant) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-center space-y-3 shadow-xs">
        <Truck className="w-8 h-8 text-[#62339A] mx-auto" />
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl
            ? 'بوابة التوصيل مخصصة للجهات والتجار والمصانع المعتمدة في باسط'
            : 'BASIT Delivery requires an approved partner or merchant workspace'}
        </h3>
        <p className="text-xs text-[#64748B] dark:text-slate-300 max-w-md mx-auto">
          {isRtl
            ? 'انضم كجهة مستفيدة من التوصيل أو كتاجر أو مصنع من بوابة الانضمام ليتم تفعيل شحناتك.'
            : 'Apply via Partner Onboarding as a Delivery Client, Factory, or Merchant.'}
        </p>
        <button
          type="button"
          onClick={onGoToOnboarding}
          className="px-5 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black cursor-pointer"
        >
          {isRtl ? 'التقديم على الانضمام' : 'Apply Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-[#62339A] dark:text-[#A34FE8]">
              BASIT DELIVERY NETWORK — شبكة توصيل باسط
            </span>
            <h2 className="text-lg font-black text-[#292333] dark:text-white">
              {isRtl ? `شحنات التوصيل لجهة: ${myTenant.name}` : `Delivery Dispatch: ${myTenant.name}`}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#0EA5E9] text-white text-xs font-black">
            {isRtl ? `خصم الباقة على التوصيل: ${discountPct}%` : `Plan Delivery Discount: ${discountPct}%`}
          </span>
        </div>

        <form onSubmit={handleDispatch} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
              {isRtl ? 'عنوان الاستلام (الفرع / المطبخ / المصنع / المخزن) *' : 'Pickup Location *'}
            </label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
              {isRtl ? 'عنوان التسليم (الوجهة) *' : 'Dropoff Location *'}
            </label>
            <input
              type="text"
              required
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder={isRtl ? 'المنطقة والشارع واسم المستلم...' : 'Destination address...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
              {isRtl ? 'تفاصيل الشحنة أو الملاحظات' : 'Package Notes'}
            </label>
            <input
              type="text"
              value={packageNote}
              onChange={(e) => setPackageNote(e.target.value)}
              placeholder={isRtl ? 'مثال: 20 وجبة ساخنة / كراتين تبريد / توريد مصنع' : 'Hot meals / chilled boxes'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-[#292333] dark:text-slate-200 mb-1">
              {isRtl
                ? `تكلفة الشحنة الأساسية (الحد الأدنى ${commissionRule.minDeliveryFeeEGP} ج.م)`
                : `Base Delivery Fee (Min ${commissionRule.minDeliveryFeeEGP} EGP)`}
            </label>
            <input
              type="number"
              min={commissionRule.minDeliveryFeeEGP}
              value={baseFee}
              onChange={(e) => setBaseFee(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
            />
          </div>

          <div className="md:col-span-2 p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[#292333] dark:text-slate-200 font-bold">
              {isRtl
                ? `الرسوم النهائية بعد خصم الباقة: ${computedFee} ج.م (حصة المندوب ${courierShare} ج.م · حصة باسط ${platformFee} ج.م)`
                : `Final Fee: ${computedFee} EGP (Courier ${courierShare} · BASIT ${platformFee})`}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isRtl ? 'طلب مندوب توصيل الآن' : 'Dispatch Courier'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Tracked Shipments */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-3 shadow-xs">
        <h3 className="text-sm font-black text-[#292333] dark:text-white">
          {isRtl ? `شحنات جهتي (${myDeliveryRequests.length})` : `My Delivery Requests (${myDeliveryRequests.length})`}
        </h3>
        {myDeliveryRequests.length === 0 ? (
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            {isRtl ? 'لا توجد شحنات مسجلة حتى الآن.' : 'No shipments yet.'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {myDeliveryRequests.map((del) => (
              <div
                key={del.deliveryId}
                className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-[#64748B]">{del.deliveryId}</div>
                  <div className="font-bold text-[#292333] dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#62339A]" />
                    <span>
                      {del.pickupLocation} ← {del.dropoffLocation}
                    </span>
                  </div>
                  {del.packageNote && <div className="text-[11px] text-[#64748B]">{del.packageNote}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#292333] dark:text-white">{del.deliveryFeeEGP} ج.م</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                      del.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-[#0EA5E9]/15 text-[#0369A1] dark:text-[#A34FE8]'
                    }`}
                  >
                    {del.status === 'delivered' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{del.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
