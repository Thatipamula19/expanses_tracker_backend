import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService],
  imports: [TypeOrmModule.forFeature([Goal])],
})
export class GoalsModule {}
