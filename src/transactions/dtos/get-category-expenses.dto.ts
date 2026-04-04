import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCategoryWiseExpensesDto {
    @ApiProperty({ type: Number, required: false, description: 'Month (1-12). Defaults to current month.' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    month?: number;

    @ApiProperty({ type: Number, required: false, description: 'Year e.g. 2026. Defaults to current year.' })
    @IsOptional()
    @IsInt()
    @Min(2000)
    @Type(() => Number)
    year?: number;
}