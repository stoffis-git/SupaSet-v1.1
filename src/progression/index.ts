// Main service
export { ProgressionService } from './ProgressionService';

// Types
export type {
  ProgressionService as IProgressionService,
  ProgressionRule,
  ProgressionRecommendation,
  ProgressionPlan,
  ExerciseHistory,
  SessionData
} from './types';

// Built-in progression rules
export { LinearProgressionRule } from './rules/LinearProgressionRule';
export { MemoryRule } from './rules/MemoryRule'; 