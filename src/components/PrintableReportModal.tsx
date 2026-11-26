import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Eye,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';
import { PrintableDocData, PrintableDocType } from '../types/dashboard';
import { BasitBrandMark } from './BasitBrandMark';
import {
  buildOfficialPdfFilename,
  exportElementsToA4Pdf,
  paginateRowsForA4,
  triggerCleanA4Print,
} from '../lib/pdfExport';

interface PrintableReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: PrintableDocType;
  customData?: Partial<PrintableDocData>;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  isOpen,
  onClose,
  initialType = 'quotation',
  customData,
}) => {
  const [docType, setDocType] = useState<PrintableDocType>(initialType);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [includeExtendedTestRows, setIncludeExtendedTestRows] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDocType(initialType);
      setPdfFeedback(null);
    }
  }, [isOpen, initialType]);

  const doc: PrintableDocData = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    let base: PrintableDocData;

    switch (docType) {
      case 'quotation':
        base = {
          type: 'quotation',
          titleAr: 'عرض سعر توريد وجبات إعاشة رسمية (تجريبي للاختبار)',
          documentNumber: 'QUOT-2026-904',
          issueDate: todayStr,
          recipientName: 'السادة / لجنة إدارة الخدمات والمشتريات',
          recipientOrg:
            customData?.recipientOrg || 'منشأة عملاء تجريبية — مستشفى / شركة صناعية',
          recipientLocation: 'القاهرة الكبرى — مدينة بدر',
          items: [
            {
              description:
                'وجبة غداء مطبوخة ساخنة (بروتين 180 جم + خضار + أرز بسمتي + سلطة + خبز)',
              portionSpec: '450 جم صافي معقمة',
              quantity: '1,200 وجبة/يوم',
              unitPrice: '145.00 ج.م (تجريبي)',
              totalPrice: '174,000 ج.م/يوم',
            },
            {
              description:
                'وجبة علاجية مقيدة للمرضى (قليلة الصوديوم والدهون لمرضى الباطنة والقلب)',
              portionSpec: '400 جم موزونة بالجرام',
              quantity: '600 وجبة/يوم',
              unitPrice: '135.00 ج.م (تجريبي)',
              totalPrice: '81,000 ج.م/يوم',
            },
            {
              description:
                'وجبة إفطار صباحي متكامل (جبن معقم، بيض، عسل، زبادي، عيش بلدي ساخن)',
              portionSpec: 'عبوة معقمة مفرغة',
              quantity: '800 وجبة/يوم',
              unitPrice: '65.00 ج.م (تجريبي)',
              totalPrice: '52,000 ج.م/يوم',
            },
          ],
          notes: [
            'الأرقام والأسعار المعروضة أعلاه بيانات اختبار تجريبية للتحقق من نظام A4 PDF والطباعة ولا تُعد عرضاً مالياً ملزماً قبل الاعتماد الرسمي.',
            'التوريد خاضع لرقابة صارمة وفق معايير سلامة الغذاء ومراقبة الهايجين اليومية HACCP.',
            'فترة سريان العرض: 30 يوماً من تاريخ الإصدار المعتمد.',
          ],
          preparedBy: 'مستر / أحمد ديب (مدير التشغيل والمحتوى)',
          approvedBy: 'م/ مصطفى شعبان (مدير العمليات المركزية)',
        };
        break;

      case 'test_sample':
        base = {
          type: 'test_sample',
          titleAr: 'إذن صرف وتوريد عينة تذوق فنية (TEST SAMPLE)',
          documentNumber: 'TEST-DSP-2026-08',
          issueDate: todayStr,
          recipientName: 'م/ إبراهيم حلمي (مسؤول الخدمات الإدارية)',
          recipientOrg:
            customData?.recipientOrg || 'شركة عملاء صناعية — العاشر من رمضان',
          recipientLocation: 'المنطقة الصناعية الثالثة — العاشر من رمضان',
          items: [
            {
              description:
                'عينة وجبة دجاج جريل مشوي مع أرز بسمتي بالخلطة وخضار سوتيه',
              portionSpec: 'عبوة فحص معقمة',
              quantity: '5 عينات',
              unitPrice: 'مجاني للتذوق',
              totalPrice: '0.00 ج.م',
            },
            {
              description:
                'عينة وجبة كفتة بلدي مشوية على الفحم مع طحينة وسلطة خضراء',
              portionSpec: 'عبوة حرارية ساخنة',
              quantity: '5 عينات',
              unitPrice: 'مجاني للتذوق',
              totalPrice: '0.00 ج.م',
            },
            {
              description:
                'عينة وجبة علاجية (لحم بتلو سوتيه مع بروكلي وأرز بني)',
              portionSpec: 'مع بطاقة السعرات',
              quantity: '5 عينات',
              unitPrice: 'مجاني للتذوق',
              totalPrice: '0.00 ج.م',
            },
          ],
          notes: [
            'هذه العينة مخصصة لأغراض التذوق والتقييم الفني الداخلي لإدارة المنشأة.',
            'تسلم الوجبات بدرجة حرارة لا تقل عن +68° م في حافظات طعام حرارية مختومة.',
          ],
          preparedBy: 'شيف / عصام الدسوقي (رئيس مطبخ هنجر استيشن)',
          approvedBy: 'م/ مصطفى شعبان (مدير العمليات المركزية)',
        };
        break;

      case 'haccp_certificate':
        base = {
          type: 'haccp_certificate',
          titleAr: 'تقرير التفتيش ومطابقة سلامة الغذاء والهايجين HACCP',
          documentNumber: 'HACCP-AUD-2026-77',
          issueDate: todayStr,
          recipientName: 'إدارة مراقبة الجودة والمنشآت الصحية',
          recipientOrg:
            customData?.recipientOrg ||
            'الشركة الوطنية اللوجستية — المطابخ المركزية',
          recipientLocation:
            'المطابخ المركزية: ومركز العين ببدر، هنجر ستيشن بأرض المعارض بمدينة نصر، ومطبخ بيت العيلة',
          items: [
            {
              description:
                'معايرة ثلاجات الحفظ وسيارات النقل المبرد (+1° إلى +4° م)',
              portionSpec: 'تتبع حراري رقمي',
              quantity: '18 جهاز فحص',
              unitPrice: 'مطابق للمعايير',
              totalPrice: 'نسبة الالتزام 100%',
            },
            {
              description:
                'فحص درجات الطهي المركزي بالمسابر الإلكترونية Core Probe (> +75° م)',
              portionSpec: 'فحص لكل دفعة طهي',
              quantity: '42 وجبة مفحوصة',
              unitPrice: 'مطابق للمعايير',
              totalPrice: 'درجة أمان قصوى',
            },
            {
              description:
                'مسحات بيولوجية لأسطح التقطيع الستانلس ستيل ومعدات الطهي',
              portionSpec: 'مختبر ميكروبيولوجي',
              quantity: '24 مسحة عشوائية',
              unitPrice: 'خالية من الملوثات',
              totalPrice: 'نتيجة سليمة 100%',
            },
          ],
          notes: [
            'تمت مراجعة الاشتراطات الصحية لجميع العاملين وثبوت سريان الشهادات الصحية.',
            'التخزين والتبريد والتعبئة تمت وفق متطلبات سلامة الغذاء المعتمدة للشركة الوطنية اللوجستية.',
          ],
          preparedBy: 'د/ ريهام السعدني (مسؤول الهايجين وسلامة الغذاء)',
          approvedBy: 'م/ مصطفى شعبان (مدير العمليات المركزية)',
        };
        break;

      case 'menu_catalog':
        base = {
          type: 'menu_catalog',
          titleAr: 'كتالوج قائمة الوجبات والمنيوهات المؤسسية (نموذج تجريبي)',
          documentNumber: 'CAT-MENU-2026-84',
          issueDate: todayStr,
          recipientName: 'السادة / مسؤولو المشتريات والخدمات الإدارية',
          recipientOrg:
            customData?.recipientOrg || 'كافة المنشآت والشركات المتعاقدة',
          recipientLocation: 'القاهرة الكبرى · أرض المعارض بمدينة نصر · مدينة بدر · العين السخنة',
          items: [
            {
              description:
                'وجبة دجاج شواية متبل (220 جم) + أرز بسمتي + خضار + سلطة + خبز',
              portionSpec: '480 جم صافي معقمة',
              quantity: 'توريد يومي',
              unitPrice: '135.00 ج.م (تجريبي)',
              totalPrice: 'سعر اختبار',
            },
            {
              description:
                'وجبة كفتة مشوية على الفحم (180 جم) + مكرونة + طحينة + خبز',
              portionSpec: '450 جم حرارية',
              quantity: 'توريد يومي',
              unitPrice: '140.00 ج.م (تجريبي)',
              totalPrice: 'سعر اختبار',
            },
            {
              description:
                'وجبة لحم بقري روستو + أرز بالشعرية + خضار سوتيه + شوربة',
              portionSpec: '460 جم صافي',
              quantity: 'توريد يومي',
              unitPrice: '165.00 ج.م (تجريبي)',
              totalPrice: 'سعر اختبار',
            },
            {
              description:
                'وجبة إفطار عمالي متكامل (فول، بيض، جبن، مربى، خبز طازج)',
              portionSpec: 'عبوة مفرغة محكمة',
              quantity: 'ورديات صباحية',
              unitPrice: '60.00 ج.م (تجريبي)',
              totalPrice: 'سعر اختبار',
            },
          ],
          notes: [
            'الأسعار المعروضة هي أسعار تجريبية لاختبار نظام PDF ويتم اعتماد التسعير النهائي وفق العقد.',
            'التعبئة بنظام الإغلاق الحراري السريع لضمان الجودة وسلامة التوصيل.',
          ],
          preparedBy: 'شيف / عصام الدسوقي (رئيس المطبخ المركزي)',
          approvedBy: 'م/ مصطفى شعبان (مدير العمليات المركزية)',
        };
        break;

      case 'charity_delegation':
        base = {
          type: 'charity_delegation',
          titleAr: 'شهادة توكيل إطعام شرعي وتوزيع وجبات إغاثة',
          documentNumber: 'WAQALAH-CHARITY-2026-789',
          issueDate: todayStr,
          recipientName: 'المتبرع الكريم',
          recipientOrg:
            customData?.recipientOrg ||
            'قطاع الإطعام الخيري والإغاثة — الوطنية اللوجستية',
          recipientLocation: 'نطاق التوزيع الميداني المعتمد',
          items: [
            {
              description:
                'وجبات إطعام ساخنة متكاملة (أرز بسمتي + ربع دجاجة + خضار + خبز + فاكهة)',
              portionSpec: 'وجبة طعام مشبعة',
              quantity: '10 وجبات',
              unitPrice: 'تجهيز كامل',
              totalPrice: 'شهادة توكيل معتمدة',
            },
          ],
          notes: [
            'تم إعداد وطبخ الوجبات في المطابخ المركزية المعتمدة بمنصة BASIT | باسط وفق اشتراطات سلامة الغذاء.',
          ],
          preparedBy: 'لجنة الإطعام الخيري والإغاثة',
          approvedBy: 'م/ مصطفى شعبان (المسؤول الأعلى للعمليات)',
        };
        break;

      case 'operations_order':
      default:
        base = {
          type: 'operations_order',
          titleAr: 'أمر تشغيل مطبخ وتوريد موقع معتمد',
          documentNumber: 'OPS-ORD-2026-312',
          issueDate: todayStr,
          recipientName: 'شيف / سامي عبد القوي (مشرف مطبخ بدر)',
          recipientOrg:
            customData?.recipientOrg || 'موقع شركة صناعية متعاقدة — السخنة',
          recipientLocation: 'المنطقة الصناعية — طريق السويس',
          items: [
            {
              description:
                'وجبات إفطار وردية الصباح (فول، بيض، جبن، عيش بلدي ساخن)',
              portionSpec: 'تسليم 06:00 ص',
              quantity: '1,400 وجبة',
              unitPrice: 'أمر تشغيل',
              totalPrice: 'خط إنتاج بدر',
            },
            {
              description:
                'وجبات غداء ساخنة بروتين عالي وردية الظهر (لحوم، خضار، أرز)',
              portionSpec: 'تسليم 13:00 م',
              quantity: '1,400 وجبة',
              unitPrice: 'أمر تشغيل',
              totalPrice: 'خط إنتاج هنجر',
            },
          ],
          notes: [
            'الالتزام الصارم بمواعيد تسليم السيارات المبردة عند بوابات المصنع.',
          ],
          preparedBy: 'مستر / أحمد ديب (مدير التشغيل والمحتوى)',
          approvedBy: 'م/ مصطفى شعبان (مدير العمليات المركزية)',
        };
        break;
    }

    if (includeExtendedTestRows) {
      const extraRows = Array.from({ length: 12 }, (_, idx) => ({
        description: `بند اختبار إضافي (${idx + 1}) للتحقق من تعدد صفحات A4 وعدم قص الجدول`,
        portionSpec: 'حصة قياسية 420 جم',
        quantity: `${(idx + 2) * 50} وحدة`,
        unitPrice: `${95 + idx * 5}.00 ج.م`,
        totalPrice: `${((idx + 2) * 50 * (95 + idx * 5)).toLocaleString()} ج.م`,
      }));
      base = {
        ...base,
        items: [...base.items, ...extraRows],
      };
    }

    return base;
  }, [docType, customData, includeExtendedTestRows]);

  const itemPages = useMemo(
    () => paginateRowsForA4(doc.items, 7, 11),
    [doc.items]
  );

  if (!isOpen) return null;

  const getValidPageElements = (): HTMLElement[] =>
    pageRefs.current.filter((el): el is HTMLDivElement => el !== null);

  const handlePrint = () => {
    setPdfFeedback(null);
    const els = getValidPageElements();
    if (els.length === 0) {
      setPdfFeedback({
        type: 'error',
        text: 'تعذر العثور على صفحات المستند للطباعة. تأكد من فتح المعاينة أولاً.',
      });
      return;
    }
    triggerCleanA4Print(els);
  };

  const handleDownloadPdf = async () => {
    setPdfFeedback(null);
    setIsExportingPdf(true);
    try {
      const els = getValidPageElements();
      const filename = buildOfficialPdfFilename(
        doc.type,
        doc.documentNumber,
        doc.issueDate
      );
      const res = await exportElementsToA4Pdf({
        pageElements: els,
        filename,
      });

      if (res.success) {
        setPdfFeedback({
          type: 'success',
          text: `تم إنشاء وتنزيل ملف PDF بنجاح: ${res.filename} (${res.pageCount} صفحة A4)`,
        });
      } else {
        setPdfFeedback({
          type: 'error',
          text: res.errorMessage || 'حدث خطأ أثناء توليد ملف PDF.',
        });
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[95vh] text-slate-900 dark:text-white overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-950/90 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500">
              {doc.documentNumber}
            </span>
            <span className="text-sm font-black text-[#62339A]">
              معاينة وتنزيل PDF والطباعة (A4 RTL)
            </span>
          </div>

          {/* Template Switcher */}
          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
            {(
              [
                ['quotation', 'عرض سعر رسمي'],
                ['haccp_certificate', 'تقرير HACCP'],
                ['test_sample', 'إذن عينة TEST'],
                ['menu_catalog', 'كتالوج المنيوهات'],
                ['charity_delegation', 'شهادة إطعام'],
                ['operations_order', 'أمر تشغيل'],
              ] as [PrintableDocType, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setDocType(key);
                  setPdfFeedback(null);
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  docType === key
                    ? 'bg-[#62339A] text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewExpanded((p) => !p)}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#62339A]" />
              <span>{isPreviewExpanded ? 'المعاينة مفعّلة' : 'تفعيل المعاينة'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIncludeExtendedTestRows((p) => !p)}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border ${
                includeExtendedTestRows
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="تفعيل صفوف اختبارية متعددة لاختبار تعدد صفحات A4"
            >
              <Layers className="w-3.5 h-3.5 text-[#62339A]" />
              <span>
                {includeExtendedTestRows
                  ? `متعدد الصفحات (${itemPages.length} صفحة)`
                  : 'اختبار تعدد الصفحات'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExportingPdf ? 'جاري التجهيز...' : 'تنزيل PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status / Error Banner */}
        {pdfFeedback && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-3 border-b ${
              pdfFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {pdfFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pdfFeedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setPdfFeedback(null)}
              className="text-xs underline cursor-pointer"
            >
              إخفاء
            </button>
          </div>
        )}

        {/* Paginated A4 Canvas Area */}
        <div
          className={`flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/80 dark:bg-slate-950/70 space-y-6 ${
            !isPreviewExpanded ? 'hidden' : ''
          }`}
        >
          {itemPages.map((pageRows, pageIndex) => {
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === itemPages.length - 1;
            const startingRowNumber =
              pageIndex === 0 ? 1 : 8 + (pageIndex - 1) * 11;

            return (
              <div
                key={`a4-page-${pageIndex}`}
                ref={(el) => {
                  pageRefs.current[pageIndex] = el;
                }}
                dir="rtl"
                className="ce-a4-page mx-auto w-full max-w-[210mm] bg-white text-slate-900 p-7 sm:p-10 shadow-xl border border-slate-300 rounded-lg relative flex flex-col justify-between"
                style={{ minHeight: '296mm', fontFamily: 'Cairo, sans-serif' }}
              >
                <div>
                  {/* Repeating Official Header on Every A4 Page */}
                  <div className="flex items-center justify-between border-b-2 border-[#62339A] pb-4 mb-5">
                    <div className="flex items-center gap-3.5">
                      <BasitBrandMark size="md" isRtl />
                      <div>
                        <div className="text-lg sm:text-xl font-black text-[#292333] leading-tight">
                          BASIT | باسط
                        </div>
                        <div className="text-xs font-extrabold text-[#62339A]">
                          الشركة الوطنية اللوجستية — منظومة الإعاشة والمطابخ المركزية
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          س.ت: 19132 · ب.ض: 725-995-758 · ISO 22000 & HACCP
                        </div>
                      </div>
                    </div>

                    <div className="text-end text-xs space-y-1">
                      <div className="font-bold text-slate-900">
                        رقم المستند:{' '}
                        <span className="font-mono text-[#62339A]">
                          {doc.documentNumber}
                        </span>
                      </div>
                      <div className="text-slate-600 font-mono">
                        التاريخ: {doc.issueDate}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        صفحة {pageIndex + 1} من {itemPages.length}
                      </div>
                    </div>
                  </div>

                  {/* Document Title & Recipient on Page 1 (or Continuation Banner on Page 2+) */}
                  {isFirstPage ? (
                    <>
                      <div className="bg-[#F7F5FA]/70 border border-[#62339A]/20 rounded-xl p-3.5 text-center mb-5">
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                          {doc.titleAr}
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-500 font-bold block">
                            الجهة الموجه إليها:
                          </span>
                          <div className="font-black text-slate-900 text-sm mt-0.5">
                            {doc.recipientOrg}
                          </div>
                          <div className="text-slate-700 mt-0.5">
                            {doc.recipientName}
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="text-slate-500 font-bold block">
                            موقع التسليم والتشغيل:
                          </span>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {doc.recipientLocation}
                          </div>
                          <div className="text-emerald-700 font-bold mt-0.5">
                            سلسلة توريد مبردة معتمدة
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold text-slate-700 mb-4 flex items-center justify-between">
                      <span>تابع: {doc.titleAr}</span>
                      <span className="font-mono text-[#62339A]">
                        {doc.documentNumber}
                      </span>
                    </div>
                  )}

                  {/* Line Items Table (Zero horizontal overflow / never clipped) */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden mb-5">
                    <table className="w-full text-start text-xs border-collapse table-fixed">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-2.5 w-10 text-center">م</th>
                          <th className="p-2.5 w-[38%] text-start">
                            بيان الصنف والمواصفات الفنية
                          </th>
                          <th className="p-2.5 w-[18%] text-start">
                            المعيار / الوزن
                          </th>
                          <th className="p-2.5 w-[14%] text-center">الكمية</th>
                          <th className="p-2.5 w-[14%] text-end">سعر الوحدة</th>
                          <th className="p-2.5 w-[16%] text-end">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {pageRows.map((item, idx) => (
                          <tr
                            key={`row-${pageIndex}-${idx}`}
                            className="even:bg-slate-50/60"
                          >
                            <td className="p-2.5 text-center font-mono text-slate-500 tabular-nums">
                              {startingRowNumber + idx}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900 leading-relaxed break-words">
                              {item.description}
                            </td>
                            <td className="p-2.5 text-slate-700 font-medium break-words">
                              {item.portionSpec || 'معياري'}
                            </td>
                            <td className="p-2.5 text-center font-bold text-slate-900 tabular-nums">
                              {item.quantity}
                            </td>
                            <td className="p-2.5 text-end font-mono text-slate-700 tabular-nums">
                              {item.unitPrice || '—'}
                            </td>
                            <td className="p-2.5 text-end font-extrabold text-[#62339A] tabular-nums">
                              {item.totalPrice || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Notes & Official Signatures only on Last Page */}
                  {isLastPage && (
                    <div className="ce-keep-together space-y-5">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 mb-1.5">
                          الملاحظات والاشتراطات الفنية:
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                          {doc.notes.map((note, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t-2 border-slate-200 pt-4 grid grid-cols-2 gap-8 text-xs text-center">
                        <div className="space-y-2">
                          <div className="font-bold text-slate-600">
                            إعداد ومراجعة:
                          </div>
                          <div className="text-slate-900 font-black">
                            {doc.preparedBy}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            توقيع تشغيلي معتمد
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="font-bold text-slate-600">
                            اعتماد إدارة العمليات المركزية:
                          </div>
                          <div className="text-[#62339A] font-black">
                            {doc.approvedBy}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            BASIT | باسط — الشركة الوطنية اللوجستية
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Official Footer on Every Page */}
                <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>
                    BASIT | باسط — الشركة الوطنية اللوجستية | {doc.documentNumber}
                  </span>
                  <span>
                    تاريخ الإصدار: {doc.issueDate} · صفحة {pageIndex + 1} من{' '}
                    {itemPages.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
