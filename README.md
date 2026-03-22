# Zentrixa
Zentrixa is an AI-powered data analytics platform that transforms raw datasets into actionable business insights using intelligent analysis, natural language querying, predictive modeling, and anomaly detection.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)

## Quick Start (Local Development)

### 1. Start the Backend API
The backend is a FastAPI application located in the `api/` folder.
```bash
uvicorn api.index:app --host 0.0.0.0 --port 8000
```
The API will be available at `http://localhost:8000`.

### 2. Start the Frontend UI
The frontend is a Next.js application. Run it from the root directory:
```bash
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

## Deployment (Vercel)
This project is configured for **Vercel Zero-Config** deployment.
1. Connect this repository to Vercel.
2. Vercel will automatically detect the Next.js frontend and the Python API in the `api/` directory.
3. No additional settings are required!

## Features
- **Smart Insights**: Automated data analysis with Recharts visualizations.
- **Predictive Modeling**: Future trend forecasting with confidence intervals.
- **Anomaly Detection**: Statistical outlier and sudden change detection.
- **Zentrixa AI**: Natural language interface for data querying.
- **Dark Mode**: Persistent premium dark aesthetic.
