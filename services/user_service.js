import { query } from '../db_config/db_manager.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

function stripPassword({ password, ...rest }) {
  return rest;
}

export async function findAllUser() {
  const [rows] = await query('SELECT * FROM `user`');
  return rows.map(stripPassword);
}

export async function findByEmail(email) {
  const [rows] = await query('SELECT * FROM `user` WHERE email = ?', [email]);
  return rows[0] ? stripPassword(rows[0]) : null;
}

export async function findByUsername(username) {
  const [rows] = await query('SELECT * FROM `user` WHERE username = ?', [username]);
  return rows[0] ? stripPassword(rows[0]) : null;
}

async function findByEmailInternal(email) {
  const [rows] = await query('SELECT * FROM `user` WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function userExists(email) {
  const user = await findByEmailInternal(email);
  return { exists: !!user };
}

export async function verifyPassword(email, password) {
  const user = await findByEmailInternal(email);
  if (!user) return { found: false };
  const match = await bcrypt.compare(password, user.password);
  return { found: true, match };
}

export async function save(username, email, password) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await query(
    'INSERT INTO `user` (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashed]
  );
  return { id: result.insertId, username, email };
}

export async function updatePassword(email, newPassword) {
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const [result] = await query(
    'UPDATE `user` SET password = ? WHERE email = ?',
    [hashed, email]
  );
  return result.affectedRows > 0;
}

export async function updateUsername(email, newUsername) {
  const [result] = await query(
    'UPDATE `user` SET username = ? WHERE email = ?',
    [newUsername, email]
  );
  return result.affectedRows > 0;
}

export async function updateImage(email, imageUrl) {
  const [result] = await query(
    'UPDATE `user` SET image = ? WHERE email = ?',
    [imageUrl, email]
  );
  return result.affectedRows > 0;
}

export async function deleteByEmail(email) {
  const [result] = await query(
    'DELETE FROM `user` WHERE email = ?',
    [email]
  );
  return result.affectedRows > 0;
}
