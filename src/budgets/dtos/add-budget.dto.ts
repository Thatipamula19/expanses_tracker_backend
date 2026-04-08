import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AddBudgetDto {
  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty({ message: 'Category ID is required.' })
  @IsUUID()
  category_id: string;

  @ApiProperty({ description: 'Limit amount' })
  @IsNotEmpty({ message: 'Limit amount is required.' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Limit amount must be a number.' },
  )
  limit_amount: number;

  @ApiProperty({ description: 'Period month' })
  @IsNotEmpty({ message: 'Period month is required.' })
  @IsDate({ message: 'Period month must be a date.' })
  period_month: Date;

  @ApiProperty({ description: 'Notes' })
  @IsString({ message: 'Notes must be a string.' })
  @IsOptional({ message: 'Notes is optional.' })
  notes: string;
}
