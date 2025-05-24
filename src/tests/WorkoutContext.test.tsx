import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { WorkoutProvider, useWorkout } from '../contexts/WorkoutContext';
import { Exercise, Workout } from '../types';

const MOCK_EXERCISE: Exercise = {
  exercise_id: '1',
  name: 'Test Exercise',
  description: 'Test Description',
  category: 'Test Category',
  equipment: ['Test Equipment'],
  muscle_groups: ['Test Muscle']
};

const MOCK_WORKOUT: Workout = {
  workout_id: '1',
  date: new Date().toISOString(),
  exercises: [{
    exercise: MOCK_EXERCISE,
    sets: 3,
    reps: 10
  }],
  completed: true
};

describe('WorkoutContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WorkoutProvider>{children}</WorkoutProvider>
  );

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useWorkout(), { wrapper });
    expect(result.current.state.selectedExercises).toEqual([]);
    expect(result.current.state.workouts).toEqual({});
    expect(result.current.state.activeExercises).toEqual([]);
  });

  it('should add exercise to selected exercises', () => {
    const { result } = renderHook(() => useWorkout(), { wrapper });
    act(() => {
      result.current.dispatch({
        type: 'ADD_EXERCISE',
        payload: MOCK_EXERCISE
      });
    });
    expect(result.current.state.selectedExercises).toContainEqual(MOCK_EXERCISE);
  });

  it('should remove exercise from selected exercises', () => {
    const { result } = renderHook(() => useWorkout(), { wrapper });
    act(() => {
      result.current.dispatch({
        type: 'ADD_EXERCISE',
        payload: MOCK_EXERCISE
      });
      result.current.dispatch({
        type: 'REMOVE_EXERCISE',
        payload: { id: MOCK_EXERCISE.exercise_id }
      });
    });
    expect(result.current.state.selectedExercises).not.toContainEqual(MOCK_EXERCISE);
  });

  it('should log workout', () => {
    const { result } = renderHook(() => useWorkout(), { wrapper });
    act(() => {
      result.current.dispatch({
        type: 'LOG_WORKOUT',
        payload: MOCK_WORKOUT
      });
    });
    expect(result.current.state.workouts[MOCK_WORKOUT.workout_id]).toEqual(MOCK_WORKOUT);
  });

  it('should toggle exercise active state', () => {
    const { result } = renderHook(() => useWorkout(), { wrapper });
    act(() => {
      result.current.dispatch({
        type: 'TOGGLE_EXERCISE_ACTIVE',
        payload: MOCK_EXERCISE.exercise_id
      });
    });
    expect(result.current.isExerciseActive(MOCK_EXERCISE.exercise_id)).toBe(true);

    act(() => {
      result.current.dispatch({
        type: 'TOGGLE_EXERCISE_ACTIVE',
        payload: MOCK_EXERCISE.exercise_id
      });
    });
    expect(result.current.isExerciseActive(MOCK_EXERCISE.exercise_id)).toBe(false);
  });
}); 