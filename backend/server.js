import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import uploadRouter from './routes/upload.js';

const app = express();
const isVercel = !!process.env.VERCEL;

app.use(
  cors({
    origin: isVercel ? true : ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/upload', uploadRouter);
app.use('/api/chat', chatRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

// Local dev only — Vercel uses the exported app, not listen()
if (!isVercel) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}

export default app;
