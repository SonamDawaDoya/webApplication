// Routes for admin
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Dashboard route
router.get('/dashboard', authMiddleware, adminController.getDashboard);

// Recipe management routes
router.get('/manageRecipes', authMiddleware, adminController.manageRecipes);
router.post('/manageRecipes', authMiddleware, adminController.handleRecipeManagement);

// User management routes
router.get('/manageUsers', authMiddleware, adminController.manageUsers);
router.post('/manageUsers', authMiddleware, adminController.handleUserManagement);

// Video management routes
router.post('/manageVideos', authMiddleware, adminController.handleVideoManagement);

// Placeholder routes for future implementation
router.get('/manageRecipes/new', authMiddleware, (req, res) => res.status(404).send('Not Found'));
router.post('/manageRecipes/new', authMiddleware, (req, res) => res.status(404).send('Not Found'));
router.post('/manageRecipes/edit', authMiddleware, (req, res) => res.status(404).send('Not Found'));
router.get('/manageUsers/new', authMiddleware, (req, res) => res.status(404).send('Not Found'));

module.exports = router;
