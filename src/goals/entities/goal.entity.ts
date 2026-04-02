import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { GoalStatus } from '@/common/enums';
import { User } from '@/users/entities/user.entity';
import { Category } from '@/categories/entities/category.entity';
import { GoalContribution } from './goal-contribution.entity';

@Entity('goals')
@Index(['user_id', 'status'])
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  target_amount: number;

  // Denormalized — updated via service on each contribution
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saved_amount: number;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.ONGOING,
  })
  status: GoalStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Virtual getters
  get remainingAmount(): number {
    return Math.max(Number(this.target_amount) - Number(this.saved_amount), 0);
  }

  get progressPercentage(): number {
    if (!this.target_amount) return 0;
    return Math.min(
      Math.round((Number(this.saved_amount) / Number(this.target_amount)) * 100),
      100,
    );
  }

  // Relations
  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.goals, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => GoalContribution, (contribution) => contribution.goal, {
    cascade: ['insert'],
  })
  contributions: GoalContribution[];
}