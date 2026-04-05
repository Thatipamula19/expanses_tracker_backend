import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddContributionDto {
  @ApiProperty({ description: 'Goal ID' })
  @IsNotEmpty({ message: 'Goal ID is required' })
  @IsString({ message: 'Goal ID must be a string' })
  goal_id: string;

  @ApiProperty({ description: 'Amount' })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Amount must be a number' },
  )
  amount: number;

  @ApiProperty({ description: 'Transaction ID' })
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @IsString({ message: 'Transaction ID must be a string' })
  @IsOptional({ message: 'Transaction ID is optional' })
  transaction_id?: string;
}
