"use client";

import React, { useState, useRef } from 'react';
import styles from './Sidebar.module.css';
import { 
  BarChart3, 
  MessageSquare, 
  TrendingUp, 
  Table, 
  Settings, 
  Upload, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Loader2,
  X
} from 'lucide-react';

interface SidebarProps {
  onUploadSuccess: (data: any, summary: any, insights?: any[], id?: string, anomalies?: any[]) => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ 
  onUploadSuccess, 
  isOpen, 
  setOpen, 
  isMobileOpen, 
  setMobileOpen, 
  activeTab, 
  setActiveTab 
}: SidebarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'Chat Analysis', icon: MessageSquare },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'explorer', label: 'Data Explorer', icon: Table },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.status === 'success') {
        onUploadSuccess(
          result.data, 
          result.summary, 
          result.insights, 
          result.dataset_id,
          result.anomalies
        );
        setActiveTab('overview');
        setMobileOpen(false);
      } else {
        throw new Error(result.detail || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleItemClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      <div 
        className={`${styles.overlay} ${isMobileOpen ? styles.overlayVisible : ''}`} 
        onClick={() => setMobileOpen(false)} 
      />
      
      <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Database size={24} className={styles.primaryIcon} />
          </div>
          {(isOpen || isMobileOpen) && <span className={styles.logoText}>Zentrixa</span>}
          
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>

          <button className={styles.toggleBtn} onClick={() => setOpen(!isOpen)}>
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            {(isOpen || isMobileOpen) && <span className={styles.groupLabel}>Main Menu</span>}
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  title={!isOpen ? item.label : ''}
                >
                  <Icon size={20} className={styles.icon} />
                  {(isOpen || isMobileOpen) && <span className={styles.label}>{item.label}</span>}
                  {activeTab === item.id && (isOpen || isMobileOpen) && <div className={styles.activeIndicator} />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className={styles.footer}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv" 
            className={styles.hiddenInput} 
          />
          <button 
            className={styles.uploadBtn} 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 size={18} className={styles.spin} /> : <Upload size={18} />}
            {(isOpen || isMobileOpen) && <span>{isUploading ? 'Uploading...' : 'Upload CSV'}</span>}
          </button>
          {error && (isOpen || isMobileOpen) && <p className={styles.error}>{error}</p>}
        </div>

        {(isOpen || isMobileOpen) && (
          <div className={styles.sidebarNote}>
            <p className="text-muted" style={{ fontSize: '0.75rem', padding: '0 1.25rem' }}>
              Strictly local processing. Your data stays safe.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
