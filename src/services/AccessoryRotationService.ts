import { Exercise } from '../types';

interface AccessoryRotationState {
  coreIndex: number;
  upperIndex: number;
  upperTypeIndex: number; // 0: biceps, 1: triceps, 2: shoulder
  lowerIndex: number;
  lowerTypeIndex: number; // 0: hamstring, 1: quadriceps, 2: calves
}

interface AccessoryCategories {
  core: Exercise[];
  upper: {
    biceps: Exercise[];
    triceps: Exercise[];
    shoulder: Exercise[];
  };
  lower: {
    hamstring: Exercise[];
    quadriceps: Exercise[];
    calves: Exercise[];
  };
}

export class AccessoryRotationService {
  private storageKey = 'accessoryRotationState';

  private getRotationState(): AccessoryRotationState {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      coreIndex: 0,
      upperIndex: 0,
      upperTypeIndex: 0,
      lowerIndex: 0,
      lowerTypeIndex: 0
    };
  }

  private saveRotationState(state: AccessoryRotationState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private categorizeAccessoryExercises(exercises: Exercise[]): AccessoryCategories {
    const categories: AccessoryCategories = {
      core: [],
      upper: {
        biceps: [],
        triceps: [],
        shoulder: []
      },
      lower: {
        hamstring: [],
        quadriceps: [],
        calves: []
      }
    };

    exercises.forEach(exercise => {
      const tags = exercise.tags || [];
      
      // Core exercises
      if (tags.includes('core')) {
        categories.core.push(exercise);
      }
      
      // Upper body isolation exercises
      if (tags.includes('isolation') && tags.includes('upper_body')) {
        if (tags.includes('biceps') || exercise.name.toLowerCase().includes('bicep') || exercise.name.toLowerCase().includes('curl')) {
          categories.upper.biceps.push(exercise);
        } else if (tags.includes('triceps') || exercise.name.toLowerCase().includes('tricep')) {
          categories.upper.triceps.push(exercise);
        } else if (tags.includes('shoulder') || exercise.name.toLowerCase().includes('shoulder') || 
                   exercise.name.toLowerCase().includes('lateral') || exercise.name.toLowerCase().includes('front')) {
          categories.upper.shoulder.push(exercise);
        }
      }
      
      // Lower body isolation exercises
      if (tags.includes('isolation') && tags.includes('lower_body')) {
        if (tags.includes('hamstring') || exercise.name.toLowerCase().includes('hamstring') || 
            exercise.name.toLowerCase().includes('leg curl')) {
          categories.lower.hamstring.push(exercise);
        } else if (tags.includes('quadriceps') || exercise.name.toLowerCase().includes('quad') || 
                   exercise.name.toLowerCase().includes('leg extension')) {
          categories.lower.quadriceps.push(exercise);
        } else if (tags.includes('calves') || exercise.name.toLowerCase().includes('calf')) {
          categories.lower.calves.push(exercise);
        }
      }
    });

    return categories;
  }

  public selectAccessoryExercises(activeExercises: Exercise[]): Exercise[] {
    const categories = this.categorizeAccessoryExercises(activeExercises);
    const state = this.getRotationState();
    const selectedAccessories: Exercise[] = [];

    // Select core exercise
    if (categories.core.length > 0) {
      const coreExercise = categories.core[state.coreIndex % categories.core.length];
      selectedAccessories.push(coreExercise);
    }

    // Select upper body isolation exercise (rotate through muscle groups)
    const upperTypes = ['biceps', 'triceps', 'shoulder'] as const;
    const currentUpperType = upperTypes[state.upperTypeIndex % upperTypes.length];
    const upperExercises = categories.upper[currentUpperType];
    
    if (upperExercises.length > 0) {
      const upperExercise = upperExercises[state.upperIndex % upperExercises.length];
      selectedAccessories.push(upperExercise);
    }

    // Select lower body isolation exercise (rotate through muscle groups)
    const lowerTypes = ['hamstring', 'quadriceps', 'calves'] as const;
    const currentLowerType = lowerTypes[state.lowerTypeIndex % lowerTypes.length];
    const lowerExercises = categories.lower[currentLowerType];
    
    if (lowerExercises.length > 0) {
      const lowerExercise = lowerExercises[state.lowerIndex % lowerExercises.length];
      selectedAccessories.push(lowerExercise);
    }

    // Update rotation state for next time
    const newState: AccessoryRotationState = {
      coreIndex: (state.coreIndex + 1) % Math.max(1, categories.core.length),
      upperIndex: (state.upperIndex + 1) % Math.max(1, upperExercises.length),
      upperTypeIndex: (state.upperTypeIndex + 1) % upperTypes.length,
      lowerIndex: (state.lowerIndex + 1) % Math.max(1, lowerExercises.length),
      lowerTypeIndex: (state.lowerTypeIndex + 1) % lowerTypes.length
    };

    this.saveRotationState(newState);
    return selectedAccessories;
  }

  // Helper method to get the current accessory type for display
  public getCurrentAccessoryTypes(): { upper: string; lower: string } {
    const state = this.getRotationState();
    const upperTypes = ['Biceps', 'Triceps', 'Shoulder'];
    const lowerTypes = ['Hamstring', 'Quadriceps', 'Calves'];
    
    return {
      upper: upperTypes[state.upperTypeIndex % upperTypes.length],
      lower: lowerTypes[state.lowerTypeIndex % lowerTypes.length]
    };
  }
} 