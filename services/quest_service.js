import { query } from '../db_config/db_manager.js';

export async function createQuest(ecoPoint, instruction, due, type, ownerId) {
  const [result] = await query(
    'INSERT INTO quest (eco_point, instruction, due, type, owner_id) VALUES (?, ?, ?, ?, ?)',
    [ecoPoint, instruction, due, type, ownerId]
  );
  return { questId: result.insertId, ecoPoint, instruction, due, type, ownerId };
}

export async function findQuestsByOwner(ownerId) {
  const [rows] = await query(
    'SELECT * FROM quest WHERE owner_id = ? ORDER BY due ASC',
    [ownerId]
  );
  return rows;
}

export async function findQuestById(questId) {
  const [rows] = await query('SELECT * FROM quest WHERE quest_id = ?', [questId]);
  return rows[0] || null;
}

export async function updateProgress(questId, progress) {
  const [result] = await query(
    'UPDATE quest SET progress = ? WHERE quest_id = ?',
    [progress, questId]
  );
  return result.affectedRows > 0;
}

export async function deleteQuest(questId) {
  const [result] = await query('DELETE FROM quest WHERE quest_id = ?', [questId]);
  return result.affectedRows > 0;
}
