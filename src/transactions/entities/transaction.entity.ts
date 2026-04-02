import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TransactionType } from '@/common/enums';
import { User } from '@/users/entities/user.entity';
import { Category } from '@/categories/entities/category.entity';
import { GoalContribution } from '@/goals/entities/goal-contribution.entity';

@Entity('transactions')
@Index(['user_id', 'transaction_date'])
@Index(['user_id', 'category_id'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Always stored as a positive decimal; type field determines income/expense
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.EXPENSE,
  })
  type: TransactionType;

  @Column({ type: 'date' })
  transaction_date: Date;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  // Exchange rate to user's preferred currency at time of transaction
  @Column({ type: 'decimal', precision: 15, scale: 6, default: 1 })
  exchange_rate: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => GoalContribution, (contribution) => contribution.transaction)
  goal_contributions: GoalContribution[];
}