import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

const mockUpdateResponse = {
  user_id: 'u1',
  email: 'test@example.com',
  name: '김철수',
  updated_at: '2026-05-13T11:00:00.000Z',
};

describe('userApi', () => {
  let mock: MockAdapter;

  beforeEach(async () => {
    const { default: apiClient } = await import('../api/client');
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('updateMe', () => {
    it('성공 시 UpdateUserResponse를 반환한다', async () => {
      mock.onPatch('/users/me').reply(200, { success: true, data: mockUpdateResponse });
      const { updateMe } = await import('../api/userApi');

      const result = await updateMe({ name: '김철수' });

      expect(result.user_id).toBe('u1');
      expect(result.name).toBe('김철수');
      expect(result.updated_at).toBe('2026-05-13T11:00:00.000Z');
    });

    it('이름 변경 시 body에 name이 포함된다', async () => {
      mock.onPatch('/users/me').reply(200, { success: true, data: mockUpdateResponse });
      const { updateMe } = await import('../api/userApi');

      await updateMe({ name: '김철수' });

      const requestBody = JSON.parse(mock.history.patch[0].data as string);
      expect(requestBody.name).toBe('김철수');
    });

    it('비밀번호 변경 시 current_password와 new_password가 포함된다', async () => {
      mock.onPatch('/users/me').reply(200, { success: true, data: mockUpdateResponse });
      const { updateMe } = await import('../api/userApi');

      await updateMe({ current_password: 'pass1234', new_password: 'newPass99' });

      const requestBody = JSON.parse(mock.history.patch[0].data as string);
      expect(requestBody.current_password).toBe('pass1234');
      expect(requestBody.new_password).toBe('newPass99');
    });

    it('401 현재 비밀번호 불일치 에러 시 reject된다', async () => {
      mock.onPatch('/users/me').reply(401, {
        success: false,
        error: { code: 'WRONG_CURRENT_PASSWORD', message: '현재 비밀번호 불일치' },
      });
      const { updateMe } = await import('../api/userApi');

      await expect(updateMe({ current_password: 'wrong', new_password: 'newPass99' })).rejects.toBeDefined();
    });

    it('400 비밀번호 정책 위반 에러 시 reject된다', async () => {
      mock.onPatch('/users/me').reply(400, {
        success: false,
        error: { code: 'INVALID_PASSWORD', message: '비밀번호 정책 위반' },
      });
      const { updateMe } = await import('../api/userApi');

      await expect(updateMe({ current_password: 'pass1234', new_password: 'weak' })).rejects.toBeDefined();
    });
  });

  describe('deleteMe', () => {
    it('성공 시 null을 반환한다', async () => {
      mock.onDelete('/users/me').reply(204);
      const { deleteMe } = await import('../api/userApi');

      const result = await deleteMe();

      expect(result).toBeNull();
    });

    it('DELETE /users/me 엔드포인트로 요청한다', async () => {
      mock.onDelete('/users/me').reply(204);
      const { deleteMe } = await import('../api/userApi');

      await deleteMe();

      expect(mock.history.delete[0].url).toBe('/users/me');
    });

    it('401 에러 시 reject된다', async () => {
      mock.onDelete('/users/me').reply(401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증 실패' },
      });
      const { deleteMe } = await import('../api/userApi');

      await expect(deleteMe()).rejects.toBeDefined();
    });
  });
});
