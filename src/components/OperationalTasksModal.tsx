import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  ClipboardList,
  Database,
} from 'lucide-react';

export interface LocalTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updatedAt: string;
}

const LOCAL_STORAGE_KEY = 'baset_catering_operational_tasks_v1';

const DEFAULT_LOCAL_TASKS: LocalTaskItem[] = [
  {
    id: 'task-1',
    title: 'توريد وجبات مطبخ بيت العيلة (15 صنف مسعر ومختوم)',
    notes: 'التسليم في تمام الساعة 1:30 ظهراً — تعبئة حرارية معقمة مع فواتير ضريبية معتمدة لشركات الإعاشة.',
    status: 'needsAction',
    due: new Date(Date.now() + 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'مطابقة فواتير الإعاشة الشهرية ومؤشرات الوفورات المالية',
    notes: 'مراجعة نسب الهدر و10 مؤشرات حقيقية لحسابات التكلفة والوفورات الموثقة للعميل.',
    status: 'needsAction',
    due: new Date(Date.now() + 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'تجهيز وتوزيع كراتين العائلة الغذائية ومستلزمات التموين',
    notes: 'فحص التعبئة ومطابقة عدد الطرود لخط السير مع تسليم إيصالات الاستلام الرقمية.',
    status: 'completed',
    due: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'متابعة توريدات كبدة الجمل وأطباق الكترنج والوجبات الساخنة',
    notes: 'فحص الجودة ودرجة الحرارة لسيارات النقل المبردة قبل خروجها للمواقع الصناعية.',
    status: 'needsAction',
    due: new Date(Date.now() + 259200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface OperationalTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
  initialTaskTitle?: string;
  initialTaskNotes?: string;
}

export const OperationalTasksModal: React.FC<OperationalTasksModalProps> = ({
  isOpen,
  onClose,
  isRtl = true,
  initialTaskTitle,
  initialTaskNotes,
}) => {
  const [tasks, setTasks] = useState<LocalTaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_LOCAL_TASKS;
  });

  const [newTitle, setNewTitle] = useState(initialTaskTitle || '');
  const [newNotes, setNewNotes] = useState(initialTaskNotes || '');
  const [newDue, setNewDue] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'complete' | 'uncomplete' | 'delete';
    task: LocalTaskItem | null;
  }>({
    isOpen: false,
    type: 'complete',
    task: null,
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore storage errors
    }
  }, [tasks]);

  useEffect(() => {
    if (initialTaskTitle) setNewTitle(initialTaskTitle);
    if (initialTaskNotes) setNewNotes(initialTaskNotes);
  }, [initialTaskTitle, initialTaskNotes]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created: LocalTaskItem = {
      id: `op-task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      due: newDue ? new Date(newDue).toISOString() : undefined,
      status: 'needsAction',
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [created, ...prev]);
    setNewTitle('');
    setNewNotes('');
    setNewDue('');
  };

  const requestCompleteToggle = (task: LocalTaskItem) => {
    setConfirmModal({
      isOpen: true,
      type: task.status === 'completed' ? 'uncomplete' : 'complete',
      task,
    });
  };

  const requestDelete = (task: LocalTaskItem) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      task,
    });
  };

  const handleExecuteConfirmedMutation = () => {
    if (!confirmModal.task) return;
    const task = confirmModal.task;
    const actionType = confirmModal.type;
    setConfirmModal({ isOpen: false, type: 'complete', task: null });

    if (actionType === 'delete') {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } else {
      const nextStatus = actionType === 'complete' ? 'completed' : 'needsAction';
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t
        )
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1A1325] rounded-3xl shadow-2xl border border-slate-200 dark:border-purple-900/40 overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-purple-900/30 flex items-center justify-between bg-gradient-to-r from-purple-50/70 to-amber-50/30 dark:from-purple-950/40 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#62339A] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {isRtl ? 'إدارة مهام تشغيل وتوريد الإعاشة' : 'Catering Operations & Dispatch Tasks'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>{isRtl ? 'حفظ محلي فوري' : 'Local Active'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-purple-300/70">
                {isRtl
                  ? 'متابعة طلبات التوريد، طهي بيت العيلة، ومهام الإعاشة اليومية داخل باسط'
                  : 'Track catering orders, central kitchen batches & daily logistics tasks'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Add New Task Form */}
          <form
            onSubmit={handleAddTask}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-900/40 space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#62339A]" />
                <span>{isRtl ? 'إضافة مهمة تشغيلية جديدة' : 'Add Operational Task'}</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle('توريد وجبات مطبخ بيت العيلة (15 صنف مسعر)');
                    setNewNotes('التسليم في تمام الساعة 1:30 ظهراً — تعبئة حرارية معقمة مع فواتير ضريبية معتمدة.');
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#62339A] dark:text-purple-300 hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  {isRtl ? '+ توريد بيت العيلة' : '+ Bait Al-Eila'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle('مطابقة فواتير الإعاشة الشهرية للشركات');
                    setNewNotes('مراجعة نسب الهدر و10 مؤشرات حقيقية لحسابات التكلفة والوفورات.');
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {isRtl ? '+ مطابقة الفواتير' : '+ Audit Invoice'}
                </button>
              </div>
            </div>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={isRtl ? 'عنوان المهمة (مثال: تجهيز 200 وجبة لمصنع الأغذية)' : 'Task title...'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-purple-900/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#62339A]"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={isRtl ? 'ملاحظات وتفاصيل التوريد، جهة الاتصال، العنوان...' : 'Notes, dispatch details, contact...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-purple-900/50 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-purple-900/50 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#62339A] to-[#A34FE8] text-white text-xs font-bold shadow-md hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'حفظ في مهام التشغيل' : 'Add Task'}</span>
              </button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>{isRtl ? `المهام الحالية (${tasks.length})` : `Current Tasks (${tasks.length})`}</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>{isRtl ? 'محفوظة محلياً وآمنة' : 'Stored locally in browser'}</span>
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-purple-950/20 text-slate-400 text-xs">
                {isRtl
                  ? 'لا توجد مهام تشغيلية حالياً. أضف مهمتك الأولى بالأعلى.'
                  : 'No operational tasks yet.'}
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isCompleted
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-purple-900/30 hover:border-purple-300 shadow-sm'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => requestCompleteToggle(task)}
                        className="mt-0.5 text-slate-400 hover:text-[#62339A] dark:hover:text-[#A34FE8] transition-colors shrink-0 cursor-pointer"
                        title={isCompleted ? (isRtl ? 'إعادة المهمة' : 'Reopen') : isRtl ? 'اكتمال المهمة' : 'Complete'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h6
                          className={`text-xs font-bold ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </h6>
                        {task.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-pre-wrap">
                            {task.notes}
                          </p>
                        )}
                        {task.due && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 mt-1 font-semibold">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.due).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => requestDelete(task)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 cursor-pointer"
                        title={isRtl ? 'حذف المهمة' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-purple-900/30 bg-slate-50 dark:bg-purple-950/20 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            {isRtl ? 'إدارة المهام التشغيلية المحلية — باسط' : 'BASIT Local Operational Task Manager'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-purple-200 font-bold hover:bg-slate-300 transition-colors cursor-pointer"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* Confirmation Dialog */}
        {confirmModal.isOpen && confirmModal.task && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-purple-900 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    confirmModal.type === 'delete'
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  {confirmModal.type === 'delete' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {confirmModal.type === 'delete'
                      ? isRtl
                        ? 'تأكيد حذف المهمة التشغيلية'
                        : 'Confirm Task Deletion'
                      : confirmModal.type === 'complete'
                      ? isRtl
                        ? 'تأكيد اكتمال المهمة'
                        : 'Mark Task as Completed'
                      : isRtl
                      ? 'إعادة فتح المهمة'
                      : 'Reopen Task'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isRtl
                      ? 'سيتم تحديث حالة المهمة فوراً في قائمة التشغيل المحلية.'
                      : 'This will immediately update the task in local storage.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                "{confirmModal.task.title}"
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ isOpen: false, type: 'complete', task: null })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleExecuteConfirmedMutation}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                    confirmModal.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {confirmModal.type === 'delete'
                    ? isRtl
                      ? 'نعم، احذف المهمة'
                      : 'Yes, Delete'
                    : isRtl
                    ? 'نعم، قم بالتأكيد'
                    : 'Yes, Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
