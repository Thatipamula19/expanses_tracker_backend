import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PaginationModule } from '@/common/pagination/pagination.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { CategoriesModule } from '@/categories/categories.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [PaginationModule, CategoriesModule, TypeOrmModule.forFeature([Transaction])],
  exports: [TransactionsService],
  
})
export class TransactionsModule {}
