from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
import pandas as pd
import io
import math
from datetime import datetime, timedelta

from database import get_db_connection

router = APIRouter(prefix="/api/dataset", tags=["dataset"])


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    filename = file.filename.lower()
    contents = await file.read()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a .csv or .xlsx file.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file contains no data rows.")

    # Standardize column names (lowercase and strip spaces)
    df.columns = [c.strip().lower() for c in df.columns]

    # Required columns check
    has_time = any(c in df.columns for c in ['timestamp', 'datetime', 'time', 'date'])
    has_consumer = any(c in df.columns for c in ['consumer_id', 'consumer', 'id', 'meter_id'])
    has_load = any(c in df.columns for c in ['consumption_kwh', 'consumption_kw', 'load_kw', 'kwh', 'kw'])

    validation_errors = []
    if not has_time:
        validation_errors.append("Missing required timestamp column ('timestamp' or 'datetime').")
    if not has_consumer:
        validation_errors.append("Missing required consumer identifier column ('consumer_id').")
    if not has_load:
        validation_errors.append("Missing required load/consumption column ('consumption_kwh' or 'consumption_kw').")

    # Map column names if present
    time_col = next((c for c in df.columns if c in ['timestamp', 'datetime', 'time', 'date']), None)
    consumer_col = next((c for c in df.columns if c in ['consumer_id', 'consumer', 'id', 'meter_id']), None)
    load_col = next((c for c in df.columns if c in ['consumption_kwh', 'consumption_kw', 'load_kw', 'kwh', 'kw']), None)

    # Missing values
    missing_counts = df.isnull().sum().to_dict()
    total_missing = int(df.isnull().sum().sum())

    # Date range and formatting
    date_range = {"start": "Unknown", "end": "Unknown"}
    duplicate_timestamps = 0

    if time_col:
        try:
            df['parsed_dt'] = pd.to_datetime(df[time_col], errors='coerce')
            valid_dates = df['parsed_dt'].dropna()
            if len(valid_dates) > 0:
                date_range["start"] = valid_dates.min().strftime("%Y-%m-%d %H:%M")
                date_range["end"] = valid_dates.max().strftime("%Y-%m-%d %H:%M")

            # Check duplicates per consumer
            if consumer_col:
                dupes = df.duplicated(subset=[consumer_col, time_col]).sum()
                duplicate_timestamps = int(dupes)
        except Exception:
            pass

    # Number of consumers
    num_consumers = int(df[consumer_col].nunique()) if consumer_col else 1
    total_rows = len(df)

    # Data Quality Score calculation (out of 100)
    score = 100
    deductions = []

    if validation_errors:
        score -= 40
        deductions.append("Critical columns missing (-40 pts)")

    missing_ratio = total_missing / (total_rows * max(len(df.columns), 1))
    if missing_ratio > 0.05:
        penalty = min(25, int(missing_ratio * 100))
        score -= penalty
        deductions.append(f"Missing values detected: {total_missing} cells (-{penalty} pts)")

    if duplicate_timestamps > 0:
        penalty = min(20, int((duplicate_timestamps / total_rows) * 100) + 5)
        score -= penalty
        deductions.append(f"Duplicate timestamp readings found: {duplicate_timestamps} (-{penalty} pts)")

    score = max(10, score)

    # Quality Grade
    if score >= 90:
        grade = "Excellent (Grade A)"
        grade_color = "green"
    elif score >= 75:
        grade = "Good (Grade B)"
        grade_color = "blue"
    elif score >= 50:
        grade = "Acceptable with Warnings (Grade C)"
        grade_color = "orange"
    else:
        grade = "Requires Cleaning (Grade D)"
        grade_color = "red"

    # Preview rows (first 10, fill NaN with None for JSON serializability)
    preview = df.head(10).replace({float('nan'): None}).to_dict(orient='records')
    # Remove internal parsed_dt column from preview
    for row in preview:
        row.pop('parsed_dt', None)

    return {
        "filename": file.filename,
        "is_valid": len(validation_errors) == 0,
        "validation_errors": validation_errors,
        "detected_columns": list(df.columns),
        "total_rows": total_rows,
        "total_consumers": num_consumers,
        "date_range": date_range,
        "missing_values": {
            "total_missing": total_missing,
            "column_breakdown": {k: int(v) for k, v in missing_counts.items() if v > 0}
        },
        "duplicate_timestamps": duplicate_timestamps,
        "quality_report": {
            "score": score,
            "grade": grade,
            "grade_color": grade_color,
            "deductions": deductions,
            "recommendation": (
                "Data is structurally sound and ready for automated ML feature extraction."
                if score >= 75 else
                "Review missing timestamps and ensure constant hourly sampling before model inference."
            )
        },
        "preview": preview
    }


@router.get("/sample")
def download_sample_dataset():
    """
    Generates and serves a clean, ready-to-use CSV template matching project specifications.
    """
    now = datetime(2026, 11, 1, 0, 0)
    rows = []
    consumers = [
        ("C-101", "Residential", 1.2),
        ("C-102", "Residential", 0.9),
        ("C-113", "Commercial", 15.0),
        ("C-119", "Industrial", 45.0),
        ("C-123", "Institutional", 22.0)
    ]

    for h in range(48): # 48 hours sample
        dt = now + timedelta(hours=h)
        iso_str = dt.strftime("%Y-%m-%dT%H:00:00")
        hour_rad = (dt.hour - 5) / 24.0 * 2 * math.pi
        temp = round(26.0 + 7.0 * math.sin(hour_rad), 1)
        hum = round(60.0 - 15.0 * math.sin(hour_rad), 1)

        for cid, ctype, base in consumers:
            mult = 2.0 if (18 <= dt.hour <= 22 or 9 <= dt.hour <= 17) else 0.9
            kwh = round(base * mult + (0.1 if temp > 28 else 0.0), 2)
            rows.append({
                "timestamp": iso_str,
                "consumer_id": cid,
                "consumer_type": ctype,
                "consumption_kwh": kwh,
                "temperature": temp,
                "humidity": hum,
                "location": "SmartGrid Zone 1"
            })

    sample_df = pd.DataFrame(rows)
    csv_bytes = sample_df.to_csv(index=False).encode('utf-8')

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=smartgrid_sample_electricity_data.csv"
        }
    )

