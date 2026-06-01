const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth',  require('./authRoutes'));
app.use('/api/tasks', require('./taskRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TaskFlow API is running', timestamp: new Date().toISOString() });
});

// API docs
app.get('/api', (req, res) => {
  res.json({
    name: 'TaskFlow API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login':    'Login and get JWT token',
        'GET  /api/auth/me':       'Get current user (requires token)',
      },
      tasks: {
        'GET    /api/tasks':               'Get all tasks',
        'POST   /api/tasks':               'Create a task',
        'GET    /api/tasks/:id':           'Get a single task',
        'PUT    /api/tasks/:id':           'Update a task',
        'DELETE /api/tasks/:id':           'Delete a task',
        'GET    /api/tasks/stats/summary': 'Task counts by stage',
      }
    }
  });
});

// Serve frontend for any non-API route (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 TaskFlow running at http://localhost:${PORT}`);
  console.log(`📋 Open your browser → http://localhost:${PORT}\n`);
});

module.exports = app;
