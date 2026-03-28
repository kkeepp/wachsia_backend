import { createQuest, findQuestsByOwner, findQuestById, updateProgress, deleteQuest } from '../services/quest_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('createQuest', () => {
  it('returns new quest', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    expect(await createQuest(10, 'Plant a tree', '2025-12-31', 'daily', 5)).toEqual({
      questId: 1, ecoPoint: 10, instruction: 'Plant a tree', due: '2025-12-31', type: 'daily', ownerId: 5,
    });
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(createQuest(10, 'Plant a tree', '2025-12-31', 'daily', 5)).rejects.toThrow('db down');
  });
});

describe('findQuestsByOwner', () => {
  it('returns quests', async () => {
    mocks.query.mockResolvedValue([[{ quest_id: 1 }]]);
    expect(await findQuestsByOwner(5)).toEqual([{ quest_id: 1 }]);
  });
  it('returns empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findQuestsByOwner(999)).toEqual([]);
  });
});

describe('findQuestById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ quest_id: 1, instruction: 'Plant a tree' }]]);
    expect(await findQuestById(1)).toEqual({ quest_id: 1, instruction: 'Plant a tree' });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findQuestById(999)).toBeNull();
  });
});

describe('updateProgress', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    expect(await updateProgress(1, 50)).toBe(true);
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    expect(await updateProgress(999, 50)).toBe(false);
  });
});

describe('deleteQuest', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    expect(await deleteQuest(1)).toBe(true);
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    expect(await deleteQuest(999)).toBe(false);
  });
});
