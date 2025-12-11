import express from 'express';
import naverAdsClient from '../api/naverAdsClient.js';
import { adGroups, keywords as keywordsDb } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/campaigns
 * 캠페인 목록 조회
 */
router.get('/', async (req, res) => {
  try {
    const campaigns = await naverAdsClient.getCampaigns();
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/campaigns/:campaignId/adgroups
 * 특정 캠페인의 광고 그룹 목록 조회
 */
router.get('/:campaignId/adgroups', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const groups = await naverAdsClient.getAdGroups(campaignId);
    res.json({ success: true, adGroups: groups });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/campaigns/sync
 * 네이버 광고 데이터를 로컬 DB와 동기화
 */
router.post('/sync', async (req, res) => {
  try {
    // 1. 광고 그룹 동기화
    const naverAdGroups = await naverAdsClient.getAdGroups();

    const syncedGroups = await adGroups.sync(
      naverAdGroups.map(group => ({
        naverGroupId: group.nccAdgroupId,
        name: group.name,
        status: group.userLock ? 'paused' : 'active'
      }))
    );

    // 2. 각 광고 그룹의 키워드 동기화
    let totalKeywords = 0;
    for (const group of syncedGroups) {
      try {
        const naverKeywords = await naverAdsClient.getKeywordsByGroup(group.naverGroupId);

        await keywordsDb.sync(
          group.id,
          naverKeywords.map(kw => ({
            naverKeywordId: kw.nccKeywordId,
            keyword: kw.keyword,
            currentBid: kw.bidAmt || 0,
            naverStatus: kw.status || 'AVAILABLE'
          }))
        );

        totalKeywords += naverKeywords.length;
      } catch (error) {
        console.error(`광고 그룹 ${group.name} 키워드 동기화 실패:`, error.message);
      }
    }

    res.json({
      success: true,
      message: '동기화 완료',
      stats: {
        adGroups: syncedGroups.length,
        keywords: totalKeywords
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
