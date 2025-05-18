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

interface RatingDataPoint {
  month: string;
  avgRating: number;
  count: number;
}

interface RatingTrendChartProps {
  data: RatingDataPoint[];
}

/**
 * RatingTrendChart Component
 * Displays rating trends over time using a line chart
 */
export const RatingTrendChart: React.FC<RatingTrendChartProps> = ({ data }) => {
  // Format data for chart
  const chartData = data.map(item => ({
    month: formatMonth(item.month),
    avgRating: parseFloat(item.avgRating.toFixed(1)),
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
          domain={[0, 5]}
          tickFormatter={(value) => `${value}`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [`${value}`, 'Rating']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="avgRating"
          stroke="#f59e0b"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          name="Average Rating"
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
