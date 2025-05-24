import { Exercise, MuscleGroup, EquipmentType } from '../types';

export const TEST_EXERCISES: Exercise[] = [
  // KNEE_DOMINANT exercises (3 total)
  {
    exercise_id: '2',
    name: 'Squat',
    description: 'Lower body compound movement',
    category: 'legs',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.LEGS],
    movement_type: 'compound',
    categories: ['legs', 'compound', 'knee_dominant'],
    tags: ['strength', 'power']
  },
  {
    exercise_id: '6',
    name: 'Front Squat',
    description: 'Knee-dominant squat variation',
    category: 'legs',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.LEGS],
    movement_type: 'compound',
    categories: ['legs', 'compound', 'knee_dominant'],
    tags: ['strength', 'power', 'front-loaded']
  },
  {
    exercise_id: '7',
    name: 'Goblet Squat',
    description: 'Knee-dominant squat with dumbbell',
    category: 'legs',
    equipment: [EquipmentType.DUMBBELL],
    muscle_groups: [MuscleGroup.LEGS],
    movement_type: 'compound',
    categories: ['legs', 'compound', 'knee_dominant'],
    tags: ['strength', 'beginner-friendly']
  },
  
  // HIP_DOMINANT exercises (3 total)
  {
    exercise_id: '5',
    name: 'Deadlift',
    description: 'Full body pulling movement',
    category: 'back',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.BACK, MuscleGroup.LEGS],
    movement_type: 'pull',
    categories: ['back', 'legs', 'compound', 'hip_dominant'],
    tags: ['strength', 'power']
  },
  {
    exercise_id: '8',
    name: 'Romanian Deadlift',
    description: 'Hip-dominant deadlift variation',
    category: 'back',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.BACK, MuscleGroup.LEGS],
    movement_type: 'pull',
    categories: ['back', 'legs', 'compound', 'hip_dominant'],
    tags: ['strength', 'hamstring-focus']
  },
  {
    exercise_id: '9',
    name: 'Hip Thrust',
    description: 'Hip-dominant glute exercise',
    category: 'glutes',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.LEGS],
    movement_type: 'compound',
    categories: ['legs', 'compound', 'hip_dominant'],
    tags: ['strength', 'glute-focus']
  },
  
  // UPPER_BODY_PUSH exercises (3 total)
  {
    exercise_id: '1',
    name: 'Bench Press',
    description: 'Classic chest exercise',
    category: 'chest',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.CHEST],
    movement_type: 'push',
    categories: ['chest', 'compound', 'upper_body_push'],
    tags: ['strength', 'power']
  },
  {
    exercise_id: '4',
    name: 'Overhead Press',
    description: 'Shoulder pressing movement',
    category: 'shoulders',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.SHOULDERS],
    movement_type: 'push',
    categories: ['shoulders', 'compound', 'upper_body_push'],
    tags: ['strength', 'power']
  },
  {
    exercise_id: '11',
    name: 'Push-up',
    description: 'Bodyweight chest exercise',
    category: 'chest',
    equipment: [EquipmentType.BODYWEIGHT],
    muscle_groups: [MuscleGroup.CHEST],
    movement_type: 'push',
    categories: ['chest', 'compound', 'upper_body_push'],
    tags: ['bodyweight', 'beginner-friendly']
  },
  
  // UPPER_BODY_PULL exercises (3 total)
  {
    exercise_id: '3',
    name: 'Pull-up',
    description: 'Upper body pulling exercise',
    category: 'back',
    equipment: [EquipmentType.BODYWEIGHT],
    muscle_groups: [MuscleGroup.BACK],
    movement_type: 'pull',
    categories: ['back', 'compound', 'upper_body_pull'],
    tags: ['strength', 'bodyweight']
  },
  {
    exercise_id: '12',
    name: 'Barbell Row',
    description: 'Horizontal pulling movement',
    category: 'back',
    equipment: [EquipmentType.BARBELL],
    muscle_groups: [MuscleGroup.BACK],
    movement_type: 'pull',
    categories: ['back', 'compound', 'upper_body_pull'],
    tags: ['strength', 'horizontal-pull']
  },
  {
    exercise_id: '13',
    name: 'Lat Pulldown',
    description: 'Vertical pulling movement',
    category: 'back',
    equipment: [EquipmentType.MACHINE],
    muscle_groups: [MuscleGroup.BACK],
    movement_type: 'pull',
    categories: ['back', 'compound', 'upper_body_pull'],
    tags: ['strength', 'vertical-pull']
  }
];

// Define eligibleExercises based on your application's logic
const eligibleExercises: Exercise[] = TEST_EXERCISES;

const categoryMap: Record<string, Exercise[]> = {};

// Populate the category map with eligible exercises
eligibleExercises.forEach((ex: Exercise) => {
  if (ex.categories) {
    ex.categories.forEach((cat: string) => {
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(ex);
    });
  }
});

console.log("Category Map:", categoryMap);
console.log("Exercise distribution by strategy categories:");
console.log("knee_dominant:", categoryMap['knee_dominant']?.length || 0);
console.log("hip_dominant:", categoryMap['hip_dominant']?.length || 0);  
console.log("upper_body_push:", categoryMap['upper_body_push']?.length || 0);
console.log("upper_body_pull:", categoryMap['upper_body_pull']?.length || 0); 