import { createCommunity, findAllCommunities, findCommunityById, findCommunitiesByMember, deleteCommunity } from '../services/community_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('createCommunity', () => {
  it('returns new community', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    expect(await createCommunity('EcoClub', 5)).toEqual({ communityId: 1, communityName: 'EcoClub', memberId: 5 });
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(createCommunity('EcoClub', 5)).rejects.toThrow('db down');
  });
});

describe('findAllCommunities', () => {
  it('returns all', async () => {
    mocks.query.mockResolvedValue([[{ community_id: 1 }, { community_id: 2 }]]);
    expect(await findAllCommunities()).toEqual([{ community_id: 1 }, { community_id: 2 }]);
  });
  it('returns empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findAllCommunities()).toEqual([]);
  });
});

describe('findCommunityById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ community_id: 1, community_name: 'EcoClub' }]]);
    expect(await findCommunityById(1)).toEqual({ community_id: 1, community_name: 'EcoClub' });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findCommunityById(999)).toBeNull();
  });
});

describe('findCommunitiesByMember', () => {
  it('returns communities', async () => {
    mocks.query.mockResolvedValue([[{ community_id: 1 }]]);
    expect(await findCommunitiesByMember(5)).toEqual([{ community_id: 1 }]);
  });
  it('returns empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findCommunitiesByMember(999)).toEqual([]);
  });
});

describe('deleteCommunity', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    expect(await deleteCommunity(1)).toBe(true);
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    expect(await deleteCommunity(999)).toBe(false);
  });
});
