import { z } from 'zod';
import { getTreeByUserId } from '../services/tree_service.js';
import { ok, fail } from '../middleware/response.js';

const userIdParam = z.coerce.number().int().positive();

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
