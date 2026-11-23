from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from forecasting.engine import forecasting_engine

router = APIRouter(prefix="/api/forecast", tags=["forecasting"])


class ForecastRequest(BaseModel):
    consumer_id: str = Field(default="ALL", description="Consumer ID or 'ALL' for entire grid aggregate")
    horizon_hours: int = Field(default=24, description="Forecast horizon: 1, 6, or 24 hours")
    model_name: str = Field(default="XGBoost Regressor", description="Forecasting model to use")


@router.post("")
def run_forecast(req: ForecastRequest):
    # Validate horizon
    if req.horizon_hours not in [1, 6, 24]:
        req.horizon_hours = 24

    res = forecasting_engine.generate_forecast(
        consumer_id=req.consumer_id,
        horizon_hours=req.horizon_hours,
        model_name=req.model_name
    )
    return res


@router.get("/models")
def list_available_models():
    return {
        "models": [
            {
                "id": "XGBoost Regressor",
                "name": "XGBoost Regressor",
                "badge": "Recommended / Highest Accuracy",
                "type": "Extreme Gradient Boosting",
                "speed": "Fast (< 1.5s)",
                "description": "Optimized tree ensemble capturing non-linear weather-load interactions and steep peak ramps."
            },
            {
                "id": "Random Forest Regressor",
                "name": "Random Forest Regressor",
                "badge": "Ensemble",
                "type": "Bootstrap Bagged Trees",
                "speed": "Fast (< 2.3s)",
                "description": "Robust against localized spikes and noisy smart-meter telemetry."
            },
            {
                "id": "Linear Regression",
                "name": "Linear Regression (Ridge L2)",
                "badge": "Academic Baseline",
                "type": "Parametric Linear Model",
                "speed": "Instant (< 0.1s)",
                "description": "Standard linear regression with trigonometric harmonic encodings."
            },
            {
                "id": "LSTM Neural Baseline",
                "name": "LSTM Neural Baseline",
                "badge": "Deep Sequential",
                "type": "Sequential Neural Network",
                "speed": "Medium (~ 5.8s)",
                "description": "Sequential neural network modeling multi-step temporal lag autocorrelation."
            }
        ]
    }

