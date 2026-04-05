import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum InsightsTrendMonths {
  THIS_MONTH = '1',
  THREE = '3',
  SIX = '6',
  TWELVE = '12',
}

export class GetBudgetInsightsDto {
  @ApiProperty({
    enum: InsightsTrendMonths,
    required: false,
    default: InsightsTrendMonths.SIX,
  })
  @IsOptional()
  @IsEnum(InsightsTrendMonths)
  trend_months?: InsightsTrendMonths = InsightsTrendMonths.SIX;
}
