import { query } from '../db_config/db_manager.js';

export async function createTree(ownerId) {
  const [result] = await query(
    'INSERT INTO tree (owner_id) VALUES (?)',
    [ownerId]
  );
  return { treeId: result.insertId, ownerId, level: 1, experience: 0 };
}

export async function getTreeByUserId(userId) {
  const [rows] = await query(
    'SELECT tree_id, owner_id, level, experience FROM tree WHERE owner_id = ?',
    [userId]
  );
  return rows[0] || null;
}
