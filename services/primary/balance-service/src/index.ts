import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { balanceRoutes } from './routes/balanceRoutes'
import { healthRoutes } from './routes/healthRoutes'
import { errorHandler } from './middleware/errorHandler'
import { scheduleBalanceUpdates } from './services/balanceScheduler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/health', healthRoutes)
app.use('/api/balance', balanceRoutes)

// Error handling
app.use(errorHandler)

// Initialize database and start server
import { initDatabase } from './db/database'

initDatabase()
  .then(() => {
    // Start scheduled balance updates
    scheduleBalanceUpdates()

    app.listen(PORT, () => {
      console.log(`Balance Service running on port ${PORT}`)
      console.log(`Environment: Primary`)
      console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })

