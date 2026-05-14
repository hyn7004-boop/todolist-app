require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

jest.mock('../src/config/db');
jest.mock('bcrypt');

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Backend Integration Test (UC-01 ~ UC-12)', () => {
  let mockClient;
  let authToken;
  const userUuid = '550e8400-e29b-41d4-a716-446655440000';
  const categoryUuid = 'cat-uuid-1234';
  const todoUuid = 'todo-uuid-5678';
  const testUser = {
    email: 'integration@test.com',
    password: 'Password123!',
    name: 'Integration Tester'
  };

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);
    pool.query = jest.fn();
  });

  // 1. Signup (UC-01)
  it('UC-01: 회원가입 성공 및 기본 카테고리 생성 확인', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // findByEmail
    bcrypt.hash = jest.fn().mockResolvedValue('hashed_password');
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ user_id: userUuid, email: testUser.email, name: testUser.name, created_at: new Date().toISOString() }] }) // INSERT user
      .mockResolvedValueOnce({}) // INSERT cat 1
      .mockResolvedValueOnce({}) // INSERT cat 2
      .mockResolvedValueOnce({}) // INSERT cat 3
      .mockResolvedValueOnce({}); // COMMIT

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
  });

  // 2. Duplicate Signup (UC-01)
  it('UC-01: 중복 가입 시도 -> 409 DUPLICATE_EMAIL', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 'existing', email: testUser.email }] });

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  // 3. Login (UC-02)
  it('UC-02: 로그인 성공 및 토큰 발급 확인', async () => {
    pool.query.mockResolvedValueOnce({ 
      rows: [{ 
        user_id: userUuid, 
        email: testUser.email, 
        password_hash: 'hashed_password', 
        name: testUser.name, 
        status: 'active' 
      }] 
    });
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  // 4. Logout (UC-03)
  it('UC-03: 로그아웃 성공 응답 확인', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 5. Update User (UC-04)
  it('UC-04: 개인정보 수정 (이름 변경 및 비밀번호 변경)', async () => {
    // authToken is used from previous test if using a single token, 
    // but authToken is assigned in a different `it` block. 
    // To make them truly independent, I should generate a token here.
    const token = jwt.sign({ user_id: userUuid, status: 'active' }, JWT_SECRET);

    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: userUuid, password_hash: 'hashed_password', status: 'active' }] }) // findById
      .mockResolvedValueOnce({ rows: [{ user_id: userUuid, email: testUser.email, name: 'Updated Name', updated_at: new Date().toISOString() }] }) // updateName
      .mockResolvedValueOnce({ rows: [{ user_id: userUuid, email: testUser.email, name: 'Updated Name', updated_at: new Date().toISOString() }] }); // updatePassword

    bcrypt.compare = jest.fn().mockResolvedValue(true);
    bcrypt.hash = jest.fn().mockResolvedValue('new_hashed_password');

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        name: 'Updated Name', 
        current_password: testUser.password, 
        new_password: 'NewPassword123!' 
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  // 6. Category Management (UC-06, UC-07)
  it('UC-06, UC-07: 카테고리 관리 (추가, 목록 조회, 삭제)', async () => {
    const token = jwt.sign({ user_id: userUuid, status: 'active' }, JWT_SECRET);

    // Add (UC-06)
    pool.query.mockResolvedValueOnce({ rows: [{ category_id: categoryUuid, name: 'New Category', is_default: false }] });
    const addRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Category' });
    expect(addRes.status).toBe(201);

    // List
    pool.query.mockResolvedValueOnce({ rows: [{ category_id: categoryUuid, name: 'New Category', is_default: false }] });
    const listRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data[0].category_id).toBe(categoryUuid);

    // Delete (UC-07) - Normal success
    pool.query
      .mockResolvedValueOnce({ rows: [{ category_id: categoryUuid, is_default: false, user_id: userUuid }] }) // findById
      .mockResolvedValueOnce({ rows: [{ cnt: '0' }] }) // hasTodos
      .mockResolvedValueOnce({ rows: [] }); // deleteById
    const delRes = await request(app)
      .delete(`/api/v1/categories/${categoryUuid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(204);

    // Delete Failure - Default category
    pool.query.mockResolvedValueOnce({ rows: [{ category_id: 'default-cat', is_default: true, user_id: userUuid }] });
    const delFailDefaultRes = await request(app)
      .delete('/api/v1/categories/default-cat')
      .set('Authorization', `Bearer ${token}`);
    expect(delFailDefaultRes.status).toBe(400);
    expect(delFailDefaultRes.body.error.code).toBe('DEFAULT_CATEGORY_NOT_DELETABLE');

    // Delete Failure - Linked to todos
    pool.query
      .mockResolvedValueOnce({ rows: [{ category_id: categoryUuid, is_default: false, user_id: userUuid }] })
      .mockResolvedValueOnce({ rows: [{ cnt: '1' }] });
    const delFailLinkedRes = await request(app)
      .delete(`/api/v1/categories/${categoryUuid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delFailLinkedRes.status).toBe(409);
    expect(delFailLinkedRes.body.error.code).toBe('CATEGORY_HAS_TODOS');
  });

  // 7. Todo Management (UC-08 ~ UC-11)
  it('UC-08 ~ UC-11: 할일 관리 (등록, 수정, 토글, 삭제)', async () => {
    const token = jwt.sign({ user_id: userUuid, status: 'active' }, JWT_SECRET);
    const todoData = {
      todo_id: todoUuid,
      user_id: userUuid,
      title: 'Integration Todo',
      category_id: categoryUuid,
      due_date: '2026-12-31',
      is_completed: false
    };

    // Register (UC-08)
    pool.query
      .mockResolvedValueOnce({ rows: [{ category_id: categoryUuid, user_id: userUuid }] }) // check category
      .mockResolvedValueOnce({ rows: [todoData] }); // insert
    const addRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: todoData.title, category_id: categoryUuid, due_date: todoData.due_date });
    expect(addRes.status).toBe(201);

    // Update (UC-09)
    pool.query
      .mockResolvedValueOnce({ rows: [todoData] }) // findById
      .mockResolvedValueOnce({ rows: [{ ...todoData, title: 'Updated Todo' }] }); // update
    const upRes = await request(app)
      .patch(`/api/v1/todos/${todoUuid}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Todo' });
    expect(upRes.status).toBe(200);
    expect(upRes.body.data.title).toBe('Updated Todo');

    // Toggle (UC-11)
    pool.query
      .mockResolvedValueOnce({ rows: [{ ...todoData, title: 'Updated Todo' }] }) // findById
      .mockResolvedValueOnce({ rows: [{ ...todoData, title: 'Updated Todo', is_completed: true }] }); // update toggle
    const toggleRes = await request(app)
      .patch(`/api/v1/todos/${todoUuid}/toggle`)
      .set('Authorization', `Bearer ${token}`);
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data.is_completed).toBe(true);

    // Delete (UC-10)
    pool.query
      .mockResolvedValueOnce({ rows: [{ ...todoData, is_completed: true }] }) // findById
      .mockResolvedValueOnce({ rows: [] }); // delete
    const delRes = await request(app)
      .delete(`/api/v1/todos/${todoUuid}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(204);
  });

  // 8. Todo List 조회 (UC-12)
  it('UC-12: 할일 목록 조회 (각종 필터 조합)', async () => {
    const token = jwt.sign({ user_id: userUuid, status: 'active' }, JWT_SECRET);
    pool.query.mockResolvedValueOnce({ rows: [{ todo_id: todoUuid, title: 'Filtered Todo' }] });
    const res = await request(app)
      .get('/api/v1/todos')
      .query({ category_id: categoryUuid, is_completed: 'false', due_date_from: '2026-01-01', due_date_to: '2026-12-31' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    // Failure: Invalid Date Format
    const resFormat = await request(app)
      .get('/api/v1/todos')
      .query({ due_date_from: 'invalid-date' })
      .set('Authorization', `Bearer ${token}`);
    expect(resFormat.status).toBe(400);
    expect(resFormat.body.error.code).toBe('INVALID_DATE_FORMAT');

    // Failure: Invalid Date Range
    const resRange = await request(app)
      .get('/api/v1/todos')
      .query({ due_date_from: '2026-12-31', due_date_to: '2026-01-01' })
      .set('Authorization', `Bearer ${token}`);
    expect(resRange.status).toBe(400);
    expect(resRange.body.error.code).toBe('INVALID_DATE_RANGE');
  });


  // 9. Withdrawal (UC-05)
  it('UC-05: 회원 탈퇴 및 탈퇴 후 접근 차단 확인', async () => {
    const token = jwt.sign({ user_id: userUuid, status: 'active' }, JWT_SECRET);
    
    // Withdrawal
    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: userUuid, status: 'active', email: testUser.email }] }) // findById
      .mockResolvedValueOnce({ rowCount: 1 }); // withdraw UPDATE
    const withdrawRes = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(withdrawRes.status).toBe(200);

    // Check Login Block
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: userUuid, status: 'withdrawn', email: testUser.email }] });
    const loginFailRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(loginFailRes.status).toBe(401);
    expect(loginFailRes.body.error.code).toBe('INVALID_CREDENTIALS');

    // Check Token Block (simulating with a token that has withdrawn status)
    const withdrawnToken = jwt.sign(
      { user_id: userUuid, status: 'withdrawn' },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );
    const accessFailRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${withdrawnToken}`);
    
    expect(accessFailRes.status).toBe(401);
    expect(accessFailRes.body.error.code).toBe('UNAUTHORIZED');
    expect(accessFailRes.body.error.message).toBe('탈퇴한 계정입니다.');
  });
});
