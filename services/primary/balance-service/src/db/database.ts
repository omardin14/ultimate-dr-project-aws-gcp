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

// Initialize database schema (balance columns already exist in cards table)
export const initDatabase = async () => {
  try {
    // Test connection
    await db.query('SELECT NOW()')
    console.log('Database connection successful')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

