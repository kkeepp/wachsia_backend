import { createTree, getTreeByUserId, getRanking, addExperience } from '../services/tree_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('createTree', () => {
  it('returns new tree with defaults', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    expect(await createTree(5)).toEqual({ id: 1, userId: 5, level: 1, experience: 0, treeGrowth: 1, treePhase: 1 });
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(createTree(5)).rejects.toThrow('db down');
  });
});

describe('getTreeByUserId', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, user_id: 5, level: 3, experience: 50, tree_growth: 2, tree_phase: 1 }]]);
    expect(await getTreeByUserId(5)).toEqual({ id: 1, user_id: 5, level: 3, experience: 50, tree_growth: 2, tree_phase: 1 });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await getTreeByUserId(999)).toBeNull();
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(getTreeByUserId(1)).rejects.toThrow('db down');
  });
});

describe('getRanking', () => {
  it('returns ranked list', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, username: 'a', level: 5, experience: 90, rank: 1 }]]);
    expect(await getRanking()).toEqual([{ id: 1, username: 'a', level: 5, experience: 90, rank: 1 }]);
  });
  it('empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await getRanking()).toEqual([]);
  });
});

describe('addExperience', () => {
  it('user not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await addExperience(999, 10)).toEqual({ error: 'User not found' });
  });

  it('not enough points', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ point: 5, used_point_today: 0 }]])   // initial check
      .mockResolvedValueOnce([{ affectedRows: 0 }])                   // resetDailyIfNeeded
      .mockResolvedValueOnce([[{ point: 5, used_point_today: 0 }]]);  // fresh user
    expect(await addExperience(1, 10)).toEqual({ error: 'Not enough points' });
  });

  it('daily limit exceeded', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ point: 1000, used_point_today: 0 }]])
      .mockResolvedValueOnce([{ affectedRows: 0 }])
      .mockResolvedValueOnce([[{ point: 1000, used_point_today: 490 }]]);
    expect(await addExperience(1, 20)).toEqual({ error: 'Daily limit exceeded' });
  });

  it('tree not found', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ point: 100, used_point_today: 0 }]])
      .mockResolvedValueOnce([{ affectedRows: 0 }])
      .mockResolvedValueOnce([[{ point: 100, used_point_today: 0 }]])
      .mockResolvedValueOnce([[]]);  // tree not found
    expect(await addExperience(1, 10)).toEqual({ error: 'Tree not found' });
  });

  it('success with level up', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ point: 200, used_point_today: 0 }]])
      .mockResolvedValueOnce([{ affectedRows: 0 }])
      .mockResolvedValueOnce([[{ point: 200, used_point_today: 0 }]])
      .mockResolvedValueOnce([[{ id: 1, user_id: 1, level: 1, experience: 90, tree_growth: 1, tree_phase: 1 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])   // update user points
      .mockResolvedValueOnce([{ affectedRows: 1 }]);   // update tree
    const result = await addExperience(1, 20);
    expect(result).toEqual({ level: 2, experience: 10, points: 180, usedToday: 20 });
  });
});
