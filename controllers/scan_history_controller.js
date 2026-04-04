import { z } from 'zod';
import { findProductByBarcode, scanProduct, getScanHistory, getMonthlySummary, getDailyDetail } from '../services/scan_history_service.js';
import { ok, fail } from '../middleware/response.js';

const idParam = z.coerce.number().int().nonnegative();
const barcodeParam = z.string().min(1);

const scanSchema = z.object({
  userId: z.coerce.number().int().nonnegative(),
  barcode: z.string().min(1),
});

const monthlySchema = z.object({
  userId: z.coerce.number().int().nonnegative(),
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
});

const dailySchema = z.object({
  userId: z.coerce.number().int().nonnegative(),
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
  day: z.coerce.number().int().min(1).max(31),
});

export async function getProduct(req, res, next) {
  try {
    const barcode = barcodeParam.parse(req.query.barcode);
    const product = await findProductByBarcode(barcode);
    if (!product) return fail(res, 'Product not found');
    return ok(res, product);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid barcode is required');
    next(error);
  }
}

export async function scan(req, res, next) {
  try {
    const { userId, barcode } = scanSchema.parse(req.body);
    const result = await scanProduct(userId, barcode);
    if (result.error) return fail(res, result.error);
    return ok(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userId and barcode are required');
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const userId = idParam.parse(req.query.userId);
    return ok(res, await getScanHistory(userId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid userId is required');
    next(error);
  }
}

export async function getMonthly(req, res, next) {
  try {
    const { userId, year, month } = monthlySchema.parse(req.query);
    return ok(res, await getMonthlySummary(userId, year, month));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userId, year, and month are required');
    next(error);
  }
}

export async function getDaily(req, res, next) {
  try {
    const { userId, year, month, day } = dailySchema.parse(req.query);
    return ok(res, await getDailyDetail(userId, year, month, day));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userId, year, month, and day are required');
    next(error);
  }
}
