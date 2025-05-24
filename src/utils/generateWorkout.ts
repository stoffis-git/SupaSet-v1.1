import { Exercise, Workout, WorkoutType } from '../types';

interface GenerateWorkoutOptions {
  activeExercises: string[];
  exerciseLibrary: Exercise[];
  workoutHistory: Record<string, Workout>;
  strategy: {
    type: WorkoutType;
    categories: string[];
    exercisesPerCategory: number;
  };
  progressionData?: {
    exerciseId: string;
    recommendedWeight: number;
    recommendedReps: number;
    recommendedSets?: number;
    notes?: string;
    confidence: number;
  }[];
}

export function getLeastRecentlyUsed(
  eligible: Exercise[],
  workoutHistory: Record<string, Workout>
): Exercise | undefined {
  if (eligible.length === 0) return undefined;
  // Map exercise_id to last performed date
  const lastPerformed: Record<string, number> = {};
  Object.values(workoutHistory).forEach(workout => {
    workout.exercises.forEach(e => {
      lastPerformed[e.exercise.exercise_id] = Math.max(
        lastPerformed[e.exercise.exercise_id] || 0,
        new Date(workout.date).getTime()
      );
    });
  });
  // Sort by oldest last performed (or never)
  return [...eligible].sort((a, b) => {
    const aDate = lastPerformed[a.exercise_id] || 0;
    const bDate = lastPerformed[b.exercise_id] || 0;
    return aDate - bDate;
  })[0];
}

export function getSecondLeastRecentlyUsed(
  eligible: Exercise[],
  workoutHistory: Record<string, Workout>
): Exercise | undefined {
  if (eligible.length < 2) return undefined;
  // Map exercise_id to last performed date
  const lastPerformed: Record<string, number> = {};
  Object.values(workoutHistory).forEach(workout => {
    workout.exercises.forEach(e => {
      lastPerformed[e.exercise.exercise_id] = Math.max(
        lastPerformed[e.exercise.exercise_id] || 0,
        new Date(workout.date).getTime()
      );
    });
  });
  // Sort by oldest last performed (or never) and return second
  const sorted = [...eligible].sort((a, b) => {
    const aDate = lastPerformed[a.exercise_id] || 0;
    const bDate = lastPerformed[b.exercise_id] || 0;
    return aDate - bDate;
  });
  return sorted[1];
}

export function getTwoLeastRecentlyUsed(
  eligible: Exercise[],
  workoutHistory: Record<string, Workout>
): Exercise[] {
  if (eligible.length === 0) return [];
  if (eligible.length === 1) return [eligible[0]];
  
  const lru = getLeastRecentlyUsed(eligible, workoutHistory);
  const secondLru = getSecondLeastRecentlyUsed(eligible, workoutHistory);
  
  return [lru, secondLru].filter(Boolean) as Exercise[];
}

export function getRandomExercise(eligible: Exercise[]): Exercise | undefined {
  if (eligible.length === 0) return undefined;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function getRandomExerciseExcluding(
  eligible: Exercise[],
  excludeId: string
): Exercise | undefined {
  const filtered = eligible.filter(ex => ex.exercise_id !== excludeId);
  return getRandomExercise(filtered);
}

export function selectExerciseWithFallback(
  eligible: Exercise[],
  workoutHistory: Record<string, Workout>,
  fallbackStrategy: 'random' | 'first' = 'random'
): Exercise | undefined {
  if (eligible.length === 0) return undefined;
  
  const lru = getLeastRecentlyUsed(eligible, workoutHistory);
  if (lru) return lru;
  
  // Fallback when LRU returns undefined (empty history or other issues)
  if (fallbackStrategy === 'random') {
    return getRandomExercise(eligible);
  } else {
    return eligible[0];
  }
}

export function switchBetweenTwoLeastRecent(
  currentExercise: Exercise,
  eligible: Exercise[],
  workoutHistory: Record<string, Workout>
): Exercise {
  const twoLeastRecent = getTwoLeastRecentlyUsed(eligible, workoutHistory);
  
  if (twoLeastRecent.length < 2) {
    // If we don't have two exercises, return a random one excluding current
    return getRandomExerciseExcluding(eligible, currentExercise.exercise_id) || currentExercise;
  }
  
  // Return the other exercise from the two least recent
  return twoLeastRecent.find(ex => ex.exercise_id !== currentExercise.exercise_id) || twoLeastRecent[0];
}

export function generateWorkout({
  activeExercises,
  exerciseLibrary,
  workoutHistory,
  strategy,
  progressionData
}: GenerateWorkoutOptions): Workout {
  const selectedExercises: Exercise[] = [];

  for (const category of strategy.categories) {
    const eligible = exerciseLibrary.filter(
      ex =>
        activeExercises.includes(ex.exercise_id) &&
        ex.categories?.includes(category)
    );
    
    const chosen = selectExerciseWithFallback(eligible, workoutHistory, 'random');
    if (chosen) {
      selectedExercises.push(chosen);
    }
  }

  return {
    id: `workout-${Date.now()}`,
    workout_id: `workout-${Date.now()}`,
    date: new Date().toISOString(),
    type: strategy.type,
    exercises: selectedExercises.map(exercise => {
      // Find progression data for this exercise
      const progression = progressionData?.find(p => p.exerciseId === exercise.exercise_id);
      
      // Determine number of sets (from progression data or default to 3)
      const setCount = progression?.recommendedSets || 3;
      
      // Create sets with prefilled data if available
      const sets = Array.from({ length: setCount }, () => ({
        weight: progression?.recommendedWeight || 0,
        reps: progression?.recommendedReps || 0,
        completed: false
      }));

      return {
        exercise,
        sets,
        progressionNotes: progression?.notes // Add progression notes for UI
      };
    }),
    completed: false
  };
} 