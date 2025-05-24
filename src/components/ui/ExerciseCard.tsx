import React from 'react';
import { Exercise } from '../../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ExerciseCardProps {
  exercise: Exercise;
  isSelected?: boolean;
  isExpanded: boolean;
  onClick?: () => void;
  onExpand: () => void;
  className?: string;
}

export function ExerciseCard({
  exercise,
  isSelected = false,
  isExpanded,
  onClick,
  onExpand,
  className = ''
}: ExerciseCardProps) {
  return (
    <div
      className={`relative rounded-lg border transition-all duration-200 ${isExpanded ? 'ring-2 ring-indigo-400' : ''} ${isSelected ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-blue-900 border-dark-700 opacity-80'} ${className}`}
    >
      <div
        className={`flex items-center justify-between ${isExpanded ? 'p-4' : 'px-3 py-2'} cursor-pointer`}
        onClick={onClick}
      >
        <div>
          <h3 className={`font-bold mb-1 ${isExpanded ? 'text-lg text-white' : isSelected ? 'text-white' : 'text-indigo-200'}`}>{exercise.name}</h3>
        </div>
        <button
          className="ml-2 p-1 rounded hover:bg-blue-800 text-indigo-200"
          onClick={e => { e.stopPropagation(); onExpand(); }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4">
          {exercise.description && (
            <p className="text-sm text-indigo-100 mb-2">{exercise.description}</p>
          )}
          {exercise.categories && exercise.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {exercise.categories.map(cat => (
                <span key={cat} className="bg-indigo-700 text-indigo-100 px-2 py-1 rounded text-xs font-medium">
                  {cat}
                </span>
              ))}
            </div>
          )}
          {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {exercise.muscle_groups.map(group => (
                <span key={group} className="bg-blue-700 text-blue-100 px-2 py-1 rounded text-xs font-medium">
                  {group}
                </span>
              ))}
            </div>
          )}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {exercise.equipment.map(eq => (
                <span key={eq} className="bg-gray-700 text-gray-100 px-2 py-1 rounded text-xs font-medium">
                  {eq}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 