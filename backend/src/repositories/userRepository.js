const pool = require('../config/db');

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function create(client, { email, passwordHash, name }) {
  const { rows } = await client.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING user_id, email, name, created_at`,
    [email, passwordHash, name]
  );
  return rows[0];
}

async function findById(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
}

async function updateName(userId, name) {
  const { rows } = await pool.query(
    `UPDATE users SET name = $1, updated_at = NOW()
     WHERE user_id = $2
     RETURNING user_id, email, name, updated_at`,
    [name, userId]
  );
  return rows[0] || null;
}

async function updatePassword(userId, passwordHash) {
  const { rows } = await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW()
     WHERE user_id = $2
     RETURNING user_id, email, name, updated_at`,
    [passwordHash, userId]
  );
  return rows[0] || null;
}

async function withdraw(userId) {
  await pool.query(
    `UPDATE users SET status = 'withdrawn', withdrawn_at = NOW()
     WHERE user_id = $1`,
    [userId]
  );
}

module.exports = { findByEmail, create, findById, updateName, updatePassword, withdraw };
