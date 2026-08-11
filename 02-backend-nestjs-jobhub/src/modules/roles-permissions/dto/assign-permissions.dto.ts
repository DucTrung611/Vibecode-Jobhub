import { Transform } from 'class-transformer';
import { ArrayUnique, IsInt, IsArray } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  // Permission ids round-trip through the frontend as strings (BIGINT
  // columns come back as JS strings from mysql2), so coerce defensively
  // rather than relying on the caller to send numbers.
  @Transform(({ value }: { value: unknown[] }) => value.map((v) => Number(v)))
  permissionIds: number[];
}
