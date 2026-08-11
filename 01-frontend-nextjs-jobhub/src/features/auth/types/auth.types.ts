export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
}
