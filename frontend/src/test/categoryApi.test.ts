import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

const mockCategories = [
  { category_id: 'cat-1', name: '일반', is_default: true, created_at: '2026-05-13T10:00:00.000Z' },
  { category_id: 'cat-2', name: '업무', is_default: true, created_at: '2026-05-13T10:00:00.000Z' },
];

const mockNewCategory = {
  category_id: 'cat-4',
  name: '사이드 프로젝트',
  is_default: false,
  created_at: '2026-05-13T12:00:00.000Z',
};

describe('categoryApi', () => {
  let mock: MockAdapter;

  beforeEach(async () => {
    const { default: apiClient } = await import('../api/client');
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getCategories', () => {
    it('빈 배열을 반환한다', async () => {
      mock.onGet('/categories').reply(200, { success: true, data: [] });
      const { getCategories } = await import('../api/categoryApi');

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it('카테고리 목록을 반환한다', async () => {
      mock.onGet('/categories').reply(200, { success: true, data: mockCategories });
      const { getCategories } = await import('../api/categoryApi');

      const result = await getCategories();

      expect(result).toHaveLength(2);
      expect(result[0].category_id).toBe('cat-1');
      expect(result[0].name).toBe('일반');
      expect(result[0].is_default).toBe(true);
    });

    it('GET /categories 엔드포인트로 요청한다', async () => {
      mock.onGet('/categories').reply(200, { success: true, data: mockCategories });
      const { getCategories } = await import('../api/categoryApi');

      await getCategories();

      expect(mock.history.get[0].url).toBe('/categories');
    });

    it('401 에러 시 reject된다', async () => {
      mock.onGet('/categories').reply(401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증 실패' },
      });
      const { getCategories } = await import('../api/categoryApi');

      await expect(getCategories()).rejects.toBeDefined();
    });
  });

  describe('createCategory', () => {
    it('성공 시 생성된 Category를 반환한다', async () => {
      mock.onPost('/categories').reply(201, { success: true, data: mockNewCategory });
      const { createCategory } = await import('../api/categoryApi');

      const result = await createCategory('사이드 프로젝트');

      expect(result.category_id).toBe('cat-4');
      expect(result.name).toBe('사이드 프로젝트');
      expect(result.is_default).toBe(false);
    });

    it('요청 body에 { name } 형태로 전달된다', async () => {
      mock.onPost('/categories').reply(201, { success: true, data: mockNewCategory });
      const { createCategory } = await import('../api/categoryApi');

      await createCategory('사이드 프로젝트');

      const requestBody = JSON.parse(mock.history.post[0].data as string);
      expect(requestBody).toEqual({ name: '사이드 프로젝트' });
    });

    it('409 이름 중복 에러 시 reject된다', async () => {
      mock.onPost('/categories').reply(409, {
        success: false,
        error: { code: 'DUPLICATE_CATEGORY_NAME', message: '이미 존재하는 카테고리 이름' },
      });
      const { createCategory } = await import('../api/categoryApi');

      await expect(createCategory('일반')).rejects.toBeDefined();
    });

    it('400 이름 초과 에러 시 reject된다', async () => {
      mock.onPost('/categories').reply(400, {
        success: false,
        error: { code: 'NAME_TOO_LONG', message: '이름 50자 초과' },
      });
      const { createCategory } = await import('../api/categoryApi');

      await expect(createCategory('a'.repeat(51))).rejects.toBeDefined();
    });
  });

  describe('deleteCategory', () => {
    it('성공 시 resolve된다 (void)', async () => {
      mock.onDelete('/categories/cat-4').reply(204);
      const { deleteCategory } = await import('../api/categoryApi');

      await expect(deleteCategory('cat-4')).resolves.toBeUndefined();
    });

    it('DELETE /categories/:categoryId 형태로 요청한다', async () => {
      mock.onDelete('/categories/cat-4').reply(204);
      const { deleteCategory } = await import('../api/categoryApi');

      await deleteCategory('cat-4');

      expect(mock.history.delete[0].url).toBe('/categories/cat-4');
    });

    it('400 기본 카테고리 삭제 시도 시 reject된다', async () => {
      mock.onDelete('/categories/cat-1').reply(400, {
        success: false,
        error: { code: 'DEFAULT_CATEGORY_NOT_DELETABLE', message: '기본 카테고리는 삭제 불가' },
      });
      const { deleteCategory } = await import('../api/categoryApi');

      await expect(deleteCategory('cat-1')).rejects.toBeDefined();
    });

    it('404 타인 소유 카테고리 시 reject된다', async () => {
      mock.onDelete('/categories/other-cat').reply(404, {
        success: false,
        error: { code: 'CATEGORY_NOT_FOUND', message: '카테고리 없음' },
      });
      const { deleteCategory } = await import('../api/categoryApi');

      await expect(deleteCategory('other-cat')).rejects.toBeDefined();
    });
  });
});
