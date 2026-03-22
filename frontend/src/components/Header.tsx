import React from 'react';
import styles from './Header.module.css';
import { Bell, Search, User, ChevronRight, Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onToggleMenu: () => void;
}

export default function Header({ activeTab, onToggleMenu }: HeaderProps) {
  const formatTabName = (tab: string) => {
    return tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.left}>
          <button className={styles.menuBtn} onClick={onToggleMenu}>
            <Menu size={20} />
          </button>
          
          <div className={styles.breadcrumbs}>
            <span className={styles.breadcrumbItem}>Dashboard</span>
            <ChevronRight size={14} className={styles.separator} />
            <span className={`${styles.breadcrumbItem} ${styles.active}`}>
              {formatTabName(activeTab)}
            </span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search data..." className={styles.searchInput} />
          </div>
          
          <button className={styles.iconBtn}>
            <Bell size={20} />
            <span className={styles.badge}></span>
          </button>
          
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              <User size={20} />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Demo User</span>
              <span className={styles.userRole}>Analyst</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
