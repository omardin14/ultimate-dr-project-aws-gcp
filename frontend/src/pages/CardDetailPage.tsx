import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAppMode } from '../context/AppModeContext'
import { getCard, getBarcode, getBalance, updateBalance } from '../services/api'
import { Card } from '../services/api'
import BarcodeDisplay from '../components/BarcodeDisplay'
import LoadingSpinner from '../components/LoadingSpinner'

const CardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { mode } = useAppMode()
  const [card, setCard] = useState<Card | null>(null)
  const [barcode, setBarcode] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false)
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadCard = async () => {
      try {
        setIsLoading(true)
        const cardData = await getCard(id, mode)
        setCard(cardData)

        // Load barcode if available
        if (cardData.barcodeData) {
          loadBarcode(id)
        }

        // Load balance if in primary mode
        if (mode === 'primary') {
          loadBalance(id)
        }
      } catch (error) {
        console.error('Failed to load card:', error)
        toast.error('Failed to load card')
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadCard()
  }, [id, mode, navigate])

  const loadBarcode = async (cardId: string) => {
    try {
      setIsBarcodeLoading(true)
      const barcodeData = await getBarcode(cardId, mode)
      setBarcode(barcodeData.barcode)
      setQrCode(barcodeData.qrCode)
    } catch (error) {
      console.error('Failed to load barcode:', error)
      toast.error('Failed to load barcode')
    } finally {
      setIsBarcodeLoading(false)
    }
  }

  const loadBalance = async (cardId: string) => {
    if (mode !== 'primary') return

    try {
      setIsBalanceLoading(true)
      const balanceData = await getBalance(cardId)
      // Update card with latest balance
      if (card) {
        setCard({
          ...card,
          balance: balanceData.balance,
          balanceLastUpdated: balanceData.lastUpdated,
        })
      }
    } catch (error) {
      console.error('Failed to load balance:', error)
      // Don't show error toast - balance might not be available
    } finally {
      setIsBalanceLoading(false)
    }
  }

  const handleUpdateBalance = async () => {
    if (!id || mode !== 'primary') return

    try {
      setIsUpdatingBalance(true)
      const balanceData = await updateBalance(id)
      // Update card with new balance
      if (card) {
        setCard({
          ...card,
          balance: balanceData.balance,
          balanceLastUpdated: balanceData.lastUpdated,
        })
      }
      toast.success('Balance updated successfully')
    } catch (error) {
      console.error('Failed to update balance:', error)
      toast.error('Failed to update balance')
    } finally {
      setIsUpdatingBalance(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!card) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Card not found</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-primary-600 hover:text-primary-700 font-medium"
      >
        ← Back to Cards
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{card.name}</h1>
            <p className="text-gray-600 mt-1">Card Number: {card.cardNumber}</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">Balance</span>
            {mode === 'primary' && (
              <button
                onClick={handleUpdateBalance}
                disabled={isUpdatingBalance}
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingBalance ? 'Updating...' : 'Refresh Balance'}
              </button>
            )}
          </div>
          {isBalanceLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="text-sm text-gray-600">Loading balance...</span>
            </div>
          ) : card.balance !== undefined ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {card.balance.toLocaleString()} points
                </span>
              </div>
              {card.balanceLastUpdated && (
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(card.balanceLastUpdated).toLocaleString()}
                  {mode === 'dr' && ' (cached)'}
                </p>
              )}
            </>
          ) : (
            <div className="text-gray-500">
              {mode === 'primary' ? (
                <span>No balance available. Click "Refresh Balance" to fetch.</span>
              ) : (
                <span>Balance not available in limited mode.</span>
              )}
            </div>
          )}
        </div>

        {card.barcodeData && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Barcode / QR Code
            </h2>
            {isBarcodeLoading ? (
              <LoadingSpinner />
            ) : (
              <BarcodeDisplay
                barcode={barcode || card.barcodeData}
                qrCode={qrCode || card.barcodeData}
              />
            )}
          </div>
        )}

        {!card.barcodeData && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">
              No barcode data available for this card.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardDetailPage

