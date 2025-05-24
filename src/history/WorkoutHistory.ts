import { Workout, Exercise } from '../types';
import { WorkoutType } from '../types';
import { WorkoutStrategy } from '../strategies/types';

interface StrategyStats {
  totalWorkouts: number;
  completedWorkouts: number;
  averageCompletionRate: number;
  lastUsed: Date;
}

export class WorkoutHistory {
  private timeline: Map<string, Workout>;
  private strategyStats: Map<string, StrategyStats>;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'workoutHistory';
  private readonly STORE_NAME = 'workouts';

  constructor() {
    this.timeline = new Map();
    this.strategyStats = new Map();
    this.initDB();
  }

  private async initDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadPersistedData().then(resolve).catch(reject);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'date' });
        }
      };
    });
  }

  private async loadPersistedData() {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const workouts = request.result as Workout[];
        workouts.forEach(workout => {
          const dateStr = new Date(workout.date).toISOString();
          this.timeline.set(dateStr, workout);
          this.updateStrategyStats(workout);
        });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async persistWorkout(workout: Workout) {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(workout);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private updateStrategyStats(workout: Workout) {
    const stats = this.strategyStats.get(workout.type) || {
      totalWorkouts: 0,
      completedWorkouts: 0,
      averageCompletionRate: 0,
      lastUsed: new Date()
    };

    stats.totalWorkouts++;
    if (workout.completed) {
      stats.completedWorkouts++;
    }
    stats.averageCompletionRate = stats.completedWorkouts / stats.totalWorkouts;
    stats.lastUsed = new Date(workout.date);

    this.strategyStats.set(workout.type, stats);
  }

  async add(workout: Workout): Promise<void> {
    const dateStr = new Date(workout.date).toISOString();
    this.timeline.set(dateStr, workout);
    this.updateStrategyStats(workout);
    await this.persistWorkout(workout);
  }

  getWeek(date: Date): Workout[] {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return Array.from(this.timeline.values())
      .filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getExercisePR(exerciseId: string): number {
    return Math.max(
      ...[...this.timeline.values()]
        .flatMap(workout => workout.exercises)
        .filter(exercise => exercise.exercise.exercise_id === exerciseId)
        .map(exercise => 
          Math.max(...exercise.sets.map(set => set.weight || 0))
        )
    );
  }

  getStrategyEffectiveness(strategyId: string): number {
    const stats = this.strategyStats.get(strategyId);
    return stats ? stats.averageCompletionRate : 0;
  }

  getRecentWorkouts(limit: number = 10): Workout[] {
    return Array.from(this.timeline.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  getWorkoutCount(): number {
    return this.timeline.size;
  }

  getStrategyStats(): Map<string, StrategyStats> {
    return new Map(this.strategyStats);
  }
} 