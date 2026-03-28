import { z } from 'zod';
import { createPost, findPostById, findPostsByCommunity, findPostsByUser, incrementFavorite, deletePost } from '../services/post_service.js';
import { ok, fail } from '../middleware/response.js';

const idParam = z.coerce.number().int().nonnegative();
const createSchema = z.object({
  posterId: z.coerce.number().int().nonnegative(),
  commuId: z.coerce.number().int().nonnegative(),
  caption: z.string().min(1),
  image: z.string().optional(),
});

export async function getById(req, res, next) {
  try {
    const id = idParam.parse(req.query.postId);
    const post = await findPostById(id);
    if (!post) return fail(res, 'Post not found');
    return ok(res, post);
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid postId is required');
    next(error);
  }
}

export async function getByCommunity(req, res, next) {
  try {
    const commuId = idParam.parse(req.query.commuId);
    return ok(res, await findPostsByCommunity(commuId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid commuId is required');
    next(error);
  }
}

export async function getByUser(req, res, next) {
  try {
    const posterId = idParam.parse(req.query.posterId);
    return ok(res, await findPostsByUser(posterId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid posterId is required');
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    return ok(res, await createPost(data.posterId, data.commuId, data.caption, data.image));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'posterId, commuId, and caption are required');
    next(error);
  }
}

export async function favorite(req, res, next) {
  try {
    const id = idParam.parse(req.body.postId);
    const updated = await incrementFavorite(id);
    if (!updated) return fail(res, 'Post not found');
    return ok(res, { favorited: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid postId is required');
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = idParam.parse(req.body.postId);
    const deleted = await deletePost(id);
    if (!deleted) return fail(res, 'Post not found');
    return ok(res, { deleted: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid postId is required');
    next(error);
  }
}
