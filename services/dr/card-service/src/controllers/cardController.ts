import { Request, Response, NextFunction } from 'express'
import { cardService } from '../services/cardService'
import { NotFoundError, ForbiddenError } from '@rewards/shared'

export const cardController = {
  getAllCards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cards = await cardService.getAllCards()
      res.json(cards)
    } catch (error) {
      next(error)
    }
  },

  getCardById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await cardService.getCardById(req.params.id)
      if (!card) {
        throw new NotFoundError('Card')
      }
      res.json(card)
    } catch (error) {
      next(error)
    }
  },

  // DR mode: Write operations are forbidden
  createCardForbidden: async (req: Request, res: Response, next: NextFunction) => {
    next(new ForbiddenError('Write operations are not available in DR mode'))
  },

  updateCardForbidden: async (req: Request, res: Response, next: NextFunction) => {
    next(new ForbiddenError('Write operations are not available in DR mode'))
  },

  deleteCardForbidden: async (req: Request, res: Response, next: NextFunction) => {
    next(new ForbiddenError('Write operations are not available in DR mode'))
  },
}

