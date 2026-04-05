import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { AddGoalDto } from "./add-goal-dto";

export class UpdateGoalDto extends AddGoalDto {
    @ApiProperty({ description: 'Goal ID' })
    @IsNotEmpty({ message: 'Goal ID is required' })
    @IsString({ message: 'Goal ID must be a string' })
    goal_id: string;
}