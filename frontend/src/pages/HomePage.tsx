import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAppMode } from '../context/AppModeContext'
import { getCards, deleteCard, Card, getSharedCards } from '../services/api'
import CardList from '../components/CardList'
import AddCardModal from '../components/AddCardModal'
import EditCardModal from '../components/EditCardModal'
import ShareCardModal from '../components/ShareCardModal'
import StatisticsPanel from '../components/StatisticsPanel'

const HomePage: React.FC = () => {
  const { mode, isLoading: modeLoading } = useAppMode()
  const navigate = useNavigate()
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [sharingCard, setSharingCard] = useState<Card | null>(null)
  const currentUserId = 'default_user' // In a real app, this would come from auth

  const loadCards = async () => {
    try {
      setIsLoading(true)
      // In DR mode, getSharedCards returns shared cards (read-only)
      // In Full mode, getCards returns all cards (owned + shared)
      const data = mode === 'dr' 
        ? await getSharedCards(mode, currentUserId)
        : await getCards(mode)
      setCards(data)
    } catch (error) {
      console.error('Failed to load cards:', error)
      toast.error('Failed to load cards')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!modeLoading) {
      loadCards()
    }
  }, [mode, modeLoading])

  const handleCardClick = (cardId: string) => {
    navigate(`/card/${cardId}`)
  }

  const handleAddCard = () => {
    if (mode === 'dr') {
      toast.warning('Cannot add cards in limited mode')
      return
    }
    setIsAddModalOpen(true)
  }

  const handleEditCard = (card: Card) => {
    if (mode === 'dr') {
      toast.warning('Cannot edit cards in limited mode')
      return
    }
    setEditingCard(card)
  }

  const handleDeleteCard = async (cardId: string) => {
    if (mode === 'dr') {
      toast.warning('Cannot delete cards in limited mode')
      return
    }

    if (!window.confirm('Are you sure you want to delete this card?')) {
      return
    }

    try {
      await deleteCard(cardId, mode)
      toast.success('Card deleted successfully')
      loadCards()
    } catch (error) {
      console.error('Failed to delete card:', error)
      toast.error('Failed to delete card')
    }
  }

  const handleCardAdded = () => {
    setIsAddModalOpen(false)
    loadCards()
    toast.success('Card added successfully')
  }

  const handleCardUpdated = () => {
    setEditingCard(null)
    loadCards()
    toast.success('Card updated successfully')
  }

  const handleShareCard = (card: Card) => {
    if (mode === 'dr') {
      toast.warning('Cannot modify sharing in DR mode')
      return
    }
    setSharingCard(card)
  }

  const handleSharingSuccess = () => {
    setSharingCard(null)
    loadCards()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Reward Cards</h2>
          <p className="text-gray-600 mt-1">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        {mode === 'primary' && (
          <button
            onClick={handleAddCard}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Add Card
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No cards yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'primary'
              ? 'Get started by adding your first reward card.'
              : 'No cards available in limited mode.'}
          </p>
          {mode === 'primary' && (
            <div className="mt-6">
              <button
                onClick={handleAddCard}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                + Add Card
              </button>
            </div>
          )}
        </div>
      ) : (
        <CardList
          cards={cards}
          onCardClick={handleCardClick}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onShareCard={handleShareCard}
          isReadOnly={mode === 'dr'}
          currentUserId={currentUserId}
        />
      )}

      {isAddModalOpen && (
        <AddCardModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleCardAdded}
        />
      )}

      {editingCard && (
        <EditCardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSuccess={handleCardUpdated}
        />
      )}

      {sharingCard && (
        <ShareCardModal
          card={sharingCard}
          isOpen={!!sharingCard}
          onClose={() => setSharingCard(null)}
          onSuccess={handleSharingSuccess}
        />
      )}

      {/* Statistics Panel at the bottom */}
      <div className="mt-12">
        <StatisticsPanel />
      </div>
    </div>
  )
}

export default HomePage

