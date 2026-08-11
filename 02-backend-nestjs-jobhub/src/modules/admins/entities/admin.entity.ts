import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 190, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  /**
   * FK -> roles.id, enforced at the DB level (migration), not via a TypeORM
   * relation — cross-feature entity imports are forbidden (PROJECT-RULES.md
   * §3/§5). Resolve role details through RolesPermissionsService, not a join.
   */
  @Column({ name: 'role_id', type: 'bigint', unsigned: true })
  roleId: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
