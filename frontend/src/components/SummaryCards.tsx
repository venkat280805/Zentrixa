"use client";

import React from 'react';
import styles from './SummaryCards.module.css';
import { Columns, Hash, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface SummaryCardsProps {
  summary: {
    rows: number;
    columns: number;
    missingValues: Record<string, number>;
  };
  anomalyCount: number;
  hasCriticalAnomalies: boolean;
}

export default function SummaryCards({ summary, anomalyCount, hasCriticalAnomalies }: SummaryCardsProps) {
  const rowsVal = (summary.rows || 0).toLocaleString();
  const colsVal = summary.columns || 0;
  const totalMissing = Object.values(summary.missingValues || {}).reduce((a, b) => a + b, 0);

  const stats = [
    {
      label: 'Total Rows',
      value: rowsVal,
      icon: Hash,
      className: styles.iconBlue
    },
    {
      label: 'Columns',
      value: colsVal,
      icon: Columns,
      className: styles.iconBlue
    },
    {
      label: 'Missing Values',
      value: totalMissing,
      icon: AlertTriangle,
      className: totalMissing > 0 ? styles.iconOrange : styles.iconGreen
    },
    {
      label: 'Data Integrity',
      value: anomalyCount > 0 ? `${anomalyCount} Issues` : 'Clean',
      icon: anomalyCount > 0 ? AlertCircle : CheckCircle2,
      className: anomalyCount > 0 ? (hasCriticalAnomalies ? styles.iconRed : styles.iconOrange) : styles.iconGreen
    }
  ];

  return (
    <div className={styles.container}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className={`${styles.card} card`}>
            <div className={`${styles.statIcon} ${stat.className}`}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
