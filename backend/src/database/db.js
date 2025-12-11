import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');

// Ensure data directory exists
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Database file path
const file = join(dataDir, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

// Initialize database with default structure
async function initDatabase() {
  await db.read();

  // Ensure db.data exists
  db.data = db.data || {};

  // Initialize each field if missing
  db.data.apiSettings = db.data.apiSettings || {
    customerId: null,
    accessLicense: null,
    secretKey: null,
    isConfigured: false
  };

  db.data.adGroups = db.data.adGroups || [];
  db.data.keywords = db.data.keywords || [];
  db.data.bidLogs = db.data.bidLogs || [];

  db.data.rankCheckSettings = db.data.rankCheckSettings || {
    device: 'PC', // PC 또는 Mobile
    page: 'MAIN', // MAIN 또는 MORE
    region: {
      province: '',
      district: ''
    }
  };

  db.data.systemSettings = db.data.systemSettings || {
    autoBidEnabled: false,
    checkIntervalMinutes: 10,
    rankCheckIntervalMinutes: 5,
    maxKeywordsA: 10,
    maxKeywordsB: 100,
    maxKeywordsC: 200
  };

  await db.write();
  console.log('✅ 데이터베이스 초기화 완료');
}

// API Settings
export const apiSettings = {
  async get() {
    await db.read();
    return db.data.apiSettings;
  },

  async set(settings) {
    await db.read();
    db.data.apiSettings = {
      ...db.data.apiSettings,
      ...settings,
      isConfigured: !!(settings.customerId && settings.accessLicense && settings.secretKey)
    };
    await db.write();
    return db.data.apiSettings;
  }
};

// Ad Groups
export const adGroups = {
  async getAll() {
    await db.read();
    return db.data.adGroups;
  },

  async add(group) {
    await db.read();
    const newGroup = {
      id: Date.now().toString(),
      naverGroupId: group.naverGroupId,
      name: group.name,
      status: group.status || 'active',
      createdAt: new Date().toISOString(),
      ...group
    };
    db.data.adGroups.push(newGroup);
    await db.write();
    return newGroup;
  },

  async sync(groups) {
    await db.read();
    db.data.adGroups = groups.map(group => ({
      id: group.id || Date.now().toString() + Math.random(),
      naverGroupId: group.naverGroupId,
      name: group.name,
      status: group.status || 'active',
      syncedAt: new Date().toISOString()
    }));
    await db.write();
    return db.data.adGroups;
  }
};

// Keywords
export const keywords = {
  async getAll() {
    await db.read();
    return db.data.keywords;
  },

  async getByGroup(groupId) {
    await db.read();
    return db.data.keywords.filter(k => k.adGroupId === groupId);
  },

  async getById(id) {
    await db.read();
    return db.data.keywords.find(k => k.id === id);
  },

  async add(keyword) {
    await db.read();
    const newKeyword = {
      id: Date.now().toString(),
      naverKeywordId: keyword.naverKeywordId,
      adGroupId: keyword.adGroupId,
      keyword: keyword.keyword,
      grade: keyword.grade || 'C', // A, B, C
      autoBidEnabled: keyword.autoBidEnabled || false,
      currentRank: keyword.currentRank || null,
      currentBid: keyword.currentBid || 0,
      targetRankMin: keyword.targetRankMin || 4,
      targetRankMax: keyword.targetRankMax || 6,
      bidLimitMin: keyword.bidLimitMin || 70,
      bidLimitMax: keyword.bidLimitMax || 10000,
      incrementAmount: keyword.incrementAmount || 10,
      lastBidTime: keyword.lastBidTime || null,
      naverStatus: keyword.naverStatus || 'AVAILABLE',
      createdAt: new Date().toISOString(),
      ...keyword
    };
    db.data.keywords.push(newKeyword);
    await db.write();
    return newKeyword;
  },

  async update(id, updates) {
    await db.read();
    const index = db.data.keywords.findIndex(k => k.id === id);
    if (index === -1) return null;

    db.data.keywords[index] = {
      ...db.data.keywords[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await db.write();
    return db.data.keywords[index];
  },

  async sync(groupId, keywordsData) {
    await db.read();
    // Remove old keywords for this group
    db.data.keywords = db.data.keywords.filter(k => k.adGroupId !== groupId);

    // Add new keywords
    const newKeywords = keywordsData.map(kw => ({
      id: Date.now().toString() + Math.random(),
      naverKeywordId: kw.naverKeywordId,
      adGroupId: groupId,
      keyword: kw.keyword,
      grade: kw.grade || 'C',
      autoBidEnabled: false,
      currentRank: kw.currentRank || null,
      currentBid: kw.currentBid || 0,
      targetRankMin: 4,
      targetRankMax: 6,
      bidLimitMin: 70,
      bidLimitMax: 10000,
      incrementAmount: 10,
      naverStatus: kw.naverStatus || 'AVAILABLE',
      syncedAt: new Date().toISOString()
    }));

    db.data.keywords.push(...newKeywords);
    await db.write();
    return newKeywords;
  }
};

// Bid Logs
export const bidLogs = {
  async add(log) {
    await db.read();
    const newLog = {
      id: Date.now().toString(),
      keywordId: log.keywordId,
      keyword: log.keyword,
      oldRank: log.oldRank,
      newRank: log.newRank,
      oldBid: log.oldBid,
      newBid: log.newBid,
      reason: log.reason,
      timestamp: new Date().toISOString()
    };
    db.data.bidLogs.push(newLog);

    // Keep only last 1000 logs
    if (db.data.bidLogs.length > 1000) {
      db.data.bidLogs = db.data.bidLogs.slice(-1000);
    }

    await db.write();
    return newLog;
  },

  async getRecent(limit = 100) {
    await db.read();
    return db.data.bidLogs.slice(-limit).reverse();
  },

  async getByKeyword(keywordId, limit = 50) {
    await db.read();
    return db.data.bidLogs
      .filter(log => log.keywordId === keywordId)
      .slice(-limit)
      .reverse();
  }
};

// Rank Check Settings
export const rankCheckSettings = {
  async get() {
    await db.read();
    return db.data.rankCheckSettings;
  },

  async update(settings) {
    await db.read();
    db.data.rankCheckSettings = {
      ...db.data.rankCheckSettings,
      ...settings
    };
    await db.write();
    return db.data.rankCheckSettings;
  }
};

// System Settings
export const systemSettings = {
  async get() {
    await db.read();
    return db.data.systemSettings;
  },

  async update(settings) {
    await db.read();
    db.data.systemSettings = {
      ...db.data.systemSettings,
      ...settings
    };
    await db.write();
    return db.data.systemSettings;
  }
};

// Initialize on import
await initDatabase();

export default db;
