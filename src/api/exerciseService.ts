import { Exercise, MuscleGroup } from '../types';
import { ExerciseRepository } from '../repositories/ExerciseRepository';

export class ExerciseService {
  constructor(private repository: ExerciseRepository) {}

  async getAllExercises(): Promise<Exercise[]> {
    return this.repository.getAll();
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    return this.repository.getById(id);
  }

  async getExercisesByMuscleGroup(groups: MuscleGroup[]): Promise<Exercise[]> {
    return this.repository.getByMuscleGroup(groups);
  }

  async searchExercises(term: string): Promise<Exercise[]> {
    return this.repository.search(term);
  }

  validateExercise(data: unknown): data is Exercise {
    return this.repository.validateExercise(data);
  }
} 