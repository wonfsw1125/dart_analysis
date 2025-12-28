/**
 * 데이터 테이블 컴포넌트
 */

'use client';

import type { CompanyAnalysisData } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DataTableProps {
  data: CompanyAnalysisData[];
  companyName: string;
}

export default function DataTable({ data, companyName }: DataTableProps) {
  if (data.length === 0) {
    return null;
  }

  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('ko-KR');
  };

  const formatRate = (rate: number | null): JSX.Element => {
    if (rate === null || rate === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    const isPositive = rate > 0;
    const isNegative = rate < 0;
    const isNeutral = Math.abs(rate) < 0.01;

    let colorClass = 'text-gray-600 dark:text-gray-400';
    let Icon = Minus;

    if (isPositive && !isNeutral) {
      colorClass = 'text-green-600 dark:text-green-400';
      Icon = TrendingUp;
    } else if (isNegative && !isNeutral) {
      colorClass = 'text-red-600 dark:text-red-400';
      Icon = TrendingDown;
    }

    return (
      <span className={`flex items-center gap-1 ${colorClass} font-medium`}>
        <Icon size={16} />
        {rate > 0 && '+'}
        {rate.toFixed(2)}%
      </span>
    );
  };

  const formatCurrency = (num: number | null): string => {
    if (num === null || num === undefined || num === 0) return '-';
    
    // 조 단위
    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toFixed(1)}조`;
    }
    // 억 단위
    if (num >= 100_000_000) {
      return `${(num / 100_000_000).toFixed(0)}억`;
    }
    // 백만원 단위
    return `${formatNumber(num)}백만`;
  };

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {companyName} 분석 데이터
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          연도별 재무 및 인력 현황
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                연도
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                직원수
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                직원수 증감률
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                평균급여
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                급여 증감률
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                매출액
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                매출 성장률
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                영업이익
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                영업이익 증감률
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, index) => (
              <tr
                key={row.year}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {row.year}년
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatNumber(row.totalEmployees)}명
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {formatRate(row.employeeGrowthRate)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {row.avgSalary > 0 ? `${row.avgSalary.toFixed(1)}백만` : '-'}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {formatRate(row.salaryGrowthRate)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {formatRate(row.revenueGrowthRate)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatCurrency(row.operatingProfit)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {formatRate(row.operatingProfitGrowthRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400">
        * 단위: 직원수(명), 평균급여(백만원), 매출액/영업이익(조/억/백만원)
      </div>
    </div>
  );
}

