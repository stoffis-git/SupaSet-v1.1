import { Workout, AppState, WorkoutSubType } from '../types'
import { supabase } from '../lib/supabase'
import { DataService } from './DataService'

export class SupabaseDataService implements DataService {
  constructor(private userId: string) {}

  async getActiveExercises(): Promise<string[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('active_exercises')
      .eq('id', this.userId)
      .single()

    if (error) {
      console.error('Error fetching active exercises:', error)
      return []
    }

    return data?.active_exercises || []
  }

  async setActiveExercises(exercises: string[]): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        active_exercises: exercises,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.userId)

    if (error) {
      console.error('Error updating active exercises:', error)
      throw error
    }
  }

  async saveWorkout(workout: Workout): Promise<void> {
    try {
      // First, save the workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .upsert({
          id: workout.id,
          user_id: this.userId,
          workout_type: workout.type,
          workout_subtype: workout.workoutSubType || null,
          completed: workout.completed,
          date: workout.date,
        })
        .select()

      if (workoutError) throw workoutError

      // Then save the exercises
      const exerciseInserts = workout.exercises.map((exercise, index) => ({
        workout_id: workout.id,
        exercise_id: exercise.exercise.exercise_id,
        exercise_data: exercise.exercise,
        sets: exercise.sets,
        order_index: index,
      }))

      // Delete existing exercises for this workout first (in case of update)
      await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', workout.id)

      // Insert new exercises
      const { error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert(exerciseInserts)

      if (exerciseError) throw exerciseError

      // Update recent workout types if completed
      if (workout.completed && workout.workoutSubType) {
        await this.updateRecentWorkoutTypes(workout.workoutSubType)
      }
    } catch (error) {
      console.error('Error saving workout:', error)
      throw error
    }
  }

  async getWorkoutHistory(): Promise<Workout[]> {
    try {
      // Get workouts with their exercises
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            exercise_id,
            exercise_data,
            sets,
            order_index
          )
        `)
        .eq('user_id', this.userId)
        .order('date', { ascending: false })

      if (workoutsError) throw workoutsError

      // Transform the data back to your Workout format
      return workouts.map(workout => ({
        id: workout.id,
        workout_id: workout.id,
        date: workout.date,
        type: workout.workout_type,
        workoutSubType: workout.workout_subtype,
        completed: workout.completed,
        exercises: workout.workout_exercises
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((ex: any) => ({
            exercise: ex.exercise_data,
            sets: ex.sets,
          })),
      }))
    } catch (error) {
      console.error('Error fetching workout history:', error)
      return []
    }
  }

  async deleteWorkout(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId) // Ensure user can only delete their own workouts

    if (error) {
      console.error('Error deleting workout:', error)
      throw error
    }
  }

  async getRecentWorkoutTypes(): Promise<WorkoutSubType[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('workout_subtype')
      .eq('user_id', this.userId)
      .eq('completed', true)
      .not('workout_subtype', 'is', null)
      .order('date', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching recent workout types:', error)
      return []
    }

    return data.map(w => w.workout_subtype as WorkoutSubType).filter(Boolean)
  }

  async updateRecentWorkoutTypes(workoutType: WorkoutSubType): Promise<void> {
    // This is handled automatically when saving workouts
    // The getRecentWorkoutTypes method queries the actual workout data
  }

  async exportData(): Promise<AppState> {
    try {
      const [activeExercises, workouts] = await Promise.all([
        this.getActiveExercises(),
        this.getWorkoutHistory(),
      ])

      // Convert workouts array back to object format
      const workoutsObject = workouts.reduce((acc, workout) => {
        acc[workout.id] = workout
        return acc
      }, {} as Record<string, Workout>)

      return {
        workouts: workoutsObject,
        activeExercises,
        exerciseLibrary: [], // This is populated from the exercise repository
        recentWorkoutTypes: await this.getRecentWorkoutTypes(),
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      throw error
    }
  }

  async importData(data: AppState): Promise<void> {
    try {
      // Import active exercises
      if (data.activeExercises) {
        await this.setActiveExercises(data.activeExercises)
      }

      // Import workouts
      if (data.workouts) {
        const workouts = Object.values(data.workouts)
        for (const workout of workouts) {
          await this.saveWorkout(workout)
        }
      }
    } catch (error) {
      console.error('Error importing data:', error)
      throw error
    }
  }
} 