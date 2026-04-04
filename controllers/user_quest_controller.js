import { z } from 'zod';
import { findQuestsByUser, findUserQuestById, updateProgress, claimReward } from '../services/user_quest_service.js';
import { ok, fail } from '../middleware/response.js';

const idParam = z.coerce.number().int().nonnegative();

const updateSchema = z.object({
  userQuestId: z.coerce.number().int().nonnegative(),
  count: z.coerce.number().int().nonnegative(),
});

const claimSchema = z.object({
  userQuestId: z.coerce.number().int().nonnegative(),
  userId: z.coerce.number().int().nonnegative(),
});

export async function getByUser(req, res, next) {
  try {
    const userId = idParam.parse(req.query.userId);
    return ok(res, await findQuestsByUser(userId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid userId is required');
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const id = idParam.parse(req.query.userQuestId);
    const quest = await findUserQuestById(id);
    if (!quest) return fail(res, 'Quest not found');
    return ok(res, quest);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid userQuestId is required');
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { userQuestId, count } = updateSchema.parse(req.body);
    const result = await updateProgress(userQuestId, count);
    if (!result) return fail(res, 'Quest not found');
    if (result.error) return fail(res, result.error);
    return ok(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userQuestId and count are required');
    next(error);
  }
}

export async function claim(req, res, next) {
  try {
    const { userQuestId, userId } = claimSchema.parse(req.body);
    const result = await claimReward(userQuestId, userId);
    if (!result) return fail(res, 'Quest not found');
    if (result.error) return fail(res, result.error);
    return ok(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'userQuestId and userId are required');
    next(error);
  }
}
