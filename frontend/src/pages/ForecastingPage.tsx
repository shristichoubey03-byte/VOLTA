import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Zap, 
  Flame, 
  ArrowDownRight, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Download, 
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { runForecast, fetchConsumers } from '../services/api';
import { ForecastResponse, Consumer } from '../types';
import { Tooltip, COMMON_DEFINITIONS } from '../components/Tooltip';

export const ForecastingPage: React.FC = () => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(24);
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost Regressor');
  const [forecastResult, setForecastResult] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    fetchConsumers().then((data) => setConsumers(data.consumers)).catch(console.error);
    handleGenerateForecast();
  }, []);

  const handleGenerateForecast = () => {
    setLoading(true);
    setErrorMsg(null);
    runForecast(selectedTarget, selectedHorizon, selectedModel)
      .then((res) => {
        setForecastResult(res);
      })
      .catch((err) => {
        setErrorMsg('Failed to run forecast. Make sure backend is running.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  // Combine historical actual points with future predicted points for unified timeline
  const combinedChartData = React.useMemo(() => {
    if (!forecastResult) return [];
    const history = forecastResult.comparison_history.map((h) => ({
      ...h,
      type: 'Historical Actual',
      display_time: h.hour_label
    }));

    const future = forecastResult.forecast_timeline.map((f) => ({
      ...f,
      actual_kw: null,
      type: 'AI Prediction',
      display_time: f.hour_label
    }));

    if (history.length > 0 && future.length > 0) {
      history[history.length - 1].predicted_kw = history[history.length - 1].actual_kw;
    }

    return [...history, ...future];
  }, [forecastResult]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              VOLTA Short-Term Load Forecasting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-slate-950 shadow-md">
              CORE FEATURE
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Multi-consumer demand prediction using machine learning (1 Hour, 6 Hours, 24 Hours horizon).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Walk-Forward Autoregressive Pipeline
          </span>
        </div>
      </div>

      {/* Control Panel: Target, Duration, Model, Generate Button */}
      <div className="bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Forecasting Parameters & Model Setup
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1. Target Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Consumer Target:
            </label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">All Consumers (Combined Total Grid Load)</option>
              <optgroup label="Individual Consumers">
                {consumers.map((c) => (
                  <option key={c.consumer_id} value={c.consumer_id}>
                    {c.consumer_id} – {c.name} ({c.category})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Forecast Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Forecast Horizon:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Next 1h', value: 1 },
                { label: 'Next 6h', value: 6 },
                { label: 'Next 24h', value: 24 }
              ].map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setSelectedHorizon(h.value)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all text-center focus:outline-none ${
                    selectedHorizon === h.value
                      ? 'bg-cyan-500 text-slate-950 border-cyan-500 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. ML Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              ML Model:
              <Tooltip term="ML Models" definition="Choose between Gradient Boosting (XGBoost), Bagged Ensemble (Random Forest), Linear Regression, or Deep Sequential LSTM baseline." />
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="XGBoost Regressor">XGBoost Regressor (Recommended)</option>
              <option value="Random Forest Regressor">Random Forest Regressor (100 Trees)</option>
              <option value="Linear Regression">Linear Regression (Ridge L2 Baseline)</option>
              <option value="LSTM Neural Baseline">LSTM Neural Baseline (PyTorch/MLP)</option>
            </select>
          </div>

          {/* 4. Action Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateForecast}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Prediction...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Generate Forecast</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Prediction KPI Cards */}
      {forecastResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target & Horizon */}
          <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium mb-1">Target Entity</div>
            <div className="text-base font-bold text-white truncate">
              {forecastResult.target_name}
            </div>
            <div className="text-[11px] text-cyan-400 font-medium mt-1 flex items-center gap-1">
              <span>{forecastResult.model_used}</span>
              <span>• {forecastResult.horizon_hours}h Horizon</span>
            </div>
          </div>

          {/* Predicted Peak Demand */}
          <div className="bg-[#131d33] p-4 rounded-2xl border border-purple-800/60 shadow-lg shadow-purple-950/30 bg-gradient-to-br from-purple-950/30 to-[#131d33]">
            <div className="text-xs text-purple-300 font-semibold mb-1 flex items-center justify-between">
              <span>Predicted Peak Demand</span>
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300 font-mono">
              {forecastResult.peak_load.load_kw} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <div className="text-[11px] text-purple-400 mt-1">
              Expected at {forecastResult.peak_load.hour_label} ({forecastResult.peak_load.temperature}°C)
            </div>
          </div>

          {/* Predicted Minimum Load */}
          <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span>Minimum Valley Demand</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {forecastResult.min_load.load_kw} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Occurs at {forecastResult.min_load.hour_label}
            </div>
          </div>

          {/* Average Demand */}
          <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium mb-1">Average Predicted Load</div>
            <div className="text-2xl font-bold text-white font-mono">
              {forecastResult.average_predicted_kw} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Generated: {forecastResult.generated_at}
            </div>
          </div>
        </div>
      )}

      {/* Main Forecast Chart: Actuals transitioning to Predictions with Confidence Interval */}
      {forecastResult && (
        <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Actual vs Predicted Electricity Demand Timeline
                <Tooltip term="Timeline Graph" definition="Displays historical actual smart meter readings on the left, transitioning continuously into future predicted values with 95% confidence bands on the right." />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Solid blue: Historical actual load (kW) • Dashed cyan: Future forecasted load (kW) • Shaded band: Confidence interval.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Peak Marker:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                {forecastResult.peak_load.load_kw} kW at {forecastResult.peak_load.hour_label}
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={combinedChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="display_time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kW" />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const isFuture = item.type === 'AI Prediction';
                      return (
                        <div className="bg-[#070d19] text-white p-3 rounded-xl text-xs shadow-2xl border border-slate-700 space-y-1">
                          <div className="font-bold text-cyan-400">{label} ({item.type})</div>
                          {isFuture ? (
                            <>
                              <div>Predicted Load: <strong className="text-white font-mono">{item.predicted_kw} kW</strong></div>
                              <div className="text-slate-400">Range: {item.lower_bound_kw} kW – {item.upper_bound_kw} kW</div>
                              <div className="text-slate-400">Ambient Temp: {item.temperature}°C</div>
                              <div className="text-amber-400 font-semibold">{item.demand_category}</div>
                            </>
                          ) : (
                            <>
                              <div>Actual Consumption: <strong className="text-white font-mono">{item.actual_kw} kW</strong></div>
                              <div className="text-slate-400">Ambient Temp: {item.temperature}°C</div>
                            </>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                {/* Confidence range for future */}
                <Area 
                  type="monotone" 
                  dataKey="upper_bound_kw" 
                  name="Confidence Range (95%)" 
                  stroke="none" 
                  fill="#0284c7" 
                  fillOpacity={0.25} 
                />
                {/* Historical Actual line */}
                <Line 
                  type="monotone" 
                  dataKey="actual_kw" 
                  name="Historical Actual Load (kW)" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  dot={{ r: 2 }} 
                />
                {/* Future Predicted line */}
                <Line 
                  type="monotone" 
                  dataKey="predicted_kw" 
                  name="VOLTA AI Predicted Load (kW)" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4" 
                  dot={{ r: 3, fill: '#38bdf8' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Multi-Consumer Aggregated Breakdown (shown when ALL consumers is selected) */}
      {forecastResult && selectedTarget === 'ALL' && forecastResult.forecast_timeline[0]?.breakdown && (
        <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Category-Wise Forecast Contribution
              </h3>
              <p className="text-xs text-slate-400">
                Stacked breakdown of predicted demand across Residential, Commercial, Industrial, and Institutional sectors.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Total Load(t) = Σ Load_i(t)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={forecastResult.forecast_timeline.map((f) => ({
                  hour: f.hour_label,
                  Residential: f.breakdown?.Residential || 0,
                  Commercial: f.breakdown?.Commercial || 0,
                  Industrial: f.breakdown?.Industrial || 0,
                  Institutional: f.breakdown?.Institutional || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kW" />
                <RechartsTooltip
                  formatter={(val: any, name: any) => [`${val} kW`, name]}
                  contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="Residential" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Commercial" stackId="a" fill="#10b981" />
                <Bar dataKey="Industrial" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Institutional" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Forecast Explanation in Simple Plain Language */}
      {forecastResult && (
        <div className="bg-gradient-to-br from-[#070d19] via-[#101b33] to-[#070d19] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              VOLTA Forecast Explanation (Natural Language Interpretation)
            </h3>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-200">
            {forecastResult.explanation.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Key Demand Drivers
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {forecastResult.explanation.peak_drivers.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Actionable Grid Operator Recommendation
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {forecastResult.explanation.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Forecast Values Table */}
      {forecastResult && (
        <div className="bg-[#131d33] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Predicted Values Data Table
              </h3>
              <p className="text-[11px] text-slate-400">
                Hourly forecasted values with confidence margins and temperature context.
              </p>
            </div>

            <button
              onClick={() => {
                const csvHeader = 'Timestamp,Hour,Day,Predicted_kW,LowerBound_kW,UpperBound_kW,Temperature_C,Category\n';
                const csvRows = forecastResult.forecast_timeline.map(
                  (f) => `${f.timestamp},${f.hour_label},${f.day_label},${f.predicted_kw},${f.lower_bound_kw},${f.upper_bound_kw},${f.temperature},${f.demand_category}`
                ).join('\n');
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `volta_forecast_${forecastResult.target}_${forecastResult.horizon_hours}h.csv`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-slate-400 font-sans font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Hour</th>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3 text-right">Predicted Load (kW)</th>
                  <th className="py-2.5 px-3 text-right">95% Range (kW)</th>
                  <th className="py-2.5 px-3 text-right">Ambient Temp (°C)</th>
                  <th className="py-2.5 px-3 text-center">Demand Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {forecastResult.forecast_timeline.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400">{f.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-white font-sans">{f.hour_label}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{f.day_label}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                      {f.predicted_kw}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {f.lower_bound_kw} – {f.upper_bound_kw}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {f.temperature}°C
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.demand_category === 'Peak Demand' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        f.demand_category === 'High Demand' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        f.demand_category === 'Low Demand' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {f.demand_category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
