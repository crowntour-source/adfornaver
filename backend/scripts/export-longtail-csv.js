import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');
const file = join(dataDir, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

await db.read();

const adGroups = db.data.adGroups || [];
const keywords = db.data.keywords || [];

console.log('\n📝 롱테일 키워드 CSV 생성 시작\n');
console.log('='.repeat(80));

// Long-tail suffixes
const longTailSuffixes = {
  '비자': ['신청', '발급', '대행', '기간', '준비서류', '비용', '소요기간', '연장', '업체', '방법'],
  '여권': ['신청', '발급', '재발급', '연장', '분실신고', '준비서류', '비용', '대행업체'],
  '결혼': ['서류', '절차', '비용', '준비물', '대행', '신고절차', '번역공증'],
  '전자비자': ['신청방법', '발급기간', '준비서류', '비용', '온라인신청'],
  '인증': ['대행업체', '준비서류', '비용', '기간', '번역공증', '아포스티유'],
  '공증': ['대행', '준비서류', '비용', '번역', '업체'],
  '번역': ['공증', '대행', '업체', '비용']
};

const csvByGroup = {};
let totalKeywords = 0;

// Generate CSV for each active ad group
for (const group of adGroups) {
  if (group.status !== 'active') continue;

  const groupKeywords = keywords.filter(k => k.adGroupId === group.id);
  if (groupKeywords.length === 0) continue;

  const existingKeywords = new Set(groupKeywords.map(k => k.keyword));
  const newKeywords = [];

  // Generate long-tail variations
  for (const kw of groupKeywords) {
    Object.entries(longTailSuffixes).forEach(([base, suffixes]) => {
      if (kw.keyword.includes(base)) {
        suffixes.forEach(suffix => {
          const longTail = kw.keyword + suffix;
          if (!existingKeywords.has(longTail) && !newKeywords.find(k => k === longTail)) {
            newKeywords.push(longTail);
          }
        });
      }
    });
  }

  if (newKeywords.length > 0) {
    // CSV format for Naver Ads bulk upload
    // 키워드, 입찰가, 최대입찰가, 사용여부
    const csvLines = ['키워드,입찰가,최대입찰가,사용여부'];

    newKeywords.forEach(kw => {
      csvLines.push(`${kw},70,200,Y`);
    });

    csvByGroup[group.name] = {
      naverGroupId: group.naverGroupId,
      count: newKeywords.length,
      csv: csvLines.join('\n')
    };

    totalKeywords += newKeywords.length;
  }
}

// Save CSV files
const outputDir = join(__dirname, '../exports');
import { existsSync, mkdirSync } from 'fs';
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`📁 생성된 CSV 파일:\n`);

Object.entries(csvByGroup).forEach(([groupName, data]) => {
  const sanitizedName = groupName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
  const filename = `longtail_${sanitizedName}.csv`;
  const filepath = join(outputDir, filename);

  // Write with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  writeFileSync(filepath, BOM + data.csv, 'utf-8');

  console.log(`✅ ${filename}`);
  console.log(`   광고그룹: ${groupName} (${data.naverGroupId})`);
  console.log(`   키워드 수: ${data.count}개\n`);
});

// Create combined CSV
const allKeywordsCSV = ['광고그룹ID,광고그룹명,키워드,입찰가,최대입찰가,사용여부'];
Object.entries(csvByGroup).forEach(([groupName, data]) => {
  const lines = data.csv.split('\n').slice(1); // Skip header
  lines.forEach(line => {
    allKeywordsCSV.push(`${data.naverGroupId},${groupName},${line}`);
  });
});

const combinedFile = join(outputDir, 'longtail_ALL_GROUPS.csv');
const BOM = '\uFEFF';
writeFileSync(combinedFile, BOM + allKeywordsCSV.join('\n'), 'utf-8');

console.log('='.repeat(80));
console.log(`\n📊 요약:`);
console.log(`   총 광고그룹: ${Object.keys(csvByGroup).length}개`);
console.log(`   총 롱테일 키워드: ${totalKeywords}개`);
console.log(`   파일 위치: ${outputDir}\n`);

console.log('📋 네이버 광고에서 키워드 일괄 업로드 방법:\n');
console.log('1. https://searchad.naver.com 접속');
console.log('2. 광고그룹 선택');
console.log('3. "키워드" 탭 → "키워드 일괄등록" 버튼 클릭');
console.log('4. CSV 파일 업로드');
console.log('   - 개별 광고그룹: longtail_[광고그룹명].csv');
console.log('   - 전체 일괄: longtail_ALL_GROUPS.csv\n');

console.log('⚙️  설정된 값:');
console.log('   - 입찰가: 70원 (최소)');
console.log('   - 최대 입찰가: 200원 (예산 통제)');
console.log('   - 목표 순위: 모바일 3-5위 (하위노출)\n');

console.log('💡 업로드 후 할 일:');
console.log('   1. 자동입찰 활성화: API 또는 네이버 시스템에서 설정');
console.log('   2. 등급 조정: 중요 키워드는 A/B 등급으로 변경');
console.log('   3. 순위 모니터링: 스케줄러 작동 확인\n');
