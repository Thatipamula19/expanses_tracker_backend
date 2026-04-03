import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AddTransactionDto } from './dtos/add-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Between, FindOptionsOrder, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { DeleteTransactionDto } from './dtos/delete-transaction.dto';
import { PaginationProvider } from '@/common/pagination/pagination.provider';
import { GetTransactionsDto } from './dtos/get-transactions.dto';
import { DateRangePeriod, SortOrder, TransactionType } from '@/common/enums';

@Injectable()
export class TransactionsService {

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly paginateService: PaginationProvider,
    ) { }

public async getStatistics(user_id: string) {
    try {
        const now = new Date();

        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const [currentMonthTxns, lastMonthTxns] = await Promise.all([
            this.transactionRepository.find({
                where: {
                    user_id,
                    transaction_date: Between(currentMonthStart, currentMonthEnd),
                },
            }),
            this.transactionRepository.find({
                where: {
                    user_id,
                    transaction_date: Between(lastMonthStart, lastMonthEnd),
                },
            }),
        ]);

        const aggregate = (txns: Transaction[]) => {
            const income  = txns
                .filter(t => t.type === TransactionType.INCOME)
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expense = txns
                .filter(t => t.type === TransactionType.EXPENSE)
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return { income, expense, balance: income - expense };
        };

        const percentageChange = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 1000) / 10;
        };

        const current  = aggregate(currentMonthTxns);
        const previous = aggregate(lastMonthTxns);

        const incomeChange  = percentageChange(current.income,  previous.income);
        const expenseChange = percentageChange(current.expense, previous.expense);
        const balanceChange = percentageChange(current.balance, previous.balance);

        const currentSavingsRate  = current.income  > 0 ? Math.round((current.balance  / current.income)  * 100) : 0;
        const previousSavingsRate = previous.income > 0 ? Math.round((previous.balance / previous.income) * 100) : 0;
        const savingsRateChange   = percentageChange(currentSavingsRate, previousSavingsRate);

        return {
            total_balance: {
                amount: current.balance,
                change_amount: current.balance - previous.balance,
                change_percentage: balanceChange,                  
                trend: balanceChange >= 0 ? 'up' : 'down',
            },
            total_income: {
                amount: current.income,
                change_percentage: incomeChange,
                trend: incomeChange >= 0 ? 'up' : 'down',
            },
            total_expense: {
                amount: current.expense,
                change_percentage: expenseChange,
                trend: expenseChange <= 0 ? 'up' : 'down',
            },
            savings_rate: {
                percentage: currentSavingsRate,
                change_percentage: savingsRateChange,
                trend: savingsRateChange >= 0 ? 'up' : 'down',
            },
        };

    } catch (error) {
        throw new InternalServerErrorException('Failed to get transactions statistics');
    }
}

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
