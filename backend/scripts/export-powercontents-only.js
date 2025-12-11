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

console.log('\n📰 파워컨텐츠 광고그룹만 필터링\n');
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

// 파워컨텐츠 광고그룹만 필터링
const powerContentsGroups = adGroups.filter(g =>
  g.name.includes('파워컨텐츠')
);

console.log('📋 선택된 파워컨텐츠 광고그룹:\n');
powerContentsGroups.forEach((g, i) => {
  const status = g.status === 'active' ? '✅ 활성' : '⏸️  일시정지';
  console.log(`${i + 1}. ${g.name} (${status})`);
  console.log(`   ID: ${g.naverGroupId}\n`);
});

const textByGroup = {};
let totalKeywords = 0;
const allKeywords = [];

// Generate keywords for each powercontents group
for (const group of powerContentsGroups) {
  const groupKeywords = keywords.filter(k => k.adGroupId === group.id);

  // 키워드가 없어도 표시
  if (groupKeywords.length === 0) {
    console.log(`⚠️  ${group.name}: 기존 키워드 없음\n`);
    continue;
  }

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
    const keywordsOnly = newKeywords.join('\n');
    const keywordsWithBid = newKeywords.map(kw => `${kw}\t70`).join('\n');

    textByGroup[group.name] = {
      naverGroupId: group.naverGroupId,
      status: group.status,
      count: newKeywords.length,
      keywordsOnly,
      keywordsWithBid,
      keywords: newKeywords
    };

    // Add to combined list
    newKeywords.forEach(kw => {
      allKeywords.push({
        group: group.name,
        naverGroupId: group.naverGroupId,
        status: group.status,
        keyword: kw
      });
    });

    totalKeywords += newKeywords.length;
  }
}

// Save text files
const outputDir = join(__dirname, '../exports/powercontents');
import { existsSync, mkdirSync } from 'fs';
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

console.log('='.repeat(80));
console.log('\n📁 생성된 파일:\n');

// Individual group files
Object.entries(textByGroup).forEach(([groupName, data]) => {
  const sanitizedName = groupName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
  const statusPrefix = data.status === 'paused' ? '[일시정지]_' : '';

  // Keywords only
  const filename1 = `${statusPrefix}${sanitizedName}_키워드만.txt`;
  const filepath1 = join(outputDir, filename1);
  writeFileSync(filepath1, data.keywordsOnly, 'utf-8');

  // Keywords with bid
  const filename2 = `${statusPrefix}${sanitizedName}_키워드+입찰가.txt`;
  const filepath2 = join(outputDir, filename2);
  writeFileSync(filepath2, data.keywordsWithBid, 'utf-8');

  const statusIcon = data.status === 'active' ? '✅' : '⏸️';
  console.log(`${statusIcon} ${groupName} - ${data.count}개`);
  console.log(`   ${filename1}`);
  console.log(`   ${filename2}\n`);
});

// Combined file (all powercontents groups)
if (totalKeywords > 0) {
  const combinedKeywords = allKeywords.map(k => k.keyword).join('\n');
  const combinedFile = join(outputDir, '전체_파워컨텐츠_키워드.txt');
  writeFileSync(combinedFile, combinedKeywords, 'utf-8');

  console.log(`✅ 통합 파일`);
  console.log(`   전체_파워컨텐츠_키워드.txt (${totalKeywords}개)\n`);
}

// Create summary file
const summary = [
  '='.repeat(80),
  '파워컨텐츠 롱테일 키워드 요약',
  '='.repeat(80),
  '',
  `총 광고그룹: ${Object.keys(textByGroup).length}개`,
  `총 키워드: ${totalKeywords}개`,
  '',
  '광고그룹별 키워드 수:',
  ''
];

Object.entries(textByGroup).forEach(([groupName, data]) => {
  const status = data.status === 'active' ? '✅' : '⏸️';
  summary.push(`  ${status} ${groupName}: ${data.count}개`);
});

summary.push('');
summary.push('='.repeat(80));
summary.push('');
summary.push('⚠️  주의사항:');
summary.push('');
summary.push('- 일시정지된 광고그룹은 먼저 활성화 필요');
summary.push('- 파워컨텐츠는 파워링크와 별도 예산 필요');
summary.push('- 키워드 붙여넣기 후 입찰가 70원 설정');
summary.push('');
summary.push('📋 붙여넣기 방법:');
summary.push('');
summary.push('1. https://searchad.naver.com 접속');
summary.push('2. 파워컨텐츠 광고그룹 선택');
summary.push('3. 일시정지된 경우 먼저 활성화');
summary.push('4. "키워드" 탭 → "키워드 추가" 클릭');
summary.push('5. 텍스트 파일 내용 복사-붙여넣기');
summary.push('6. 입찰가 70원 설정');
summary.push('7. 저장');
summary.push('');

const summaryFile = join(outputDir, '00_README.txt');
writeFileSync(summaryFile, summary.join('\n'), 'utf-8');

console.log('='.repeat(80));
console.log('\n📊 최종 요약:\n');
console.log(`   파워컨텐츠 광고그룹: ${Object.keys(textByGroup).length}개`);
console.log(`   총 롱테일 키워드: ${totalKeywords}개`);
console.log(`   파일 위치: ${outputDir}\n`);

const activeCount = Object.values(textByGroup).filter(g => g.status === 'active').length;
const pausedCount = Object.values(textByGroup).filter(g => g.status === 'paused').length;

console.log('📊 상태별 광고그룹:\n');
console.log(`   ✅ 활성: ${activeCount}개`);
console.log(`   ⏸️  일시정지: ${pausedCount}개\n`);

if (pausedCount > 0) {
  console.log('⚠️  일시정지된 광고그룹:\n');
  Object.entries(textByGroup).forEach(([name, data]) => {
    if (data.status === 'paused') {
      console.log(`   - ${name}`);
    }
  });
  console.log('\n   → 키워드 추가 전에 광고그룹을 활성화해야 합니다!\n');
}

console.log('📋 다음 단계:\n');
console.log('1. exports/powercontents 폴더 확인');
console.log('2. 일시정지된 광고그룹 활성화 (필요시)');
console.log('3. 광고그룹별 텍스트 파일 열기');
console.log('4. 네이버 검색광고에 붙여넣기');
console.log('5. 입찰가 70원, 목표순위 3-5위 설정\n');
