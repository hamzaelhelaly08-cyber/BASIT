import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Clock,
  Lock,
  ArrowRight,
  ArrowLeft,
  Video,
  Phone,
  Building2,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { VODAFONE_CASH_NUMBER, type LanguageCode } from '../data/phase1Data';
import {
  CHARITY_CARAVAN_CARTONS_IMG,
  CHARITY_GAZA_RELIEF_VIDEO,
  COMMUNITY_SEASONAL_EID_IMG,
} from '../data/visitorWorldData';
import type {
  CharityContributionDoc,
  CharityInitiativeDoc,
} from '../types/faydEcosystem';
import { submitCharityContribution } from '../services/faydFirestoreService';
import { Service3DIcon } from './Service3DIcon';

interface CharityGoodDeedsViewProps {
  lang: LanguageCode;
  user: User | null;
  initiatives: CharityInitiativeDoc[];
  myContributions: CharityContributionDoc[];
  onRequireSignIn: () => void;
  onBackHome: () => void;
  onToast: (msg: string) => void;
}

export const CharityGoodDeedsView: React.FC<CharityGoodDeedsViewProps> = ({
  lang,
  user,
  initiatives,
  myContributions,
  onRequireSignIn,
  onBackHome,
  onToast,
}) => {
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [selectedInitiative, setSelectedInitiative] = useState<CharityInitiativeDoc | null>(null);
  const [contributorName, setContributorName] = useState('');
  const [phone, setPhone] = useState('');
  const [pledgeAmountEGP, setPledgeAmountEGP] = useState('250');
  const [contributionNote, setContributionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInitiative) return;
    if (!user) {
      onRequireSignIn();
      return;
    }
    setSubmitting(true);
    try {
      const id = await submitCharityContribution(user, selectedInitiative, {
        contributorName: contributorName || user.displayName || 'مساهم',
        phone,
        contributionNote,
        pledgeAmountEGP: Math.max(0, Number(pledgeAmountEGP) || 0),
      });
      setSelectedInitiative(null);
      setContributionNote('');
      onToast(
        isRtl
          ? `تم تسجيل مساهمتك رقم ${id} في "${selectedInitiative.titleAr}". ستُحدّث الإحصائيات بعد التحقق والتنفيذ الموثق.`
          : `Charity contribution ${id} recorded.`
      );
    } catch (err) {
      onToast(
        err instanceof Error
          ? err.message
          : isRtl
            ? 'تعذر تسجيل المساهمة الخيرية.'
            : 'Failed to submit contribution.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full basit-glass-pill text-xs font-extrabold text-[#292333] dark:text-white cursor-pointer"
        >
          <BackIcon className="w-4 h-4 text-[#62339A] dark:text-[#A34FE8]" />
          <span>{isRtl ? 'العودة للرئيسية' : 'Back Home'}</span>
        </button>

        <span className="px-4 py-2 rounded-full basit-glass-pill text-xs font-black text-[#62339A] dark:text-[#A34FE8]">
          {isRtl ? 'قسم مستقل تماماً — اعمل الخير' : 'Standalone Division — Do Good'}
        </span>
      </div>

      {/* Hero Banner */}
      <section className="rounded-[28px] bg-gradient-to-br from-[#292333]/95 via-[#1E293B]/95 to-[#62339A]/95 backdrop-blur-xl text-white border border-white/25 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center gap-5">
        <Service3DIcon iconKey="charity" size="lg" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#A34FE8]">
            <HeartHandshake className="w-4 h-4" />
            <span>{isRtl ? 'بوابة اعمل الخير — BASIT | باسط' : 'BASIT Good Deeds & Charity Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isRtl
              ? 'المبادرات الخيرية والاستغاثة العاجلة — نكمل المشوار معاً'
              : 'Verified Good Deeds & Humanitarian Relief — Continuing Our Mission'}
          </h1>
          <p className="text-xs sm:text-sm text-[#E2E8F0] max-w-3xl leading-relaxed">
            {isRtl
              ? 'أعمال الخير والإغاثة في أصعب الظروف بالتعاون مع الهلال الأحمر المصري، مع توثيق فعلي لقوافل الخير والكراتين وتوزيعات المواسم. كافة الأعداد المعلنة تُستمد حصرياً من السجل الموثق في قاعدة البيانات.'
              : 'Humanitarian relief campaigns in partnership with the Egyptian Red Crescent, field caravans, and verified database records.'}
          </p>
        </div>
      </section>

      {/* Urgent Humanitarian Relief Video & Official Red Crescent Channels */}
      <section className="rounded-[28px] basit-liquid-glass overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 bg-[#292333] relative flex items-center justify-center">
          {videoFailed || !CHARITY_GAZA_RELIEF_VIDEO ? (
            <img
              src={CHARITY_CARAVAN_CARTONS_IMG}
              alt={isRtl ? 'حملة الإغاثة العاجلة — ساعة لغزة' : 'Urgent Relief — An Hour for Gaza'}
              className="w-full h-full max-h-[420px] object-cover"
            />
          ) : (
            <video
              controls
              playsInline
              preload="metadata"
              poster={CHARITY_CARAVAN_CARTONS_IMG}
              onError={() => setVideoFailed(true)}
              className="w-full h-full max-h-[420px] object-contain bg-black"
            >
              <source
                src={CHARITY_GAZA_RELIEF_VIDEO}
                type="video/mp4"
                onError={() => setVideoFailed(true)}
              />
              {isRtl
                ? 'متصفحك لا يدعم تشغيل الفيديو مباشرة.'
                : 'Your browser does not support video playback.'}
            </video>
          )}
        </div>

        <div className="lg:col-span-5 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0EA5E9] text-white text-[11px] font-black">
              <Video className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حملة الإغاثة العاجلة — ساعة لغزة' : 'Urgent Relief — An Hour for Gaza'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#292333] dark:text-white leading-snug">
              {isRtl
                ? 'أعمال الخير والاستغاثة في ظل أصعب الظروف — نكمل المشوار معاً'
                : 'Standing Together in the Toughest Moments'}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
              {isRtl
                ? 'مشاركة ميدانية متواصلة لتعبئة كراتين الإغاثة والمستلزمات الغذائية لإخواننا في غزة بالتعاون المباشر مع جمعية الهلال الأحمر المصري — القاهرة الكبرى، مصر الجديدة، العاشر من رمضان، العبور والتجمع.'
                : 'Ongoing relief packing with the Egyptian Red Crescent across Greater Cairo, Heliopolis, 10th of Ramadan, Obour & New Cairo.'}
            </p>
          </div>

          <div className="space-y-2.5 p-4 rounded-2xl basit-glass-tile text-xs">
            <div className="font-black text-[#62339A] dark:text-[#A34FE8]">
              {isRtl ? 'قنوات المساهمة الرسمية المعلنة بالحملة:' : 'Official Campaign Channels:'}
            </div>
            <div className="flex items-center gap-2 font-bold text-[#292333] dark:text-white">
              <Phone className="w-3.5 h-3.5 text-[#62339A] dark:text-[#A34FE8] shrink-0" />
              <span>{isRtl ? 'فودافون كاش المعتمد:' : 'Vodafone Cash:'}</span>
              <span className="font-mono font-black" dir="ltr">{VODAFONE_CASH_NUMBER}</span>
            </div>
            <div className="flex items-start gap-2 font-bold text-[#292333] dark:text-white">
              <Building2 className="w-3.5 h-3.5 text-[#62339A] dark:text-[#A34FE8] shrink-0 mt-0.5" />
              <span>
                {isRtl
                  ? 'مصرف أبوظبي الإسلامي (جميع فروع الجمهورية) — جمعية الهلال الأحمر المصري · حساب رقم: '
                  : 'ADIB Egypt — Egyptian Red Crescent Account: '}
                <span className="font-mono font-black text-[#62339A] dark:text-[#A34FE8]" dir="ltr">
                  200000584581
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Real Field Distribution Visuals (Replacing Empty Cartons) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-[28px] overflow-hidden basit-glass-tile flex flex-col">
          <div className="aspect-[16/10] overflow-hidden bg-[#292333]">
            <img
              src={CHARITY_CARAVAN_CARTONS_IMG}
              alt={isRtl ? 'قافلة الخير وتوزيع كراتين وشنط رمضان' : 'Charity Caravan & Relief Cartons'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full basit-glass-btn-yellow text-[10px] font-black">
              {isRtl ? 'قوافل الخير الميدانية' : 'Field Charity Caravans'}
            </span>
            <h3 className="text-sm font-black text-[#292333] dark:text-white">
              {isRtl ? 'تعبئة وتوزيع كراتين الخير وشنط رمضان للمستحقين' : 'Packing & Distributing Full Relief & Ramadan Cartons'}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {isRtl
                ? 'كراتين ممتلئة بالمواد الغذائية الأساسية وتوزيع مباشر للأسر والأحياء الأكثر احتياجاً.'
                : 'Fully packed essential food cartons delivered directly to families in need.'}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] overflow-hidden basit-glass-tile flex flex-col">
          <div className="aspect-[16/10] overflow-hidden bg-[#292333]">
            <img
              src={COMMUNITY_SEASONAL_EID_IMG}
              alt={isRtl ? 'توزيع شنط رمضان وكحك العيد ولحوم مزارع الفرافرة والوادي' : 'Community Ramadan, Eid Kahk & Farafra Farm Meat Distribution'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full basit-glass-btn-primary text-[10px] font-black">
              {isRtl ? 'من خير مزارع الفرافرة والوادي' : 'Farafra & New Valley Produce'}
            </span>
            <h3 className="text-sm font-black text-[#292333] dark:text-white">
              {isRtl ? 'شنط المواسم، كحك العيد، ولحوم الإطعام والأضاحي' : 'Seasonal Packs, Eid Kahk & Meat Distribution'}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {isRtl
                ? 'موائد وتوزيعات متكاملة للعيد والرمضانية ولحوم طازجة من مزارع الفرافرة والوادي.'
                : 'Community celebrations and fresh meat packs from Farafra & New Valley farms.'}
            </p>
          </div>
        </div>
      </section>

      {/* Initiatives List or Honest Empty State */}
      {initiatives.length === 0 ? (
        <div className="p-8 rounded-[28px] basit-liquid-glass text-center space-y-2.5">
          <ShieldCheck className="w-9 h-9 text-[#62339A] dark:text-[#A34FE8] mx-auto" />
          <h3 className="text-base font-black text-[#292333] dark:text-white">
            {isRtl
              ? 'لا توجد مبادرات خيرية معتمدة للعرض العام حالياً'
              : 'No approved charity initiatives published yet'}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-xl mx-auto">
            {isRtl
              ? 'التزاماً بالشفافية والمصداقية، لا يتم عرض حملات خيرية أو أرقام تبرعات افتراضية. ستظهر المبادرات هنا فور اعتمادها من الإدارة المركزية مع الجهة المنفذة وروابط الإثبات.'
              : 'No mock campaigns or estimated numbers are displayed. Initiatives appear here once approved in Central Admin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {initiatives.map((init) => (
            <div
              key={init.initiativeId}
              className="p-5 sm:p-6 rounded-[28px] basit-glass-tile space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#292333] text-[#62339A] dark:text-[#A34FE8] text-[11px] font-black">
                    {init.contributionType}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                    {isRtl ? `الجهة المنفذة: ${init.executingEntity}` : `Executing Entity: ${init.executingEntity}`}
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#292333] dark:text-white">
                  {isRtl ? init.titleAr : init.titleEn}
                </h3>

                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  {init.mechanismAr}
                </p>

                {/* Honest DB stats only */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/25 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      {isRtl ? 'المستهدف' : 'Goal'}
                    </div>
                    <div className="font-black text-[#292333] dark:text-white tabular-nums">
                      {init.targetGoalCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      {isRtl ? 'المساهمات الموثقة' : 'Verified'}
                    </div>
                    <div className="font-black text-[#62339A] dark:text-[#A34FE8] tabular-nums">
                      {init.recordedContributionsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      {isRtl ? 'تسليمات منجزة' : 'Delivered'}
                    </div>
                    <div className="font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {init.verifiedDeliveriesCount}
                    </div>
                  </div>
                </div>

                {init.proofMediaUrl && (
                  <a
                    href={init.proofMediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#62339A] dark:text-[#A34FE8] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'استعراض توثيق التنفيذ المعتمد' : 'View Execution Proof'}</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    onRequireSignIn();
                    return;
                  }
                  setSelectedInitiative(init);
                }}
                className="w-full py-2.5 rounded-full basit-glass-btn-primary text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-[#A34FE8]" />
                <span>{isRtl ? 'سجّل مساهمتك في هذه المبادرة' : 'Record Contribution'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My Contributions */}
      <section className="p-5 rounded-[28px] basit-liquid-glass space-y-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-black text-[#292333] dark:text-white">
            {isRtl ? 'سجل مساهماتي الخيرية وحالة التوثيق' : 'My Recorded Good Deeds Contributions'}
          </h3>
          {!user && (
            <button
              type="button"
              onClick={onRequireSignIn}
              className="px-4 py-2 rounded-full basit-glass-btn-primary font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#A34FE8]" />
              <span>{isRtl ? 'دخول لمتابعة المساهمات' : 'Sign in'}</span>
            </button>
          )}
        </div>

        {user && myContributions.length === 0 ? (
          <p className="text-[#64748B] dark:text-[#94A3B8]">
            {isRtl ? 'لا توجد مساهمات مسجلة بحسابك حتى الآن.' : 'No recorded contributions yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            {myContributions.map((c) => (
              <div
                key={c.contributionId}
                className="p-3.5 rounded-2xl basit-glass-tile flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="font-black text-[#292333] dark:text-white">{c.initiativeTitle}</div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {c.contributionId} · {c.pledgeAmountEGP} {isRtl ? 'ج.م' : 'EGP'} · {c.contributionNote}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.proofUrl && (
                    <a
                      href={c.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-black text-[#62339A] dark:text-[#A34FE8] hover:underline"
                    >
                      {isRtl ? 'ملف الإثبات' : 'Proof'}
                    </a>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full font-black flex items-center gap-1 ${
                      c.status === 'executed_verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-[#0EA5E9]/20 text-[#0369A1] dark:text-[#A34FE8]'
                    }`}
                  >
                    {c.status === 'executed_verified' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {c.status === 'executed_verified'
                        ? isRtl ? 'تم التنفيذ والتوثيق' : 'Executed & Verified'
                        : isRtl ? 'مسجلة — بانتظار التوثيق' : 'Recorded'}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contribution Modal */}
      {selectedInitiative && (
        <div
          className="fixed inset-0 z-50 bg-[#292333]/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedInitiative(null)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[28px] basit-liquid-glass p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-black text-[#292333] dark:text-white">
              {isRtl ? `مساهمة في: ${selectedInitiative.titleAr}` : selectedInitiative.titleEn}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'اسم المساهم / الجهة *' : 'Contributor Name *'}</label>
                <input
                  type="text"
                  required
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'رقم الهاتف *' : 'Phone *'}</label>
                <input
                  type="tel"
                  required
                  minLength={6}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'قيمة المساهمة (ج.م)' : 'Amount (EGP)'}</label>
                <input
                  type="number"
                  min={0}
                  value={pledgeAmountEGP}
                  onChange={(e) => setPledgeAmountEGP(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">{isRtl ? 'ملاحظات أو وصف المساهمة' : 'Contribution Note'}</label>
                <textarea
                  rows={3}
                  value={contributionNote}
                  onChange={(e) => setContributionNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] border border-[#E2E8F0] dark:border-[#62339A]/30"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInitiative(null)}
                className="px-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#292333] font-bold cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#62339A] text-white font-black cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? isRtl ? 'جاري التسجيل...' : 'Recording...'
                  : isRtl ? 'تسجيل المساهمة' : 'Submit Contribution'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
