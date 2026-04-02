import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity('refresh_tokens')
@Index(['token_hash'], { unique: true })
@Index(['user_id'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  // Store SHA-256 hash of the raw token — never store plaintext
  @Column({ type: 'varchar', length: 255 })
  token_hash: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // Virtual
  get isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  get isValid(): boolean {
    return !this.revoked && !this.isExpired;
  }

  // Relations
  @ManyToOne(() => User, (user) => user.refresh_tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}