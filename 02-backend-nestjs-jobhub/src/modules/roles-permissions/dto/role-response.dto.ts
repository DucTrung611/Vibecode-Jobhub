import { Role } from '../entities/role.entity';

export class RoleResponseDto {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];

  static fromEntity(role: Role, permissions: string[]): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.id = role.id;
    dto.name = role.name;
    dto.description = role.description;
    dto.permissions = permissions;
    return dto;
  }
}
