import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { ApiOperation } from '@nestjs/swagger';
import { ActiveUser } from '@/auth/decorators/active-user.decorator';
import { GetGoalsDashboardDto } from './dtos/get-goals-dashboard.dto';
import { AddContributionDto } from './dtos/add-goal-contribution.dto';
import { AddGoalDto } from './dtos/add-goal-dto';
import { UpdateGoalDto } from './dtos/update-goal-dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get('dashboard/cards')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Goal dashboard — top cards with progress bars' })
  async getGoalCards(
    @ActiveUser('sub') user_id: string,
    @Query() dto: GetGoalsDashboardDto,
  ) {
    return this.goalsService.getGoalCards(user_id, dto);
  }

  @Get('dashboard/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Goal dashboard — bar chart + pie chart' })
  async getGoalProgressOverview(
    @ActiveUser('sub') user_id: string,
    @Query() dto: GetGoalsDashboardDto,
  ) {
    return this.goalsService.getGoalProgressOverview(user_id, dto);
  }

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new goal' })
  async addGoal(
    @ActiveUser('sub') user_id: string,
    @Body() addGoalDto: AddGoalDto,
  ) {
    return this.goalsService.addGoal(user_id, addGoalDto);
  }

  @Put('update/:goal_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a goal' })
  async updateGoal(
    @ActiveUser('sub') user_id: string,
    @Param('goal_id') goal_id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.updateGoal(user_id, goal_id, updateGoalDto);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all goals' })
  async getAllGoals(@ActiveUser('sub') user_id: string) {
    return this.goalsService.getAllGoals(user_id);
  }

  @Get('get/:goal_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a goal' })
  async getGoal(
    @ActiveUser('sub') user_id: string,
    @Param('goal_id') goal_id: string,
  ) {
    return this.goalsService.getGoal(user_id, goal_id);
  }

  @Delete('remove/:goal_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a goal' })
  async removeGoal(
    @ActiveUser('sub') user_id: string,
    @Param('goal_id') goal_id: string,
  ) {
    return this.goalsService.removeGoal(user_id, goal_id);
  }

  @Post('contribution')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add contribution to a goal' })
  async addContribution(
    @ActiveUser('sub') user_id: string,
    @Body() addContributionDto: AddContributionDto,
  ) {
    return this.goalsService.addContribution(user_id, addContributionDto);
  }

  @Delete('/delete/:contribution_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete contribution from a goal' })
  async deleteContribution(
    @ActiveUser('sub') user_id: string,
    @Param('contribution_id') contribution_id: string,
  ) {
    return this.goalsService.removeContribution(user_id, contribution_id);
  }
}
