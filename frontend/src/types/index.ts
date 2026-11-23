export type PageType = 
  | 'overview' 
  | 'consumers' 
  | 'forecasting' 
  | 'anomalies' 
  | 'weather' 
  | 'models' 
  | 'dataset' 
  | 'reports' 
  | 'about';

export interface Consumer {
  consumer_id: string;
  name: string;
  category: 'Residential' | 'Commercial' | 'Industrial' | 'Institutional';
  location: string;
  connection_type: string;
  capacity_kw: number;
  base_load_kw: number;
  current_load_kw: number;
  daily_kwh: number;
  predicted_next_hour_kw: number;
  status: 'Normal' | 'High Consumption' | 'Anomaly Detected';
  status_color: string;
  active_anomalies: number;
}

export interface ConsumerProfile {
  consumer: {
    consumer_id: string;
    name: string;
    category: string;
    location: string;
    connection_type: string;
    capacity_kw: number;
    base_load_kw: number;
    installed_date: string;
    status: string;
  };
  metrics: {
    average_load_kw: number;
    highest_load_kw: number;
    lowest_load_kw: number;
    total_consumption_kwh: number;
    highest_consumption_period: string;
    load_factor: number;
  };
}

export interface ReadingPoint {
  timestamp: string;
  hour_label: string;
  actual_kw?: number;
  expected_kw?: number;
  predicted_kw?: number;
  temperature?: number;
  is_anomaly?: boolean;
}

export interface AnomalyItem {
  id: number;
  consumer_id: string;
  consumer_name: string;
  category: string;
  location: string;
  timestamp: string;
  actual_kw: number;
  expected_kw: number;
  deviation_pct: number;
  severity: 'Normal' | 'Moderate' | 'High' | 'Critical';
  detection_method: string;
  status: 'Pending Investigation' | 'Reviewed' | 'Resolved' | 'False Positive';
  reason: string;
  recommended_action: string;
  anomaly_score?: number;
}

export interface ForecastPoint {
  timestamp: string;
  hour_label: string;
  day_label: string;
  predicted_kw: number;
  lower_bound_kw: number;
  upper_bound_kw: number;
  temperature: number;
  humidity: number;
  demand_category: string;
  badge_color: string;
  breakdown?: Record<string, number>;
}

export interface ForecastResponse {
  target: string;
  target_name: string;
  model_used: string;
  horizon_hours: number;
  generated_at: string;
  peak_load: {
    timestamp: string;
    hour_label: string;
    day_label: string;
    load_kw: number;
    temperature: number;
    demand_category: string;
  };
  min_load: {
    timestamp: string;
    hour_label: string;
    load_kw: number;
  };
  average_predicted_kw: number;
  forecast_timeline: ForecastPoint[];
  comparison_history: ReadingPoint[];
  explanation: {
    summary: string;
    peak_drivers: string[];
    recommendation: string;
  };
}

export interface WeatherData {
  is_live: boolean;
  data_source_label?: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  current: {
    temperature: number;
    apparent_temperature: number;
    humidity: number;
    precipitation: number;
    wind_speed: number;
    condition: string;
    icon: string;
  };
  hourly: Array<{
    timestamp: string;
    hour_label: string;
    temperature: number;
    humidity: number;
    precipitation: number;
  }>;
  correlation: {
    pearson_r: number;
    relationship: string;
    scatter_points: Array<{ temperature: number; load_kw: number }>;
  };
  impact_analysis: {
    status: string;
    impact_statement: string;
    grid_operator_advice: string;
    cooling_degree_threshold_c: number;
    current_cdd: number;
  };
  available_locations?: string[];
}

export interface ModelMetric {
  model_name: string;
  display_name: string;
  horizon: string;
  mae: number;
  rmse: number;
  mape: number;
  r2_score: number;
  training_time_sec: number;
  last_trained: string;
  status: string;
  description: string;
}

export interface DashboardSummary {
  kpis: {
    total_consumers: number;
    current_total_load_kw: number;
    predicted_next_hour_kw: number;
    predicted_24h_peak: {
      timestamp?: string;
      hour_label?: string;
      load_kw?: number;
      temperature?: number;
    };
    active_anomalies_count: number;
    avg_daily_kwh_per_consumer: number;
    data_as_of: string;
  };
  trends: {
    hours_24: Array<{ timestamp: string; label: string; actual_kw: number; expected_kw: number }>;
    days_7: Array<{ date: string; label: string; actual_kwh: number; expected_kwh: number }>;
    days_30: Array<{ date: string; label: string; actual_kwh: number; expected_kwh: number }>;
  };
  category_distribution: Array<{
    category: string;
    consumer_count: number;
    current_load_kw: number;
    share_pct: number;
    color: string;
  }>;
  forecast_24h: ForecastPoint[];
  recent_alerts: AnomalyItem[];
  quick_insights: Array<{
    id: number;
    type: string;
    icon: string;
    text: string;
    detail: string;
  }>;
}

