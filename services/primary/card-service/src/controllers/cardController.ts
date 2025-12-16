import { Request, Response, NextFunction } from 'express'
import { cardService } from '../services/cardService'
import { NotFoundError } from '@rewards/shared'

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

  createCard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await cardService.createCard(req.body)
      res.status(201).json(card)
    } catch (error) {
      next(error)
    }
  },

  updateCard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await cardService.updateCard(req.params.id, req.body)
      if (!card) {
        throw new NotFoundError('Card')
      }
      res.json(card)
    } catch (error) {
      next(error)
    }
  },

  deleteCard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await cardService.deleteCard(req.params.id)
      if (!deleted) {
        throw new NotFoundError('Card')
      }
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}

