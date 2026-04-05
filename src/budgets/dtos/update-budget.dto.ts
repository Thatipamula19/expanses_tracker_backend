import { ApiProperty } from '@nestjs/swagger';
import { AddBudgetDto } from './add-budget.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateBudgetDto extends AddBudgetDto {
  @ApiProperty({ description: 'Budget ID' })
  @IsNotEmpty({ message: 'Budget ID is required.' })
  @IsUUID()
  budget_id: string;
}
