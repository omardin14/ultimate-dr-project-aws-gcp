import { Request, Response, NextFunction } from 'express'
import { statisticsService } from '../services/statisticsService'

export const statisticsController = {
  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user'
      const includeTrends = req.query.trends !== 'false' // Default to true
      const stats = await statisticsService.getStatistics(userId, includeTrends === true)
      res.json(stats)
    } catch (error) {
      next(error)
    }
  },
}

