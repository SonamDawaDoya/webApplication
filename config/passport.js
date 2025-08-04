const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [id]);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Local strategy for email/password login
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }
    if (!user.is_verified) {
      return done(null, false, { message: 'Please verify your email before logging in.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/user/auth/google/callback',
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    // Get role from state parameter or default to 'user'
    const role = req.query.state || 'user';

    // Check if user exists
    let user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      // Generate a hashed placeholder password for Google OAuth users
      const placeholderPassword = 'google_oauth_user_placeholder';
      const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

      // Insert new user with hashed placeholder password and role from state
      user = await db.one(
        'INSERT INTO users (name, email, password, is_verified, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, hashedPassword, true, role]
      );
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
