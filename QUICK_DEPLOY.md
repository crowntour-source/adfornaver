# ⚡ Railway 빠른 배포 가이드 (5분 완성)

## 1️⃣ GitHub 업로드 (2분)

```bash
cd D:\Desktop\naver-ad-bidding

git init
git add .
git commit -m "Initial commit"

# GitHub에서 새 저장소 생성 후:
git remote add origin https://github.com/YOUR_USERNAME/naver-ad-bidding.git
git branch -M main
git push -u origin main
```

## 2️⃣ Railway 배포 (2분)

1. https://railway.app 접속
2. **GitHub으로 로그인**
3. **"Deploy from GitHub repo"** 선택
4. `naver-ad-bidding` 저장소 선택
5. **"Deploy Now"** 클릭

## 3️⃣ 환경변수 설정 (1분)

프로젝트 → **Variables** 탭 → 아래 내용 복사해서 추가:

```
PORT=3001
NODE_ENV=production
NAVER_CUSTOMER_ID=1879347
NAVER_ACCESS_LICENSE=0100000000a5567f9a439e5fbbd02a629042db19e8692be51c0990893852777fcfe6ebd8ae
NAVER_SECRET_KEY=AQAAAAClVn+aQ55fu9AqYpBC2xnoDN6diBDagV/XRA+j/fPk7Q==
NAVER_API_BASE_URL=https://api.searchad.naver.com
DATABASE_PATH=./data/db.json
ENCRYPTION_KEY=naver-ads-auto-bidding-secret-key-2025
```

## 4️⃣ 완료! ✅

**Settings** → **Public Networking** → **Generate Domain**

생성된 주소로 접속하면 끝!

예: `https://your-app.railway.app/api/health`

---

## 💰 비용

- **무료**: 월 $5 크레딧 (약 500시간)
- **유료**: 월 $5~10 (24시간 작동)

---

## 🔧 문제 해결

**배포 실패?**
- `railway.json` 파일 있는지 확인
- package.json의 `"start"` 스크립트 확인

**작동 안 함?**
- Deployments 탭에서 로그 확인
- 환경변수 다시 확인

---

상세 가이드: `DEPLOYMENT_GUIDE.md` 참고
