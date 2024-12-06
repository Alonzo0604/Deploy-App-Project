const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { db } = require('./firebase');

require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const username = profile.displayName;
        const userId = uuidv4();

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          await userRef.set({
            id: userId,
            email,
            username,
            provider: 'google',
            createdAt: new Date()
          });
        }

        const user = userDoc.exists
          ? userDoc.data()
          : { userId, email, username, provider: 'google' };

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();
    done(null, userDoc.data());
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
