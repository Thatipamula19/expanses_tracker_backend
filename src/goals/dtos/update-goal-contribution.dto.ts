import { ApiProperty } from "@nestjs/swagger";
import { AddContributionDto } from "./add-goal-contribution.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateContributionDto extends AddContributionDto {
  @ApiProperty({ description: 'Contribution ID' })
  @IsNotEmpty({ message: 'Contribution ID is required' })
  @IsString({ message: 'Contribution ID must be a string' })
  contribution_id: string;
}
