import { Exercise, MuscleGroup, WorkoutType } from '../types';
import { BaseStrategy } from './BaseStrategy';
import { GeneratorOptions, WorkoutPlan } from './types';

export class StrengthStrategy extends BaseStrategy {
  readonly id = 'strength';
  readonly name = 'Strength';
  readonly description = 'Compound movements focused on strength building with smart exercise rotation';

  generate(exercises: Exercise[], options: GeneratorOptions & { workoutHistory?: Record<string, any>; activeExercises?: string[] }): WorkoutPlan {
    // Filter exercises by active selection if provided
    const availableExercises = options.activeExercises 
      ? exercises.filter(ex => options.activeExercises!.includes(ex.exercise_id))
      : exercises;
      
    const selectedExercises = this.selectStrengthExercises(availableExercises, options.targetMuscleGroups, options.workoutHistory);
    
    const workoutPlan: WorkoutPlan = {
      exercises: selectedExercises,
      restDays: 2,
      type: WorkoutType.STRENGTH,
      intensity: 'high',
      targetMuscleGroups: options.targetMuscleGroups
    };

    // Add progression data if progression service is available
    if (options.progressionService && options.workoutHistory) {
      workoutPlan.progressionData = selectedExercises.map(exercise => {
        const recommendation = options.progressionService!.calculateProgression(exercise, options.workoutHistory || {});
        return {
          exerciseId: exercise.exercise_id,
          recommendedWeight: recommendation.weight,
          recommendedReps: recommendation.reps,
          recommendedSets: recommendation.sets,
          notes: recommendation.notes,
          confidence: recommendation.confidence
        };
      });
    }

    return workoutPlan;
  }

  private selectStrengthExercises(exercises: Exercise[], targetGroups?: MuscleGroup[], workoutHistory?: Record<string, any>): Exercise[] {
    const compoundExercises = this.selectByCategory(exercises, ['compound']);
    
    if (targetGroups) {
      const filtered = this.selectByMuscleGroup(compoundExercises, targetGroups);
      // Use enhanced selection with random fallback
      const selected = filtered.map(ex => this.selectExerciseWithFallback([ex], workoutHistory || {}, 'random'))
        .filter(Boolean) as Exercise[];
      return this.limitExercises(selected, 6);
    }

    // Default to push/pull split if no target groups specified
    const pushGroups = [MuscleGroup.CHEST, MuscleGroup.SHOULDERS];
    const pullGroups = [MuscleGroup.BACK, MuscleGroup.ARMS];
    
    const pushExercises = this.selectByMuscleGroup(compoundExercises, pushGroups);
    const pullExercises = this.selectByMuscleGroup(compoundExercises, pullGroups);
    
    // Use enhanced selection for better variety
    const selectedPush = pushExercises.slice(0, 3).map(ex => 
      this.selectExerciseWithFallback([ex], workoutHistory || {}, 'random')).filter(Boolean) as Exercise[];
    const selectedPull = pullExercises.slice(0, 3).map(ex => 
      this.selectExerciseWithFallback([ex], workoutHistory || {}, 'random')).filter(Boolean) as Exercise[];
    
    return this.limitExercises([...selectedPush, ...selectedPull], 6);
  }
} 