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

const sampleTodo = {
  todo_id: 'todo-uuid-1',
  user_id: 'user-uuid-1',
  category_id: 'cat-uuid-1',
  title: '테스트 할일',
  description: '테스트 설명',
  due_date: '2026-05-20',
  is_completed: false,
  created_at: '2026-05-13T10:00:00.000Z',
  updated_at: '2026-05-13T10:00:00.000Z',
};

describe('POST /api/v1/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('할일 등록 성공 - HTTP 201', async () => {
    const token = makeToken();
    // 카테고리 소유권 확인 mock
    pool.query.mockResolvedValueOnce({ rows: [{ category_id: 'cat-uuid-1' }] });
    // 할일 생성 mock
    pool.query.mockResolvedValueOnce({ rows: [sampleTodo] });

    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '테스트 할일',
        category_id: 'cat-uuid-1',
        due_date: '2026-05-20',
        description: '테스트 설명',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('테스트 할일');
  });

  it('제목 누락 - HTTP 400 + INVALID_TITLE', async () => {
    const token = makeToken();
    // 카테고리 소유권 확인 mock (제목 체크 전 호출됨)
    pool.query.mockResolvedValueOnce({ rows: [{ category_id: 'cat-uuid-1' }] });

    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category_id: 'cat-uuid-1',
        due_date: '2026-05-20',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TITLE');
  });

  it('제목 공백 - HTTP 400 + INVALID_TITLE', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [{ category_id: 'cat-uuid-1' }] });

    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '   ',
        category_id: 'cat-uuid-1',
        due_date: '2026-05-20',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TITLE');
  });

  it('제목 200자 초과 - HTTP 400 + INVALID_TITLE', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [{ category_id: 'cat-uuid-1' }] });

    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'a'.repeat(201),
        category_id: 'cat-uuid-1',
        due_date: '2026-05-20',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TITLE');
  });

  it('과거 날짜 - HTTP 400 + INVALID_DUE_DATE', async () => {
    const token = makeToken();
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '테스트',
        category_id: 'cat-uuid-1',
        due_date: '2020-01-01',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DUE_DATE');
  });

  it('유효하지 않은 카테고리 (타인 소유 등) - HTTP 400 + INVALID_CATEGORY', async () => {
    const token = makeToken();
    // 카테고리 조회 시 결과 없음 mock
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '테스트',
        category_id: 'other-cat-uuid',
        due_date: '2026-05-20',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_CATEGORY');
  });
});

describe('PATCH /api/v1/todos/:todoId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('할일 수정 성공 - HTTP 200', async () => {
    const token = makeToken();
    // 존재 확인 mock
    pool.query.mockResolvedValueOnce({ rows: [sampleTodo] });
    // 업데이트 mock
    pool.query.mockResolvedValueOnce({ rows: [{ ...sampleTodo, title: '수정된 제목' }] });

    const res = await request(app)
      .patch('/api/v1/todos/todo-uuid-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '수정된 제목' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('수정된 제목');
  });

  it('수정 시 유효하지 않은 날짜 - HTTP 400', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [sampleTodo] });

    const res = await request(app)
      .patch('/api/v1/todos/todo-uuid-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ due_date: '2020-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DUE_DATE');
  });

  it('수정 시 유효하지 않은 카테고리 - HTTP 400', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [sampleTodo] });
    pool.query.mockResolvedValueOnce({ rows: [] }); // category not found

    const res = await request(app)
      .patch('/api/v1/todos/todo-uuid-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ category_id: 'invalid-cat' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_CATEGORY');
  });

  it('존재하지 않는 할일 - HTTP 404 + TODO_NOT_FOUND', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch('/api/v1/todos/nonexistent')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '수정' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('TODO_NOT_FOUND');
  });
});

describe('DELETE /api/v1/todos/:todoId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('할일 삭제 성공 - HTTP 204', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [sampleTodo] }); // findById
    pool.query.mockResolvedValueOnce({ rows: [] });          // delete

    const res = await request(app)
      .delete('/api/v1/todos/todo-uuid-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});

describe('PATCH /api/v1/todos/:todoId/toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('할일 토글 성공 - HTTP 200', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [sampleTodo] }); // findById
    pool.query.mockResolvedValueOnce({ rows: [{ ...sampleTodo, is_completed: true }] }); // toggle

    const res = await request(app)
      .patch('/api/v1/todos/todo-uuid-1/toggle')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.is_completed).toBe(true);
  });
});

describe('GET /api/v1/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pool.query = jest.fn();
  });

  it('할일 목록 조회 성공 - HTTP 200', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [sampleTodo] });

    const res = await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('필터 적용 조회 - HTTP 200', async () => {
    const token = makeToken();
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/v1/todos?is_completed=true&category_id=cat-uuid-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('is_completed = $'),
      expect.arrayContaining(['user-uuid-1', true, 'cat-uuid-1'])
    );
  });

  it('날짜 형식 오류 - HTTP 400 + INVALID_DATE_FORMAT', async () => {
    const token = makeToken();
    const res = await request(app)
      .get('/api/v1/todos?due_date_from=invalid-date')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE_FORMAT');
  });

  it('날짜 범위 오류 - HTTP 400 + INVALID_DATE_RANGE', async () => {
    const token = makeToken();
    const res = await request(app)
      .get('/api/v1/todos?due_date_from=2026-05-31&due_date_to=2026-05-01')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE_RANGE');
  });
});
