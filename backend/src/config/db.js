/**
 * config/db.js
 * pg Pool 단일 인스턴스를 생성하고 export.
 * Node.js 모듈 캐시에 의해 싱글톤으로 동작한다.
 */

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: env.db.poolMax,
  idleTimeoutMillis: env.db.idleTimeout,
  connectionTimeoutMillis: env.db.connectionTimeout,
});

// Pool 에러 핸들링 (연결 유지 중 오류)
pool.on('error', (err) => {
  console.error('[DB] 유휴 클라이언트 오류:', err.message);
});

module.exports = pool;
