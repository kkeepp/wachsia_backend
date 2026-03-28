import { createPost, findPostById, findPostsByCommunity, findPostsByUser, incrementFavorite, deletePost } from '../services/post_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('createPost', () => {
  it('returns new post', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    expect(await createPost(1, 2, 'hello', 'img.jpg')).toEqual({ postId: 1, posterId: 1, commuId: 2, caption: 'hello' });
  });
  it('image defaults to null', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    await createPost(1, 2, 'hello');
    expect(mocks.query.mock.calls[0][1][3]).toBeNull();
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(createPost(1, 2, 'hello')).rejects.toThrow('db down');
  });
});

describe('findPostById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ post_id: 1, caption: 'hello' }]]);
    expect(await findPostById(1)).toEqual({ post_id: 1, caption: 'hello' });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findPostById(999)).toBeNull();
  });
});

describe('findPostsByCommunity', () => {
  it('returns posts', async () => {
    mocks.query.mockResolvedValue([[{ post_id: 1 }]]);
    expect(await findPostsByCommunity(2)).toEqual([{ post_id: 1 }]);
  });
  it('returns empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findPostsByCommunity(999)).toEqual([]);
  });
});

describe('findPostsByUser', () => {
  it('returns posts', async () => {
    mocks.query.mockResolvedValue([[{ post_id: 1 }]]);
    expect(await findPostsByUser(1)).toEqual([{ post_id: 1 }]);
  });
  it('returns empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findPostsByUser(999)).toEqual([]);
  });
});

describe('incrementFavorite', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    expect(await incrementFavorite(1)).toBe(true);
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    expect(await incrementFavorite(999)).toBe(false);
  });
});

describe('deletePost', () => {
  it('true - deletes comments then post', async () => {
    mocks.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // delete comments
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // delete post
    expect(await deletePost(1)).toBe(true);
    expect(mocks.query).toHaveBeenCalledTimes(2);
  });
  it('false', async () => {
    mocks.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // delete comments
    mocks.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // delete post
    expect(await deletePost(999)).toBe(false);
  });
});
