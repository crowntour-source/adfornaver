import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import naverAdsClient from '../src/api/naverAdsClient.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');
const file = join(dataDir, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

await db.read();

const adGroups = db.data.adGroups || [];
const keywords = db.data.keywords || [];

console.log('\n🚀 롱테일 키워드 자동 추가 시작\n');
console.log('='.repeat(80));

// Long-tail suffixes for visa/travel services
const longTailSuffixes = {
  '비자': ['신청', '발급', '대행', '기간', '준비서류', '비용', '소요기간', '연장', '업체', '방법'],
  '여권': ['신청', '발급', '재발급', '연장', '분실신고', '준비서류', '비용', '대행업체'],
  '결혼': ['서류', '절차', '비용', '준비물', '대행', '신고절차', '번역공증'],
  '전자비자': ['신청방법', '발급기간', '준비서류', '비용', '온라인신청'],
  '인증': ['대행업체', '준비서류', '비용', '기간', '번역공증', '아포스티유'],
  '공증': ['대행', '준비서류', '비용', '번역', '업체'],
  '번역': ['공증', '대행', '업체', '비용']
};

// Statistics
const stats = {
  totalGenerated: 0,
  totalAdded: 0,
  totalFailed: 0,
  byGroup: {}
};

// Process each active ad group
for (const group of adGroups) {
  // Skip paused groups
  if (group.status !== 'active') {
    console.log(`\n⏭️  건너뜀: ${group.name} (일시정지 상태)`);
    continue;
  }

  const groupKeywords = keywords.filter(k => k.adGroupId === group.id);

  // Skip if no keywords in this group
  if (groupKeywords.length === 0) {
    console.log(`\n⏭️  건너뜀: ${group.name} (키워드 없음)`);
    continue;
  }

  console.log(`\n📁 ${group.name} (${groupKeywords.length}개 기존 키워드)`);

  const existingKeywords = new Set(groupKeywords.map(k => k.keyword));
  const newKeywords = [];

  // Generate long-tail variations
  for (const kw of groupKeywords) {
    Object.entries(longTailSuffixes).forEach(([base, suffixes]) => {
      if (kw.keyword.includes(base)) {
        suffixes.forEach(suffix => {
          const longTail = kw.keyword + suffix;
          // Don't add if already exists
          if (!existingKeywords.has(longTail) && !newKeywords.find(k => k.keyword === longTail)) {
            newKeywords.push({
              keyword: longTail,
              baseKeyword: kw.keyword,
              type: base
            });
          }
        });
      }
    });
  }

  stats.totalGenerated += newKeywords.length;

  if (newKeywords.length === 0) {
    console.log(`   ℹ️  추가할 롱테일 키워드 없음`);
    continue;
  }

  console.log(`   💡 생성된 롱테일: ${newKeywords.length}개`);
  console.log(`   샘플: ${newKeywords.slice(0, 3).map(k => k.keyword).join(', ')}`);

  // ADD TO NAVER API
  let addedCount = 0;
  let failedCount = 0;

  console.log(`\n   🚀 네이버 광고에 추가 중...`);

  for (const newKw of newKeywords) {
    try {
      // Add keyword to Naver via API
      const response = await naverAdsClient.client.post('/ncc/keywords', {
        nccAdgroupId: group.naverGroupId,
        keyword: newKw.keyword,
        bidAmt: 70, // Minimum bid for budget control
        useGroupBidAmt: false
      });

      if (response && response.nccKeywordId) {
        // Add to local database with mobile lower position targeting
        const newKeywordData = {
          id: Date.now().toString() + Math.random(),
          naverKeywordId: response.nccKeywordId,
          adGroupId: group.id,
          keyword: newKw.keyword,
          grade: 'C', // C grade = 1시간 간격 체크
          autoBidEnabled: false, // 초기에는 비활성화
          currentRank: null,
          currentBid: 70,
          targetRankMin: 3, // 모바일 하위노출: 3-5위
          targetRankMax: 5,
          bidLimitMin: 70,
          bidLimitMax: 200, // 예산 통제를 위한 최대 입찰가
          incrementAmount: 10,
          naverStatus: 'ELIGIBLE',
          addedAt: new Date().toISOString()
        };

        db.data.keywords.push(newKeywordData);
        addedCount++;

        if (addedCount % 10 === 0) {
          console.log(`   ⏳ ${addedCount}개 추가됨...`);
        }
      }
    } catch (error) {
      failedCount++;
      const errorMsg = error.response?.data?.title || error.message;
      if (failedCount <= 3) {
        console.error(`   ❌ "${newKw.keyword}" 실패: ${errorMsg}`);
      }
    }

    // Rate limiting - wait 100ms between API calls
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  stats.totalAdded += addedCount;
  stats.totalFailed += failedCount;
  stats.byGroup[group.name] = { generated: newKeywords.length, added: addedCount, failed: failedCount };

  console.log(`\n   📊 결과: ${addedCount}개 추가, ${failedCount}개 실패`);
}

// Save database
if (stats.totalAdded > 0) {
  console.log('\n💾 데이터베이스 저장 중...');
  await db.write();
  console.log('✅ 저장 완료!');
}

console.log('\n' + '='.repeat(80));
console.log('\n📊 최종 통계:');
console.log(`   생성된 롱테일 키워드: ${stats.totalGenerated}개`);
console.log(`   네이버에 추가됨: ${stats.totalAdded}개`);
console.log(`   실패: ${stats.totalFailed}개`);

if (stats.totalAdded > 0) {
  console.log('\n✅ 롱테일 키워드 추가 완료!');
  console.log('\n📋 설정 요약:');
  console.log('   - 목표 순위: 3-5위 (모바일 하위노출)');
  console.log('   - 입찰가: 70원 (최소)');
  console.log('   - 최대 입찰가: 200원 (예산 통제)');
  console.log('   - 등급: C (1시간마다 체크)');
  console.log('   - 자동입찰: 비활성화 (수동으로 활성화 필요)');

  console.log('\n💰 예산 계산:');
  const estimatedDailyBudget = stats.totalAdded * 70; // 키워드당 최소 70원
  const estimatedPerKeyword = 30000 / stats.totalAdded; // 3만원 / 키워드 수
  console.log(`   - 최소 일일 예산: ₩${estimatedDailyBudget.toLocaleString()} (키워드당 70원 x ${stats.totalAdded}개)`);
  console.log(`   - 목표 일일 예산: ₩30,000`);
  console.log(`   - 키워드당 평균: ₩${Math.round(estimatedPerKeyword)}`);

  console.log('\n🔄 자동입찰 활성화 방법:');
  console.log('   curl -X POST http://localhost:3001/api/scheduler/start');

  console.log('\n📊 변경사항 확인:');
  console.log('   node scripts/analyze-keywords.js\n');
}
