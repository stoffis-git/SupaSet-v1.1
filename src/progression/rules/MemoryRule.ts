import { Exercise } from '../../types';
import { ProgressionRule, ExerciseHistory, ProgressionRecommendation } from '../types';

export class MemoryRule implements ProgressionRule {
  readonly id = 'memory';
  readonly name = 'Last Performance Memory';
  readonly description = 'Recalls your last weights, reps, and sets without suggesting progression';

  calculate(exercise: Exercise, history: ExerciseHistory): ProgressionRecommendation {
    if (history.sessions.length === 0) {
      return this.getEmptyRecommendation();
    }

    const lastSession = history.sessions[history.sessions.length - 1];
    
    // Get the most common weight and reps from the last session
    const lastSets = lastSession.sets;
    const weights = lastSets.map(set => set.weight).filter(w => w > 0);
    const reps = lastSets.map(set => set.reps).filter(r => r > 0);
    
    // Use the most frequently used weight, or the highest if all different
    const lastWeight = weights.length > 0 ? Math.max(...weights) : 0;
    const lastReps = reps.length > 0 ? Math.round(reps.reduce((a, b) => a + b, 0) / reps.length) : 0;
    
    if (lastWeight === 0 && lastReps === 0) {
      return this.getEmptyRecommendation();
    }

    return {
      weight: lastWeight,
      reps: lastReps,
      sets: lastSets.length, // Use the same number of sets as last time
      notes: `Last time: ${lastWeight}kg × ${lastReps} reps × ${lastSets.length} sets`,
      confidence: 1.0 // High confidence since this is just memory
    };
  }

  private getEmptyRecommendation(): ProgressionRecommendation {
    return {
      weight: 0,
      reps: 0,
      sets: 3, // Default to 3 sets for new exercises
      notes: 'No previous data - enter your preferred weight and reps',
      confidence: 0.0
    };
  }
} 