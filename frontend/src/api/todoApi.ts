import apiClient from './client';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter, ToggleTodoResponse } from '../types/todo.types';

export async function getTodos(filters?: TodoFilter): Promise<Todo[]> {
  const response = await apiClient.get<{ success: true; data: Todo[] }>('/todos', { params: filters });
  return response.data.data;
}

export async function getTodo(todoId: string): Promise<Todo> {
  const response = await apiClient.get<{ success: true; data: Todo }>(`/todos/${todoId}`);
  return response.data.data;
}

export async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  const response = await apiClient.post<{ success: true; data: Todo }>('/todos', data);
  return response.data.data;
}

export async function updateTodo(todoId: string, data: UpdateTodoRequest): Promise<Todo> {
  const response = await apiClient.patch<{ success: true; data: Todo }>(`/todos/${todoId}`, data);
  return response.data.data;
}

export async function deleteTodo(todoId: string): Promise<void> {
  await apiClient.delete(`/todos/${todoId}`);
}

export async function toggleTodo(todoId: string): Promise<ToggleTodoResponse> {
  const response = await apiClient.patch<{ success: true; data: ToggleTodoResponse }>(`/todos/${todoId}/toggle`);
  return response.data.data;
}
