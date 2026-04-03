import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgetPasswordDto {
    @ApiProperty({ description: "user email" })
    @IsEmail({}, { message: "email should be valid" })
    @IsNotEmpty({ message: "email value should not be empty" })
    @IsString({ message: "email should be string value" })
    email: string;
}