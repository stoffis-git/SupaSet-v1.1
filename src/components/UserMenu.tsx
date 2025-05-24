import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, LogOut, Settings, Download, Upload } from 'lucide-react'
import Button from './ui/Button'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showDataOptions, setShowDataOptions] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-700 transition-colors"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <span className="text-white text-sm font-medium hidden sm:block">
          {user.email?.split('@')[0]}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-dark-600">
              <p className="text-white font-medium">{user.email}</p>
              <p className="text-dark-400 text-sm">Logged in</p>
            </div>

            <div className="p-2">
              {/* Data Management */}
              <button
                onClick={() => setShowDataOptions(!showDataOptions)}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-dark-700 rounded-md transition-colors"
              >
                <Download size={16} className="text-dark-400" />
                <span className="text-white text-sm">Data Management</span>
              </button>

              {showDataOptions && (
                <div className="ml-6 mt-2 space-y-1">
                  <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-dark-700 rounded-md transition-colors text-sm">
                    <Download size={14} className="text-dark-400" />
                    <span className="text-dark-300">Export Data</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-dark-700 rounded-md transition-colors text-sm">
                    <Upload size={14} className="text-dark-400" />
                    <span className="text-dark-300">Import Data</span>
                  </button>
                </div>
              )}

              {/* Settings */}
              <button className="w-full flex items-center space-x-2 p-2 text-left hover:bg-dark-700 rounded-md transition-colors">
                <Settings size={16} className="text-dark-400" />
                <span className="text-white text-sm">Settings</span>
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-dark-600" />

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 p-2 text-left hover:bg-red-600/20 rounded-md transition-colors"
              >
                <LogOut size={16} className="text-red-400" />
                <span className="text-red-400 text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 