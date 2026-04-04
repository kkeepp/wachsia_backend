import { findQuestsByUser, findUserQuestById, updateProgress, claimReward, assignDefaultQuests } from '../services/user_quest_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

const sampleUQ = { id: 1, status: 'in_progress', count: 0, assign_date: '2026-01-01', quest_id: 1, quest_type: 'daily', instruction: 'Login', reward: 10, max: 1 };

describe('findQuestsByUser', () => {
  it('returns quests', async () => {
    mocks.query.mockResolvedValue([[sampleUQ]]);
    expect(await findQuestsByUser(1)).toEqual([sampleUQ]);
  });
  it('empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findQuestsByUser(999)).toEqual([]);
  });
});

describe('findUserQuestById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[sampleUQ]]);
    expect(await findUserQuestById(1)).toEqual(sampleUQ);
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findUserQuestById(999)).toBeNull();
  });
});

describe('updateProgress', () => {
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await updateProgress(999, 1)).toBeNull();
  });
  it('already claimed', async () => {
    mocks.query.mockResolvedValue([[{ ...sampleUQ, status: 'claimed' }]]);
    expect(await updateProgress(1, 1)).toEqual({ error: 'Already claimed' });
  });
  it('updates to in_progress', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ ...sampleUQ, max: 5 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    expect(await updateProgress(1, 3)).toEqual({ id: 1, count: 3, status: 'in_progress' });
  });
  it('updates to completed when count >= max', async () => {
    mocks.query
      .mockResolvedValueOnce([[sampleUQ]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    expect(await updateProgress(1, 1)).toEqual({ id: 1, count: 1, status: 'completed' });
  });
  it('caps count at max', async () => {
    mocks.query
      .mockResolvedValueOnce([[sampleUQ]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    expect(await updateProgress(1, 99)).toEqual({ id: 1, count: 1, status: 'completed' });
  });
});

describe('claimReward', () => {
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await claimReward(999, 1)).toBeNull();
  });
  it('not completed', async () => {
    mocks.query.mockResolvedValue([[sampleUQ]]);
    expect(await claimReward(1, 1)).toEqual({ error: 'Quest not completed' });
  });
  it('success', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ ...sampleUQ, status: 'completed' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])  // update status
      .mockResolvedValueOnce([{ affectedRows: 1 }])  // update user point
      .mockResolvedValueOnce([[{ point: 110 }]]);     // select point
    expect(await claimReward(1, 1)).toEqual({ claimed: true, reward: 10, points: 110 });
  });
});

describe('assignDefaultQuests', () => {
  it('no quests in db', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await assignDefaultQuests(1)).toEqual([]);
  });
  it('assigns all quests', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ id: 1 }, { id: 2 }]])  // select quests
      .mockResolvedValueOnce([{ affectedRows: 2 }])      // insert user_quests
      .mockResolvedValueOnce([{ affectedRows: 0 }])      // findQuestsByUser: auto-reset daily
      .mockResolvedValueOnce([[sampleUQ]]);               // findQuestsByUser: select
    const result = await assignDefaultQuests(1);
    expect(result).toEqual([sampleUQ]);
  });
});
