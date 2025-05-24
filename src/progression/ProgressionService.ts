import { Exercise, Workout } from '../types';
import { 
  ProgressionService as IProgressionService, 
  ProgressionPlan, 
  ProgressionRecommendation, 
  ExerciseHistory,
  SessionData 
} from './types';
import { LinearProgressionRule } from './rules/LinearProgressionRule';
import { MemoryRule } from './rules/MemoryRule';

export class ProgressionService implements IProgressionService {
  private activePlanId: string | null = null;
  private isPremium: boolean = false;
  
  // Available progression plans
  private readonly plans: ProgressionPlan[] = [
    {
      id: 'memory',
      name: 'Last Performance Memory',
      description: 'Recalls your last weights and reps without suggesting progression - perfect for Cruise Mode',
      rules: [new MemoryRule()],
      isActive: false,
      isPremium: false
    },
    {
      id: 'basic_progression',
      name: 'Basic Progression',
      description: 'Simple linear progression - add weight when all sets are completed',
      rules: [new LinearProgressionRule()],
      isActive: false,
      isPremium: false
    },
    {
      id: 'advanced_linear',
      name: 'Advanced Linear Progression',
      description: 'Refined linear progression with smaller increments and stricter success criteria',
      rules: [new LinearProgressionRule({ weightIncrement: 1.25, minSuccessfulSessions: 2 })],
      isActive: false,
      isPremium: true
    }
    // Future: Add more sophisticated progression rules like DUP, Block Periodization, etc.
  ];

  constructor(isPremium: boolean = false) {
    this.isPremium = isPremium;
    // Default to memory for free users (perfect for cruise mode), premium can choose
    this.activePlanId = 'memory';
  }

  // Core progression calculation
  calculateProgression(exercise: Exercise, workoutHistory: Record<string, Workout>): ProgressionRecommendation {
    if (!this.isProgressionEnabled()) {
      return this.getDefaultRecommendation(exercise);
    }

    const activePlan = this.getActivePlan();
    if (!activePlan || activePlan.rules.length === 0) {
      return this.getDefaultRecommendation(exercise);
    }

    const exerciseHistory = this.getExerciseHistory(exercise.exercise_id, workoutHistory);
    
    // Use the first rule for now (future: support multiple rules and choose best)
    const rule = activePlan.rules[0];
    return rule.calculate(exercise, exerciseHistory);
  }

  // Convert workout history to exercise-specific history
  getExerciseHistory(exerciseId: string, workoutHistory: Record<string, Workout>): ExerciseHistory {
    const sessions: SessionData[] = [];
    let personalRecord = { weight: 0, reps: 0, date: '' };

    Object.values(workoutHistory)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(workout => {
        const exerciseSession = workout.exercises.find(ex => ex.exercise.exercise_id === exerciseId);
        if (exerciseSession) {
          const sessionData: SessionData = {
            date: workout.date,
            sets: exerciseSession.sets.map(set => ({
              weight: set.weight,
              reps: set.reps,
              completed: set.completed
            }))
          };
          sessions.push(sessionData);

          // Track personal record
          const maxWeight = Math.max(...exerciseSession.sets.map(s => s.weight));
          if (maxWeight > personalRecord.weight) {
            personalRecord = {
              weight: maxWeight,
              reps: exerciseSession.sets.find(s => s.weight === maxWeight)?.reps || 0,
              date: workout.date
            };
          }
        }
      });

    return {
      exerciseId,
      sessions,
      personalRecord
    };
  }

  // Plan management
  getAvailablePlans(): ProgressionPlan[] {
    if (!this.isPremium) {
      return this.plans.filter(plan => !plan.isPremium);
    }
    return this.plans;
  }

  setActivePlan(planId: string): void {
    const plan = this.plans.find(p => p.id === planId);
    if (plan && (this.isPremium || !plan.isPremium)) {
      this.activePlanId = planId;
    }
  }

  getActivePlan(): ProgressionPlan | null {
    return this.plans.find(p => p.id === this.activePlanId) || null;
  }

  // Premium feature checks
  isProgressionEnabled(): boolean {
    return true; // Always enabled now, but free users get "memory" only
  }

  isPremiumUser(): boolean {
    return this.isPremium;
  }

  // Default recommendation when progression is disabled
  private getDefaultRecommendation(exercise: Exercise): ProgressionRecommendation {
    return {
      weight: 0,
      reps: 0,
      sets: 3,
      notes: 'Enter your preferred weight and reps',
      confidence: 0.0
    };
  }

  // Enable/disable progression (for settings)
  setProgressionEnabled(enabled: boolean): void {
    // This could be stored in user preferences
  }

  // Upgrade to premium
  upgradeToPremium(): void {
    this.isPremium = true;
    // Could trigger re-calculation of current workout
  }
} 