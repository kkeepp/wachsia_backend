import { z } from 'zod';
import { createQuest, findQuestsByOwner, findQuestById, updateProgress, deleteQuest } from '../services/quest_service.js';
import { ok, fail } from '../middleware/response.js';

const idParam = z.coerce.number().int().nonnegative();
const createSchema = z.object({
  ecoPoint: z.coerce.number().int().nonnegative(),
  instruction: z.string().min(1),
  due: z.string().min(1),
  type: z.string().min(1),
  ownerId: z.coerce.number().int().nonnegative(),
});
const updateProgressSchema = z.object({
  questId: z.coerce.number().int().nonnegative(),
  progress: z.coerce.number().int().nonnegative(),
});

export async function getByOwner(req, res, next) {
  try {
    const ownerId = idParam.parse(req.query.ownerId);
    return ok(res, await findQuestsByOwner(ownerId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid ownerId is required');
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const id = idParam.parse(req.query.questId);
    const quest = await findQuestById(id);
    if (!quest) return fail(res, 'Quest not found');
    return ok(res, quest);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid questId is required');
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    return ok(res, await createQuest(data.ecoPoint, data.instruction, data.due, data.type, data.ownerId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'ecoPoint, instruction, due, type, and ownerId are required');
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { questId, progress } = updateProgressSchema.parse(req.body);
    const updated = await updateProgress(questId, progress);
    if (!updated) return fail(res, 'Quest not found');
    return ok(res, { updated: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'questId and progress are required');
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = idParam.parse(req.body.questId);
    const deleted = await deleteQuest(id);
    if (!deleted) return fail(res, 'Quest not found');
    return ok(res, { deleted: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid questId is required');
    next(error);
  }
}
