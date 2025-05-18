import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SentimentDataPoint {
  month: string;
  sentiment: number;
  count: number;
}

interface SentimentChartProps {
  data: SentimentDataPoint[];
}

/**
 * SentimentChart Component
 * Displays sentiment trends over time using a line chart
 */
export const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  // Format data for chart
  const chartData = data.map(item => ({
    month: formatMonth(item.month),
    sentiment: parseFloat((item.sentiment * 100).toFixed(1)), // Convert to percentage
    count: item.count
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[-100, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Sentiment']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="sentiment"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          name="Sentiment"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Format month string (YYYY-MM) to more readable format (MMM YYYY)
 */
const formatMonth = (monthStr: string): string => {
  try {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return monthStr;
  }
};
