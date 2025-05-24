import React from 'react';
import { useWorkout } from '../../contexts/WorkoutContext';

interface ProgressionSettingsProps {
  className?: string;
}

export function ProgressionSettings({ className = '' }: ProgressionSettingsProps) {
  const { 
    progressionService, 
    isProgressionEnabled, 
    toggleProgression 
  } = useWorkout();

  const availablePlans = progressionService?.getAvailablePlans() || [];
  const activePlan = progressionService?.getActivePlan();
  const isPremiumUser = progressionService?.isPremiumUser() || false;

  const handlePlanChange = (planId: string) => {
    progressionService?.setActivePlan(planId);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold mb-4">Progression Settings</h2>
        
        {/* Enable/Disable Progression */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Smart Progression</h3>
            <p className="text-sm text-gray-600">
              Automatically suggest weights and reps based on your workout history
            </p>
          </div>
          <button
            onClick={toggleProgression}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isProgressionEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isProgressionEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Progression Plans */}
        {isProgressionEnabled && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Available Progression Plans</h3>
              <div className="space-y-2">
                {availablePlans.map(plan => (
                  <div
                    key={plan.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      activePlan?.id === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {plan.name}
                          {plan.isPremium && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Premium
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                      {activePlan?.id === plan.id && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Upgrade Banner */}
            {!isPremiumUser && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Unlock Advanced Progression</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Get access to advanced progression algorithms, periodization plans, and detailed analytics.
                </p>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        )}

        {/* Current Plan Details */}
        {isProgressionEnabled && activePlan && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Plan Details</h4>
            <div className="text-sm text-gray-600">
              <p><strong>Plan:</strong> {activePlan.name}</p>
              <p><strong>Rules:</strong> {activePlan.rules.length} progression rule(s)</p>
              <p><strong>Type:</strong> {activePlan.isPremium ? 'Premium' : 'Free'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 