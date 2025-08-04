// Removed Mongoose model export to avoid conflict with PostgreSQL usage
const db = require('../config/db');

// Create new user table if not exists
const createUserTable = async () => {
    try {
        console.log('Creating users table...');
        await db.none(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(10) DEFAULT 'user',
                is_verified BOOLEAN DEFAULT false,
                verification_token TEXT,
                reset_token TEXT,
                reset_token_expiry TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created successfully!');
    } catch (error) {
        console.error('Error creating users table:', error);
        console.log('Continuing without database table creation...');
    }
};

module.exports = {
    createUserTable
};
