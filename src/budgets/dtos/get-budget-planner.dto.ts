import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBudgetPlannerDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Period in YYYY-MM format (e.g. 2026-01). Defaults to current month.',
    default: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'period must be in YYYY-MM format (e.g. 2026-01)',
  })
  period?: string;
}

export class GetBudgetTableDto extends GetBudgetPlannerDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Filter by category_id. Omit for all categories.',
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({ type: Number, required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty({ type: Number, required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;
}