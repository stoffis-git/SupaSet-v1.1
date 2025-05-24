import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardBody, Button, StrategyBadge } from '../components/ui';
import { Plus, Dumbbell, Target } from 'lucide-react';
// import { useApp } from '../contexts/AppContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { Workout, WorkoutType, MuscleGroup, Exercise, WorkoutSubType } from '../types';
import WorkoutPreview from '../components/WorkoutPreview';

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  // const { state, dispatch } = useApp();
  const { state, generateWorkout: generateWorkoutPlan, currentStrategy, canGenerateWorkoutType, getConsecutiveWorkoutMessage } = useWorkout();
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);
  const [historyCount, setHistoryCount] = useState(5);
  const historyRef = useRef<HTMLDivElement>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [newWorkoutDisabled, setNewWorkoutDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);

  // Debounce logic: re-enable after 300ms if activeExercises changes
  useEffect(() => {
    setNewWorkoutDisabled(true);
    const timeout = setTimeout(() => setNewWorkoutDisabled(false), 300);
    return () => clearTimeout(timeout);
  }, [state.activeExercises]);

  const sortedWorkouts = Object.values(state.workouts)
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Infinite scroll: load more when scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!historyRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = historyRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHistoryCount(count => Math.min(count + 10, sortedWorkouts.length));
      }
    };
    const ref = historyRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => { if (ref) ref.removeEventListener('scroll', handleScroll); };
  }, [sortedWorkouts.length]);

  useEffect(() => {
    if (error) {
      setErrorVisible(true);
      const timeout = setTimeout(() => setErrorVisible(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const validateExerciseSelection = (workoutSubType: WorkoutSubType): { valid: boolean; message?: string } => {
    if (!state.activeExercises || state.activeExercises.length === 0) {
      return { valid: false, message: 'No active exercises selected. Please select at least one exercise in the Exercises tab.' };
    }

    // Filter compound movements for validation (matching ExerciseList logic)
    const filterCompoundMovements = (categoryExercises: Exercise[]): Exercise[] => {
      return categoryExercises.filter(exercise => {
        const tags = exercise.tags || [];
        const name = exercise.name.toLowerCase();
        
        // Exclude isolation exercises
        if (tags.includes('isolation')) return false;
        
        // Exclude common isolation exercise names
        const isolationKeywords = [
          'lateral raise', 'front raise', 'rear delt', 'pec dec', 'pec fly',
          'bicep curl', 'tricep extension', 'leg curl', 'leg extension',
          'calf raise', 'shrug', 'wrist curl', 'neck'
        ];
        
        if (isolationKeywords.some(keyword => name.includes(keyword))) return false;
        
        // Include compound movements
        if (tags.includes('compound')) return true;
        if (exercise.muscle_groups && exercise.muscle_groups.length >= 2) return true;
        
        const compoundKeywords = [
          'squat', 'deadlift', 'press', 'pull-up', 'pullup', 'chin-up', 'chinup',
          'row', 'lunge', 'thrust', 'clean', 'snatch', 'jerk', 'dip'
        ];
        
        if (compoundKeywords.some(keyword => name.includes(keyword))) return true;
        
        return false;
      });
    };

    // Get available exercises and validate based on workout type
    const availableExercises = state.exerciseLibrary.filter(ex => 
      state.activeExercises.includes(ex.exercise_id)
    );
    
    let requiredCategories: { name: string; label: string }[];
    
    switch (workoutSubType) {
      case 'upper_body':
        requiredCategories = [
          { name: 'upper_body_push', label: 'Upper Body Push' },
          { name: 'upper_body_pull', label: 'Upper Body Pull' }
        ];
        break;
      case 'lower_body':
        requiredCategories = [
          { name: 'knee_dominant', label: 'Knee Dominant' },
          { name: 'hip_dominant', label: 'Hip Dominant' }
        ];
        break;
      default: // full_body
        requiredCategories = [
          { name: 'knee_dominant', label: 'Knee Dominant' },
          { name: 'hip_dominant', label: 'Hip Dominant' },
          { name: 'upper_body_push', label: 'Upper Body Push' },
          { name: 'upper_body_pull', label: 'Upper Body Pull' }
        ];
    }
    
    const missingCategories = requiredCategories.filter(category => {
      const categoryExercises = availableExercises.filter(ex => 
        ex.categories?.includes(category.name)
      );
      const compoundExercises = filterCompoundMovements(categoryExercises);
      return compoundExercises.length < 2; // Requiring 2 exercises minimum
    });
    
    if (missingCategories.length > 0) {
      return { 
        valid: false, 
        message: `Need at least 2 compound exercises for: ${missingCategories.map(c => c.label).join(', ')}. Please add more exercises in the Exercises tab.` 
      };
    }

    return { valid: true };
  };

  const handleNewWorkout = async (workoutSubType: WorkoutSubType) => {
    // Check consecutive workout type limit
    if (!canGenerateWorkoutType(workoutSubType)) {
      const message = getConsecutiveWorkoutMessage(workoutSubType) || 'Cannot generate this workout type right now.';
      setError(message);
      return;
    }

    // Validate exercise selection
    const validation = validateExerciseSelection(workoutSubType);
    if (!validation.valid) {
      // Navigate to exercise selection with validation state
      navigate('/exercises', { state: { fromValidation: true } });
      return;
    }
    
    if (newWorkoutDisabled) return;
    setError(null);
    
    try {
      let targetMuscleGroups: MuscleGroup[];
      
      switch (workoutSubType) {
        case 'upper_body':
          targetMuscleGroups = [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.ARMS];
          break;
        case 'lower_body':
          targetMuscleGroups = [MuscleGroup.LEGS, MuscleGroup.CORE];
          break;
        default:
          targetMuscleGroups = [MuscleGroup.LEGS, MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.SHOULDERS];
      }

      const workoutPlan = await generateWorkoutPlan({
        type: WorkoutType.STRENGTH,
        targetMuscleGroups: targetMuscleGroups,
        workoutSubType: workoutSubType
      });
      
      // Convert WorkoutPlan to Workout format for preview
      const newWorkout: Workout = {
        id: `workout-${Date.now()}`,
        workout_id: `workout-${Date.now()}`,
        date: new Date().toISOString(),
        type: workoutPlan.type,
        workoutSubType: workoutSubType,
        exercises: workoutPlan.exercises.map(exercise => {
          // Find progression data for this exercise
          const progression = workoutPlan.progressionData?.find(p => p.exerciseId === exercise.exercise_id);
          
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
        completed: false,
        // Include exercise metadata for grouping
        exerciseMetadata: workoutPlan.exerciseMetadata
      };
      
      setPreviewWorkout(newWorkout);
    } catch (error) {
      console.error('Error generating workout:', error);
      setError('Failed to generate workout. Please try again.');
    }
  };

  const handleStartWorkout = () => {
    if (previewWorkout) {
      navigate(`/workout/${previewWorkout.id}`, { state: { workout: previewWorkout } });
    }
  };

  const handleClosePreview = () => {
    setPreviewWorkout(null);
  };

  // Check if workout types are disabled due to consecutive limit
  const isUpperBodyDisabled = !canGenerateWorkoutType('upper_body');
  const isLowerBodyDisabled = !canGenerateWorkoutType('lower_body');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">
            Supaset
          </h1>
        </div>
        {/* Strategy Badge with Tooltip - Upper Right */}
        <div>
          <StrategyBadge strategy={currentStrategy} showTooltip={true} />
        </div>
      </div>

      {/* New Workout Tiles */}
      <div className="space-y-4">
        {/* Full Body Workout Tile */}
        <Card 
          className={`cursor-pointer hover:border-indigo-500 transition-colors ${(!state.activeExercises || state.activeExercises.length === 0 || newWorkoutDisabled) ? 'opacity-50' : ''}`}
          onClick={() => handleNewWorkout('full_body')}
        >
          <CardBody>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Plus size={32} className="mx-auto mb-2 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">New Workout</h2>
                <p className="text-dark-400">Full Body</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Upper Body and Lower Body Tiles */}
        <div className="grid grid-cols-2 gap-4">
          {/* Upper Body Tile */}
          <div className="relative">
            <Card 
              className={`cursor-pointer hover:border-indigo-500 transition-colors ${
                isUpperBodyDisabled || (!state.activeExercises || state.activeExercises.length === 0 || newWorkoutDisabled) ? 'opacity-50' : ''
              }`}
              onClick={isUpperBodyDisabled ? undefined : () => handleNewWorkout('upper_body')}
            >
              <CardBody>
                <div className="flex items-center justify-center h-24">
                  <div className="text-center">
                    <Dumbbell size={24} className="mx-auto mb-2 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Upper Body</h3>
                  </div>
                </div>
              </CardBody>
            </Card>
            {isUpperBodyDisabled && getConsecutiveWorkoutMessage('upper_body') && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-dark-700 text-dark-200 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {getConsecutiveWorkoutMessage('upper_body')}
              </div>
            )}
          </div>

          {/* Lower Body Tile */}
          <div className="relative">
            <Card 
              className={`cursor-pointer hover:border-indigo-500 transition-colors ${
                isLowerBodyDisabled || (!state.activeExercises || state.activeExercises.length === 0 || newWorkoutDisabled) ? 'opacity-50' : ''
              }`}
              onClick={isLowerBodyDisabled ? undefined : () => handleNewWorkout('lower_body')}
            >
              <CardBody>
                <div className="flex items-center justify-center h-24">
                  <div className="text-center">
                    <Target size={24} className="mx-auto mb-2 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Lower Body</h3>
                  </div>
                </div>
              </CardBody>
            </Card>
            {isLowerBodyDisabled && getConsecutiveWorkoutMessage('lower_body') && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-dark-700 text-dark-200 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {getConsecutiveWorkoutMessage('lower_body')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workout History Section */}
      <div>
        <h2 className="text-lg font-bold mb-2 text-dark-200">History</h2>
        <div
          ref={historyRef}
          className="max-h-96 overflow-y-auto space-y-2 pr-1"
          style={{ minHeight: 120 }}
        >
          {sortedWorkouts.slice(0, historyCount).map(workout => {
            const exerciseNames = workout.exercises.map(ex => ex.exercise.name);
            const shownNames = exerciseNames.slice(0, 3).join(', ');
            const more = exerciseNames.length > 3 ? '…' : '';
            const workoutLabel = workout.workoutSubType ? 
              workout.workoutSubType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
              'Workout';
            return (
              <button
                key={workout.id}
                className="w-full text-left focus:outline-none"
                onClick={() => setSelectedWorkout(workout)}
              >
                <Card className="w-full p-0">
                  <CardBody className="flex flex-col py-2 px-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-indigo-300">
                        {formatDateTime(workout.date)}
                      </span>
                      <span className="text-xs text-dark-500 bg-dark-700 px-2 py-1 rounded">
                        {workoutLabel}
                      </span>
                    </div>
                    <span className="text-xs text-dark-400 mt-1">
                      {shownNames}{more && `, ${more}`}
                    </span>
                  </CardBody>
                </Card>
              </button>
            );
          })}
          {sortedWorkouts.length === 0 && (
            <div className="text-dark-400 text-sm text-center py-6">No workouts yet.</div>
          )}
        </div>
      </div>

      {/* Workout Details Overlay */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-dark-900/90 z-50 flex items-center justify-center px-2 py-4 sm:p-4">
          <div className="bg-dark-800 rounded-lg p-4 max-w-lg w-full shadow-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-indigo-300">{formatDateTime(selectedWorkout.date)}</h2>
              <Button variant="secondary" size="sm" onClick={() => setSelectedWorkout(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-4">
              {selectedWorkout.exercises.map((ex, idx) => (
                <div key={ex.exercise.exercise_id} className="">
                  <div className="font-semibold text-sm text-white mb-1">
                    {idx + 1}. {ex.exercise.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ex.sets.map((set, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-dark-700 text-dark-200 rounded px-2 py-1 text-xs"
                      >
                        {set.weight} × {set.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout Preview Overlay */}
      {previewWorkout && (
        <div className="fixed inset-0 bg-dark-900/90 z-50 flex justify-center items-start px-2 py-4 sm:p-4">
          <div className="bg-dark-800 rounded-lg mt-4 sm:mt-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <WorkoutPreview
              workout={previewWorkout}
              onBack={handleClosePreview}
              isPreview={true}
              onStart={handleStartWorkout}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
            errorVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {error}
        </div>
      )}
    </div>
  );
}