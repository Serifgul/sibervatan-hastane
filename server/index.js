import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { createConnection } from './database.js';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import backupRoutes from './routes/backup.js';
import { verifyToken } from './middleware/auth.js';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "img-src 'self' data: https:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' data:; " +
    "connect-src 'self' http://localhost:3000 http://localhost:3001;"
  );
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Database connection
    await createConnection();
    console.log('Database initialized successfully');

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/patients', verifyToken, patientRoutes);
    app.use('/api/backup', verifyToken, backupRoutes);

    // Serve static files
    app.use(express.static(path.join(__dirname, '../dist')));
    app.use('/favicon.ico', express.static(path.join(__dirname, '../dist/favicon.ico')));

    // Serve index.html for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Admin credentials:');
      console.log('Username: admin');
      console.log('Password: password');
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();