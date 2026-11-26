import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  CheckCircle2,
  ChefHat,
  Truck,
  PackageCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Phone,
  User,
  Sparkles,
} from 'lucide-react';
import { LanguageCode } from '../data/phase1Data';
import {
  B2B_LOCATION_TYPES,
  B2B_MAP_PINS,
  B2BLocationType,
  B2BTrackedOrder,
} from '../data/freshWorldData';
import { Phase1CartItem } from './Phase1CartDrawer';

interface B2BCheckoutTrackingViewProps {
  mode: 'checkout' | 'tracking';
  lang: LanguageCode;
  currencyLabel: string;
  cartItems: Phase1CartItem[];
  trackedOrders: B2BTrackedOrder[];
  onCreateOrder: (order: B2BTrackedOrder) => void;
  onAdvanceOrderStage: (orderId: string) => void;
  onSwitchMode: (mode: 'checkout' | 'tracking') => void;
  onBackHome: () => void;
  onBrowseFreshWorld: () => void;
}

const TRACKING_STAGES = [
  {
    id: 'confirmed',
    labelAr: 'تم التأكيد',
    labelEn: 'Confirmed',
    descAr: 'تم اعتماد أمر التوريد وإصدار رقم التشغيل للمنشأة',
    descEn: 'Corporate contract order verified & assigned',
    icon: CheckCircle2,
  },
  {
    id: 'in_kitchen',
    labelAr: 'في المطبخ المركزي',
    labelEn: 'In Kitchen',
    descAr: 'جاري تجهيز وتعبئة الوجبات وفق معايير HACCP الحرارية',
    descEn: 'Prepared & sealed under HACCP kitchen protocols',
    icon: ChefHat,
  },
  {
    id: 'en_route',
    labelAr: 'في الطريق للتسليم',
    labelEn: 'En Route',
    descAr: 'أسطول التوريد المبرد في طريقه لنقطة الاستلام المحددة',
    descEn: 'Refrigerated B2B fleet dispatched to pin location',
    icon: Truck,
  },
  {
    id: 'delivered',
    labelAr: 'تم التسليم للمنشأة',
    labelEn: 'Delivered',
    descAr: 'تم الاستلام والتوقيع الإلكتروني في موقع الشركة / المصنع',
    descEn: 'Signed & delivered at facility reception gate',
    icon: PackageCheck,
  },
] as const;

export const B2BCheckoutTrackingView: React.FC<B2BCheckoutTrackingViewProps> = ({
  mode,
  lang,
  currencyLabel,
  cartItems,
  trackedOrders,
  onCreateOrder,
  onAdvanceOrderStage,
  onSwitchMode,
  onBackHome,
  onBrowseFreshWorld,
}) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [selectedPinId, setSelectedPinId] = useState<string>(B2B_MAP_PINS[0].id);
  const [address, setAddress] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [locationType, setLocationType] = useState<B2BLocationType>('factory');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [createCorporateAccount, setCreateCorporateAccount] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    trackedOrders[0]?.id || ''
  );

  const selectedPin =
    B2B_MAP_PINS.find((p) => p.id === selectedPinId) || B2B_MAP_PINS[0];

  const pricedTotal = cartItems.reduce(
    (sum, item) =>
      sum + (typeof item.approvedPrice === 'number' ? item.approvedPrice * item.quantity : 0),
    0
  );

  const activeOrder =
    trackedOrders.find((o) => o.id === selectedOrderId) || trackedOrders[0] || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setFormError(
        isRtl
          ? 'اسم الشركة أو المصنع مطلوب لإتمام التعاقد وإصدار أمر التوريد.'
          : 'Company / Factory Name is required to submit this contract order.'
      );
      return;
    }
    if (!address.trim()) {
      setFormError(
        isRtl
          ? 'يرجى كتابة العنوان التفصيلي أو تأكيد نقطة الاستلام.'
          : 'Please enter the detailed delivery address.'
      );
      return;
    }
    setFormError(null);

    const newOrder: B2BTrackedOrder = {
      id: `B2B-${Date.now().toString().slice(-6)}`,
      companyName: companyName.trim(),
      contactName: contactName.trim() || (isRtl ? 'مسؤول التعاقد' : 'Contract Lead'),
      phone: phone.trim() || '01010430347',
      address: address.trim(),
      mapPinLabel: isRtl ? selectedPin.labelAr : selectedPin.labelEn,
      floor: floor.trim() || (isRtl ? 'الأرضي' : 'Ground'),
      apartment: apartment.trim() || (isRtl ? 'بوابة التوريد' : 'Gate A'),
      locationType,
      items: cartItems.map((i) => ({
        nameAr: i.nameAr,
        nameEn: i.nameEn,
        qty: i.quantity,
        priceEgp: typeof i.approvedPrice === 'number' ? i.approvedPrice : 0,
      })),
      totalEgp: pricedTotal,
      stageIndex: 0,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createCorporateAccount,
    };

    onCreateOrder(newOrder);
    setSelectedOrderId(newOrder.id);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header Banner */}
      <section className="rounded-[24px] bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#581C87] text-white p-4 shadow-lg border border-[#FFD54F]/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackHome}
              className="min-h-[36px] px-3 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <BackIcon className="w-4 h-4 text-[#FFD54F]" />
              <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-[#FFD54F]/20 text-[#FFD54F] text-[10px] font-black">
              B2B
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSwitchMode('checkout')}
              className={`min-h-[36px] px-3 rounded-xl text-[11px] font-black cursor-pointer transition-colors ${
                mode === 'checkout'
                  ? 'bg-[#FFD54F] text-[#3B0764]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {isRtl ? 'التعاقد' : 'Checkout'}
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('tracking')}
              className={`min-h-[36px] px-3 rounded-xl text-[11px] font-black cursor-pointer transition-colors ${
                mode === 'tracking'
                  ? 'bg-[#FFD54F] text-[#3B0764]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {isRtl ? `التتبع (${trackedOrders.length})` : `Tracking (${trackedOrders.length})`}
            </button>
          </div>
        </div>

        <h1 className="text-lg font-black text-[#FFD54F]">
          {mode === 'checkout'
            ? isRtl
              ? 'استكمال التعاقد وعنوان التوريد B2B'
              : 'B2B Contract & Delivery Checkout'
            : isRtl
              ? 'لوحة تتبع توريد الوجبات المباشر'
              : 'Live B2B Meal Tracking Dashboard'}
        </h1>
      </section>

      {mode === 'checkout' ? (
        <div className="grid grid-cols-1 gap-4 items-start">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] bg-gradient-to-b from-[#FFFDF0] via-[#FEF9C3] to-[#EDE9FE] border border-[#EAB308]/50 p-4 shadow-sm space-y-4"
          >
            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Map Pin Location Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#3B0764] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#4C1D95]" />
                <span>{isRtl ? 'تحديد الموقع (Pin Location)' : 'Select Delivery Zone Pin'}</span>
              </label>
              <div className="rounded-2xl bg-[#FFFBEB] border border-[#EAB308]/45 p-3 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {B2B_MAP_PINS.map((pin) => {
                    const active = pin.id === selectedPinId;
                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => {
                          setSelectedPinId(pin.id);
                          if (!address.trim()) {
                            setAddress(isRtl ? pin.labelAr : pin.labelEn);
                          }
                        }}
                        className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          active
                            ? 'bg-[#4C1D95] text-[#FFD54F] shadow-sm'
                            : 'bg-[#FEF9C3] text-[#3B0764] border border-[#EAB308]/45'
                        }`}
                      >
                        <Navigation className="w-3 h-3 shrink-0" />
                        <span>{isRtl ? pin.labelAr : pin.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] font-mono text-[#4C1D95] flex items-center gap-1.5" dir="ltr">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>GPS Pin Locked: {selectedPin.coords}</span>
                </div>
              </div>
            </div>

            {/* Company Name (Required) + Location Type */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#3B0764] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#4C1D95]" />
                  <span>{isRtl ? 'اسم الشركة / المصنع *' : 'Company / Factory Name *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={isRtl ? 'مثال: مصنع السويدي أو شركة XD EGEMAC' : 'e.g. El Sewedy Electric / Factory B'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFFBEB] border border-[#C084FC]/45 text-xs font-bold text-[#3B0764] focus:outline-none focus:border-[#4C1D95]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#3B0764]">
                  {isRtl ? 'نوع الموقع *' : 'Location Type *'}
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as B2BLocationType)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFFBEB] border border-[#C084FC]/45 text-xs font-bold text-[#3B0764] focus:outline-none focus:border-[#4C1D95]"
                >
                  {B2B_LOCATION_TYPES.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {isRtl ? lt.labelAr : lt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address, Floor, Apartment/Unit */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-black text-[#3B0764]">
                  {isRtl ? 'العنوان التفصيلي *' : 'Detailed Street Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isRtl ? 'القطعة، المحور، البوابة الرئيسية' : 'Plot number, main gate, landmark'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFFBEB] border border-[#C084FC]/45 text-xs font-bold text-[#3B0764] focus:outline-none focus:border-[#4C1D95]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#3B0764]">
                  {isRtl ? 'الدور' : 'Floor'}
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder={isRtl ? 'الأرضي / 2' : 'Ground / 2nd'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFFBEB] border border-[#C084FC]/45 text-xs font-bold text-[#3B0764] focus:outline-none focus:border-[#4C1D95]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#3B0764]">
                  {isRtl ? 'الشقة / الوحدة' : 'Apt / Unit'}
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder={isRtl ? 'مكتب 4 / عنبر ب' : 'Office 4 / Gate B'}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FFFBEB] border border-[#C084FC]/45 text-xs font-bold text-[#3B0764] focus:outline-none focus:border-[#4C1D95]"
                />
              </div>
            </div>

            {/* Contact Person & Phone */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#3B0764] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#4C1D95]" />
                  <span>{isRtl ? 'مسؤول الاستلام' : 'Receiving Officer'}</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={isRtl ? 'الاسم الثلاثي' : 'Full name'}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#FFFBEB] border border-[#C084FC]/45 text-xs font-bold text-[#3B0764] focus:outline-none focus:border-[#4C1D95]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#3B0764] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#4C1D95]" />
                  <span>{isRtl ? 'الهاتف' : 'Phone'}</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 10..."
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#FFFBEB] border border-[#C084FC]/45 text-xs font-bold text-[#3B0764] focus:outline-none focus:border-[#4C1D95]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFFBEB] border border-[#EAB308]/45 cursor-pointer">
              <input
                type="checkbox"
                checked={createCorporateAccount}
                onChange={(e) => setCreateCorporateAccount(e.target.checked)}
                className="w-4 h-4 accent-[#4C1D95]"
              />
              <span className="text-[11px] font-bold text-[#3B0764]">
                {isRtl
                  ? 'فتح حساب تعاقد مؤسسي (Corporate Account) لتفعيل خصم 10% ببطاقة باسط'
                  : 'Enroll in BASIT Corporate Account to unlock 10% staff card perks'}
              </span>
            </label>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#581C87] hover:brightness-105 text-[#FFD54F] border border-[#FFD54F]/50 font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-99"
            >
              <CheckCircle2 className="w-5 h-5 text-[#FFD54F]" />
              <span>{isRtl ? 'تأكيد التعاقد والانتقال لتتبع الوجبات' : 'Confirm Order & Open Meal Tracker'}</span>
            </button>
          </form>

          {/* Summary Card */}
          <aside className="rounded-[24px] bg-gradient-to-br from-[#FFFDF0] via-[#FEF9C3] to-[#EDE9FE] border border-[#EAB308]/50 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#3B0764]">
                {isRtl ? 'ملخص أمر التوريد' : 'Order Summary'}
              </h2>
              <button
                type="button"
                onClick={onBrowseFreshWorld}
                className="text-xs font-black text-[#4C1D95] cursor-pointer hover:underline"
              >
                {isRtl ? '+ إضافة منتجات' : '+ Add Items'}
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#FFFBEB] text-xs font-bold text-[#581C87] text-center">
                <p>{isRtl ? 'السلة فارغة — يمكنك استكمال التعاقد أو إضافة أصناف من حصاد النيل.' : 'Cart is empty — add items from Fresh World or submit a facility contract.'}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#EAB308]/35 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-black text-[#3B0764] truncate">
                        {isRtl ? item.nameAr : item.nameEn}
                      </div>
                      <div className="text-[11px] font-bold text-[#581C87]">
                        x{item.quantity}
                      </div>
                    </div>
                    <div className="font-black text-[#4C1D95] shrink-0 tabular-nums" dir="ltr">
                      {typeof item.approvedPrice === 'number'
                        ? `${(item.approvedPrice * item.quantity).toLocaleString()} ${currencyLabel}`
                        : isRtl
                          ? 'تعاقد'
                          : 'Quote'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2.5 border-t border-[#4C1D95]/15 flex items-center justify-between">
              <span className="text-xs font-bold text-[#581C87]">
                {isRtl ? 'الإجمالي المبدئي' : 'Subtotal'}
              </span>
              <span className="text-base font-black text-[#3B0764] tabular-nums" dir="ltr">
                {pricedTotal.toLocaleString()} {currencyLabel}
              </span>
            </div>
          </aside>
        </div>
      ) : (
        /* Tracking Mode */
        <section className="space-y-4">
          {!activeOrder ? (
            <div className="rounded-[24px] bg-gradient-to-b from-[#FFFDF0] via-[#FEF9C3] to-[#EDE9FE] border border-[#EAB308]/50 p-6 text-center space-y-3">
              <Truck className="w-10 h-10 text-[#4C1D95] mx-auto" />
              <div className="space-y-1">
                <h2 className="text-sm font-black text-[#3B0764]">
                  {isRtl ? 'لا توجد شحنات قيد التتبع حالياً' : 'No active tracked B2B orders yet'}
                </h2>
                <p className="text-xs font-medium text-[#581C87]">
                  {isRtl
                    ? 'أضف وجبات من حصاد النيل الأخضر وأكد نموذج التعاقد لبدء التتبع المباشر.'
                    : 'Add meals from Fresh World and submit B2B checkout to track stages live.'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={onBrowseFreshWorld}
                  className="min-h-[42px] px-4 rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] text-xs font-black cursor-pointer"
                >
                  {isRtl ? 'تسوق حصاد النيل الأخضر' : 'Browse Fresh World'}
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchMode('checkout')}
                  className="min-h-[42px] px-4 rounded-xl bg-[#FFD54F] text-[#3B0764] text-xs font-black cursor-pointer"
                >
                  {isRtl ? 'نموذج تعاقد جديد' : 'New B2B Order Form'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {trackedOrders.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {trackedOrders.map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setSelectedOrderId(ord.id)}
                      className={`min-h-[38px] px-3 rounded-xl text-xs font-black shrink-0 cursor-pointer transition-colors ${
                        ord.id === activeOrder.id
                          ? 'bg-[#4C1D95] text-[#FFD54F]'
                          : 'bg-[#FFFBEB] text-[#3B0764] border border-[#EAB308]/50'
                      }`}
                    >
                      {ord.id} · {ord.companyName}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-[24px] bg-gradient-to-b from-[#FFFDF0] via-[#FEF9C3] to-[#EDE9FE] border border-[#EAB308]/50 p-4 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#4C1D95]/15">
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono font-black text-[#4C1D95]">
                      {activeOrder.id} · {activeOrder.createdAt}
                    </div>
                    <h2 className="text-base font-black text-[#3B0764]">
                      {activeOrder.companyName}
                    </h2>
                    <div className="text-[11px] font-bold text-[#581C87] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#4C1D95]" />
                      <span>
                        {activeOrder.mapPinLabel} — {activeOrder.address}
                      </span>
                    </div>
                  </div>

                  {activeOrder.stageIndex < 3 && (
                    <button
                      type="button"
                      onClick={() => onAdvanceOrderStage(activeOrder.id)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-gradient-to-r from-[#3B0764] to-[#4C1D95] text-[#FFD54F] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-transform"
                    >
                      <Sparkles className="w-4 h-4 text-[#FFD54F]" />
                      <span>{isRtl ? 'المرحلة التالية' : 'Advance Stage'}</span>
                    </button>
                  )}
                </div>

                {/* 4-Stage Pipeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRACKING_STAGES.map((stage, idx) => {
                    const StageIcon = stage.icon;
                    const completed = idx <= activeOrder.stageIndex;
                    const isCurrent = idx === activeOrder.stageIndex;

                    return (
                      <div
                        key={stage.id}
                        className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                          isCurrent
                            ? 'bg-gradient-to-br from-[#FEF9C3] to-[#FDE68A] border-[#4C1D95] shadow-sm'
                            : completed
                              ? 'bg-[#EDE9FE] border-[#C084FC]'
                              : 'bg-[#FFFBEB] border-[#EAB308]/35 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              completed
                                ? 'bg-[#4C1D95] text-[#FFD54F]'
                                : 'bg-[#FEF3C7] text-[#3B0764]'
                            }`}
                          >
                            <StageIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-black tabular-nums text-[#581C87]">
                            0{idx + 1}
                          </span>
                        </div>
                        <div className="text-xs font-black text-[#3B0764]">
                          {isRtl ? stage.labelAr : stage.labelEn}
                        </div>
                        <p className="text-[11px] font-medium text-[#581C87] leading-relaxed">
                          {isRtl ? stage.descAr : stage.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
