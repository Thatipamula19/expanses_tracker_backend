import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AddTransactionDto } from './dtos/add-transaction.dto';
import { ActiveUser } from '@/auth/decorators/active-user.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { GetTransactionsDto } from './dtos/get-transactions.dto';
import { GetOverviewDto } from './dtos/get-overview.dto';
import { GetCategoryWiseExpensesDto } from './dtos/get-category-expenses.dto';

@ApiBearerAuth("access-token")
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get('/get-statistics')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get statistics of transactions' })
    async getStatistics(@ActiveUser('sub') user_id: string) {
        return await this.transactionsService.getStatistics(user_id);
    }

    @Post('/get-filter-transactions')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get filtered transactions' })
    async getTransactions(@ActiveUser('sub') user_id: string, @Body() getTransactionsDto: GetTransactionsDto) {
        return await this.transactionsService.getTransactions(user_id, getTransactionsDto);
    }

    @Get('/get-overview')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get overview of transactions' })
    async getOverview(@ActiveUser('sub') user_id: string, @Query() getOverviewDto: GetOverviewDto) {
        return await this.transactionsService.getOverview(user_id, getOverviewDto);
    }

    @Get('category-wise-expenses')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get category wise expenses vs budget' })
    async getCategoryWiseExpenses(
        @ActiveUser('sub') user_id: string,
        @Query() dto: GetCategoryWiseExpensesDto,
    ) {
        return this.transactionsService.getCategoryWiseExpenses(user_id, dto);
    }

    @Get('/get-transaction/:transaction_id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get transaction by ID' })
    async getTransaction(@Param('transaction_id') transaction_id: string, @ActiveUser('sub') user_id: string) {
        return await this.transactionsService.getTransaction(transaction_id, user_id);
    }

    @Post('/add-transaction')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add transaction' })
    async addTransaction(@Body() transaction: AddTransactionDto, @ActiveUser('sub') user_id: string) {
        return await this.transactionsService.addTransaction(transaction, user_id);
    }

    @Put('/update-transaction')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update transaction' })
    async updateTransaction(@Body() transaction: UpdateTransactionDto, @ActiveUser('sub') user_id: string) {
        return await this.transactionsService.updateTransaction(transaction, user_id);
    }

    @Delete('/delete-transaction')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete transaction' })
    async deleteTransaction(@Body() transaction: UpdateTransactionDto, @ActiveUser('sub') user_id: string) {
        return await this.transactionsService.deleteTransaction(transaction, user_id);
    }
}
