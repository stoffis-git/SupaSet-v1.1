import { Exercise, MuscleGroup } from '../types';
import { GeneratorOptions, WorkoutPlan, WorkoutStrategy } from './types';
import { 
  selectExerciseWithFallback, 
  switchBetweenTwoLeastRecent, 
  getRandomExerciseExcluding,
  getTwoLeastRecentlyUsed 
} from '../utils/generateWorkout';

export abstract class BaseStrategy implements WorkoutStrategy {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;

  protected selectByMuscleGroup(exercises: Exercise[], groups: MuscleGroup[]): Exercise[] {
    return exercises.filter(ex => 
      ex.muscle_groups?.some(g => groups.includes(g))
    );
  }

  protected selectByEquipment(exercises: Exercise[], equipment: string[]): Exercise[] {
    return exercises.filter(ex => 
      ex.equipment?.some(e => equipment.includes(e))
    );
  }

  protected selectByCategory(exercises: Exercise[], categories: string[]): Exercise[] {
    return exercises.filter(ex => 
      ex.categories?.some(c => categories.includes(c))
    );
  }

  protected limitExercises(exercises: Exercise[], count: number): Exercise[] {
    return exercises.slice(0, count);
  }

  // Enhanced exercise selection with smart fallback
  protected selectExerciseWithFallback(
    exercises: Exercise[], 
    workoutHistory: Record<string, any>, 
    fallbackStrategy: 'random' | 'first' = 'random'
  ): Exercise | undefined {
    return selectExerciseWithFallback(exercises, workoutHistory, fallbackStrategy);
  }

  // Switch between two least recently used exercises
  protected switchBetweenTwoLeastRecent(
    currentExercise: Exercise,
    exercises: Exercise[],
    workoutHistory: Record<string, any>
  ): Exercise {
    return switchBetweenTwoLeastRecent(currentExercise, exercises, workoutHistory);
  }

  // Get random exercise excluding specific one
  protected getRandomExerciseExcluding(exercises: Exercise[], excludeId: string): Exercise | undefined {
    return getRandomExerciseExcluding(exercises, excludeId);
  }

  // Get two least recently used exercises
  protected getTwoLeastRecentlyUsed(exercises: Exercise[], workoutHistory: Record<string, any>): Exercise[] {
    return getTwoLeastRecentlyUsed(exercises, workoutHistory);
  }

  abstract generate(exercises: Exercise[], options: GeneratorOptions): WorkoutPlan;
} 