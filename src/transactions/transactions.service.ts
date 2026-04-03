import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AddTransactionDto } from './dtos/add-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { DeleteTransactionDto } from './dtos/delete-transaction.dto';
import { PaginationProvider } from '@/common/pagination/pagination.provider';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

@Injectable()
export class TransactionsService {

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly paginateService: PaginationProvider,
    ) { }

    public async getTransactions(user_id: string, pageQueryDto: PaginationQueryDto) {
        try {
            const transactions = await this.paginateService.paginateQuery(
                pageQueryDto, 
                this.transactionRepository,
                { user: true, category: true },
                { user_id }
            );
            return {
                message: 'Transactions retrieved successfully',
                transactions: transactions,
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message ?? 'Failed to retrieve transactions');
        }
    }

    public async addTransaction(transaction: AddTransactionDto, user_id: string) {
        try {
            const newTransaction = await this.transactionRepository.save({
                ...transaction,
                user_id,
            });
            return {
                message: 'Transaction added successfully',
                transaction: newTransaction,
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message ?? 'Failed to add transaction');
        }
    }

    public async updateTransaction(transaction: UpdateTransactionDto, user_id: string) {
        try {
            const updatedTransaction = await this.transactionRepository.update(transaction?.id, {
                ...transaction,
                user_id,
            });
            return {
                message: 'Transaction updated successfully',
                transaction: updatedTransaction,
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message ?? 'Failed to update transaction');
        }
    }

    public async deleteTransaction(transaction: DeleteTransactionDto, user_id: string) {
        try {
            await this.transactionRepository.delete(transaction?.id);
            return {
                message: 'Transaction deleted successfully',
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message ?? 'Failed to delete transaction');
        }
    }

}
