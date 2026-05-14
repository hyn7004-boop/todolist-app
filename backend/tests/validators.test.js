const { isValidPassword, isValidEmail } = require('../src/utils/validators');

describe('isValidPassword() - BR-10', () => {
  test('8자 이상, 영문+숫자 포함 시 true', () => {
    expect(isValidPassword('abc12345')).toBe(true);
    expect(isValidPassword('Password1')).toBe(true);
  });
  test('정확히 8자(영문+숫자)는 true', () => {
    expect(isValidPassword('abcde123')).toBe(true);
  });
  test('7자는 false', () => {
    expect(isValidPassword('abcd123')).toBe(false);
  });
  test('영문 없는 경우 false', () => {
    expect(isValidPassword('12345678')).toBe(false);
  });
  test('숫자 없는 경우 false', () => {
    expect(isValidPassword('abcdefgh')).toBe(false);
  });
  test('undefined/null은 false', () => {
    expect(isValidPassword(undefined)).toBe(false);
    expect(isValidPassword(null)).toBe(false);
  });
});

describe('isValidEmail()', () => {
  test('올바른 이메일 형식은 true', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });
  test('@가 없으면 false', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });
  test('도메인이 없으면 false', () => {
    expect(isValidEmail('user@')).toBe(false);
  });
  test('빈 문자열은 false', () => {
    expect(isValidEmail('')).toBe(false);
  });
  test('문자열이 아니면 false', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });
});
