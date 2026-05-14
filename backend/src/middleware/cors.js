const cors = require('cors');

// env.js는 필수 DB 환경변수 검증 시 process.exit을 호출할 수 있으므로
// CORS 설정에 한해 process.env에서 직접 읽어 app.js 인라인 로직과 동일하게 동작한다.
const getAllowedOrigins = () =>
  (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());

module.exports = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단된 오리진입니다.'));
    }
  },
});
