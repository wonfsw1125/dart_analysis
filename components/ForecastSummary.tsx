/**
 * 예측 요약 컴포넌트
 */

'use client';

import type { ForecastSummary as ForecastSummaryType } from '@/lib/types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

interface ForecastSummaryProps {
  forecast: ForecastSummaryType;
}

export default function ForecastSummary({ forecast }: ForecastSummaryProps) {
  // 트렌드에 따른 아이콘 및 색상
  const getTrendIcon = () => {
    switch (forecast.trend) {
      case 'positive':
        return <TrendingUp className="w-8 h-8 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-8 h-8 text-red-500" />;
      default:
        return <Minus className="w-8 h-8 text-gray-500" />;
    }
  };

  const getTrendBg = () => {
    switch (forecast.trend) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'negative':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getTrendText = () => {
    switch (forecast.trend) {
      case 'positive':
        return '긍정적';
      case 'negative':
        return '부정적';
      default:
        return '중립적';
    }
  };

  const getTrendTextColor = () => {
    switch (forecast.trend) {
      case 'positive':
        return 'text-green-900 dark:text-green-100';
      case 'negative':
        return 'text-red-900 dark:text-red-100';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  // 신뢰도에 따른 아이콘
  const getConfidenceIcon = () => {
    switch (forecast.confidence) {
      case 'high':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'low':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getConfidenceText = () => {
    switch (forecast.confidence) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
    }
  };

  const getConfidenceBadgeColor = () => {
    switch (forecast.confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'low':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        예측 분석 요약
      </h3>

      {/* 메인 예측 요약 */}
      <div className={`p-6 rounded-lg border-2 ${getTrendBg()}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getTrendIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h4 className={`text-lg font-bold ${getTrendTextColor()}`}>
                전망: {getTrendText()}
              </h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor()}`}
              >
                {getConfidenceIcon()}
                신뢰도 {getConfidenceText()}
              </span>
            </div>
            <p className={`text-base leading-relaxed ${getTrendTextColor()}`}>
              {forecast.summary}
            </p>
          </div>
        </div>
      </div>

      {/* 주요 인사이트 */}
      {forecast.keyInsights.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            주요 인사이트
          </h4>
          <ul className="space-y-2">
            {forecast.keyInsights.map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 신뢰도 설명 */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong className="font-semibold">분석 방법:</strong> 과거 데이터 기반 선형
          회귀 분석을 통해 예측되었습니다. 신뢰도는 사용 가능한 데이터의 양과
          추세의 일관성을 기반으로 산정됩니다.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <strong className="font-semibold">참고:</strong> 예측 결과는 과거 추세에
          기반하며, 시장 변화, 경영 전략 변경 등 외부 요인에 따라 실제 결과와
          다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}

