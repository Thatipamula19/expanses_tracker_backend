import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Goal } from './goal.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';

@Entity('goal_contributions')
@Index(['goal_id'])
@Index(['transaction_id'])
export class GoalContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  goal_id: string;

  // Nullable — contributions can be manual (not tied to a transaction)
  @Column({ type: 'uuid', nullable: true })
  transaction_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  contributed_at: Date; 

  // Relations
  @ManyToOne(() => Goal, (goal) => goal.contributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  @ManyToOne(() => Transaction, (transaction) => transaction.goal_contributions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}