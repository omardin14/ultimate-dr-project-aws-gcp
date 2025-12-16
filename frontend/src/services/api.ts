import axios from 'axios'

// Check if we should force DR mode (useful for DR docker-compose)
const FORCE_DR_MODE = import.meta.env.VITE_FORCE_DR_MODE === 'true'

// For browser, use localhost. For Docker internal, use service names or host.docker.internal
// The browser will make requests, so we need localhost URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const DR_API_BASE_URL = import.meta.env.VITE_DR_API_URL || 'http://localhost:4001'
const BALANCE_API_URL = import.meta.env.VITE_BALANCE_API_URL || 'http://localhost:3003'
const BARCODE_API_URL = import.meta.env.VITE_BARCODE_API_URL || 'http://localhost:3002'
const DR_BARCODE_API_URL = import.meta.env.VITE_DR_BARCODE_API_URL || 'http://localhost:4002'

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
  // If forced to DR mode (e.g., in DR docker-compose), check DR first
  if (FORCE_DR_MODE) {
    try {
      const response = await axios.get(`${DR_API_BASE_URL}/health`, { timeout: 2000 })
      if (response.data.mode === 'dr') {
        return 'dr'
      }
    } catch {
      // DR failed, fall through to check primary
    }
  }

  try {
    // Try primary API first (unless forced to DR)
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 })
    if (response.data.mode === 'primary' || !response.data.mode) {
      return 'primary'
    }
  } catch {
    // Primary failed, try DR
  }

  try {
    // Try DR API
    const response = await axios.get(`${DR_API_BASE_URL}/health`, { timeout: 2000 })
    if (response.data.mode === 'dr') {
      return 'dr'
    }
  } catch {
    // DR also failed
  }

  // Default to DR if both fail (safer for read-only)
  return 'dr'
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
    // Use appropriate barcode service based on mode
    const barcodeUrl = mode === 'primary' ? BARCODE_API_URL : DR_BARCODE_API_URL
    const response = await axios.get<{ barcode: string; qrCode: string }>(
      `${barcodeUrl}/api/barcode/${cardId}`,
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

// Balance API (primary only - not available in DR mode)
export interface BalanceResponse {
  balance: number
  lastUpdated: string
}

export const getBalance = async (cardId: string, mode: AppMode): Promise<BalanceResponse> => {
  if (mode === 'dr') {
    throw new Error('Balance service not available in DR mode')
  }
  const response = await axios.get<BalanceResponse>(
    `${BALANCE_API_URL}/api/balance/${cardId}`
  )
  return response.data
}

export const updateBalance = async (cardId: string, mode: AppMode): Promise<BalanceResponse> => {
  if (mode === 'dr') {
    throw new Error('Balance updates not available in DR mode')
  }
  const response = await axios.post<BalanceResponse>(
    `${BALANCE_API_URL}/api/balance/${cardId}/update`
  )
  return response.data
}

