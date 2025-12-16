import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const DR_API_BASE_URL = import.meta.env.VITE_DR_API_URL || 'http://localhost:4001'
const BALANCE_API_URL = import.meta.env.VITE_BALANCE_API_URL || 'http://localhost:3003'
const BARCODE_API_URL = import.meta.env.VITE_BARCODE_API_URL || 'http://localhost:3002'

export interface Card {
  id: string
  name: string
  cardNumber: string
  barcodeData?: string
  balance?: number
  balanceLastUpdated?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
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

export type AppMode = 'primary' | 'dr'

// Check which API is available
export const checkAppMode = async (): Promise<AppMode> => {
  try {
    // Try primary API first
    await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 })
    return 'primary'
  } catch {
    try {
      // Try DR API
      await axios.get(`${DR_API_BASE_URL}/health`, { timeout: 2000 })
      return 'dr'
    } catch {
      // Default to DR if both fail (safer for read-only)
      return 'dr'
    }
  }
}

const getApiUrl = (mode: AppMode): string => {
  return mode === 'primary' ? API_BASE_URL : DR_API_BASE_URL
}

// Card API
export const getCards = async (mode: AppMode): Promise<Card[]> => {
  const response = await axios.get<Card[]>(`${getApiUrl(mode)}/api/cards`)
  return response.data
}

export const getCard = async (id: string, mode: AppMode): Promise<Card> => {
  const response = await axios.get<Card>(`${getApiUrl(mode)}/api/cards/${id}`)
  return response.data
}

export const createCard = async (
  card: CreateCardRequest,
  mode: AppMode
): Promise<Card> => {
  if (mode === 'dr') {
    throw new Error('Cannot create cards in DR mode')
  }
  const response = await axios.post<Card>(
    `${getApiUrl(mode)}/api/cards`,
    card
  )
  return response.data
}

export const updateCard = async (
  id: string,
  card: UpdateCardRequest,
  mode: AppMode
): Promise<Card> => {
  if (mode === 'dr') {
    throw new Error('Cannot update cards in DR mode')
  }
  const response = await axios.put<Card>(
    `${getApiUrl(mode)}/api/cards/${id}`,
    card
  )
  return response.data
}

export const deleteCard = async (id: string, mode: AppMode): Promise<void> => {
  if (mode === 'dr') {
    throw new Error('Cannot delete cards in DR mode')
  }
  await axios.delete(`${getApiUrl(mode)}/api/cards/${id}`)
}

// Barcode API
export const getBarcode = async (
  cardId: string,
  mode: AppMode
): Promise<{ barcode: string; qrCode: string }> => {
  try {
    // Try barcode service first (if available)
    const response = await axios.get<{ barcode: string; qrCode: string }>(
      `${BARCODE_API_URL}/api/barcode/${cardId}`,
      { timeout: 2000 }
    )
    return response.data
  } catch {
    // Fallback: get card data and use barcodeData
    const card = await getCard(cardId, mode)
    if (card.barcodeData) {
      return {
        barcode: card.barcodeData,
        qrCode: card.barcodeData,
      }
    }
    throw new Error('No barcode data available')
  }
}

// Balance API (primary only)
export interface BalanceResponse {
  balance: number
  lastUpdated: string
}

export const getBalance = async (cardId: string): Promise<BalanceResponse> => {
  const response = await axios.get<BalanceResponse>(
    `${BALANCE_API_URL}/api/balance/${cardId}`
  )
  return response.data
}

export const updateBalance = async (cardId: string): Promise<BalanceResponse> => {
  const response = await axios.post<BalanceResponse>(
    `${BALANCE_API_URL}/api/balance/${cardId}/update`
  )
  return response.data
}

