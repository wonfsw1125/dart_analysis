/**
 * 채용 예측 차트 컴포넌트
 */

'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { CompanyAnalysisData, PredictionData } from '@/lib/types';

interface HiringPredictionProps {
  historicalData: CompanyAnalysisData[];
  predictions: PredictionData[];
}

export default function HiringPrediction({
  historicalData,
  predictions,
}: HiringPredictionProps) {
  if (historicalData.length === 0 || predictions.length === 0) {
    return null;
  }

  // 차트 데이터 준비 (과거 데이터 + 예측 데이터)
  const chartData = [
    ...historicalData.map((d) => ({
      year: `${d.year}년`,
      실제직원수: d.totalEmployees,
      예측직원수: null as number | null,
      총채용예상: null as number | null,
    })),
    ...predictions.map((p) => ({
      year: `${p.year}년`,
      실제직원수: null as number | null,
      예측직원수: p.predictedEmployees,
      총채용예상: p.expectedHiring,
    })),
  ];

  const prediction = predictions[0];
  const trendText =
    prediction.employeeTrend === 'growth'
      ? '증가 추세'
      : prediction.employeeTrend === 'decline'
      ? '감소 추세'
      : '안정적';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        직원수 예측 및 채용 현황
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        과거 데이터 기반 다음 연도 예측 ({trendText})
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 60, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="year"
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
            label={{
              value: '직원수 (명)',
              angle: -90,
              position: 'left',
              offset: 10,
              style: { textAnchor: 'middle' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
            label={{
              value: '총 채용 예상 (명)',
              angle: 90,
              position: 'right',
              offset: 10,
              style: { textAnchor: 'middle' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
          />
          <Legend />
          
          {/* 과거 데이터 (실선) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="실제직원수"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            connectNulls={false}
          />
          
          {/* 예측 데이터 (점선) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="예측직원수"
            stroke="#f59e0b"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: '#f59e0b', r: 5 }}
            connectNulls={false}
          />
          
          {/* 총 채용 예상 (막대) */}
          <Bar
            yAxisId="right"
            dataKey="총채용예상"
            fill={prediction.expectedHiring >= 0 ? '#10b981' : '#ef4444'}
            opacity={0.8}
            radius={[8, 8, 0, 0]}
          />
          
          {/* 현재/예측 구분선 */}
          <ReferenceLine
            x={`${historicalData[historicalData.length - 1].year}년`}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            yAxisId="left"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 예측 요약 */}
      <div className="mt-4 space-y-3">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            {prediction.year}년 예상 직원수:{' '}
            <span className="font-bold">
              {prediction.predictedEmployees.toLocaleString()}명
            </span>
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {prediction.expectedHiring >= 0
              ? `총 ${Math.abs(prediction.expectedHiring).toLocaleString()}명 채용 예상 (이직률 15% 반영)`
              : `약 ${Math.abs(prediction.expectedHiring).toLocaleString()}명 감소 예상`}
          </p>
        </div>
        
        {prediction.expectedHiring > 0 && historicalData.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/20 rounded text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">💡 채용 예측 산출 방식</p>
            <p>
              • 순증가: {(prediction.predictedEmployees - historicalData[historicalData.length - 1].totalEmployees).toLocaleString()}명
              <br />
              • 퇴사 대체 (평균 이직률 15%): 약 {Math.round(historicalData[historicalData.length - 1].totalEmployees * 0.15).toLocaleString()}명
              <br />
              • <strong>총 채용 예상: {prediction.expectedHiring.toLocaleString()}명</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

