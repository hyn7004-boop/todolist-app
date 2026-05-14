import apiClient from './client';
import type { UpdateUserRequest, UpdateUserResponse } from '../types/user.types';

export async function updateMe(data: UpdateUserRequest): Promise<UpdateUserResponse> {
  const response = await apiClient.patch<{ success: true; data: UpdateUserResponse }>('/users/me', data);
  return response.data.data;
}

export async function deleteMe(): Promise<null> {
  await apiClient.delete('/users/me');
  return null;
}
