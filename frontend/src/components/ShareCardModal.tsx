import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { shareCard, unshareCard, Card } from '../services/api'
import { useAppMode } from '../context/AppModeContext'

interface ShareCardModalProps {
  isOpen: boolean
  card: Card | null
  onClose: () => void
  onSuccess: () => void
}

const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  card,
  onClose,
  onSuccess,
}) => {
  const { mode } = useAppMode()
  const [userId, setUserId] = useState('')
  const [canEdit, setCanEdit] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  if (!isOpen || !card) return null

  const isShared = card.sharedWith && card.sharedWith.length > 0
  const isOwner = !card.ownerId || card.ownerId === 'default_user'

  const handleShare = async () => {
    if (!userId.trim()) {
      toast.error('Please enter a user ID')
      return
    }

    setIsSharing(true)
    try {
      await shareCard(
        card.id,
        {
          userId: userId.trim(),
          permissions: {
            view: true,
            edit: canEdit,
          },
        },
        mode
      )
      toast.success(`Card shared with ${userId}`)
      setUserId('')
      setCanEdit(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to share card')
    } finally {
      setIsSharing(false)
    }
  }

  const handleUnshare = async (targetUserId: string) => {
    setIsSharing(true)
    try {
      await unshareCard(card.id, targetUserId, mode)
      toast.success('Card unshared')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to unshare card')
    } finally {
      setIsSharing(false)
    }
  }

  if (mode === 'dr') {
    // DR mode: Show shared cards read-only
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Shared Card (Read-Only)</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              This card is shared with you. You can view it but cannot modify sharing settings in DR mode.
            </p>
            {card.sharedWith && card.sharedWith.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Shared with:</p>
                <ul className="space-y-2">
                  {card.sharedWith.map((uid) => (
                    <li key={uid} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{uid}</span>
                      <span className="text-xs text-gray-500">
                        {card.permissions?.edit ? 'Can edit' : 'View only'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Full mode: Allow sharing
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Share Card</h3>
        </div>
        <div className="px-6 py-4">
          {/* Current shares */}
          {isShared && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Currently shared with:</p>
              <ul className="space-y-2">
                {card.sharedWith!.map((uid) => (
                  <li key={uid} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">{uid}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {card.permissions?.edit ? 'Can edit' : 'View only'}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleUnshare(uid)}
                          disabled={isSharing}
                          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share with new user */}
          {isOwner && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share with user ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID (e.g., family_member_1)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canEdit"
                  checked={canEdit}
                  onChange={(e) => setCanEdit(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="canEdit" className="ml-2 text-sm text-gray-700">
                  Allow editing
                </label>
              </div>
            </div>
          )}

          {!isOwner && (
            <p className="text-sm text-gray-600">
              This card is shared with you. Only the owner can modify sharing settings.
            </p>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          {isOwner && (
            <button
              onClick={handleShare}
              disabled={isSharing || !userId.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareCardModal

