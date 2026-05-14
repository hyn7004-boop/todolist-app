const { hash, compare } = require('../src/utils/passwordUtils');

describe('passwordUtils', () => {
  const plainPassword = 'password123';

  test('hash()는 평문 비밀번호를 해시한다', async () => {
    const hashed = await hash(plainPassword);
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(plainPassword);
    expect(hashed.length).toBeGreaterThan(20);
  });

  test('compare()는 평문과 해시된 비밀번호가 일치하면 true를 반환한다', async () => {
    const hashed = await hash(plainPassword);
    const result = await compare(plainPassword, hashed);
    expect(result).toBe(true);
  });

  test('compare()는 평문과 해시된 비밀번호가 일치하지 않으면 false를 반환한다', async () => {
    const hashed = await hash(plainPassword);
    const result = await compare('wrong-password', hashed);
    expect(result).toBe(false);
  });
});
