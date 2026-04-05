import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'old password must contain letters and numbers',
  })
  @IsString({ message: 'old password should be string value' })
  @IsNotEmpty({ message: 'old password value should not be empty' })
  @MinLength(6, { message: 'old password should have min 6 characters' })
  @MaxLength(15, { message: 'old password should have max 15 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,15}$/, {
    message:
      'old password must include uppercase, lowercase, number and special character',
  })
  old_password: string;
  @ApiProperty({
    description: 'new password must contain letters and numbers',
  })
  @IsString({ message: 'new password should be string value' })
  @IsNotEmpty({ message: 'new password value should not be empty' })
  @MinLength(6, { message: 'new password should have min 6 characters' })
  @MaxLength(15, { message: 'new password should have max 15 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,15}$/, {
    message:
      'new password must include uppercase, lowercase, number and special character',
  })
  new_password: string;
}
