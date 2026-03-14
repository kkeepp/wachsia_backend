import { query } from '../db_config/db_manager.js';

export async function findAllUser() {
  const [rows] = await query('SELECT * FROM `user`');
  return rows;
}