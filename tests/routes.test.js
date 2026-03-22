import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('GET /api/users/findAllUsers', () => {
  it('should return all users', async () => {
    mocks.query.mockResolvedValue([[{ id: 1 }]]);
    const res = await request(app).get('/api/users/findAllUsers');
    expect(res.status).toBe(200);
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
  it('invalid username', async () => {
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
  it('invalid email', async () => {
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
    mocks.query.mockResolvedValueOnce([[]]);          // userExists check
    mocks.query.mockResolvedValueOnce([{ insertId: 10 }]); // save user
    mocks.query.mockResolvedValueOnce([{ insertId: 1 }]);  // createTree
    const res = await request(app).post('/api/users/register').send({ username: 'joe', email: 'a@b.com', password: 'secret123' });
    expect(res.body).toEqual({ success: true, data: { id: 10, username: 'joe', email: 'a@b.com' } });
    expect(mocks.query).toHaveBeenCalledTimes(3);
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
  it('user not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).put('/api/users/changePassword').send({ email: 'x@y.com', currentPassword: 'old', newPassword: 'newpass123' });
    expect(res.body).toEqual({ success: false, error: 'User not found' });
  });
  it('invalid body', async () => {
    const res = await request(app).put('/api/users/changePassword').send({});
    expect(res.body).toEqual({ success: false, error: 'Email, current password and new password (min 6 chars) are required' });
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
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    const res = await request(app).delete('/api/users/deleteAccount').send({ email: 'x@y.com', password: 'p' });
    expect(res.body).toEqual({ success: false, error: 'User not found' });
  });
  it('invalid body', async () => {
    const res = await request(app).delete('/api/users/deleteAccount').send({});
    expect(res.body).toEqual({ success: false, error: 'Email and password are required' });
  });
});

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

describe('GET /api/trees/level', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ tree_id: 1, owner_id: 5, level: 3, experience: 250 }]]);
    const res = await request(app).get('/api/trees/level?userId=5');
    expect(res.body).toEqual({ success: true, data: { level: 3, experience: 250 } });
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
  it('missing userId', async () => {
    const res = await request(app).get('/api/trees/level');
    expect(res.body).toEqual({ success: false, error: 'Valid user ID is required' });
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    const res = await request(app).get('/api/trees/level?userId=1');
    expect(res.status).toBe(500);
  });
});

describe('404', () => {
  it('unknown route', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
