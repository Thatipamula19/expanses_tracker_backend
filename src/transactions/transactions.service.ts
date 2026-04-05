import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AddTransactionDto } from './dtos/add-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { DeleteTransactionDto } from './dtos/delete-transaction.dto';
import { PaginationProvider } from '@/common/pagination/pagination.provider';
import { GetTransactionsDto } from './dtos/get-transactions.dto';
import {
  DateRangePeriod,
  OverviewPeriod,
  SortOrder,
  TransactionType,
} from '@/common/enums';
import { GetOverviewDto } from './dtos/get-overview.dto';
import { GetCategoryWiseExpensesDto } from './dtos/get-category-expenses.dto';
import { Budget } from '@/budgets/entities/budget.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly paginateService: PaginationProvider,

    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  public async getStatistics(user_id: string) {
    try {
      const now = new Date();

      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );

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
        const income = txns
          .filter((t) => t.type === TransactionType.INCOME)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = txns
          .filter((t) => t.type === TransactionType.EXPENSE)
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return { income, expense, balance: income - expense };
      };

      const percentageChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 1000) / 10;
      };

      const current = aggregate(currentMonthTxns);
      const previous = aggregate(lastMonthTxns);

      const incomeChange = percentageChange(current.income, previous.income);
      const expenseChange = percentageChange(current.expense, previous.expense);
      const balanceChange = percentageChange(current.balance, previous.balance);

      const currentSavingsRate =
        current.income > 0
          ? Math.round((current.balance / current.income) * 100)
          : 0;
      const previousSavingsRate =
        previous.income > 0
          ? Math.round((previous.balance / previous.income) * 100)
          : 0;
      const savingsRateChange = percentageChange(
        currentSavingsRate,
        previousSavingsRate,
      );

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
      throw new InternalServerErrorException(
        'Failed to get transactions statistics',
      );
    }
  }

  public async getOverview(user_id: string, dto: GetOverviewDto) {
    try {
      const now = new Date();
      const targetMonth = (dto.month ?? now.getMonth() + 1) - 1;
      const targetYear = dto.year ?? now.getFullYear();
      const trendMonths = Number(dto.trend_months ?? OverviewPeriod.THIS_MONTH);

      const trendStart = new Date(
        now.getFullYear(),
        now.getMonth() - (trendMonths - 1),
        1,
      );
      const trendEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const pieStart = new Date(targetYear, targetMonth, 1);
      const pieEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

      const [trendTxns, pieTxns, latestTxns] = await Promise.all([
        this.transactionRepository.find({
          where: { user_id, transaction_date: Between(trendStart, trendEnd) },
          relations: { category: true },
          order: { transaction_date: 'ASC' },
        }),
        this.transactionRepository.find({
          where: {
            user_id,
            type: TransactionType.EXPENSE,
            transaction_date: Between(pieStart, pieEnd),
          },
          relations: { category: true },
        }),
        this.transactionRepository.find({
          where: {
            user_id,
          },
          order: { transaction_date: 'DESC' },
          take: 5,
        }),
      ]);

      const monthMap = new Map<string, { income: number; expense: number }>();

      for (let i = 0; i < trendMonths; i++) {
        const d = new Date(
          now.getFullYear(),
          now.getMonth() - (trendMonths - 1 - i),
          1,
        );
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, { income: 0, expense: 0 });
      }

      for (const txn of trendTxns) {
        const d = new Date(txn.transaction_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const slot = monthMap.get(key);
        if (!slot) continue;

        if (txn.type === TransactionType.INCOME) {
          slot.income += Number(txn.amount);
        } else {
          slot.expense += Number(txn.amount);
        }
      }

      const MONTH_LABELS = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const income_vs_expense = Array.from(monthMap.entries()).map(
        ([key, val]) => {
          const month = parseInt(key.split('-')[1], 10) - 1; // 0-indexed for label
          return {
            month: MONTH_LABELS[month],
            income: Math.round(val.income),
            expense: Math.round(val.expense),
          };
        },
      );

      const categoryMap = new Map<string, { name: string; amount: number }>();

      for (const txn of pieTxns) {
        const catName = txn.category?.name ?? 'Others';
        const catId = txn.category_id ?? 'others';
        const slot = categoryMap.get(catId) ?? { name: catName, amount: 0 };
        slot.amount += Number(txn.amount);
        categoryMap.set(catId, slot);
      }

      const totalExpense = [...categoryMap.values()].reduce(
        (s, c) => s + c.amount,
        0,
      );

      const expense_breakdown = [...categoryMap.entries()]
        .sort((a, b) => b[1].amount - a[1].amount) // largest first
        .map(([, val]) => ({
          category: val.name,
          amount: Math.round(val.amount),
          percentage:
            totalExpense > 0
              ? Math.round((val.amount / totalExpense) * 1000) / 10 // 1 decimal e.g. 26.1
              : 0,
        }));

      return {
        income_vs_expense: {
          title: 'Income vs Expense',
          subtitle: `Monthly trend (last ${trendMonths} months)`,
          data: income_vs_expense,
        },
        expense_breakdown: {
          title: 'Expense Breakdown',
          subtitle: `${MONTH_LABELS[targetMonth]} ${targetYear}'s spending by category`,
          total_expense: Math.round(totalExpense),
          data: expense_breakdown,
        },
        latest_transactions: latestTxns,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get transactions overview',
      );
    }
  }

  public async getCategoryWiseExpenses(
    user_id: string,
    dto: GetCategoryWiseExpensesDto,
  ) {
    try {
      const now = new Date();
      const targetMonth = dto.month ?? now.getMonth() + 1;
      const targetYear = dto.year ?? now.getFullYear();

      const periodKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
      const monthStart = new Date(targetYear, targetMonth - 1, 1);
      const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

      const [budgets, transactions] = await Promise.all([
        this.budgetRepository.find({
          where: { user_id, period_month: periodKey },
          relations: { category: true },
        }),
        this.transactionRepository.find({
          where: {
            user_id,
            type: TransactionType.EXPENSE,
            transaction_date: Between(monthStart, monthEnd),
          },
          relations: { category: true },
        }),
      ]);

      const spentMap = new Map<
        string,
        {
          spent: number;
          category_name: string;
        }
      >();

      for (const txn of transactions) {
        const key = txn.category_id ?? 'uncategorized';
        const current = spentMap.get(key);

        if (current) {
          current.spent += Number(txn.amount);
        } else {
          spentMap.set(key, {
            spent: Number(txn.amount),
            category_name: txn.category?.name ?? 'Uncategorized',
          });
        }
      }

      const categoryData = budgets.map((budget) => {
        const limitAmount = Number(budget.limit_amount);

        const spentEntry = spentMap.get(budget.category_id);
        const actualSpent = spentEntry?.spent ?? 0;

        spentMap.delete(budget.category_id);

        const isOverBudget = actualSpent > limitAmount;
        const spentPercentage =
          limitAmount > 0
            ? Math.round((actualSpent / limitAmount) * 1000) / 10
            : actualSpent > 0
              ? 100
              : 0;

        return {
          category_id: budget.category_id,
          category_name: budget.category?.name ?? 'Uncategorized',
          budget_id: budget.id,
          has_budget: true,
          limit_amount: limitAmount,
          spent_amount: Math.round(actualSpent * 100) / 100,
          remaining_amount: Math.round((limitAmount - actualSpent) * 100) / 100,
          spent_percentage: spentPercentage,
          is_over_budget: isOverBudget,
        };
      });

      for (const [categoryId, entry] of spentMap.entries()) {
        categoryData.push({
          category_id: categoryId,
          category_name: entry.category_name,
          budget_id: 'null',
          has_budget: false,
          limit_amount: 0,
          spent_amount: Math.round(entry.spent * 100) / 100,
          remaining_amount: Math.round(-entry.spent * 100) / 100,
          spent_percentage: 100,
          is_over_budget: true,
        });
      }

      categoryData.sort((a, b) => {
        if (a.is_over_budget !== b.is_over_budget)
          return a.is_over_budget ? -1 : 1;
        return b.spent_percentage - a.spent_percentage;
      });

      const totalBudget = categoryData.reduce((s, c) => s + c.limit_amount, 0);
      const totalSpent = categoryData.reduce((s, c) => s + c.spent_amount, 0);

      return {
        period: periodKey,
        summary: {
          total_budget_amount: Math.round(totalBudget * 100) / 100,
          total_spent_amount: Math.round(totalSpent * 100) / 100,
          total_remaining: Math.round((totalBudget - totalSpent) * 100) / 100,
          over_budget_count: categoryData.filter((c) => c.is_over_budget)
            .length,
          on_track_count: categoryData.filter((c) => !c.is_over_budget).length,
        },
        categories: categoryData,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get category wise expenses',
      );
    }
  }
  public async getTransactions(
    user_id: string,
    getTransactionsDto: GetTransactionsDto,
  ) {
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

      let whereConditions:
        | FindOptionsWhere<Transaction>
        | FindOptionsWhere<Transaction>[];

      if (search) {
        whereConditions = [
          { ...baseWhere, title: ILike(`%${search}%`) },
          { ...baseWhere, category: { name: ILike(`%${search}%`) } },
        ];

        if (categories?.length) {
          whereConditions = [
            {
              ...baseWhere,
              title: ILike(`%${search}%`),
              category: { name: In(categories) },
            },
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
        getTransactionsDto, // carries page + limit
        this.transactionRepository,
        { user: true, category: true }, // relations
        whereConditions as FindOptionsWhere<Transaction>, // dynamic where
        order, // dynamic sort
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
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to retrieve transaction',
      );
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
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to add transaction',
      );
    }
  }

  public async updateTransaction(
    transaction: UpdateTransactionDto,
    user_id: string,
  ) {
    try {
      const updatedTransaction = await this.transactionRepository.update(
        transaction?.id,
        {
          ...transaction,
          user_id,
        },
      );
      return {
        message: 'Transaction updated successfully',
        transaction: updatedTransaction,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to update transaction',
      );
    }
  }

  public async deleteTransaction(
    transaction: DeleteTransactionDto,
    user_id: string,
  ) {
    try {
      await this.transactionRepository.delete(transaction?.id);
      return {
        message: 'Transaction deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to delete transaction',
      );
    }
  }

  private resolveDateRange(period: DateRangePeriod): {
    start: Date;
    end: Date;
  } {
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
