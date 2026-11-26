import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

export interface PdfExportOptions {
  /** Array of DOM nodes where each element represents one discrete A4 page sheet */
  pageElements: HTMLElement[];
  /** Descriptive file name ending in .pdf */
  filename: string;
  /** Orientation of A4 page export (default: portrait) */
  orientation?: 'portrait' | 'landscape';
}

export interface PdfExportResult {
  success: boolean;
  filename: string;
  pageCount: number;
  errorMessage?: string;
}

/**
 * Generates an explicit sanitized filename following:
 * CateringEgypt_<DocType>_<DocNumber>_<Date>.pdf
 */
export function buildOfficialPdfFilename(
  docTypeSlug: string,
  docNumber: string,
  issueDate: string
): string {
  const cleanType = docTypeSlug.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanNum = (docNumber || 'DOC').replace(/[^a-zA-Z0-9_-]/g, '-');
  const cleanDate = (issueDate || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, '');
  return `CateringEgypt_${cleanType}_${cleanNum}_${cleanDate}.pdf`;
}

/**
 * Splits a list of line items cleanly across discrete A4 pages
 * so long tables never truncate or cut rows across page breaks.
 */
export function paginateRowsForA4<T>(
  rows: T[],
  firstPageCapacity = 8,
  subsequentPageCapacity = 13
): T[][] {
  if (rows.length === 0) return [[]];
  if (rows.length <= firstPageCapacity) return [rows];

  const pages: T[][] = [];
  pages.push(rows.slice(0, firstPageCapacity));
  let cursor = firstPageCapacity;

  while (cursor < rows.length) {
    pages.push(rows.slice(cursor, cursor + subsequentPageCapacity));
    cursor += subsequentPageCapacity;
  }

  return pages;
}

async function waitForImagesAndFonts(container: HTMLElement): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Fallback safely to bundled Cairo font
    }
  }

  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      await new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, 2500);
        img.addEventListener(
          'load',
          () => {
            window.clearTimeout(timer);
            resolve();
          },
          { once: true }
        );
        img.addEventListener(
          'error',
          () => {
            window.clearTimeout(timer);
            resolve();
          },
          { once: true }
        );
      });
    })
  );
}

let cachedLocalFontEmbedCss: string | null = null;

async function assetUrlToDataUri(url: string): Promise<string | null> {
  try {
    const resolved = new URL(url, window.location.href);
    if (resolved.origin !== window.location.origin) {
      return null;
    }
    const resp = await fetch(resolved.href);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function buildSafeLocalFontEmbedCSS(): Promise<string> {
  if (cachedLocalFontEmbedCss !== null) {
    return cachedLocalFontEmbedCss;
  }
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return '';
  }

  const fontRules: string[] = [];
  const sheets = Array.from(document.styleSheets || []);

  for (const sheet of sheets) {
    if (sheet.href) {
      try {
        const sheetUrl = new URL(sheet.href, window.location.href);
        if (sheetUrl.origin !== window.location.origin) {
          continue;
        }
      } catch {
        continue;
      }
    }

    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    const baseHref = sheet.href || window.location.href;

    for (const rule of Array.from(rules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      let cssText = rule.cssText;
      const urlMatches = cssText.match(/url\(["']?([^"')]+)["']?\)/g) || [];
      let allResolved = true;

      for (const match of urlMatches) {
        const rawUrl = match.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        if (rawUrl.startsWith('data:')) continue;
        try {
          const absUrl = new URL(rawUrl, baseHref).href;
          const dataUri = await assetUrlToDataUri(absUrl);
          if (dataUri) {
            cssText = cssText.replace(match, `url("${dataUri}")`);
          } else {
            allResolved = false;
          }
        } catch {
          allResolved = false;
        }
      }

      if (allResolved) {
        fontRules.push(cssText);
      }
    }
  }

  cachedLocalFontEmbedCss = fontRules.join('\n');
  return cachedLocalFontEmbedCss;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Clones each page node into a dedicated fixed 794px (A4 portrait @ 96dpi) white light-mode container
 * off-screen, rasterizes at 2x resolution, and slices tall sheets cleanly across discrete A4 pages
 * so exported PDFs never clip horizontally on mobile viewports or truncate vertically.
 */
export async function exportElementsToA4Pdf({
  pageElements,
  filename,
  orientation = 'portrait',
}: PdfExportOptions): Promise<PdfExportResult> {
  if (!pageElements || pageElements.length === 0) {
    return {
      success: false,
      filename,
      pageCount: 0,
      errorMessage: 'لم يتم العثور على صفحات قابلة للتصدير داخل المستند.',
    };
  }

  const isLandscape = orientation === 'landscape';
  const a4WidthMm = isLandscape ? 297 : 210;
  const a4HeightMm = isLandscape ? 210 : 297;
  const targetWidthPx = isLandscape ? 1123 : 794;

  const sandbox = document.createElement('div');
  sandbox.setAttribute('dir', 'rtl');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-12000px';
  sandbox.style.top = '0';
  sandbox.style.width = `${targetWidthPx}px`;
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.color = '#0f172a';
  sandbox.style.zIndex = '-1';
  sandbox.style.pointerEvents = 'none';
  sandbox.style.fontFamily = 'Cairo, sans-serif';
  document.body.appendChild(sandbox);

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const safeFontCss = await buildSafeLocalFontEmbedCSS();
    let totalRenderedPages = 0;

    for (let i = 0; i < pageElements.length; i++) {
      const sourceEl = pageElements[i];
      const clone = sourceEl.cloneNode(true) as HTMLElement;

      // Normalize clone layout to fixed crisp A4 width in light mode regardless of device width
      clone.classList.remove('rounded-2xl', 'shadow-2xl', 'max-w-[210mm]', 'max-w-[297mm]', 'dark');
      clone.style.width = `${targetWidthPx}px`;
      clone.style.minWidth = `${targetWidthPx}px`;
      clone.style.maxWidth = `${targetWidthPx}px`;
      clone.style.margin = '0';
      clone.style.padding = isLandscape ? '24px 28px' : '36px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#0f172a';
      clone.style.overflow = 'visible';
      clone.style.boxShadow = 'none';
      clone.style.borderRadius = '0';
      clone.style.border = 'none';
      clone.style.fontFamily = 'Cairo, sans-serif';

      // Ensure responsive sm:flex-row / sm:grid elements inside clone use desktop width layout cleanly
      clone.querySelectorAll('.overflow-hidden, .overflow-x-auto, .overflow-y-auto').forEach((node) => {
        if (node instanceof HTMLElement) {
          node.style.overflow = 'visible';
        }
      });

      sandbox.innerHTML = '';
      sandbox.appendChild(clone);
      await waitForImagesAndFonts(sandbox);

      // Give layout one animation frame to settle at target width
      await new Promise((r) => window.requestAnimationFrame(r));

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        width: targetWidthPx,
        pixelRatio: 2,
        skipAutoScale: false,
        fontEmbedCSS: safeFontCss,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
            return false;
          }
          return true;
        },
      });

      const img = await loadImage(dataUrl);
      const singlePageMaxHeightPx = Math.round(img.width * (a4HeightMm / a4WidthMm));

      if (img.height <= singlePageMaxHeightPx + 12) {
        if (totalRenderedPages > 0) {
          pdf.addPage('a4', orientation);
        }
        const renderW = a4WidthMm;
        const renderH = (img.height * a4WidthMm) / img.width;
        const safeH = Math.min(a4HeightMm, renderH);
        pdf.addImage(dataUrl, 'PNG', 0, 0, renderW, safeH, undefined, 'FAST');
        totalRenderedPages += 1;
      } else {
        // Vertical multi-page slicing so tall tables never truncate or shrink into unreadable text
        const sliceCanvas = document.createElement('canvas');
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        let offsetY = 0;
        while (offsetY < img.height) {
          const sliceHeight = Math.min(singlePageMaxHeightPx, img.height - offsetY);
          sliceCanvas.width = img.width;
          sliceCanvas.height = sliceHeight;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            img,
            0,
            offsetY,
            img.width,
            sliceHeight,
            0,
            0,
            img.width,
            sliceHeight
          );
          const sliceUrl = sliceCanvas.toDataURL('image/png');
          if (totalRenderedPages > 0) {
            pdf.addPage('a4', orientation);
          }
          const sliceRenderH = (sliceHeight * a4WidthMm) / img.width;
          pdf.addImage(sliceUrl, 'PNG', 0, 0, a4WidthMm, sliceRenderH, undefined, 'FAST');
          totalRenderedPages += 1;
          offsetY += sliceHeight;
        }
      }
    }

    const safeName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeName);

    return {
      success: true,
      filename: safeName,
      pageCount: totalRenderedPages,
    };
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      filename,
      pageCount: 0,
      errorMessage: `تعذر إنشاء ملف PDF (${rawMsg}). تأكد من أن جميع العناصر والصور داخل الصفحة صالحة للتحميل أو استخدم زر الطباعة كبديل.`,
    };
  } finally {
    sandbox.remove();
  }
}

/**
 * Clones rendered A4 page nodes into an isolated body-level print portal
 * and invokes window.print() cleanly without modal scroll clipping.
 */
export function triggerCleanA4Print(
  pageElements: HTMLElement[],
  landscape = false
): boolean {
  if (typeof document === 'undefined' || pageElements.length === 0) {
    return false;
  }

  let portal = document.getElementById('ce-print-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'ce-print-portal';
    portal.style.display = 'none';
    portal.setAttribute('dir', document.documentElement.getAttribute('dir') || 'rtl');
    document.body.appendChild(portal);
  }

  portal.innerHTML = '';
  pageElements.forEach((node) => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.classList.add('ce-a4-page');
    if (landscape) {
      clone.classList.add('ce-a4-landscape');
    }
    portal!.appendChild(clone);
  });

  document.body.classList.add('ce-printing-portal');
  if (landscape) {
    document.body.classList.add('ce-printing-landscape');
  } else {
    document.body.classList.remove('ce-printing-landscape');
  }

  const cleanup = () => {
    document.body.classList.remove('ce-printing-portal');
    document.body.classList.remove('ce-printing-landscape');
    if (portal) {
      portal.innerHTML = '';
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  window.print();

  window.setTimeout(cleanup, 3000);
  return true;
}
