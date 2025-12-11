import express from 'express';
import { keywords, bidLogs } from '../database/db.js';
import biddingAlgorithm from '../services/biddingAlgorithm.js';
import rankChecker from '../services/rankChecker.js';

const router = express.Router();

/**
 * GET /api/keywords
 * 모든 키워드 목록 조회
 */
router.get('/', async (req, res) => {
  try {
    const { grade, adGroupId } = req.query;

    let allKeywords = await keywords.getAll();

    // 등급 필터
    if (grade) {
      allKeywords = allKeywords.filter(k => k.grade === grade);
    }

    // 광고 그룹 필터
    if (adGroupId) {
      allKeywords = allKeywords.filter(k => k.adGroupId === adGroupId);
    }

    res.json({ success: true, keywords: allKeywords });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/keywords/:id
 * 특정 키워드 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const keyword = await keywords.getById(req.params.id);

    if (!keyword) {
      return res.status(404).json({
        success: false,
        error: '키워드를 찾을 수 없습니다'
      });
    }

    res.json({ success: true, keyword });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/keywords/:id
 * 키워드 설정 업데이트
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedKeyword = await keywords.update(id, updates);

    if (!updatedKeyword) {
      return res.status(404).json({
        success: false,
        error: '키워드를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      keyword: updatedKeyword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/keywords/:id/check-rank
 * 특정 키워드의 순위 확인
 */
router.post('/:id/check-rank', async (req, res) => {
  try {
    const keyword = await keywords.getById(req.params.id);

    if (!keyword) {
      return res.status(404).json({
        success: false,
        error: '키워드를 찾을 수 없습니다'
      });
    }

    const rankResult = await rankChecker.checkRank(keyword.keyword, req.body);

    // DB에 순위 업데이트
    if (rankResult.rank) {
      await keywords.update(keyword.id, {
        currentRank: rankResult.rank
      });
    }

    res.json({
      success: true,
      rank: rankResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/keywords/:id/manual-bid
 * 수동 입찰가 변경
 */
router.post('/:id/manual-bid', async (req, res) => {
  try {
    const keyword = await keywords.getById(req.params.id);

    if (!keyword) {
      return res.status(404).json({
        success: false,
        error: '키워드를 찾을 수 없습니다'
      });
    }

    const { newBid } = req.body;

    if (!newBid || newBid < 70) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 입찰가입니다 (최소 70원)'
      });
    }

    const result = await biddingAlgorithm.updateBid(
      keyword,
      newBid,
      keyword.currentRank,
      keyword.currentRank,
      '수동 입찰'
    );

    res.json({
      success: result.success,
      message: result.success ? '입찰가 변경 완료' : '입찰가 변경 실패',
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/keywords/:id/logs
 * 키워드 입찰 로그 조회
 */
router.get('/:id/logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await bidLogs.getByKeyword(req.params.id, parseInt(limit));

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/keywords/batch-update
 * 여러 키워드 일괄 업데이트
 */
router.post('/batch-update', async (req, res) => {
  try {
    const { keywords: keywordUpdates } = req.body;

    if (!Array.isArray(keywordUpdates)) {
      return res.status(400).json({
        success: false,
        error: 'keywords 배열이 필요합니다'
      });
    }

    const results = [];
    for (const update of keywordUpdates) {
      const result = await keywords.update(update.id, update.data);
      results.push(result);
    }

    res.json({
      success: true,
      updated: results.filter(r => r !== null).length,
      total: keywordUpdates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
