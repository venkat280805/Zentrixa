"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Settings {
  anomalyThreshold: number;
  spikeThreshold: number;
  showAnomalies: boolean;
  defaultHorizon: number;
  confidenceInterval: number;
  modelType: string;
  rowsPerPage: number;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'auto';
  showGridLines: boolean;
  showDataLabels: boolean;
  animation: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  anomalyThreshold: 2.5,
  spikeThreshold: 0.5,
  showAnomalies: true,
  defaultHorizon: 14,
  confidenceInterval: 0.95,
  modelType: 'linear',
  rowsPerPage: 25,
  dateFormat: 'YYYY-MM-DD',
  numberFormat: 'en-US',
  theme: 'light',
  showGridLines: true,
  showDataLabels: false,
  animation: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_analyst_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ai_analyst_settings', JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetToDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
