import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rewards_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Handle connection errors
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Initialize database schema
export const initDatabase = async () => {
  try {
    // Test connection
    await db.query('SELECT NOW()')
    console.log('Database connection successful')

    // Create schema
    await db.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        card_number VARCHAR(50) NOT NULL,
        barcode_data VARCHAR(200),
        balance DECIMAL(10, 2),
        balance_last_updated TIMESTAMP,
        image_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('Database schema initialized')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

