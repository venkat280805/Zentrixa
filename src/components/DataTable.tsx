"use client";

import React, { useState, useMemo } from 'react';
import styles from './DataTable.module.css';
import Pagination from './Pagination';

interface DataTableProps {
  dataset: any;
  anomalies?: any[];
  isNested?: boolean;
}

import { useSettings } from '@/context/SettingsContext';

export default function DataTable({ dataset, anomalies = [], isNested = false }: DataTableProps) {
  const { settings, updateSettings } = useSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = settings.rowsPerPage;

  // Hooks must be called unconditionally at the top level
  const allRows = useMemo(() => {
    if (!dataset) return [];
    return Array.isArray(dataset) ? dataset : ((dataset as any).rows || []);
  }, [dataset]);

  const totalRows = allRows.length;

  const columns = useMemo(() => {
    if (!dataset) return [];
    return Array.isArray(dataset) ? (dataset[0] ? Object.keys(dataset[0]) : []) : ((dataset as any).headers || []);
  }, [dataset]);

  // Create a map for quick anomaly lookup: row_index -> { column -> severity }
  const anomalyMap = useMemo(() => {
    const map: Record<number, Record<string, string>> = {};
    if (anomalies && Array.isArray(anomalies)) {
      anomalies.forEach(a => {
        if (!map[a.row_index]) { map[a.row_index] = {}; }
        map[a.row_index][a.column] = a.severity;
      });
    }
    return map;
  }, [anomalies]);

  // Pagination logic hooks
  const paginatedRows = useMemo(() => {
    if (!allRows) return [];
    const start = (currentPage - 1) * rowsPerPage;
    return allRows.slice(start, start + rowsPerPage);
  }, [allRows, currentPage, rowsPerPage]);

  // Handle various data states gracefully AFTER hooks
  if (!dataset) return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--tblr-text-muted)' }}>No data loaded.</div>;
  if (allRows.length === 0) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--tblr-text-muted)' }}>The dataset is empty.</div>;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll table to top when page changes
    const tableContainer = document.querySelector(`.${styles.tableResponsive}`);
    if (tableContainer) tableContainer.scrollTop = 0;
  };

  const handleRowsPerPageChange = (size: number) => {
    updateSettings({ rowsPerPage: size });
    setCurrentPage(1);
  };

  const tableContent = (
    <div className={styles.tableResponsive}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stickyCol}>#</th>
            {(columns as string[]).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(paginatedRows as any[]).map((row, idx) => {
            const actualIdx = (currentPage - 1) * rowsPerPage + idx;
            return (
              <tr key={actualIdx}>
                <td className={styles.rowCount}>{actualIdx + 1}</td>
                {(columns as string[]).map((col) => {
                  const severity = anomalyMap[actualIdx]?.[col];
                  const cellClass = severity === 'critical' 
                    ? styles.cellCritical 
                    : severity === 'warning' 
                      ? styles.cellWarning 
                      : '';
                  
                  return (
                    <td key={col} className={cellClass}>
                      {row[col]?.toString() || '-'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {isNested ? (
        <>
          {tableContent}
          <Pagination 
            currentPage={currentPage}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tableContent}
          <Pagination 
            currentPage={currentPage}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      )}
    </>
  );
}
