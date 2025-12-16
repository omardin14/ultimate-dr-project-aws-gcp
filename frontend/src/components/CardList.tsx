import React from 'react'
import { Card } from '../services/api'

interface CardListProps {
  cards: Card[]
  onCardClick: (cardId: string) => void
  onEditCard: (card: Card) => void
  onDeleteCard: (cardId: string) => void
  onShareCard?: (card: Card) => void
  isReadOnly: boolean
  currentUserId?: string
}

const CardList: React.FC<CardListProps> = ({
  cards,
  onCardClick,
  onEditCard,
  onDeleteCard,
  onShareCard,
  isReadOnly,
  currentUserId = 'default_user',
}) => {
  const isCardShared = (card: Card) => {
    return card.sharedWith && card.sharedWith.length > 0
  }
  
  const isCardOwner = (card: Card) => {
    return !card.ownerId || card.ownerId === currentUserId
  }
  
  const isSharedWithMe = (card: Card) => {
    return card.sharedWith?.includes(currentUserId) && !isCardOwner(card)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden ${
            isSharedWithMe(card) ? 'border-2 border-blue-300' : ''
          }`}
          onClick={() => onCardClick(card.id)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {card.name}
                  </h3>
                  {isSharedWithMe(card) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Shared
                    </span>
                  )}
                  {isCardShared(card) && isCardOwner(card) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Sharing
                    </span>
                  )}
                </div>
              </div>
              {!isReadOnly && (
                <div className="flex space-x-2">
                  {onShareCard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onShareCard(card)
                      }}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Share card"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                  )}
                  {(isCardOwner(card) || card.permissions?.edit) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditCard(card)
                        }}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        title="Edit card"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      {isCardOwner(card) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteCard(card.id)
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete card"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-2">
              {card.cardNumber}
            </p>

            {card.balance !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Balance</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {card.balance.toLocaleString()} pts
                    </span>
                    {isReadOnly && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                        Cached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {card.barcodeData && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Barcode Available
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardList

