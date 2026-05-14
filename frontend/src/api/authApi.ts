import apiClient from './client';
import type { SignupRequest, LoginRequest, LoginResponse, SignupResponse } from '../types/auth.types';

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await apiClient.post<{ success: true; data: SignupResponse }>('/auth/signup', data);
  return response.data.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<{ success: true; data: LoginResponse }>('/auth/login', data);
  return response.data.data;
}

export async function logout(): Promise<null> {
  const response = await apiClient.post<{ success: true; data: null }>('/auth/logout');
  return response.data.data;
}
