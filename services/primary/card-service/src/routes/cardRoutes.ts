import { Router } from 'express'
import { cardController } from '../controllers/cardController'
import { validateRequest } from '../middleware/validateRequest'
import { createCardSchema, updateCardSchema } from '@rewards/shared'

export const cardRoutes = Router()

cardRoutes.get('/', cardController.getAllCards)
cardRoutes.get('/:id', cardController.getCardById)
cardRoutes.post(
  '/',
  validateRequest(createCardSchema),
  cardController.createCard
)
cardRoutes.put(
  '/:id',
  validateRequest(updateCardSchema),
  cardController.updateCard
)
cardRoutes.delete('/:id', cardController.deleteCard)

