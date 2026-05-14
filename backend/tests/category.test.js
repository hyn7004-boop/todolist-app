require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

jest.mock('../src/config/db');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function makeToken(payload = {}) {
  return jwt.sign(
    { user_id: 'user-uuid-1', status: 'active', ...payload },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
}

const sampleCategories = [
  { category_id: 'cat-uuid-1', name: '일반', is_default: true, created_at: '2026-05-13T10:00:00.000Z' },
  { category_id: 'cat-uuid-2', name: '업무', is_default: true, created_at: '2026-05-13T10:00:00.000Z' },
  { category_id: 'cat-uuid-3', name: '개인', is_default: true, created_at: '2026-05-13T10:00:00.000Z' },
];

describe('GET /api/v1/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('카테고리 목록 조회 성공 - HTTP 200 + 배열 반환', async () => {
    const token = makeToken();
    pool.query.mockResolvedValue({ rows: sampleCategories });

    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].name).toBe('일반');
  });

  it('카테고리 없는 경우 빈 배열 반환 - HTTP 200', async () => {
    const token = makeToken();
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('토큰 없음 - HTTP 401', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('카테고리 생성 성공 - HTTP 201 + 생성된 카테고리 반환', async () => {
    const token = makeToken();
    const newCategory = {
      category_id: 'cat-uuid-new',
      name: '사이드 프로젝트',
      is_default: false,
      created_at: '2026-05-13T12:00:00.000Z',
    };
    pool.query.mockResolvedValue({ rows: [newCategory] });

    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '사이드 프로젝트' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('사이드 프로젝트');
    expect(res.body.data.is_default).toBe(false);
    expect(res.body.data.category_id).toBeDefined();
  });

  it('이름 누락 - HTTP 400 + MISSING_REQUIRED_FIELD', async () => {
    const token = makeToken();

    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('이름 50자 초과 - HTTP 400 + NAME_TOO_LONG', async () => {
    const token = makeToken();

    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'a'.repeat(51) });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NAME_TOO_LONG');
  });

  it('이름 중복 (UNIQUE INDEX 위반) - HTTP 409 + DUPLICATE_CATEGORY_NAME', async () => {
    const token = makeToken();
    const pgUniqueError = new Error('duplicate key value violates unique constraint');
    pgUniqueError.code = '23505';
    pool.query.mockRejectedValue(pgUniqueError);

    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '일반' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_CATEGORY_NAME');
  });

  it('토큰 없음 - HTTP 401', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: '테스트' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/v1/categories/:categoryId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('카테고리 삭제 성공 - HTTP 204', async () => {
    const token = makeToken();
    const customCategory = { category_id: 'cat-uuid-custom', name: '사이드 프로젝트', is_default: false, created_at: '2026-05-13T12:00:00.000Z' };

    pool.query
      .mockResolvedValueOnce({ rows: [customCategory] }) // findById
      .mockResolvedValueOnce({ rows: [{ cnt: '0' }] })   // hasTodos
      .mockResolvedValueOnce({ rows: [] });               // deleteById

    const res = await request(app)
      .delete('/api/v1/categories/cat-uuid-custom')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('존재하지 않는 카테고리 - HTTP 404 + CATEGORY_NOT_FOUND', async () => {
    const token = makeToken();
    pool.query.mockResolvedValue({ rows: [] }); // findById → null

    const res = await request(app)
      .delete('/api/v1/categories/nonexistent-uuid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('기본 카테고리 삭제 시도 - HTTP 400 + DEFAULT_CATEGORY_NOT_DELETABLE', async () => {
    const token = makeToken();
    const defaultCat = { category_id: 'cat-uuid-1', name: '일반', is_default: true, created_at: '2026-05-13T10:00:00.000Z' };
    pool.query.mockResolvedValue({ rows: [defaultCat] }); // findById → default category

    const res = await request(app)
      .delete('/api/v1/categories/cat-uuid-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DEFAULT_CATEGORY_NOT_DELETABLE');
  });

  it('할일 연결된 카테고리 삭제 시도 - HTTP 409 + CATEGORY_HAS_TODOS', async () => {
    const token = makeToken();
    const customCategory = { category_id: 'cat-uuid-custom', name: '사이드 프로젝트', is_default: false, created_at: '2026-05-13T12:00:00.000Z' };

    pool.query
      .mockResolvedValueOnce({ rows: [customCategory] }) // findById
      .mockResolvedValueOnce({ rows: [{ cnt: '3' }] });  // hasTodos → 3개

    const res = await request(app)
      .delete('/api/v1/categories/cat-uuid-custom')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CATEGORY_HAS_TODOS');
  });

  it('타인 소유 카테고리 (findById null 반환) - HTTP 404 + CATEGORY_NOT_FOUND', async () => {
    const token = makeToken();
    pool.query.mockResolvedValue({ rows: [] }); // findById → null (user_id 불일치)

    const res = await request(app)
      .delete('/api/v1/categories/other-user-cat')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('토큰 없음 - HTTP 401', async () => {
    const res = await request(app).delete('/api/v1/categories/cat-uuid-1');
    expect(res.status).toBe(401);
  });
});
