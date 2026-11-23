import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { fetchConsumerProfile, fetchConsumerHistory } from '../services/api';
import { Consumer, ConsumerProfile } from '../types';
import { Tooltip } from '../components/Tooltip';

interface ConsumerModalProps {
  consumerId: string | null;
  onClose: () => void;
  allConsumers: Consumer[];
  onSelectConsumer: (id: string) => void;
}

export const ConsumerModal: React.FC<ConsumerModalProps> = ({
  consumerId,
  onClose,
  allConsumers,
  onSelectConsumer
}) => {
  const [profile, setProfile] = useState<ConsumerProfile | null>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState<boolean>(true);
  const [forecastTab, setForecastTab] = useState<'1h' | '6h' | '24h'>('24h');

  useEffect(() => {
    if (!consumerId) return;
    setLoading(true);

    Promise.all([
      fetchConsumerProfile(consumerId),
      fetchConsumerHistory(consumerId, timeframe)
    ])
      .then(([prof, hist]) => {
        setProfile(prof);
        setHistoryData(hist);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [consumerId, timeframe]);

  if (!consumerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0f172a] text-slate-100 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#070d19] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold font-mono text-base shadow-md shadow-cyan-500/25">
              {consumerId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {profile?.consumer.name || `Consumer Profile: ${consumerId}`}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {profile?.consumer.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {profile?.consumer.location} • {profile?.consumer.connection_type} Connection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Consumer Quick Selector Dropdown */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-300">
              <span>Switch:</span>
              <select
                value={consumerId}
                onChange={(e) => onSelectConsumer(e.target.value)}
                className="bg-slate-900 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {allConsumers.map((c) => (
                  <option key={c.consumer_id} value={c.consumer_id}>
                    {c.consumer_id} - {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">Fetching detailed consumer telemetry & forecast...</p>
            </div>
          ) : (
            <>
              {/* Technical Ratings & Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Contracted Capacity</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {profile?.consumer.capacity_kw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Sanction limit</div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Average Load</div>
                  <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                    {profile?.metrics.average_load_kw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                  <div className="text-[10px] text-slate-500">30-day mean load</div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Highest Peak Observed</div>
                  <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">
                    {profile?.metrics.highest_load_kw} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                  <div className="text-[10px] text-purple-400">Peak demand record</div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Consumption</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {profile?.metrics.total_consumption_kwh.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span>
                  </div>
                  <div className="text-[10px] text-emerald-500">30-day cumulative</div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Load Factor</div>
                  <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                    {profile?.metrics.load_factor}
                  </div>
                  <div className="text-[10px] text-slate-500">Efficiency index (Avg/Peak)</div>
                </div>

                <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-800/60">
                  <div className="text-[11px] text-cyan-300 font-semibold">Predicted Next-Hour</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                    {historyData?.predictions?.next_1h?.predicted_kw || 'N/A'} <span className="text-xs font-normal text-slate-400">kW</span>
                  </div>
                  <div className="text-[10px] text-cyan-500">VOLTA AI model</div>
                </div>
              </div>

              {/* Operating Habit banner */}
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center gap-3 text-xs text-indigo-200">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Operating Habit:</strong> {profile?.metrics.highest_consumption_period}. Baseline standby draw is {profile?.consumer.base_load_kw} kW.
                </span>
              </div>

              {/* Historical Consumption Chart: Actual vs Expected */}
              <div className="bg-[#131d33] p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Historical Electricity Consumption
                      <Tooltip term="Actual vs Expected" definition="Cyan represents actual smart meter readings; Green dashed line represents normal expected load baseline for this consumer." />
                    </h3>
                    <p className="text-xs text-slate-400">
                      Metered electricity demand vs normal baseline profile.
                    </p>
                  </div>

                  <div className="inline-flex p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium text-slate-400">
                    <button
                      onClick={() => setTimeframe('24h')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === '24h' ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'}`}
                    >
                      24 Hours
                    </button>
                    <button
                      onClick={() => setTimeframe('7d')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === '7d' ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'}`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setTimeframe('30d')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === '30d' ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'}`}
                    >
                      30 Days
                    </button>
                  </div>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData?.readings || []} margin={{ top: 5, right: 15, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour_label" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kW" />
                      <RechartsTooltip
                        formatter={(val: any) => [`${val} kW`, '']}
                        contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                      <Line type="monotone" dataKey="actual_kw" name="Actual Consumption (kW)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expected_kw" name="Expected Baseline (kW)" stroke="#34d399" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Diurnal & Weekly Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 24-Hour Diurnal Pattern */}
                <div className="bg-[#131d33] p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-1">
                    Diurnal 24-Hour Consumption Pattern
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Average demand across all 24 hours of the day (0:00 to 23:00).
                  </p>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historyData?.hourly_profile || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="hour_label" stroke="#64748b" fontSize={10} interval={3} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" kW" />
                        <RechartsTooltip
                          formatter={(val: any) => [`${val} kW`, 'Average Load']}
                          contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="actual_kw" fill="#0284c7" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Day of Week Pattern */}
                <div className="bg-[#131d33] p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-1">
                    Day-of-Week Consumption Pattern
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Average load from Monday to Sunday.
                  </p>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historyData?.weekly_profile || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="day_name" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" kW" />
                        <RechartsTooltip
                          formatter={(val: any) => [`${val} kW`, 'Average Load']}
                          contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="average_kw" fill="#10b981" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Short-Term Multi-Horizon AI Predictions */}
              <div className="bg-[#131d33] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Short-Term Load Forecast for {consumerId}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Predicting next 1 hour, next 6 hours, and next 24 hours.
                    </p>
                  </div>

                  <div className="inline-flex p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium text-slate-400">
                    <button
                      onClick={() => setForecastTab('1h')}
                      className={`px-3 py-1 rounded-md transition-colors ${forecastTab === '1h' ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'}`}
                    >
                      Next 1h
                    </button>
                    <button
                      onClick={() => setForecastTab('6h')}
                      className={`px-3 py-1 rounded-md transition-colors ${forecastTab === '6h' ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'}`}
                    >
                      Next 6h
                    </button>
                    <button
                      onClick={() => setForecastTab('24h')}
                      className={`px-3 py-1 rounded-md transition-colors ${forecastTab === '24h' ? 'bg-cyan-500 text-slate-950 font-bold' : 'hover:text-white'}`}
                    >
                      Next 24h
                    </button>
                  </div>
                </div>

                {forecastTab === '1h' && (
                  <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-800/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-cyan-300 font-medium">Next Immediate Hour Forecast</div>
                      <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
                        {historyData?.predictions?.next_1h?.predicted_kw} kW
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Confidence interval: {historyData?.predictions?.next_1h?.lower_bound_kw} kW – {historyData?.predictions?.next_1h?.upper_bound_kw} kW
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold">
                      {historyData?.predictions?.next_1h?.demand_category || 'Normal'}
                    </span>
                  </div>
                )}

                {forecastTab !== '1h' && (
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={forecastTab === '6h' ? historyData?.predictions?.next_6h : historyData?.predictions?.next_24h}
                        margin={{ top: 5, right: 15, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="hour_label" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kW" />
                        <RechartsTooltip
                          formatter={(val: any) => [`${val} kW`, 'Predicted Load']}
                          contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                        />
                        <Line type="monotone" dataKey="predicted_kw" name="Predicted (kW)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3, fill: '#38bdf8' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Consumer-Specific Anomaly History */}
              <div className="bg-[#131d33] p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Historical Anomaly Log for {consumerId}
                </h4>
                {historyData?.anomalies?.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-900/60 rounded-lg">
                    No anomalies recorded for this consumer. Normal operating profile confirmed.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-sans">
                          <th className="py-2 px-2">Timestamp</th>
                          <th className="py-2 px-2">Observed</th>
                          <th className="py-2 px-2">Expected</th>
                          <th className="py-2 px-2">Deviation</th>
                          <th className="py-2 px-2">Severity</th>
                          <th className="py-2 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {historyData?.anomalies?.map((anom: any) => (
                          <tr key={anom.id} className="hover:bg-slate-800/40">
                            <td className="py-2 px-2 text-slate-400">{anom.timestamp}</td>
                            <td className="py-2 px-2 font-bold text-white">{anom.actual_kw} kW</td>
                            <td className="py-2 px-2 text-slate-400">{anom.expected_kw} kW</td>
                            <td className="py-2 px-2 font-bold text-rose-400">+{anom.deviation_pct}%</td>
                            <td className="py-2 px-2 font-sans">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                anom.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {anom.severity}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-slate-300 font-sans">{anom.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
