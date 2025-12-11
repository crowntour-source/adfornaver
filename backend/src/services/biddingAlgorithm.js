import naverAdsClient from '../api/naverAdsClient.js';
import { keywords, bidLogs } from '../database/db.js';

/**
 * 자동 입찰 알고리즘
 *
 * 엔비드 방식 기반:
 * - 순위 기반 입찰 (클릭 최대화가 아닌 목표 순위 달성)
 * - 최소 비용으로 원하는 순위 달성
 * - 10원 단위 가감
 * - 키워드 등급별 차별화된 모니터링 주기
 */
class BiddingAlgorithm {
  constructor() {
    this.MIN_BID = 70; // 최소 입찰가
    this.DEFAULT_INCREMENT = 10; // 기본 가감액
  }

  /**
   * 키워드의 입찰가를 계산
   * @param {Object} keyword - 키워드 정보
   * @param {number} currentRank - 현재 순위
   * @returns {Object} { shouldUpdate, newBid, reason }
   */
  async calculateBid(keyword, currentRank) {
    const {
      id,
      naverKeywordId,
      keyword: keywordText,
      currentBid,
      targetRankMin,
      targetRankMax,
      bidLimitMin,
      bidLimitMax,
      incrementAmount,
      grade,
      autoBidEnabled
    } = keyword;

    // 자동 입찰이 꺼져있으면 변경 안함
    if (!autoBidEnabled) {
      return {
        shouldUpdate: false,
        newBid: currentBid,
        reason: '자동입찰 비활성화'
      };
    }

    // 순위가 확인되지 않은 경우
    if (!currentRank || currentRank === null) {
      return {
        shouldUpdate: false,
        newBid: currentBid,
        reason: '순위 확인 불가'
      };
    }

    const increment = incrementAmount || this.DEFAULT_INCREMENT;
    let newBid = currentBid;
    let reason = '';

    // 목표 순위 범위 내에 있으면 유지
    if (currentRank >= targetRankMin && currentRank <= targetRankMax) {
      return {
        shouldUpdate: false,
        newBid: currentBid,
        reason: `목표 순위 달성 (${currentRank}위, 목표: ${targetRankMin}-${targetRankMax}위)`
      };
    }

    // 순위가 목표보다 낮으면 (숫자가 크면) 입찰가 올림
    if (currentRank > targetRankMax) {
      newBid = currentBid + increment;
      reason = `순위 향상 필요 (현재: ${currentRank}위, 목표: ${targetRankMin}-${targetRankMax}위)`;
    }

    // 순위가 목표보다 높으면 (숫자가 작으면) 입찰가 내림 (비용 절감)
    if (currentRank < targetRankMin) {
      // 등급에 따라 하락 전략 다르게 적용
      if (grade === 'A') {
        // A등급은 보수적으로 하락 (목표 순위 1위면 내리지 않음)
        if (targetRankMin > 1) {
          newBid = currentBid - increment;
          reason = `비용 절감 (현재: ${currentRank}위, 목표: ${targetRankMin}-${targetRankMax}위)`;
        } else {
          return {
            shouldUpdate: false,
            newBid: currentBid,
            reason: `목표 순위 근접 (A등급 보수 전략)`
          };
        }
      } else {
        // B, C등급은 적극적으로 비용 절감
        newBid = currentBid - increment;
        reason = `비용 절감 (현재: ${currentRank}위, 목표: ${targetRankMin}-${targetRankMax}위)`;
      }
    }

    // 입찰 한도 체크
    const minLimit = bidLimitMin || this.MIN_BID;
    const maxLimit = bidLimitMax || 100000;

    if (newBid < minLimit) {
      newBid = minLimit;
      reason += ' [최소 입찰가 제한]';
    }

    if (newBid > maxLimit) {
      newBid = maxLimit;
      reason += ' [최대 입찰가 제한]';
    }

    // 10원 단위로 반올림
    newBid = Math.round(newBid / 10) * 10;

    // 입찰가가 변경되지 않으면 업데이트 안함
    if (newBid === currentBid) {
      return {
        shouldUpdate: false,
        newBid: currentBid,
        reason: `입찰가 변경 없음 (한도 제한)`
      };
    }

    return {
      shouldUpdate: true,
      newBid,
      oldBid: currentBid,
      reason
    };
  }

  /**
   * 키워드 입찰가 실제 업데이트 및 로그 기록
   * @param {Object} keyword - 키워드 정보
   * @param {number} newBid - 새 입찰가
   * @param {number} oldRank - 이전 순위
   * @param {number} newRank - 새 순위
   * @param {string} reason - 변경 사유
   */
  async updateBid(keyword, newBid, oldRank, newRank, reason) {
    try {
      // 광고 그룹의 네이버 ID 가져오기
      const adGroupsDb = await import('../database/db.js').then(m => m.adGroups);
      const adGroup = await adGroupsDb.getAll().then(groups =>
        groups.find(g => g.id === keyword.adGroupId)
      );

      if (!adGroup) {
        throw new Error(`광고 그룹을 찾을 수 없습니다: ${keyword.adGroupId}`);
      }

      // 네이버 API에 입찰가 변경 요청
      await naverAdsClient.updateKeywordBid(keyword.naverKeywordId, adGroup.naverGroupId, newBid);

      // DB에 새 입찰가 저장
      await keywords.update(keyword.id, {
        currentBid: newBid,
        currentRank: newRank,
        lastBidTime: new Date().toISOString()
      });

      // 입찰 로그 기록
      await bidLogs.add({
        keywordId: keyword.id,
        keyword: keyword.keyword,
        oldRank,
        newRank,
        oldBid: keyword.currentBid,
        newBid,
        reason
      });

      console.log(`✅ [${keyword.keyword}] 입찰가 변경: ₩${keyword.currentBid} → ₩${newBid} (${reason})`);

      return { success: true };
    } catch (error) {
      console.error(`❌ [${keyword.keyword}] 입찰가 변경 실패:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 여러 키워드 일괄 입찰 처리
   * @param {Array} keywordsWithRanks - [{ keyword, currentRank }] 형식
   */
  async processBatch(keywordsWithRanks) {
    const results = {
      total: keywordsWithRanks.length,
      updated: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    for (const { keyword, currentRank } of keywordsWithRanks) {
      try {
        // 입찰가 계산
        const calculation = await this.calculateBid(keyword, currentRank);

        if (calculation.shouldUpdate) {
          // 입찰가 업데이트
          const updateResult = await this.updateBid(
            keyword,
            calculation.newBid,
            keyword.currentRank || currentRank,
            currentRank,
            calculation.reason
          );

          if (updateResult.success) {
            results.updated++;
          } else {
            results.failed++;
          }

          results.details.push({
            keyword: keyword.keyword,
            status: updateResult.success ? 'updated' : 'failed',
            oldBid: calculation.oldBid,
            newBid: calculation.newBid,
            reason: calculation.reason
          });
        } else {
          results.skipped++;
          results.details.push({
            keyword: keyword.keyword,
            status: 'skipped',
            reason: calculation.reason
          });
        }
      } catch (error) {
        results.failed++;
        console.error(`❌ [${keyword.keyword}] 처리 실패:`, error.message);
      }
    }

    console.log(`\n📊 일괄 입찰 완료: 전체 ${results.total}개, 변경 ${results.updated}개, 건너뜀 ${results.skipped}개, 실패 ${results.failed}개\n`);

    return results;
  }

  /**
   * 등급별 키워드 필터링
   * @param {string} grade - 'A', 'B', 'C'
   */
  async getKeywordsByGrade(grade) {
    const allKeywords = await keywords.getAll();
    return allKeywords.filter(k => k.grade === grade && k.autoBidEnabled);
  }

  /**
   * 마지막 입찰 시간 체크 (중복 실행 방지)
   * @param {Object} keyword - 키워드 정보
   * @param {number} intervalMinutes - 최소 간격 (분)
   */
  shouldProcess(keyword, intervalMinutes) {
    if (!keyword.lastBidTime) {
      return true; // 한 번도 입찰하지 않았으면 처리
    }

    const lastBidTime = new Date(keyword.lastBidTime);
    const now = new Date();
    const diffMinutes = (now - lastBidTime) / 1000 / 60;

    return diffMinutes >= intervalMinutes;
  }
}

// Singleton instance
const biddingAlgorithm = new BiddingAlgorithm();

export default biddingAlgorithm;
