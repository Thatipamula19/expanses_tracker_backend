import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    token:string;

    @ApiProperty({
        description: 'Password must contain letters and numbers',
    })
    @IsString({ message: "password should be string value" })
    @IsNotEmpty({ message: "password value should not be empty" })
    @MinLength(6, { message: "password should have min 6 characters" })
    @MaxLength(15, { message: "password should have max 15 characters" })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,15}$/,
        {
            message:
                "Password must include uppercase, lowercase, number and special character",
        },
    )
    password: string;
}