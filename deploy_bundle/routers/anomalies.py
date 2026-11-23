from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import pandas as pd

from database import get_db_connection
from anomaly_detection.detector import anomaly_detector

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])


class StatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


@router.get("")
def list_anomalies(
    severity: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    consumer_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    conn = get_db_connection()
    cur = conn.cursor()

    query = """
    SELECT a.*, c.name as consumer_name, c.category, c.location, c.capacity_kw
    FROM anomalies a
    JOIN consumers c ON a.consumer_id = c.consumer_id
    WHERE 1=1
    """
    params = []

    if severity and severity != "All":
        query += " AND a.severity = ?"
        params.append(severity)

    if category and category != "All":
        query += " AND c.category = ?"
        params.append(category)

    if consumer_id and consumer_id != "All":
        query += " AND a.consumer_id = ?"
        params.append(consumer_id)

    if status and status != "All":
        query += " AND a.status = ?"
        params.append(status)

    query += " ORDER BY a.timestamp DESC"

    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]

    # Global counts for KPI badges
    cur.execute("SELECT severity, COUNT(*) FROM anomalies GROUP BY severity")
    sev_counts = dict(cur.fetchall())

    conn.close()

    return {
        "summary": {
            "total": sum(sev_counts.values()),
            "critical": sev_counts.get("Critical", 0),
            "high": sev_counts.get("High", 0),
            "moderate": sev_counts.get("Moderate", 0),
            "normal": sev_counts.get("Normal", 0)
        },
        "anomalies": rows
    }


@router.get("/{anomaly_id}")
def get_anomaly_details(anomaly_id: int):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT a.*, c.name as consumer_name, c.category, c.location, c.capacity_kw, c.base_load_kw, c.connection_type
    FROM anomalies a
    JOIN consumers c ON a.consumer_id = c.consumer_id
    WHERE a.id = ?
    """, (anomaly_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Anomaly alert not found")

    anomaly = dict(row)

    # Fetch 24-hour reading window around this timestamp for visualization
    ts_dt = datetime.fromisoformat(anomaly["timestamp"])
    start_win = (ts_dt - timedelta(hours=12)).isoformat()
    end_win = (ts_dt + timedelta(hours=12)).isoformat()

    cur.execute("""
    SELECT timestamp, consumption_kw as actual_kw, expected_kw, temperature, is_anomaly
    FROM readings
    WHERE consumer_id = ? AND timestamp BETWEEN ? AND ?
    ORDER BY timestamp ASC
    """, (anomaly["consumer_id"], start_win, end_win))
    window_readings = [
        {
            "timestamp": r["timestamp"],
            "hour_label": datetime.fromisoformat(r["timestamp"]).strftime("%H:00"),
            "actual_kw": round(float(r["actual_kw"]), 2),
            "expected_kw": round(float(r["expected_kw"]), 2),
            "temperature": round(float(r["temperature"]), 1),
            "is_anomaly": bool(r["is_anomaly"])
        }
        for r in cur.fetchall()
    ]

    conn.close()

    return {
        "anomaly": anomaly,
        "window_readings": window_readings,
        "compliance_notice": (
            "Academic Note: SmartGrid AI flags statistical deviations for diagnostic assessment. "
            "Unusual consumption readings can result from legitimate causes such as seasonal appliance usage, "
            "rooftop solar inverter trips, or smart meter sensor calibrations, and must not be treated as confirmed theft without physical inspection."
        )
    }


@router.post("/{anomaly_id}/status")
def update_anomaly_status(anomaly_id: int, req: StatusUpdateRequest):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    UPDATE anomalies 
    SET status = ?
    WHERE id = ?
    """, (req.status, anomaly_id))
    conn.commit()
    conn.close()

    return {"status": "success", "anomaly_id": anomaly_id, "updated_status": req.status}


@router.post("/scan")
def trigger_anomaly_scan():
    res = anomaly_detector.scan_recent_readings(lookback_hours=72)
    return res

