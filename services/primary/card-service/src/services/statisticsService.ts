import { db } from '../db/database'

export interface Statistics {
  totalBalance: number
  averageBalance: number
  cardCount: number
  cardsWithBalance: number
  lastUpdated: Date
  trends?: {
    balanceHistory?: Array<{ date: string; balance: number }>
    cardCountHistory?: Array<{ date: string; count: number }>
  }
}

export const statisticsService = {
  getStatistics: async (userId: string = 'default_user', includeTrends: boolean = true): Promise<Statistics> => {
    // Get all cards for the user (owned + shared)
    const cardsResult = await db.query(
      `SELECT balance, balance_last_updated, created_at 
       FROM cards 
       WHERE owner_id = $1 OR $1 = ANY(shared_with)`,
      [userId]
    )

    const cards = cardsResult.rows
    const cardCount = cards.length
    const cardsWithBalance = cards.filter((card) => card.balance !== null && card.balance !== undefined).length

    // Calculate totals
    const totalBalance = cards.reduce((sum, card) => {
      return sum + (card.balance ? Number(card.balance) : 0)
    }, 0)

    const averageBalance = cardsWithBalance > 0 ? totalBalance / cardsWithBalance : 0

    // Get most recent balance update
    const lastUpdated = cards
      .map((card) => card.balance_last_updated)
      .filter((date) => date !== null)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || new Date()

    const statistics: Statistics = {
      totalBalance: Math.round(totalBalance * 100) / 100,
      averageBalance: Math.round(averageBalance * 100) / 100,
      cardCount,
      cardsWithBalance,
      lastUpdated: new Date(lastUpdated),
    }

    // Add trends if requested (Full mode only)
    if (includeTrends) {
      // For demo purposes, generate trend data
      // In production, this would come from a time-series database or historical data
      const trends = {
        balanceHistory: generateBalanceHistory(totalBalance, 7), // Last 7 days
        cardCountHistory: generateCardCountHistory(cardCount, 7), // Last 7 days
      }
      statistics.trends = trends
    }

    return statistics
  },
}

// Helper function to generate balance history (demo data)
function generateBalanceHistory(currentBalance: number, days: number): Array<{ date: string; balance: number }> {
  const history: Array<{ date: string; balance: number }> = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Simulate gradual changes (in production, this would be real historical data)
    const variation = (Math.random() - 0.5) * 0.1 * currentBalance // ±5% variation
    const balance = Math.max(0, currentBalance + variation)

    history.push({
      date: date.toISOString().split('T')[0],
      balance: Math.round(balance * 100) / 100,
    })
  }

  return history
}

// Helper function to generate card count history (demo data)
function generateCardCountHistory(currentCount: number, days: number): Array<{ date: string; count: number }> {
  const history: Array<{ date: string; count: number }> = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Simulate gradual growth (in production, this would be real historical data)
    const growth = Math.max(0, currentCount - (days - i - 1))
    const count = Math.max(1, growth)

    history.push({
      date: date.toISOString().split('T')[0],
      count,
    })
  }

  return history
}

