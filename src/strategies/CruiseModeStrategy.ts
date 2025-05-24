import { Exercise, MuscleGroup, WorkoutType, Workout, WorkoutSubType } from '../types';
import { BaseStrategy } from './BaseStrategy';
import { GeneratorOptions, WorkoutPlan } from './types';
import { 
  selectExerciseWithFallback, 
  switchBetweenTwoLeastRecent, 
  getRandomExerciseExcluding,
  getTwoLeastRecentlyUsed
} from '../utils/generateWorkout';
import { AccessoryRotationService } from '../services/AccessoryRotationService';

export class CruiseModeStrategy extends BaseStrategy {
  readonly id = 'cruiseMode';
  readonly name = 'Cruise Mode';
  readonly description = 'Smart Exercise Rotation, allowing you to self regulate progress or just cruise along. Ideal if you dont want to worry about (or dont know about) workout planning.';
  
  private accessoryRotationService = new AccessoryRotationService();

  generate(exercises: Exercise[], options: GeneratorOptions & { 
    workoutHistory?: Record<string, Workout>; 
    activeExercises?: string[]; 
    accessoryRotationService?: AccessoryRotationService;
    workoutSubType?: WorkoutSubType;
  }): WorkoutPlan {
    // Filter exercises by active selection if provided
    const availableExercises = options.activeExercises 
      ? exercises.filter(ex => options.activeExercises!.includes(ex.exercise_id))
      : exercises;
      
    // Get workout sub-type (default to full_body for backward compatibility)
    const workoutSubType = options.workoutSubType || 'full_body';
    
    // Select main movements based on workout type
    let mainExercises: Exercise[];
    let targetMuscleGroups: MuscleGroup[];
    
    switch (workoutSubType) {
      case 'upper_body':
        mainExercises = this.selectUpperBody(availableExercises, options.workoutHistory || {});
        targetMuscleGroups = [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.ARMS];
        break;
      case 'lower_body':
        mainExercises = this.selectLowerBody(availableExercises, options.workoutHistory || {});
        targetMuscleGroups = [MuscleGroup.LEGS, MuscleGroup.CORE];
        break;
      default:
        mainExercises = this.selectFullBody(availableExercises, options.workoutHistory || {});
        targetMuscleGroups = [MuscleGroup.LEGS, MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS];
    }
    
    // Select accessory exercises (only for full body workouts to maintain current behavior)
    const accessoryService = options.accessoryRotationService || this.accessoryRotationService;
    let accessoryExercises: Exercise[] = [];
    let accessoryTypes: any = {};
    
    if (workoutSubType === 'full_body') {
      accessoryExercises = accessoryService.selectAccessoryExercises(availableExercises);
      accessoryTypes = accessoryService.getCurrentAccessoryTypes();
    }
    
    // Combine main and accessory exercises
    const allExercises = [...mainExercises, ...accessoryExercises];
    
    const workoutPlan: WorkoutPlan = {
      exercises: allExercises,
      restDays: 1,
      type: WorkoutType.STRENGTH,
      intensity: 'low',
      targetMuscleGroups: targetMuscleGroups,
      // Add workout sub-type to metadata
      workoutSubType: workoutSubType
    };

    // Add exercise metadata if accessories are included
    if (accessoryExercises.length > 0) {
      workoutPlan.exerciseMetadata = {
        mainExerciseCount: mainExercises.length,
        accessoryExercises: accessoryExercises.map((exercise, index) => ({
          exerciseId: exercise.exercise_id,
          category: index === 0 ? 'Core' : 
                   index === 1 ? `Upper (${accessoryTypes.upper})` : 
                   `Lower (${accessoryTypes.lower})`
        }))
      };
    }

    // Add progression data if progression service is available (for prefills and memory)
    if (options.progressionService && options.workoutHistory) {
      workoutPlan.progressionData = allExercises.map(exercise => {
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

  private selectUpperBody(exercises: Exercise[], workoutHistory: Record<string, Workout>): Exercise[] {
    // 2 upper body push exercises (horizontal and/or vertical)
    const push1 = this.selectByCategory(exercises, ['upper_body_push']);
    const push2 = this.selectByCategory(exercises, ['upper_body_push']);
    
    // 2 upper body pull exercises 
    const pull1 = this.selectByCategory(exercises, ['upper_body_pull']);
    const pull2 = this.selectByCategory(exercises, ['upper_body_pull']);

    // Use enhanced selection with least recently used logic
    const selected: Exercise[] = [];
    
    // Select first push exercise
    const firstPush = selectExerciseWithFallback(push1, workoutHistory, 'random');
    if (firstPush) selected.push(firstPush);
    
    // Select second push exercise, excluding the first one
    const secondPush = selectExerciseWithFallback(
      push2.filter(ex => ex.exercise_id !== firstPush?.exercise_id), 
      workoutHistory, 
      'random'
    );
    if (secondPush) selected.push(secondPush);
    
    // Select first pull exercise
    const firstPull = selectExerciseWithFallback(pull1, workoutHistory, 'random');
    if (firstPull) selected.push(firstPull);
    
    // Select second pull exercise, excluding the first one
    const secondPull = selectExerciseWithFallback(
      pull2.filter(ex => ex.exercise_id !== firstPull?.exercise_id), 
      workoutHistory, 
      'random'
    );
    if (secondPull) selected.push(secondPull);

    return this.limitExercises(selected, 4);
  }

  private selectLowerBody(exercises: Exercise[], workoutHistory: Record<string, Workout>): Exercise[] {
    // 2 knee dominant exercises 
    const kneeDominant1 = this.selectByCategory(exercises, ['knee_dominant']);
    const kneeDominant2 = this.selectByCategory(exercises, ['knee_dominant']);
    
    // 2 hip dominant exercises
    const hipDominant1 = this.selectByCategory(exercises, ['hip_dominant']);
    const hipDominant2 = this.selectByCategory(exercises, ['hip_dominant']);

    // Use enhanced selection with least recently used logic
    const selected: Exercise[] = [];
    
    // Select first knee dominant exercise
    const firstKnee = selectExerciseWithFallback(kneeDominant1, workoutHistory, 'random');
    if (firstKnee) selected.push(firstKnee);
    
    // Select second knee dominant exercise, excluding the first one
    const secondKnee = selectExerciseWithFallback(
      kneeDominant2.filter(ex => ex.exercise_id !== firstKnee?.exercise_id), 
      workoutHistory, 
      'random'
    );
    if (secondKnee) selected.push(secondKnee);
    
    // Select first hip dominant exercise
    const firstHip = selectExerciseWithFallback(hipDominant1, workoutHistory, 'random');
    if (firstHip) selected.push(firstHip);
    
    // Select second hip dominant exercise, excluding the first one
    const secondHip = selectExerciseWithFallback(
      hipDominant2.filter(ex => ex.exercise_id !== firstHip?.exercise_id), 
      workoutHistory, 
      'random'
    );
    if (secondHip) selected.push(secondHip);

    return this.limitExercises(selected, 4);
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