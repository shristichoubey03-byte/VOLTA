import { 
  DashboardSummary, 
  Consumer, 
  ConsumerProfile, 
  ForecastResponse, 
  AnomalyItem, 
  WeatherData 
} from '../types';

const API_BASE = '/api';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function fetchConsumers(params?: { category?: string; search?: string; status?: string }): Promise<{ total: number; consumers: Consumer[] }> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.status && params.status !== 'All') query.append('status', params.status);

  const res = await fetch(`${API_BASE}/consumers?${query.toString()}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function fetchConsumerProfile(consumerId: string): Promise<ConsumerProfile> {
  const res = await fetch(`${API_BASE}/consumers/${consumerId}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function fetchConsumerHistory(consumerId: string, timeframe: string = '24h'): Promise<any> {
  const res = await fetch(`${API_BASE}/consumers/${consumerId}/history?timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function runForecast(consumerId: string, horizonHours: number, modelName: string): Promise<ForecastResponse> {
  const res = await fetch(`${API_BASE}/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumer_id: consumerId,
      horizon_hours: horizonHours,
      model_name: modelName
    })
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function fetchAnomalies(params?: { severity?: string; category?: string; consumer_id?: string; status?: string }): Promise<{ summary: any; anomalies: AnomalyItem[] }> {
  const query = new URLSearchParams();
  if (params?.severity && params.severity !== 'All') query.append('severity', params.severity);
  if (params?.category && params.category !== 'All') query.append('category', params.category);
  if (params?.consumer_id && params.consumer_id !== 'All') query.append('consumer_id', params.consumer_id);
  if (params?.status && params.status !== 'All') query.append('status', params.status);

  const res = await fetch(`${API_BASE}/anomalies?${query.toString()}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function fetchAnomalyDetails(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/anomalies/${id}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function updateAnomalyStatus(id: number, status: string, notes?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/anomalies/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function runAnomalyScan(): Promise<any> {
  const res = await fetch(`${API_BASE}/anomalies/scan`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function fetchWeather(location: string = 'Metro Grid North'): Promise<WeatherData> {
  const res = await fetch(`${API_BASE}/weather?location=${encodeURIComponent(location)}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function fetchModelPerformance(): Promise<any> {
  const res = await fetch(`${API_BASE}/models/performance`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function retrainModels(): Promise<any> {
  const res = await fetch(`${API_BASE}/models/train`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function uploadDataset(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/dataset/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to upload dataset.' }));
    throw new Error(err.detail || `HTTP Error: ${res.status}`);
  }
  return res.json();
}

export async function fetchReportsSummary(category: string = 'All', consumer_id: string = 'All'): Promise<any> {
  const res = await fetch(`${API_BASE}/reports/summary?category=${category}&consumer_id=${consumer_id}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

