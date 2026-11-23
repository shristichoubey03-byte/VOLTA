import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Zap } from 'lucide-react';

interface TopbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onRefresh, isRefreshing = false }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0d1527] border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left: Project title & Active Dataset */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm hidden sm:inline-flex">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>VOLTA Analytics</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            30-Day Multi-Consumer Telemetry
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50">
          Academic Demo Feed
        </span>
      </div>

      {/* Right: Clock, Refresh, User Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || '12:00:00 PM'}</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700 focus:outline-none"
            title="Refresh Grid Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}

        {/* User Account / Evaluator */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/20">
            V
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              Grid Dispatcher
            </div>
            <div className="text-[10px] text-slate-400">
              Evaluator Session
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
