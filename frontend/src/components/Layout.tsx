import React, { useState, useEffect } from 'react'
import { useAppMode } from '../context/AppModeContext'
import PerformanceIndicator from './PerformanceIndicator'
import DRCapabilitiesModal from './DRCapabilitiesModal'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { mode, isLoading } = useAppMode()
  const [showDRModal, setShowDRModal] = useState(false)
  const [previousMode, setPreviousMode] = useState<typeof mode>('primary')

  // Show modal when switching to DR mode
  useEffect(() => {
    if (!isLoading && mode === 'dr' && previousMode !== 'dr') {
      // Clear the dismissed flag when entering DR mode (optional - remove if you want it to persist)
      // localStorage.removeItem('dr-capabilities-dismissed')
      setShowDRModal(true)
    }
    setPreviousMode(mode)
  }, [mode, isLoading, previousMode])

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
            <div className="flex items-center space-x-3">
              {!isLoading && (
                <>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      mode === 'primary'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {mode === 'primary' ? '✓ Full Mode' : '⚠ Limited Mode'}
                  </div>
                  <PerformanceIndicator />
                </>
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDRModal(true)}
                  className="text-xs text-yellow-800 hover:text-yellow-900 underline"
                >
                  What can I do?
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-yellow-800 hover:text-yellow-900 underline"
                >
                  Retry Primary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DR Capabilities Modal */}
      <DRCapabilitiesModal
        isOpen={showDRModal}
        onClose={() => setShowDRModal(false)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer with Branding */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} Rewards Card Aggregator
            </div>
            <div className="flex items-center space-x-1.5">
              {mode === 'primary' ? (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <span className="text-gray-500">Powered by</span>
                  <span className="font-bold text-orange-600">AWS</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <span className="text-gray-500">Powered by</span>
                  <span className="font-bold text-blue-600">GCP</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

