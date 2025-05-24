import { Exercise, MuscleGroup, WorkoutType } from '../types';
import { BaseStrategy } from './BaseStrategy';
import { GeneratorOptions, WorkoutPlan } from './types';

export class EnduranceStrategy extends BaseStrategy {
  readonly id = 'endurance';
  readonly name = 'Endurance';
  readonly description = 'High-rep circuits focusing on muscular endurance with smart exercise rotation';

  generate(exercises: Exercise[], options: GeneratorOptions & { workoutHistory?: Record<string, any>; activeExercises?: string[] }): WorkoutPlan {
    // Filter exercises by active selection if provided
    const availableExercises = options.activeExercises 
      ? exercises.filter(ex => options.activeExercises!.includes(ex.exercise_id))
      : exercises;
      
    const selectedExercises = this.selectEnduranceExercises(availableExercises, options.targetMuscleGroups, options.workoutHistory);
    
    return {
      exercises: selectedExercises,
      restDays: 1,
      type: WorkoutType.ENDURANCE,
      intensity: 'medium',
      targetMuscleGroups: options.targetMuscleGroups
    };
  }

  private selectEnduranceExercises(exercises: Exercise[], targetGroups?: MuscleGroup[], workoutHistory?: Record<string, any>): Exercise[] {
    // Prefer bodyweight and machine exercises for endurance
    const enduranceExercises = this.selectByEquipment(exercises, ['bodyweight', 'machine']);
    
    if (targetGroups) {
      const filtered = this.selectByMuscleGroup(enduranceExercises, targetGroups);
      // Use enhanced selection with random fallback for variety
      const selected = filtered.map(ex => this.selectExerciseWithFallback([ex], workoutHistory || {}, 'random'))
        .filter(Boolean) as Exercise[];
      return this.limitExercises(selected, 8);
    }

    // Default to full body circuit if no target groups specified
    const allGroups = Object.values(MuscleGroup);
    const selected = this.selectByMuscleGroup(enduranceExercises, allGroups);
    
    // Use enhanced selection for better exercise variety in circuits
    const enhancedSelection = selected.map(ex => 
      this.selectExerciseWithFallback([ex], workoutHistory || {}, 'random')).filter(Boolean) as Exercise[];
    
    return this.limitExercises(enhancedSelection, 8);
  }
} 