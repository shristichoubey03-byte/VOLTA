import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  FileText,
  Check,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { fetchAnomalyDetails, updateAnomalyStatus } from '../services/api';

interface AnomalyDetailModalProps {
  anomalyId: number | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const AnomalyDetailModal: React.FC<AnomalyDetailModalProps> = ({
  anomalyId,
  onClose,
  onStatusUpdated
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusVal, setStatusVal] = useState<string>('Pending Review');
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (!anomalyId) return;
    setLoading(true);
    fetchAnomalyDetails(anomalyId)
      .then((res) => {
        setData(res);
        setStatusVal(res.anomaly.status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [anomalyId]);

  const handleUpdateStatus = () => {
    if (!anomalyId) return;
    setUpdating(true);
    updateAnomalyStatus(anomalyId, statusVal)
      .then(() => {
        onStatusUpdated();
      })
      .catch(console.error)
      .finally(() => setUpdating(false));
  };

  if (!anomalyId) return null;

  const anom = data?.anomaly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0f172a] text-slate-100 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#070d19] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
              anom?.severity === 'Critical' ? 'bg-rose-600 shadow-md shadow-rose-600/30' :
              anom?.severity === 'High' ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-cyan-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  VOLTA Anomaly Audit #{anomalyId}: {anom?.consumer_id}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  anom?.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  anom?.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {anom?.severity} Severity
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Timestamp: <span className="font-mono text-cyan-400">{anom?.timestamp}</span> • Detection: {anom?.detection_method}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">Loading telemetry audit around anomaly...</p>
            </div>
          ) : (
            <>
              {/* Important Academic Disclaimer Box */}
              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div className="font-bold text-amber-300 mb-0.5">
                    Essential Investigation Guideline
                  </div>
                  {data?.compliance_notice}
                </div>
              </div>

              {/* Observed vs Expected Comparison Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Observed Meter Reading</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {anom?.actual_kw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Recorded telemetry</div>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Expected Normal Load</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                    {anom?.expected_kw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                  <div className="text-[10px] text-emerald-500">Statistical baseline</div>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Residual Deviation</div>
                  <div className="text-xl font-bold text-rose-400 font-mono mt-1">
                    +{anom?.deviation_pct}%
                  </div>
                  <div className="text-[10px] text-slate-500">Deviation from expected</div>
                </div>

                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Consumer Contract</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {anom?.capacity_kw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{anom?.category}</div>
                </div>
              </div>

              {/* 24-Hour Telemetry Window Visualizing the Deviation */}
              <div className="bg-[#131d33] p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  24-Hour Telemetry Window Around Flagged Event
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Visual comparison showing actual smart meter load vs expected baseline.
                </p>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.window_readings || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour_label" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kW" />
                      <RechartsTooltip
                        formatter={(val: any) => [`${val} kW`, '']}
                        contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                      <Line type="monotone" dataKey="actual_kw" name="Observed Actual (kW)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e' }} />
                      <Line type="monotone" dataKey="expected_kw" name="Expected Baseline (kW)" stroke="#34d399" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reason Flagged & Suggested Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Reason Reading Was Flagged
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {anom?.reason}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Recommended Engineering Action
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {anom?.recommended_action}
                  </p>
                </div>
              </div>

              {/* Action: Update Status */}
              <div className="p-4 bg-cyan-950/30 rounded-xl border border-cyan-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">Review Status:</span>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Pending Investigation">Pending Investigation</option>
                    <option value="Reviewed">Reviewed by Technician</option>
                    <option value="Resolved">Resolved / Verified</option>
                    <option value="False Positive">False Positive (Normal Seasonal Spike)</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-lg shadow-md transition-all focus:outline-none flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updating ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Anomaly Status</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
