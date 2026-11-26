import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Sparkles } from 'lucide-react';
import { transcribeFinanceVoice, type VoiceParsedFields } from '../services/ownerFinanceService';

interface SmartVoiceMicButtonProps {
  context: string;
  fmToken?: string | null;
  onParsed: (fields: VoiceParsedFields) => void;
  onError?: (msg: string) => void;
  compact?: boolean;
  labelAr?: string;
}

export const SmartVoiceMicButton: React.FC<SmartVoiceMicButtonProps> = ({
  context,
  fmToken = null,
  onParsed,
  onError,
  compact = false,
  labelAr = 'المايك الاحترافي (إدخال صوتي ذكي)',
}) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = typeof reader.result === 'string' ? reader.result : '';
        resolve(res);
      };
      reader.onerror = () => reject(new Error('تعذر قراءة الملف الصوتي'));
      reader.readAsDataURL(blob);
    });

  const handleSpeechRecognitionFallback = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: (ev: { error?: string }) => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: (ev: { error?: string }) => void;
        onend: () => void;
        start: () => void;
      };
    };
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) {
      onError?.('المتصفح الحالي لا يدعم الميكروفون أو التسجيل الصوتي.');
      return;
    }

    const recognition = new SR();
    recognition.lang = 'ar-EG';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setRecording(true);

    recognition.onresult = async (ev) => {
      const spoken = ev.results?.[0]?.[0]?.transcript?.trim() || '';
      setRecording(false);
      if (!spoken) return;
      setProcessing(true);
      try {
        const result = await transcribeFinanceVoice({
          textTranscript: spoken,
          context,
          fmToken,
        });
        setLastTranscript(result.transcript);
        onParsed(result.parsed);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'تعذر تحليل الإدخال الصوتي.');
      } finally {
        setProcessing(false);
      }
    };

    recognition.onerror = () => {
      setRecording(false);
      onError?.('تعذر التقاط الصوت. تأكد من السماح للمتصفح باستخدام الميكروفون.');
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognition.start();
  };

  const toggleRecording = async () => {
    if (processing) return;

    if (recording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      handleSpeechRecognitionFallback();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        setRecording(false);
        stopTracks();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        if (blob.size < 200) {
          onError?.('التسجيل قصير جداً، حاول التحدث بوضوح.');
          return;
        }
        setProcessing(true);
        try {
          const base64DataUrl = await blobToBase64(blob);
          const result = await transcribeFinanceVoice({
            audioBase64: base64DataUrl,
            mimeType,
            context,
            fmToken,
          });
          setLastTranscript(result.transcript);
          onParsed(result.parsed);
        } catch (err) {
          onError?.(err instanceof Error ? err.message : 'تعذر تحويل التسجيل الصوتي إلى بيانات.');
        } finally {
          setProcessing(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch {
      stopTracks();
      handleSpeechRecognitionFallback();
    }
  };

  return (
    <div className="space-y-1.5 min-w-0">
      <button
        type="button"
        onClick={toggleRecording}
        disabled={processing}
        className={`min-h-[40px] px-3 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
          recording
            ? 'bg-rose-600 text-white animate-pulse border-2 border-[#FFD54F]'
            : 'bg-gradient-to-r from-[#3B0764] to-[#581C87] text-[#FFD54F] border border-[#FFD54F]/70 hover:brightness-110'
        } ${compact ? 'w-auto' : 'w-full'} disabled:opacity-60`}
      >
        {processing ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : recording ? (
          <Square className="w-4 h-4 shrink-0 fill-current" />
        ) : (
          <Mic className="w-4 h-4 shrink-0" />
        )}
        <span className="truncate">
          {processing
            ? 'جاري التفريغ الذكي بالذكاء الاصطناعي...'
            : recording
              ? 'إيقاف التسجيل وتعبئة الحقول'
              : labelAr}
        </span>
      </button>

      {lastTranscript && (
        <div className="px-2.5 py-1.5 rounded-lg bg-[#FFFBEB] border border-[#FFD54F]/80 text-[10px] font-bold text-[#3B0764] flex items-start gap-1.5 break-words">
          <Sparkles className="w-3.5 h-3.5 text-[#4C1D95] shrink-0 mt-0.5" />
          <span className="min-w-0">النص المُلتقط: «{lastTranscript}»</span>
        </div>
      )}
    </div>
  );
};
