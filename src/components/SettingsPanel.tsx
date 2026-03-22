"use client";

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import styles from './SettingsPanel.module.css';
import { 
  Shield, 
  TrendingUp, 
  Monitor, 
  BarChart3, 
  Download, 
  Save, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPanel() {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Anomaly Detection */}
        <section className="card fade-in">
          <div className={styles.sectionHeader}>
            <Shield className={styles.iconBlue} size={20} />
            <h3 className="heading-secondary">Anomaly Detection</h3>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label>Z-Score Threshold</label>
              <span>{settings.anomalyThreshold.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="2.0" 
              max="4.0" 
              step="0.1" 
              value={settings.anomalyThreshold}
              onChange={(e) => updateSettings({ anomalyThreshold: parseFloat(e.target.value) })}
              className={styles.range}
            />
            <p className={styles.helpText}>Lower is more sensitive. Default: 2.5</p>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label>Spike/Drop Sensitivity</label>
              <span>{(settings.spikeThreshold * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0.3" 
              max="1.0" 
              step="0.1" 
              value={settings.spikeThreshold}
              onChange={(e) => updateSettings({ spikeThreshold: parseFloat(e.target.value) })}
              className={styles.range}
            />
          </div>
          <div className={styles.toggleRow}>
            <label>Show Anomaly Alerts</label>
            <input 
              type="checkbox" 
              checked={settings.showAnomalies}
              onChange={(e) => updateSettings({ showAnomalies: e.target.checked })}
              className={styles.toggle}
            />
          </div>
        </section>

        {/* Predictive Engine */}
        <section className="card fade-in">
          <div className={styles.sectionHeader}>
            <TrendingUp className={styles.iconGreen} size={20} />
            <h3 className="heading-secondary">Predictions</h3>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Default Forecast Horizon</label>
            <select 
              value={settings.defaultHorizon}
              onChange={(e) => updateSettings({ defaultHorizon: parseInt(e.target.value) })}
              className={styles.select}
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label>Confidence Level</label>
              <span>{(settings.confidenceInterval * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0.8" 
              max="0.99" 
              step="0.01" 
              value={settings.confidenceInterval}
              onChange={(e) => updateSettings({ confidenceInterval: parseFloat(e.target.value) })}
              className={styles.range}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Model Type</label>
            <select 
              value={settings.modelType}
              onChange={(e) => updateSettings({ modelType: e.target.value })}
              className={styles.select}
            >
              <option value="linear">Linear Regression</option>
              <option value="poly">Polynomial (Experimental)</option>
              <option value="arima">ARIMA (Backend Required)</option>
            </select>
          </div>
        </section>

        {/* Data Display */}
        <section className="card fade-in">
          <div className={styles.sectionHeader}>
            <Monitor className={styles.iconOrange} size={20} />
            <h3 className="heading-secondary">Display & Formatting</h3>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Default Rows Per Page</label>
            <select 
              value={settings.rowsPerPage}
              onChange={(e) => updateSettings({ rowsPerPage: parseInt(e.target.value) })}
              className={styles.select}
            >
              <option value={25}>25 Rows</option>
              <option value={50}>50 Rows</option>
              <option value={100}>100 Rows</option>
              <option value={250}>250 Rows</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Date Format</label>
            <select 
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
              className={styles.select}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Theme Preference</label>
            <select 
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as any })}
              className={styles.select}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode (Coming Soon)</option>
              <option value="auto">System Default</option>
            </select>
          </div>
        </section>

        {/* Chart Preferences */}
        <section className="card fade-in">
          <div className={styles.sectionHeader}>
            <BarChart3 className={styles.iconPurple} size={20} />
            <h3 className="heading-secondary">Chart Settings</h3>
          </div>
          <div className={styles.toggleRow}>
            <label>Show Grid Lines</label>
            <input 
              type="checkbox" 
              checked={settings.showGridLines}
              onChange={(e) => updateSettings({ showGridLines: e.target.checked })}
              className={styles.toggle}
            />
          </div>
          <div className={styles.toggleRow}>
            <label>Show Values on Hover</label>
            <input 
              type="checkbox" 
              checked={settings.showDataLabels}
              onChange={(e) => updateSettings({ showDataLabels: e.target.checked })}
              className={styles.toggle}
            />
          </div>
          <div className={styles.toggleRow}>
            <label>Smooth Animations</label>
            <input 
              type="checkbox" 
              checked={settings.animation}
              onChange={(e) => updateSettings({ animation: e.target.checked })}
              className={styles.toggle}
            />
          </div>
        </section>
      </div>

      <div className={styles.actions}>
        <button className={styles.resetBtn} onClick={resetToDefaults}>
          <RotateCcw size={18} />
          Reset to Defaults
        </button>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={18} />
          Save Settings
        </button>
      </div>

      {showToast && (
        <div className={styles.toast}>
          <CheckCircle2 size={18} />
          <span>Settings saved to persistent storage</span>
        </div>
      )}
    </div>
  );
}
