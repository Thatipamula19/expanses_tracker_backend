import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsDto } from './dtos/get-analytics.dto';
import { ActiveUser } from '@/auth/decorators/active-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reports & Analytics — all three charts in one call' })
    async getAnalytics(
        @ActiveUser('sub') user_id: string,
        @Query() dto: GetAnalyticsDto,
    ) {
        return this.analyticsService.getAnalytics(user_id, dto);
    }
}