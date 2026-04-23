export interface AuthResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}
