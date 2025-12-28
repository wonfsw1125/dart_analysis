/**
 * 메인 페이지
 * DART 기업 분석 대시보드
 */

'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import DataTable from '@/components/DataTable';
import EmployeeChart from '@/components/EmployeeChart';
import HiringPrediction from '@/components/HiringPrediction';
import RevenueChart from '@/components/RevenueChart';
import ForecastSummary from '@/components/ForecastSummary';
import type { AnalysisResponse } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (data: {
    companyName: string;
    startYear: number;
    endYear: number;
  }) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '분석 중 오류가 발생했습니다.');
      }

      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              DART 기업 분석 시스템
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              금융감독원 전자공시 데이터 기반 기업 재무 및 채용 현황 분석
            </p>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 폼 */}
        <div className="mb-8">
          <SearchForm onSubmit={handleSearch} loading={loading} />
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              데이터 분석 중...
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              DART API에서 데이터를 수집하고 있습니다. 잠시만 기다려주세요.
            </p>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
                  오류가 발생했습니다
                </h3>
                <p className="text-red-700 dark:text-red-200">{error}</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                  다른 기업명이나 연도를 시도해보세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {results && !loading && !error && (
          <div className="space-y-8">
            {/* 기업 정보 헤더 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {results.companyInfo.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                기업 코드: {results.companyInfo.code}
              </p>
            </div>

            {/* 예측 요약 (상단 배치) */}
            <ForecastSummary forecast={results.forecast} />

            {/* 데이터 테이블 */}
            <DataTable
              data={results.data}
              companyName={results.companyInfo.name}
            />

            {/* 차트 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 직원수 증감률 차트 */}
              <EmployeeChart data={results.data} />

              {/* 채용 예측 차트 */}
              <HiringPrediction
                historicalData={results.data}
                predictions={results.predictions}
              />
            </div>

            {/* 매출/이익 차트 (전체 너비) */}
            <RevenueChart data={results.data} />
          </div>
        )}

        {/* 초기 상태 안내 */}
        {!results && !loading && !error && (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6">
              <svg
                className="w-16 h-16 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              기업 분석을 시작하세요
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              위의 검색 폼에서 기업명과 분석 기간을 입력하면
              재무 현황, 직원 정보, 성장 예측 등을 확인할 수 있습니다.
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            데이터 출처: 금융감독원 전자공시시스템 (DART) | 예측 결과는 참고용이며 실제와 다를 수 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}

