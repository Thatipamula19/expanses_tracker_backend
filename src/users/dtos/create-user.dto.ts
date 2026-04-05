import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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

  @ApiProperty({
    description: 'Password must contain letters and numbers',
  })
  @IsString({ message: 'password should be string value' })
  @IsNotEmpty({ message: 'password value should not be empty' })
  @MinLength(6, { message: 'password should have min 6 characters' })
  @MaxLength(15, { message: 'password should have max 15 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,15}$/, {
    message:
      'Password must include uppercase, lowercase, number and special character',
  })
  password: string;
}
