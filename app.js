const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const passport = require('./config/passport');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Middleware Rate Limiter
app.use(apiLimiter);

app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', authRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// General error handler
app.use(errorHandler);

// Health check for debugging
app.get('/', (req, res) => res.send('API is running!'));

// Fallback route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
