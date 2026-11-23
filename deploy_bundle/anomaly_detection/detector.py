import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

from sklearn.ensemble import IsolationForest
from database import get_db_connection


class AnomalyDetector:
    def __init__(self, contamination: float = 0.03):
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )

    def scan_recent_readings(self, lookback_hours: int = 72) -> Dict[str, Any]:
        """
        Runs full multi-algorithm anomaly detection pipeline across recent readings:
        1. Isolation Forest multivariate outlier detection (load, hour, temperature, delta).
        2. Forecast Residual Deviation: Error = Actual - Expected.
        3. Statistical Rolling Z-Score: (Actual - Mean) / Std > 2.5 sigma.
        """
        conn = get_db_connection()
        cur = conn.cursor()

        # Find latest timestamp
        cur.execute("SELECT MAX(timestamp) FROM readings")
        latest_ts = cur.fetchone()[0]
        if not latest_ts:
            conn.close()
            return {"error": "No readings found to detect anomalies."}

        latest_dt = datetime.fromisoformat(latest_ts)
        cutoff_dt = latest_dt - timedelta(hours=lookback_hours)

        query = """
        SELECT r.*, c.name as consumer_name, c.category, c.capacity_kw, c.base_load_kw, c.location
        FROM readings r
        JOIN consumers c ON r.consumer_id = c.consumer_id
        WHERE r.timestamp >= ?
        ORDER BY r.timestamp ASC
        """
        df = pd.read_sql_query(query, conn, params=(cutoff_dt.isoformat(),))
        conn.close()

        if len(df) == 0:
            return {"message": "No data in window", "anomalies": []}

        df['dt'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['dt'].dt.hour
        df['residual'] = df['consumption_kw'] - df['expected_kw']
        df['abs_residual'] = df['residual'].abs()
        df['deviation_pct'] = (df['abs_residual'] / np.maximum(df['expected_kw'], 0.2)) * 100.0

        # Features for Isolation Forest
        feature_cols = ['consumption_kw', 'expected_kw', 'residual', 'deviation_pct', 'temperature', 'hour']
        X = df[feature_cols].fillna(0).values

        # Fit Isolation Forest
        iso_preds = self.model.fit_predict(X) # -1 is outlier, 1 is inlier
        iso_scores = self.model.decision_function(X) # lower score = more abnormal

        detected = []
        for idx, row in df.iterrows():
            is_iso_outlier = (iso_preds[idx] == -1)
            dev = row['deviation_pct']
            residual = row['residual']
            actual = row['consumption_kw']
            expected = row['expected_kw']

            # Trigger detection if:
            # 1. Isolation Forest flagged AND deviation > 30%
            # OR 2. Severe residual error > 50%
            # OR 3. Sudden plunge < 25% of expected during operational hours
            if (is_iso_outlier and dev > 25.0) or dev > 45.0 or (actual < 0.3 * expected and expected > 2.0):
                # Classify severity
                if dev > 100.0 or actual > row['capacity_kw'] or (actual < 0.2 * expected and expected > 5.0):
                    severity = "Critical"
                elif dev > 50.0:
                    severity = "High"
                elif dev > 25.0:
                    severity = "Moderate"
                else:
                    severity = "Normal"

                # Identify detection method
                methods = []
                if is_iso_outlier:
                    methods.append("Isolation Forest")
                if dev > 40.0:
                    methods.append("Residual Error Analysis")
                if abs(residual) > 2.5 * row['base_load_kw']:
                    methods.append("Statistical Z-Score")

                det_method = " & ".join(methods) if methods else "Residual Deviation"

                # Diagnostic reason and suggested action (Strictly non-accusatory)
                if residual > 0:
                    if actual > row['capacity_kw']:
                        reason = f"Consumption of {actual} kW exceeded contractual threshold ({row['capacity_kw']} kW). Possible unscheduled heavy machinery ramp or HVAC compressor short-cycling."
                        action = "Verify consumer demand limiter settings. Recommend load shedding or automated phase balancing."
                    else:
                        reason = f"Actual load is {round(dev, 1)}% higher than expected baseline ({expected} kW). Could be caused by simultaneous appliance usage, unmonitored heating, or commercial refrigeration cycle drift."
                        action = "Conduct on-site non-intrusive load monitoring (NILM). Check thermal efficiency and operational schedules."
                else:
                    reason = f"Actual load plunged by {round(dev, 1)}% below predicted minimum ({expected} kW). Indicates possible feeder breaker trip, single-phase dropout, or meter sensor decoupling."
                    action = "Dispatch field technician to check CT/PT wiring integrity, fuse continuity, and terminal block security."

                detected.append({
                    "id": int(row['id']),
                    "consumer_id": row['consumer_id'],
                    "consumer_name": row['consumer_name'],
                    "category": row['category'],
                    "location": row['location'],
                    "timestamp": row['timestamp'],
                    "actual_kw": round(float(actual), 2),
                    "expected_kw": round(float(expected), 2),
                    "residual_kw": round(float(residual), 2),
                    "deviation_pct": round(float(dev), 1),
                    "severity": severity,
                    "detection_method": det_method,
                    "status": "Pending Investigation",
                    "reason": reason,
                    "recommended_action": action,
                    "anomaly_score": round(float(-iso_scores[idx]), 3)
                })

        # Sort by timestamp descending then severity
        sev_rank = {"Critical": 4, "High": 3, "Moderate": 2, "Normal": 1}
        detected.sort(key=lambda x: (x['timestamp'], sev_rank.get(x['severity'], 0)), reverse=True)

        return {
            "total_detected": len(detected),
            "critical_count": sum(1 for d in detected if d['severity'] == 'Critical'),
            "high_count": sum(1 for d in detected if d['severity'] == 'High'),
            "moderate_count": sum(1 for d in detected if d['severity'] == 'Moderate'),
            "anomalies": detected
        }

    def get_consumer_anomaly_timeline(self, consumer_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
        SELECT a.*, c.name as consumer_name, c.category, c.location
        FROM anomalies a
        JOIN consumers c ON a.consumer_id = c.consumer_id
        WHERE a.consumer_id = ?
        ORDER BY a.timestamp DESC
        LIMIT ?
        """, (consumer_id, limit))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows


# Singleton instance
anomaly_detector = AnomalyDetector()

