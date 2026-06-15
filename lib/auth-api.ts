import { apiRequest } from '@/lib/api';
import { setToken } from '@/lib/auth-store';

export type LoginResponse = {
  token: string;
  user: { id: string; displayName: string; email?: string };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  await setToken(data.token);
  return data;
}

export async function register(email: string, password: string, displayName?: string): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, ...(displayName ? { displayName } : {}) }),
    skipAuth: true,
  });
  await setToken(data.token);
  return data;
}

export async function guest(displayName?: string): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>('/auth/guest', {
    method: 'POST',
    body: JSON.stringify(displayName != null ? { displayName } : {}),
    skipAuth: true,
  });
  await setToken(data.token);
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message?: string } | void> {
  return apiRequest<{ message?: string } | void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    skipAuth: true,
  });
}
