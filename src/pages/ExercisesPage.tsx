import React from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { ExerciseList } from '../components/ExerciseList';
import AppLayout from '../layouts/AppLayout';

export default function ExercisesPage() {
  const { state } = useWorkout();

  return (
    <AppLayout>
      <div className="min-h-screen bg-dark-900">
        <div className="w-full max-w-lg mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-indigo-400">Exercises</h1>
            <p className="text-dark-300 mt-2">
              Toggle exercises to include or exclude them from your workout proposals.
            </p>
          </div>
          
          <ExerciseList />
        </div>
      </div>
    </AppLayout>
  );
} 