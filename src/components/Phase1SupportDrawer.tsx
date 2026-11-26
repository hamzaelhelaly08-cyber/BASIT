import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  X,
  Send,
  CheckCircle2,
  Move,
  FileText,
  ChefHat,
  Factory,
  Paperclip,
  Star,
  Clock,
  Sparkles,
  Bot,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { LanguageCode, PHASE1_I18N } from '../data/phase1Data';

export type SupportTicketCategory =
  | 'general'
  | 'meal_issue'
  | 'coupon_issue'
  | 'login'
  | 'new_service_request';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportMessageEntry {
  id: string;
  senderName: string;
  text: string;
  createdAt: string;
  category?: SupportTicketCategory;
  status?: SupportTicketStatus;
  attachmentName?: string;
  attachmentPreviewUrl?: string;
  rating?: number;
}

interface AiChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface Phase1SupportDrawerProps {
  lang: LanguageCode;
  userRole?: string;
  messages: SupportMessageEntry[];
  onSendMessage: (msg: SupportMessageEntry) => void;
  onUpdateMessage?: (id: string, patch: Partial<SupportMessageEntry>) => void;
  onQuickNavigate?: (section: string) => void;
}

const TICKET_CATEGORIES: { id: SupportTicketCategory; ar: string; en: string }[] = [
  { id: 'general', ar: 'استفسار عام', en: 'General Inquiry' },
  { id: 'meal_issue', ar: 'مشكلة وجبة / جودة', en: 'Meal Issue' },
  { id: 'coupon_issue', ar: 'كوبون / رمز QR', en: 'Coupon / QR' },
  { id: 'login', ar: 'حساب / تسجيل دخول', en: 'Login / Account' },
  { id: 'new_service_request', ar: 'طلب خدمة جديدة', en: 'New Service' },
];

export const Phase1SupportDrawer: React.FC<Phase1SupportDrawerProps> = ({
  lang,
  userRole = 'visitor',
  messages,
  onSendMessage,
  onUpdateMessage,
  onQuickNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'ai_assistant' | 'tickets'>('ai_assistant');
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('general');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState('');

  // Multi-turn Gemini AI Assistant State
  const [aiInput, setAiInput] = useState('');
  const [aiHistory, setAiHistory] = useState<AiChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiScrollRef = useRef<HTMLDivElement | null>(null);

  const isRtl = lang === 'ar';
  const t = PHASE1_I18N[lang];

  const getMobileFrameBounds = () => {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 390;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const frameW = Math.min(winW, 430);
    const frameLeft = Math.max(0, (winW - frameW) / 2);
    const frameRight = frameLeft + frameW;
    return {
      minX: frameLeft + 12,
      maxX: Math.max(frameLeft + 12, frameRight - 56),
      minY: 68,
      maxY: Math.max(76, winH - 140),
    };
  };

  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const bounds = getMobileFrameBounds();
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      x: bounds.maxX,
      y: Math.min(Math.max(76, winH - 196), bounds.maxY),
    };
  });

  const dragStateRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });

  useEffect(() => {
    const onResize = () => {
      const bounds = getMobileFrameBounds();
      setPos((prev) => ({
        x: Math.min(Math.max(bounds.minX, prev.x), bounds.maxX),
        y: Math.min(Math.max(bounds.minY, prev.y), bounds.maxY),
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiHistory, aiLoading]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current.dragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragStateRef.current.moved = true;
    }
    const bounds = getMobileFrameBounds();
    const nextX = Math.min(Math.max(bounds.minX, dragStateRef.current.origX + dx), bounds.maxX);
    const nextY = Math.min(Math.max(bounds.minY, dragStateRef.current.origY + dy), bounds.maxY);
    setPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const wasTap = !dragStateRef.current.moved;
    dragStateRef.current.dragging = false;
    if (wasTap) {
      setIsOpen((prev) => !prev);
    }
  };

  const sendAiPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean || aiLoading) return;
    setAiError(null);
    const historySnapshot = [...aiHistory];
    setAiHistory((prev) => [...prev, { role: 'user', text: clean }]);
    setAiInput('');
    setAiLoading(true);
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history: historySnapshot,
          lang,
          userRole,
        }),
      });
      const data = (await resp.json()) as {
        ok?: boolean;
        reply?: string;
        messageAr?: string;
        messageEn?: string;
      };
      if (!resp.ok || !data.ok || !data.reply) {
        setAiError(
          isRtl
            ? data.messageAr || 'تعذر الاتصال بالمساعد الذكي حالياً.'
            : data.messageEn || 'Assistant request failed.'
        );
        return;
      }
      setAiHistory((prev) => [...prev, { role: 'model', text: data.reply || '' }]);
    } catch {
      setAiError(
        isRtl
          ? 'تعذر الوصول للخادم لإتمام المحادثة.'
          : 'Network error communicating with assistant.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachmentPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    onSendMessage({
      id: `TKT-${Date.now().toString().slice(-5)}`,
      senderName: senderName.trim() || (isRtl ? 'زائر المنصة' : 'Platform Visitor'),
      text: messageText.trim(),
      createdAt: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      category,
      status: 'open',
      attachmentName: attachmentName || undefined,
      attachmentPreviewUrl: attachmentPreviewUrl || undefined,
    });
    setMessageText('');
    setAttachmentName('');
    setAttachmentPreviewUrl('');
  };

  const getNextStatus = (cur?: SupportTicketStatus): SupportTicketStatus => {
    if (!cur || cur === 'open') return 'in_progress';
    if (cur === 'in_progress') return 'resolved';
    return 'open';
  };

  const getStatusDisplay = (status?: SupportTicketStatus) => {
    const st = status || 'open';
    if (st === 'resolved') {
      return {
        label: isRtl ? 'تم الحل' : 'Resolved',
        cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        icon: <CheckCircle2 className="w-3 h-3" />,
      };
    }
    if (st === 'in_progress') {
      return {
        label: isRtl ? 'قيد المعالجة' : 'In Progress',
        cls: 'bg-[#FFC928]/25 text-[#4A2378] dark:text-[#FFC928]',
        icon: <Clock className="w-3 h-3" />,
      };
    }
    return {
      label: isRtl ? 'جديد' : 'Open',
      cls: 'bg-[#F5F0FF] text-[#62339A] dark:bg-[#2D2145] dark:text-[#FFC928]',
      icon: <Sparkles className="w-3 h-3" />,
    };
  };

  const getCategoryLabel = (cat?: SupportTicketCategory) => {
    const found = TICKET_CATEGORIES.find((c) => c.id === (cat || 'general'));
    return found ? (isRtl ? found.ar : found.en) : cat || '';
  };

  const quickPrompts = isRtl
    ? ['اطلب عرض سعر للمصانع', 'مناطق تغطية المطابخ', 'ما هي المنيوهات الـ 8؟']
    : ['Factory catering quote', 'Kitchen coverage areas', 'List the 8 menus'];

  return (
    <>
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          touchAction: 'none',
          background: 'linear-gradient(145deg, #4C1D95 0%, #3B0764 60%, #581C87 100%)',
          boxShadow:
            '0 10px 22px -6px rgba(59, 7, 100, 0.55), inset 0 2px 4px rgba(255, 213, 79, 0.35)',
        }}
        aria-label={t.supportFloatingTitle}
        title={isRtl ? 'اسحب أيقونة الدعم لأي مكان أو اضغط للفتح' : 'Drag support button or tap to open'}
        className={`fixed ${isOpen ? 'z-50' : 'z-30'} w-11 h-11 rounded-full text-white flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none transition-transform hover:scale-105 ring-2 ring-[#FFD54F]`}
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <>
            <Headphones className="w-4 h-4 text-[#FFD54F]" />
            <span className="text-[7px] font-black tracking-tight leading-none mt-0.5 flex items-center gap-0.5">
              <Move className="w-2 h-2" />
              <span>{isRtl ? 'دعم' : 'HELP'}</span>
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 max-w-[430px] w-full mx-auto px-3 pointer-events-none flex justify-end">
          <div className="pointer-events-auto w-full rounded-3xl bg-[#FFFBEB] border border-[#4C1D95]/25 shadow-2xl overflow-hidden flex flex-col max-h-[min(78vh,620px)]">
            <div className="p-3.5 bg-gradient-to-r from-[#3B0764] via-[#4C1D95] to-[#581C87] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFD54F] text-[#3B0764] flex items-center justify-center">
                {activeMode === 'ai_assistant' ? <Bot className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-black">{t.supportFloatingTitle}</h4>
                <p className="text-[10px] text-[#EDE9FE]">
                  {activeMode === 'ai_assistant'
                    ? isRtl
                      ? 'المساعد الذكي لإعاشة باسط'
                      : 'BASIT AI Catering Concierge'
                    : isRtl
                      ? 'تذاكر الدعم والشكاوى والمتابعة'
                      : 'Direct Support & Ticket Desk'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={isRtl ? 'إغلاق الدعم' : 'Close support'}
              className="min-h-[44px] min-w-[44px] text-white hover:text-[#FFD54F] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dual Mode Switcher: AI Assistant vs Support Tickets */}
          <div className="p-2 bg-[#EDE9FE] border-b border-[#4C1D95]/15 grid grid-cols-2 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode('ai_assistant')}
              className={`min-h-[40px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                activeMode === 'ai_assistant'
                  ? 'bg-[#4C1D95] text-[#FFD54F] shadow-xs'
                  : 'bg-[#FFFBEB] text-[#3B0764]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#FFD54F]" />
              <span>{isRtl ? 'المساعد الذكي' : 'AI Assistant'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('tickets')}
              className={`min-h-[40px] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                activeMode === 'tickets'
                  ? 'bg-[#4C1D95] text-[#FFD54F] shadow-xs'
                  : 'bg-[#FFFBEB] text-[#3B0764]'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-[#FFD54F]" />
              <span>{isRtl ? `تذاكر الدعم (${messages.length})` : `Tickets (${messages.length})`}</span>
            </button>
          </div>

          {activeMode === 'ai_assistant' ? (
            <>
              <div
                ref={aiScrollRef}
                className="p-3.5 flex-1 overflow-y-auto space-y-2.5 bg-gradient-to-b from-[#FEF9C3]/75 to-[#EDE9FE]"
              >
                <div className="p-3 rounded-2xl bg-white dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-[11px] text-[#292333] dark:text-white leading-relaxed font-semibold space-y-2">
                  <p>
                    {isRtl
                      ? 'أهلاً بك في المساعد الذكي لمنصة باسط! اسألني عن المطابخ المركزية، المنيوهات الـ 8، عروض الأسعار والتست للمصانع والشركات.'
                      : 'Welcome to BASIT AI Assistant! Ask about central kitchens, the 8 menus, or factory quotes.'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {quickPrompts.map((qp) => (
                      <button
                        key={qp}
                        type="button"
                        disabled={aiLoading}
                        onClick={() => void sendAiPrompt(qp)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#F5F0FF] dark:bg-[#2A1C42] border border-[#62339A]/25 text-[10px] font-black text-[#4A2378] dark:text-[#FFC928] cursor-pointer"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>

                {aiHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      item.role === 'user'
                        ? 'bg-[#62339A] text-white ms-6 font-bold'
                        : 'bg-white dark:bg-[#1F172F] text-[#292333] dark:text-white border border-[#E6E0F5] dark:border-[#62339A]/30 me-4 font-semibold'
                    }`}
                  >
                    {item.text}
                  </div>
                ))}

                {aiLoading && (
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/30 text-xs font-bold text-[#62339A] dark:text-[#FFC928] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? 'جاري تجهيز الرد...' : 'Thinking...'}</span>
                  </div>
                )}

                {aiError && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700 text-[11px] font-bold text-rose-700 dark:text-rose-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendAiPrompt(aiInput);
                }}
                className="p-3 bg-white dark:bg-[#140F1F] border-t border-[#E6E0F5] dark:border-[#62339A]/30 flex items-center gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  required
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={isRtl ? 'اكتب سؤالك لمساعد باسط...' : 'Ask BASIT AI...'}
                  className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  aria-label={t.supportSend}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-[#62339A] hover:bg-[#4A2378] disabled:opacity-60 text-white flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4 text-[#FFC928]" />
                </button>
              </form>
            </>
          ) : (
            <>
              {onQuickNavigate && (
                <div className="px-3.5 py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-[#F7F5FA] dark:bg-[#1F172F] border-b border-[#E6E0F5] dark:border-[#62339A]/30 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onQuickNavigate('quotation');
                      setIsOpen(false);
                    }}
                    className="min-h-[40px] shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-[#140F1F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-[11px] font-bold text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#62339A] dark:text-[#FFC928]" />
                    <span>{isRtl ? 'عرض سعر' : 'Quote'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickNavigate('kitchens');
                      setIsOpen(false);
                    }}
                    className="min-h-[40px] shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-[#140F1F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-[11px] font-bold text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-[#62339A] dark:text-[#FFC928]" />
                    <span>{t.nav.kitchens}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onQuickNavigate('fayd_merchant_workspace');
                      setIsOpen(false);
                    }}
                    className="min-h-[40px] shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-[#140F1F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-[11px] font-bold text-[#292333] dark:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Factory className="w-3.5 h-3.5 text-[#62339A] dark:text-[#FFC928]" />
                    <span>{isRtl ? 'بوابة الشركاء' : 'Partners'}</span>
                  </button>
                </div>
              )}

              <div className="p-3.5 flex-1 overflow-y-auto space-y-2.5 bg-[#F7F5FA] dark:bg-[#110D1B]">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-[11px] text-[#292333] dark:text-white leading-relaxed font-medium">
                  {t.supportWelcome}
                </div>

                {messages.map((m) => {
                  const stMeta = getStatusDisplay(m.status);
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-white dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/30 text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold">
                        <span className="text-[#62339A] dark:text-[#FFC928]">
                          {m.senderName} ·{' '}
                          <span dir="ltr" className="tabular-nums">
                            {m.id}
                          </span>
                        </span>
                        <span dir="ltr" className="text-[#64748B] dark:text-[#C4B5FD] tabular-nums">
                          {m.createdAt}
                        </span>
                      </div>

                      {m.category && (
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-[#F5F0FF] dark:bg-[#140F1F] text-[10px] font-bold text-[#62339A] dark:text-[#FFC928]">
                          {getCategoryLabel(m.category)}
                        </span>
                      )}

                      <p className="text-[#292333] dark:text-white leading-relaxed">{m.text}</p>

                      {m.attachmentPreviewUrl && (
                        <img
                          src={m.attachmentPreviewUrl}
                          alt={m.attachmentName || 'Attachment'}
                          className="w-full max-h-28 object-cover rounded-xl border border-[#E6E0F5]"
                        />
                      )}
                      {m.attachmentName && !m.attachmentPreviewUrl && (
                        <div className="text-[10px] font-bold text-[#64748B]">
                          📎 {m.attachmentName}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E6E0F5] dark:border-[#62339A]/20">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateMessage?.(m.id, { status: getNextStatus(m.status) })
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer ${stMeta.cls}`}
                          title={isRtl ? 'اضغط لتحديث حالة التذكرة' : 'Tap to cycle ticket status'}
                        >
                          {stMeta.icon}
                          <span>{stMeta.label}</span>
                        </button>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => onUpdateMessage?.(m.id, { rating: star })}
                              aria-label={`${star} stars`}
                              className="p-1 cursor-pointer"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  (m.rating || 0) >= star
                                    ? 'fill-[#FFC928] text-[#FFC928]'
                                    : 'text-[#E6E0F5] dark:text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-3 bg-white dark:bg-[#140F1F] border-t border-[#E6E0F5] dark:border-[#62339A]/30 space-y-2 shrink-0"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={isRtl ? 'الاسم أو الجهة' : 'Name (optional)'}
                    className="min-h-[44px] w-full px-3 py-2 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
                    className="min-h-[44px] w-full px-2.5 py-2 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-[11px] font-bold text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  >
                    {TICKET_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isRtl ? c.ar : c.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="min-h-[44px] min-w-[44px] rounded-xl bg-[#F5F0FF] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 flex items-center justify-center cursor-pointer text-[#62339A] dark:text-[#FFC928] shrink-0">
                    <Paperclip className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAttachmentChange}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={isRtl ? 'اكتب تفاصيل التذكرة...' : 'Write ticket details...'}
                    className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-[#F7F5FA] dark:bg-[#1F172F] border border-[#E6E0F5] dark:border-[#62339A]/35 text-xs text-[#292333] dark:text-white focus:border-[#62339A] focus:outline-none"
                  />

                  <button
                    type="submit"
                    aria-label={t.supportSend}
                    className="min-h-[44px] min-w-[44px] rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4 text-[#FFC928]" />
                  </button>
                </div>

                {attachmentName && (
                  <div className="text-[10px] font-bold text-[#62339A] dark:text-[#FFC928] flex items-center justify-between">
                    <span className="truncate">📎 {attachmentName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentName('');
                        setAttachmentPreviewUrl('');
                      }}
                      className="text-rose-600 font-black px-2 cursor-pointer"
                    >
                      {isRtl ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
          </div>
        </div>
      )}
    </>
  );
};
