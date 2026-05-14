const pool = require('../config/db');

/**
 * todoRepository.js
 */

const create = async (userId, { title, categoryId, dueDate, description }) => {
  console.log(`[TODO:REPO] INSERT todos - user_id: ${userId}, category_id: ${categoryId}`);
  const query = `
    INSERT INTO todos (user_id, category_id, title, description, due_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [userId, categoryId, title, description, dueDate];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const findById = async (todoId, userId) => {
  const query = `
    SELECT * FROM todos
    WHERE todo_id = $1 AND user_id = $2
  `;
  const { rows } = await pool.query(query, [todoId, userId]);
  return rows[0] || null;
};

const findAllByUserId = async (userId, filters = {}) => {
  console.log(`[TODO:REPO] SELECT todos - user_id: ${userId}, filters: ${JSON.stringify(filters)}`);
  const { category_id, due_date_from, due_date_to, is_completed } = filters;
  let query = 'SELECT * FROM todos WHERE user_id = $1';
  const values = [userId];
  let paramIndex = 2;

  if (category_id) {
    query += ` AND category_id = $${paramIndex++}`;
    values.push(category_id);
  }

  if (due_date_from) {
    query += ` AND due_date >= $${paramIndex++}`;
    values.push(due_date_from);
  }

  if (due_date_to) {
    query += ` AND due_date <= $${paramIndex++}`;
    values.push(due_date_to);
  }

  if (is_completed !== undefined) {
    query += ` AND is_completed = $${paramIndex++}`;
    values.push(is_completed === 'true' || is_completed === true);
  }

  query += ' ORDER BY due_date ASC, created_at DESC';

  const { rows } = await pool.query(query, values);
  return rows;
};

const update = async (todoId, fields) => {
  console.log(`[TODO:REPO] UPDATE todos - todo_id: ${todoId}, fields: ${Object.keys(fields).join(', ')}`);
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  Object.entries(fields).forEach(([key, value]) => {
    setClauses.push(`${key} = $${paramIndex++}`);
    values.push(value);
  });

  if (setClauses.length === 0) return null;

  values.push(todoId);
  const query = `
    UPDATE todos
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE todo_id = $${paramIndex}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteById = async (todoId) => {
  console.log(`[TODO:REPO] DELETE todos - todo_id: ${todoId}`);
  const query = 'DELETE FROM todos WHERE todo_id = $1';
  await pool.query(query, [todoId]);
};

const toggleCompleted = async (todoId, currentValue) => {
  console.log(`[TODO:REPO] TOGGLE todos.is_completed - todo_id: ${todoId}, ${currentValue} → ${!currentValue}`);
  const query = `
    UPDATE todos
    SET is_completed = $1, updated_at = NOW()
    WHERE todo_id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [!currentValue, todoId]);
  return rows[0];
};

module.exports = {
  create,
  findById,
  findAllByUserId,
  update,
  deleteById,
  toggleCompleted,
};
