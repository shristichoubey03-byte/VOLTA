from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta
from typing import Optional
import pandas as pd
import numpy as np

from database import get_db_connection
from forecasting.engine import forecasting_engine

router = APIRouter(prefix="/api/consumers", tags=["consumers"])


@router.get("")
def list_consumers(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT MAX(timestamp) FROM readings")
    latest_ts = cur.fetchone()[0]

    # Subquery for today's consumption sum (last 24h)
    dt_latest = datetime.fromisoformat(latest_ts)
    dt_24h_ago = (dt_latest - timedelta(hours=24)).isoformat()

    query = """
    SELECT 
        c.consumer_id, c.name, c.category, c.location, c.connection_type, c.capacity_kw, c.base_load_kw,
        COALESCE(r_now.consumption_kw, c.base_load_kw) as current_load_kw,
        COALESCE(r_day.daily_kwh, 0.0) as daily_kwh,
        COALESCE(a_active.anomaly_count, 0) as active_anomalies
    FROM consumers c
    LEFT JOIN readings r_now ON c.consumer_id = r_now.consumer_id AND r_now.timestamp = ?
    LEFT JOIN (
        SELECT consumer_id, SUM(consumption_kw) as daily_kwh
        FROM readings
        WHERE timestamp >= ?
        GROUP BY consumer_id
    ) r_day ON c.consumer_id = r_day.consumer_id
    LEFT JOIN (
        SELECT consumer_id, COUNT(*) as anomaly_count
        FROM anomalies
        WHERE status != 'Resolved'
        GROUP BY consumer_id
    ) a_active ON c.consumer_id = a_active.consumer_id
    WHERE 1=1
    """
    params = [latest_ts, dt_24h_ago]

    if category and category != "All":
        query += " AND c.category = ?"
        params.append(category)

    if search:
        query += " AND (c.consumer_id LIKE ? OR c.name LIKE ? OR c.location LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])

    query += " ORDER BY c.consumer_id ASC"

    cur.execute(query, params)
    rows = cur.fetchall()

    results = []
    for r in rows:
        cur_load = round(float(r["current_load_kw"]), 2)
        cap = float(r["capacity_kw"])
        anom_count = int(r["active_anomalies"])

        # Determine smart status
        if anom_count > 0:
            consumer_status = "Anomaly Detected"
            status_color = "red"
        elif cur_load > 0.85 * cap:
            consumer_status = "High Consumption"
            status_color = "orange"
        else:
            consumer_status = "Normal"
            status_color = "green"

        if status and status != "All" and consumer_status != status:
            continue

        # Next hour estimation
        pred_next_hr = round(cur_load * np.random.uniform(0.96, 1.05), 2)

        results.append({
            "consumer_id": r["consumer_id"],
            "name": r["name"],
            "category": r["category"],
            "location": r["location"],
            "connection_type": r["connection_type"],
            "capacity_kw": cap,
            "base_load_kw": float(r["base_load_kw"]),
            "current_load_kw": cur_load,
            "daily_kwh": round(float(r["daily_kwh"]), 2),
            "predicted_next_hour_kw": pred_next_hr,
            "status": consumer_status,
            "status_color": status_color,
            "active_anomalies": anom_count
        })

    conn.close()
    return {"total": len(results), "consumers": results}


@router.get("/{consumer_id}")
def get_consumer_profile(consumer_id: str):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM consumers WHERE consumer_id = ?", (consumer_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Consumer not found")

    consumer = dict(row)

    # Compute overall statistics
    cur.execute("""
    SELECT 
        AVG(consumption_kw) as avg_load,
        MAX(consumption_kw) as max_load,
        MIN(consumption_kw) as min_load,
        SUM(consumption_kw) as total_kwh
    FROM readings
    WHERE consumer_id = ?
    """, (consumer_id,))
    stats = cur.fetchone()

    # Peak hour analysis (which hour of day has highest average consumption)
    cur.execute("""
    SELECT substr(timestamp, 12, 2) as hr, AVG(consumption_kw) as avg_hr_load
    FROM readings
    WHERE consumer_id = ?
    GROUP BY hr
    ORDER BY avg_hr_load DESC
    LIMIT 1
    """, (consumer_id,))
    peak_hr_row = cur.fetchone()
    peak_hr_str = f"{peak_hr_row[0]}:00" if peak_hr_row else "19:00"

    conn.close()

    return {
        "consumer": consumer,
        "metrics": {
            "average_load_kw": round(float(stats["avg_load"] or 0), 2),
            "highest_load_kw": round(float(stats["max_load"] or 0), 2),
            "lowest_load_kw": round(float(stats["min_load"] or 0), 2),
            "total_consumption_kwh": round(float(stats["total_kwh"] or 0), 2),
            "highest_consumption_period": f"Peak demand typically occurs around {peak_hr_str}",
            "load_factor": round(float(stats["avg_load"] or 1) / max(float(stats["max_load"] or 1), 0.1), 2)
        }
    }


@router.get("/{consumer_id}/history")
def get_consumer_history(consumer_id: str, timeframe: str = "24h"):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT MAX(timestamp) FROM readings")
    latest_ts = cur.fetchone()[0]
    dt_latest = datetime.fromisoformat(latest_ts)

    if timeframe == "24h":
        cutoff = (dt_latest - timedelta(hours=24)).isoformat()
    elif timeframe == "7d":
        cutoff = (dt_latest - timedelta(days=7)).isoformat()
    else: # 30d
        cutoff = (dt_latest - timedelta(days=30)).isoformat()

    cur.execute("""
    SELECT timestamp, consumption_kw, expected_kw, temperature, humidity, is_anomaly
    FROM readings
    WHERE consumer_id = ? AND timestamp >= ?
    ORDER BY timestamp ASC
    """, (consumer_id, cutoff))
    rows = cur.fetchall()

    history = [
        {
            "timestamp": r["timestamp"],
            "hour_label": datetime.fromisoformat(r["timestamp"]).strftime("%b %d %H:00" if timeframe != "24h" else "%H:00"),
            "actual_kw": round(float(r["consumption_kw"]), 2),
            "expected_kw": round(float(r["expected_kw"]), 2),
            "temperature": round(float(r["temperature"]), 1),
            "is_anomaly": bool(r["is_anomaly"])
        }
        for r in rows
    ]

    # Hourly diurnal profile (0-23)
    cur.execute("""
    SELECT CAST(substr(timestamp, 12, 2) AS INTEGER) as hour_of_day,
           AVG(consumption_kw) as avg_actual,
           AVG(expected_kw) as avg_expected
    FROM readings
    WHERE consumer_id = ?
    GROUP BY hour_of_day
    ORDER BY hour_of_day ASC
    """, (consumer_id,))
    hourly_profile = [
        {
            "hour": r["hour_of_day"],
            "hour_label": f"{r['hour_of_day']:02d}:00",
            "actual_kw": round(float(r["avg_actual"]), 2),
            "expected_kw": round(float(r["avg_expected"]), 2)
        }
        for r in cur.fetchall()
    ]

    # Day of week profile
    cur.execute("""
    SELECT timestamp, consumption_kw
    FROM readings
    WHERE consumer_id = ?
    """, (consumer_id,))
    all_rows = cur.fetchall()
    dow_map = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"}
    dow_sums = {i: [] for i in range(7)}
    for r in all_rows:
        dt = datetime.fromisoformat(r["timestamp"])
        dow_sums[dt.weekday()].append(float(r["consumption_kw"]))

    weekly_profile = [
        {
            "day_index": i,
            "day_name": dow_map[i],
            "average_kw": round(float(np.mean(dow_sums[i])), 2) if dow_sums[i] else 0.0
        }
        for i in range(7)
    ]

    # Consumer-specific anomaly history
    cur.execute("""
    SELECT * FROM anomalies
    WHERE consumer_id = ?
    ORDER BY timestamp DESC
    """, (consumer_id,))
    anomalies = [dict(r) for r in cur.fetchall()]

    conn.close()

    # Pre-calculate short term forecasts (1h, 6h, 24h)
    f_1h = forecasting_engine.generate_forecast(consumer_id, 1)["forecast_timeline"]
    f_6h = forecasting_engine.generate_forecast(consumer_id, 6)["forecast_timeline"]
    f_24h = forecasting_engine.generate_forecast(consumer_id, 24)["forecast_timeline"]

    return {
        "consumer_id": consumer_id,
        "timeframe": timeframe,
        "readings": history,
        "hourly_profile": hourly_profile,
        "weekly_profile": weekly_profile,
        "anomalies": anomalies,
        "predictions": {
            "next_1h": f_1h[0] if f_1h else None,
            "next_6h": f_6h,
            "next_24h": f_24h
        }
    }

