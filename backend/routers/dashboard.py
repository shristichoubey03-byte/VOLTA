from fastapi import APIRouter
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from database import get_db_connection
from forecasting.engine import forecasting_engine

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary():
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Total Consumers
    cur.execute("SELECT COUNT(*) FROM consumers WHERE status='Active'")
    total_consumers = cur.fetchone()[0]

    # Find latest timestamp
    cur.execute("SELECT MAX(timestamp) FROM readings")
    latest_ts = cur.fetchone()[0]
    if not latest_ts:
        conn.close()
        return {"error": "No data available."}

    # 2. Current Total Load (sum of latest reading for all consumers)
    cur.execute("""
    SELECT SUM(consumption_kw) FROM readings WHERE timestamp = ?
    """, (latest_ts,))
    current_total_load = round(float(cur.fetchone()[0] or 0), 2)

    # 3 & 4. Run short forecast for next hour and next 24 hours
    forecast_24 = forecasting_engine.generate_forecast("ALL", 24, "XGBoost Regressor")
    predicted_next_hour = forecast_24["forecast_timeline"][0]["predicted_kw"] if forecast_24.get("forecast_timeline") else 0.0
    predicted_24h_peak = forecast_24["peak_load"] if forecast_24.get("peak_load") else {}

    # 5. Active Anomaly Alerts
    cur.execute("SELECT COUNT(*) FROM anomalies WHERE status != 'Resolved'")
    active_anomalies = cur.fetchone()[0]

    # 6. Average Daily Consumption per consumer (kWh/day)
    # Total kWh over 30 days / 30 / total_consumers
    cur.execute("SELECT SUM(consumption_kw) FROM readings")
    total_kwh_30d = float(cur.fetchone()[0] or 0)
    avg_daily_kwh_per_consumer = round(total_kwh_30d / (30.0 * max(total_consumers, 1)), 2)

    # A. Electricity Consumption Trend (last 24 hours, last 7 days, last 30 days)
    # 24 Hours (hourly aggregate)
    dt_latest = datetime.fromisoformat(latest_ts)
    dt_24h = (dt_latest - timedelta(hours=24)).isoformat()
    cur.execute("""
    SELECT timestamp, SUM(consumption_kw) as actual_kw, SUM(expected_kw) as expected_kw
    FROM readings
    WHERE timestamp >= ?
    GROUP BY timestamp
    ORDER BY timestamp ASC
    """, (dt_24h,))
    trend_24h = [
        {
            "timestamp": r["timestamp"],
            "label": datetime.fromisoformat(r["timestamp"]).strftime("%H:00"),
            "actual_kw": round(float(r["actual_kw"]), 2),
            "expected_kw": round(float(r["expected_kw"]), 2)
        }
        for r in cur.fetchall()
    ]

    # 7 Days (daily aggregate)
    dt_7d = (dt_latest - timedelta(days=7)).isoformat()
    cur.execute("""
    SELECT substr(timestamp, 1, 10) as day_date, SUM(consumption_kw) as actual_kwh, SUM(expected_kw) as expected_kwh
    FROM readings
    WHERE timestamp >= ?
    GROUP BY day_date
    ORDER BY day_date ASC
    """, (dt_7d,))
    trend_7d = [
        {
            "date": r["day_date"],
            "label": datetime.fromisoformat(r["day_date"]).strftime("%a, %b %d"),
            "actual_kwh": round(float(r["actual_kwh"]), 2),
            "expected_kwh": round(float(r["expected_kwh"]), 2)
        }
        for r in cur.fetchall()
    ]

    # 30 Days (daily aggregate)
    cur.execute("""
    SELECT substr(timestamp, 1, 10) as day_date, SUM(consumption_kw) as actual_kwh, SUM(expected_kw) as expected_kwh
    FROM readings
    GROUP BY day_date
    ORDER BY day_date ASC
    """)
    trend_30d = [
        {
            "date": r["day_date"],
            "label": datetime.fromisoformat(r["day_date"]).strftime("%b %d"),
            "actual_kwh": round(float(r["actual_kwh"]), 2),
            "expected_kwh": round(float(r["expected_kwh"]), 2)
        }
        for r in cur.fetchall()
    ]

    # B. Consumer Category Distribution
    cur.execute("""
    SELECT c.category, COUNT(DISTINCT c.consumer_id) as count, SUM(r.consumption_kw) as current_load
    FROM consumers c
    LEFT JOIN readings r ON c.consumer_id = r.consumer_id AND r.timestamp = ?
    GROUP BY c.category
    """, (latest_ts,))
    categories_raw = cur.fetchall()
    category_distribution = []
    category_colors = {
        "Residential": "#3b82f6",   # Electric Blue
        "Commercial": "#10b981",    # Emerald Green
        "Industrial": "#f59e0b",    # Amber Orange
        "Institutional": "#8b5cf6"  # Purple
    }
    for r in categories_raw:
        cat_name = r["category"]
        load = round(float(r["current_load"] or 0), 2)
        category_distribution.append({
            "category": cat_name,
            "consumer_count": int(r["count"]),
            "current_load_kw": load,
            "share_pct": round((load / max(current_total_load, 1)) * 100, 1),
            "color": category_colors.get(cat_name, "#6b7280")
        })

    # D. Recent Alerts (Top 5)
    cur.execute("""
    SELECT a.*, c.name as consumer_name, c.category, c.location
    FROM anomalies a
    JOIN consumers c ON a.consumer_id = c.consumer_id
    ORDER BY a.timestamp DESC
    LIMIT 5
    """)
    recent_alerts = [dict(r) for r in cur.fetchall()]

    # E. Quick Readable Insights
    peak_hr = predicted_24h_peak.get("hour_label", "19:00")
    peak_kw = predicted_24h_peak.get("load_kw", 0)
    top_cat = max(category_distribution, key=lambda x: x["current_load_kw"]) if category_distribution else None

    insights = [
        {
            "id": 1,
            "type": "forecast",
            "icon": "TrendingUp",
            "text": f"Predicted 24-hour peak grid demand is {peak_kw} kW expected at {peak_hr}.",
            "detail": "Plan auxiliary storage ramp-up 30 minutes prior."
        },
        {
            "id": 2,
            "type": "category",
            "icon": "PieChart",
            "text": f"{top_cat['category']} sector contributes the highest current load share ({top_cat['share_pct']}% at {top_cat['current_load_kw']} kW).",
            "detail": f"{top_cat['consumer_count']} active accounts monitored."
        },
        {
            "id": 3,
            "type": "anomaly",
            "icon": "AlertTriangle",
            "text": f"{active_anomalies} active consumption anomalies currently flagged for technical verification.",
            "detail": "None confirmed as non-technical loss; field inspections queued."
        },
        {
            "id": 4,
            "type": "weather",
            "icon": "Sun",
            "text": "Temperature sensitive cooling load expected to ramp up by +14% during midday peak heat.",
            "detail": "Ambient forecast reaches 33.5°C at 14:00."
        }
    ]

    conn.close()

    return {
        "kpis": {
            "total_consumers": total_consumers,
            "current_total_load_kw": current_total_load,
            "predicted_next_hour_kw": predicted_next_hour,
            "predicted_24h_peak": predicted_24h_peak,
            "active_anomalies_count": active_anomalies,
            "avg_daily_kwh_per_consumer": avg_daily_kwh_per_consumer,
            "data_as_of": latest_ts
        },
        "trends": {
            "hours_24": trend_24h,
            "days_7": trend_7d,
            "days_30": trend_30d
        },
        "category_distribution": category_distribution,
        "forecast_24h": forecast_24["forecast_timeline"],
        "recent_alerts": recent_alerts,
        "quick_insights": insights
    }

