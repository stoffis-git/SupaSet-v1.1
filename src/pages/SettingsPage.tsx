import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { Moon, Sun, Timer, Save, Trash, User, DollarSign } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const SettingsPage: React.FC = () => {
  const { state, toggleDarkMode, setRestTimer } = useAppContext();
  const [name, setName] = useState(state.userSettings.name || '');
  const [timer, setTimer] = useState(state.userSettings.restTimer || 90);
  
  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimer(Number(e.target.value));
  };
  
  const handleSaveTimer = () => {
    setRestTimer(timer);
  };
  
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your workout data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>
      
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center">
              <User size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" />
              Profile
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <Save size={16} className="mr-1" />
              Save Profile
            </Button>
          </div>
        </div>
        
        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center">
              <Moon size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" />
              Appearance
            </h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                  state.userSettings.darkMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block w-5 h-5 transform rounded-full bg-white transition-transform ${
                    state.userSettings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  {state.userSettings.darkMode ? (
                    <Moon size={12} className="text-indigo-600 m-1.5" />
                  ) : (
                    <Sun size={12} className="text-yellow-500 m-1.5" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Rest Timer Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center">
              <Timer size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" />
              Rest Timer
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="timer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rest Time (seconds)
              </label>
              <input
                type="number"
                id="timer"
                min="5"
                max="300"
                step="5"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 py-2 px-3"
                value={timer}
                onChange={handleTimerChange}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTimer(60)}
              >
                60s
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTimer(90)}
              >
                90s
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTimer(120)}
              >
                120s
              </Button>
            </div>
            
            <Button 
              size="sm" 
              className="flex items-center"
              onClick={handleSaveTimer}
            >
              <Save size={16} className="mr-1" />
              Save Timer
            </Button>
          </div>
        </div>
        
        {/* Premium Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md overflow-hidden text-white">
          <div className="p-5">
            <div className="flex items-center mb-3">
              <DollarSign size={24} className="mr-2" />
              <h2 className="text-lg font-bold">Upgrade to Premium</h2>
            </div>
            <p className="mb-4 text-indigo-100">
              Unlock advanced features, detailed analytics, and more workout types.
            </p>
            <Button 
              variant="primary"
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Coming Soon
            </Button>
          </div>
        </div>
        
        {/* Data Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-red-500 dark:text-red-400 flex items-center">
              <Trash size={18} className="mr-2" />
              Data Management
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Warning: Clearing your data will remove all workouts and settings. This action cannot be undone.
            </p>
            <Button 
              variant="outline" 
              className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleClearData}
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;