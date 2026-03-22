"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalRows: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function Pagination({
  currentPage,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}: PaginationProps) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  
  if (totalPages <= 1) return null;

  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Showing <strong>{startRow}</strong> to <strong>{endRow}</strong> of <strong>{totalRows}</strong> rows
      </div>

      <div className={styles.controls}>
        <div className={styles.pageSize}>
          <span>Rows per page:</span>
          <select 
            value={rowsPerPage} 
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className={styles.select}
          >
            {[25, 50, 100, 250].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className={styles.buttons}>
          <button 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1}
            className={styles.pageBtn}
            title="First Page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className={styles.pageBtn}
            title="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className={styles.pageIndicator}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>

          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
            title="Next Page"
          >
            <ChevronRight size={18} />
          </button>
          <button 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
            title="Last Page"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
