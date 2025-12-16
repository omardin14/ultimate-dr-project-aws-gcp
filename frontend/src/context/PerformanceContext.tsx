import React, { createContext, useContext, useState, useCallback } from 'react'

interface PerformanceMetrics {
  lastResponseTime: number | null
  averageResponseTime: number | null
  requestCount: number
  slowRequests: number // Requests > 500ms
}

interface PerformanceContextType {
  metrics: PerformanceMetrics
  recordResponseTime: (responseTime: number) => void
  resetMetrics: () => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

const MAX_SAMPLES = 20 // Keep last 20 response times for average

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const [requestCount, setRequestCount] = useState(0)
  const [slowRequests, setSlowRequests] = useState(0)

  const recordResponseTime = useCallback((responseTime: number) => {
    setRequestCount((prev) => prev + 1)
    
    if (responseTime > 500) {
      setSlowRequests((prev) => prev + 1)
    }

    setResponseTimes((prev) => {
      const updated = [...prev, responseTime]
      // Keep only last MAX_SAMPLES
      return updated.slice(-MAX_SAMPLES)
    })
  }, [])

  const resetMetrics = useCallback(() => {
    setResponseTimes([])
    setRequestCount(0)
    setSlowRequests(0)
  }, [])

  const averageResponseTime =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        )
      : null

  const lastResponseTime = responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : null

  const metrics: PerformanceMetrics = {
    lastResponseTime,
    averageResponseTime,
    requestCount,
    slowRequests,
  }

  return (
    <PerformanceContext.Provider value={{ metrics, recordResponseTime, resetMetrics }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export const usePerformance = () => {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

