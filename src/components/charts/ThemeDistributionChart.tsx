import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ThemeData {
  theme: string;
  count: number;
  sentiment: number;
  reviews: number[];
}

interface ThemeDistributionChartProps {
  data: ThemeData[];
}

/**
 * ThemeDistributionChart Component
 * Displays theme distribution using a bar chart
 */
export const ThemeDistributionChart: React.FC<ThemeDistributionChartProps> = ({ data }) => {
  // Format data for chart
  const chartData = data.map(item => ({
    theme: item.theme.length > 12 ? `${item.theme.substring(0, 12)}...` : item.theme,
    fullTheme: item.theme,
    count: item.count,
    sentiment: item.sentiment
  }));

  // Generate color based on sentiment
  const getBarColor = (sentiment: number) => {
    if (sentiment > 0.3) return '#22c55e'; // green
    if (sentiment < -0.3) return '#ef4444'; // red
    return '#eab308'; // yellow
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 0, left: 0, bottom: 60 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="theme" 
          tick={{ fontSize: 12 }}
          width={120}
        />
        <Tooltip
          formatter={(value, name, props) => {
            if (name === 'count') {
              return [`${value} mentions`, props.payload.fullTheme];
            }
            return [value, name];
          }}
        />
        <Bar dataKey="count" name="Mentions">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.sentiment)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
