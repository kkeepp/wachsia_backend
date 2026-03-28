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

export async function getRanking() {
  const [rows] = await query(
    `SELECT u.id, u.username, t.level, t.experience,
            ROW_NUMBER() OVER (ORDER BY t.level DESC, t.experience DESC) AS \`rank\`
     FROM tree t
     JOIN user u ON u.id = t.owner_id
     ORDER BY t.level DESC, t.experience DESC`
  );
  return rows;
}

export async function addExperience(userId, amount) {
  // Check user has enough points
  const [userRows] = await query('SELECT point FROM `user` WHERE id = ?', [userId]);
  if (!userRows[0]) return { error: 'User not found' };
  const currentPoints = userRows[0].point;
  if (currentPoints < amount) return { error: 'Not enough points' };

  // Check daily limit (500 per day)
  const usedToday = await getTodayUsedPoints(userId);
  if (usedToday + amount > 500) return { error: 'Daily limit exceeded' };

  // Get tree
  const tree = await getTreeByUserId(userId);
  if (!tree) return { error: 'Tree not found' };

  // Deduct points from user
  await query('UPDATE `user` SET point = point - ? WHERE id = ?', [amount, userId]);

  // Record watering
  await query(
    'INSERT INTO tree_watering (user_id, amount) VALUES (?, ?)',
    [userId, amount]
  );

  // Calculate new level/exp
  let { level, experience } = tree;
  experience += amount;

  let expToNextLevel = level * 100;
  while (experience >= expToNextLevel) {
    experience -= expToNextLevel;
    level += 1;
    expToNextLevel = level * 100;
  }

  // Update tree
  await query(
    'UPDATE tree SET level = ?, experience = ? WHERE owner_id = ?',
    [level, experience, userId]
  );

  const newPoints = currentPoints - amount;
  return { level, experience, points: newPoints, usedToday: usedToday + amount };
}
