import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationCardProps {
  title: string;
  description: string;
  items: string[];
  color: 'red' | 'green' | 'blue' | 'purple' | 'amber';
}

/**
 * RecommendationCard Component
 * Displays a list of recommendations with a colored border
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  items,
  color
}) => {
  // Map color prop to CSS class
  const colorClass = {
    red: 'border-red-500',
    green: 'border-green-500',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    amber: 'border-amber-500'
  }[color];

  return (
    <Card className={`border-l-4 ${colorClass}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-800 mr-2 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recommendations available</p>
        )}
      </CardContent>
    </Card>
  );
};
