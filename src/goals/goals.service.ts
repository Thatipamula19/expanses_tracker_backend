import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GetGoalsDashboardDto } from './dtos/get-goals-dashboard.dto';
import { GoalStatus, GoalTimePeriod } from '@/common/enums';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { AddContributionDto } from './dtos/add-goal-contribution.dto';
import { Goal } from './entities/goal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GoalContribution } from './entities/goal-contribution.entity';
import { AddGoalDto } from './dtos/add-goal-dto';
import { UpdateGoalDto } from './dtos/update-goal-dto';

@Injectable()
export class GoalsService {

    constructor(
        @InjectRepository(Goal)
        private readonly goalRepository: Repository<Goal>,
        @InjectRepository(GoalContribution)
        private readonly contributionRepository: Repository<GoalContribution>,
    ) { }

public async getGoalCards(user_id: string, dto: GetGoalsDashboardDto) {
    try {
        const where: FindOptionsWhere<Goal> = { user_id };

        if (dto.status) {
            where.status = dto.status;
        }

        if (dto.time_period && dto.time_period !== GoalTimePeriod.ALL_TIME) {
            const { start, end } = this.resolveGoalTimePeriod(dto.time_period);
            if (start && end) {
                where.start_date = Between(start, end);
            }
        }

        const goals = await this.goalRepository.find({
            where,
            relations: { category: true },
            order:     { created_at: 'DESC' },
        });

        const cards = goals.map((goal) => {
            const targetAmount    = Number(goal.target_amount);
            const savedAmount     = Number(goal.saved_amount);
            const remainingAmount = Math.max(targetAmount - savedAmount, 0);
            const progressPercent = targetAmount > 0
                ? Math.min(Math.round((savedAmount / targetAmount) * 100), 100)
                : 0;

            return {
                goal_id:           goal.id,
                name:              goal.name,
                status:            goal.status,
                category_name:     goal.category?.name ?? null,
                target_amount:     targetAmount,
                saved_amount:      savedAmount,
                remaining_amount:  remainingAmount,
                progress_percent:  progressPercent,
                start_date:        goal.start_date,
                end_date:          goal.end_date,
            };
        });

        return {
            total_goals:     goals.length,
            completed_count: goals.filter(g => g.status === GoalStatus.COMPLETED).length,
            ongoing_count:   goals.filter(g => g.status === GoalStatus.ONGOING).length,
            cards,
        };

    } catch (error) {
        throw new InternalServerErrorException('Failed to get goal cards');
    }
}

public async getGoalProgressOverview(user_id: string, dto: GetGoalsDashboardDto) {
    try {
        const where: FindOptionsWhere<Goal> = { user_id };

        if (dto.status) {
            where.status = dto.status;
        }

        if (dto.time_period && dto.time_period !== GoalTimePeriod.ALL_TIME) {
            const { start, end } = this.resolveGoalTimePeriod(dto.time_period);
            if (start && end) {
                where.start_date = Between(start, end);
            }
        }

        const goals = await this.goalRepository.find({
            where,
            relations: { category: true },
            order:     { target_amount: 'DESC' },
        });

        const goal_progress = goals.map((goal) => {
            const targetAmount    = Number(goal.target_amount);
            const savedAmount     = Number(goal.saved_amount);
            const remainingAmount = Math.max(targetAmount - savedAmount, 0);

            return {
                goal_id:          goal.id,
                name:             goal.name,
                status:           goal.status,
                target_amount:    targetAmount,
                saved_amount:     savedAmount,
                remaining_amount: remainingAmount,
                progress_percent: targetAmount > 0
                    ? Math.min(Math.round((savedAmount / targetAmount) * 100), 100)
                    : 0,
            };
        });

        const completedCount = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
        const ongoingCount   = goals.filter(g => g.status === GoalStatus.ONGOING).length;
        const totalGoals     = goals.length;

        const completed_vs_ongoing = [
            {
                label:      'Completed',
                count:      completedCount,
                percentage: totalGoals > 0
                    ? Math.round((completedCount / totalGoals) * 1000) / 10
                    : 0,
            },
            {
                label:      'Ongoing',
                count:      ongoingCount,
                percentage: totalGoals > 0
                    ? Math.round((ongoingCount / totalGoals) * 1000) / 10
                    : 0,
            },
        ];

        const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
        const totalSaved  = goals.reduce((s, g) => s + Number(g.saved_amount),  0);

        return {
            summary: {
                total_goals:      totalGoals,
                completed_count:  completedCount,
                ongoing_count:    ongoingCount,
                total_target:     Math.round(totalTarget * 100) / 100,
                total_saved:      Math.round(totalSaved  * 100) / 100,
                total_remaining:  Math.round((totalTarget - totalSaved) * 100) / 100,
                overall_progress: totalTarget > 0
                    ? Math.round((totalSaved / totalTarget) * 100)
                    : 0,
            },
            goal_progress: {
                title: 'Goal Progress',
                data:  goal_progress,
            },
            completed_vs_ongoing: {
                title: 'Completed vs Ongoing Goals',
                data:  completed_vs_ongoing,
            },
        };

    } catch (error) {
        throw new InternalServerErrorException('Failed to get goal progress overview');
    }
}

public async addContribution(user_id: string, addContributionDto: AddContributionDto) {
    const goal = await this.goalRepository.findOne({ where: { id: addContributionDto.goal_id, user_id } });
    if (!goal) throw new NotFoundException('Goal not found');

    const contribution = this.contributionRepository.create(addContributionDto);
    await this.contributionRepository.save(contribution);

    goal.saved_amount = Number(goal.saved_amount) + Number(addContributionDto.amount);

    if (Number(goal.saved_amount) >= Number(goal.target_amount)) {
        goal.status = GoalStatus.COMPLETED;
    }

    await this.goalRepository.save(goal);
    return contribution;
}

public async removeContribution(user_id: string, contribution_id: string) {
    const contribution = await this.contributionRepository.findOne({
        where:     { id: contribution_id },
        relations: { goal: true },
    });
    if (!contribution) throw new NotFoundException('Contribution not found');
    if (contribution.goal.user_id !== user_id) throw new ForbiddenException('Not authorized to delete this contribution');

    const goal = contribution.goal;
    goal.saved_amount = Math.max(Number(goal.saved_amount) - Number(contribution.amount), 0);

    if (goal.status === GoalStatus.COMPLETED && Number(goal.saved_amount) < Number(goal.target_amount)) {
        goal.status = GoalStatus.ONGOING;
    }

    await this.goalRepository.save(goal);
    await this.contributionRepository.remove(contribution);
}

public async getAllGoals(user_id: string) {
    try {
        const goals = await this.goalRepository.find({ where: { user_id } });
        return {
            message: 'Goals retrieved successfully',
            goals,
        };
    } catch (error) {
        throw new InternalServerErrorException('Failed to get goals');
    }
}

public async addGoal(user_id: string, addGoalDto: AddGoalDto) {
     try {
         const goal = this.goalRepository.create({...addGoalDto, user_id});
        const savedGoal = await this.goalRepository.save(goal);
         return {
            message: 'Goal added successfully',
            goal: savedGoal,
         };
     } catch (error) {
         throw new InternalServerErrorException('Failed to add goal');
     }
}

public async updateGoal(user_id: string, goal_id: string, updateGoalDto: UpdateGoalDto) {
    try {
        const goal = await this.goalRepository.findOne({ where: { id: goal_id, user_id } });
        if (!goal) throw new NotFoundException('Goal not found');
        if (goal.user_id !== user_id) throw new ForbiddenException('Not authorized to update this goal');

        const updatedGoal = this.goalRepository.merge(goal, updateGoalDto);
        const savedGoal = await this.goalRepository.save(updatedGoal);
        return {
            message: 'Goal updated successfully',
            goal: savedGoal,
        };
    } catch (error) {
        throw new InternalServerErrorException('Failed to update goal');
    }
}

public async getGoal(user_id: string, goal_id: string) {
    try {
        const goal = await this.goalRepository.findOne({ where: { id: goal_id, user_id } });
        if (!goal) throw new NotFoundException('Goal not found');
        return {
            message: 'Goal retrieved successfully',
            goal,
        };
    } catch (error) {
        throw new InternalServerErrorException('Failed to get goal');
    }
}

public async removeGoal(user_id: string, goal_id: string) {
    try {
        const goal = await this.goalRepository.findOne({ where: { id: goal_id, user_id } });
        if (!goal) throw new NotFoundException('Goal not found');
        if (goal.user_id !== user_id) throw new ForbiddenException('Not authorized to delete this goal');

        await this.goalRepository.remove(goal);
        return {
            message: 'Goal deleted successfully',
        };
    } catch (error) {
        throw new InternalServerErrorException('Failed to delete goal');
    }
}


private resolveGoalTimePeriod(period: GoalTimePeriod): { start: Date | null; end: Date | null } {
    const now = new Date();
    const y   = now.getFullYear();
    const m   = now.getMonth();

    switch (period) {
        case GoalTimePeriod.THIS_MONTH:
            return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0, 23, 59, 59, 999) };
        case GoalTimePeriod.LAST_3_MONTHS:
            return { start: new Date(y, m - 2, 1), end: new Date(y, m + 1, 0, 23, 59, 59, 999) };
        case GoalTimePeriod.LAST_6_MONTHS:
            return { start: new Date(y, m - 5, 1), end: new Date(y, m + 1, 0, 23, 59, 59, 999) };
        case GoalTimePeriod.THIS_YEAR:
            return { start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59, 999) };
        case GoalTimePeriod.ALL_TIME:
        default:
            return { start: null, end: null };
    }
}
}
