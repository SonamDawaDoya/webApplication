const db = require('../config/db');

async function addResetTokenExpiryColumn() {
  try {
    await db.none('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP');
    console.log('Column reset_token_expiry added successfully or already exists.');
  } catch (error) {
    console.error('Error adding reset_token_expiry column:', error);
  } finally {
    process.exit();
  }
}

addResetTokenExpiryColumn();
