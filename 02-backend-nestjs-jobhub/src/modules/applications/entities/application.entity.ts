import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'accepted';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /**
   * FK -> jobs.id / users.id / admins.id, plain columns (no @ManyToOne) —
   * cross-feature entity imports are forbidden, same pattern as
   * jobs.companyId.
   */
  @Column({ name: 'job_id', type: 'bigint', unsigned: true })
  jobId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'resume_url', type: 'varchar', length: 500 })
  resumeUrl: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending',
  })
  status: ApplicationStatus;

  @Column({ name: 'reviewed_by', type: 'bigint', unsigned: true, nullable: true })
  reviewedBy: number | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
