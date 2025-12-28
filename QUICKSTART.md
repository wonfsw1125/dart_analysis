# 빠른 시작 가이드

DART 기업 분석 웹 애플리케이션을 5분 안에 실행하세요!

## 로컬 실행 (개발용)

### 1. 패키지 설치

\`\`\`bash
npm install
\`\`\`

### 2. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

### 3. 브라우저에서 열기

[http://localhost:3000](http://localhost:3000)

## Vercel 배포 (1분 배포)

### 방법 1: Vercel CLI (가장 빠름)

\`\`\`bash
# Vercel CLI 설치 (한 번만)
npm i -g vercel

# 배포
vercel
\`\`\`

화면의 지시에 따라 진행하고, 환경 변수 입력 시:
- \`NEXT_PUBLIC_DART_API_KEY\`: 75e5b2bbcb5e24ef6043ba1e02e60767db708744

### 방법 2: GitHub + Vercel

1. GitHub에 저장소 푸시
2. [vercel.com](https://vercel.com)에서 임포트
3. 환경 변수 설정
4. 배포!

자세한 내용은 [DEPLOYMENT.md](DEPLOYMENT.md) 참조

## 주요 기능

- 기업명 검색 (예: 카카오, 삼성전자)
- 연도 범위 설정 (예: 2021~2023)
- 재무/인력 데이터 테이블
- 인터랙티브 차트 4종
- AI 기반 채용/매출 예측

## 문제 해결

### 빌드 오류

\`\`\`bash
npm run build
\`\`\`

빌드가 성공하면 배포 가능!

### API 오류

DART API 키 확인:
- 개발: \`.env.local\` 파일
- 배포: Vercel 환경 변수

## 다음 단계

- [README.md](README.md) - 전체 문서
- [DEPLOYMENT.md](DEPLOYMENT.md) - 배포 가이드
- [lib/dart-api.ts](lib/dart-api.ts) - 기업 코드 추가

즐거운 분석 되세요! 📊

