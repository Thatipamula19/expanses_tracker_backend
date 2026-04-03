import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AddTransactionDto } from './dtos/add-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Between, FindOptionsOrder, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { DeleteTransactionDto } from './dtos/delete-transaction.dto';
import { PaginationProvider } from '@/common/pagination/pagination.provider';
import { GetTransactionsDto } from './dtos/get-transactions.dto';
import { DateRangePeriod, SortOrder } from '@/common/enums';

@Injectable()
export class TransactionsService {

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly paginateService: PaginationProvider,
    ) { }

    public async getTransactions(user_id: string, getTransactionsDto: GetTransactionsDto) {
        try {
            const {
                period,
                categories,
                transaction_type,
                sort = SortOrder.DESC,
                search,
            } = getTransactionsDto;

            const baseWhere: FindOptionsWhere<Transaction> = {
                user: { id: user_id },
            };

            if (period) {
                const { start, end } = this.resolveDateRange(period);
                baseWhere.transaction_date = Between(start, end);
            }

            if (transaction_type) {
                baseWhere.type = transaction_type;
            }

            let whereConditions: FindOptionsWhere<Transaction> | FindOptionsWhere<Transaction>[];

            if (search) {
                whereConditions = [
                    { ...baseWhere, title: ILike(`%${search}%`) },
                    { ...baseWhere, category: { name: ILike(`%${search}%`) } },
                ];

                if (categories?.length) {
                    whereConditions = [
                        { ...baseWhere, title: ILike(`%${search}%`), category: { name: In(categories) } },
                        { ...baseWhere, category: { name: ILike(`%${search}%`) } },
                    ];
                }
            } else {
                if (categories?.length) {
                    baseWhere.category = { name: In(categories) };
                }
                whereConditions = baseWhere;
            }

            const order: FindOptionsOrder<Transaction> = {
                transaction_date: sort.toUpperCase() as 'ASC' | 'DESC',
            };

            const transactions = await this.paginateService.paginateQuery(
                getTransactionsDto,                  // carries page + limit
                this.transactionRepository,
                { user: true, category: true },      // relations
                whereConditions as FindOptionsWhere<Transaction>,                     // dynamic where
                order,                               // dynamic sort
            );

            return {
                message: 'Transactions retrieved successfully',
                transactions,
            };

        } catch (error) {
            throw new InternalServerErrorException(
                error?.message ?? 'Failed to retrieve transactions',
            );
        }
    }


    public async getTransaction(transaction_id: string, user_id: string) {
        try {
            const transaction = await this.transactionRepository.findOne({
                where: {
                    id: transaction_id,
                    user_id,
                },
                relations: { user: true, category: true },
            });
            if (!transaction) {
                throw new InternalServerErrorException('Transaction not found');
            }
            return {
                message: 'Transaction retrieved successfully',
                transaction: transaction,
            };
        } catch (error) {
            throw new InternalServerErrorException(error?.message ?? 'Failed to retrieve transaction');
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

    private resolveDateRange(period: DateRangePeriod): { start: Date; end: Date } {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        switch (period) {
            case DateRangePeriod.TODAY:
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;

            case DateRangePeriod.THIS_WEEK:
                start.setDate(now.getDate() - now.getDay());
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;

            case DateRangePeriod.THIS_MONTH:
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;

            case DateRangePeriod.LAST_MONTH:
                start.setMonth(now.getMonth() - 1, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(now.getMonth(), 0);
                end.setHours(23, 59, 59, 999);
                break;

            case DateRangePeriod.LAST_3_MONTHS:
                start.setMonth(now.getMonth() - 3, 1);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
        }

        return { start, end };
    }

}
