import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { ActiveUser } from '@/auth/decorators/active-user.decorator';
import { AddBudgetDto } from './dtos/add-budget.dto';
import { UpdateBudgetDto } from './dtos/update-budget.dto';
import { DeleteBudgetDto } from './dtos/delete-budget.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetBudgetPlannerDto, GetBudgetTableDto } from './dtos/get-budget-planner.dto';
import { GetBudgetInsightsDto } from './dtos/get-budget-insights.dto';

@ApiBearerAuth("access-token")
@Controller('budgets')
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) { }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all budgets for current month' })
    async getBudgets(@ActiveUser('sub') user_id: string) {
        return await this.budgetsService.getBudgets(user_id);
    }

    @Get('/:budget_id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get budget by ID' })
    async getBudget(@ActiveUser('sub') user_id: string, @Param('budget_id') budget_id: string) {
        return await this.budgetsService.getBudget(user_id, budget_id);
    }

    @Get('planner/summary')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Budget planner — top summary cards' })
    async getBudgetPlannerSummary(
        @ActiveUser('sub') user_id: string,
        @Query() dto: GetBudgetPlannerDto,
    ) {
        return this.budgetsService.getBudgetPlannerSummary(user_id, dto);
    }

    @Get('planner/table')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Budget planner — paginated category table' })
    async getBudgetPlannerTable(
        @ActiveUser('sub') user_id: string,
        @Query() dto: GetBudgetTableDto,
    ) {
        return this.budgetsService.getBudgetPlannerTable(user_id, dto);
    }

    @Get('insights')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Budget insights — trend line + category allocation pie' })
    async getBudgetInsights(
        @ActiveUser('sub') user_id: string,
        @Query() dto: GetBudgetInsightsDto,
    ) {
        return this.budgetsService.getBudgetInsights(user_id, dto);
    }

    @Post('/add')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add budget' })
    async addBudget(@ActiveUser('sub') user_id: string, @Body() addBudgetDto: AddBudgetDto) {
        return await this.budgetsService.addBudget(user_id, addBudgetDto);
    }

    @Put('/update')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update budget' })
    async updateBudget(@ActiveUser('sub') user_id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
        return await this.budgetsService.updateBudget(user_id, updateBudgetDto);
    }

    @Post('/delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete budget' })
    async deleteBudget(@ActiveUser('sub') user_id: string, @Body() deleteBudgetDto: DeleteBudgetDto) {
        return await this.budgetsService.deleteBudget(user_id, deleteBudgetDto);
    }
}
