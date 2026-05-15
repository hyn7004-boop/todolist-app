const pool = require('../config/db');

const DEFAULT_CATEGORIES = [
  { name_ko: '일반', name_en: 'General', name_zh: '一般' },
  { name_ko: '업무', name_en: 'Work',    name_zh: '工作' },
  { name_ko: '개인', name_en: 'Personal',name_zh: '个人' },
];

async function createDefaults(client, userId) {
  for (const cat of DEFAULT_CATEGORIES) {
    await client.query(
      `INSERT INTO categories (user_id, name, name_ko, name_en, name_zh, is_default)
       VALUES ($1, $2, $2, $3, $4, true)`,
      [userId, cat.name_ko, cat.name_en, cat.name_zh]
    );
  }
}

async function findAllByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT category_id, name_ko, name_en, name_zh, is_default, created_at
     FROM categories WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );
  return rows;
}

async function findById(categoryId, userId) {
  const { rows } = await pool.query(
    `SELECT category_id, name_ko, name_en, name_zh, is_default, created_at
     FROM categories WHERE category_id = $1 AND user_id = $2`,
    [categoryId, userId]
  );
  return rows[0] || null;
}

async function create(userId, name_ko, name_en, name_zh) {
  const { rows } = await pool.query(
    `INSERT INTO categories (user_id, name, name_ko, name_en, name_zh, is_default)
     VALUES ($1, $2, $2, $3, $4, false)
     RETURNING category_id, name_ko, name_en, name_zh, is_default, created_at`,
    [userId, name_ko, name_en || null, name_zh || null]
  );
  return rows[0];
}

async function deleteById(categoryId) {
  await pool.query('DELETE FROM categories WHERE category_id = $1', [categoryId]);
}

async function hasTodos(categoryId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) AS cnt FROM todos WHERE category_id = $1',
    [categoryId]
  );
  return parseInt(rows[0].cnt, 10) > 0;
}

module.exports = { createDefaults, findAllByUserId, findById, create, deleteById, hasTodos };
