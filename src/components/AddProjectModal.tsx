import React, { useState } from 'react';
import { X, Plus, Calendar, Building, MapPin, User, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { ContractOpportunity, OpportunityStatus, ClientServiceType } from '../types/dashboard';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: ContractOpportunity) => void;
  isRtl: boolean;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  isRtl
}) => {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState('مستشفيات ورعاية صحية');
  const [serviceType, setServiceType] = useState<ClientServiceType>('catering');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');
  const [expectedContractSize, setExpectedContractSize] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-11-25');
  const [status, setStatus] = useState<OpportunityStatus>('فرصة جديدة');
  const [nextAction, setNextAction] = useState('إعداد العرض المالي ودراسة التكلفة');
  const [notes, setNotes] = useState('');
  const [attachmentsText, setAttachmentsText] = useState('ملف_المواصفات_الفنية.pdf');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !clientName.trim()) return;

    const newOpportunity: ContractOpportunity = {
      id: `p-${Date.now().toString().slice(-4)}`,
      projectName: projectName.trim(),
      clientName: clientName.trim(),
      industry: industry.trim(),
      serviceType,
      location: location.trim() || (isRtl ? 'القاهرة الكبرى' : 'Greater Cairo'),
      contactPerson: contactPerson.trim() || (isRtl ? 'المفوض الإداري' : 'Liaison Officer'),
      contactPhone: contactPhone.trim() || '01000000000',
      contactEmail: contactEmail.trim(),
      description: description.trim() || (isRtl ? 'مشروع توريد إعاشة غذائية متكاملة' : 'Comprehensive catering contract'),
      expectedContractSize: expectedContractSize.trim() || (isRtl ? '1,000 وجبة يومياً' : '1,000 meals/day'),
      createdAt: new Date().toISOString().split('T')[0],
      followUpDate,
      status,
      nextAction: nextAction.trim() || (isRtl ? 'متابعة العرض مع الإدارة' : 'Follow up with management'),
      notes: notes.trim(),
      attachments: attachmentsText.split(',').map((s) => s.trim()).filter(Boolean)
    };

    onAddProject(newOpportunity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl my-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 sm:p-7 text-slate-900 dark:text-white"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#62339A] text-white flex items-center justify-center shadow-md shadow-[#62339A]/25">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {isRtl ? '+ إضافة مشروع أو فرصة تعاقد جديدة' : '+ Add New Contract Opportunity'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'إدراج فرصة التعاقد بمسار المتابعة مع إمكانية القبول المباشر والتحويل لعميل' : 'Register a prospect with direct conversion to client support'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Project Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'اسم المشروع *' : 'Project Name *'}
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={isRtl ? 'مثال: توريد إعاشة مصنع الأدوية' : 'e.g. Pharma Factory Catering'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>

            {/* Client / Organization Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'اسم العميل أو المؤسسة *' : 'Client / Institution Name *'}
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={isRtl ? 'مثال: شركة يونيفرسال للصناعات' : 'e.g. Universal Industries Co.'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Industry */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'نوع النشاط' : 'Industry'}
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              >
                <option value="مستشفيات ورعاية صحية">مستشفيات ورعاية صحية</option>
                <option value="صناعات ومصانع ثقيلة">صناعات ومصانع ثقيلة</option>
                <option value="شركات وتكنولوجيا">شركات وتكنولوجيا</option>
                <option value="ماركت وسلاسل تجزئة">ماركت وسلاسل تجزئة</option>
                <option value="مقاولات وإنشاءات">مقاولات وإنشاءات</option>
                <option value="مؤسسات حكومية">مؤسسات حكومية</option>
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'نوع الخدمة' : 'Service Type'}
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ClientServiceType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              >
                <option value="catering">إعاشة ومطابخ (Catering)</option>
                <option value="market">ماركت وكنتين (Market)</option>
                <option value="hybrid">مشترك (Catering + Canteen)</option>
              </select>
            </div>

            {/* Contract Status */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'حالة التعاقد' : 'Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-[#62339A] outline-none text-[#62339A] dark:text-[#FFC928]"
              >
                <option value="فرصة جديدة">فرصة جديدة</option>
                <option value="تم التواصل">تم التواصل</option>
                <option value="عرض مرسل">عرض مرسل</option>
                <option value="تفاوض">تفاوض</option>
                <option value="انتظار رد">انتظار رد</option>
                <option value="تم القبول">تم القبول (تحويل تلقائي لعميل)</option>
                <option value="مرفوض">مرفوض</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Location */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'الموقع الجغرافي' : 'Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isRtl ? 'مثال: مدينة بدر — المنطقة الصناعية' : 'e.g. Badr City'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'الشخص المسؤول' : 'Contact Person'}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder={isRtl ? 'مثال: أ/ كمال توفيق' : 'e.g. Kamal Tawfik'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'رقم التواصل' : 'Phone'}
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Expected Size */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'حجم التعاقد المتوقع' : 'Expected Volume / Size'}
              </label>
              <input
                type="text"
                value={expectedContractSize}
                onChange={(e) => setExpectedContractSize(e.target.value)}
                placeholder={isRtl ? 'مثال: 1,500 وجبة يومياً (5.5M ج.م)' : 'e.g. 1,500 meals/day'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>

            {/* Follow up date */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'موعد المتابعة القادم' : 'Follow-up Date'}
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isRtl ? 'وصف المشروع ونطاق العمل' : 'Project Scope & Description'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isRtl ? 'تفاصيل الوجبات، المواعيد، عدد الورديات، واشتراطات النقل...' : 'Scope details, meal delivery times, shifts...'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none resize-none"
            />
          </div>

          {/* Notes & Attachments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'ملاحظات الإدارة' : 'Internal Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRtl ? 'ملاحظات وتوجيهات خاصة' : 'Special remarks'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isRtl ? 'المرفقات (مفصولة بفاصلة)' : 'Attachments'}
              </label>
              <input
                type="text"
                value={attachmentsText}
                onChange={(e) => setAttachmentsText(e.target.value)}
                placeholder="كراسة_الشروط.pdf, العرض_الفني.pdf"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#62339A] outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold shadow-md shadow-[#62339A]/25 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'حفظ المشروع وإدراجه' : 'Save Project Opportunity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
