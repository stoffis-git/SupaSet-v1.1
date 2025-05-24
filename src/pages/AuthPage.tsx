import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        // Use Supabase's built-in signInWithPassword
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        // Use Supabase's built-in signUp
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      // Use Supabase's built-in OAuth with Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      // Use Supabase's built-in OAuth with GitHub
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-400 mb-2">SupaSet</h1>
          <p className="text-dark-300">Your smart workout companion</p>
        </div>

        {/* Auth Form */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:border-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:border-indigo-400"
                required
              />
            </div>

            {message && (
              <div className={`text-sm p-3 rounded ${message.includes('Check your email') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white py-2 px-4 rounded-md font-medium"
            >
              {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          {/* Social Login Section */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-800 text-dark-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-2 border border-dark-600 rounded-md bg-dark-700 text-white hover:bg-dark-600"
              >
                <span className="mr-2">🔵</span>
                Continue with Google
              </button>

              <button
                onClick={handleGitHubSignIn}
                className="w-full flex items-center justify-center px-4 py-2 border border-dark-600 rounded-md bg-dark-700 text-white hover:bg-dark-600"
              >
                <span className="mr-2">⚫</span>
                Continue with GitHub
              </button>
            </div>
          </div>

          {/* Toggle Login/Signup */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-dark-800/50 rounded-lg text-sm text-dark-300 text-center">
          <p className="mb-2">By creating an account, you'll be able to:</p>
          <div className="text-xs space-y-1">
            <p>✓ Sync your workouts across devices</p>
            <p>✓ Track your progress over time</p>
            <p>✓ Access advanced features</p>
          </div>
        </div>
      </div>
    </div>
  )
} 