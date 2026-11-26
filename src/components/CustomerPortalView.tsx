import React, { useState } from 'react';
import { 
  Building2, 
  Store, 
  UtensilsCrossed, 
  ShoppingBag, 
  Users, 
  FileText, 
  MessageSquareWarning, 
  Percent, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Tag,
  X
} from 'lucide-react';
import { ClientTenant } from '../types/dashboard';
import { UserAccount } from '../lib/auth';
import { BrandLogo } from './BrandLogo';
import { Lock } from 'lucide-react';

interface CustomerPortalViewProps {
  tenants: ClientTenant[];
  currentTenantId?: string;
  isLockedToTenant?: boolean;
  currentUserRole?: string;
  activeAccount?: UserAccount | null;
  isRtl: boolean;
  onOpenSupport: () => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  tenants,
  currentTenantId,
  isLockedToTenant = false,
  currentUserRole,
  activeAccount,
  isRtl,
  onOpenSupport,
  onAddAuditLog
}) => {
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    if (currentTenantId && tenants.some(t => t.id === currentTenantId)) {
      return currentTenantId;
    }
    return tenants.length > 0 ? tenants[0].id : 'site_royal';
  });
  const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'staff' | 'complaints'>('services');

  // Interactive complaint form inside customer portal
  const [complaintText, setComplaintText] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('حرارة الوجبة والتسليم');
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Quick order simulation state
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const selectedTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const handlePlaceOrder = (itemTitle: string) => {
    setOrderSuccess(itemTitle);
    setTimeout(() => setOrderSuccess(null), 3000);
    onAddAuditLog(
      `طلب وجبات عبر بوابة العميل (${selectedTenant.nameAr})`,
      `Customer order placed (${selectedTenant.nameEn})`,
      `تم تسجيل طلب "${itemTitle}" لحساب ${selectedTenant.nameAr} بنجاح.`
    );
  };

  const handleSendComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    const newTicketId = `TKT-${Date.now().toString().slice(-4)}`;
    setSubmittedTicketId(newTicketId);
    setComplaintSuccess(true);
    setTimeout(() => {
      setComplaintSuccess(false);
      setComplaintText('');
    }, 3500);

    onAddAuditLog(
      `تسجيل شكوى / اقتراح من عميل: ${selectedTenant.nameAr}`,
      `Client ticket submitted: ${selectedTenant.nameEn}`,
      `قسم: ${complaintCategory} — ${complaintText}`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Multi-Tenant Switcher Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#62339A] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#62339A]/25">
            APP
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isRtl ? 'بوابات العملاء المستقلة (Application Inside Application)' : 'Multi-Tenant Client Portals'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRtl ? 'مساحة تشغيل مستقلة لكل مؤسسة مع عزل كامل للبيانات والمخزون' : 'Isolated organizational spaces with zero data crossover'}
            </p>
          </div>
        </div>

        {/* Client Selector Pills or Locked Tenant Badge */}
        {isLockedToTenant ? (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#62339A]/10 border border-[#62339A]/35 text-[#FFC928] text-xs font-bold shadow-inner">
            <Lock className="w-3.5 h-3.5 text-[#62339A] shrink-0" />
            <span>{isRtl ? `بوابة مستقلة مشفرة: ${selectedTenant.nameAr}` : `Encrypted Tenant Space: ${selectedTenant.nameEn}`}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            {tenants.map((t) => {
              const isSelected = t.id === selectedTenant.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTenantId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#62339A] text-white shadow-md shadow-[#62339A]/25 ring-2 ring-[#62339A]/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.serviceType === 'market' ? <Store className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                  <span>{isRtl ? t.nameAr.split(' ')[0] + ' ' + (t.nameAr.split(' ')[1] || '') : t.code}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Tenant Independent Portal View */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
        
        {/* Tenant Custom Banner Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-800 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-[#FFC928] font-black text-xl shadow-inner">
                {selectedTenant.code.split('-')[0]}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#62339A]/20 text-[#FFC928] border border-[#62339A]/35 font-bold">
                    {selectedTenant.code}
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                    {selectedTenant.serviceType === 'market' ? 'خدمة ماركت وتجزئة' : 'عقد إعاشة سنوي ساري'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  {isRtl ? selectedTenant.nameAr : selectedTenant.nameEn}
                </h3>
                
                <p className="text-xs text-slate-400">
                  {selectedTenant.industry} · {selectedTenant.locationAr}
                </p>
              </div>
            </div>

            {/* Quick Tenant Contract Status */}
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 shrink-0">
              <div>
                <div className="text-[10px] text-slate-400">
                  {isRtl ? 'المفوض المعتمد' : 'Authorized Lead'}
                </div>
                <div className="text-xs font-bold text-white truncate max-w-[150px]">
                  {selectedTenant.authorizedContact.split('(')[0]}
                </div>
              </div>

              <div className="h-7 w-px bg-white/20" />

              <div>
                <div className="text-[10px] text-amber-300">
                  {isRtl ? 'خصم العقد السنوي' : 'Contract Perk'}
                </div>
                <div className="text-sm font-black text-[#FFC928]">
                  {selectedTenant.contractDiscountRate}% خصم معتمد
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Portal Internal Sub-Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'border-[#62339A] text-[#62339A] dark:text-[#FFC928]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {selectedTenant.serviceType === 'market' ? <ShoppingBag className="w-3.5 h-3.5" /> : <UtensilsCrossed className="w-3.5 h-3.5" />}
            <span>{selectedTenant.serviceType === 'market' ? 'منتجات وأسعار الماركت' : 'قوائم الوجبات والمنيو'}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#62339A] text-[#62339A] dark:text-[#FFC928]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>سجل الطلبات والتوريدات اليوم ({selectedTenant.activeOrdersToday})</span>
          </button>

          {currentUserRole !== 'client_employee' && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'staff'
                  ? 'border-[#62339A] text-[#62339A] dark:text-[#FFC928]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>موظفو المنشأة المستفيدون</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('complaints')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'complaints'
                ? 'border-[#62339A] text-[#62339A] dark:text-[#FFC928]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquareWarning className="w-3.5 h-3.5" />
            <span>الشكاوى والمقترحات المباشرة</span>
          </button>
        </div>

        {/* Order feedback banner */}
        {orderSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم تسجيل طلب التوريد بنجاح: {orderSuccess}، وتم توجيهه لمطبخ التجهيز.</span>
            </div>
            <button
              type="button"
              onClick={() => setOrderSuccess(null)}
              aria-label="Close"
              className="p-0.5 hover:opacity-80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab 1: Services / Market Products or Menus */}
        {activeTab === 'services' && (
          <div className="p-5 sm:p-6 space-y-6">
            
            {/* If Tenant is HABE MARKET (Market service type) */}
            {selectedTenant.serviceType === 'market' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      منتجات وكتالوج هابي ماركت — HABE MARKET
                    </h4>
                    <p className="text-xs text-slate-500">
                      أسعار بيع التجزئة المعتمدة وعروض التوريد للكنتين والماركت
                    </p>
                  </div>
                  <span className="text-xs bg-[#F7F5FA] dark:bg-[#2A2040] text-[#62339A] font-bold px-2.5 py-1 rounded-xl">
                    142 صنف متاح
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: 'كرتونة بيض مزارع طازج (30 بيضة)', category: 'ألبان وأجبان', price: '165 ج.م', offer: 'سعر خاص للموظفين' },
                    { name: 'علبة جبنة براميلي معقمة 1 كجم', category: 'ألبان وأجبان', price: '140 ج.م', offer: 'طبيعي 100%' },
                    { name: 'تشكيلة معجنات ومخبوزات كاترينج مصر', category: 'مخبوزات طازجة', price: '45 ج.م', offer: 'إنتاج اليوم' },
                    { name: 'عصير برتقال طبيعي معصور طازج 1 لتر', category: 'مشروبات وعصائر', price: '50 ج.م', offer: 'بدون سكر مضاف' },
                    { name: 'وجبة نصف دجاجة مشوية مجهزة للتسخين', category: 'وجبات Ready-to-Heat', price: '110 ج.م', offer: 'مغلفة مفرغة' },
                    { name: 'شنطة تمور فاخرة 1 كجم سيوة', category: 'عروض موسمية', price: '85 ج.م', offer: 'خصم العقد الساري' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-bold">{item.category}</span>
                          <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">{item.offer}</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{item.name}</h5>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-extrabold text-[#62339A] dark:text-[#FFC928]">{item.price}</span>
                        <button
                          onClick={() => handlePlaceOrder(item.name)}
                          className="px-2.5 py-1 rounded-lg bg-[#62339A] hover:bg-[#4A2378] text-white font-semibold text-[11px] transition-colors"
                        >
                          طلب الصنف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* If Tenant is Catering (Hospital / Factory) */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      قوائم المنيو المعتمدة للمنشأة
                    </h4>
                    <p className="text-xs text-slate-500">
                      وجبات معتمدة بالقيمة الغذائية والمطابقة لاشتراطات التعاقد
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 font-bold px-2.5 py-1 rounded-xl">
                    توريد اليوم منتظم بنسبة 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTenant.menuTiers.map((tier, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{tier}</span>
                        <span className="text-[10px] text-[#62339A] font-bold bg-[#F7F5FA] dark:bg-[#2A2040] px-2 py-0.5 rounded">
                          معتمد بالعقد
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        وجبات معقمة مفرغة حرارياً مطابقة لمعايير سلامة الغذاء، تسلم في المواعيد المحددة للورديات.
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">مطبخ التجهيز: هنجر استيشن ومول العين</span>
                        <button
                          onClick={() => handlePlaceOrder(tier)}
                          className="px-3 py-1 rounded-lg bg-[#62339A] hover:bg-[#4A2378] text-white font-semibold text-xs shadow-xs"
                        >
                          طلب حصة إضافية
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Orders Tracking */}
        {activeTab === 'orders' && (
          <div className="p-5 sm:p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">سجل التوريدات لليوم الحالي:</span>
              <span className="text-slate-400">تحديث فوري للسائقين والحرارة</span>
            </div>
            {[
              { id: 'DEL-881', batch: 'وجبات وردية الصباح', time: '06:15 ص', temp: '+72.4° م', status: 'تم التسليم والتوقيع', chef: 'شيف سامي' },
              { id: 'DEL-882', batch: 'وجبات غداء المرضى والطاقم', time: '12:30 م', temp: '+71.8° م', status: 'في مرحلة التسليم الآن', chef: 'شيف عصام' },
              { id: 'DEL-883', batch: 'وجبات وردية المساء', time: '18:00 م', temp: 'قيد التحميل المبرد', status: 'مجدول بمطبخ بدر', chef: 'شيف يحيى' },
            ].map((del, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{del.batch}</span>
                    <span className="font-mono text-[10px] text-[#62339A] font-bold">{del.id}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    موعد التسليم: {del.time} · حرارة التوريد: {del.temp} · إشراف: {del.chef}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                  {del.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Staff Database */}
        {activeTab === 'staff' && (
          <div className="p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">قاعدة بيانات موظفي الموقع المستفيدين</h4>
                <p className="text-slate-500">يحق لمسؤول المنشأة مراجعة الحصص والكوبونات المصرحة للموظفين</p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {[
                { name: 'محمود السيد', role: 'فني تشغيل ورديات', code: 'EMP-104', quota: 'وجبة غداء يومية + قسيمة كاش باك', status: 'نشط' },
                { name: 'أحمد عبد العال', role: 'مشرف إنتاج', code: 'EMP-105', quota: 'إفطار + غداء ساخن', status: 'نشط' },
                { name: 'د/ ريم فاروق', role: 'طبيب مقيم', code: 'EMP-201', quota: 'وجبات طعام علاجي وبوفيه الأطباء', status: 'نشط' },
                { name: 'م/ خالد جابر', role: 'مهندس صيانة', code: 'EMP-109', quota: 'وجبة وردية مسائية + سناك الكنتين', status: 'نشط' },
              ].map((emp, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{emp.name} <span className="font-mono text-slate-400 font-normal">({emp.code})</span></div>
                    <div className="text-slate-500 text-[11px]">{emp.role} · {emp.quota}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Complaints & Suggestions Form */}
        {activeTab === 'complaints' && (
          <div className="p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">تقديم شكوى أو اقتراح مباشر لإدارة كاترينج مصر</h4>
                <p className="text-slate-500">متابعة فورية خلال 30 دقيقة من مدير العمليات ومسؤول الجودة</p>
              </div>
              <button
                type="button"
                onClick={onOpenSupport}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#F7F5FA] dark:hover:bg-slate-700 text-[#62339A] font-bold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                فتح طلب مساندة / عرض تشغيل مباشر
              </button>
            </div>

            {complaintSuccess && submittedTicketId && (
              <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم إرسال تذكرتك بنجاح برقم {submittedTicketId}. سيتم التواصل معك فوراً.</span>
              </div>
            )}

            <form onSubmit={handleSendComplaint} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الشكوى أو الملاحظة:
                </label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none"
                >
                  <option value="حرارة الوجبة والتسليم">درجة حرارة الوجبة ووقت الوصول</option>
                  <option value="تغليف ونظافة العبوات">التغليف والتعقيم ونظافة العبوات</option>
                  <option value="حجم الحصص والوزن">أوزان الحصص بالجرام والمذاق</option>
                  <option value="اقتراح أصناف جديدة">اقتراح إضافة أصناف جديدة للمنيو</option>
                  <option value="خدمات الكنتين والماركت">ملاحظات على كنتين الموقع أو الماركت</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تفاصيل الشكوى أو الاقتراح:
                </label>
                <textarea
                  rows={3}
                  required
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="اكتب ملاحظاتك بدقة، مثل رقم الوجبة، وقت التسليم، واسم الصنف..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال التذكرة للإدارة</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
