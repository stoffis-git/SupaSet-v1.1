import React from 'react';
import { MuscleGroup, EquipmentType } from '../../types';

export interface ExerciseFiltersProps {
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
  onChange: (filters: {
    muscleGroups: MuscleGroup[];
    equipment: EquipmentType[];
  }) => void;
  className?: string;
}

export function ExerciseFilters({
  muscleGroups,
  equipment,
  onChange,
  className = ''
}: ExerciseFiltersProps) {
  const handleMuscleGroupChange = (group: MuscleGroup) => {
    const newGroups = muscleGroups.includes(group)
      ? muscleGroups.filter(g => g !== group)
      : [...muscleGroups, group];
    
    onChange({ muscleGroups: newGroups, equipment });
  };

  const handleEquipmentChange = (type: EquipmentType) => {
    const newEquipment = equipment.includes(type)
      ? equipment.filter(e => e !== type)
      : [...equipment, type];
    
    onChange({ muscleGroups, equipment: newEquipment });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Muscle Groups</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(MuscleGroup).map(group => (
            <button
              key={group}
              onClick={() => handleMuscleGroupChange(group)}
              className={`px-3 py-1 rounded-full text-sm ${
                muscleGroups.includes(group)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Equipment</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(EquipmentType).map(type => (
            <button
              key={type}
              onClick={() => handleEquipmentChange(type)}
              className={`px-3 py-1 rounded-full text-sm ${
                equipment.includes(type)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 