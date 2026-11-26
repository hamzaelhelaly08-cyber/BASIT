import React, { useState } from 'react';
import { 
  X, 
  ChefHat, 
  Building2, 
  Hourglass, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Percent, 
  Download, 
  Save, 
  Plus, 
  Sparkles,
  Flame,
  FileText,
  AlertCircle,
  Copy,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Utensils,
  Printer,
  UserCheck,
  Check,
  Lock
} from 'lucide-react';
import { 
  AdminModule, 
  RoleProfile, 
  ContractOpportunity,
  ClientTenant
} from '../types/dashboard';
import { 
  KITCHENS_DATA, 
  SEASONAL_OFFERS_DATA, 
  SERRATED_COUPONS 
} from '../data/mockOperationalData';

interface ModuleDetailModalProps {
  module: AdminModule | null;
  currentRole: RoleProfile;
  isRtl: boolean;
  onClose: () => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
  opportunities: ContractOpportunity[];
  onOpenAddProjectModal: () => void;
  onAcceptOpportunity: (opportunity: ContractOpportunity) => void;
  onOpenPrintReport: () => void;
  tenants: ClientTenant[];
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  module,
  currentRole,
  isRtl,
  onClose,
  onAddAuditLog,
  opportunities,
  onOpenAddProjectModal,
  onAcceptOpportunity,
  onOpenPrintReport,
  tenants
}) => {
  if (!module) return null;

  // Kitchen index
  const [selectedKitchenIndex, setSelectedKitchenIndex] = useState(0);
  // Site index
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(0);
  // Filter for opportunities: active vs converted archive
  const [opportunityTab, setOpportunityTab] = useState<'active' | 'converted'>('active');

  // Copied code feedback
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  // Local success feedback
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
    onAddAuditLog(
      `نسخ كود الكوبون ${code}`,
      `Copied coupon code ${code}`,
      `تم نسخ الكود ${code} للاستفادة من مزايا العقد السنوي.`
    );
  };

  const handleSimulateAction = (title: string, details: string) => {
    setActionSuccessMessage(
      isRtl ? `تمت العملية بنجاح: ${title}` : `Action succeeded: ${title}`
    );
    setTimeout(() => setActionSuccessMessage(null), 3000);
    onAddAuditLog(title, title, details);
  };

  const activeOpportunities = opportunities.filter(
    (o) => o.status !== 'تم القبول — تم تحويله إلى عميل'
  );
  const convertedOpportunities = opportunities.filter(
    (o) => o.status === 'تم القبول — تم تحويله إلى عميل'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl my-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl text-slate-900 dark:text-white overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#62339A] text-white flex items-center justify-center shadow-lg shadow-[#62339A]/25 font-black text-lg">
              #{String(module.number).padStart(2, '0')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#62339A] dark:text-[#FFC928] uppercase tracking-wider">
                  {isRtl ? module.categoryNameAr : module.categoryNameEn}
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {isRtl ? 'بيانات تشغيلية نشطة' : 'Active Operational Data'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {isRtl ? module.titleAr : module.titleEn}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPrintReport}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#62339A]" />
              <span>{isRtl ? 'طباعة مستند رسمي A4' : 'Print Document'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action success notification */}
        {actionSuccessMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMessage(null)}
              aria-label="Close"
              className="p-0.5 hover:opacity-80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Module 3: Contract Opportunities & Add Project & Accept Mechanism */}
          {module.id === 'pending_contracts' && (
            <div className="space-y-5">
              
              {/* Header Bar with '+ إضافة مشروع جديد' */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isRtl ? 'إدارة فرص التعاقد والمشاريع الإنشائية والتوريدية' : 'Contract Opportunities & Bids'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'إضافة فرص جديدة، متابعة العروض، والقبول المباشر للتحويل إلى عميل معتمد' : 'Manage pipeline and accept opportunities to convert directly into active clients'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAddProjectModal}
                    className="px-4 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-extrabold text-xs shadow-md shadow-[#62339A]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? '+ إضافة مشروع جديد' : '+ Add New Project'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Active vs Converted Archive */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold pb-2">
                <button
                  onClick={() => setOpportunityTab('active')}
                  className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                    opportunityTab === 'active'
                      ? 'border-[#62339A] text-[#62339A] dark:text-[#FFC928]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الفرص النشطة قيد التفاوض ({activeOpportunities.length})
                </button>
                <button
                  onClick={() => setOpportunityTab('converted')}
                  className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                    opportunityTab === 'converted'
                      ? 'border-[#62339A] text-[#62339A] dark:text-[#FFC928]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  سجل الفرص المقبولة والمحولة لعملاء ({convertedOpportunities.length})
                </button>
              </div>

              {/* Opportunities List */}
              {opportunityTab === 'active' ? (
                <div className="space-y-3">
                  {activeOpportunities.map((prospect) => (
                    <div
                      key={prospect.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#62339A] bg-[#F7F5FA] dark:bg-[#2A2040] px-2 py-0.5 rounded">
                              {prospect.industry}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              تاريخ الإنشاء: {prospect.createdAt}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                            {prospect.projectName} — <span className="text-[#62339A]">{prospect.clientName}</span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            المسؤول: {prospect.contactPerson} ({prospect.contactPhone}) · الموقع: {prospect.location}
                          </p>
                        </div>

                        {/* Status badge & 'تم القبول' Action Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {prospect.status}
                          </span>

                          {/* The Mandatory Section 4.C Acceptance Action Button */}
                          <button
                            onClick={() => onAcceptOpportunity(prospect)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                            title="اعتماد وقبول المشروع ونقله تلقائياً إلى العملاء وإنشاء بوابته"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تم القبول (تحويل لعميل)</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">حجم التعاقد: </span>
                          <span>{prospect.expectedContractSize}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">الإجراء القادم: </span>
                          <span className="text-[#62339A]">{prospect.nextAction}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Converted Archive View */
                <div className="space-y-3">
                  {convertedOpportunities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      لا توجد فرص محولة بعد. اضغط على زر "تم القبول" في أي فرصة لنقلها تلقائياً لقاعدة بيانات العملاء.
                    </div>
                  ) : (
                    convertedOpportunities.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-extrabold text-slate-900 dark:text-white">{o.clientName}</span>
                          </div>
                          <p className="text-slate-500 mt-0.5">
                            تم القبول ونقله إلى العملاء النشطين وتفعيل بوابته المستقلة.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px]">
                          عميل نشط حالياً
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Module 1: Central Kitchens */}
          {module.id === 'central_kitchens' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {KITCHENS_DATA.map((k, idx) => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKitchenIndex(idx)}
                    className={`flex-1 min-w-[200px] py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedKitchenIndex === idx
                        ? 'bg-[#62339A] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isRtl ? k.nameAr : k.nameEn}
                  </button>
                ))}
              </div>

              {(() => {
                const k = KITCHENS_DATA[selectedKitchenIndex];
                const pct = Math.round((k.currentToday / k.capacityMeals) * 100);
                return (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-[#62339A]" />
                          <span>{k.locationAr}</span>
                          <span>·</span>
                          <span className="text-emerald-600 font-semibold">{k.status}</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                          {isRtl ? k.nameAr : k.nameEn}
                        </h3>
                        <p className="text-xs text-slate-500">
                          رئيس الطهاة المشرف: {k.manager}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSimulateAction('تشغيل خط إنتاج إضافي', `تم تفعيل خط التعبئة الإضافي في ${k.nameAr}`)}
                        className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-bold shadow-md shadow-[#62339A]/25 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        + تشغيل خط إضافي
                      </button>
                    </div>

                    <div className="space-y-1.5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between text-xs font-bold">
                        <span>حجم الإنتاج اليومي مقابل الطاقة القصوى</span>
                        <span className="text-[#62339A] dark:text-[#FFC928] tabular-nums">{k.currentToday.toLocaleString()} / {k.capacityMeals.toLocaleString()} وجبة ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FFC928] to-[#F6D95B] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs text-slate-500">طاقم العمل</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{k.staffCount} فرد</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs text-slate-500">مؤشر الهايجين</div>
                        <div className="text-lg font-black text-emerald-600 tabular-nums">{k.hygieneScore}%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs text-slate-500">خطوط التجهيز</div>
                        <div className="text-lg font-black text-blue-600 tabular-nums">{k.sections.length} خطوط</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Module 2: Active Sites */}
          {module.id === 'active_sites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    قائمة المنشآت والعملاء المتعاقدين حالياً ({tenants.length} منشآت)
                  </h3>
                  <p className="text-xs text-slate-500">
                    بوابات تشغيل مستقلة لكل مصنع أو مستشفى أو ماركت
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tenants.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#62339A]/20 text-[#62339A]">
                          {t.code}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                          {t.nameAr}
                        </h4>
                        <p className="text-xs text-slate-500">{t.industry}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        عقد سنوي سارٍ
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t.serviceType === 'market' ? `${t.marketItemsCount || 140} صنف ماركت` : `${t.dailyMeals || 1000} وجبة يومياً`}
                      </span>
                      <span className="text-[#62339A] font-bold">خصم العقد: {t.contractDiscountRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 15: Quality & Hygiene HACCP */}
          {module.id === 'hygiene_food_safety' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs">
                      HACCP
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      منظومة التفتيش والهايجين وسلامة الغذاء المعتمدة
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    فحص درجات الحرارة لسلسلة التبريد، مسحات الأسطح، ونظافة المعدات بمطابخنا المركزية
                  </p>
                </div>
                <button
                  onClick={onOpenPrintReport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  طباعة تقرير الفحص الصحي
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-bold">ثلاجات الحفظ المركزي وسيارات النقل</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">+2.8° م</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">سلسلة تبريد معتمدة ومراقبة إلكترونياً</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-bold">درجة حرارة قلب الطهي الساخن</div>
                  <div className="text-xl font-black text-[#62339A] mt-1">+78.5° م</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">مطابقة لاشتراطات سلامة الغذاء</div>
                </div>
              </div>
            </div>
          )}

          {/* Module 17: User Management & RBAC */}
          {module.id === 'users_permissions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#62339A]/10 border border-[#62339A]/35 text-xs text-[#4A2378] dark:text-[#FFC928] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#62339A] shrink-0" />
                <div>
                  <span className="font-extrabold block">صلاحيات الأمان الحصرية:</span>
                  إدارة المستخدمين، إيقاف الحسابات، إعادة تعيين كلمات المرور، وفتح وغلق الموديولات محصورة بمدير العمليات <strong className="underline">م/ مصطفى شعبان</strong> وحده.
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto text-xs">
                <table className="w-full min-w-[520px] text-start divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <th className="p-3 text-start">المستخدم</th>
                      <th className="p-3 text-start">الدور والمسؤولية</th>
                      <th className="p-3 text-start">اسم المستخدم</th>
                      <th className="p-3 text-end">إجراء أمني</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr className="bg-[#F7F5FA]/30 dark:bg-[#2A2040] font-bold">
                      <td className="p-3 text-[#62339A]">م/ مصطفى شعبان</td>
                      <td className="p-3">مدير العمليات (المسؤول الأعلى 100%)</td>
                      <td className="p-3 font-mono">mostafa.shaaban</td>
                      <td className="p-3 text-end">
                        <span className="px-2 py-0.5 rounded bg-[#62339A] text-white text-[10px]">حساب الحوكمة الأعلى</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold">مستر / أحمد ديب</td>
                      <td className="p-3">مدير مفوض لإدارة التشغيل والمحتوى والعملاء</td>
                      <td className="p-3 font-mono text-slate-500">ahmed.deeb</td>
                      <td className="p-3 text-end">
                        <button
                          onClick={() => handleSimulateAction('تحديث صلاحيات مستر أحمد ديب', 'تم تجديد تفويض إدارة الواجهات والتشغيل')}
                          className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-[#62339A] hover:text-white font-bold text-[10px]"
                        >
                          تعديل التفويض
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold">المدير المالي</td>
                      <td className="p-3">الإشراف المالي والحسابات والمشتريات</td>
                      <td className="p-3 font-mono text-slate-500">cfo.finance</td>
                      <td className="p-3 text-end">
                        <button
                          onClick={() => handleSimulateAction('إعادة تعيين كلمة مرور المدير المالي', 'تم إرسال رمز مؤقت')}
                          className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-[#62339A] hover:text-white font-bold text-[10px]"
                        >
                          إعادة تعيين
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 10 & 18: Catering Supply Settlement & Financial Accounting Summary */}
          {(module.id === 'inventory_procurement' || module.id === 'reports_analytics') && (
            <div className="p-5 rounded-2xl bg-[#F7F5FA] dark:bg-[#1E293B] border border-[#62339A]/25 space-y-3">
              <div className="flex items-center gap-2 text-sm font-black text-[#62339A] dark:text-[#FFC928]">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {isRtl
                    ? 'المحاسبة الفعلية لتوريد الوجبات والإعاشة (بدون تقديرات خامات افتراضية)'
                    : 'Actual B2B Catering & Meal Supply Accounting'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isRtl
                  ? 'يعمل النظام على محاسبة التوريد والوجبات الفعلية لكل عميل ومطبخ مركزي (عدد الوجبات، سعر الوجبة، إجمالي التوريد، الإيرادات الفعلية، المصروفات المسجلة، والذمم) من خلال وحدة "النظام المحاسبي لإدارة التوريد والإعاشة" في بوابة الحساب.'
                  : 'Financial reporting tracks actual supplied meals, unit prices, revenues, recorded expenses, and balances per client & central kitchen via the B2B Catering Financial Accounting module.'}
              </p>
            </div>
          )}

          {/* Fallback for other modules */}
          {![
            'pending_contracts', 
            'central_kitchens', 
            'active_sites', 
            'hygiene_food_safety', 
            'users_permissions',
            'inventory_procurement',
            'reports_analytics'
          ].includes(module.id) && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-[#62339A] uppercase">
                  وحدة العمليات المباشرة
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isRtl ? module.titleAr : module.titleEn}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isRtl ? module.descriptionAr : module.descriptionEn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500">{isRtl ? module.kpiPrimary.labelAr : module.kpiPrimary.labelEn}</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">{module.kpiPrimary.value}</div>
                </div>
                {module.kpiSecondary && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500">{isRtl ? module.kpiSecondary.labelAr : module.kpiSecondary.labelEn}</div>
                    <div className="text-xl font-black text-[#62339A] dark:text-[#FFC928] tabular-nums mt-0.5">{module.kpiSecondary.value}</div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                <button
                  onClick={() => handleSimulateAction(`اعتماد وتحديث ${module.titleAr}`, 'تم حفظ وتحديث السجلات المركزية')}
                  className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ وتحديث السجلات</span>
                </button>
                <button
                  onClick={onOpenPrintReport}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة تقرير معتمد</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              مسجل بواسطة: {currentRole.nameAr} ({currentRole.titleAr.split('(')[0]})
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
