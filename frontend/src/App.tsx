import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CardDetailPage from './pages/CardDetailPage'
import { AppModeProvider } from './context/AppModeContext'
import { PerformanceProvider, usePerformance } from './context/PerformanceContext'
import { setResponseTimeCallback } from './services/api'

// Inner component to connect performance tracking
const AppContent = () => {
  const { recordResponseTime } = usePerformance()

  useEffect(() => {
    // Connect API service to performance tracking
    setResponseTimeCallback(recordResponseTime)
  }, [recordResponseTime])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/card/:id" element={<CardDetailPage />} />
        </Routes>
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  )
}

function App() {
  return (
    <AppModeProvider>
      <PerformanceProvider>
        <AppContent />
      </PerformanceProvider>
    </AppModeProvider>
  )
}

export default App

