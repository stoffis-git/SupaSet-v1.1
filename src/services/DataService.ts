import { Workout, AppState, WorkoutSubType } from '../types'

// Abstract interface for data operations
export interface DataService {
  // User settings and exercises
  getActiveExercises(): Promise<string[]>
  setActiveExercises(exercises: string[]): Promise<void>
  
  // Workout operations
  saveWorkout(workout: Workout): Promise<void>
  getWorkoutHistory(): Promise<Workout[]>
  deleteWorkout(id: string): Promise<void>
  
  // Recent workout types for consecutive limit tracking
  getRecentWorkoutTypes(): Promise<WorkoutSubType[]>
  updateRecentWorkoutTypes(workoutType: WorkoutSubType): Promise<void>
  
  // Data migration and sync
  exportData(): Promise<AppState>
  importData(data: AppState): Promise<void>
}

// Implementation for localStorage (anonymous users)
export class LocalStorageDataService implements DataService {
  private readonly STORAGE_KEY = 'supaset-data'

  private loadState(): AppState {
    try {
      const serializedState = localStorage.getItem(this.STORAGE_KEY)
      if (serializedState === null) {
        return {
          workouts: {},
          activeExercises: [
            'backsquat', 'frontsquat',
            'conventionaldeadlift', 'rumaniandead', 
            'benchpress', 'overheadpress',
            'pullup', 'barbellbentoverrow',
            'plank', 'barbellcurl', 'lyinglegcurl'
          ],
          exerciseLibrary: [],
        }
      }
      return JSON.parse(serializedState)
    } catch (err) {
      return {
        workouts: {},
        activeExercises: [
          'backsquat', 'frontsquat',
          'conventionaldeadlift', 'rumaniandead', 
          'benchpress', 'overheadpress',
          'pullup', 'barbellbentoverrow',
          'plank', 'barbellcurl', 'lyinglegcurl'
        ],
        exerciseLibrary: [],
      }
    }
  }

  private saveState(state: AppState): void {
    try {
      const serializedState = JSON.stringify(state)
      localStorage.setItem(this.STORAGE_KEY, serializedState)
    } catch {
      // ignore write errors
    }
  }

  async getActiveExercises(): Promise<string[]> {
    const state = this.loadState()
    return state.activeExercises
  }

  async setActiveExercises(exercises: string[]): Promise<void> {
    const state = this.loadState()
    this.saveState({ ...state, activeExercises: exercises })
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const state = this.loadState()
    const updatedWorkouts = {
      ...state.workouts,
      [workout.id]: workout,
    }
    this.saveState({ ...state, workouts: updatedWorkouts })
  }

  async getWorkoutHistory(): Promise<Workout[]> {
    const state = this.loadState()
    return Object.values(state.workouts).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  async deleteWorkout(id: string): Promise<void> {
    const state = this.loadState()
    const { [id]: removed, ...remainingWorkouts } = state.workouts
    this.saveState({ ...state, workouts: remainingWorkouts })
  }

  async getRecentWorkoutTypes(): Promise<WorkoutSubType[]> {
    const state = this.loadState()
    return state.recentWorkoutTypes || []
  }

  async updateRecentWorkoutTypes(workoutType: WorkoutSubType): Promise<void> {
    const state = this.loadState()
    const currentTypes = state.recentWorkoutTypes || []
    const newTypes = [workoutType, ...currentTypes].slice(0, 3)
    this.saveState({ ...state, recentWorkoutTypes: newTypes })
  }

  async exportData(): Promise<AppState> {
    return this.loadState()
  }

  async importData(data: AppState): Promise<void> {
    this.saveState(data)
  }
} 