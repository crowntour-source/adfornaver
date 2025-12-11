'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdGroup {
  id: number;
  name: string;
  groupName: string;
  keywordCount: number;
  status: 'ON' | 'OFF';
  region: string;
}

interface Keyword {
  id: string;
  keyword: string;
  status: 'ON' | 'OFF';
  currentBid: number;
  targetRank: number;
  currentRank: number | null;
  clicks: number;
  impressions: number;
  ctr: number;
  grade: string;
}

export default function KeywordsPage() {
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<number | null>(null);
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실제 네이버 API에서 데이터 가져오기
  useEffect(() => {
    fetchAdGroups();
  }, []);

  // 광고 그룹 변경 시 키워드 로드
  useEffect(() => {
    if (selectedAdGroupId) {
      fetchKeywords(selectedAdGroupId);
    }
  }, [selectedAdGroupId]);

  const fetchAdGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/adgroups');
      const data = await response.json();

      if (data.success) {
        // 키워드 개수 가져오기
        const groupsWithCount = await Promise.all(
          data.adGroups.map(async (group: any) => {
            try {
              const kwResponse = await fetch(`http://localhost:3001/api/adgroups/${group.id}/keywords`);
              const kwData = await kwResponse.json();
              return {
                ...group,
                keywordCount: kwData.success ? kwData.total : 0
              };
            } catch (err) {
              return { ...group, keywordCount: 0 };
            }
          })
        );

        setAdGroups(groupsWithCount);

        // 첫 번째 그룹 자동 선택
        if (groupsWithCount.length > 0) {
          setSelectedAdGroupId(groupsWithCount[0].id);
        }
      } else {
        setError(data.message || '광고 그룹을 불러올 수 없습니다');
      }
    } catch (err) {
      console.error('광고 그룹 로드 실패:', err);
      setError('네이버 API 연결 실패. API 키를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const fetchKeywords = async (adGroupId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/adgroups/${adGroupId}/keywords`);
      const data = await response.json();

      if (data.success) {
        setKeywords(data.keywords);
      } else {
        console.error('키워드 로드 실패:', data.error);
      }
    } catch (err) {
      console.error('키워드 로드 실패:', err);
    }
  };

  // 입찰가 수정 함수
  const updateBid = async (keywordId: string, newBid: number) => {
    if (!selectedAdGroupId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/adgroups/${selectedAdGroupId}/keywords/${keywordId}/bid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newBid })
      });

      const data = await response.json();

      if (data.success) {
        alert(`입찰가가 ${newBid}원으로 변경되었습니다!`);
        // 키워드 목록 새로고침
        fetchKeywords(selectedAdGroupId);
      } else {
        alert(`입찰가 변경 실패: ${data.error}`);
      }
    } catch (err) {
      console.error('입찰가 변경 실패:', err);
      alert('입찰가 변경 중 오류가 발생했습니다.');
    }
  };

  // 순위 확인 함수
  const checkRank = async (keywordId: string, keyword: string) => {
    if (!selectedAdGroupId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/adgroups/${selectedAdGroupId}/keywords/${keywordId}/check-rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });

      const data = await response.json();

      if (data.success) {
        alert(`"${keyword}" 순위: ${data.rank.rank}위`);
        // 키워드 목록 새로고침
        fetchKeywords(selectedAdGroupId);
      } else {
        alert(`순위 확인 실패: ${data.error}`);
      }
    } catch (err) {
      console.error('순위 확인 실패:', err);
      alert('순위 확인 중 오류가 발생했습니다.');
    }
  };

  const selectedAdGroup = adGroups.find(g => g.id === selectedAdGroupId);

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
                <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  대시보드
                </Link>
                <Link href="/keywords" className="bg-naver-green text-white px-3 py-2 rounded-md text-sm font-medium">
                  키워드 관리
                </Link>
              </nav>
            </div>
            <div className="text-sm text-gray-600">
              마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-800">
                <p className="font-semibold">오류 발생</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-sm mt-2">
                  네이버 광고 API 키를 설정하려면 backend/.env 파일을 확인하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-naver-green"></div>
            <p className="mt-4 text-gray-600">네이버 광고 데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Ad Groups Table */}
        {!loading && !error && (
        <>
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                【 기본현황 】 【 자동입찰 】
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  【캠페인: algopda, 건책: 137,036】아월10일14시31분
                </span>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
                  다른 계정 리스팅
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium">
                  환경 설정
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
                  입찰 시작
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">사이트명</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">그룹명</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">키워드수</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase">현황</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">연락처</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">적용</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">모바일 스케쥴</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">노출지역</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">랭킹연동</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">상태</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adGroups.map((group, index) => (
                  <tr
                    key={group.id}
                    onClick={() => setSelectedAdGroupId(group.id)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedAdGroupId === group.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{group.name}</td>
                    <td className="px-4 py-3 text-sm">{group.groupName}</td>
                    <td className="px-4 py-3 text-sm text-right">{group.keywordCount}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={group.status === 'ON'} readOnly />
                    </td>
                    <td className="px-4 py-3 text-sm">0 / 0</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-6 h-6 bg-green-100 border border-gray-300"></div>
                        <div className="w-6 h-6 bg-gray-100 border border-gray-300"></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{group.region} ▼</td>
                    <td className="px-4 py-3 text-sm">{group.region} ▼</td>
                    <td className="px-4 py-3 text-sm">파워링크</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Keywords Detail Table */}
        {selectedAdGroup && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-red-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-red-700">
                  『캠페인명: 알고파, 그룹명: 00_알고파-배인』
                </h3>
                <div className="text-sm text-red-600">
                  각 키워드를 확망순위, 입찰가만큼 기감격을 설정해
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-3 py-2 text-center">
                      <input type="checkbox" />
                    </th>
                    <th className="px-3 py-2 text-left">No</th>
                    <th className="px-3 py-2 text-left">키워드</th>
                    <th className="px-3 py-2 text-center">상태</th>
                    <th className="px-3 py-2 text-right">현재순위</th>
                    <th className="px-3 py-2 text-right">입찰금액</th>
                    <th className="px-3 py-2 text-right">목표순위</th>
                    <th className="px-3 py-2 text-center">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {keywords.map((keyword, index) => (
                    <tr key={keyword.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" />
                      </td>
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-blue-600">{keyword.keyword}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 text-xs rounded ${
                          keyword.status === 'ON' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {keyword.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{keyword.currentRank || '-'}</td>
                      <td className="px-3 py-2 text-right font-semibold">₩{keyword.currentBid.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{keyword.targetRank}위</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => checkRank(keyword.id, keyword.keyword)}
                            className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                          >
                            순위확인
                          </button>
                          <button
                            onClick={() => {
                              const newBid = prompt(`새 입찰가를 입력하세요 (현재: ${keyword.currentBid}원):`, keyword.currentBid.toString());
                              if (newBid && !isNaN(Number(newBid))) {
                                updateBid(keyword.id, Number(newBid));
                              }
                            }}
                            className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                          >
                            입찰변경
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stats Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">총 키워드: </span>
                  <span className="font-semibold">{keywords.length}개</span>
                </div>
                <div>
                  <span className="text-gray-600">활성: </span>
                  <span className="font-semibold text-green-600">
                    {keywords.filter(k => k.status === 'ON').length}개
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">평균 입찰가: </span>
                  <span className="font-semibold">
                    ₩{Math.round(keywords.reduce((sum, k) => sum + k.currentBid, 0) / keywords.length).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">총 클릭: </span>
                  <span className="font-semibold">
                    {keywords.reduce((sum, k) => sum + k.clicks, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}
