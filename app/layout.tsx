import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DART 기업 분석 시스템',
  description: '금융감독원 전자공시 데이터 기반 기업 재무 및 채용 현황 분석 플랫폼',
  keywords: ['DART', '기업분석', '재무제표', '채용현황', '예측분석'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

