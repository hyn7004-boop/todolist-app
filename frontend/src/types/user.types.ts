export interface User {
  user_id: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRequest {
  name?: string;
  current_password?: string;
  new_password?: string;
}

export interface UpdateUserResponse {
  user_id: string;
  email: string;
  name: string;
  updated_at: string;
}
