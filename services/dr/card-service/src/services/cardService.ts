import { db } from '../db/database'
import { Card } from '@rewards/shared'
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
}

