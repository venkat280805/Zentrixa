import React, { useState } from 'react';
import styles from './DashboardLayout.module.css';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onUploadSuccess: any;
}

export default function DashboardLayout({ children, activeTab, setActiveTab, onUploadSuccess }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className={styles.layout}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onUploadSuccess={onUploadSuccess}
      />
      <div className={`${styles.main} ${!isSidebarOpen ? styles.mainExpanded : ''}`}>
        <Header 
          activeTab={activeTab} 
          onToggleMenu={toggleMobileMenu}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
