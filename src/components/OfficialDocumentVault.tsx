import React, { useState } from 'react';
import { 
  VaultDocument, 
  VaultCategory, 
  RoleProfile 
} from '../types/dashboard';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Upload, 
  Download, 
  Printer, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Eye, 
  Scan, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  X, 
  Layers, 
  Sparkles,
  FileCheck2,
  Calendar,
  ExternalLink,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface OfficialDocumentVaultProps {
  documents: VaultDocument[];
  currentRole: RoleProfile;
  isRtl: boolean;
  onUpdateDocument?: (doc: VaultDocument) => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
  onClose?: () => void;
}

export const OfficialDocumentVault: React.FC<OfficialDocumentVaultProps> = ({
  documents,
  currentRole,
  isRtl,
  onUpdateDocument,
  onAddAuditLog,
  onClose
}) => {
  // Active selected document for full inspection / scanner
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument>(documents[0] || null);
  const [categoryFilter, setCategoryFilter] = useState<VaultCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scanner Mode Controls
  const [scannerFilter, setScannerFilter] = useState<'enhanced' | 'bw' | 'grayscale' | 'invert' | 'normal'>('enhanced');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isScanningBeamActive, setIsScanningBeamActive] = useState<boolean>(true);
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [generatedShareLink, setGeneratedShareLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Edit Metadata Form State
  const [editForm, setEditForm] = useState<{
    documentNumber: string;
    issuingAuthority: string;
    issueDate: string;
    expiryDate: string;
    reviewStatus: 'معتمد ومفهرس' | 'بانتظار الفحص والمراجعة' | 'يحتاج مراجعة وتحديث';
  }>({
    documentNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    reviewStatus: 'بانتظار الفحص والمراجعة'
  });

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesSearch = 
      doc.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.documentNumber && doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.issuingAuthority && doc.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handlers
  const handleSelectDoc = (doc: VaultDocument) => {
    setSelectedDoc(doc);
    setZoomLevel(1.0);
    setRotationAngle(0);
    setIsComparingOriginal(false);
  };

  const handleOpenEdit = () => {
    if (!selectedDoc) return;
    setEditForm({
      documentNumber: selectedDoc.documentNumber || '',
      issuingAuthority: selectedDoc.issuingAuthority || '',
      issueDate: selectedDoc.issueDate || '',
      expiryDate: selectedDoc.expiryDate || '',
      reviewStatus: selectedDoc.reviewStatus
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedDoc || !onUpdateDocument) return;
    const updated: VaultDocument = {
      ...selectedDoc,
      documentNumber: editForm.documentNumber,
      issuingAuthority: editForm.issuingAuthority,
      issueDate: editForm.issueDate,
      expiryDate: editForm.expiryDate,
      reviewStatus: editForm.reviewStatus,
      ocrNeedsReview: editForm.reviewStatus === 'بانتظار الفحص والمراجعة'
    };
    onUpdateDocument(updated);
    setSelectedDoc(updated);
    setIsEditModalOpen(false);
    onAddAuditLog(
      `تحديث بيانات المستند الرسمي: ${selectedDoc.titleAr}`,
      `Updated Vault Document: ${selectedDoc.titleEn}`,
      `تم تحديث رقم المستند والجهة وتاريخ الصلاحية وحالة الفهرسة.`
    );
  };

  const handleGenerateShareLink = (durationHours: number) => {
    const token = `CE-VAULT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const expires = new Date(Date.now() + durationHours * 3600 * 1000).toLocaleString('ar-EG');
    const shareUrl = `${window.location.origin}/vault-view?token=${token}&doc=${selectedDoc?.id}`;
    setGeneratedShareLink({ url: shareUrl, expiresAt: expires });
    onAddAuditLog(
      `توليد رابط مشاركة مؤقت للمستند: ${selectedDoc?.titleAr}`,
      `Generated Secure Share Link: ${selectedDoc?.titleEn}`,
      `رابط مشفر لمدة ${durationHours} ساعة برمز التوكن ${token}.`
    );
  };

  const handleCopyLink = () => {
    if (generatedShareLink) {
      navigator.clipboard.writeText(generatedShareLink.url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handleSimulatedUpload = (fileName: string, fileType: 'pdf' | 'png' | 'jpg') => {
    if (!selectedDoc || !onUpdateDocument) return;
    const updated: VaultDocument = {
      ...selectedDoc,
      fileName,
      fileType,
      fileSize: '2.4 MB',
      reviewStatus: 'معتمد ومفهرس',
      ocrConfidence: 98,
      ocrNeedsReview: false,
      ocrExtractedText: `جمهورية مصر العربية — وثيقة رسمية معتمدة لشركة كاترينج مصر (الوطنية اللوجستية) — تم فحص الأصل ومطابقته بالسجل والأوراق الثبوتية بنجاح بنسبة ثقة 98.4%.`
    };
    onUpdateDocument(updated);
    setSelectedDoc(updated);
    setIsUploadModalOpen(false);
    onAddAuditLog(
      `رفع وفحص مستند جديد: ${selectedDoc.titleAr}`,
      `Uploaded and Scanned Document: ${selectedDoc.titleEn}`,
      `تم استبدال ورفع الملف ${fileName} وإجراء الفحص البصري والـ OCR بنجاح.`
    );
  };

  // Determine filter CSS
  const getFilterStyle = () => {
    if (isComparingOriginal) return 'none';
    switch (scannerFilter) {
      case 'enhanced':
        return 'contrast(135%) brightness(105%) saturate(110%)';
      case 'bw':
        return 'grayscale(100%) contrast(200%) brightness(110%)';
      case 'grayscale':
        return 'grayscale(100%) contrast(120%)';
      case 'invert':
        return 'invert(100%) contrast(140%) hue-rotate(180deg)';
      default:
        return 'none';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
      
      {/* Top Header & Security Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#4A2378]/70 p-6 border-b border-[#62339A]/35 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#62339A]/10 border border-[#62339A]/35 flex items-center justify-center text-[#62339A] shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#62339A]/20 text-[#FFC928] border border-[#62339A]/40">
                خزينة الأمان والوثائق الرسمية
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>إشراف م/ مصطفى شعبان</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {isRtl ? 'الحافظة الرسمية للمستندات والشهادات المؤسسية' : 'Official Document & Legal Vault'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl 
                ? 'مستندات السجل التجاري، البطاقة الضريبية، بطاقة المصدرين، التراخيص الصحية وشهادات الهايجين مع ماسح بصري تفاعلي وتقنية الـ OCR.'
                : 'Commercial registry, VAT, Exporter card, food licenses & HACCP certificates with optical scanner & OCR.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#62339A]/25 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isRtl ? 'رفع أو استبدال أصل' : 'Upload Original'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left/Right Split (List & Scanner Viewport) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Column (Slots & Preconfigured Documents 1 to 7) - 4 cols */}
        <div className="lg:col-span-4 bg-slate-950/70 border-b lg:border-b-0 lg:border-l border-slate-800 p-4 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث في المستندات والجهات...' : 'Search documents...'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#62339A] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold text-slate-400">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  categoryFilter === 'all' ? 'bg-[#62339A] text-white font-bold' : 'bg-slate-900 hover:text-white'
                }`}
              >
                {isRtl ? 'الكل (7 خانات)' : 'All (7 Slots)'}
              </button>
              <button
                onClick={() => setCategoryFilter('commercial_registry')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  categoryFilter === 'commercial_registry' ? 'bg-[#62339A] text-white font-bold' : 'bg-slate-900 hover:text-white'
                }`}
              >
                {isRtl ? 'السجل التجاري' : 'Registry'}
              </button>
              <button
                onClick={() => setCategoryFilter('vat_tax_card')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  categoryFilter === 'vat_tax_card' ? 'bg-[#62339A] text-white font-bold' : 'bg-slate-900 hover:text-white'
                }`}
              >
                {isRtl ? 'الضرائب' : 'Tax'}
              </button>
              <button
                onClick={() => setCategoryFilter('exporter_card')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  categoryFilter === 'exporter_card' ? 'bg-[#62339A] text-white font-bold' : 'bg-slate-900 hover:text-white'
                }`}
              >
                {isRtl ? 'المصدرين' : 'Exporter'}
              </button>
            </div>
          </div>

          {/* Slots List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-[#62339A]/15 border-[#62339A] shadow-md shadow-[#62339A]/25'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        isSelected ? 'bg-[#62339A] text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{doc.slotNumber}
                      </div>
                      <span className="text-[11px] font-bold text-[#FFC928]">
                        {doc.categoryNameAr}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      doc.reviewStatus === 'معتمد ومفهرس'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {doc.reviewStatus === 'معتمد ومفهرس' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>معتمد</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>بانتظار الفحص</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mt-2 group-hover:text-[#FFC928] transition-colors">
                    {doc.titleAr}
                  </h3>

                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[150px]">
                      {doc.fileName}
                    </span>
                    <span className="font-semibold text-slate-300 uppercase">
                      {doc.fileType} · {doc.fileSize}
                    </span>
                  </div>

                  {/* OCR badge if pending review */}
                  {doc.ocrNeedsReview && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>يحتاج مراجعة ومطابقة الأصل بالبيانات</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Interactive Document Scanner & Viewer (8 cols) */}
        {selectedDoc ? (
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-slate-900/60">
            
            {/* Action Bar Above Viewport */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              
              {/* Document Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#62339A]/20 text-[#FFC928] flex items-center justify-center font-bold text-xs">
                  #{selectedDoc.slotNumber}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                    {selectedDoc.titleAr}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {selectedDoc.issuingAuthority || 'الجهة المصدرة غير محددة'}
                  </p>
                </div>
              </div>

              {/* Scanner Control Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                
                {/* Filter Selector */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                  <button
                    onClick={() => setScannerFilter('enhanced')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      scannerFilter === 'enhanced' && !isComparingOriginal ? 'bg-[#62339A] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="تحسين التباين والإضاءة"
                  >
                    Enhanced
                  </button>
                  <button
                    onClick={() => setScannerFilter('bw')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      scannerFilter === 'bw' && !isComparingOriginal ? 'bg-[#62339A] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="أبيض وأسود عالي الوضوح"
                  >
                    B&W
                  </button>
                  <button
                    onClick={() => setScannerFilter('grayscale')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      scannerFilter === 'grayscale' && !isComparingOriginal ? 'bg-[#62339A] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="تدرج رمادي مستندي"
                  >
                    Gray
                  </button>
                  <button
                    onClick={() => setScannerFilter('invert')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      scannerFilter === 'invert' && !isComparingOriginal ? 'bg-[#62339A] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="عكس الألوان لفحص الأختام"
                  >
                    Invert
                  </button>
                </div>

                {/* Compare Original Button */}
                <button
                  onClick={() => setIsComparingOriginal(!isComparingOriginal)}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isComparingOriginal 
                      ? 'bg-amber-600 text-white border-amber-500' 
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                  title="مقارنة المستند الخام بالأصل المعالج"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isComparingOriginal ? 'معاينة الأصل' : 'مقارنة'}</span>
                </button>

                {/* Scanning Beam Toggle */}
                <button
                  onClick={() => setIsScanningBeamActive(!isScanningBeamActive)}
                  className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    isScanningBeamActive 
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                  title={isScanningBeamActive ? 'إيقاف شعاع الماسح الضوئي' : 'تشغيل شعاع الماسح الضوئي'}
                >
                  <Scan className="w-4 h-4" />
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1.0, +(z - 0.2).toFixed(1)))}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    title="تصغير"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-300 px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    title="تكبير حتى 240%"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rotate 90 deg */}
                <button
                  onClick={() => setRotationAngle((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="تدوير 90 درجة"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Share Link Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[#FFC928] hover:text-[#FFC928] cursor-pointer"
                  title="مشاركة رابط مؤقت مشفر"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Edit Metadata */}
                <button
                  onClick={handleOpenEdit}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="تعديل وفهرسة البيانات"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Document Interactive Viewport Canvas */}
            <div className="relative flex-1 bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-4 min-h-[420px]">
              
              {/* Grid / Scanner Background Texture */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, #f97316 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Optical Scanning Beam Animation */}
              {isScanningBeamActive && (
                <div 
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFC928] to-transparent shadow-[0_0_15px_3px_#FFC928] z-20 pointer-events-none animate-bounce"
                  style={{ animationDuration: '3s' }}
                />
              )}

              {/* The Rendered Document Sheet Container */}
              <div 
                className="transition-all duration-200 shadow-2xl relative bg-white text-slate-900 p-6 sm:p-8 rounded-lg max-w-lg w-full min-h-[380px] flex flex-col justify-between border-4 border-slate-300 select-none"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                  filter: getFilterStyle()
                }}
              >
                {/* Watermark Emblem */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <div className="w-48 h-48 border-8 border-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-xl font-black text-slate-800 text-center tracking-widest uppercase">
                      BASIT | باسط<br />SECURE VAULT
                    </span>
                  </div>
                </div>

                {/* Document Header Inside Preview */}
                <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                  <div className="text-start">
                    <p className="text-[10px] font-extrabold text-slate-600 uppercase">
                      جمهورية مصر العربية
                    </p>
                    <p className="text-[11px] font-black text-slate-900">
                      {selectedDoc.issuingAuthority || 'الجهة الحكومية المعتمدة'}
                    </p>
                    <p className="text-[10px] font-bold text-[#4A2378] mt-0.5">
                      {selectedDoc.categoryNameAr}
                    </p>
                  </div>

                  <div className="text-end">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-400 rounded">
                      خانة رقم {selectedDoc.slotNumber}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {selectedDoc.documentNumber || 'REF: PENDING-INSPECT'}
                    </p>
                  </div>
                </div>

                {/* Document Body Body Content */}
                <div className="py-4 space-y-2 text-start">
                  <h4 className="text-sm font-black text-slate-900 text-center border-b border-dashed border-slate-400 pb-2">
                    {selectedDoc.titleAr}
                  </h4>

                  <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
                    {selectedDoc.ocrExtractedText || 'المستند بانتظار رفع الأصل وفحصه بالماسح الضوئي لاعتماد البيانات وتدقيق الرموز الرسمية.'}
                  </p>

                  <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-[10px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold">تاريخ الإصدار:</span>
                      <span>{selectedDoc.issueDate || 'بانتظار مراجعة الأصل'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">تاريخ الانتهاء/السريان:</span>
                      <span>{selectedDoc.expiryDate || 'ساري المفعول'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">ملف النظام:</span>
                      <span className="font-mono">{selectedDoc.fileName}</span>
                    </div>
                  </div>
                </div>

                {/* Document Stamp & Footer */}
                <div className="pt-3 border-t-2 border-slate-800 flex items-end justify-between">
                  <div className="text-start">
                    <div className="w-16 h-16 border-2 border-dashed border-red-600 rounded-full flex items-center justify-center text-center p-1 transform -rotate-12">
                      <span className="text-[8px] font-black text-red-600 uppercase">
                        خاتم النسر<br />المعتمد
                      </span>
                    </div>
                  </div>

                  <div className="text-end text-[9px] text-slate-500 space-y-0.5 font-mono">
                    <p>BASIT | باسط SECURE VAULT</p>
                    <p>DOCUMENT COMPLIANCE RECORD</p>
                    <p className="text-emerald-700 font-bold">SHA-256 DIGITAL COMPLIANCE</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Row: OCR Engine Status & Metadata Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* OCR Status */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
                    <span>دقة الفحص البصري OCR</span>
                  </span>
                  <span className="font-black text-[#FFC928]">
                    {selectedDoc.ocrConfidence || 92}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#F7F5FA]0 h-full rounded-full transition-all"
                    style={{ width: `${selectedDoc.ocrConfidence || 92}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {selectedDoc.ocrNeedsReview ? 'تم رصد نصوص غير مؤكدة تتطلب مطابقة الأصل.' : 'تمت المطابقة والفهرسة بنجاح.'}
                </p>
              </div>

              {/* Status & Clearance */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">حالة الفهرسة</span>
                  <span className={`text-xs font-bold ${
                    selectedDoc.reviewStatus === 'معتمد ومفهرس' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedDoc.reviewStatus}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono">
                  {selectedDoc.fileSize}
                </span>
              </div>

              {/* Document Number */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">رقم القيد / المستند</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {selectedDoc.documentNumber || 'بانتظار فحص الأصل'}
                  </span>
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="px-2 py-1 bg-[#62339A]/20 hover:bg-[#62339A]/30 text-[#FFC928] border border-[#62339A]/40 rounded-lg text-[10px] font-bold"
                >
                  فهرسة
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-12 text-slate-500">
            <p>اختر مستنداً من القائمة الجانبية لبدء الفحص</p>
          </div>
        )}

      </div>

      {/* Edit Metadata Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#62339A]" />
                <span>فهرسة وتحديث بيانات المستند #{selectedDoc?.slotNumber}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">رقم المستند / السجل / القيد الرسمي</label>
                <input
                  type="text"
                  value={editForm.documentNumber}
                  onChange={(e) => setEditForm({ ...editForm, documentNumber: e.target.value })}
                  placeholder="مثال: 104523 أو بانتظار فحص الأصل"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#62339A]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الجهة الحكومية أو الرقابية المصدرة</label>
                <input
                  type="text"
                  value={editForm.issuingAuthority}
                  onChange={(e) => setEditForm({ ...editForm, issuingAuthority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#62339A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ الإصدار</label>
                  <input
                    type="text"
                    value={editForm.issueDate}
                    onChange={(e) => setEditForm({ ...editForm, issueDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#62339A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">تاريخ الانتهاء</label>
                  <input
                    type="text"
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    placeholder="ساري / تاريخ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#62339A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">حالة الفحص والاعتماد</label>
                <select
                  value={editForm.reviewStatus}
                  onChange={(e) => setEditForm({ ...editForm, reviewStatus: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#62339A]"
                >
                  <option value="معتمد ومفهرس">معتمد ومفهرس</option>
                  <option value="بانتظار الفحص والمراجعة">بانتظار الفحص والمراجعة</option>
                  <option value="يحتاج مراجعة وتحديث">يحتاج مراجعة وتحديث</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-bold"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Share Link Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#62339A]" />
                <span>مشاركة مستند رسمي برابط مشفر مؤقت</span>
              </h3>
              <button onClick={() => { setIsShareModalOpen(false); setGeneratedShareLink(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              المستند: <span className="font-bold text-[#FFC928]">{selectedDoc?.titleAr}</span>
            </p>

            <div className="space-y-2">
              <label className="block text-xs text-slate-400 font-semibold">اختر مدة صلاحية الرابط:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleGenerateShareLink(24)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#62339A] text-xs font-bold text-center"
                >
                  24 ساعة
                </button>
                <button
                  onClick={() => handleGenerateShareLink(48)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#62339A] text-xs font-bold text-center"
                >
                  48 ساعة
                </button>
                <button
                  onClick={() => handleGenerateShareLink(168)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-[#62339A] text-xs font-bold text-center"
                >
                  7 أيام
                </button>
              </div>
            </div>

            {generatedShareLink && (
              <div className="bg-slate-950 border border-[#62339A]/35 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>صالح حتى: {generatedShareLink.expiresAt}</span>
                  <span className="text-emerald-400 font-bold">مشفر بـ Token</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedShareLink.url}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 rounded-lg bg-[#62339A] hover:bg-[#4A2378] text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copyFeedback ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <p>تنبيه: الروابط المفرغة يتم تسجيلها فورياً بسجل تدقيق العمليات Audit Trail بإشراف م/ مصطفى شعبان.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Replace Original Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#62339A]" />
                <span>رفع المستند الأصلي للخانة #{selectedDoc?.slotNumber}</span>
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-2 border-dashed border-[#62339A]/35 rounded-2xl bg-slate-950 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#62339A]/10 text-[#62339A] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">اختر ملف المستند أو اسحبه هنا</p>
                <p className="text-[10px] text-slate-400 mt-1">يدعم PDF، JPG، JPEG، PNG وسكان المسح الضوئي حتى 25 ميجابايت</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleSimulatedUpload(`${selectedDoc?.titleAr.replace(/\s+/g, '_')}_أصل.pdf`, 'pdf')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-[#62339A]/20 border border-slate-800 hover:border-[#62339A] text-xs font-bold text-white transition-colors"
                >
                  رفع كملف PDF رسمي
                </button>
                <button
                  onClick={() => handleSimulatedUpload(`${selectedDoc?.titleAr.replace(/\s+/g, '_')}_سكان.jpg`, 'jpg')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-[#62339A]/20 border border-slate-800 hover:border-[#62339A] text-xs font-bold text-white transition-colors"
                >
                  رفع كسكان صورة JPG
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              * بمجرد الرفع، سيتم تشغيل معالج التحسين البصري وتدقيق الـ OCR تلقائياً وتحديث حالة الخانة إلى «معتمد ومفهرس».
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
