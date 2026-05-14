require('dotenv').config();
const app = require('./app');
const env = require('./config/env');
const pool = require('./config/db');

async function start() {
  // DB 연결 테스트
  try {
    const result = await pool.query('SELECT NOW() AS now');
    // eslint-disable-next-line no-console
    console.log(`[DB] 연결 성공 - 서버 시각: ${result.rows[0].now}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[DB] 연결 실패:', err.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[서버] 포트 ${env.port}에서 실행 중 (${env.nodeEnv})`);
    if (env.nodeEnv !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[서버] Swagger UI: http://localhost:${env.port}/api-docs`);
    }
  });
}

start();
