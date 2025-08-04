// Routes for recipes
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Recipe routes
router.get('/', recipeController.listRecipes);
router.get('/:id', recipeController.getRecipe);

module.exports = router;
