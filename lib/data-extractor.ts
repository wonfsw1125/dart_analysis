/**
 * 데이터 추출 및 가공 모듈
 * DART API 응답을 분석 가능한 형태로 변환
 */

import type {
  DartApiResponse,
  EmployeeRawData,
  EmployeeData,
  FinancialRawData,
  FinancialData,
  CompanyAnalysisData,
} from '@/lib/types';

/**
 * 숫자 문자열을 number로 변환
 */
function cleanNumber(value: string | undefined | null): number | null {
  if (!value || value === '-' || value === '') {
    return null;
  }

  try {
    // 쉼표 제거 및 공백 제거
    const cleaned = value.replace(/,/g, '').replace(/\s/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

/**
 * 직원 현황 데이터 추출
 */
export function extractEmployeeData(
  employeeInfo: DartApiResponse<EmployeeRawData>,
  year: string
): EmployeeData[] {
  if (employeeInfo.status !== '000' || !employeeInfo.list) {
    return [];
  }

  const results: EmployeeData[] = [];

  for (const emp of employeeInfo.list) {
    // 직원 구분 (정규직, 계약직 등)
    const empType = emp.fo_bbm?.trim() || '';

    // 성별 구분
    const gender = emp.sexdstn?.trim() || '';

    // 직원수 (정규직 + 계약직 합계)
    let employeeCount = cleanNumber(emp.sm);
    if (employeeCount === null || employeeCount === 0) {
      // sm이 없으면 정규직 수 사용
      employeeCount = cleanNumber(emp.rgllbr_co) || 0;
    }

    // 평균 급여 계산 (연간 총급여 / 직원수)
    let avgSalary: number | null = null;
    const totalSalary = cleanNumber(emp.fyer_salary_totamt); // 연간 총급여
    const janSalary = cleanNumber(emp.jan_salary_am); // 1인당 급여

    if (janSalary) {
      avgSalary = janSalary / 1_000_000; // 백만원 단위로 변환
    } else if (totalSalary && employeeCount && employeeCount > 0) {
      avgSalary = totalSalary / employeeCount / 1_000_000; // 백만원 단위
    }

    results.push({
      year,
      empType,
      gender,
      employeeCount: employeeCount || 0,
      avgServiceYears: cleanNumber(emp.avrg_cnwk_sdytrn),
      avgSalary,
      totalSalary,
      etc: emp.rm?.trim() || '',
    });
  }

  return results;
}

/**
 * 재무제표 데이터 추출
 */
export function extractFinancialData(
  financialInfo: DartApiResponse<FinancialRawData>,
  year: string
): FinancialData[] {
  if (financialInfo.status !== '000' || !financialInfo.list) {
    return [];
  }

  const results: FinancialData[] = [];

  // 주요 재무 항목만 필터링
  const keyItems = [
    '매출액',
    '영업이익',
    '당기순이익',
    '자산총계',
    '부채총계',
    '자본총계',
    '유동자산',
    '비유동자산',
    '유동부채',
    '비유동부채',
  ];

  for (const fin of financialInfo.list) {
    const accountNm = fin.account_nm?.trim() || '';

    // 주요 계정과목만 추출
    if (keyItems.some((key) => accountNm.includes(key))) {
      results.push({
        year,
        accountId: fin.account_id || '',
        accountName: accountNm,
        fsDiv: fin.fs_div || '', // 재무제표구분 (CFS=연결, OFS=별도)
        sjDiv: fin.sj_div || '', // 재무제표종류 (BS=재무상태표, IS=손익계산서)
        thstrmNm: fin.thstrm_nm || '', // 당기명
        thstrmAmount: cleanNumber(fin.thstrm_amount), // 당기금액
        frmtrmNm: fin.frmtrm_nm || '', // 전기명
        frmtrmAmount: cleanNumber(fin.frmtrm_amount), // 전기금액
        bfefrmtrmNm: fin.bfefrmtrm_nm || '', // 전전기명
        bfefrmtrmAmount: cleanNumber(fin.bfefrmtrm_amount), // 전전기금액
        ord: fin.ord || '', // 계정과목 정렬순서
      });
    }
  }

  return results;
}

/**
 * 성장률 계산 (전년 대비 증감률)
 */
export function calculateGrowthRate(
  current: number | null,
  previous: number | null
): number | null {
  if (
    previous === null ||
    previous === 0 ||
    current === null ||
    isNaN(previous) ||
    isNaN(current)
  ) {
    return null;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * 종합 분석 데이터프레임 생성
 */
export function createSummaryData(
  corpName: string,
  corpCode: string,
  employeeDataList: EmployeeData[],
  financialDataList: FinancialData[]
): CompanyAnalysisData[] {
  const summaryData: CompanyAnalysisData[] = [];

  if (employeeDataList.length === 0 && financialDataList.length === 0) {
    return summaryData;
  }

  // 연도별로 데이터 정리
  const years = [
    ...new Set([
      ...employeeDataList.map((d) => d.year),
      ...financialDataList.map((d) => d.year),
    ]),
  ].sort();

  for (const year of years) {
    // 해당 연도 직원 데이터
    const yearEmp = employeeDataList.filter((d) => d.year === year);

    // 해당 연도 재무 데이터 (연결재무제표 우선)
    let yearFin = financialDataList.filter(
      (d) => d.year === year && d.fsDiv === 'CFS'
    );

    // 연결재무제표가 없으면 별도재무제표 사용
    if (yearFin.length === 0) {
      yearFin = financialDataList.filter(
        (d) => d.year === year && d.fsDiv === 'OFS'
      );
    }

    // 직원 데이터 추출
    const totalEmp = yearEmp.reduce((sum, d) => sum + (d.employeeCount || 0), 0);

    // 평균 급여 계산 (총급여 / 총직원수)
    const totalSalary = yearEmp.reduce((sum, d) => sum + (d.totalSalary || 0), 0);
    let avgSalary = 0;
    if (totalEmp > 0 && totalSalary > 0) {
      avgSalary = totalSalary / totalEmp / 1_000_000; // 백만원 단위
    } else {
      // 총급여 데이터가 없으면 평균값 사용
      const salaries = yearEmp
        .map((d) => d.avgSalary)
        .filter((s): s is number => s !== null);
      if (salaries.length > 0) {
        avgSalary = salaries.reduce((sum, s) => sum + s, 0) / salaries.length;
      }
    }

    // 재무 항목 추출
    const revenue =
      yearFin
        .filter((d) => d.accountName.includes('매출액'))
        .reduce((sum, d) => sum + (d.thstrmAmount || 0), 0) || 0;

    const operatingProfit =
      yearFin
        .filter((d) => d.accountName.includes('영업이익'))
        .reduce((sum, d) => sum + (d.thstrmAmount || 0), 0) || 0;

    const netIncome =
      yearFin
        .filter((d) => d.accountName.includes('당기순이익'))
        .reduce((sum, d) => sum + (d.thstrmAmount || 0), 0) || 0;

    const totalAssets =
      yearFin
        .filter((d) => d.accountName.includes('자산총계'))
        .reduce((sum, d) => sum + (d.thstrmAmount || 0), 0) || 0;

    summaryData.push({
      companyName: corpName,
      companyCode: corpCode,
      year,
      totalEmployees: totalEmp,
      avgSalary: Math.round(avgSalary * 100) / 100,
      revenue,
      operatingProfit,
      netIncome,
      totalAssets,
      employeeGrowthRate: null,
      salaryGrowthRate: null,
      revenueGrowthRate: null,
      operatingProfitGrowthRate: null,
    });
  }

  // 성장률 계산 (전년 대비)
  if (summaryData.length > 1) {
    summaryData.sort((a, b) => a.year.localeCompare(b.year));

    for (let i = 1; i < summaryData.length; i++) {
      const current = summaryData[i];
      const previous = summaryData[i - 1];

      current.employeeGrowthRate = calculateGrowthRate(
        current.totalEmployees,
        previous.totalEmployees
      );
      current.salaryGrowthRate = calculateGrowthRate(
        current.avgSalary,
        previous.avgSalary
      );
      current.revenueGrowthRate = calculateGrowthRate(
        current.revenue,
        previous.revenue
      );
      current.operatingProfitGrowthRate = calculateGrowthRate(
        current.operatingProfit,
        previous.operatingProfit
      );
    }
  }

  return summaryData;
}

