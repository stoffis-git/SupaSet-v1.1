import React, { useState, useRef, useEffect } from 'react';
import { WorkoutStrategy } from '../../strategies/types';
import { HelpCircle } from 'lucide-react';

interface StrategyBadgeProps {
  strategy: WorkoutStrategy;
  showTooltip?: boolean;
  className?: string;
}

export function StrategyBadge({ strategy, showTooltip = false, className = '' }: StrategyBadgeProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Close tooltip when clicking anywhere outside
  useEffect(() => {
    if (!isTooltipVisible) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsTooltipVisible(false);
      }
    };
    
    // Add listener with a slight delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTooltipVisible]);

  const handleQuestionMarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTooltipVisible(!isTooltipVisible);
  };

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        {strategy.name}
      </span>
      
      {showTooltip && (
        <button
          onClick={handleQuestionMarkClick}
          className="text-dark-400 hover:text-dark-200 transition-colors p-1"
          aria-label="Strategy information"
        >
          <HelpCircle size={16} />
        </button>
      )}
      
      {/* Tooltip */}
      {isTooltipVisible && (
        <div
          ref={tooltipRef}
          className="absolute top-full right-0 mt-2 p-3 bg-dark-800 text-white text-sm rounded-lg shadow-lg border border-dark-600 z-50 max-w-xs"
          style={{ minWidth: '250px' }}
        >
          <div className="font-medium mb-1">{strategy.name}</div>
          <div className="text-dark-300">{strategy.description}</div>
          {/* Arrow pointing up, positioned to the right side */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-dark-800 border-l border-t border-dark-600 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
} 