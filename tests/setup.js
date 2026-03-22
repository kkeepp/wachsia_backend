import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  testConnection: vi.fn().mockResolvedValue(true),
  healthCheck: vi.fn().mockResolvedValue(true),
  closePool: vi.fn().mockResolvedValue(true),
}));

vi.mock('../db_config/db_manager.js', () => mocks);

globalThis.__dbMocks = mocks;
