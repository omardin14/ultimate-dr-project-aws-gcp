import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { barcodeRoutes } from './routes/barcodeRoutes'
import { healthRoutes } from './routes/healthRoutes'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/health', healthRoutes)
app.use('/api/barcode', barcodeRoutes)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Barcode Service running on port ${PORT}`)
  console.log(`Environment: Primary`)
})

