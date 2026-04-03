import { BadRequestException, Injectable } from '@nestjs/common';
import { Budget } from './entities/budget.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteBudgetDto } from './dtos/delete-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';
import { AddBudgetDto } from './dtos/add-budget.dto';

@Injectable()
export class BudgetsService {

    constructor( 
        @InjectRepository(Budget)
        private readonly budgetsRepository: Repository<Budget>,
    ) {}

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
            const newBudget = await this.budgetsRepository.save({...addBudgetDto, user_id});
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
            await this.budgetsRepository.update(budget?.id, {...updateBudgetDto, user_id});
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
