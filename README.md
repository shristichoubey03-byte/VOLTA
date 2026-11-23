# SmartGrid AI
## Multi-Consumer Electricity Demand Forecasting and Anomaly Detection System

An academic AI/ML platform designed to predict short-term electricity consumption for multiple heterogeneous consumers (Residential, Commercial, Industrial, and Institutional), calculate total aggregated grid demand, and identify unusual consumption patterns using machine learning.

---

### Project Key Features

1. **Short-Term Electricity Load Forecasting (Core Feature)**:
   - Predicts electricity consumption for **next 1 hour**, **next 6 hours**, and **next 24 hours**.
   - Supports individual consumer forecasting and aggregate total demand across all 25 consumers:
     $$\text{Total Load}(t) = \sum_{i=1}^n \text{Load}_i(t)$$
   - Compares **Linear Regression**, **Random Forest Regressor**, **XGBoost Regressor**, and **LSTM Neural Baseline**.
   - Predicts peak demand value, exact hour of peak, and provides plain-English explanations.

2. **Multi-Consumer Monitoring & Analytics**:
   - 25 simulated consumers: 12 Residential, 6 Commercial, 4 Industrial, 3 Institutional.
   - Filterable, searchable table with current load (kW), daily energy (kWh), contract capacity, and status badges.
   - Deep consumer profile modal with 24-hour diurnal curves, day-of-week habits, and short-term forecasts.

3. **Multivariate Anomaly Detection**:
   - Algorithms: **Isolation Forest**, **Forecasting Residual Analysis** ($\text{Error} = |\text{Actual} - \text{Expected}|$), and **Statistical Z-Score**.
   - Severity classification: Normal, Moderate, High, Critical.
   - Detailed inspection drawer with 24-hour comparative window and non-accusatory technical diagnostic reasons.

4. **Weather & Meteorological Analysis**:
   - Open-Meteo REST API integration with graceful simulated fallback.
   - Analyzes temperature, humidity, precipitation, wind speed, and cooling degree hours (CDD).
   - Pearson correlation analysis ($r$) between outdoor temperature and grid load.

5. **Empirical Model Performance & Evaluation**:
   - Chronological walk-forward train-test split (80% train / 20% holdout test) preventing future-data leakage.
   - Genuine empirical metrics: MAE, RMSE, MAPE (with safe denominator floor), and $R^2$.
   - Interactive live retraining trigger.

6. **Dataset Management & Quality Audit**:
   - Upload custom CSV or Excel electricity consumption datasets.
   - Automated audit: row count, consumer count, missing values, duplicate timestamps, date range, and quality score (0–100).
   - Sample CSV download option.

7. **Reports & Printable Export**:
   - Filterable demand summaries and consumer energy audits.
   - One-click CSV export for consumers, anomalies, and demand forecasts.
   - Browser print-friendly layout.

---

### Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React icons.
- **Backend**: Python 3.14, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, XGBoost, Requests, SQLite3.

---

### Running Locally

#### 1. Backend Server
```bash
cd backend
python main.py
```
Backend will start on: **http://127.0.0.1:8000** (Interactive Swagger documentation available at `/docs`).

#### 2. Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will be live at: **http://localhost:5173**

