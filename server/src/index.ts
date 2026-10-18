import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRouter } from './routes/apiRoutes.js';
import { checkDatabaseConnection } from './prisma.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Search for server/.env across common launch directories
const envCandidates = [
  path.resolve(__dirname, '../.env'),           // running from server/src or server/dist
  path.resolve(__dirname, '../../server/.env'),  // running from nested dist/src
  path.resolve(process.cwd(), 'server/.env'),   // running from repository root
  path.resolve(process.cwd(), '.env'),          // running from server directory
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
dotenv.config(); // fallback

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, mobile, health checks) or any localhost port
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(cookieParser());
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

  // Validate Google OAuth 2.0 configuration
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const isConfigured = Boolean(
    clientId &&
    clientSecret &&
    clientId.length > 5 &&
    clientSecret.length > 5 &&
    !clientId.startsWith('YOUR_') &&
    !clientSecret.startsWith('YOUR_')
  );

  if (isConfigured) {
    console.log(`✅ [Google OAuth] Configured and active (Client ID: ${clientId?.substring(0, 15)}...)`);
    console.log(`   Authorized Redirect URI: ${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'}\n`);
  } else {
    const missing = [];
    if (!clientId || clientId.length <= 5 || clientId.startsWith('YOUR_')) missing.push('GOOGLE_CLIENT_ID');
    if (!clientSecret || clientSecret.length <= 5 || clientSecret.startsWith('YOUR_')) missing.push('GOOGLE_CLIENT_SECRET');
    console.log(`⚠️  [Google OAuth] Credentials not fully configured. Missing: ${missing.join(', ')}`);
    console.log(`👉 To enable real Google Sign-In: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env\n`);
  }
});

