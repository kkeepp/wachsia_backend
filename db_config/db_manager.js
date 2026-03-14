import mysql from 'mysql2/promise'; // Use the promise wrapper
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool (better for performance than a single connection)
const pool = mysql.createPool({
  host: 'localhost',
  port: 3308,
  user: 'wachsiausr',
  password: 'E9rJ3W7N',
  database: 'wachsia_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL successfully on port 3308!');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}

testConnection();

export function query(sql, params) {
  return pool.execute(sql, params);
}