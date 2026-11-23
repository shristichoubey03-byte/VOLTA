import React, { useState } from 'react';
import { 
  Users, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  ComposedChart
} from 'recharts';
import { DashboardSummary, PageType } from '../types';
import { Tooltip, COMMON_DEFINITIONS } from '../components/Tooltip';

interface OverviewPageProps {
  data: DashboardSummary | null;
  loading: boolean;
  onNavigate: (page: PageType) => void;
  onSelectAnomaly?: (id: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  data,
  loading,
  onNavigate,
  onSelectAnomaly
}) => {
  const [trendTimeframe, setTrendTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Select trend dataset based on toggle with unified keys
  const trendData = React.useMemo(() => {
    if (!data) return [];
    const { trends } = data;
    if (trendTimeframe === '24h') {
      return trends.hours_24.map(h => ({ label: h.label, actual: h.actual_kw, expected: h.expected_kw }));
    } else if (trendTimeframe === '7d') {
      return trends.days_7.map(d => ({ label: d.label, actual: d.actual_kwh, expected: d.expected_kwh }));
    } else {
      return trends.days_30.map(d => ({ label: d.label, actual: d.actual_kwh, expected: d.expected_kwh }));
    }
  }, [trendTimeframe, data]);

  if (loading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Loading VOLTA Overview Telemetry...</p>
      </div>
    );
  }

  const { kpis, category_distribution, forecast_24h, recent_alerts, quick_insights } = data;
  const trendUnit = trendTimeframe === '24h' ? 'kW' : 'kWh';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              VOLTA Overview Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SMART GRID
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time grid load monitoring, multi-consumer short-term forecasts, and active anomaly alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('forecasting')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none"
          >
            <TrendingUp className="w-4 h-4" />
            Launch Forecasting Engine
          </button>
        </div>
      </div>

      {/* 6 KPI Cards (Dark Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Total Consumers */}
        <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400">Total Consumers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {kpis.total_consumers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">100% Monitored</span>
            <span>across 4 zones</span>
          </div>
        </div>

        {/* KPI 2: Current Total Load */}
        <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              Current Load
              <Tooltip term="kW" definition={COMMON_DEFINITIONS.kW} />
            </span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {kpis.current_total_load_kw.toLocaleString()} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Aggregated instantaneous power
          </div>
        </div>

        {/* KPI 3: Predicted Next-Hour Load */}
        <div className="bg-[#131d33] p-4 rounded-2xl border border-cyan-800/60 shadow-lg shadow-cyan-950/40 bg-gradient-to-b from-cyan-950/30 to-[#131d33] hover:border-cyan-600 transition-all">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
              Next-Hour Forecast
              <Tooltip term="Forecast" definition="Machine-learning predicted total grid demand for the next immediate hour based on lag features and weather." />
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            {kpis.predicted_next_hour_kw.toLocaleString()} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1 font-medium">
            XGBoost Ensemble Model
          </div>
        </div>

        {/* KPI 4: Predicted 24-Hour Peak Load */}
        <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              24h Peak Demand
              <Tooltip term="Peak Load" definition={COMMON_DEFINITIONS.PeakDemand} />
            </span>
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            {kpis.predicted_24h_peak?.load_kw?.toLocaleString() || 'N/A'} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">
            At {kpis.predicted_24h_peak?.hour_label || '19:00'} ({kpis.predicted_24h_peak?.temperature || 32}°C)
          </div>
        </div>

        {/* KPI 5: Active Anomaly Alerts */}
        <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              Active Anomalies
              <Tooltip term="Anomalies" definition="Readings deviating significantly from expected baseline, detected by Isolation Forest & residual error." />
            </span>
            <AlertTriangle className={`w-4 h-4 ${kpis.active_anomalies_count > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${kpis.active_anomalies_count > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {kpis.active_anomalies_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pending engineering review
          </div>
        </div>

        {/* KPI 6: Average Daily Consumption */}
        <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              Avg Daily Energy
              <Tooltip term="kWh/day" definition={COMMON_DEFINITIONS.kWh} />
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {kpis.avg_daily_kwh_per_consumer} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Per consumer / day average
          </div>
        </div>
      </div>

      {/* Main Grid: Section A (Consumption Trend) & Section B (Category Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Electricity Consumption Trend */}
        <div className="lg:col-span-2 bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Electricity Consumption Trend
                <Tooltip term="Actual vs Expected" definition="Cyan represents actual metered consumption; Green dashed line represents the normal baseline calculated by the model." />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of actual electricity consumption vs normal baseline expected profile.
              </p>
            </div>

            {/* Timeframe Toggle Buttons */}
            <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium text-slate-400">
              <button
                onClick={() => setTrendTimeframe('24h')}
                className={`px-3 py-1 rounded-lg transition-colors ${trendTimeframe === '24h' ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'hover:text-white'}`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setTrendTimeframe('7d')}
                className={`px-3 py-1 rounded-lg transition-colors ${trendTimeframe === '7d' ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'hover:text-white'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTrendTimeframe('30d')}
                className={`px-3 py-1 rounded-lg transition-colors ${trendTimeframe === '30d' ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'hover:text-white'}`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit={` ${trendUnit}`} />
                <RechartsTooltip
                  formatter={(val: any) => [`${val} ${trendUnit}`, '']}
                  contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#94a3b8' }} />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="Actual Consumption" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  dot={false}
                  activeDot={{ r: 5, fill: '#38bdf8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expected" 
                  name="Expected Baseline" 
                  stroke="#34d399" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section B: Consumer Category Distribution */}
        <div className="bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Category Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current load contribution by consumer sector.
            </p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="current_load_kw"
                  nameKey="category"
                >
                  {category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} kW (${item.payload.share_pct}%) - ${item.payload.consumer_count} accounts`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            {category_distribution.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="truncate">
                  <div className="font-semibold text-slate-200 truncate">{cat.category}</div>
                  <div className="text-[11px] text-slate-400">{cat.share_pct}% ({cat.current_load_kw} kW)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Section C (Total Load Forecast Next 24 Hours) & Section D (Recent Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section C: Total Load Forecast */}
        <div className="lg:col-span-2 bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Total Grid Load Forecast (Next 24 Hours)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ML Prediction
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI predicted combined demand: <span className="font-mono text-cyan-400">Total Load(t) = Σ Load_i(t)</span> with 95% confidence band.
              </p>
            </div>

            <button
              onClick={() => onNavigate('forecasting')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 focus:outline-none"
            >
              Interactive Forecasting Engine <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast_24h} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour_label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kW" />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#070d19] text-white p-3 rounded-xl text-xs shadow-2xl border border-slate-700 space-y-1">
                          <div className="font-bold text-cyan-400">{label} ({item.day_label})</div>
                          <div>Predicted Total Load: <span className="font-bold text-white font-mono">{item.predicted_kw} kW</span></div>
                          <div className="text-slate-400">Confidence Band: {item.lower_bound_kw} kW – {item.upper_bound_kw} kW</div>
                          <div className="text-slate-400">Ambient Temp: {item.temperature}°C</div>
                          <div className="pt-1 text-[11px] font-semibold text-amber-400">{item.demand_category}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Area 
                  type="monotone" 
                  dataKey="upper_bound_kw" 
                  name="Confidence Range (95%)" 
                  stroke="none" 
                  fill="#0284c7" 
                  fillOpacity={0.2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted_kw" 
                  name="AI Forecast Total Load (kW)" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#38bdf8' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section D: Recent Alerts */}
        <div className="bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Recent Alerts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Unusual consumption patterns flagged.
              </p>
            </div>
            <button
              onClick={() => onNavigate('anomalies')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 focus:outline-none"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72">
            {recent_alerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl">
                No active anomaly alerts detected.
              </div>
            ) : (
              recent_alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    if (onSelectAnomaly) onSelectAnomaly(alert.id);
                    onNavigate('anomalies');
                  }}
                  className="p-3 rounded-xl border border-slate-800/90 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-200 font-mono">
                      {alert.consumer_id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.severity === 'Critical' 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                        : alert.severity === 'High' 
                          ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 truncate font-medium">
                    {alert.consumer_name}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800">
                    <span>Observed: <strong className="text-slate-200">{alert.actual_kw} kW</strong></span>
                    <span>Expected: <strong className="text-slate-200">{alert.expected_kw} kW</strong></span>
                    <span className="font-semibold text-rose-400">+{alert.deviation_pct}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section E: Quick Insights */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101b33] to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Automated Operational Insights (VOLTA Engine)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quick_insights.map((ins) => (
            <div key={ins.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="text-xs font-bold text-cyan-400 mb-1">
                {ins.type.toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-slate-100 leading-snug mb-1.5">
                {ins.text}
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                {ins.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
