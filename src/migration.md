# Type Safety Migration Guide

## Overview
This guide outlines the changes made to improve type safety in the workout app. The changes include:
- Converting string literals to enums
- Adding Zod validation schemas
- Implementing type guards
- Updating mock data

## File Changes

### 1. types.ts
- Added enums: `MuscleGroup`, `EquipmentType`, `WorkoutType`
- Added Zod schemas for validation
- Added type guards for runtime checks
- Updated type definitions to use Zod inference

### 2. utils/validation.ts (New)
- Added validation utilities
- Added error handling
- Added local storage validation
- Added user-friendly error messages

### 3. data/exerciseLibraryTest.ts
- Updated mock data to use new enums
- Added required fields for type safety
- Updated exercise properties to match schema

## Migration Steps

### For Components
1. Update imports to use new types:
```typescript
import { Exercise, MuscleGroup, EquipmentType } from '../types';
```

2. Replace string literals with enum values:
```typescript
// Before
const muscleGroup = 'chest';

// After
const muscleGroup = MuscleGroup.CHEST;
```

3. Use type guards when handling unknown data:
```typescript
import { isExercise } from '../types';
import { parseExercise } from '../utils/validation';

// For API responses
if (isExercise(data)) {
  // Safe to use data as Exercise
}

// For parsing with error handling
try {
  const exercise = parseExercise(data);
  // Use exercise
} catch (error) {
  // Handle validation error
}
```

### For State Management
1. Update state types to use new schemas:
```typescript
import { WorkoutState, WorkoutStateSchema } from '../types';
import { validateLocalStorage } from '../utils/validation';

// Load state from localStorage
const savedState = validateLocalStorage('workoutState', WorkoutStateSchema);
```

2. Use type guards for state updates:
```typescript
import { isWorkoutState } from '../types';

function updateState(newState: unknown) {
  if (isWorkoutState(newState)) {
    // Safe to update state
  }
}
```

## Testing
1. Run type checks:
```bash
npm run type-check
```

2. Run validation tests:
```bash
npm test
```

## Rollback Plan
If issues arise:
1. Keep the old types.ts as types.ts.bak
2. Revert to using string literals temporarily
3. Gradually reintroduce type safety changes

## Notes
- All enums are serializable for localStorage
- Validation errors include user-friendly messages
- Type guards provide runtime safety
- Schema validation ensures data integrity

# Migration Guide: Phase 3 - Data Layer Refactor

## Overview
This guide outlines the steps to migrate components to use the new repository-based data layer. The changes maintain the existing state structure while introducing a more maintainable and testable data access pattern.

## Key Changes
1. New Repository Interface
2. Mock and API Implementations
3. Caching Layer
4. Context Integration

## Component Updates

### ExerciseList.tsx
```typescript
// Before
const { state } = useWorkout();
const exercises = state.exerciseLibrary;

// After
const { repository } = useWorkout();
const [exercises, setExercises] = useState<Exercise[]>([]);

useEffect(() => {
  const loadExercises = async () => {
    const data = await repository.getAll();
    setExercises(data);
  };
  loadExercises();
}, [repository]);
```

### WorkoutGenerator.ts
```typescript
// Before
const exercises = state.exerciseLibrary.filter(...);

// After
const { repository } = useWorkout();
const exercises = await repository.getByMuscleGroup([MuscleGroup.CHEST]);
```

## Testing Updates

### Repository Tests
```typescript
describe('MockExerciseRepository', () => {
  let repository: MockExerciseRepository;

  beforeEach(() => {
    repository = new MockExerciseRepository();
  });

  it('should return all exercises', async () => {
    const exercises = await repository.getAll();
    expect(exercises).toBeDefined();
    expect(Array.isArray(exercises)).toBe(true);
  });
});
```

### Cache Tests
```typescript
describe('CachedRepository', () => {
  let mockRepo: MockExerciseRepository;
  let cachedRepo: CachedRepository;

  beforeEach(() => {
    mockRepo = new MockExerciseRepository();
    cachedRepo = new CachedRepository(mockRepo);
  });

  it('should cache results', async () => {
    const first = await cachedRepo.getAll();
    const second = await cachedRepo.getAll();
    expect(first).toBe(second); // Same reference
  });
});
```

## Error Handling
- All repository methods now return Promises
- API methods include proper error handling
- Zod validation ensures type safety

## Performance Considerations
- Cache TTL is configurable (default: 5 minutes)
- Cache can be cleared manually if needed
- API calls are batched where possible

## Next Steps
1. Update components to use async/await
2. Add loading states
3. Implement error boundaries
4. Add retry logic for API calls

## Rollback Plan
If issues arise:
1. Revert to using state.exerciseLibrary directly
2. Keep repository interface for future use
3. Gradually migrate components back 