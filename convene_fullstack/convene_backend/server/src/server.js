import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, env: env.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// 404
app.use((req, res, next) => {
  if (res.headersSent) return next();
  res.status(404).json({ error: 'Not found' });
});

// error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`🚀 Convene API listening on port ${env.port}`);
  });
};

start();
