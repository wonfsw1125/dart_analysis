/**
 * 직원수 증감률 차트 컴포넌트
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

interface EmployeeChartProps {
  data: CompanyAnalysisData[];
}

export default function EmployeeChart({ data }: EmployeeChartProps) {
  if (data.length === 0) {
    return null;
  }

  // 차트 데이터 준비
  const chartData = data.map((d) => ({
    year: `${d.year}년`,
    직원수: d.totalEmployees,
    증감률: d.employeeGrowthRate,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        직원수 추이 및 증감률
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        연도별 직원수 변화와 전년 대비 증감률을 보여줍니다.
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
              value: '증감률 (%)',
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
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="직원수"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Bar
            yAxisId="right"
            dataKey="증감률"
            fill="#10b981"
            opacity={0.8}
            radius={[8, 8, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

