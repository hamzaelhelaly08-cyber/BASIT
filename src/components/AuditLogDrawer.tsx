import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  PlusCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AuditLogEntry } from '../types/dashboard';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
  onClearLogs: () => void;
  onAddTestLog?: (entry: AuditLogEntry) => void;
  onDeleteLog?: (id: string) => void;
  onRestoreLogs?: () => void;
  isRtl: boolean;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onAddTestLog,
  onDeleteLog,
  onRestoreLogs,
  isRtl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSeverity =
        severityFilter === 'all' || log.severity === severityFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.actionAr.toLowerCase().includes(q) ||
        log.actionEn.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.moduleName.toLowerCase().includes(q);
      return matchesSeverity && matchesSearch;
    });
  }, [logs, severityFilter, searchQuery]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCreateSampleLog = () => {
    if (onAddTestLog) {
      const timestamp = new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newEntry: AuditLogEntry = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: `${isRtl ? 'اليوم' : 'Today'} ${timestamp}`,
        userRole: 'ops_director',
        userName: isRtl ? 'الإدارة التنفيذية' : 'Executive Ops',
        moduleName: isRtl ? 'حوكمة النظام وسجل التدقيق' : 'System Governance & Audit',
        actionAr: 'تسجيل عملية تدقيق نظامية فورية',
        actionEn: 'Dynamic audit entry logged in real-time',
        details: isRtl
          ? 'تم التحقق من سلامة الأذونات وحالة السيرفر وتفعيل عناصر الحوكمة بنجاح.'
          : 'Verified permission integrity and confirmed live governance reactivity.',
        severity: 'info',
      };
      onAddTestLog(newEntry);
      setExpandedLogId(newEntry.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} max-w-full flex ${isRtl ? 'pr-0 pl-4 sm:pl-10' : 'pl-0 pr-4 sm:pr-10'}`}>
        <div
          className="w-screen max-w-lg bg-slate-900 border-x border-slate-800 text-white shadow-2xl flex flex-col h-full"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#62339A]/30 border border-[#FFC928]/40 text-[#FFC928] flex items-center justify-center shadow-md">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'سجل التدقيق والعمليات (Audit Log)' : 'System Audit Trail'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFC928] text-slate-950 font-black text-[10px]">
                    {logs.length}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isRtl ? 'سجل تدقيق تفاعلي موثق للأذونات والتغييرات' : 'Interactive audit log with inspection & controls'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions & Search Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 space-y-2.5 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className={`w-4 h-4 text-slate-400 absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث في السجلات (رقم القيد، الإجراء، المسؤول)...' : 'Search logs by ID, action, actor...'}
                className={`w-full py-2 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFC928]`}
              />
            </div>

            {/* Severity Filters & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {[
                  { id: 'all' as const, labelAr: 'الكل', labelEn: 'All' },
                  { id: 'critical' as const, labelAr: 'حرجة', labelEn: 'Critical' },
                  { id: 'warning' as const, labelAr: 'تحذير', labelEn: 'Warning' },
                  { id: 'info' as const, labelAr: 'معلومات', labelEn: 'Info' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSeverityFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      severityFilter === f.id
                        ? 'bg-[#FFC928] text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {isRtl ? f.labelAr : f.labelEn}
                  </button>
                ))}
              </div>

              {onAddTestLog && (
                <button
                  type="button"
                  onClick={handleCreateSampleLog}
                  className="px-2.5 py-1 rounded-lg bg-[#62339A] hover:bg-[#7E3FD6] text-white text-[11px] font-black flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#FFC928]" />
                  <span>{isRtl ? 'إضافة قيد تجريبي' : 'Add Dynamic Log'}</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-500 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-400">
                  {logs.length === 0
                    ? isRtl
                      ? 'تم تفريغ سجل التدقيق بالكامل.'
                      : 'Audit log is currently empty.'
                    : isRtl
                    ? 'لا توجد نتائج مطابقة لبحثك الحالي.'
                    : 'No logs match your filter criteria.'}
                </div>
                {logs.length === 0 && onRestoreLogs && (
                  <button
                    type="button"
                    onClick={onRestoreLogs}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-[#FFC928] flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'استعادة السجلات الافتراضية' : 'Restore Default Logs'}</span>
                  </button>
                )}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const isCritical = log.severity === 'critical';
                const isWarning = log.severity === 'warning';

                const badgeBg = isCritical
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : isWarning
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                return (
                  <div
                    key={log.id}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? 'bg-slate-800/90 border-[#FFC928]/60 shadow-lg'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    {/* Log Card Clickable Trigger */}
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-3.5 flex flex-col gap-2 cursor-pointer select-none"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-black text-[#FFC928] bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                            {log.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badgeBg}`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.timestamp}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 ms-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 ms-1" />
                          )}
                        </div>
                      </div>

                      <div className="font-black text-sm text-white">
                        {isRtl ? log.actionAr : log.actionEn}
                      </div>

                      <p className={`text-slate-300 text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {log.details}
                      </p>

                      <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-bold">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.userName}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/60 text-slate-300 font-bold border border-slate-700/50">
                          {log.moduleName}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Detail Tray with Active Controls */}
                    {isExpanded && (
                      <div className="p-3.5 pt-0 border-t border-slate-700/60 mt-1 space-y-3 bg-slate-900/40 rounded-b-2xl">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">{isRtl ? 'الرقم المرجعي للقيد:' : 'Log Identifier:'}</span>
                            <span className="font-mono text-[#FFC928] font-bold">{log.id}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">{isRtl ? 'المستخدم / الدور:' : 'Actor / Role:'}</span>
                            <span className="font-bold text-white">{log.userName} ({log.userRole})</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">{isRtl ? 'النظام التابع:' : 'Target Module:'}</span>
                            <span className="font-bold text-white">{log.moduleName}</span>
                          </div>
                          <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                            <span className="font-bold text-slate-400 block mb-0.5">{isRtl ? 'التفاصيل الكاملة:' : 'Full Log Details:'}</span>
                            <span>{log.details}</span>
                          </div>
                        </div>

                        {/* Interactive Action Buttons per Item */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(log.id, `id_${log.id}`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedId === `id_${log.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedId === `id_${log.id}` ? (isRtl ? 'تم النسخ!' : 'Copied') : (isRtl ? 'نسخ رقم القيد' : 'Copy ID')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(`${log.id} - ${log.actionAr} - ${log.details}`, `full_${log.id}`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedId === `full_${log.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                              <span>{copiedId === `full_${log.id}` ? (isRtl ? 'تم نسخ التفاصيل' : 'Copied') : (isRtl ? 'نسخ النص' : 'Copy Text')}</span>
                            </button>
                          </div>

                          {onDeleteLog && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteLog(log.id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'حذف هذا القيد' : 'Delete'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                {logs.length} {isRtl ? 'عمليات موثقة بالسجل' : 'events recorded'}
              </span>
              {onRestoreLogs && logs.length !== 4 && (
                <button
                  type="button"
                  onClick={onRestoreLogs}
                  className="text-[11px] text-[#FFC928] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isRtl ? 'استعادة السجلات' : 'Restore'}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors ${
                logs.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{isRtl ? 'مسح سجل التدقيق بالكامل' : 'Clear All Audit Logs'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
