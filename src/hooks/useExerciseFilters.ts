import { useState, useMemo } from 'react';
import { Exercise, MuscleGroup, EquipmentType } from '../types';
import { ExerciseRepository } from '../repositories/ExerciseRepository';

interface FilterState {
  searchTerm: string;
  muscleGroups: MuscleGroup[];
  equipment: EquipmentType[];
}

export function useExerciseFilters(repository: ExerciseRepository) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    muscleGroups: [],
    equipment: []
  });

  const [exercises, setExercises] = useState<Exercise[]>([]);

  useMemo(async () => {
    const allExercises = await repository.getAll();
    let filtered = allExercises;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(term) ||
        ex.description?.toLowerCase().includes(term)
      );
    }

    if (filters.muscleGroups.length > 0) {
      filtered = filtered.filter(ex =>
        ex.muscle_groups?.some(group =>
          filters.muscleGroups.includes(group)
        )
      );
    }

    if (filters.equipment.length > 0) {
      filtered = filtered.filter(ex =>
        ex.equipment?.some(type =>
          filters.equipment.includes(type)
        )
      );
    }

    setExercises(filtered);
  }, [repository, filters]);

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  return {
    exercises,
    filters,
    updateFilters
  };
} 