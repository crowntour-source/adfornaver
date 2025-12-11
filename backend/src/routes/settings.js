import express from 'express';
import { apiSettings, systemSettings, rankCheckSettings } from '../database/db.js';
import rankChecker from '../services/rankChecker.js';

const router = express.Router();

/**
 * GET /api/settings/api
 * API 설정 조회
 */
router.get('/api', async (req, res) => {
  try {
    const settings = await apiSettings.get();

    // 보안을 위해 실제 키 값은 마스킹
    res.json({
      success: true,
      settings: {
        customerId: settings.customerId ? '***' + settings.customerId.slice(-4) : null,
        accessLicense: settings.accessLicense ? settings.accessLicense.slice(0, 10) + '***' : null,
        secretKey: settings.secretKey ? '***' : null,
        isConfigured: settings.isConfigured
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/settings/api
 * API 설정 업데이트
 */
router.put('/api', async (req, res) => {
  try {
    const { customerId, accessLicense, secretKey } = req.body;

    const updated = await apiSettings.set({
      customerId,
      accessLicense,
      secretKey
    });

    res.json({
      success: true,
      message: 'API 설정이 저장되었습니다',
      isConfigured: updated.isConfigured
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/settings/system
 * 시스템 설정 조회
 */
router.get('/system', async (req, res) => {
  try {
    const settings = await systemSettings.get();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/settings/system
 * 시스템 설정 업데이트
 */
router.put('/system', async (req, res) => {
  try {
    const updates = req.body;
    const updated = await systemSettings.update(updates);

    res.json({
      success: true,
      message: '시스템 설정이 저장되었습니다',
      settings: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/settings/rank-check
 * 순위 확인 설정 조회
 */
router.get('/rank-check', async (req, res) => {
  try {
    const settings = await rankChecker.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/settings/rank-check
 * 순위 확인 설정 업데이트
 */
router.put('/rank-check', async (req, res) => {
  try {
    const updates = req.body;
    await rankChecker.updateSettings(updates);

    res.json({
      success: true,
      message: '순위 확인 설정이 저장되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
