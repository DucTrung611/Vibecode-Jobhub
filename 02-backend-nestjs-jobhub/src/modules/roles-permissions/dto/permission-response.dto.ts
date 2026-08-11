import { HttpMethod, Permission } from '../entities/permission.entity';

export class PermissionResponseDto {
  id: number;
  name: string;
  method: HttpMethod;
  route: string;
  description: string | null;

  static fromEntity(permission: Permission): PermissionResponseDto {
    const dto = new PermissionResponseDto();
    dto.id = permission.id;
    dto.name = permission.name;
    dto.method = permission.method;
    dto.route = permission.route;
    dto.description = permission.description;
    return dto;
  }
}
