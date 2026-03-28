import request from 'supertest';
import app from '../app.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

// ==================== Community ====================

describe('GET /api/communities/findAll', () => {
  it('returns all', async () => {
    mocks.query.mockResolvedValue([[{ community_id: 1 }]]);
    const res = await request(app).get('/api/communities/findAll');
    expect(res.body).toEqual({ success: true, data: [{ community_id: 1 }] });
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    const res = await request(app).get('/api/communities/findAll');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/communities/findById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ community_id: 1, community_name: 'Eco' }]]);
    const res = await request(app).get('/api/communities/findById?communityId=1');
    expect(res.body).toEqual({ success: true, data: { community_id: 1, community_name: 'Eco' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/communities/findById?communityId=999');
    expect(res.body).toEqual({ success: false, error: 'Community not found' });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/communities/findById?communityId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid communityId is required' });
  });
});

describe('GET /api/communities/findByMember', () => {
  it('returns communities', async () => {
    mocks.query.mockResolvedValue([[{ community_id: 1 }]]);
    const res = await request(app).get('/api/communities/findByMember?memberId=5');
    expect(res.body).toEqual({ success: true, data: [{ community_id: 1 }] });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/communities/findByMember?memberId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid memberId is required' });
  });
});

describe('POST /api/communities/create', () => {
  it('success', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    const res = await request(app).post('/api/communities/create').send({ communityName: 'Eco', memberId: 5 });
    expect(res.body).toEqual({ success: true, data: { communityId: 1, communityName: 'Eco', memberId: 5 } });
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/communities/create').send({});
    expect(res.body).toEqual({ success: false, error: 'communityName and memberId are required' });
  });
});

describe('DELETE /api/communities/delete', () => {
  it('success', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/communities/delete').send({ communityId: 1 });
    expect(res.body).toEqual({ success: true, data: { deleted: true } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/communities/delete').send({ communityId: 999 });
    expect(res.body).toEqual({ success: false, error: 'Community not found' });
  });
});

// ==================== Post ====================

describe('GET /api/posts/findById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ post_id: 1, caption: 'hello' }]]);
    const res = await request(app).get('/api/posts/findById?postId=1');
    expect(res.body).toEqual({ success: true, data: { post_id: 1, caption: 'hello' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/posts/findById?postId=999');
    expect(res.body).toEqual({ success: false, error: 'Post not found' });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/posts/findById?postId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid postId is required' });
  });
});

describe('GET /api/posts/findByCommunity', () => {
  it('returns posts', async () => {
    mocks.query.mockResolvedValue([[{ post_id: 1 }]]);
    const res = await request(app).get('/api/posts/findByCommunity?commuId=2');
    expect(res.body).toEqual({ success: true, data: [{ post_id: 1 }] });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/posts/findByCommunity?commuId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid commuId is required' });
  });
});

describe('GET /api/posts/findByUser', () => {
  it('returns posts', async () => {
    mocks.query.mockResolvedValue([[{ post_id: 1 }]]);
    const res = await request(app).get('/api/posts/findByUser?posterId=1');
    expect(res.body).toEqual({ success: true, data: [{ post_id: 1 }] });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/posts/findByUser?posterId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid posterId is required' });
  });
});

describe('POST /api/posts/create', () => {
  it('success', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    const res = await request(app).post('/api/posts/create').send({ posterId: 1, commuId: 2, caption: 'hello' });
    expect(res.body).toEqual({ success: true, data: { postId: 1, posterId: 1, commuId: 2, caption: 'hello' } });
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/posts/create').send({});
    expect(res.body).toEqual({ success: false, error: 'posterId, commuId, and caption are required' });
  });
});

describe('POST /api/posts/favorite', () => {
  it('success', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app).post('/api/posts/favorite').send({ postId: 1 });
    expect(res.body).toEqual({ success: true, data: { favorited: true } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    const res = await request(app).post('/api/posts/favorite').send({ postId: 999 });
    expect(res.body).toEqual({ success: false, error: 'Post not found' });
  });
});

describe('DELETE /api/posts/delete', () => {
  it('success', async () => {
    mocks.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // delete comments
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // delete post
    const res = await request(app).delete('/api/posts/delete').send({ postId: 1 });
    expect(res.body).toEqual({ success: true, data: { deleted: true } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    mocks.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/posts/delete').send({ postId: 999 });
    expect(res.body).toEqual({ success: false, error: 'Post not found' });
  });
});

// ==================== Comment ====================

describe('GET /api/comments/findByPost', () => {
  it('returns comments', async () => {
    mocks.query.mockResolvedValue([[{ comment_id: 1, caption: 'nice' }]]);
    const res = await request(app).get('/api/comments/findByPost?postId=2');
    expect(res.body).toEqual({ success: true, data: [{ comment_id: 1, caption: 'nice' }] });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/comments/findByPost?postId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid postId is required' });
  });
});

describe('POST /api/comments/create', () => {
  it('success', async () => {
    mocks.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // update commentAmt
    const res = await request(app).post('/api/comments/create').send({ commentorId: 1, postId: 2, commuId: 3, caption: 'nice' });
    expect(res.body).toEqual({ success: true, data: { commentId: 1, commentorId: 1, postId: 2, commuId: 3, caption: 'nice' } });
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/comments/create').send({});
    expect(res.body).toEqual({ success: false, error: 'commentorId, postId, commuId, and caption are required' });
  });
});

describe('DELETE /api/comments/delete', () => {
  it('success', async () => {
    mocks.query.mockResolvedValueOnce([[{ post_id: 2 }]]); // select
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // delete
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // update commentAmt
    const res = await request(app).delete('/api/comments/delete').send({ commentId: 1 });
    expect(res.body).toEqual({ success: true, data: { deleted: true } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).delete('/api/comments/delete').send({ commentId: 999 });
    expect(res.body).toEqual({ success: false, error: 'Comment not found' });
  });
});

// ==================== Quest ====================

describe('GET /api/quests/findByOwner', () => {
  it('returns quests', async () => {
    mocks.query.mockResolvedValue([[{ quest_id: 1 }]]);
    const res = await request(app).get('/api/quests/findByOwner?ownerId=5');
    expect(res.body).toEqual({ success: true, data: [{ quest_id: 1 }] });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/quests/findByOwner?ownerId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid ownerId is required' });
  });
});

describe('GET /api/quests/findById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ quest_id: 1, instruction: 'Plant a tree' }]]);
    const res = await request(app).get('/api/quests/findById?questId=1');
    expect(res.body).toEqual({ success: true, data: { quest_id: 1, instruction: 'Plant a tree' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/quests/findById?questId=999');
    expect(res.body).toEqual({ success: false, error: 'Quest not found' });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/quests/findById?questId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid questId is required' });
  });
});

describe('POST /api/quests/create', () => {
  it('success', async () => {
    mocks.query.mockResolvedValue([{ insertId: 1 }]);
    const res = await request(app).post('/api/quests/create').send({
      ecoPoint: 10, instruction: 'Plant a tree', due: '2025-12-31', type: 'daily', ownerId: 5,
    });
    expect(res.body).toEqual({
      success: true,
      data: { questId: 1, ecoPoint: 10, instruction: 'Plant a tree', due: '2025-12-31', type: 'daily', ownerId: 5 },
    });
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/quests/create').send({});
    expect(res.body).toEqual({ success: false, error: 'ecoPoint, instruction, due, type, and ownerId are required' });
  });
});

describe('PUT /api/quests/updateProgress', () => {
  it('success', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/quests/updateProgress').send({ questId: 1, progress: 50 });
    expect(res.body).toEqual({ success: true, data: { updated: true } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    const res = await request(app).put('/api/quests/updateProgress').send({ questId: 999, progress: 50 });
    expect(res.body).toEqual({ success: false, error: 'Quest not found' });
  });
  it('invalid body', async () => {
    const res = await request(app).put('/api/quests/updateProgress').send({});
    expect(res.body).toEqual({ success: false, error: 'questId and progress are required' });
  });
});

describe('DELETE /api/quests/delete', () => {
  it('success', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/quests/delete').send({ questId: 1 });
    expect(res.body).toEqual({ success: true, data: { deleted: true } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/quests/delete').send({ questId: 999 });
    expect(res.body).toEqual({ success: false, error: 'Quest not found' });
  });
});
