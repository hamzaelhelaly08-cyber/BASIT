import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode } from 'lucide-react';

interface RealQrCodeProps {
  value: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  alt?: string;
  className?: string;
  downloadFilename?: string;
  downloadLabel?: string;
}

function triggerBlobDownload(dataUrl: string, filename: string): void {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

/**
 * Generates and directly downloads a high-resolution standalone Ha-Be App QR card (PNG)
 * so employees & management can save or print it cleanly on mobile or desktop in 1 click.
 */
export async function downloadHabeBrandedQrCard(targetUrl: string): Promise<void> {
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    width: 560,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#292333', light: '#ffffff' },
  });

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1140;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    triggerBlobDownload(qrDataUrl, 'Ha-Be-Direct-App-QR.png');
    return;
  }

  // White base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 900, 1140);

  // Outer frame
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, 852, 1092);

  // Red awning header band
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(24, 24, 852, 190);

  // White awning stripes inside top strip
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  for (let x = 24; x < 876; x += 68) {
    ctx.fillRect(x, 24, 30, 34);
  }

  // Ha-Be Brand Title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 72px system-ui, -apple-system, sans-serif';
  ctx.fillText('Ha-Be', 450, 132);
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('EMPLOYEE FOOD & BEVERAGE POINT', 450, 178);

  // Arabic Headline
  ctx.fillStyle = '#292333';
  ctx.font = '900 34px Cairo, system-ui, sans-serif';
  ctx.fillText('تطبيق موظفي Ha-Be المباشر', 450, 276);
  ctx.fillStyle = '#dc2626';
  ctx.font = '700 24px Cairo, system-ui, sans-serif';
  ctx.fillText('امسح الكود بكاميرا الهاتف للتثبيت الفوري بأيقونة Ha-Be', 450, 318);

  // Draw QR Frame
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(150, 355, 600, 600);
  ctx.strokeStyle = '#292333';
  ctx.lineWidth = 6;
  ctx.strokeRect(150, 355, 600, 600);

  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = qrDataUrl;
  });
  ctx.drawImage(qrImg, 175, 380, 550, 550);

  // Bottom strip
  ctx.fillStyle = '#292333';
  ctx.fillRect(24, 995, 852, 121);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 22px Cairo, system-ui, sans-serif';
  ctx.fillText('Android (Chrome) + iPhone (Safari) · تشغيل National Logistics | BASIT', 450, 1044);
  ctx.fillStyle = '#fca5a5';
  ctx.font = '700 18px monospace';
  ctx.fillText(targetUrl, 450, 1084);

  triggerBlobDownload(canvas.toDataURL('image/png'), 'Ha-Be-Direct-App-QR.png');
}

export const RealQrCode: React.FC<RealQrCodeProps> = ({
  value,
  size = 180,
  darkColor = '#111827',
  lightColor = '#FFFFFF',
  alt = 'QR Code',
  className = '',
  downloadFilename,
  downloadLabel,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    const payload = value.trim() || 'tel:01041482940';
    QRCode.toDataURL(payload, {
      width: Math.max(240, size * 2),
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [value, size, darkColor, lightColor]);

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className="bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center overflow-hidden shadow-xs"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={alt}
            className="w-full h-full object-contain block"
          />
        ) : (
          <QrCode className="w-10 h-10 text-slate-400 animate-pulse" />
        )}
      </div>

      {downloadFilename && dataUrl && (
        <button
          type="button"
          onClick={() => triggerBlobDownload(dataUrl, downloadFilename)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-600 text-white text-[11px] font-bold transition-colors print:hidden cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloadLabel || 'تنزيل QR PNG'}</span>
        </button>
      )}
    </div>
  );
};
