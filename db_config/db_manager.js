import mysql from 'mysql2/promise';
import logger from '../logger.js';

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });
  }
  return pool;
}

export async function testConnection() {
  const connection = await getPool().getConnection();
  logger.info('Connected to MySQL on port %d', Number(process.env.DB_PORT));
  connection.release();
}

export async function healthCheck() {
  const connection = await getPool().getConnection();
  await connection.ping();
  connection.release();
  return true;
}

export function query(sql, params) {
  return getPool().execute(sql, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}
