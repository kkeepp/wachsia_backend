import { query } from '../db_config/db_manager.js';

export async function findProductByBarcode(barcode) {
  const [rows] = await query('SELECT * FROM product WHERE barcode = ?', [barcode]);
  return rows[0] || null;
}

export async function scanProduct(userId, barcode) {
  const product = await findProductByBarcode(barcode);
  if (!product) return { error: 'Product not found' };

  await query('INSERT INTO scan_history (user_id, barcode) VALUES (?, ?)', [userId, barcode]);
  await query('UPDATE `user` SET point = point + ? WHERE id = ?', [product.eco_point, userId]);

  const [userRows] = await query('SELECT point FROM `user` WHERE id = ?', [userId]);
  return { product, points: userRows[0].point };
}

export async function getScanHistory(userId) {
  const [rows] = await query(
    `SELECT sh.id, sh.scanned_date, p.barcode, p.product_name, p.image, p.eco_grade, p.eco_point
     FROM scan_history sh JOIN product p ON sh.barcode = p.barcode
     WHERE sh.user_id = ? ORDER BY sh.scanned_date DESC`,
    [userId]
  );
  return rows;
}

export async function getMonthlySummary(userId, year, month) {
  const [rows] = await query(
    `SELECT DAY(sh.scanned_date) AS day, COUNT(*) AS scan_count, SUM(p.eco_point) AS total_points
     FROM scan_history sh JOIN product p ON sh.barcode = p.barcode
     WHERE sh.user_id = ? AND YEAR(sh.scanned_date) = ? AND MONTH(sh.scanned_date) = ?
     GROUP BY DAY(sh.scanned_date) ORDER BY day`,
    [userId, year, month]
  );
  return rows;
}

export async function getDailyDetail(userId, year, month, day) {
  const [rows] = await query(
    `SELECT sh.id, sh.scanned_date, p.barcode, p.product_name, p.image, p.eco_grade, p.eco_point
     FROM scan_history sh JOIN product p ON sh.barcode = p.barcode
     WHERE sh.user_id = ? AND YEAR(sh.scanned_date) = ? AND MONTH(sh.scanned_date) = ? AND DAY(sh.scanned_date) = ?
     ORDER BY sh.scanned_date DESC`,
    [userId, year, month, day]
  );
  return rows;
}
