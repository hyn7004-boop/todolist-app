/**
 * config/env.js
 * 필수 환경 변수를 검증하고 정규화된 설정 객체를 export하는 모듈.
 * dotenv 로드는 진입점(server.js)에서 수행하므로 여기서는 호출하지 않는다.
 */

const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[ENV] 필수 환경 변수 누락: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()),
  },
};
