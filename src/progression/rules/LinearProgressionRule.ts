import { Exercise } from '../../types';
import { ProgressionRule, ExerciseHistory, ProgressionRecommendation } from '../types';

export class LinearProgressionRule implements ProgressionRule {
  readonly id = 'linear';
  readonly name = 'Linear Progression';
  readonly description = 'Increase weight by fixed amount when all sets completed successfully';

  private readonly weightIncrement: number;
  private readonly minSuccessfulSessions: number;

  constructor(options: { weightIncrement?: number; minSuccessfulSessions?: number } = {}) {
    this.weightIncrement = options.weightIncrement || 2.5;
    this.minSuccessfulSessions = options.minSuccessfulSessions || 1;
  }

  calculate(exercise: Exercise, history: ExerciseHistory): ProgressionRecommendation {
    if (history.sessions.length === 0) {
      return this.getStartingRecommendation(exercise);
    }

    const lastSession = history.sessions[history.sessions.length - 1];
    const lastSuccessfulSessions = this.getRecentSuccessfulSessions(history, this.minSuccessfulSessions);

    // Check if user completed all sets in required number of recent sessions
    const shouldProgress = lastSuccessfulSessions.length >= this.minSuccessfulSessions;

    if (shouldProgress) {
      const currentWeight = this.getCurrentWeight(lastSession);
      const newWeight = currentWeight + this.weightIncrement;
      
      return {
        weight: newWeight,
        reps: this.getTargetReps(exercise),
        notes: `Previous weight completed successfully. Increase by ${this.weightIncrement}kg.`,
        confidence: 0.8
      };
    } else {
      // Maintain current weight
      const currentWeight = this.getCurrentWeight(lastSession);
      return {
        weight: currentWeight,
        reps: this.getTargetReps(exercise),
        notes: 'Focus on completing all sets before increasing weight.',
        confidence: 0.9
      };
    }
  }

  private getStartingRecommendation(exercise: Exercise): ProgressionRecommendation {
    // Simple starting weights based on exercise type
    const startingWeights: Record<string, number> = {
      'squat': 40,
      'deadlift': 50,
      'bench_press': 30,
      'overhead_press': 20
    };

    const exerciseName = exercise.name.toLowerCase().replace(' ', '_');
    const startingWeight = startingWeights[exerciseName] || 20;

    return {
      weight: startingWeight,
      reps: this.getTargetReps(exercise),
      notes: 'Starting weight for new exercise.',
      confidence: 0.7
    };
  }

  private getRecentSuccessfulSessions(history: ExerciseHistory, count: number): any[] {
    return history.sessions
      .slice(-count * 2) // Look at more sessions to find successful ones
      .filter(session => 
        session.sets.every(set => set.completed)
      )
      .slice(-count); // Take the most recent successful ones
  }

  private getCurrentWeight(session: any): number {
    return Math.max(...session.sets.map((set: any) => set.weight));
  }

  private getTargetReps(exercise: Exercise): number {
    // Default rep ranges based on exercise categories
    const categories = exercise.categories || [];
    
    if (categories.includes('compound')) {
      return 5; // Lower reps for compound movements
    }
    
    return 8; // Higher reps for isolation exercises
  }
} 