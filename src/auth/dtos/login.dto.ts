import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail({}, { message: 'email should be valid' })
  @IsNotEmpty({ message: 'email value should not be empty' })
  @IsString({ message: 'email should be string value' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'password should be string value' })
  @IsNotEmpty({ message: 'password value should not be empty' })
  password: string;
}
