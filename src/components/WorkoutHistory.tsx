import React from 'react';
import { useAppContext } from '../context/AppContext';
import WorkoutCard from './WorkoutCard';

interface WorkoutHistoryProps {
  onSelectWorkout: (workoutId: string) => void;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ onSelectWorkout }) => {
  const { state } = useAppContext();
  
  // Convert workouts object to array and sort by date (newest first)
  const workouts = Object.values(state.workouts)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (workouts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
          No workout history yet
        </h3>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          Create your first workout to see it here!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Recent Workouts
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {workouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onSelect={() => onSelectWorkout(workout.id)}
            view="full"
          />
        ))}
      </div>
    </div>
  );
};

export default WorkoutHistory;