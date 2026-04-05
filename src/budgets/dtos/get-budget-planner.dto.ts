import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBudgetPlannerDto {
  @ApiProperty({
    type: Number,
    required: false,
    description: 'Month (1-12). Defaults to current month.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Year e.g. 2026. Defaults to current year.',
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year?: number;
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
