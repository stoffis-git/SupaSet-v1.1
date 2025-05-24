import React from 'react';
import Navigation from '../components/Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  onHomeClick?: () => void;
}

export default function AppLayout({ children, onHomeClick }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-900 pb-16">
      <div className="w-full max-w-lg mx-auto px-2 py-4 sm:px-4 sm:py-6">
        {children}
      </div>
      <Navigation />
    </div>
  );
}