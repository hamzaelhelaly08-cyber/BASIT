import React, { useEffect, useState } from 'react';
import {
  Truck,
  CheckCircle2,
  MapPin,
  Wallet,
  Lock,
  Power,
  PackageCheck,
  Navigation,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { LanguageCode } from '../../data/phase1Data';
import type { CourierProfileDoc, DeliveryRequestDoc } from '../../types/faydEcosystem';
import {
  courierAdvanceDeliveryStatus,
  courierToggleOnline,
} from '../../services/faydFirestoreService';

interface CourierPortalViewProps {
  lang: LanguageCode;
  user: User | null;
  onRequireSignIn: () => void;
  onGoToOnboarding: () => void;
  myCourierProfile: CourierProfileDoc | null;
  myAssignedDeliveries: DeliveryRequestDoc[];
  onToast: (msg: string) => void;
}

export const CourierPortalView: React.FC<CourierPortalViewProps> = ({
  lang,
  user,
  onRequireSignIn,
  onGoToOnboarding,
  myCourierProfile,
  myAssignedDeliveries,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [podNotes, setPodNotes] = useState<Record<string, string>>({});
  const [zoneInput, setZoneInput] = useState(myCourierProfile?.zone || '');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (myCourierProfile?.zone) {
      setZoneInput(myCourierProfile.zone);
    }
  }, [myCourierProfile?.zone]);

  if (!user) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-center space-y-3 shadow-xs">
        <Lock className="w-8 h-8 text-[#62339A] mx-auto" />
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl ? 'بوابة مندوبي التوصيل BASIT | باسط' : 'BASIT Courier Portal'}
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

  if (!myCourierProfile || !myCourierProfile.isApproved) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-center space-y-3 shadow-xs">
        <Truck className="w-8 h-8 text-[#62339A] mx-auto" />
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl ? 'بوابة مندوبي التوصيل (تتطلب اعتماد الحساب)' : 'Courier Portal (Requires Admin Approval)'}
        </h3>
        <p className="text-xs text-[#64748B] dark:text-slate-300 max-w-md mx-auto">
          {isRtl
            ? 'لا يرى المندوب إلا المهام المسندة إليه بعد اعتماد طلبه من الإدارة المركزية في باسط.'
            : 'Apply via Partner Onboarding as a Courier and await Central Admin approval.'}
        </p>
        <button
          type="button"
          onClick={onGoToOnboarding}
          className="px-5 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-black cursor-pointer"
        >
          {isRtl ? 'تقديم طلب الانضمام كمندوب' : 'Apply as Courier'}
        </button>
      </div>
    );
  }

  const handleToggleOnline = async () => {
    await courierToggleOnline(
      user,
      !myCourierProfile.isOnline,
      zoneInput.trim() || myCourierProfile.zone
    );
    onToast(
      isRtl
        ? !myCourierProfile.isOnline
          ? 'تم تفعيل حالة المندوب: متصل لاستقبال المهام.'
          : 'تم تحويل حالة المندوب إلى: غير متصل.'
        : 'Courier status updated.'
    );
  };

  const handleAdvance = async (
    del: DeliveryRequestDoc,
    nextStatus: 'picked_up' | 'in_transit' | 'delivered'
  ) => {
    setBusyId(del.deliveryId);
    try {
      await courierAdvanceDeliveryStatus(
        user,
        del,
        nextStatus,
        nextStatus === 'delivered' ? podNotes[del.deliveryId] || 'تم التسليم يداً بيد للعميل' : undefined
      );
      onToast(
        isRtl
          ? `تم تحديث المهمة ${del.deliveryId} إلى: ${nextStatus}`
          : `Task ${del.deliveryId} updated to ${nextStatus}`
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Courier Top KPI & Availability Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-[#62339A] dark:text-[#A34FE8]">
              {isRtl ? 'بوابة المندوب المعتمدة — BASIT | باسط' : 'Approved Courier Console — BASIT'}
            </span>
            <h2 className="text-lg font-black text-[#292333] dark:text-white mt-0.5">
              {myCourierProfile.fullName} — {myCourierProfile.zone}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={zoneInput}
              onChange={(e) => setZoneInput(e.target.value)}
              placeholder={myCourierProfile.zone}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700 text-xs w-36 text-[#292333] dark:text-white"
            />
            <button
              type="button"
              onClick={handleToggleOnline}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                myCourierProfile.isOnline
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#F8FAFC] dark:bg-slate-800 text-[#292333] dark:text-slate-200 border border-[#E2E8F0]'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>
                {myCourierProfile.isOnline
                  ? isRtl ? 'متصل الآن' : 'Online'
                  : isRtl ? 'غير متصل' : 'Offline'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700">
            <div className="text-[#64748B] dark:text-slate-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-[#62339A]" />
              <span>{isRtl ? 'محفظة مستحقات المندوب' : 'Courier Wallet'}</span>
            </div>
            <div className="text-lg font-black text-emerald-600 mt-1 tabular-nums">
              {myCourierProfile.walletBalanceEGP.toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700">
            <div className="text-[#64748B] dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#62339A]" />
              <span>{isRtl ? 'شحنات مكتملة' : 'Completed Trips'}</span>
            </div>
            <div className="text-lg font-black text-[#292333] dark:text-white mt-1 tabular-nums">
              {myCourierProfile.completedDeliveries}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 col-span-2 sm:col-span-1">
            <div className="text-[#64748B] dark:text-slate-400">
              {isRtl ? 'المهام المسندة لي حالياً' : 'My Assigned Tasks'}
            </div>
            <div className="text-lg font-black text-[#62339A] dark:text-[#A34FE8] mt-1 tabular-nums">
              {myAssignedDeliveries.length}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Courier Task Queue */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="text-base font-black text-[#292333] dark:text-white">
          {isRtl ? 'مهام التوصيل المخصصة لي فقط' : 'My Isolated Courier Task Queue'}
        </h3>

        {myAssignedDeliveries.length === 0 ? (
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            {isRtl ? 'لا توجد شحنات مسندة إليك في الوقت الحالي.' : 'No assigned deliveries right now.'}
          </p>
        ) : (
          <div className="space-y-3">
            {myAssignedDeliveries.map((del) => (
              <div
                key={del.deliveryId}
                className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-[#64748B]">{del.deliveryId}</span>
                    <div className="text-sm font-black text-[#292333] dark:text-white flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#62339A]" />
                      <span>
                        {del.pickupLocation} ← {del.dropoffLocation}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-black text-emerald-600">{del.courierShareEGP} ج.م حصة المندوب</div>
                    <span className="text-[11px] font-bold text-[#62339A] dark:text-[#A34FE8]">{del.status}</span>
                  </div>
                </div>

                {del.packageNote && (
                  <p className="text-[#64748B] dark:text-slate-300">
                    {isRtl ? 'ملاحظات الشحنة: ' : 'Note: '}
                    {del.packageNote}
                  </p>
                )}

                {del.status !== 'delivered' && del.status !== 'cancelled' && (
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-700 flex flex-wrap items-center gap-2">
                    {del.status === 'assigned' && (
                      <button
                        type="button"
                        disabled={busyId === del.deliveryId}
                        onClick={() => handleAdvance(del, 'picked_up')}
                        className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>{isRtl ? 'تأكيد استلام الشحنة' : 'Mark Picked Up'}</span>
                      </button>
                    )}

                    {del.status === 'picked_up' && (
                      <button
                        type="button"
                        disabled={busyId === del.deliveryId}
                        onClick={() => handleAdvance(del, 'in_transit')}
                        className="px-4 py-2 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>{isRtl ? 'بدء التوصيل (في الطريق)' : 'In Transit'}</span>
                      </button>
                    )}

                    {del.status === 'in_transit' && (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        <input
                          type="text"
                          value={podNotes[del.deliveryId] || ''}
                          onChange={(e) =>
                            setPodNotes((prev) => ({ ...prev, [del.deliveryId]: e.target.value }))
                          }
                          placeholder={isRtl ? 'كود أو اسم المستلم لإثبات التسليم POD...' : 'Recipient name / POD note...'}
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700"
                        />
                        <button
                          type="button"
                          disabled={busyId === del.deliveryId}
                          onClick={() => handleAdvance(del, 'delivered')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isRtl ? 'تأكيد التسليم النهائي' : 'Confirm Delivery'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
