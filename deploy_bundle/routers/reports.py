from fastapi import APIRouter, Query
from fastapi.responses import Response, FileResponse
from datetime import datetime
import pandas as pd
import io
import os

from database import get_db_connection

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/download-description-pdf")
def download_description_pdf():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "VOLTA_Project_Description.pdf"))
    if not os.path.exists(pdf_path):
        import sys
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from generate_pdf_description import build_pdf
        build_pdf()
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename="VOLTA_Project_Description.pdf"
    )


@router.get("/summary")
def get_reports_summary(
    category: str = Query("All"),
    consumer_id: str = Query("All")
):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT MAX(timestamp) FROM readings")
    latest_ts = cur.fetchone()[0]

    # Filtering base
    where_clause = " WHERE 1=1"
    params = []
    if category != "All":
        where_clause += " AND c.category = ?"
        params.append(category)
    if consumer_id != "All":
        where_clause += " AND c.consumer_id = ?"
        params.append(consumer_id)

    # Total and average stats
    query_stats = f"""
    SELECT 
        COUNT(DISTINCT c.consumer_id) as total_consumers,
        SUM(r.consumption_kw) as total_consumption_kwh,
        AVG(r.consumption_kw) as avg_hourly_demand_kw,
        MAX(r.consumption_kw) as peak_observed_kw
    FROM readings r
    JOIN consumers c ON r.consumer_id = c.consumer_id
    {where_clause}
    """
    cur.execute(query_stats, params)
    stats_row = cur.fetchone()

    total_cons = int(stats_row["total_consumers"] or 0)
    total_kwh = round(float(stats_row["total_consumption_kwh"] or 0), 2)
    avg_kw = round(float(stats_row["avg_hourly_demand_kw"] or 0), 2)
    peak_kw = round(float(stats_row["peak_observed_kw"] or 0), 2)
    avg_daily_kwh = round(total_kwh / (30.0 * max(total_cons, 1)), 2)

    # Consumer-wise consumption table
    query_consumers = f"""
    SELECT 
        c.consumer_id, c.name, c.category, c.location, c.capacity_kw,
        SUM(r.consumption_kw) as total_kwh,
        AVG(r.consumption_kw) as avg_kw,
        MAX(r.consumption_kw) as peak_kw
    FROM consumers c
    LEFT JOIN readings r ON c.consumer_id = r.consumer_id
    {where_clause}
    GROUP BY c.consumer_id
    ORDER BY total_kwh DESC
    """
    cur.execute(query_consumers, params)
    consumer_breakdown = [
        {
            "consumer_id": r["consumer_id"],
            "name": r["name"],
            "category": r["category"],
            "location": r["location"],
            "capacity_kw": float(r["capacity_kw"]),
            "total_kwh": round(float(r["total_kwh"] or 0), 2),
            "avg_kw": round(float(r["avg_kw"] or 0), 2),
            "peak_kw": round(float(r["peak_kw"] or 0), 2)
        }
        for r in cur.fetchall()
    ]

    # Anomaly summary in scope
    query_anomalies = f"""
    SELECT COUNT(*) as count, severity
    FROM anomalies a
    JOIN consumers c ON a.consumer_id = c.consumer_id
    {where_clause}
    GROUP BY severity
    """
    cur.execute(query_anomalies, params)
    anomaly_counts = {r["severity"]: int(r["count"]) for r in cur.fetchall()}

    # Model evaluation snapshot
    cur.execute("SELECT model_name, mae, rmse, mape, r2_score FROM model_metrics ORDER BY mae ASC")
    models_summary = [dict(r) for r in cur.fetchall()]

    conn.close()

    return {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "filters_applied": {"category": category, "consumer_id": consumer_id},
        "kpis": {
            "total_consumers_monitored": total_cons,
            "total_grid_consumption_kwh": total_kwh,
            "average_hourly_demand_kw": avg_kw,
            "peak_demand_kw": peak_kw,
            "average_daily_kwh_per_consumer": avg_daily_kwh,
            "anomalies_detected": sum(anomaly_counts.values()),
            "critical_anomalies": anomaly_counts.get("Critical", 0)
        },
        "consumer_breakdown": consumer_breakdown,
        "anomaly_distribution": anomaly_counts,
        "model_performance_summary": models_summary
    }


@router.get("/export/{report_type}")
def export_report_csv(report_type: str):
    conn = get_db_connection()

    if report_type == "consumers":
        query = """
        SELECT c.consumer_id, c.name, c.category, c.location, c.capacity_kw,
               SUM(r.consumption_kw) as total_kwh, AVG(r.consumption_kw) as avg_load_kw, MAX(r.consumption_kw) as max_load_kw
        FROM consumers c
        LEFT JOIN readings r ON c.consumer_id = r.consumer_id
        GROUP BY c.consumer_id
        ORDER BY c.consumer_id
        """
        filename = f"smartgrid_consumers_report_{datetime.now().strftime('%Y%m%d')}.csv"

    elif report_type == "anomalies":
        query = """
        SELECT a.id, a.consumer_id, c.name as consumer_name, c.category, a.timestamp,
               a.actual_kw, a.expected_kw, a.deviation_pct, a.severity, a.detection_method, a.status, a.reason
        FROM anomalies a
        JOIN consumers c ON a.consumer_id = c.consumer_id
        ORDER BY a.timestamp DESC
        """
        filename = f"smartgrid_anomalies_report_{datetime.now().strftime('%Y%m%d')}.csv"

    elif report_type == "forecasts":
        # Export latest 24h readings and simulated baseline forecasts
        query = """
        SELECT r.consumer_id, r.timestamp, r.consumption_kw as actual_kw, r.expected_kw, r.temperature, r.humidity
        FROM readings r
        ORDER BY r.timestamp DESC
        LIMIT 500
        """
        filename = f"smartgrid_demand_forecast_report_{datetime.now().strftime('%Y%m%d')}.csv"

    else:
        query = "SELECT * FROM model_metrics"
        filename = f"smartgrid_model_metrics_{datetime.now().strftime('%Y%m%d')}.csv"

    df = pd.read_sql_query(query, conn)
    conn.close()

    csv_data = df.to_csv(index=False).encode('utf-8')
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

