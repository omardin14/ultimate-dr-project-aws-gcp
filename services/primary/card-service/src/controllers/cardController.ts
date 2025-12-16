import { Request, Response, NextFunction } from 'express'
import { cardService } from '../services/cardService'
import { NotFoundError } from '@rewards/shared'

export const cardController = {
  getAllCards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user'
      const cards = await cardService.getAllCards(userId)
      res.json(cards)
    } catch (error) {
      next(error)
    }
  },
  
  getSharedCards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'default_user'
      const cards = await cardService.getSharedCards(userId)
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
      const ownerId = (req.body.ownerId as string) || 'default_user'
      const card = await cardService.createCard(req.body, ownerId)
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
  
  shareCard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, permissions } = req.body
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' })
      }
      const card = await cardService.shareCard(
        req.params.id,
        userId,
        permissions || { view: true, edit: false }
      )
      if (!card) {
        throw new NotFoundError('Card')
      }
      res.json({ success: true, message: 'Card shared successfully', card })
    } catch (error) {
      next(error)
    }
  },
  
  unshareCard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' })
      }
      const card = await cardService.unshareCard(req.params.id, userId)
      if (!card) {
        throw new NotFoundError('Card')
      }
      res.json({ success: true, message: 'Card unshared successfully', card })
    } catch (error) {
      next(error)
    }
  },
}

