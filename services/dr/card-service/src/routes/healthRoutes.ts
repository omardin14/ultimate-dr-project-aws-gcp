import { Router } from 'express'
import { HealthCheckResponse } from '@rewards/shared'

export const healthRoutes = Router()

healthRoutes.get('/', (req, res) => {
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date(),
    service: 'dr-card-service',
    mode: 'dr',
  }
  res.json(response)
})

