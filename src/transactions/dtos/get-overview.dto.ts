// get-overview.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OverviewPeriod } from '@/common/enums';

export class GetOverviewDto {
  @ApiProperty({
    enum: OverviewPeriod,
    required: false,
    default: OverviewPeriod.THIS_MONTH,
  })
  @IsOptional()
  @IsEnum(OverviewPeriod)
  trend_months?: OverviewPeriod = OverviewPeriod.THIS_MONTH;

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
