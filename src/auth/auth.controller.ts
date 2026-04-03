import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@/users/dtos/create-user.dto';
import { AllowAnonymous } from './decorators/allow-anonaymous.decorator';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ForgetPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    @Post('login')
     async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto.email, loginDto.password);
    }

    @AllowAnonymous()
    @HttpCode(201)
    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.authService.createUser(createUserDto);
    }

    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return await this.authService.refreshToken(refreshTokenDto);
    }

    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
        return await this.authService.forgotPassword(forgetPasswordDto);
    }

    @AllowAnonymous()
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return await this.authService.resetPassword(resetPasswordDto);
    }
}
