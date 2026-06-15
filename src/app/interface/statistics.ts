export interface StatPeriod {
  label: string;
  value: string;
}

export interface ChartBar {
  label: string;
  value: number;
  color: string;
}

export interface InsightItem {
  icon: string;
  color: string;
  bg: string;
  title: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  percent: number;
}
