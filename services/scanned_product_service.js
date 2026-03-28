import { query } from '../db_config/db_manager.js';

export async function getMonthlyScans(userId, year, month) {
  const [rows] = await query(
    `SELECT DAY(scan_date) AS day, SUM(eco_point) AS total_points
     FROM scannedProduct
     WHERE scanner_id = ? AND YEAR(scan_date) = ? AND MONTH(scan_date) = ?
     GROUP BY DAY(scan_date)
     ORDER BY day`,
    [userId, year, month]
  );
  return rows;
}

export async function getDailyScans(userId, year, month, day) {
  const [rows] = await query(
    `SELECT product_name, image, eco_score, eco_point, scan_date
     FROM scannedProduct
     WHERE scanner_id = ? AND YEAR(scan_date) = ? AND MONTH(scan_date) = ? AND DAY(scan_date) = ?
     ORDER BY scan_date DESC`,
    [userId, year, month, day]
  );
  return rows;
}

export async function collectScore(userId, productName, image, ecoScore, ecoPoint) {
  // Check if already collected today for this product
  const [existing] = await query(
    `SELECT 1 FROM scannedProduct
     WHERE scanner_id = ? AND product_name = ? AND DATE(scan_date) = CURDATE()
     LIMIT 1`,
    [userId, productName]
  );
  if (existing.length > 0) return { error: 'Already collected today' };

  await query(
    `INSERT INTO scannedProduct (scanner_id, product_name, scan_date, image, eco_score, eco_point)
     VALUES (?, ?, NOW(), ?, ?, ?)`,
    [userId, productName, image, ecoScore, ecoPoint]
  );

  // Add points to user
  await query('UPDATE `user` SET point = point + ? WHERE id = ?', [ecoPoint, userId]);

  const [userRows] = await query('SELECT point FROM `user` WHERE id = ?', [userId]);
  return { points: userRows[0].point };
}
