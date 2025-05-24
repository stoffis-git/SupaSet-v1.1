# Progression System - Modular Architecture

## Overview

The progression system is a modular, optional feature that can be layered on top of any workout strategy. It provides two main functionalities:

1. **Memory Mode (Free)**: Recalls your last performance without progression suggestions
2. **Progression Mode (Premium)**: Intelligent progression algorithms for strength development

## Architecture

### Core Components

```
progression/
├── types.ts              # Core interfaces and types
├── ProgressionService.ts # Main service orchestrator
├── rules/
│   ├── MemoryRule.ts     # Recalls last performance (free)
│   └── LinearProgressionRule.ts # Linear progression (premium)
└── index.ts              # Module exports
```

### Integration Points

1. **Strategy Integration**: Strategies optionally receive a `ProgressionService`
2. **Workout Generation**: Uses progression data for prefills
3. **UI Components**: Shows progression notes and suggestions

## Usage Examples

### 1. Memory Mode (Default - Free)

```typescript
// User's last workout: Squat 100kg × 8 reps × 3 sets
// Next workout generates with:
const recommendation = {
  weight: 100,      // Same as last time
  reps: 8,          // Same as last time  
  sets: 3,          // Same number of sets
  notes: "Last time: 100kg × 8 reps × 3 sets"
}
```

### 2. Linear Progression (Premium)

```typescript
// User completed all sets last time
// Next workout suggests:
const recommendation = {
  weight: 102.5,    // +2.5kg progression
  reps: 8,          // Same rep range
  sets: 3,          // Same sets
  notes: "Previous weight completed successfully. Increase by 2.5kg."
}
```

## User Experience

### For Cruise Mode Users (Free)

1. **First Workout**: Empty fields, user enters preferred weights/reps
2. **Subsequent Workouts**: Fields pre-filled with last performance
3. **UI Note**: "💡 Last time: 100kg × 8 reps × 3 sets"
4. **No Pressure**: User can modify weights as desired

### For Premium Users

1. **Smart Suggestions**: Automatic progression based on performance
2. **Multiple Algorithms**: Linear, DUP, Block Periodization (future)
3. **Confidence Levels**: Algorithm confidence in recommendations
4. **Analytics**: Track progression effectiveness

## Benefits

### Product Strategy
- **Clean Cruise Mode**: No complexity, just habit formation
- **Premium Value**: Advanced progression for serious users
- **Modular**: Easy to enable/disable features

### Technical Benefits
- **Separation of Concerns**: Progression logic separate from workout generation
- **Testability**: Each component can be tested independently
- **Maintainability**: Changes don't affect core strategies
- **Extensibility**: Easy to add new progression algorithms

## Future Extensions

### New Progression Rules
```typescript
// Planned progression algorithms
export class DUPProgressionRule implements ProgressionRule {
  // Daily Undulating Periodization
}

export class BlockPeriodizationRule implements ProgressionRule {
  // Block-based training progression
}
```

### Enhanced Analytics
- Progression effectiveness tracking
- Auto-suggestion of optimal progression plan
- Volume/intensity analytics

### User Preferences
- Custom progression increments
- RPE-based progression
- Injury management modes

## Configuration

### Enable/Disable Progression
```typescript
// In WorkoutContext
const [isProgressionEnabled, setIsProgressionEnabled] = useState(true);
```

### Switch Progression Plans
```typescript
// Free users: Memory only
// Premium users: Multiple options
progressionService.setActivePlan('advanced_linear');
```

This modular approach ensures that Cruise Mode remains simple and focused while providing a clear upgrade path for users who want more sophisticated progression features. 