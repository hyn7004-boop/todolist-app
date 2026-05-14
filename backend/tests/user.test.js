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

const activeUser = {
  user_id: 'user-uuid-1',
  email: 'user@example.com',
  name: '홍길동',
  password_hash: 'hashed-pw',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('PATCH /api/v1/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('이름 변경 성공 - HTTP 200 + 수정된 사용자 정보', async () => {
    const token = makeToken();
    const updatedUser = { ...activeUser, name: '김철수', updated_at: new Date().toISOString() };

    pool.query
      .mockResolvedValueOnce({ rows: [activeUser] }) // findById
      .mockResolvedValueOnce({ rows: [{ user_id: 'user-uuid-1', email: 'user@example.com', name: '김철수', updated_at: updatedUser.updated_at }] }); // updateName

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '김철수' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('김철수');
    expect(res.body.data.user_id).toBe('user-uuid-1');
  });

  it('이름 50자 초과 - HTTP 400 + NAME_TOO_LONG', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [activeUser] }); // findById

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'a'.repeat(51) });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NAME_TOO_LONG');
  });

  it('비밀번호 변경 성공 - HTTP 200 + 수정된 사용자 정보', async () => {
    const token = makeToken();
    const updatedUser = { user_id: 'user-uuid-1', email: 'user@example.com', name: '홍길동', updated_at: new Date().toISOString() };

    pool.query
      .mockResolvedValueOnce({ rows: [activeUser] }) // findById
      .mockResolvedValueOnce({ rows: [updatedUser] }); // updatePassword

    bcrypt.compare = jest.fn().mockResolvedValue(true);
    bcrypt.hash = jest.fn().mockResolvedValue('new-hashed-pw');

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'pass1234', new_password: 'newPass99' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user_id).toBe('user-uuid-1');
  });

  it('현재 비밀번호 불일치 - HTTP 401 + WRONG_CURRENT_PASSWORD', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [activeUser] }); // findById
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'wrongpw1', new_password: 'newPass99' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('WRONG_CURRENT_PASSWORD');
  });

  it('신규 비밀번호 정책 위반 (7자) - HTTP 400 + INVALID_PASSWORD', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [activeUser] }); // findById
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'pass1234', new_password: 'abc123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  it('신규 비밀번호 정책 위반 (숫자 없음) - HTTP 400 + INVALID_PASSWORD', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [activeUser] }); // findById
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ current_password: 'pass1234', new_password: 'password' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  it('new_password만 있고 current_password 없음 - HTTP 400 + MISSING_REQUIRED_FIELD', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [activeUser] }); // findById

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ new_password: 'newPass99' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('토큰 없음 - HTTP 401', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .send({ name: '김철수' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('이름과 비밀번호 동시 변경 - 이름 먼저, 비밀번호 후 처리', async () => {
    const token = makeToken();
    const updatedAfterName = { user_id: 'user-uuid-1', email: 'user@example.com', name: '김철수', updated_at: new Date().toISOString() };
    const updatedAfterPw = { user_id: 'user-uuid-1', email: 'user@example.com', name: '김철수', updated_at: new Date().toISOString() };

    pool.query
      .mockResolvedValueOnce({ rows: [activeUser] }) // findById
      .mockResolvedValueOnce({ rows: [updatedAfterName] }) // updateName
      .mockResolvedValueOnce({ rows: [updatedAfterPw] }); // updatePassword

    bcrypt.compare = jest.fn().mockResolvedValue(true);
    bcrypt.hash = jest.fn().mockResolvedValue('new-hashed-pw');

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '김철수', current_password: 'pass1234', new_password: 'newPass99' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('DELETE /api/v1/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('회원 탈퇴 성공 - HTTP 200 + null', async () => {
    const token = makeToken();
    pool.query
      .mockResolvedValueOnce({ rows: [activeUser] }) // findById - active 상태 확인
      .mockResolvedValueOnce({ rows: [] });          // withdraw UPDATE

    const res = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it('탈퇴 후 withdrawn 토큰으로 보호 API 접근 시 401', async () => {
    const withdrawnToken = makeToken({ status: 'withdrawn' });

    const res = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${withdrawnToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('토큰 없음 - HTTP 401', async () => {
    const res = await request(app).delete('/api/v1/users/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('withdraw 쿼리가 실행됨을 확인', async () => {
    const token = makeToken();
    pool.query
      .mockResolvedValueOnce({ rows: [activeUser] }) // findById
      .mockResolvedValueOnce({ rows: [] });          // withdraw UPDATE

    await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('withdrawn'),
      ['user-uuid-1']
    );
  });

  it('이미 탈퇴된 계정 재탈퇴 시도 - HTTP 400 + ALREADY_WITHDRAWN', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [{ ...activeUser, status: 'withdrawn' }] }); // findById - withdrawn 상태

    const res = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_WITHDRAWN');
  });
});
