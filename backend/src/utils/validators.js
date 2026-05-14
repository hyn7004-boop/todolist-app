// BR-10: 8자 이상, 영문 1자 이상, 숫자 1자 이상
function isValidPassword(password) {
  if (typeof password !== 'string' || password.length < 8) return false;
  return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

// 이메일 형식 검증
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { isValidPassword, isValidEmail };
