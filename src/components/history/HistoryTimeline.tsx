import React, { useState } from 'react';
import { Workout } from '../../types';

interface HistoryTimelineProps {
  workouts: Workout[];
  onWorkoutSelect?: (workout: Workout) => void;
  className?: string;
}

export function HistoryTimeline({
  workouts,
  onWorkoutSelect,
  className = ''
}: HistoryTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workout History</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDateChange(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
          <span className="text-sm text-gray-600">
            {formatDate(selectedDate)}
          </span>
          <button
            onClick={() => handleDateChange(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            →
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {workouts.map(workout => (
          <div
            key={workout.date}
            onClick={() => onWorkoutSelect?.(workout)}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{workout.type}</h3>
                <p className="text-sm text-gray-500">
                  {workout.exercises.length} exercises
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(new Date(workout.date))}
              </div>
            </div>
            {workout.completed && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 