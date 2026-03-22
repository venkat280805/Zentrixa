"use client";

import React, { useState } from 'react';
import styles from './AnomalyAlerts.module.css';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface AnomalyAlertsProps {
  anomalies: any[];
}

import { useSettings } from '@/context/SettingsContext';

interface AnomalyAlertsProps {
  anomalies: any[];
}

export default function AnomalyAlerts({ anomalies = [] }: AnomalyAlertsProps) {
  const { settings } = useSettings();
  const [visibleCount, setVisibleCount] = useState(6);
  
  if (!settings.showAnomalies) return null;

  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];
  
  // Filter anomalies based on thresholds from settings
  // Note: Backend z_score is used for comparison
  const filteredAnomalies = safeAnomalies.filter(a => {
    if (a.z_score !== undefined) {
      return a.z_score >= settings.anomalyThreshold;
    }
    // For spikes, if we have a magnitude or similar field, we could use spikeThreshold
    return true; 
  });

  const criticalCount = filteredAnomalies.filter(a => a.z_score && a.z_score > 3.0).length;
  const warningCount = filteredAnomalies.length - criticalCount;

  if (filteredAnomalies.length === 0) {
    return (
      <div className={`${styles.alert} ${styles.alertSuccess} fade-in`}>
        <CheckCircle2 size={20} />
        <div>
          <div className={styles.alertTitle}>Data Health Check Passed</div>
          <div className={styles.alertText}>No anomalies detected with current sensitivity ({settings.anomalyThreshold}σ).</div>
        </div>
      </div>
    );
  }

  const displayedAnomalies = filteredAnomalies.slice(0, visibleCount);
  const hasMore = filteredAnomalies.length > visibleCount;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.summaryInfo}>
          <h3 className="heading-secondary" style={{ margin: 0 }}>Anomaly Detection</h3>
          <div className={styles.badgeRow}>
            {criticalCount > 0 && <span className={`${styles.badge} ${styles.badgeDanger}`}>{criticalCount} Critical</span>}
            {warningCount > 0 && <span className={`${styles.badge} ${styles.badgeWarning}`}>{warningCount} Warnings</span>}
          </div>
        </div>
        
        <div className={styles.headerActions}>
          {safeAnomalies.length > 6 && (
            <button 
              className={styles.toggleBtn}
              onClick={() => setVisibleCount(hasMore ? Math.min(visibleCount + 10, safeAnomalies.length) : 6)}
            >
              {hasMore ? (
                <span className={styles.btnContent}>Show More ({safeAnomalies.length - visibleCount}) <ChevronDown size={16} /></span>
              ) : (
                <span className={styles.btnContent}>Show Fewer <ChevronUp size={16} /></span>
              )}
            </button>
          )}
          
          {hasMore && (
            <button 
              className={styles.toggleBtn}
              onClick={() => setVisibleCount(safeAnomalies.length)}
              style={{ marginLeft: '0.5rem' }}
            >
              Show All
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {displayedAnomalies.map((anomaly, idx) => {
          const isCritical = anomaly.severity === 'critical';
          const Icon = isCritical ? AlertCircle : AlertTriangle;
          
          return (
            <div 
              key={idx} 
              className={`${styles.alert} ${isCritical ? styles.alertDanger : styles.alertWarning} fade-in`}
            >
              <Icon size={20} className={styles.icon} />
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>
                  {anomaly.column} <span className={styles.rowLabel}>Row {anomaly.row_index + 1}</span>
                </div>
                <div className={styles.alertText}>{anomaly.reason}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
