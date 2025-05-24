import { Exercise, WorkoutType, MuscleGroup, WorkoutSubType } from '../types';
import { ProgressionService } from '../progression/types';

export interface GeneratorOptions {
  type: WorkoutType;
  targetMuscleGroups?: MuscleGroup[];
  exerciseCount?: number;
  restDays?: number;
  intensity?: 'low' | 'medium' | 'high';
  
  // Optional progression service (premium feature)
  progressionService?: ProgressionService;
}

export interface WorkoutPlan {
  exercises: Exercise[];
  restDays: number;
  type: WorkoutType;
  intensity: 'low' | 'medium' | 'high';
  targetMuscleGroups?: MuscleGroup[];
  
  // Optional workout sub-type for split routines
  workoutSubType?: WorkoutSubType;
  
  // Optional progression data (only if progression service is enabled)
  progressionData?: {
    exerciseId: string;
    recommendedWeight: number;
    recommendedReps: number;
    recommendedSets?: number;
    notes?: string;
    confidence: number;
  }[];
  
  // Exercise metadata for distinguishing main vs accessory exercises
  exerciseMetadata?: {
    mainExerciseCount: number;
    accessoryExercises: {
      exerciseId: string;
      category: string;
    }[];
  };
}

export interface WorkoutStrategy {
  generate(
    exercises: Exercise[],
    options: GeneratorOptions
  ): WorkoutPlan;
  
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

// Legacy interface for backward compatibility
export interface WorkoutHistory {
  [id: string]: {
    date: string;
    exercises: {
      exercise: Exercise;
      sets: {
        weight: number;
        reps: number;
        completed: boolean;
      }[];
    }[];
  };
} 