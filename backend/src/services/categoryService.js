const ERROR_CODES = require('../constants/errorCodes');
const categoryRepository = require('../repositories/categoryRepository');

function buildError(message, code, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

async function getCategories(userId) {
  return categoryRepository.findAllByUserId(userId);
}

async function createCategory(userId, name) {
  if (!name) {
    throw buildError('필수 입력값이 누락되었습니다.', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
  }
  if (typeof name !== 'string' || name.length > 50) {
    throw buildError('카테고리 이름은 50자를 초과할 수 없습니다.', ERROR_CODES.NAME_TOO_LONG, 400);
  }

  try {
    return await categoryRepository.create(userId, name);
  } catch (err) {
    // PostgreSQL unique_violation 에러 코드
    if (err.code === '23505') {
      throw buildError('이미 사용 중인 카테고리 이름입니다.', ERROR_CODES.DUPLICATE_CATEGORY_NAME, 409);
    }
    throw err;
  }
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findById(categoryId, userId);
  if (!category) {
    throw buildError('카테고리를 찾을 수 없습니다.', ERROR_CODES.CATEGORY_NOT_FOUND, 404);
  }

  if (category.is_default) {
    throw buildError('기본 카테고리는 삭제할 수 없습니다.', ERROR_CODES.DEFAULT_CATEGORY_NOT_DELETABLE, 400);
  }

  const hasTodos = await categoryRepository.hasTodos(categoryId);
  if (hasTodos) {
    throw buildError('할일이 연결된 카테고리는 삭제할 수 없습니다.', ERROR_CODES.CATEGORY_HAS_TODOS, 409);
  }

  await categoryRepository.deleteById(categoryId);
}

module.exports = { getCategories, createCategory, deleteCategory };
