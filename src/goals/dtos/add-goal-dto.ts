import { GoalStatus } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @IsDate({ message: 'Start Date must be a valid date' })
  start_date: Date;

  @ApiProperty({ description: 'End Date' })
  @IsNotEmpty({ message: 'End Date is required' })
  @IsDate({ message: 'End Date must be a valid date' })
  end_date: Date;

  @ApiProperty({ description: 'Goal Status' })
  @IsNotEmpty({ message: 'Goal Status is required' })
  @IsEnum(GoalStatus, { message: 'Goal Status must be a valid goal status' })
  status: GoalStatus;
}
