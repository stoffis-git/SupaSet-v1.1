import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkoutProvider } from './contexts/WorkoutContext';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import WorkoutPage from './pages/WorkoutPage';
import ExercisesPage from './pages/ExercisesPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <Routes>
            {/* Authentication route */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected routes (require authentication) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/workout/:id" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkoutPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/exercises" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExercisesPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            {/* Redirect any other routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;