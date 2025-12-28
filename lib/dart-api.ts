/**
 * DART API 클라이언트
 * 금융감독원 전자공시시스템 API 호출 함수
 */

import {
  DART_API_KEY,
  ENDPOINTS,
  REQUEST_CONFIG,
} from '@/config/dart';
import type {
  DartApiResponse,
  CompanyInfo,
  EmployeeRawData,
  FinancialRawData,
} from '@/lib/types';

/**
 * API 요청 공통 함수
 */
async function makeRequest<T = any>(
  endpoint: string,
  params: Record<string, string>
): Promise<DartApiResponse<T>> {
  // API 키 추가
  const urlParams = new URLSearchParams({
    ...params,
    crtfc_key: DART_API_KEY,
  });

  const url = `${endpoint}?${urlParams.toString()}`;

  // 재시도 로직
  for (let attempt = 0; attempt < REQUEST_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_CONFIG.timeout
      );

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DartApiResponse<T> = await response.json();

      // API 오류 체크
      if (data.status === '000') {
        return data;
      } else if (data.status === '013') {
        console.warn(`데이터 없음: ${data.message}`);
        return data;
      } else {
        console.error(`API 오류: ${data.message} (코드: ${data.status})`);
        return data;
      }
    } catch (error) {
      console.warn(
        `요청 실패 (시도 ${attempt + 1}/${REQUEST_CONFIG.maxRetries}):`,
        error
      );
      
      if (attempt < REQUEST_CONFIG.maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, REQUEST_CONFIG.retryDelay)
        );
      } else {
        throw error;
      }
    }
  }

  throw new Error('최대 재시도 횟수 초과');
}

/**
 * 기업 기본 정보 조회
 */
export async function getCompanyInfo(
  corpCode: string
): Promise<DartApiResponse<CompanyInfo>> {
  return makeRequest<CompanyInfo>(ENDPOINTS.company, { corp_code: corpCode });
}

/**
 * 재무제표 조회
 */
export async function getFinancialStatement(
  corpCode: string,
  bsnsYear: string,
  reprtCode: string = '11011'
): Promise<DartApiResponse<FinancialRawData>> {
  return makeRequest<FinancialRawData>(ENDPOINTS.fnlttSinglAcnt, {
    corp_code: corpCode,
    bsns_year: bsnsYear,
    reprt_code: reprtCode,
  });
}

/**
 * 직원 현황 조회
 */
export async function getEmployeeInfo(
  corpCode: string,
  bsnsYear: string,
  reprtCode: string = '11011'
): Promise<DartApiResponse<EmployeeRawData>> {
  return makeRequest<EmployeeRawData>(ENDPOINTS.empSttus, {
    corp_code: corpCode,
    bsns_year: bsnsYear,
    reprt_code: reprtCode,
  });
}

/**
 * 기업 코드 검색 (간단한 버전 - 실제로는 XML 파싱 필요)
 */
export async function searchCompanyCode(companyName: string): Promise<string | null> {
  // 주요 기업 코드 매핑 (하드코딩)
  const companyCodeMap: Record<string, string> = {
    '삼성전자': '00126380',
    '삼성': '00126380',
    'SK하이닉스': '00164779',
    'SK': '00164779',
    '네이버': '00252450',
    'NAVER': '00252450',
    '카카오': '00356370',
    'Kakao': '00356370',
    'LG전자': '00101412',
    'LG': '00101412',
    '현대자동차': '00164742',
    '현대차': '00164742',
    '현대': '00164742',
    '기아': '00164779',
    'LG디스플레이': '00103054',
    'SK텔레콤': '00181515',
    'KT': '00164529',
    '포스코': '00164869',
    '한화': '00121480',
    '롯데': '00157624',
  };

  // 정확한 매칭 먼저 시도
  if (companyCodeMap[companyName]) {
    return companyCodeMap[companyName];
  }

  // 부분 매칭 시도
  for (const [name, code] of Object.entries(companyCodeMap)) {
    if (name.includes(companyName) || companyName.includes(name)) {
      return code;
    }
  }

  return null;
}

/**
 * 공시 목록 조회
 */
export async function getDisclosureList(
  corpCode?: string,
  bgnDe?: string,
  endDe?: string,
  pblntfTy: string = 'A'
): Promise<DartApiResponse<any>> {
  const params: Record<string, string> = {
    pblntf_ty: pblntfTy,
  };

  if (corpCode) params.corp_code = corpCode;
  if (bgnDe) params.bgn_de = bgnDe;
  if (endDe) params.end_de = endDe;

  return makeRequest(ENDPOINTS.list, params);
}

