import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    nullable: true,
  })
  size: CompanySize | null;

  /**
   * FK -> admins.id, plain column (no @ManyToOne) — cross-feature entity
   * imports are forbidden (PROJECT-RULES.md §3/§5), same pattern as
   * admins.roleId.
   */
  @Column({ name: 'created_by', type: 'bigint', unsigned: true })
  createdBy: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
