import { z } from 'zod';
import { createComment, findCommentsByPost, deleteComment } from '../services/comment_service.js';
import { ok, fail } from '../middleware/response.js';

const idParam = z.coerce.number().int().nonnegative();
const createSchema = z.object({
  commentorId: z.coerce.number().int().nonnegative(),
  postId: z.coerce.number().int().nonnegative(),
  commuId: z.coerce.number().int().nonnegative(),
  caption: z.string().min(1),
});

export async function getByPost(req, res, next) {
  try {
    const postId = idParam.parse(req.query.postId);
    return ok(res, await findCommentsByPost(postId));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid postId is required');
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const data = createSchema.parse(req.body);
    return ok(res, await createComment(data.commentorId, data.postId, data.commuId, data.caption));
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'commentorId, postId, commuId, and caption are required');
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const id = idParam.parse(req.body.commentId);
    const deleted = await deleteComment(id);
    if (!deleted) return fail(res, 'Comment not found');
    return ok(res, { deleted: true });
  } catch (error) {
    if (error instanceof z.ZodError) return fail(res, 'Valid commentId is required');
    next(error);
  }
}
