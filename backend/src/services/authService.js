const jwt = require('jsonwebtoken');
const env = require('../config/env');
const pool = require('../config/db');
const ERROR_CODES = require('../constants/errorCodes');
const { hash, compare } = require('../utils/passwordUtils');
const { isValidPassword } = require('../utils/validators');
const userRepository = require('../repositories/userRepository');
const categoryRepository = require('../repositories/categoryRepository');

function buildError(message, code, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

async function signup(email, password, name) {
  if (!email || !password || !name) {
    throw buildError('필수 입력값이 누락되었습니다.', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
  }

  if (!isValidPassword(password)) {
    throw buildError(
      '비밀번호는 8자 이상이며 영문과 숫자를 각각 1자 이상 포함해야 합니다.',
      ERROR_CODES.INVALID_PASSWORD,
      400
    );
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw buildError('이미 사용 중인 이메일입니다.', ERROR_CODES.DUPLICATE_EMAIL, 409);
  }

  const passwordHash = await hash(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const user = await userRepository.create(client, { email, passwordHash, name });
    await categoryRepository.createDefaults(client, user.user_id);

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function login(email, password) {
  if (!email || !password) {
    throw buildError('필수 입력값이 누락되었습니다.', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
  }

  const user = await userRepository.findByEmail(email);

  // 미존재 계정과 탈퇴 계정 모두 동일한 에러로 응답해 정보 노출 방지
  if (!user || user.status === 'withdrawn') {
    throw buildError('이메일 또는 비밀번호가 올바르지 않습니다.', ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  const passwordMatch = await compare(password, user.password_hash);
  if (!passwordMatch) {
    throw buildError('이메일 또는 비밀번호가 올바르지 않습니다.', ERROR_CODES.INVALID_CREDENTIALS, 401);
  }

  const token = jwt.sign(
    { user_id: user.user_id, status: user.status },
    env.jwt.secret,
    { algorithm: 'HS256', expiresIn: env.jwt.expiresIn }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    },
  };
}

function logout() {
  return null;
}

module.exports = { signup, login, logout };
