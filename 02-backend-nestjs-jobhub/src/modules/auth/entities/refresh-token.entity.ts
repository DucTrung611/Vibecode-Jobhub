import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type RefreshTokenOwnerType = 'user' | 'admin';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId: number;

  @Column({ name: 'owner_type', type: 'enum', enum: ['user', 'admin'] })
  ownerType: RefreshTokenOwnerType;

  /** SHA-256 hex digest of the raw refresh token — deterministic so it's directly lookup-able. */
  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
