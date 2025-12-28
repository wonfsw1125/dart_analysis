/**
 * 검색 폼 컴포넌트
 */

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchFormProps {
  onSubmit: (data: {
    companyName: string;
    startYear: number;
    endYear: number;
  }) => void;
  loading?: boolean;
}

export default function SearchForm({ onSubmit, loading = false }: SearchFormProps) {
  const currentYear = new Date().getFullYear() - 1; // 작년까지 (올해 데이터는 미발표)
  
  const [companyName, setCompanyName] = useState('');
  const [startYear, setStartYear] = useState(currentYear - 2);
  const [endYear, setEndYear] = useState(currentYear);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      alert('기업명을 입력해주세요.');
      return;
    }

    if (startYear > endYear) {
      alert('시작 연도는 종료 연도보다 작아야 합니다.');
      return;
    }

    onSubmit({ companyName: companyName.trim(), startYear, endYear });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          기업 분석
        </h2>

        {/* 기업명 입력 */}
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            기업명
          </label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="예: 삼성전자, 카카오, 네이버"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            주요 기업: 삼성전자, SK하이닉스, 네이버, 카카오, LG전자, 현대자동차 등
          </p>
        </div>

        {/* 년도 범위 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startYear"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              시작 연도
            </label>
            <select
              id="startYear"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              {Array.from({ length: 10 }, (_, i) => currentYear - 9 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="endYear"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              종료 연도
            </label>
            <select
              id="endYear"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              {Array.from({ length: 10 }, (_, i) => currentYear - 9 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* 분석 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <Search size={20} />
          {loading ? '분석 중...' : '분석하기'}
        </button>
      </div>
    </form>
  );
}

