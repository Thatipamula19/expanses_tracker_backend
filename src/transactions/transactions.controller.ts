import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AddTransactionDto } from './dtos/add-transaction.dto';
import { ActiveUser } from '@/auth/decorators/active-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

@ApiBearerAuth("access-token")
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }


    @Get()
    @HttpCode(HttpStatus.OK)
    async getTransactions(@ActiveUser('sub') user_id: string, @Query() pageQueryDto: PaginationQueryDto) {
        return await this.transactionsService.getTransactions(user_id, pageQueryDto);
    }

    @Post('/add-transaction')
    @HttpCode(HttpStatus.CREATED)
    async addTransaction(@Body() transaction: AddTransactionDto, @ActiveUser('sub') user_id: string) {
        return await this.transactionsService.addTransaction(transaction, user_id);
    }

    @Put('/update-transaction')
    @HttpCode(HttpStatus.OK)
    async updateTransaction(@Body() transaction: UpdateTransactionDto, @ActiveUser('sub') user_id: string) {
        return await this.transactionsService.updateTransaction(transaction, user_id);
    }

    @Delete('/delete-transaction')
    @HttpCode(HttpStatus.OK)
    async deleteTransaction(@Body() transaction: UpdateTransactionDto, @ActiveUser('sub') user_id: string) {
        return await this.transactionsService.deleteTransaction(transaction, user_id);
    }
}
