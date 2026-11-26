import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  BarChart3, 
  Filter, 
  Download, 
  Printer, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Building2, 
  FileText, 
  Cpu, 
  Scale, 
  DollarSign, 
  Truck,
  Boxes,
  HelpCircle,
  X,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ClientTenant } from '../types/dashboard';

interface RawMaterialsForecastingHubProps {
  tenants: ClientTenant[];
  isRtl?: boolean;
  onOpenDocBuilder?: (type: 'quotation' | 'delivery_statement' | 'commercial_invoice' | 'e_invoice', company?: string) => void;
  onAddAuditLog: (actionAr: string, actionEn: string, details: string) => void;
  onShowToast: (msg: string) => void;
  onClose?: () => void;
}

// Monthly Raw Material BOM per 1,000 standard meals
const BASE_BOM_PER_1000_MEALS = {
  poultryKg: 190,      // دواجن وصدور (190 كجم لكل 1000 وجبة)
  meatKg: 120,         // لحوم بلدي ومفروم (120 كجم لكل 1000 وجبة)
  riceKg: 110,         // أرز بسمتي ومصري (110 كجم لكل 1000 وجبة)
  vegetablesKg: 240,   // خضروات طازجة وصلصة (240 كجم لكل 1000 وجبة)
  oilsLiters: 32,      // زيوت ذرة وسمن بلدي (32 لتر لكل 1000 وجبة)
  packagingUnits: 1050 // عبوات حرارية وأطقم ملاعق (1050 وحدة شاملة الهالك 5%)
};

// Unit Costs in EGP for procurement estimation
const UNIT_COSTS_EGP = {
  poultryKg: 135,
  meatKg: 380,
  riceKg: 38,
  vegetablesKg: 28,
  oilsLiters: 85,
  packagingUnits: 3.5
};

export const RawMaterialsForecastingHub: React.FC<RawMaterialsForecastingHubProps> = ({
  tenants,
  isRtl = true,
  onOpenDocBuilder,
  onAddAuditLog,
  onShowToast,
  onClose
}) => {
  // Scenario modifier: Slider to simulate contract volume changes (-20% to +50%)
  const [volumeMultiplier, setVolumeMultiplier] = useState<number>(1.0);
  
  // Selected category filter
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'protein' | 'carbs' | 'produce' | 'oils' | 'packaging'>('all');
  
  // Chart visual type: 'bar' | 'area' | 'line'
  const [chartType, setChartType] = useState<'bar' | 'area' | 'line'>('bar');
  
  // Active tenant filter (all or specific site)
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
  
  // Lead time procurement buffer (days of safety stock: 7, 14, 30 days)
  const [safetyBufferDays, setSafetyBufferDays] = useState<number>(14);

  // Calculate total daily meals across active contracts
  const totalBaseDailyMeals = useMemo(() => {
    const activeTenants = tenants.filter(t => t.contractStatus === 'active');
    if (selectedTenantId !== 'all') {
      const match = activeTenants.find(t => t.id === selectedTenantId);
      return match?.dailyMeals || 1000;
    }
    return activeTenants.reduce((acc, t) => acc + (t.dailyMeals || 0), 0);
  }, [tenants, selectedTenantId]);

  const effectiveDailyMeals = Math.round(totalBaseDailyMeals * volumeMultiplier);
  const monthlyTotalMeals = effectiveDailyMeals * 30;

  // 6-Month Forecasting Data with Seasonal & Ramadan Modifiers
  const monthlyForecastData = useMemo(() => {
    const months = [
      { key: 'nov26', nameAr: 'نوفمبر 2026', nameEn: 'Nov 2026', seasonFactor: 1.0, isWinter: true, isRamadan: false },
      { key: 'dec26', nameAr: 'ديسمبر 2026', nameEn: 'Dec 2026', seasonFactor: 1.08, isWinter: true, isRamadan: false },
      { key: 'jan27', nameAr: 'يناير 2027', nameEn: 'Jan 2027', seasonFactor: 1.12, isWinter: true, isRamadan: false },
      { key: 'feb27', nameAr: 'فبراير 2027 (موسم شعبان)', nameEn: 'Feb 2027', seasonFactor: 1.25, isWinter: false, isRamadan: false },
      { key: 'mar27', nameAr: 'مارس 2027 (شهر رمضان المبارك)', nameEn: 'Mar 2027 (Ramadan)', seasonFactor: 1.55, isWinter: false, isRamadan: true },
      { key: 'apr27', nameAr: 'أبريل 2027 (عيد الفطر والربيع)', nameEn: 'Apr 2027', seasonFactor: 1.18, isWinter: false, isRamadan: false },
    ];

    return months.map(m => {
      const meals = Math.round(monthlyTotalMeals * m.seasonFactor);
      const scaleFactor = meals / 1000;

      // In winter/Ramadan, meat and soup produce increases
      const poultryTons = Number(((scaleFactor * BASE_BOM_PER_1000_MEALS.poultryKg * (m.isRamadan ? 1.2 : 1.0)) / 1000).toFixed(2));
      const meatTons = Number(((scaleFactor * BASE_BOM_PER_1000_MEALS.meatKg * (m.isRamadan ? 1.4 : 1.0)) / 1000).toFixed(2));
      const riceTons = Number(((scaleFactor * BASE_BOM_PER_1000_MEALS.riceKg * (m.isRamadan ? 1.25 : 1.0)) / 1000).toFixed(2));
      const vegetablesTons = Number(((scaleFactor * BASE_BOM_PER_1000_MEALS.vegetablesKg * (m.isWinter ? 1.15 : 1.0)) / 1000).toFixed(2));
      const oilsTons = Number(((scaleFactor * BASE_BOM_PER_1000_MEALS.oilsLiters * 0.92) / 1000).toFixed(2));
      const packagingThousands = Number(((scaleFactor * BASE_BOM_PER_1000_MEALS.packagingUnits) / 1000).toFixed(1));

      // Estimated procurement cost in EGP Millions
      const costTotalMillions = Number((
        (poultryTons * 1000 * UNIT_COSTS_EGP.poultryKg +
         meatTons * 1000 * UNIT_COSTS_EGP.meatKg +
         riceTons * 1000 * UNIT_COSTS_EGP.riceKg +
         vegetablesTons * 1000 * UNIT_COSTS_EGP.vegetablesKg +
         (oilsTons * 1000 / 0.92) * UNIT_COSTS_EGP.oilsLiters +
         packagingThousands * 1000 * UNIT_COSTS_EGP.packagingUnits) / 1000000
      ).toFixed(2));

      return {
        month: isRtl ? m.nameAr : m.nameEn,
        shortMonth: isRtl ? m.nameAr.split(' ')[0] : m.nameEn.split(' ')[0],
        totalMeals: meals,
        poultryTons,
        meatTons,
        riceTons,
        vegetablesTons,
        oilsTons,
        packagingThousands,
        costTotalMillions,
        isRamadan: m.isRamadan
      };
    });
  }, [monthlyTotalMeals, isRtl]);

  // Current Month Forecast Totals (First month)
  const currentMonthForecast = monthlyForecastData[0];

  // Material Distribution Breakdown for Donut Chart
  const materialCostBreakdown = useMemo(() => {
    const poultryCost = currentMonthForecast.poultryTons * 1000 * UNIT_COSTS_EGP.poultryKg;
    const meatCost = currentMonthForecast.meatTons * 1000 * UNIT_COSTS_EGP.meatKg;
    const riceCost = currentMonthForecast.riceTons * 1000 * UNIT_COSTS_EGP.riceKg;
    const vegCost = currentMonthForecast.vegetablesTons * 1000 * UNIT_COSTS_EGP.vegetablesKg;
    const oilsCost = (currentMonthForecast.oilsTons * 1000 / 0.92) * UNIT_COSTS_EGP.oilsLiters;
    const packCost = currentMonthForecast.packagingThousands * 1000 * UNIT_COSTS_EGP.packagingUnits;

    return [
      { name: isRtl ? 'لحوم بلدية ومجمدة' : 'Beef & Meats', value: Math.round(meatCost), color: '#62339A' },
      { name: isRtl ? 'دواجن ومصنعات طازجة' : 'Poultry', value: Math.round(poultryCost), color: '#FFC928' },
      { name: isRtl ? 'أرز ونشويات وحبوب' : 'Rice & Grains', value: Math.round(riceCost), color: '#10b981' },
      { name: isRtl ? 'خضروات ومحاصيل طازجة' : 'Fresh Produce', value: Math.round(vegCost), color: '#06b6d4' },
      { name: isRtl ? 'زيوت وسمن بلدي' : 'Oils & Fats', value: Math.round(oilsCost), color: '#8b5cf6' },
      { name: isRtl ? 'تعبئة وتغليف حراري' : 'Packaging Trays', value: Math.round(packCost), color: '#ec4899' },
    ];
  }, [currentMonthForecast, isRtl]);

  // Client Contribution Breakdown
  const clientVolumeBreakdown = useMemo(() => {
    return tenants
      .filter(t => t.contractStatus === 'active')
      .map((t, idx) => {
        const colors = ['#62339A', '#3b82f6', '#10b981', '#FFC928', '#8b5cf6'];
        const share = Math.round(((t.dailyMeals || 0) / (totalBaseDailyMeals || 1)) * 100);
        return {
          name: isRtl ? t.nameAr : t.nameEn,
          meals: (t.dailyMeals || 0) * 30 * volumeMultiplier,
          share,
          color: colors[idx % colors.length]
        };
      });
  }, [tenants, totalBaseDailyMeals, volumeMultiplier, isRtl]);

  // Safety buffer stock in tons for decision making
  const bufferSafetyStock = useMemo(() => {
    const daysFactor = safetyBufferDays / 30;
    return {
      meat: (currentMonthForecast.meatTons * daysFactor).toFixed(1),
      poultry: (currentMonthForecast.poultryTons * daysFactor).toFixed(1),
      rice: (currentMonthForecast.riceTons * daysFactor).toFixed(1),
      veg: (currentMonthForecast.vegetablesTons * daysFactor).toFixed(1)
    };
  }, [currentMonthForecast, safetyBufferDays]);

  // Handle Export / Generate Purchase Order
  const handleGeneratePurchaseOrder = () => {
    const summary = `أمر شراء توريد خامات: لحوم ${currentMonthForecast.meatTons} طن، دواجن ${currentMonthForecast.poultryTons} طن، أرز ${currentMonthForecast.riceTons} طن`;
    onAddAuditLog(
      'توليد مقترح أمر شراء للمواد الخام',
      'Generated Raw Material Purchase Order Proposal',
      `تم استخراج أمر شراء دوري لشهر ${currentMonthForecast.month} بناءً على حجم تعاقدات العملاء (${effectiveDailyMeals.toLocaleString()} وجبة/يوم). إجمالي القيمة التقديرية: ${currentMonthForecast.costTotalMillions} مليون ج.م.`
    );
    onShowToast('تم إنشاء مسودة أمر الشراء وتوجيهها للمدير المالي م/ مصطفى شعبان.');
    if (onOpenDocBuilder) {
      onOpenDocBuilder('delivery_statement', 'الشركة الوطنية اللوجستية — قطاع التوريدات المركزية');
    }
  };

  return (
    <div className="space-y-6 bg-[#020617] text-white rounded-3xl p-4 sm:p-6 lg:p-8 border-2 border-[#62339A]/35 shadow-2xl overflow-hidden">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#62339A] to-[#4A2378] p-0.5 shadow-lg shadow-[#62339A]/25 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-[14px] flex items-center justify-center text-[#FFC928]">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full bg-[#62339A]/20 text-[#FFC928] border border-[#62339A]/35">
                محرك التنبؤ الذكي واحتياجات التوريد
              </span>
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                Recharts Analytics Engine v2.4
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white mt-1 leading-snug">
              توقعات استهلاك المواد الخام الشهرية وقرارات الشراء المسبقة
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              تحليل مباشر لحجم التعاقدات الحالية للعملاء والمستشفيات والمصانع لحساب كميات اللحوم، الدواجن، الحبوب، والخضروات بدقة بالغة.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-end md:self-auto">
          <button
            onClick={handleGeneratePurchaseOrder}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#62339A] to-[#4A2378] hover:from-[#4A2378] hover:to-[#62339A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#62339A]/25 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>إصدار أمر الشراء المقترح</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#292333] hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Control Strip & What-if Scenario Modifiers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-[#292333]/95 border border-slate-800">
        
        {/* Tenant Filter (4 cols) */}
        <div className="md:col-span-4 space-y-1.5 min-w-0">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#FFC928] shrink-0" />
            <span>نطاق العميل / التعاقد:</span>
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full max-w-full bg-[#020617] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#62339A] cursor-pointer truncate"
          >
            <option value="all">كافة التعاقدات النشطة ({tenants.filter(t => t.contractStatus === 'active').length} منشآت متعاقدة)</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.nameAr} ({t.dailyMeals?.toLocaleString()} وجبة/يوم)
              </option>
            ))}
          </select>
        </div>

        {/* What-If Slider (5 cols) */}
        <div className="md:col-span-5 space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>محاكي سيناريوهات التوسع (What-If Simulation):</span>
            </label>
            <span className="font-mono font-bold text-[#FFC928] bg-[#62339A]/10 px-2 py-0.5 rounded border border-[#62339A]/35">
              {volumeMultiplier === 1.0 ? 'حجم التعاقد الحالي (100%)' : `${Math.round(volumeMultiplier * 100)}% (${volumeMultiplier > 1 ? '+' : ''}${Math.round((volumeMultiplier - 1) * 100)}%)`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono">-20%</span>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={volumeMultiplier}
              onChange={(e) => setVolumeMultiplier(parseFloat(e.target.value))}
              className="flex-1 accent-[#62339A] cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono">+50%</span>
            <button
              onClick={() => setVolumeMultiplier(1.0)}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* Safety Buffer Stock Selector (3 cols) */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>رصيد الأمان الاستراتيجي (Safety Buffer):</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setSafetyBufferDays(days)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  safetyBufferDays === days
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {days} يوماً
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* KPI Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* KPI 1: Monthly Meals */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>إجمالي الوجبات الشهرية</span>
            <Calendar className="w-3.5 h-3.5 text-[#FFC928]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {monthlyTotalMeals.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#FFC928]">
            {effectiveDailyMeals.toLocaleString()} وجبة / يوم
          </div>
        </div>

        {/* KPI 2: Meat & Beef */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-[#62339A]/35 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>لحوم بلدية ومفروم</span>
            <Scale className="w-3.5 h-3.5 text-[#FFC928]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#FFC928] font-mono">
            {currentMonthForecast.meatTons} <span className="text-xs font-normal">طن</span>
          </div>
          <div className="text-[10px] text-slate-400">
            أمان {bufferSafetyStock.meat} طن ({safetyBufferDays} يوم)
          </div>
        </div>

        {/* KPI 3: Poultry */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>دواجن وفيليه طازج</span>
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {currentMonthForecast.poultryTons} <span className="text-xs font-normal">طن</span>
          </div>
          <div className="text-[10px] text-slate-400">
            أمان {bufferSafetyStock.poultry} طن ({safetyBufferDays} يوم)
          </div>
        </div>

        {/* KPI 4: Rice & Grains */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>أرز بسمتي ومصري</span>
            <Package className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {currentMonthForecast.riceTons} <span className="text-xs font-normal">طن</span>
          </div>
          <div className="text-[10px] text-slate-400">
            أمان {bufferSafetyStock.rice} طن ({safetyBufferDays} يوم)
          </div>
        </div>

        {/* KPI 5: Fresh Veg */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>خضروات المحاصيل</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            {currentMonthForecast.vegetablesTons} <span className="text-xs font-normal">طن</span>
          </div>
          <div className="text-[10px] text-slate-400">
            توريد أسبوعي مباشر
          </div>
        </div>

        {/* KPI 6: Total Estimated Procurement Budget */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>موازنة الشراء التقديرية</span>
            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
            {currentMonthForecast.costTotalMillions} <span className="text-xs font-normal">م.ج</span>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
            <ArrowDownRight className="w-3 h-3" />
            <span>وفر 12% شراء جملة</span>
          </div>
        </div>

      </div>

      {/* Main Interactive Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 6-Month Predictive Trajectory Chart (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FFC928]" />
                <h3 className="text-sm font-black text-white">
                  منحنى استهلاك الخامات للأشهر الستة القادمة (نوفمبر 2026 — أبريل 2027)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تأثير مواسم الشتاء وشعبان وشهر رمضان المبارك 2027 على حجم التوريدات
              </p>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartType === 'bar' ? 'bg-[#62339A] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                أعمدة
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartType === 'area' ? 'bg-[#62339A] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                مساحي
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartType === 'line' ? 'bg-[#62339A] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                خطي
              </button>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={monthlyForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis dataKey="shortMonth" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit=" طن" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#292333', borderColor: '#62339A', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Bar dataKey="meatTons" name={isRtl ? 'لحوم بلدية (طن)' : 'Beef (Tons)'} fill="#62339A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="poultryTons" name={isRtl ? 'دواجن طازجة (طن)' : 'Poultry (Tons)'} fill="#FFC928" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="riceTons" name={isRtl ? 'أرز وحبوب (طن)' : 'Rice (Tons)'} fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="vegetablesTons" name={isRtl ? 'خضروات طازجة (طن)' : 'Vegetables (Tons)'} fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartType === 'area' ? (
                <AreaChart data={monthlyForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis dataKey="shortMonth" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit=" طن" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#292333', borderColor: '#62339A', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="meatTons" name={isRtl ? 'لحوم (طن)' : 'Beef'} stroke="#62339A" fill="#62339A" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="poultryTons" name={isRtl ? 'دواجن (طن)' : 'Poultry'} stroke="#FFC928" fill="#FFC928" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="riceTons" name={isRtl ? 'أرز (طن)' : 'Rice'} stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="vegetablesTons" name={isRtl ? 'خضروات (طن)' : 'Veg'} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                </AreaChart>
              ) : (
                <LineChart data={monthlyForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis dataKey="shortMonth" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit=" طن" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#292333', borderColor: '#62339A', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="meatTons" name={isRtl ? 'لحوم (طن)' : 'Beef'} stroke="#62339A" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="poultryTons" name={isRtl ? 'دواجن (طن)' : 'Poultry'} stroke="#FFC928" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="riceTons" name={isRtl ? 'أرز (طن)' : 'Rice'} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="vegetablesTons" name={isRtl ? 'خضروات (طن)' : 'Veg'} stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Ramadan Alert Banner */}
          <div className="p-3.5 rounded-2xl bg-[#1E1410] bg-gradient-to-r from-amber-950/60 via-slate-900 to-[#4A2378]/70 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-slate-200 leading-relaxed">
                <strong className="text-amber-400">ذروة شهر رمضان المبارك 2027 (مارس):</strong> يقفز استهلاك اللحوم بنسبة <strong>+40%</strong> والتمور وكراتين الإغاثة بنسبة <strong>+180%</strong>. يوصى ببدء عقود التوريد الآجلة قبل 60 يوماً.
              </p>
            </div>
            <span className="font-mono font-bold text-amber-400 text-xs px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 whitespace-nowrap">
              +55% إجمالي
            </span>
          </div>

        </div>

        {/* Right: Material Cost Breakdown Donut & Contract Share (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Material Cost Donut Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>توزيع تكلفة الخامات للشهر الحالي:</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {currentMonthForecast.costTotalMillions} م.ج
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialCostBreakdown}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {materialCostBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [`${Number(val ?? 0).toLocaleString()} ج.م`, 'القيمة']}
                    contentStyle={{ backgroundColor: '#292333', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {materialCostBreakdown.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-300 truncate">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client Demand Share Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>حصة المنشآت المتعاقدة من الاستهلاك:</span>
              </h4>
            </div>

            <div className="space-y-2.5">
              {clientVolumeBreakdown.map((client, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-bold">{client.name}</span>
                    <span className="font-mono text-slate-400">{client.share}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${client.share}%`, backgroundColor: client.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Procurement Action Center & Strategic Decision Support */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#292333] bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-white">
                لوحة توجيه قرارات الشراء والتوريد المباشر (Procurement Decisions)
              </h4>
              <p className="text-[11px] text-slate-400">
                توصيات الذكاء الاصطناعي لتأمين أسعار الخامات وتحقيق أقصى وفر مالي
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
            محدث آلياً وفق العقود المعتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Action 1: Bulk Meat Contract */}
          <div className="p-4 rounded-2xl bg-[#020617] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-[#FFC928]">تعاقد اللحوم الربع سنوي</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold whitespace-nowrap">وفر متوقع 85,000 ج.م</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تثبيت سعر توريد {Number((currentMonthForecast.meatTons * 3).toFixed(2))} طن لحوم مع مجازر العاشر من رمضان المعتمدة لـ 3 أشهر يقي من تقلبات الأسعار.
            </p>
            <button
              onClick={handleGeneratePurchaseOrder}
              className="w-full py-2 px-3 bg-[#62339A]/15 hover:bg-[#4A2378]/25 text-[#FFC928] font-bold rounded-lg border border-[#62339A]/35 flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>إعداد مسودة التعاقد المسبق</span>
            </button>
          </div>

          {/* Action 2: Direct Produce from Siwa & Farms */}
          <div className="p-4 rounded-2xl bg-[#020617] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-cyan-400">توريد الحاصلات والتمور مباشرة</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold whitespace-nowrap">وفر وسيط 18%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              شحن مباشر لـ {currentMonthForecast.vegetablesTons} طن خضروات وتمور من مزارع النيل الأخضر والواحات يضمن صفر هوامش وسطاء وجودة طازجة 100%.
            </p>
            <button
              onClick={() => onShowToast('تم اعتماد خطة التوريد المباشر من مزارع الشركة')}
              className="w-full py-2 px-3 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold rounded-lg border border-cyan-500/30 flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>جدولة أسطول الشحن المبرد</span>
            </button>
          </div>

          {/* Action 3: Packaging & Stock Buffer */}
          <div className="p-4 rounded-2xl bg-[#020617] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-purple-400">طلبية التعبئة الحرارية</span>
              <span className="text-[10px] text-purple-300 font-mono font-bold whitespace-nowrap">
                {currentMonthForecast.packagingThousands} ألف طبق
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تأمين رصيد العلب الحرارية ذات الشعار الدائري الوطني لمصانع الأسمنت والمستشفيات يكفي لـ {safetyBufferDays} يوماً مقدماً.
            </p>
            <button
              onClick={() => onShowToast('تم جدولة تسليم العبوات الحرارية للمطابخ المركزية الثلاثة')}
              className="w-full py-2 px-3 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold rounded-lg border border-purple-500/30 flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>تأكيد طلب التعبئة والتغليف</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
