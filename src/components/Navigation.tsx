import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center py-3 px-6 ${
              isActive('/') 
                ? 'text-indigo-400' 
                : 'text-dark-300 hover:text-indigo-400'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link
            to="/exercises"
            className={`flex flex-col items-center py-3 px-6 ${
              isActive('/exercises') 
                ? 'text-indigo-400' 
                : 'text-dark-300 hover:text-indigo-400'
            }`}
          >
            <Dumbbell size={24} />
            <span className="text-xs mt-1">Exercises</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 