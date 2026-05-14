/**
 * app.test.js
 * Express 앱 초기화 및 기본 엔드포인트 동작 테스트
 */

// env.js의 process.exit(1) 방지를 위해 dotenv를 app require 이전에 로드
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// 테스트 환경 설정 (.env 로드 전에 NODE_ENV 설정)
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173';

const request = require('supertest');
const app = require('../src/app');

describe('App 초기화 테스트', () => {
  describe('GET /health', () => {
    it('200 상태코드와 { status: "ok" }를 반환해야 한다', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('존재하지 않는 경로 요청', () => {
    it('등록되지 않은 경로에 대해 404를 반환해야 한다', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('/api/v1 외부의 알 수 없는 경로에 대해 404를 반환해야 한다', async () => {
      const res = await request(app).get('/unknown-path');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('전역 에러 핸들러 동작 확인', () => {
    it('에러 핸들러가 표준 에러 응답 구조를 반환해야 한다', async () => {
      // 필수 필드 누락 시 400 + 표준 에러 응답 구조 반환
      const res = await request(app).post('/api/v1/auth/login').send({ invalid: true });
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
    });
  });

  describe('요청 바디 크기 제한', () => {
    it('10kb를 초과하는 JSON 바디는 413 에러를 반환해야 한다', async () => {
      const largeBody = { data: 'a'.repeat(11 * 1024) };
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(largeBody));
      expect(res.status).toBe(413);
    });
  });

  describe('CORS 설정', () => {
    it('허용된 오리진에 대해 CORS 헤더를 반환해야 한다', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('허용되지 않은 오리진에 대해 CORS 에러가 발생해야 한다', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://evil-site.com');
      // CORS 에러 시 500 또는 CORS 헤더 없음
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
