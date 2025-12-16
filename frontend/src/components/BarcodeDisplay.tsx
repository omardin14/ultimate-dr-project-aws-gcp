import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface BarcodeDisplayProps {
  barcode: string
  qrCode: string
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ barcode, qrCode }) => {
  // Check if barcode/qrCode are data URLs (from service) or plain text
  const isDataUrl = (str: string) => str.startsWith('data:image')

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          QR Code
        </h3>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            {isDataUrl(qrCode) ? (
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            ) : (
              <QRCodeSVG value={qrCode} size={200} level="M" />
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Scan with your phone camera
        </p>
      </div>

      {/* Barcode */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Barcode
        </h3>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            {isDataUrl(barcode) ? (
              <img src={barcode} alt="Barcode" className="max-w-full h-24" />
            ) : (
              <div className="font-mono text-2xl tracking-widest">
                {barcode}
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          {isDataUrl(barcode) ? 'Scan with barcode scanner' : 'Enter manually or scan'}
        </p>
      </div>
    </div>
  )
}

export default BarcodeDisplay

