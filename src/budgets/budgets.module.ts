import { forwardRef, Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TransactionsModule } from '@/transactions/transactions.module';

@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService],
  imports: [TypeOrmModule.forFeature([Budget, Transaction]), PaginationModule,  forwardRef(() => TransactionsModule)],
  exports: [BudgetsService],
})
export class BudgetsModule {}
