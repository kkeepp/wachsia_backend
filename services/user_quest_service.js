import { query } from '../db_config/db_manager.js';

export async function findQuestsByUser(userId) {
  // Auto-reset daily quests if assign_date is before today
  await query(
    `UPDATE user_quest uq JOIN quest q ON uq.quest_id = q.id
     SET uq.status = 'in_progress', uq.count = 0, uq.assign_date = CURDATE()
     WHERE uq.user_id = ? AND q.quest_type = 'daily' AND uq.assign_date < CURDATE()`,
    [userId]
  );

  const [rows] = await query(
    `SELECT uq.id, uq.status, uq.count, uq.assign_date,
            q.id AS quest_id, q.quest_type, q.instruction, q.reward, q.max
     FROM user_quest uq JOIN quest q ON uq.quest_id = q.id
     WHERE uq.user_id = ? ORDER BY q.quest_type, q.id`,
    [userId]
  );
  return rows;
}

export async function findUserQuestById(userQuestId) {
  const [rows] = await query(
    `SELECT uq.id, uq.status, uq.count, uq.assign_date,
            q.id AS quest_id, q.quest_type, q.instruction, q.reward, q.max
     FROM user_quest uq JOIN quest q ON uq.quest_id = q.id
     WHERE uq.id = ?`,
    [userQuestId]
  );
  return rows[0] || null;
}

export async function updateProgress(userQuestId, count) {
  const uq = await findUserQuestById(userQuestId);
  if (!uq) return null;
  if (uq.status === 'claimed') return { error: 'Already claimed' };

  const newCount = Math.min(count, uq.max);
  const newStatus = newCount >= uq.max ? 'completed' : 'in_progress';

  await query('UPDATE user_quest SET count = ?, status = ? WHERE id = ?', [newCount, newStatus, userQuestId]);
  return { id: userQuestId, count: newCount, status: newStatus };
}

export async function claimReward(userQuestId, userId) {
  const uq = await findUserQuestById(userQuestId);
  if (!uq) return null;
  if (uq.status !== 'completed') return { error: 'Quest not completed' };

  await query('UPDATE user_quest SET status = ? WHERE id = ?', ['claimed', userQuestId]);
  await query('UPDATE `user` SET point = point + ? WHERE id = ?', [uq.reward, userId]);

  const [userRows] = await query('SELECT point FROM `user` WHERE id = ?', [userId]);
  return { claimed: true, reward: uq.reward, points: userRows[0].point };
}

export async function assignDefaultQuests(userId) {
  const [quests] = await query('SELECT id FROM quest');
  if (quests.length === 0) return [];
  const values = quests.map(q => `(${q.id}, ${userId})`).join(',');
  await query(`INSERT INTO user_quest (quest_id, user_id) VALUES ${values}`);
  return findQuestsByUser(userId);
}

export async function resetDailyQuests(userId) {
  await query(
    `UPDATE user_quest uq JOIN quest q ON uq.quest_id = q.id
     SET uq.status = 'in_progress', uq.count = 0, uq.assign_date = CURDATE()
     WHERE uq.user_id = ? AND q.quest_type = 'daily'`,
    [userId]
  );
}
