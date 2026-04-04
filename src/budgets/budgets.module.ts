import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';

@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService],
  imports: [TypeOrmModule.forFeature([Budget])],
  exports: [BudgetsService],
})
export class BudgetsModule {}
