import { z } from 'zod';
import { getTreeByUserId, addExperience, getRanking } from '../services/tree_service.js';
import { ok, fail } from '../middleware/response.js';

const userIdParam = z.coerce.number().int().nonnegative();

const addExpSchema = z.object({
  userId: z.coerce.number().int().nonnegative(),
  amount: z.coerce.number().int().positive(),
});

export async function getTreeLevel(req, res, next) {
  try {
    const userId = userIdParam.parse(req.query.userId);
    const tree = await getTreeByUserId(userId);
    if (!tree) return fail(res, 'Tree not found');
    return ok(res, { level: tree.level, experience: tree.experience });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid user ID is required');
    next(error);
  }
}

export async function addExp(req, res, next) {
  try {
    const { userId, amount } = addExpSchema.parse(req.body);
    const result = await addExperience(userId, amount);
    if (result.error) return fail(res, result.error);
    return ok(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userId and amount are required');
    next(error);
  }
}

export async function ranking(req, res, next) {
  try {
    const data = await getRanking();
    return ok(res, data);
  } catch (error) {
    next(error);
  }
}
