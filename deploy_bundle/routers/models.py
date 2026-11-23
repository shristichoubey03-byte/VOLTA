from fastapi import APIRouter
from datetime import datetime
import pandas as pd
import numpy as np

from database import get_db_connection
from forecasting.engine import forecasting_engine

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/performance")
def get_models_performance():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM model_metrics ORDER BY mae ASC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    # Model comparison bar chart data
    comparison_chart = [
        {
            "model": r["model_name"],
            "mae": r["mae"],
            "rmse": r["rmse"],
            "mape": r["mape"],
            "r2": r["r2_score"],
            "time_sec": r["training_time_sec"]
        }
        for r in rows
    ]

    # Academic details & explanations
    model_cards = [
        {
            "id": "XGBoost Regressor",
            "name": "XGBoost Regressor (Gradient Boosted Decision Trees)",
            "status": "Production Ready",
            "suitability": "Highest Accuracy & Non-linear Capture",
            "how_it_works": "Builds an ensemble of decision trees sequentially, where each new tree specifically corrects the residual errors made by the previous trees. Uses second-order gradient descent.",
            "advantages": "Superb accuracy on sudden evening load surges; captures non-linear temperature heatwave effects; resists overfitting with shrinkage regularization.",
            "limitations": "Slightly more computationally intensive to train than linear regression; requires hyperparameter tuning.",
            "metrics": next((r for r in rows if "XGBoost" in r["model_name"]), None)
        },
        {
            "id": "Random Forest Regressor",
            "name": "Random Forest Regressor (Bootstrap Aggregation)",
            "status": "Production Ready",
            "suitability": "Noise-Resistant Robust Ensemble",
            "how_it_works": "Trains dozens of independent, uncorrelated decision trees in parallel using random subsets of data features, then averages their predictions together.",
            "advantages": "Highly robust against sensor noise, missing smart-meter packets, and sporadic outlier spikes; virtually immune to overfitting.",
            "limitations": "Larger memory footprint when saving hundreds of deep trees; cannot extrapolate beyond historical min/max values.",
            "metrics": next((r for r in rows if "Random Forest" in r["model_name"]), None)
        },
        {
            "id": "LSTM Neural Baseline",
            "name": "LSTM Neural Baseline (Recurrent Neural Network)",
            "status": "Advanced Model",
            "suitability": "Sequential Temporal Memory",
            "how_it_works": "Uses recurrent neural memory cells with forget, input, and output gates to retain information across sequential hours and multi-day temporal lags.",
            "advantages": "Directly models sequential autocorrelations and shift transitions without requiring handcrafted lag features.",
            "limitations": "Longer training duration; requires extensive training data; higher computational inference overhead.",
            "metrics": next((r for r in rows if "LSTM" in r["model_name"]), None)
        },
        {
            "id": "Linear Regression",
            "name": "Linear Regression (Ridge L2 Regularized)",
            "status": "Academic Baseline",
            "suitability": "Ultra-fast & Interpretable Baseline",
            "how_it_works": "Fits a hyperplane that minimizes the penalized sum of squared differences between actual and predicted electricity loads using L2 weight shrinkage.",
            "advantages": "Sub-millisecond inference; 100% transparent and explainable coefficients; minimal memory footprint.",
            "limitations": "Assumes linear relationships; struggles to capture non-linear air-conditioning saturation during extreme heatwaves.",
            "metrics": next((r for r in rows if "Linear Regression" in r["model_name"]), None)
        }
    ]

    return {
        "evaluation_protocol": {
            "methodology": "Chronological Walk-Forward Train-Test Split (80% Train, 20% Test)",
            "data_leakage_prevention": "Strict time-series split prevents future-data lookahead bias.",
            "evaluation_formulas": {
                "MAE": "MAE = (1/n) * Σ |Actual - Predicted|",
                "RMSE": "RMSE = sqrt((1/n) * Σ (Actual - Predicted)²)",
                "MAPE": "MAPE = (100/n) * Σ |(Actual - Predicted) / max(Actual, ε)|",
                "R2": "R² = 1 - (SS_res / SS_tot)"
            }
        },
        "models": rows,
        "comparison_chart": comparison_chart,
        "model_cards": model_cards
    }


@router.post("/train")
def train_models():
    res = forecasting_engine.train_models()
    return res

