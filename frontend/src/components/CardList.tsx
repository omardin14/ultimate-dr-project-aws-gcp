import React from 'react'
import { Card } from '../services/api'

interface CardListProps {
  cards: Card[]
  onCardClick: (cardId: string) => void
  onEditCard: (card: Card) => void
  onDeleteCard: (cardId: string) => void
  isReadOnly: boolean
}

const CardList: React.FC<CardListProps> = ({
  cards,
  onCardClick,
  onEditCard,
  onDeleteCard,
  isReadOnly,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
          onClick={() => onCardClick(card.id)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {card.name}
              </h3>
              {!isReadOnly && (
                <div className="flex space-x-2">
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
                  <span className="font-semibold text-gray-900">
                    {card.balance.toLocaleString()} pts
                  </span>
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

