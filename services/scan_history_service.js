import { query } from '../db_config/db_manager.js';

const OFF_API = 'https://world.openfoodfacts.net/api/v2/product';

function gradeFromScore(score) {
  if (score >= 76) return 'a';
  if (score >= 56) return 'b';
  if (score >= 36) return 'c';
  if (score >= 16) return 'd';
  return 'e';
}

async function fetchFromOpenFoodFacts(barcode) {
  try {
    const res = await fetch(
      `${OFF_API}/${barcode}?fields=product_name,image_front_url,ecoscore_score,ecoscore_grade`,
      { headers: { 'User-Agent': 'Wachsia/1.0' } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    const score = p.ecoscore_score ?? 0;
    const grade = p.ecoscore_grade || gradeFromScore(score);
    const point = Math.max(score, 0);

    return {
      barcode,
      product_name: p.product_name || 'Unknown Product',
      image: p.image_front_url || null,
      eco_grade: grade,
      eco_point: point,
    };
  } catch {
    return null;
  }
}

export async function findProductByBarcode(barcode) {
  const [rows] = await query('SELECT * FROM product WHERE barcode = ?', [barcode]);
  return rows[0] || null;
}

async function findOrCreateProduct(barcode) {
  let product = await findProductByBarcode(barcode);
  if (product) return product;

  const offProduct = await fetchFromOpenFoodFacts(barcode);
  if (!offProduct) return null;

  await query(
    'INSERT INTO product (barcode, product_name, image, eco_grade, eco_point) VALUES (?, ?, ?, ?, ?)',
    [offProduct.barcode, offProduct.product_name, offProduct.image, offProduct.eco_grade, offProduct.eco_point]
  );
  return offProduct;
}

export async function scanProduct(userId, barcode) {
  const product = await findOrCreateProduct(barcode);
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
