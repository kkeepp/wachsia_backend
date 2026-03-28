import { z } from 'zod';
import { getMonthlyScans, getDailyScans, collectScore } from '../services/scanned_product_service.js';
import { ok, fail } from '../middleware/response.js';

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

const collectSchema = z.object({
  userId: z.coerce.number().int().nonnegative(),
  productName: z.string().min(1),
  image: z.string().optional().default(''),
  ecoScore: z.coerce.number().int(),
  ecoPoint: z.coerce.number().int(),
});

export async function getMonthlySummary(req, res, next) {
  try {
    const { userId, year, month } = monthlySchema.parse(req.query);
    const data = await getMonthlyScans(userId, year, month);
    return ok(res, data);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userId, year, and month are required');
    next(error);
  }
}

export async function getDailyDetail(req, res, next) {
  try {
    const { userId, year, month, day } = dailySchema.parse(req.query);
    const data = await getDailyScans(userId, year, month, day);
    return ok(res, data);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userId, year, month, and day are required');
    next(error);
  }
}

export async function collect(req, res, next) {
  try {
    const { userId, productName, image, ecoScore, ecoPoint } = collectSchema.parse(req.body);
    const result = await collectScore(userId, productName, image, ecoScore, ecoPoint);
    if (result.error) return fail(res, result.error);
    return ok(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userId, productName, ecoScore, and ecoPoint are required');
    next(error);
  }
}
