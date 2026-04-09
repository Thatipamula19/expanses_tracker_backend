import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In } from 'typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { TransactionType } from '@/common/enums';
import { GetAnalyticsDto, TimePeriod } from './dtos/get-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  public async getAnalytics(user_id: string, dto: GetAnalyticsDto) {
    try {
      const period = dto.time_period ?? TimePeriod.THIS_MONTH;
      const { start, end, trendMonths } = this.resolvePeriod(period);

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

      const baseWhere: any = {
        user_id,
        transaction_date: Between(start, end),
      };
      if (dto.category_id) {
        baseWhere.category_id = dto.category_id;
      }

      const transactions = await this.transactionRepository.find({
        where: baseWhere,
        relations: { category: true },
        order: { transaction_date: 'ASC' },
      });

      const now = new Date();

      const monthMap = new Map<string, { income: number; expense: number }>();
      for (let i = trendMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, { income: 0, expense: 0 });
      }

      for (const txn of transactions) {
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

      const income_vs_expense = Array.from(monthMap.entries()).map(
        ([key, val]) => {
          const monthIdx = parseInt(key.split('-')[1], 10) - 1;
          return {
            month: MONTH_LABELS[monthIdx],
            period: key,
            Income: Math.round(val.income),
            Expense: Math.round(val.expense),
          };
        },
      );

      const categorySpendMap = new Map<
        string,
        {
          category_name: string;
          amount: number;
        }
      >();

      for (const txn of transactions) {
        if (txn.type !== TransactionType.EXPENSE) continue;
        const key = txn.category_id ?? 'uncategorized';
        const current = categorySpendMap.get(key);
        if (current) {
          current.amount += Number(txn.amount);
        } else {
          categorySpendMap.set(key, {
            category_name: txn.category?.name ?? 'Uncategorized',
            amount: Number(txn.amount),
          });
        }
      }

      const spending_by_category = [...categorySpendMap.entries()]
        .map(([category_id, val]) => ({
          category_id,
          category_name: val.category_name,
          amount: Math.round(val.amount * 100) / 100,
        }))
        .sort((a, b) => b.amount - a.amount);

      const top5 = spending_by_category.slice(0, 5);
      const top5Total = top5.reduce((s, c) => s + c.amount, 0);
      const top5Expenses = top5.map((c) => ({
        category_id: c.category_id,
        name: c.category_name,
        amount: c.amount,
        percentage:
          top5Total > 0 ? Math.round((c.amount / top5Total) * 1000) / 10 : 0,
      }));

      const totalIncome = transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((s, t) => s + Number(t.amount), 0);
      const totalExpense = transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((s, t) => s + Number(t.amount), 0);

      return {
        meta: {
          time_period: period,
          category_id: dto.category_id ?? null,
          date_from: start.toISOString().split('T')[0],
          date_to: end.toISOString().split('T')[0],
          total_income: Math.round(totalIncome * 100) / 100,
          total_expense: Math.round(totalExpense * 100) / 100,
          net_balance: Math.round((totalIncome - totalExpense) * 100) / 100,
        },
        income_vs_expense: {
          title: 'Income vs Expense',
          subtitle: 'Monthly trend',
          data: income_vs_expense,
        },
        spending_by_category: {
          title: 'Spending by Category',
          data: spending_by_category,
        },
        top_5_expenses: {
          title: 'Top 5 Expenses',
          data: top5Expenses,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get analytics');
    }
  }

  private resolvePeriod(period: TimePeriod): {
    start: Date;
    end: Date;
    trendMonths: number;
  } {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-indexed

    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

    switch (period) {
      case TimePeriod.THIS_MONTH:
        return { start: new Date(y, m, 1), end, trendMonths: 1 };
      case TimePeriod.LAST_MONTH:
        return {
          start: new Date(y, m - 1, 1),
          end: new Date(y, m, 0, 23, 59, 59, 999),
          trendMonths: 1,
        };
      case TimePeriod.LAST_3_MONTHS:
        return { start: new Date(y, m - 2, 1), end, trendMonths: 3 };
      case TimePeriod.LAST_6_MONTHS:
        return { start: new Date(y, m - 5, 1), end, trendMonths: 6 };
      case TimePeriod.LAST_12_MONTHS:
        return { start: new Date(y, m - 11, 1), end, trendMonths: 12 };
      case TimePeriod.THIS_YEAR:
        return { start: new Date(y, 0, 1), end, trendMonths: m + 1 };
    }
  }
}
