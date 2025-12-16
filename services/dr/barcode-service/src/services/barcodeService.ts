import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import { createCanvas } from 'canvas'
import { db } from '../db/database'

export const barcodeService = {
  generateBarcode: async (cardIdOrData: string): Promise<{
    barcode: string
    qrCode: string
  } | null> => {
    let barcodeData: string | null = null

    // Try to get barcode data from database (if cardId is a UUID)
    // Otherwise, treat it as barcode data directly
    if (cardIdOrData.length === 36 && cardIdOrData.includes('-')) {
      // Looks like a UUID, try to fetch from database
      try {
        const result = await db.query(
          'SELECT barcode_data FROM cards WHERE id = $1',
          [cardIdOrData]
        )
        if (result.rows.length > 0 && result.rows[0].barcode_data) {
          barcodeData = result.rows[0].barcode_data
        }
      } catch (error) {
        console.error('Failed to fetch barcode from database:', error)
      }
    }

    // If no database result, use the input as barcode data
    if (!barcodeData) {
      barcodeData = cardIdOrData
    }

    if (!barcodeData) {
      return null
    }

    // Generate QR Code
    const qrCodeDataUrl: string = await QRCode.toDataURL(barcodeData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
    })

    // Generate Barcode (Code128 format)
    const canvas = createCanvas(200, 100)
    JsBarcode(canvas as any, barcodeData, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
    })

    const barcodeDataUrl: string = canvas.toDataURL('image/png')

    return {
      barcode: barcodeDataUrl,
      qrCode: qrCodeDataUrl,
    }
  },
}

