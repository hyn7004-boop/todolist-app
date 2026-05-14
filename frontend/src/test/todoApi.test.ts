import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

const mockTodo = {
  todo_id: 'todo-1',
  title: 'PRD 수정 완료',
  description: 'API 스키마 추가',
  category_id: 'cat-2',
  due_date: '2026-05-20',
  is_completed: false,
  created_at: '2026-05-13T13:00:00.000Z',
  updated_at: '2026-05-13T13:00:00.000Z',
};

const mockToggleResponse = {
  todo_id: 'todo-1',
  is_completed: true,
  updated_at: '2026-05-13T15:00:00.000Z',
};

describe('todoApi', () => {
  let mock: MockAdapter;

  beforeEach(async () => {
    const { default: apiClient } = await import('../api/client');
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getTodos', () => {
    it('필터 없이 전체 목록을 반환한다', async () => {
      mock.onGet('/todos').reply(200, { success: true, data: [mockTodo] });
      const { getTodos } = await import('../api/todoApi');

      const result = await getTodos();

      expect(result).toHaveLength(1);
      expect(result[0].todo_id).toBe('todo-1');
    });

    it('결과가 없을 때 빈 배열을 반환한다', async () => {
      mock.onGet('/todos').reply(200, { success: true, data: [] });
      const { getTodos } = await import('../api/todoApi');

      const result = await getTodos();

      expect(result).toEqual([]);
    });

    it('category_id 필터가 query params로 전달된다', async () => {
      mock.onGet('/todos').reply(200, { success: true, data: [] });
      const { getTodos } = await import('../api/todoApi');

      await getTodos({ category_id: 'cat-2' });

      expect(mock.history.get[0].params).toEqual({ category_id: 'cat-2' });
    });

    it('is_completed 필터가 query params로 전달된다', async () => {
      mock.onGet('/todos').reply(200, { success: true, data: [] });
      const { getTodos } = await import('../api/todoApi');

      await getTodos({ is_completed: false });

      expect(mock.history.get[0].params).toEqual({ is_completed: false });
    });

    it('복합 필터가 query params로 전달된다', async () => {
      mock.onGet('/todos').reply(200, { success: true, data: [] });
      const { getTodos } = await import('../api/todoApi');

      await getTodos({
        category_id: 'cat-2',
        due_date_from: '2026-05-01',
        due_date_to: '2026-05-31',
        is_completed: false,
      });

      expect(mock.history.get[0].params).toEqual({
        category_id: 'cat-2',
        due_date_from: '2026-05-01',
        due_date_to: '2026-05-31',
        is_completed: false,
      });
    });

    it('401 에러 시 reject된다', async () => {
      mock.onGet('/todos').reply(401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증 실패' },
      });
      const { getTodos } = await import('../api/todoApi');

      await expect(getTodos()).rejects.toBeDefined();
    });
  });

  describe('createTodo', () => {
    it('성공 시 생성된 Todo를 반환한다', async () => {
      mock.onPost('/todos').reply(201, { success: true, data: mockTodo });
      const { createTodo } = await import('../api/todoApi');

      const result = await createTodo({
        title: 'PRD 수정 완료',
        category_id: 'cat-2',
        due_date: '2026-05-20',
        description: 'API 스키마 추가',
      });

      expect(result.todo_id).toBe('todo-1');
      expect(result.is_completed).toBe(false);
    });

    it('요청 body에 필수 필드가 포함된다', async () => {
      mock.onPost('/todos').reply(201, { success: true, data: mockTodo });
      const { createTodo } = await import('../api/todoApi');

      await createTodo({
        title: 'PRD 수정 완료',
        category_id: 'cat-2',
        due_date: '2026-05-20',
      });

      const requestBody = JSON.parse(mock.history.post[0].data as string);
      expect(requestBody.title).toBe('PRD 수정 완료');
      expect(requestBody.category_id).toBe('cat-2');
      expect(requestBody.due_date).toBe('2026-05-20');
    });

    it('400 과거 날짜 에러 시 reject된다', async () => {
      mock.onPost('/todos').reply(400, {
        success: false,
        error: { code: 'INVALID_DUE_DATE', message: '종료예정일은 오늘 이상이어야 합니다' },
      });
      const { createTodo } = await import('../api/todoApi');

      await expect(
        createTodo({ title: '할일', category_id: 'cat-2', due_date: '2020-01-01' })
      ).rejects.toBeDefined();
    });

    it('400 제목 초과 에러 시 reject된다', async () => {
      mock.onPost('/todos').reply(400, {
        success: false,
        error: { code: 'INVALID_TITLE', message: '제목은 200자 이내' },
      });
      const { createTodo } = await import('../api/todoApi');

      await expect(
        createTodo({ title: 'a'.repeat(201), category_id: 'cat-2', due_date: '2026-05-20' })
      ).rejects.toBeDefined();
    });
  });

  describe('updateTodo', () => {
    const updatedTodo = { ...mockTodo, title: '수정된 제목', updated_at: '2026-05-13T14:00:00.000Z' };

    it('성공 시 수정된 Todo를 반환한다', async () => {
      mock.onPatch('/todos/todo-1').reply(200, { success: true, data: updatedTodo });
      const { updateTodo } = await import('../api/todoApi');

      const result = await updateTodo('todo-1', { title: '수정된 제목' });

      expect(result.title).toBe('수정된 제목');
      expect(result.updated_at).toBe('2026-05-13T14:00:00.000Z');
    });

    it('PATCH /todos/:todoId 형태로 요청한다', async () => {
      mock.onPatch('/todos/todo-1').reply(200, { success: true, data: updatedTodo });
      const { updateTodo } = await import('../api/todoApi');

      await updateTodo('todo-1', { title: '수정된 제목' });

      expect(mock.history.patch[0].url).toBe('/todos/todo-1');
    });

    it('404 타인 소유 할일 에러 시 reject된다', async () => {
      mock.onPatch('/todos/other-todo').reply(404, {
        success: false,
        error: { code: 'TODO_NOT_FOUND', message: '할일 없음' },
      });
      const { updateTodo } = await import('../api/todoApi');

      await expect(updateTodo('other-todo', { title: '수정' })).rejects.toBeDefined();
    });
  });

  describe('deleteTodo', () => {
    it('성공 시 resolve된다 (void)', async () => {
      mock.onDelete('/todos/todo-1').reply(204);
      const { deleteTodo } = await import('../api/todoApi');

      await expect(deleteTodo('todo-1')).resolves.toBeUndefined();
    });

    it('DELETE /todos/:todoId 형태로 요청한다', async () => {
      mock.onDelete('/todos/todo-1').reply(204);
      const { deleteTodo } = await import('../api/todoApi');

      await deleteTodo('todo-1');

      expect(mock.history.delete[0].url).toBe('/todos/todo-1');
    });

    it('404 에러 시 reject된다', async () => {
      mock.onDelete('/todos/other-todo').reply(404, {
        success: false,
        error: { code: 'TODO_NOT_FOUND', message: '할일 없음' },
      });
      const { deleteTodo } = await import('../api/todoApi');

      await expect(deleteTodo('other-todo')).rejects.toBeDefined();
    });
  });

  describe('toggleTodo', () => {
    it('성공 시 ToggleTodoResponse를 반환한다 (is_completed: true)', async () => {
      mock.onPatch('/todos/todo-1/toggle').reply(200, { success: true, data: mockToggleResponse });
      const { toggleTodo } = await import('../api/todoApi');

      const result = await toggleTodo('todo-1');

      expect(result.todo_id).toBe('todo-1');
      expect(result.is_completed).toBe(true);
    });

    it('PATCH /todos/:todoId/toggle 형태로 요청한다', async () => {
      mock.onPatch('/todos/todo-1/toggle').reply(200, { success: true, data: mockToggleResponse });
      const { toggleTodo } = await import('../api/todoApi');

      await toggleTodo('todo-1');

      expect(mock.history.patch[0].url).toBe('/todos/todo-1/toggle');
    });

    it('완료 취소 시 is_completed: false를 반환한다', async () => {
      mock.onPatch('/todos/todo-1/toggle').reply(200, {
        success: true,
        data: { ...mockToggleResponse, is_completed: false },
      });
      const { toggleTodo } = await import('../api/todoApi');

      const result = await toggleTodo('todo-1');

      expect(result.is_completed).toBe(false);
    });

    it('404 에러 시 reject된다', async () => {
      mock.onPatch('/todos/other-todo/toggle').reply(404, {
        success: false,
        error: { code: 'TODO_NOT_FOUND', message: '할일 없음' },
      });
      const { toggleTodo } = await import('../api/todoApi');

      await expect(toggleTodo('other-todo')).rejects.toBeDefined();
    });
  });
});
