import { Request, Response, NextFunction } from 'express'
import { barcodeService } from '../services/barcodeService'
import { NotFoundError } from '@rewards/shared'

export const barcodeController = {
  getBarcode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // cardId can be the actual card ID or the barcode data itself
      const cardId = req.params.cardId
      const barcodeData = await barcodeService.generateBarcode(cardId)
      
      if (!barcodeData) {
        throw new NotFoundError('Card or barcode data')
      }

      res.json(barcodeData)
    } catch (error) {
      next(error)
    }
  },
}

