import React, { useRef, useState } from 'react';
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Download, 
  Printer, 
  ExternalLink, 
  Award, 
  QrCode, 
  Sparkles, 
  Check, 
  FileCheck, 
  Eye, 
  X,
  FileBadge,
  Phone,
  MapPin,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  buildOfficialPdfFilename,
  exportElementsToA4Pdf,
  triggerCleanA4Print,
} from '../lib/pdfExport';

interface OfficialLegalPaperworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
  onShowToast: (msg: string) => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
}

export const OfficialLegalPaperworkModal: React.FC<OfficialLegalPaperworkModalProps> = ({
  isOpen,
  onClose,
  isRtl = true,
  onShowToast,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'packaging'>('documents');
  const [selectedDocId, setSelectedDocId] = useState<string>('cr');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<{ kind: 'error' | 'success'; msg: string } | null>(null);
  const docCardRef = useRef<HTMLDivElement | null>(null);
  const profileCardRef = useRef<HTMLDivElement | null>(null);
  const packagingCardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  // Exact documents extracted from user's official uploaded paperwork
  const OFFICIAL_PAPERS = [
    {
      id: 'cr',
      titleAr: 'مستخرج السجل التجاري المعتمد (رقم 19132)',
      titleEn: 'Official Commercial Registry Extract',
      authorityAr: 'وزارة التموين والتجارة الداخلية — جهاز تنمية التجارة الداخلية — مكتب سجل تجاري العاشر من رمضان المميز',
      docNumber: '19132 (الرقم القومي للمنشأة: 758995725)',
      issueDate: '2024/02/27 (الافتتاح والترخيص: 2024/01/17)',
      expiryDate: 'ساري حتى 2029/01/17',
      capital: '100,000 جنيه مصري (مائة ألف جنيه مصري لا غير)',
      legalEntity: 'منشأة فردية (قانون 34 لسنة 1976 - أفراد خاص)',
      ownerName: 'مصطفى شعبان عبد العليم الهلالي (الرقم القومي: 28404030101978)',
      tradeNames: '1- مصطفى شعبان عبد العليم الهلالي | 2- الوطنية اللوجستية لتوريدات المواد الغذائية',
      addressAr: 'شقة 25 عمارة ج مول الماسة الأردنية العاشر من رمضان — محافظة الشرقية',
      activitiesList: [
        'مكاتب التصدير والاستيراد (كود النشاط: 461002)',
        'توريد وتجهيز المواد الغذائية والتغذية المدرسية (الكود: 812)',
        'إضافة نشاط التصدير لجميع الحاصلات والمنتجات المصرية'
      ],
      qrCodeData: 'https://bor.itda.gov.eg/activity',
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'vat',
      titleAr: 'شهادة تسجيل الضريبة على القيمة المضافة (نموذج 3 ض.ق.م)',
      titleEn: 'VAT Value Added Tax Registration Certificate',
      authorityAr: 'وزارة المالية — مصلحة الضرائب المصرية (منطقة غرب القناة وسيناء — مأمورية العاشر من رمضان أول)',
      docNumber: 'رقم التسجيل الضريبي: 758-995-725',
      issueDate: '2024/03/10 (ساري اعتباراً من 2024/03/11)',
      expiryDate: 'سارية حتى 2029/03/10',
      capital: 'خاضع لمنظومة الفاتورة الإلكترونية والإيصال الإلكتروني',
      legalEntity: 'الوطنية اللوجستية لتوريدات المواد الغذائية',
      ownerName: 'المسجل: مصطفى شعبان عبد العليم الهلالي',
      tradeNames: 'الوطنية اللوجستية لتوريدات المواد الغذائية',
      addressAr: 'مجمع المصالح بالعاشر من رمضان خلف صيدناوي / شقة 25 عمارة ج مول الماسة الأردنية',
      activitiesList: [
        'تسجيل رسمي مكلف بضريبة القيمة المضافة طبقا للقانون رقم 67 لسنة 2016',
        'اعتماد إصدار الفواتير الضريبية المعتمدة للمؤسسات والمستشفيات والشركات',
        'مربوطة مع منظومة الضرائب المصرية ETA للفوترة اللحظية'
      ],
      qrCodeData: 'ETA-VAT-REG-758995725',
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'exporter_card',
      titleAr: 'بطاقة قيد في سجل المصدرين (رقم 600023736)',
      titleEn: 'GOEIC Certified Exporter Registry Card',
      authorityAr: 'وزارة التجارة والصناعة — الهيئة العامة للرقابة على الصادرات والواردات (GOEIC)',
      docNumber: 'رقم القيد: 600023736 (السجل التجاري: 10230000019132)',
      issueDate: '2024/06/26 (تحريراً في 2024/06/27)',
      expiryDate: 'صالحة حتى 2029/01/17 (يراعى التجديد في المواعيد القانونية)',
      capital: 'رأس المال المثبت: 100,000 جنيه مصري',
      legalEntity: 'منشأة فردية معتمدة للتصدير الدولي',
      ownerName: 'مصطفى شعبان عبد العليم الهلالي',
      tradeNames: 'الوطنية اللوجستية لتوريدات المواد الغذائية (Alwataniya Logistics)',
      addressAr: 'العاشر من رمضان المميز — الشرقية · هاتف مسجل: 01022324440',
      activitiesList: [
        'الأصناف المصرح بتصديرها: جميع منتجات جمهورية مصر العربية الحاصلات والغذائية',
        'تصدير تمور سيوة والوادي الجديد والمجدول للأسواق العربية والأوروبية',
        'توقيع واعتماد: مهندس/ عصام النجار (رئيس مجلس إدارة الهيئة العامة للرقابة)'
      ],
      qrCodeData: 'GOEIC-EXP-600023736',
      badgeColor: 'bg-amber-600'
    },
    {
      id: 'tax_card',
      titleAr: 'البطاقة الضريبية الرسمية الموحدة (كود 4711)',
      titleEn: 'Official Tax Card & Unique Registration Code',
      authorityAr: 'وزارة المالية — مصلحة الضرائب المصرية — مأمورية العاشر من رمضان',
      docNumber: 'رقم التسجيل: 725-995-758 · الكود الموحد: 2464216260238295',
      issueDate: '2024/01/30 (بدء النشاط: 2023/08/01)',
      expiryDate: 'سارية حتى 2029/01/29',
      capital: 'فردي — إعاشة وتجارة أغذية وتوريدات',
      legalEntity: 'منشأة فردية تجارية ولوجستية',
      ownerName: 'الممول: مصطفى شعبان عبد العليم الهلالي',
      tradeNames: 'الوطنية اللوجستية لتوريدات المواد الغذائية',
      addressAr: 'شقة 25 ع ج مول الماسة الأردنية العاشر من رمضان',
      activitiesList: [
        'البيع بالتجزئة في المتاجر غير المتخصصة التي تبيع الأطعمة والمشروبات (كود: 4711)',
        'توريد الوجبات الغذائية المطهية للشركات والمنشآت الصناعية والمستشفيات',
        'توريدات المواد الغذائية الجافة والمجمدة وإدارة الكنتين'
      ],
      qrCodeData: '2464216260238295',
      badgeColor: 'bg-purple-600'
    },
    {
      id: 'food_safety_nfsa',
      titleAr: 'تراخيص سلامة الغذاء NFSA والتحالف الزراعي GNH',
      titleEn: 'National Food Safety NFSA & Green Nile Harvest',
      authorityAr: 'الهيئة القومية لسلامة الغذاء (NFSA) & Green Nile Harvest Alliance',
      docNumber: 'NFSA-KITCHEN-2026/890 · ISO 22000 & HACCP Certified',
      issueDate: '2024/03/15',
      expiryDate: 'سارية ومجددة دورياً',
      capital: 'طاقة تشغيلية 18,500 وجبة يومياً عبر 3 مطابخ مركزية',
      legalEntity: 'مطابخ مركزية معتمدة ومطابقة للاشتراطات الصحية القياسية',
      ownerName: 'إشراف: إدارة الجودة وسلامة الغذاء المركزية',
      tradeNames: 'كاترينج مصر — إحدى منظومات الشركة الوطنية اللوجستية',
      addressAr: 'مطبخ ومركز العين ببدر · مطبخ هنجر ستيشن بأرض المعارض بمدينة نصر · مطبخ بيت العيلة',
      activitiesList: [
        'مطابقة كاملة لاشتراطات الهيئة القومية لسلامة الغذاء NFSA',
        'شهادة نظام إدارة سلامة الغذاء الدولية ISO 22000:2018',
        'شهادة تحليل المخاطر ونقاط التحكم الحرجة HACCP',
        'شراكة الإنتاج الزراعي والفرز والتعبئة Green Nile Harvest'
      ],
      qrCodeData: 'NFSA-HACCP-GNH-2026',
      badgeColor: 'bg-teal-600'
    }
  ];

  const activeDoc = OFFICIAL_PAPERS.find(d => d.id === selectedDocId) || OFFICIAL_PAPERS[0];

  const getActivePrintableMeta = () => {
    if (activeTab === 'profile') {
      return {
        element: profileCardRef.current,
        titleAr: 'التعريف المؤسسي للشركة الوطنية اللوجستية ومجلس الإدارة',
        titleEn: 'Company Profile & Executive Board',
        refCode: 'COMPANY-PROFILE',
      };
    }
    if (activeTab === 'packaging') {
      return {
        element: packagingCardRef.current,
        titleAr: 'هوية وشعار الباكينج والتعبئة المعتمد',
        titleEn: 'Official Packaging & Harvest Identity',
        refCode: 'PACKAGING-IDENTITY',
      };
    }
    return {
      element: docCardRef.current,
      titleAr: activeDoc.titleAr,
      titleEn: activeDoc.titleEn,
      refCode: activeDoc.id.toUpperCase(),
    };
  };

  const handlePrintDoc = () => {
    setPdfFeedback(null);
    const target = getActivePrintableMeta();
    if (!target.element) {
      setPdfFeedback({
        kind: 'error',
        msg: 'تعذر تجهيز المحتوى الحالي للطباعة.',
      });
      return;
    }
    onAddAuditLog(
      `طباعة وثيقة رسمية: ${target.titleAr}`,
      `Printed Official Document: ${target.titleEn}`,
      `تمت طباعة [${target.refCode}] عبر بوابة A4 المستقلة.`
    );
    triggerCleanA4Print([target.element]);
  };

  const handleDownloadDocPdf = async () => {
    const target = getActivePrintableMeta();
    if (!target.element) {
      setPdfFeedback({
        kind: 'error',
        msg: 'تعذر تجهيز العنصر النشط لتصدير PDF.',
      });
      return;
    }
    setIsExportingPdf(true);
    setPdfFeedback(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const filename = buildOfficialPdfFilename(
        'OfficialDoc',
        target.refCode,
        today
      );
      const res = await exportElementsToA4Pdf({
        pageElements: [target.element],
        filename,
      });
      if (!res.success) {
        setPdfFeedback({
          kind: 'error',
          msg: res.errorMessage || 'تعذر تصدير المستند.',
        });
        return;
      }
      onAddAuditLog(
        `تنزيل PDF للوثيقة الرسمية: ${target.titleAr}`,
        `Downloaded Official Document PDF: ${target.titleEn}`,
        `تم تنزيل ملف PDF: ${res.filename}`
      );
      onShowToast(`تم تنزيل ملف PDF: ${res.filename}`);
      setPdfFeedback({ kind: 'success', msg: `تم تنزيل الملف: ${res.filename}` });
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'تعذر تصدير المستند';
      setPdfFeedback({ kind: 'error', msg: `فشل التصدير: ${detail}` });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header Ribbon */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#292333] via-[#4A2378] to-[#292333] text-white border-b border-[#62339A]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#62339A] text-white flex items-center justify-center shadow-lg shadow-[#62339A]/30">
              <Building2 className="w-6 h-6 text-[#BAE6FD]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  منصة BASIT | باسط — التعريف المؤسسي والوثائق الرسمية
                </h3>
                <span className="text-[10px] font-bold bg-[#0EA5E9] text-white px-2 py-0.5 rounded-full">
                  سجل 19132
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                BASIT | باسط · الوثائق المؤسسية والامتثال والمستندات الرسمية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation: Profile / Documents Vault / Packaging Emblem */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'bg-[#62339A] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>الأوراق والمستندات الرسمية (السجل والضرائب والمصدرين)</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-[#62339A] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>التعريف بالشركة ومجلس الإدارة</span>
            </button>

            <button
              onClick={() => setActiveTab('packaging')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'packaging'
                  ? 'bg-[#62339A] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>شعار وهوية الباكينج والتعبئة المعتمد</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isExportingPdf}
              onClick={handleDownloadDocPdf}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isExportingPdf ? 'جارٍ التصدير...' : 'تنزيل PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintDoc}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-[#62339A] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة A4</span>
            </button>
          </div>
        </div>

        {pdfFeedback && (
          <div
            className={`px-6 py-2 text-xs font-bold flex items-center gap-2 border-b ${
              pdfFeedback.kind === 'error'
                ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
            }`}
          >
            {pdfFeedback.kind === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{pdfFeedback.msg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: DOCUMENTS VAULT (Exact 6 pages with OCR & Official Details) */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left Selector List (4 cols) */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">
                  المستندات الرسمية المفحوصة والمطابقة:
                </span>

                {OFFICIAL_PAPERS.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F7F5FA] dark:bg-[#2A2040] border-[#62339A] shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{doc.titleAr}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#62339A]" />}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{doc.authorityAr.split('—')[0]}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <span>{doc.docNumber.split('·')[0]}</span>
                        <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>معتمد وساري</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Active Document High-Resolution Card (7 cols) */}
              <div
                ref={docCardRef}
                className="md:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                
                {/* Document Certificate Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#62339A] uppercase">وثيقة رسمية معتمدة — جمهورية مصر العربية</span>
                    <h4 className="font-black text-base text-slate-900 dark:text-white mt-0.5">{activeDoc.titleAr}</h4>
                    <p className="text-xs text-slate-500">{activeDoc.authorityAr}</p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1.5 shrink-0">
                    <QrCode className="w-full h-full text-slate-700 dark:text-slate-300" />
                  </div>
                </div>

                {/* Structured Metadata Fields from User's uploaded scan */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">رقم المستند / القيد</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{activeDoc.docNumber}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">صلاحية وسريان المستند</span>
                    <span className="font-bold text-emerald-600">{activeDoc.expiryDate}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">صاحب المنشأة والمفوض</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeDoc.ownerName}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">رأس المال المثبت</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeDoc.capital}</span>
                  </div>
                </div>

                {/* Registered Address */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block">المقر المسجل وعنوان النشاط:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{activeDoc.addressAr}</span>
                </div>

                {/* Certified Activities List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                    الأنشطة والترخيص المعتمد بالوثيقة:
                  </span>
                  <div className="space-y-1">
                    {activeDoc.activitiesList.map((act, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Stamp Banner */}
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-black text-emerald-800 dark:text-emerald-300 block">مطابق للأصل الورقي الممسوح ضوئياً</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">تم فحص مستندات مصلحة السجل التجاري والضرائب وهيئة الرقابة على الصادرات GOEIC</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePrintDoc}
                    className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    طباعة الوثيقة
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: COMPANY PROFILE (التعريف الشامل) */}
          {activeTab === 'profile' && (
            <div ref={profileCardRef} className="space-y-5 bg-white dark:bg-slate-900 rounded-3xl p-2">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#62339A] via-[#4A2378] to-[#62339A] text-white shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center p-2">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl">الشركة الوطنية اللوجستية لتوريدات المواد الغذائية</h3>
                    <p className="text-xs text-[#F7F5FA] font-medium">
                      ALWATANIYA LOGISTICS · إحدى كبرى المنظومات الوطنية للخدمات الغذائية والزراعية
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/95 leading-relaxed pt-2 border-t border-white/20">
                  منصة التقنية والإدارة والتشغيل الغذائي والزراعي، متخصصة في إدارة وتشغيل المطابخ المركزية الكبرى، إعاشة كبرى المصانع والشركات والمستشفيات، وخدمات الكنتين المتطورة، وإنتاج وتصدير الحاصلات الزراعية وتمور سيوة والوادي الجديد إلى مختلف الأسواق العالمية بأعلى شهادات الجودة وسلامة الغذاء.
                </p>
              </div>

              {/* Company Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-2xl font-black text-[#62339A] block">3</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">مطابخ مركزية كبرى</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">هنجر استيشن · بدر · بني سويف</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-2xl font-black text-[#62339A] block">18,500</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">وجبة يومية</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">طاقة إنتاجية معتمدة</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-2xl font-black text-emerald-600 block">100%</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">سلامة الغذاء HACCP</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">مطابقة ISO 22000 & NFSA</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-2xl font-black text-[#62339A] block">2,400</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">فدان مزارع تعاقدية</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">سيوة والوادي الجديد</span>
                </div>
              </div>

              {/* Leadership & Contacts */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">الإدارة التنفيذية والمفوض العام:</span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    م/ مصطفى شعبان عبد العليم الهلالي
                  </h4>
                  <p className="text-xs text-slate-500">
                    المدير التنفيذي للعمليات المركزية — الوطنية اللوجستية
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <a
                    href="tel:01010430347"
                    className="px-3.5 py-2 rounded-xl bg-[#62339A] text-white font-bold flex items-center gap-1.5 hover:bg-[#4A2378] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>01010430347</span>
                  </a>
                  <a
                    href="tel:01551411005"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-700 font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>01551411005</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PACKAGING & BRANDING EMBLEM (شعار الباكينج فقط) */}
          {activeTab === 'packaging' && (
            <div ref={packagingCardRef} className="space-y-4 text-center">
              <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-4 max-w-xl mx-auto">
                <span className="text-xs font-bold text-[#FFC928] tracking-widest uppercase">
                  الشعار والختم الرسمي للباكينج والتعبئة والمواسم
                </span>

                {/* Packaging Official Emblem Display */}
                <div className="w-48 h-48 mx-auto rounded-3xl bg-[#FAF9F6] p-1.5 border border-[#0EA5E9]/60 shadow-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/aistudio/basit-app-icon-04-white-brand-1024px_10788503.png"
                    alt="BASIT | باسط — الشعار الرسمي للباكينج والتعبئة والمواسم"
                    className="w-full h-full object-contain rounded-2xl drop-shadow-xl"
                  />
                </div>

                <div>
                  <h4 className="font-black text-lg text-white">
                    BASIT | باسط — الوطنية اللوجستية للتعبئة والتغذية والمواسم
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                    يعتمد هذا الشعار حصرياً على كافة عبوات التعبئة والباكينج: كرتونة وشنطة رمضان، أكياس لحوم الأضاحي، علب التمور الفاخرة، وحافظات الوجبات الساخنة المفرغة من الهواء.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-amber-400">
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>كرتونة وشنطة رمضان</span></span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>عبوات تمور سيوة والمجدول</span></span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>أكياس لحوم عيد الأضحى</span></span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>الشركة الوطنية اللوجستية لتوريدات المواد الغذائية — سجل تجاري رقم 19132</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
