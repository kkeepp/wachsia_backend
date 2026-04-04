import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

// ==================== Health ====================

describe('GET /health', () => {
  it('ok', async () => {
    mocks.healthCheck.mockResolvedValue(true);
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });
  it('503', async () => {
    mocks.healthCheck.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
  });
});

describe('404', () => {
  it('unknown route', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});

// ==================== User Routes ====================

describe('GET /api/users/findAllUsers', () => {
  it('returns all users', async () => {
    mocks.query.mockResolvedValue([[{ id: 1 }]]);
    const res = await request(app).get('/api/users/findAllUsers');
    expect(res.body).toEqual({ success: true, data: [{ id: 1 }] });
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    const res = await request(app).get('/api/users/findAllUsers');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/users/findByEmail', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, email: 'a@b.com' }]]);
    const res = await request(app).get('/api/users/findByEmail?email=a@b.com');
    expect(res.body).toEqual({ success: true, data: { id: 1, email: 'a@b.com' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/users/findByEmail?email=x@y.com');
    expect(res.body).toEqual({ success: false, error: 'User not found' });
  });
  it('invalid email', async () => {
    const res = await request(app).get('/api/users/findByEmail?email=bad');
    expect(res.body).toEqual({ success: false, error: 'Invalid email format' });
  });
});

describe('GET /api/users/findByUsername', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, username: 'joe' }]]);
    const res = await request(app).get('/api/users/findByUsername?username=joe');
    expect(res.body).toEqual({ success: true, data: { id: 1, username: 'joe' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/users/findByUsername?username=nobody');
    expect(res.body).toEqual({ success: false, error: 'User not found' });
  });
  it('missing', async () => {
    const res = await request(app).get('/api/users/findByUsername');
    expect(res.body).toEqual({ success: false, error: 'Invalid username' });
  });
});

describe('GET /api/users/exists', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([[{ id: 1 }]]);
    const res = await request(app).get('/api/users/exists?email=a@b.com');
    expect(res.body).toEqual({ success: true, data: { exists: true } });
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/users/exists?email=x@y.com');
    expect(res.body).toEqual({ success: true, data: { exists: false } });
  });
  it('invalid', async () => {
    const res = await request(app).get('/api/users/exists?email=bad');
    expect(res.body).toEqual({ success: false, error: 'Valid email is required' });
  });
});

describe('POST /api/users/verifyPassword', () => {
  it('correct', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    mocks.query.mockResolvedValue([[{ password: hashed }]]);
    const res = await request(app).post('/api/users/verifyPassword').send({ email: 'a@b.com', password: 'secret' });
    expect(res.body).toEqual({ success: true, data: { verified: true } });
  });
  it('wrong', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    mocks.query.mockResolvedValue([[{ password: hashed }]]);
    const res = await request(app).post('/api/users/verifyPassword').send({ email: 'a@b.com', password: 'wrong' });
    expect(res.body).toEqual({ success: false, error: 'Incorrect password' });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/users/verifyPassword').send({ email: 'x@y.com', password: 'p' });
    expect(res.body).toEqual({ success: false, error: 'User not found' });
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/users/verifyPassword').send({});
    expect(res.body).toEqual({ success: false, error: 'Email and password are required' });
  });
});

describe('POST /api/users/register', () => {
  it('success', async () => {
    mocks.query
      .mockResolvedValueOnce([[]])                       // userExists
      .mockResolvedValueOnce([{ insertId: 10 }])         // save user
      .mockResolvedValueOnce([{ insertId: 1 }])          // createTree
      .mockResolvedValueOnce([[{ id: 1 }, { id: 2 }]])   // assignDefaultQuests: select quests
      .mockResolvedValueOnce([{ affectedRows: 2 }])      // assignDefaultQuests: insert
      .mockResolvedValueOnce([[]]);                       // assignDefaultQuests: findQuestsByUser
    const res = await request(app).post('/api/users/register').send({ username: 'joe', email: 'a@b.com', password: 'secret123' });
    expect(res.body).toEqual({ success: true, data: { id: 10, username: 'joe', email: 'a@b.com' } });
  });
  it('email exists', async () => {
    mocks.query.mockResolvedValue([[{ id: 1 }]]);
    const res = await request(app).post('/api/users/register').send({ username: 'joe', email: 'a@b.com', password: 'secret123' });
    expect(res.body).toEqual({ success: false, error: 'Email already registered' });
  });
  it('short password', async () => {
    const res = await request(app).post('/api/users/register').send({ username: 'joe', email: 'a@b.com', password: '12' });
    expect(res.body.success).toBe(false);
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/users/register').send({});
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/users/changePassword', () => {
  it('success', async () => {
    const hashed = await bcrypt.hash('old', 10);
    mocks.query.mockResolvedValueOnce([[{ password: hashed }]]);
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/users/changePassword').send({ email: 'a@b.com', currentPassword: 'old', newPassword: 'newpass123' });
    expect(res.body).toEqual({ success: true, data: { updated: true } });
  });
  it('wrong password', async () => {
    const hashed = await bcrypt.hash('old', 10);
    mocks.query.mockResolvedValue([[{ password: hashed }]]);
    const res = await request(app).put('/api/users/changePassword').send({ email: 'a@b.com', currentPassword: 'wrong', newPassword: 'newpass123' });
    expect(res.body).toEqual({ success: false, error: 'Incorrect password' });
  });
  it('invalid body', async () => {
    const res = await request(app).put('/api/users/changePassword').send({});
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/users/deleteAccount', () => {
  it('success', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    mocks.query.mockResolvedValueOnce([[{ password: hashed }]]);
    mocks.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/users/deleteAccount').send({ email: 'a@b.com', password: 'secret' });
    expect(res.body).toEqual({ success: true, data: { deleted: true } });
  });
  it('wrong password', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    mocks.query.mockResolvedValue([[{ password: hashed }]]);
    const res = await request(app).delete('/api/users/deleteAccount').send({ email: 'a@b.com', password: 'wrong' });
    expect(res.body).toEqual({ success: false, error: 'Incorrect password' });
  });
  it('invalid body', async () => {
    const res = await request(app).delete('/api/users/deleteAccount').send({});
    expect(res.body.success).toBe(false);
  });
});

// ==================== Tree Routes ====================

describe('GET /api/trees/level', () => {
  it('found', async () => {
    const tree = { id: 1, user_id: 5, level: 3, experience: 50, tree_growth: 2, tree_phase: 1 };
    mocks.query.mockResolvedValue([[tree]]);
    const res = await request(app).get('/api/trees/level?userId=5');
    expect(res.body).toEqual({ success: true, data: tree });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/trees/level?userId=999');
    expect(res.body).toEqual({ success: false, error: 'Tree not found' });
  });
  it('invalid userId', async () => {
    const res = await request(app).get('/api/trees/level?userId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid user ID is required' });
  });
});

describe('GET /api/trees/ranking', () => {
  it('returns ranking', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, username: 'a', level: 5, experience: 90, rank: 1 }]]);
    const res = await request(app).get('/api/trees/ranking');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/trees/addExp', () => {
  it('invalid body', async () => {
    const res = await request(app).post('/api/trees/addExp').send({});
    expect(res.body).toEqual({ success: false, error: 'userId and amount are required' });
  });
  it('user not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/trees/addExp').send({ userId: 999, amount: 10 });
    expect(res.body).toEqual({ success: false, error: 'User not found' });
  });
});

// ==================== User Quest Routes ====================

describe('GET /api/user-quests/findByUser', () => {
  it('returns quests', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, quest_type: 'daily' }]]);
    const res = await request(app).get('/api/user-quests/findByUser?userId=1');
    expect(res.body).toEqual({ success: true, data: [{ id: 1, quest_type: 'daily' }] });
  });
  it('invalid userId', async () => {
    const res = await request(app).get('/api/user-quests/findByUser?userId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid userId is required' });
  });
});

describe('GET /api/user-quests/findById', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, instruction: 'Login' }]]);
    const res = await request(app).get('/api/user-quests/findById?userQuestId=1');
    expect(res.body).toEqual({ success: true, data: { id: 1, instruction: 'Login' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/user-quests/findById?userQuestId=999');
    expect(res.body).toEqual({ success: false, error: 'Quest not found' });
  });
  it('invalid id', async () => {
    const res = await request(app).get('/api/user-quests/findById?userQuestId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid userQuestId is required' });
  });
});

describe('PUT /api/user-quests/updateProgress', () => {
  it('success', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ id: 1, status: 'in_progress', count: 0, max: 5, quest_id: 1 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/user-quests/updateProgress').send({ userQuestId: 1, count: 3 });
    expect(res.body).toEqual({ success: true, data: { id: 1, count: 3, status: 'in_progress' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).put('/api/user-quests/updateProgress').send({ userQuestId: 999, count: 1 });
    expect(res.body).toEqual({ success: false, error: 'Quest not found' });
  });
  it('invalid body', async () => {
    const res = await request(app).put('/api/user-quests/updateProgress').send({});
    expect(res.body).toEqual({ success: false, error: 'userQuestId and count are required' });
  });
});

describe('POST /api/user-quests/claimReward', () => {
  it('success', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ id: 1, status: 'completed', reward: 10 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ point: 110 }]]);
    const res = await request(app).post('/api/user-quests/claimReward').send({ userQuestId: 1, userId: 1 });
    expect(res.body).toEqual({ success: true, data: { claimed: true, reward: 10, points: 110 } });
  });
  it('not completed', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, status: 'in_progress' }]]);
    const res = await request(app).post('/api/user-quests/claimReward').send({ userQuestId: 1, userId: 1 });
    expect(res.body).toEqual({ success: false, error: 'Quest not completed' });
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/user-quests/claimReward').send({});
    expect(res.body).toEqual({ success: false, error: 'userQuestId and userId are required' });
  });
});

// ==================== Scan History Routes ====================

describe('GET /api/scan-history/product', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ barcode: '123', product_name: 'Test' }]]);
    const res = await request(app).get('/api/scan-history/product?barcode=123');
    expect(res.body).toEqual({ success: true, data: { barcode: '123', product_name: 'Test' } });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).get('/api/scan-history/product?barcode=999');
    expect(res.body).toEqual({ success: false, error: 'Product not found' });
  });
  it('missing barcode', async () => {
    const res = await request(app).get('/api/scan-history/product');
    expect(res.body).toEqual({ success: false, error: 'Valid barcode is required' });
  });
});

describe('GET /api/scan-history/history', () => {
  it('returns history', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, barcode: '123' }]]);
    const res = await request(app).get('/api/scan-history/history?userId=1');
    expect(res.body).toEqual({ success: true, data: [{ id: 1, barcode: '123' }] });
  });
  it('invalid userId', async () => {
    const res = await request(app).get('/api/scan-history/history?userId=abc');
    expect(res.body).toEqual({ success: false, error: 'Valid userId is required' });
  });
});

describe('GET /api/scan-history/monthly', () => {
  it('returns summary', async () => {
    mocks.query.mockResolvedValue([[{ day: 1, scan_count: 3, total_points: 150 }]]);
    const res = await request(app).get('/api/scan-history/monthly?userId=1&year=2026&month=4');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
  it('invalid params', async () => {
    const res = await request(app).get('/api/scan-history/monthly?userId=1');
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/scan-history/daily', () => {
  it('returns detail', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, barcode: '123' }]]);
    const res = await request(app).get('/api/scan-history/daily?userId=1&year=2026&month=4&day=4');
    expect(res.body.success).toBe(true);
  });
  it('invalid params', async () => {
    const res = await request(app).get('/api/scan-history/daily?userId=1&year=2026');
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/scan-history/scan', () => {
  it('success', async () => {
    mocks.query
      .mockResolvedValueOnce([[{ barcode: '123', eco_point: 50 }]])
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ point: 150 }]]);
    const res = await request(app).post('/api/scan-history/scan').send({ userId: 1, barcode: '123' });
    expect(res.body.success).toBe(true);
    expect(res.body.data.points).toBe(150);
  });
  it('product not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/scan-history/scan').send({ userId: 1, barcode: '999' });
    expect(res.body).toEqual({ success: false, error: 'Product not found' });
  });
  it('invalid body', async () => {
    const res = await request(app).post('/api/scan-history/scan').send({});
    expect(res.body).toEqual({ success: false, error: 'userId and barcode are required' });
  });
});
