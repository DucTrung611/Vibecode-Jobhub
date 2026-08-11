import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('saved_jobs')
export class SavedJob {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @PrimaryColumn({ name: 'job_id', type: 'bigint', unsigned: true })
  jobId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
