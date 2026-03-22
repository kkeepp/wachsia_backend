import { createTree, getTreeByUserId } from '../services/tree_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('createTree', () => {
  it('returns new tree with defaults', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    expect(await createTree(5)).toEqual({ treeId: 1, ownerId: 5, level: 1, experience: 0 });
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(createTree(5)).rejects.toThrow('db down');
  });
});

describe('getTreeByUserId', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ tree_id: 1, owner_id: 5, level: 3, experience: 250 }]]);
    expect(await getTreeByUserId(5)).toEqual({ tree_id: 1, owner_id: 5, level: 3, experience: 250 });
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
