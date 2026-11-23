import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Printer, 
  Filter
} from 'lucide-react';
import { fetchReportsSummary } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [category, setCategory] = useState<string>('All');

  useEffect(() => {
    fetchReportsSummary(category, 'All')
      .then((res) => setData(res))
      .catch(console.error);
  }, [category]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto print:p-2 print:m-0 print:space-y-4 text-slate-100">
      {/* Page Heading (hidden or simplified on print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80 print:border-b-2 print:border-black">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            VOLTA Reports & Comprehensive Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1 print:text-black">
            Exportable multi-consumer electricity demand summaries, forecast evaluations, and anomaly incident logs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow-md transition-all focus:outline-none"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print / Save PDF
          </button>

          <a
            href="/api/reports/export/consumers"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Filter Bar (hidden in print) */}
      <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Institutional">Institutional</option>
            </select>
          </div>
        </div>

        {/* Quick CSV Export Links */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Download Data:</span>
          <a
            href="/api/reports/export/forecasts"
            className="text-cyan-400 hover:underline font-medium"
          >
            Forecasts CSV
          </a>
          <span className="text-slate-600">•</span>
          <a
            href="/api/reports/export/anomalies"
            className="text-rose-400 hover:underline font-medium"
          >
            Anomalies CSV
          </a>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block bg-slate-100 p-4 rounded-lg border border-slate-300 text-xs text-slate-800 mb-4">
        <div className="text-lg font-bold">VOLTA – OFFICIAL EXECUTIVE LOAD REPORT</div>
        <div>Generated: {data?.generated_at} | Scope: {category} Consumers</div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#131d33] p-3.5 rounded-2xl border border-slate-800 shadow-lg print:bg-white print:text-black">
          <div className="text-[11px] text-slate-400 print:text-slate-600">Monitored Consumers</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5 print:text-black">
            {data?.kpis.total_consumers_monitored}
          </div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-2xl border border-slate-800 shadow-lg print:bg-white print:text-black">
          <div className="text-[11px] text-slate-400 print:text-slate-600">Total Consumption</div>
          <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5 print:text-black">
            {data?.kpis.total_grid_consumption_kwh.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-2xl border border-slate-800 shadow-lg print:bg-white print:text-black">
          <div className="text-[11px] text-slate-400 print:text-slate-600">Avg Hourly Load</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5 print:text-black">
            {data?.kpis.average_hourly_demand_kw} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-2xl border border-slate-800 shadow-lg print:bg-white print:text-black">
          <div className="text-[11px] text-slate-400 print:text-slate-600">Peak Load Observed</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-0.5 print:text-black">
            {data?.kpis.peak_demand_kw} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-2xl border border-slate-800 shadow-lg print:bg-white print:text-black">
          <div className="text-[11px] text-slate-400 print:text-slate-600">Avg Daily Usage</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5 print:text-black">
            {data?.kpis.average_daily_kwh_per_consumer} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
        </div>

        <div className="bg-[#131d33] p-3.5 rounded-2xl border border-slate-800 shadow-lg print:bg-white print:text-black">
          <div className="text-[11px] text-slate-400 print:text-slate-600">Anomalies Detected</div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-0.5 print:text-black">
            {data?.kpis.anomalies_detected}
          </div>
        </div>
      </div>

      {/* Consumer-Wise Consumption Breakdown Table */}
      <div className="bg-[#131d33] rounded-2xl border border-slate-800 shadow-lg overflow-hidden print:border-slate-400 print:bg-white print:text-black">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
            Consumer-Wise Electricity Consumption Audit
          </h2>
          <span className="text-xs text-slate-400 print:text-slate-600">Sorted by Total Consumption</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] print:text-black">
              <tr>
                <th className="py-2.5 px-3">Consumer ID</th>
                <th className="py-2.5 px-3">Consumer Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Contract Capacity</th>
                <th className="py-2.5 px-3 text-right">Average Load</th>
                <th className="py-2.5 px-3 text-right">Peak Load</th>
                <th className="py-2.5 px-3 text-right">Total Energy (30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {data?.consumer_breakdown?.map((c: any) => (
                <tr key={c.consumer_id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                  <td className="py-2.5 px-3 font-bold text-cyan-400 print:text-black">{c.consumer_id}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200 print:text-black">{c.name}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 print:text-black">{c.category}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 print:text-black">{c.location}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 print:text-black">{c.capacity_kw} kW</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 print:text-black">{c.avg_kw} kW</td>
                  <td className="py-2.5 px-3 text-right font-bold text-purple-400 print:text-black">{c.peak_kw} kW</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400 print:text-black">{c.total_kwh.toLocaleString()} kWh</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Benchmark Performance Summary */}
      <div className="bg-[#131d33] rounded-2xl border border-slate-800 shadow-lg p-5 print:border-slate-400 print:bg-white print:text-black">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 print:text-black">
          Model Evaluation Snapshot (Holdout Test Performance)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {data?.model_performance_summary?.map((m: any) => (
            <div key={m.model_name} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 print:bg-white print:text-black">
              <div className="font-bold text-white mb-1 print:text-black">{m.model_name}</div>
              <div className="space-y-0.5 text-slate-300 font-mono text-[11px] print:text-black">
                <div>MAE: <strong className="text-cyan-400 print:text-black">{m.mae} kW</strong></div>
                <div>RMSE: <strong>{m.rmse} kW</strong></div>
                <div>MAPE: <strong className="text-emerald-400 print:text-black">{m.mape}%</strong></div>
                <div>R² Score: <strong>{m.r2_score}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
