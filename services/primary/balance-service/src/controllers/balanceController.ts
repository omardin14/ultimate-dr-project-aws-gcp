import { Request, Response, NextFunction } from 'express'
import { balanceService } from '../services/balanceService'
import { NotFoundError } from '@rewards/shared'

export const balanceController = {
  getBalance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const balance = await balanceService.getBalance(req.params.cardId)
      if (balance === null) {
        throw new NotFoundError('Card')
      }
      res.json({ balance: balance.balance, lastUpdated: balance.lastUpdated })
    } catch (error) {
      next(error)
    }
  },

  updateBalance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const balance = await balanceService.fetchAndUpdateBalance(req.params.cardId)
      if (!balance) {
        throw new NotFoundError('Card')
      }
      res.json({ balance: balance.balance, lastUpdated: balance.lastUpdated })
    } catch (error) {
      next(error)
    }
  },
}

