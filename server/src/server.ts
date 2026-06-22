import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/authRoutes';
import itineraryRoutes from './routes/itineraryRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Midddleware configuration
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);

// Base Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'AI Travel Planner API Server is fully operational' 
  });
});

// Catch-all route handler for 404
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start MongoDB and Express Server
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.log('No MONGO_URI specified in environment. Starting MongoMemoryServer fallback...');
      const memoryDb = await MongoMemoryServer.create();
      mongoUri = memoryDb.getUri();
      console.log(`Local in-memory MongoDB Server successfully spun up at: ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB database successfully');

    app.listen(PORT, () => {
      console.log(`Backend Express server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
