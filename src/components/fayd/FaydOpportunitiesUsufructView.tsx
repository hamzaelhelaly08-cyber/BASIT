import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Scale,
  Plus,
  Handshake,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileCheck2,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { LanguageCode } from '../../data/phase1Data';
import type {
  CommissionRuleDoc,
  FaydOpportunityDoc,
  OpportunityKind,
  UsufructContractDoc,
  UsufructProposalDoc,
} from '../../types/faydEcosystem';
import {
  siteOwnerRespondUsufruct,
  submitFaydOpportunity,
  submitUsufructProposal,
} from '../../services/faydFirestoreService';

interface FaydOpportunitiesUsufructViewProps {
  lang: LanguageCode;
  user: User | null;
  onRequireSignIn: () => void;
  approvedOpportunities: FaydOpportunityDoc[];
  myOpportunities: FaydOpportunityDoc[];
  myProposalsAsProposer: UsufructProposalDoc[];
  myProposalsAsOwner: UsufructProposalDoc[];
  myContractsAsProposer: UsufructContractDoc[];
  myContractsAsOwner: UsufructContractDoc[];
  commissionRule: CommissionRuleDoc;
  onExportContractPdf: (companyTitle: string) => void;
  onToast: (msg: string) => void;
}

export const FaydOpportunitiesUsufructView: React.FC<FaydOpportunitiesUsufructViewProps> = ({
  lang,
  user,
  onRequireSignIn,
  approvedOpportunities,
  myOpportunities,
  myProposalsAsProposer,
  myProposalsAsOwner,
  myContractsAsProposer,
  myContractsAsOwner,
  commissionRule,
  onExportContractPdf,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const [subTab, setSubTab] = useState<'opportunities' | 'usufruct_proposals' | 'active_contracts'>('opportunities');

  // New Opportunity Form (Enforces explicit commercial terms & non-free investment/cost > 0)
  const [oppKind, setOppKind] = useState<OpportunityKind>('commercial_site');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('تشغيل مطعم / مطبخ / مصنع');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [commercialTerms, setCommercialTerms] = useState('');
  const [costEGP, setCostEGP] = useState('50000');
  const [submittingOpp, setSubmittingOpp] = useState(false);

  // Proposal Modal state
  const [proposalTargetOpp, setProposalTargetOpp] = useState<FaydOpportunityDoc | null>(null);
  const [proposerPct, setProposerPct] = useState(50);
  const [siteOwnerPct, setSiteOwnerPct] = useState(50 - (commissionRule.defaultUsufructPlatformPct || 10));
  const platformPct = commissionRule.defaultUsufructPlatformPct || 10;
  const [termsSummary, setTermsSummary] = useState('');

  const handleSubmitOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireSignIn();
      return;
    }
    const numCost = Number(costEGP);
    if (!numCost || numCost <= 0) {
      onToast(
        isRtl
          ? 'ممنوع افتراض المواقع أو الموارد مجاناً: يجب إدخال القيمة التجارية أو رأس المال بوضوح.'
          : 'Commercial value/investment must be > 0 (no free assumptions allowed).'
      );
      return;
    }
    setSubmittingOpp(true);
    try {
      const oppId = await submitFaydOpportunity(user, {
        oppKind,
        title,
        category,
        city,
        description,
        commercialTerms,
        costOrInvestmentEGP: numCost,
      });
      setTitle('');
      setCity('');
      setDescription('');
      setCommercialTerms('');
      onToast(
        isRtl
          ? `تم تقديم الفرصة ${oppId} للإدارة المركزية لمراجعة الشروط التجارية قبل النشر.`
          : `Opportunity ${oppId} submitted for Central Admin review.`
      );
    } finally {
      setSubmittingOpp(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !proposalTargetOpp) return;
    if (proposerPct + siteOwnerPct + platformPct !== 100) {
      onToast(
        isRtl
          ? 'يجب أن يكون مجموع نسب الأرباح (صاحب المشروع + صاحب الموقع + المنصة) = 100%.'
          : 'Profit split percentages must total exactly 100%.'
      );
      return;
    }
    const pid = await submitUsufructProposal(user, proposalTargetOpp, {
      proposerProfitPct: proposerPct,
      siteOwnerProfitPct: siteOwnerPct,
      platformUsufructPct: platformPct,
      termsSummary,
    });
    setProposalTargetOpp(null);
    setTermsSummary('');
    setSubTab('usufruct_proposals');
    onToast(
      isRtl
        ? `تم إرسال مسودة الانتفاع ${pid} لموافقة صاحب الفرصة ثم اعتماد الإدارة المركزية.`
        : `Usufruct proposal ${pid} submitted for party & admin approvals.`
    );
  };

  const myUniqueContracts = Array.from(
    new Map([...myContractsAsProposer, ...myContractsAsOwner].map((c) => [c.contractId, c])).values()
  );

  return (
    <div className="space-y-6">
      {/* Header + Governance Rule Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-[#62339A] dark:text-[#A34FE8]">
              BASIT OPPORTUNITIES &amp; USUFRUCT — تقنية الانتفاع والفرص
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#292333] dark:text-white mt-0.5">
              {isRtl
                ? 'قسم الفرص ومنظومة تقنية الانتفاع وتوزيع الأرباح'
                : 'BASIT Opportunities & Usufruct Profit-Share System'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ['opportunities', isRtl ? `الفرص (${approvedOpportunities.length})` : `Opportunities (${approvedOpportunities.length})`],
                ['usufruct_proposals', isRtl ? `مسودات الانتفاع (${myProposalsAsOwner.length + myProposalsAsProposer.length})` : 'Proposals'],
                ['active_contracts', isRtl ? `العقود المعتمدة (${myUniqueContracts.length})` : `Contracts (${myUniqueContracts.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSubTab(id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer ${
                  subTab === id
                    ? 'bg-[#62339A] text-white'
                    : 'bg-[#F8FAFC] dark:bg-slate-800 text-[#292333] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0EA5E9]/10 dark:bg-[#1E293B] border border-[#0EA5E9]/40 dark:border-[#62339A] text-xs text-[#292333] dark:text-slate-200 flex items-start gap-2.5 font-bold">
          <AlertTriangle className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8] shrink-0 mt-0.5" />
          <span>
            {isRtl
              ? 'الضابط التعاقدي الصارم: لا توجد مواقع أو موارد مجانية مفترضة، ولا ينشأ أي التزام مالي أو شراكة انتفاع إلا بعد موافقة الطرفين واعتماد الإدارة المركزية وإصدار عقد الانتفاع الرسمي.'
              : 'Strict Governance: Zero free-resource assumptions. No financial commitment activates until both parties agree and Central Admin issues a formal Usufruct Contract.'}
          </span>
        </div>
      </div>

      {/* SUBTAB 1: OPPORTUNITIES */}
      {subTab === 'opportunities' && (
        <div className="space-y-5">
          {/* Approved Public Opportunities Grid */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#62339A]" />
              <span>{isRtl ? 'الفرص والمواقع المعتمدة للشراكة' : 'Admin-Approved Commercial Opportunities'}</span>
            </h3>

            {approvedOpportunities.length === 0 ? (
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isRtl
                  ? 'لا توجد فرص منشورة حالياً. يمكنك طرح فرصة أو موقع أدناه ليتم فحص شروطها واعتمادها من الإدارة.'
                  : 'No approved opportunities published yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedOpportunities.map((opp) => (
                  <div
                    key={opp.oppId}
                    className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#62339A] text-white font-bold text-[10px]">
                        {opp.oppKind === 'commercial_site'
                          ? isRtl ? 'موقع / مساحة تجارية' : 'Commercial Site'
                          : isRtl ? 'مشروع / خبرة تشغيل' : 'Project / Expertise'}
                      </span>
                      <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#62339A]" /> {opp.city}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#292333] dark:text-white">{opp.title}</h4>
                    <p className="text-[#64748B] dark:text-slate-300 leading-relaxed">{opp.description}</p>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 space-y-1">
                      <div className="font-bold text-[#292333] dark:text-white">
                        {isRtl
                          ? `القيمة التجارية / الاستثمارية المحددة: ${opp.costOrInvestmentEGP.toLocaleString()} ج.م`
                          : `Required Value / Capital: ${opp.costOrInvestmentEGP.toLocaleString()} EGP`}
                      </div>
                      <div className="text-[#64748B] dark:text-slate-300">{opp.commercialTerms}</div>
                    </div>
                    {user && opp.ownerUid !== user.uid && (
                      <button
                        type="button"
                        onClick={() => {
                          setProposalTargetOpp(opp);
                          setProposerPct(50);
                          setSiteOwnerPct(Math.max(1, 50 - platformPct));
                        }}
                        className="w-full py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>{isRtl ? 'تقديم مسودة شراكة تقنية الانتفاع' : 'Propose Usufruct Partnership'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit New Opportunity Form */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#62339A]" />
              <span>{isRtl ? 'طرح مشروع / خبرة أو موقع تجاري جديد' : 'Submit New Project or Commercial Site'}</span>
            </h3>

            <form onSubmit={handleSubmitOpp} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-[#292333] dark:text-slate-200">{isRtl ? 'نوع الطرح *' : 'Opportunity Kind *'}</label>
                <select
                  value={oppKind}
                  onChange={(e) => setOppKind(e.target.value as OpportunityKind)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
                >
                  <option value="commercial_site">{isRtl ? 'موقع أو مطبخ أو مصنع متاح للتشغيل' : 'Commercial Site / Factory / Kitchen'}</option>
                  <option value="project_expertise">{isRtl ? 'مشروع أو فريق خبرة يبحث عن موقع/شريك' : 'Operational Project / Expertise'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#292333] dark:text-slate-200">{isRtl ? 'عنوان الفرصة *' : 'Opportunity Title *'}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isRtl ? 'مثال: نقطة تجهيز ومطعم بمنطقة المصانع ببدر' : 'Title'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#292333] dark:text-slate-200">{isRtl ? 'القطاع / النشاط *' : 'Category *'}</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#292333] dark:text-slate-200">{isRtl ? 'المدينة / الموقع الجغرافي *' : 'City *'}</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isRtl ? 'بدر / العاشر / القاهرة / الدوحة / مسقط / لندن' : 'City'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold mb-1 text-[#292333] dark:text-slate-200">
                  {isRtl ? 'القيمة التجارية / التكلفة أو رأس المال المطلوب (ج.م) — إلزامي > 0 *' : 'Commercial Cost / Required Capital (EGP > 0) *'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={costEGP}
                  onChange={(e) => setCostEGP(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#292333] dark:text-slate-200">{isRtl ? 'وصف الفرصة والتجهيزات *' : 'Description *'}</label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#292333] dark:text-slate-200">
                  {isRtl ? 'الشروط التجارية والالتزامات التعاقدية الصريحة *' : 'Explicit Commercial & Contractual Terms *'}
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  value={commercialTerms}
                  onChange={(e) => setCommercialTerms(e.target.value)}
                  placeholder={isRtl ? 'وضّح الإيجار أو نسبة الانتفاع والمدة والالتزامات...' : 'Rental / revenue-share terms and duration...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700 resize-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingOpp}
                  className="px-6 py-2.5 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer"
                >
                  {isRtl ? 'إرسال الفرصة لاعتماد الإدارة المركزية' : 'Submit Opportunity for Admin Review'}
                </button>
              </div>
            </form>

            {user && myOpportunities.length > 0 && (
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800 space-y-2">
                <div className="text-xs font-black text-[#292333] dark:text-slate-200">
                  {isRtl ? 'الفرص التي طرحتها وحالة اعتمادها' : 'My Submitted Opportunities'}
                </div>
                {myOpportunities.map((o) => (
                  <div
                    key={o.oppId}
                    className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 flex items-center justify-between text-xs border border-[#E2E8F0] dark:border-slate-700"
                  >
                    <span className="font-bold">{o.title}</span>
                    <span className="font-extrabold text-[#62339A] dark:text-[#A34FE8]">{o.approvalStatus}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: USUFRUCT PROPOSALS */}
      {subTab === 'usufruct_proposals' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-5 shadow-xs">
          <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#62339A]" />
            <span>{isRtl ? 'مسودات شراكات الانتفاع والاعتمادات الثنائية' : 'Usufruct Proposals & Party Approvals'}</span>
          </h3>

          {/* Incoming proposals awaiting my consent as Opportunity Owner */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#64748B] dark:text-slate-300">
              {isRtl ? 'طلبات شراكة واردة على فرصي' : 'Incoming Proposals on My Opportunities'} ({myProposalsAsOwner.length})
            </h4>
            {myProposalsAsOwner.map((p) => (
              <div
                key={p.proposalId}
                className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-black text-[#292333] dark:text-white">
                    {p.proposerName} — ({p.proposalId})
                  </div>
                  <span className="font-bold text-[#62339A] dark:text-[#A34FE8]">{p.status}</span>
                </div>
                <div className="font-bold text-[#292333] dark:text-slate-200">
                  {isRtl
                    ? `نسب الأرباح: صاحب المشروع ${p.proposerProfitPct}% · صاحب الموقع ${p.siteOwnerProfitPct}% · منصة باسط ${p.platformUsufructPct}%`
                    : `Split: Proposer ${p.proposerProfitPct}% · Owner ${p.siteOwnerProfitPct}% · BASIT ${p.platformUsufructPct}%`}
                </div>
                <p className="text-[#64748B] dark:text-slate-300">{p.termsSummary}</p>

                {user && p.status === 'awaiting_site_owner' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        siteOwnerRespondUsufruct(user, p.proposalId, true).then(() =>
                          onToast(isRtl ? 'تمت موافقتك وتحويل المسودة لاعتماد الإدارة المركزية.' : 'Approved and forwarded to Admin.')
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'موافقة على المسودة وإحالتها للإدارة' : 'Agree & Send to Admin'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => siteOwnerRespondUsufruct(user, p.proposalId, false)}
                      className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'رفض' : 'Reject'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Proposals I submitted */}
          <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-slate-800">
            <h4 className="text-xs font-black text-[#64748B] dark:text-slate-300">
              {isRtl ? 'المسودات التي قدمتها' : 'My Submitted Proposals'} ({myProposalsAsProposer.length})
            </h4>
            {myProposalsAsProposer.map((p) => (
              <div
                key={p.proposalId}
                className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#292333] dark:text-white">
                    {p.proposalId} ({p.proposerProfitPct}% / {p.siteOwnerProfitPct}% / {p.platformUsufructPct}%)
                  </div>
                  <div className="text-[#64748B] dark:text-slate-400">{p.termsSummary}</div>
                </div>
                <span className="font-black text-[#62339A] dark:text-[#A34FE8]">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: OFFICIAL APPROVED USUFRUCT CONTRACTS */}
      {subTab === 'active_contracts' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="text-base font-black text-[#292333] dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#62339A]" />
            <span>{isRtl ? 'عقود تقنية الانتفاع الموثقة والمفعّلة' : 'Official Approved Usufruct Contracts'}</span>
          </h3>

          {myUniqueContracts.length === 0 ? (
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {isRtl
                ? 'لا توجد عقود انتفاع مصدرة لك بعد. يظهر العقد هنا فقط بعد موافقة الطرفين واعتماد الإدارة المركزية.'
                : 'No issued Usufruct contracts yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {myUniqueContracts.map((cnt) => (
                <div
                  key={cnt.contractId}
                  className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono font-black text-[#292333] dark:text-white">{cnt.contractId}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        {cnt.contractStatus}
                      </span>
                    </div>
                    <div className="font-bold text-[#292333] dark:text-slate-200">
                      {isRtl
                        ? `التوزيع المعتمد: مشروع ${cnt.proposerProfitPct}% · موقع ${cnt.siteOwnerProfitPct}% · المنصة ${cnt.platformUsufructPct}%`
                        : `Approved Split: ${cnt.proposerProfitPct}% / ${cnt.siteOwnerProfitPct}% / ${cnt.platformUsufructPct}%`}
                    </div>
                    <p className="text-[#64748B] dark:text-slate-300">{cnt.commercialTerms}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onExportContractPdf(`عقد انتفاع BASIT | باسط رقم ${cnt.contractId}`)
                    }
                    className="px-4 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'إصدار مستند العقد PDF' : 'Export Contract PDF'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proposal Creation Modal */}
      {proposalTargetOpp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitProposal}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 p-6 space-y-4 text-xs shadow-2xl"
          >
            <h3 className="text-base font-black text-[#292333] dark:text-white">
              {isRtl ? `مسودة اتفاق انتفاع على: ${proposalTargetOpp.title}` : `Usufruct Proposal: ${proposalTargetOpp.title}`}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'حصة المشروع %' : 'Proposer %'}</label>
                <input
                  type="number"
                  min={1}
                  max={95}
                  value={proposerPct}
                  onChange={(e) => setProposerPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'حصة الموقع %' : 'Site Owner %'}</label>
                <input
                  type="number"
                  min={1}
                  max={95}
                  value={siteOwnerPct}
                  onChange={(e) => setSiteOwnerPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'نسبة باسط %' : 'BASIT %'}</label>
                <input
                  type="number"
                  disabled
                  value={platformPct}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 opacity-75"
                />
              </div>
            </div>
            <div className="font-bold text-[#62339A] dark:text-[#A34FE8]">
              {isRtl
                ? `الإجمالي: ${proposerPct + siteOwnerPct + platformPct}% (يجب أن يساوي 100%)`
                : `Total: ${proposerPct + siteOwnerPct + platformPct}% (must equal 100%)`}
            </div>
            <div>
              <label className="block font-bold mb-1">{isRtl ? 'بنود وشروط الشراكة المطلوب اعتمادها *' : 'Terms Summary *'}</label>
              <textarea
                rows={3}
                required
                minLength={10}
                value={termsSummary}
                onChange={(e) => setTermsSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-700 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProposalTargetOpp(null)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 font-bold cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#62339A] hover:bg-[#4A2378] text-white font-black cursor-pointer"
              >
                {isRtl ? 'إرسال لموافقة الطرف الآخر' : 'Send Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
