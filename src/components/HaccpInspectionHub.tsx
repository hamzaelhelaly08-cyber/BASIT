import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Printer, 
  Plus, 
  Camera, 
  Calendar, 
  UserCheck 
} from 'lucide-react';

interface HaccpInspectionHubProps {
  isRtl: boolean;
  onOpenPrintReport: () => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
}

export const HaccpInspectionHub: React.FC<HaccpInspectionHubProps> = ({
  isRtl,
  onOpenPrintReport,
  onAddAuditLog
}) => {
  const [checklist, setChecklist] = useState([
    { id: 1, title: 'معايرة ثلاجات حفظ اللحوم والدواجن (+1° إلى +4° م)', status: 'passed', note: 'القراءة الحالية: +2.8° م — مطابقة' },
    { id: 2, title: 'فحص مسبار الطهي المركزي Core Probe (> +75° م)', status: 'passed', note: 'الدجاج المشوي وصل +82° م — آمن وصحي' },
    { id: 3, title: 'مسحات أسطح التقطيع الستانلس ستيل وخطوط التجهيز', status: 'passed', note: 'مسحات بيولوجية سلبية تماماً' },
    { id: 4, title: 'تعقيم عبوات وحافظات الطعام الحرارية للنقل', status: 'passed', note: 'تم الغسيل بدرجة +85° م والتجفيف الهوائي' },
    { id: 5, title: 'فحص تواريخ الإنتاج والصلاحية لزيوت القلي وخامات البقول', status: 'passed', note: 'سارية ومطابقة لاشتراطات التخزين' },
    { id: 6, title: 'النظافة الشخصية وارتداء القفازات وأغطية الرأس للعمال', status: 'passed', note: 'التزام كامل لـ 52 طاهٍ وعامل بوردية الصباح' },
  ]);

  const [newLogSuccess, setNewLogSuccess] = useState(false);

  const handleToggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'passed' ? 'warning' : 'passed' }
          : item
      )
    );
    onAddAuditLog(
      'تحديث بند تفتيش في سجل الهايجين HACCP',
      'Updated HACCP audit checklist item',
      `تم تحديث حالة البند رقم #${id} بسجل التفتيش الدوري.`
    );
  };

  const handleAddNewAuditRecord = () => {
    setNewLogSuccess(true);
    setTimeout(() => setNewLogSuccess(false), 3000);
    onAddAuditLog(
      'تسجيل فحص درجات حرارة جديد بسجل HACCP',
      'Logged new HACCP temperature calibration',
      'تم تسجيل قراءة مسابر الطهي للدفعة المسائية (+78.5° م) بنجاح.'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Prominent Large HACCP Banner - Section 13 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white border-2 border-emerald-500/40 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            
            {/* Massive Bold HACCP Emblem */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex flex-col items-center justify-center font-black text-white shadow-xl shadow-emerald-900/50 border border-emerald-300/40 shrink-0">
              <span className="text-xl tracking-tighter">HACCP</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-100">SAFETY</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  منظومة سلامة الغذاء ومراقبة الجودة
                </span>
                <span className="text-xs bg-white/10 text-slate-200 px-2 py-0.5 rounded font-mono">
                  ISO 22000 SYSTEM ALIGNED
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                الجودة والهايجين — QUALITY & HYGIENE
              </h2>
              <p className="text-xs text-emerald-100 max-w-xl font-medium mt-0.5">
                مراقبة نقاط التحكم الحرجة (CCPs) لسلسلة التبريد، درجات الطهي، والمسحات البكتيرية على مدار الـ 24 ساعة بمطابخنا المركزية الثلاثة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAddNewAuditRecord}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ تسجيل فحص حراري</span>
            </button>
            <button
              onClick={onOpenPrintReport}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تقرير HACCP</span>
            </button>
          </div>
        </div>
      </div>

      {newLogSuccess && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم تسجيل وتوثيق الفحص الصحي بسجل التدقيق الإلكتروني بنجاح.</span>
        </div>
      )}

      {/* 3 Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">سلسلة التبريد المركزية والسيارات</span>
            <div className="text-2xl font-black text-emerald-600 tabular-nums mt-0.5">+2.8° م</div>
            <span className="text-[11px] text-emerald-600 font-semibold">مطابق للحد الآمن (+1° : +4° م)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Thermometer className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">حرارة الطهي الداخلي (Core Probe)</span>
            <div className="text-2xl font-black text-[#62339A] tabular-nums mt-0.5">+78.5° م</div>
            <span className="text-[11px] text-emerald-600 font-semibold">أعلى من الحد الأدنى (+74° م)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#62339A]/10 text-[#62339A] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">المسحات البيولوجية للأسطح</span>
            <div className="text-2xl font-black text-blue-600 tabular-nums mt-0.5">0 بكتيريا</div>
            <span className="text-[11px] text-emerald-600 font-semibold">مسحات سلبية نظيفة 100%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive HACCP Inspection Checklist */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              قائمة التفتيش اليومية الصباحية المعتمدة (HACCP Checklist)
            </h3>
            <p className="text-xs text-slate-500">
              اضغط على أي بند لتغيير الحالة أو تسجيل إجراء تصحيحي
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            مسؤول الفحص: د/ ريهام السعدني · اليوم 08:30 ص
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleCheck(item.id)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between gap-3 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  item.status === 'passed' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-[11px] text-slate-500">{item.note}</div>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                item.status === 'passed' 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}>
                {item.status === 'passed' ? 'معتمد ومطابق' : 'يحتاج إعادة ضبط'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
