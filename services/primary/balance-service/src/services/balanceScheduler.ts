import cron from 'node-cron'
import { balanceService } from './balanceService'
import { db } from '../db/database'

export const scheduleBalanceUpdates = () => {
  // Update all card balances every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled balance update...')
    try {
      const result = await db.query('SELECT id FROM cards WHERE barcode_data IS NOT NULL')
      const cardIds = result.rows.map((row) => row.id)

      for (const cardId of cardIds) {
        try {
          await balanceService.fetchAndUpdateBalance(cardId)
          console.log(`Updated balance for card ${cardId}`)
        } catch (error) {
          console.error(`Failed to update balance for card ${cardId}:`, error)
        }
      }

      console.log(`Balance update completed for ${cardIds.length} cards`)
    } catch (error) {
      console.error('Scheduled balance update failed:', error)
    }
  })

  console.log('Balance update scheduler started (runs every hour)')
}

