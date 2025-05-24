import React from 'react';
import { WorkoutType } from '../../types';

interface StrategyStats {
  totalWorkouts: number;
  completedWorkouts: number;
  averageCompletionRate: number;
  lastUsed: Date;
}

interface StrategyAnalyticsProps {
  stats: Map<string, StrategyStats>;
  className?: string;
}

export function StrategyAnalytics({
  stats,
  className = ''
}: StrategyAnalyticsProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold">Strategy Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(stats.entries()).map(([strategyId, stat]) => (
          <div
            key={strategyId}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            <h3 className="font-medium mb-2">{strategyId}</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Workouts</span>
                <span className="font-medium">{stat.totalWorkouts}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completion Rate</span>
                <span className="font-medium">
                  {formatPercentage(stat.averageCompletionRate)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Used</span>
                <span className="font-medium">
                  {formatDate(stat.lastUsed)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: formatPercentage(stat.averageCompletionRate) }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 