import { Router } from 'express'
import { statisticsController } from '../controllers/statisticsController'

export const statisticsRoutes = Router()

statisticsRoutes.get('/', statisticsController.getStatistics)

