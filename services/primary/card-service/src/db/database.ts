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
        owner_id VARCHAR(100) DEFAULT 'default_user',
        shared_with TEXT[], -- Array of user IDs who can view this card
        permissions JSONB DEFAULT '{"view": true, "edit": false}'::jsonb, -- Permissions for shared users
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Add sharing columns if they don't exist (for existing databases)
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='cards' AND column_name='owner_id') THEN
          ALTER TABLE cards ADD COLUMN owner_id VARCHAR(100) DEFAULT 'default_user';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='cards' AND column_name='shared_with') THEN
          ALTER TABLE cards ADD COLUMN shared_with TEXT[] DEFAULT ARRAY[]::TEXT[];
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='cards' AND column_name='permissions') THEN
          ALTER TABLE cards ADD COLUMN permissions JSONB DEFAULT '{"view": true, "edit": false}'::jsonb;
        END IF;
      END $$;
    `)
    console.log('Database schema initialized')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

