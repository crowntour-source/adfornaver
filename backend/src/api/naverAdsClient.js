import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 네이버 광고 API 클라이언트
 *
 * API 문서: https://naver.github.io/searchad-apidoc
 */
class NaverAdsClient {
  constructor() {
    this.baseURL = process.env.NAVER_API_BASE_URL || 'https://api.naver.com';
    this.customerId = process.env.NAVER_CUSTOMER_ID;
    this.accessLicense = process.env.NAVER_ACCESS_LICENSE;
    this.secretKey = process.env.NAVER_SECRET_KEY;

    if (!this.customerId || !this.accessLicense || !this.secretKey) {
      console.warn('⚠️  네이버 광고 API 키가 설정되지 않았습니다.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.accessLicense,
        'X-Customer': this.customerId
      }
    });

    // Request interceptor for adding signature
    this.client.interceptors.request.use(
      config => {
        const timestamp = Date.now().toString();

        // Remove query parameters from URL for signature generation
        const urlForSignature = config.url.split('?')[0];
        const signature = this.generateSignature(timestamp, config.method, urlForSignature);

        config.headers['X-Timestamp'] = timestamp;
        config.headers['X-Signature'] = signature;

        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        const errorMessage = error.response?.data?.message || error.message;
        const errorCode = error.response?.status;

        console.error('🚨 네이버 API 에러:');
        console.error('  상태 코드:', errorCode);
        console.error('  메시지:', errorMessage);
        console.error('  URL:', error.config?.url);

        // 에러 객체에 추가 정보 포함
        const enhancedError = new Error(errorMessage);
        enhancedError.statusCode = errorCode;
        enhancedError.originalError = error;
        enhancedError.url = error.config?.url;

        throw enhancedError;
      }
    );
  }

  /**
   * API 서명 생성 (네이버 광고 API 인증용)
   */
  generateSignature(timestamp, method, url) {
    const message = `${timestamp}.${method.toUpperCase()}.${url}`;
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * API 연결 테스트 (캠페인 목록으로 연결 확인)
   */
  async testConnection() {
    try {
      const response = await this.client.get('/ncc/campaigns');
      console.log('✅ 네이버 광고 API 연결 성공');
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ 네이버 광고 API 연결 실패:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 광고 그룹 목록 조회
   */
  async getAdGroups(campaignId = null) {
    try {
      const params = {};
      if (campaignId) {
        params.nccCampaignId = campaignId;
      }
      const response = await this.client.get('/ncc/adgroups', { params });
      return response;
    } catch (error) {
      console.error('광고 그룹 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 광고 그룹의 키워드 목록 조회
   */
  async getKeywordsByGroup(adGroupId) {
    try {
      const response = await this.client.get('/ncc/keywords', {
        params: {
          nccAdgroupId: adGroupId
        }
      });
      return response;
    } catch (error) {
      console.error('키워드 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 키워드 정보 조회 (입찰가 포함)
   */
  async getKeyword(keywordId) {
    try {
      const response = await this.client.get(`/ncc/keywords/${keywordId}`);
      return response;
    } catch (error) {
      console.error('키워드 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 키워드 입찰가 변경
   */
  async updateKeywordBid(keywordId, adGroupId, newBid) {
    try {
      const response = await this.client.put(`/ncc/keywords/${keywordId}?fields=bidAmt`, {
        nccKeywordId: keywordId,
        nccAdgroupId: adGroupId,
        bidAmt: Math.round(newBid), // 입찰가는 정수여야 함
        useGroupBidAmt: false
      });

      console.log(`✅ 입찰가 변경 성공: 키워드 ${keywordId} → ₩${newBid}`);
      return response;
    } catch (error) {
      console.error('입찰가 변경 실패:', error);
      throw error;
    }
  }

  /**
   * 여러 키워드의 입찰가 일괄 변경
   */
  async updateMultipleKeywordBids(updates) {
    try {
      const promises = updates.map(({ keywordId, newBid }) =>
        this.updateKeywordBid(keywordId, newBid)
      );
      const results = await Promise.allSettled(promises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ 일괄 입찰 완료: 성공 ${successful}, 실패 ${failed}`);
      return { successful, failed, results };
    } catch (error) {
      console.error('일괄 입찰 실패:', error);
      throw error;
    }
  }

  /**
   * 키워드 통계 조회
   */
  async getKeywordStats(keywordId, startDate, endDate) {
    try {
      const response = await this.client.get(`/ncc/keywords/${keywordId}/stat`, {
        params: {
          startDate: startDate,
          endDate: endDate,
          timeUnit: 'DATE',
          stat: 'impCnt,clkCnt,salesAmt,ctr,cpc'
        }
      });
      return response;
    } catch (error) {
      console.error('키워드 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 캠페인 목록 조회
   */
  async getCampaigns() {
    try {
      const response = await this.client.get('/ncc/campaigns');
      return response;
    } catch (error) {
      console.error('캠페인 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 광고 소재 순위 확인 (검색 시뮬레이션)
   * 주의: 이 기능은 실제 검색을 시뮬레이션하므로 제한적으로 사용해야 합니다
   */
  async checkKeywordRank(keyword, options = {}) {
    try {
      // 네이버 광고 API에 순위 확인 엔드포인트가 있는지 확인 필요
      // 없다면 웹 스크래핑이나 다른 방법 사용 필요

      // 임시: 랜덤 순위 반환 (실제로는 API 또는 스크래핑 구현 필요)
      const mockRank = Math.floor(Math.random() * 10) + 1;

      console.log(`🔍 순위 확인: "${keyword}" → ${mockRank}위`);

      return {
        keyword,
        rank: mockRank,
        device: options.device || 'PC',
        page: options.page || 'MAIN',
        region: options.region || null,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('순위 확인 실패:', error);
      return {
        keyword,
        rank: null,
        error: error.message
      };
    }
  }
}

// Singleton instance
const naverAdsClient = new NaverAdsClient();

export default naverAdsClient;
