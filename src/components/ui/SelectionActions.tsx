import React from 'react';

export interface SelectionActionsProps {
  selectedCount: number;
  onClear: () => void;
  onAddToWorkout: () => void;
  className?: string;
}

export function SelectionActions({
  selectedCount,
  onClear,
  onAddToWorkout,
  className = ''
}: SelectionActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            {selectedCount} {selectedCount === 1 ? 'exercise' : 'exercises'} selected
          </span>
          <button
            onClick={onClear}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        </div>

        <button
          onClick={onAddToWorkout}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add to Workout
        </button>
      </div>
    </div>
  );
} 