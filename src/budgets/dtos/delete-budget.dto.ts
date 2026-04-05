import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteBudgetDto {
  @ApiProperty({ description: 'Budget ID' })
  @IsNotEmpty({ message: 'Budget ID is required.' })
  @IsUUID()
  budget_id: string;
}
