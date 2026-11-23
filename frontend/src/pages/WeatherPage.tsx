import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  MapPin, 
  Sparkles, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend
} from 'recharts';
import { fetchWeather } from '../services/api';
import { WeatherData } from '../types';
import { Tooltip } from '../components/Tooltip';

export const WeatherPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Metro Grid North');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchWeather(selectedLocation)
      .then((data) => setWeatherData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedLocation]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            VOLTA Weather & Meteorological Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyzing ambient temperature, humidity, and their thermodynamic influence on short-term electricity load.
          </p>
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-2 bg-[#131d33] px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-400">Location:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            {weatherData?.available_locations?.map((loc) => (
              <option key={loc} value={loc} className="bg-slate-900 text-white">
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo / Live Data Status Banner */}
      {weatherData && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
          weatherData.is_live
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${weatherData.is_live ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold">
              {weatherData.is_live ? 'Open-Meteo API Live Connection Active' : 'Simulated Weather Telemetry (Academic Demo)'}
            </span>
            <span className="text-slate-400">
              • Lat: {weatherData.latitude.toFixed(2)}, Lon: {weatherData.longitude.toFixed(2)}
            </span>
          </div>

          <span className="font-mono font-medium">
            {weatherData.is_live ? 'Source: open-meteo.com' : 'Source: Synthetic Diurnal Wave'}
          </span>
        </div>
      )}

      {loading || !weatherData ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Connecting to Meteorological Service...</p>
        </div>
      ) : (
        <>
          {/* Current Weather KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Ambient Temp</span>
                <Thermometer className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {weatherData.current.temperature}°C
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Feels like {weatherData.current.apparent_temperature}°C
              </div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Condition</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base font-bold text-white truncate">
                {weatherData.current.condition}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Micro-climate index
              </div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Relative Humidity</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {weatherData.current.humidity}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Moisture saturation
              </div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Wind Speed</span>
                <Wind className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {weatherData.current.wind_speed} <span className="text-xs font-normal text-slate-400">km/h</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Surface anemometer
              </div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-400">Precipitation</span>
                <CloudRain className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {weatherData.current.precipitation} <span className="text-xs font-normal text-slate-400">mm</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Rainfall gauge
              </div>
            </div>

            <div className="bg-[#131d33] p-4 rounded-2xl border border-cyan-800/60 shadow-lg shadow-cyan-950/30 bg-cyan-950/20">
              <div className="flex items-center justify-between text-cyan-400 mb-2">
                <span className="text-xs font-semibold">Cooling Degree</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-300 font-mono">
                +{weatherData.impact_analysis.current_cdd}°C
              </div>
              <div className="text-[11px] text-cyan-400 mt-1">
                Above 25°C threshold
              </div>
            </div>
          </div>

          {/* 24-Hour Temperature & Humidity Forecast Chart */}
          <div className="bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg">
            <h2 className="text-base font-bold text-white mb-1">
              24-Hour Temperature & Humidity Forecast
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Hourly meteorological trajectory utilized by the XGBoost & Random Forest regressors.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherData.hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour_label" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="temp" stroke="#f43f5e" fontSize={11} unit=" °C" domain={[15, 40]} tickLine={false} />
                  <YAxis yAxisId="hum" orientation="right" stroke="#38bdf8" fontSize={11} unit=" %" domain={[20, 100]} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line yAxisId="hum" type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature vs Electricity Demand Correlation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#131d33] p-5 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Temperature vs Grid Demand Correlation
                    <Tooltip term="Pearson Correlation" definition="Quantifies the linear relationship between outdoor temperature and total electricity demand. Higher values (>0.7) mean power demand strongly increases on hot days." />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scatter distribution of ambient temperature (°C) against metered total load (kW).
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-cyan-400">
                    r = {weatherData.correlation.pearson_r}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    {weatherData.correlation.relationship}
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="temperature" type="number" name="Temperature" unit="°C" domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis dataKey="load_kw" type="number" name="Total Load" unit=" kW" stroke="#64748b" fontSize={11} tickLine={false} />
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [`${val} ${name === 'Temperature' ? '°C' : 'kW'}`, name]}
                      contentStyle={{ backgroundColor: '#070d19', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Scatter name="Observed Hours" data={weatherData.correlation.scatter_points} fill="#38bdf8" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Impact Analysis Explanation Card */}
            <div className="bg-gradient-to-br from-[#070d19] via-[#101b33] to-[#070d19] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Thermodynamic Impact Summary
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {weatherData.impact_analysis.status}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {weatherData.impact_analysis.impact_statement}
                </p>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-amber-300 mb-1">Operational Directive:</div>
                  {weatherData.impact_analysis.grid_operator_advice}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Cooling Threshold: 25.0°C</span>
                <span className="font-mono text-cyan-400">ΔT = {weatherData.impact_analysis.current_cdd}°C</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
