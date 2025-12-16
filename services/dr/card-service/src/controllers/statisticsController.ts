import { Request, Response, NextFunction } from 'express'
import { statisticsService } from '../services/statisticsService'

export const statisticsController = {
  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user'
      const stats = await statisticsService.getStatistics(userId)
      res.json(stats)
    } catch (error) {
      next(error)
    }
  },
}

