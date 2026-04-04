import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Budget } from './entities/budget.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In } from 'typeorm';
import { DeleteBudgetDto } from './dtos/delete-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';
import { AddBudgetDto } from './dtos/add-budget.dto';
import { GetBudgetPlannerDto, GetBudgetTableDto } from './dtos/get-budget-planner.dto';
import { TransactionType } from '@/common/enums';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { GetBudgetInsightsDto } from './dtos/get-budget-insights.dto';

@Injectable()
export class BudgetsService {

    constructor(
        @InjectRepository(Budget)
        private readonly budgetsRepository: Repository<Budget>,

        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
    ) { }

    public async getBudgetPlannerSummary(user_id: string, dto: GetBudgetPlannerDto) {
        try {
            const now = new Date();
            const targetMonth = dto.month ?? now.getMonth() + 1;
            const targetYear = dto.year ?? now.getFullYear();
            const periodKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
            const monthStart = new Date(targetYear, targetMonth - 1, 1);
            const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

            const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const [budgets, transactions] = await Promise.all([
                this.budgetsRepository.find({
                    where: { user_id, period_month: periodKey },
                }),
                this.transactionsRepository.find({
                    where: {
                        user_id,
                        type: TransactionType.EXPENSE,
                        transaction_date: Between(monthStart, monthEnd),
                    },
                }),
            ]);

            const totalBudget = budgets.reduce((s, b) => s + Number(b.limit_amount), 0);
            const totalSpent = transactions.reduce((s, t) => s + Number(t.amount), 0);
            const remaining = totalBudget - totalSpent;
            const usedPercent = totalBudget > 0
                ? Math.round((totalSpent / totalBudget) * 100)
                : 0;

            const lastMonthStart = new Date(targetYear, targetMonth - 2, 1);
            const lastMonthEnd = new Date(targetYear, targetMonth - 1, 0, 23, 59, 59, 999);

            const lastMonthTxns = await this.transactionsRepository.find({
                where: {
                    user_id,
                    type: TransactionType.EXPENSE,
                    transaction_date: Between(lastMonthStart, lastMonthEnd),
                },
            });
            const lastMonthSpent = lastMonthTxns.reduce((s, t) => s + Number(t.amount), 0);
            const spentChangePercent = lastMonthSpent > 0
                ? Math.round(((totalSpent - lastMonthSpent) / lastMonthSpent) * 100)
                : 0;

            return {
                period: periodKey,
                period_label: `${MONTH_LABELS[targetMonth - 1]} ${targetYear}`,
                total_budget: {
                    amount: Math.round(totalBudget * 100) / 100,
                    period_label: `for ${MONTH_LABELS[targetMonth - 1]} ${targetYear}`,
                },
                total_spent: {
                    amount: Math.round(totalSpent * 100) / 100,
                    change_percent: spentChangePercent,
                    trend: spentChangePercent <= 0 ? 'down' : 'up',
                },
                remaining: {
                    amount: Math.round(remaining * 100) / 100,
                    used_percent: usedPercent,
                    is_over_budget: totalSpent > totalBudget,
                },
            };

        } catch (error) {
            throw new InternalServerErrorException('Failed to get budget planner summary');
        }
    }


    public async getBudgetPlannerTable(user_id: string, dto: GetBudgetTableDto) {
        try {
            const now = new Date();
            const targetMonth = dto.month ?? now.getMonth() + 1;
            const targetYear = dto.year ?? now.getFullYear();
            const periodKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
            const monthStart = new Date(targetYear, targetMonth - 1, 1);
            const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
            const page = dto.page ?? 1;
            const limit = dto.limit ?? 10;
            const skip = (page - 1) * limit;

            const budgetWhere: FindOptionsWhere<Budget> = {
                user_id,
                period_month: periodKey,
                ...(dto.category_id && { category_id: dto.category_id }),
            };

            const [budgets, totalBudgets] = await this.budgetsRepository.findAndCount({
                where: budgetWhere,
                relations: { category: true },
                skip,
                take: limit,
                order: { created_at: 'DESC' },
            });

            if (!budgets.length) {
                return {
                    period: periodKey,
                    data: [],
                    meta: { total: 0, page, limit, total_pages: 0 },
                };
            }

            const categoryIds = budgets.map(b => b.category_id);

            const transactions = await this.transactionsRepository.find({
                where: {
                    user_id,
                    type: TransactionType.EXPENSE,
                    category_id: In(categoryIds),
                    transaction_date: Between(monthStart, monthEnd),
                },
            });

            const spentMap = new Map<string, number>();
            for (const txn of transactions) {
                if (!txn.category_id) continue;
                spentMap.set(txn.category_id, (spentMap.get(txn.category_id) ?? 0) + Number(txn.amount));
            }

            const rows = budgets.map((budget) => {
                const limitAmount = Number(budget.limit_amount);
                const spent = Math.round((spentMap.get(budget.category_id) ?? 0) * 100) / 100;
                const remaining = Math.round((limitAmount - spent) * 100) / 100;
                const usedPercent = limitAmount > 0
                    ? Math.round((spent / limitAmount) * 1000) / 10
                    : spent > 0 ? 100 : 0;
                const isOverBudget = spent > limitAmount;

                return {
                    budget_id: budget.id,
                    category_id: budget.category_id,
                    category_name: budget.category?.name ?? 'Uncategorized',
                    limit_amount: limitAmount,
                    spent_amount: spent,
                    remaining_amount: remaining,
                    used_percent: usedPercent,
                    is_over_budget: isOverBudget,
                    notes: budget.notes ?? null,
                };
            });

            return {
                period: periodKey,
                data: rows,
                meta: {
                    total: totalBudgets,
                    page,
                    limit,
                    total_pages: Math.ceil(totalBudgets / limit),
                },
            };

        } catch (error) {
            throw new InternalServerErrorException('Failed to get budget planner table');
        }
    }

    public async getBudgetInsights(user_id: string, dto: GetBudgetInsightsDto) {
        try {
            const now = new Date();
            const trendMonths = Number(dto.trend_months ?? 6);

            const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const periods: { key: string; label: string; year: number; month: number }[] = [];

            for (let i = trendMonths - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const year = d.getFullYear();
                const month = d.getMonth();
                periods.push({
                    key: `${year}-${String(month + 1).padStart(2, '0')}`,
                    label: MONTH_LABELS[month],
                    year,
                    month,
                });
            }

            const periodKeys = periods.map(p => p.key);
            const trendStart = new Date(periods[0].year, periods[0].month, 1);
            const trendEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            const [budgets, transactions] = await Promise.all([
                this.budgetsRepository.find({
                    where: {
                        user_id,
                        period_month: In(periodKeys),
                    },
                    relations: { category: true },
                }),
                this.transactionsRepository.find({
                    where: {
                        user_id,
                        type: TransactionType.EXPENSE,
                        transaction_date: Between(trendStart, trendEnd),
                    },
                    relations: { category: true },
                }),
            ]);

            const budgetByPeriod = new Map<string, number>();
            for (const b of budgets) {
                budgetByPeriod.set(
                    b.period_month,
                    (budgetByPeriod.get(b.period_month) ?? 0) + Number(b.limit_amount),
                );
            }

            const spentByPeriod = new Map<string, number>();
            for (const txn of transactions) {
                const d = new Date(txn.transaction_date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                spentByPeriod.set(key, (spentByPeriod.get(key) ?? 0) + Number(txn.amount));
            }

            const budget_vs_spending = periods.map((p) => ({
                month: p.label,
                period: p.key,
                budget_amount: Math.round((budgetByPeriod.get(p.key) ?? 0) * 100) / 100,
                spent_amount: Math.round((spentByPeriod.get(p.key) ?? 0) * 100) / 100,
            }));

            const currentPeriodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const currentBudgets = budgets.filter(b => b.period_month === currentPeriodKey);
            const totalBudget = currentBudgets.reduce((s, b) => s + Number(b.limit_amount), 0);

            const category_allocation = currentBudgets
                .map((b) => ({
                    category_id: b.category_id,
                    category_name: b.category?.name ?? 'Uncategorized',
                    budget_amount: Number(b.limit_amount),
                    percentage: totalBudget > 0
                        ? Math.round((Number(b.limit_amount) / totalBudget) * 1000) / 10
                        : 0,
                }))
                .sort((a, b) => b.budget_amount - a.budget_amount);

            return {
                budget_vs_spending: {
                    title: 'Budget vs Spending Over Time',
                    subtitle: `Monthly trend (last ${trendMonths} months)`,
                    data: budget_vs_spending,
                },
                category_allocation: {
                    title: 'Category-wise Budget Allocation',
                    period: currentPeriodKey,
                    total_budget: Math.round(totalBudget * 100) / 100,
                    data: category_allocation,
                },
            };

        } catch (error) {
            throw new InternalServerErrorException('Failed to get budget insights');
        }
    }

    async getBudgets(user_id: string) {
        try {
            const budgets = await this.budgetsRepository.find({
                where: { user_id, period_month: new Date().toISOString().substring(0, 7) + '-01' },
                relations: ['category'],
                order: { period_month: 'DESC' },
            });
            return {
                message: 'Budgets retrieved successfully',
                budgets
            };
        } catch (error) {
            throw error;
        }
    }

    async getBudget(user_id: string, budget_id: string) {
        try {
            const budget = await this.budgetsRepository.findOne({ where: { id: budget_id, user_id } });
            if (!budget) {
                throw new BadRequestException('Budget not found.');
            }
            return {
                message: 'Budget retrieved successfully',
                budget
            };
        } catch (error) {
            throw error;
        }
    }

    async addBudget(user_id: string, addBudgetDto: AddBudgetDto) {
        try {
            const newBudget = await this.budgetsRepository.save({ ...addBudgetDto, user_id });
            return {
                message: 'Budget added successfully',
                budget: newBudget
            };
        } catch (error) {
            throw error;
        }
    }


    async updateBudget(user_id: string, updateBudgetDto: UpdateBudgetDto) {
        try {
            const budget = await this.budgetsRepository.findOneOrFail({ where: { id: updateBudgetDto?.budget_id, user_id } });
            if (!budget) {
                throw new BadRequestException('Budget not found.');
            }
            await this.budgetsRepository.update(budget?.id, { ...updateBudgetDto, user_id });
            return {
                message: 'Budget updated successfully',
                budget: {
                    ...budget,
                    ...updateBudgetDto
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteBudget(user_id: string, DeleteBudgetDto: DeleteBudgetDto) {
        try {
            const budget = await this.budgetsRepository.findOneOrFail({ where: { id: DeleteBudgetDto?.budget_id, user_id } });

            if (!budget) {
                throw new BadRequestException('Budget not found.');
            }

            await this.budgetsRepository.delete({ id: DeleteBudgetDto?.budget_id, user_id });
            return { message: 'Budget deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}
