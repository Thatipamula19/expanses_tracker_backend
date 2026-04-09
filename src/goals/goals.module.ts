import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { GoalContribution } from './entities/goal-contribution.entity';
import { PaginationModule } from '@/common/pagination/pagination.module';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService],
  imports: [TypeOrmModule.forFeature([Goal, GoalContribution]), PaginationModule],
})
export class GoalsModule {}
