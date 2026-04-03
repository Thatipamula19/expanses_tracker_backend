import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateCategoryDto {

    @ApiProperty({ description: 'Category ID' })
    @IsNotEmpty({ message: 'Category ID is required' })
    @IsString({ message: 'Category ID must be a string' })
    id: string;

    @ApiProperty({ description: 'Category Name' })
    @IsNotEmpty({ message: 'Category Name is required' })
    @IsString({ message: 'Category Name must be a string' })
    name: string;
}
