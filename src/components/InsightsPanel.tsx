"use client";

import React, { useState } from 'react';
import styles from './InsightsPanel.module.css';
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Zap, 
  Target,
  BarChart2,
  Award,
  Package
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

const ICON_MAP: Record<string, any> = {
  'TrendingUp': TrendingUp,
  'TrendingDown': TrendingDown,
  'AlertCircle': AlertCircle,
  'Zap': Zap,
  'Target': Target,
  'BarChart2': BarChart2,
  'Lightbulb': Lightbulb,
  'Award': Award,
  'Package': Package
};

const COLOR_MAP: Record<string, string> = {
  'TrendingUp': styles.iconGreen,
  'TrendingDown': styles.iconRed,
  'AlertCircle': styles.iconOrange,
  'Zap': styles.iconBlue,
  'Target': styles.iconPurple,
  'BarChart2': styles.iconBlue,
  'Lightbulb': styles.iconOrange,
  'Award': styles.iconOrange,
  'Package': styles.iconBlue
};

function InsightCard({ insight }: { insight: any }) {
  // Parse insight if it's a string
  let data = insight;
  if (typeof insight === 'string') {
    try {
      if (insight.startsWith('{')) {
        data = JSON.parse(insight);
      } else {
        data = { title: "AI Insight", description: insight, icon: 'Lightbulb' };
      }
    } catch (e) {
      data = { title: "AI Observation", description: insight, icon: 'Lightbulb' };
    }
  }

  const IconComponent = ICON_MAP[data.icon] || Lightbulb;
  const colorClass = COLOR_MAP[data.icon] || styles.iconOrange;

  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <div className={`${styles.iconWrapper} ${colorClass}`}>
          <IconComponent size={20} />
        </div>
        <h4 className={styles.cardTitle}>{data.title}</h4>
      </div>
      
      <p className={styles.cardDescription}>{data.description}</p>
      
      {data.details && <div className={styles.details}>{data.details}</div>}
      
      {data.chartData && Array.isArray(data.chartData) && data.chartData.length > 0 && (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="colorInsight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--tblr-primary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--tblr-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ fontSize: '10px', borderRadius: '4px', border: 'none' }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--tblr-primary)" 
                fillOpacity={1} 
                fill="url(#colorInsight)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.badge && <div className={styles.badge}>{data.badge}</div>}
    </div>
  );
}

export default function InsightsPanel({ insights = [] }: { insights: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!insights || (Array.isArray(insights) && insights.length === 0)) {
    return (
      <div className="card fade-in">
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <Lightbulb size={20} className={styles.icon} />
            <h3 className="heading-secondary" style={{ margin: 0 }}>Smart Insights</h3>
          </div>
        </div>
        <div className="text-muted" style={{ padding: '0.5rem 0' }}>
          Upload data to generate AI insights.
        </div>
      </div>
    );
  }

  const displayedInsights = isExpanded ? insights : insights.slice(0, 3);
  const hasMore = insights.length > 3;

  return (
    <div className="fade-in" style={{ marginBottom: '2rem' }}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <Lightbulb size={24} className={styles.icon} />
          <h3 className="heading-secondary" style={{ margin: 0 }}>Smart Insights</h3>
        </div>
        
        {hasMore && (
          <button 
            className={styles.toggleBtn}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? `Show Less` : `View All (${insights.length})`}
          </button>
        )}
      </div>

      <div className={styles.insightsList}>
        {displayedInsights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </div>
    </div>
  );
}
