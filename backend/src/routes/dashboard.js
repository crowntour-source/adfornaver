import express from 'express';
import { adGroups, keywords, bidLogs, systemSettings } from '../database/db.js';

const router = express.Router();

/**
 * GET /api/dashboard/overview
 * 전체 시스템 개요 정보
 */
router.get('/overview', async (req, res) => {
  try {
    const allKeywords = await keywords.getAll();
    const allAdGroups = await adGroups.getAll();
    const allBidLogs = await bidLogs.getAll();
    const settings = await systemSettings.get();

    // 키워드 통계
    const totalKeywords = allKeywords.length;
    const activeKeywords = allKeywords.filter(k => k.autoBidEnabled).length;
    const pausedKeywords = allKeywords.filter(k => !k.autoBidEnabled).length;

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

    // 지난 24시간 입찰 로그
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentLogs = allBidLogs.filter(log => new Date(log.timestamp) >= yesterday);

    const last24Hours = {
      totalBids: recentLogs.length,
      increased: recentLogs.filter(log => log.action === 'increased').length,
      decreased: recentLogs.filter(log => log.action === 'decreased').length,
      maintained: recentLogs.filter(log => log.action === 'maintained').length
    };

    // 평균 입찰가
    const avgBid = allKeywords.length > 0
      ? Math.round(allKeywords.reduce((sum, k) => sum + (k.currentBid || 70), 0) / allKeywords.length)
      : 70;

    // 예상 일일 비용
    const estimatedDailyCost = activeKeywords * avgBid;

    res.json({
      success: true,
      data: {
        system: {
          autoBidEnabled: settings?.autoBidEnabled || false,
          lastUpdate: new Date().toISOString(),
          status: settings?.autoBidEnabled ? 'running' : 'paused'
        },
        keywords: {
          total: totalKeywords,
          active: activeKeywords,
          paused: pausedKeywords,
          avgBid,
          estimatedDailyCost
        },
        gradeStats,
        last24Hours,
        adGroups: {
          total: allAdGroups.length,
          active: allAdGroups.filter(g => g.status === 'active').length
        }
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: '대시보드 데이터 조회 실패',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/keywords
 * 키워드 목록 및 상세 정보
 */
router.get('/keywords', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, grade, adGroupId } = req.query;

    let allKeywords = await keywords.getAll();
    const allAdGroups = await adGroups.getAll();

    // 필터링
    if (status === 'active') {
      allKeywords = allKeywords.filter(k => k.autoBidEnabled);
    } else if (status === 'paused') {
      allKeywords = allKeywords.filter(k => !k.autoBidEnabled);
    }

    if (grade) {
      allKeywords = allKeywords.filter(k => k.grade === grade);
    }

    if (adGroupId) {
      allKeywords = allKeywords.filter(k => k.adGroupId === adGroupId);
    }

    // 광고그룹 정보 추가
    const keywordsWithGroup = allKeywords.map(k => {
      const group = allAdGroups.find(g => g.id === k.adGroupId);
      return {
        ...k,
        adGroupName: group?.name || '알 수 없음',
        adGroupStatus: group?.status || 'unknown'
      };
    });

    // 페이지네이션
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedKeywords = keywordsWithGroup.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        keywords: paginatedKeywords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(keywordsWithGroup.length / parseInt(limit)),
          totalItems: keywordsWithGroup.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Dashboard keywords error:', error);
    res.status(500).json({
      success: false,
      message: '키워드 목록 조회 실패',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/adgroups
 * 광고그룹 목록 및 통계
 */
router.get('/adgroups', async (req, res) => {
  try {
    const allAdGroups = await adGroups.getAll();
    const allKeywords = await keywords.getAll();

    const adGroupsWithStats = allAdGroups.map(group => {
      const groupKeywords = allKeywords.filter(k => k.adGroupId === group.id);
      const activeKeywords = groupKeywords.filter(k => k.autoBidEnabled);

      const avgBid = groupKeywords.length > 0
        ? Math.round(groupKeywords.reduce((sum, k) => sum + (k.currentBid || 70), 0) / groupKeywords.length)
        : 0;

      return {
        id: group.id,
        name: group.name,
        naverGroupId: group.naverGroupId,
        status: group.status,
        type: group.type,
        totalKeywords: groupKeywords.length,
        activeKeywords: activeKeywords.length,
        avgBid,
        estimatedCost: activeKeywords.length * avgBid
      };
    });

    res.json({
      success: true,
      data: adGroupsWithStats
    });
  } catch (error) {
    console.error('Dashboard ad groups error:', error);
    res.status(500).json({
      success: false,
      message: '광고그룹 목록 조회 실패',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/recent-logs
 * 최근 입찰 로그
 */
router.get('/recent-logs', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const allBidLogs = await bidLogs.getAll();
    const allKeywords = await keywords.getAll();

    // 최신순 정렬
    const sortedLogs = [...allBidLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    // 키워드 정보 추가
    const logsWithKeywords = sortedLogs.map(log => {
      const keyword = allKeywords.find(k => k.id === log.keywordId);
      return {
        ...log,
        keywordName: keyword?.keyword || '알 수 없음'
      };
    });

    res.json({
      success: true,
      data: logsWithKeywords
    });
  } catch (error) {
    console.error('Dashboard recent logs error:', error);
    res.status(500).json({
      success: false,
      message: '입찰 로그 조회 실패',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/bid-chart
 * 입찰가 변동 차트 데이터
 */
router.get('/bid-chart', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const allBidLogs = await bidLogs.getAll();

    const now = new Date();
    const startTime = new Date(now.getTime() - parseInt(hours) * 60 * 60 * 1000);

    // 시간대별 입찰 통계
    const recentLogs = allBidLogs.filter(log => new Date(log.timestamp) >= startTime);

    // 1시간 간격으로 그룹화
    const hourlyData = [];
    for (let i = parseInt(hours); i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - (i - 1) * 60 * 60 * 1000);

      const hourLogs = recentLogs.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= hourStart && logTime < hourEnd;
      });

      hourlyData.push({
        time: hourStart.toISOString(),
        totalBids: hourLogs.length,
        increased: hourLogs.filter(l => l.action === 'increased').length,
        decreased: hourLogs.filter(l => l.action === 'decreased').length,
        avgBid: hourLogs.length > 0
          ? Math.round(hourLogs.reduce((sum, l) => sum + l.newBid, 0) / hourLogs.length)
          : 0
      });
    }

    res.json({
      success: true,
      data: hourlyData
    });
  } catch (error) {
    console.error('Dashboard bid chart error:', error);
    res.status(500).json({
      success: false,
      message: '입찰 차트 데이터 조회 실패',
      error: error.message
    });
  }
});

export default router;
