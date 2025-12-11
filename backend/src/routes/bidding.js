import express from 'express';
import { keywords, bidLogs } from '../database/db.js';
import biddingAlgorithm from '../services/biddingAlgorithm.js';
import rankChecker from '../services/rankChecker.js';

const router = express.Router();

/**
 * POST /api/bidding/run
 * 자동 입찰 실행 (수동 트리거)
 */
router.post('/run', async (req, res) => {
  try {
    const { grade, keywordIds } = req.body;

    let targetKeywords = [];

    // 특정 키워드 ID가 지정된 경우
    if (keywordIds && Array.isArray(keywordIds)) {
      for (const id of keywordIds) {
        const keyword = await keywords.getById(id);
        if (keyword && keyword.autoBidEnabled) {
          targetKeywords.push(keyword);
        }
      }
    }
    // 등급별 키워드
    else if (grade) {
      targetKeywords = await biddingAlgorithm.getKeywordsByGrade(grade);
    }
    // 전체 자동입찰 활성화된 키워드
    else {
      const allKeywords = await keywords.getAll();
      targetKeywords = allKeywords.filter(k => k.autoBidEnabled);
    }

    if (targetKeywords.length === 0) {
      return res.json({
        success: true,
        message: '자동입찰이 활성화된 키워드가 없습니다',
        results: { total: 0, updated: 0, skipped: 0, failed: 0 }
      });
    }

    console.log(`\n🤖 자동 입찰 시작: ${targetKeywords.length}개 키워드\n`);

    // 1. 순위 확인
    const keywordsWithRanks = [];
    for (const keyword of targetKeywords) {
      const rankResult = await rankChecker.checkRank(keyword.keyword);

      if (rankResult.rank) {
        // DB에 순위 업데이트
        await keywords.update(keyword.id, {
          currentRank: rankResult.rank
        });

        keywordsWithRanks.push({
          keyword: { ...keyword, currentRank: rankResult.rank },
          currentRank: rankResult.rank
        });
      }
    }

    // 2. 입찰 실행
    const results = await biddingAlgorithm.processBatch(keywordsWithRanks);

    res.json({
      success: true,
      message: '자동 입찰 완료',
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/bidding/simulate
 * 입찰 시뮬레이션 (실제 변경 없이 계산만)
 */
router.post('/simulate', async (req, res) => {
  try {
    const { keywordId, currentRank } = req.body;

    if (!keywordId || currentRank === undefined) {
      return res.status(400).json({
        success: false,
        error: 'keywordId와 currentRank가 필요합니다'
      });
    }

    const keyword = await keywords.getById(keywordId);

    if (!keyword) {
      return res.status(404).json({
        success: false,
        error: '키워드를 찾을 수 없습니다'
      });
    }

    const calculation = await biddingAlgorithm.calculateBid(keyword, currentRank);

    res.json({
      success: true,
      simulation: {
        keyword: keyword.keyword,
        currentBid: keyword.currentBid,
        currentRank,
        targetRankMin: keyword.targetRankMin,
        targetRankMax: keyword.targetRankMax,
        ...calculation
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
 * GET /api/bidding/logs
 * 입찰 로그 조회
 */
router.get('/logs', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await bidLogs.getRecent(parseInt(limit));

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bidding/stats
 * 입찰 통계
 */
router.get('/stats', async (req, res) => {
  try {
    const allKeywords = await keywords.getAll();
    const logs = await bidLogs.getRecent(1000);

    // 등급별 통계
    const gradeStats = {
      A: {
        total: allKeywords.filter(k => k.grade === 'A').length,
        active: allKeywords.filter(k => k.grade === 'A' && k.autoBidEnabled).length
      },
      B: {
        total: allKeywords.filter(k => k.grade === 'B').length,
        active: allKeywords.filter(k => k.grade === 'B' && k.autoBidEnabled).length
      },
      C: {
        total: allKeywords.filter(k => k.grade === 'C').length,
        active: allKeywords.filter(k => k.grade === 'C' && k.autoBidEnabled).length
      }
    };

    // 최근 24시간 입찰 활동
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = logs.filter(log => new Date(log.timestamp) > oneDayAgo);

    res.json({
      success: true,
      stats: {
        totalKeywords: allKeywords.length,
        activeKeywords: allKeywords.filter(k => k.autoBidEnabled).length,
        gradeStats,
        last24Hours: {
          totalBids: recentLogs.length,
          increased: recentLogs.filter(log => log.newBid > log.oldBid).length,
          decreased: recentLogs.filter(log => log.newBid < log.oldBid).length
        }
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
