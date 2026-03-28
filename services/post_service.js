import { query } from '../db_config/db_manager.js';

export async function createPost(posterId, commuId, caption, image) {
  const [result] = await query(
    'INSERT INTO post (poster_id, commu_id, post_date, caption, image) VALUES (?, ?, NOW(), ?, ?)',
    [posterId, commuId, caption, image || null]
  );
  return { postId: result.insertId, posterId, commuId, caption };
}

export async function findPostById(postId) {
  const [rows] = await query('SELECT * FROM post WHERE post_id = ?', [postId]);
  return rows[0] || null;
}

export async function findPostsByCommunity(commuId) {
  const [rows] = await query(
    'SELECT * FROM post WHERE commu_id = ? ORDER BY post_date DESC',
    [commuId]
  );
  return rows;
}

export async function findPostsByUser(posterId) {
  const [rows] = await query(
    'SELECT * FROM post WHERE poster_id = ? ORDER BY post_date DESC',
    [posterId]
  );
  return rows;
}

export async function incrementFavorite(postId) {
  const [result] = await query(
    'UPDATE post SET favoriteAmt = favoriteAmt + 1 WHERE post_id = ?',
    [postId]
  );
  return result.affectedRows > 0;
}

export async function deletePost(postId) {
  await query('DELETE FROM comment WHERE post_id = ?', [postId]);
  const [result] = await query('DELETE FROM post WHERE post_id = ?', [postId]);
  return result.affectedRows > 0;
}
