import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Workout, WorkoutType } from '../types';
import { loadState, saveState, saveWorkout } from '../utils/localStorage';

interface AppContextType {
  state: AppState;
  createWorkout: (type: WorkoutType) => Workout;
  updateWorkout: (workout: Workout) => void;
  toggleDarkMode: () => void;
  setRestTimer: (seconds: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const createWorkout = (type: WorkoutType): Workout => {
    const newWorkout = generateWorkout(type, state.workouts);
    
    // Update state with new workout
    setState(prevState => ({
      ...prevState,
      workouts: {
        ...prevState.workouts,
        [newWorkout.id]: newWorkout,
      },
    }));
    
    return newWorkout;
  };

  const updateWorkout = (workout: Workout): void => {
    setState(prevState => ({
      ...prevState,
      workouts: {
        ...prevState.workouts,
        [workout.id]: workout,
      },
    }));
    
    saveWorkout(workout);
  };

  const toggleDarkMode = (): void => {
    setState(prevState => ({
      ...prevState,
      userSettings: {
        ...prevState.userSettings,
        darkMode: !prevState.userSettings.darkMode,
      },
    }));
  };

  const setRestTimer = (seconds: number): void => {
    setState(prevState => ({
      ...prevState,
      userSettings: {
        ...prevState.userSettings,
        restTimer: seconds,
      },
    }));
  };

  const contextValue: AppContextType = {
    state,
    createWorkout,
    updateWorkout,
    toggleDarkMode,
    setRestTimer,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};