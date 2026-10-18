import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/apiRoutes.js';
import { checkDatabaseConnection } from './prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/health', async (_req, res) => {
  const isDbConnected = await checkDatabaseConnection();
  res.json({
    status: 'ok',
    service: 'TradeWise Backend API',
    database: isDbConnected ? 'PostgreSQL Connected' : 'Database Offline or Unreachable',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Start Server
app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 TradeWise Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`======================================================\n`);

  const dbOk = await checkDatabaseConnection();
  if (dbOk) {
    console.log(`✅ [Database] PostgreSQL connected successfully!`);
  } else {
    console.log(`⚠️  [Database] Running without active PostgreSQL connection.`);
    console.log(`👉 To connect: set your DATABASE_URL in server/.env and run:`);
    console.log(`   cd server && npx prisma db push\n`);
  }
});
