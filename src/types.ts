import { z } from 'zod';

// Enums
export enum MuscleGroup {
  CHEST = "chest",
  BACK = "back",
  LEGS = "legs",
  SHOULDERS = "shoulders",
  ARMS = "arms",
  CORE = "core",
  FULL_BODY = "full_body"
}

export enum EquipmentType {
  BARBELL = "barbell",
  DUMBBELL = "dumbbell",
  BODYWEIGHT = "bodyweight",
  MACHINE = "machine",
  CABLE = "cable",
  KETTLEBELL = "kettlebell",
  RESISTANCE_BAND = "resistance_band"
}

export enum WorkoutType {
  STRENGTH = "strength",
  HYPERTROPHY = "hypertrophy",
  ENDURANCE = "endurance",
  POWER = "power",
  RECOVERY = "recovery"
}

// Zod Schemas
export const ExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  equipment: z.array(z.nativeEnum(EquipmentType)).optional(),
  muscle_groups: z.array(z.nativeEnum(MuscleGroup)).optional(),
  movement_type: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  workout_id: z.string().uuid(),
  date: z.string().datetime(),
  exercises: z.array(z.object({
    exercise: ExerciseSchema,
    sets: z.array(z.object({
      weight: z.number(),
      reps: z.number(),
      completed: z.boolean()
    })),
    progressionNotes: z.string().optional()
  })),
  completed: z.boolean(),
  type: z.nativeEnum(WorkoutType),
  // Exercise metadata for distinguishing main vs accessory exercises
  exerciseMetadata: z.object({
    mainExerciseCount: z.number(),
    accessoryExercises: z.array(z.object({
      exerciseId: z.string(),
      category: z.string()
    }))
  }).optional(),
  // Add workoutSubType to track full_body, upper_body, lower_body splits
  workoutSubType: z.enum(['full_body', 'upper_body', 'lower_body']).optional()
});

export const WorkoutStateSchema = z.object({
  selectedExercises: z.array(ExerciseSchema),
  workouts: z.record(z.string(), WorkoutSchema),
  activeExercises: z.array(z.string()),
  // Track recent workout sub-types for consecutive limit enforcement
  recentWorkoutTypes: z.array(z.enum(['full_body', 'upper_body', 'lower_body'])).optional()
});

// Type Definitions
export type Exercise = {
  exercise_id: string;
  name: string;
  description?: string;
  category?: string;
  equipment?: EquipmentType[];
  muscle_groups?: MuscleGroup[];
  movement_type?: string;
  categories?: string[];
  tags?: string[];
};

export type Workout = z.infer<typeof WorkoutSchema>;
export type WorkoutState = z.infer<typeof WorkoutStateSchema>;

// Add new workout sub-type enum
export type WorkoutSubType = 'full_body' | 'upper_body' | 'lower_body';

// Type Guards
export function isExercise(data: unknown): data is Exercise {
  return ExerciseSchema.safeParse(data).success;
}

export function isWorkout(data: unknown): data is Workout {
  return WorkoutSchema.safeParse(data).success;
}

export function isWorkoutState(data: unknown): data is WorkoutState {
  return WorkoutStateSchema.safeParse(data).success;
}

// Additional Types
export interface AppState {
  workouts: Record<string, Workout>;
  activeExercises: string[];
  exerciseLibrary: Exercise[];
  recentWorkoutTypes?: WorkoutSubType[];
}

export interface Set {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseWithSets {
  exercise: Exercise;
  sets: Set[];
  progressionNotes?: string;
  exerciseType?: 'main' | 'accessory';
  accessoryCategory?: string; // e.g., 'Core', 'Upper (Biceps)', 'Lower (Hamstring)'
}

// Type for the exercise library data
export interface ExerciseLibraryItem {
  exercise_id: string;
  name: string;
  description?: string;
  category?: string;
  equipment?: string[];
  muscle_groups?: MuscleGroup[];
  movement_type?: string;
  categories?: string[];
  tags?: string[];
} 