import { db } from '../db/database'

interface BalanceResult {
  balance: number
  lastUpdated: Date
}

export const balanceService = {
  getBalance: async (cardId: string): Promise<BalanceResult | null> => {
    const result = await db.query(
      'SELECT balance, balance_last_updated FROM cards WHERE id = $1',
      [cardId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      balance: row.balance ? Number(row.balance) : 0,
      lastUpdated: row.balance_last_updated
        ? new Date(row.balance_last_updated)
        : new Date(),
    }
  },

  updateBalance: async (
    cardId: string,
    balance: number
  ): Promise<BalanceResult | null> => {
    const now = new Date()
    const result = await db.query(
      `UPDATE cards 
       SET balance = $1, balance_last_updated = $2 
       WHERE id = $3 
       RETURNING balance, balance_last_updated`,
      [balance, now, cardId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      balance: Number(row.balance),
      lastUpdated: new Date(row.balance_last_updated),
    }
  },

  fetchAndUpdateBalance: async (cardId: string): Promise<BalanceResult | null> => {
    // In a real implementation, this would call external APIs
    // For now, we'll simulate fetching balance
    // TODO: Implement actual API calls to reward card providers

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    // For demo purposes, generate a random balance
    // In production, this would call the actual reward card API
    const mockBalance = Math.floor(Math.random() * 10000)

    return await balanceService.updateBalance(cardId, mockBalance)
  },
}

