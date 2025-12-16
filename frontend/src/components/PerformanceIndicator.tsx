import React from 'react'
import { usePerformance } from '../context/PerformanceContext'
import { useAppMode } from '../context/AppModeContext'

const PerformanceIndicator: React.FC = () => {
  const { metrics } = usePerformance()
  const { mode } = useAppMode()

  if (!metrics.lastResponseTime && !metrics.averageResponseTime) {
    return null // Don't show until we have data
  }

  const responseTime = metrics.averageResponseTime || metrics.lastResponseTime || 0
  const isFast = responseTime < 100
  const isSlow = responseTime > 500

  // Different messages for Full vs DR mode
  const getPerformanceMessage = () => {
    if (mode === 'primary') {
      if (isFast) {
        return `⚡ Fast responses (${responseTime}ms avg)`
      } else if (isSlow) {
        return `⚠️ Slower responses (${responseTime}ms avg)`
      } else {
        return `✓ Good performance (${responseTime}ms avg)`
      }
    } else {
      // DR mode
      return `🐌 Limited performance mode (${responseTime}ms avg)`
    }
  }

  const getPerformanceColor = () => {
    if (mode === 'primary') {
      if (isFast) return 'text-green-600 bg-green-50'
      if (isSlow) return 'text-yellow-600 bg-yellow-50'
      return 'text-blue-600 bg-blue-50'
    } else {
      return 'text-orange-600 bg-orange-50'
    }
  }

  return (
    <div
      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getPerformanceColor()} border ${
        mode === 'primary'
          ? isFast
            ? 'border-green-200'
            : isSlow
            ? 'border-yellow-200'
            : 'border-blue-200'
          : 'border-orange-200'
      }`}
      title={`Average response time: ${metrics.averageResponseTime}ms | Last: ${metrics.lastResponseTime}ms | Requests: ${metrics.requestCount}`}
    >
      {getPerformanceMessage()}
    </div>
  )
}

export default PerformanceIndicator

