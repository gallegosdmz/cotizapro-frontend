import apiClient from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
} from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  refresh: () =>
    apiClient.get<AuthResponse>('/auth/refresh').then((r) => r.data),

  sendOtp: (data: SendOtpRequest) =>
    apiClient.post<{ message: string }>('/auth/send-otp', data).then((r) => r.data),

  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient.post<{ message: string }>('/auth/verify-otp', data).then((r) => r.data),
};
