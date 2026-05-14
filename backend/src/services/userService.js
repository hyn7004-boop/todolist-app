const ERROR_CODES = require('../constants/errorCodes');
const { compare, hash } = require('../utils/passwordUtils');
const { isValidPassword } = require('../utils/validators');
const userRepository = require('../repositories/userRepository');

function buildError(message, code, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

async function updateMe(userId, { name, currentPassword, newPassword }) {
  const user = await userRepository.findById(userId);

  let updated = { user_id: user.user_id, email: user.email, name: user.name, updated_at: user.updated_at };

  if (name !== undefined) {
    if (typeof name !== 'string' || name.length > 50) {
      throw buildError('이름은 50자를 초과할 수 없습니다.', ERROR_CODES.NAME_TOO_LONG, 400);
    }
    updated = await userRepository.updateName(userId, name);
  }

  if (newPassword !== undefined) {
    if (!currentPassword) {
      throw buildError('현재 비밀번호를 입력해주세요.', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
    }

    const isMatch = await compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw buildError('현재 비밀번호가 올바르지 않습니다.', ERROR_CODES.WRONG_CURRENT_PASSWORD, 401);
    }

    if (!isValidPassword(newPassword)) {
      throw buildError(
        '비밀번호는 8자 이상이며 영문과 숫자를 각각 1자 이상 포함해야 합니다.',
        ERROR_CODES.INVALID_PASSWORD,
        400
      );
    }

    const passwordHash = await hash(newPassword);
    updated = await userRepository.updatePassword(userId, passwordHash);
  }

  return updated;
}

async function deleteMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user || user.status === 'withdrawn') {
    throw buildError('이미 탈퇴된 계정입니다.', ERROR_CODES.ALREADY_WITHDRAWN, 400);
  }
  await userRepository.withdraw(userId);
}

module.exports = { updateMe, deleteMe };
