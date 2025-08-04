const RecipeModel = require('../models/recipeModel');
const videoModel = require('../models/videoModel');

exports.getDashboard = async (req, res) => {
  try {
    // Fetch limited number of published recipes and videos for dashboard
    const recipes = await RecipeModel.find({ published: true }).limit(5);
    let videos = await videoModel.getPublishedVideos();
    videos = videos.slice(0, 5); // Limit to 5 videos
    res.render('user/dashboard', { title: 'User Dashboard', recipes, videos });
  } catch (err) {
    console.error('Error fetching published recipes or videos for dashboard:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Handle recipe creation
exports.postRecipe = async (req, res) => {
  try {
    const { title, imageUrl, ...otherFields } = req.body;

    // Validate the image URL
    let finalImageUrl = imageUrl;
    if (!imageUrl) {
      finalImageUrl = '/images/default-food.jpg'; // Default image
    } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      finalImageUrl = `/${imageUrl}`; // Ensure proper path
    }

    const newRecipe = new RecipeModel({
      title,
      imageUrl: finalImageUrl,
      ...otherFields
    });

    await newRecipe.save();
    res.redirect('/user/dashboard');
  } catch (err) {
    console.error('Error creating recipe:', err);
    res.status(500).send('Internal Server Error');
  }
};


// Render login page
exports.getLogin = (req, res) => {
  res.render('landing/login', { title: 'Login', message: null });
};

// Render register page
exports.getRegister = (req, res) => {
  res.render('landing/register', { title: 'Register', message: null });
};

const { sendVerificationEmail, sendPasswordResetEmail, transporter } = require('../utils/emailService');
const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Handle register form submission
exports.postRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (email && password && name) {
    try {
      // Check if user already exists
      const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser) {
        return res.render('landing/register', { title: 'Register', message: 'Email is already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Insert user into database with is_verified false
      await db.none(
        'INSERT INTO users (name, email, password, role, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5, $6)',
        [name, email, hashedPassword, role || 'user', false, verificationToken]
      );

      // Generate verification link
      const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`;

      // Send verification email
      await sendVerificationEmail(email, name, verificationLink);

      // Redirect to login with success message
      res.render('landing/login', { title: 'Login', message: 'Registration successful! Please check your email to verify your account.' });
    } catch (error) {
      console.error('Error during registration:', error);
      if (error.message && error.message.includes('sending verification email')) {
        return res.render('landing/register', { title: 'Register', message: 'Failed to send verification email. Please try again.' });
      }
      res.render('landing/register', { title: 'Register', message: 'An error occurred during registration. Please try again.' });
    }
  } else {
    res.render('landing/register', { title: 'Register', message: 'Please fill all required fields' });
  }
};

// Remove postLogin as passport local strategy is used now
exports.postLogin = (req, res) => {
  res.redirect('/user/dashboard');
};

// Render recipes page
exports.getRecipes = async (req, res) => {
  try {
    const recipes = await RecipeModel.find({ published: true });
    res.render('user/recipes', { title: 'Recipes', recipes });
  } catch (err) {
    console.error('Error fetching published recipes:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      return res.status(404).send('Recipe not found');
    }
    res.render('user/recipe', { title: recipe.title, recipe });
  } catch (err) {
    console.error('Error fetching recipe by id:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Render videos page
exports.getVideos = async (req, res) => {
  try {
    const videos = await videoModel.getPublishedVideos();
    res.render('user/videos', { title: 'Videos', videos });
  } catch (err) {
    console.error('Error fetching published videos:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Handle user logout
exports.logout = (req, res) => {
  // Clear session or token logic here
  res.redirect('/');
};

// Handle email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.render('landing/login', { title: 'Login', message: 'Invalid or missing verification token.' });
  }

  try {
    // Find user with the verification token
    const user = await db.oneOrNone('SELECT * FROM users WHERE verification_token = $1', [token]);

    if (!user) {
      return res.render('landing/login', { title: 'Login', message: 'Invalid or expired verification token.' });
    }

    // Update user to set is_verified true and clear verification_token
    await db.none('UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1', [user.id]);

    res.render('landing/login', { title: 'Login', message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.render('landing/login', { title: 'Login', message: 'An error occurred during email verification. Please try again.' });
  }
};

// Render forgot password page
exports.getForgotPassword = (req, res) => {
  res.render('landing/forgot_password', { title: 'Forgot Password', message: null });
} ;

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.render('landing/forgot_password', { title: 'Forgot Password', message: 'Please enter your email' });
  }
  try {
    // Check if user exists
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.render('landing/forgot_password', { title: 'Forgot Password', message: 'Email not found' });
    }

    // Generate reset token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token and expiry in database
    await db.none('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [resetToken, resetTokenExpiry, email]);

    // Generate reset link
    const resetLink = `http://localhost:3000/reset_password?token=${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail(email, resetLink);
    res.render('landing/forgot_password', { title: 'Forgot Password', message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Error during forgot password:', error);
    res.render('landing/forgot_password', { title: 'Forgot Password', message: 'An error occurred. Please try again.' });
  }
};

// Render reset password page
exports.getResetPassword = (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.render('landing/login', { title: 'Login', message: 'Invalid or missing password reset token.' });
  }
  res.render('landing/reset_password', { title: 'Reset Password', token, message: null });
};

// Handle reset password form submission
exports.postResetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (!token || !password || !confirmPassword) {
    return res.render('landing/reset_password', { title: 'Reset Password', token, message: 'Please fill all required fields' });
  }
  if (password !== confirmPassword) {
    return res.render('landing/reset_password', { title: 'Reset Password', token, message: 'Passwords do not match' });
  }
  try {
    // Find user by reset token and check expiry
    const user = await db.oneOrNone('SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
    if (!user) {
      return res.render('landing/login', { title: 'Login', message: 'Invalid or expired password reset token.' });
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update user's password and clear reset token and expiry
    await db.none('UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hashedPassword, user.id]);
    res.render('landing/login', { title: 'Login', message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.render('landing/reset_password', { title: 'Reset Password', token, message: 'An error occurred. Please try again.' });
  }
};
