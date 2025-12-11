import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import campaignsRouter from './routes/campaigns.js';
import keywordsRouter from './routes/keywords.js';
import settingsRouter from './routes/settings.js';
import biddingRouter from './routes/bidding.js';
import schedulerRouter from './routes/scheduler.js';
import adgroupsRouter from './routes/adgroups.js';
import dashboardRouter from './routes/dashboard.js';

// Import scheduler
import scheduler from './services/scheduler.js';
import { systemSettings } from './database/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== 전역 에러 핸들러 추가 (프로그램 종료 방지) =====
// Unhandled Promise Rejection 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection 발생:');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('프로그램을 계속 실행합니다...\n');
  // 프로세스를 종료하지 않고 계속 실행
});

// Uncaught Exception 처리
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception 발생:');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('프로그램을 계속 실행합니다...\n');
  // 프로세스를 종료하지 않고 계속 실행
});

// 프로세스 종료 시그널 처리 (graceful shutdown)
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM 시그널 수신. 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📛 SIGINT 시그널 수신 (Ctrl+C). 서버를 종료합니다...');
  process.exit(0);
});
// ===== 전역 에러 핸들러 끝 =====

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Naver Ads Auto Bidding API'
  });
});

// API Routes
app.use('/api/campaigns', campaignsRouter);
app.use('/api/keywords', keywordsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/bidding', biddingRouter);
app.use('/api/scheduler', schedulerRouter);
app.use('/api/adgroups', adgroupsRouter);
app.use('/api/dashboard', dashboardRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

  // 자동 입찰 스케줄러 시작 (설정에 따라)
  try {
    const settings = await systemSettings.get();
    if (settings && settings.autoBidEnabled) {
      await scheduler.start();
    } else {
      console.log('\n⏸️  자동 입찰이 비활성화되어 있습니다.');
      console.log('   활성화하려면 시스템 설정에서 자동입찰을 켜거나');
      console.log('   POST /api/scheduler/start 를 호출하세요.\n');
    }
  } catch (error) {
    console.log('\n⏸️  자동 입찰이 비활성화되어 있습니다.');
    console.log('   활성화하려면 POST /api/scheduler/start 를 호출하세요.\n');
  }
});

export default app;
