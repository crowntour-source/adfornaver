import express from 'express';
import scheduler from '../services/scheduler.js';
import { systemSettings } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/scheduler/status
 * 스케줄러 상태 조회
 */
router.get('/status', (req, res) => {
  try {
    const status = scheduler.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scheduler/start
 * 스케줄러 시작
 */
router.post('/start', async (req, res) => {
  try {
    // 시스템 설정에서 자동입찰 활성화
    await systemSettings.update({ autoBidEnabled: true });

    await scheduler.start();

    res.json({
      success: true,
      message: '자동 입찰 스케줄러가 시작되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scheduler/stop
 * 스케줄러 중지
 */
router.post('/stop', async (req, res) => {
  try {
    // 시스템 설정에서 자동입찰 비활성화
    await systemSettings.update({ autoBidEnabled: false });

    scheduler.stop();

    res.json({
      success: true,
      message: '자동 입찰 스케줄러가 중지되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scheduler/restart
 * 스케줄러 재시작
 */
router.post('/restart', async (req, res) => {
  try {
    await scheduler.restart();

    res.json({
      success: true,
      message: '자동 입찰 스케줄러가 재시작되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scheduler/run/:grade
 * 특정 등급 즉시 실행 (수동 트리거)
 */
router.post('/run/:grade', async (req, res) => {
  try {
    const { grade } = req.params;

    if (!['A', 'B', 'C', 'all'].includes(grade)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 등급입니다 (A, B, C, all)'
      });
    }

    if (grade === 'all') {
      await scheduler.runAll();
    } else {
      await scheduler.runGrade(grade);
    }

    res.json({
      success: true,
      message: `${grade}등급 자동 입찰이 실행되었습니다`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
