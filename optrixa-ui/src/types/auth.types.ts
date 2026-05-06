export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

export interface AuthUser {
  token: string;
  email: string;
  fullName: string;
  role: string;
}