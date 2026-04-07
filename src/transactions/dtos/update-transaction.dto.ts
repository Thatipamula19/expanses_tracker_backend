import { TransactionType } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class UpdateTransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @IsString({ message: 'Transaction ID must be a string' })
  id: string;

  @ApiProperty({ description: 'Title' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ description: 'Description' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsString({ message: 'Category ID must be a string' })
  category_id: string;

  @ApiProperty({ description: 'Amount' })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Amount must be a number' },
  )
  amount: number;

  @ApiProperty({ description: 'Type' })
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(TransactionType, { message: 'Type must be a valid transaction type' })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction Date' })
  @IsNotEmpty({ message: 'Transaction Date is required' })
  @IsDate({ message: 'Transaction Date must be a valid date' })
  transaction_date: Date;
}
