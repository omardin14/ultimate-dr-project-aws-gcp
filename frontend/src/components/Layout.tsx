import React from 'react'
import { useAppMode } from '../context/AppModeContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { mode, isLoading } = useAppMode()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Rewards Card Aggregator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isLoading && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    mode === 'primary'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {mode === 'primary' ? '✓ Full Mode' : '⚠ Limited Mode'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* DR Mode Banner */}
      {mode === 'dr' && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-yellow-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-900">
                    Disaster Recovery Mode Active
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Read-only access. Cards and balances are cached. Write operations disabled.
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-yellow-800 hover:text-yellow-900 underline"
              >
                Retry Primary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout

