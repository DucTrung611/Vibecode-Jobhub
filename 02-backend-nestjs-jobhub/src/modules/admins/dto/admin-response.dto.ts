import { Admin } from '../entities/admin.entity';

export class AdminResponseDto {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdAt: Date;

  static fromEntity(admin: Admin): AdminResponseDto {
    const dto = new AdminResponseDto();
    dto.id = admin.id;
    dto.fullName = admin.fullName;
    dto.email = admin.email;
    dto.roleId = admin.roleId;
    dto.isActive = admin.isActive;
    dto.createdAt = admin.createdAt;
    return dto;
  }
}
