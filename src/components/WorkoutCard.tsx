import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from './ui/Card';
import { Workout } from '../types';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import Button from './ui/Button';

interface WorkoutCardProps {
  workout: Workout;
  onSelect: (workout: Workout) => void;
  view?: 'compact' | 'full';
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ 
  workout, 
  onSelect,
  view = 'compact'
}) => {
  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  const workoutTypeLabels: Record<string, string> = {
    'fullBody': 'Full Body',
    'upperBody': 'Upper Body',
    'lowerBody': 'Lower Body',
    'push': 'Push',
    'pull': 'Pull',
  };
  
  const exerciseCount = workout.exercises.length;
  const completedExercises = workout.exercises.filter(
    exercise => exercise.sets.every(set => set.completed)
  ).length;
  
  return (
    <Card 
      className={`transition-transform duration-200 hover:-translate-y-1 ${workout.completed ? 'border-l-4 border-l-green-500' : ''}`}
      onClick={() => onSelect(workout)}
    >
      <CardHeader className="flex justify-between items-center py-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {workoutTypeLabels[workout.type]}
        </h3>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <CalendarDays size={16} className="mr-1" />
          {formattedDate}
        </div>
      </CardHeader>
      
      <CardBody className="py-3">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {exerciseCount} exercises
          </div>
          {workout.duration && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock size={16} className="mr-1" />
              {workout.duration} min
            </div>
          )}
        </div>
        
        {view === 'full' && (
          <div className="mt-3 space-y-2">
            {workout.exercises.slice(0, 4).map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="font-medium">{item.exercise.name}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {item.sets.length} sets
                </span>
              </div>
            ))}
            {workout.exercises.length > 4 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                +{workout.exercises.length - 4} more...
              </div>
            )}
          </div>
        )}
      </CardBody>
      
      <CardFooter className="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-900/50">
        {workout.completed ? (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle2 size={16} className="mr-1" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {completedExercises}/{exerciseCount} completed
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(workout);
          }}
        >
          {workout.completed ? 'View' : 'Continue'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;