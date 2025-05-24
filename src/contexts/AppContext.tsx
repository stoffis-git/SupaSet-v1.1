import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Workout, WorkoutType, Exercise, ExerciseLibraryItem, EquipmentType } from '../types';
import { loadState, saveState } from '../utils/localStorage';

// Convert library item to Exercise type
function convertLibraryItemToExercise(item: ExerciseLibraryItem): Exercise {
  return {
    ...item,
    equipment: item.equipment?.map((e: string) => e as EquipmentType) || [],
    muscle_groups: item.muscle_groups || []
  };
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type AppAction =
  | { type: 'SET_WORKOUT'; payload: Omit<Workout, 'type'> & { type: WorkoutType } }
  | { type: 'CLEAR_WORKOUT'; payload: string }
  | { type: 'TOGGLE_EXERCISE_ACTIVE'; payload: string };

function getInitialState(): AppState {
    return {
    workouts: {},
    activeExercises: [],
    exerciseLibrary: [],
    };
  }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WORKOUT':
      const updatedWorkouts = {
        ...state.workouts,
        [action.payload.id]: action.payload,
      };
      const newState = {
        ...state,
        workouts: updatedWorkouts,
      };
      saveState(newState);
      return newState;

    case 'CLEAR_WORKOUT':
      const { [action.payload]: removed, ...remainingWorkouts } = state.workouts;
      const clearedState = {
        ...state,
        workouts: remainingWorkouts,
      };
      saveState(clearedState);
      return clearedState;

    case 'TOGGLE_EXERCISE_ACTIVE':
      const currentActiveExercises = state.activeExercises || [];
      let updatedActiveExercises;
      if (currentActiveExercises.includes(action.payload)) {
        updatedActiveExercises = currentActiveExercises.filter(id => id !== action.payload);
      } else {
        updatedActiveExercises = [...currentActiveExercises, action.payload];
      }
      const updatedState = {
        ...state,
        activeExercises: updatedActiveExercises,
      };
      saveState(updatedState);
      return updatedState;

    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 