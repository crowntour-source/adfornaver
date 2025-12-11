import express from 'express';
import naverAdsClient from '../api/naverAdsClient.js';
import { adGroups as adGroupsDb } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/adgroups
 * 광고 그룹 목록 조회 (네이버 API에서 가져오기)
 */
router.get('/', async (req, res) => {
  try {
    const { campaignId } = req.query;

    // 네이버 API에서 광고 그룹 조회
    const naverAdGroups = await naverAdsClient.getAdGroups(campaignId || null);

    // 응답 데이터 포맷팅
    const formattedGroups = naverAdGroups.map((group, index) => ({
      id: group.nccAdgroupId,
      naverGroupId: group.nccAdgroupId,
      campaignId: group.nccCampaignId,
      name: group.name || '그룹명',
      groupName: group.name || '그룹명',
      status: group.userLock ? 'OFF' : 'ON',
      region: '서울', // 네이버 API에서 제공하는 경우 해당 값 사용
      keywordCount: 0, // 별도로 조회 필요
      pcChannelId: group.pcChannelId || null,
      mobileChannelId: group.mobileChannelId || null,
      contentsNetworkBidAmt: group.contentsNetworkBidAmt || 0
    }));

    res.json({
      success: true,
      adGroups: formattedGroups,
      total: formattedGroups.length
    });
  } catch (error) {
    console.error('광고 그룹 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'API 키를 확인하거나 네이버 광고 계정 설정을 확인해주세요'
    });
  }
});

/**
 * GET /api/adgroups/:adGroupId/keywords
 * 특정 광고 그룹의 키워드 목록 조회
 */
router.get('/:adGroupId/keywords', async (req, res) => {
  try {
    const { adGroupId } = req.params;

    // 네이버 API에서 키워드 조회
    const naverKeywords = await naverAdsClient.getKeywordsByGroup(adGroupId);

    // 응답 데이터 포맷팅
    const formattedKeywords = naverKeywords.map((kw, index) => ({
      id: kw.nccKeywordId,
      naverKeywordId: kw.nccKeywordId,
      adGroupId: adGroupId,
      keyword: kw.keyword,
      status: kw.status === 'ELIGIBLE' ? 'ON' : 'OFF',
      currentBid: kw.bidAmt || 70,
      targetRank: 5,
      targetRankMin: 4,
      targetRankMax: 6,
      currentRank: null, // 별도로 순위 체크 필요
      clicks: 0, // 통계 API로 별도 조회 필요
      impressions: 0,
      ctr: 0,
      grade: 'B',
      autoBidEnabled: false,
      bidLimitMin: 70,
      bidLimitMax: 10000,
      useGroupBidAmt: kw.useGroupBidAmt || false,
      inspectStatus: kw.inspectStatus || 'UNDER_REVIEW',
      nccQualityIndex: kw.nccQualityIndex || null
    }));

    res.json({
      success: true,
      keywords: formattedKeywords,
      total: formattedKeywords.length
    });
  } catch (error) {
    console.error('키워드 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/adgroups/:adGroupId/keywords/:keywordId/bid
 * 키워드 입찰가 변경
 */
router.put('/:adGroupId/keywords/:keywordId/bid', async (req, res) => {
  try {
    const { adGroupId, keywordId } = req.params;
    const { newBid } = req.body;

    if (!newBid || newBid < 70) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 입찰가입니다 (최소 70원)'
      });
    }

    // 네이버 API에 입찰가 변경 요청
    const result = await naverAdsClient.updateKeywordBid(keywordId, adGroupId, newBid);

    res.json({
      success: true,
      message: '입찰가가 변경되었습니다',
      data: result
    });
  } catch (error) {
    console.error('입찰가 변경 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/adgroups/:adGroupId/keywords/:keywordId/check-rank
 * 키워드 순위 확인
 */
router.post('/:adGroupId/keywords/:keywordId/check-rank', async (req, res) => {
  try {
    const { keywordId } = req.params;
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '키워드가 필요합니다'
      });
    }

    // 순위 확인 (현재는 Mock)
    const rankResult = await naverAdsClient.checkKeywordRank(keyword, req.body);

    res.json({
      success: true,
      rank: rankResult
    });
  } catch (error) {
    console.error('순위 확인 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
