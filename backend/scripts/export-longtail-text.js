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

console.log('\n📝 롱테일 키워드 텍스트 파일 생성 (붙여넣기용)\n');
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

const textByGroup = {};
let totalKeywords = 0;

// Generate text files for each active ad group
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
    // Format 1: 키워드만 (줄바꿈)
    const keywordsOnly = newKeywords.join('\n');

    // Format 2: 키워드 + 입찰가 (탭 구분)
    const keywordsWithBid = newKeywords.map(kw => `${kw}\t70`).join('\n');

    textByGroup[group.name] = {
      naverGroupId: group.naverGroupId,
      count: newKeywords.length,
      keywordsOnly,
      keywordsWithBid
    };

    totalKeywords += newKeywords.length;
  }
}

// Save text files
const outputDir = join(__dirname, '../exports');
import { existsSync, mkdirSync } from 'fs';
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log(`📁 생성된 텍스트 파일:\n`);

Object.entries(textByGroup).forEach(([groupName, data]) => {
  const sanitizedName = groupName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');

  // Format 1: 키워드만
  const filename1 = `키워드만_${sanitizedName}.txt`;
  const filepath1 = join(outputDir, filename1);
  writeFileSync(filepath1, data.keywordsOnly, 'utf-8');

  // Format 2: 키워드 + 입찰가 (탭 구분)
  const filename2 = `키워드+입찰가_${sanitizedName}.txt`;
  const filepath2 = join(outputDir, filename2);
  writeFileSync(filepath2, data.keywordsWithBid, 'utf-8');

  console.log(`✅ ${groupName}`);
  console.log(`   파일1: ${filename1} (키워드만)`);
  console.log(`   파일2: ${filename2} (키워드+입찰가)`);
  console.log(`   키워드 수: ${data.count}개\n`);
});

console.log('='.repeat(80));
console.log(`\n📊 요약:`);
console.log(`   총 광고그룹: ${Object.keys(textByGroup).length}개`);
console.log(`   총 롱테일 키워드: ${totalKeywords}개`);
console.log(`   파일 위치: ${outputDir}\n`);

console.log('📋 네이버 광고에서 키워드 붙여넣기 방법:\n');
console.log('1. https://searchad.naver.com 접속');
console.log('2. 광고그룹 선택');
console.log('3. "키워드" 탭 클릭');
console.log('4. "키워드 추가" 또는 "+" 버튼 클릭');
console.log('5. 키워드 입력창에 텍스트 파일 내용 전체 복사-붙여넣기');
console.log('6. 입찰가는 70원으로 일괄 설정\n');

console.log('💡 사용 팁:');
console.log('   - "키워드만_*.txt": 네이버에서 입찰가를 수동으로 설정할 때');
console.log('   - "키워드+입찰가_*.txt": 입찰가 포함 붙여넣기 지원 시\n');

console.log('⚠️  주의사항:');
console.log('   - 한번에 너무 많은 키워드를 추가하면 에러 발생 가능');
console.log('   - 100-200개씩 나눠서 추가하는 것을 권장');
console.log('   - 붙여넣기 후 "저장" 버튼 클릭 필수\n');
