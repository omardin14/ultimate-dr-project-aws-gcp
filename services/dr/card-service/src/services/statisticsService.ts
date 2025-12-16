import { db } from '../db/database'

export interface Statistics {
  totalBalance: number
  averageBalance: number
  cardCount: number
  cardsWithBalance: number
  lastUpdated: Date
  isStale?: boolean
  staleWarning?: string
}

export const statisticsService = {
  getStatistics: async (userId: string = 'default_user'): Promise<Statistics> => {
    // Get only shared cards (DR mode - read-only)
    const cardsResult = await db.query(
      `SELECT balance, balance_last_updated, created_at 
       FROM cards 
       WHERE $1 = ANY(shared_with) AND owner_id != $1`,
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

    // Check if data is stale (older than 24 hours)
    const now = new Date()
    const hoursSinceUpdate = (now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60)
    const isStale = hoursSinceUpdate > 24

    const statistics: Statistics = {
      totalBalance: Math.round(totalBalance * 100) / 100,
      averageBalance: Math.round(averageBalance * 100) / 100,
      cardCount,
      cardsWithBalance,
      lastUpdated: new Date(lastUpdated),
      isStale,
      staleWarning: isStale
        ? `Data may be stale. Last updated ${Math.round(hoursSinceUpdate)} hours ago.`
        : undefined,
    }

    return statistics
  },
}

