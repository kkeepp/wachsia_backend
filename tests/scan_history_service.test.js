import { findProductByBarcode, scanProduct, getScanHistory, getMonthlySummary, getDailyDetail } from '../services/scan_history_service.js';

const mocks = globalThis.__dbMocks;

beforeEach(() => vi.clearAllMocks());

const sampleProduct = { barcode: '123', product_name: 'Test', image: '', eco_grade: 'a', eco_point: 50 };

describe('findProductByBarcode', () => {
  it('found', async () => {
    mocks.query.mockResolvedValue([[sampleProduct]]);
    expect(await findProductByBarcode('123')).toEqual(sampleProduct);
  });
  it('not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await findProductByBarcode('999')).toBeNull();
  });
});

describe('scanProduct', () => {
  it('product not found', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await scanProduct(1, '999')).toEqual({ error: 'Product not found' });
  });
  it('success', async () => {
    mocks.query
      .mockResolvedValueOnce([[sampleProduct]])          // find product
      .mockResolvedValueOnce([{ insertId: 1 }])          // insert scan_history
      .mockResolvedValueOnce([{ affectedRows: 1 }])      // update user point
      .mockResolvedValueOnce([[{ point: 150 }]]);         // select point
    expect(await scanProduct(1, '123')).toEqual({ product: sampleProduct, points: 150 });
  });
});

describe('getScanHistory', () => {
  it('returns history', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, barcode: '123' }]]);
    expect(await getScanHistory(1)).toEqual([{ id: 1, barcode: '123' }]);
  });
  it('empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await getScanHistory(999)).toEqual([]);
  });
});

describe('getMonthlySummary', () => {
  it('returns summary', async () => {
    mocks.query.mockResolvedValue([[{ day: 1, scan_count: 3, total_points: 150 }]]);
    expect(await getMonthlySummary(1, 2026, 4)).toEqual([{ day: 1, scan_count: 3, total_points: 150 }]);
  });
  it('empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await getMonthlySummary(1, 2026, 1)).toEqual([]);
  });
});

describe('getDailyDetail', () => {
  it('returns detail', async () => {
    mocks.query.mockResolvedValue([[{ id: 1, barcode: '123', product_name: 'Test' }]]);
    expect(await getDailyDetail(1, 2026, 4, 4)).toEqual([{ id: 1, barcode: '123', product_name: 'Test' }]);
  });
  it('empty', async () => {
    mocks.query.mockResolvedValue([[]]);
    expect(await getDailyDetail(1, 2026, 1, 1)).toEqual([]);
  });
});
