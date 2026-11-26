import React, { useEffect, useState } from 'react';

interface BasetCleanImageProps {
  src: string;
  alt: string;
  className?: string;
  cleanCheckerboard?: boolean;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

/**
 * Renders attached BASET PNG assets cleanly on dark royal-purple or gold glass cards
 * by removing outer edge-connected neutral gray/white checkerboard squares on canvas,
 * while never altering internal logos, QR codes, or product pixels.
 */
export const BasetCleanImage: React.FC<BasetCleanImageProps> = ({
  src,
  alt,
  className = '',
  cleanCheckerboard = true,
  referrerPolicy = 'no-referrer',
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src);

  useEffect(() => {
    setResolvedSrc(src);
    if (!cleanCheckerboard || !src) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return;

        const maxDim = 900;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        const cw = Math.max(1, Math.round(w * scale));
        const ch = Math.max(1, Math.round(h * scale));

        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, cw, ch);
        const imageData = ctx.getImageData(0, 0, cw, ch);
        const data = imageData.data;

        const isNeutralLight = (idx: number): boolean => {
          const a = data[idx + 3];
          if (a < 30) return true;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          // Checkerboard tiles are neutral light gray/off-white (~190..255 with tiny chroma diff)
          return max - min <= 15 && min >= 176;
        };

        const total = cw * ch;
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let head = 0;
        let tail = 0;

        const enqueueIfNeutral = (x: number, y: number) => {
          const pos = y * cw + x;
          if (visited[pos]) return;
          if (isNeutralLight(pos * 4)) {
            visited[pos] = 1;
            queue[tail++] = pos;
          }
        };

        // Seed only from the 4 outer edges so internal QR/white elements remain untouched
        for (let x = 0; x < cw; x++) {
          enqueueIfNeutral(x, 0);
          enqueueIfNeutral(x, ch - 1);
        }
        for (let y = 1; y < ch - 1; y++) {
          enqueueIfNeutral(0, y);
          enqueueIfNeutral(cw - 1, y);
        }

        // Only run flood-fill if the outer border actually has checkerboard/neutral pixels
        if (tail < Math.max(12, Math.floor((cw + ch) * 0.25))) {
          return;
        }

        while (head < tail) {
          const pos = queue[head++];
          data[pos * 4 + 3] = 0;

          const x = pos % cw;
          const y = (pos - x) / cw;

          if (x > 0) enqueueIfNeutral(x - 1, y);
          if (x + 1 < cw) enqueueIfNeutral(x + 1, y);
          if (y > 0) enqueueIfNeutral(x, y - 1);
          if (y + 1 < ch) enqueueIfNeutral(x, y + 1);
        }

        // Soft 1px edge anti-alias feathering on foreground pixels touching transparent background
        for (let y = 1; y < ch - 1; y++) {
          for (let x = 1; x < cw - 1; x++) {
            const pos = y * cw + x;
            if (visited[pos]) continue;
            const touchesBg =
              visited[pos - 1] ||
              visited[pos + 1] ||
              visited[pos - cw] ||
              visited[pos + cw];
            if (touchesBg) {
              const p = pos * 4;
              const r = data[p];
              const g = data[p + 1];
              const b = data[p + 2];
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              if (max - min <= 24 && min >= 150) {
                data[p + 3] = Math.min(data[p + 3], 120);
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const cleanUrl = canvas.toDataURL('image/png');
        if (!cancelled) {
          setResolvedSrc(cleanUrl);
        }
      } catch {
        // Fallback gracefully to original src
      }
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, cleanCheckerboard]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy={referrerPolicy}
      className={className}
    />
  );
};
