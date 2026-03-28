import { query } from '../db_config/db_manager.js';

export async function createComment(commentorId, postId, commuId, caption) {
  const [result] = await query(
    'INSERT INTO comment (commentor_id, post_id, commu_id, caption) VALUES (?, ?, ?, ?)',
    [commentorId, postId, commuId, caption]
  );
  await query('UPDATE post SET commentAmt = commentAmt + 1 WHERE post_id = ?', [postId]);
  return { commentId: result.insertId, commentorId, postId, commuId, caption };
}

export async function findCommentsByPost(postId) {
  const [rows] = await query(
    'SELECT * FROM comment WHERE post_id = ? ORDER BY comment_id ASC',
    [postId]
  );
  return rows;
}

export async function deleteComment(commentId) {
  const [rows] = await query('SELECT post_id FROM comment WHERE comment_id = ?', [commentId]);
  if (!rows[0]) return false;
  const [result] = await query('DELETE FROM comment WHERE comment_id = ?', [commentId]);
  if (result.affectedRows > 0) {
    await query('UPDATE post SET commentAmt = commentAmt - 1 WHERE post_id = ? AND commentAmt > 0', [rows[0].post_id]);
    return true;
  }
  return false;
}
