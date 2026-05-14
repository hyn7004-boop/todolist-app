require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

jest.mock('../src/config/db');
jest.mock('bcrypt');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function makeToken(payload = {}) {
  return jwt.sign(
    { user_id: 'user-uuid-1', status: 'active', ...payload },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
}

describe('POST /api/v1/auth/signup', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);
    pool.query = jest.fn();
  });

  it('성공 - HTTP 201 + user 데이터 반환', async () => {
    const userData = {
      user_id: 'user-uuid-1',
      email: 'new@example.com',
      name: '홍길동',
      created_at: new Date().toISOString(),
    };

    bcrypt.hash = jest.fn().mockResolvedValue('hashed-pw');
    pool.query.mockResolvedValue({ rows: [] }); // findByEmail → 없음

    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [userData] }) // INSERT users
      .mockResolvedValueOnce({}) // INSERT category 일반
      .mockResolvedValueOnce({}) // INSERT category 업무
      .mockResolvedValueOnce({}) // INSERT category 개인
      .mockResolvedValueOnce({}); // COMMIT

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'new@example.com', password: 'pass1234', name: '홍길동' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user_id).toBe('user-uuid-1');
    expect(res.body.data.email).toBe('new@example.com');
    expect(res.body.data.name).toBe('홍길동');
    expect(res.body.data.created_at).toBeDefined();
  });

  it('필수 필드 누락 (email 없음) - HTTP 400 + MISSING_REQUIRED_FIELD', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ password: 'pass1234', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('필수 필드 누락 (password 없음) - HTTP 400 + MISSING_REQUIRED_FIELD', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'new@example.com', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('필수 필드 누락 (name 없음) - HTTP 400 + MISSING_REQUIRED_FIELD', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'new@example.com', password: 'pass1234' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('비밀번호 정책 위반 (7자) - HTTP 400 + INVALID_PASSWORD', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'new@example.com', password: 'pass123', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  it('비밀번호 정책 위반 (숫자 없음) - HTTP 400 + INVALID_PASSWORD', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'new@example.com', password: 'password', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  it('비밀번호 정책 위반 (영문 없음) - HTTP 400 + INVALID_PASSWORD', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'new@example.com', password: '12345678', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  it('이메일 중복 (active) - HTTP 409 + DUPLICATE_EMAIL', async () => {
    pool.query.mockResolvedValue({
      rows: [{ user_id: 'existing-uuid', email: 'dup@example.com', status: 'active' }],
    });

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'dup@example.com', password: 'pass1234', name: '홍길동' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('이메일 중복 (withdrawn) - HTTP 409 + DUPLICATE_EMAIL', async () => {
    pool.query.mockResolvedValue({
      rows: [{ user_id: 'withdrawn-uuid', email: 'dup@example.com', status: 'withdrawn' }],
    });

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'dup@example.com', password: 'pass1234', name: '홍길동' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('트랜잭션 실패 시 ROLLBACK 호출', async () => {
    bcrypt.hash = jest.fn().mockResolvedValue('hashed-pw');
    pool.query.mockResolvedValue({ rows: [] });

    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce(new Error('DB error')); // INSERT users 실패

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'new@example.com', password: 'pass1234', name: '홍길동' });

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('성공 - HTTP 200 + token, user 반환', async () => {
    const userRow = {
      user_id: 'user-uuid-1',
      email: 'user@example.com',
      name: '홍길동',
      password_hash: 'hashed-pw',
      status: 'active',
    };
    pool.query.mockResolvedValue({ rows: [userRow] });
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'pass1234' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.user_id).toBe('user-uuid-1');
    expect(res.body.data.user.email).toBe('user@example.com');
    expect(res.body.data.user.name).toBe('홍길동');
  });

  it('JWT 토큰 페이로드에 user_id, status 포함', async () => {
    const userRow = {
      user_id: 'user-uuid-1',
      email: 'user@example.com',
      name: '홍길동',
      password_hash: 'hashed-pw',
      status: 'active',
    };
    pool.query.mockResolvedValue({ rows: [userRow] });
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'pass1234' });

    const decoded = jwt.verify(res.body.data.token, JWT_SECRET);
    expect(decoded.user_id).toBe('user-uuid-1');
    expect(decoded.status).toBe('active');
  });

  it('필수 필드 누락 (email 없음) - HTTP 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'pass1234' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('필수 필드 누락 (password 없음) - HTTP 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('이메일 미존재 - HTTP 401 + INVALID_CREDENTIALS', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nouser@example.com', password: 'pass1234' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('비밀번호 불일치 - HTTP 401 + INVALID_CREDENTIALS', async () => {
    pool.query.mockResolvedValue({
      rows: [{ user_id: 'uuid', email: 'user@example.com', name: '홍길동', password_hash: 'hashed', status: 'active' }],
    });
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpw1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('탈퇴 계정 로그인 시도 - HTTP 401 + INVALID_CREDENTIALS', async () => {
    pool.query.mockResolvedValue({
      rows: [{ user_id: 'uuid', email: 'user@example.com', name: '홍길동', password_hash: 'hashed', status: 'withdrawn' }],
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'pass1234' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('성공 - HTTP 200 + null 반환', async () => {
    const token = makeToken();

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it('토큰 없음 - HTTP 401', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('만료된 토큰 - HTTP 401', async () => {
    const expiredToken = jwt.sign(
      { user_id: 'user-uuid-1', status: 'active' },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '-1s' }
    );

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
