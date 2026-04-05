import { GoalStatus } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddGoalDto {
  @ApiProperty({ description: 'Goal Name' })
  @IsNotEmpty({ message: 'Goal Name is required' })
  @IsString({ message: 'Goal Name must be a string' })
  goal_name: string;

  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsString({ message: 'Category ID must be a string' })
  category_id: string;

  @ApiProperty({ description: 'Target Amount' })
  @IsNotEmpty({ message: 'Target Amount is required' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Target Amount must be a number' },
  )
  target_amount: number;

  @ApiProperty({ description: 'Start Date' })
  @IsNotEmpty({ message: 'Start Date is required' })
  @IsString({ message: 'Start Date must be a string' })
  start_date: string;

  @ApiProperty({ description: 'End Date' })
  @IsNotEmpty({ message: 'End Date is required' })
  @IsString({ message: 'End Date must be a string' })
  end_date: string;

  @ApiProperty({ description: 'Goal Status' })
  @IsNotEmpty({ message: 'Goal Status is required' })
  @IsString({ message: 'Goal Status must be a string' })
  goal_status: GoalStatus;
}
