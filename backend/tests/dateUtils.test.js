const { getTodayKST, isValidDueDate, isValidDateFormat, isValidDateRange } = require('../src/utils/dateUtils');

describe('getTodayKST()', () => {
  test('YYYY-MM-DD 형식으로 반환한다', () => {
    const today = getTodayKST();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isValidDateFormat()', () => {
  test('올바른 날짜 형식(YYYY-MM-DD)은 true를 반환한다', () => {
    expect(isValidDateFormat('2026-05-13')).toBe(true);
  });
  test('잘못된 형식은 false를 반환한다', () => {
    expect(isValidDateFormat('2026/05/13')).toBe(false);
    expect(isValidDateFormat('20260513')).toBe(false);
    expect(isValidDateFormat('not-a-date')).toBe(false);
    expect(isValidDateFormat('')).toBe(false);
    expect(isValidDateFormat(null)).toBe(false);
    expect(isValidDateFormat(undefined)).toBe(false);
    expect(isValidDateFormat(123)).toBe(false);
  });
  test('존재하지 않는 날짜는 false를 반환한다', () => {
    expect(isValidDateFormat('2026-02-30')).toBe(false);
  });
});

describe('isValidDueDate() - KST 기준', () => {
  test('오늘 날짜(KST)는 true를 반환한다', () => {
    const today = getTodayKST();
    expect(isValidDueDate(today)).toBe(true);
  });
  test('내일 날짜는 true를 반환한다', () => {
    const tomorrow = new Date(Date.now() + 9 * 3600 * 1000 + 86400 * 1000).toISOString().slice(0, 10);
    expect(isValidDueDate(tomorrow)).toBe(true);
  });
  test('어제 날짜는 false를 반환한다', () => {
    const yesterday = new Date(Date.now() + 9 * 3600 * 1000 - 86400 * 1000).toISOString().slice(0, 10);
    expect(isValidDueDate(yesterday)).toBe(false);
  });
  test('잘못된 형식은 false를 반환한다', () => {
    expect(isValidDueDate('bad-date')).toBe(false);
  });
});

describe('isValidDateRange()', () => {
  test('from <= to이면 true를 반환한다', () => {
    expect(isValidDateRange('2026-05-01', '2026-05-31')).toBe(true);
    expect(isValidDateRange('2026-05-01', '2026-05-01')).toBe(true);
  });
  test('from > to이면 false를 반환한다', () => {
    expect(isValidDateRange('2026-05-31', '2026-05-01')).toBe(false);
  });
  test('잘못된 형식의 날짜가 포함되면 false를 반환한다', () => {
    expect(isValidDateRange('bad', '2026-05-01')).toBe(false);
  });
});
