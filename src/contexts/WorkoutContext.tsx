import React, { createContext, useContext, useReducer, ReactNode, useState, useEffect, useMemo } from 'react';
import { AppState, Workout, WorkoutType, Exercise, WorkoutSubType } from '../types';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { MockExerciseRepository } from '../repositories/ExerciseRepository';
import { strategies, WorkoutStrategy, GeneratorOptions, WorkoutPlan } from '../strategies';
import { WorkoutHistory } from '../history/WorkoutHistory';
import { ProgressionService } from '../progression/ProgressionService';
import { AccessoryRotationService } from '../services/AccessoryRotationService';
import { useAuth } from './AuthContext';
import { DataService } from '../services/DataService';
import { SupabaseDataService } from '../services/SupabaseDataService';

interface WorkoutContextType {
  state: AppState;
  dispatch: React.Dispatch<WorkoutAction>;
  repository: ExerciseRepository;
  strategies: Record<string, WorkoutStrategy>;
  currentStrategy: WorkoutStrategy;
  generateWorkout: (options: GeneratorOptions & { workoutSubType?: WorkoutSubType }) => Promise<WorkoutPlan>;
  history: WorkoutHistory;
  
  // Progression features (always enabled for memory functionality)
  progressionService: ProgressionService;
  isProgressionEnabled: boolean;
  toggleProgression: () => void;
  
  // Accessory rotation service
  accessoryRotationService: AccessoryRotationService;
  
  // Consecutive workout type checking
  canGenerateWorkoutType: (workoutSubType: WorkoutSubType) => boolean;
  getConsecutiveWorkoutMessage: (workoutSubType: WorkoutSubType) => string | null;
}

type WorkoutAction =
  | { type: 'SET_WORKOUT'; payload: Omit<Workout, 'type'> & { type: WorkoutType } }
  | { type: 'CLEAR_WORKOUT'; payload: string }
  | { type: 'TOGGLE_EXERCISE_ACTIVE'; payload: string }
  | { type: 'SET_STRATEGY'; payload: string }
  | { type: 'SET_ACTIVE_EXERCISES'; payload: string[] }
  | { type: 'SET_EXERCISE_LIBRARY'; payload: Exercise[] }
  | { type: 'UPDATE_RECENT_WORKOUT_TYPES'; payload: WorkoutSubType }
  | { type: 'INITIALIZE_STATE'; payload: AppState };

function workoutReducer(state: AppState, action: WorkoutAction): AppState {
  switch (action.type) {
    case 'INITIALIZE_STATE':
      return action.payload;

    case 'SET_WORKOUT':
      const updatedWorkouts = {
        ...state.workouts,
        [action.payload.id]: action.payload,
      };
      
      // Update recent workout types if the workout is completed and has a workoutSubType
      let updatedRecentTypes = state.recentWorkoutTypes || [];
      if (action.payload.completed && action.payload.workoutSubType) {
        updatedRecentTypes = [action.payload.workoutSubType, ...updatedRecentTypes].slice(0, 3); // Keep last 3
      }
      
      const newState = {
        ...state,
        workouts: updatedWorkouts,
        recentWorkoutTypes: updatedRecentTypes,
      };
      return newState;

    case 'CLEAR_WORKOUT':
      const { [action.payload]: removed, ...remainingWorkouts } = state.workouts;
      const clearedState = {
        ...state,
        workouts: remainingWorkouts,
      };
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
      return updatedState;

    case 'SET_ACTIVE_EXERCISES':
      const newStateActive = {
        ...state,
        activeExercises: action.payload,
      };
      return newStateActive;

    case 'SET_EXERCISE_LIBRARY':
      return {
        ...state,
        exerciseLibrary: action.payload,
      };

    case 'UPDATE_RECENT_WORKOUT_TYPES':
      const currentRecentTypes = state.recentWorkoutTypes || [];
      const newRecentTypes = [action.payload, ...currentRecentTypes].slice(0, 3);
      return {
        ...state,
        recentWorkoutTypes: newRecentTypes,
      };

    default:
      return state;
  }
}

// Initial state for authenticated users
const getInitialState = (): AppState => ({
  workouts: {},
  activeExercises: [
    'backsquat', 'frontsquat',
    'conventionaldeadlift', 'rumaniandead', 
    'benchpress', 'overheadpress',
    'pullup', 'barbellbentoverrow',
    'plank', 'barbellcurl', 'lyinglegcurl'
  ],
  exerciseLibrary: [],
  recentWorkoutTypes: [],
});

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(workoutReducer, getInitialState());
  const [dataService, setDataService] = useState<DataService | null>(null);
  const repository = useMemo(() => new MockExerciseRepository(), []);
  const currentStrategy = strategies.cruiseMode; // Default to cruise mode strategy
  const [history] = useState(() => new WorkoutHistory());
  
  // Progression service - always available (starts with memory mode for free users)
  const [progressionService] = useState(() => new ProgressionService(false)); // Start as free user
  const [isProgressionEnabled, setIsProgressionEnabled] = useState(true); // Always enabled for memory
  
  // Accessory rotation service
  const [accessoryRotationService] = useState(() => new AccessoryRotationService());

  // Initialize data service when user changes
  useEffect(() => {
    if (user) {
      const service = new SupabaseDataService(user.id);
      setDataService(service);
    } else {
      setDataService(null);
    }
  }, [user]);

  // Load user data when data service is available
  useEffect(() => {
    if (dataService) {
      const loadUserData = async () => {
        try {
          const [activeExercises, workouts, recentWorkoutTypes] = await Promise.all([
            dataService.getActiveExercises(),
            dataService.getWorkoutHistory(),
            dataService.getRecentWorkoutTypes(),
          ]);

          // Convert workouts array to object
          const workoutsObject = workouts.reduce((acc, workout) => {
            acc[workout.id] = workout;
            return acc;
          }, {} as Record<string, Workout>);

          dispatch({
            type: 'INITIALIZE_STATE',
            payload: {
              workouts: workoutsObject,
              activeExercises: activeExercises.length > 0 ? activeExercises : getInitialState().activeExercises,
              exerciseLibrary: [],
              recentWorkoutTypes,
            },
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback to initial state
          dispatch({ type: 'INITIALIZE_STATE', payload: getInitialState() });
        }
      };

      loadUserData();
    }
  }, [dataService]);

  // Save active exercises to Supabase when they change
  useEffect(() => {
    if (dataService && state.activeExercises) {
      dataService.setActiveExercises(state.activeExercises).catch(console.error);
    }
  }, [state.activeExercises, dataService]);

  // Keep exerciseLibrary in sync with repository
  useEffect(() => {
    let isMounted = true;
    repository.getAll().then(exercises => {
      if (isMounted) {
        dispatch({ type: 'SET_EXERCISE_LIBRARY', payload: exercises });
      }
    });
    return () => { isMounted = false; };
  }, [repository]);

  const generateWorkout = async (options: GeneratorOptions & { workoutSubType?: WorkoutSubType }): Promise<WorkoutPlan> => {
    const exercises = await repository.getAll();
    const enhancedOptions = {
      ...options,
      workoutHistory: state.workouts,
      activeExercises: state.activeExercises,
      // Always include progression service for memory functionality
      progressionService: isProgressionEnabled ? progressionService : undefined,
      // Include accessory rotation service
      accessoryRotationService: accessoryRotationService,
      // Include workout sub-type
      workoutSubType: options.workoutSubType || 'full_body'
    };
    return currentStrategy.generate(exercises, enhancedOptions);
  };

  const canGenerateWorkoutType = (workoutSubType: WorkoutSubType): boolean => {
    const recentTypes = state.recentWorkoutTypes || [];
    
    // Full body workouts are always allowed
    if (workoutSubType === 'full_body') return true;
    
    // Check if the last 2 workouts were of the same type
    if (recentTypes.length >= 2 && 
        recentTypes[0] === workoutSubType && 
        recentTypes[1] === workoutSubType) {
      return false;
    }
    
    return true;
  };

  const getConsecutiveWorkoutMessage = (workoutSubType: WorkoutSubType): string | null => {
    if (canGenerateWorkoutType(workoutSubType)) return null;
    
    const opposite = workoutSubType === 'upper_body' ? 'lower body' : 'upper body';
    return `You've done 2 consecutive ${workoutSubType.replace('_', ' ')} workouts. Try a full body or ${opposite} workout for better balance.`;
  };

  const toggleProgression = () => {
    setIsProgressionEnabled(prev => !prev);
  };

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    repository,
    strategies,
    currentStrategy,
    generateWorkout,
    history,
    progressionService,
    isProgressionEnabled,
    toggleProgression,
    accessoryRotationService,
    canGenerateWorkoutType,
    getConsecutiveWorkoutMessage
  }), [state, dispatch, repository, currentStrategy, generateWorkout, history, progressionService, isProgressionEnabled, accessoryRotationService]);

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}

export function useActiveExercises() {
  const { state, dispatch } = useWorkout();
  return {
    activeExercises: state.activeExercises,
    setActiveExercises: (exercises: string[]) => dispatch({ type: 'SET_ACTIVE_EXERCISES', payload: exercises }),
  };
} 