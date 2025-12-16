import React, { createContext, useContext, useState, useEffect } from 'react'
import { checkAppMode } from '../services/api'

export type AppMode = 'primary' | 'dr'

interface AppModeContextType {
  mode: AppMode
  isLoading: boolean
  refreshMode: () => Promise<void>
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined)

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<AppMode>('primary')
  const [isLoading, setIsLoading] = useState(true)

  const refreshMode = async () => {
    try {
      setIsLoading(true)
      const detectedMode = await checkAppMode()
      setMode(detectedMode)
    } catch (error) {
      console.error('Failed to check app mode:', error)
      // Default to DR mode if primary is unavailable
      setMode('dr')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshMode()
    // Check mode every 30 seconds
    const interval = setInterval(refreshMode, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppModeContext.Provider value={{ mode, isLoading, refreshMode }}>
      {children}
    </AppModeContext.Provider>
  )
}

export const useAppMode = () => {
  const context = useContext(AppModeContext)
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider')
  }
  return context
}

