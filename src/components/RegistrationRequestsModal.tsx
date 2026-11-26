import React, { useState } from 'react';
import { 
  AccountRegistrationRequest, 
  RoleProfile 
} from '../types/dashboard';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Send
} from 'lucide-react';

interface RegistrationRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: AccountRegistrationRequest[];
  currentRole: RoleProfile;
  isRtl: boolean;
  onApproveRequest: (requestId: string, tempPassword: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onRequestMoreInfo: (requestId: string, note: string) => void;
}

export const RegistrationRequestsModal: React.FC<RegistrationRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  currentRole,
  isRtl,
  onApproveRequest,
  onRejectRequest,
  onRequestMoreInfo
}) => {
  const [selectedRequest, setSelectedRequest] = useState<AccountRegistrationRequest | null>(requests[0] || null);
  const [generatedTempPassword, setGeneratedTempPassword] = useState<string>('National@2026');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isRequestingInfo, setIsRequestingInfo] = useState<boolean>(false);
  const [infoNote, setInfoNote] = useState<string>('');
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedTempPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const pendingCount = requests.filter(r => r.status === 'بانتظار المراجعة').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-[#4A2378]/70 border-b border-[#62339A]/35 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#62339A]/10 border border-[#62339A]/35 flex items-center justify-center text-[#FFC928]">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-[#62339A]/20 text-[#FFC928] border border-[#62339A]/30">
                  لوحة مراجعة الحسابات الجديدة
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {pendingCount} بانتظار المراجعة
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                طلبات تسجيل الحسابات التعاقدية للشركات والمصانع
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[460px]">
          
          {/* Requests List (4 cols) */}
          <div className="md:col-span-4 bg-slate-950/80 border-b md:border-b-0 md:border-l border-slate-800 p-4 overflow-y-auto space-y-2">
            <h3 className="text-xs font-bold text-slate-400 mb-2">قائمة الطلبات الواردة</h3>
            {requests.map((req) => {
              const isSelected = selectedRequest?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => { setSelectedRequest(req); setIsRejecting(false); setIsRequestingInfo(false); }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#62339A]/20 border-[#62339A] shadow-md shadow-[#62339A]/25'
                      : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400">{req.id}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      req.status === 'بانتظار المراجعة' 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : req.status === 'تمت الموافقة والتفعيل'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5 truncate">{req.companyName}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{req.fullName} · {req.jobTitle}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{req.city}</span>
                    <span>{req.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details & Actions (8 cols) */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-5 bg-slate-900">
            {selectedRequest ? (
              <div className="space-y-5">
                
                {/* Applicant Summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-white">{selectedRequest.companyName}</h3>
                    <p className="text-xs text-[#FFC928] font-bold mt-0.5">{selectedRequest.industryType}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedRequest.companyAddress} — {selectedRequest.city}</span>
                    </p>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-xl font-bold border ${
                    selectedRequest.status === 'بانتظار المراجعة'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : selectedRequest.status === 'تمت الموافقة والتفعيل'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>

                {/* Contact Person Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">المفوض ومقدم الطلب</span>
                    <span className="font-bold text-white text-sm">{selectedRequest.fullName}</span>
                    <span className="text-slate-400 block">{selectedRequest.jobTitle}</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold block">بيانات الاتصال المؤسسي</span>
                    <div className="flex items-center gap-1.5 text-white font-medium">
                      <Phone className="w-3.5 h-3.5 text-[#FFC928]" />
                      <span>{selectedRequest.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-[#FFC928]" />
                      <span>{selectedRequest.workEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Purpose of Account */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <span className="text-slate-400 font-bold block">الغرض من طلب الحساب والاحتياجات التوريدية</span>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {selectedRequest.requestReason}
                  </p>
                  {selectedRequest.attachedDocName && (
                    <div className="pt-2 mt-2 border-t border-slate-800 flex items-center gap-2 text-[#FFC928] font-semibold">
                      <FileText className="w-4 h-4" />
                      <span>مستند مرفق: {selectedRequest.attachedDocName}</span>
                    </div>
                  )}
                </div>

                {/* Status-specific actions */}
                {selectedRequest.status === 'بانتظار المراجعة' ? (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-[#62339A]/35 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#FFC928]" />
                        <span>قرار المسؤول الأعلى (م/ مصطفى شعبان)</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">إجراء مشفر ومسجل بالـ Audit Log</span>
                    </div>

                    {!isRejecting && !isRequestingInfo && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] text-slate-400 block font-semibold">كلمة المرور المؤقتة التي ستصدر للعميل:</span>
                            <span className="font-mono font-bold text-[#FFC928] text-sm">{generatedTempPassword}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedPass ? 'تم النسخ!' : 'نسخ'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                          <button
                            onClick={() => onApproveRequest(selectedRequest.id, generatedTempPassword)}
                            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>قبول وتفعيل الحساب</span>
                          </button>

                          <button
                            onClick={() => setIsRequestingInfo(true)}
                            className="py-2.5 px-4 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>طلب استكمال بيانات</span>
                          </button>

                          <button
                            onClick={() => setIsRejecting(true)}
                            className="py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>رفض الطلب</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reject reason input */}
                    {isRejecting && (
                      <div className="space-y-3 p-3 bg-red-950/30 border border-red-500/40 rounded-xl">
                        <label className="block text-xs font-bold text-red-300">سبب رفض طلب التسجيل:</label>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="مثال: بيانات المنشأة غير مطابقة للسجل أو السعة غير متوفرة..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsRejecting(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => {
                              onRejectRequest(selectedRequest.id, rejectReason || 'غير مطابق للاشتراطات');
                              setIsRejecting(false);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                          >
                            تأكيد الرفض
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Request info input */}
                    {isRequestingInfo && (
                      <div className="space-y-3 p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl">
                        <label className="block text-xs font-bold text-amber-300">البيانات المطلوب استكمالها من العميل:</label>
                        <input
                          type="text"
                          value={infoNote}
                          onChange={(e) => setInfoNote(e.target.value)}
                          placeholder="مثال: يرجى إرفاق صورة السجل التجاري وصورة تفويض الشركة..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsRequestingInfo(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => {
                              onRequestMoreInfo(selectedRequest.id, infoNote || 'مطلوب إرفاق السجل');
                              setIsRequestingInfo(false);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                          >
                            إرسال الطلب
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم اتخاذ القرار في هذا الطلب بواسطة: {selectedRequest.reviewedBy || 'م/ مصطفى شعبان'}</span>
                    </div>
                    {selectedRequest.tempPasswordIssued && (
                      <p className="text-slate-300">
                        كلمة المرور المؤقتة الصادرة: <span className="font-mono text-[#FFC928] font-bold">{selectedRequest.tempPasswordIssued}</span>
                      </p>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                حدد طلباً من القائمة الجانبية لعرض التفاصيل
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
