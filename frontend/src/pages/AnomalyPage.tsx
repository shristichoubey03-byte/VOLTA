import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Filter, 
  RefreshCw, 
  ShieldAlert, 
  Eye, 
  Activity
} from 'lucide-react';
import { AnomalyItem } from '../types';
import { fetchAnomalies, runAnomalyScan } from '../services/api';
import { AnomalyDetailModal } from './AnomalyDetailModal';

export const AnomalyPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, critical: 0, high: 0, moderate: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [inspectAnomalyId, setInspectAnomalyId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchAnomalies({
      severity: selectedSeverity,
      category: selectedCategory,
      status: selectedStatus
    })
      .then((res) => {
        setAnomalies(res.anomalies);
        setSummary(res.summary);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedSeverity, selectedCategory, selectedStatus]);

  const handleRunScan = () => {
    setScanning(true);
    runAnomalyScan()
      .then(() => {
        loadData();
      })
      .catch(console.error)
      .finally(() => setScanning(false));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            VOLTA Anomaly Detection & Fault Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multivariate outlier identification combining Isolation Forest, statistical rolling Z-score, and forecasting residual analysis.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/25 transition-all focus:outline-none disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Running Multi-Algorithm Scan...' : 'Trigger Live Anomaly Scan'}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-xs font-medium text-slate-400 mb-1">Total Detected</div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">30-day monitoring window</div>
        </div>

        <div className="bg-[#131d33] p-4 rounded-2xl border border-rose-900/60 shadow-lg shadow-rose-950/30 bg-gradient-to-br from-rose-950/30 to-[#131d33]">
          <div className="text-xs font-semibold text-rose-300 mb-1 flex items-center justify-between">
            <span>Critical Severity</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {summary.critical}
          </div>
          <div className="text-[11px] text-rose-400 mt-0.5">&gt; 100% baseline deviation</div>
        </div>

        <div className="bg-[#131d33] p-4 rounded-2xl border border-amber-900/60 shadow-lg shadow-amber-950/30 bg-gradient-to-br from-amber-950/30 to-[#131d33]">
          <div className="text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
            <span>High Severity</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {summary.high}
          </div>
          <div className="text-[11px] text-amber-400 mt-0.5">50% – 100% deviation</div>
        </div>

        <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-xs font-medium text-cyan-300 mb-1 flex items-center justify-between">
            <span>Moderate Severity</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {summary.moderate}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">25% – 50% deviation</div>
        </div>
      </div>

      {/* Methodology Banner */}
      <div className="p-4 bg-slate-900/90 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Detection Algorithms Applied:</div>
            <div className="text-slate-300">
              1. <strong>Isolation Forest</strong> (unsupervised outlier isolation) • 2. <strong>Residual Analysis</strong> (<span className="font-mono text-cyan-300">Error = |Actual - Expected|</span>) • 3. <strong>Statistical Z-Score</strong> (&gt; 2.5σ)
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/80">
          Threshold: 25% Deviation
        </span>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Institutional">Institutional</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Investigation">Pending Investigation</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{anomalies.length}</strong> flagged events
        </span>
      </div>

      {/* Anomalies Table */}
      <div className="bg-[#131d33] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium">Scanning telemetry for anomalies...</p>
          </div>
        ) : anomalies.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No anomalies found for the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Consumer ID</th>
                  <th className="py-3 px-3">Consumer Name</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Actual Load</th>
                  <th className="py-3 px-3 text-right">Expected</th>
                  <th className="py-3 px-3 text-right">Deviation</th>
                  <th className="py-3 px-3 text-center">Severity</th>
                  <th className="py-3 px-3">Detection Method</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {anomalies.map((anom) => (
                  <tr 
                    key={anom.id} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setInspectAnomalyId(anom.id)}
                  >
                    <td className="py-3 px-3 font-bold text-cyan-400">
                      {anom.consumer_id}
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      {anom.consumer_name}
                      <span className="block text-[10px] text-slate-400">{anom.category}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {anom.timestamp}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {anom.actual_kw} kW
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {anom.expected_kw} kW
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-400">
                      +{anom.deviation_pct}%
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        anom.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        anom.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        anom.severity === 'Moderate' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {anom.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300 text-[11px]">
                      {anom.detection_method}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="text-[11px] text-slate-300 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {anom.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectAnomalyId(anom.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:text-slate-950 hover:bg-cyan-400 border border-cyan-500/40 rounded-lg transition-all focus:outline-none"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Anomaly Inspection Modal */}
      {inspectAnomalyId && (
        <AnomalyDetailModal
          anomalyId={inspectAnomalyId}
          onClose={() => setInspectAnomalyId(null)}
          onStatusUpdated={() => {
            loadData();
            setInspectAnomalyId(null);
          }}
        />
      )}
    </div>
  );
};
