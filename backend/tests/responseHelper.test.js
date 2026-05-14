const { ok, fail } = require('../src/utils/responseHelper');

describe('responseHelper', () => {
  let res;
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('ok()', () => {
    test('기본 status 200으로 성공 응답을 반환한다', () => {
      ok(res, { id: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
    });
    test('custom status 201로 응답할 수 있다', () => {
      ok(res, { id: 2 }, 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    test('data가 null이어도 동작한다', () => {
      ok(res, null);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
    });
  });

  describe('fail()', () => {
    test('에러 코드와 메시지로 실패 응답을 반환한다', () => {
      fail(res, 'DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.', 409);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: '이미 사용 중인 이메일입니다.' },
      });
    });
  });
});
