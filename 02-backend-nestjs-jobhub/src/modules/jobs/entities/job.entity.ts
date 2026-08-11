import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'internship'
  | 'remote';

export type JobStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'closed'
  | 'rejected';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /**
   * FK -> companies.id / categories.id / admins.id, plain columns (no
   * @ManyToOne) — cross-feature entity imports are forbidden, same pattern
   * as companies.createdBy.
   */
  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true })
  categoryId: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: ['full_time', 'part_time', 'contract', 'internship', 'remote'],
  })
  employmentType: EmploymentType;

  @Column({
    name: 'salary_min',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMin: string | null;

  @Column({
    name: 'salary_max',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMax: string | null;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending_review', 'published', 'closed', 'rejected'],
    default: 'draft',
  })
  status: JobStatus;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'approved_by', type: 'bigint', unsigned: true, nullable: true })
  approvedBy: number | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
