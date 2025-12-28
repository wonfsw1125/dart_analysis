/**
 * DART API 및 애플리케이션 타입 정의
 */

// DART API 공통 응답 타입
export interface DartApiResponse<T = any> {
  status: string;
  message: string;
  list?: T[];
}

// 기업 정보
export interface CompanyInfo {
  corp_code: string;
  corp_name: string;
  corp_name_eng?: string;
  stock_name?: string;
  stock_code?: string;
  ceo_nm?: string;
  corp_cls?: string;
  jurir_no?: string;
  bizr_no?: string;
  adres?: string;
  hm_url?: string;
  ir_url?: string;
  phn_no?: string;
  fax_no?: string;
  induty_code?: string;
  est_dt?: string;
  acc_mt?: string;
}

// 직원 현황 원본 데이터
export interface EmployeeRawData {
  rcept_no: string;
  corp_cls: string;
  corp_code: string;
  corp_name: string;
  sexdstn: string; // 성별 구분
  fo_bbm: string; // 사업부문
  reform_bfe_emp_co_rgllbr?: string;
  reform_bfe_emp_co_cnttk?: string;
  reform_bfe_emp_co_etc?: string;
  rgllbr_co?: string; // 정규직 수
  rgllbr_abacpt_labrr_co?: string;
  cnttk_co?: string; // 계약직 수
  cnttk_abacpt_labrr_co?: string;
  sm?: string; // 합계
  avrg_cnwk_sdytrn?: string; // 평균 근속연수
  fyer_salary_totamt?: string; // 연간 총급여
  jan_salary_am?: string; // 1인당 급여
  rm?: string; // 비고
  stlm_dt?: string;
}

// 재무제표 원본 데이터
export interface FinancialRawData {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  sj_div: string; // 재무제표종류 (BS=재무상태표, IS=손익계산서)
  sj_nm: string;
  account_id: string;
  account_nm: string; // 계정과목
  account_detail?: string;
  thstrm_nm: string; // 당기명
  thstrm_amount?: string; // 당기금액
  frmtrm_nm?: string; // 전기명
  frmtrm_amount?: string; // 전기금액
  bfefrmtrm_nm?: string; // 전전기명
  bfefrmtrm_amount?: string; // 전전기금액
  ord?: string;
  currency?: string;
  fs_div: string; // 재무제표구분 (CFS=연결, OFS=별도)
  fs_nm: string;
}

// 가공된 직원 데이터
export interface EmployeeData {
  year: string;
  empType: string; // 직원 구분
  gender: string; // 성별
  employeeCount: number; // 직원수 합계
  avgServiceYears: number | null; // 평균근속연수
  avgSalary: number | null; // 1인당 평균급여액 (백만원)
  totalSalary: number | null; // 연간 총급여
  etc: string; // 비고
}

// 가공된 재무 데이터
export interface FinancialData {
  year: string;
  accountId: string;
  accountName: string; // 계정명
  fsDiv: string; // 재무제표구분
  sjDiv: string; // 재무제표종류
  thstrmNm: string; // 당기명
  thstrmAmount: number | null; // 당기금액
  frmtrmNm: string; // 전기명
  frmtrmAmount: number | null; // 전기금액
  bfefrmtrmNm: string; // 전전기명
  bfefrmtrmAmount: number | null; // 전전기금액
  ord: string;
}

// 종합 분석 데이터
export interface CompanyAnalysisData {
  companyName: string;
  companyCode: string;
  year: string;
  totalEmployees: number;
  avgSalary: number; // 백만원
  revenue: number; // 백만원
  operatingProfit: number; // 백만원
  netIncome: number; // 백만원
  totalAssets: number; // 백만원
  employeeGrowthRate: number | null; // %
  salaryGrowthRate: number | null; // %
  revenueGrowthRate: number | null; // %
  operatingProfitGrowthRate: number | null; // %
}

// 예측 데이터
export interface PredictionData {
  year: string;
  predictedEmployees: number;
  expectedHiring: number;
  predictedRevenue: number;
  predictedOperatingProfit: number;
  employeeTrend: 'growth' | 'decline' | 'stable';
  revenueTrend: 'growth' | 'decline' | 'stable';
  confidence: 'high' | 'medium' | 'low';
}

// 예측 요약
export interface ForecastSummary {
  summary: string;
  trend: 'positive' | 'negative' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
  keyInsights: string[];
}

// 분석 요청
export interface AnalysisRequest {
  companyName: string;
  startYear: number;
  endYear: number;
}

// 분석 응답
export interface AnalysisResponse {
  companyInfo: {
    name: string;
    code: string;
  };
  data: CompanyAnalysisData[];
  predictions: PredictionData[];
  forecast: ForecastSummary;
  error?: string;
}

// 차트 데이터 포인트
export interface ChartDataPoint {
  year: string;
  [key: string]: string | number | null | undefined;
}

