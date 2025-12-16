import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { cardRoutes } from './routes/cardRoutes'
import { healthRoutes } from './routes/healthRoutes'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/health', healthRoutes)
app.use('/api/cards', cardRoutes)

// Error handling
app.use(errorHandler)

// Initialize database and start server
import { initDatabase } from './db/database'

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Card Service running on port ${PORT}`)
      console.log(`Environment: Primary`)
      console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
  })

