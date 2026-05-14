export interface Todo {
  todo_id: string;
  title: string;
  description: string | null;
  category_id: string;
  due_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  category_id: string;
  due_date: string;
  description?: string | null;
}

export interface UpdateTodoRequest {
  title?: string;
  category_id?: string;
  due_date?: string;
  description?: string | null;
}

export interface ToggleTodoResponse {
  todo_id: string;
  is_completed: boolean;
  updated_at: string;
}

export interface TodoFilter {
  category_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  is_completed?: boolean;
}
