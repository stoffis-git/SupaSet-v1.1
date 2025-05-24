import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import WorkoutPreview from '../components/WorkoutPreview';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import Tabs from '../components/ui/Tabs';

const HistoryPage: React.FC = () => {
  const { state } = useAppContext();
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  
  if (selectedWorkout) {
    const workout = state.workouts[selectedWorkout];
    if (workout) {
      return (
        <WorkoutPreview 
          workout={workout} 
          onBack={() => setSelectedWorkout(null)} 
        />
      );
    }
  }
  
  // Get sorted workouts
  const workouts = Object.values(state.workouts)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Group workouts by month
  const workoutsByMonth: Record<string, typeof workouts> = {};
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const monthYear = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!workoutsByMonth[monthYear]) {
      workoutsByMonth[monthYear] = [];
    }
    
    workoutsByMonth[monthYear].push(workout);
  });
  
  // Group workouts by type
  const workoutsByType: Record<string, number> = {};
  workouts.forEach(workout => {
    const type = workout.type;
    workoutsByType[type] = (workoutsByType[type] || 0) + 1;
  });
  
  const AllHistoryTab = () => (
    <div className="space-y-8">
      {Object.keys(workoutsByMonth).length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
            No workout history yet
          </h3>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Complete workouts to see your history here!
          </p>
        </div>
      ) : (
        Object.entries(workoutsByMonth).map(([monthYear, monthWorkouts]) => (
          <div key={monthYear}>
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              {monthYear}
            </h2>
            <div className="space-y-3">
              {monthWorkouts.map(workout => (
                <div 
                  key={workout.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedWorkout(workout.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} Workout
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {new Date(workout.date).toLocaleDateString()} · {workout.exercises.length} exercises
                        </p>
                      </div>
                      {workout.completed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
  
  const StatisticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Workout Frequency
        </h3>
        
        <div className="space-y-3">
          {Object.entries(workoutsByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" 
                    style={{ width: `${(count / workouts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
          <BarChart3 size={20} className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Summary
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Workouts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{workouts.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {workouts.filter(w => w.completed).length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {workoutsByMonth[Object.keys(workoutsByMonth)[0]]?.length || 0}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <p className="text-sm text-gray-500 dark:text-gray-400">Most Common</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {Object.entries(workoutsByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const CalendarTab = () => (
    <div className="text-center py-10">
      <Calendar size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
        Calendar view coming soon
      </h3>
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
        Track your progress with a visual calendar in a future update
      </p>
    </div>
  );
  
  const tabs = [
    {
      id: 'history',
      label: 'History',
      content: <AllHistoryTab />,
    },
    {
      id: 'stats',
      label: 'Statistics',
      content: <StatisticsTab />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      content: <CalendarTab />,
    },
  ];
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Workout History
      </h1>
      
      <Tabs tabs={tabs} variant="underline" />
    </div>
  );
};

export default HistoryPage;