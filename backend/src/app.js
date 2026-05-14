// dotenv 로드는 진입점(server.js)에서만 수행한다.
// app.js는 이미 process.env에 로드된 값을 사용한다.
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require(path.join(__dirname, '../../swagger/swagger.json'));

const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const corsMiddleware = require('./middleware/cors');

const app = express();

// CORS 설정 - CORS_ALLOWED_ORIGINS 환경변수 기반, 와일드카드 미사용
app.use(corsMiddleware);

// HTTP 요청 로거 - 개발 환경에서만 활성화
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 요청 바디 파싱
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Swagger UI - 개발 환경에서만 노출
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// API v1 라우터 마운트
app.use('/api/v1', router);

// 404 핸들러 - 등록되지 않은 경로
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '요청하신 리소스를 찾을 수 없습니다.',
    },
  });
});

// 전역 에러 핸들러 (반드시 마지막에 위치)
app.use(errorHandler);

module.exports = app;
