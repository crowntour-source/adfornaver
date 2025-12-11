import naverAdsClient from './src/api/naverAdsClient.js';

/**
 * 네이버 광고 API 연결 테스트
 */
async function testAPI() {
  console.log('🔍 네이버 광고 API 연결 테스트 시작...\n');

  // 1. API 연결 테스트
  console.log('1️⃣ API 연결 테스트...');
  const connectionTest = await naverAdsClient.testConnection();

  if (!connectionTest.success) {
    console.error('❌ API 연결 실패. 프로그램을 종료합니다.');
    process.exit(1);
  }

  console.log('\n2️⃣ 캠페인 목록 조회...');
  try {
    const campaigns = await naverAdsClient.getCampaigns();
    console.log(`✅ 캠페인 수: ${campaigns.length || 0}개`);
    if (campaigns.length > 0) {
      console.log('첫 번째 캠페인:', campaigns[0].name || campaigns[0]);
    }
  } catch (error) {
    console.error('⚠️ 캠페인 조회 실패:', error.message);
  }

  console.log('\n3️⃣ 광고 그룹 목록 조회...');
  try {
    const adGroups = await naverAdsClient.getAdGroups();
    console.log(`✅ 광고 그룹 수: ${adGroups.length || 0}개`);
    if (adGroups.length > 0) {
      console.log('첫 번째 광고 그룹:', adGroups[0].name || adGroups[0]);

      // 첫 번째 광고 그룹의 키워드 조회
      const groupId = adGroups[0].nccAdgroupId || adGroups[0].id;
      if (groupId) {
        console.log(`\n4️⃣ 광고 그룹 ${groupId}의 키워드 조회...`);
        try {
          const keywords = await naverAdsClient.getKeywordsByGroup(groupId);
          console.log(`✅ 키워드 수: ${keywords.length || 0}개`);
          if (keywords.length > 0) {
            console.log('첫 번째 키워드:', keywords[0].keyword || keywords[0]);
          }
        } catch (error) {
          console.error('⚠️ 키워드 조회 실패:', error.message);
        }
      }
    }
  } catch (error) {
    console.error('⚠️ 광고 그룹 조회 실패:', error.message);
  }

  console.log('\n✅ API 테스트 완료!\n');
}

testAPI().catch(console.error);
