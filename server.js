// Express server setup
const express = require('express');
const path = require('path'); // Standardized to lowercase 'path'
const dotenv = require('dotenv');
const connectDB = require('./database/mongo');
const { createUserTable } = require('./models/userModel');
const { createVideoTable } = require('./models/videoModel');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('Starting server...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');
    
    // View engine setup
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    
    // Middleware
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json()); // Added JSON parser

    // Session configuration
    app.use(session({
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Route imports with error handling
    console.log('Loading routes...');
    
    try {
      const adminRoutes = require('./routes/adminRoutes');
      console.log('Admin routes loaded successfully');
      app.use('/admin', adminRoutes);
    } catch (err) {
      console.error('Error loading admin routes:', err);
    }
    
    try {
      const userRoutes = require('./routes/userRoutes');
      console.log('User routes loaded successfully');
      app.use('/user', userRoutes);
    } catch (err) {
      console.error('Error loading user routes:', err);
    }
    
    try {
      const recipeRoutes = require('./routes/recipeRoutes');
      console.log('Recipe routes loaded successfully');
      app.use('/recipes', recipeRoutes);
    } catch (err) {
      console.error('Error loading recipe routes:', err);
    }

    // Redirect routes
    app.get('/manageRecipes', (req, res) => res.redirect('/admin/manageRecipes'));
    app.get('/manageUsers', (req, res) => res.redirect('/admin/manageUsers'));
    app.get('/login', (req, res) => res.redirect('/user/login'));

    // User controller routes
    const userController = require('./controllers/userController');
    app.route('/register')
      .get(userController.getRegister)
      .post(userController.postRegister);
    
    app.route('/forgot_password')
      .get(userController.getForgotPassword)
      .post(userController.postForgotPassword);
    
    app.route('/reset_password')
      .get(userController.getResetPassword)
      .post(userController.postResetPassword);
    
    app.get('/verify', userController.verifyEmail);

    // Home route
    app.get('/', (req, res) => {
      res.render('landing/home', { 
        title: 'Welcome to Recipe App',
        user: req.user || null 
      });
    });

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).render('error', { error: err });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).render('error', { 
        message: 'Page not found' 
      });
    });

    // Initialize database tables
    await createUserTable();
    await createVideoTable();
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();