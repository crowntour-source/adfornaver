# 네이버 광고 API 설정 가이드

## 📋 사전 준비

1. **네이버 비즈니스 플랫폼 계정** 필요
2. **네이버 검색광고 계정** 필요
3. **API 권한 신청** 필요

---

## 🔑 네이버 광고 API 키 발급 방법

### 1단계: 네이버 광고 API 신청

1. [네이버 검색광고 센터](https://searchad.naver.com)에 로그인
2. 상단 메뉴에서 **"도구" > "API 관리"** 클릭
3. **"API 사용 신청"** 버튼 클릭
4. 약관 동의 후 신청서 제출
5. 승인 대기 (보통 1-3 영업일 소요)

### 2단계: API 인증 정보 확인

승인 후 다음 정보를 확인할 수 있습니다:

- **Customer ID**: 고객 ID (숫자)
- **Access License**: API 접근 라이센스
- **Secret Key**: 서명 생성용 시크릿 키

---

## ⚙️ 프로젝트 설정

### 1. 환경 변수 파일 생성

`backend/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 네이버 광고 API 인증 정보
NAVER_CUSTOMER_ID=여기에_고객ID_입력
NAVER_ACCESS_LICENSE=여기에_액세스라이센스_입력
NAVER_SECRET_KEY=여기에_시크릿키_입력

# 네이버 광고 API 엔드포인트
NAVER_API_BASE_URL=https://api.naver.com

# 프론트엔드 URL (CORS)
FRONTEND_URL=http://localhost:3000

# 데이터베이스
DATABASE_PATH=./data/db.json

# 암호화 키 (API 키 저장용)
ENCRYPTION_KEY=your-32-character-secret-key-here

# 자동입찰 설정
AUTO_BID_INTERVAL_MINUTES=10
RANK_CHECK_INTERVAL_MINUTES=5
```

### 2. 예시

```env
NAVER_CUSTOMER_ID=1234567
NAVER_ACCESS_LICENSE=0100000000abcdefgh1234567890abcdefgh1234567890
NAVER_SECRET_KEY=AQAAAABabcdefghijklmnopqrstuvwxyz1234567890==
```

---

## 🧪 API 연결 테스트

### 방법 1: 백엔드에서 직접 테스트

```bash
cd backend
node test-api.js
```

### 방법 2: 프론트엔드에서 확인

1. 서버 실행 후 브라우저에서 `http://localhost:3000/keywords` 접속
2. 광고 그룹 목록이 로드되면 성공!
3. 오류가 표시되면 API 키를 다시 확인하세요.

---

## 🔍 문제 해결

### 오류: "네이버 API 연결 실패"

**원인:**
- API 키가 올바르지 않음
- API 승인이 완료되지 않음
- 네트워크 연결 문제

**해결 방법:**
1. `.env` 파일의 API 키 재확인
2. 네이버 광고 센터에서 API 승인 상태 확인
3. 방화벽/프록시 설정 확인

### 오류: "401 Unauthorized"

**원인:**
- Customer ID 또는 Access License 오류
- 서명(Signature) 생성 오류

**해결 방법:**
1. Customer ID와 Access License 복사/붙여넣기 시 공백 확인
2. Secret Key가 올바른지 확인
3. 타임스탬프 동기화 확인 (서버 시간)

### 오류: "403 Forbidden"

**원인:**
- API 권한이 없는 리소스 접근
- IP 화이트리스트 설정 필요

**해결 방법:**
1. 네이버 광고 센터에서 API 권한 확인
2. IP 화이트리스트 설정 (필요한 경우)

---

## 📚 참고 자료

- [네이버 광고 API 공식 문서](https://naver.github.io/searchad-apidoc)
- [네이버 검색광고 고객센터](https://saedu.naver.com)
- [API 인증 가이드](https://naver.github.io/searchad-apidoc/#/guides/authentication)

---

## 🚀 다음 단계

API 연결이 완료되면:

1. **광고 그룹 조회**: `/api/adgroups` 엔드포인트 테스트
2. **키워드 조회**: `/api/adgroups/:adGroupId/keywords` 테스트
3. **입찰가 변경**: 프론트엔드에서 "입찰변경" 버튼 클릭
4. **순위 확인**: "순위확인" 버튼 클릭 (현재는 Mock 데이터)

---

## ⚠️ 주의사항

### 순위 확인 기능

현재 순위 확인 기능은 **Mock 데이터**를 반환합니다.

**실제 순위 확인을 위해서는:**
1. 네이버 검색 API 활용 (제한적)
2. 웹 스크래핑 (네이버 이용약관 확인 필요)
3. 써드파티 순위 추적 서비스 연동

네이버 광고 API에는 순위 조회 엔드포인트가 없으므로, 실제 순위 확인은 별도 구현이 필요합니다.

### API 사용량 제한

- 네이버 광고 API는 요청 제한이 있습니다
- 과도한 요청 시 일시적으로 차단될 수 있습니다
- 자동입찰 주기를 적절히 설정하세요 (권장: 10분 이상)

---

## 💡 팁

1. **개발 환경**에서는 자동입찰을 비활성화하고 수동으로 테스트하세요
2. **프로덕션 배포** 전에 소규모 키워드로 충분히 테스트하세요
3. **API 키**는 절대 공개 저장소에 커밋하지 마세요
4. **로그**를 모니터링하여 API 오류를 추적하세요

---

**작성일**: 2025-12-12
**버전**: 1.0
