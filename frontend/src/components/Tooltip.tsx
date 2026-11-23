import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, definition, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1 group">
      {children || <span className="border-b border-dotted border-slate-500 cursor-help font-medium text-slate-300">{term}</span>}
      <button 
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none"
        title="Click or hover to learn what this means"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 text-white text-xs rounded-xl shadow-2xl border border-slate-700 z-50 pointer-events-none transition-all backdrop-blur-md">
          <div className="font-bold text-cyan-300 mb-0.5">{term}</div>
          <div className="text-slate-300 leading-relaxed text-[11px]">{definition}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
};

export const COMMON_DEFINITIONS = {
  kW: "Kilowatt (kW): Instantaneous rate of electricity flow (power). Similar to the speed of a car at this exact moment.",
  kWh: "Kilowatt-hour (kWh): Total amount of electrical energy consumed over time. Similar to total distance traveled.",
  MAE: "Mean Absolute Error: The average size of forecasting mistakes in kW. Lower is better.",
  RMSE: "Root Mean Squared Error: Measures forecasting error, penalizing large mistakes more heavily than small ones.",
  MAPE: "Mean Absolute Percentage Error: The percentage error of the forecast relative to actual consumption.",
  R2: "R² Coefficient of Determination: Proportion of electricity variation explained by the model (1.0 = perfect fit).",
  IsolationForest: "Isolation Forest: An algorithm that isolates unusual consumption spikes or drops by randomly partitioning feature dimensions.",
  PeakDemand: "Peak Demand: The highest electrical power required by consumers during a specified time window."
};
