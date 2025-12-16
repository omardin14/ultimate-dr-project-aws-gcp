import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { Card, CreateCardRequest, UpdateCardRequest } from '@rewards/shared'
import { CardModel } from '@rewards/shared'

export const cardService = {
  getAllCards: async (): Promise<Card[]> => {
    const result = await db.query('SELECT * FROM cards ORDER BY created_at DESC')
    return result.rows.map((row) => CardModel.toDTO(row))
  },

  getCardById: async (id: string): Promise<Card | null> => {
    const result = await db.query('SELECT * FROM cards WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return null
    }
    return CardModel.toDTO(result.rows[0])
  },

  createCard: async (data: CreateCardRequest): Promise<Card> => {
    const id = uuidv4()
    const now = new Date()

    const result = await db.query(
      `INSERT INTO cards (id, name, card_number, barcode_data, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        data.name,
        data.cardNumber,
        data.barcodeData || null,
        data.imageUrl || null,
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
}

