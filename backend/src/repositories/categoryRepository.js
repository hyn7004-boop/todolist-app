const pool = require('../config/db');

const DEFAULT_CATEGORIES = ['일반', '업무', '개인'];

async function createDefaults(client, userId) {
  for (const name of DEFAULT_CATEGORIES) {
    await client.query(
      `INSERT INTO categories (user_id, name, is_default)
       VALUES ($1, $2, true)`,
      [userId, name]
    );
  }
}

async function findAllByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT category_id, name, is_default, created_at
     FROM categories WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );
  return rows;
}

async function findById(categoryId, userId) {
  const { rows } = await pool.query(
    `SELECT category_id, name, is_default, created_at
     FROM categories WHERE category_id = $1 AND user_id = $2`,
    [categoryId, userId]
  );
  return rows[0] || null;
}

async function create(userId, name) {
  const { rows } = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, false)
     RETURNING category_id, name, is_default, created_at`,
    [userId, name]
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
