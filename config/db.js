const pgpInit = require('pg-promise')
require('dotenv').config();

const pgp = pgpInit();

// Determine SSL configuration based on environment
const sslConfig = process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false; // Disable SSL for local development

// Check if required environment variables are set
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`Warning: Missing database environment variables: ${missingVars.join(', ')}`);
  console.warn('Using default values for database connection');
}

const db = pgp({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'recipe_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    ssl: sslConfig
});

module.exports = db;
