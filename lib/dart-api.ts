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

// 기업 코드 캐시 (메모리에 저장)
let corpCodeCache: Map<string, string> | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

/**
 * DART API에서 전체 기업 코드 목록 다운로드 및 파싱
 */
async function downloadCorpCodeList(): Promise<Map<string, string>> {
  try {
    console.log('DART API에서 기업 코드 목록 다운로드 중...');
    
    const url = `${ENDPOINTS.corpCode}?crtfc_key=${DART_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // XML 파싱 (간단한 정규식 방식)
    const corpMap = new Map<string, string>();
    const listRegex = /<list>([\s\S]*?)<\/list>/g;
    const corpCodeRegex = /<corp_code>(.*?)<\/corp_code>/;
    const corpNameRegex = /<corp_name>(.*?)<\/corp_name>/;
    
    let match;
    while ((match = listRegex.exec(xmlText)) !== null) {
      const listContent = match[1];
      const codeMatch = corpCodeRegex.exec(listContent);
      const nameMatch = corpNameRegex.exec(listContent);
      
      if (codeMatch && nameMatch) {
        const corpCode = codeMatch[1].trim();
        const corpName = nameMatch[1].trim();
        
        // 정규화된 이름으로 저장 (공백 제거, 소문자 변환)
        const normalizedName = corpName.replace(/\s+/g, '').toLowerCase();
        corpMap.set(normalizedName, corpCode);
        
        // 원본 이름도 저장
        corpMap.set(corpName, corpCode);
      }
    }
    
    console.log(`${corpMap.size / 2}개 기업 코드 로드 완료`);
    return corpMap;
  } catch (error) {
    console.error('기업 코드 다운로드 실패:', error);
    throw error;
  }
}

/**
 * 기업 코드 검색
 */
export async function searchCompanyCode(companyName: string): Promise<string | null> {
  try {
    // 캐시 확인 및 갱신
    const now = Date.now();
    if (!corpCodeCache || now > cacheExpiry) {
      corpCodeCache = await downloadCorpCodeList();
      cacheExpiry = now + CACHE_DURATION;
    }
    
    // 정규화된 검색어 (공백 제거, 소문자)
    const normalizedSearch = companyName.replace(/\s+/g, '').toLowerCase();
    
    // 1. 정확한 매칭 (정규화된 이름)
    if (corpCodeCache.has(normalizedSearch)) {
      return corpCodeCache.get(normalizedSearch)!;
    }
    
    // 2. 원본 이름으로 검색
    if (corpCodeCache.has(companyName)) {
      return corpCodeCache.get(companyName)!;
    }
    
    // 3. 부분 매칭 (포함 관계)
    for (const [name, code] of corpCodeCache.entries()) {
      const normalizedName = name.replace(/\s+/g, '').toLowerCase();
      if (normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName)) {
        return code;
      }
    }
    
    return null;
  } catch (error) {
    console.error('기업 코드 검색 오류:', error);
    return null;
  }
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

