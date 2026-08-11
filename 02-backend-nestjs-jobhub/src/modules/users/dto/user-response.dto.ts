import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  isActive: boolean;
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.resumeUrl = user.resumeUrl;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
