const express = require('express');
const cors = require('cors');

// Create Express application
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Base API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'EcoTrack API is working', 
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple test server is running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
