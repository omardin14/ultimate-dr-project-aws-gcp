import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { Card, CreateCardRequest, UpdateCardRequest } from '@rewards/shared'
import { CardModel } from '@rewards/shared'

export const cardService = {
  getAllCards: async (userId: string = 'default_user'): Promise<Card[]> => {
    // Get cards owned by user OR shared with user
    const result = await db.query(
      `SELECT * FROM cards 
       WHERE owner_id = $1 OR $1 = ANY(shared_with)
       ORDER BY created_at DESC`,
      [userId]
    )
    return result.rows.map((row) => CardModel.toDTO(row))
  },
  
  getSharedCards: async (userId: string = 'default_user'): Promise<Card[]> => {
    // Get only cards shared with user (not owned by them)
    const result = await db.query(
      `SELECT * FROM cards 
       WHERE $1 = ANY(shared_with) AND owner_id != $1
       ORDER BY created_at DESC`,
      [userId]
    )
    return result.rows.map((row) => CardModel.toDTO(row))
  },

  getCardById: async (id: string): Promise<Card | null> => {
    const result = await db.query('SELECT * FROM cards WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return null
    }
    return CardModel.toDTO(result.rows[0])
  },

  createCard: async (data: CreateCardRequest, ownerId: string = 'default_user'): Promise<Card> => {
    const id = uuidv4()
    const now = new Date()

    const result = await db.query(
      `INSERT INTO cards (id, name, card_number, barcode_data, image_url, owner_id, shared_with, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        data.name,
        data.cardNumber,
        data.barcodeData || null,
        data.imageUrl || null,
        ownerId,
        [], // Empty array for shared_with
        now,
        now,
      ]
    )

    return CardModel.toDTO(result.rows[0])
  },

  updateCard: async (
    id: string,
    data: UpdateCardRequest
  ): Promise<Card | null> => {
    const existing = await cardService.getCardById(id)
    if (!existing) {
      return null
    }

    const updateData = CardModel.toDatabase(data)
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) {
      return existing
    }

    fields.push(`updated_at = $${paramCount}`)
    values.push(new Date())
    values.push(id)

    const query = `UPDATE cards SET ${fields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`
    const result = await db.query(query, values)

    return CardModel.toDTO(result.rows[0])
  },

  deleteCard: async (id: string): Promise<boolean> => {
    const result = await db.query('DELETE FROM cards WHERE id = $1', [id])
    return result.rowCount !== null && result.rowCount > 0
  },
  
  shareCard: async (
    cardId: string,
    userId: string,
    permissions: { view: boolean; edit: boolean } = { view: true, edit: false }
  ): Promise<Card | null> => {
    const card = await cardService.getCardById(cardId)
    if (!card) {
      return null
    }
    
    // Get current shared_with array
    const result = await db.query('SELECT shared_with FROM cards WHERE id = $1', [cardId])
    const currentShared = result.rows[0]?.shared_with || []
    
    // Add user if not already shared
    if (!currentShared.includes(userId)) {
      const updatedShared = [...currentShared, userId]
      await db.query(
        `UPDATE cards 
         SET shared_with = $1, 
             permissions = $2,
             updated_at = $3
         WHERE id = $4
         RETURNING *`,
        [updatedShared, JSON.stringify(permissions), new Date(), cardId]
      )
    } else {
      // Update permissions for existing shared user
      await db.query(
        `UPDATE cards 
         SET permissions = $1,
             updated_at = $2
         WHERE id = $3
         RETURNING *`,
        [JSON.stringify(permissions), new Date(), cardId]
      )
    }
    
    return cardService.getCardById(cardId)
  },
  
  unshareCard: async (cardId: string, userId: string): Promise<Card | null> => {
    const card = await cardService.getCardById(cardId)
    if (!card) {
      return null
    }
    
    // Remove user from shared_with array
    const result = await db.query('SELECT shared_with FROM cards WHERE id = $1', [cardId])
    const currentShared = result.rows[0]?.shared_with || []
    const updatedShared = currentShared.filter((id: string) => id !== userId)
    
    await db.query(
      `UPDATE cards 
       SET shared_with = $1,
           updated_at = $2
       WHERE id = $3
       RETURNING *`,
      [updatedShared, new Date(), cardId]
    )
    
    return cardService.getCardById(cardId)
  },
}

