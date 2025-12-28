/**
 * 매출/이익 차트 컴포넌트
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
} from 'recharts';
import type { CompanyAnalysisData } from '@/lib/types';

interface RevenueChartProps {
  data: CompanyAnalysisData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return null;
  }

  // 차트 데이터 준비
  const chartData = data.map((d) => ({
    year: `${d.year}년`,
    매출액: d.revenue / 1_000_000_000_000, // 조 단위로 변환
    영업이익: d.operatingProfit / 1_000_000_000_000, // 조 단위로 변환
    당기순이익: d.netIncome / 1_000_000_000_000, // 조 단위로 변환
  }));

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toFixed(2)}조원
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        매출 및 이익 추이
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        연도별 매출액, 영업이익, 당기순이익 변화 (단위: 조원)
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
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
            label={{
              value: '금액 (조원)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* 매출액 (선 그래프) */}
          <Line
            type="monotone"
            dataKey="매출액"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
          />
          
          {/* 영업이익 (막대 그래프) */}
          <Bar
            dataKey="영업이익"
            fill="#10b981"
            opacity={0.8}
            radius={[8, 8, 0, 0]}
          />
          
          {/* 당기순이익 (막대 그래프) */}
          <Bar
            dataKey="당기순이익"
            fill="#f59e0b"
            opacity={0.8}
            radius={[8, 8, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 최근 데이터 요약 */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
              최근 매출액
            </p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {(data[data.length - 1].revenue / 1_000_000_000_000).toFixed(2)}조원
            </p>
            {data[data.length - 1].revenueGrowthRate !== null && (
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                전년 대비{' '}
                {data[data.length - 1].revenueGrowthRate! > 0 ? '+' : ''}
                {data[data.length - 1].revenueGrowthRate!.toFixed(2)}%
              </p>
            )}
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
              최근 영업이익
            </p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {(data[data.length - 1].operatingProfit / 1_000_000_000_000).toFixed(2)}조원
            </p>
            {data[data.length - 1].operatingProfitGrowthRate !== null && (
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                전년 대비{' '}
                {data[data.length - 1].operatingProfitGrowthRate! > 0 ? '+' : ''}
                {data[data.length - 1].operatingProfitGrowthRate!.toFixed(2)}%
              </p>
            )}
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
              최근 당기순이익
            </p>
            <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
              {(data[data.length - 1].netIncome / 1_000_000_000_000).toFixed(2)}조원
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

