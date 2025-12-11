# 네이버 광고 자동입찰 시스템
# Naver Ads Automated Bidding System

네이버 검색광고 및 디스플레이 광고의 자동 입찰을 관리하는 웹 기반 시스템

---

## 🎯 주요 기능

### 1. 자동 입찰 최적화
- **클릭 수 최대화**: 예산 대비 최대 클릭 수 달성
- **실시간 입찰가 조정**: 성과에 따른 자동 조정
- **예산 관리**: 일일 예산 한도 내에서 최적 분배

### 2. 성과 모니터링 대시보드
- 실시간 캠페인 성과 추적
- 키워드별 성과 분석
- 입찰가 변경 이력
- ROI 분석

### 3. 지원 광고 유형
- ✅ 검색광고 (파워링크)
- ✅ 디스플레이 광고 (GFA)

---

## 🏗️ 시스템 구조

```
naver-ad-bidding/
├── frontend/              # Next.js 웹 대시보드
│   ├── app/              # App Router
│   ├── components/       # React 컴포넌트
│   └── lib/              # 유틸리티
│
├── backend/              # Node.js API 서버
│   ├── api/             # Naver Ads API 연동
│   ├── bidding/         # 자동입찰 로직
│   ├── scheduler/       # 스케줄러
│   └── db/              # 데이터베이스 모델
│
└── database/            # 데이터 저장
    └── sqlite/          # SQLite DB (개발용)
```

---

## 🚀 시작하기

### 1. 사전 요구사항

- Node.js 18+
- 네이버 광고 API 키
- 네이버 비즈니스 플랫폼 계정

### 2. 설치

```bash
# 프론트엔드 설치
cd frontend
npm install

# 백엔드 설치
cd ../backend
npm install
```

### 3. 환경 변수 설정

`.env` 파일 생성:
```env
# Naver Ads API
NAVER_API_KEY=your-api-key
NAVER_SECRET_KEY=your-secret-key
NAVER_CUSTOMER_ID=your-customer-id

# Database
DATABASE_URL=./database/bidding.db

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 4. 실행

```bash
# 백엔드 서버 실행
cd backend
npm run dev

# 프론트엔드 실행 (새 터미널)
cd frontend
npm run dev
```

대시보드: http://localhost:3000

---

## 📊 자동입찰 알고리즘

### 클릭 수 최대화 전략

1. **성과 분석**
   - 최근 7일간 CTR 분석
   - 키워드별 CPC 효율성 계산
   - 시간대별 성과 패턴 파악

2. **입찰가 조정**
   ```
   새 입찰가 = 현재 입찰가 × (1 + 조정률)

   조정률 계산:
   - CTR 높음 + CPC 낮음 → +20%
   - CTR 보통 → 유지
   - CTR 낮음 → -15%
   ```

3. **예산 분배**
   - 성과 좋은 키워드에 예산 집중
   - 성과 낮은 키워드 예산 축소
   - 일일 예산 한도 준수

---

## 🛠️ 기술 스택

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Chart.js (데이터 시각화)

### Backend
- Node.js
- Express.js
- TypeScript
- SQLite (개발) / PostgreSQL (프로덕션)
- node-cron (스케줄링)

### Naver Ads API
- Naver Advertising API
- REST API

---

## 📱 대시보드 화면

### 1. 홈 대시보드
- 오늘의 성과 요약
- 실시간 클릭/노출 수
- 예산 사용 현황
- 최근 입찰가 변경 이력

### 2. 캠페인 관리
- 캠페인 목록
- 상태 ON/OFF
- 예산 설정
- 입찰가 수동 조정

### 3. 키워드 분석
- 키워드별 성과
- CTR, CPC, 전환율
- 검색량 추이
- 경쟁 강도

### 4. 설정
- API 키 관리
- 자동입찰 규칙
- 예산 한도
- 알림 설정

---

## 🔐 보안

- API 키 암호화 저장
- HTTPS 통신
- 세션 기반 인증
- CORS 설정

---

## 📈 로드맵

### Phase 1 (현재)
- [x] 프로젝트 구조 생성
- [ ] 네이버 광고 API 연동
- [ ] 기본 대시보드 UI
- [ ] 자동입찰 로직 v1

### Phase 2
- [ ] 고급 분석 기능
- [ ] A/B 테스팅
- [ ] 다중 계정 지원
- [ ] 모바일 대시보드

### Phase 3
- [ ] AI 기반 입찰 최적화
- [ ] 자동 키워드 발굴
- [ ] 경쟁사 분석
- [ ] 보고서 자동 생성

---

## 📄 라이선스

개인 프로젝트

---

## 📞 연락처

질문이나 제안사항이 있으시면 연락주세요!

---

**시작일**: 2025-12-11
**상태**: 개발 중 🚧
