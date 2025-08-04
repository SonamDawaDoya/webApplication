const db = require('../config/db');

const createVideoTable = async () => {
  try {
    console.log('Creating videos table...');
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
    console.log('Videos table created successfully!');
  } catch (error) {
    console.error('Error creating videos table:', error);
    console.log('Continuing without video table creation...');
  }
};

const getAllVideos = async () => {
  try {
    return await db.any('SELECT * FROM videos ORDER BY created_at DESC');
  } catch (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }
};

const getPublishedVideos = async () => {
  try {
    return await db.any('SELECT * FROM videos WHERE published = true ORDER BY created_at DESC');
  } catch (error) {
    console.error('Error fetching published videos:', error);
    return [];
  }
};

const addVideo = async (video) => {
  try {
    const { title, description, video_url, published } = video;
    return await db.one(
      'INSERT INTO videos (title, description, video_url, published) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, video_url, published]
    );
  } catch (error) {
    console.error('Error adding video:', error);
    throw error;
  }
};

const updateVideo = async (id, video) => {
  try {
    const { title, description, video_url, published } = video;
    return await db.none(
      'UPDATE videos SET title = $1, description = $2, video_url = $3, published = $4 WHERE id = $5',
      [title, description, video_url, published, id]
    );
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

const deleteVideo = async (id) => {
  try {
    return await db.none('DELETE FROM videos WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

module.exports = {
  createVideoTable,
  getAllVideos,
  getPublishedVideos,
  addVideo,
  updateVideo,
  deleteVideo,
};
