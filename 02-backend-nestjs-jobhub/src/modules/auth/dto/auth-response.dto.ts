export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: number; fullName: string; email: string };
}
