import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { GoalStatus, GoalTimePeriod } from '@/common/enums';

export class GetGoalsDashboardDto {
  @ApiProperty({ enum: GoalStatus, required: false })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiProperty({
    enum: GoalTimePeriod,
    required: false,
    default: GoalTimePeriod.ALL_TIME,
  })
  @IsOptional()
  @IsEnum(GoalTimePeriod)
  time_period?: GoalTimePeriod = GoalTimePeriod.ALL_TIME;

  @ApiProperty({ type: Number, required: false, default: 10 })
  @IsOptional()
  @IsPositive()
  limit: number = 10;

  @ApiProperty({ type: Number, required: false, default: 1 })
  @IsOptional()
  @IsPositive()
  page: number = 1;
}
