export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPassPayload {
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
