/**
 * 예측 모델
 * 선형 회귀 기반 간단한 예측 로직
 */

import { linearRegression, linearRegressionLine } from 'simple-statistics';
import type {
  CompanyAnalysisData,
  PredictionData,
  ForecastSummary,
} from '@/lib/types';

/**
 * 선형 회귀를 사용한 다음 연도 예측
 */
function predictNextValue(
  years: number[],
  values: number[]
): {
  nextValue: number;
  slope: number;
  trend: 'growth' | 'decline' | 'stable';
} {
  if (years.length < 2 || values.length < 2) {
    return {
      nextValue: values[values.length - 1] || 0,
      slope: 0,
      trend: 'stable',
    };
  }

  try {
    // 데이터 포인트 준비 [[x1, y1], [x2, y2], ...]
    const points: [number, number][] = years.map((year, i) => [year, values[i]]);

    // 선형 회귀
    const { m: slope, b: intercept } = linearRegression(points);

    // 다음 연도 예측
    const nextYear = years[years.length - 1] + 1;
    const nextValue = slope * nextYear + intercept;

    // 트렌드 판단
    let trend: 'growth' | 'decline' | 'stable';
    if (slope > 0.05) {
      trend = 'growth';
    } else if (slope < -0.05) {
      trend = 'decline';
    } else {
      trend = 'stable';
    }

    return {
      nextValue: Math.max(0, nextValue), // 음수 방지
      slope,
      trend,
    };
  } catch (error) {
    console.error('예측 계산 오류:', error);
    return {
      nextValue: values[values.length - 1] || 0,
      slope: 0,
      trend: 'stable',
    };
  }
}

/**
 * 직원수 예측
 */
export function predictEmployeeCount(
  historicalData: CompanyAnalysisData[]
): {
  predictedCount: number;
  expectedHiring: number;
  trend: 'growth' | 'decline' | 'stable';
} {
  if (historicalData.length === 0) {
    return { predictedCount: 0, expectedHiring: 0, trend: 'stable' };
  }

  const years = historicalData.map((d) => parseInt(d.year));
  const employees = historicalData.map((d) => d.totalEmployees);

  const { nextValue, trend } = predictNextValue(years, employees);
  const currentCount = employees[employees.length - 1] || 0;

  return {
    predictedCount: Math.round(nextValue),
    expectedHiring: Math.round(nextValue - currentCount),
    trend,
  };
}

/**
 * 매출 예측
 */
export function predictRevenue(
  historicalData: CompanyAnalysisData[]
): {
  predictedRevenue: number;
  trend: 'growth' | 'decline' | 'stable';
} {
  if (historicalData.length === 0) {
    return { predictedRevenue: 0, trend: 'stable' };
  }

  const years = historicalData.map((d) => parseInt(d.year));
  const revenues = historicalData.map((d) => d.revenue);

  const { nextValue, trend } = predictNextValue(years, revenues);

  return {
    predictedRevenue: nextValue,
    trend,
  };
}

/**
 * 영업이익 예측
 */
export function predictOperatingProfit(
  historicalData: CompanyAnalysisData[]
): {
  predictedProfit: number;
  trend: 'growth' | 'decline' | 'stable';
} {
  if (historicalData.length === 0) {
    return { predictedProfit: 0, trend: 'stable' };
  }

  const years = historicalData.map((d) => parseInt(d.year));
  const profits = historicalData.map((d) => d.operatingProfit);

  const { nextValue, trend } = predictNextValue(years, profits);

  return {
    predictedProfit: nextValue,
    trend,
  };
}

/**
 * 전체 예측 데이터 생성
 */
export function generatePredictions(
  historicalData: CompanyAnalysisData[]
): PredictionData[] {
  if (historicalData.length === 0) {
    return [];
  }

  const lastYear = parseInt(historicalData[historicalData.length - 1].year);
  const nextYear = lastYear + 1;

  const employeePrediction = predictEmployeeCount(historicalData);
  const revenuePrediction = predictRevenue(historicalData);
  const profitPrediction = predictOperatingProfit(historicalData);

  // 신뢰도 판단 (데이터 포인트가 많을수록 높음)
  let confidence: 'high' | 'medium' | 'low';
  if (historicalData.length >= 5) {
    confidence = 'high';
  } else if (historicalData.length >= 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return [
    {
      year: nextYear.toString(),
      predictedEmployees: employeePrediction.predictedCount,
      expectedHiring: employeePrediction.expectedHiring,
      predictedRevenue: revenuePrediction.predictedRevenue,
      predictedOperatingProfit: profitPrediction.predictedProfit,
      employeeTrend: employeePrediction.trend,
      revenueTrend: revenuePrediction.trend,
      confidence,
    },
  ];
}

/**
 * 예측 요약 텍스트 생성
 */
export function generateForecastSummary(
  historicalData: CompanyAnalysisData[],
  predictions: PredictionData[]
): ForecastSummary {
  if (historicalData.length === 0 || predictions.length === 0) {
    return {
      summary: '예측을 생성하기에 충분한 데이터가 없습니다.',
      trend: 'neutral',
      confidence: 'low',
      keyInsights: [],
    };
  }

  const prediction = predictions[0];
  const lastData = historicalData[historicalData.length - 1];

  // 성장률 계산
  const employeeGrowthRate =
    lastData.totalEmployees > 0
      ? ((prediction.predictedEmployees - lastData.totalEmployees) /
          lastData.totalEmployees) *
        100
      : 0;

  const revenueGrowthRate =
    lastData.revenue > 0
      ? ((prediction.predictedRevenue - lastData.revenue) / lastData.revenue) *
        100
      : 0;

  const profitGrowthRate =
    lastData.operatingProfit > 0
      ? ((prediction.predictedOperatingProfit - lastData.operatingProfit) /
          lastData.operatingProfit) *
        100
      : 0;

  // 전반적인 트렌드 판단
  let overallTrend: 'positive' | 'negative' | 'neutral';
  const positiveCount = [
    employeeGrowthRate > 0,
    revenueGrowthRate > 0,
    profitGrowthRate > 0,
  ].filter(Boolean).length;

  if (positiveCount >= 2) {
    overallTrend = 'positive';
  } else if (positiveCount === 0) {
    overallTrend = 'negative';
  } else {
    overallTrend = 'neutral';
  }

  // 요약 텍스트 생성
  const year = prediction.year;
  const employeeText = `직원 ${prediction.predictedEmployees.toLocaleString()}명 (${employeeGrowthRate > 0 ? '+' : ''}${employeeGrowthRate.toFixed(1)}%)`;
  const revenueText = `매출 ${(prediction.predictedRevenue / 1_000_000_000_000).toFixed(1)}조원 (${revenueGrowthRate > 0 ? '+' : ''}${revenueGrowthRate.toFixed(1)}%)`;

  let trendText = '';
  if (overallTrend === 'positive') {
    trendText = '지속적인 성장세가 예상됩니다.';
  } else if (overallTrend === 'negative') {
    trendText = '하락세가 예상됩니다.';
  } else {
    trendText = '안정적인 추세가 예상됩니다.';
  }

  const summary = `${year}년 예상: ${employeeText}, ${revenueText}. ${trendText}`;

  // 주요 인사이트
  const keyInsights: string[] = [];

  if (Math.abs(employeeGrowthRate) > 5) {
    keyInsights.push(
      employeeGrowthRate > 0
        ? `인력 확대 예상 (약 ${Math.abs(prediction.expectedHiring).toLocaleString()}명 채용)`
        : `인력 구조조정 가능성 (약 ${Math.abs(prediction.expectedHiring).toLocaleString()}명 감소)`
    );
  }

  if (Math.abs(revenueGrowthRate) > 10) {
    keyInsights.push(
      revenueGrowthRate > 0
        ? `매출 대폭 성장 예상`
        : `매출 감소 예상`
    );
  }

  if (Math.abs(profitGrowthRate) > 10) {
    keyInsights.push(
      profitGrowthRate > 0
        ? `수익성 개선 예상`
        : `수익성 악화 우려`
    );
  }

  if (keyInsights.length === 0) {
    keyInsights.push('현재 추세 유지 예상');
  }

  return {
    summary,
    trend: overallTrend,
    confidence: prediction.confidence,
    keyInsights,
  };
}

