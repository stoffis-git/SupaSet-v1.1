import React, { useState } from 'react';
import { Workout, ExerciseWithSets, Set, Exercise, ExerciseLibraryItem, EquipmentType, WorkoutType } from '../types';
import Button from './ui/Button';
import { ArrowLeft, Save, CheckCircle, Plus, Minus, RefreshCw, X } from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import { ProgressionNote } from './workout/ProgressionNote';

// Convert library item to Exercise type
function convertLibraryItemToExercise(item: ExerciseLibraryItem): Exercise {
  return {
    ...item,
    equipment: item.equipment?.map((e: string) => e as EquipmentType) || [],
    muscle_groups: item.muscle_groups || []
  };
}

interface WorkoutPreviewProps {
  workout: Workout;
  onBack: () => void;
  isPreview?: boolean;
  onStart?: () => void;
}

// Dynamic accessory exercise addition logic
interface AccessoryExerciseState {
  exercise: Exercise;
  category: string;
  sets: Set[];
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout, onBack, isPreview = false, onStart }) => {
  const { state, dispatch } = useWorkout();
  const [currentWorkout, setCurrentWorkout] = useState<Workout>({...workout});
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [reproposedExercises, setReproposedExercises] = useState<Record<string, boolean>>({});
  const [inputErrors, setInputErrors] = useState<Record<string, { weight?: boolean; reps?: boolean }>>({});
  const [doneButtonErrors, setDoneButtonErrors] = useState<Record<string, boolean>>({});
  
  // Dynamic accessory exercises state
  const [accessoryExercises, setAccessoryExercises] = useState<AccessoryExerciseState[]>([]);

  // Accessory category order for dynamic addition
  const accessoryCategories = [
    { type: 'core', name: 'Core', tags: ['core'] },
    { type: 'upper_push_isolation', name: 'Upper (Push)', tags: ['isolation', 'upper_body', 'push'] },
    { type: 'upper_pull_isolation', name: 'Upper (Pull)', tags: ['isolation', 'upper_body', 'pull'] }
  ];

  // Get available accessory exercises for a specific category
  const getAccessoryExercisesForCategory = (categoryType: string): Exercise[] => {
    const category = accessoryCategories.find(cat => cat.type === categoryType);
    if (!category) return [];

    // Get exercises matching the category tags
    const categoryExercises = (state.exerciseLibrary || []).filter(exercise => {
      const tags = exercise.tags || [];
      return category.tags.every(tag => tags.includes(tag));
    });

    // Return only the first 4 exercises (matching ExerciseList auto-selection logic)
    return categoryExercises.slice(0, 4);
  };

  // Add accessory exercise dynamically
  const addAccessoryExercise = () => {
    const nextCategoryIndex = accessoryExercises.length;
    if (nextCategoryIndex >= accessoryCategories.length) return;

    const nextCategory = accessoryCategories[nextCategoryIndex];
    
    // Check if this category is already covered
    const isCategoryCovered = accessoryExercises.some(accessory => accessory.category === nextCategory.name);
    if (isCategoryCovered) return;
    
    const availableExercises = getAccessoryExercisesForCategory(nextCategory.type);
    
    if (availableExercises.length === 0) return;

    // Get the first exercise from the auto-selected list (matching ExerciseList behavior)
    const selectedExercise = availableExercises[0];
    
    // Create sets for the accessory exercise
    const sets = Array.from({ length: 3 }, () => ({
      weight: 0,
      reps: 0,
      completed: false
    }));

    const newAccessoryExercise: AccessoryExerciseState = {
      exercise: selectedExercise,
      category: nextCategory.name,
      sets: sets
    };

    setAccessoryExercises(prev => [...prev, newAccessoryExercise]);
  };

  // Remove accessory exercise
  const removeAccessoryExercise = (index: number) => {
    setAccessoryExercises(prev => prev.filter((_, i) => i !== index));
  };

  // Log the initial workout data
  console.log("Initial Workout Data:", workout);

  const handleSetCompletion = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    if (isPreview) return;
    const set = currentWorkout.exercises[exerciseIndex].sets[setIndex];
    let hasError = false;
    if (completed) {
      if (set.weight === undefined || set.weight === null || isNaN(set.weight)) {
        hasError = true;
      }
      if (set.reps === undefined || set.reps === null || isNaN(set.reps)) {
        hasError = true;
      }
    }
    const key = `${exerciseIndex}-${setIndex}`;
    setDoneButtonErrors(prev => ({ ...prev, [key]: hasError }));
    if (hasError) return;
    const updatedWorkout = { ...currentWorkout };
    updatedWorkout.exercises[exerciseIndex].sets[setIndex].completed = completed;
    const allSetsCompleted = updatedWorkout.exercises.every(exercise =>
      exercise.sets.every(set => set.completed)
    );
    updatedWorkout.completed = allSetsCompleted;
    setCurrentWorkout(updatedWorkout);
  };

  const handleSwitchExercise = (exerciseIndex: number) => {
    const currentExercise = currentWorkout.exercises[exerciseIndex].exercise;
    
    // For Cruise Mode, look for movement pattern categories, not muscle group categories
    const cruiseModeCategories = ['upper_body_push', 'upper_body_pull', 'knee_dominant', 'hip_dominant'];
    const category = currentExercise.categories?.find(cat => cruiseModeCategories.includes(cat));
    
    if (!category) {
      console.log('No Cruise Mode category found for exercise:', currentExercise.name);
      console.log('Available categories:', currentExercise.categories);
      return;
    }
    
    // Filter by active exercises first, then by category
    const activeExercises = (state.exerciseLibrary || []).filter(ex => 
      state.activeExercises.includes(ex.exercise_id)
    );
    
    const eligibleExercises = activeExercises.filter(
      ex => Array.isArray(ex.categories) && ex.categories.includes(category)
    );

    // Check if current exercise has historical data
    const currentExerciseHasHistory = state.workouts && Object.values(state.workouts).some(workout => 
      workout.exercises.some(ex => ex.exercise.exercise_id === currentExercise.exercise_id)
    );

    let switchableExercises: Exercise[];

    if (!currentExerciseHasHistory) {
      // If current exercise has no history, toggle between all exercises with no history in this category
      switchableExercises = eligibleExercises.filter(ex => {
        const hasHistory = state.workouts && Object.values(state.workouts).some(workout => 
          workout.exercises.some(workoutEx => workoutEx.exercise.exercise_id === ex.exercise_id)
        );
        return !hasHistory; // Only exercises with no history
      });
    } else {
      // Standard behavior for exercises with history
      switchableExercises = eligibleExercises.filter(ex => ex.exercise_id !== currentExercise.exercise_id);
    }

    // Enhanced logging for debugging
    console.log('=== SWITCH EXERCISE DEBUG ===');
    console.log('Current Exercise:', currentExercise.name, 'ID:', currentExercise.exercise_id);
    console.log('Current Exercise Has History:', currentExerciseHasHistory);
    console.log('Current Exercise Categories:', currentExercise.categories);
    console.log('Target Category (Cruise Mode):', category);
    console.log('Total Active Exercises:', state.activeExercises.length);
    console.log('Active Exercise IDs:', state.activeExercises);
    console.log('Eligible Exercises for Category:', eligibleExercises.map(ex => ({
      id: ex.exercise_id,
      name: ex.name,
      categories: ex.categories
    })));
    console.log('Switchable Exercises:', switchableExercises.map(ex => ({
      id: ex.exercise_id,
      name: ex.name,
      hasHistory: state.workouts && Object.values(state.workouts).some(workout => 
        workout.exercises.some(workoutEx => workoutEx.exercise.exercise_id === ex.exercise_id)
      )
    })));

    if (switchableExercises.length === 0) {
      console.log('No switchable exercises found for category:', category);
      return;
    }

    let newExercise: Exercise;

    if (!currentExerciseHasHistory) {
      // For exercises with no history, cycle through all available options
      const currentIndex = switchableExercises.findIndex(ex => ex.exercise_id === currentExercise.exercise_id);
      const nextIndex = (currentIndex + 1) % switchableExercises.length;
      newExercise = convertLibraryItemToExercise(switchableExercises[nextIndex]);
    } else {
      // For exercises with history, use least recently used logic
      const recencySorted = switchableExercises.sort((a, b) => {
        const aPerf = state.workouts
          ? Object.values(state.workouts)
              .filter(w => w.exercises.some(e => e.exercise.exercise_id === a.exercise_id))
              .map(w => new Date(w.date).getTime())
          : [];
        const bPerf = state.workouts
          ? Object.values(state.workouts)
              .filter(w => w.exercises.some(e => e.exercise.exercise_id === b.exercise_id))
              .map(w => new Date(w.date).getTime())
          : [];
        const aLast = aPerf.length > 0 ? Math.max(...aPerf) : 0;
        const bLast = bPerf.length > 0 ? Math.max(...bPerf) : 0;
        return aLast - bLast;
      });

      // Take the least recently used exercise
      newExercise = convertLibraryItemToExercise(recencySorted[0]);
    }

    console.log('Selected New Exercise:', newExercise.name, 'ID:', newExercise.exercise_id);
    console.log('================================');

    // Update the workout
    const updatedExercises = currentWorkout.exercises.map((ex, idx) =>
      idx === exerciseIndex
        ? { ...ex, exercise: newExercise }
        : ex
    );
    setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
  };

  const handleStartSession = () => {
    const workoutToDispatch = {
      ...currentWorkout,
      type: currentWorkout.type as WorkoutType
    };
    dispatch({ type: 'SET_WORKOUT', payload: workoutToDispatch });
    window.location.href = `/workout/${currentWorkout.id}`;
  };

  const handleFinishWorkout = () => {
    const allDone = currentWorkout.exercises.every(ex => ex.sets.every(set => set.completed));
    if (!allDone) {
      const newErrors: Record<string, boolean> = {};
      currentWorkout.exercises.forEach((ex, exerciseIndex) => {
        ex.sets.forEach((set, setIndex) => {
          if (!set.completed) {
            newErrors[`${exerciseIndex}-${setIndex}`] = true;
          }
        });
      });
      setDoneButtonErrors(newErrors);
      return;
    }
    
    // Ensure the workout is marked as completed
    const completedWorkout = {
      ...currentWorkout,
      completed: true,
      type: currentWorkout.type as WorkoutType
    };
    
    dispatch({ type: 'SET_WORKOUT', payload: completedWorkout });
    onBack();
  };

  const handleSetChange = (
    exerciseIndex: number, 
    setIndex: number, 
    field: keyof Set, 
    value: number
  ) => {
    const updatedWorkout = {...currentWorkout};
    if (field === 'weight' || field === 'reps') {
      updatedWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
    }
    setCurrentWorkout(updatedWorkout);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedWorkout = {...currentWorkout};
    const exercise = updatedWorkout.exercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    exercise.sets.push({
      weight: lastSet.weight,
      reps: lastSet.reps,
      completed: false
    });
    
    setCurrentWorkout(updatedWorkout);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].sets.splice(setIndex, 1);
    setCurrentWorkout(updatedWorkout);
  };

  const handleReproposeExercise = (exerciseIndex: number) => {
    const exercise = currentWorkout.exercises[exerciseIndex].exercise;
    
    // For Cruise Mode, look for movement pattern categories, not muscle group categories
    const cruiseModeCategories = ['upper_body_push', 'upper_body_pull', 'knee_dominant', 'hip_dominant'];
    const category = exercise.categories?.find(cat => cruiseModeCategories.includes(cat));
    
    if (!category) return;
    
    // Filter by active exercises first, then by category, excluding current exercise
    const activeExercises = (state.exerciseLibrary || []).filter(ex => 
      state.activeExercises.includes(ex.exercise_id)
    );
    
    const eligibleExercises = activeExercises.filter(
      ex => Array.isArray(ex.categories) && ex.categories.includes(category) && ex.exercise_id !== exercise.exercise_id
    );
    
    if (eligibleExercises.length > 0) {
      const newExercise = eligibleExercises[Math.floor(Math.random() * eligibleExercises.length)];
      const updatedWorkout = {...currentWorkout};
      updatedWorkout.exercises[exerciseIndex].exercise = newExercise;
      setCurrentWorkout(updatedWorkout);
      const key = exerciseIndex.toString();
      setReproposedExercises(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  // Handle accessory exercise switching
  const handleSwitchAccessoryExercise = (accessoryIndex: number) => {
    const currentAccessory = accessoryExercises[accessoryIndex];
    const categoryType = accessoryCategories.find(cat => cat.name === currentAccessory.category)?.type;
    
    if (!categoryType) return;
    
    // Only toggle between the auto-selected exercises (first 4 in category)
    const availableExercises = getAccessoryExercisesForCategory(categoryType);
    
    // Check if current exercise has historical data
    const currentExerciseHasHistory = state.workouts && Object.values(state.workouts).some(workout => 
      workout.exercises.some(ex => ex.exercise.exercise_id === currentAccessory.exercise.exercise_id)
    );

    let switchableExercises: Exercise[];

    if (!currentExerciseHasHistory) {
      // If current exercise has no history, toggle between auto-selected exercises with no history
      switchableExercises = availableExercises.filter(ex => {
        const hasHistory = state.workouts && Object.values(state.workouts).some(workout => 
          workout.exercises.some(workoutEx => workoutEx.exercise.exercise_id === ex.exercise_id)
        );
        return !hasHistory; // Only exercises with no history
      });
    } else {
      // Standard behavior for exercises with history (within auto-selected list)
      switchableExercises = availableExercises.filter(ex => ex.exercise_id !== currentAccessory.exercise.exercise_id);
    }

    if (switchableExercises.length === 0) return;

    let newExercise: Exercise;

    if (!currentExerciseHasHistory) {
      // For exercises with no history, cycle through all available options
      const currentIndex = switchableExercises.findIndex(ex => ex.exercise_id === currentAccessory.exercise.exercise_id);
      const nextIndex = (currentIndex + 1) % switchableExercises.length;
      newExercise = switchableExercises[nextIndex];
    } else {
      // For exercises with history, use least recently used logic
      const recencySorted = switchableExercises.sort((a, b) => {
        const aPerf = state.workouts
          ? Object.values(state.workouts)
              .filter(w => w.exercises.some(e => e.exercise.exercise_id === a.exercise_id))
              .map(w => new Date(w.date).getTime())
          : [];
        const bPerf = state.workouts
          ? Object.values(state.workouts)
              .filter(w => w.exercises.some(e => e.exercise.exercise_id === b.exercise_id))
              .map(w => new Date(w.date).getTime())
          : [];
        const aLast = aPerf.length > 0 ? Math.max(...aPerf) : 0;
        const bLast = bPerf.length > 0 ? Math.max(...bPerf) : 0;
        return aLast - bLast;
      });

      // Take the least recently used exercise
      newExercise = recencySorted[0];
    }

    // Update the accessory exercise
    setAccessoryExercises(prev => 
      prev.map((acc, index) => 
        index === accessoryIndex 
          ? { ...acc, exercise: newExercise }
          : acc
      )
    );
  };

  // Log the current workout state before rendering
  console.log("Current Workout State:", currentWorkout);

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <button 
          className="flex items-center text-indigo-400 hover:text-indigo-300"
          onClick={onBack}
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>
        
        {!isPreview && (
          <Button 
            onClick={handleFinishWorkout}
          >
            <Save size={18} className="mr-1" />
            Finish Workout
          </Button>
        )}
      </div>
      
      {/* Workout title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">
          {currentWorkout.workoutSubType ? 
            currentWorkout.workoutSubType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Workout' :
            currentWorkout.type.charAt(0).toUpperCase() + currentWorkout.type.slice(1) + ' Workout'
          }
        </h1>
      </div>
      
      {/* Main Movements Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-indigo-300 mb-2">MAIN MOVEMENTS</h2>
        <div className="space-y-1">
          {currentWorkout.exercises.slice(0, 4).map((exerciseData, exerciseIndex) => (
            <div key={exerciseIndex} className="border border-dark-700 rounded-lg overflow-hidden">
              <div className="p-2 bg-dark-900 flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="font-semibold text-white">
                    {exerciseData.exercise.name}
                  </h3>
                </div>
                {isPreview && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSwitchExercise(exerciseIndex)}
                    className="flex items-center"
                  >
                    <RefreshCw size={16} className="mr-1" />
                    Switch
                  </Button>
                )}
              </div>
              
              {!isPreview && activeExerciseIndex === exerciseIndex && (
                <div className="p-4 bg-dark-800">
                  {exerciseData.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-4 mb-2">
                      <span className="text-dark-400">Set {setIndex + 1}</span>
                      <div className="flex items-center">
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-dark-700 rounded"
                          onClick={() => handleSetChange(
                            exerciseIndex, 
                            setIndex, 
                            'weight', 
                            Math.max(0, set.weight - 2.5)
                          )}
                        >
                          <Minus size={16} />
                        </button>
                        
                        <input 
                          type="number"
                          className={`w-20 bg-dark-900 border border-dark-700 rounded px-2 py-1 ${inputErrors[`${exerciseIndex}-${setIndex}`]?.weight ? ' border-red-500' : ''}`}
                          value={set.weight}
                          onChange={(e) => handleSetChange(
                            exerciseIndex,
                            setIndex,
                            'weight',
                            Number(e.target.value)
                          )}
                          min={0}
                          step={2.5}
                        />
                        
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-dark-700 rounded"
                          onClick={() => handleSetChange(
                            exerciseIndex, 
                            setIndex, 
                            'weight', 
                            set.weight + 2.5
                          )}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center">
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-dark-700 rounded"
                          onClick={() => handleSetChange(
                            exerciseIndex, 
                            setIndex, 
                            'reps', 
                            Math.max(1, set.reps - 1)
                          )}
                        >
                          <Minus size={16} />
                        </button>
                        
                        <input 
                          type="number"
                          className={`w-20 bg-dark-900 border border-dark-700 rounded px-2 py-1 ${inputErrors[`${exerciseIndex}-${setIndex}`]?.reps ? ' border-red-500' : ''}`}
                          value={set.reps}
                          onChange={(e) => handleSetChange(
                            exerciseIndex,
                            setIndex,
                            'reps',
                            Number(e.target.value)
                          )}
                          min={1}
                        />
                        
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-dark-700 rounded"
                          onClick={() => handleSetChange(
                            exerciseIndex, 
                            setIndex, 
                            'reps', 
                            set.reps + 1
                          )}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <Button
                        variant={set.completed ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleSetCompletion(exerciseIndex, setIndex, !set.completed)}
                        className={doneButtonErrors[`${exerciseIndex}-${setIndex}`] ? 'border-2 border-red-500' : ''}
                      >
                        {set.completed ? (
                          <>
                            <CheckCircle size={16} className="mr-1" />
                            Done
                          </>
                        ) : 'Mark Done'}
                      </Button>
                      
                      {exerciseData.sets.length > 1 && (
                        <button 
                          className="text-red-500 hover:text-red-400 p-1"
                          onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                        >
                          <Minus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-4">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleAddSet(exerciseIndex)}
                      className="flex items-center"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Set
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accessories Section - Dynamic Addition */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-green-300 mb-2">
          ACCESSORIES <span className="font-thin text-green-300/60">Optional</span>
        </h2>
        <div className="space-y-1">
          {/* Dynamically added accessory exercises */}
          {accessoryExercises.map((accessoryEx, index) => (
            <div key={`accessory-${index}`} className="border border-dark-700 rounded-lg overflow-hidden">
              <div className="p-2 bg-dark-900 flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="font-semibold text-white">
                    {accessoryEx.exercise.name}
                  </h3>
                </div>
                {isPreview && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSwitchAccessoryExercise(index)}
                      className="flex items-center"
                    >
                      <RefreshCw size={16} className="mr-1" />
                      Switch
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeAccessoryExercise(index)}
                      className="flex items-center text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Exercise Button */}
          {isPreview && accessoryExercises.length < accessoryCategories.length && (
            <button
              onClick={addAccessoryExercise}
              className="w-full border border-dashed border-dark-600 rounded-lg p-2 bg-dark-900/50 hover:bg-dark-900 transition-colors"
            >
              <div className="flex items-center justify-center">
                <Plus size={20} className="mr-2 text-green-400" />
                <span className="text-green-400 font-medium">Add Exercise</span>
              </div>
            </button>
          )}
        </div>
      </div>
      
      {/* Start/Finish Workout Button */}
      {isPreview ? (
        <Button
          className="w-full mt-2"
          onClick={onStart ? onStart : handleStartSession}
        >
          Start Workout
        </Button>
      ) : (
        <div className="flex justify-between mt-2">
          <Button variant="secondary" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleFinishWorkout}>
            Finish Workout
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPreview;