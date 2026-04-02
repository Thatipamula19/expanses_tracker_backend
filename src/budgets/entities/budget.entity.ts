import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Category } from '@/categories/entities/category.entity';

@Entity('budgets')
// One budget per user + category + period
@Index(['user_id', 'category_id', 'period_month'], { unique: true })
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  limit_amount: number;

  // Denormalized — updated via service whenever a transaction is mutated
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spent_amount: number;

  // Format: 'YYYY-MM' e.g. '2025-10' — easy to filter and sort
  @Column({ type: 'varchar', length: 7 })
  period_month: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Virtual getters (computed at runtime, not stored in DB)
  get remaining_amount(): number {
    return Number(this.limit_amount) - Number(this.spent_amount);
  }

  get spent_percentage(): number {
    if (!this.limit_amount) return 0;
    return Math.min(
      Math.round((Number(this.spent_amount) / Number(this.limit_amount)) * 100),
      100,
    );
  }

  get isOverBudget(): boolean {
    return Number(this.spent_amount) > Number(this.limit_amount);
  }

  // Relations
  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.budgets, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}