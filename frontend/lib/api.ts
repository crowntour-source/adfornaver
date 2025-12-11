const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Keywords API
export const keywordsApi = {
  // 모든 키워드 조회
  getAll: async (params?: { grade?: string; adGroupId?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.grade) queryParams.append('grade', params.grade);
    if (params?.adGroupId) queryParams.append('adGroupId', params.adGroupId.toString());

    const response = await fetch(`${API_BASE_URL}/api/keywords?${queryParams}`);
    return response.json();
  },

  // 특정 키워드 조회
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/keywords/${id}`);
    return response.json();
  },

  // 키워드 업데이트
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/keywords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 순위 확인
  checkRank: async (id: string, data?: any) => {
    const response = await fetch(`${API_BASE_URL}/api/keywords/${id}/check-rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    });
    return response.json();
  },

  // 수동 입찰
  manualBid: async (id: string, newBid: number) => {
    const response = await fetch(`${API_BASE_URL}/api/keywords/${id}/manual-bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newBid }),
    });
    return response.json();
  },

  // 입찰 로그 조회
  getLogs: async (id: string, limit: number = 50) => {
    const response = await fetch(`${API_BASE_URL}/api/keywords/${id}/logs?limit=${limit}`);
    return response.json();
  },

  // 일괄 업데이트
  batchUpdate: async (keywords: Array<{ id: string; data: any }>) => {
    const response = await fetch(`${API_BASE_URL}/api/keywords/batch-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords }),
    });
    return response.json();
  },
};

// Campaigns API
export const campaignsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/campaigns`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`);
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Settings API
export const settingsApi = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings`);
    return response.json();
  },

  update: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Scheduler API
export const schedulerApi = {
  start: async () => {
    const response = await fetch(`${API_BASE_URL}/api/scheduler/start`, {
      method: 'POST',
    });
    return response.json();
  },

  stop: async () => {
    const response = await fetch(`${API_BASE_URL}/api/scheduler/stop`, {
      method: 'POST',
    });
    return response.json();
  },

  status: async () => {
    const response = await fetch(`${API_BASE_URL}/api/scheduler/status`);
    return response.json();
  },
};

// Bidding API
export const biddingApi = {
  runOnce: async () => {
    const response = await fetch(`${API_BASE_URL}/api/bidding/run-once`, {
      method: 'POST',
    });
    return response.json();
  },

  getHistory: async (limit: number = 100) => {
    const response = await fetch(`${API_BASE_URL}/api/bidding/history?limit=${limit}`);
    return response.json();
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    return response.json();
  },

  getTodayPerformance: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/today`);
    return response.json();
  },
};
