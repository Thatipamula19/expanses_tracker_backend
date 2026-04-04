import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TimePeriod {
    THIS_MONTH = 'this_month',
    LAST_MONTH = 'last_month',
    LAST_3_MONTHS = 'last_3_months',
    LAST_6_MONTHS = 'last_6_months',
    LAST_12_MONTHS = 'last_12_months',
    THIS_YEAR = 'this_year',
}

export class GetAnalyticsDto {
    @ApiProperty({ enum: TimePeriod, required: false, default: TimePeriod.THIS_MONTH })
    @IsOptional()
    @IsEnum(TimePeriod)
    time_period?: TimePeriod = TimePeriod.THIS_MONTH;

    @ApiProperty({ type: String, required: false, description: 'Filter by category_id. Omit for all categories.' })
    @IsOptional()
    @IsString()
    category_id?: string;
}