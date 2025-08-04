const RecipeModel = require('../models/recipeModel');
const UserModel = require('../models/userModel');
const videoModel = require('../models/videoModel');
// Controller logic for admin
exports.getDashboard = async (req, res) => {
  try {
    const recipes = await RecipeModel.find();
    const videos = await videoModel.getAllVideos();
    res.render('admin/dashboard', { title: 'Admin Dashboard', recipes, videos });
  } catch (err) {
    console.error('Error fetching recipes or videos for dashboard:', err);
    res.status(500).send('Internal Server Error');
  }
};


exports.manageRecipes = async (req, res) => {
  try {
    const recipes = await RecipeModel.find();
    const videos = await videoModel.getAllVideos();

    let editRecipe = null;
    let editVideo = null;
    const editId = req.query.editId;
    if (editId) {
      // First check if editId corresponds to a video
      const videoList = await videoModel.getAllVideos();
      editVideo = videoList.find(video => video.id && video.id.toString() === editId.toString());
      if (!editVideo) {
        // If not a video, try to find a recipe with the editId
        editRecipe = await RecipeModel.findById(editId);
      }
    }

    res.render('admin/manageRecipes', { title: 'Manage Recipes', recipes, videos, editRecipe, editVideo });
  } catch (err) {
    console.error('Error fetching recipes or videos:', err);
    res.status(500).send('Internal Server Error');
  }
};

const db = require('../config/db');

exports.manageUsers = async (req, res) => {
  try {
    const users = await db.any('SELECT id, name, email, role, is_verified FROM users');
    res.render('admin/manageUsers', { title: 'Manage Users', users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Middleware to check if user is authenticated
exports.authMiddleware = (req, res, next) => {
  // Check if user is authenticated (this is a placeholder, implement your own logic)
  if (req.isAuthenticated && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/user/login');
}

// handle user management actions
exports.handleUserManagement = async (req, res) => {
  const { action, userId } = req.body;

  try {
    if (action === 'delete') {
      // Logic to delete user
      await db.none('DELETE FROM users WHERE id = $1', [userId]);
      res.redirect('/admin/manageUsers');
    } else if (action === 'ban') {
      // Logic to ban user
      await db.none('UPDATE users SET banned = true WHERE id = $1', [userId]);
      res.redirect('/admin/manageUsers');
    }
  } catch (err) {
    console.error('Error handling user management:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.handleRecipeManagement = async (req, res) => {
  const { action, recipeId, title, ingredients, instructions, imageUrl, published } = req.body;

  try {
    if (action === 'delete') {
      // Logic to delete recipe
      await RecipeModel.findByIdAndDelete(recipeId);
      res.redirect('/admin/manageRecipes');
    } else if (action === 'add') {
      // Logic to add new recipe
      const newRecipe = new RecipeModel({
        title,
        ingredients,
        instructions,
        imageUrl,
        published: published === 'on'
      });
      await newRecipe.save();
      res.redirect('/admin/manageRecipes');
    } else if (action === 'edit') {
      // Logic to update recipe
      await RecipeModel.findByIdAndUpdate(recipeId, {
        title,
        ingredients,
        instructions,
        imageUrl,
        published: published === 'on'
      });
      res.redirect('/admin/manageRecipes');
    } else {
      res.status(400).send('Invalid action');
    }
  } catch (err) {
    console.error('Error handling recipe management:', err);
    res.status(500).send('Internal Server Error');
  }
}

exports.handleVideoManagement = async (req, res) => {
  const { action, videoId, title, description, video_url, published } = req.body;

  try {
    if (action === 'delete') {
      await videoModel.deleteVideo(videoId);
      res.redirect('/admin/manageRecipes');
    } else if (action === 'add') {
      await videoModel.addVideo({
        title,
        description,
        video_url,
        published: published === 'on'
      });
      res.redirect('/admin/manageRecipes');
    } else if (action === 'edit') {
      await videoModel.updateVideo(videoId, {
        title,
        description,
        video_url,
        published: published === 'on'
      });
      res.redirect('/admin/manageRecipes');
    } else {
      res.status(400).send('Invalid action');
    }
  } catch (err) {
    console.error('Error handling video management:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Remove createRecipe, showCreateRecipeForm, updateRecipe methods
