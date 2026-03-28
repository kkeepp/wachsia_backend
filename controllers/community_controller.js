import { z } from 'zod';
import { createCommunity, findAllCommunities, findCommunityById, findCommunitiesByMember, deleteCommunity } from '../services/community_service.js';
import { ok, fail } from '../middleware/response.js';

const idParam = z.coerce.number().int().nonnegative();
const createSchema = z.object({
  communityName: z.string().min(1),
  memberId: z.coerce.number().int().nonnegative(),
});

export async function getAll(req, res, next) {
  try {
    return ok(res, await findAllCommunities());
  } catch (error) { next(error); }
}

export async function getById(req, res, next) {
  try {
    const id = idParam.parse(req.query.communityId);
    const community = await findCommunityById(id);
    if (!community) return fail(res, 'Community not found');
    return ok(res, community);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid communityId is required');
    next(error);
  }
}

export async function getByMember(req, res, next) {
  try {
    const memberId = idParam.parse(req.query.memberId);
    return ok(res, await findCommunitiesByMember(memberId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid memberId is required');
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { communityName, memberId } = createSchema.parse(req.body);
    return ok(res, await createCommunity(communityName, memberId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'communityName and memberId are required');
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = idParam.parse(req.body.communityId);
    const deleted = await deleteCommunity(id);
    if (!deleted) return fail(res, 'Community not found');
    return ok(res, { deleted: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid communityId is required');
    next(error);
  }
}
