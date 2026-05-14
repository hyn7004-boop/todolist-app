/**
 * authMiddleware.test.js
 * JWT 인증 미들웨어 동작 검증
 *
 * - 실제 JWT 토큰 생성 (jsonwebtoken 직접 사용)
 * - DB 연결 불필요 (미들웨어 레이어만 테스트)
 * - 보호 라우트(/api/v1/categories)에 요청하여 미들웨어 응답 확인
 */

// env.js의 process.exit(1) 방지를 위해 dotenv를 app require 이전에 로드
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// 테스트 환경 변수 설정 (app.test.js와 충돌 방지)
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173';

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * 테스트용 JWT 토큰 생성 헬퍼
 * @param {object} payload - 토큰 페이로드
 * @param {object} options - jwt.sign 옵션 (expiresIn 등 오버라이드 가능)
 */
function makeToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h', ...options });
}

describe('authMiddleware', () => {
  describe('토큰 없음 / 형식 오류', () => {
    test('Authorization 헤더가 없으면 401과 UNAUTHORIZED 코드를 반환한다', async () => {
      const res = await request(app).get('/api/v1/categories');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('인증이 필요합니다.');
    });

    test('Bearer prefix가 없으면 401과 UNAUTHORIZED 코드를 반환한다', async () => {
      const token = makeToken({ user_id: 'uuid-123', status: 'active' });
      const res = await request(app).get('/api/v1/categories').set('Authorization', token);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('유효한 토큰', () => {
    test('유효한 active 토큰은 인증을 통과한다 (401이 아닌 응답 반환)', async () => {
      const token = makeToken({ user_id: 'uuid-123', status: 'active' });
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`);

      // categories 라우터가 스켈레톤이므로 404 반환되지만, 401은 아니어야 함
      expect(res.status).not.toBe(401);
    });

    test('유효한 active 토큰 통과 시 응답 바디에 UNAUTHORIZED 코드가 없다', async () => {
      const token = makeToken({ user_id: 'uuid-123', status: 'active' });
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`);

      // 인증은 통과했으므로 UNAUTHORIZED 에러 코드가 없어야 함
      if (res.body.error) {
        expect(res.body.error.code).not.toBe('UNAUTHORIZED');
      }
    });
  });

  describe('만료된 토큰', () => {
    test('만료된 토큰은 401과 UNAUTHORIZED 코드를 반환한다', async () => {
      // expiresIn: '0s' — 서명 즉시 만료
      const token = makeToken({ user_id: 'uuid-123', status: 'active' }, { expiresIn: '0s' });

      // 만료 처리 대기 (최소 1ms)
      await new Promise((resolve) => setTimeout(resolve, 10));

      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('유효하지 않거나 만료된 토큰입니다.');
    });
  });

  describe('잘못된 서명', () => {
    test('잘못된 시크릿으로 서명된 토큰은 401과 UNAUTHORIZED 코드를 반환한다', async () => {
      const token = jwt.sign({ user_id: 'uuid-123', status: 'active' }, 'wrong-secret', {
        algorithm: 'HS256',
      });
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('완전히 위조된 토큰 문자열은 401을 반환한다', async () => {
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', 'Bearer this.is.not.a.valid.jwt.token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('탈퇴 계정 차단', () => {
    test('status=withdrawn 토큰은 401과 UNAUTHORIZED 코드를 반환한다', async () => {
      const token = makeToken({ user_id: 'uuid-123', status: 'withdrawn' });
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('탈퇴한 계정입니다.');
    });
  });
});
