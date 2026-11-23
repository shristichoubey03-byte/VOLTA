import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Eye
} from 'lucide-react';
import { Consumer } from '../types';
import { fetchConsumers } from '../services/api';
import { ConsumerModal } from './ConsumerModal';
import { Tooltip, COMMON_DEFINITIONS } from '../components/Tooltip';

export const ConsumersPage: React.FC = () => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeConsumerId, setActiveConsumerId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchConsumers({
      category: selectedCategory,
      search: search.trim(),
      status: selectedStatus
    })
      .then((data) => setConsumers(data.consumers))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            VOLTA Consumer Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time metering, contracted capacity monitoring, and individual load profiles for all 25 consumers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#131d33] px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Showing <strong className="text-white">{consumers.length}</strong> active electricity consumers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Consumer ID, Name, or Location..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Categories</option>
              <option value="Residential">Residential (12)</option>
              <option value="Commercial">Commercial (6)</option>
              <option value="Industrial">Industrial (4)</option>
              <option value="Institutional">Institutional (3)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Normal">Normal Consumption</option>
              <option value="High Consumption">High Consumption</option>
              <option value="Anomaly Detected">Anomaly Detected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consumer Table */}
      <div className="bg-[#131d33] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium">Loading consumer telemetry...</p>
          </div>
        ) : consumers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No consumers match the selected search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Consumer ID</th>
                  <th className="py-3.5 px-4">Consumer Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">
                    Current Load
                    <Tooltip term="kW" definition={COMMON_DEFINITIONS.kW} />
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    Daily Usage
                    <Tooltip term="kWh" definition={COMMON_DEFINITIONS.kWh} />
                  </th>
                  <th className="py-3.5 px-4 text-right">Predicted Next-1h</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {consumers.map((c) => (
                  <tr 
                    key={c.consumer_id} 
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => setActiveConsumerId(c.consumer_id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                      {c.consumer_id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.category === 'Residential' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        c.category === 'Commercial' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        c.category === 'Industrial' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {c.location}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                      {c.current_load_kw} <span className="text-[10px] text-slate-400 font-normal">kW</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {c.daily_kwh} <span className="text-[10px] text-slate-400 font-normal">kWh</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-cyan-400">
                      {c.predicted_next_hour_kw} <span className="text-[10px] text-slate-400 font-normal">kW</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Anomaly Detected' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        c.status === 'High Consumption' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {c.status === 'Anomaly Detected' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        {c.status === 'Normal' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveConsumerId(c.consumer_id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:text-slate-950 hover:bg-cyan-400 rounded-lg transition-all focus:outline-none border border-cyan-500/40"
                      >
                        <Eye className="w-3 h-3" />
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consumer Profile Modal */}
      {activeConsumerId && (
        <ConsumerModal
          consumerId={activeConsumerId}
          onClose={() => setActiveConsumerId(null)}
          allConsumers={consumers}
          onSelectConsumer={(id) => setActiveConsumerId(id)}
        />
      )}
    </div>
  );
};
