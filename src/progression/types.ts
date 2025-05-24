import { Exercise, Workout } from '../types';

// Core progression interfaces
export interface ProgressionRule {
  id: string;
  name: string;
  description: string;
  calculate(exercise: Exercise, history: ExerciseHistory): ProgressionRecommendation;
}

export interface ProgressionRecommendation {
  weight: number;
  reps: number;
  sets?: number;
  notes?: string;
  confidence: number; // 0-1, how confident the algorithm is
}

export interface ExerciseHistory {
  exerciseId: string;
  sessions: SessionData[];
  personalRecord: {
    weight: number;
    reps: number;
    date: string;
  };
}

export interface SessionData {
  date: string;
  sets: {
    weight: number;
    reps: number;
    completed: boolean;
    rpe?: number; // Rate of Perceived Exertion (optional)
  }[];
  notes?: string;
}

// Progression plan configuration
export interface ProgressionPlan {
  id: string;
  name: string;
  description: string;
  rules: ProgressionRule[];
  isActive: boolean;
  isPremium: boolean;
}

// Service interface for the progression system
export interface ProgressionService {
  // Core functionality
  calculateProgression(exercise: Exercise, workoutHistory: Record<string, Workout>): ProgressionRecommendation;
  
  // History management
  getExerciseHistory(exerciseId: string, workoutHistory: Record<string, Workout>): ExerciseHistory;
  
  // Plan management
  getAvailablePlans(): ProgressionPlan[];
  setActivePlan(planId: string): void;
  getActivePlan(): ProgressionPlan | null;
  
  // Premium feature checks
  isProgressionEnabled(): boolean;
  isPremiumUser(): boolean;
} 