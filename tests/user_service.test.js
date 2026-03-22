import bcrypt from 'bcrypt';
import { findAllUser, findByEmail, findByUsername, userExists, verifyPassword, save, updatePassword, deleteByEmail } from '../services/user_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

describe('findAllUser', () => {
  it('should return all users', async () => {
    mocks.query.mockResolvedValue([[{ id: 1 }, { id: 2 }]]);
    expect(await findAllUser()).toEqual([{ id: 1 }, { id: 2 }]);
  });
  it('should return empty array', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findAllUser()).toEqual([]);
  });
});

describe('findByEmail', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, email: 'a@b.com' }]]);
    expect(await findByEmail('a@b.com')).toEqual({ id: 1, email: 'a@b.com' });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findByEmail('x@y.com')).toBeNull();
  });
});

describe('findByUsername', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, username: 'joe' }]]);
    expect(await findByUsername('joe')).toEqual({ id: 1, username: 'joe' });
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findByUsername('nobody')).toBeNull();
  });
});

describe('userExists', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([[{ id: 1 }]]);
    expect(await userExists('a@b.com')).toEqual({ exists: true });
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await userExists('x@y.com')).toEqual({ exists: false });
  });
});

describe('verifyPassword', () => {
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await verifyPassword('x@y.com', 'p')).toEqual({ found: false });
  });
  it('match', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    mocks.query.mockResolvedValue([[{ password: hashed }]]);
    expect(await verifyPassword('a@b.com', 'secret')).toEqual({ found: true, match: true });
  });
  it('no match', async () => {
    const hashed = await bcrypt.hash('secret', 10);
    mocks.query.mockResolvedValue([[{ password: hashed }]]);
    expect(await verifyPassword('a@b.com', 'wrong')).toEqual({ found: true, match: false });
  });
});

describe('save', () => {
  it('returns new user', async () => {
    mocks.query.mockResolvedValue([{ insertId: 5 }]);
    expect(await save('joe', 'a@b.com', 'p')).toEqual({ id: 5, username: 'joe', email: 'a@b.com' });
    const storedPassword = mocks.query.mock.calls[0][1][2];
    expect(await bcrypt.compare('p', storedPassword)).toBe(true);
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(save('joe', 'a@b.com', 'p')).rejects.toThrow('db down');
  });
});

describe('updatePassword', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    expect(await updatePassword('a@b.com', 'new')).toBe(true);
    const storedPassword = mocks.query.mock.calls[0][1][0];
    expect(await bcrypt.compare('new', storedPassword)).toBe(true);
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    expect(await updatePassword('x@y.com', 'new')).toBe(false);
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(updatePassword('a@b.com', 'new')).rejects.toThrow('db down');
  });
});

describe('deleteByEmail', () => {
  it('true', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    expect(await deleteByEmail('a@b.com')).toBe(true);
  });
  it('false', async () => {
    mocks.query.mockResolvedValue([{ affectedRows: 0 }]);
    expect(await deleteByEmail('x@y.com')).toBe(false);
  });
  it('db error', async () => {
    mocks.query.mockRejectedValue(new Error('db down'));
    await expect(deleteByEmail('a@b.com')).rejects.toThrow('db down');
  });
});
