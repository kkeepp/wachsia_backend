import { createComment, findCommentsByPost, deleteComment } from '../services/comment_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('createComment', () => {
  it('returns new comment and increments commentAmt', async () => {
    mocks.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // update commentAmt
    expect(await createComment(1, 2, 3, 'nice')).toEqual({ commentId: 1, commentorId: 1, postId: 2, commuId: 3, caption: 'nice' });
    expect(mocks.query).toHaveBeenCalledTimes(2);
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(createComment(1, 2, 3, 'nice')).rejects.toThrow('db down');
  });
});

describe('findCommentsByPost', () => {
  it('returns comments', async () => {
    mocks.query.mockResolvedValue([[{ comment_id: 1, caption: 'nice' }]]);
    expect(await findCommentsByPost(2)).toEqual([{ comment_id: 1, caption: 'nice' }]);
  });
  it('returns empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findCommentsByPost(999)).toEqual([]);
  });
});

describe('deleteComment', () => {
  it('true - decrements commentAmt', async () => {
    mocks.query.mockResolvedValueOnce([[{ post_id: 2 }]]); // select
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // delete
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // update commentAmt
    expect(await deleteComment(1)).toBe(true);
    expect(mocks.query).toHaveBeenCalledTimes(3);
  });
  it('false - comment not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await deleteComment(999)).toBe(false);
  });
});
