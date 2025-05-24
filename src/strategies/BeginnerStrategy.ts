import { Exercise, MuscleGroup, WorkoutType, Workout } from '../types';
import { BaseStrategy } from './BaseStrategy';
import { GeneratorOptions, WorkoutPlan } from './types';
import { 
  selectExerciseWithFallback, 
  switchBetweenTwoLeastRecent, 
  getRandomExerciseExcluding,
  getTwoLeastRecentlyUsed
} from '../utils/generateWorkout';

export class CruiseModeStrategy extends BaseStrategy {
  readonly id = 'cruiseMode';
  readonly name = 'Cruise Mode';
  readonly description = 'Smart Exercise Rotation, allowing you to self regulate progress or just cruise along. Ideal if you dont want to worry about (or dont know about) workout planning.';

  generate(exercises: Exercise[], options: GeneratorOptions & { workoutHistory?: Record<string, Workout>; activeExercises?: string[] }): WorkoutPlan {
    // Filter exercises by active selection if provided
    const availableExercises = options.activeExercises 
      ? exercises.filter(ex => options.activeExercises!.includes(ex.exercise_id))
      : exercises;
      
    const selectedExercises = this.selectFullBody(availableExercises, options.workoutHistory || {});
    return {
      exercises: selectedExercises,
      restDays: 1,
      type: WorkoutType.STRENGTH,
      intensity: 'low',
      targetMuscleGroups: [
        MuscleGroup.LEGS,
        MuscleGroup.CHEST,
        MuscleGroup.BACK,
        MuscleGroup.SHOULDERS
      ]
    };
  }

  private selectFullBody(exercises: Exercise[], workoutHistory: Record<string, Workout>): Exercise[] {
    // 2 lower body compound: knee dominant and hip dominant
    const kneeDominant = this.selectByCategory(exercises, ['knee_dominant']);
    const hipDominant = this.selectByCategory(exercises, ['hip_dominant']);
    // 1 upper body push (horizontal or vertical)
    const push = this.selectByCategory(exercises, ['upper_body_push']);
    // 1 upper body pull
    const pull = this.selectByCategory(exercises, ['upper_body_pull']);

    // Use enhanced selection with random fallback (matching legacy behavior)
    const selected = [
      selectExerciseWithFallback(kneeDominant, workoutHistory, 'random'),
      selectExerciseWithFallback(hipDominant, workoutHistory, 'random'),
      selectExerciseWithFallback(push, workoutHistory, 'random'),
      selectExerciseWithFallback(pull, workoutHistory, 'random')
    ].filter(Boolean) as Exercise[];

    return this.limitExercises(selected, 4);
  }

  // Method to switch exercise (used by UI components)
  switchExercise(
    currentExercise: Exercise,
    category: string,
    availableExercises: Exercise[],
    workoutHistory: Record<string, Workout>
  ): Exercise {
    const eligibleExercises = this.selectByCategory(availableExercises, [category]);
    return switchBetweenTwoLeastRecent(currentExercise, eligibleExercises, workoutHistory);
  }

  // Method to repropose exercise with exclusion (used by UI components)
  reproposeExercise(
    currentExercise: Exercise,
    category: string,
    availableExercises: Exercise[]
  ): Exercise | undefined {
    const eligibleExercises = this.selectByCategory(availableExercises, [category]);
    return getRandomExerciseExcluding(eligibleExercises, currentExercise.exercise_id);
  }

  // Method to get alternative exercises for a category
  getAlternativeExercises(
    category: string,
    availableExercises: Exercise[],
    workoutHistory: Record<string, Workout>,
    limit: number = 2
  ): Exercise[] {
    const eligibleExercises = this.selectByCategory(availableExercises, [category]);
    return getTwoLeastRecentlyUsed(eligibleExercises, workoutHistory);
  }
} 