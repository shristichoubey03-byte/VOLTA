import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db
from forecasting.engine import forecasting_engine
from routers import dashboard, consumers, forecasting, anomalies, weather, models, dataset, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing VOLTA SQLite database & historical telemetry...")
    init_db()
    print("Pre-training ML forecasting models (Ridge, Random Forest, XGBoost, LSTM Neural Baseline)...")
    try:
        forecasting_engine.train_models()
    except Exception as e:
        print(f"Warning: Model pre-training encountered: {e}")
    print("VOLTA Backend ready to serve requests!")
    yield
    print("Shutting down VOLTA Backend.")


app = FastAPI(
    title="VOLTA API",
    description="VOLTA – Multi-Consumer Electricity Demand Forecasting and Anomaly Detection System API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development and production ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(dashboard.router)
app.include_router(consumers.router)
app.include_router(forecasting.router)
app.include_router(anomalies.router)
app.include_router(weather.router)
app.include_router(models.router)
app.include_router(dataset.router)
app.include_router(reports.router)


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "VOLTA Backend",
        "models_loaded": len(forecasting_engine.models),
        "database": "sqlite3 (smartgrid.db)"
    }


STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_root():
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {
            "project": "VOLTA",
            "description": "Multi-Consumer Electricity Demand Forecasting and Anomaly Detection System",
            "status": "online",
            "documentation": "/docs"
        }

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
else:
    @app.get("/")
    def root():
        return {
            "project": "VOLTA",
            "description": "Multi-Consumer Electricity Demand Forecasting and Anomaly Detection System",
            "status": "online",
            "documentation": "/docs"
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

