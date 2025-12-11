'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [isAutoBiddingEnabled, setIsAutoBiddingEnabled] = useState(false);

  // 가상 데이터 (나중에 API로 교체)
  const todayStats = {
    clicks: 1247,
    impressions: 15423,
    ctr: 8.1,
    cpc: 245,
    spend: 305615,
    budget: 500000
  };

  const campaigns = [
    { id: 1, name: '검색광고 - 메인 키워드', status: 'active', clicks: 856, spend: 215400, cpc: 251 },
    { id: 2, name: '디스플레이 - 리타겟팅', status: 'active', clicks: 391, spend: 90215, cpc: 231 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 bg-naver-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <h1 className="ml-3 text-2xl font-bold text-gray-900">
                  네이버 광고 자동입찰
                </h1>
              </Link>
              <nav className="flex space-x-4">
                <Link href="/" className="bg-naver-green text-white px-3 py-2 rounded-md text-sm font-medium">
                  대시보드
                </Link>
                <Link href="/keywords" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  키워드 관리
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Auto Bidding Control */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">자동입찰 시스템</h2>
              <p className="text-sm text-gray-600">
                {isAutoBiddingEnabled
                  ? '✅ 자동입찰이 활성화되어 있습니다. 30분마다 입찰가를 최적화합니다.'
                  : '⚠️ 자동입찰이 비활성화되어 있습니다.'}
              </p>
            </div>
            <button
              onClick={() => setIsAutoBiddingEnabled(!isAutoBiddingEnabled)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isAutoBiddingEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-naver-green hover:bg-naver-dark text-white'
              }`}
            >
              {isAutoBiddingEnabled ? '자동입찰 중지' : '자동입찰 시작'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="총 클릭 수"
            value={todayStats.clicks.toLocaleString()}
            change="+12.5%"
            positive={true}
          />
          <StatCard
            title="노출 수"
            value={todayStats.impressions.toLocaleString()}
            change="+8.3%"
            positive={true}
          />
          <StatCard
            title="클릭률 (CTR)"
            value={`${todayStats.ctr}%`}
            change="+0.4%"
            positive={true}
          />
          <StatCard
            title="평균 CPC"
            value={`₩${todayStats.cpc}`}
            change="-3.2%"
            positive={true}
          />
        </div>

        {/* Budget Progress */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">오늘의 예산 사용</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">사용 금액</span>
              <span className="font-semibold">₩{todayStats.spend.toLocaleString()} / ₩{todayStats.budget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-naver-green h-4 rounded-full transition-all"
                style={{ width: `${(todayStats.spend / todayStats.budget) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {((todayStats.spend / todayStats.budget) * 100).toFixed(1)}% 사용 중
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">캠페인 목록</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    캠페인명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    클릭 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용 금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평균 CPC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        활성
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₩{campaign.spend.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₩{campaign.cpc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-naver-green hover:text-naver-dark mr-3">
                        수정
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, positive }: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}
