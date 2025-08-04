const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const passport = require('passport');

// Render user dashboard
router.get('/dashboard', userController.getDashboard);

// Add login routes
router.get('/login', userController.getLogin);
router.post('/login', passport.authenticate('local', {
  successRedirect: '/user/dashboard',
  failureRedirect: '/user/login',
  failureFlash: true
}));

// Google OAuth login routes with role parameter
router.get('/auth/google', (req, res, next) => {
  const role = req.query.role || 'user';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role
  })(req, res, next);
});

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/user/login' }),
  (req, res) => {
    // Successful authentication, redirect based on role
    if (req.user && req.user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/user/dashboard');
    }
  });

// Add register routes
router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);

// Recipe routes
router.get('/recipes', userController.getRecipes);
router.get('/recipes/:id', userController.getRecipeById);
router.post('/recipes', (req, res) => {
  res.status(501).send('Not implemented');
});

// Video routes
router.get('/videos', userController.getVideos);
router.post('/videos', (req, res) => {
  res.status(501).send('Not implemented');
});

// Logout route
router.get('/logout', userController.logout);

// Password reset routes
router.get('/forgot_password', userController.getForgotPassword);
router.post('/forgot_password', userController.postForgotPassword);

// Email verification route
router.get('/verify', userController.verifyEmail);

module.exports = router;
