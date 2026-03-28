import { query } from '../db_config/db_manager.js';

export async function createCommunity(communityName, memberId) {
  const [result] = await query(
    'INSERT INTO community (community_name, member_id) VALUES (?, ?)',
    [communityName, memberId]
  );
  return { communityId: result.insertId, communityName, memberId };
}

export async function findAllCommunities() {
  const [rows] = await query('SELECT * FROM community');
  return rows;
}

export async function findCommunityById(communityId) {
  const [rows] = await query('SELECT * FROM community WHERE community_id = ?', [communityId]);
  return rows[0] || null;
}

export async function findCommunitiesByMember(memberId) {
  const [rows] = await query('SELECT * FROM community WHERE member_id = ?', [memberId]);
  return rows;
}

export async function deleteCommunity(communityId) {
  const [result] = await query('DELETE FROM community WHERE community_id = ?', [communityId]);
  return result.affectedRows > 0;
}
