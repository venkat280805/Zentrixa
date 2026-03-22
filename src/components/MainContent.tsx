"use client";

import React from 'react';
import styles from './MainContent.module.css';
import SummaryCards from './SummaryCards';
import InsightsPanel from './InsightsPanel';
import DataTable from './DataTable';
import PredictionsPanel from './PredictionsPanel';
import AnomalyAlerts from './AnomalyAlerts';
import SettingsPanel from './SettingsPanel';

interface MainContentProps {
  dataset: any;
  summary: any;
  insights?: any[];
  anomalies?: any[];
  datasetId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MainContent({ 
  dataset, 
  summary, 
  insights, 
  anomalies = [], 
  datasetId,
  activeTab
}: MainContentProps) {
  
  if (!dataset && !summary) {
    return (
      <div className={styles.emptyState}>
        <div className="card" style={{ textAlign: 'center', padding: '4rem', maxWidth: '600px' }}>
          <h2 className="heading-primary">Welcome to Zentrixa</h2>
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            Upload a CSV file in the sidebar to begin your automated data exploration. 
            We&apos;ll generate insights, detect anomalies, and prepare forecasts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {activeTab === 'overview' && (
        <div className="fade-in">
          {summary && (
            <SummaryCards 
              summary={summary} 
              anomalyCount={anomalies.length} 
              hasCriticalAnomalies={anomalies.some(a => a.severity === 'critical')}
            />
          )}
          
          <div className={styles.grid}>
            <div className={styles.column}>
              {insights && insights.length > 0 && <InsightsPanel insights={insights} />}
            </div>
            <div className={styles.column}>
              <AnomalyAlerts anomalies={anomalies} />
            </div>
          </div>

          <div className="card fade-in" style={{ marginTop: '1.5rem' }}>
            <div className={styles.cardHeader} style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
              <h3 className="heading-secondary">Recent Data Preview</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>First 50 rows of your dataset</p>
            </div>
            <DataTable dataset={dataset} anomalies={anomalies} isNested />
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="fade-in">
          {datasetId ? (
            <PredictionsPanel datasetId={datasetId} summary={summary} />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 className="heading-secondary">No Dataset Active</h3>
              <p className="text-muted">Upload a file to enable predictive forecasting.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'explorer' && (
        <div className="card fade-in">
          <div className={styles.cardHeader} style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
            <h3 className="heading-secondary">Data Explorer</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Full record search and filtering</p>
          </div>
          <DataTable dataset={dataset} anomalies={anomalies} isNested />
        </div>
      )}

      {activeTab === 'chat' && (
        <div className={styles.chatPlaceholder}>
          <div className="card fade-in" style={{ padding: '4rem', textAlign: 'center' }}>
            <h3 className="heading-secondary">AI Chat Analysis</h3>
            <p className="text-muted" style={{ marginTop: '1rem' }}>
              Interact with your data using natural language. 
              The analysis engine is ready to answer questions about trends, distributions, and outliers.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Chat overlay is also available in the bottom right of all views.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="fade-in">
          <div className={styles.cardHeader} style={{ marginBottom: '1.5rem' }}>
            <h3 className="heading-secondary">Analysis Settings</h3>
            <p className="text-muted">Configure anomaly thresholds, forecasting models, and UI preferences.</p>
          </div>
          <SettingsPanel />
        </div>
      )}
    </div>
  );
}
