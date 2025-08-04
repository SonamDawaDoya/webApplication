const db = require('../config/db');

const createVideosTable = async () => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Videos table created or already exists.');
  } catch (error) {
    console.error('Error creating videos table:', error);
  }
};

createVideosTable();
