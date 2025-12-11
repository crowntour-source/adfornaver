# 🚀 네이버 광고 자동입찰 시스템 배포 가이드

24시간 자동으로 작동하도록 웹 서버에 배포하는 방법을 안내합니다.

---

## 📋 목차

1. [배포 전 준비사항](#배포-전-준비사항)
2. [Railway 배포 (추천)](#railway-배포-추천)
3. [Render 배포](#render-배포)
4. [기타 플랫폼](#기타-플랫폼)
5. [배포 후 확인사항](#배포-후-확인사항)

---

## 🎯 배포 전 준비사항

### 1. GitHub 계정 및 저장소 준비

#### GitHub 저장소 생성
```bash
# 1. GitHub에서 새 저장소 생성 (https://github.com/new)
# 저장소 이름: naver-ad-bidding
# Public 또는 Private 선택

# 2. 로컬 코드를 GitHub에 업로드
cd D:\Desktop\naver-ad-bidding

# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Naver Ad Bidding System"

# GitHub 저장소 연결 (본인의 GitHub 주소로 변경)
git remote add origin https://github.com/YOUR_USERNAME/naver-ad-bidding.git

# 업로드
git branch -M main
git push -u origin main
```

### 2. 환경변수 확인

배포할 때 필요한 환경변수 목록:

```env
# 서버 설정
PORT=3001
NODE_ENV=production

# 네이버 광고 API
NAVER_CUSTOMER_ID=1879347
NAVER_ACCESS_LICENSE=0100000000a5567f9a439e5fbbd02a629042db19e8692be51c0990893852777fcfe6ebd8ae
NAVER_SECRET_KEY=AQAAAAClVn+aQ55fu9AqYpBC2xnoDN6diBDagV/XRA+j/fPk7Q==
NAVER_API_BASE_URL=https://api.searchad.naver.com

# 프론트엔드 URL (배포 후 실제 도메인으로 변경)
FRONTEND_URL=https://your-app.railway.app

# 데이터베이스 경로
DATABASE_PATH=./data/db.json

# 암호화 키
ENCRYPTION_KEY=naver-ads-auto-bidding-secret-key-2025

# 자동입찰 설정
AUTO_BID_INTERVAL_MINUTES=10
RANK_CHECK_INTERVAL_MINUTES=5
```

---

## 🚂 Railway 배포 (추천)

Railway는 Node.js 앱을 쉽게 배포할 수 있고, cron job도 완벽하게 지원합니다.

### 1단계: Railway 계정 생성

1. https://railway.app 접속
2. **"Start a New Project"** 클릭
3. GitHub 계정으로 로그인

### 2단계: 프로젝트 배포

1. **"Deploy from GitHub repo"** 선택
2. GitHub 저장소 선택: `naver-ad-bidding`
3. **"Deploy Now"** 클릭

### 3단계: 환경변수 설정

1. 프로젝트 클릭 → **Variables** 탭
2. 아래 환경변수들을 하나씩 추가:

```
PORT = 3001
NODE_ENV = production
NAVER_CUSTOMER_ID = 1879347
NAVER_ACCESS_LICENSE = 0100000000a5567f9a439e5fbbd02a629042db19e8692be51c0990893852777fcfe6ebd8ae
NAVER_SECRET_KEY = AQAAAAClVn+aQ55fu9AqYpBC2xnoDN6diBDagV/XRA+j/fPk7Q==
NAVER_API_BASE_URL = https://api.searchad.naver.com
DATABASE_PATH = ./data/db.json
ENCRYPTION_KEY = naver-ads-auto-bidding-secret-key-2025
```

3. **"Deploy"** 다시 클릭하여 환경변수 적용

### 4단계: 도메인 확인

1. **Settings** → **Public Networking**
2. **Generate Domain** 클릭
3. 생성된 도메인 복사 (예: `your-app.railway.app`)
4. 다시 **Variables** 탭으로 가서 `FRONTEND_URL` 추가:
   ```
   FRONTEND_URL = https://your-app.railway.app
   ```

### 5단계: 배포 확인

```bash
# 1. API 헬스 체크
curl https://your-app.railway.app/api/health

# 응답 예시:
# {
#   "status": "OK",
#   "timestamp": "2025-12-12T10:30:00.000Z",
#   "service": "Naver Ads Auto Bidding API"
# }

# 2. 브라우저에서 접속
# https://your-app.railway.app
```

### Railway 요금

```
무료 플랜:
├─ 월 $5 크레딧 제공
├─ 약 500시간 실행 가능
└─ 소규모 프로젝트 충분

유료 플랫:
├─ 사용한 만큼 지불
├─ 예상 비용: 월 $5~10
└─ 항상 켜져있음 보장
```

---

## 🎨 Render 배포

Render는 무료 플랜이 있지만, 15분 동안 사용하지 않으면 sleep 모드로 전환됩니다.

### 주의사항 ⚠️
- **무료 플랜**: Sleep 모드 때문에 cron job이 중단될 수 있음
- **유료 플랜 ($7/월)**: 항상 켜져있어서 cron job 정상 작동

### 배포 단계

1. https://render.com 접속
2. **"New Web Service"** 클릭
3. GitHub 저장소 연결
4. 설정:
   ```
   Name: naver-ad-bidding
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```
5. 환경변수 추가 (Railway와 동일)
6. **"Create Web Service"** 클릭

---

## ☁️ 기타 플랫폼

### Fly.io (Always-on, 무료)

```bash
# 1. Fly CLI 설치
# Windows:
iwr https://fly.io/install.ps1 -useb | iex

# 2. 로그인
fly auth login

# 3. 앱 생성
fly launch

# 4. 환경변수 설정
fly secrets set NAVER_CUSTOMER_ID=1879347
fly secrets set NAVER_ACCESS_LICENSE=0100000000a5567f9a...
# ... 나머지 환경변수들

# 5. 배포
fly deploy
```

### Naver Cloud Platform (유료, 한국 서버)

1. https://www.ncloud.com 접속
2. **Server** → **Virtual Private Server** 생성
3. Ubuntu 20.04 선택
4. SSH 접속 후 직접 설정:
   ```bash
   # Node.js 설치
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Git으로 코드 다운로드
   git clone https://github.com/YOUR_USERNAME/naver-ad-bidding.git
   cd naver-ad-bidding/backend

   # 의존성 설치
   npm install

   # 환경변수 설정
   nano .env
   # (위의 환경변수들 입력)

   # PM2로 실행 (24시간 작동)
   sudo npm install -g pm2
   pm2 start src/server.js --name naver-ads
   pm2 startup
   pm2 save
   ```

---

## 📊 데이터베이스 업그레이드 (선택사항)

현재는 JSON 파일로 데이터를 저장하고 있습니다. 실제 서비스에서는 데이터베이스를 사용하는 것이 좋습니다.

### 무료 데이터베이스 옵션

#### 1. Railway PostgreSQL (추천)

Railway에서 PostgreSQL 추가:
```bash
# Railway 대시보드에서
1. "New" → "Database" → "PostgreSQL"
2. 자동으로 DATABASE_URL 환경변수 생성됨
```

코드 수정 필요:
```javascript
// 현재: lowdb (JSON)
// 변경: PostgreSQL
npm install pg

// db.js 수정하여 PostgreSQL 연결
```

#### 2. Supabase (무료 PostgreSQL)

```bash
1. https://supabase.com 가입
2. 새 프로젝트 생성
3. Database URL 복사
4. 환경변수에 추가
```

---

## ✅ 배포 후 확인사항

### 1. API 작동 확인

```bash
# 헬스 체크
curl https://your-app.railway.app/api/health

# 캠페인 조회 테스트
curl https://your-app.railway.app/api/campaigns
```

### 2. 스케줄러 작동 확인

```bash
# 로그 확인
# Railway: Deployments → 로그 탭
# Render: Logs 메뉴

# 5분마다 이런 로그가 나와야 함:
# ⏰ [A등급] 자동 입찰 시작
# ✅ [A등급] 완료: 3개 변경, 5개 유지, 0개 실패
```

### 3. 프론트엔드 연결

#### 옵션 1: Vercel로 프론트엔드 배포

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. frontend 폴더에서
cd frontend
vercel

# 3. 환경변수 설정
# Vercel 대시보드 → Settings → Environment Variables
# NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

#### 옵션 2: 백엔드와 같은 서버에서 실행

프론트엔드를 빌드해서 백엔드에서 서빙:
```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://your-app.railway.app

# 빌드
npm run build

# backend/src/server.js에 추가
app.use(express.static('../frontend/out'));
```

---

## 💰 예상 비용

### Railway (추천)

```
무료로 시작:
├─ 월 $5 크레딧
├─ 약 500시간 가능
└─ 테스트/소규모 충분

실제 사용 시:
├─ 월 $5~10
├─ 24시간 작동
└─ 무제한 트래픽
```

### Render

```
무료 플랜:
├─ 비용: $0
├─ 제한: Sleep 모드 (cron 중단)
└─ 테스트용으로만 추천

유료 플랜:
├─ 비용: $7/월
├─ 24시간 작동
└─ cron job 정상 작동
```

### Fly.io

```
무료 플랜:
├─ 3개 앱까지 무료
├─ 항상 켜져있음
└─ 충분한 리소스

유료:
├─ 월 $5~10
└─ 더 많은 리소스
```

### Naver Cloud

```
VPS 서버:
├─ 월 10,000~30,000원
├─ 완전한 제어
└─ 한국 서버 (빠름)
```

---

## 🔧 트러블슈팅

### 문제 1: 배포 후 서버가 시작 안 됨

**해결:**
```bash
# package.json 확인
"scripts": {
  "start": "node src/server.js"  // ✅ 맞음
  "start": "nodemon src/server.js"  // ❌ 틀림 (배포에서 nodemon 사용 X)
}
```

### 문제 2: 환경변수가 적용 안 됨

**해결:**
- Railway/Render 대시보드에서 환경변수 다시 확인
- 배포 다시 실행 (Redeploy)
- 환경변수에 공백이나 특수문자 확인

### 문제 3: Cron job이 작동 안 함

**해결:**
- 로그에서 스케줄러 시작 메시지 확인
- `POST /api/scheduler/start`로 수동 시작
- 무료 플랜이 sleep 모드인지 확인 (Render)

### 문제 4: CORS 에러

**해결:**
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',  // * = 모든 도메인 허용
  credentials: true
}));
```

---

## 📱 모니터링 설정

### 1. UptimeRobot (무료 모니터링)

```
1. https://uptimerobot.com 가입
2. 새 모니터 추가:
   - Type: HTTP(s)
   - URL: https://your-app.railway.app/api/health
   - Interval: 5분마다 체크
3. 알림 설정 (이메일, SMS)
```

### 2. Railway 로그 확인

```
Railway 대시보드:
└─ Deployments
   └─ 로그 탭
      ├─ 실시간 로그 확인
      ├─ 에러 검색
      └─ 다운로드 가능
```

---

## 🎯 배포 완료 체크리스트

- [ ] GitHub 저장소에 코드 업로드
- [ ] Railway/Render 계정 생성
- [ ] 프로젝트 배포
- [ ] 환경변수 모두 설정
- [ ] API 헬스 체크 성공
- [ ] 스케줄러 작동 확인
- [ ] 프론트엔드 배포 (선택)
- [ ] 도메인 연결 (선택)
- [ ] 모니터링 설정
- [ ] 비용 예산 확인

---

## 🚀 다음 단계

배포가 완료되면:

1. **24시간 모니터링**: 처음 1~2일은 로그를 자주 확인
2. **성능 최적화**: 필요시 서버 리소스 업그레이드
3. **백업 설정**: 데이터베이스 자동 백업 설정
4. **알림 설정**: 에러 발생 시 이메일/SMS 알림
5. **도메인 연결**: 커스텀 도메인 구매 및 연결 (선택)

---

## 📞 도움이 필요하면

- Railway 문서: https://docs.railway.app
- Render 문서: https://render.com/docs
- 이슈 발생 시: GitHub Issues에 올려주세요

**축하합니다! 이제 24시간 자동으로 작동하는 네이버 광고 자동입찰 시스템을 운영할 수 있습니다!** 🎉
