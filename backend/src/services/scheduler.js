import cron from 'node-cron';
import { systemSettings, keywords } from '../database/db.js';
import biddingAlgorithm from './biddingAlgorithm.js';
import rankChecker from './rankChecker.js';

/**
 * 자동 입찰 스케줄러
 *
 * 등급별로 다른 주기로 자동 입찰 실행:
 * - A등급: 5-10분 간격 (최대 10개)
 * - B등급: 30분 간격 (최대 100개)
 * - C등급: 1시간 간격 (최대 200개)
 */
class AutoBiddingScheduler {
  constructor() {
    this.jobs = {
      gradeA: null,
      gradeB: null,
      gradeC: null
    };
    this.isRunning = false;
  }

  /**
   * 스케줄러 시작
   */
  async start() {
    const settings = await systemSettings.get();

    if (!settings.autoBidEnabled) {
      console.log('⏸️  자동 입찰이 비활성화되어 있습니다.');
      return;
    }

    console.log('\n🤖 자동 입찰 스케줄러 시작...\n');

    // A등급: 5분마다 실행 (가장 중요한 키워드)
    this.jobs.gradeA = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.runForGrade('A');
      } catch (error) {
        console.error('❌ [A등급 스케줄러] 실행 중 에러 발생:', error.message);
        console.error('스택:', error.stack);
      }
    });

    // B등급: 30분마다 실행
    this.jobs.gradeB = cron.schedule('*/30 * * * *', async () => {
      try {
        await this.runForGrade('B');
      } catch (error) {
        console.error('❌ [B등급 스케줄러] 실행 중 에러 발생:', error.message);
        console.error('스택:', error.stack);
      }
    });

    // C등급: 1시간마다 실행
    this.jobs.gradeC = cron.schedule('0 * * * *', async () => {
      try {
        await this.runForGrade('C');
      } catch (error) {
        console.error('❌ [C등급 스케줄러] 실행 중 에러 발생:', error.message);
        console.error('스택:', error.stack);
      }
    });

    this.isRunning = true;

    console.log('✅ A등급 키워드: 5분마다 자동 입찰');
    console.log('✅ B등급 키워드: 30분마다 자동 입찰');
    console.log('✅ C등급 키워드: 1시간마다 자동 입찰\n');
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (this.jobs.gradeA) this.jobs.gradeA.stop();
    if (this.jobs.gradeB) this.jobs.gradeB.stop();
    if (this.jobs.gradeC) this.jobs.gradeC.stop();

    this.isRunning = false;

    console.log('⏹️  자동 입찰 스케줄러 중지');
  }

  /**
   * 특정 등급의 자동 입찰 실행
   * @param {string} grade - 'A', 'B', 'C'
   */
  async runForGrade(grade) {
    try {
      console.log(`\n⏰ [${grade}등급] 자동 입찰 시작 (${new Date().toLocaleString('ko-KR')})`);

      // 해당 등급의 키워드 가져오기
      const targetKeywords = await biddingAlgorithm.getKeywordsByGrade(grade);

      if (targetKeywords.length === 0) {
        console.log(`   ℹ️  ${grade}등급 키워드 없음`);
        return;
      }

      // 등급별 최대 개수 체크
      const settings = await systemSettings.get();
      const maxKeywords = {
        A: settings.maxKeywordsA || 10,
        B: settings.maxKeywordsB || 100,
        C: settings.maxKeywordsC || 200
      }[grade];

      if (targetKeywords.length > maxKeywords) {
        console.warn(`   ⚠️  ${grade}등급 키워드가 최대 개수(${maxKeywords}개)를 초과했습니다: ${targetKeywords.length}개`);
      }

      // 최소 간격 체크 (중복 실행 방지)
      const intervalMinutes = {
        A: 5,
        B: 30,
        C: 60
      }[grade];

      const processableKeywords = targetKeywords.filter(kw =>
        biddingAlgorithm.shouldProcess(kw, intervalMinutes)
      );

      if (processableKeywords.length === 0) {
        console.log(`   ℹ️  처리할 키워드 없음 (최소 간격 미달성)`);
        return;
      }

      console.log(`   📊 처리 대상: ${processableKeywords.length}개 키워드`);

      // 순위 확인 및 입찰
      const keywordsWithRanks = [];
      for (const keyword of processableKeywords) {
        try {
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

          // API 과부하 방지 딜레이
          await this._delay(500);
        } catch (error) {
          console.error(`   ❌ [${keyword.keyword}] 순위 확인 실패:`, error.message);
        }
      }

      // 입찰 실행
      const results = await biddingAlgorithm.processBatch(keywordsWithRanks);

      console.log(`   ✅ [${grade}등급] 완료: ${results.updated}개 변경, ${results.skipped}개 유지, ${results.failed}개 실패\n`);
    } catch (error) {
      console.error(`   ❌ [${grade}등급] 자동 입찰 실패:`, error.message);
    }
  }

  /**
   * 즉시 전체 등급 실행 (수동 트리거)
   */
  async runAll() {
    console.log('\n🚀 전체 자동 입찰 수동 실행\n');

    await this.runForGrade('A');
    await this.runForGrade('B');
    await this.runForGrade('C');

    console.log('✅ 전체 자동 입찰 완료\n');
  }

  /**
   * 특정 등급만 즉시 실행
   */
  async runGrade(grade) {
    await this.runForGrade(grade);
  }

  /**
   * 스케줄러 상태 조회
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: {
        gradeA: this.jobs.gradeA ? 'active' : 'inactive',
        gradeB: this.jobs.gradeB ? 'active' : 'inactive',
        gradeC: this.jobs.gradeC ? 'active' : 'inactive'
      }
    };
  }

  /**
   * 설정 변경에 따라 스케줄러 재시작
   */
  async restart() {
    console.log('🔄 스케줄러 재시작...');
    this.stop();
    await this._delay(1000);
    await this.start();
  }

  /**
   * 딜레이 헬퍼
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const scheduler = new AutoBiddingScheduler();

export default scheduler;
