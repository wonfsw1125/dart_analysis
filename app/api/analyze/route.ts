/**
 * 기업 분석 API Route
 * POST /api/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  searchCompanyCode,
  getEmployeeInfo,
  getFinancialStatement,
} from '@/lib/dart-api';
import {
  extractEmployeeData,
  extractFinancialData,
  createSummaryData,
} from '@/lib/data-extractor';
import {
  generatePredictions,
  generateForecastSummary,
} from '@/lib/prediction';
import type { AnalysisRequest, AnalysisResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { companyName, startYear, endYear } = body;

    // 입력 검증
    if (!companyName || !startYear || !endYear) {
      return NextResponse.json(
        { error: '기업명과 년도 범위를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (startYear > endYear) {
      return NextResponse.json(
        { error: '시작 연도는 종료 연도보다 작아야 합니다.' },
        { status: 400 }
      );
    }

    if (endYear - startYear > 10) {
      return NextResponse.json(
        { error: '최대 10년치 데이터만 조회 가능합니다.' },
        { status: 400 }
      );
    }

    // 1. 기업 코드 검색
    console.log(`기업명 검색: ${companyName}`);
    const corpCode = await searchCompanyCode(companyName);

    if (!corpCode) {
      return NextResponse.json(
        {
          error: `'${companyName}'에 해당하는 기업을 찾을 수 없습니다. 정확한 기업명을 입력해주세요.`,
        },
        { status: 404 }
      );
    }

    console.log(`기업 코드 찾음: ${corpCode}`);

    // 2. 연도별 데이터 수집
    const years: string[] = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }

    const allEmployeeData: any[] = [];
    const allFinancialData: any[] = [];

    for (const year of years) {
      console.log(`${year}년 데이터 수집 중...`);

      try {
        // 직원 현황 조회
        const empInfo = await getEmployeeInfo(corpCode, year);
        const empData = extractEmployeeData(empInfo, year);
        allEmployeeData.push(...empData);

        // 재무제표 조회
        const finInfo = await getFinancialStatement(corpCode, year);
        const finData = extractFinancialData(finInfo, year);
        allFinancialData.push(...finData);

        // API 요청 제한 방지 (0.5초 대기)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`${year}년 데이터 수집 실패:`, error);
        // 일부 연도 실패해도 계속 진행
      }
    }

    if (allEmployeeData.length === 0 && allFinancialData.length === 0) {
      return NextResponse.json(
        {
          error: '해당 기간의 데이터를 찾을 수 없습니다. 다른 연도를 시도해보세요.',
        },
        { status: 404 }
      );
    }

    // 3. 종합 분석 데이터 생성
    console.log('종합 분석 데이터 생성 중...');
    const summaryData = createSummaryData(
      companyName,
      corpCode,
      allEmployeeData,
      allFinancialData
    );

    if (summaryData.length === 0) {
      return NextResponse.json(
        { error: '분석 가능한 데이터가 없습니다.' },
        { status: 404 }
      );
    }

    // 4. 예측 모델 실행
    console.log('예측 모델 실행 중...');
    const predictions = generatePredictions(summaryData);
    const forecast = generateForecastSummary(summaryData, predictions);

    // 5. 결과 반환
    const response: AnalysisResponse = {
      companyInfo: {
        name: companyName,
        code: corpCode,
      },
      data: summaryData,
      predictions,
      forecast,
    };

    console.log('분석 완료!');
    return NextResponse.json(response);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}

