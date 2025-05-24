import React from 'react';
import { WorkoutType } from '../types';
import Button from './ui/Button';
import { Dumbbell, Users, ArrowUpCircle, ArrowDownCircle, Activity } from 'lucide-react';

interface WorkoutTypeSelectorProps {
  onSelect: (type: WorkoutType) => void;
}

const workoutTypes: { type: WorkoutType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    type: 'fullBody', 
    label: 'Full Body', 
    icon: <Users size={24} />,
    description: 'Targets all major muscle groups in a single session'
  },
  { 
    type: 'upperBody', 
    label: 'Upper Body', 
    icon: <ArrowUpCircle size={24} />,
    description: 'Focuses on chest, back, shoulders and arms'
  },
  { 
    type: 'lowerBody', 
    label: 'Lower Body', 
    icon: <ArrowDownCircle size={24} />,
    description: 'Targets legs, glutes and core muscles'
  },
  { 
    type: 'push', 
    label: 'Push', 
    icon: <Activity size={24} />,
    description: 'Concentrates on all pushing movements'
  },
  { 
    type: 'pull', 
    label: 'Pull', 
    icon: <Dumbbell size={24} />,
    description: 'Focuses on all pulling exercises'
  },
];

const WorkoutTypeSelector: React.FC<WorkoutTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        What's your focus today?
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {workoutTypes.map(({ type, label, icon, description }) => (
          <div 
            key={type}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={() => onSelect(type)}
          >
            <div className="p-5">
              <div className="flex items-center mb-2">
                <span className="mr-2 text-indigo-600 dark:text-indigo-400">
                  {icon}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {label}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {description}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onSelect(type)}
              >
                Generate Workout
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutTypeSelector;