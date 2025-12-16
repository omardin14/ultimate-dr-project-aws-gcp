import { Router } from 'express'
import { barcodeController } from '../controllers/barcodeController'

export const barcodeRoutes = Router()

barcodeRoutes.get('/:cardId', barcodeController.getBarcode)

