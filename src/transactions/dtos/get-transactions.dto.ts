// get-transactions.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DateRangePeriod, SortOrder, TransactionType } from '@/common/enums';

export class GetTransactionsDto {
  @ApiProperty({ enum: DateRangePeriod, required: false })
  @IsOptional()
  @IsEnum(DateRangePeriod, {
    message:
      'period must be one of: today, this_week, this_month, last_month, last_3_months',
  })
  period?: DateRangePeriod;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray({ message: 'categories must be an array' })
  @IsString({ each: true, message: 'Each category must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  categories?: string[];

  @ApiProperty({ enum: TransactionType, required: false })
  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'transaction_type must be either income or expense',
  })
  transaction_type?: TransactionType;

  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'sort must be either asc or desc' })
  sort?: SortOrder = SortOrder.DESC;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString({ message: 'search must be a string' })
  search?: string;

  @ApiProperty({ type: Number, required: false, default: 10 })
  @IsOptional()
  @IsPositive()
  limit: number = 10;

  @ApiProperty({ type: Number, required: false, default: 1 })
  @IsOptional()
  @IsPositive()
  page: number = 1;
}
