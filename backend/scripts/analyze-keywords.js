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

const adGroups = db.data.adGroups || [];
const keywords = db.data.keywords || [];

console.log('\n📊 캠페인별 키워드 현황\n');
console.log('='.repeat(80));

// Group keywords by ad group
const grouped = {};
adGroups.forEach(group => {
  const groupKeywords = keywords.filter(k => k.adGroupId === group.id);
  grouped[group.id] = {
    name: group.name,
    naverGroupId: group.naverGroupId,
    status: group.status,
    keywords: groupKeywords,
    count: groupKeywords.length
  };
});

// Display summary
adGroups.forEach((group, index) => {
  const data = grouped[group.id];
  const activeCount = data.keywords.filter(k => k.autoBidEnabled).length;
  const gradeA = data.keywords.filter(k => k.grade === 'A').length;
  const gradeB = data.keywords.filter(k => k.grade === 'B').length;
  const gradeC = data.keywords.filter(k => k.grade === 'C').length;

  console.log(`\n${index + 1}. ${data.name}`);
  console.log(`   상태: ${data.status === 'active' ? '✅ 활성' : '⏸️  일시정지'}`);
  console.log(`   키워드: ${data.count}개 (자동입찰: ${activeCount}개)`);
  console.log(`   등급: A=${gradeA}, B=${gradeB}, C=${gradeC}`);

  // Show first 5 keywords
  if (data.keywords.length > 0) {
    console.log(`   샘플: ${data.keywords.slice(0, 5).map(k => k.keyword).join(', ')}`);
    if (data.keywords.length > 5) {
      console.log(`        ... 외 ${data.keywords.length - 5}개`);
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n총 ${adGroups.length}개 광고그룹, ${keywords.length}개 키워드\n`);

// Analyze potential long-tail variations
console.log('\n💡 롱테일 키워드 추천 (주요 키워드 기준)\n');
console.log('='.repeat(80));

// Common long-tail suffixes for visa/travel services
const longTailSuffixes = {
  '비자': ['신청', '발급', '대행', '기간', '준비서류', '비용', '소요기간', '연장', '업체', '방법'],
  '여권': ['신청', '발급', '재발급', '연장', '분실', '기간', '준비서류', '사진', '비용', '대행'],
  '결혼': ['서류', '절차', '비용', '준비물', '대행', '신고', '인증', '번역'],
  '전자비자': ['신청', '발급', '기간', '준비서류', '비용', '방법'],
  '인증': ['대행', '준비서류', '비용', '기간', '번역', '아포스티유']
};

// Find unique base keywords
const baseKeywords = new Set();
keywords.forEach(k => {
  Object.keys(longTailSuffixes).forEach(base => {
    if (k.keyword.includes(base)) {
      baseKeywords.add(k.keyword);
    }
  });
});

// Generate suggestions for each ad group
const suggestions = {};
adGroups.forEach(group => {
  const groupKeywords = keywords.filter(k => k.adGroupId === group.id);
  const existingKeywords = new Set(groupKeywords.map(k => k.keyword));
  const newSuggestions = [];

  groupKeywords.forEach(kw => {
    Object.entries(longTailSuffixes).forEach(([base, suffixes]) => {
      if (kw.keyword.includes(base)) {
        suffixes.forEach(suffix => {
          const longTail = kw.keyword + suffix;
          // Don't suggest if already exists
          if (!existingKeywords.has(longTail)) {
            newSuggestions.push({
              base: kw.keyword,
              longTail: longTail,
              type: base
            });
          }
        });
      }
    });
  });

  if (newSuggestions.length > 0) {
    suggestions[group.id] = {
      name: group.name,
      suggestions: newSuggestions.slice(0, 10) // Top 10 suggestions
    };
  }
});

// Display suggestions
Object.values(suggestions).forEach(({ name, suggestions: sug }) => {
  console.log(`\n📁 ${name}`);
  sug.slice(0, 5).forEach(s => {
    console.log(`   "${s.base}" → "${s.longTail}"`);
  });
  if (sug.length > 5) {
    console.log(`   ... 외 ${sug.length - 5}개 추천`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n💡 롱테일 키워드 추가 방법:');
console.log('   node scripts/add-longtail-keywords.js');
console.log('\n');
