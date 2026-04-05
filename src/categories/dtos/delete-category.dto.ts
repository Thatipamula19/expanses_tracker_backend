import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsString({ message: 'Category ID must be a string' })
  id: string;
}
