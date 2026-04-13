import { query } from '../db_config/db_manager.js';

export async function createTree(userId) {
  const [result] = await query('INSERT INTO tree (user_id) VALUES (?)', [userId]);
  return { id: result.insertId, userId, level: 1, experience: 0, treeGrowth: 1, treePhase: 1 };
}

export async function getTreeByUserId(userId) {
  const [rows] = await query(
    'SELECT id, user_id, level, experience, tree_growth, tree_phase FROM tree WHERE user_id = ?',
    [userId]
  );
  return rows[0] || null;
}

export async function getRanking() {
  const [rows] = await query(
    `SELECT u.id, u.username, t.level, t.experience,
            ROW_NUMBER() OVER (ORDER BY t.level DESC, t.experience DESC) AS \`rank\`
     FROM tree t JOIN user u ON u.id = t.user_id
     ORDER BY t.level DESC, t.experience DESC`
  );
  return rows;
}

async function resetDailyIfNeeded(userId) {
  await query(
    `UPDATE \`user\` SET used_point_today = 0, last_action_date = CURDATE()
     WHERE id = ? AND (last_action_date IS NULL OR last_action_date < CURDATE())`,
    [userId]
  );
}

export async function addExperience(userId, amount) {
  const [userRows] = await query('SELECT point, used_point_today FROM `user` WHERE id = ?', [userId]);
  if (!userRows[0]) return { error: 'User not found' };

  await resetDailyIfNeeded(userId);

  const [freshUser] = await query('SELECT point, used_point_today FROM `user` WHERE id = ?', [userId]);
  const { point, used_point_today } = freshUser[0];

  if (point < amount) return { error: 'Not enough points' };
  if (used_point_today >= 1500) return { error: 'Daily limit exceeded' };

  const tree = await getTreeByUserId(userId);
  if (!tree) return { error: 'Tree not found' };

  await query(
    'UPDATE `user` SET point = point - ?, used_point_today = used_point_today + ?, last_action_date = CURDATE() WHERE id = ?',
    [amount, amount, userId]
  );

  let { level, experience } = tree;

  if (level > 5 || (level === 5 && experience >= 500)) {
    return { error: 'Tree is already at max level' };
  }

  experience += amount;
  let expToNextLevel = level * 100;

  while (experience >= expToNextLevel && level < 5) {
    experience -= expToNextLevel;
    level += 1;
    expToNextLevel = level * 100;
  }

  if (level >= 5 && experience >= 500) {
    level = 5;
    experience = 500;
  }

  await query('UPDATE tree SET level = ?, experience = ? WHERE user_id = ?', [level, experience, userId]);

  return { level, experience, points: point - amount, usedToday: used_point_today + amount };
}
