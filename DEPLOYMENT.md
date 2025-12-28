# Vercel 배포 가이드

DART 기업 분석 시스템을 Vercel에 배포하는 방법입니다.

## 사전 준비

1. **GitHub 계정** 및 **Vercel 계정** 필요
2. **DART API 키** 발급 ([DART 오픈API](https://opendart.fss.or.kr/))

## 1단계: GitHub에 푸시

### 1.1 Git 저장소 초기화 (이미 되어 있음)

프로젝트에는 이미 Git이 초기화되어 있습니다.

### 1.2 GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. "New repository" 클릭
3. 저장소 이름 입력 (예: `dart-analysis-web`)
4. "Create repository" 클릭

### 1.3 원격 저장소 연결 및 푸시

\`\`\`bash
# 원격 저장소 추가
git remote add origin https://github.com/your-username/dart-analysis-web.git

# 파일 커밋
git add .
git commit -m "Initial commit: DART 기업 분석 웹 애플리케이션"

# GitHub에 푸시
git push -u origin main
\`\`\`

## 2단계: Vercel 배포

### 2.1 Vercel에서 프로젝트 임포트

1. [Vercel](https://vercel.com)에 로그인
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 임포트
   - GitHub 계정 연결 (처음인 경우)
   - 방금 생성한 저장소 선택
   - "Import" 클릭

### 2.2 프로젝트 설정

**Framework Preset**: Next.js (자동 감지됨)

**Build and Output Settings**: 기본값 사용
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 2.3 환경 변수 설정 ⚠️ 중요!

"Environment Variables" 섹션에서 다음 변수 추가:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_DART_API_KEY` | DART API 키 입력 |

**모든 환경에 적용**:
- ✅ Production
- ✅ Preview
- ✅ Development

### 2.4 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 진행 상황 확인 (약 1-2분 소요)
3. 배포 완료 후 제공되는 URL 확인

## 3단계: 배포 확인

### 3.1 웹사이트 접속

Vercel이 제공하는 URL (예: `https://dart-analysis-web.vercel.app`)로 접속

### 3.2 기능 테스트

1. 검색 폼에 기업명 입력 (예: "카카오")
2. 연도 범위 선택
3. "분석하기" 클릭
4. 데이터 및 차트 정상 표시 확인

## 4단계: 커스텀 도메인 설정 (선택사항)

### 4.1 도메인 추가

1. Vercel 프로젝트 대시보드 → "Settings" 탭
2. "Domains" 섹션
3. "Add" 클릭
4. 도메인 입력 (예: `dart.yourdomain.com`)

### 4.2 DNS 설정

도메인 제공업체에서 다음 레코드 추가:

**A Record** 또는 **CNAME Record** (Vercel 지침 참조)

## 배포 후 업데이트

### 코드 변경 사항 배포

\`\`\`bash
git add .
git commit -m "업데이트 내용"
git push
\`\`\`

GitHub에 푸시하면 Vercel이 자동으로 재배포합니다.

### 환경 변수 변경

1. Vercel 대시보드 → "Settings" → "Environment Variables"
2. 변수 수정
3. "Redeploy" 필요 시 "Deployments" 탭에서 재배포

## 문제 해결

### 빌드 실패

**증상**: 빌드 중 오류 발생

**해결**:
1. Vercel 빌드 로그 확인
2. 로컬에서 `npm run build` 실행하여 오류 재현
3. TypeScript 오류나 import 오류 수정

### API 오류

**증상**: "서버 오류가 발생했습니다"

**해결**:
1. 환경 변수 `NEXT_PUBLIC_DART_API_KEY` 확인
2. DART API 키 유효성 확인
3. Vercel Functions 로그 확인

### CORS 오류

**증상**: DART API 호출 실패

**해결**:
- Next.js API Routes를 사용하므로 CORS 문제 없음
- 브라우저 콘솔 로그 확인

## 성능 최적화

### 1. 캐싱 전략

현재는 실시간 DART API 호출 사용. 성능 개선을 위해:

- Vercel KV 또는 Redis로 데이터 캐싱
- ISR (Incremental Static Regeneration) 사용

### 2. Edge Functions

API Routes를 Edge Functions로 변경하여 글로벌 성능 향상

\`\`\`typescript
// app/api/analyze/route.ts
export const runtime = 'edge';
\`\`\`

### 3. Analytics

Vercel Analytics 활성화:
1. Vercel 대시보드 → "Analytics" 탭
2. "Enable" 클릭

## 보안

### API 키 보호

- ✅ 환경 변수로 저장됨
- ✅ `.env.local`은 `.gitignore`에 포함
- ✅ `NEXT_PUBLIC_` 접두사로 클라이언트 측에서 접근 가능

### Rate Limiting

DART API는 요청 제한이 있으므로:
- 사용자별 요청 제한 구현 권장
- Vercel Edge Config로 rate limiting 설정

## 모니터링

### Vercel 대시보드

- **Overview**: 배포 상태, 트래픽
- **Analytics**: 방문자 통계
- **Logs**: 실시간 로그 확인
- **Speed Insights**: 성능 메트릭

## 비용

Vercel 무료 플랜:
- ✅ 무제한 배포
- ✅ 100GB 대역폭/월
- ✅ Serverless Functions
- ✅ 커스텀 도메인

**예상 비용**: 무료 (개인/소규모 프로젝트)

## 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [DART API 문서](https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001)

---

배포 완료! 🎉

