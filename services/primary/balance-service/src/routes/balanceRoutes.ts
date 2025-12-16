import { Router } from 'express'
import { balanceController } from '../controllers/balanceController'

export const balanceRoutes = Router()

balanceRoutes.get('/:cardId', balanceController.getBalance)
balanceRoutes.post('/:cardId/update', balanceController.updateBalance)

