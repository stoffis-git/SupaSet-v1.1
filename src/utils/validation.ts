import { z } from 'zod';
import { Exercise, Workout, WorkoutState, ExerciseSchema, WorkoutSchema, WorkoutStateSchema } from '../types';

// Error handling utilities
export class ValidationError extends Error {
  constructor(message: string, public errors: z.ZodError) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Schema-based parsers with error logging
export function parseExercise(data: unknown): Exercise {
  const result = ExerciseSchema.safeParse(data);
  if (!result.success) {
    console.error('Exercise validation failed:', result.error);
    throw new ValidationError('Invalid exercise data', result.error);
  }
  return result.data;
}

export function parseWorkout(data: unknown): Workout {
  const result = WorkoutSchema.safeParse(data);
  if (!result.success) {
    console.error('Workout validation failed:', result.error);
    throw new ValidationError('Invalid workout data', result.error);
  }
  return result.data;
}

export function parseWorkoutState(data: unknown): WorkoutState {
  const result = WorkoutStateSchema.safeParse(data);
  if (!result.success) {
    console.error('WorkoutState validation failed:', result.error);
    throw new ValidationError('Invalid workout state data', result.error);
  }
  return result.data;
}

// API response validation
export function validateApiResponse<T>(data: unknown, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('API response validation failed:', result.error);
    throw new ValidationError('Invalid API response', result.error);
  }
  return result.data;
}

// Local storage validation
export function validateLocalStorage<T>(key: string, schema: z.ZodSchema<T>): T | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return validateApiResponse(JSON.parse(data), schema);
  } catch (error) {
    console.error(`Error validating localStorage item '${key}':`, error);
    return null;
  }
}

// User-friendly error messages
export function getUserFriendlyError(error: ValidationError): string {
  return error.errors.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  }).join('\n');
} 