import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { ActiveUser } from '@/auth/decorators/active-user.decorator';
import { AddBudgetDto } from './dtos/add-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';
import { DeleteBudgetDto } from './dtos/delete-budget.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth("access-token")
@Controller('budgets')
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) {}

    @Get('/')
    @HttpCode(HttpStatus.OK)
    async getBudgets(@ActiveUser('sub') user_id: string) {
        return await this.budgetsService.getBudgets(user_id);
    }

    @Get('/:budget_id')
    @HttpCode(HttpStatus.OK)
    async getBudget(@ActiveUser('sub') user_id: string, @Param('budget_id') budget_id: string) {
        return await this.budgetsService.getBudget(user_id, budget_id);
    }

    @Post('/add')
    @HttpCode(HttpStatus.CREATED)
    async addBudget(@ActiveUser('sub') user_id: string, @Body() addBudgetDto: AddBudgetDto) {
        return await this.budgetsService.addBudget(user_id, addBudgetDto);
    }

    @Put('/update')
    @HttpCode(HttpStatus.OK)
    async updateBudget(@ActiveUser('sub') user_id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
        return await this.budgetsService.updateBudget(user_id, updateBudgetDto);
    }

    @Post('/delete')
    @HttpCode(HttpStatus.OK)
    async deleteBudget(@ActiveUser('sub') user_id: string, @Body() deleteBudgetDto: DeleteBudgetDto) {
        return await this.budgetsService.deleteBudget(user_id, deleteBudgetDto);
    }
}
