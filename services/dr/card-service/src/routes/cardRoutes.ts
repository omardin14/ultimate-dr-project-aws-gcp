import { Router } from 'express'
import { cardController } from '../controllers/cardController'

export const cardRoutes = Router()

// DR mode: Read-only operations only
cardRoutes.get('/', cardController.getAllCards)
cardRoutes.get('/:id', cardController.getCardById)

// Write operations return 403 Forbidden
cardRoutes.post('/', cardController.createCardForbidden)
cardRoutes.put('/:id', cardController.updateCardForbidden)
cardRoutes.delete('/:id', cardController.deleteCardForbidden)

