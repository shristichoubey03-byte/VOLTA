import React from 'react';
import { 
  Zap, 
  Target, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Database, 
  TrendingUp, 
  ShieldAlert, 
  BarChart2, 
  FileCheck,
  FileText,
  GraduationCap
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const workflowSteps = [
    {
      step: 1,
      title: "Data Collection",
      desc: "Smart-meter hourly telemetry (kW/kWh), timestamps, consumer classifications, and Open-Meteo meteorological data.",
      icon: Database,
      color: "from-blue-600 to-cyan-500"
    },
    {
      step: 2,
      title: "Data Preprocessing",
      desc: "Handling missing packets, deduplication, chronological alignment, and capacity boundary clamping.",
      icon: FileCheck,
      color: "from-indigo-600 to-blue-500"
    },
    {
      step: 3,
      title: "Feature Engineering",
      desc: "Trigonometric cyclical encodings (sin/cos hour & day), multi-step lag features (t-1, t-24), rolling moving averages, and cooling degrees.",
      icon: Layers,
      color: "from-purple-600 to-indigo-500"
    },
    {
      step: 4,
      title: "Model Training",
      desc: "Walk-forward chronological train-test split (80/20) training Ridge Regression, Random Forest, XGBoost, and LSTM neural baseline.",
      icon: Cpu,
      color: "from-fuchsia-600 to-purple-500"
    },
    {
      step: 5,
      title: "Short-Term Forecasting",
      desc: "Multi-horizon load inference (1h, 6h, 24h) for individual consumers and aggregated grid total: Total Load(t) = Σ Load_i(t).",
      icon: TrendingUp,
      color: "from-amber-600 to-rose-500"
    },
    {
      step: 6,
      title: "Anomaly Detection",
      desc: "Isolation Forest and residual deviation analysis (Error = |Actual - Expected|) flagging spikes, surges, and dropouts.",
      icon: ShieldAlert,
      color: "from-rose-600 to-red-500"
    },
    {
      step: 7,
      title: "Interactive Insights",
      desc: "User-friendly dashboard visualizing peak demand alerts, natural-language explanations, and operational dispatch recommendations.",
      icon: BarChart2,
      color: "from-emerald-600 to-teal-500"
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0c1834] to-slate-900 p-8 rounded-3xl text-white shadow-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            Academic AI/ML Project
          </div>

          <a
            href="/api/reports/download-description-pdf"
            download="VOLTA_Project_Description.pdf"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all focus:outline-none w-fit"
          >
            <FileText className="w-4 h-4" />
            Download Description PDF
          </a>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400">VOLTA</span>
          <span className="text-xl md:text-2xl font-normal text-slate-400">— Smart Grid System</span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-4xl leading-relaxed">
          Short-Term Electricity Load Forecasting and Fault Diagnostic Architecture for Decentralized Smart-Meter Networks.
        </p>
      </div>

      {/* Problem Statement & Proposed Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">
              Problem Statement
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Electricity demand changes dynamically over time depending on consumer behaviour, time of day, day of the week, and outdoor weather conditions. Without accurate short-term demand forecasting, electric utilities struggle to anticipate peak generation requirements, dispatch spinning reserves efficiently, or distinguish legitimate demand surges from abnormal distribution faults and technical losses.
          </p>
        </div>

        <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">
              Proposed Solution
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            VOLTA uses historical electricity consumption telemetry and modern supervised machine-learning models (Linear Regression, Random Forest, XGBoost, and neural networks) to forecast short-term electricity demand for multiple heterogeneous consumers (Residential, Commercial, Industrial, Institutional). It aggregates individual forecasts into total grid load, identifies unusual consumption patterns using Isolation Forest, and presents transparent, explainable insights on an interactive web dashboard.
          </p>
        </div>
      </div>

      {/* Objectives */}
      <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">
            Project Objectives
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Forecast short-term electricity consumption (1h, 6h, 24h horizons).",
            "Monitor multiple heterogeneous consumer categories simultaneously.",
            "Estimate combined total electricity demand: Total Load(t) = Σ Load_i(t).",
            "Identify exact peak-demand periods and valley troughs in advance.",
            "Detect unusual consumption anomalies via Isolation Forest and residual analysis.",
            "Quantify the thermodynamic relationship between temperature and load.",
            "Benchmark and compare machine-learning forecasting algorithms empirically."
          ].map((obj, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Workflow Architecture Diagram */}
      <div className="bg-[#131d33] p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            End-to-End System Workflow Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step pipeline from smart-meter ingestion to human-readable dashboard dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-2">
          {workflowSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.step} 
                className="relative bg-slate-900/90 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Step 0{s.step}
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5 mb-1.5">
                    {s.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {s.desc}
                  </p>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div className="hidden xl:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="bg-slate-900/90 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          VOLTA Technology Stack Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-400">Frontend Application</div>
            <div className="text-slate-300">React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React icons</div>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-blue-400">Backend & API</div>
            <div className="text-slate-300">FastAPI, Python 3.14, Uvicorn, Pandas, NumPy, Pydantic, Requests</div>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-purple-400">Machine Learning</div>
            <div className="text-slate-300">XGBoost Regressor, Scikit-learn (Random Forest, Ridge L2, Isolation Forest), MLP/PyTorch</div>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400">Data & Meteorological</div>
            <div className="text-slate-300">SQLite3 prototype database, Open-Meteo REST API, 30-Day multi-consumer telemetry</div>
          </div>
        </div>
      </div>
    </div>
  );
};
