import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CloudSun, 
  Cpu, 
  FileText, 
  Database, 
  Info,
  Zap,
  Activity
} from 'lucide-react';
import { PageType } from '../types';

interface SidebarProps {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  anomalyCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage,
  anomalyCount = 0
}) => {
  const navItems: Array<{
    id: PageType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'consumers', label: 'Consumer Analytics', icon: Users },
    { id: 'forecasting', label: 'Load Forecasting', icon: TrendingUp, badge: 'CORE ML', badgeColor: 'bg-cyan-500 text-slate-950 font-bold' },
    { 
      id: 'anomalies', 
      label: 'Anomaly Detection', 
      icon: AlertTriangle, 
      badge: anomalyCount > 0 ? `${anomalyCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white' 
    },
    { id: 'weather', label: 'Weather Analysis', icon: CloudSun },
    { id: 'models', label: 'Model Performance', icon: Cpu },
    { id: 'dataset', label: 'Dataset Management', icon: Database },
    { id: 'reports', label: 'Reports & Insights', icon: FileText },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <aside className="w-64 bg-[#070d19] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-[#060a14]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div>
          <div className="font-extrabold text-white text-lg tracking-wider flex items-center gap-1.5">
            VOLTA <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">AI</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium tracking-wide">
            Smart Grid Load & Faults
          </div>
        </div>
      </div>

      {/* Grid Status Pill */}
      <div className="p-3 mx-3 my-3 bg-slate-900/80 rounded-xl border border-slate-800/90 text-xs shadow-inner">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Grid Telemetry
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">LIVE</span>
        </div>
        <div className="text-[11px] text-slate-400">
          25 Consumers Monitored
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-blue-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060a14] text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium text-[11px]">VOLTA Smart Grid Platform</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Short-Term AI Load Forecasting
        </div>
      </div>
    </aside>
  );
};
