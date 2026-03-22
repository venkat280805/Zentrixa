"use client";

import React, { useState } from 'react';
import styles from './PredictionsPanel.module.css';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';
import { TrendingUp, Calendar, Target, Loader2, AlertCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface PredictionsPanelProps {
  datasetId: string;
  summary: any;
}

export default function PredictionsPanel({ datasetId, summary }: PredictionsPanelProps) {
  const { settings } = useSettings();
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [periods, setPeriods] = useState<number>(settings.defaultHorizon);
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericColumns = React.useMemo(() => {
    if (!summary) return [];
    const stats = summary.numericStats || (summary as any).numeric_stats;
    return stats ? Object.keys(stats) : [];
  }, [summary]);

  const generateForecast = async () => {
    if (!selectedColumn) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          column: selectedColumn, 
          periods, 
          dataset_id: datasetId 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const detail = errorData.detail;
        const message = Array.isArray(detail) 
          ? detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ')
          : (typeof detail === 'string' ? detail : 'Failed to generate forecast');
        throw new Error(message);
      }

      const data = await response.json();
      console.log('DEBUG: Predictions API Response:', data);
      
      if (data.status === 'success') {
        try {
          // Hardcoded test data for debugging as requested by user
          const testData = [
            { date: "Day 1", historical: 1000, forecast: null },
            { date: "Day 2", historical: 1200, forecast: null },
            { date: "Day 3", historical: null, forecast: 1300 },
            { date: "Day 4", historical: null, forecast: 1400 }
          ];

          const combined = [
            ...data.history.map((h: any) => ({ 
              date: h.name?.split(' ')[0] || h.name || 'History',
              historical: h.actual,
              forecast: null
            })),
            ...data.predictions.map((p: any) => ({ 
              date: p.name?.split(' ')[0] || p.name || 'Forecast',
              historical: null,
              forecast: p.forecast
            }))
          ];

          console.log('DEBUG: Received predictions data:', data);
          console.log('DEBUG: Chart data being passed to Recharts:', combined);
          
          // To use test data, uncomment the line below:
          // setPredictionData(testData); 
          setPredictionData(combined);
          
        } catch (err: any) {
          console.error('DEBUG: Prediction error:', err);
          setError(err.message || String(err));
        } finally {
          setLoading(false);
        }
      } else {
        throw new Error(data.detail || 'Prediction failed');
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!datasetId || !summary) {
    return (
      <div className="card fade-in" style={{ padding: '4rem', textAlign: 'center' }}>
        <div className={styles.emptyChart}>
          <TrendingUp size={48} color="var(--tblr-border)" />
          <h3 className="heading-secondary" style={{ marginTop: '1.5rem' }}>Predictive Engine Inactive</h3>
          <p className="text-muted">Please upload a dataset in the sidebar to enable machine learning forecasts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className="card">
          <h3 className="heading-secondary" style={{ marginBottom: '1.25rem' }}>Forecast Settings</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Target Column</label>
            <select 
              className={styles.select}
              value={selectedColumn} 
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <option value="">Select Column...</option>
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Horizon: {periods} Days</label>
            <input 
              type="range" 
              min="7" 
              max="60" 
              step="7"
              value={periods} 
              onChange={(e) => setPeriods(parseInt(e.target.value))}
              className={styles.range}
            />
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={generateForecast}
            disabled={!selectedColumn || loading}
          >
            {loading ? <Loader2 size={18} className={styles.spin} /> : <Target size={18} />}
            <span style={{ marginLeft: '8px' }}>Generate Forecast</span>
          </button>

          {error && (
            <div className={styles.errorArea}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--tblr-text-muted)', marginBottom: '1rem' }}>Methodology</h4>
          <p style={{ fontSize: '0.8125rem', lineHeight: '1.5' }}>
            Using <strong>Linear Regression</strong> on time-indexed data. We calculate confidence intervals based on residual variance.
          </p>
        </div>
      </aside>

      <div className={styles.chartArea}>
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className={styles.chartHeader}>
            <div className={styles.titleWrapper}>
              <h3 className="heading-secondary" style={{ margin: 0 }}>
                {selectedColumn ? `${selectedColumn} Forecast` : 'Forecast Visualization'}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
                Reflecting next {periods} days based on historical trends
              </p>
            </div>
            {predictionData && (
              <div className={styles.badge}>
                <TrendingUp size={14} />
                Live Projection
              </div>
            )}
          </div>

          <div className={styles.canvas}>
            {predictionData && (
              <div style={{ position: 'absolute', top: 5, right: 5, fontSize: '10px', color: 'red', zIndex: 100 }}>
                DEBUG: {predictionData.length} pts
              </div>
            )}
            {loading ? (
              <div className={styles.chartLoader}>
                <Loader2 size={40} className={styles.spin} />
                <p>Analyzing historical patterns...</p>
              </div>
            ) : predictionData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tblr-border)" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickMargin={10} 
                    axisLine={false}
                    tickLine={false}
                    stroke="var(--tblr-text-muted)"
                  />
                  <YAxis 
                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => val.toLocaleString()}
                    stroke="var(--tblr-text-muted)"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '4px', 
                      border: '1px solid var(--tblr-border)', 
                      backgroundColor: 'var(--tblr-surface)',
                      boxShadow: 'var(--tblr-card-box-shadow)',
                      fontSize: '12px',
                      color: 'var(--tblr-text)'
                    }} 
                    itemStyle={{ color: 'var(--tblr-text)' }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: 'var(--tblr-text)' }} 
                  />
                  
                  {/* Historical Data */}
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#206bc4" 
                    strokeWidth={2} 
                    dot={{ fill: '#206bc4', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Historical"
                    connectNulls
                  />
                  
                  {/* Prediction */}
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#f76707" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={{ fill: '#f76707', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Forecast"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <TrendingUp size={48} color="var(--tblr-border)" />
                <p>Select a column to generate visual forecast data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
