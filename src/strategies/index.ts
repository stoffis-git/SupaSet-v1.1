export * from './types';
export * from './CruiseModeStrategy';
export * from './StrengthStrategy';
export * from './EnduranceStrategy';

import { CruiseModeStrategy } from './CruiseModeStrategy';
import { StrengthStrategy } from './StrengthStrategy';
import { EnduranceStrategy } from './EnduranceStrategy';
import { WorkoutStrategy } from './types';

export const strategies: Record<string, WorkoutStrategy> = {
  cruiseMode: new CruiseModeStrategy(),
  strength: new StrengthStrategy(),
  endurance: new EnduranceStrategy()
}; 