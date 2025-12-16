export interface Card {
  id: string
  name: string
  cardNumber: string
  barcodeData?: string
  balance?: number
  balanceLastUpdated?: Date
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCardRequest {
  name: string
  cardNumber: string
  barcodeData?: string
  imageUrl?: string
}

export interface UpdateCardRequest {
  name?: string
  cardNumber?: string
  barcodeData?: string
  imageUrl?: string
}

export interface BarcodeResponse {
  barcode: string
  qrCode: string
}

export interface BalanceResponse {
  balance: number
  lastUpdated: Date
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: Date
  service: string
  mode?: 'primary' | 'dr'
}

