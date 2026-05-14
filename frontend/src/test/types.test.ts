import { describe, it, expect } from 'vitest';
import { ERROR_CODES } from '../constants/errorCodes';

describe('ErrorCodes 상수', () => {
  it('모든 필수 에러 코드가 존재해야 한다', () => {
    expect(ERROR_CODES.MISSING_REQUIRED_FIELD).toBe('MISSING_REQUIRED_FIELD');
    expect(ERROR_CODES.DUPLICATE_EMAIL).toBe('DUPLICATE_EMAIL');
    expect(ERROR_CODES.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ERROR_CODES.WRONG_CURRENT_PASSWORD).toBe('WRONG_CURRENT_PASSWORD');
    expect(ERROR_CODES.ALREADY_WITHDRAWN).toBe('ALREADY_WITHDRAWN');
    expect(ERROR_CODES.INVALID_PASSWORD).toBe('INVALID_PASSWORD');
    expect(ERROR_CODES.DUPLICATE_CATEGORY_NAME).toBe('DUPLICATE_CATEGORY_NAME');
    expect(ERROR_CODES.NAME_TOO_LONG).toBe('NAME_TOO_LONG');
    expect(ERROR_CODES.DEFAULT_CATEGORY_NOT_DELETABLE).toBe('DEFAULT_CATEGORY_NOT_DELETABLE');
    expect(ERROR_CODES.CATEGORY_HAS_TODOS).toBe('CATEGORY_HAS_TODOS');
    expect(ERROR_CODES.CATEGORY_NOT_FOUND).toBe('CATEGORY_NOT_FOUND');
    expect(ERROR_CODES.INVALID_DUE_DATE).toBe('INVALID_DUE_DATE');
    expect(ERROR_CODES.INVALID_TITLE).toBe('INVALID_TITLE');
    expect(ERROR_CODES.INVALID_CATEGORY).toBe('INVALID_CATEGORY');
    expect(ERROR_CODES.TODO_NOT_FOUND).toBe('TODO_NOT_FOUND');
    expect(ERROR_CODES.INVALID_DATE_FORMAT).toBe('INVALID_DATE_FORMAT');
    expect(ERROR_CODES.INVALID_DATE_RANGE).toBe('INVALID_DATE_RANGE');
    expect(ERROR_CODES.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
  });

  it('에러 코드 값이 키와 동일해야 한다', () => {
    Object.entries(ERROR_CODES).forEach(([key, value]) => {
      expect(key).toBe(value);
    });
  });

  it('총 19개 에러 코드가 존재해야 한다', () => {
    expect(Object.keys(ERROR_CODES).length).toBe(19);
  });
});
