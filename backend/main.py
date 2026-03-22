import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import uuid
import re
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from scipy import stats

app = FastAPI(title="Zentrixa API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

global_session_cache = {}

class ChatRequest(BaseModel):
    query: str
    dataset_id: str

class PredictRequest(BaseModel):
    column: str
    periods: int
    dataset_id: str

@app.post("/api/predict")
async def predict_trend(request: PredictRequest):
    session_id = request.dataset_id
    if session_id not in global_session_cache:
        raise HTTPException(status_code=400, detail="Session expired or invalid.")
    
    df = global_session_cache[session_id].copy()
    col = request.column
    periods = request.periods

    if col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{col}' not found.")
    
    if not pd.api.types.is_numeric_dtype(df[col]):
        raise HTTPException(status_code=400, detail="Only numeric columns can be predicted.")

    # Drop missing values for the selected column
    df = df.dropna(subset=[col])
    
    # Try to find a date column
    date_col = None
    for c in df.columns:
        if any(x in c.lower() for x in ['date', 'time', 'timestamp']):
            try:
                df[c] = pd.to_datetime(df[c])
                date_col = c
                break
            except:
                continue
    
    if date_col:
        df = df.sort_values(by=date_col)
        # Convert date to ordinal for regression
        X = df[date_col].map(datetime.toordinal).values.reshape(-1, 1)
        last_date = df[date_col].max()
    else:
        # Use row index if no date column found
        X = np.arange(len(df)).reshape(-1, 1)
        last_date = datetime.now()

    y = df[col].values

    try:
        model = LinearRegression()
        model.fit(X, y)
        
        # Forecast future points
        if date_col:
            future_dates = [last_date + timedelta(days=i+1) for i in range(periods)]
            X_future = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
            future_labels = [d.strftime('%Y-%m-%d') for d in future_dates]
        else:
            X_future = np.arange(len(df), len(df) + periods).reshape(-1, 1)
            future_labels = [f"Point {i+1}" for i in range(len(df), len(df) + periods)]

        y_pred = model.predict(X_future)

        # Simple Confidence Interval calculation (Std Dev of residuals)
        residuals = y - model.predict(X)
        resid_std = np.std(residuals)
        
        # Recent history for chart context (e.g., last 20 points)
        history_len = min(20, len(df))
        history_data = []
        for i in range(len(df) - history_len, len(df)):
            label = df[date_col].iloc[i].strftime('%Y-%m-%d') if date_col else f"Point {i+1}"
            history_data.append({
                "name": label,
                "actual": float(df[col].iloc[i]),
                "type": "actual"
            })

        predictions = []
        for i in range(len(y_pred)):
            val = float(y_pred[i])
            predictions.append({
                "name": future_labels[i],
                "forecast": val,
                "upper": val + (1.96 * resid_std),
                "lower": val - (1.96 * resid_std),
                "type": "forecast"
            })

        summary_text = f"Based on historical trends, {col} is projected to follow a linear pattern and reach approximately ${predictions[-1]['forecast']:,.2f} by {future_labels[-1]}."

        response_data = {
            "status": "success",
            "history": history_data,
            "predictions": predictions,
            "summary": summary_text
        }
        print(f"DEBUG: Backend Prediction Response: {len(history_data)} historical points, {len(predictions)} forecast points")
        return response_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

def detect_anomalies(df, numeric_columns):
    """Detects statistical outliers and sudden value changes."""
    anomalies_map = {} # (row, col) -> anomaly_data
    
    for col in numeric_columns:
        # Drop NaN for calculation but track original indices
        col_data = df[col].dropna()
        if len(col_data) < 3:
            continue
            
        # Z-score method (statistical outliers)
        try:
            z_scores = np.abs(stats.zscore(col_data))
            outlier_mask = z_scores > 2.5
            
            for idx, is_outlier in enumerate(outlier_mask):
                if is_outlier:
                    orig_idx = int(col_data.index[idx])
                    z_val = float(z_scores[idx])
                    key = (orig_idx, col)
                    
                    anomalies_map[key] = {
                        "row_index": orig_idx,
                        "column": col,
                        "value": float(df.loc[orig_idx, col]),
                        "z_score": z_val,
                        "severity": "critical" if z_val > 3.0 else "warning",
                        "reasons": [f"Atypical value ({z_val:.1f}σ from mean)"]
                    }
        except Exception:
            pass # Handle edge cases like zero variance
        
        # Sudden spike/drop detection
        if len(col_data) > 1:
            pct_change = col_data.pct_change() * 100
            
            for idx in pct_change.index:
                val = pct_change[idx]
                if abs(val) > 50:
                    key = (int(idx), col)
                    reason = f"Sudden {'spike' if val > 0 else 'drop'}: {abs(val):.1f}% change"
                    
                    if key in anomalies_map:
                        anomalies_map[key]["reasons"].append(reason)
                    else:
                        anomalies_map[key] = {
                            "row_index": int(idx),
                            "column": col,
                            "value": float(df.loc[idx, col]),
                            "severity": "warning", # Default for spikes
                            "reasons": [reason]
                        }

    # Format for frontend with "reason" string
    results = []
    for a in anomalies_map.values():
        a["reason"] = " & ".join(a["reasons"])
        del a["reasons"]
        results.append(a)
        
    return results

@app.post("/api/upload")
@app.post("/api/upload/")
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    print(f"DEBUG: Received upload request for {file.filename}")
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        total_rows, total_cols = df.shape
        if total_rows == 0:
            raise ValueError("The uploaded CSV is empty.")
            
        session_id = str(uuid.uuid4())
        global_session_cache[session_id] = df

        missing_values = df.isnull().sum().to_dict()
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        numeric_stats = {}
        for col in numeric_cols:
            numeric_stats[col] = {
                "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                "median": float(df[col].median()) if not pd.isna(df[col].median()) else None,
                "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
                "max": float(df[col].max()) if not pd.isna(df[col].max()) else None
            }
            
        insights = []
        
        # 1. High Correlation Insight
        if len(numeric_cols) >= 2:
            corr_matrix = df[numeric_cols].corr()
            mask = np.triu(np.ones_like(corr_matrix, dtype=bool), k=1)
            corr_matrix = corr_matrix.where(mask)
            max_corr_val = corr_matrix.abs().max().max()
            if pd.notna(max_corr_val) and max_corr_val > 0.6:
                col1, col2 = corr_matrix.abs().stack().idxmax()
                actual_val = corr_matrix.loc[col1, col2]
                strength = "Strong positive" if actual_val > 0 else "Strong negative"
                insights.append({
                    "title": "Variable Correlation",
                    "icon": "TrendingUp",
                    "description": f"A **{strength.lower()} correlation** of **{actual_val:.2f}** was detected between **{col1}** and **{col2}**.",
                    "details": [f"This suggests that as {col1} changes, {col2} tends to follow a predictable pattern.", "Consider these variables linked in your predictive models."],
                    "chartType": "none",
                    "chartData": []
                })

        # 2. Dominant Category Insight
        dominant_cats = []
        for col in categorical_cols:
            if not df[col].empty:
                val_counts = df[col].value_counts()
                if not val_counts.empty:
                    top_name = str(val_counts.index[0])
                    count = int(val_counts.iloc[0])
                    pct = (count / total_rows) * 100
                    dominant_cats.append((col, top_name, count, pct))
        
        if dominant_cats:
            dominant_cats.sort(key=lambda x: x[2], reverse=True)
            col, name, count, pct = dominant_cats[0]
            insights.append({
                "title": f"Market Dominance: {col}",
                "icon": "Award",
                "description": f"The category **'{name}'** accounts for **{pct:.1f}%** of all entries in the **{col}** column.",
                "details": [f"Total occurrences: {count}", f"This segment significantly outweighs other options in your {col} distribution."],
                "chartType": "none",
                "chartData": []
            })

        # 3. Revenue/Financial Analysis if applicable
        money_cols = [c for c in numeric_cols if any(x in c.lower() for x in ['revenue', 'sales', 'profit', 'price', 'salary', 'total'])]
        if money_cols and categorical_cols:
            money_col = money_cols[0]
            cat_col = categorical_cols[0]
            grouped = df.groupby(cat_col)[money_col].sum().sort_values(ascending=False)
            if not grouped.empty:
                top_group = grouped.idxmax()
                top_val = float(grouped.max())
                total_val = float(grouped.sum())
                if total_val > 0:
                    pct = (top_val / total_val) * 100
                    chart_pts = [{"name": str(k), "value": float(v)} for k, v in grouped.head(5).items()]
                    insights.append({
                        "title": f"Financial Leader by {cat_col}",
                        "icon": "TrendingUp",
                        "description": f"**{top_group}** is currently leading in total **{money_col}**, contributing **{pct:.1f}%** of the total volume.",
                        "details": [f"Total {money_col}: ${top_val:,.2f}", f"Top 5 {cat_col} groups represent the majority of your financial performance."],
                        "chartType": "bar",
                        "chartData": chart_pts
                    })

        # 4. Data Quality Insight
        total_missing = sum(missing_values.values())
        if total_missing == 0:
            insights.append({
                "title": "Data Integrity Report",
                "icon": "Package",
                "description": "The dataset is **perfectly clean** with **100% data completion** across all rows and columns.",
                "details": ["No imputation or cleaning steps are required for this analysis.", "Data source is highly reliable."],
                "chartType": "none",
                "chartData": []
            })
        else:
            total_cells = total_rows * total_cols
            missing_pct = (total_missing / total_cells) * 100
            insights.append({
                "title": "Data Quality Warning",
                "icon": "AlertTriangle",
                "description": f"Found **{total_missing} missing cells** (**{missing_pct:.1f}%** of total data), which may impact analysis accuracy.",
                "details": [f"We recommend investigating records with missing values before making critical decisions.", f"Columns with most gaps: {', '.join([k for k, v in sorted(missing_values.items(), key=lambda x: x[1], reverse=True)[:3] if v > 0])}"],
                "chartType": "none",
                "chartData": []
            })

        insights = insights[:4] # Keep it tidy for the 2x2 grid
        anomalies = detect_anomalies(df, numeric_cols)
        
        preview_data = df.head(100).fillna("").to_dict(orient="records")
        columns = df.columns.tolist()
        
        return {
            "status": "success",
            "dataset_id": session_id,
            "filename": file.filename,
            "summary": {
                "rows": total_rows,
                "columns": total_cols,
                "missingValues": missing_values,
                "numericStats": numeric_stats
            },
            "insights": insights,
            "anomalies": anomalies,
            "data": {
                "headers": columns,
                "rows": preview_data
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@app.post("/api/chat")
@app.post("/chat")
async def chat_analysis(request: ChatRequest):
    session_id = request.dataset_id
    query = request.query.lower()
    
    if session_id not in global_session_cache:
        raise HTTPException(status_code=400, detail="Session expired or invalid. Please re-upload the CSV.")
        
    df = global_session_cache[session_id]
    
    response_text = "I cannot find that information in the dataset."
    chart_type = "none"
    chart_data = []
    
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=['number']).columns.tolist()
    
    def find_col(q, cols):
        for c in cols:
            if c.lower() in q: return c
        return None
        
    try:
        if any(w in query for w in ['total', 'sum']):
            num_c = find_col(query, numeric_cols)
            cat_c = find_col(query, categorical_cols)
            if num_c and cat_c:
                grouped = df.groupby(cat_c)[num_c].sum().sort_values(ascending=False).head(10)
                response_text = f"Here is the total {num_c} broken down by {cat_c}."
                chart_type = "bar"
                chart_data = [{"name": str(k), "value": round(float(v), 2)} for k, v in grouped.items()]
            elif num_c:
                val = df[num_c].sum()
                response_text = f"The total {num_c} is {val:,.2f}."
                
        elif any(w in query for w in ['average', 'mean']):
            num_c = find_col(query, numeric_cols)
            cat_c = find_col(query, categorical_cols)
            if num_c and cat_c:
                grouped = df.groupby(cat_c)[num_c].mean().sort_values(ascending=False).head(10)
                response_text = f"Here is the average {num_c} by {cat_c}."
                chart_type = "bar"
                chart_data = [{"name": str(k), "value": round(float(v), 2)} for k, v in grouped.items()]
            elif num_c:
                val = df[num_c].mean()
                response_text = f"The average {num_c} is {val:,.2f}."
                
        elif any(w in query for w in ['top', 'highest', 'best']):
            num_c = find_col(query, numeric_cols)
            cat_c = find_col(query, categorical_cols)
            limit = 5
            match = re.search(r'(?:top|best)\s+(\d+)', query)
            if match:
                limit = int(match.group(1))
                
            if num_c and cat_c:
                grouped = df.groupby(cat_c)[num_c].sum().sort_values(ascending=False).head(limit)
                response_text = f"Top {limit} {cat_c}s by {num_c}: " + ", ".join([f"{k} ({v:,.2f})" for k, v in grouped.items()])
                chart_type = "bar"
                chart_data = [{"name": str(k), "value": round(float(v), 2)} for k, v in grouped.items()]
            elif num_c:
                response_text = f"The highest {num_c} is {df[num_c].max():,.2f}."
                
        elif any(w in query for w in ['trend', 'over time']):
            num_c = find_col(query, numeric_cols)
            date_c = find_col(query, categorical_cols) 
            
            if not date_c:
                for c in categorical_cols:
                    if any(x in c.lower() for x in ['date', 'time', 'day', 'month', 'year']):
                        date_c = c
                        break
                        
            if date_c and num_c:
                try:
                    df_temp = df.copy()
                    df_temp[date_c] = pd.to_datetime(df_temp[date_c])
                    grouped = df_temp.groupby(df_temp[date_c].dt.strftime('%Y-%m-%d'))[num_c].sum()
                    response_text = f"Here's the {num_c} trend over time."
                    chart_type = "line"
                    chart_data = [{"name": str(k), "value": round(float(v), 2)} for k, v in grouped.items()]
                except:
                    response_text = f"Could not parse '{date_c}' as dates for trend analysis."
            else:
                response_text = "I need a numeric column and a date/time column for trend analysis."
                
        elif any(w in query for w in ['compare', 'comparison']):
             cat_c = find_col(query, categorical_cols)
             num_c = find_col(query, numeric_cols)
             if num_c and cat_c:
                grouped = df.groupby(cat_c)[num_c].sum()
                response_text = f"Comparison of {cat_c} based on {num_c}."
                chart_type = "bar"
                chart_data = [{"name": str(k), "value": round(float(v), 2)} for k, v in grouped.items()]
             else:
                response_text = "Please specify categories and metrics to compare."
                
    except Exception as e:
        response_text = f"I encountered an error analyzing that: {str(e)}"
        
    return {"answer": response_text, "chartType": chart_type, "chartData": chart_data}

@app.get("/")
def root():
    return {"message": "AI Data Analyst Assistant API is running"}
