/**
 * DART API 설정 파일
 * 금융감독원 전자공시시스템 API 설정
 */

// DART API 키
export const DART_API_KEY = process.env.NEXT_PUBLIC_DART_API_KEY || '75e5b2bbcb5e24ef6043ba1e02e60767db708744';

// DART API 기본 URL
export const DART_BASE_URL = 'https://opendart.fss.or.kr/api';

// API 엔드포인트
export const ENDPOINTS = {
  // 공시검색
  list: `${DART_BASE_URL}/list.json`,
  
  // 사업보고서 주요정보
  company: `${DART_BASE_URL}/company.json`,
  
  // 단일회사 전체 재무제표
  fnlttSinglAcnt: `${DART_BASE_URL}/fnlttSinglAcnt.json`,
  
  // 다중회사 전체 재무제표
  fnlttMultiAcnt: `${DART_BASE_URL}/fnlttMultiAcnt.json`,
  
  // 배당정보
  alotMatter: `${DART_BASE_URL}/alotMatter.json`,
  
  // 임원 현황
  exctvSttus: `${DART_BASE_URL}/exctvSttus.json`,
  
  // 직원 현황
  empSttus: `${DART_BASE_URL}/empSttus.json`,
  
  // 주주 현황
  hmvAuditIndvdlByStkqty: `${DART_BASE_URL}/hmvAuditIndvdlByStkqty.json`,
  
  // 기업 코드 다운로드
  corpCode: `${DART_BASE_URL}/corpCode.xml`,
} as const;

// 요청 설정
export const REQUEST_CONFIG = {
  timeout: 30000, // 타임아웃 (밀리초)
  maxRetries: 3, // 최대 재시도 횟수
  retryDelay: 2000, // 재시도 간격 (밀리초)
} as const;

// 데이터 수집 설정
export const COLLECTION_CONFIG = {
  defaultYearRange: 3, // 기본 수집 연도 범위 (최근 3년)
  reportType: '11011', // 사업보고서 (11011), 반기보고서 (11012), 분기보고서 (11013)
} as const;

