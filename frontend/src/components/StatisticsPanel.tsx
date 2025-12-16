import React, { useState, useEffect } from 'react'
import { useAppMode } from '../context/AppModeContext'
import { getStatistics, Statistics } from '../services/api'
import LoadingSpinner from './LoadingSpinner'

const StatisticsPanel: React.FC = () => {
  const { mode } = useAppMode()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatistics()
  }, [mode])

  const loadStatistics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getStatistics(mode)
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
        {mode === 'primary' && (
          <button
            onClick={loadStatistics}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Stale Data Warning (DR Mode) */}
      {mode === 'dr' && stats.isStale && stats.staleWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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
            <p className="text-sm text-yellow-800">{stats.staleWarning}</p>
          </div>
        </div>
      )}

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Balance</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {formatNumber(stats.totalBalance)} pts
              </p>
            </div>
            <div className="bg-blue-200 rounded-full p-3">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Balance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Average Balance</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {formatNumber(stats.averageBalance)} pts
              </p>
            </div>
            <div className="bg-green-200 rounded-full p-3">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Count */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Cards</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {stats.cardCount}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.cardsWithBalance} with balance
              </p>
            </div>
            <div className="bg-purple-200 rounded-full p-3">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 mb-6">
        Last updated: {formatDate(stats.lastUpdated)}
      </div>

      {/* Trends (Full Mode Only) */}
      {mode === 'primary' && stats.trends && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trends (Last 7 Days)</h3>
          
          {/* Balance Trend */}
          {stats.trends.balanceHistory && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Balance History</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end justify-between h-32 space-x-2">
                  {stats.trends.balanceHistory.map((point, index) => {
                    const maxBalance = Math.max(...stats.trends!.balanceHistory!.map(p => p.balance))
                    const height = (point.balance / maxBalance) * 100
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                          style={{ height: `${height}%` }}
                          title={`${point.date}: ${formatNumber(point.balance)} pts`}
                        />
                        <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Card Count Trend */}
          {stats.trends.cardCountHistory && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Card Count History</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end justify-between h-32 space-x-2">
                  {stats.trends.cardCountHistory.map((point, index) => {
                    const maxCount = Math.max(...stats.trends!.cardCountHistory!.map(p => p.count))
                    const height = (point.count / maxCount) * 100
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                          style={{ height: `${height}%` }}
                          title={`${point.date}: ${point.count} cards`}
                        />
                        <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DR Mode Info */}
      {mode === 'dr' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Statistics in DR mode show basic totals only. 
            Trends and detailed analytics are available in Full mode.
          </p>
        </div>
      )}
    </div>
  )
}

export default StatisticsPanel

