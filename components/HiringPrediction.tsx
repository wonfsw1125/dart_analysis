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
      예상채용수: null as number | null,
    })),
    ...predictions.map((p) => ({
      year: `${p.year}년`,
      실제직원수: null as number | null,
      예측직원수: p.predictedEmployees,
      예상채용수: p.expectedHiring,
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
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
            label={{
              value: '예상 채용수 (명)',
              angle: 90,
              position: 'insideRight',
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
          
          {/* 예상 채용수 (막대) */}
          <Bar
            yAxisId="right"
            dataKey="예상채용수"
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
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
          {prediction.year}년 예상 직원수:{' '}
          <span className="font-bold">
            {prediction.predictedEmployees.toLocaleString()}명
          </span>
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          {prediction.expectedHiring >= 0
            ? `약 ${Math.abs(prediction.expectedHiring).toLocaleString()}명 채용 예상`
            : `약 ${Math.abs(prediction.expectedHiring).toLocaleString()}명 감소 예상`}
        </p>
      </div>
    </div>
  );
}

