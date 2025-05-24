import { useState, useEffect, useMemo } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { Exercise } from '../types';
import { ChevronDown, ChevronUp, Target, Heart, Lock, Check, AlertCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface CategoryProgress {
  current: number;
  max: number;
  required: number;
}

interface ExerciseCategory {
  id: string;
  name: string;
  icon: any;
  exercises: Exercise[];
  selectedExercises: string[];
  progress: CategoryProgress;
  isAccessory?: boolean;
  isLocked?: boolean;
}

// Exercise Selection Preset interface (preparing for preset feature)
interface ExerciseSelectionPreset {
  id: string;
  name: string;
  description: string;
  selections: Record<string, string[]>; // categoryId -> exerciseIds
}

function setEquals(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const val of a) if (!b.has(val)) return false;
  return true;
}

export function ExerciseList() {
  const { repository, dispatch, state, accessoryRotationService } = useWorkout();
  const location = useLocation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set(state.activeExercises));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['knee_dominant']));
  const [highlightedCategories, setHighlightedCategories] = useState<Set<string>>(new Set());
  const [isFromExternalNavigation, setIsFromExternalNavigation] = useState(false);

  // Auto-fetch exercises from repository on mount
  useEffect(() => {
    let isMounted = true;
    repository.getAll().then(data => {
      if (isMounted) setExercises(data);
    });
    return () => { isMounted = false; };
  }, [repository]);

  // Detect external navigation (from home screen validation)
  useEffect(() => {
    if (location.state?.fromValidation) {
      setIsFromExternalNavigation(true);
      // Reset the flag after a short delay
      const timeout = setTimeout(() => setIsFromExternalNavigation(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [location.state]);

  // Memoize initial selection
  const initialSelection = useMemo(() => new Set(state.activeExercises), [state.activeExercises]);

  // Filter compound movements for main categories
  const filterCompoundMovements = (categoryExercises: Exercise[]): Exercise[] => {
    return categoryExercises.filter(exercise => {
      const tags = exercise.tags || [];
      const name = exercise.name.toLowerCase();
      
      // Exclude isolation exercises
      if (tags.includes('isolation')) return false;
      
      // Exclude olympic exercises (like Clean Pull, Snatch Pull) but allow explosive pressing movements
      if (tags.includes('olympic')) return false;
      
      // Exclude common isolation exercise names
      const isolationKeywords = [
        'lateral raise', 'front raise', 'rear delt', 'pec dec', 'pec fly',
        'bicep curl', 'tricep extension', 'leg curl', 'leg extension',
        'calf raise', 'shrug', 'wrist curl', 'neck'
      ];
      
      if (isolationKeywords.some(keyword => name.includes(keyword))) return false;
      
      // Include compound movements - exercises that work multiple muscle groups
      if (tags.includes('compound')) return true;
      
      // Include exercises with multiple muscle groups (compound indicator)
      if (exercise.muscle_groups && exercise.muscle_groups.length >= 2) return true;
      
      // Include common compound movement names
      const compoundKeywords = [
        'squat', 'deadlift', 'press', 'pull-up', 'pullup', 'chin-up', 'chinup',
        'row', 'lunge', 'thrust', 'clean', 'snatch', 'jerk', 'dip'
      ];
      
      if (compoundKeywords.some(keyword => name.includes(keyword))) return true;
      
      return false;
    });
  };

  // Enforce maximum limit by auto-deactivating excess exercises
  const enforceMaxLimit = (categoryExercises: Exercise[], maxLimit: number, currentSelected: string[]): string[] => {
    if (currentSelected.length <= maxLimit) return currentSelected;
    
    // Keep only the first maxLimit exercises and remove the rest
    const limitedSelection = currentSelected.slice(0, maxLimit);
    const removedExercises = currentSelected.slice(maxLimit);
    
    // Remove excess exercises from global selection
    removedExercises.forEach(exerciseId => {
      selectedExercises.delete(exerciseId);
    });
    
    return limitedSelection;
  };

  // Categorize exercises
  const categories = useMemo((): ExerciseCategory[] => {
    if (exercises.length === 0) return [];

    // Main movement categories with compound filtering
    const kneeDominant = filterCompoundMovements(exercises.filter(ex => ex.categories?.includes('knee_dominant')));
    const hipDominant = filterCompoundMovements(exercises.filter(ex => ex.categories?.includes('hip_dominant')));
    const upperPush = filterCompoundMovements(exercises.filter(ex => ex.categories?.includes('upper_body_push')));
    const upperPull = filterCompoundMovements(exercises.filter(ex => ex.categories?.includes('upper_body_pull')));

    // Accessory categories (all exercises, including isolation)
    const coreExercises = exercises.filter(ex => ex.tags?.includes('core'));
    const upperIsolation = exercises.filter(ex => 
      ex.tags?.includes('isolation') && ex.tags?.includes('upper_body')
    );
    const lowerIsolation = exercises.filter(ex => 
      ex.tags?.includes('isolation') && ex.tags?.includes('lower_body')
    );

    const getSelectedForCategory = (categoryExercises: Exercise[], maxLimit: number = 4) => {
      const currentSelected = categoryExercises.filter(ex => selectedExercises.has(ex.exercise_id)).map(ex => ex.exercise_id);
      return enforceMaxLimit(categoryExercises, maxLimit, currentSelected);
    };

    // Get auto-selected accessory exercises using the rotation service
    const getAccessorySelection = (accessoryExercises: Exercise[], categoryType: 'core' | 'upper' | 'lower') => {
      if (accessoryExercises.length === 0) return [];
      return accessoryExercises.slice(0, 4).map(ex => ex.exercise_id);
    };

    const selectedCoreExercises = getAccessorySelection(coreExercises, 'core');
    const selectedUpperIsolation = getAccessorySelection(upperIsolation, 'upper');
    const selectedLowerIsolation = getAccessorySelection(lowerIsolation, 'lower');

    return [
      {
        id: 'knee_dominant',
        name: 'Knee Dominant',
        icon: Target,
        exercises: kneeDominant,
        selectedExercises: getSelectedForCategory(kneeDominant),
        progress: {
          current: getSelectedForCategory(kneeDominant).length,
          max: 4,
          required: 2
        }
      },
      {
        id: 'hip_dominant',
        name: 'Hip Dominant', 
        icon: Target,
        exercises: hipDominant,
        selectedExercises: getSelectedForCategory(hipDominant),
        progress: {
          current: getSelectedForCategory(hipDominant).length,
          max: 4,
          required: 2
        }
      },
      {
        id: 'upper_body_push',
        name: 'Upper Body Push',
        icon: Target,
        exercises: upperPush,
        selectedExercises: getSelectedForCategory(upperPush),
        progress: {
          current: getSelectedForCategory(upperPush).length,
          max: 4,
          required: 2
        }
      },
      {
        id: 'upper_body_pull',
        name: 'Upper Body Pull',
        icon: Target,
        exercises: upperPull,
        selectedExercises: getSelectedForCategory(upperPull),
        progress: {
          current: getSelectedForCategory(upperPull).length,
          max: 4,
          required: 2
        }
      },
      {
        id: 'core',
        name: 'Core',
        icon: Heart,
        exercises: coreExercises,
        selectedExercises: selectedCoreExercises,
        progress: {
          current: selectedCoreExercises.length,
          max: 4,
          required: 4
        },
        isAccessory: true,
        isLocked: true
      },
      {
        id: 'upper_isolation',
        name: 'Upper Isolation',
        icon: Heart,
        exercises: upperIsolation,
        selectedExercises: selectedUpperIsolation,
        progress: {
          current: selectedUpperIsolation.length,
          max: 4,
          required: 4
        },
        isAccessory: true,
        isLocked: true
      },
      {
        id: 'lower_isolation',
        name: 'Lower Isolation',
        icon: Heart,
        exercises: lowerIsolation,
        selectedExercises: selectedLowerIsolation,
        progress: {
          current: selectedLowerIsolation.length,
          max: 4,
          required: 4
        },
        isAccessory: true,
        isLocked: true
      }
    ];
  }, [exercises, selectedExercises]);

  // Check for validation errors and highlight insufficient categories (only from external navigation)
  useEffect(() => {
    if (!isFromExternalNavigation) return;
    
    const mainCategories = categories.filter(c => !c.isAccessory);
    const insufficientCategories = mainCategories
      .filter(c => c.progress.current < c.progress.required)
      .map(c => c.id);
    
    if (insufficientCategories.length > 0) {
      setHighlightedCategories(new Set(insufficientCategories));
      
      // Scroll to first insufficient category
      const firstCategory = insufficientCategories[0];
      const element = document.getElementById(`category-${firstCategory}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Fade highlight after 0.8 seconds
      const timeout = setTimeout(() => {
        setHighlightedCategories(new Set());
      }, 800);
      
      return () => clearTimeout(timeout);
    }
  }, [categories, isFromExternalNavigation]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const addExerciseToCategory = (categoryId: string, exerciseId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || category.isLocked) return;
    
    // Enforce maximum limit - don't add if already at max
    if (category.progress.current >= category.progress.max) return;
    
    setSelectedExercises(prev => new Set([...prev, exerciseId]));
  };

  const removeExerciseFromCategory = (categoryId: string, exerciseId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || category.isLocked) return;
    
    setSelectedExercises(prev => {
      const next = new Set(prev);
      next.delete(exerciseId);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedExercises(new Set(initialSelection));
  };

  const handleSaveActiveExercises = () => {
    if (!setEquals(selectedExercises, initialSelection)) {
      dispatch({ type: 'SET_ACTIVE_EXERCISES', payload: Array.from(selectedExercises) });
    }
  };

  const hasChanged = !setEquals(selectedExercises, initialSelection);
  
  // Validation - allow saving even with requirement errors
  const mainCategories = categories.filter(c => !c.isAccessory);
  const hasRequirementErrors = mainCategories.some(c => c.progress.current < c.progress.required);
  const canSave = hasChanged; // Remove requirement check, allow saving anyway

  const getProgressColor = (category: ExerciseCategory) => {
    if (category.isLocked) return 'bg-gray-400';
    if (category.progress.current < category.progress.required) return 'bg-red-500';
    if (category.progress.current === category.progress.max) return 'bg-green-500';
    return 'bg-indigo-500';
  };

  const getProgressBarColor = (category: ExerciseCategory) => {
    if (category.isLocked) return 'bg-gray-200';
    if (category.progress.current < category.progress.required) return 'bg-red-100';
    return 'bg-indigo-100';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-4">
        {/* Main Movements Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            MAIN MOVEMENTS
          </h2>
          <p className="text-dark-300 text-sm mb-6">
            Select 2-4 heavy compound exercises per category. At least 2 exercises required in each category.
          </p>
          
          <div className="space-y-3">
            {mainCategories.map(category => (
              <div 
                key={category.id}
                id={`category-${category.id}`}
                className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                  highlightedCategories.has(category.id) 
                    ? 'border-red-500 border-2' 
                    : 'border-dark-700'
                }`}
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-3 bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <category.icon className="mr-3 text-indigo-400" size={18} />
                      <h3 className="font-semibold text-white">{category.name}</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Progress indicator */}
                      <div className="flex items-center space-x-2">
                        <div className={`w-16 h-2 ${getProgressBarColor(category)} rounded-full overflow-hidden`}>
                          <div 
                            className={`h-full ${getProgressColor(category)} transition-all duration-300`}
                            style={{ width: `${(category.progress.current / category.progress.max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-dark-300 min-w-[3rem]">
                          {category.progress.current}/{category.progress.max}
                        </span>
                      </div>
                      {/* Validation icon */}
                      {category.progress.current < category.progress.required ? (
                        <AlertCircle className="text-red-500" size={16} />
                      ) : (
                        <Check className="text-green-500" size={16} />
                      )}
                      {/* Expand icon */}
                      {expandedCategories.has(category.id) ? (
                        <ChevronUp className="text-dark-400" size={16} />
                      ) : (
                        <ChevronDown className="text-dark-400" size={16} />
                      )}
                    </div>
                  </div>
                </button>
                
                {expandedCategories.has(category.id) && (
                  <div className="p-4 bg-dark-900 border-t border-dark-700">
                    {/* Selected exercises */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-dark-200 mb-2">Selected:</h4>
                      {category.selectedExercises.length === 0 ? (
                        <p className="text-xs text-dark-400 italic">No exercises selected</p>
                      ) : (
                        <div className="space-y-2">
                          {category.selectedExercises.map(exerciseId => {
                            const exercise = category.exercises.find(ex => ex.exercise_id === exerciseId);
                            if (!exercise) return null;
                            return (
                              <div key={exerciseId} className="flex items-center justify-between bg-dark-800 p-2 rounded">
                                <span className="text-sm text-white">{exercise.name}</span>
                                <button
                                  onClick={() => removeExerciseFromCategory(category.id, exerciseId)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Add exercise dropdown */}
                    {category.progress.current < category.progress.max && (
                      <div>
                        <h4 className="text-sm font-medium text-dark-200 mb-2">Add exercise:</h4>
                        <select
                          className="w-full bg-dark-800 border border-dark-600 rounded p-2 text-sm text-white"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addExerciseToCategory(category.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">Choose an exercise...</option>
                          {category.exercises
                            .filter(ex => !category.selectedExercises.includes(ex.exercise_id))
                            .map(exercise => (
                              <option key={exercise.exercise_id} value={exercise.exercise_id}>
                                {exercise.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Accessories Section */}
        <div>
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center">
            <Heart className="mr-2" size={20} />
            ACCESSORIES
          </h2>
          <p className="text-dark-300 text-sm mb-6">
            Automatically managed for balanced development. Premium feature to customize.
          </p>
          
          <div className="space-y-3">
            {categories.filter(c => c.isAccessory).map(category => (
              <div key={category.id} className="border border-dark-700 rounded-lg overflow-hidden opacity-75">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-3 bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <category.icon className="mr-3 text-green-400" size={18} />
                      <h3 className="font-semibold text-white flex items-center">
                        {category.name}
                        <Lock className="ml-2 text-gray-400" size={14} />
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 w-full" />
                        </div>
                        <span className="text-xs text-dark-300">{category.progress.current}/{category.progress.max}</span>
                      </div>
                      <Check className="text-gray-400" size={16} />
                      {/* Expand icon */}
                      {expandedCategories.has(category.id) ? (
                        <ChevronUp className="text-dark-400" size={16} />
                      ) : (
                        <ChevronDown className="text-dark-400" size={16} />
                      )}
                    </div>
                  </div>
                </button>

                {expandedCategories.has(category.id) && (
                  <div className="p-4 bg-dark-900 border-t border-dark-700">
                    {/* Show selected accessory exercises (read-only) */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-dark-200 mb-2">Selected:</h4>
                      {category.selectedExercises.length === 0 ? (
                        <p className="text-xs text-dark-400 italic">No exercises available in this category</p>
                      ) : (
                        <div className="space-y-2">
                          {category.selectedExercises.map(exerciseId => {
                            const exercise = category.exercises.find(ex => ex.exercise_id === exerciseId);
                            if (!exercise) return null;
                            return (
                              <div key={exerciseId} className="flex items-center justify-between bg-dark-800 p-2 rounded opacity-75">
                                <span className="text-sm text-white">{exercise.name}</span>
                                <Lock className="text-gray-400" size={12} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-dark-400 italic">
                      These exercises are automatically rotated for balanced development. 
                      Unlock premium to customize selection.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="h-24" />
      {hasChanged && (
        <div className="fixed bottom-20 left-0 w-full flex justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md px-4">
            <div className="bg-dark-800 rounded-xl shadow-2xl border border-dark-600 p-4">
              {hasRequirementErrors && (
                <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-sm text-yellow-200 flex items-center">
                  <AlertCircle className="mr-2" size={14} />
                  Note: Some categories have fewer than 2 exercises. Workouts may not be generated until requirements are met.
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  className="flex-1 py-2 px-4 rounded-lg bg-dark-600 hover:bg-dark-500 text-white text-sm transition-colors"
                  onClick={handleClearSelection}
                >
                  Reset
                </button>
                <button
                  className="flex-1 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                  onClick={handleSaveActiveExercises}
                >
                  Save Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 