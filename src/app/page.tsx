"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Chatbot from '@/components/Chatbot';
import styles from './page.module.css';

import DashboardLayout from '@/components/DashboardLayout';

export default function Home() {
  const [dataset, setDataset] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleUploadSuccess = (data: any, summaryData: any, insightsData?: any[], id?: string, anomalyData?: any[]) => {
    setDataset(data);
    setSummary(summaryData);
    setInsights(insightsData || []);
    setAnomalies(anomalyData || []);
    if (id) setDatasetId(id);
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onUploadSuccess={handleUploadSuccess}
    >
      <MainContent 
        dataset={dataset} 
        summary={summary} 
        insights={insights} 
        anomalies={anomalies}
        datasetId={datasetId || undefined}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {datasetId && <Chatbot datasetId={datasetId} active={activeTab === 'chat'} />}
    </DashboardLayout>
  );
}
