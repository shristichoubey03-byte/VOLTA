import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { fetchModelPerformance, retrainModels } from '../services/api';
import { ModelMetric } from '../types';
import { Tooltip, COMMON_DEFINITIONS } from '../components/Tooltip';

export const ModelPerformancePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [retraining, setRetraining] = useState<boolean>(false);
  const [retrainNotice, setRetrainNotice] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchModelPerformance()
      .then((res) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetrain = () => {
    setRetraining(true);
    setRetrainNotice(null);
    retrainModels()
      .then((res) => {
        setRetrainNotice(`Retraining completed in ${res.total_elapsed_sec}s across ${res.train_samples} training samples.`);
        loadData();
      })
      .catch((err) => {
        setRetrainNotice('Retraining encountered an issue.');
        console.error(err);
      })
      .finally(() => setRetraining(false));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            VOLTA Model Performance Benchmark
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirical evaluation of short-term forecasting algorithms using chronological walk-forward train-test validation.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
          {retraining ? 'Training Models on Holdout Data...' : 'Retrain All Models Live'}
        </button>
      </div>

      {retrainNotice && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{retrainNotice}</span>
        </div>
      )}

      {/* Evaluation Methodology Banner */}
      <div className="p-4 bg-slate-900/90 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-sm mb-0.5">
              Strict Chronological Validation Protocol
            </div>
            <p className="text-slate-300 leading-relaxed">
              To eliminate future-data leakage in academic evaluation, the 30-day smart-meter dataset is partitioned chronologically into 80% past training and 20% unseen future holdout test data. No random k-fold shuffling is used.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0 font-mono text-[11px] text-cyan-300">
          Walk-Forward Split: 80% Train / 20% Test
        </div>
      </div>

      {/* Model Performance Comparison Table */}
      <div className="bg-[#131d33] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Empirical Benchmark Metrics
          </h2>
          <p className="text-[11px] text-slate-400">
            Real measured metrics calculated on unseen holdout test readings.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Evaluation Horizon</th>
                <th className="py-3 px-4 text-right">
                  MAE (kW)
                  <Tooltip term="MAE" definition={COMMON_DEFINITIONS.MAE} />
                </th>
                <th className="py-3 px-4 text-right">
                  RMSE (kW)
                  <Tooltip term="RMSE" definition={COMMON_DEFINITIONS.RMSE} />
                </th>
                <th className="py-3 px-4 text-right">
                  MAPE (%)
                  <Tooltip term="MAPE" definition={COMMON_DEFINITIONS.MAPE} />
                </th>
                <th className="py-3 px-4 text-right">
                  R² Fit
                  <Tooltip term="R² Score" definition={COMMON_DEFINITIONS.R2} />
                </th>
                <th className="py-3 px-4 text-right">Training Time</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {data?.models?.map((m: ModelMetric) => (
                <tr key={m.model_name} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold font-sans text-white">
                    {m.model_name}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400">
                    {m.horizon}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-cyan-400">
                    {m.mae.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    {m.rmse.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                    {m.mape.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-purple-400">
                    {m.r2_score.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-sans">
                    {m.training_time_sec}s
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Comparison Bar Chart */}
      <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-base font-bold text-white mb-1">
          Model Error Metrics Comparison (MAE vs RMSE vs MAPE)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Lower bars represent superior predictive accuracy.
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.comparison_chart || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="model" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <RechartsTooltip
                formatter={(val: any, name: any) => [`${val}`, name]}
                contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="mae" name="Mean Absolute Error (MAE, kW)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rmse" name="Root Mean Squared Error (RMSE, kW)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mape" name="MAPE (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mathematical Formulas Card */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          Standard Academic Evaluation Formulas
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="font-bold font-sans text-white">Mean Absolute Error (MAE)</div>
            <div className="text-cyan-400 font-semibold">MAE = (1/n) × Σ |Actual - Predicted|</div>
            <div className="font-sans text-[11px] text-slate-400">Represents average absolute prediction error in kW.</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="font-bold font-sans text-white">Root Mean Squared Error (RMSE)</div>
            <div className="text-purple-400 font-semibold">RMSE = √((1/n) × Σ (Actual - Predicted)²)</div>
            <div className="font-sans text-[11px] text-slate-400">Penalizes large outlier forecast errors quadratically.</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="font-bold font-sans text-white">Mean Absolute % Error (MAPE)</div>
            <div className="text-emerald-400 font-semibold">MAPE = (100/n) × Σ |(Act - Pred) / max(Act, ε)|</div>
            <div className="font-sans text-[11px] text-slate-400">Safe denominator floor prevents zero-division singularity.</div>
          </div>
        </div>
      </div>

      {/* Beginner-Friendly Model Explanation Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          Understanding the 4 Forecasting Algorithms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.model_cards?.map((card: any) => (
            <div key={card.id} className="bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{card.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {card.suitability}
                </span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-200">How it works:</strong> {card.how_it_works}
              </div>

              <div className="text-xs text-emerald-300 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-900/60">
                <strong>Key Strengths:</strong> {card.advantages}
              </div>

              <div className="text-xs text-slate-400">
                <strong>Trade-offs:</strong> {card.limitations}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
