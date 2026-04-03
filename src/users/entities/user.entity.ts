import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { Category } from '@/categories/entities/category.entity';
import { Budget } from '@/budgets/entities/budget.entity';
import { Goal } from '@/goals/entities/goal.entity';
import { RefreshToken } from '@/auth/entities/refresh-token.entity';
import { UserRole } from '@/common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  user_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 10, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  preferred_currency: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  // Day of month (1–28) when the monthly budget cycle starts
  @Column({ type: 'int', default: 1 })
  monthly_start_date: number;

  @Column({ type: 'boolean', default: true })
  notify_budget_alerts: boolean;

  @Column({ type: 'boolean', default: true })
  notify_goal_reminders: boolean;

  @Column({ type: 'boolean', default: true })
  notify_weekly_summary: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refresh_tokens: RefreshToken[];
}