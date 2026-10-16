require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const aiRoutes = require('./routes/aiRoutes');
const shareRoutes = require('./routes/shareRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const accessLogRoutes = require('./routes/accessLogRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure uploads directory exists and serve files
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/access-logs', accessLogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Smriti Healthcare Continuity Platform API',
    tagline: 'Your health, remembered.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Auto-seed if database is empty on start
try {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (!userCount || userCount.count === 0) {
    console.log('No users found in database. Initializing preloaded demo data...');
    const seed = require('./seed/seedData');
    seed();
  }
} catch (e) {
  console.warn('Auto-seed check notice:', e.message);
}

app.listen(PORT, () => {
  console.log(`🌿 Smriti backend running on http://localhost:${PORT}`);
  console.log(`📄 Health check available at http://localhost:${PORT}/api/health`);
});
