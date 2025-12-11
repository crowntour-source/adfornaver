import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');
const file = join(dataDir, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

await db.read();

const keywords = db.data.keywords || [];

console.log('\n🎯 중요 키워드 선별 및 자동입찰 활성화\n');
console.log('='.repeat(80));

// 선별 기준
const priorityKeywords = [
  // 핵심 키워드 패턴 (검색량 높을 것으로 예상)
  '비자', '여권', '공증', '인증', '번역', '대행',
  '신청', '발급', '준비서류', '비용', '기간'
];

// 키워드 점수 계산
const scoredKeywords = keywords.map(kw => {
  let score = 0;

  // 1. 짧은 키워드 우선 (핵심 키워드일 가능성)
  if (kw.keyword.length <= 10) score += 10;
  else if (kw.keyword.length <= 15) score += 5;

  // 2. 우선순위 키워드 포함 여부
  priorityKeywords.forEach(priority => {
    if (kw.keyword.includes(priority)) {
      score += 3;
    }
  });

  // 3. 기본 키워드 (롱테일 아님)
  const isBasic = !kw.keyword.includes('신청') &&
                  !kw.keyword.includes('발급') &&
                  !kw.keyword.includes('대행') &&
                  kw.keyword.length <= 8;
  if (isBasic) score += 15;

  // 4. 나라별 핵심 키워드
  const countryKeywords = ['캄보디아비자', '중국비자', '베트남비자', '중국공증', '베트남공증'];
  if (countryKeywords.some(ck => kw.keyword === ck)) {
    score += 20;
  }

  return {
    ...kw,
    score
  };
});

// 점수순 정렬
scoredKeywords.sort((a, b) => b.score - a.score);

// 상위 400개 선택
const TARGET_COUNT = 400;
const selectedKeywords = scoredKeywords.slice(0, TARGET_COUNT);

console.log(`📊 선별 결과:\n`);
console.log(`   전체 키워드: ${keywords.length}개`);
console.log(`   선별된 키워드: ${selectedKeywords.length}개\n`);

// 나라별 분포
const byCountry = {
  '캄보디아': selectedKeywords.filter(k => k.keyword.includes('캄보디아')).length,
  '중국': selectedKeywords.filter(k => k.keyword.includes('중국')).length,
  '베트남': selectedKeywords.filter(k => k.keyword.includes('베트남')).length,
  '기타': selectedKeywords.filter(k =>
    !k.keyword.includes('캄보디아') &&
    !k.keyword.includes('중국') &&
    !k.keyword.includes('베트남')
  ).length
};

console.log('🌍 나라별 분포:\n');
Object.entries(byCountry).forEach(([country, count]) => {
  console.log(`   ${country}: ${count}개`);
});
console.log();

// 상위 20개 샘플
console.log('🔝 우선순위 상위 20개 키워드:\n');
selectedKeywords.slice(0, 20).forEach((kw, i) => {
  console.log(`   ${i + 1}. ${kw.keyword} (점수: ${kw.score})`);
});
console.log();

// 자동입찰 활성화
let updateCount = 0;
for (const kw of selectedKeywords) {
  const index = db.data.keywords.findIndex(k => k.id === kw.id);
  if (index !== -1) {
    db.data.keywords[index] = {
      ...db.data.keywords[index],
      autoBidEnabled: true,
      grade: 'C', // 일단 C등급으로 시작
      targetRankMin: 3, // 모바일 하위노출 3-5위
      targetRankMax: 5,
      bidLimitMin: 70,
      bidLimitMax: 200,
      updatedAt: new Date().toISOString()
    };
    updateCount++;
  }
}

await db.write();

console.log('='.repeat(80));
console.log('\n✅ 자동입찰 활성화 완료!\n');
console.log(`   활성화된 키워드: ${updateCount}개`);
console.log(`   예상 일일 비용: ${updateCount * 70}원 (최소)\n`);

console.log('⚙️  설정 내용:\n');
console.log('   - 등급: C (1시간 간격 체크)');
console.log('   - 목표 순위: 3-5위 (모바일 하위노출)');
console.log('   - 입찰가 범위: 70-200원');
console.log('   - 가감액: 10원\n');

console.log('🔄 다음 체크 시간:\n');
console.log('   - C등급: 매시 정각 (1시간마다)');
console.log('   - 스케줄러: 백그라운드 실행 중\n');

console.log('📊 현재 시스템 상태 확인:\n');
console.log('   curl http://localhost:3001/api/bidding/stats\n');
