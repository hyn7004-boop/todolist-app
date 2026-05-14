const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ERROR_CODES = require('../constants/errorCodes');
const { fail } = require('../utils/responseHelper');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, ERROR_CODES.UNAUTHORIZED, '인증이 필요합니다.', 401);
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'] });

    // 탈퇴 계정 차단
    if (decoded.status === 'withdrawn') {
      console.warn(`[AUTH] 탈퇴 계정 접근 차단 - user_id: ${decoded.user_id}`);
      return fail(res, ERROR_CODES.UNAUTHORIZED, '탈퇴한 계정입니다.', 401);
    }

    req.user = { user_id: decoded.user_id, status: decoded.status };
    console.log(`[AUTH] 인증 성공 - user_id: ${decoded.user_id} (${req.method} ${req.originalUrl})`);
    next();
  } catch (err) {
    console.warn(`[AUTH] 토큰 검증 실패 - ${err.name}: ${err.message} (${req.method} ${req.originalUrl})`);
    return fail(res, ERROR_CODES.UNAUTHORIZED, '유효하지 않거나 만료된 토큰입니다.', 401);
  }
};
