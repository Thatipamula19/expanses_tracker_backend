import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
export class UpdateUserProfileDto {
    @ApiProperty()
    @IsString({ message: 'user name should be string value' })
    @IsNotEmpty({ message: 'user name value should not be empty' })
    @MinLength(3, { message: 'user name should have min 3 characters' })
    @MaxLength(50, { message: 'user name should have max 50 characters' })
    user_name: string;

    @ApiProperty()
    @IsString({ message: 'email should be string value' })
    @IsEmail({}, { message: 'email should be valid' })
    @IsNotEmpty({ message: 'email value should not be empty' })
    @MaxLength(100, { message: 'email should have max 100 characters' })
    email: string;
}