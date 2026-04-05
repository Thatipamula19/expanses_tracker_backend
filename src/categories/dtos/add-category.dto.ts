import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddCategoryDto {
  @ApiProperty({ description: 'Category Name' })
  @IsNotEmpty({ message: 'Category Name is required' })
  @IsString({ message: 'Category Name must be a string' })
  name: string;
}
