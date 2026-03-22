"use client";

import React, { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  useEffect(() => {
    const root = window.document.documentElement;
    const theme = settings.theme;

    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [settings.theme]);

  // Prevent flash of unstyled content (optional: could add a simple SSR-safe initial theme)
  return <>{children}</>;
}
