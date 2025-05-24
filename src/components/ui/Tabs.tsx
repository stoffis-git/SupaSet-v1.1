import React, { useState } from 'react';

interface Tab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
  variant?: 'underline' | 'pills';
}

const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultTabId,
  className = '',
  variant = 'underline',
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);
  
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  
  const tabStyles = {
    underline: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: 'inline-block py-3 px-4 border-b-2 -mb-px',
      active: 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-medium',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
    },
    pills: {
      container: 'flex space-x-2',
      tab: 'px-4 py-2 rounded-lg',
      active: 'bg-indigo-600 text-white font-medium',
      inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    }
  };
  
  const styles = tabStyles[variant];
  
  return (
    <div className={className}>
      <div className={`flex ${styles.container}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`${styles.tab} transition-colors ${
              tab.id === activeTabId ? styles.active : styles.inactive
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {activeTab?.content}
      </div>
    </div>
  );
};

export default Tabs;